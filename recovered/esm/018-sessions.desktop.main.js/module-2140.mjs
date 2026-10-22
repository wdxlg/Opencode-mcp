// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatContext.ts
import { IChatSessionsService, isAgentHostTarget } from "./module-0961.mjs";
import { getChatSessionType } from "./module-0962.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { ChatInstructionsPickerPick } from "./module-2139.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { CHAT_CONTEXT_TERMINAL_ID, IChatContextPickService } from "./module-1452.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ToolDataSource, isToolSet } from "./module-0991.mjs";
import { toToolSetVariableEntry, toToolVariableEntry } from "./module-0980.mjs";
import { FileEditorInput } from "./module-2000.mjs";
import { DiffEditorInput } from "./module-1102.mjs";
import { UntitledTextEditorInput } from "./module-1541.mjs";
import { NotebookEditorInput } from "./module-0940.mjs";
import { EditorResourceAccessor } from "./module-0926.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ILabelService } from "./module-0641.mjs";
import { imageToHash, isImage } from "./module-2085.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { ITerminalService } from "./module-1150.mjs";
import { isElectron } from "./module-0014.mjs";
import { convertBufferToScreenshotVariable } from "./module-1474.mjs";
import { IHostService } from "./module-1118.mjs";
import { AgentSessionProviders, getAgentSessionProviderIcon } from "./module-0983.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { buildHostLocalEventsPath } from "./module-1110.mjs";
import { agentHostAuthority } from "./module-1001.mjs";
import { IPathService } from "./module-0939.mjs";
import { IRemoteAgentHostService } from "./module-1736.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatContext.ts
function shouldShowOpenEditorsContext(widget, hasEligibleOpenEditors) {
  if (!hasEligibleOpenEditors) {
    return false;
  }
  const sessionResource = widget.viewModel?.sessionResource;
  if (sessionResource && isAgentHostTarget(getChatSessionType(sessionResource))) {
    return false;
  }
  if (widget.lockedAgentId && isAgentHostTarget(widget.lockedAgentId)) {
    return false;
  }
  return true;
}

var ChatContextContributions = class extends Disposable {
  static {
    this.ID = "chat.contextContributions";
  }
  constructor(instantiationService, contextPickService) {
    super();
    this._store.add(contextPickService.registerChatContextItem(instantiationService.createInstance(ToolsContextPickerPick)));
    this._store.add(contextPickService.registerChatContextItem(instantiationService.createInstance(ChatInstructionsPickerPick)));
    this._store.add(contextPickService.registerChatContextItem(instantiationService.createInstance(OpenEditorContextValuePick)));
    this._store.add(contextPickService.registerChatContextItem(instantiationService.createInstance(ClipboardImageContextValuePick)));
    this._store.add(contextPickService.registerChatContextItem(instantiationService.createInstance(ScreenshotContextValuePick)));
    this._store.add(contextPickService.registerChatContextItem(instantiationService.createInstance(SessionReferenceContextPickerPick)));
  }
};

ChatContextContributions = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IChatContextPickService)
], ChatContextContributions);

var ToolsContextPickerPick = class {
  constructor() {
    this.type = "pickerPick";
    this.label = localize(8601, null);
    this.icon = Codicon.tools;
    this.ordinal = -500;
  }
  isEnabled(widget) {
    return !!widget.attachmentCapabilities.supportsToolAttachments;
  }
  asPicker(widget) {
    const items = [];
    for (const [entry, enabled] of widget.input.selectedToolsModel.entriesMap.get()) {
      if (enabled) {
        if (isToolSet(entry)) {
          items.push({
            toolInfo: ToolDataSource.classify(entry.source),
            label: entry.referenceName,
            description: entry.description,
            asAttachment: () => toToolSetVariableEntry(entry)
          });
        } else {
          items.push({
            toolInfo: ToolDataSource.classify(entry.source),
            label: entry.toolReferenceName ?? entry.displayName,
            description: entry.userDescription ?? entry.modelDescription,
            asAttachment: () => toToolVariableEntry(entry)
          });
        }
      }
    }
    items.sort((a, b) => {
      let res = a.toolInfo.ordinal - b.toolInfo.ordinal;
      if (res === 0) {
        res = a.toolInfo.label.localeCompare(b.toolInfo.label);
      }
      if (res === 0) {
        res = a.label.localeCompare(b.label);
      }
      return res;
    });
    let lastGroupLabel;
    const picks = [];
    for (const item of items) {
      if (lastGroupLabel !== item.toolInfo.label) {
        picks.push({ type: "separator", label: item.toolInfo.label });
        lastGroupLabel = item.toolInfo.label;
      }
      picks.push(item);
    }
    return {
      placeholder: localize(8602, null),
      picks: Promise.resolve(picks)
    };
  }
};

var OpenEditorContextValuePick = class {
  constructor(_editorService, _labelService) {
    this._editorService = _editorService;
    this._labelService = _labelService;
    this.type = "valuePick";
    this.label = localize(8598, null);
    this.icon = Codicon.file;
    this.ordinal = 800;
  }
  isEnabled(widget) {
    const hasEligibleOpenEditors = this._editorService.editors.some((e4) => e4 instanceof FileEditorInput || e4 instanceof DiffEditorInput || e4 instanceof UntitledTextEditorInput);
    return shouldShowOpenEditorsContext(widget, hasEligibleOpenEditors);
  }
  async asAttachment() {
    const result = [];
    for (const editor of this._editorService.editors) {
      if (!(editor instanceof FileEditorInput || editor instanceof DiffEditorInput || editor instanceof UntitledTextEditorInput || editor instanceof NotebookEditorInput)) {
        continue;
      }
      const uri4 = EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: 1 /* PRIMARY */ });
      if (!uri4) {
        continue;
      }
      result.push({
        kind: "file",
        id: uri4.toString(),
        value: uri4,
        name: this._labelService.getUriBasenameLabel(uri4)
      });
    }
    return result;
  }
};

OpenEditorContextValuePick = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, ILabelService)
], OpenEditorContextValuePick);

var ClipboardImageContextValuePick = class {
  constructor(_clipboardService) {
    this._clipboardService = _clipboardService;
    this.type = "valuePick";
    this.label = localize(8603, null);
    this.icon = Codicon.fileMedia;
  }
  async isEnabled(widget) {
    if (!widget.attachmentCapabilities.supportsImageAttachments) {
      return false;
    }
    if (!widget.input.selectedLanguageModel.get()?.metadata.capabilities?.vision) {
      return false;
    }
    const imageData = await this._clipboardService.readImage();
    return isImage(imageData);
  }
  async asAttachment() {
    const fileBuffer = await this._clipboardService.readImage();
    return {
      id: await imageToHash(fileBuffer),
      name: localize(8604, null),
      fullName: localize(8604, null),
      value: fileBuffer,
      kind: "image"
    };
  }
};

ClipboardImageContextValuePick = __decorateClass([
  __decorateParam(0, IClipboardService)
], ClipboardImageContextValuePick);

var TERMINAL_SELECTION_MAX_CHARS = 64e3;

var TERMINAL_SELECTION_MAX_LINES = 400;

var TERMINAL_COMMAND_MAX_CHARS = 48e3;

var TERMINAL_COMMAND_MAX_LINES = 300;

var TERMINAL_TAB_MAX_CHARS = 32e3;

var TERMINAL_TAB_MAX_LINES = 200;

var TERMINAL_TAB_MAX_COMMANDS = 6;

function boundTerminalContextText(value2, maxLines, maxChars, strategy) {
  let text2 = value2.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  let truncated = false;
  const lines = text2.split("\n");
  if (lines.length > maxLines) {
    truncated = true;
    if (strategy === "tail") {
      text2 = `[terminal context truncated: showing most recent ${maxLines} lines]
${lines.slice(-maxLines).join("\n")}`;
    } else {
      const headLines = Math.floor(maxLines / 2);
      const tailLines = maxLines - headLines;
      text2 = `${lines.slice(0, headLines).join("\n")}
[terminal context truncated: omitted middle lines]
${lines.slice(-tailLines).join("\n")}`;
    }
  }
  if (text2.length > maxChars) {
    truncated = true;
    if (strategy === "tail") {
      const marker = `[terminal context truncated: showing most recent ${maxChars} characters]
`;
      text2 = marker + text2.slice(-(maxChars - marker.length));
    } else {
      const marker = "\n[terminal context truncated: omitted middle characters]\n";
      const available = Math.max(0, maxChars - marker.length);
      const headChars = Math.floor(available * 0.45);
      const tailChars = available - headChars;
      text2 = text2.slice(0, headChars) + marker + text2.slice(-tailChars);
    }
  }
  return { text: text2, truncated };
}

var TerminalContext = class {
  constructor(_resource, _terminalService) {
    this._resource = _resource;
    this._terminalService = _terminalService;
    this.id = CHAT_CONTEXT_TERMINAL_ID;
    this.type = "valuePick";
    this.icon = Codicon.terminal;
    this.label = localize(8605, null);
  }
  isEnabled(widget) {
    const terminal2 = this._terminalService.getInstanceFromResource(this._resource);
    return !!widget.attachmentCapabilities.supportsTerminalAttachments && terminal2?.isDisposed === false;
  }
  async asAttachment(widget) {
    const terminal2 = this._terminalService.getInstanceFromResource(this._resource);
    if (!terminal2) {
      return;
    }
    const params = new URLSearchParams(this._resource.query);
    const commandId = params.get("command");
    const command4 = commandId ? terminal2.capabilities.get(2 /* CommandDetection */)?.commands.find((cmd) => cmd.id === commandId) : void 0;
    let attachment;
    if (command4) {
      const boundedOutput = boundTerminalContextText(command4.getOutput() ?? "", TERMINAL_COMMAND_MAX_LINES, TERMINAL_COMMAND_MAX_CHARS, "middle").text;
      attachment = {
        kind: "terminalCommand",
        id: `terminalCommand:${Date.now()}`,
        value: this.asValue(command4, boundedOutput),
        name: command4.command,
        command: command4.command,
        output: boundedOutput || void 0,
        exitCode: command4.exitCode,
        resource: this._resource
      };
    } else {
      const selection = terminal2.selection?.trim();
      if (selection) {
        const bounded = boundTerminalContextText(selection, TERMINAL_SELECTION_MAX_LINES, TERMINAL_SELECTION_MAX_CHARS, "middle");
        attachment = {
          kind: "terminalCommand",
          id: `terminalSelection:${Date.now()}`,
          value: `Terminal: ${terminal2.title}
Selection:
${bounded.text}`,
          name: `${terminal2.title} selection`,
          command: "Terminal selection",
          output: bounded.text,
          resource: this._resource
        };
      } else {
        const detectedCommands = terminal2.capabilities.get(2 /* CommandDetection */)?.commands.filter((cmd) => cmd.command?.trim()).slice(-TERMINAL_TAB_MAX_COMMANDS) ?? [];
        let snapshot = "";
        if (detectedCommands.length > 0) {
          snapshot = detectedCommands.map((cmd) => {
            const parts = [`Command: ${cmd.command}`];
            const output = cmd.getOutput();
            if (output) parts.push(`Output:
${output}`);
            if (typeof cmd.exitCode === "number") parts.push(`Exit Code: ${cmd.exitCode}`);
            return parts.join("\n");
          }).join("\n\n---\n\n");
        } else {
          const xterm = await terminal2.xtermReadyPromise;
          if (xterm) {
            const recentLines = [...xterm.getBufferReverseIterator()].slice(0, TERMINAL_TAB_MAX_LINES * 2).reverse();
            snapshot = recentLines.join("\n");
          }
        }
        const bounded = boundTerminalContextText(snapshot.trim(), TERMINAL_TAB_MAX_LINES, TERMINAL_TAB_MAX_CHARS, "tail");
        if (!bounded.text.trim()) {
          return;
        }
        attachment = {
          kind: "terminalCommand",
          id: `terminalContext:${Date.now()}`,
          value: `Terminal: ${terminal2.title}
Recent context snapshot:
${bounded.text}`,
          name: terminal2.title,
          command: `Terminal context: ${terminal2.title}`,
          output: bounded.text,
          resource: this._resource
        };
      }
    }
    const cleanup = new DisposableStore();
    let disposed = false;
    const disposeCleanup = () => {
      if (disposed) {
        return;
      }
      disposed = true;
      cleanup.dispose();
    };
    cleanup.add(widget.attachmentModel.onDidChange((e4) => {
      if (e4.deleted.includes(attachment.id)) {
        disposeCleanup();
      }
    }));
    cleanup.add(terminal2.onDisposed(() => {
      widget.attachmentModel.delete(attachment.id);
      widget.refreshParsedInput();
      disposeCleanup();
    }));
    return attachment;
  }
  asValue(command4, output) {
    let value2 = `Command: ${command4.command}`;
    if (output) {
      value2 += `
Output:
${output}`;
    }
    if (typeof command4.exitCode === "number") {
      value2 += `
Exit Code: ${command4.exitCode}`;
    }
    return value2;
  }
};

TerminalContext = __decorateClass([
  __decorateParam(1, ITerminalService)
], TerminalContext);

var ScreenshotContextValuePick = class {
  constructor(_hostService) {
    this._hostService = _hostService;
    this.type = "valuePick";
    this.icon = Codicon.deviceCamera;
    this.label = isElectron ? localize(8596, null) : localize(8597, null);
  }
  async isEnabled(widget) {
    return !!widget.attachmentCapabilities.supportsImageAttachments && !!widget.input.selectedLanguageModel.get()?.metadata.capabilities?.vision;
  }
  async asAttachment() {
    const blob = await this._hostService.getScreenshot();
    return blob && convertBufferToScreenshotVariable(blob);
  }
};

ScreenshotContextValuePick = __decorateClass([
  __decorateParam(0, IHostService)
], ScreenshotContextValuePick);

var SessionReferenceContextPickerPick = class {
  constructor(_chatSessionsService, _pathService, _remoteAgentHostService) {
    this._chatSessionsService = _chatSessionsService;
    this._pathService = _pathService;
    this._remoteAgentHostService = _remoteAgentHostService;
    this.type = "pickerPick";
    this.icon = Codicon.comment;
    this.label = localize(8599, null);
    this.ordinal = -400;
  }
  isEnabled(widget) {
    return widget.location === "panel" /* Chat */;
  }
  asPicker(widget) {
    const currentSessionResource = widget.viewModel?.sessionResource;
    const onlyShowAttachableCopilotCliSessions = !!currentSessionResource && isAgentHostTarget(getChatSessionType(currentSessionResource));
    return {
      placeholder: localize(8600, null),
      picks: (async () => {
        const picks = [];
        const sessionProviderFilter = [AgentSessionProviders.Local, AgentSessionProviders.Background, AgentSessionProviders.AgentHostCopilot];
        for await (const group2 of this._chatSessionsService.getChatSessionItems(sessionProviderFilter, CancellationToken.None)) {
          const providerIcon = getAgentSessionProviderIcon(group2.chatSessionType);
          for (const item of group2.items) {
            if (currentSessionResource && item.resource.toString() === currentSessionResource.toString()) {
              continue;
            }
            const sessionResource = item.resource;
            if (onlyShowAttachableCopilotCliSessions && !this._canAttachCopilotCliSession(sessionResource)) {
              continue;
            }
            const icon2 = item.iconPath ?? providerIcon;
            const lastActivity = item.timing.lastRequestEnded ?? item.timing.created;
            picks.push({
              lastActivity,
              pick: {
                label: item.label,
                description: new Date(lastActivity).toLocaleString(),
                asAttachment: () => ({
                  kind: "sessionReference",
                  id: sessionResource.toString(),
                  name: item.label,
                  value: sessionResource,
                  icon: icon2
                })
              }
            });
          }
        }
        picks.sort((a, b) => b.lastActivity - a.lastActivity);
        return picks.map(({ pick }) => pick);
      })()
    };
  }
  _canAttachCopilotCliSession(sessionResource) {
    return !!buildHostLocalEventsPath(
      sessionResource,
      this._pathService.userHome({ preferLocal: true }),
      (authority) => this._remoteAgentHostService.connections.find((connection) => agentHostAuthority(connection.address) === authority)
    );
  }
};

SessionReferenceContextPickerPick = __decorateClass([
  __decorateParam(0, IChatSessionsService),
  __decorateParam(1, IPathService),
  __decorateParam(2, IRemoteAgentHostService)
], SessionReferenceContextPickerPick);
export { shouldShowOpenEditorsContext, boundTerminalContextText, ChatContextContributions, ToolsContextPickerPick, OpenEditorContextValuePick, ClipboardImageContextValuePick, TERMINAL_SELECTION_MAX_CHARS, TERMINAL_SELECTION_MAX_LINES, TERMINAL_COMMAND_MAX_CHARS, TERMINAL_COMMAND_MAX_LINES, TERMINAL_TAB_MAX_CHARS, TERMINAL_TAB_MAX_LINES, TERMINAL_TAB_MAX_COMMANDS, TerminalContext, ScreenshotContextValuePick, SessionReferenceContextPickerPick };
