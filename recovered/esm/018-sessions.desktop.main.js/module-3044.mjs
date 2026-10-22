// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalCommands.ts
import { KeybindingsRegistry } from "./module-0091.mjs";
import { ITerminalGroupService } from "./module-1150.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalCommands.ts
function setupTerminalCommands() {
  registerOpenTerminalAtIndexCommands();
}

function registerOpenTerminalAtIndexCommands() {
  for (let i2 = 0; i2 < 9; i2++) {
    const terminalIndex = i2;
    const visibleIndex = i2 + 1;
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: `workbench.action.terminal.focusAtIndex${visibleIndex}`,
      weight: 200 /* WorkbenchContrib */,
      when: void 0,
      primary: 0,
      handler: (accessor) => {
        accessor.get(ITerminalGroupService).setActiveInstanceByIndex(terminalIndex);
        return accessor.get(ITerminalGroupService).showPanel(true);
      }
    });
  }
}
export { setupTerminalCommands, registerOpenTerminalAtIndexCommands };
