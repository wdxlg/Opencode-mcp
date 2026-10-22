// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/view/cellParts/cellStatusPart.ts
import { $, EventType, addDisposableListener, append, isHTMLElement } from "./module-0075.mjs";
import { CellContentPart } from "./module-1873.mjs";
import { Emitter } from "./module-0017.mjs";
import { Disposable, DisposableStore, dispose } from "./module-0012.mjs";
import { CodeCellViewModel } from "./module-1877.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IThemeService } from "./module-0287.mjs";
import { SimpleIconLabel } from "./module-1545.mjs";
import { isThemeColor } from "./module-0153.mjs";
import { stripIcons } from "./module-0461.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ICommandService } from "./module-0087.mjs";
import { INotificationService } from "./module-0336.mjs";


// src/vs/workbench/contrib/notebook/browser/view/cellParts/cellStatusPart.ts
var $30 = $;

var CellEditorStatusBar = class extends CellContentPart {
  constructor(_notebookEditor, _cellContainer, editorPart, _editor, _instantiationService, hoverService, configurationService, _themeService) {
    super();
    this._notebookEditor = _notebookEditor;
    this._cellContainer = _cellContainer;
    this._editor = _editor;
    this._instantiationService = _instantiationService;
    this._themeService = _themeService;
    this.leftItems = [];
    this.rightItems = [];
    this.width = 0;
    this._onDidClick = this._register(new Emitter());
    this.onDidClick = this._onDidClick.event;
    this.statusBarContainer = append(editorPart, $30(".cell-statusbar-container"));
    this.statusBarContainer.tabIndex = -1;
    const leftItemsContainer = append(this.statusBarContainer, $30(".cell-status-left"));
    const rightItemsContainer = append(this.statusBarContainer, $30(".cell-status-right"));
    this.leftItemsContainer = append(leftItemsContainer, $30(".cell-contributed-items.cell-contributed-items-left"));
    this.rightItemsContainer = append(rightItemsContainer, $30(".cell-contributed-items.cell-contributed-items-right"));
    this.itemsDisposable = this._register(new DisposableStore());
    this.hoverDelegate = new class {
      constructor() {
        this._lastHoverHideTime = 0;
        this.showHover = (options3) => {
          options3.position = options3.position ?? {};
          options3.position.hoverPosition = 3 /* ABOVE */;
          return hoverService.showInstantHover(options3);
        };
        this.placement = "element";
      }
      get delay() {
        return Date.now() - this._lastHoverHideTime < 200 ? 0 : configurationService.getValue("workbench.hover.delay");
      }
      onDidHideHover() {
        this._lastHoverHideTime = Date.now();
      }
    }();
    this._register(this._themeService.onDidColorThemeChange(() => this.currentContext && this.updateContext(this.currentContext)));
    this._register(addDisposableListener(this.statusBarContainer, EventType.CLICK, (e4) => {
      if (e4.target === leftItemsContainer || e4.target === rightItemsContainer || e4.target === this.statusBarContainer) {
        this._onDidClick.fire({
          type: 0 /* Container */,
          event: e4
        });
      } else {
        const target = e4.target;
        let itemHasCommand = false;
        if (target && isHTMLElement(target)) {
          const targetElement = target;
          if (targetElement.classList.contains("cell-status-item-has-command")) {
            itemHasCommand = true;
          } else if (targetElement.parentElement && targetElement.parentElement.classList.contains("cell-status-item-has-command")) {
            itemHasCommand = true;
          }
        }
        if (itemHasCommand) {
          this._onDidClick.fire({
            type: 2 /* ContributedCommandItem */,
            event: e4
          });
        } else {
          this._onDidClick.fire({
            type: 1 /* ContributedTextItem */,
            event: e4
          });
        }
      }
    }));
  }
  didRenderCell(element) {
    if (this._notebookEditor.hasModel()) {
      const context2 = {
        ui: true,
        cell: element,
        notebookEditor: this._notebookEditor,
        $mid: 13 /* NotebookCellActionContext */
      };
      this.updateContext(context2);
    }
    if (this._editor) {
      const updateFocusModeForEditorEvent = () => {
        if (this._editor && (this._editor.hasWidgetFocus() || this.statusBarContainer.ownerDocument.activeElement && this.statusBarContainer.contains(this.statusBarContainer.ownerDocument.activeElement))) {
          element.focusMode = 1 /* Editor */;
        } else {
          const currentMode = element.focusMode;
          if (currentMode === 3 /* ChatInput */) {
            element.focusMode = 3 /* ChatInput */;
          } else if (currentMode === 2 /* Output */ && this._notebookEditor.hasWebviewFocus()) {
            element.focusMode = 2 /* Output */;
          } else {
            element.focusMode = 0 /* Container */;
          }
        }
      };
      this.cellDisposables.add(this._editor.onDidFocusEditorWidget(() => {
        updateFocusModeForEditorEvent();
      }));
      this.cellDisposables.add(this._editor.onDidBlurEditorWidget(() => {
        if (this._notebookEditor.hasEditorFocus() && !(this.statusBarContainer.ownerDocument.activeElement && this.statusBarContainer.contains(this.statusBarContainer.ownerDocument.activeElement))) {
          updateFocusModeForEditorEvent();
        }
      }));
      this.cellDisposables.add(this.onDidClick((e4) => {
        if (this.currentCell instanceof CodeCellViewModel && e4.type !== 2 /* ContributedCommandItem */ && this._editor) {
          const target = this._editor.getTargetAtClientPoint(e4.event.clientX, e4.event.clientY - this._notebookEditor.notebookOptions.computeEditorStatusbarHeight(this.currentCell.internalMetadata, this.currentCell.uri));
          if (target?.position) {
            this._editor.setPosition(target.position);
            this._editor.focus();
          }
        }
      }));
    }
  }
  updateInternalLayoutNow(element) {
    this._cellContainer.classList.toggle("cell-statusbar-hidden", this._notebookEditor.notebookOptions.computeEditorStatusbarHeight(element.internalMetadata, element.uri) === 0);
    const layoutInfo = element.layoutInfo;
    const width2 = layoutInfo.editorWidth;
    if (!width2) {
      return;
    }
    this.width = width2;
    this.statusBarContainer.style.width = `${width2}px`;
    const maxItemWidth = this.getMaxItemWidth();
    this.leftItems.forEach((item) => item.maxWidth = maxItemWidth);
    this.rightItems.forEach((item) => item.maxWidth = maxItemWidth);
  }
  getMaxItemWidth() {
    return this.width / 2;
  }
  updateContext(context2) {
    this.currentContext = context2;
    this.itemsDisposable.clear();
    if (!this.currentContext) {
      return;
    }
    this.itemsDisposable.add(this.currentContext.cell.onDidChangeLayout(() => {
      if (this.currentContext) {
        this.updateInternalLayoutNow(this.currentContext.cell);
      }
    }));
    this.itemsDisposable.add(this.currentContext.cell.onDidChangeCellStatusBarItems(() => this.updateRenderedItems()));
    this.itemsDisposable.add(this.currentContext.notebookEditor.onDidChangeActiveCell(() => this.updateActiveCell()));
    this.updateInternalLayoutNow(this.currentContext.cell);
    this.updateActiveCell();
    this.updateRenderedItems();
  }
  updateActiveCell() {
    const isActiveCell = this.currentContext.notebookEditor.getActiveCell() === this.currentContext?.cell;
    this.statusBarContainer.classList.toggle("is-active-cell", isActiveCell);
  }
  updateRenderedItems() {
    const items = this.currentContext.cell.getCellStatusBarItems();
    items.sort((itemA, itemB) => {
      return (itemB.priority ?? 0) - (itemA.priority ?? 0);
    });
    const maxItemWidth = this.getMaxItemWidth();
    const newLeftItems = items.filter((item) => item.alignment === 1 /* Left */);
    const newRightItems = items.filter((item) => item.alignment === 2 /* Right */).reverse();
    const updateItems = (renderedItems, newItems, container2) => {
      if (renderedItems.length > newItems.length) {
        const deleted = renderedItems.splice(newItems.length, renderedItems.length - newItems.length);
        for (const deletedItem of deleted) {
          deletedItem.container.remove();
          deletedItem.dispose();
        }
      }
      newItems.forEach((newLeftItem, i2) => {
        const existingItem = renderedItems[i2];
        if (existingItem) {
          existingItem.updateItem(newLeftItem, maxItemWidth);
        } else {
          const item = this._instantiationService.createInstance(CellStatusBarItem, this.currentContext, this.hoverDelegate, this._editor, newLeftItem, maxItemWidth);
          renderedItems.push(item);
          container2.appendChild(item.container);
        }
      });
    };
    updateItems(this.leftItems, newLeftItems, this.leftItemsContainer);
    updateItems(this.rightItems, newRightItems, this.rightItemsContainer);
  }
  dispose() {
    super.dispose();
    dispose(this.leftItems);
    dispose(this.rightItems);
  }
};

CellEditorStatusBar = __decorateClass([
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IHoverService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IThemeService)
], CellEditorStatusBar);

var CellStatusBarItem = class extends Disposable {
  constructor(_context, _hoverDelegate, _editor, itemModel, maxWidth, _telemetryService, _commandService, _notificationService, _themeService, _hoverService) {
    super();
    this._context = _context;
    this._hoverDelegate = _hoverDelegate;
    this._editor = _editor;
    this._telemetryService = _telemetryService;
    this._commandService = _commandService;
    this._notificationService = _notificationService;
    this._themeService = _themeService;
    this._hoverService = _hoverService;
    this.container = $30(".cell-status-item");
    this._itemDisposables = this._register(new DisposableStore());
    this.updateItem(itemModel, maxWidth);
  }
  set maxWidth(v2) {
    this.container.style.maxWidth = v2 + "px";
  }
  updateItem(item, maxWidth) {
    this._itemDisposables.clear();
    if (!this._currentItem || this._currentItem.text !== item.text) {
      this._itemDisposables.add(new SimpleIconLabel(this.container)).text = item.text.replace(/\n/g, " ");
    }
    const resolveColor = (color2) => {
      return isThemeColor(color2) ? this._themeService.getColorTheme().getColor(color2.id)?.toString() || "" : color2;
    };
    this.container.style.color = item.color ? resolveColor(item.color) : "";
    this.container.style.backgroundColor = item.backgroundColor ? resolveColor(item.backgroundColor) : "";
    this.container.style.opacity = item.opacity ? item.opacity : "";
    this.container.classList.toggle("cell-status-item-show-when-active", !!item.onlyShowWhenActive);
    if (typeof maxWidth === "number") {
      this.maxWidth = maxWidth;
    }
    let ariaLabel;
    let role;
    if (item.accessibilityInformation) {
      ariaLabel = item.accessibilityInformation.label;
      role = item.accessibilityInformation.role;
    } else {
      ariaLabel = item.text ? stripIcons(item.text).trim() : "";
    }
    this.container.setAttribute("aria-label", ariaLabel);
    this.container.setAttribute("role", role || "");
    if (item.tooltip) {
      const hoverContent2 = typeof item.tooltip === "string" ? item.tooltip : { markdown: item.tooltip, markdownNotSupportedFallback: void 0 };
      this._itemDisposables.add(this._hoverService.setupManagedHover(this._hoverDelegate, this.container, hoverContent2));
    }
    this.container.classList.toggle("cell-status-item-has-command", !!item.command);
    if (item.command) {
      this.container.tabIndex = 0;
      this._itemDisposables.add(addDisposableListener(this.container, EventType.CLICK, (_e) => {
        this.executeCommand();
      }));
      this._itemDisposables.add(addDisposableListener(this.container, EventType.KEY_DOWN, (e4) => {
        const event = new StandardKeyboardEvent(e4);
        if (event.equals(10 /* Space */) || event.equals(3 /* Enter */)) {
          this.executeCommand();
        }
      }));
    } else {
      this.container.removeAttribute("tabIndex");
    }
    this._currentItem = item;
  }
  async executeCommand() {
    const command4 = this._currentItem.command;
    if (!command4) {
      return;
    }
    const id2 = typeof command4 === "string" ? command4 : command4.id;
    const args2 = typeof command4 === "string" ? [] : command4.arguments ?? [];
    if (typeof command4 === "string" || !command4.arguments || !Array.isArray(command4.arguments) || command4.arguments.length === 0) {
      args2.unshift(this._context);
    }
    this._telemetryService.publicLog2("workbenchActionExecuted", { id: id2, from: "cell status bar" });
    try {
      this._editor?.focus();
      await this._commandService.executeCommand(id2, ...args2);
    } catch (error) {
      this._notificationService.error(toErrorMessage(error));
    }
  }
};

CellStatusBarItem = __decorateClass([
  __decorateParam(5, ITelemetryService),
  __decorateParam(6, ICommandService),
  __decorateParam(7, INotificationService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, IHoverService)
], CellStatusBarItem);
export { $30, CellEditorStatusBar, CellStatusBarItem };
