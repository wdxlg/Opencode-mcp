// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/userDataProfile/browser/userDataProfilesEditor.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { registerColor } from "./module-0226.mjs";
import { PANEL_BORDER } from "./module-0868.mjs";
import { defaultButtonStyles, defaultCheckboxStyles, defaultInputBoxStyles, defaultSelectBoxStyles, getInputBoxStyle, getListStyles } from "./module-0513.mjs";
import { editorBackground } from "./module-0229.mjs";
import { foreground } from "./module-0227.mjs";
import { EditorPane } from "./module-1090.mjs";
import { $, Dimension, EventHelper, EventType, addDisposableListener, append, clearNode, trackFocus } from "./module-0075.mjs";
import { Sizing, SplitView } from "./module-0625.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { WorkbenchAsyncDataTree, WorkbenchList, WorkbenchTable } from "./module-0636.mjs";
import { AbstractUserDataProfileElement, NewProfileElement, UserDataProfileElement, UserDataProfilesEditorModel, isProfileResourceChildElement, isProfileResourceTypeElement } from "./module-3352.mjs";
import { Button, ButtonBar, ButtonWithDropdown } from "./module-0546.mjs";
import { Action, Separator, SubmenuAction, toAction } from "./module-0082.mjs";
import { URI } from "./module-0032.mjs";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { IUserDataProfileManagementService, IUserDataProfileService, PROFILE_FILTER, defaultUserDataProfileIcon } from "./module-0998.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { IContextMenuService, IContextViewService } from "./module-0488.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { WorkbenchToolBar } from "./module-0519.mjs";
import { createInstantHoverDelegate, getDefaultHoverDelegate } from "./module-0448.mjs";
import { DEFAULT_ICON, ICONS } from "./module-3350.mjs";
import { isString, isUndefined } from "./module-0010.mjs";
import { IEditorProgressService } from "./module-0446.mjs";
import { CachedListVirtualDelegate } from "./module-0454.mjs";
import { InputBox } from "./module-0600.mjs";
import { settingsTextInputBorder } from "./module-1815.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { WorkbenchIconSelectBox } from "./module-3073.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { IHoverService, WorkbenchHoverDelegate } from "./module-0520.mjs";
import { Checkbox } from "./module-0549.mjs";
import { SelectBox, SeparatorSelectOption } from "./module-0475.mjs";
import { basename2 } from "./module-0034.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { renderMarkdown } from "./module-0468.mjs";
import { ILabelService } from "./module-0641.mjs";
import { Radio } from "./module-2555.mjs";
import { DEFAULT_LABELS_CONTAINER, ResourceLabels } from "./module-1322.mjs";
import { Schemas } from "./module-0033.mjs";
import { normalizeDriveLetter } from "./module-0711.mjs";
import { posix, win32 } from "./module-0026.mjs";
import { hasDriveLetter } from "./module-0031.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { ActionBar } from "./module-0477.mjs";
import { DropdownMenuActionViewItem } from "./module-0502.mjs";
import { EditorInput } from "./module-0929.mjs";


// src/vs/workbench/contrib/userDataProfile/browser/userDataProfilesEditor.ts
var editIcon2 = registerIcon("profiles-editor-edit-folder", Codicon.edit, localize(21638, null));

var removeIcon = registerIcon("profiles-editor-remove-folder", Codicon.close, localize(21676, null));

var profilesSashBorder = registerColor("profiles.sashBorder", PANEL_BORDER, localize(21675, null));

var listStyles = getListStyles({
  listActiveSelectionBackground: editorBackground,
  listActiveSelectionForeground: foreground,
  listFocusAndSelectionBackground: editorBackground,
  listFocusAndSelectionForeground: foreground,
  listFocusBackground: editorBackground,
  listFocusForeground: foreground,
  listHoverForeground: foreground,
  listHoverBackground: editorBackground,
  listHoverOutline: editorBackground,
  listFocusOutline: editorBackground,
  listInactiveSelectionBackground: editorBackground,
  listInactiveSelectionForeground: foreground,
  listInactiveFocusBackground: editorBackground,
  listInactiveFocusOutline: editorBackground,
  treeIndentGuidesStroke: void 0,
  treeInactiveIndentGuidesStroke: void 0,
  tableOddRowsBackgroundColor: editorBackground
});

var UserDataProfilesEditor = class extends EditorPane {
  constructor(group2, telemetryService, themeService, storageService, quickInputService, fileDialogService, contextMenuService, instantiationService) {
    super(UserDataProfilesEditor.ID, group2, telemetryService, themeService, storageService);
    this.quickInputService = quickInputService;
    this.fileDialogService = fileDialogService;
    this.contextMenuService = contextMenuService;
    this.instantiationService = instantiationService;
    this.templates = [];
  }
  static {
    this.ID = "workbench.editor.userDataProfiles";
  }
  layout(dimension, position2) {
    if (this.container && this.splitView) {
      const height = dimension.height - 20;
      this.splitView.layout(this.container?.clientWidth, height);
      this.splitView.el.style.height = `${height}px`;
    }
  }
  createEditor(parent) {
    this.container = append(parent, $(".profiles-editor"));
    const sidebarView = append(this.container, $(".sidebar-view"));
    const sidebarContainer = append(sidebarView, $(".sidebar-container"));
    const contentsView = append(this.container, $(".contents-view"));
    const contentsContainer = append(contentsView, $(".contents-container"));
    this.profileWidget = this._register(this.instantiationService.createInstance(ProfileWidget, contentsContainer));
    this.splitView = new SplitView(this.container, {
      orientation: 1 /* HORIZONTAL */,
      proportionalLayout: true
    });
    this.renderSidebar(sidebarContainer);
    this.splitView.addView({
      onDidChange: Event2.None,
      element: sidebarView,
      minimumSize: 200,
      maximumSize: 350,
      layout: (width2, _, height) => {
        sidebarView.style.width = `${width2}px`;
        if (height && this.profilesList) {
          const listHeight = height - 40 - 15;
          this.profilesList.getHTMLElement().style.height = `${listHeight}px`;
          this.profilesList.layout(listHeight, width2);
        }
      }
    }, 300, void 0, true);
    this.splitView.addView({
      onDidChange: Event2.None,
      element: contentsView,
      minimumSize: 550,
      maximumSize: Number.POSITIVE_INFINITY,
      layout: (width2, _, height) => {
        contentsView.style.width = `${width2}px`;
        if (height) {
          this.profileWidget?.layout(new Dimension(width2, height));
        }
      }
    }, Sizing.Distribute, void 0, true);
    this.registerListeners();
    this.updateStyles();
  }
  updateStyles() {
    const borderColor = this.theme.getColor(profilesSashBorder);
    this.splitView?.style({ separatorBorder: borderColor });
  }
  renderSidebar(parent) {
    this.renderNewProfileButton(append(parent, $(".new-profile-button")));
    const renderer = this.instantiationService.createInstance(ProfileElementRenderer);
    const delegate = new ProfileElementDelegate();
    this.profilesList = this._register(this.instantiationService.createInstance(
      WorkbenchList,
      "ProfilesList",
      append(parent, $(".profiles-list")),
      delegate,
      [renderer],
      {
        multipleSelectionSupport: false,
        setRowLineHeight: false,
        horizontalScrolling: false,
        accessibilityProvider: {
          getAriaLabel(profileElement) {
            return profileElement?.name ?? "";
          },
          getWidgetAriaLabel() {
            return localize(21674, null);
          }
        },
        openOnSingleClick: true,
        identityProvider: {
          getId(e4) {
            if (e4 instanceof UserDataProfileElement) {
              return e4.profile.id;
            }
            return e4.name;
          }
        },
        alwaysConsumeMouseWheel: false
      }
    ));
  }
  renderNewProfileButton(parent) {
    const button = this._register(new ButtonWithDropdown(parent, {
      actions: {
        getActions: () => {
          const actions = [];
          if (this.templates.length) {
            actions.push(new SubmenuAction("from.template", localize(21646, null), this.getCreateFromTemplateActions()));
            actions.push(new Separator());
          }
          actions.push(toAction({
            id: "importProfile",
            label: localize(21657, null),
            run: () => this.importProfile()
          }));
          return actions;
        }
      },
      addPrimaryActionToDropdown: false,
      contextMenuProvider: this.contextMenuService,
      supportIcons: true,
      ...defaultButtonStyles
    }));
    button.label = localize(21664, null);
    this._register(button.onDidClick((e4) => this.createNewProfile()));
  }
  getCreateFromTemplateActions() {
    return this.templates.map((template2) => toAction({
      id: `template:${template2.url}`,
      label: template2.name,
      run: () => this.createNewProfile(URI.parse(template2.url))
    }));
  }
  registerListeners() {
    if (this.profilesList) {
      this._register(this.profilesList.onDidChangeSelection((e4) => {
        const [element] = e4.elements;
        if (element instanceof AbstractUserDataProfileElement) {
          this.profileWidget?.render(element);
        }
      }));
      this._register(this.profilesList.onContextMenu((e4) => {
        const actions = [];
        if (!e4.element) {
          actions.push(...this.getTreeContextMenuActions());
        }
        if (e4.element instanceof AbstractUserDataProfileElement) {
          actions.push(...e4.element.actions[1]);
        }
        if (actions.length) {
          this.contextMenuService.showContextMenu({
            getAnchor: () => e4.anchor,
            getActions: () => actions,
            getActionsContext: () => e4.element
          });
        }
      }));
      this._register(this.profilesList.onMouseDblClick((e4) => {
        if (!e4.element) {
          this.createNewProfile();
        }
      }));
    }
  }
  getTreeContextMenuActions() {
    const actions = [];
    actions.push(toAction({
      id: "newProfile",
      label: localize(21664, null),
      run: () => this.createNewProfile()
    }));
    const templateActions = this.getCreateFromTemplateActions();
    if (templateActions.length) {
      actions.push(new SubmenuAction("from.template", localize(21663, null), templateActions));
    }
    actions.push(new Separator());
    actions.push(toAction({
      id: "importProfile",
      label: localize(21657, null),
      run: () => this.importProfile()
    }));
    return actions;
  }
  async importProfile() {
    const disposables = new DisposableStore();
    const quickPick = disposables.add(this.quickInputService.createQuickPick());
    const updateQuickPickItems = (value2) => {
      const quickPickItems = [];
      if (value2) {
        quickPickItems.push({ label: quickPick.value, description: localize(21653, null) });
      }
      quickPickItems.push({ label: localize(21652, null) });
      quickPick.items = quickPickItems;
    };
    quickPick.title = localize(21656, null);
    quickPick.placeholder = localize(21655, null);
    quickPick.ignoreFocusOut = true;
    disposables.add(quickPick.onDidChangeValue(updateQuickPickItems));
    updateQuickPickItems();
    quickPick.matchOnLabel = false;
    quickPick.matchOnDescription = false;
    disposables.add(quickPick.onDidAccept(async () => {
      quickPick.hide();
      const selectedItem = quickPick.selectedItems[0];
      if (!selectedItem) {
        return;
      }
      const url = selectedItem.label === quickPick.value ? URI.parse(quickPick.value) : await this.getProfileUriFromFileSystem();
      if (url) {
        this.createNewProfile(url);
      }
    }));
    disposables.add(quickPick.onDidHide(() => disposables.dispose()));
    quickPick.show();
  }
  async createNewProfile(copyFrom) {
    await this.model?.createNewProfile(copyFrom);
  }
  selectProfile(profile) {
    const index2 = this.model?.profiles.findIndex((p) => p instanceof UserDataProfileElement && p.profile.id === profile.id);
    if (index2 !== void 0 && index2 >= 0) {
      this.profilesList?.setSelection([index2]);
    }
  }
  async getProfileUriFromFileSystem() {
    const profileLocation = await this.fileDialogService.showOpenDialog({
      canSelectFolders: false,
      canSelectFiles: true,
      canSelectMany: false,
      filters: PROFILE_FILTER,
      title: localize(21654, null)
    });
    if (!profileLocation) {
      return null;
    }
    return profileLocation[0];
  }
  async setInput(input, options3, context2, token) {
    await super.setInput(input, options3, context2, token);
    this.model = await input.resolve();
    this.model.getTemplates().then((templates) => {
      this.templates = templates;
      if (this.profileWidget) {
        this.profileWidget.templates = templates;
      }
    });
    this.updateProfilesList();
    this._register(this.model.onDidChange((element) => this.updateProfilesList(element)));
  }
  focus() {
    super.focus();
    this.profilesList?.domFocus();
  }
  updateProfilesList(elementToSelect) {
    if (!this.model) {
      return;
    }
    const currentSelectionIndex = this.profilesList?.getSelection()?.[0];
    const currentSelection = currentSelectionIndex !== void 0 ? this.profilesList?.element(currentSelectionIndex) : void 0;
    this.profilesList?.splice(0, this.profilesList.length, this.model.profiles);
    if (elementToSelect) {
      this.profilesList?.setSelection([this.model.profiles.indexOf(elementToSelect)]);
    } else if (currentSelection) {
      if (!this.model.profiles.includes(currentSelection)) {
        const elementToSelect2 = this.model.profiles.find((profile) => profile.name === currentSelection.name) ?? this.model.profiles[0];
        if (elementToSelect2) {
          this.profilesList?.setSelection([this.model.profiles.indexOf(elementToSelect2)]);
        }
      }
    } else {
      const elementToSelect2 = this.model.profiles.find((profile) => profile.active) ?? this.model.profiles[0];
      if (elementToSelect2) {
        this.profilesList?.setSelection([this.model.profiles.indexOf(elementToSelect2)]);
      }
    }
  }
};

UserDataProfilesEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IQuickInputService),
  __decorateParam(5, IFileDialogService),
  __decorateParam(6, IContextMenuService),
  __decorateParam(7, IInstantiationService)
], UserDataProfilesEditor);

var ProfileElementDelegate = class {
  getHeight(element) {
    return 22;
  }
  getTemplateId() {
    return "profileListElement";
  }
};

var ProfileElementRenderer = class {
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
    this.templateId = "profileListElement";
  }
  renderTemplate(container2) {
    const disposables = new DisposableStore();
    const elementDisposables = new DisposableStore();
    container2.classList.add("profile-list-item");
    const icon2 = append(container2, $(".profile-list-item-icon"));
    const label3 = append(container2, $(".profile-list-item-label"));
    const dirty = append(container2, $(`span${ThemeIcon.asCSSSelector(Codicon.circleFilled)}`));
    const description = append(container2, $(".profile-list-item-description"));
    append(description, $(`span${ThemeIcon.asCSSSelector(Codicon.check)}`), $("span", void 0, localize(21614, null)));
    const actionsContainer = append(container2, $(".profile-tree-item-actions-container"));
    const actionBar3 = disposables.add(this.instantiationService.createInstance(
      WorkbenchToolBar,
      actionsContainer,
      {
        hoverDelegate: disposables.add(createInstantHoverDelegate()),
        highlightToggledItems: true
      }
    ));
    return { label: label3, icon: icon2, dirty, description, actionBar: actionBar3, disposables, elementDisposables };
  }
  renderElement(element, index2, templateData) {
    templateData.elementDisposables.clear();
    templateData.label.textContent = element.name;
    templateData.label.classList.toggle("new-profile", element instanceof NewProfileElement);
    templateData.icon.className = ThemeIcon.asClassName(element.icon ? ThemeIcon.fromId(element.icon) : DEFAULT_ICON);
    templateData.dirty.classList.toggle("hide", !(element instanceof NewProfileElement));
    templateData.description.classList.toggle("hide", !element.active);
    templateData.elementDisposables.add(element.onDidChange((e4) => {
      if (e4.name) {
        templateData.label.textContent = element.name;
      }
      if (e4.icon) {
        if (element.icon) {
          templateData.icon.className = ThemeIcon.asClassName(ThemeIcon.fromId(element.icon));
        } else {
          templateData.icon.className = "hide";
        }
      }
      if (e4.active) {
        templateData.description.classList.toggle("hide", !element.active);
      }
    }));
    const setActions = () => templateData.actionBar.setActions(element.actions[0].filter((a) => a.enabled), element.actions[1].filter((a) => a.enabled));
    setActions();
    const events = [];
    for (const action of element.actions.flat()) {
      if (action instanceof Action) {
        events.push(action.onDidChange);
      }
    }
    templateData.elementDisposables.add(Event2.any(...events)((e4) => {
      if (e4.enabled !== void 0) {
        setActions();
      }
    }));
  }
  disposeElement(element, index2, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
    templateData.elementDisposables.dispose();
  }
};

ProfileElementRenderer = __decorateClass([
  __decorateParam(0, IInstantiationService)
], ProfileElementRenderer);

var ProfileWidget = class extends Disposable {
  constructor(parent, editorProgressService, instantiationService) {
    super();
    this.editorProgressService = editorProgressService;
    this.instantiationService = instantiationService;
    this._profileElement = this._register(new MutableDisposable());
    this.layoutParticipants = [];
    const header2 = append(parent, $(".profile-header"));
    const title = append(header2, $(".profile-title-container"));
    this.profileTitle = append(title, $(".profile-title"));
    this.builtInLabel = append(title, $(".profile-built-in-label", void 0, localize(21618, null)));
    this.builtInLabel.classList.add("hide");
    const body = append(parent, $(".profile-body"));
    const delegate = new ProfileTreeDelegate();
    const contentsRenderer = this._register(this.instantiationService.createInstance(ContentsProfileRenderer));
    const associationsRenderer = this._register(this.instantiationService.createInstance(ProfileWorkspacesRenderer));
    this.layoutParticipants.push(associationsRenderer);
    this.copyFromProfileRenderer = this._register(this.instantiationService.createInstance(CopyFromProfileRenderer));
    this.profileTreeContainer = append(body, $(".profile-tree"));
    this.profileTree = this._register(this.instantiationService.createInstance(
      WorkbenchAsyncDataTree,
      "ProfileEditor-Tree",
      this.profileTreeContainer,
      delegate,
      [
        this._register(this.instantiationService.createInstance(ProfileNameRenderer)),
        this._register(this.instantiationService.createInstance(ProfileIconRenderer)),
        this._register(this.instantiationService.createInstance(UseForCurrentWindowPropertyRenderer)),
        this._register(this.instantiationService.createInstance(UseAsDefaultProfileRenderer)),
        this.copyFromProfileRenderer,
        contentsRenderer,
        associationsRenderer
      ],
      this.instantiationService.createInstance(ProfileTreeDataSource),
      {
        multipleSelectionSupport: false,
        horizontalScrolling: false,
        accessibilityProvider: {
          getAriaLabel(element) {
            return element?.element ?? "";
          },
          getWidgetAriaLabel() {
            return "";
          }
        },
        identityProvider: {
          getId(element) {
            return element.element;
          }
        },
        expandOnlyOnTwistieClick: true,
        renderIndentGuides: "none" /* None */,
        enableStickyScroll: false,
        openOnSingleClick: false,
        setRowLineHeight: false,
        supportDynamicHeights: true,
        alwaysConsumeMouseWheel: false
      }
    ));
    this.profileTree.style(listStyles);
    this._register(contentsRenderer.onDidChangeContentHeight((e4) => this.profileTree.updateElementHeight(e4, void 0)));
    this._register(associationsRenderer.onDidChangeContentHeight((e4) => this.profileTree.updateElementHeight(e4, void 0)));
    this._register(contentsRenderer.onDidChangeSelection((e4) => {
      if (e4.selected) {
        this.profileTree.setFocus([]);
        this.profileTree.setSelection([]);
      }
    }));
    this._register(this.profileTree.onDidChangeContentHeight((e4) => {
      if (this.dimension) {
        this.layout(this.dimension);
      }
    }));
    this._register(this.profileTree.onDidChangeSelection((e4) => {
      if (e4.elements.length) {
        contentsRenderer.clearSelection();
      }
    }));
    this.buttonContainer = append(body, $(".profile-row-container.profile-button-container"));
  }
  set templates(templates) {
    this.copyFromProfileRenderer.setTemplates(templates);
    this.profileTree.rerender();
  }
  layout(dimension) {
    this.dimension = dimension;
    const treeContentHeight = this.profileTree.contentHeight;
    const height = Math.min(treeContentHeight, dimension.height - (this._profileElement.value?.element instanceof NewProfileElement ? 116 : 54));
    this.profileTreeContainer.style.height = `${height}px`;
    this.profileTree.layout(height, dimension.width);
    for (const participant of this.layoutParticipants) {
      participant.layout();
    }
  }
  render(profileElement) {
    if (this._profileElement.value?.element === profileElement) {
      return;
    }
    if (this._profileElement.value?.element instanceof UserDataProfileElement) {
      this._profileElement.value.element.reset();
    }
    this.profileTree.setInput(profileElement);
    const disposables = new DisposableStore();
    this._profileElement.value = { element: profileElement, dispose: () => disposables.dispose() };
    this.profileTitle.textContent = profileElement.name;
    this.builtInLabel.classList.toggle("hide", !(profileElement instanceof UserDataProfileElement && profileElement.profile.isDefault));
    disposables.add(profileElement.onDidChange((e4) => {
      if (e4.name) {
        this.profileTitle.textContent = profileElement.name;
      }
    }));
    const [primaryTitleButtons, secondatyTitleButtons] = profileElement.titleButtons;
    if (primaryTitleButtons?.length || secondatyTitleButtons?.length) {
      this.buttonContainer.classList.remove("hide");
      if (secondatyTitleButtons?.length) {
        for (const action of secondatyTitleButtons) {
          const button = disposables.add(new Button(this.buttonContainer, {
            ...defaultButtonStyles,
            secondary: true
          }));
          button.label = action.label;
          button.enabled = action.enabled;
          disposables.add(button.onDidClick(() => this.editorProgressService.showWhile(action.run())));
          disposables.add(action.onDidChange((e4) => {
            if (!isUndefined(e4.enabled)) {
              button.enabled = action.enabled;
            }
            if (!isUndefined(e4.label)) {
              button.label = action.label;
            }
          }));
        }
      }
      if (primaryTitleButtons?.length) {
        for (const action of primaryTitleButtons) {
          const button = disposables.add(new Button(this.buttonContainer, {
            ...defaultButtonStyles
          }));
          button.label = action.label;
          button.enabled = action.enabled;
          disposables.add(button.onDidClick(() => this.editorProgressService.showWhile(action.run())));
          disposables.add(action.onDidChange((e4) => {
            if (!isUndefined(e4.enabled)) {
              button.enabled = action.enabled;
            }
            if (!isUndefined(e4.label)) {
              button.label = action.label;
            }
          }));
          disposables.add(profileElement.onDidChange((e4) => {
            if (e4.message) {
              button.setTitle(profileElement.message ?? action.label);
              button.element.classList.toggle("error", !!profileElement.message);
            }
          }));
        }
      }
    } else {
      this.buttonContainer.classList.add("hide");
    }
    if (profileElement instanceof NewProfileElement) {
      this.profileTree.focusFirst();
    }
    if (this.dimension) {
      this.layout(this.dimension);
    }
  }
};

ProfileWidget = __decorateClass([
  __decorateParam(1, IEditorProgressService),
  __decorateParam(2, IInstantiationService)
], ProfileWidget);

var ProfileTreeDelegate = class extends CachedListVirtualDelegate {
  getTemplateId({ element }) {
    return element;
  }
  hasDynamicHeight({ element }) {
    return element === "contents" || element === "workspaces";
  }
  estimateHeight({ element, root }) {
    switch (element) {
      case "name":
        return 72;
      case "icon":
        return 68;
      case "copyFrom":
        return 90;
      case "useForCurrent":
      case "useAsDefault":
        return 68;
      case "contents":
        return 258;
      case "workspaces":
        return (root.workspaces ? root.workspaces.length * 24 + 30 : 0) + 112;
    }
  }
};

var ProfileTreeDataSource = class {
  hasChildren(element) {
    return element instanceof AbstractUserDataProfileElement;
  }
  async getChildren(element) {
    if (element instanceof AbstractUserDataProfileElement) {
      const children = [];
      if (element instanceof NewProfileElement) {
        children.push({ element: "name", root: element });
        children.push({ element: "icon", root: element });
        children.push({ element: "copyFrom", root: element });
        children.push({ element: "contents", root: element });
      } else if (element instanceof UserDataProfileElement) {
        if (!element.profile.isDefault) {
          children.push({ element: "name", root: element });
          children.push({ element: "icon", root: element });
        }
        children.push({ element: "useAsDefault", root: element });
        children.push({ element: "contents", root: element });
        children.push({ element: "workspaces", root: element });
      }
      return children;
    }
    return [];
  }
};

var ProfileContentTreeElementDelegate = class {
  getTemplateId(element) {
    if (!element.element.resourceType) {
      return ProfileResourceChildTreeItemRenderer.TEMPLATE_ID;
    }
    if (element.root instanceof NewProfileElement) {
      return NewProfileResourceTreeRenderer.TEMPLATE_ID;
    }
    return ExistingProfileResourceTreeRenderer.TEMPLATE_ID;
  }
  getHeight(element) {
    return 24;
  }
};

var ProfileResourceTreeDataSource = class {
  constructor(editorProgressService) {
    this.editorProgressService = editorProgressService;
  }
  hasChildren(element) {
    if (element instanceof AbstractUserDataProfileElement) {
      return true;
    }
    if (element.element.resourceType) {
      if (element.element.resourceType !== "extensions" /* Extensions */ && element.element.resourceType !== "snippets" /* Snippets */) {
        return false;
      }
      if (element.root instanceof NewProfileElement) {
        const resourceType = element.element.resourceType;
        if (element.root.getFlag(resourceType)) {
          return true;
        }
        if (!element.root.hasResource(resourceType)) {
          return false;
        }
        if (element.root.copyFrom === void 0) {
          return false;
        }
        if (!element.root.getCopyFlag(resourceType)) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
  async getChildren(element) {
    if (element instanceof AbstractUserDataProfileElement) {
      const children = await element.getChildren();
      return children.map((e4) => ({ element: e4, root: element }));
    }
    if (element.element.resourceType) {
      const progressRunner = this.editorProgressService.show(true, 500);
      try {
        const extensions = await element.root.getChildren(element.element.resourceType);
        return extensions.map((e4) => ({ element: e4, root: element.root }));
      } finally {
        progressRunner.done();
      }
    }
    return [];
  }
};

ProfileResourceTreeDataSource = __decorateClass([
  __decorateParam(0, IEditorProgressService)
], ProfileResourceTreeDataSource);

var AbstractProfileResourceTreeRenderer = class extends Disposable {
  getResourceTypeTitle(resourceType) {
    switch (resourceType) {
      case "settings" /* Settings */:
        return localize(21677, null);
      case "keybindings" /* Keybindings */:
        return localize(21658, null);
      case "snippets" /* Snippets */:
        return localize(21678, null);
      case "tasks" /* Tasks */:
        return localize(21679, null);
      case "mcp" /* Mcp */:
        return localize(21660, null);
      case "extensions" /* Extensions */:
        return localize(21642, null);
    }
    return "";
  }
  disposeElement(element, index2, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};

var ProfilePropertyRenderer = class extends AbstractProfileResourceTreeRenderer {
  renderElement({ element }, index2, templateData) {
    templateData.elementDisposables.clear();
    templateData.element = element;
  }
};

var ProfileNameRenderer = class extends ProfilePropertyRenderer {
  constructor(userDataProfilesService, contextViewService) {
    super();
    this.userDataProfilesService = userDataProfilesService;
    this.contextViewService = contextViewService;
    this.templateId = "name";
  }
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const elementDisposables = disposables.add(new DisposableStore());
    let profileElement;
    const nameContainer = append(parent, $(".profile-row-container"));
    append(nameContainer, $(".profile-label-element", void 0, localize(21661, null)));
    const nameInput = disposables.add(new InputBox(
      nameContainer,
      this.contextViewService,
      {
        inputBoxStyles: getInputBoxStyle({
          inputBorder: settingsTextInputBorder
        }),
        ariaLabel: localize(21673, null),
        placeholder: localize(21673, null),
        validationOptions: {
          validation: (value2) => {
            if (!value2) {
              return {
                content: localize(21662, null),
                type: 2 /* WARNING */
              };
            }
            if (profileElement?.root.disabled) {
              return null;
            }
            if (!profileElement?.root.shouldValidateName()) {
              return null;
            }
            const initialName = profileElement?.root.getInitialName();
            value2 = value2.trim();
            if (initialName !== value2 && this.userDataProfilesService.profiles.some((p) => !p.isInternal && p.name === value2)) {
              return {
                content: localize(21672, null, value2),
                type: 2 /* WARNING */
              };
            }
            return null;
          }
        }
      }
    ));
    disposables.add(nameInput.onDidChange((value2) => {
      if (profileElement && value2) {
        profileElement.root.name = value2;
      }
    }));
    const focusTracker = disposables.add(trackFocus(nameInput.inputElement));
    disposables.add(focusTracker.onDidBlur(() => {
      if (profileElement && !nameInput.value) {
        nameInput.value = profileElement.root.name;
      }
    }));
    const renderName = (profileElement2) => {
      nameInput.value = profileElement2.root.name;
      nameInput.validate();
      const isSystemProfile = profileElement2.root instanceof UserDataProfileElement && profileElement2.root.profile.isDefault;
      if (profileElement2.root.disabled || isSystemProfile) {
        nameInput.disable();
      } else {
        nameInput.enable();
      }
      if (isSystemProfile) {
        nameInput.setTooltip(localize(21636, null));
      } else {
        nameInput.setTooltip(localize(21673, null));
      }
    };
    return {
      set element(element) {
        profileElement = element;
        renderName(profileElement);
        elementDisposables.add(profileElement.root.onDidChange((e4) => {
          if (e4.name || e4.disabled) {
            renderName(element);
          }
          if (e4.profile) {
            nameInput.validate();
          }
        }));
      },
      disposables,
      elementDisposables
    };
  }
};

ProfileNameRenderer = __decorateClass([
  __decorateParam(0, IUserDataProfilesService),
  __decorateParam(1, IContextViewService)
], ProfileNameRenderer);

var ProfileIconRenderer = class extends ProfilePropertyRenderer {
  constructor(instantiationService, hoverService) {
    super();
    this.instantiationService = instantiationService;
    this.hoverService = hoverService;
    this.templateId = "icon";
    this.hoverDelegate = getDefaultHoverDelegate("element");
  }
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const elementDisposables = disposables.add(new DisposableStore());
    let profileElement;
    const iconContainer = append(parent, $(".profile-row-container"));
    append(iconContainer, $(".profile-label-element", void 0, localize(21651, null)));
    const iconValueContainer = append(iconContainer, $(".profile-icon-container"));
    const iconElement = append(iconValueContainer, $(`${ThemeIcon.asCSSSelector(DEFAULT_ICON)}`, { "tabindex": "0", "role": "button", "aria-label": localize(21649, null) }));
    const iconHover = disposables.add(this.hoverService.setupManagedHover(this.hoverDelegate, iconElement, ""));
    const iconSelectBox = disposables.add(this.instantiationService.createInstance(WorkbenchIconSelectBox, { icons: ICONS, inputBoxStyles: defaultInputBoxStyles }));
    let hoverWidget;
    const showIconSelectBox = () => {
      if (profileElement?.root instanceof UserDataProfileElement && profileElement.root.profile.isDefault) {
        return;
      }
      if (profileElement?.root.disabled) {
        return;
      }
      if (profileElement?.root instanceof UserDataProfileElement && profileElement.root.profile.isDefault) {
        return;
      }
      iconSelectBox.clearInput();
      hoverWidget = this.hoverService.showInstantHover({
        content: iconSelectBox.domNode,
        target: iconElement,
        position: {
          hoverPosition: 2 /* BELOW */
        },
        persistence: {
          sticky: true
        },
        appearance: {
          showPointer: true
        }
      }, true);
      if (hoverWidget) {
        iconSelectBox.layout(new Dimension(486, 292));
        iconSelectBox.focus();
      }
    };
    disposables.add(addDisposableListener(iconElement, EventType.CLICK, (e4) => {
      EventHelper.stop(e4, true);
      showIconSelectBox();
    }));
    disposables.add(addDisposableListener(iconElement, EventType.KEY_DOWN, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      if (event.equals(3 /* Enter */) || event.equals(10 /* Space */)) {
        EventHelper.stop(event, true);
        showIconSelectBox();
      }
    }));
    disposables.add(addDisposableListener(iconSelectBox.domNode, EventType.KEY_DOWN, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      if (event.equals(9 /* Escape */)) {
        EventHelper.stop(event, true);
        hoverWidget?.dispose();
        iconElement.focus();
      }
    }));
    disposables.add(iconSelectBox.onDidSelect((selectedIcon) => {
      hoverWidget?.dispose();
      iconElement.focus();
      if (profileElement) {
        profileElement.root.icon = selectedIcon.id;
      }
    }));
    append(iconValueContainer, $(".profile-description-element", void 0, localize(21650, null)));
    const renderIcon2 = (profileElement2) => {
      if (profileElement2?.root instanceof UserDataProfileElement && profileElement2.root.profile.isDefault) {
        iconValueContainer.classList.add("disabled");
        iconHover.update(localize(21635, null));
      } else {
        iconHover.update(localize(21620, null));
        iconValueContainer.classList.remove("disabled");
      }
      if (profileElement2.root.icon) {
        iconElement.className = ThemeIcon.asClassName(ThemeIcon.fromId(profileElement2.root.icon));
      } else {
        iconElement.className = ThemeIcon.asClassName(ThemeIcon.fromId(DEFAULT_ICON.id));
      }
    };
    return {
      set element(element) {
        profileElement = element;
        renderIcon2(profileElement);
        elementDisposables.add(profileElement.root.onDidChange((e4) => {
          if (e4.icon) {
            renderIcon2(element);
          }
        }));
      },
      disposables,
      elementDisposables
    };
  }
};

ProfileIconRenderer = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IHoverService)
], ProfileIconRenderer);

var UseForCurrentWindowPropertyRenderer = class extends ProfilePropertyRenderer {
  constructor(userDataProfileService) {
    super();
    this.userDataProfileService = userDataProfileService;
    this.templateId = "useForCurrent";
  }
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const elementDisposables = disposables.add(new DisposableStore());
    let profileElement;
    const useForCurrentWindowContainer = append(parent, $(".profile-row-container"));
    append(useForCurrentWindowContainer, $(".profile-label-element", void 0, localize(21683, null)));
    const useForCurrentWindowValueContainer = append(useForCurrentWindowContainer, $(".profile-use-for-current-container"));
    const useForCurrentWindowTitle = localize(21640, null);
    const useForCurrentWindowCheckbox = disposables.add(new Checkbox(useForCurrentWindowTitle, false, defaultCheckboxStyles));
    append(useForCurrentWindowValueContainer, useForCurrentWindowCheckbox.domNode);
    const useForCurrentWindowLabel = append(useForCurrentWindowValueContainer, $(".profile-description-element", void 0, useForCurrentWindowTitle));
    disposables.add(useForCurrentWindowCheckbox.onChange(() => {
      if (profileElement?.root instanceof UserDataProfileElement) {
        profileElement.root.toggleCurrentWindowProfile();
      }
    }));
    disposables.add(addDisposableListener(useForCurrentWindowLabel, EventType.CLICK, () => {
      if (profileElement?.root instanceof UserDataProfileElement) {
        profileElement.root.toggleCurrentWindowProfile();
      }
    }));
    const renderUseCurrentProfile = (profileElement2) => {
      useForCurrentWindowCheckbox.checked = profileElement2.root instanceof UserDataProfileElement && this.userDataProfileService.currentProfile.id === profileElement2.root.profile.id;
      if (useForCurrentWindowCheckbox.checked && this.userDataProfileService.currentProfile.isDefault) {
        useForCurrentWindowCheckbox.disable();
      } else {
        useForCurrentWindowCheckbox.enable();
      }
    };
    const that = this;
    return {
      set element(element) {
        profileElement = element;
        renderUseCurrentProfile(profileElement);
        elementDisposables.add(that.userDataProfileService.onDidChangeCurrentProfile((e4) => {
          renderUseCurrentProfile(element);
        }));
      },
      disposables,
      elementDisposables
    };
  }
};

UseForCurrentWindowPropertyRenderer = __decorateClass([
  __decorateParam(0, IUserDataProfileService)
], UseForCurrentWindowPropertyRenderer);

var UseAsDefaultProfileRenderer = class extends ProfilePropertyRenderer {
  constructor() {
    super(...arguments);
    this.templateId = "useAsDefault";
  }
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const elementDisposables = disposables.add(new DisposableStore());
    let profileElement;
    const useAsDefaultProfileContainer = append(parent, $(".profile-row-container"));
    append(useAsDefaultProfileContainer, $(".profile-label-element", void 0, localize(21684, null)));
    const useAsDefaultProfileValueContainer = append(useAsDefaultProfileContainer, $(".profile-use-as-default-container"));
    const useAsDefaultProfileTitle = localize(21641, null);
    const useAsDefaultProfileCheckbox = disposables.add(new Checkbox(useAsDefaultProfileTitle, false, defaultCheckboxStyles));
    append(useAsDefaultProfileValueContainer, useAsDefaultProfileCheckbox.domNode);
    const useAsDefaultProfileLabel = append(useAsDefaultProfileValueContainer, $(".profile-description-element", void 0, useAsDefaultProfileTitle));
    disposables.add(useAsDefaultProfileCheckbox.onChange(() => {
      if (profileElement?.root instanceof UserDataProfileElement) {
        profileElement.root.toggleNewWindowProfile();
      }
    }));
    disposables.add(addDisposableListener(useAsDefaultProfileLabel, EventType.CLICK, () => {
      if (profileElement?.root instanceof UserDataProfileElement) {
        profileElement.root.toggleNewWindowProfile();
      }
    }));
    const renderUseAsDefault = (profileElement2) => {
      useAsDefaultProfileCheckbox.checked = profileElement2.root instanceof UserDataProfileElement && profileElement2.root.isNewWindowProfile;
    };
    return {
      set element(element) {
        profileElement = element;
        renderUseAsDefault(profileElement);
        elementDisposables.add(profileElement.root.onDidChange((e4) => {
          if (e4.newWindowProfile) {
            renderUseAsDefault(element);
          }
        }));
      },
      disposables,
      elementDisposables
    };
  }
};

var CopyFromProfileRenderer = class extends ProfilePropertyRenderer {
  constructor(userDataProfilesService, instantiationService, uriIdentityService, contextViewService) {
    super();
    this.userDataProfilesService = userDataProfilesService;
    this.instantiationService = instantiationService;
    this.uriIdentityService = uriIdentityService;
    this.contextViewService = contextViewService;
    this.templateId = "copyFrom";
    this.templates = [];
  }
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const elementDisposables = disposables.add(new DisposableStore());
    let profileElement;
    const copyFromContainer = append(parent, $(".profile-row-container.profile-copy-from-container"));
    append(copyFromContainer, $(".profile-label-element", void 0, localize(21629, null)));
    append(copyFromContainer, $(".profile-description-element", void 0, localize(21625, null)));
    const copyFromSelectBox = disposables.add(this.instantiationService.createInstance(
      SelectBox,
      [],
      0,
      this.contextViewService,
      defaultSelectBoxStyles,
      {
        useCustomDrawn: true,
        ariaLabel: localize(21628, null)
      }
    ));
    copyFromSelectBox.render(append(copyFromContainer, $(".profile-select-container")));
    const render = (profileElement2, copyFromOptions) => {
      copyFromSelectBox.setOptions(copyFromOptions);
      const id2 = profileElement2.copyFrom instanceof URI ? profileElement2.copyFrom.toString() : profileElement2.copyFrom?.id;
      const index2 = id2 ? copyFromOptions.findIndex((option2) => option2.id === id2) : 0;
      copyFromSelectBox.select(index2);
    };
    const that = this;
    return {
      set element(element) {
        profileElement = element;
        if (profileElement.root instanceof NewProfileElement) {
          const newProfileElement = profileElement.root;
          let copyFromOptions = that.getCopyFromOptions(newProfileElement);
          render(newProfileElement, copyFromOptions);
          copyFromSelectBox.setEnabled(!newProfileElement.previewProfile && !newProfileElement.disabled);
          elementDisposables.add(profileElement.root.onDidChange((e4) => {
            if (e4.copyFrom || e4.copyFromInfo) {
              copyFromOptions = that.getCopyFromOptions(newProfileElement);
              render(newProfileElement, copyFromOptions);
            }
            if (e4.preview || e4.disabled) {
              copyFromSelectBox.setEnabled(!newProfileElement.previewProfile && !newProfileElement.disabled);
            }
          }));
          elementDisposables.add(copyFromSelectBox.onDidSelect((option2) => {
            newProfileElement.copyFrom = copyFromOptions[option2.index].source;
          }));
        }
      },
      disposables,
      elementDisposables
    };
  }
  setTemplates(templates) {
    this.templates = templates;
  }
  getCopyFromOptions(profileElement) {
    const copyFromOptions = [];
    copyFromOptions.push({ text: localize(21639, null) });
    for (const [copyFromTemplate, name] of profileElement.copyFromTemplates) {
      if (!this.templates.some((template2) => this.uriIdentityService.extUri.isEqual(URI.parse(template2.url), copyFromTemplate))) {
        copyFromOptions.push({ text: `${name} (${basename2(copyFromTemplate)})`, id: copyFromTemplate.toString(), source: copyFromTemplate });
      }
    }
    if (this.templates.length) {
      copyFromOptions.push({ ...SeparatorSelectOption, decoratorRight: localize(21647, null) });
      for (const template2 of this.templates) {
        copyFromOptions.push({ text: template2.name, id: template2.url, source: URI.parse(template2.url) });
      }
    }
    copyFromOptions.push({ ...SeparatorSelectOption, decoratorRight: localize(21645, null) });
    for (const profile of this.userDataProfilesService.profiles) {
      if (!profile.isInternal) {
        copyFromOptions.push({ text: profile.name, id: profile.id, source: profile });
      }
    }
    return copyFromOptions;
  }
};

CopyFromProfileRenderer = __decorateClass([
  __decorateParam(0, IUserDataProfilesService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IUriIdentityService),
  __decorateParam(3, IContextViewService)
], CopyFromProfileRenderer);

var ContentsProfileRenderer = class extends ProfilePropertyRenderer {
  constructor(userDataProfilesService, contextMenuService, instantiationService) {
    super();
    this.userDataProfilesService = userDataProfilesService;
    this.contextMenuService = contextMenuService;
    this.instantiationService = instantiationService;
    this.templateId = "contents";
    this._onDidChangeContentHeight = this._register(new Emitter());
    this.onDidChangeContentHeight = this._onDidChangeContentHeight.event;
    this._onDidChangeSelection = this._register(new Emitter());
    this.onDidChangeSelection = this._onDidChangeSelection.event;
  }
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const elementDisposables = disposables.add(new DisposableStore());
    let profileElement;
    const configureRowContainer = append(parent, $(".profile-row-container"));
    append(configureRowContainer, $(".profile-label-element", void 0, localize(21621, null)));
    const contentsDescriptionElement = append(configureRowContainer, $(".profile-description-element"));
    const contentsTreeHeader = append(configureRowContainer, $(".profile-content-tree-header"));
    const optionsLabel = $(".options-header", void 0, $("span", void 0, localize(21670, null)));
    append(
      contentsTreeHeader,
      $(""),
      $("", void 0, localize(21621, null)),
      optionsLabel,
      $("")
    );
    const delegate = new ProfileContentTreeElementDelegate();
    const profilesContentTree = this.profilesContentTree = disposables.add(this.instantiationService.createInstance(
      WorkbenchAsyncDataTree,
      "ProfileEditor-ContentsTree",
      append(configureRowContainer, $(".profile-content-tree.file-icon-themable-tree.show-file-icons")),
      delegate,
      [
        this.instantiationService.createInstance(ExistingProfileResourceTreeRenderer),
        this.instantiationService.createInstance(NewProfileResourceTreeRenderer),
        this.instantiationService.createInstance(ProfileResourceChildTreeItemRenderer)
      ],
      this.instantiationService.createInstance(ProfileResourceTreeDataSource),
      {
        multipleSelectionSupport: false,
        horizontalScrolling: false,
        accessibilityProvider: {
          getAriaLabel(element) {
            if ((element?.element).resourceType) {
              return (element?.element).resourceType;
            }
            if ((element?.element).label) {
              return (element?.element).label;
            }
            return "";
          },
          getWidgetAriaLabel() {
            return "";
          }
        },
        identityProvider: {
          getId(element) {
            if (element?.element.handle) {
              return element.element.handle;
            }
            return "";
          }
        },
        expandOnlyOnTwistieClick: true,
        renderIndentGuides: "none" /* None */,
        enableStickyScroll: false,
        openOnSingleClick: false,
        alwaysConsumeMouseWheel: false
      }
    ));
    this.profilesContentTree.style(listStyles);
    disposables.add(toDisposable(() => this.profilesContentTree = void 0));
    disposables.add(this.profilesContentTree.onDidChangeContentHeight((height) => {
      this.profilesContentTree?.layout(height);
      if (profileElement) {
        this._onDidChangeContentHeight.fire(profileElement);
      }
    }));
    disposables.add(this.profilesContentTree.onDidChangeSelection(((e4) => {
      if (profileElement) {
        this._onDidChangeSelection.fire({ element: profileElement, selected: !!e4.elements.length });
      }
    })));
    disposables.add(this.profilesContentTree.onDidOpen(async (e4) => {
      if (!e4.browserEvent) {
        return;
      }
      if (e4.element?.element.openAction) {
        await e4.element.element.openAction.run();
      }
    }));
    disposables.add(this.profilesContentTree.onContextMenu(async (e4) => {
      if (!e4.element?.element.actions?.contextMenu?.length) {
        return;
      }
      this.contextMenuService.showContextMenu({
        getAnchor: () => e4.anchor,
        getActions: () => e4.element?.element?.actions?.contextMenu ?? [],
        getActionsContext: () => e4.element
      });
    }));
    const updateDescription = (element) => {
      clearNode(contentsDescriptionElement);
      const markdown = new MarkdownString();
      if (element.root instanceof UserDataProfileElement && element.root.profile.isDefault) {
        markdown.appendMarkdown(localize(21634, null));
      } else {
        markdown.appendMarkdown(localize(21622, null));
        if (element.root instanceof NewProfileElement) {
          const copyFromName = element.root.getCopyFromName();
          const optionName = copyFromName === this.userDataProfilesService.defaultProfile.name ? localize(21624, null, copyFromName) : copyFromName;
          if (optionName) {
            markdown.appendMarkdown(localize(21627, null, optionName, copyFromName));
          }
          markdown.appendMarkdown(localize(21633, null)).appendMarkdown(localize(21668, null));
        }
      }
      append(contentsDescriptionElement, elementDisposables.add(renderMarkdown(markdown)).element);
    };
    const that = this;
    return {
      set element(element) {
        profileElement = element;
        updateDescription(element);
        if (element.root instanceof NewProfileElement) {
          contentsTreeHeader.classList.remove("default-profile");
        } else if (element.root instanceof UserDataProfileElement) {
          contentsTreeHeader.classList.toggle("default-profile", element.root.profile.isDefault);
        }
        profilesContentTree.setInput(profileElement.root);
        elementDisposables.add(profileElement.root.onDidChange((e4) => {
          if (e4.copyFrom || e4.copyFlags || e4.flags || e4.extensions || e4.snippets || e4.preview) {
            profilesContentTree.updateChildren(element.root);
          }
          if (e4.copyFromInfo) {
            updateDescription(element);
            that._onDidChangeContentHeight.fire(element);
          }
        }));
      },
      disposables,
      elementDisposables
    };
  }
  clearSelection() {
    if (this.profilesContentTree) {
      this.profilesContentTree.setSelection([]);
      this.profilesContentTree.setFocus([]);
    }
  }
};

ContentsProfileRenderer = __decorateClass([
  __decorateParam(0, IUserDataProfilesService),
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, IInstantiationService)
], ContentsProfileRenderer);

var ProfileWorkspacesRenderer = class extends ProfilePropertyRenderer {
  constructor(labelService, uriIdentityService, fileDialogService, instantiationService) {
    super();
    this.labelService = labelService;
    this.uriIdentityService = uriIdentityService;
    this.fileDialogService = fileDialogService;
    this.instantiationService = instantiationService;
    this.templateId = "workspaces";
    this._onDidChangeContentHeight = this._register(new Emitter());
    this.onDidChangeContentHeight = this._onDidChangeContentHeight.event;
    this._onDidChangeSelection = this._register(new Emitter());
    this.onDidChangeSelection = this._onDidChangeSelection.event;
  }
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const elementDisposables = disposables.add(new DisposableStore());
    let profileElement;
    const profileWorkspacesRowContainer = append(parent, $(".profile-row-container"));
    append(profileWorkspacesRowContainer, $(".profile-label-element", void 0, localize(21643, null)));
    const profileWorkspacesDescriptionElement = append(profileWorkspacesRowContainer, $(".profile-description-element"));
    const workspacesTableContainer = append(profileWorkspacesRowContainer, $(".profile-associations-table"));
    const table = this.workspacesTable = disposables.add(this.instantiationService.createInstance(
      WorkbenchTable,
      "ProfileEditor-AssociationsTable",
      workspacesTableContainer,
      new class {
        constructor() {
          this.headerRowHeight = 30;
        }
        getHeight() {
          return 24;
        }
      }(),
      [
        {
          label: "",
          tooltip: "",
          weight: 1,
          minimumWidth: 30,
          maximumWidth: 30,
          templateId: WorkspaceUriEmptyColumnRenderer.TEMPLATE_ID,
          project(row) {
            return row;
          }
        },
        {
          label: localize(21648, null),
          tooltip: "",
          weight: 2,
          templateId: WorkspaceUriHostColumnRenderer.TEMPLATE_ID,
          project(row) {
            return row;
          }
        },
        {
          label: localize(21671, null),
          tooltip: "",
          weight: 7,
          templateId: WorkspaceUriPathColumnRenderer.TEMPLATE_ID,
          project(row) {
            return row;
          }
        },
        {
          label: "",
          tooltip: "",
          weight: 1,
          minimumWidth: 84,
          maximumWidth: 84,
          templateId: WorkspaceUriActionsColumnRenderer.TEMPLATE_ID,
          project(row) {
            return row;
          }
        }
      ],
      [
        new WorkspaceUriEmptyColumnRenderer(),
        this.instantiationService.createInstance(WorkspaceUriHostColumnRenderer),
        this.instantiationService.createInstance(WorkspaceUriPathColumnRenderer),
        this.instantiationService.createInstance(WorkspaceUriActionsColumnRenderer)
      ],
      {
        horizontalScrolling: false,
        alwaysConsumeMouseWheel: false,
        openOnSingleClick: false,
        multipleSelectionSupport: false,
        accessibilityProvider: {
          getAriaLabel: (item) => {
            const hostLabel = getHostLabel(this.labelService, item.workspace);
            if (hostLabel === void 0 || hostLabel.length === 0) {
              return localize(21680, null, this.labelService.getUriLabel(item.workspace));
            }
            return localize(21682, null, this.labelService.getUriLabel(item.workspace), hostLabel);
          },
          getWidgetAriaLabel: () => localize(21681, null)
        },
        identityProvider: {
          getId(element) {
            return element.workspace.toString();
          }
        }
      }
    ));
    this.workspacesTable.style(listStyles);
    disposables.add(toDisposable(() => this.workspacesTable = void 0));
    disposables.add(this.workspacesTable.onDidChangeSelection(((e4) => {
      if (profileElement) {
        this._onDidChangeSelection.fire({ element: profileElement, selected: !!e4.elements.length });
      }
    })));
    const addButtonBarElement = append(profileWorkspacesRowContainer, $(".profile-workspaces-button-container"));
    const buttonBar = disposables.add(new ButtonBar(addButtonBarElement));
    const addButton = this._register(buttonBar.addButton({ title: localize(21615, null), ...defaultButtonStyles }));
    addButton.label = localize(21615, null);
    disposables.add(addButton.onDidClick(async () => {
      const uris = await this.fileDialogService.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: true,
        openLabel: localize(21616, null),
        title: localize(21617, null)
      });
      if (uris) {
        if (profileElement?.root instanceof UserDataProfileElement) {
          profileElement.root.updateWorkspaces(uris, []);
        }
      }
    }));
    disposables.add(table.onDidOpen((item) => {
      if (item?.element) {
        item.element.profileElement.openWorkspace(item.element.workspace);
      }
    }));
    const updateTable = () => {
      if (profileElement?.root instanceof UserDataProfileElement && profileElement.root.workspaces?.length) {
        profileWorkspacesDescriptionElement.textContent = localize(21644, null);
        workspacesTableContainer.classList.remove("hide");
        table.splice(
          0,
          table.length,
          profileElement.root.workspaces.map((workspace) => ({ workspace, profileElement: profileElement.root })).sort((a, b) => this.uriIdentityService.extUri.compare(a.workspace, b.workspace))
        );
        this.layout();
      } else {
        profileWorkspacesDescriptionElement.textContent = localize(21665, null);
        workspacesTableContainer.classList.add("hide");
      }
    };
    const that = this;
    return {
      set element(element) {
        profileElement = element;
        if (element.root instanceof UserDataProfileElement) {
          updateTable();
        }
        elementDisposables.add(profileElement.root.onDidChange((e4) => {
          if (profileElement && e4.workspaces) {
            updateTable();
            that._onDidChangeContentHeight.fire(profileElement);
          }
        }));
      },
      disposables,
      elementDisposables
    };
  }
  layout() {
    if (this.workspacesTable) {
      this.workspacesTable.layout(this.workspacesTable.length * 24 + 30, void 0);
    }
  }
  clearSelection() {
    if (this.workspacesTable) {
      this.workspacesTable.setSelection([]);
      this.workspacesTable.setFocus([]);
    }
  }
};

ProfileWorkspacesRenderer = __decorateClass([
  __decorateParam(0, ILabelService),
  __decorateParam(1, IUriIdentityService),
  __decorateParam(2, IFileDialogService),
  __decorateParam(3, IInstantiationService)
], ProfileWorkspacesRenderer);

var ExistingProfileResourceTreeRenderer = class extends AbstractProfileResourceTreeRenderer {
  constructor(instantiationService) {
    super();
    this.instantiationService = instantiationService;
    this.templateId = ExistingProfileResourceTreeRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "ExistingProfileResourceTemplate";
  }
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const container2 = append(parent, $(".profile-tree-item-container.existing-profile-resource-type-container"));
    const label3 = append(container2, $(".profile-resource-type-label"));
    const radio = disposables.add(new Radio({ items: [] }));
    append(append(container2, $(".profile-resource-options-container")), radio.domNode);
    const actionsContainer = append(container2, $(".profile-resource-actions-container"));
    const actionBar3 = disposables.add(this.instantiationService.createInstance(
      WorkbenchToolBar,
      actionsContainer,
      {
        hoverDelegate: disposables.add(createInstantHoverDelegate()),
        highlightToggledItems: true
      }
    ));
    return { label: label3, radio, actionBar: actionBar3, disposables, elementDisposables: disposables.add(new DisposableStore()) };
  }
  renderElement({ element: profileResourceTreeElement }, index2, templateData) {
    templateData.elementDisposables.clear();
    const { element, root } = profileResourceTreeElement;
    if (!(root instanceof UserDataProfileElement)) {
      throw new Error("ExistingProfileResourceTreeRenderer can only render existing profile element");
    }
    if (isString(element) || !isProfileResourceTypeElement(element)) {
      throw new Error("Invalid profile resource element");
    }
    const updateRadioItems = () => {
      templateData.radio.setItems([
        {
          text: localize(21631, null),
          tooltip: localize(21632, null, resourceTypeTitle),
          isActive: root.getFlag(element.resourceType)
        },
        {
          text: root.name,
          tooltip: localize(21630, null, resourceTypeTitle, root.name),
          isActive: !root.getFlag(element.resourceType)
        }
      ]);
    };
    const resourceTypeTitle = this.getResourceTypeTitle(element.resourceType);
    templateData.label.textContent = resourceTypeTitle;
    if (root instanceof UserDataProfileElement && root.profile.isDefault) {
      templateData.radio.domNode.classList.add("hide");
    } else {
      templateData.radio.domNode.classList.remove("hide");
      updateRadioItems();
      templateData.elementDisposables.add(root.onDidChange((e4) => {
        if (e4.name) {
          updateRadioItems();
        }
      }));
      templateData.elementDisposables.add(templateData.radio.onDidSelect((index3) => root.setFlag(element.resourceType, index3 === 0)));
    }
    const actions = [];
    if (element.openAction) {
      actions.push(element.openAction);
    }
    if (element.actions?.primary) {
      actions.push(...element.actions.primary);
    }
    templateData.actionBar.setActions(actions);
  }
};

ExistingProfileResourceTreeRenderer = __decorateClass([
  __decorateParam(0, IInstantiationService)
], ExistingProfileResourceTreeRenderer);

var NewProfileResourceTreeRenderer = class extends AbstractProfileResourceTreeRenderer {
  constructor(userDataProfilesService, instantiationService) {
    super();
    this.userDataProfilesService = userDataProfilesService;
    this.instantiationService = instantiationService;
    this.templateId = NewProfileResourceTreeRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "NewProfileResourceTemplate";
  }
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const container2 = append(parent, $(".profile-tree-item-container.new-profile-resource-type-container"));
    const labelContainer = append(container2, $(".profile-resource-type-label-container"));
    const label3 = append(labelContainer, $("span.profile-resource-type-label"));
    const radio = disposables.add(new Radio({ items: [] }));
    append(append(container2, $(".profile-resource-options-container")), radio.domNode);
    const actionsContainer = append(container2, $(".profile-resource-actions-container"));
    const actionBar3 = disposables.add(this.instantiationService.createInstance(
      WorkbenchToolBar,
      actionsContainer,
      {
        hoverDelegate: disposables.add(createInstantHoverDelegate()),
        highlightToggledItems: true
      }
    ));
    return { label: label3, radio, actionBar: actionBar3, disposables, elementDisposables: disposables.add(new DisposableStore()) };
  }
  renderElement({ element: profileResourceTreeElement }, index2, templateData) {
    templateData.elementDisposables.clear();
    const { element, root } = profileResourceTreeElement;
    if (!(root instanceof NewProfileElement)) {
      throw new Error("NewProfileResourceTreeRenderer can only render new profile element");
    }
    if (isString(element) || !isProfileResourceTypeElement(element)) {
      throw new Error("Invalid profile resource element");
    }
    const resourceTypeTitle = this.getResourceTypeTitle(element.resourceType);
    templateData.label.textContent = resourceTypeTitle;
    const renderRadioItems = () => {
      const options3 = [
        {
          text: localize(21631, null),
          tooltip: localize(21632, null, resourceTypeTitle)
        },
        {
          text: localize(21666, null),
          tooltip: localize(21667, null, resourceTypeTitle)
        }
      ];
      const copyFromName = root.getCopyFromName();
      const name = copyFromName === this.userDataProfilesService.defaultProfile.name ? localize(21624, null, copyFromName) : copyFromName;
      if (root.copyFrom && name) {
        templateData.radio.setItems([
          {
            text: name,
            tooltip: name ? localize(21626, null, resourceTypeTitle, name) : localize(21623, null)
          },
          ...options3
        ]);
        templateData.radio.setActiveItem(root.getCopyFlag(element.resourceType) ? 0 : root.getFlag(element.resourceType) ? 1 : 2);
      } else {
        templateData.radio.setItems(options3);
        templateData.radio.setActiveItem(root.getFlag(element.resourceType) ? 0 : 1);
      }
    };
    if (root.copyFrom) {
      templateData.elementDisposables.add(templateData.radio.onDidSelect((index3) => {
        root.setFlag(element.resourceType, index3 === 1);
        root.setCopyFlag(element.resourceType, index3 === 0);
      }));
    } else {
      templateData.elementDisposables.add(templateData.radio.onDidSelect((index3) => {
        root.setFlag(element.resourceType, index3 === 0);
      }));
    }
    renderRadioItems();
    templateData.radio.setEnabled(!root.disabled && !root.previewProfile);
    templateData.elementDisposables.add(root.onDidChange((e4) => {
      if (e4.disabled || e4.preview) {
        templateData.radio.setEnabled(!root.disabled && !root.previewProfile);
      }
      if (e4.copyFrom || e4.copyFromInfo) {
        renderRadioItems();
      }
    }));
    const actions = [];
    if (element.openAction) {
      actions.push(element.openAction);
    }
    if (element.actions?.primary) {
      actions.push(...element.actions.primary);
    }
    templateData.actionBar.setActions(actions);
  }
};

NewProfileResourceTreeRenderer = __decorateClass([
  __decorateParam(0, IUserDataProfilesService),
  __decorateParam(1, IInstantiationService)
], NewProfileResourceTreeRenderer);

var ProfileResourceChildTreeItemRenderer = class extends AbstractProfileResourceTreeRenderer {
  constructor(instantiationService) {
    super();
    this.instantiationService = instantiationService;
    this.templateId = ProfileResourceChildTreeItemRenderer.TEMPLATE_ID;
    this.labels = instantiationService.createInstance(ResourceLabels, DEFAULT_LABELS_CONTAINER);
    this.hoverDelegate = this._register(instantiationService.createInstance(WorkbenchHoverDelegate, "mouse", void 0, {}));
  }
  static {
    this.TEMPLATE_ID = "ProfileResourceChildTreeItemTemplate";
  }
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const container2 = append(parent, $(".profile-tree-item-container.profile-resource-child-container"));
    const checkbox = disposables.add(new Checkbox("", false, defaultCheckboxStyles));
    append(container2, checkbox.domNode);
    const resourceLabel = disposables.add(this.labels.create(container2, { hoverDelegate: this.hoverDelegate }));
    const actionsContainer = append(container2, $(".profile-resource-actions-container"));
    const actionBar3 = disposables.add(this.instantiationService.createInstance(
      WorkbenchToolBar,
      actionsContainer,
      {
        hoverDelegate: disposables.add(createInstantHoverDelegate()),
        highlightToggledItems: true
      }
    ));
    return { checkbox, resourceLabel, actionBar: actionBar3, disposables, elementDisposables: disposables.add(new DisposableStore()) };
  }
  renderElement({ element: profileResourceTreeElement }, index2, templateData) {
    templateData.elementDisposables.clear();
    const { element } = profileResourceTreeElement;
    if (isString(element) || !isProfileResourceChildElement(element)) {
      throw new Error("Invalid profile resource element");
    }
    if (element.checkbox) {
      templateData.checkbox.domNode.setAttribute("tabindex", "0");
      templateData.checkbox.domNode.classList.remove("hide");
      templateData.checkbox.checked = element.checkbox.isChecked;
      templateData.checkbox.domNode.ariaLabel = element.checkbox.accessibilityInformation?.label ?? "";
      if (element.checkbox.accessibilityInformation?.role) {
        templateData.checkbox.domNode.role = element.checkbox.accessibilityInformation.role;
      }
    } else {
      templateData.checkbox.domNode.removeAttribute("tabindex");
      templateData.checkbox.domNode.classList.add("hide");
    }
    templateData.resourceLabel.setResource(
      {
        name: element.resource ? basename2(element.resource) : element.label,
        description: element.description,
        resource: element.resource
      },
      {
        forceLabel: true,
        icon: element.icon,
        hideIcon: !element.resource && !element.icon
      }
    );
    const actions = [];
    if (element.openAction) {
      actions.push(element.openAction);
    }
    if (element.actions?.primary) {
      actions.push(...element.actions.primary);
    }
    templateData.actionBar.setActions(actions);
  }
};

ProfileResourceChildTreeItemRenderer = __decorateClass([
  __decorateParam(0, IInstantiationService)
], ProfileResourceChildTreeItemRenderer);

var WorkspaceUriEmptyColumnRenderer = class _WorkspaceUriEmptyColumnRenderer {
  constructor() {
    this.templateId = _WorkspaceUriEmptyColumnRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "empty";
  }
  renderTemplate(container2) {
    return {};
  }
  renderElement(item, index2, templateData) {
  }
  disposeTemplate() {
  }
};

var WorkspaceUriHostColumnRenderer = class {
  constructor(uriIdentityService, labelService) {
    this.uriIdentityService = uriIdentityService;
    this.labelService = labelService;
    this.templateId = WorkspaceUriHostColumnRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "host";
  }
  renderTemplate(container2) {
    const disposables = new DisposableStore();
    const renderDisposables = disposables.add(new DisposableStore());
    const element = container2.appendChild($(".host"));
    const hostContainer = element.appendChild($("div.host-label"));
    const buttonBarContainer = element.appendChild($("div.button-bar"));
    return {
      element,
      hostContainer,
      buttonBarContainer,
      disposables,
      renderDisposables
    };
  }
  renderElement(item, index2, templateData) {
    templateData.renderDisposables.clear();
    templateData.renderDisposables.add({ dispose: () => {
      clearNode(templateData.buttonBarContainer);
    } });
    templateData.hostContainer.innerText = getHostLabel(this.labelService, item.workspace);
    templateData.element.classList.toggle("current-workspace", this.uriIdentityService.extUri.isEqual(item.workspace, item.profileElement.getCurrentWorkspace()));
    templateData.hostContainer.style.display = "";
    templateData.buttonBarContainer.style.display = "none";
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};

WorkspaceUriHostColumnRenderer = __decorateClass([
  __decorateParam(0, IUriIdentityService),
  __decorateParam(1, ILabelService)
], WorkspaceUriHostColumnRenderer);

var WorkspaceUriPathColumnRenderer = class {
  constructor(uriIdentityService, hoverService) {
    this.uriIdentityService = uriIdentityService;
    this.hoverService = hoverService;
    this.templateId = WorkspaceUriPathColumnRenderer.TEMPLATE_ID;
    this.hoverDelegate = getDefaultHoverDelegate("mouse");
  }
  static {
    this.TEMPLATE_ID = "path";
  }
  renderTemplate(container2) {
    const disposables = new DisposableStore();
    const element = container2.appendChild($(".path"));
    const pathLabel = element.appendChild($("div.path-label"));
    const pathHover = disposables.add(this.hoverService.setupManagedHover(this.hoverDelegate, pathLabel, ""));
    const renderDisposables = disposables.add(new DisposableStore());
    return {
      element,
      pathLabel,
      pathHover,
      disposables,
      renderDisposables
    };
  }
  renderElement(item, index2, templateData) {
    templateData.renderDisposables.clear();
    const stringValue2 = this.formatPath(item.workspace);
    templateData.pathLabel.innerText = stringValue2;
    templateData.element.classList.toggle("current-workspace", this.uriIdentityService.extUri.isEqual(item.workspace, item.profileElement.getCurrentWorkspace()));
    templateData.pathHover.update(stringValue2);
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
    templateData.renderDisposables.dispose();
  }
  formatPath(uri4) {
    if (uri4.scheme === Schemas.file) {
      return normalizeDriveLetter(uri4.fsPath);
    }
    if (uri4.path.startsWith(posix.sep)) {
      const pathWithoutLeadingSeparator = uri4.path.substring(1);
      const isWindowsPath = hasDriveLetter(pathWithoutLeadingSeparator, true);
      if (isWindowsPath) {
        return normalizeDriveLetter(win32.normalize(pathWithoutLeadingSeparator), true);
      }
    }
    return uri4.path;
  }
};

WorkspaceUriPathColumnRenderer = __decorateClass([
  __decorateParam(0, IUriIdentityService),
  __decorateParam(1, IHoverService)
], WorkspaceUriPathColumnRenderer);

var ChangeProfileAction = class {
  constructor(item, userDataProfilesService, uriIdentityService, environmentService) {
    this.item = item;
    this.userDataProfilesService = userDataProfilesService;
    this.id = "changeProfile";
    this.label = "Change Profile";
    this.class = ThemeIcon.asClassName(editIcon2);
    this.tooltip = localize(21619, null);
    this.checked = false;
    this.enabled = !uriIdentityService.extUri.isEqual(item.workspace, environmentService.agentSessionsWorkspace);
  }
  run() {
  }
  getSwitchProfileActions() {
    return this.userDataProfilesService.profiles.filter((profile) => !profile.isInternal).sort((a, b) => a.isDefault ? -1 : b.isDefault ? 1 : a.name.localeCompare(b.name)).map((profile) => ({
      id: `switchProfileTo${profile.id}`,
      label: profile.name,
      class: void 0,
      enabled: true,
      checked: profile.id === this.item.profileElement.profile.id,
      tooltip: "",
      run: () => {
        if (profile.id === this.item.profileElement.profile.id) {
          return;
        }
        this.userDataProfilesService.updateProfile(profile, { workspaces: [...profile.workspaces ?? [], this.item.workspace] });
      }
    }));
  }
};

ChangeProfileAction = __decorateClass([
  __decorateParam(1, IUserDataProfilesService),
  __decorateParam(2, IUriIdentityService),
  __decorateParam(3, IEnvironmentService)
], ChangeProfileAction);

var WorkspaceUriActionsColumnRenderer = class {
  constructor(userDataProfilesService, userDataProfileManagementService, contextMenuService, uriIdentityService, environmentService) {
    this.userDataProfilesService = userDataProfilesService;
    this.userDataProfileManagementService = userDataProfileManagementService;
    this.contextMenuService = contextMenuService;
    this.uriIdentityService = uriIdentityService;
    this.environmentService = environmentService;
    this.templateId = WorkspaceUriActionsColumnRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "actions";
  }
  renderTemplate(container2) {
    const disposables = new DisposableStore();
    const element = container2.appendChild($(".profile-workspaces-actions-container"));
    const hoverDelegate = disposables.add(createInstantHoverDelegate());
    const actionBar3 = disposables.add(new ActionBar(element, {
      hoverDelegate,
      actionViewItemProvider: (action) => {
        if (action instanceof ChangeProfileAction) {
          return new DropdownMenuActionViewItem(action, { getActions: () => action.getSwitchProfileActions() }, this.contextMenuService, {
            classNames: action.class,
            hoverDelegate
          });
        }
        return void 0;
      }
    }));
    return { actionBar: actionBar3, disposables };
  }
  renderElement(item, index2, templateData) {
    templateData.actionBar.clear();
    const actions = [];
    actions.push(this.createOpenAction(item));
    actions.push(new ChangeProfileAction(item, this.userDataProfilesService, this.uriIdentityService, this.environmentService));
    actions.push(this.createDeleteAction(item));
    templateData.actionBar.push(actions, { icon: true });
  }
  createOpenAction(item) {
    return {
      label: "",
      class: ThemeIcon.asClassName(Codicon.window),
      enabled: !this.uriIdentityService.extUri.isEqual(item.workspace, item.profileElement.getCurrentWorkspace()),
      id: "openWorkspace",
      tooltip: localize(21669, null),
      run: () => item.profileElement.openWorkspace(item.workspace)
    };
  }
  createDeleteAction(item) {
    const isAgentSessionsWorkspace = this.uriIdentityService.extUri.isEqual(item.workspace, this.environmentService.agentSessionsWorkspace);
    return {
      label: "",
      class: ThemeIcon.asClassName(removeIcon),
      enabled: this.userDataProfileManagementService.getDefaultProfileToUse().id !== item.profileElement.profile.id && !isAgentSessionsWorkspace,
      id: "deleteTrustedUri",
      tooltip: localize(21637, null),
      run: () => item.profileElement.updateWorkspaces([], [item.workspace])
    };
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};

WorkspaceUriActionsColumnRenderer = __decorateClass([
  __decorateParam(0, IUserDataProfilesService),
  __decorateParam(1, IUserDataProfileManagementService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IUriIdentityService),
  __decorateParam(4, IEnvironmentService)
], WorkspaceUriActionsColumnRenderer);

function getHostLabel(labelService, workspaceUri) {
  return workspaceUri.authority ? labelService.getHostLabel(workspaceUri.scheme, workspaceUri.authority) : localize(21659, null);
}

var UserDataProfilesEditorInput = class extends EditorInput {
  constructor(instantiationService) {
    super();
    this.instantiationService = instantiationService;
    this.resource = void 0;
    this._dirty = false;
    this.model = UserDataProfilesEditorModel.getInstance(this.instantiationService);
    this._register(this.model.onDidChange((e4) => this.dirty = this.model.profiles.some((profile) => profile instanceof NewProfileElement)));
  }
  static {
    this.ID = "workbench.input.userDataProfiles";
  }
  get dirty() {
    return this._dirty;
  }
  set dirty(dirty) {
    if (this._dirty !== dirty) {
      this._dirty = dirty;
      this._onDidChangeDirty.fire();
    }
  }
  get capabilities() {
    return 2048 /* RequiresModal */;
  }
  get typeId() {
    return UserDataProfilesEditorInput.ID;
  }
  getName() {
    return localize(21685, null);
  }
  getIcon() {
    return defaultUserDataProfileIcon;
  }
  async resolve() {
    await this.model.resolve();
    return this.model;
  }
  isDirty() {
    return this.dirty;
  }
  async save() {
    await this.model.saveNewProfile();
    return this;
  }
  async revert() {
    this.model.revert();
  }
  matches(otherInput) {
    return otherInput instanceof UserDataProfilesEditorInput;
  }
  dispose() {
    for (const profile of this.model.profiles) {
      if (profile instanceof UserDataProfileElement) {
        profile.reset();
      }
    }
    super.dispose();
  }
};

UserDataProfilesEditorInput = __decorateClass([
  __decorateParam(0, IInstantiationService)
], UserDataProfilesEditorInput);

var UserDataProfilesEditorInputSerializer = class {
  canSerialize(editorInput) {
    return true;
  }
  serialize(editorInput) {
    return "";
  }
  deserialize(instantiationService) {
    return instantiationService.createInstance(UserDataProfilesEditorInput);
  }
};
export { getHostLabel, editIcon2, removeIcon, profilesSashBorder, listStyles, UserDataProfilesEditor, ProfileElementDelegate, ProfileElementRenderer, ProfileWidget, ProfileTreeDelegate, ProfileTreeDataSource, ProfileContentTreeElementDelegate, ProfileResourceTreeDataSource, AbstractProfileResourceTreeRenderer, ProfilePropertyRenderer, ProfileNameRenderer, ProfileIconRenderer, UseForCurrentWindowPropertyRenderer, UseAsDefaultProfileRenderer, CopyFromProfileRenderer, ContentsProfileRenderer, ProfileWorkspacesRenderer, ExistingProfileResourceTreeRenderer, NewProfileResourceTreeRenderer, ProfileResourceChildTreeItemRenderer, WorkspaceUriEmptyColumnRenderer, WorkspaceUriHostColumnRenderer, WorkspaceUriPathColumnRenderer, ChangeProfileAction, WorkspaceUriActionsColumnRenderer, UserDataProfilesEditorInput, UserDataProfilesEditorInputSerializer };
