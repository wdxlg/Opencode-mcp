// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/view/notebookCellListView.ts
import { ConstantTimePrefixSumComputer } from "./module-0200.mjs";
import { ListView } from "./module-0459.mjs";


// src/vs/workbench/contrib/notebook/browser/view/notebookCellListView.ts
var NotebookCellsLayout = class {
  constructor(topPadding) {
    this._items = [];
    this._whitespace = [];
    this._prefixSumComputer = new ConstantTimePrefixSumComputer([]);
    this._size = 0;
    this._paddingTop = 0;
    this._paddingTop = topPadding ?? 0;
    this._size = this._paddingTop;
  }
  get paddingTop() {
    return this._paddingTop;
  }
  set paddingTop(paddingTop) {
    this._size = this._size + paddingTop - this._paddingTop;
    this._paddingTop = paddingTop;
  }
  get count() {
    return this._items.length;
  }
  /**
   * Returns the sum of the sizes of all items in the range map.
   */
  get size() {
    return this._size;
  }
  getWhitespaces() {
    return this._whitespace;
  }
  restoreWhitespace(items) {
    this._whitespace = items;
    this._size = this._paddingTop + this._items.reduce((total, item) => total + item.size, 0) + this._whitespace.reduce((total, ws) => total + ws.size, 0);
  }
  /**
   */
  splice(index2, deleteCount, items) {
    const inserts = items ?? [];
    this._items.splice(index2, deleteCount, ...inserts);
    this._size = this._paddingTop + this._items.reduce((total, item) => total + item.size, 0) + this._whitespace.reduce((total, ws) => total + ws.size, 0);
    this._prefixSumComputer.removeValues(index2, deleteCount);
    const newSizes = [];
    for (let i2 = 0; i2 < inserts.length; i2++) {
      const insertIndex = i2 + index2;
      const existingWhitespaces = this._whitespace.filter((ws) => ws.afterPosition === insertIndex + 1);
      if (existingWhitespaces.length > 0) {
        newSizes.push(inserts[i2].size + existingWhitespaces.reduce((acc, ws) => acc + ws.size, 0));
      } else {
        newSizes.push(inserts[i2].size);
      }
    }
    this._prefixSumComputer.insertValues(index2, newSizes);
    for (let i2 = index2; i2 < this._items.length; i2++) {
      const existingWhitespaces = this._whitespace.filter((ws) => ws.afterPosition === i2 + 1);
      if (existingWhitespaces.length > 0) {
        this._prefixSumComputer.setValue(i2, this._items[i2].size + existingWhitespaces.reduce((acc, ws) => acc + ws.size, 0));
      } else {
        this._prefixSumComputer.setValue(i2, this._items[i2].size);
      }
    }
  }
  insertWhitespace(id2, afterPosition, size3) {
    let priority = 0;
    const existingWhitespaces = this._whitespace.filter((ws) => ws.afterPosition === afterPosition);
    if (existingWhitespaces.length > 0) {
      priority = Math.max(...existingWhitespaces.map((ws) => ws.priority)) + 1;
    }
    this._whitespace.push({ id: id2, afterPosition, size: size3, priority });
    this._size += size3;
    this._whitespace.sort((a, b) => {
      if (a.afterPosition === b.afterPosition) {
        return a.priority - b.priority;
      }
      return a.afterPosition - b.afterPosition;
    });
    if (afterPosition > 0) {
      const index2 = afterPosition - 1;
      const itemSize = this._items[index2].size;
      const accSize = itemSize + size3;
      this._prefixSumComputer.setValue(index2, accSize);
    }
  }
  changeOneWhitespace(id2, afterPosition, size3) {
    const whitespaceIndex = this._whitespace.findIndex((ws) => ws.id === id2);
    if (whitespaceIndex !== -1) {
      const whitespace = this._whitespace[whitespaceIndex];
      const oldAfterPosition = whitespace.afterPosition;
      whitespace.afterPosition = afterPosition;
      const oldSize = whitespace.size;
      const delta2 = size3 - oldSize;
      whitespace.size = size3;
      this._size += delta2;
      if (oldAfterPosition > 0 && oldAfterPosition <= this._items.length) {
        const index2 = oldAfterPosition - 1;
        const itemSize = this._items[index2].size;
        const accSize = itemSize;
        this._prefixSumComputer.setValue(index2, accSize);
      }
      if (afterPosition > 0 && afterPosition <= this._items.length) {
        const index2 = afterPosition - 1;
        const itemSize = this._items[index2].size;
        const accSize = itemSize + size3;
        this._prefixSumComputer.setValue(index2, accSize);
      }
    }
  }
  removeWhitespace(id2) {
    const whitespaceIndex = this._whitespace.findIndex((ws) => ws.id === id2);
    if (whitespaceIndex !== -1) {
      const whitespace = this._whitespace[whitespaceIndex];
      this._whitespace.splice(whitespaceIndex, 1);
      this._size -= whitespace.size;
      if (whitespace.afterPosition > 0) {
        const index2 = whitespace.afterPosition - 1;
        const itemSize = this._items[index2].size;
        const remainingWhitespaces = this._whitespace.filter((ws) => ws.afterPosition === whitespace.afterPosition);
        const accSize = itemSize + remainingWhitespaces.reduce((acc, ws) => acc + ws.size, 0);
        this._prefixSumComputer.setValue(index2, accSize);
      }
    }
  }
  /**
   * find position of whitespace
   * @param id: id of the whitespace
   * @returns: position in the list view
   */
  getWhitespacePosition(id2) {
    const whitespace = this._whitespace.find((ws) => ws.id === id2);
    if (!whitespace) {
      throw new Error("Whitespace not found");
    }
    const afterPosition = whitespace.afterPosition;
    if (afterPosition === 0) {
      const whitespaces = this._whitespace.filter((ws) => ws.afterPosition === afterPosition && ws.priority < whitespace.priority);
      return whitespaces.reduce((acc, ws) => acc + ws.size, 0) + this.paddingTop;
    }
    const whitespaceBeforeFirstItem = this._whitespace.filter((ws) => ws.afterPosition === 0).reduce((acc, ws) => acc + ws.size, 0);
    const index2 = afterPosition - 1;
    const previousItemPosition = this._prefixSumComputer.getPrefixSum(index2);
    const previousItemSize = this._items[index2].size;
    return previousItemPosition + previousItemSize + whitespaceBeforeFirstItem + this.paddingTop;
  }
  indexAt(position2) {
    if (position2 < 0) {
      return -1;
    }
    const whitespaceBeforeFirstItem = this._whitespace.filter((ws) => ws.afterPosition === 0).reduce((acc, ws) => acc + ws.size, 0);
    const offset = position2 - (this._paddingTop + whitespaceBeforeFirstItem);
    if (offset <= 0) {
      return 0;
    }
    if (offset >= this._size - this._paddingTop - whitespaceBeforeFirstItem) {
      return this.count;
    }
    return this._prefixSumComputer.getIndexOf(Math.trunc(offset)).index;
  }
  indexAfter(position2) {
    const index2 = this.indexAt(position2);
    return Math.min(index2 + 1, this._items.length);
  }
  positionAt(index2) {
    if (index2 < 0) {
      return -1;
    }
    if (this.count === 0) {
      return -1;
    }
    if (index2 >= this.count) {
      return -1;
    }
    const whitespaceBeforeFirstItem = this._whitespace.filter((ws) => ws.afterPosition === 0).reduce((acc, ws) => acc + ws.size, 0);
    return this._prefixSumComputer.getPrefixSum(
      index2
      /** count */
    ) + this._paddingTop + whitespaceBeforeFirstItem;
  }
};

var NotebookCellListView = class extends ListView {
  constructor() {
    super(...arguments);
    this._lastWhitespaceId = 0;
    this._renderingStack = 0;
  }
  get inRenderingTransaction() {
    return this._renderingStack > 0;
  }
  get notebookRangeMap() {
    return this.rangeMap;
  }
  render(previousRenderRange, renderTop, renderHeight, renderLeft, scrollWidth, updateItemsInDOM) {
    this._renderingStack++;
    super.render(previousRenderRange, renderTop, renderHeight, renderLeft, scrollWidth, updateItemsInDOM);
    this._renderingStack--;
  }
  _rerender(renderTop, renderHeight, inSmoothScrolling) {
    this._renderingStack++;
    super._rerender(renderTop, renderHeight, inSmoothScrolling);
    this._renderingStack--;
  }
  createRangeMap(paddingTop) {
    const existingMap = this.rangeMap;
    if (existingMap) {
      const layout2 = new NotebookCellsLayout(paddingTop);
      layout2.restoreWhitespace(existingMap.getWhitespaces());
      return layout2;
    } else {
      return new NotebookCellsLayout(paddingTop);
    }
  }
  insertWhitespace(afterPosition, size3) {
    const scrollTop = this.scrollTop;
    const id2 = `${++this._lastWhitespaceId}`;
    const previousRenderRange = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
    const elementPosition = this.elementTop(afterPosition);
    const aboveScrollTop = scrollTop > elementPosition;
    this.notebookRangeMap.insertWhitespace(id2, afterPosition, size3);
    const newScrolltop = aboveScrollTop ? scrollTop + size3 : scrollTop;
    this.render(previousRenderRange, newScrolltop, this.lastRenderHeight, void 0, void 0, false);
    this._rerender(newScrolltop, this.renderHeight, false);
    this.eventuallyUpdateScrollDimensions();
    return id2;
  }
  changeOneWhitespace(id2, newAfterPosition, newSize) {
    const scrollTop = this.scrollTop;
    const previousRenderRange = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
    const currentPosition = this.notebookRangeMap.getWhitespacePosition(id2);
    if (currentPosition > scrollTop) {
      this.notebookRangeMap.changeOneWhitespace(id2, newAfterPosition, newSize);
      this.render(previousRenderRange, scrollTop, this.lastRenderHeight, void 0, void 0, false);
      this._rerender(scrollTop, this.renderHeight, false);
      this.eventuallyUpdateScrollDimensions();
    } else {
      this.notebookRangeMap.changeOneWhitespace(id2, newAfterPosition, newSize);
      this.eventuallyUpdateScrollDimensions();
    }
  }
  removeWhitespace(id2) {
    const scrollTop = this.scrollTop;
    const previousRenderRange = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
    this.notebookRangeMap.removeWhitespace(id2);
    this.render(previousRenderRange, scrollTop, this.lastRenderHeight, void 0, void 0, false);
    this._rerender(scrollTop, this.renderHeight, false);
    this.eventuallyUpdateScrollDimensions();
  }
  getWhitespacePosition(id2) {
    return this.notebookRangeMap.getWhitespacePosition(id2);
  }
};
export { NotebookCellsLayout, NotebookCellListView };
