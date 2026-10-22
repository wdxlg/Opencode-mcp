// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/copilot/copilotNonPtyShellTerminals.ts
import { AgentSession } from "./module-0048.mjs";
import { Disposable, toDisposable } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostTerminalManager } from "./module-0191.mjs";


// src/vs/platform/agentHost/node/copilot/copilotNonPtyShellTerminals.ts
function buildNonPtyShellTerminalUri(session, toolCallId) {
  return `agenthost-terminal://shell/${encodeURIComponent(AgentSession.id(session))}/${encodeURIComponent(toolCallId)}`;
}

function parseCompletedShell(text) {
  const match2 = text && /<shellId: ([^>\r\n]+) completed with exit code (-?\d+)>\s*$/.exec(text);
  if (!match2) {
    return void 0;
  }
  return {
    exitCode: Number(match2[2]),
    preview: text.slice(0, match2.index)
  };
}

var partialOutputTruncationMarker = /<output too long - dropped \d+ (?:characters|lines) from the end>\n?$/;

function getTruncatedOutputPrefix(output) {
  const match2 = partialOutputTruncationMarker.exec(output);
  return match2 ? output.slice(0, match2.index) : void 0;
}

function findStitchOverlap(previous, next) {
  const probe = next.slice(0, 8 /* MinimumOverlapLength */);
  if (probe.length < 8 /* MinimumOverlapLength */) {
    return void 0;
  }
  let index = previous.indexOf(probe);
  while (index !== -1) {
    const overlapLength = previous.length - index;
    if (overlapLength <= next.length && next.startsWith(previous.slice(index))) {
      return overlapLength;
    }
    index = previous.indexOf(probe, index + 1);
  }
  return void 0;
}

var NonPtyShellTerminalStreams = class extends Disposable {
  constructor(_sessionUri, _chatUri, _terminalManager) {
    super();
    this._sessionUri = _sessionUri;
    this._chatUri = _chatUri;
    this._terminalManager = _terminalManager;
    this._streams = /* @__PURE__ */ new Map();
    this._register(toDisposable(() => {
      for (const stream of this._streams.values()) {
        if (stream.created) {
          this._terminalManager.disposeTerminal(stream.uri);
        }
      }
      this._streams.clear();
    }));
  }
  /**
   * Appends the unseen suffix of `cumulativeOutput` to the tool call's
   * output terminal, creating the channel on first call. Returns the channel
   * URI and whether this call created it (so the caller can attach the
   * terminal content block exactly once).
   */
  track(toolCallId, title) {
    if (!this._streams.has(toolCallId)) {
      this._streams.set(toolCallId, {
        uri: buildNonPtyShellTerminalUri(this._sessionUri, toolCallId),
        title,
        lastSnapshot: "",
        sourceTruncated: false,
        finalized: false,
        created: false
      });
    }
  }
  append(toolCallId, cumulativeOutput) {
    const stream = this._streams.get(toolCallId);
    if (!stream) {
      return void 0;
    }
    const created = !stream.created;
    if (created) {
      this._createTerminal(toolCallId, stream);
    }
    if (stream.finalized || cumulativeOutput === stream.lastSnapshot) {
      return { uri: stream.uri, created };
    }
    const truncatedPrefix = getTruncatedOutputPrefix(cumulativeOutput);
    if (truncatedPrefix !== void 0) {
      if (!stream.sourceTruncated) {
        if (cumulativeOutput.startsWith(stream.lastSnapshot)) {
          this._terminalManager.appendOutputTerminalData(stream.uri, cumulativeOutput.slice(stream.lastSnapshot.length));
        } else {
          const overlap = findStitchOverlap(stream.lastSnapshot, cumulativeOutput);
          this._terminalManager.appendOutputTerminalData(stream.uri, overlap === void 0 ? cumulativeOutput.slice(truncatedPrefix.length) : cumulativeOutput.slice(overlap));
        }
        stream.sourceTruncated = true;
      }
    } else if (cumulativeOutput.startsWith(stream.lastSnapshot)) {
      this._terminalManager.appendOutputTerminalData(stream.uri, cumulativeOutput.slice(stream.lastSnapshot.length));
    } else {
      const previousSnapshot = getTruncatedOutputPrefix(stream.lastSnapshot) ?? stream.lastSnapshot;
      const overlap = findStitchOverlap(previousSnapshot, cumulativeOutput);
      if (overlap !== void 0) {
        const unseen = cumulativeOutput.slice(overlap);
        if (unseen) {
          this._terminalManager.appendOutputTerminalData(stream.uri, unseen);
        }
      } else if (stream.sourceTruncated || cumulativeOutput.length < stream.lastSnapshot.length) {
        this._terminalManager.appendOutputTerminalData(stream.uri, cumulativeOutput);
        stream.sourceTruncated = true;
      } else {
        this._terminalManager.resetOutputTerminal(stream.uri);
        this._terminalManager.appendOutputTerminalData(stream.uri, cumulativeOutput);
      }
    }
    stream.lastSnapshot = cumulativeOutput;
    return { uri: stream.uri, created };
  }
  /**
   * Records the process lifecycle information carried by tool completion.
   * A structured shell exit settles the channel.
   */
  completeToolCall(toolCallId, toolOutput, shellExit) {
    const stream = this._streams.get(toolCallId);
    if (!stream) {
      return void 0;
    }
    const result = shellExit?.result ?? parseCompletedShell(toolOutput);
    if (!result) {
      if (!stream.created) {
        this._streams.delete(toolCallId);
        return void 0;
      }
      return { uri: stream.uri, shouldRetire: false };
    }
    const created = !stream.created;
    if (created) {
      this._createTerminal(toolCallId, stream);
    }
    if (!stream.finalized && result.preview !== void 0) {
      if (created) {
        this.append(toolCallId, result.preview);
      } else if (!result.truncated) {
        if (stream.sourceTruncated || !result.preview.startsWith(stream.lastSnapshot)) {
          this._replaceOutput(stream, result.preview);
        } else {
          this.append(toolCallId, result.preview);
        }
      }
    }
    this._finalize(stream, result.exitCode);
    return {
      uri: stream.uri,
      result,
      shouldRetire: stream.finalized && result.preview !== void 0
    };
  }
  /**
   * Releases the live output resource after its static completion has been
   * published. Repeated calls are safe and do not dispose the resource twice.
   */
  retire(toolCallId) {
    const stream = this._streams.get(toolCallId);
    if (!stream) {
      return;
    }
    this._streams.delete(toolCallId);
    if (stream.created) {
      this._terminalManager.disposeTerminal(stream.uri);
    }
  }
  _finalize(stream, exitCode) {
    if (stream.finalized) {
      return;
    }
    stream.finalized = true;
    this._terminalManager.finalizeOutputTerminal(stream.uri, exitCode);
  }
  _replaceOutput(stream, output) {
    this._terminalManager.resetOutputTerminal(stream.uri);
    if (output) {
      this._terminalManager.appendOutputTerminalData(stream.uri, output);
    }
    stream.lastSnapshot = output;
    stream.sourceTruncated = false;
  }
  _createTerminal(toolCallId, stream) {
    const claim = {
      kind: "session" /* Session */,
      session: this._sessionUri.toString(),
      chat: this._chatUri.toString(),
      toolCallId
    };
    this._terminalManager.createOutputTerminal(stream.uri, { title: stream.title, claim });
    stream.created = true;
  }
};

NonPtyShellTerminalStreams = __decorateClass([
  __decorateParam(2, IAgentHostTerminalManager)
], NonPtyShellTerminalStreams);
export { buildNonPtyShellTerminalUri, parseCompletedShell, getTruncatedOutputPrefix, findStitchOverlap, partialOutputTruncationMarker, NonPtyShellTerminalStreams };
