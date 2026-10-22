// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/list/browser/tableColumnResizeQuickPick.ts
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IQuickInputService } from "./module-0536.mjs";


// src/vs/workbench/contrib/list/browser/tableColumnResizeQuickPick.ts
var TableColumnResizeQuickPick = class extends Disposable {
  constructor(_table2, _quickInputService) {
    super();
    this._table = _table2;
    this._quickInputService = _quickInputService;
  }
  async show() {
    const items = [];
    this._table.getColumnLabels().forEach((label3, index2) => {
      if (label3) {
        items.push({ label: label3, index: index2 });
      }
    });
    const column = await this._quickInputService.pick(items, { placeHolder: localize(16519, null) });
    if (!column) {
      return;
    }
    const value2 = await this._quickInputService.input({
      placeHolder: localize(16517, null),
      prompt: localize(16518, null, column.label),
      validateInput: (input) => this._validateColumnResizeValue(input)
    });
    const percentageValue = value2 ? Number.parseInt(value2) : void 0;
    if (!percentageValue) {
      return;
    }
    this._table.resizeColumn(column.index, percentageValue);
  }
  async _validateColumnResizeValue(input) {
    const percentage = Number.parseInt(input);
    if (input && !Number.isInteger(percentage)) {
      return localize(16516, null);
    } else if (percentage < 0 || percentage > 100) {
      return localize(16515, null);
    }
    return null;
  }
};

TableColumnResizeQuickPick = __decorateClass([
  __decorateParam(1, IQuickInputService)
], TableColumnResizeQuickPick);
export { TableColumnResizeQuickPick };
