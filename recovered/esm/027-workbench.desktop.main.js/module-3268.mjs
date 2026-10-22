// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalContextMenu.ts
import { ActionRunner } from "./module-0082.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { getFlatContextMenuActions } from "./module-0516.mjs";
import { asArray } from "./module-0007.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalContextMenu.ts
var InstanceContext = class {
  constructor(instance2) {
    this.instanceId = instance2.instanceId;
  }
  toJSON() {
    return {
      $mid: 15 /* TerminalContext */,
      instanceId: this.instanceId
    };
  }
};

var TerminalContextActionRunner = class extends ActionRunner {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  async runAction(action, context2) {
    if (Array.isArray(context2) && context2.every((e) => e instanceof InstanceContext)) {
      await action.run(context2?.[0], context2);
      return;
    }
    return super.runAction(action, context2);
  }
};

function openContextMenu(targetWindow, event, contextInstances, menu, contextMenuService, extraActions) {
  const standardEvent = new StandardMouseEvent(targetWindow, event);
  const actions = getFlatContextMenuActions(menu.getActions({ shouldForwardArgs: true }));
  if (extraActions) {
    actions.push(...extraActions);
  }
  const context2 = contextInstances ? asArray(contextInstances).map((e) => new InstanceContext(e)) : [];
  const actionRunner = new TerminalContextActionRunner();
  contextMenuService.showContextMenu({
    actionRunner,
    getAnchor: () => standardEvent,
    getActions: () => actions,
    getActionsContext: () => context2,
    onHide: () => actionRunner.dispose()
  });
}
export { openContextMenu, InstanceContext, TerminalContextActionRunner };
