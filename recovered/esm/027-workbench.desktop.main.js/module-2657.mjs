// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/enablementActions.ts
import { Action } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { isContributionDisabled } from "./module-1018.mjs";


// src/vs/workbench/contrib/chat/browser/enablementActions.ts
function createEnablementActions(key3, enablementModel, idPrefix) {
  return [
    new Action(
      `${idPrefix}.enable`,
      localize(11330, null),
      void 0,
      true,
      () => {
        enablementModel.setEnabled(key3, 2 /* EnabledProfile */);
        return Promise.resolve();
      }
    ),
    new Action(
      `${idPrefix}.enableForWorkspace`,
      localize(11331, null),
      void 0,
      true,
      () => {
        enablementModel.setEnabled(key3, 3 /* EnabledWorkspace */);
        return Promise.resolve();
      }
    ),
    new Action(
      `${idPrefix}.disable`,
      localize(11328, null),
      void 0,
      true,
      () => {
        enablementModel.setEnabled(key3, 0 /* DisabledProfile */);
        return Promise.resolve();
      }
    ),
    new Action(
      `${idPrefix}.disableForWorkspace`,
      localize(11329, null),
      void 0,
      true,
      () => {
        enablementModel.setEnabled(key3, 1 /* DisabledWorkspace */);
        return Promise.resolve();
      }
    )
  ];
}

function buildEnablementContextMenuGroup(enablementState, key3, enablementModel, workspaceContextService, idPrefix) {
  const hasWorkspace = workspaceContextService.getWorkbenchState() !== 1 /* EMPTY */;
  const [enable, enableWorkspace, disable, disableWorkspace] = createEnablementActions(key3, enablementModel, idPrefix);
  const actions = [];
  if (isContributionDisabled(enablementState)) {
    actions.push(enable);
    if (hasWorkspace) {
      actions.push(enableWorkspace);
    }
  } else {
    actions.push(disable);
    if (hasWorkspace) {
      actions.push(disableWorkspace);
    }
  }
  return actions;
}
export { createEnablementActions, buildEnablementContextMenuGroup };
