// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/preferences/browser/preferencesWidgets.ts
import { BaseActionViewItem } from "./module-0476.mjs";
import { $, EventHelper, EventType, addDisposableListener, append, getTotalWidth, trackFocus } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { settingsEditIcon, settingsScopeDropDownIcon } from "./module-1810.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkspaceContextService, isWorkspaceFolder } from "./module-0509.mjs";
import { IContextMenuService, IContextViewService } from "./module-0488.mjs";
import { IHoverService } from "./module-0520.mjs";
import { Widget } from "./module-0252.mjs";
import { Emitter } from "./module-0017.mjs";
import { Schemas } from "./module-0033.mjs";
import { localize } from "./module-0001.mjs";
import { ActionBar } from "./module-0477.mjs";
import { Action } from "./module-0082.mjs";
import { URI } from "./module-0032.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { ILabelService } from "./module-0641.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { badgeBackground, badgeForeground } from "./module-0228.mjs";
import { contrastBorder } from "./module-0227.mjs";
import { showHistoryKeybindingHint } from "./module-0604.mjs";
import { ContextScopedHistoryInputBox } from "./module-0603.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { Disposable } from "./module-0012.mjs";
import { MarkdownString } from "./module-0462.mjs";


// src/vs/workbench/contrib/preferences/browser/preferencesWidgets.ts
var FolderSettingsActionViewItem = class extends BaseActionViewItem {
  constructor(action, contextService, contextMenuService, hoverService) {
    super(null, action);
    this.contextService = contextService;
    this.contextMenuService = contextMenuService;
    this.hoverService = hoverService;
    this._folderSettingCounts = /* @__PURE__ */ new Map();
    const workspace = this.contextService.getWorkspace();
    this._folder = workspace.folders.length === 1 ? workspace.folders[0] : null;
    this._register(this.contextService.onDidChangeWorkspaceFolders(() => this.onWorkspaceFoldersChanged()));
  }
  get folder() {
    return this._folder;
  }
  set folder(folder) {
    this._folder = folder;
    this.update();
  }
  setCount(settingsTarget, count2) {
    const workspaceFolder = this.contextService.getWorkspaceFolder(settingsTarget);
    if (!workspaceFolder) {
      throw new Error("unknown folder");
    }
    const folder = workspaceFolder.uri;
    this._folderSettingCounts.set(folder.toString(), count2);
    this.update();
  }
  render(container2) {
    this.element = container2;
    this.container = container2;
    this.labelElement = $(".action-title");
    this.detailsElement = $(".action-details");
    this.dropDownElement = $(".dropdown-icon.hide" + ThemeIcon.asCSSSelector(settingsScopeDropDownIcon));
    this.anchorElement = $("a.action-label.folder-settings", {
      role: "button",
      "aria-haspopup": "true",
      "tabindex": "0"
    }, this.labelElement, this.detailsElement, this.dropDownElement);
    this.anchorElementHover = this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.anchorElement, ""));
    this._register(addDisposableListener(this.anchorElement, EventType.MOUSE_DOWN, (e4) => EventHelper.stop(e4)));
    this._register(addDisposableListener(this.anchorElement, EventType.CLICK, (e4) => this.onClick(e4)));
    this._register(addDisposableListener(this.container, EventType.KEY_UP, (e4) => this.onKeyUp(e4)));
    append(this.container, this.anchorElement);
    this.update();
  }
  onKeyUp(event) {
    const keyboardEvent = new StandardKeyboardEvent(event);
    switch (keyboardEvent.keyCode) {
      case 3 /* Enter */:
      case 10 /* Space */:
        this.onClick(event);
        return;
    }
  }
  onClick(event) {
    EventHelper.stop(event, true);
    if (!this.folder || this._action.checked) {
      this.showMenu();
    } else {
      this._action.run(this._folder);
    }
  }
  updateEnabled() {
    this.update();
  }
  updateChecked() {
    this.update();
  }
  onWorkspaceFoldersChanged() {
    const oldFolder = this._folder;
    const workspace = this.contextService.getWorkspace();
    if (oldFolder) {
      this._folder = workspace.folders.filter((folder) => isEqual2(folder.uri, oldFolder.uri))[0] || workspace.folders[0];
    }
    this._folder = this._folder ? this._folder : workspace.folders.length === 1 ? workspace.folders[0] : null;
    this.update();
    if (this._action.checked) {
      this._action.run(this._folder);
    }
  }
  update() {
    let total = 0;
    this._folderSettingCounts.forEach((n2) => total += n2);
    const workspace = this.contextService.getWorkspace();
    if (this._folder) {
      this.labelElement.textContent = this._folder.name;
      this.anchorElementHover.update(this._folder.name);
      const detailsText = this.labelWithCount(this._action.label, total);
      this.detailsElement.textContent = detailsText;
      this.dropDownElement.classList.toggle("hide", workspace.folders.length === 1 || !this._action.checked);
    } else {
      const labelText = this.labelWithCount(this._action.label, total);
      this.labelElement.textContent = labelText;
      this.detailsElement.textContent = "";
      this.anchorElementHover.update(this._action.label);
      this.dropDownElement.classList.remove("hide");
    }
    this.anchorElement.classList.toggle("checked", this._action.checked);
    this.container.classList.toggle("disabled", !this._action.enabled);
  }
  showMenu() {
    this.contextMenuService.showContextMenu({
      getAnchor: () => this.container,
      getActions: () => this.getDropdownMenuActions(),
      getActionViewItem: () => void 0,
      onHide: () => {
        this.anchorElement.blur();
      }
    });
  }
  getDropdownMenuActions() {
    const actions = [];
    const workspaceFolders = this.contextService.getWorkspace().folders;
    if (this.contextService.getWorkbenchState() === 3 /* WORKSPACE */ && workspaceFolders.length > 0) {
      actions.push(...workspaceFolders.map((folder, index2) => {
        const folderCount = this._folderSettingCounts.get(folder.uri.toString());
        return {
          id: "folderSettingsTarget" + index2,
          label: this.labelWithCount(folder.name, folderCount),
          tooltip: this.labelWithCount(folder.name, folderCount),
          checked: !!this.folder && isEqual2(this.folder.uri, folder.uri),
          enabled: true,
          class: void 0,
          run: () => this._action.run(folder)
        };
      }));
    }
    return actions;
  }
  labelWithCount(label3, count2) {
    if (count2) {
      label3 += ` (${count2})`;
    }
    return label3;
  }
};

FolderSettingsActionViewItem = __decorateClass([
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IHoverService)
], FolderSettingsActionViewItem);

var SettingsTargetsWidget = class extends Widget {
  constructor(parent, options3, contextService, instantiationService, environmentService, labelService, languageService) {
    super();
    this.contextService = contextService;
    this.instantiationService = instantiationService;
    this.environmentService = environmentService;
    this.labelService = labelService;
    this.languageService = languageService;
    this._settingsTarget = null;
    this._onDidTargetChange = this._register(new Emitter());
    this.onDidTargetChange = this._onDidTargetChange.event;
    this.options = options3 ?? {};
    this.create(parent);
    this._register(this.contextService.onDidChangeWorkbenchState(() => this.onWorkbenchStateChanged()));
    this._register(this.contextService.onDidChangeWorkspaceFolders(() => this.update()));
  }
  resetLabels() {
    const remoteAuthority = this.environmentService.remoteAuthority;
    const hostLabel = remoteAuthority && this.labelService.getHostLabel(Schemas.vscodeRemote, remoteAuthority);
    this.userLocalSettings.label = localize(18183, null);
    this.userRemoteSettings.label = localize(18184, null) + (hostLabel ? ` [${hostLabel}]` : "");
    this.workspaceSettings.label = this.contextService.getWorkspace().name || localize(18185, null);
    this.folderSettingsAction.label = localize(18181, null);
  }
  create(parent) {
    const settingsTabsWidget = append(parent, $(".settings-tabs-widget"));
    this.settingsSwitcherBar = this._register(new ActionBar(settingsTabsWidget, {
      orientation: 0 /* HORIZONTAL */,
      focusOnlyEnabledItems: true,
      ariaLabel: localize(18182, null),
      ariaRole: "tablist",
      actionViewItemProvider: (action, options3) => action.id === "folderSettings" ? this.folderSettings : void 0
    }));
    this.userLocalSettings = this._register(new Action("userSettings", "", ".settings-tab", true, () => this.updateTarget(3 /* USER_LOCAL */)));
    this.userLocalSettings.tooltip = localize(18183, null);
    this.userRemoteSettings = this._register(new Action("userSettingsRemote", "", ".settings-tab", true, () => this.updateTarget(4 /* USER_REMOTE */)));
    const remoteAuthority = this.environmentService.remoteAuthority;
    const hostLabel = remoteAuthority && this.labelService.getHostLabel(Schemas.vscodeRemote, remoteAuthority);
    this.userRemoteSettings.tooltip = localize(18184, null) + (hostLabel ? ` [${hostLabel}]` : "");
    this.workspaceSettings = this._register(new Action("workspaceSettings", "", ".settings-tab", false, () => this.updateTarget(5 /* WORKSPACE */)));
    this.folderSettingsAction = this._register(new Action("folderSettings", "", ".settings-tab", false, async (folder) => {
      this.updateTarget(isWorkspaceFolder(folder) ? folder.uri : 3 /* USER_LOCAL */);
    }));
    this.folderSettings = this._register(this.instantiationService.createInstance(FolderSettingsActionViewItem, this.folderSettingsAction));
    this.resetLabels();
    this.update();
    this.settingsSwitcherBar.push([this.userLocalSettings, this.userRemoteSettings, this.workspaceSettings, this.folderSettingsAction]);
  }
  get settingsTarget() {
    return this._settingsTarget;
  }
  set settingsTarget(settingsTarget) {
    this._settingsTarget = settingsTarget;
    this.userLocalSettings.checked = 3 /* USER_LOCAL */ === this.settingsTarget;
    this.userRemoteSettings.checked = 4 /* USER_REMOTE */ === this.settingsTarget;
    this.workspaceSettings.checked = 5 /* WORKSPACE */ === this.settingsTarget;
    if (this.settingsTarget instanceof URI) {
      this.folderSettings.action.checked = true;
      this.folderSettings.folder = this.contextService.getWorkspaceFolder(this.settingsTarget);
    } else {
      this.folderSettings.action.checked = false;
    }
  }
  setResultCount(settingsTarget, count2) {
    if (settingsTarget === 5 /* WORKSPACE */) {
      let label3 = this.contextService.getWorkspace().name ?? localize(18185, null);
      if (count2) {
        label3 += ` (${count2})`;
      }
      this.workspaceSettings.label = label3;
    } else if (settingsTarget === 3 /* USER_LOCAL */) {
      let label3 = localize(18183, null);
      if (count2) {
        label3 += ` (${count2})`;
      }
      this.userLocalSettings.label = label3;
    } else if (settingsTarget instanceof URI) {
      this.folderSettings.setCount(settingsTarget, count2);
    }
  }
  updateLanguageFilterIndicators(filter2) {
    this.resetLabels();
    if (filter2) {
      const languageToUse = this.languageService.getLanguageName(filter2);
      if (languageToUse) {
        const languageSuffix = ` [${languageToUse}]`;
        this.userLocalSettings.label += languageSuffix;
        this.userRemoteSettings.label += languageSuffix;
        this.workspaceSettings.label += languageSuffix;
        this.folderSettingsAction.label += languageSuffix;
      }
    }
  }
  onWorkbenchStateChanged() {
    this.folderSettings.folder = null;
    this.update();
    if (this.settingsTarget === 5 /* WORKSPACE */ && this.contextService.getWorkbenchState() === 3 /* WORKSPACE */) {
      this.updateTarget(3 /* USER_LOCAL */);
    }
  }
  updateTarget(settingsTarget) {
    const isSameTarget = this.settingsTarget === settingsTarget || settingsTarget instanceof URI && this.settingsTarget instanceof URI && isEqual2(this.settingsTarget, settingsTarget);
    if (!isSameTarget) {
      this.settingsTarget = settingsTarget;
      this._onDidTargetChange.fire(this.settingsTarget);
    }
    return Promise.resolve(void 0);
  }
  async update() {
    this.settingsSwitcherBar.domNode.classList.toggle("empty-workbench", this.contextService.getWorkbenchState() === 1 /* EMPTY */);
    this.userRemoteSettings.enabled = !!(this.options.enableRemoteSettings && this.environmentService.remoteAuthority);
    this.workspaceSettings.enabled = this.contextService.getWorkbenchState() !== 1 /* EMPTY */;
    this.folderSettings.action.enabled = this.contextService.getWorkbenchState() === 3 /* WORKSPACE */ && this.contextService.getWorkspace().folders.length > 0;
    this.workspaceSettings.tooltip = localize(18185, null);
  }
};

SettingsTargetsWidget = __decorateClass([
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IWorkbenchEnvironmentService),
  __decorateParam(5, ILabelService),
  __decorateParam(6, ILanguageService)
], SettingsTargetsWidget);

var SearchWidget = class extends Widget {
  constructor(parent, options3, contextViewService, instantiationService, contextKeyService, keybindingService) {
    super();
    this.options = options3;
    this.contextViewService = contextViewService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.keybindingService = keybindingService;
    this._onDidChange = this._register(new Emitter());
    this._onFocus = this._register(new Emitter());
    this.create(parent);
  }
  get onDidChange() {
    return this._onDidChange.event;
  }
  get onFocus() {
    return this._onFocus.event;
  }
  create(parent) {
    this.domNode = append(parent, $("div.settings-header-widget"));
    this.createSearchContainer(append(this.domNode, $("div.settings-search-container")));
    this.controlsDiv = append(this.domNode, $("div.settings-search-controls"));
    if (this.options.showResultCount) {
      this.countElement = append(this.controlsDiv, $(".settings-count-widget"));
      this.countElement.style.backgroundColor = asCssVariable(badgeBackground);
      this.countElement.style.color = asCssVariable(badgeForeground);
      this.countElement.style.border = `1px solid ${asCssVariable(contrastBorder)}`;
    }
    this.inputBox.inputElement.setAttribute("aria-live", this.options.ariaLive || "off");
    if (this.options.ariaLabelledBy) {
      this.inputBox.inputElement.setAttribute("aria-labelledBy", this.options.ariaLabelledBy);
    }
    const focusTracker = this._register(trackFocus(this.inputBox.inputElement));
    this._register(focusTracker.onDidFocus(() => this._onFocus.fire()));
    const focusKey = this.options.focusKey;
    if (focusKey) {
      this._register(focusTracker.onDidFocus(() => focusKey.set(true)));
      this._register(focusTracker.onDidBlur(() => focusKey.set(false)));
    }
  }
  createSearchContainer(searchContainer) {
    this.searchContainer = searchContainer;
    const searchInput = append(this.searchContainer, $("div.settings-search-input"));
    this.inputBox = this._register(this.createInputBox(searchInput));
    this._register(this.inputBox.onDidChange((value2) => this._onDidChange.fire(value2)));
  }
  createInputBox(parent) {
    const showHistoryHint = () => showHistoryKeybindingHint(this.keybindingService);
    return new ContextScopedHistoryInputBox(parent, this.contextViewService, { ...this.options, showHistoryHint }, this.contextKeyService);
  }
  showMessage(message) {
    if (this.countElement && message !== this.countElement.textContent) {
      this.countElement.textContent = message;
      this.inputBox.inputElement.setAttribute("aria-label", message);
      this.inputBox.inputElement.style.paddingRight = this.getControlsWidth() + "px";
    }
  }
  layout(dimension) {
    if (dimension.width < 400) {
      this.countElement?.classList.add("hide");
      this.inputBox.inputElement.style.paddingRight = "0px";
    } else {
      this.countElement?.classList.remove("hide");
      this.inputBox.inputElement.style.paddingRight = this.getControlsWidth() + "px";
    }
  }
  getControlsWidth() {
    const countWidth = this.countElement ? getTotalWidth(this.countElement) : 0;
    return countWidth + 20;
  }
  focus() {
    this.inputBox.focus();
    if (this.getValue()) {
      this.inputBox.select();
    }
  }
  hasFocus() {
    return this.inputBox.hasFocus();
  }
  clear() {
    this.inputBox.value = "";
  }
  getValue() {
    return this.inputBox.value;
  }
  setValue(value2) {
    return this.inputBox.value = value2;
  }
  dispose() {
    this.options.focusKey?.set(false);
    super.dispose();
  }
};

SearchWidget = __decorateClass([
  __decorateParam(2, IContextViewService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IKeybindingService)
], SearchWidget);

var EditPreferenceWidget = class extends Disposable {
  constructor(editor) {
    super();
    this.editor = editor;
    this._line = -1;
    this._preferences = [];
    this._onClick = this._register(new Emitter());
    this.onClick = this._onClick.event;
    this._editPreferenceDecoration = this.editor.createDecorationsCollection();
    this._register(this.editor.onMouseDown((e4) => {
      if (e4.target.type !== 2 /* GUTTER_GLYPH_MARGIN */ || e4.target.detail.isAfterLines || !this.isVisible()) {
        return;
      }
      this._onClick.fire(e4);
    }));
  }
  get preferences() {
    return this._preferences;
  }
  getLine() {
    return this._line;
  }
  show(line, hoverMessage, preferences) {
    this._preferences = preferences;
    const newDecoration = [];
    this._line = line;
    newDecoration.push({
      options: {
        description: "edit-preference-widget-decoration",
        glyphMarginClassName: ThemeIcon.asClassName(settingsEditIcon),
        glyphMarginHoverMessage: new MarkdownString().appendText(hoverMessage),
        stickiness: 1 /* NeverGrowsWhenTypingAtEdges */
      },
      range: {
        startLineNumber: line,
        startColumn: 1,
        endLineNumber: line,
        endColumn: 1
      }
    });
    this._editPreferenceDecoration.set(newDecoration);
  }
  hide() {
    this._editPreferenceDecoration.clear();
  }
  isVisible() {
    return this._editPreferenceDecoration.length > 0;
  }
  dispose() {
    this.hide();
    super.dispose();
  }
};
export { FolderSettingsActionViewItem, SettingsTargetsWidget, SearchWidget, EditPreferenceWidget };
