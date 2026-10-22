// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/table/tableWidget.ts
import { $, append, clearNode, getContentHeight, getContentWidth } from "./module-0075.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { getBaseLayerHoverDelegate } from "./module-0472.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { SplitView } from "./module-0625.mjs";
import { List, unthemedListStyles } from "./module-0460.mjs";
import { createStyleSheet } from "./module-0224.mjs";


// src/vs/base/browser/ui/table/tableWidget.ts
var TableListRenderer = class _TableListRenderer {
  constructor(columns, renderers, getColumnSize) {
    this.columns = columns;
    this.getColumnSize = getColumnSize;
    this.templateId = _TableListRenderer.TemplateId;
    this.renderedTemplates = /* @__PURE__ */ new Set();
    const rendererMap = new Map(renderers.map((r2) => [r2.templateId, r2]));
    this.renderers = [];
    for (const column of columns) {
      const renderer = rendererMap.get(column.templateId);
      if (!renderer) {
        throw new Error(`Table cell renderer for template id ${column.templateId} not found.`);
      }
      this.renderers.push(renderer);
    }
  }
  static {
    this.TemplateId = "row";
  }
  renderTemplate(container2) {
    const rowContainer = append(container2, $(".monaco-table-tr"));
    const cellContainers = [];
    const cellTemplateData = [];
    for (let i2 = 0; i2 < this.columns.length; i2++) {
      const renderer = this.renderers[i2];
      const cellContainer = append(rowContainer, $(".monaco-table-td", { "data-col-index": i2 }));
      cellContainer.style.width = `${this.getColumnSize(i2)}px`;
      cellContainers.push(cellContainer);
      cellTemplateData.push(renderer.renderTemplate(cellContainer));
    }
    const result = { container: container2, cellContainers, cellTemplateData };
    this.renderedTemplates.add(result);
    return result;
  }
  renderElement(element, index2, templateData, renderDetails) {
    for (let i2 = 0; i2 < this.columns.length; i2++) {
      const column = this.columns[i2];
      const cell = column.project(element);
      const renderer = this.renderers[i2];
      renderer.renderElement(cell, index2, templateData.cellTemplateData[i2], renderDetails);
    }
  }
  disposeElement(element, index2, templateData, renderDetails) {
    for (let i2 = 0; i2 < this.columns.length; i2++) {
      const renderer = this.renderers[i2];
      if (renderer.disposeElement) {
        const column = this.columns[i2];
        const cell = column.project(element);
        renderer.disposeElement(cell, index2, templateData.cellTemplateData[i2], renderDetails);
      }
    }
  }
  disposeTemplate(templateData) {
    for (let i2 = 0; i2 < this.columns.length; i2++) {
      const renderer = this.renderers[i2];
      renderer.disposeTemplate(templateData.cellTemplateData[i2]);
    }
    clearNode(templateData.container);
    this.renderedTemplates.delete(templateData);
  }
  layoutColumn(index2, size3) {
    for (const { cellContainers } of this.renderedTemplates) {
      cellContainers[index2].style.width = `${size3}px`;
    }
  }
};

function asListVirtualDelegate(delegate) {
  return {
    getHeight(row) {
      return delegate.getHeight(row);
    },
    getTemplateId() {
      return TableListRenderer.TemplateId;
    }
  };
}

var ColumnHeader = class extends Disposable {
  constructor(column, index2) {
    super();
    this.column = column;
    this.index = index2;
    this._onDidLayout = this._register(new Emitter());
    this.onDidLayout = this._onDidLayout.event;
    this.element = $(".monaco-table-th", { "data-col-index": index2 }, column.label);
    if (column.tooltip) {
      this._register(getBaseLayerHoverDelegate().setupManagedHover(getDefaultHoverDelegate("mouse"), this.element, column.tooltip));
    }
  }
  get minimumSize() {
    return this.column.minimumWidth ?? 120;
  }
  get maximumSize() {
    return this.column.maximumWidth ?? Number.POSITIVE_INFINITY;
  }
  get onDidChange() {
    return this.column.onDidChangeWidthConstraints ?? Event2.None;
  }
  layout(size3) {
    this._onDidLayout.fire([this.index, size3]);
  }
};

var Table = class _Table {
  constructor(user, container2, virtualDelegate, columns, renderers, _options) {
    this.virtualDelegate = virtualDelegate;
    this.columns = columns;
    this.domId = `table_id_${++_Table.InstanceCount}`;
    this.disposables = new DisposableStore();
    this.cachedWidth = 0;
    this.cachedHeight = 0;
    this.domNode = append(container2, $(`.monaco-table.${this.domId}`));
    const headers = columns.map((c, i2) => this.disposables.add(new ColumnHeader(c, i2)));
    const descriptor = {
      size: headers.reduce((a, b) => a + b.column.weight, 0),
      views: headers.map((view) => ({ size: view.column.weight, view }))
    };
    this.splitview = this.disposables.add(new SplitView(this.domNode, {
      orientation: 1 /* HORIZONTAL */,
      scrollbarVisibility: 2 /* Hidden */,
      getSashOrthogonalSize: () => this.cachedHeight,
      descriptor
    }));
    this.splitview.el.style.height = `${virtualDelegate.headerRowHeight}px`;
    this.splitview.el.style.lineHeight = `${virtualDelegate.headerRowHeight}px`;
    const renderer = new TableListRenderer(columns, renderers, (i2) => this.splitview.getViewSize(i2));
    this.list = this.disposables.add(new List(user, this.domNode, asListVirtualDelegate(virtualDelegate), [renderer], _options));
    Event2.any(...headers.map((h3) => h3.onDidLayout))(([index2, size3]) => renderer.layoutColumn(index2, size3), null, this.disposables);
    this.splitview.onDidSashReset((index2) => {
      const totalWeight = columns.reduce((r2, c) => r2 + c.weight, 0);
      const size3 = columns[index2].weight / totalWeight * this.cachedWidth;
      this.splitview.resizeView(index2, size3);
    }, null, this.disposables);
    this.styleElement = createStyleSheet(this.domNode);
    this.style(unthemedListStyles);
  }
  static {
    this.InstanceCount = 0;
  }
  get onDidChangeFocus() {
    return this.list.onDidChangeFocus;
  }
  get onDidChangeSelection() {
    return this.list.onDidChangeSelection;
  }
  get onDidScroll() {
    return this.list.onDidScroll;
  }
  get onMouseClick() {
    return this.list.onMouseClick;
  }
  get onMouseDblClick() {
    return this.list.onMouseDblClick;
  }
  get onMouseMiddleClick() {
    return this.list.onMouseMiddleClick;
  }
  get onPointer() {
    return this.list.onPointer;
  }
  get onMouseUp() {
    return this.list.onMouseUp;
  }
  get onMouseDown() {
    return this.list.onMouseDown;
  }
  get onMouseOver() {
    return this.list.onMouseOver;
  }
  get onMouseMove() {
    return this.list.onMouseMove;
  }
  get onMouseOut() {
    return this.list.onMouseOut;
  }
  get onTouchStart() {
    return this.list.onTouchStart;
  }
  get onTap() {
    return this.list.onTap;
  }
  get onContextMenu() {
    return this.list.onContextMenu;
  }
  get onDidFocus() {
    return this.list.onDidFocus;
  }
  get onDidBlur() {
    return this.list.onDidBlur;
  }
  get scrollTop() {
    return this.list.scrollTop;
  }
  set scrollTop(scrollTop) {
    this.list.scrollTop = scrollTop;
  }
  get scrollLeft() {
    return this.list.scrollLeft;
  }
  set scrollLeft(scrollLeft) {
    this.list.scrollLeft = scrollLeft;
  }
  get scrollHeight() {
    return this.list.scrollHeight;
  }
  get renderHeight() {
    return this.list.renderHeight;
  }
  get onDidDispose() {
    return this.list.onDidDispose;
  }
  getColumnLabels() {
    return this.columns.map((c) => c.label);
  }
  resizeColumn(index2, percentage) {
    const size3 = Math.round(percentage / 100 * this.cachedWidth);
    this.splitview.resizeView(index2, size3);
  }
  updateOptions(options3) {
    this.list.updateOptions(options3);
  }
  splice(start, deleteCount, elements = []) {
    this.list.splice(start, deleteCount, elements);
  }
  rerender() {
    this.list.rerender();
  }
  row(index2) {
    return this.list.element(index2);
  }
  indexOf(element) {
    return this.list.indexOf(element);
  }
  get length() {
    return this.list.length;
  }
  getHTMLElement() {
    return this.domNode;
  }
  layout(height, width2) {
    height = height ?? getContentHeight(this.domNode);
    width2 = width2 ?? getContentWidth(this.domNode);
    this.cachedWidth = width2;
    this.cachedHeight = height;
    this.splitview.layout(width2);
    const listHeight = height - this.virtualDelegate.headerRowHeight;
    this.list.getHTMLElement().style.height = `${listHeight}px`;
    this.list.layout(listHeight, width2);
  }
  triggerTypeNavigation() {
    this.list.triggerTypeNavigation();
  }
  style(styles) {
    const content = [];
    content.push(`.monaco-table.${this.domId} > .monaco-split-view2 .monaco-sash.vertical::before {
			top: ${this.virtualDelegate.headerRowHeight + 1}px;
			height: calc(100% - ${this.virtualDelegate.headerRowHeight}px);
		}`);
    this.styleElement.textContent = content.join("\n");
    this.list.style(styles);
  }
  domFocus() {
    this.list.domFocus();
  }
  setAnchor(index2) {
    this.list.setAnchor(index2);
  }
  getAnchor() {
    return this.list.getAnchor();
  }
  getSelectedElements() {
    return this.list.getSelectedElements();
  }
  setSelection(indexes, browserEvent) {
    this.list.setSelection(indexes, browserEvent);
  }
  getSelection() {
    return this.list.getSelection();
  }
  setFocus(indexes, browserEvent) {
    this.list.setFocus(indexes, browserEvent);
  }
  focusNext(n2 = 1, loop = false, browserEvent) {
    this.list.focusNext(n2, loop, browserEvent);
  }
  focusPrevious(n2 = 1, loop = false, browserEvent) {
    this.list.focusPrevious(n2, loop, browserEvent);
  }
  focusNextPage(browserEvent) {
    return this.list.focusNextPage(browserEvent);
  }
  focusPreviousPage(browserEvent) {
    return this.list.focusPreviousPage(browserEvent);
  }
  focusFirst(browserEvent) {
    this.list.focusFirst(browserEvent);
  }
  focusLast(browserEvent) {
    this.list.focusLast(browserEvent);
  }
  getFocus() {
    return this.list.getFocus();
  }
  getFocusedElements() {
    return this.list.getFocusedElements();
  }
  getRelativeTop(index2) {
    return this.list.getRelativeTop(index2);
  }
  reveal(index2, relativeTop) {
    this.list.reveal(index2, relativeTop);
  }
  dispose() {
    this.disposables.dispose();
  }
};
export { asListVirtualDelegate, TableListRenderer, ColumnHeader, Table };
