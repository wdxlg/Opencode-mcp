// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/getTerminalOutputTool.ts
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ToolDataSource } from "./module-0991.mjs";
import { Disposable } from "./module-0012.mjs";
import { RunInTerminalTool } from "./module-3152.mjs";
import { StringSHA1 } from "./module-0039.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITerminalService } from "./module-1150.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/getTerminalOutputTool.ts
var GetTerminalOutputToolData = {
  id: "get_terminal_output" /* GetTerminalOutput */,
  toolReferenceName: "getTerminalOutput",
  legacyToolReferenceFullNames: ["runCommands/getTerminalOutput"],
  displayName: localize(20477, null),
  modelDescription: `Get output from a terminal execution that was moved to background (identified by the \`id\` returned from ${"run_in_terminal" /* RunInTerminal */}). Use this ONLY when the ${"run_in_terminal" /* RunInTerminal */} result explicitly says the command was moved to background, timed out, or needs input. Do NOT call this after a sync command that completed normally \u2014 sync commands return full output inline. If a background command has not yet completed, you will be automatically notified when it finishes \u2014 do NOT poll; end your turn and wait.`,
  icon: Codicon.terminal,
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: `The ID of an active terminal execution to check (returned by ${"run_in_terminal" /* RunInTerminal */} for async executions, or for sync executions that timed out and were moved to the background). This must be the exact opaque UUID returned by that tool; terminal names, labels, or integers are invalid.`,
        pattern: "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$"
      }
    },
    required: ["id"]
  }
};

var GetTerminalOutputTool = class extends Disposable {
  constructor(_configurationService, terminalService) {
    super();
    this._configurationService = _configurationService;
    this._lastOutputSnapshotByExecutionId = /* @__PURE__ */ new Map();
    this._register(terminalService.onDidDisposeInstance((instance2) => this._forgetTerminalInstance(instance2.instanceId)));
  }
  static {
    this._maxOutputSnapshots = 100;
  }
  static {
    this._tailCharBudget = 8e3;
  }
  async prepareToolInvocation(context2, token) {
    return {
      invocationMessage: localize(20476, null),
      pastTenseMessage: localize(20475, null)
    };
  }
  async invoke(invocation, _countTokens, _progress, token) {
    const args2 = invocation.parameters;
    if (!args2.id) {
      return {
        content: [{
          kind: "text",
          value: `Error: 'id' (the persistent terminal UUID returned by ${"run_in_terminal" /* RunInTerminal */} in async mode) must be provided.`
        }]
      };
    }
    const execution = RunInTerminalTool.getExecution(args2.id);
    if (!execution) {
      this._lastOutputSnapshotByExecutionId.delete(args2.id);
      return {
        content: [{
          kind: "text",
          value: `Error: No active terminal execution found with ID ${args2.id}. The ID must be the exact value returned by ${"run_in_terminal" /* RunInTerminal */} in async mode.`
        }]
      };
    }
    return {
      content: [{
        kind: "text",
        value: this._formatOutput(args2.id, execution.instance.instanceId, execution.getOutput())
      }]
    };
  }
  _formatOutput(id2, terminalInstanceId, output) {
    if (!this._configurationService.getValue("chat.tools.terminal.outputDeltas" /* OutputDeltas */)) {
      this._lastOutputSnapshotByExecutionId.clear();
      return this._formatTailOrFull(output, `Output of terminal ${id2}`);
    }
    const previousOutputSnapshot = this._lastOutputSnapshotByExecutionId.get(id2);
    const currentOutputSnapshot = this._createOutputSnapshot(terminalInstanceId, output);
    this._rememberOutput(id2, currentOutputSnapshot);
    if (previousOutputSnapshot === void 0) {
      return this._formatTailOrFull(output, `Output of terminal ${id2}`);
    }
    if (currentOutputSnapshot.length === previousOutputSnapshot.length && currentOutputSnapshot.hash === previousOutputSnapshot.hash) {
      return `Output of terminal ${id2} unchanged since previous poll (${output.length} total characters in buffer). No new output.`;
    }
    if (output.length > previousOutputSnapshot.length && this._hashOutput(output, previousOutputSnapshot.length) === previousOutputSnapshot.hash) {
      const delta2 = output.slice(previousOutputSnapshot.length);
      return `Output of terminal ${id2} since previous poll (${delta2.length} new characters, ${output.length} total characters):
${delta2}`;
    }
    return this._formatTailOrFull(output, `Output of terminal ${id2} changed since previous poll`);
  }
  _formatTailOrFull(output, prefix) {
    if (output.length <= GetTerminalOutputTool._tailCharBudget) {
      return `${prefix}:
${output}`;
    }
    const tail2 = this._tailOf(output, GetTerminalOutputTool._tailCharBudget);
    const omitted = output.length - tail2.length;
    return `${prefix}; showing last ${tail2.length} of ${output.length} characters (${omitted} earlier characters omitted). If you need the omitted earlier output, re-run the command and redirect output to a file, then read that file:
${tail2}`;
  }
  _tailOf(output, charBudget) {
    if (output.length <= charBudget) {
      return output;
    }
    const startIndex = output.length - charBudget;
    const newlineIndex = output.indexOf("\n", startIndex);
    if (newlineIndex !== -1 && newlineIndex < output.length - 1) {
      return output.slice(newlineIndex + 1);
    }
    return output.slice(startIndex);
  }
  _rememberOutput(id2, snapshot) {
    if (!this._lastOutputSnapshotByExecutionId.has(id2) && this._lastOutputSnapshotByExecutionId.size >= GetTerminalOutputTool._maxOutputSnapshots) {
      const oldestId = this._lastOutputSnapshotByExecutionId.keys().next().value;
      if (oldestId !== void 0) {
        this._lastOutputSnapshotByExecutionId.delete(oldestId);
      }
    }
    this._lastOutputSnapshotByExecutionId.set(id2, snapshot);
  }
  _createOutputSnapshot(terminalInstanceId, output) {
    return {
      terminalInstanceId,
      length: output.length,
      hash: this._hashOutput(output)
    };
  }
  _forgetTerminalInstance(terminalInstanceId) {
    for (const [id2, snapshot] of this._lastOutputSnapshotByExecutionId) {
      if (snapshot.terminalInstanceId === terminalInstanceId) {
        this._lastOutputSnapshotByExecutionId.delete(id2);
      }
    }
  }
  _hashOutput(output, length = output.length) {
    const sha = new StringSHA1();
    sha.update(length === output.length ? output : output.slice(0, length));
    return sha.digest();
  }
  dispose() {
    this._lastOutputSnapshotByExecutionId.clear();
    super.dispose();
  }
};

GetTerminalOutputTool = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, ITerminalService)
], GetTerminalOutputTool);
export { GetTerminalOutputToolData, GetTerminalOutputTool };
