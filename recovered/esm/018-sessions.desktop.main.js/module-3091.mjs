// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminal.contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { ITerminalLogService } from "./module-1155.mjs";
import { TerminalLogService } from "./module-3027.mjs";
import { ITerminalConfigurationService, ITerminalEditingService, ITerminalEditorService, ITerminalGroupService, ITerminalInstanceService, ITerminalService, terminalEditorId } from "./module-1150.mjs";
import { TerminalConfigurationService } from "./module-3045.mjs";
import { TerminalService } from "./module-3083.mjs";
import { TerminalEditorService } from "./module-3049.mjs";
import { TerminalEditingService } from "./module-3028.mjs";
import { TerminalGroupService } from "./module-3051.mjs";
import { TerminalInstanceService } from "./module-3077.mjs";
import { ITerminalProfileService, TERMINAL_VIEW_ID } from "./module-1174.mjs";
import { TerminalProfileService } from "./module-3080.mjs";
import { AgentHostTerminalService, IAgentHostTerminalService } from "./module-3090.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { TerminalMainContribution } from "./module-3078.mjs";
import { RemoteTerminalBackendContribution } from "./module-3038.mjs";
import { registerTerminalPlatformConfiguration } from "./module-1161.mjs";
import { registerTerminalConfiguration } from "./module-3029.mjs";
import { getFontSnippets } from "./module-0312.mjs";
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0926.mjs";
import { TerminalEditorInput } from "./module-1177.mjs";
import { TerminalInputSerializer } from "./module-3048.mjs";
import { EditorPaneDescriptor } from "./module-1085.mjs";
import { TerminalEditor } from "./module-3047.mjs";
import { terminalStrings } from "./module-3030.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { Extensions7 } from "./module-0273.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { Extensions13 } from "./module-1094.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { terminalViewIcon } from "./module-2326.mjs";
import { ViewPaneContainer } from "./module-1381.mjs";
import { TerminalViewPane } from "./module-3086.mjs";
import { registerTerminalActions } from "./module-3043.mjs";
import { setupTerminalCommands } from "./module-3044.mjs";
import { setupTerminalMenus } from "./module-3046.mjs";
import { registerColors } from "./module-0869.mjs";


// src/vs/workbench/contrib/terminal/browser/terminal.contribution.ts
registerSingleton(ITerminalLogService, TerminalLogService, 1 /* Delayed */);

registerSingleton(ITerminalConfigurationService, TerminalConfigurationService, 1 /* Delayed */);

registerSingleton(ITerminalService, TerminalService, 1 /* Delayed */);

registerSingleton(ITerminalEditorService, TerminalEditorService, 1 /* Delayed */);

registerSingleton(ITerminalEditingService, TerminalEditingService, 1 /* Delayed */);

registerSingleton(ITerminalGroupService, TerminalGroupService, 1 /* Delayed */);

registerSingleton(ITerminalInstanceService, TerminalInstanceService, 1 /* Delayed */);

registerSingleton(ITerminalProfileService, TerminalProfileService, 1 /* Delayed */);

registerSingleton(IAgentHostTerminalService, AgentHostTerminalService, 1 /* Delayed */);

registerWorkbenchContribution2(TerminalMainContribution.ID, TerminalMainContribution, WorkbenchPhase.BlockStartup);

registerWorkbenchContribution2(RemoteTerminalBackendContribution.ID, RemoteTerminalBackendContribution, WorkbenchPhase.AfterRestored);

registerTerminalPlatformConfiguration();

registerTerminalConfiguration(getFontSnippets);

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(TerminalEditorInput.ID, TerminalInputSerializer);

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    TerminalEditor,
    terminalEditorId,
    terminalStrings.terminal
  ),
  [
    new SyncDescriptor(TerminalEditorInput)
  ]
);

Registry.as(Extensions7.DragAndDropContribution).register({
  dataFormatKey: "Terminals" /* Terminals */,
  getEditorInputs(data) {
    const editors = [];
    try {
      const terminalEditors = JSON.parse(data);
      for (const terminalEditor of terminalEditors) {
        editors.push({ resource: URI.parse(terminalEditor) });
      }
    } catch (error) {
    }
    return editors;
  },
  setData(resources, event) {
    const terminalResources = resources.filter(({ resource }) => resource.scheme === Schemas.vscodeTerminal);
    if (terminalResources.length) {
      event.dataTransfer?.setData("Terminals" /* Terminals */, JSON.stringify(terminalResources.map(({ resource }) => resource.toString())));
    }
  }
});

var VIEW_CONTAINER3 = Registry.as(Extensions13.ViewContainersRegistry).registerViewContainer({
  id: TERMINAL_VIEW_ID,
  title: localize2(19921, "Terminal"),
  icon: terminalViewIcon,
  ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [TERMINAL_VIEW_ID, { mergeViewWithContainerWhenSingleView: true }]),
  storageId: TERMINAL_VIEW_ID,
  hideIfEmpty: true,
  order: 3,
  windowEnablement: 3 /* Both */
}, 1 /* Panel */, { doNotRegisterOpenCommand: true, isDefault: true });

Registry.as(Extensions13.ViewsRegistry).registerViews([{
  id: TERMINAL_VIEW_ID,
  name: localize2(19921, "Terminal"),
  containerIcon: terminalViewIcon,
  canToggleVisibility: true,
  canMoveView: true,
  ctorDescriptor: new SyncDescriptor(TerminalViewPane),
  windowEnablement: 3 /* Both */,
  openCommandActionDescriptor: {
    id: "workbench.action.terminal.toggleTerminal" /* Toggle */,
    mnemonicTitle: localize(19920, null),
    keybindings: {
      primary: 2048 /* CtrlCmd */ | 91 /* Backquote */,
      mac: { primary: 256 /* WinCtrl */ | 91 /* Backquote */ }
    },
    order: 3
  }
}], VIEW_CONTAINER3);

registerTerminalActions();

setupTerminalCommands();

setupTerminalMenus();

registerColors();
export { VIEW_CONTAINER3 };
