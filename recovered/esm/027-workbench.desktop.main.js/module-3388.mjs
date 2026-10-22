// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chat/browser/terminalChatSessionResolver.ts
import { createDecorator } from "./module-0077.mjs";
import { withChatSurfaceMeta } from "./module-2951.mjs";
import { IChatSessionsService, SessionType } from "./module-0960.mjs";
import { isCancellationError, onUnexpectedError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatService } from "./module-0972.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/terminalContrib/chat/browser/terminalChatSessionResolver.ts
var ITerminalChatSessionResolver = createDecorator("terminalChatSessionResolver");

function getTerminalChatSessionMeta(shellType, os) {
  return withChatSurfaceMeta(void 0, {
    surface: "terminal",
    shellType,
    osName: getOperatingSystemName(os)
  });
}

function getOperatingSystemName(os) {
  switch (os) {
    case 1 /* Windows */:
      return "Windows";
    case 2 /* Macintosh */:
      return "macOS";
    case 3 /* Linux */:
      return "Linux";
  }
}

var TerminalChatSessionResolver = class {
  constructor(_chatSessionsService, _chatService, _configurationService) {
    this._chatSessionsService = _chatSessionsService;
    this._chatService = _chatService;
    this._configurationService = _configurationService;
  }
  async resolve(token, shellType, os) {
    if (token.isCancellationRequested) {
      return void 0;
    }
    const meta = getTerminalChatSessionMeta(shellType, os);
    let modelRef;
    const agentHostEnabled = this._configurationService.getValue("chat.terminal.agentHost.enabled" /* TerminalAgentHostEnabled */) === true;
    const contribution = agentHostEnabled ? this._chatSessionsService.getChatSessionContribution(SessionType.AgentHostCopilot) : void 0;
    if (contribution?.locations?.includes("terminal" /* Terminal */)) {
      try {
        const item = await this._chatSessionsService.createNewChatSessionItem(SessionType.AgentHostCopilot, {
          prompt: "",
          isEphemeral: true,
          _meta: meta
        }, token);
        modelRef = item && await this._chatService.acquireOrLoadSession(item.resource, "terminal" /* Terminal */, token, "TerminalChatSessionResolver#resolve");
      } catch (error) {
        if (isCancellationError(error) || token.isCancellationRequested) {
          throw error;
        }
        onUnexpectedError(error);
      }
    }
    if (token.isCancellationRequested) {
      modelRef?.dispose();
      return void 0;
    }
    if (modelRef) {
      return { modelRef, lockToAgent: contribution };
    }
    modelRef = this._chatService.startNewLocalSession("terminal" /* Terminal */);
    if (token.isCancellationRequested) {
      modelRef.dispose();
      return void 0;
    }
    return { modelRef, lockToAgent: void 0 };
  }
};

TerminalChatSessionResolver = __decorateClass([
  __decorateParam(0, IChatSessionsService),
  __decorateParam(1, IChatService),
  __decorateParam(2, IConfigurationService)
], TerminalChatSessionResolver);
export { getTerminalChatSessionMeta, getOperatingSystemName, ITerminalChatSessionResolver, TerminalChatSessionResolver };
