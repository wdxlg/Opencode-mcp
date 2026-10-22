// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminal.ts
import { createDecorator } from "./module-0077.mjs";
import { isNumber } from "./module-0010.mjs";


// src/vs/workbench/contrib/terminal/browser/terminal.ts
var ITerminalService = createDecorator("terminalService");

var ITerminalConfigurationService = createDecorator("terminalConfigurationService");

var ITerminalEditorService = createDecorator("terminalEditorService");

var ITerminalEditingService = createDecorator("terminalEditingService");

var ITerminalGroupService = createDecorator("terminalGroupService");

var ITerminalInstanceService = createDecorator("terminalInstanceService");

var ITerminalChatService = createDecorator("terminalChatService");

var isDetachedTerminalInstance = (t2) => !isNumber(t2.instanceId);

var TerminalLinkQuickPickEvent = class extends MouseEvent {
};

var terminalEditorId = "terminalEditor";
export { ITerminalService, ITerminalConfigurationService, ITerminalEditorService, ITerminalEditingService, ITerminalGroupService, ITerminalInstanceService, ITerminalChatService, isDetachedTerminalInstance, TerminalLinkQuickPickEvent, terminalEditorId };
