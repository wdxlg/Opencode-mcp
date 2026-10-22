// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/quickinput/browser/tree/quickInputTreeRenderer.ts
import { $, append, isAncestorOfActiveElement, prepend } from "./module-0075.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { TriStateCheckbox, createToggleActionViewItemProvider } from "./module-0549.mjs";
import { defaultCheckboxStyles } from "./module-0513.mjs";
import { IconLabel } from "./module-0640.mjs";
import { ToolBar } from "./module-0503.mjs";
import { isDark } from "./module-0247.mjs";
import { URI } from "./module-0032.mjs";
import { asCSSUrl } from "./module-0449.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { escape } from "./module-0030.mjs";
import { quickInputButtonsToActionArrays } from "./module-1559.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IThemeService } from "./module-0287.mjs";


// src/vs/platform/quickinput/browser/tree/quickInputTreeRenderer.ts
var $19 = $;

var QuickInputCheckboxStateHandler = class extends Disposable {
  constructor() {
    super(...arguments);
    this._onDidChangeCheckboxState = this._register(new Emitter());
    this.onDidChangeCheckboxState = this._onDidChangeCheckboxState.event;
  }
  setCheckboxState(node, checked) {
    this._onDidChangeCheckboxState.fire({ item: node, checked });
  }
};

var QuickInputTreeRenderer = class extends Disposable {
  constructor(_hoverDelegate, _buttonTriggeredEmitter, onCheckedEvent, _checkboxStateHandler, _toggleStyles, _contextMenuService, _themeService) {
    super();
    this._hoverDelegate = _hoverDelegate;
    this._buttonTriggeredEmitter = _buttonTriggeredEmitter;
    this.onCheckedEvent = onCheckedEvent;
    this._checkboxStateHandler = _checkboxStateHandler;
    this._toggleStyles = _toggleStyles;
    this._contextMenuService = _contextMenuService;
    this._themeService = _themeService;
    this.templateId = QuickInputTreeRenderer.ID;
    this._onDidDisposeFocusedElement = this._register(new Emitter());
    /**
     * This event is emitted when the renderer disposes an element that has focus.
     * This allows the list to re-focus itself and prevent focus from being lost
     * (potentially causing quickinput to dismiss itself) when an element is
     * removed while focused.
     */
    this.onDidDisposeFocusedElement = this._onDidDisposeFocusedElement.event;
  }
  static {
    this.ID = "quickInputTreeElement";
  }
  renderTemplate(container2) {
    const store = new DisposableStore();
    const entry = append(container2, $19(".quick-input-tree-entry"));
    const checkbox = store.add(new TriStateCheckbox("", false, { ...defaultCheckboxStyles, size: 15 }));
    entry.appendChild(checkbox.domNode);
    const checkboxLabel = append(entry, $19("label.quick-input-tree-label"));
    const rows = append(checkboxLabel, $19(".quick-input-tree-rows"));
    const row1 = append(rows, $19(".quick-input-tree-row"));
    const icon2 = prepend(row1, $19(".quick-input-tree-icon"));
    const label3 = store.add(new IconLabel(row1, {
      supportHighlights: true,
      supportDescriptionHighlights: true,
      supportIcons: true,
      hoverDelegate: this._hoverDelegate
    }));
    const actionBar3 = store.add(new ToolBar(entry, this._contextMenuService, {
      actionViewItemProvider: createToggleActionViewItemProvider(this._toggleStyles),
      hoverDelegate: this._hoverDelegate,
      icon: true,
      label: false
    }));
    actionBar3.getElement().classList.add("quick-input-tree-entry-action-bar");
    return {
      toDisposeTemplate: store,
      entry,
      checkbox,
      icon: icon2,
      label: label3,
      actionBar: actionBar3,
      toDisposeElement: new DisposableStore()
    };
  }
  renderElement(node, _index, templateData, _details) {
    const store = templateData.toDisposeElement;
    const quickTreeItem = node.element;
    if (quickTreeItem.pickable === false) {
      templateData.checkbox.domNode.style.display = "none";
    } else {
      const checkbox = templateData.checkbox;
      checkbox.domNode.style.display = "";
      checkbox.checked = quickTreeItem.checked ?? false;
      store.add(Event2.filter(this.onCheckedEvent, (e4) => e4.item === quickTreeItem)((e4) => checkbox.checked = e4.checked));
      if (quickTreeItem.disabled) {
        checkbox.disable();
      }
      store.add(checkbox.onChange((e4) => this._checkboxStateHandler.setCheckboxState(quickTreeItem, checkbox.checked)));
    }
    if (quickTreeItem.iconPath) {
      const icon2 = isDark(this._themeService.getColorTheme().type) ? quickTreeItem.iconPath.dark : quickTreeItem.iconPath.light ?? quickTreeItem.iconPath.dark;
      const iconUrl = URI.revive(icon2);
      templateData.icon.className = "quick-input-tree-icon";
      templateData.icon.style.backgroundImage = asCSSUrl(iconUrl);
    } else {
      templateData.icon.style.backgroundImage = "";
      templateData.icon.className = quickTreeItem.iconClass ? `quick-input-tree-icon ${quickTreeItem.iconClass}` : "";
    }
    templateData.icon.style.color = quickTreeItem.iconColor ? asCssVariable(quickTreeItem.iconColor.id) : "";
    const { labelHighlights: matches2, descriptionHighlights: descriptionMatches } = node.filterData || {};
    let descriptionTitle;
    if (quickTreeItem.description) {
      descriptionTitle = {
        markdown: {
          value: escape(quickTreeItem.description),
          supportThemeIcons: true
        },
        markdownNotSupportedFallback: quickTreeItem.description
      };
    }
    templateData.label.setLabel(
      quickTreeItem.label,
      quickTreeItem.description,
      {
        matches: matches2,
        descriptionMatches,
        extraClasses: quickTreeItem.iconClasses,
        italic: quickTreeItem.italic,
        strikethrough: quickTreeItem.strikethrough,
        labelEscapeNewLines: true,
        descriptionTitle
      }
    );
    const buttons = quickTreeItem.buttons;
    if (buttons && buttons.length) {
      const { primary, secondary } = quickInputButtonsToActionArrays(
        buttons,
        "quick-input-tree",
        (button) => this._buttonTriggeredEmitter.fire({ item: quickTreeItem, button })
      );
      templateData.actionBar.setActions(primary, secondary);
      templateData.entry.classList.add("has-actions");
    } else {
      templateData.actionBar.setActions([]);
      templateData.entry.classList.remove("has-actions");
    }
  }
  disposeElement(_element, _index, templateData, _details) {
    if (isAncestorOfActiveElement(templateData.entry)) {
      this._onDidDisposeFocusedElement.fire();
    }
    templateData.toDisposeElement.clear();
    templateData.actionBar.setActions([]);
  }
  disposeTemplate(templateData) {
    templateData.toDisposeElement.dispose();
    templateData.toDisposeTemplate.dispose();
  }
};

QuickInputTreeRenderer = __decorateClass([
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, IThemeService)
], QuickInputTreeRenderer);
export { $19, QuickInputCheckboxStateHandler, QuickInputTreeRenderer };
