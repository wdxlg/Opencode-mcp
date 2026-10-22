// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/toolsListWidget.ts
import { $, EventHelper, EventType, addDisposableListener, addStandardDisposableListener, append, clearNode, getWindow, isAncestor } from "./module-0075.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { observableValue } from "./module-0048.mjs";
import { Delayer } from "./module-0036.mjs";
import { localize } from "./module-0001.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { autorun } from "./module-0052.mjs";
import { IAgentHostToolSetEnablementService, countEnabledCustomizationTools, getToolSetTriState, isToolEnabledInSet } from "./module-1749.mjs";
import { URI } from "./module-0032.mjs";
import { InputBox } from "./module-0600.mjs";
import { defaultButtonStyles, defaultCheckboxStyles, defaultInputBoxStyles } from "./module-0513.mjs";
import { Button } from "./module-0546.mjs";
import { Codicon } from "./module-0085.mjs";
import { WorkbenchList } from "./module-0636.mjs";
import { GalleryItemRenderer } from "./module-2630.mjs";
import { ILanguageModelToolsService, ToolDataSource } from "./module-0991.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { derived } from "./module-0054.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { matchesContiguousSubString } from "./module-0453.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { Checkbox, TriStateCheckbox } from "./module-0549.mjs";
import { HighlightedLabel } from "./module-0639.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { Action } from "./module-0082.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService, IContextViewService } from "./module-0488.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IExtensionsWorkbenchService } from "./module-1023.mjs";
import { IExtensionManifestPropertiesService } from "./module-1049.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/toolsListWidget.ts
var $87 = $;

var TOOLS_MARKETPLACE_QUERY = "language model tools";

var TOOLS_GALLERY_ITEM_HEIGHT = 62;

var TOOLS_GALLERY_ITEM_TEMPLATE_ID = "toolsGalleryItem";

var ToolsGalleryItemDelegate = class {
  getHeight() {
    return TOOLS_GALLERY_ITEM_HEIGHT;
  }
  getTemplateId() {
    return TOOLS_GALLERY_ITEM_TEMPLATE_ID;
  }
};

var ToolsGalleryItemProvider = class {
  constructor(_extensionsWorkbenchService) {
    this._extensionsWorkbenchService = _extensionsWorkbenchService;
  }
  getLabel(extension) {
    return extension.displayName;
  }
  getPublisherDisplayName(extension) {
    return extension.publisherDisplayName;
  }
  getDescription(extension) {
    return extension.description;
  }
  getInstallState(extension) {
    switch (extension.state) {
      case 1 /* Installed */:
        return 2 /* Installed */;
      case 0 /* Installing */:
        return 1 /* Installing */;
      default:
        return 0 /* Uninstalled */;
    }
  }
  async install(extension) {
    await this._extensionsWorkbenchService.install(extension);
  }
  onDidChangeInstallState(extension, listener) {
    return this._extensionsWorkbenchService.onChange((changed) => {
      if (!changed || changed.identifier.id === extension.identifier.id) {
        listener();
      }
    });
  }
};

var ToolsListWidget = class extends Disposable {
  constructor(_sessionType, _toolsService, _enablementService, _contextViewService, _contextMenuService, _dialogService, _openerService, _instantiationService, _extensionsWorkbenchService, _extensionManifestPropertiesService, _environmentService) {
    super();
    this._sessionType = _sessionType;
    this._toolsService = _toolsService;
    this._enablementService = _enablementService;
    this._contextViewService = _contextViewService;
    this._contextMenuService = _contextMenuService;
    this._dialogService = _dialogService;
    this._openerService = _openerService;
    this._instantiationService = _instantiationService;
    this._extensionsWorkbenchService = _extensionsWorkbenchService;
    this._extensionManifestPropertiesService = _extensionManifestPropertiesService;
    this._environmentService = _environmentService;
    this._onDidChangeItemCount = this._register(new Emitter());
    this.onDidChangeItemCount = this._onDidChangeItemCount.event;
    this._onDidSelectExtension = this._register(new Emitter());
    this.onDidSelectExtension = this._onDidSelectExtension.event;
    this._rowStore = this._register(new DisposableStore());
    this._searchQuery = observableValue("toolsSearchQuery", "");
    this._expanded = observableValue("toolsExpanded", /* @__PURE__ */ new Set());
    this._delayedSearch = this._register(new Delayer(200));
    this._lastCount = -1;
    this._browseMode = false;
    this._lastHeight = 0;
    this._lastWidth = 0;
    this._rows = [];
    this._rowByElement = /* @__PURE__ */ new Map();
    this._staticReadOnlySets = this._createStaticReadOnlySets();
    this.element = $87(".tools-list-widget");
    this._createHeader();
    this._createSearchRow();
    this._treeContainer = $87(".tools-list-tree");
    this._treeContainer.setAttribute("role", "tree");
    this._treeContainer.setAttribute("aria-label", localize(9848, null));
    this._register(addStandardDisposableListener(this._treeContainer, EventType.KEY_DOWN, (e4) => this._onTreeKeyDown(e4)));
    this._register(addDisposableListener(this._treeContainer, EventType.FOCUS_IN, (e4) => {
      const row = this._rowFromTarget(e4.target);
      if (row) {
        this._setRovingRow(row);
      }
    }));
    this._treeScrollable = this._register(new DomScrollableElement(this._treeContainer, {
      horizontal: 2 /* Hidden */,
      vertical: 1 /* Auto */,
      useShadows: false
    }));
    const treeScrollableNode = this._treeScrollable.getDomNode();
    treeScrollableNode.classList.add("tools-list-tree-scrollable");
    this.element.appendChild(treeScrollableNode);
    this._createGallery();
    this._register(toDisposable(() => this._galleryCts?.dispose(true)));
    const viewModel = this._createViewModel();
    this._register(autorun((reader) => {
      this._render(viewModel.read(reader));
    }));
    this._register(autorun((reader) => {
      const count2 = countEnabledCustomizationTools(this._toolsService.toolSets.read(reader), this._readState(reader), reader);
      if (count2 !== this._lastCount) {
        this._lastCount = count2;
        this._onDidChangeItemCount.fire(count2);
      }
    }));
  }
  _createHeader() {
    this._header = append(this.element, $87(".section-title-header"));
    append(append(this._header, $87(".section-title-row")), $87("h2.section-title")).textContent = localize(9839, null);
    const description = append(this._header, $87("p.section-title-description"));
    append(description, $87("span.section-title-description-text")).textContent = localize(9838, null);
    description.appendChild(document.createTextNode(" "));
    const learnMore = append(description, $87("a.section-title-link"));
    learnMore.textContent = localize(9828, null);
    learnMore.href = "https://code.visualstudio.com/docs/agent-customization/tools?referrer=in-product";
    this._register(addDisposableListener(learnMore, "click", (e4) => {
      e4.preventDefault();
      void this._openerService.open(URI.parse(learnMore.href));
    }));
  }
  _createSearchRow() {
    this._searchRow = append(this.element, $87(".tools-list-search-and-button-container"));
    const searchContainer = append(this._searchRow, $87(".tools-list-search-container"));
    this._searchInput = this._register(new InputBox(searchContainer, this._contextViewService, {
      placeholder: localize(9830, null),
      inputBoxStyles: defaultInputBoxStyles,
      ariaLabel: localize(9843, null)
    }));
    this._register(this._searchInput.onDidChange(() => {
      this._delayedSearch.trigger(() => {
        if (this._browseMode) {
          void this._queryGallery();
        } else {
          this._searchQuery.set(this._searchInput.value, void 0);
        }
      }).catch(() => {
      });
    }));
    if (!this._environmentService.isSessionsWindow) {
      const browseLabel = localize(9834, null);
      this._browseButtonContainer = append(this._searchRow, $87(".tools-list-browse-button-container"));
      const browseButton = this._register(new Button(this._browseButtonContainer, { ...defaultButtonStyles, secondary: true, supportIcons: true, title: browseLabel, ariaLabel: browseLabel }));
      browseButton.label = `$(${Codicon.library.id}) ${browseLabel}`;
      this._register(browseButton.onDidClick(() => this._setBrowseMode(true)));
    }
    const backLabel = localize(9831, null);
    this._backButtonContainer = append(this._searchRow, $87(".tools-list-browse-button-container"));
    this._backButtonContainer.style.display = "none";
    const backButton2 = this._register(new Button(this._backButtonContainer, { ...defaultButtonStyles, secondary: true, supportIcons: true, title: backLabel, ariaLabel: backLabel }));
    backButton2.label = `$(${Codicon.arrowLeft.id}) ${backLabel}`;
    this._register(backButton2.onDidClick(() => this._setBrowseMode(false)));
  }
  _createGallery() {
    this._galleryContainer = append(this.element, $87(".tools-gallery-container"));
    this._galleryContainer.style.display = "none";
    this._galleryEmpty = append(this._galleryContainer, $87(".list-empty-state"));
    this._galleryEmpty.style.display = "none";
    this._galleryListContainer = append(this._galleryContainer, $87(".tools-gallery-list"));
    this._galleryList = this._register(this._instantiationService.createInstance(
      WorkbenchList,
      "ToolsMarketplaceList",
      this._galleryListContainer,
      new ToolsGalleryItemDelegate(),
      [new GalleryItemRenderer(TOOLS_GALLERY_ITEM_TEMPLATE_ID, new ToolsGalleryItemProvider(this._extensionsWorkbenchService))],
      {
        multipleSelectionSupport: false,
        horizontalScrolling: false,
        accessibilityProvider: {
          getAriaLabel: (extension) => extension.displayName,
          getWidgetAriaLabel: () => localize(9840, null)
        },
        identityProvider: { getId: (extension) => extension.identifier.id }
      }
    ));
    this._register(this._galleryList.onDidOpen((e4) => {
      if (e4.element) {
        this._onDidSelectExtension.fire(e4.element);
      }
    }));
    this._register(this._galleryList.onContextMenu((e4) => this._onGalleryContextMenu(e4)));
  }
  _readState(reader) {
    return this._enablementService.observe(this._sessionType).read(reader);
  }
  _createStaticReadOnlySets() {
    const tools = COPILOT_CLI_TOOLS.map((t2) => ({
      id: `copilot-cli:${t2.name}`,
      displayName: t2.name,
      modelDescription: t2.description,
      source: ToolDataSource.Internal,
      canBeReferencedInPrompt: false
    }));
    const copilotCliSet = {
      id: "copilot-cli",
      referenceName: "copilotCli",
      icon: Codicon.copilot,
      source: ToolDataSource.Internal,
      description: localize(9807, null),
      detail: localize(9808, null),
      getTools: () => tools
    };
    return [copilotCliSet];
  }
  _createViewModel() {
    const extensionsChanged = observableSignalFromEvent(this, this._extensionsWorkbenchService.onChange);
    return derived((reader) => {
      extensionsChanged.read(reader);
      const query = this._searchQuery.read(reader).trim();
      const result = [];
      for (const ts of [...this._toolsService.toolSets.read(reader), ...this._staticReadOnlySets]) {
        const vm = this._toViewModel(reader, ts, query);
        if (vm) {
          result.push(vm);
        }
      }
      result.sort((a, b) => sortKey(a.toolSet).localeCompare(sortKey(b.toolSet)));
      return result;
    });
  }
  _toViewModel(reader, ts, query) {
    if (ts.deprecated) {
      return void 0;
    }
    if (ts.source.type === "extension") {
      const extensionId = ts.source.extensionId;
      const installed = this._extensionsWorkbenchService.local.find((e4) => ExtensionIdentifier.equals(e4.identifier.id, extensionId));
      if (!installed || installed.state === 2 /* Uninstalling */ || installed.state === 3 /* Uninstalled */) {
        return void 0;
      }
    }
    const memberTools = Array.from(ts.getTools(reader));
    if (memberTools.length === 0) {
      return void 0;
    }
    const allToolIds = memberTools.map((t2) => t2.id);
    let visibleTools = memberTools.map((tool) => ({ tool }));
    let nameMatches;
    if (query) {
      nameMatches = matchesContiguousSubString(query, ts.description ?? ts.referenceName) ?? void 0;
      if (nameMatches) {
        visibleTools = memberTools.map((tool) => ({ tool, nameMatches: matchesContiguousSubString(query, tool.displayName ?? tool.id) ?? void 0 }));
      } else {
        visibleTools = [];
        for (const tool of memberTools) {
          const toolMatches = matchesContiguousSubString(query, tool.displayName ?? tool.id);
          if (toolMatches) {
            visibleTools.push({ tool, nameMatches: toolMatches });
          }
        }
        if (visibleTools.length === 0) {
          return void 0;
        }
      }
    }
    return {
      toolSet: ts,
      allToolIds,
      visibleTools,
      nameMatches,
      forceExpanded: query !== "",
      readOnly: ts.id === "copilot-cli"
    };
  }
  layout(height, width2) {
    this._lastHeight = height;
    this._lastWidth = width2;
    this._searchInput.layout();
    this._treeScrollable.scanDomNode();
    const galleryOffset = this._galleryContainer.getBoundingClientRect().top - this.element.getBoundingClientRect().top;
    this._galleryList.layout(Math.max(0, height - galleryOffset), width2);
  }
  /** Enters/leaves marketplace browse mode, swapping the tree for the gallery list. */
  _setBrowseMode(browse) {
    if (browse && this._environmentService.isSessionsWindow) {
      return;
    }
    if (this._browseMode === browse) {
      return;
    }
    this._browseMode = browse;
    this._treeScrollable.getDomNode().style.display = browse ? "none" : "";
    this._galleryContainer.style.display = browse ? "" : "none";
    if (this._browseButtonContainer) {
      this._browseButtonContainer.style.display = browse ? "none" : "";
    }
    this._backButtonContainer.style.display = browse ? "" : "none";
    this._searchInput.setPlaceHolder(browse ? localize(9836, null) : localize(9830, null));
    this._searchInput.value = "";
    if (browse) {
      void this._queryGallery();
    } else {
      this._galleryCts?.dispose(true);
      this._galleryCts = void 0;
      this._galleryList.splice(0, this._galleryList.length, []);
      this._searchQuery.set("", void 0);
    }
    this._searchInput.focus();
    if (this._lastHeight > 0) {
      this.layout(this._lastHeight, this._lastWidth);
    }
  }
  /** Queries the Extensions gallery for tool-contributing extensions. */
  async _queryGallery() {
    this._galleryCts?.dispose(true);
    const cts = this._galleryCts = new CancellationTokenSource();
    const userText = this._searchInput.value.trim();
    const text2 = userText ? `${TOOLS_MARKETPLACE_QUERY} ${userText}` : TOOLS_MARKETPLACE_QUERY;
    this._setGalleryMessage(localize(9833, null));
    try {
      const pager = await this._extensionsWorkbenchService.queryGallery({ text: text2 }, cts.token);
      if (cts.token.isCancellationRequested) {
        return;
      }
      const items = pager.firstPage;
      const filteredItems = await this._filterGalleryResults(items, cts.token);
      if (cts.token.isCancellationRequested) {
        return;
      }
      if (filteredItems.length === 0) {
        this._setGalleryMessage(
          localize(9835, null, userText || TOOLS_MARKETPLACE_QUERY),
          localize(9849, null)
        );
        return;
      }
      this._galleryEmpty.style.display = "none";
      this._galleryListContainer.style.display = "";
      this._galleryList.splice(0, this._galleryList.length, filteredItems);
    } catch {
      if (!cts.token.isCancellationRequested) {
        this._setGalleryMessage(
          localize(9832, null),
          localize(9837, null)
        );
      }
    }
  }
  /**
   * Keeps only extensions that contribute language model tools and, in the Agents window, can run there
   * ({@link IExtensionManifestPropertiesService.canExecuteOnSessionsWindow}); the `executesCode` hint skips
   * manifest fetches for extensions that can never run.
   */
  async _filterGalleryResults(extensions, token) {
    const requireAgentsWindowSupport = this._environmentService.isSessionsWindow;
    const results = await Promise.all(extensions.map(async (extension) => {
      if (requireAgentsWindowSupport && extension.gallery?.properties.executesCode) {
        return void 0;
      }
      try {
        const manifest = await extension.getManifest(token);
        if (!manifest?.contributes?.languageModelTools?.length) {
          return void 0;
        }
        if (requireAgentsWindowSupport && !this._extensionManifestPropertiesService.canExecuteOnSessionsWindow(manifest)) {
          return void 0;
        }
        return extension;
      } catch {
        return void 0;
      }
    }));
    return results.filter((extension) => !!extension);
  }
  _setGalleryMessage(text2, subtext) {
    this._galleryList.splice(0, this._galleryList.length, []);
    this._galleryListContainer.style.display = "none";
    clearNode(this._galleryEmpty);
    this._galleryEmpty.style.display = "flex";
    const header2 = append(this._galleryEmpty, $87(".empty-state-header"));
    append(header2, $87(".empty-state-text")).textContent = text2;
    if (subtext) {
      append(this._galleryEmpty, $87(".empty-state-subtext")).textContent = subtext;
    }
  }
  /** Move keyboard focus to the search box. */
  focusSearch() {
    this._searchInput.focus();
    this._searchInput.select();
  }
  /** Re-emit the current item count. Called once at startup to seed the section badge. */
  fireItemCount() {
    this._onDidChangeItemCount.fire(this._lastCount === -1 ? 0 : this._lastCount);
  }
  _render(model) {
    const hadFocus = isAncestor(this._treeContainer.ownerDocument.activeElement, this._treeContainer);
    this._rowStore.clear();
    this._rows = [];
    this._rowByElement.clear();
    clearNode(this._treeContainer);
    if (model.length === 0) {
      const emptyState = append(this._treeContainer, $87(".list-empty-state"));
      const header2 = append(emptyState, $87(".empty-state-header"));
      const text2 = append(header2, $87(".empty-state-text"));
      const subtext = append(emptyState, $87(".empty-state-subtext"));
      const query = this._searchQuery.get().trim();
      if (query) {
        text2.textContent = localize(9829, null, query);
        subtext.textContent = localize(9849, null);
      } else {
        text2.textContent = localize(9841, null);
      }
      this._treeScrollable.scanDomNode();
      return;
    }
    for (const vm of model) {
      const setRow = this._renderToolSet(vm);
      this._addRow(setRow);
      for (const child of setRow.children) {
        this._addRow(child);
      }
    }
    this._initRovingTabIndex(hadFocus);
    this._treeScrollable.scanDomNode();
  }
  _addRow(row) {
    this._rows.push(row);
    this._rowByElement.set(row.element, row);
  }
  _renderToolSet(vm) {
    const ts = vm.toolSet;
    const row = append(this._treeContainer, $87(".tools-list-setrow"));
    row.setAttribute("role", "treeitem");
    row.setAttribute("aria-level", "1");
    row.tabIndex = -1;
    const setName = ts.description ?? ts.referenceName;
    const toggleExpand = () => this._toggleCollapsed(ts.id);
    const checkbox = this._rowStore.add(new TriStateCheckbox(
      localize(9844, null, setName),
      getToolSetTriState(this._currentState(), ts.id, vm.allToolIds),
      defaultCheckboxStyles
    ));
    checkbox.domNode.tabIndex = -1;
    row.appendChild(checkbox.domNode);
    if (vm.readOnly) {
      checkbox.disable();
      checkbox.setTitle(localize(9846, null));
    } else {
      this._rowStore.add(checkbox.onChange(() => {
        const enabled = checkbox.checked === true;
        this._enablementService.setToolSetEnabled(this._sessionType, ts.id, vm.allToolIds, enabled);
      }));
    }
    const main2 = append(row, $87(".tools-list-row-main"));
    const text2 = append(main2, $87(".tools-list-row-text"));
    const label3 = append(text2, $87("span.tools-list-row-label"));
    const labelHighlight = this._rowStore.add(new HighlightedLabel(label3));
    labelHighlight.set(setName, vm.nameMatches);
    const detail2 = this._resolveSetDetail(ts);
    if (detail2) {
      append(text2, $87("span.tools-list-row-subtext")).textContent = detail2;
    }
    const count2 = append(row, $87("span.tools-list-row-count"));
    const chevron = append(row, $87("a.tools-list-chevron.codicon"));
    chevron.setAttribute("aria-hidden", "true");
    this._rowStore.add(addDisposableListener(row, "click", (e4) => {
      if (checkbox.domNode.contains(e4.target)) {
        return;
      }
      row.focus();
      toggleExpand();
    }));
    this._rowStore.add(addDisposableListener(row, "contextmenu", (e4) => {
      const extension = this._resolveExtensionForToolSet(ts);
      if (!extension) {
        return;
      }
      EventHelper.stop(e4, true);
      const anchor = e4.button === 2 ? new StandardMouseEvent(getWindow(row), e4) : row;
      this._showExtensionContextMenu(anchor, extension);
    }));
    const group2 = append(this._treeContainer, $87(".tools-list-children"));
    group2.id = `tools-group-${ts.id}`;
    group2.setAttribute("role", "group");
    group2.setAttribute("aria-label", setName);
    row.setAttribute("aria-owns", group2.id);
    const setRow = {
      kind: "set",
      rowId: `set:${ts.id}`,
      toolSetId: ts.id,
      element: row,
      toggleNode: checkbox.domNode,
      group: group2,
      children: []
    };
    for (const tool of vm.visibleTools) {
      setRow.children.push(this._renderTool(group2, setRow, vm, tool));
    }
    this._rowStore.add(autorun((reader) => {
      const state = this._readState(reader);
      const triState = getToolSetTriState(state, ts.id, vm.allToolIds);
      checkbox.checked = triState;
      this._updateRowAriaChecked(row, triState);
      const enabledCount = vm.allToolIds.reduce((n2, id2) => n2 + (isToolEnabledInSet(state, ts.id, id2) ? 1 : 0), 0);
      count2.textContent = `${enabledCount}/${vm.allToolIds.length}`;
      count2.setAttribute("aria-label", localize(9842, null, enabledCount, vm.allToolIds.length));
    }));
    this._rowStore.add(autorun((reader) => {
      const expanded2 = vm.forceExpanded || this._expanded.read(reader).has(ts.id);
      group2.style.display = expanded2 ? "" : "none";
      chevron.classList.toggle("codicon-chevron-down", expanded2);
      chevron.classList.toggle("codicon-chevron-right", !expanded2);
      row.setAttribute("aria-expanded", String(expanded2));
      this._treeScrollable.scanDomNode();
    }));
    return setRow;
  }
  _renderTool(group2, parent, vm, toolVm) {
    const tool = toolVm.tool;
    const enabled = isToolEnabledInSet(this._currentState(), vm.toolSet.id, tool.id);
    const toolName = tool.displayName ?? tool.id;
    const row = append(group2, $87(".tools-list-toolrow"));
    row.classList.toggle("readonly", vm.readOnly);
    row.setAttribute("role", "treeitem");
    row.setAttribute("aria-level", "2");
    row.tabIndex = -1;
    const checkbox = this._rowStore.add(new Checkbox(
      localize(9847, null, toolName),
      enabled,
      defaultCheckboxStyles
    ));
    checkbox.domNode.tabIndex = -1;
    row.appendChild(checkbox.domNode);
    this._updateRowAriaChecked(row, enabled);
    if (vm.readOnly) {
      checkbox.disable();
      checkbox.setTitle(localize(9846, null));
    } else {
      this._rowStore.add(checkbox.onChange(() => {
        this._enablementService.setToolEnabled(this._sessionType, vm.toolSet.id, tool.id, checkbox.checked);
      }));
      this._rowStore.add(addDisposableListener(row, "click", (e4) => {
        if (checkbox.domNode.contains(e4.target)) {
          return;
        }
        row.focus();
        this._enablementService.setToolEnabled(this._sessionType, vm.toolSet.id, tool.id, !checkbox.checked);
      }));
      this._rowStore.add(autorun((reader) => {
        const toolEnabled = isToolEnabledInSet(this._readState(reader), vm.toolSet.id, tool.id);
        checkbox.checked = toolEnabled;
        this._updateRowAriaChecked(row, toolEnabled);
      }));
    }
    const text2 = append(row, $87(".tools-list-row-text"));
    const label3 = append(text2, $87("span.tools-list-row-label"));
    const labelHighlight = this._rowStore.add(new HighlightedLabel(label3));
    labelHighlight.set(toolName, toolVm.nameMatches);
    const description = tool.userDescription ?? tool.modelDescription;
    if (description) {
      const subtext = append(text2, $87("span.tools-list-row-subtext"));
      subtext.textContent = description;
    }
    return {
      kind: "tool",
      rowId: `tool:${vm.toolSet.id}:${tool.id}`,
      toolSetId: vm.toolSet.id,
      element: row,
      toggleNode: checkbox.domNode,
      parent
    };
  }
  /**
   * Subtitle for a tool-set row: the set's own `detail`, or for extension sets the extension's
   * description (falling back to a generic "contributed by" label).
   */
  _resolveSetDetail(ts) {
    if (ts.detail) {
      return ts.detail;
    }
    if (ts.source.type !== "extension") {
      return void 0;
    }
    const source = ts.source;
    const extension = this._extensionsWorkbenchService.local.find((e4) => ExtensionIdentifier.equals(e4.identifier.id, source.extensionId));
    return extension?.description || localize(9845, null, source.label);
  }
  /** Mirror a row's enablement onto its `treeitem` so assistive tech announces it while navigating. */
  _updateRowAriaChecked(element, state) {
    element.setAttribute("aria-checked", state === "mixed" ? "mixed" : String(state));
  }
  _toggleCollapsed(toolSetId) {
    const next = new Set(this._expanded.get());
    if (next.has(toolSetId)) {
      next.delete(toolSetId);
    } else {
      next.add(toolSetId);
    }
    this._expanded.set(next, void 0);
  }
  _setExpanded(toolSetId, expanded2) {
    const next = new Set(this._expanded.get());
    if (expanded2 === next.has(toolSetId)) {
      return;
    }
    if (expanded2) {
      next.add(toolSetId);
    } else {
      next.delete(toolSetId);
    }
    this._expanded.set(next, void 0);
  }
  // --- Tree keyboard navigation ---
  _isExpanded(setRow) {
    return setRow.group.style.display !== "none";
  }
  /** Rows the user can currently land on: all set rows plus tool rows inside expanded sets, in tree order. */
  _visibleRows() {
    return this._rows.filter((r2) => r2.kind === "set" || this._isExpanded(r2.parent));
  }
  /** Keep a single roving `tabIndex=0` on the given row so the tree is one tab stop. */
  _setRovingRow(row) {
    for (const r2 of this._rows) {
      r2.element.tabIndex = r2 === row ? 0 : -1;
    }
    this._activeRowId = row.rowId;
  }
  _focusRow(row) {
    this._setRovingRow(row);
    row.element.focus();
  }
  /** Resolve the row owning a focus/keyboard target by walking up to a known row element. */
  _rowFromTarget(target) {
    for (let el = target; el && el !== this._treeContainer; el = el.parentElement) {
      const row = this._rowByElement.get(el);
      if (row) {
        return row;
      }
    }
    return void 0;
  }
  /** After a (re)render, restore the roving tabIndex to the previously active row, else the first row. */
  _initRovingTabIndex(refocus = false) {
    let active = this._activeRowId ? this._rows.find((r2) => r2.rowId === this._activeRowId) : void 0;
    if (!active || active.kind === "tool" && !this._isExpanded(active.parent)) {
      active = this._visibleRows()[0];
    }
    for (const r2 of this._rows) {
      r2.element.tabIndex = r2 === active ? 0 : -1;
    }
    this._activeRowId = active?.rowId;
    if (refocus && active) {
      active.element.focus();
    }
  }
  _onTreeKeyDown(e4) {
    const row = this._rowFromTarget(e4.target);
    if (!row) {
      return;
    }
    let handled = true;
    switch (e4.keyCode) {
      case 18 /* DownArrow */:
        this._focusRelative(row, 1);
        break;
      case 16 /* UpArrow */:
        this._focusRelative(row, -1);
        break;
      case 17 /* RightArrow */:
        handled = this._onExpandKey(row);
        break;
      case 15 /* LeftArrow */:
        handled = this._onCollapseKey(row);
        break;
      case 14 /* Home */:
        this._focusEdge(true);
        break;
      case 13 /* End */:
        this._focusEdge(false);
        break;
      case 10 /* Space */:
      case 3 /* Enter */:
        row.toggleNode.click();
        break;
      default:
        handled = false;
    }
    if (handled) {
      e4.preventDefault();
      e4.stopPropagation();
    }
  }
  _focusRelative(row, delta2) {
    const rows = this._visibleRows();
    const index2 = rows.indexOf(row);
    const next = index2 === -1 ? void 0 : rows[index2 + delta2];
    if (next) {
      this._focusRow(next);
    }
  }
  _focusEdge(first2) {
    const rows = this._visibleRows();
    this._focusRow(first2 ? rows[0] : rows[rows.length - 1]);
  }
  /** Right arrow: expand a collapsed set, or move into its first child when already expanded. */
  _onExpandKey(row) {
    if (row.kind !== "set") {
      return false;
    }
    if (!this._isExpanded(row)) {
      this._setExpanded(row.toolSetId, true);
    } else if (row.children.length) {
      this._focusRow(row.children[0]);
    }
    return true;
  }
  /** Left arrow: collapse an expanded set, or move a tool row up to its parent set. */
  _onCollapseKey(row) {
    if (row.kind === "set") {
      if (this._isExpanded(row)) {
        this._setExpanded(row.toolSetId, false);
        return true;
      }
      return false;
    }
    this._focusRow(row.parent);
    return true;
  }
  _currentState() {
    return this._enablementService.getState(this._sessionType);
  }
  /** Resolve the installed, non-builtin extension backing an extension-provided tool set. */
  _resolveExtensionForToolSet(ts) {
    if (ts.source.type !== "extension") {
      return void 0;
    }
    const source = ts.source;
    const extension = this._extensionsWorkbenchService.local.find((e4) => ExtensionIdentifier.equals(e4.identifier.id, source.extensionId));
    if (!extension || extension.local?.isBuiltin) {
      return void 0;
    }
    return extension;
  }
  _onGalleryContextMenu(e4) {
    const extension = e4.element;
    if (!extension || extension.state !== 1 /* Installed */ || extension.local?.isBuiltin) {
      return;
    }
    this._showExtensionContextMenu(e4.anchor, extension);
  }
  _showExtensionContextMenu(anchor, extension) {
    const disposables = new DisposableStore();
    const uninstallAction = disposables.add(new Action(
      "toolsList.uninstallExtension",
      localize(9850, null),
      void 0,
      true,
      () => this._uninstallExtension(extension)
    ));
    this._contextMenuService.showContextMenu({
      getAnchor: () => anchor,
      getActions: () => [uninstallAction],
      onHide: () => disposables.dispose()
    });
  }
  async _uninstallExtension(extension) {
    const result = await this._dialogService.confirm({
      message: localize(9809, null, extension.displayName),
      detail: localize(9810, null),
      primaryButton: localize(9851, null),
      type: "question"
    });
    if (result.confirmed) {
      await this._extensionsWorkbenchService.uninstall(extension);
    }
  }
};

ToolsListWidget = __decorateClass([
  __decorateParam(1, ILanguageModelToolsService),
  __decorateParam(2, IAgentHostToolSetEnablementService),
  __decorateParam(3, IContextViewService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IDialogService),
  __decorateParam(6, IOpenerService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IExtensionsWorkbenchService),
  __decorateParam(9, IExtensionManifestPropertiesService),
  __decorateParam(10, IWorkbenchEnvironmentService)
], ToolsListWidget);

var COPILOT_CLI_TOOLS = [
  // Shell tools
  { name: "bash / powershell", description: localize(9821, null) },
  { name: "list_bash / list_powershell", description: localize(9818, null) },
  { name: "read_bash / read_powershell", description: localize(9820, null) },
  { name: "stop_bash / stop_powershell", description: localize(9823, null) },
  { name: "write_bash / write_powershell", description: localize(9827, null) },
  // File operation tools
  { name: "apply_patch", description: localize(9811, null) },
  { name: "create", description: localize(9813, null) },
  { name: "edit", description: localize(9814, null) },
  { name: "view", description: localize(9825, null) },
  // Agent and task delegation tools
  { name: "list_agents", description: localize(9817, null) },
  { name: "read_agent", description: localize(9819, null) },
  { name: "task", description: localize(9824, null) },
  // Other tools
  { name: "ask_user", description: localize(9812, null) },
  { name: "glob", description: localize(9815, null) },
  { name: "grep (or rg)", description: localize(9816, null) },
  { name: "skill", description: localize(9822, null) },
  { name: "web_fetch", description: localize(9826, null) }
];

var CUSTOM_TOOL_SET_ORDER = {
  "copilot-cli": 0,
  "vscode-general": 1,
  "vscode-tasks": 2,
  "vscode-browser": 3,
  "vscode-notebooks": 4
};

function sortKey(toolSet) {
  const sourcePriority = toolSet.source.type === "internal" ? "0" : "1";
  const order = CUSTOM_TOOL_SET_ORDER[toolSet.id];
  const orderKey = order !== void 0 ? String(order) : `9-${toolSet.description ?? toolSet.referenceName}`;
  return `${sourcePriority}-${orderKey}`;
}
export { sortKey, $87, TOOLS_MARKETPLACE_QUERY, TOOLS_GALLERY_ITEM_HEIGHT, TOOLS_GALLERY_ITEM_TEMPLATE_ID, ToolsGalleryItemDelegate, ToolsGalleryItemProvider, ToolsListWidget, COPILOT_CLI_TOOLS, CUSTOM_TOOL_SET_ORDER };
