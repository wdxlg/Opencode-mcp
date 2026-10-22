// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/list/browser/listResizeColumnAction.ts
import { Action2 } from "./module-0092.mjs";
import { localize } from "./module-0001.mjs";
import { IListService, WorkbenchListFocusContextKey } from "./module-0636.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Table } from "./module-0626.mjs";
import { TableColumnResizeQuickPick } from "./module-3653.mjs";


// src/vs/workbench/contrib/list/browser/listResizeColumnAction.ts
var ListResizeColumnAction = class extends Action2 {
  constructor() {
    super({
      id: "list.resizeColumn",
      title: { value: localize(16514, null), original: "Resize Column" },
      category: { value: localize(16513, null), original: "List" },
      precondition: WorkbenchListFocusContextKey,
      f1: true
    });
  }
  async run(accessor) {
    const listService = accessor.get(IListService);
    const instantiationService = accessor.get(IInstantiationService);
    const list2 = listService.lastFocusedList;
    if (list2 instanceof Table) {
      await instantiationService.createInstance(TableColumnResizeQuickPick, list2).show();
    }
  }
};
export { ListResizeColumnAction };
