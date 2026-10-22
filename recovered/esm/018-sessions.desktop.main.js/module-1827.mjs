// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/preferences/browser/settingsWidgets.ts
import { $, EventHelper, EventType, addDisposableListener, addStandardDisposableListener, append, clearNode, findParentWithClass, isAncestorOfActiveElement } from "./module-0075.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { defaultButtonStyles, getInputBoxStyle, getSelectBoxStyles } from "./module-0513.mjs";
import { settingsSelectBackground, settingsSelectBorder, settingsSelectForeground, settingsSelectListBorder, settingsTextInputBackground, settingsTextInputBorder, settingsTextInputForeground } from "./module-1815.mjs";
import { SelectBox } from "./module-0475.mjs";
import { hasNativeContextMenu } from "./module-0515.mjs";
import { isIOS } from "./module-0014.mjs";
import { BrowserFeatures } from "./module-0020.mjs";
import { ActionBar } from "./module-0477.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { Button } from "./module-0546.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { settingsDiscardIcon, settingsEditIcon, settingsRemoveIcon } from "./module-1810.mjs";
import { applyDragImage } from "./module-0458.mjs";
import { isDefined, isUndefinedOrNull } from "./module-0010.mjs";
import { InputBox } from "./module-0600.mjs";
import { localize } from "./module-0001.mjs";
import { IHoverService } from "./module-0520.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { validatePropertyName } from "./module-1590.mjs";
import { Toggle, unthemedToggleStyles } from "./module-0549.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/contrib/preferences/browser/settingsWidgets.ts
var $25 = $;

var ListSettingListModel = class {
  constructor(newItem) {
    this._dataItems = [];
    this._editKey = null;
    this._selectedIdx = null;
    this._newDataItem = newItem;
  }
  get items() {
    const items = this._dataItems.map((item, i2) => {
      const editing = typeof this._editKey === "number" && this._editKey === i2;
      return {
        ...item,
        editing,
        selected: i2 === this._selectedIdx || editing
      };
    });
    if (this._editKey === "create") {
      items.push({
        editing: true,
        selected: true,
        ...this._newDataItem
      });
    }
    return items;
  }
  setEditKey(key3) {
    this._editKey = key3;
  }
  setValue(listData) {
    this._dataItems = listData;
  }
  select(idx) {
    this._selectedIdx = idx;
  }
  getSelected() {
    return this._selectedIdx;
  }
  selectNext() {
    if (typeof this._selectedIdx === "number") {
      this._selectedIdx = Math.min(this._selectedIdx + 1, this._dataItems.length - 1);
    } else {
      this._selectedIdx = 0;
    }
  }
  selectPrevious() {
    if (typeof this._selectedIdx === "number") {
      this._selectedIdx = Math.max(this._selectedIdx - 1, 0);
    } else {
      this._selectedIdx = 0;
    }
  }
};

var AbstractListSettingWidget = class extends Disposable {
  constructor(container2, themeService, contextViewService, configurationService) {
    super();
    this.container = container2;
    this.themeService = themeService;
    this.contextViewService = contextViewService;
    this.configurationService = configurationService;
    this.rowElements = [];
    this._onDidChangeList = this._register(new Emitter());
    this.model = new ListSettingListModel(this.getEmptyItem());
    this.listDisposables = this._register(new DisposableStore());
    this.onDidChangeList = this._onDidChangeList.event;
    this.listElement = append(container2, $25("div"));
    this.listElement.setAttribute("role", "list");
    this.getContainerClasses().forEach((c) => this.listElement.classList.add(c));
    append(container2, this.renderAddButton());
    this.renderList();
    this._register(addDisposableListener(this.listElement, EventType.POINTER_DOWN, (e4) => this.onListClick(e4)));
    this._register(addDisposableListener(this.listElement, EventType.DBLCLICK, (e4) => this.onListDoubleClick(e4)));
    this._register(addStandardDisposableListener(this.listElement, "keydown", (e4) => {
      if (e4.equals(16 /* UpArrow */)) {
        this.selectPreviousRow();
      } else if (e4.equals(18 /* DownArrow */)) {
        this.selectNextRow();
      } else {
        return;
      }
      e4.preventDefault();
      e4.stopPropagation();
    }));
  }
  get domNode() {
    return this.listElement;
  }
  get items() {
    return this.model.items;
  }
  get isReadOnly() {
    return false;
  }
  setValue(listData) {
    this.model.setValue(listData);
    this.renderList();
  }
  renderHeader() {
    return;
  }
  isAddButtonVisible() {
    return true;
  }
  renderList() {
    const focused = isAncestorOfActiveElement(this.listElement);
    clearNode(this.listElement);
    this.listDisposables.clear();
    const newMode = this.model.items.some((item) => !!(item.editing && this.isItemNew(item)));
    this.container.classList.toggle("setting-list-hide-add-button", !this.isAddButtonVisible() || newMode);
    if (this.model.items.length) {
      this.listElement.tabIndex = 0;
    } else {
      this.listElement.removeAttribute("tabIndex");
    }
    const header2 = this.renderHeader();
    if (header2) {
      this.listElement.appendChild(header2);
    }
    this.rowElements = this.model.items.map((item, i2) => this.renderDataOrEditItem(item, i2, focused));
    this.rowElements.forEach((rowElement) => this.listElement.appendChild(rowElement));
  }
  createBasicSelectBox(value2) {
    const selectBoxOptions = value2.options.map(({ value: value3, description }) => ({ text: value3, description }));
    const selected = value2.options.findIndex((option2) => value2.data === option2.value);
    const styles = getSelectBoxStyles({
      selectBackground: settingsSelectBackground,
      selectForeground: settingsSelectForeground,
      selectBorder: settingsSelectBorder,
      selectListBorder: settingsSelectListBorder
    });
    const selectBox = new SelectBox(selectBoxOptions, selected, this.contextViewService, styles, {
      useCustomDrawn: !hasNativeContextMenu(this.configurationService) || !(isIOS && BrowserFeatures.pointerEvents)
    });
    return selectBox;
  }
  editSetting(idx) {
    this.model.setEditKey(idx);
    this.renderList();
  }
  cancelEdit() {
    this.model.setEditKey("none");
    this.renderList();
  }
  handleItemChange(originalItem, changedItem, idx) {
    this.model.setEditKey("none");
    if (this.isItemNew(originalItem)) {
      this._onDidChangeList.fire({
        type: "add",
        newItem: changedItem,
        targetIndex: idx
      });
    } else {
      this._onDidChangeList.fire({
        type: "change",
        originalItem,
        newItem: changedItem,
        targetIndex: idx
      });
    }
    this.renderList();
  }
  renderDataOrEditItem(item, idx, listFocused) {
    const rowElement = item.editing ? this.renderEdit(item, idx) : this.renderDataItem(item, idx, listFocused);
    rowElement.setAttribute("role", "listitem");
    return rowElement;
  }
  renderDataItem(item, idx, listFocused) {
    const rowElementGroup = this.renderItem(item, idx);
    const rowElement = rowElementGroup.rowElement;
    rowElement.setAttribute("data-index", idx + "");
    rowElement.setAttribute("tabindex", item.selected ? "0" : "-1");
    rowElement.classList.toggle("selected", item.selected);
    const actionBar3 = new ActionBar(rowElement);
    this.listDisposables.add(actionBar3);
    actionBar3.push(this.getActionsForItem(item, idx), { icon: true, label: true });
    this.addTooltipsToRow(rowElementGroup, item);
    if (item.selected && listFocused) {
      disposableTimeout(() => rowElement.focus(), void 0, this.listDisposables);
    }
    this.listDisposables.add(addDisposableListener(rowElement, "click", (e4) => {
      e4.stopPropagation();
    }));
    return rowElement;
  }
  renderAddButton() {
    const rowElement = $25(".setting-list-new-row");
    const startAddButton = this._register(new Button(rowElement, defaultButtonStyles));
    startAddButton.label = this.getLocalizedStrings().addButtonLabel;
    startAddButton.element.classList.add("setting-list-addButton");
    this._register(startAddButton.onDidClick(() => {
      this.model.setEditKey("create");
      this.renderList();
    }));
    return rowElement;
  }
  onListClick(e4) {
    const targetIdx = this.getClickedItemIndex(e4);
    if (targetIdx < 0) {
      return;
    }
    e4.preventDefault();
    e4.stopImmediatePropagation();
    if (this.model.getSelected() === targetIdx) {
      return;
    }
    this.selectRow(targetIdx);
  }
  onListDoubleClick(e4) {
    const targetIdx = this.getClickedItemIndex(e4);
    if (targetIdx < 0) {
      return;
    }
    if (this.isReadOnly) {
      return;
    }
    const item = this.model.items[targetIdx];
    if (item) {
      this.editSetting(targetIdx);
      e4.preventDefault();
      e4.stopPropagation();
    }
  }
  getClickedItemIndex(e4) {
    if (!e4.target) {
      return -1;
    }
    const actionbar = findParentWithClass(e4.target, "monaco-action-bar");
    if (actionbar) {
      return -1;
    }
    const element = findParentWithClass(e4.target, "setting-list-row");
    if (!element) {
      return -1;
    }
    const targetIdxStr = element.getAttribute("data-index");
    if (!targetIdxStr) {
      return -1;
    }
    const targetIdx = parseInt(targetIdxStr);
    return targetIdx;
  }
  selectRow(idx) {
    this.model.select(idx);
    this.rowElements.forEach((row) => row.classList.remove("selected"));
    const selectedRow = this.rowElements[this.model.getSelected()];
    selectedRow.classList.add("selected");
    selectedRow.focus();
  }
  selectNextRow() {
    this.model.selectNext();
    this.selectRow(this.model.getSelected());
  }
  selectPreviousRow() {
    this.model.selectPrevious();
    this.selectRow(this.model.getSelected());
  }
};

AbstractListSettingWidget = __decorateClass([
  __decorateParam(1, IThemeService),
  __decorateParam(2, IContextViewService),
  __decorateParam(3, IConfigurationService)
], AbstractListSettingWidget);

var ListSettingWidget = class extends AbstractListSettingWidget {
  constructor(container2, themeService, contextViewService, hoverService, configurationService) {
    super(container2, themeService, contextViewService, configurationService);
    this.hoverService = hoverService;
    this.showAddButton = true;
    this.isEditable = true;
  }
  setValue(listData, options3) {
    this.keyValueSuggester = options3?.keySuggester;
    this.isEditable = options3?.isReadOnly === void 0 ? true : !options3.isReadOnly;
    this.showAddButton = this.isEditable ? options3?.showAddButton ?? true : false;
    super.setValue(listData);
  }
  getEmptyItem() {
    return {
      value: {
        type: "string",
        data: ""
      }
    };
  }
  isAddButtonVisible() {
    return this.showAddButton;
  }
  getContainerClasses() {
    return ["setting-list-widget"];
  }
  getActionsForItem(item, idx) {
    if (this.isReadOnly) {
      return [];
    }
    return [
      {
        class: ThemeIcon.asClassName(settingsEditIcon),
        enabled: true,
        id: "workbench.action.editListItem",
        tooltip: this.getLocalizedStrings().editActionTooltip,
        run: () => this.editSetting(idx)
      },
      {
        class: ThemeIcon.asClassName(settingsRemoveIcon),
        enabled: true,
        id: "workbench.action.removeListItem",
        tooltip: this.getLocalizedStrings().deleteActionTooltip,
        run: () => this._onDidChangeList.fire({ type: "remove", originalItem: item, targetIndex: idx })
      }
    ];
  }
  renderItem(item, idx) {
    const rowElement = $25(".setting-list-row");
    const valueElement = append(rowElement, $25(".setting-list-value"));
    const siblingElement = append(rowElement, $25(".setting-list-sibling"));
    valueElement.textContent = item.value.data.toString();
    if (item.sibling) {
      siblingElement.textContent = `when: ${item.sibling}`;
    } else {
      siblingElement.textContent = null;
      valueElement.classList.add("no-sibling");
    }
    this.addDragAndDrop(rowElement, item, idx);
    return { rowElement, keyElement: valueElement, valueElement: siblingElement };
  }
  addDragAndDrop(rowElement, item, idx) {
    if (this.model.items.every((item2) => !item2.editing)) {
      rowElement.draggable = true;
      rowElement.classList.add("draggable");
    } else {
      rowElement.draggable = false;
      rowElement.classList.remove("draggable");
    }
    this.listDisposables.add(addDisposableListener(rowElement, EventType.DRAG_START, (ev) => {
      this.dragDetails = {
        element: rowElement,
        item,
        itemIndex: idx
      };
      applyDragImage(ev, rowElement, item.value.data);
    }));
    this.listDisposables.add(addDisposableListener(rowElement, EventType.DRAG_OVER, (ev) => {
      if (!this.dragDetails) {
        return false;
      }
      ev.preventDefault();
      if (ev.dataTransfer) {
        ev.dataTransfer.dropEffect = "move";
      }
      return true;
    }));
    let counter = 0;
    this.listDisposables.add(addDisposableListener(rowElement, EventType.DRAG_ENTER, (ev) => {
      counter++;
      rowElement.classList.add("drag-hover");
    }));
    this.listDisposables.add(addDisposableListener(rowElement, EventType.DRAG_LEAVE, (ev) => {
      counter--;
      if (!counter) {
        rowElement.classList.remove("drag-hover");
      }
    }));
    this.listDisposables.add(addDisposableListener(rowElement, EventType.DROP, (ev) => {
      if (!this.dragDetails) {
        return false;
      }
      ev.preventDefault();
      counter = 0;
      if (this.dragDetails.element !== rowElement) {
        this._onDidChangeList.fire({
          type: "move",
          originalItem: this.dragDetails.item,
          sourceIndex: this.dragDetails.itemIndex,
          newItem: item,
          targetIndex: idx
        });
      }
      return true;
    }));
    this.listDisposables.add(addDisposableListener(rowElement, EventType.DRAG_END, (ev) => {
      counter = 0;
      rowElement.classList.remove("drag-hover");
      ev.dataTransfer?.clearData();
      if (this.dragDetails) {
        this.dragDetails = void 0;
      }
    }));
  }
  renderEdit(item, idx) {
    const rowElement = $25(".setting-list-edit-row");
    let valueInput;
    let currentDisplayValue;
    let currentEnumOptions;
    if (this.keyValueSuggester) {
      const enumData = this.keyValueSuggester(this.model.items.map(({ value: { data } }) => data), idx);
      item = {
        ...item,
        value: {
          type: "enum",
          data: item.value.data,
          options: enumData ? enumData.options : []
        }
      };
    }
    switch (item.value.type) {
      case "string":
        valueInput = this.renderInputBox(item.value, rowElement);
        break;
      case "enum":
        valueInput = this.renderDropdown(item.value, rowElement);
        currentEnumOptions = item.value.options;
        if (item.value.options.length) {
          currentDisplayValue = this.isItemNew(item) ? currentEnumOptions[0].value : item.value.data;
        }
        break;
    }
    const updatedInputBoxItem = () => {
      const inputBox = valueInput;
      return {
        value: {
          type: "string",
          data: inputBox.value
        },
        sibling: siblingInput?.value
      };
    };
    const updatedSelectBoxItem = (selectedValue) => {
      return {
        value: {
          type: "enum",
          data: selectedValue,
          options: currentEnumOptions ?? []
        }
      };
    };
    const onKeyDown = (e4) => {
      if (e4.equals(3 /* Enter */)) {
        this.handleItemChange(item, updatedInputBoxItem(), idx);
      } else if (e4.equals(9 /* Escape */)) {
        this.cancelEdit();
        e4.preventDefault();
        e4.stopPropagation();
      }
      rowElement?.focus();
    };
    if (item.value.type !== "string") {
      const selectBox = valueInput;
      this.listDisposables.add(
        selectBox.onDidSelect(({ selected }) => {
          currentDisplayValue = selected;
        })
      );
    } else {
      const inputBox = valueInput;
      this.listDisposables.add(
        addStandardDisposableListener(inputBox.inputElement, EventType.KEY_DOWN, onKeyDown)
      );
    }
    let siblingInput;
    if (!isUndefinedOrNull(item.sibling)) {
      siblingInput = new InputBox(rowElement, this.contextViewService, {
        placeholder: this.getLocalizedStrings().siblingInputPlaceholder,
        inputBoxStyles: getInputBoxStyle({
          inputBackground: settingsTextInputBackground,
          inputForeground: settingsTextInputForeground,
          inputBorder: settingsTextInputBorder
        })
      });
      siblingInput.element.classList.add("setting-list-siblingInput");
      this.listDisposables.add(siblingInput);
      siblingInput.value = item.sibling;
      this.listDisposables.add(
        addStandardDisposableListener(siblingInput.inputElement, EventType.KEY_DOWN, onKeyDown)
      );
    } else if (valueInput instanceof InputBox) {
      valueInput.element.classList.add("no-sibling");
    }
    const okButton = this.listDisposables.add(new Button(rowElement, defaultButtonStyles));
    okButton.label = localize(18369, null);
    okButton.element.classList.add("setting-list-ok-button");
    this.listDisposables.add(okButton.onDidClick(() => {
      if (item.value.type === "string") {
        this.handleItemChange(item, updatedInputBoxItem(), idx);
      } else {
        this.handleItemChange(item, updatedSelectBoxItem(currentDisplayValue), idx);
      }
    }));
    const cancelButton = this.listDisposables.add(new Button(rowElement, { secondary: true, ...defaultButtonStyles }));
    cancelButton.label = localize(18346, null);
    cancelButton.element.classList.add("setting-list-cancel-button");
    this.listDisposables.add(cancelButton.onDidClick(() => this.cancelEdit()));
    this.listDisposables.add(
      disposableTimeout(() => {
        valueInput.focus();
        if (valueInput instanceof InputBox) {
          valueInput.select();
        }
      })
    );
    return rowElement;
  }
  isItemNew(item) {
    return item.value.data === "";
  }
  addTooltipsToRow(rowElementGroup, { value: value2, sibling }) {
    const title = isUndefinedOrNull(sibling) ? localize(18362, null, value2.data) : localize(18360, null, value2.data, sibling);
    const { rowElement } = rowElementGroup;
    this.listDisposables.add(this.hoverService.setupDelayedHover(rowElement, { content: title }));
    rowElement.setAttribute("aria-label", title);
  }
  getLocalizedStrings() {
    return {
      deleteActionTooltip: localize(18372, null),
      editActionTooltip: localize(18349, null),
      addButtonLabel: localize(18344, null),
      inputPlaceholder: localize(18359, null),
      siblingInputPlaceholder: localize(18361, null)
    };
  }
  renderInputBox(value2, rowElement) {
    const valueInput = new InputBox(rowElement, this.contextViewService, {
      placeholder: this.getLocalizedStrings().inputPlaceholder,
      inputBoxStyles: getInputBoxStyle({
        inputBackground: settingsTextInputBackground,
        inputForeground: settingsTextInputForeground,
        inputBorder: settingsTextInputBorder
      })
    });
    valueInput.element.classList.add("setting-list-valueInput");
    this.listDisposables.add(valueInput);
    valueInput.value = value2.data.toString();
    return valueInput;
  }
  renderDropdown(value2, rowElement) {
    if (value2.type !== "enum") {
      throw new Error("Valuetype must be enum.");
    }
    const selectBox = this.createBasicSelectBox(value2);
    const wrapper = $25(".setting-list-object-list-row");
    selectBox.render(wrapper);
    rowElement.appendChild(wrapper);
    return selectBox;
  }
};

ListSettingWidget = __decorateClass([
  __decorateParam(1, IThemeService),
  __decorateParam(2, IContextViewService),
  __decorateParam(3, IHoverService),
  __decorateParam(4, IConfigurationService)
], ListSettingWidget);

var ExcludeSettingWidget = class extends ListSettingWidget {
  getContainerClasses() {
    return ["setting-list-include-exclude-widget"];
  }
  addDragAndDrop(rowElement, item, idx) {
    return;
  }
  addTooltipsToRow(rowElementGroup, item) {
    let title = isUndefinedOrNull(item.sibling) ? localize(18351, null, item.value.data) : localize(18353, null, item.value.data, item.sibling);
    if (item.source) {
      title += localize(18350, null, item.source);
    }
    const markdownTitle = new MarkdownString().appendMarkdown(title);
    const { rowElement } = rowElementGroup;
    this.listDisposables.add(this.hoverService.setupDelayedHover(rowElement, { content: markdownTitle }));
    rowElement.setAttribute("aria-label", title);
  }
  getLocalizedStrings() {
    return {
      deleteActionTooltip: localize(18370, null),
      editActionTooltip: localize(18347, null),
      addButtonLabel: localize(18345, null),
      inputPlaceholder: localize(18352, null),
      siblingInputPlaceholder: localize(18354, null)
    };
  }
};

var IncludeSettingWidget = class extends ListSettingWidget {
  getContainerClasses() {
    return ["setting-list-include-exclude-widget"];
  }
  addDragAndDrop(rowElement, item, idx) {
    return;
  }
  addTooltipsToRow(rowElementGroup, item) {
    let title = isUndefinedOrNull(item.sibling) ? localize(18355, null, item.value.data) : localize(18357, null, item.value.data, item.sibling);
    if (item.source) {
      title += localize(18350, null, item.source);
    }
    const markdownTitle = new MarkdownString().appendMarkdown(title);
    const { rowElement } = rowElementGroup;
    this.listDisposables.add(this.hoverService.setupDelayedHover(rowElement, { content: markdownTitle }));
    rowElement.setAttribute("aria-label", title);
  }
  getLocalizedStrings() {
    return {
      deleteActionTooltip: localize(18371, null),
      editActionTooltip: localize(18348, null),
      addButtonLabel: localize(18345, null),
      inputPlaceholder: localize(18356, null),
      siblingInputPlaceholder: localize(18358, null)
    };
  }
};

var ObjectSettingDropdownWidget = class extends AbstractListSettingWidget {
  constructor(container2, themeService, contextViewService, hoverService, configurationService) {
    super(container2, themeService, contextViewService, configurationService);
    this.hoverService = hoverService;
    this.editable = true;
    this.currentSettingKey = "";
    this.showAddButton = true;
    this.keySuggester = () => void 0;
    this.valueSuggester = () => void 0;
  }
  setValue(listData, options3) {
    this.editable = !options3?.isReadOnly;
    this.showAddButton = options3?.showAddButton ?? this.showAddButton;
    this.keySuggester = options3?.keySuggester ?? this.keySuggester;
    this.valueSuggester = options3?.valueSuggester ?? this.valueSuggester;
    this.propertyNames = options3?.propertyNames;
    if (isDefined(options3) && options3.settingKey !== this.currentSettingKey) {
      this.model.setEditKey("none");
      this.model.select(null);
      this.currentSettingKey = options3.settingKey;
    }
    super.setValue(listData);
  }
  isItemNew(item) {
    return item.key.data === "" && item.value.data === "";
  }
  isAddButtonVisible() {
    return this.showAddButton;
  }
  get isReadOnly() {
    return !this.editable;
  }
  getEmptyItem() {
    return {
      key: { type: "string", data: "" },
      value: { type: "string", data: "" },
      removable: true,
      resetable: false
    };
  }
  getContainerClasses() {
    return ["setting-list-object-widget"];
  }
  getActionsForItem(item, idx) {
    if (this.isReadOnly) {
      return [];
    }
    const actions = [
      {
        class: ThemeIcon.asClassName(settingsEditIcon),
        enabled: true,
        id: "workbench.action.editListItem",
        label: "",
        tooltip: this.getLocalizedStrings().editActionTooltip,
        run: () => this.editSetting(idx)
      }
    ];
    if (item.resetable) {
      actions.push({
        class: ThemeIcon.asClassName(settingsDiscardIcon),
        enabled: true,
        id: "workbench.action.resetListItem",
        label: "",
        tooltip: this.getLocalizedStrings().resetActionTooltip,
        run: () => this._onDidChangeList.fire({ type: "reset", originalItem: item, targetIndex: idx })
      });
    }
    if (item.removable) {
      actions.push({
        class: ThemeIcon.asClassName(settingsRemoveIcon),
        enabled: true,
        id: "workbench.action.removeListItem",
        label: "",
        tooltip: this.getLocalizedStrings().deleteActionTooltip,
        run: () => this._onDidChangeList.fire({ type: "remove", originalItem: item, targetIndex: idx })
      });
    }
    return actions;
  }
  renderHeader() {
    const header2 = $25(".setting-list-row-header");
    const keyHeader = append(header2, $25(".setting-list-object-key"));
    const valueHeader = append(header2, $25(".setting-list-object-value"));
    const { keyHeaderText, valueHeaderText } = this.getLocalizedStrings();
    keyHeader.textContent = keyHeaderText;
    valueHeader.textContent = valueHeaderText;
    return header2;
  }
  renderItem(item, idx) {
    const rowElement = $25(".setting-list-row");
    rowElement.classList.add("setting-list-object-row");
    if (this.propertyNames && item.key.data && !validatePropertyName(this.propertyNames, item.key.data)) {
      rowElement.classList.add("invalid-key");
    }
    const keyElement = append(rowElement, $25(".setting-list-object-key"));
    const valueElement = append(rowElement, $25(".setting-list-object-value"));
    keyElement.textContent = item.key.data;
    valueElement.textContent = item.value.data.toString();
    return { rowElement, keyElement, valueElement };
  }
  renderEdit(item, idx) {
    const rowElement = $25(".setting-list-edit-row.setting-list-object-row");
    const changedItem = { ...item };
    const onKeyChange = (key3) => {
      changedItem.key = key3;
      okButton.enabled = key3.data !== "";
      const suggestedValue = this.valueSuggester(key3.data) ?? item.value;
      if (this.shouldUseSuggestion(item.value, changedItem.value, suggestedValue)) {
        onValueChange(suggestedValue);
        renderLatestValue();
      }
    };
    const onValueChange = (value2) => {
      changedItem.value = value2;
    };
    let keyWidget;
    let keyElement;
    if (this.showAddButton) {
      if (this.isItemNew(item)) {
        const suggestedKey = this.keySuggester(this.model.items.map(({ key: { data } }) => data));
        if (isDefined(suggestedKey)) {
          changedItem.key = suggestedKey;
          const suggestedValue = this.valueSuggester(changedItem.key.data);
          onValueChange(suggestedValue ?? changedItem.value);
        }
      }
      const { widget, element } = this.renderEditWidget(changedItem.key, {
        idx,
        isKey: true,
        originalItem: item,
        changedItem,
        update: onKeyChange
      });
      keyWidget = widget;
      keyElement = element;
    } else {
      keyElement = $25(".setting-list-object-key");
      keyElement.textContent = item.key.data;
    }
    let valueWidget;
    const valueContainer = $25(".setting-list-object-value-container");
    const renderLatestValue = () => {
      const { widget, element } = this.renderEditWidget(changedItem.value, {
        idx,
        isKey: false,
        originalItem: item,
        changedItem,
        update: onValueChange
      });
      valueWidget = widget;
      clearNode(valueContainer);
      valueContainer.append(element);
    };
    renderLatestValue();
    rowElement.append(keyElement, valueContainer);
    const okButton = this.listDisposables.add(new Button(rowElement, defaultButtonStyles));
    okButton.enabled = changedItem.key.data !== "";
    okButton.label = localize(18369, null);
    okButton.element.classList.add("setting-list-ok-button");
    this.listDisposables.add(okButton.onDidClick(() => this.handleItemChange(item, changedItem, idx)));
    const cancelButton = this.listDisposables.add(new Button(rowElement, { secondary: true, ...defaultButtonStyles }));
    cancelButton.label = localize(18346, null);
    cancelButton.element.classList.add("setting-list-cancel-button");
    this.listDisposables.add(cancelButton.onDidClick(() => this.cancelEdit()));
    this.listDisposables.add(
      disposableTimeout(() => {
        const widget = keyWidget ?? valueWidget;
        widget.focus();
        if (widget instanceof InputBox) {
          widget.select();
        }
      })
    );
    return rowElement;
  }
  renderEditWidget(keyOrValue, options3) {
    switch (keyOrValue.type) {
      case "string":
        return this.renderStringEditWidget(keyOrValue, options3);
      case "enum":
        return this.renderEnumEditWidget(keyOrValue, options3);
      case "boolean":
        return this.renderEnumEditWidget(
          {
            type: "enum",
            data: keyOrValue.data.toString(),
            options: [{ value: "true" }, { value: "false" }]
          },
          options3
        );
    }
  }
  renderStringEditWidget(keyOrValue, { idx, isKey, originalItem, changedItem, update }) {
    const wrapper = $25(isKey ? ".setting-list-object-input-key" : ".setting-list-object-input-value");
    const inputBox = new InputBox(wrapper, this.contextViewService, {
      placeholder: isKey ? localize(18364, null) : localize(18368, null),
      inputBoxStyles: getInputBoxStyle({
        inputBackground: settingsTextInputBackground,
        inputForeground: settingsTextInputForeground,
        inputBorder: settingsTextInputBorder
      })
    });
    inputBox.element.classList.add("setting-list-object-input");
    this.listDisposables.add(inputBox);
    inputBox.value = keyOrValue.data;
    this.listDisposables.add(inputBox.onDidChange((value2) => update({ ...keyOrValue, data: value2 })));
    const onKeyDown = (e4) => {
      if (e4.equals(3 /* Enter */)) {
        this.handleItemChange(originalItem, changedItem, idx);
      } else if (e4.equals(9 /* Escape */)) {
        this.cancelEdit();
        e4.preventDefault();
        e4.stopPropagation();
      }
    };
    this.listDisposables.add(
      addStandardDisposableListener(inputBox.inputElement, EventType.KEY_DOWN, onKeyDown)
    );
    return { widget: inputBox, element: wrapper };
  }
  renderEnumEditWidget(keyOrValue, { isKey, changedItem, update }) {
    const selectBox = this.createBasicSelectBox(keyOrValue);
    const changedKeyOrValue = isKey ? changedItem.key : changedItem.value;
    this.listDisposables.add(
      selectBox.onDidSelect(
        ({ selected: selected2 }) => update(
          changedKeyOrValue.type === "boolean" ? { ...changedKeyOrValue, data: selected2 === "true" ? true : false } : { ...changedKeyOrValue, data: selected2 }
        )
      )
    );
    const wrapper = $25(".setting-list-object-input");
    wrapper.classList.add(
      isKey ? "setting-list-object-input-key" : "setting-list-object-input-value"
    );
    selectBox.render(wrapper);
    const selected = keyOrValue.options.findIndex((option2) => keyOrValue.data === option2.value);
    if (selected === -1 && keyOrValue.options.length) {
      update(
        changedKeyOrValue.type === "boolean" ? { ...changedKeyOrValue, data: true } : { ...changedKeyOrValue, data: keyOrValue.options[0].value }
      );
    } else if (changedKeyOrValue.type === "boolean") {
      update({ ...changedKeyOrValue, data: keyOrValue.data === "true" });
    }
    return { widget: selectBox, element: wrapper };
  }
  shouldUseSuggestion(originalValue, previousValue, newValue) {
    if (newValue.type !== "enum" && newValue.type === previousValue.type && newValue.data === previousValue.data) {
      return false;
    }
    if (originalValue.data === "") {
      return true;
    }
    if (previousValue.type === newValue.type && newValue.type !== "enum") {
      return false;
    }
    if (previousValue.type === "enum" && newValue.type === "enum") {
      const previousEnums = new Set(previousValue.options.map(({ value: value2 }) => value2));
      newValue.options.forEach(({ value: value2 }) => previousEnums.delete(value2));
      if (previousEnums.size === 0) {
        return false;
      }
    }
    return true;
  }
  addTooltipsToRow(rowElementGroup, item) {
    const { keyElement, valueElement, rowElement } = rowElementGroup;
    let accessibleDescription;
    if (item.source) {
      accessibleDescription = localize(18366, null, item.key.data, item.value.data, item.source);
    } else {
      accessibleDescription = localize(18365, null, item.key.data, item.value.data);
    }
    const markdownString = new MarkdownString().appendMarkdown(accessibleDescription);
    const keyDescription = this.getEnumDescription(item.key) ?? item.keyDescription ?? markdownString;
    this.listDisposables.add(this.hoverService.setupDelayedHover(keyElement, { content: keyDescription }));
    const valueDescription = this.getEnumDescription(item.value) ?? markdownString;
    this.listDisposables.add(this.hoverService.setupDelayedHover(valueElement, { content: valueDescription }));
    rowElement.setAttribute("aria-label", accessibleDescription);
  }
  getEnumDescription(keyOrValue) {
    const enumDescription = keyOrValue.type === "enum" ? keyOrValue.options.find(({ value: value2 }) => keyOrValue.data === value2)?.description : void 0;
    return enumDescription;
  }
  getLocalizedStrings() {
    return {
      deleteActionTooltip: localize(18372, null),
      resetActionTooltip: localize(18373, null),
      editActionTooltip: localize(18349, null),
      addButtonLabel: localize(18344, null),
      keyHeaderText: localize(18363, null),
      valueHeaderText: localize(18367, null)
    };
  }
};

ObjectSettingDropdownWidget = __decorateClass([
  __decorateParam(1, IThemeService),
  __decorateParam(2, IContextViewService),
  __decorateParam(3, IHoverService),
  __decorateParam(4, IConfigurationService)
], ObjectSettingDropdownWidget);

var ObjectSettingCheckboxWidget = class extends AbstractListSettingWidget {
  constructor(container2, themeService, contextViewService, hoverService, configurationService) {
    super(container2, themeService, contextViewService, configurationService);
    this.hoverService = hoverService;
    this.currentSettingKey = "";
  }
  setValue(listData, options3) {
    if (isDefined(options3) && options3.settingKey !== this.currentSettingKey) {
      this.model.setEditKey("none");
      this.model.select(null);
      this.currentSettingKey = options3.settingKey;
    }
    super.setValue(listData);
  }
  isItemNew(item) {
    return !item.key.data && !item.value.data;
  }
  getEmptyItem() {
    return {
      key: { type: "string", data: "" },
      value: { type: "boolean", data: false },
      removable: false,
      resetable: true
    };
  }
  getContainerClasses() {
    return ["setting-list-object-widget"];
  }
  getActionsForItem(item, idx) {
    return [];
  }
  isAddButtonVisible() {
    return false;
  }
  renderHeader() {
    return void 0;
  }
  renderDataOrEditItem(item, idx, listFocused) {
    const rowElement = this.renderEdit(item, idx);
    rowElement.setAttribute("role", "listitem");
    return rowElement;
  }
  renderItem(item, idx) {
    const rowElement = $25(".blank-row");
    const keyElement = $25(".blank-row-key");
    return { rowElement, keyElement };
  }
  renderEdit(item, idx) {
    const rowElement = $25(".setting-list-edit-row.setting-list-object-row.setting-item-bool");
    const changedItem = { ...item };
    const onValueChange = (newValue) => {
      changedItem.value.data = newValue;
      this.handleItemChange(item, changedItem, idx);
    };
    const checkboxDescription = item.keyDescription ? `${item.keyDescription} (${item.key.data})` : item.key.data;
    const { element, widget: checkbox } = this.renderEditWidget(changedItem.value.data, checkboxDescription, onValueChange);
    rowElement.appendChild(element);
    const valueElement = append(rowElement, $25(".setting-list-object-value"));
    valueElement.textContent = checkboxDescription;
    const rowElementGroup = { rowElement, keyElement: valueElement, valueElement: checkbox.domNode };
    this.addTooltipsToRow(rowElementGroup, item);
    this.listDisposables.add(addDisposableListener(valueElement, EventType.MOUSE_DOWN, (e4) => {
      const targetElement = e4.target;
      if (targetElement.tagName.toLowerCase() !== "a") {
        checkbox.checked = !checkbox.checked;
        onValueChange(checkbox.checked);
      }
      EventHelper.stop(e4);
    }));
    return rowElement;
  }
  renderEditWidget(value2, checkboxDescription, onValueChange) {
    const checkbox = new Toggle({
      icon: Codicon.check,
      actionClassName: "setting-value-checkbox",
      isChecked: value2,
      title: checkboxDescription,
      ...unthemedToggleStyles
    });
    this.listDisposables.add(checkbox);
    const wrapper = $25(".setting-list-object-input");
    wrapper.classList.add("setting-list-object-input-key-checkbox");
    checkbox.domNode.classList.add("setting-value-checkbox");
    wrapper.appendChild(checkbox.domNode);
    this.listDisposables.add(addDisposableListener(wrapper, EventType.MOUSE_DOWN, (e4) => {
      checkbox.checked = !checkbox.checked;
      onValueChange(checkbox.checked);
      e4.stopImmediatePropagation();
    }));
    return { widget: checkbox, element: wrapper };
  }
  addTooltipsToRow(rowElementGroup, item) {
    const accessibleDescription = localize(18365, null, item.key.data, item.value.data);
    const title = item.keyDescription ?? accessibleDescription;
    const { rowElement, keyElement, valueElement } = rowElementGroup;
    this.listDisposables.add(this.hoverService.setupDelayedHover(keyElement, { content: title }));
    valueElement.setAttribute("aria-label", accessibleDescription);
    rowElement.setAttribute("aria-label", accessibleDescription);
  }
  getLocalizedStrings() {
    return {
      deleteActionTooltip: localize(18372, null),
      resetActionTooltip: localize(18373, null),
      editActionTooltip: localize(18349, null),
      addButtonLabel: localize(18344, null),
      keyHeaderText: localize(18363, null),
      valueHeaderText: localize(18367, null)
    };
  }
};

ObjectSettingCheckboxWidget = __decorateClass([
  __decorateParam(1, IThemeService),
  __decorateParam(2, IContextViewService),
  __decorateParam(3, IHoverService),
  __decorateParam(4, IConfigurationService)
], ObjectSettingCheckboxWidget);
export { $25, ListSettingListModel, AbstractListSettingWidget, ListSettingWidget, ExcludeSettingWidget, IncludeSettingWidget, ObjectSettingDropdownWidget, ObjectSettingCheckboxWidget };
