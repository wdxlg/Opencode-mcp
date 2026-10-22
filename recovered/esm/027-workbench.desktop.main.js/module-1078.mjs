// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/editor/common/editorGroupColumn.ts
import { ACTIVE_GROUP, AUX_WINDOW_GROUP, MODAL_GROUP, SIDE_GROUP } from "./module-0934.mjs";
import { preferredSideBySideGroupDirection } from "./module-0933.mjs";


// src/vs/workbench/services/editor/common/editorGroupColumn.ts
function columnToEditorGroup(editorGroupService, configurationService, column = ACTIVE_GROUP) {
  if (column === ACTIVE_GROUP || column === SIDE_GROUP || column === AUX_WINDOW_GROUP || column === MODAL_GROUP) {
    return column;
  }
  let groupInColumn = editorGroupService.getGroups(2 /* GRID_APPEARANCE */)[column];
  if (!groupInColumn && column < 9) {
    for (let i2 = 0; i2 <= column; i2++) {
      const editorGroups = editorGroupService.getGroups(2 /* GRID_APPEARANCE */);
      if (!editorGroups[i2]) {
        editorGroupService.addGroup(editorGroups[i2 - 1], preferredSideBySideGroupDirection(configurationService));
      }
    }
    groupInColumn = editorGroupService.getGroups(2 /* GRID_APPEARANCE */)[column];
  }
  return groupInColumn?.id ?? SIDE_GROUP;
}

function editorGroupToColumn(editorGroupService, editorGroup) {
  const group2 = typeof editorGroup === "number" ? editorGroupService.getGroup(editorGroup) : editorGroup;
  return editorGroupService.getGroups(2 /* GRID_APPEARANCE */).indexOf(group2 ?? editorGroupService.activeGroup);
}
export { columnToEditorGroup, editorGroupToColumn };
