// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminal.contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { ITerminalLogService } from "./module-1154.mjs";
import { TerminalLogService } from "./module-3258.mjs";
import { ITerminalConfigurationService, ITerminalEditingService, ITerminalEditorService, ITerminalGroupService, ITerminalInstanceService, ITerminalService, terminalEditorId } from "./module-1149.mjs";
import { TerminalConfigurationService } from "./module-3274.mjs";
import { TerminalService } from "./module-3298.mjs";
import { TerminalEditorService } from "./module-3278.mjs";
import { TerminalEditingService } from "./module-3259.mjs";
import { TerminalGroupService } from "./module-3280.mjs";
import { TerminalInstanceService } from "./module-3292.mjs";
import { ITerminalProfileService, TERMINAL_VIEW_ID } from "./module-1173.mjs";
import { TerminalProfileService } from "./module-3295.mjs";
import { AgentHostTerminalService, IAgentHostTerminalService } from "./module-2889.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { TerminalMainContribution } from "./module-3293.mjs";
import { RemoteTerminalBackendContribution } from "./module-3267.mjs";
import { registerTerminalPlatformConfiguration } from "./module-1160.mjs";
import { registerTerminalConfiguration } from "./module-3260.mjs";
import { getFontSnippets } from "./module-0312.mjs";
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0925.mjs";
import { TerminalEditorInput } from "./module-1177.mjs";
import { TerminalInputSerializer } from "./module-3277.mjs";
import { EditorPaneDescriptor } from "./module-1084.mjs";
import { TerminalEditor } from "./module-3276.mjs";
import { terminalStrings } from "./module-3261.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { Extensions7 } from "./module-0273.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { Extensions13 } from "./module-1093.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { terminalViewIcon } from "./module-2351.mjs";
import { ViewPaneContainer } from "./module-1382.mjs";
import { TerminalViewPane } from "./module-3301.mjs";
import { registerTerminalActions } from "./module-3272.mjs";
import { setupTerminalCommands } from "./module-3273.mjs";
import { setupTerminalMenus } from "./module-3275.mjs";
import { registerColors } from "./module-1174.mjs";


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

var VIEW_CONTAINER6 = Registry.as(Extensions13.ViewContainersRegistry).registerViewContainer({
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
}], VIEW_CONTAINER6);

registerTerminalActions();

setupTerminalCommands();

setupTerminalMenus();

registerColors();
export { VIEW_CONTAINER6 };
