// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/aiCustomizationManagementEditor.ts
import { $, DisposableResizeObserver, addDisposableListener, append, clearNode, getWindow } from "./module-0075.mjs";
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { EditorPane } from "./module-1089.mjs";
import { RunOnceScheduler, timeout } from "./module-0036.mjs";
import { ResourceSet } from "./module-0008.mjs";
import { AI_CUSTOMIZATION_MANAGEMENT_EDITOR_ID, AI_CUSTOMIZATION_MANAGEMENT_SELECTED_SECTION_KEY, AI_CUSTOMIZATION_MANAGEMENT_SIDEBAR_WIDTH_KEY, CONTENT_MIN_WIDTH, CONTEXT_AI_CUSTOMIZATION_MANAGEMENT_EDITOR, CONTEXT_AI_CUSTOMIZATION_MANAGEMENT_HARNESS, CONTEXT_AI_CUSTOMIZATION_MANAGEMENT_SECTION, SIDEBAR_DEFAULT_WIDTH, SIDEBAR_MAX_WIDTH, SIDEBAR_MIN_WIDTH } from "./module-1472.mjs";
import { autorun } from "./module-0052.mjs";
import { AICustomizationManagementSection, AICustomizationSources, IAICustomizationWorkspaceService } from "./module-0995.mjs";
import { localize } from "./module-0001.mjs";
import { agentIcon, automationIcon, hookIcon, instructionsIcon, pluginIcon, promptIcon, skillIcon, toolsIcon } from "./module-2640.mjs";
import { Codicon } from "./module-0085.mjs";
import { localizeBridge } from "./module-2646.mjs";
import { aiCustomizationManagementSectionRegistry } from "./module-2648.mjs";
import { OPENCODE_HIDDEN_CUSTOMIZATION_SECTIONS, defaultOpenCodeCustomizationSection } from "./module-2645.mjs";
import { Sizing, SplitView } from "./module-0625.mjs";
import { Event2 } from "./module-0017.mjs";
import { CUSTOMIZATION_NAVIGATION_BAR_HEIGHT, CustomizationNavigationToggle } from "./module-2644.mjs";
import { AICustomizationManagementEditorInput } from "./module-2647.mjs";
import { CHAT_AUTOMATIONS_ENABLED_SETTING } from "./module-2663.mjs";
import { WorkbenchList } from "./module-0636.mjs";
import { AICustomizationWelcomePage } from "./module-2676.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { getPromptMigrationInfo, migratePromptFilesToSkills } from "./module-2677.mjs";
import { URI } from "./module-0032.mjs";
import { InputBox } from "./module-0600.mjs";
import { defaultButtonStyles, defaultCheckboxStyles, defaultInputBoxStyles } from "./module-0513.mjs";
import { Button } from "./module-0546.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { AICustomizationListWidget } from "./module-2651.mjs";
import { ChatModelsWidget } from "./module-2669.mjs";
import { McpListWidget } from "./module-2656.mjs";
import { PluginListWidget } from "./module-2659.mjs";
import { ToolsListWidget } from "./module-2660.mjs";
import { AGENT_HOST_COPILOT_CLI_SESSION_TYPE } from "./module-2113.mjs";
import { AutomationsListWidget } from "./module-2666.mjs";
import { IAICustomizationItemsModel, ITEMS_MODEL_SECTIONS } from "./module-2643.mjs";
import { isAgentHostTarget } from "./module-0960.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { basename2, dirname2, isEqual2 } from "./module-0034.mjs";
import { Checkbox } from "./module-0549.mjs";
import { AGENT_MD_FILENAME } from "./module-0996.mjs";
import { showConfigureHooksQuickPick } from "./module-2550.mjs";
import { CustomizationLocationPicker, resolveUserTargetDirectory, resolveWorkspaceTargetDirectory } from "./module-2670.mjs";
import { showNoFoldersDialog } from "./module-2160.mjs";
import { NEW_AGENT_COMMAND_ID, NEW_INSTRUCTIONS_COMMAND_ID, NEW_PROMPT_COMMAND_ID, NEW_SKILL_COMMAND_ID } from "./module-2161.mjs";
import { Color } from "./module-0197.mjs";
import { CodeEditorWidget } from "./module-0441.mjs";
import { getSimpleEditorOptions } from "./module-1837.mjs";
import { status } from "./module-0076.mjs";
import { createTextBufferFactoryFromSnapshot } from "./module-0423.mjs";
import { generateUuid } from "./module-0190.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { getAttributeDefinition, getTarget } from "./module-1015.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { EmbeddedMcpServerDetail } from "./module-2671.mjs";
import { EmbeddedAgentPluginDetail } from "./module-2672.mjs";
import { EmbeddedExtensionToolsDetail } from "./module-2673.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IPromptsService } from "./module-0986.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkingCopyService } from "./module-1072.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { IModelService } from "./module-0080.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IFileService } from "./module-0269.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IDialogService } from "./module-0267.mjs";
import { ICustomizationHarnessService } from "./module-1031.mjs";
import { IViewsService } from "./module-1246.mjs";
import { ILabelService } from "./module-0641.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/aiCustomizationManagementEditor.ts
var $96 = $;

var SectionItemDelegate = class {
  getHeight() {
    return 26;
  }
  getTemplateId() {
    return "sectionItem";
  }
};

var SectionItemRenderer = class {
  constructor(hoverService) {
    this.hoverService = hoverService;
    this.templateId = "sectionItem";
  }
  renderTemplate(container3) {
    container3.classList.add("section-list-item");
    const icon2 = append(container3, $96(".section-icon"));
    const label3 = append(container3, $96(".section-label"));
    const count2 = append(container3, $96(".section-count"));
    const templateDisposables = new DisposableStore();
    return { container: container3, icon: icon2, label: label3, count: count2, templateDisposables };
  }
  renderElement(element, index2, templateData) {
    templateData.templateDisposables.clear();
    templateData.icon.className = "section-icon";
    templateData.icon.classList.add(...ThemeIcon.asClassNameArray(element.icon));
    templateData.label.textContent = element.label;
    if (element.count > 0) {
      templateData.count.textContent = String(element.count);
      templateData.count.style.display = "";
    } else {
      templateData.count.textContent = "";
      templateData.count.style.display = "none";
    }
    templateData.templateDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), templateData.container, element.description));
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
};

var AICustomizationManagementEditor = class extends EditorPane {
  constructor(group2, telemetryService, themeService, storageService, instantiationService, contextKeyService, openerService, commandService, workspaceService, promptsService, textModelService, configurationService, workingCopyService, hoverService, contextViewService, markdownRendererService, modelService, quickInputService, fileService, notificationService, dialogService, harnessService, viewsService, labelService, itemsModel) {
    super(AICustomizationManagementEditor.ID, group2, telemetryService, themeService, storageService);
    this.storageService = storageService;
    this.instantiationService = instantiationService;
    this.openerService = openerService;
    this.commandService = commandService;
    this.workspaceService = workspaceService;
    this.promptsService = promptsService;
    this.textModelService = textModelService;
    this.configurationService = configurationService;
    this.workingCopyService = workingCopyService;
    this.hoverService = hoverService;
    this.contextViewService = contextViewService;
    this.markdownRendererService = markdownRendererService;
    this.modelService = modelService;
    this.quickInputService = quickInputService;
    this.fileService = fileService;
    this.notificationService = notificationService;
    this.dialogService = dialogService;
    this.harnessService = harnessService;
    this.viewsService = viewsService;
    this.labelService = labelService;
    this.itemsModel = itemsModel;
    this.contributedSectionContainers = /* @__PURE__ */ new Map();
    this.contributedSectionWidgets = /* @__PURE__ */ new Map();
    this.editorActionButtonInProgress = false;
    this.editorDisplayMode = "preview";
    this.editorModelChangeDisposables = this._register(new DisposableStore());
    this.editorPreviewDisposables = this._register(new DisposableStore());
    this.editorPreviewRenderScheduler = this._register(new RunOnceScheduler(() => {
      if (this.viewMode === "editor" && this.editorDisplayMode === "preview") {
        this.renderCurrentEditorPreview();
      }
    }, 200));
    this.builtinEditingSessions = /* @__PURE__ */ new Map();
    this.currentEditingReadOnly = false;
    this.editorReturnViewMode = "list";
    this.viewMode = "list";
    this.migrationSearchQuery = "";
    this.collapsedPromptMigrationGroups = /* @__PURE__ */ new Set();
    this.selectedPromptMigrationUris = new ResourceSet();
    this.migrationPageDisposables = this._register(new DisposableStore());
    this.mcpDetailDisposables = this._register(new DisposableStore());
    this.pluginDetailDisposables = this._register(new DisposableStore());
    this.toolsDetailDisposables = this._register(new DisposableStore());
    this.sections = [];
    this.allSections = [];
    this.promptFilesToMigrate = [];
    this.promptMigrationRefreshSequence = 0;
    this.editorDisposables = this._register(new DisposableStore());
    this._editorContentChanged = false;
    this.sidebarWidth = 0;
    this.sidebarHeight = 0;
    this.inEditorContextKey = CONTEXT_AI_CUSTOMIZATION_MANAGEMENT_EDITOR.bindTo(contextKeyService);
    this.sectionContextKey = CONTEXT_AI_CUSTOMIZATION_MANAGEMENT_SECTION.bindTo(contextKeyService);
    this.harnessContextKey = CONTEXT_AI_CUSTOMIZATION_MANAGEMENT_HARNESS.bindTo(contextKeyService);
    this.updateHarnessLabelPresentation();
    this._register(autorun((reader) => {
      this.workspaceService.activeProjectRoot.read(reader);
      if (this.viewMode === "editor") {
        this.currentEditingProjectRoot = this.workspaceService.getActiveProjectRoot();
      }
    }));
    this._register(toDisposable(() => {
      this.currentModelRef?.dispose();
      this.currentModelRef = void 0;
    }));
    this._register(toDisposable(() => this.disposeBuiltinEditingSessions()));
    const sectionInfo = {
      [AICustomizationManagementSection.Agents]: { label: localize(9426, null), icon: agentIcon, description: localize(9427, null) },
      [AICustomizationManagementSection.Skills]: { label: localize(9522, null), icon: skillIcon, description: localize(9523, null) },
      [AICustomizationManagementSection.Instructions]: { label: localize(9465, null), icon: instructionsIcon, description: localize(9466, null) },
      [AICustomizationManagementSection.Prompts]: { label: localize(9511, null), icon: promptIcon, description: localize(9512, null) },
      [AICustomizationManagementSection.Hooks]: { label: localize(9463, null), icon: hookIcon, description: localize(9464, null) },
      [AICustomizationManagementSection.Automations]: { label: localize(9429, null), icon: automationIcon, description: localize(9430, null) },
      [AICustomizationManagementSection.McpServers]: { label: localize(9469, null), icon: Codicon.server, description: localize(9470, null) },
      [AICustomizationManagementSection.Plugins]: { label: localize(9475, null), icon: pluginIcon, description: localize(9476, null) },
      [AICustomizationManagementSection.Models]: { label: localizeBridge("apiProvider", "API Provider"), icon: Codicon.vm, description: localizeBridge("apiProviderDesc", "Set one API endpoint and API key. Available models are discovered automatically.") },
      [AICustomizationManagementSection.Codex]: { label: localize(9444, null), icon: Codicon.account, description: localize(9445, null) },
      [AICustomizationManagementSection.Tools]: { label: localize(9524, null), icon: toolsIcon, description: localize(9525, null) }
    };
    const activeHarnessId = this.harnessService.activeHarness.get();
    for (const id2 of this.workspaceService.managementSections) {
      const contribution = aiCustomizationManagementSectionRegistry.get(id2, activeHarnessId) ?? aiCustomizationManagementSectionRegistry.getDefault(id2);
      const info = contribution ?? sectionInfo[id2];
      if (info) {
        this.allSections.push({ id: id2, label: info.label, icon: info.icon, description: info.description, count: 0 });
      }
    }
    this.rebuildVisibleSections();
    const savedSection = this.storageService.get(AI_CUSTOMIZATION_MANAGEMENT_SELECTED_SECTION_KEY, 0 /* PROFILE */);
    if (savedSection && this.sections.some((s) => s.id === savedSection)) {
      this.selectedSection = savedSection;
    } else {
      this.selectedSection = defaultOpenCodeCustomizationSection(this.sections);
    }
  }
  static {
    this.ID = AI_CUSTOMIZATION_MANAGEMENT_EDITOR_ID;
  }
  createEditor(parent) {
    this.editorDisposables.clear();
    this.contributedSectionContainers.clear();
    this.contributedSectionWidgets.clear();
    this.container = append(parent, $96(".ai-customization-management-editor"));
    this.createSplitView();
    this.updateStyles();
  }
  createSplitView() {
    this.splitViewContainer = append(this.container, $96(".management-split-view"));
    this.sidebarContainer = $96(".management-sidebar");
    this.contentContainer = $96(".management-content");
    this.createSidebar();
    this.createContent();
    this.splitView = this.editorDisposables.add(new SplitView(this.splitViewContainer, {
      orientation: 1 /* HORIZONTAL */,
      proportionalLayout: true
    }));
    const storedWidth = this.storageService.getNumber(AI_CUSTOMIZATION_MANAGEMENT_SIDEBAR_WIDTH_KEY, 0 /* PROFILE */, SIDEBAR_DEFAULT_WIDTH);
    const savedWidth = Number.isFinite(storedWidth) ? Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, storedWidth)) : SIDEBAR_DEFAULT_WIDTH;
    this.splitView.addView({
      onDidChange: Event2.None,
      element: this.sidebarContainer,
      minimumSize: SIDEBAR_MIN_WIDTH,
      maximumSize: SIDEBAR_MAX_WIDTH,
      layout: (width2, _, height) => {
        this.sidebarContainer.style.width = `${width2}px`;
        if (height !== void 0) {
          this.layoutSidebar(width2, height);
        }
      }
    }, Sizing.Invisible(savedWidth), void 0, true);
    this.splitView.addView({
      onDidChange: Event2.None,
      element: this.contentContainer,
      minimumSize: CONTENT_MIN_WIDTH,
      maximumSize: Number.POSITIVE_INFINITY,
      layout: (width2, _, height) => {
        this.contentContainer.style.width = `${width2}px`;
        if (height !== void 0) {
          this.listWidget.layout(height - 16, width2 - 24);
          this.mcpListWidget?.layout(height - 16, width2 - 24);
          this.pluginListWidget?.layout(height - 16, width2 - 24);
          this.toolsListWidget?.layout(height - 16, width2 - 24);
          this.automationsListWidget?.layout(height - 16, width2 - 24);
          if (this.modelsWidget) {
            const modelsWidth = this.modelsWidget.element.clientWidth;
            const modelsHeight = this.modelsWidget.element.clientHeight;
            if (modelsWidth > 0 && modelsHeight > 0) {
              this.modelsWidget.layout(modelsHeight, modelsWidth);
            }
          }
          if (this.codexModelsWidget) {
            const codexWidth = this.codexModelsWidget.element.clientWidth;
            const codexHeight = this.codexModelsWidget.element.clientHeight;
            if (codexWidth > 0 && codexHeight > 0) {
              this.codexModelsWidget.layout(codexHeight, codexWidth);
            }
          }
          if (this.viewMode === "editor" && this.embeddedEditor && this.embeddedEditorContainer) {
            const { clientWidth, clientHeight } = this.embeddedEditorContainer;
            if (clientWidth > 0 && clientHeight > 0) {
              this.embeddedEditor.layout({ width: clientWidth, height: clientHeight });
            } else if (this.dimension) {
              getWindow(this.embeddedEditorContainer).requestAnimationFrame(() => {
                if (this.embeddedEditor && this.embeddedEditorContainer) {
                  const { clientWidth: w, clientHeight: h3 } = this.embeddedEditorContainer;
                  if (w > 0 && h3 > 0) {
                    this.embeddedEditor.layout({ width: w, height: h3 });
                  }
                }
              });
            }
          }
        }
      }
    }, Sizing.Distribute, void 0, true);
    this.editorDisposables.add(new CustomizationNavigationToggle(this.container, this.sidebarContainer, {
      expand: localizeBridge("opencodeBridge.expandNavigation", "Expand navigation"),
      collapse: localizeBridge("opencodeBridge.collapseNavigation", "Collapse navigation")
    }, (visible) => {
      this.splitView.setViewVisible(0, visible);
      if (this.dimension) {
        this.layout(this.dimension);
      }
    }));
    this.editorDisposables.add(this.splitView.onDidSashChange(() => {
      const width2 = this.splitView.getViewSize(0);
      if (this.splitView.isViewVisible(0) && width2 >= SIDEBAR_MIN_WIDTH) {
        this.storageService.store(AI_CUSTOMIZATION_MANAGEMENT_SIDEBAR_WIDTH_KEY, width2, 0 /* PROFILE */, 0 /* USER */);
      }
    }));
    this.editorDisposables.add(this.splitView.onDidSashReset(() => {
      const totalWidth = this.splitView.getViewSize(0) + this.splitView.getViewSize(1);
      this.splitView.resizeView(0, SIDEBAR_DEFAULT_WIDTH);
      this.splitView.resizeView(1, totalWidth - SIDEBAR_DEFAULT_WIDTH);
    }));
  }
  getActiveHarnessLabel() {
    return this.harnessService.getActiveDescriptor().label || localize(9468, null);
  }
  updateHarnessLabelPresentation() {
    const harnessLabel = this.getActiveHarnessLabel();
    AICustomizationManagementEditorInput.getOrCreate().setHarnessLabel(harnessLabel);
    this.welcomePage?.setHarnessLabel(harnessLabel);
  }
  /**
   * Rebuilds the visible sections list based on the active harness's
   * `hiddenSections`. If the current selection falls into a hidden
   * section, the first visible section is selected instead.
   */
  rebuildVisibleSections() {
    const activeId = this.harnessService.activeHarness.get();
    const descriptor = this.harnessService.findHarnessById(activeId);
    const hidden = /* @__PURE__ */ new Set([...descriptor?.hiddenSections ?? [], ...OPENCODE_HIDDEN_CUSTOMIZATION_SECTIONS]);
    if (this.allSections.some((section) => section.id === AICustomizationManagementSection.SkillCenter) && !hidden.has(AICustomizationManagementSection.SkillCenter)) {
      hidden.add(AICustomizationManagementSection.McpServers);
    }
    if (this.configurationService.getValue(CHAT_AUTOMATIONS_ENABLED_SETTING) !== true) {
      hidden.add(AICustomizationManagementSection.Automations);
    }
    this.sections.length = 0;
    for (const s of this.allSections) {
      const contribution = aiCustomizationManagementSectionRegistry.get(s.id, activeId);
      const contributed = aiCustomizationManagementSectionRegistry.has(s.id);
      if (!hidden.has(s.id) && (!contributed || !!contribution)) {
        this.sections.push(contribution ? { ...s, label: contribution.label, icon: contribution.icon, description: contribution.description } : s);
      }
    }
    if (this.sectionsList) {
      this.sectionsList.splice(0, this.sectionsList.length, this.sections);
      this.layoutSidebar(this.sidebarWidth, this.sidebarHeight);
    }
    this.welcomePage?.rebuildCards(new Set(this.sections.map((s) => s.id)));
    if (this.selectedSection !== void 0 && !this.sections.some((s) => s.id === this.selectedSection) && this.sections.length > 0) {
      this.showWelcomePage();
    } else {
      this.ensureSectionsListReflectsActiveSection();
    }
  }
  createSidebar() {
    const sidebarContent = append(this.sidebarContainer, $96(".sidebar-content"));
    this.createSidebarHeader(sidebarContent);
    const sectionsListContainer = this.sectionsListContainer = append(sidebarContent, $96(".sidebar-sections-list"));
    this.sectionsList = this.editorDisposables.add(this.instantiationService.createInstance(
      WorkbenchList,
      "AICustomizationManagementSections",
      sectionsListContainer,
      new SectionItemDelegate(),
      [new SectionItemRenderer(this.hoverService)],
      {
        multipleSelectionSupport: false,
        setRowLineHeight: false,
        horizontalScrolling: false,
        accessibilityProvider: {
          getAriaLabel: (item) => item.count > 0 ? localize(9520, null, item.label, item.count) : item.label,
          getWidgetAriaLabel: () => localize(9521, null)
        },
        openOnSingleClick: true,
        identityProvider: {
          getId: (item) => item.id
        }
      }
    ));
    this.sectionsList.splice(0, this.sectionsList.length, this.sections);
    this.ensureSectionsListReflectsActiveSection();
    this.editorDisposables.add(this.sectionsList.onDidChangeSelection((e) => {
      if (e.elements.length === 0) {
        if (this.selectedSection !== void 0) {
          this.showWelcomePage();
        }
        return;
      }
      this.selectSection(e.elements[0].id);
    }));
    this.editorDisposables.add(autorun((reader) => {
      this.harnessService.availableHarnesses.read(reader);
      const activeId = this.harnessService.activeHarness.read(reader);
      this.harnessContextKey.set(activeId);
      this.updateHomeButtonHarnessPresentation();
      this.rebuildVisibleSections();
      if (this._previousActiveHarnessId !== void 0 && this._previousActiveHarnessId !== activeId) {
        for (const [section, widget] of this.contributedSectionWidgets) {
          this.editorDisposables.delete(widget);
          this.contributedSectionContainers.get(section)?.replaceChildren();
        }
        this.contributedSectionWidgets.clear();
        for (const section of this.sections) {
          this.updateSectionCount(section.id, 0);
        }
      }
      this._previousActiveHarnessId = activeId;
    }));
    this.editorDisposables.add(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("chat.customizations.structuredPreview.enabled" /* ChatCustomizationsStructuredPreviewEnabled */)) {
        this.onStructuredPreviewSettingChanged();
      }
      if (e.affectsConfiguration("chat.customizations.promptMigration.enabled" /* ChatCustomizationsPromptMigrationEnabled */)) {
        this.refreshPromptMigrationUi();
      }
      if (e.affectsConfiguration(CHAT_AUTOMATIONS_ENABLED_SETTING)) {
        this.rebuildVisibleSections();
      }
    }));
    this.createSidebarMigrationShortcut(sidebarContent);
  }
  layoutSidebar(width2, height) {
    this.sidebarWidth = width2;
    this.sidebarHeight = height;
    if (!this.sectionsListContainer) {
      return;
    }
    const headerHeight = this.sidebarHeaderContainer?.offsetHeight ?? 0;
    const migrationHeight = this.migrationShortcutContainer?.style.display !== "none" ? this.migrationShortcutContainer?.offsetHeight ?? 0 : 0;
    const availableListHeight = Math.max(0, height - 8 - headerHeight - migrationHeight);
    const listHeight = Math.min(availableListHeight, this.sections.length * 26);
    this.sectionsListContainer.style.height = `${listHeight}px`;
    this.sectionsList.layout(listHeight, width2);
  }
  createSidebarHeader(sidebarContent) {
    const headerRow = this.sidebarHeaderContainer = append(sidebarContent, $96(".sidebar-header-row"));
    headerRow.style.display = "none";
    const homeButton = this.homeButton = append(headerRow, $96("button.sidebar-home-button"));
    homeButton.classList.add("sidebar-harness-home-button");
    homeButton.setAttribute("aria-label", localize(9460, null));
    this.editorDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), homeButton, localize(9462, null)));
    const homeIcon = this.homeButtonIcon = append(homeButton, $96("span.sidebar-home-icon"));
    homeIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.home));
    homeIcon.setAttribute("aria-hidden", "true");
    const homeLabel = this.homeButtonLabel = append(homeButton, $96("span.sidebar-home-label"));
    homeLabel.textContent = localize(9461, null);
    this.editorDisposables.add(addDisposableListener(homeButton, "click", () => {
      this.showWelcomePage();
    }));
    this.updateHomeButtonHarnessPresentation();
    this.updateHomeButtonStyle();
  }
  updateHomeButtonStyle() {
    if (!this.homeButtonLabel || !this.homeButton) {
      return;
    }
    this.homeButtonLabel.style.display = "";
    this.homeButton.style.flex = "1";
  }
  updateHomeButtonHarnessPresentation() {
    this.updateHarnessLabelPresentation();
    if (!this.homeButton || !this.homeButtonIcon || !this.homeButtonLabel) {
      return;
    }
    this.homeButtonIcon.className = "sidebar-home-icon";
    this.homeButtonIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.home));
    this.homeButtonLabel.textContent = localize(9461, null);
    this.homeButton.setAttribute("aria-label", localize(9460, null));
    this.homeButton.title = localize(9462, null);
  }
  createSidebarMigrationShortcut(sidebarContent) {
    const container3 = this.migrationShortcutContainer = append(sidebarContent, $96(".sidebar-migration-shortcut"));
    container3.style.display = "none";
    append(container3, $96("div.sidebar-migration-separator"));
    const button = this.migrationShortcutButton = append(container3, $96("button.sidebar-migration-button"));
    button.type = "button";
    button.setAttribute("aria-label", localize(9471, null));
    this.editorDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), button, localize(9474, null)));
    const icon2 = append(button, $96("span.sidebar-migration-icon"));
    icon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.warning));
    icon2.setAttribute("aria-hidden", "true");
    const label3 = append(button, $96("span.sidebar-migration-label"));
    label3.textContent = localize(9473, null);
    this.migrationShortcutCount = append(button, $96("span.sidebar-migration-count"));
    this.editorDisposables.add(addDisposableListener(button, "click", () => {
      this.showPromptMigrationPage();
    }));
  }
  createWelcomePage(parent) {
    this.welcomePage = this.editorDisposables.add(new AICustomizationWelcomePage(
      parent,
      this.workspaceService.welcomePageFeatures,
      {
        selectSection: (section) => this.selectSection(section),
        selectSectionWithMarketplace: (section) => this.selectSection(section, { showMarketplace: true }),
        closeEditor: () => {
          if (this.input) {
            this.group.closeEditor(this.input);
          }
        },
        migratePromptFiles: () => {
          this.showPromptMigrationPage();
        },
        prefillChat: async (query, options3) => {
          try {
            if (this.workspaceService.isSessionsWindow) {
              const sessionsViewId = "workbench.view.sessions.chat";
              if (options3?.newChat) {
                await this.commandService.executeCommand("workbench.action.sessions.newChat");
              }
              const view = await this.viewsService.openView(sessionsViewId, true);
              const chatView = view;
              if (options3?.isPartialQuery && chatView?.prefillInput) {
                chatView.prefillInput(query);
              } else if (chatView?.sendQuery) {
                chatView.sendQuery(query);
              }
            } else {
              if (options3?.newChat) {
                await this.commandService.executeCommand("workbench.action.chat.newChat");
              }
              await this.commandService.executeCommand("workbench.action.chat.open", { query, isPartialQuery: options3?.isPartialQuery ?? false });
            }
          } catch (err) {
            onUnexpectedError(err);
          }
        }
      },
      this.commandService,
      this.workspaceService,
      this.hoverService,
      this.getActiveHarnessLabel()
    ));
    this.welcomePage.rebuildCards(new Set(this.sections.map((s) => s.id)));
    this.welcomePage.setPromptMigrationInfo(getPromptMigrationInfo(this.promptFilesToMigrate));
  }
  createBackArrowButton(onClick4) {
    const button = $96("button.section-back-arrow-button");
    button.type = "button";
    button.setAttribute("aria-label", localize(9435, null));
    this.editorDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), button, localize(9436, null)));
    const icon2 = append(button, $96("span.section-back-arrow-icon"));
    icon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.arrowLeft));
    icon2.setAttribute("aria-hidden", "true");
    this.editorDisposables.add(addDisposableListener(button, "click", () => {
      if (onClick4) {
        onClick4();
      } else {
        this.showWelcomePage();
      }
    }));
    return button;
  }
  createPromptMigrationContent(contentInner) {
    this.migrationContentContainer = append(contentInner, $96(".prompt-migration-content-container.ai-customization-list-widget"));
    const header2 = append(this.migrationContentContainer, $96(".section-title-header"));
    const titleRow = append(header2, $96(".section-title-row"));
    const title = append(titleRow, $96("h2.section-title"));
    title.textContent = localize(9503, null);
    this.migrationDescriptionElement = append(header2, $96("p.section-title-description"));
    const sectionLink = append(header2, $96("a.section-title-link"));
    sectionLink.textContent = localize(9467, null);
    sectionLink.href = "https://code.visualstudio.com/docs/agent-customization/agent-skills?referrer=in-product";
    this.editorDisposables.add(addDisposableListener(sectionLink, "click", (e) => {
      e.preventDefault();
      this.openerService.open(URI.parse(sectionLink.href));
    }));
    const actions = append(this.migrationContentContainer, $96(".list-search-and-button-container.prompt-migration-actions"));
    const searchContainer = append(actions, $96(".list-search-container"));
    this.migrationSearchInput = this.editorDisposables.add(new InputBox(searchContainer, this.contextViewService, {
      placeholder: localize(9506, null),
      inputBoxStyles: defaultInputBoxStyles
    }));
    this.editorDisposables.add(this.migrationSearchInput.onDidChange(() => {
      this.migrationSearchQuery = this.migrationSearchInput?.value ?? "";
      this.renderPromptMigrationPage();
    }));
    const actionButtonContainer = append(actions, $96(".list-add-button-container"));
    this.migrationMigrateButton = this.editorDisposables.add(new Button(actionButtonContainer, defaultButtonStyles));
    this.migrationMigrateButton.element.classList.add("list-add-button", "prompt-migration-button");
    this.migrationMigrateButton.label = localize(9495, null);
    this.editorDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), this.migrationMigrateButton.element, localize(9496, null)));
    this.editorDisposables.add(this.migrationMigrateButton.onDidClick(() => {
      const selectedPromptFiles = this.promptFilesToMigrate.filter((file) => this.selectedPromptMigrationUris.has(file.uri));
      void this.migratePromptFiles(selectedPromptFiles);
    }));
    this.migrationListContainer = $96(".prompt-migration-list.list-container");
    this.migrationListScrollable = this.editorDisposables.add(new DomScrollableElement(this.migrationListContainer, {
      horizontal: 2 /* Hidden */,
      vertical: 1 /* Auto */,
      useShadows: false
    }));
    const migrationListScrollableNode = this.migrationListScrollable.getDomNode();
    migrationListScrollableNode.classList.add("prompt-migration-list-scrollable");
    this.migrationContentContainer.appendChild(migrationListScrollableNode);
    const targetWindow = getWindow(this.migrationContentContainer);
    const migrationResizeObserver = this.editorDisposables.add(new DisposableResizeObserver(
      "AICustomizationManagementEditor.promptMigrationListScrollable",
      () => this.migrationListScrollable?.scanDomNode(),
      targetWindow
    ));
    this.editorDisposables.add(migrationResizeObserver.observe(migrationListScrollableNode));
    this.renderPromptMigrationPage();
  }
  createContent() {
    const contentInner = append(this.contentContainer, $96(".content-inner"));
    this.createWelcomePage(contentInner);
    this.editorDisposables.add(this.promptsService.onDidChangeSlashCommands(() => {
      void this.refreshPromptMigrationInfo();
    }));
    this.editorDisposables.add(autorun((reader) => {
      this.harnessService.activeHarness.read(reader);
      void this.refreshPromptMigrationInfo();
    }));
    this.promptsContentContainer = append(contentInner, $96(".prompts-content-container"));
    this.listWidget = this.editorDisposables.add(this.instantiationService.createInstance(AICustomizationListWidget));
    this.promptsContentContainer.appendChild(this.listWidget.element);
    this.createPromptMigrationContent(contentInner);
    this.editorDisposables.add(this.listWidget.onDidSelectItem((item) => {
      this.telemetryService.publicLog2("chatCustomizationEditor.itemSelected", {
        section: this.selectedSection ?? "welcome",
        promptType: item.promptType,
        storage: item.source ?? "external"
      });
      const source = item.source;
      const isWorkspaceFile = source === AICustomizationSources.local;
      const isReadOnly2 = !source || source === AICustomizationSources.extension || source === AICustomizationSources.plugin || source === AICustomizationSources.builtin;
      this.showEmbeddedEditor(item.uri, item.name, item.promptType, source ?? AICustomizationSources.builtin, isWorkspaceFile, isReadOnly2);
    }));
    this.editorDisposables.add(this.listWidget.onDidRequestCreate((promptType) => {
      this.createNewItemWithAI(promptType);
    }));
    this.editorDisposables.add(this.listWidget.onDidRequestCreateManual(({ type, target, rootFileName }) => {
      this.createNewItemManual(type, target, rootFileName);
    }));
    const hasSections = new Set(this.workspaceService.managementSections);
    if (hasSections.has(AICustomizationManagementSection.Models)) {
      this.modelsContentContainer = append(contentInner, $96(".models-content-container"));
      const modelsBackBar = append(this.modelsContentContainer, $96(".section-back-bar"));
      modelsBackBar.appendChild(this.createBackArrowButton());
      this.modelsWidget = this.editorDisposables.add(this.instantiationService.createInstance(ChatModelsWidget, { vendor: "opencode", presentation: "api" }));
      this.modelsContentContainer.appendChild(this.modelsWidget.element);
      const modelsFooterElement = append(this.modelsContentContainer, $96(".section-footer"));
      const modelsDescription = append(modelsFooterElement, $96("p.section-footer-description"));
      modelsDescription.textContent = localize(9428, null);
    }
    if (hasSections.has(AICustomizationManagementSection.Codex)) {
      this.codexContentContainer = append(contentInner, $96(".codex-content-container"));
      const codexBackBar = append(this.codexContentContainer, $96(".section-back-bar"));
      codexBackBar.appendChild(this.createBackArrowButton());
      this.codexModelsWidget = this.editorDisposables.add(this.instantiationService.createInstance(ChatModelsWidget, { vendor: "opencode-codex", presentation: "codex" }));
      this.codexContentContainer.appendChild(this.codexModelsWidget.element);
      const codexFooterElement = append(this.codexContentContainer, $96(".section-footer"));
      const codexDescription = append(codexFooterElement, $96("p.section-footer-description"));
      codexDescription.textContent = localize(9446, null);
    }
    if (hasSections.has(AICustomizationManagementSection.McpServers)) {
      this.mcpContentContainer = append(contentInner, $96(".mcp-content-container"));
      this.mcpListWidget = this.editorDisposables.add(this.instantiationService.createInstance(McpListWidget, false));
      this.mcpListWidget.setCloseCustomizationEditor(async () => {
        if (this.input) {
          await this.group.closeEditor(this.input);
        }
      });
      this.mcpContentContainer.appendChild(this.mcpListWidget.element);
      this.mcpDetailContainer = append(contentInner, $96(".mcp-detail-container"));
      this.createEmbeddedMcpDetail();
      this.editorDisposables.add(this.mcpListWidget.onDidSelectServer((server) => {
        this.showEmbeddedMcpDetail(server);
      }));
      this.editorDisposables.add(this.mcpListWidget.onDidRequestShowPlugin((item) => {
        this.showPluginDetail(item);
      }));
    }
    if (hasSections.has(AICustomizationManagementSection.Plugins)) {
      this.pluginContentContainer = append(contentInner, $96(".plugin-content-container"));
      this.pluginListWidget = this.editorDisposables.add(this.instantiationService.createInstance(PluginListWidget));
      this.pluginContentContainer.appendChild(this.pluginListWidget.element);
      this.pluginDetailContainer = append(contentInner, $96(".plugin-detail-container"));
      this.createEmbeddedPluginDetail();
      this.editorDisposables.add(this.pluginListWidget.onDidSelectPlugin((item) => {
        this.pluginDetailReturnSection = void 0;
        this.showEmbeddedPluginDetail(item);
      }));
    }
    if (hasSections.has(AICustomizationManagementSection.Tools)) {
      this.toolsContentContainer = append(contentInner, $96(".tools-content-container"));
      this.toolsListWidget = this.editorDisposables.add(this.instantiationService.createInstance(ToolsListWidget, AGENT_HOST_COPILOT_CLI_SESSION_TYPE));
      this.toolsContentContainer.appendChild(this.toolsListWidget.element);
      this.toolsDetailContainer = append(contentInner, $96(".tools-detail-container"));
      this.createEmbeddedToolDetail();
      this.editorDisposables.add(this.toolsListWidget.onDidSelectExtension((extension) => {
        this.showEmbeddedToolDetail(extension);
      }));
    }
    if (hasSections.has(AICustomizationManagementSection.Automations)) {
      this.automationsContentContainer = append(contentInner, $96(".automations-content-container"));
      this.automationsListWidget = this.editorDisposables.add(this.instantiationService.createInstance(AutomationsListWidget));
      this.automationsContentContainer.appendChild(this.automationsListWidget.element);
    }
    for (const section of this.workspaceService.managementSections) {
      if (!aiCustomizationManagementSectionRegistry.has(section)) {
        continue;
      }
      const container3 = append(contentInner, $96(".contributed-section-container"));
      this.contributedSectionContainers.set(section, container3);
    }
    this.editorContentContainer = append(contentInner, $96(".editor-content-container"));
    this.createEmbeddedEditor();
    this.updateContentVisibility();
    this.editorDisposables.add(this.listWidget.onDidChangeItemCount((count2) => {
      if (this.isPromptsSection(this.selectedSection)) {
        this.updateSectionCount(this.selectedSection, count2);
      }
    }));
    if (this.mcpListWidget) {
      this.editorDisposables.add(this.mcpListWidget.onDidChangeItemCount((count2) => {
        this.updateSectionCount(AICustomizationManagementSection.McpServers, count2);
      }));
      this.mcpListWidget.fireItemCount();
    }
    if (this.pluginListWidget) {
      this.editorDisposables.add(this.pluginListWidget.onDidChangeItemCount((count2) => {
        this.updateSectionCount(AICustomizationManagementSection.Plugins, count2);
      }));
      this.pluginListWidget.fireItemCount();
    }
    if (this.automationsListWidget) {
      this.editorDisposables.add(this.automationsListWidget.onDidChangeItemCount((count2) => {
        this.updateSectionCount(AICustomizationManagementSection.Automations, count2);
      }));
      this.automationsListWidget.fireItemCount();
    }
    if (this.modelsWidget) {
      this.editorDisposables.add(this.modelsWidget.onDidChangeItemCount((count2) => {
        this.updateSectionCount(AICustomizationManagementSection.Models, count2);
      }));
      this.modelsWidget.fireItemCount();
    }
    if (this.codexModelsWidget) {
      this.editorDisposables.add(this.codexModelsWidget.onDidChangeItemCount((count2) => {
        this.updateSectionCount(AICustomizationManagementSection.Codex, count2);
      }));
      this.codexModelsWidget.fireItemCount();
    }
    if (this.toolsListWidget) {
      this.editorDisposables.add(this.toolsListWidget.onDidChangeItemCount((count2) => {
        this.updateSectionCount(AICustomizationManagementSection.Tools, count2);
      }));
      this.toolsListWidget.fireItemCount();
    }
    for (const section of ITEMS_MODEL_SECTIONS) {
      const observable = this.itemsModel.getCount(section);
      this.editorDisposables.add(autorun((reader) => {
        this.updateSectionCount(section, observable.read(reader));
      }));
    }
    if (this.isPromptsSection(this.selectedSection)) {
      void this.listWidget.setSection(this.selectedSection);
    }
    void this.refreshPromptMigrationInfo();
  }
  async refreshPromptMigrationInfo() {
    const activeHarnessId = this.harnessService.activeHarness.get();
    const refreshSequence = ++this.promptMigrationRefreshSequence;
    if (!isAgentHostTarget(activeHarnessId)) {
      this.setPromptFilesToMigrate([]);
      return;
    }
    try {
      const promptFiles = await this.promptsService.listPromptFiles("prompt" /* prompt */, CancellationToken.None);
      if (refreshSequence !== this.promptMigrationRefreshSequence || activeHarnessId !== this.harnessService.activeHarness.get()) {
        return;
      }
      this.setPromptFilesToMigrate(promptFiles.filter((file) => file.storage === "local" /* local */ || file.storage === "user" /* user */));
    } catch (error) {
      if (refreshSequence === this.promptMigrationRefreshSequence) {
        this.setPromptFilesToMigrate([]);
      }
      onUnexpectedError(error);
    }
  }
  setPromptFilesToMigrate(promptFiles) {
    const previousPromptUris = new ResourceSet(this.promptFilesToMigrate.map((promptFile) => promptFile.uri));
    const selectedPromptUris = new ResourceSet();
    for (const promptFile of promptFiles) {
      if (!previousPromptUris.has(promptFile.uri) || this.selectedPromptMigrationUris.has(promptFile.uri)) {
        selectedPromptUris.add(promptFile.uri);
      }
    }
    this.selectedPromptMigrationUris = selectedPromptUris;
    this.promptFilesToMigrate = promptFiles;
    this.refreshPromptMigrationUi();
  }
  refreshPromptMigrationUi() {
    const migrationInfo = this.isPromptMigrationEnabled() ? getPromptMigrationInfo(this.promptFilesToMigrate) : void 0;
    this.welcomePage?.setPromptMigrationInfo(migrationInfo);
    this.updateSidebarMigrationShortcut(migrationInfo);
    this.renderPromptMigrationPage();
  }
  updateSidebarMigrationShortcut(migrationInfo) {
    if (!this.migrationShortcutContainer || !this.migrationShortcutButton || !this.migrationShortcutCount) {
      return;
    }
    if (!migrationInfo) {
      this.migrationShortcutContainer.style.display = "none";
      this.layoutSidebar(this.sidebarWidth, this.sidebarHeight);
      return;
    }
    this.migrationShortcutContainer.style.display = "";
    this.migrationShortcutCount.textContent = String(migrationInfo.totalPromptCount);
    this.migrationShortcutButton.setAttribute(
      "aria-label",
      localize(9472, null, migrationInfo.totalPromptCount)
    );
    this.layoutSidebar(this.sidebarWidth, this.sidebarHeight);
  }
  async migratePromptFiles(promptFiles) {
    if (promptFiles.length === 0) {
      return;
    }
    if (!this.isPromptMigrationEnabled()) {
      return;
    }
    const migrationInfo = getPromptMigrationInfo(promptFiles);
    if (!migrationInfo) {
      return;
    }
    const confirmResult = await this.dialogService.confirm({
      type: "question",
      message: localize(9487, null),
      detail: migrationInfo && migrationInfo.workspacePromptCount > 0 && migrationInfo.userPromptCount > 0 ? localize(9486, null, migrationInfo.workspacePromptCount, migrationInfo.userPromptCount) : migrationInfo && migrationInfo.workspacePromptCount > 0 ? localize(9485, null, migrationInfo.workspacePromptCount) : localize(9484, null, migrationInfo?.userPromptCount ?? this.promptFilesToMigrate.length),
      checkbox: {
        label: localize(9490, null),
        checked: true
      },
      primaryButton: localize(9483, null)
    });
    if (!confirmResult.confirmed) {
      return;
    }
    const skillSourceFolders = await this.itemsModel.getActiveItemSource().fetchSourceFolders("skill" /* skill */);
    if (skillSourceFolders.length === 0) {
      this.notificationService.error(localize(9494, null));
      return;
    }
    const skillSourceFoldersByStorage = await this.resolveMigrationSkillSourceFolders(skillSourceFolders, migrationInfo);
    if (!skillSourceFoldersByStorage) {
      return;
    }
    const migrationResult = await migratePromptFilesToSkills(
      promptFiles,
      skillSourceFoldersByStorage,
      this.fileService,
      onUnexpectedError,
      { deleteOriginalPromptFiles: confirmResult.checkboxChecked !== false }
    );
    const { convertedCount, failedPromptFileNames, unsupportedHeaderKeys, convertedSkillFileUris } = migrationResult;
    if (failedPromptFileNames.length > 0) {
      const displayedFileNames = failedPromptFileNames.slice(0, 3);
      const hiddenFileCount = failedPromptFileNames.length - displayedFileNames.length;
      if (hiddenFileCount > 0) {
        this.notificationService.error(localize(
          9492,
          null,
          failedPromptFileNames.length,
          displayedFileNames.join(", "),
          hiddenFileCount
        ));
      } else {
        this.notificationService.error(localize(
          9491,
          null,
          failedPromptFileNames.length,
          displayedFileNames.join(", ")
        ));
      }
    }
    if (convertedCount === 0) {
      if (failedPromptFileNames.length === 0) {
        this.notificationService.warn(localize(9493, null));
      }
      return;
    }
    await this.refreshPromptMigrationInfo();
    const unsupportedKeysLabel = Array.from(unsupportedHeaderKeys).sort().join(", ");
    if (unsupportedKeysLabel.length > 0) {
      this.notificationService.info(localize(
        9489,
        null,
        convertedCount,
        unsupportedKeysLabel
      ));
    } else {
      this.notificationService.info(localize(9488, null, convertedCount));
    }
    this.selectSection(AICustomizationManagementSection.Skills);
    void this.revealMigratedSkills(convertedSkillFileUris);
  }
  renderPromptMigrationPage() {
    if (!this.migrationListContainer || !this.migrationMigrateButton) {
      return;
    }
    this.migrationPageDisposables.clear();
    clearNode(this.migrationListContainer);
    this.updatePromptMigrationPageDescription();
    if (this.promptFilesToMigrate.length === 0 || !this.isPromptMigrationEnabled()) {
      const emptyMessage = append(this.migrationListContainer, $96("p.prompt-migration-empty"));
      emptyMessage.textContent = localize(9502, null);
      this.migrationMigrateButton.enabled = false;
      this.migrationListScrollable?.scanDomNode();
      return;
    }
    const query = this.migrationSearchQuery.trim().toLowerCase();
    const filteredPromptFiles = this.promptFilesToMigrate.filter((promptFile) => {
      if (!query) {
        return true;
      }
      const displayName = (promptFile.name ?? basename2(promptFile.uri)).toLowerCase();
      const relativePath2 = this.labelService.getUriLabel(promptFile.uri, { relative: true }).toLowerCase();
      return displayName.includes(query) || relativePath2.includes(query);
    });
    if (filteredPromptFiles.length === 0) {
      const emptyMessage = append(this.migrationListContainer, $96("p.prompt-migration-empty"));
      emptyMessage.textContent = localize(9505, null);
      this.updatePromptMigrationActionState();
      this.migrationListScrollable?.scanDomNode();
      return;
    }
    const workspacePromptFiles = filteredPromptFiles.filter((file) => file.storage === "local" /* local */);
    const userPromptFiles = filteredPromptFiles.filter((file) => file.storage === "user" /* user */);
    const openPromptFileInEmbeddedEditor = (promptFile) => {
      const isWorkspaceFile = promptFile.storage === "local" /* local */;
      void this.showEmbeddedEditor(
        promptFile.uri,
        promptFile.name ?? basename2(promptFile.uri),
        "prompt" /* prompt */,
        promptFile.storage,
        isWorkspaceFile
      );
    };
    const renderSelectionCheckbox = (row, promptFile) => {
      const checkboxContainer = append(row, $96(".item-sync-checkbox.prompt-migration-checkbox"));
      const checkboxTitle = localize(9507, null, promptFile.name ?? basename2(promptFile.uri));
      const checkbox = this.migrationPageDisposables.add(new Checkbox(checkboxTitle, this.selectedPromptMigrationUris.has(promptFile.uri), defaultCheckboxStyles));
      checkboxContainer.replaceChildren(checkbox.domNode);
      this.migrationPageDisposables.add(checkbox.onChange(() => {
        if (checkbox.checked) {
          this.selectedPromptMigrationUris.add(promptFile.uri);
        } else {
          this.selectedPromptMigrationUris.delete(promptFile.uri);
        }
        this.updatePromptMigrationActionState();
      }));
      return checkbox;
    };
    const renderItem = (container3, promptFile) => {
      const row = append(container3, $96("div.ai-customization-list-item.prompt-migration-item"));
      const checkbox = renderSelectionCheckbox(row, promptFile);
      this.migrationPageDisposables.add(addDisposableListener(row, "click", (event) => {
        if (event.target instanceof Node && checkbox.domNode.contains(event.target)) {
          return;
        }
        openPromptFileInEmbeddedEditor(promptFile);
      }));
      const itemLeft = append(row, $96("span.item-left"));
      const itemText = append(itemLeft, $96("span.item-text"));
      const nameRow = append(itemText, $96("span.item-name-row"));
      const nameLabel = append(nameRow, $96("span.item-name.prompt-migration-item-name"));
      nameLabel.textContent = promptFile.name ?? basename2(promptFile.uri);
      const pathLabel = append(itemText, $96("span.item-description.is-filename.prompt-migration-item-path"));
      pathLabel.textContent = this.labelService.getUriLabel(promptFile.uri, { relative: true });
      const itemRight = append(row, $96("span.item-right"));
      const deleteButton2 = append(itemRight, $96("button.icon-button", {
        type: "button",
        "aria-label": localize(9451, null, promptFile.name ?? basename2(promptFile.uri))
      }));
      deleteButton2.classList.add(...ThemeIcon.asClassNameArray(Codicon.trash));
      this.migrationPageDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), deleteButton2, localize(9452, null)));
      this.migrationPageDisposables.add(addDisposableListener(deleteButton2, "click", (event) => {
        event.stopPropagation();
        void this.deletePromptFile(promptFile);
      }));
    };
    const renderGroup = (groupKey, groupLabel, promptFiles) => {
      if (promptFiles.length === 0) {
        return;
      }
      const group2 = append(this.migrationListContainer, $96(".prompt-migration-group"));
      const groupHeader = append(group2, $96(".ai-customization-group-header.prompt-migration-group-header"));
      const groupCheckboxContainer = append(groupHeader, $96(".item-sync-checkbox.prompt-migration-group-checkbox"));
      const allInGroupSelected = promptFiles.every((file) => this.selectedPromptMigrationUris.has(file.uri));
      const groupCheckboxAriaLabel = localize(9508, null, groupLabel.toLowerCase());
      const groupCheckbox = this.migrationPageDisposables.add(new Checkbox(groupCheckboxAriaLabel, allInGroupSelected, defaultCheckboxStyles));
      groupCheckboxContainer.replaceChildren(groupCheckbox.domNode);
      this.migrationPageDisposables.add(groupCheckbox.onChange(() => {
        for (const promptFile of promptFiles) {
          if (groupCheckbox.checked) {
            this.selectedPromptMigrationUris.add(promptFile.uri);
          } else {
            this.selectedPromptMigrationUris.delete(promptFile.uri);
          }
        }
        this.renderPromptMigrationPage();
      }));
      const groupToggle = append(groupHeader, $96("button.prompt-migration-group-toggle"));
      groupToggle.type = "button";
      const groupId = `prompt-migration-group-${groupKey}`;
      const collapsed2 = this.collapsedPromptMigrationGroups.has(groupId);
      groupToggle.setAttribute("aria-controls", `${groupId}-items`);
      groupToggle.setAttribute("aria-expanded", String(!collapsed2));
      const chevron = append(groupToggle, $96("span.group-chevron"));
      chevron.setAttribute("aria-hidden", "true");
      const groupLabelGroup = append(groupToggle, $96(".group-label-group"));
      const label3 = append(groupLabelGroup, $96("span.group-label"));
      label3.textContent = groupLabel;
      const count2 = append(groupToggle, $96("span.group-count"));
      count2.textContent = String(promptFiles.length);
      const groupItems = append(group2, $96(".prompt-migration-group-items"));
      groupItems.id = `${groupId}-items`;
      const setGroupCollapsed = (collapsed3) => {
        groupItems.style.display = collapsed3 ? "none" : "";
        chevron.className = "group-chevron";
        chevron.classList.add(...ThemeIcon.asClassNameArray(collapsed3 ? Codicon.chevronRight : Codicon.chevronDown));
        groupToggle.setAttribute("aria-expanded", String(!collapsed3));
        this.migrationListScrollable?.scanDomNode();
      };
      setGroupCollapsed(collapsed2);
      this.migrationPageDisposables.add(addDisposableListener(groupToggle, "click", () => {
        if (this.collapsedPromptMigrationGroups.has(groupId)) {
          this.collapsedPromptMigrationGroups.delete(groupId);
          setGroupCollapsed(false);
        } else {
          this.collapsedPromptMigrationGroups.add(groupId);
          setGroupCollapsed(true);
        }
      }));
      for (const promptFile of promptFiles) {
        renderItem(groupItems, promptFile);
      }
    };
    renderGroup("local" /* local */, localize(9510, null), workspacePromptFiles);
    renderGroup("user" /* user */, localize(9509, null), userPromptFiles);
    for (const promptFile of filteredPromptFiles.filter((file) => file.storage !== "local" /* local */ && file.storage !== "user" /* user */)) {
      renderItem(this.migrationListContainer, promptFile);
    }
    this.updatePromptMigrationActionState();
    this.migrationListScrollable?.scanDomNode();
  }
  updatePromptMigrationPageDescription() {
    if (!this.migrationDescriptionElement) {
      return;
    }
    const migrationInfo = getPromptMigrationInfo(this.promptFilesToMigrate);
    if (!migrationInfo) {
      this.migrationDescriptionElement.textContent = localize(9498, null);
      return;
    }
    const { workspacePromptCount, userPromptCount, totalPromptCount } = migrationInfo;
    const harnessLabel = this.getActiveHarnessLabel();
    if (workspacePromptCount > 0 && userPromptCount > 0) {
      this.migrationDescriptionElement.textContent = localize(
        9501,
        null,
        totalPromptCount,
        workspacePromptCount,
        userPromptCount,
        harnessLabel
      );
      return;
    }
    if (workspacePromptCount > 0) {
      this.migrationDescriptionElement.textContent = localize(
        9500,
        null,
        workspacePromptCount,
        harnessLabel
      );
      return;
    }
    this.migrationDescriptionElement.textContent = localize(
      9499,
      null,
      userPromptCount,
      harnessLabel
    );
  }
  updatePromptMigrationActionState() {
    if (!this.migrationMigrateButton) {
      return;
    }
    const selectedCount = this.promptFilesToMigrate.filter((file) => this.selectedPromptMigrationUris.has(file.uri)).length;
    this.migrationMigrateButton.enabled = selectedCount > 0;
    this.migrationMigrateButton.label = selectedCount > 0 ? localize(9497, null, selectedCount) : localize(9495, null);
  }
  async deletePromptFile(promptFile) {
    const fileName = promptFile.name ?? basename2(promptFile.uri);
    const confirmation = await this.dialogService.confirm({
      message: localize(9448, null, fileName),
      detail: localize(9447, null),
      primaryButton: localize(9450, null),
      type: "warning"
    });
    if (!confirmation.confirmed) {
      return;
    }
    const useTrash = this.fileService.hasCapability(promptFile.uri, 4096 /* Trash */);
    await this.fileService.del(promptFile.uri, { useTrash });
    if (promptFile.storage === "local" /* local */) {
      const projectRoot = this.workspaceService.getActiveProjectRoot();
      if (projectRoot) {
        await this.workspaceService.deleteFiles(projectRoot, [promptFile.uri]);
      }
    }
    const updatedFiles = this.promptFilesToMigrate.filter((f) => !isEqual2(f.uri, promptFile.uri));
    this.setPromptFilesToMigrate(updatedFiles);
  }
  isPromptMigrationEnabled() {
    return this.configurationService.getValue("chat.customizations.promptMigration.enabled" /* ChatCustomizationsPromptMigrationEnabled */) === true;
  }
  async resolveMigrationSkillSourceFolders(skillSourceFolders, migrationInfo) {
    const sourceFoldersByStorage = /* @__PURE__ */ new Map();
    const localSkillSourceFolders = skillSourceFolders.filter((folder) => folder.source === "local" /* local */);
    if (localSkillSourceFolders.length > 0) {
      if ((migrationInfo?.workspacePromptCount ?? 0) > 0 && localSkillSourceFolders.length > 1) {
        const pickedLocalFolder = await this.pickMigrationWorkspaceSkillSourceFolder(localSkillSourceFolders);
        if (!pickedLocalFolder) {
          return void 0;
        }
        sourceFoldersByStorage.set("local" /* local */, pickedLocalFolder);
      } else {
        sourceFoldersByStorage.set("local" /* local */, localSkillSourceFolders[0]);
      }
    }
    for (const folder of skillSourceFolders) {
      if (folder.source === "user" /* user */ && !sourceFoldersByStorage.has("user" /* user */)) {
        sourceFoldersByStorage.set("user" /* user */, folder);
      }
      if (folder.source === "local" /* local */ && !sourceFoldersByStorage.has("local" /* local */)) {
        sourceFoldersByStorage.set("local" /* local */, folder);
      }
    }
    return sourceFoldersByStorage;
  }
  async pickMigrationWorkspaceSkillSourceFolder(localSkillSourceFolders) {
    const picks = localSkillSourceFolders.map((folder) => ({
      label: folder.label,
      description: this.labelService.getUriLabel(folder.uri, { relative: true }),
      folder
    }));
    const selected = await this.quickInputService.pick(picks, {
      canPickMany: false,
      placeHolder: localize(9504, null),
      matchOnDescription: true
    });
    return selected?.folder;
  }
  async revealMigratedSkills(skillUris) {
    if (skillUris.length === 0) {
      return;
    }
    await this.listWidget.setSection(AICustomizationManagementSection.Skills);
    if (this.listWidget.revealAndSelectFirstItemByUri(skillUris)) {
      return;
    }
    this.listWidget.clearSearch();
    if (this.listWidget.revealAndSelectFirstItemByUri(skillUris)) {
      return;
    }
    for (let attempt = 0; attempt < 10; attempt++) {
      await timeout(100);
      if (this.listWidget.revealAndSelectFirstItemByUri(skillUris)) {
        return;
      }
    }
  }
  isPromptsSection(section) {
    return section === AICustomizationManagementSection.Agents || section === AICustomizationManagementSection.Skills || section === AICustomizationManagementSection.Instructions || section === AICustomizationManagementSection.Prompts || section === AICustomizationManagementSection.Hooks;
  }
  //#region Section Counts
  /**
   * Updates the count for a specific section and re-renders the sidebar.
   */
  updateSectionCount(sectionId, count2) {
    const section = this.sections.find((s) => s.id === sectionId);
    if (!section || section.count === count2) {
      return;
    }
    section.count = count2;
    this.sectionsList.splice(0, this.sectionsList.length, this.sections);
    this.ensureSectionsListReflectsActiveSection();
  }
  //#endregion
  /**
   * Navigates to the welcome page (no section selected).
   */
  showWelcomePage() {
    const fallback2 = defaultOpenCodeCustomizationSection(this.sections);
    if (fallback2) {
      this.selectSectionById(fallback2);
      return;
    }
    if (this.viewMode === "editor") {
      this.goBackToList();
    }
    if (this.viewMode === "migration") {
      this.viewMode = "list";
    }
    if (this.viewMode === "mcpDetail") {
      this.goBackFromMcpDetail();
    }
    if (this.viewMode === "pluginDetail") {
      this.goBackFromPluginDetail();
    }
    if (this.viewMode === "toolsDetail") {
      this.goBackFromToolDetail();
    }
    this.selectedSection = void 0;
    this.sectionContextKey.set("");
    this.storageService.remove(AI_CUSTOMIZATION_MANAGEMENT_SELECTED_SECTION_KEY, 0 /* PROFILE */);
    this.welcomePage?.reset();
    this.updateContentVisibility();
    this.ensureSectionsListReflectsActiveSection(void 0);
    this.welcomePage?.focus();
  }
  selectSection(section, options3) {
    if (this.selectedSection === section && !options3?.showMarketplace) {
      this.ensureSectionsListReflectsActiveSection(section);
      return;
    }
    this.telemetryService.publicLog2("chatCustomizationEditor.sectionChanged", {
      section
    });
    if (this.viewMode === "editor") {
      this.goBackToList();
    }
    if (this.viewMode === "migration") {
      this.viewMode = "list";
    }
    if (this.viewMode === "mcpDetail") {
      this.goBackFromMcpDetail();
    }
    if (this.viewMode === "pluginDetail") {
      this.goBackFromPluginDetail();
    }
    if (this.viewMode === "toolsDetail") {
      this.goBackFromToolDetail();
    }
    this.selectedSection = section;
    this.sectionContextKey.set(section);
    this.storageService.store(AI_CUSTOMIZATION_MANAGEMENT_SELECTED_SECTION_KEY, section, 0 /* PROFILE */, 0 /* USER */);
    this.updateContentVisibility();
    if (this.isPromptsSection(section)) {
      void this.listWidget.setSection(section);
    }
    if (this.dimension) {
      this.layout(this.dimension);
    }
    this.ensureSectionsListReflectsActiveSection(section);
    if (options3?.showMarketplace) {
      if (section === AICustomizationManagementSection.McpServers) {
        this.mcpListWidget?.showBrowseMarketplace();
      } else if (section === AICustomizationManagementSection.Plugins) {
        this.pluginListWidget?.showBrowseMarketplace();
      }
    }
    if (aiCustomizationManagementSectionRegistry.has(section)) {
      this.ensureContributedSectionWidget(section)?.focus?.();
    } else if (section === AICustomizationManagementSection.McpServers) {
      this.mcpListWidget?.focusSearch();
    } else if (section === AICustomizationManagementSection.Plugins) {
      this.pluginListWidget?.focusSearch();
    } else if (section === AICustomizationManagementSection.Models) {
      this.modelsWidget?.focusSearch();
    } else if (section === AICustomizationManagementSection.Codex) {
      this.codexModelsWidget?.focusSearch();
    } else if (section === AICustomizationManagementSection.Tools) {
      this.toolsListWidget?.focusSearch();
    } else if (section === AICustomizationManagementSection.Automations) {
      this.automationsListWidget?.focus();
    } else {
      this.listWidget?.focusSearch();
    }
  }
  ensureSectionsListReflectsActiveSection(section = this.selectedSection) {
    if (!this.sectionsList) {
      return;
    }
    if (section === void 0) {
      this.sectionsList.setSelection([]);
      this.sectionsList.setFocus([]);
      return;
    }
    const index2 = this.sections.findIndex((s) => s.id === section);
    if (index2 < 0) {
      return;
    }
    const selection = this.sectionsList.getSelection();
    if (selection.length !== 1 || selection[0] !== index2) {
      this.sectionsList.setSelection([index2]);
    }
    const focus = this.sectionsList.getFocus();
    if (focus.length !== 1 || focus[0] !== index2) {
      this.sectionsList.setFocus([index2]);
    }
  }
  updateContentVisibility() {
    const isEditorMode = this.viewMode === "editor";
    const isMigrationMode = this.viewMode === "migration";
    const isMcpDetailMode = this.viewMode === "mcpDetail";
    const isPluginDetailMode = this.viewMode === "pluginDetail";
    const isToolsDetailMode = this.viewMode === "toolsDetail";
    const isDetailMode = isMcpDetailMode || isPluginDetailMode || isToolsDetailMode;
    const isWelcome = this.selectedSection === void 0;
    const isPromptsSection = this.selectedSection !== void 0 && this.isPromptsSection(this.selectedSection);
    const isModelsSection = this.selectedSection === AICustomizationManagementSection.Models;
    const isCodexSection = this.selectedSection === AICustomizationManagementSection.Codex;
    const isMcpSection = this.selectedSection === AICustomizationManagementSection.McpServers;
    const isPluginsSection = this.selectedSection === AICustomizationManagementSection.Plugins;
    const isToolsSection = this.selectedSection === AICustomizationManagementSection.Tools;
    const isAutomationsSection = this.selectedSection === AICustomizationManagementSection.Automations;
    if (this.welcomePage) {
      this.welcomePage.container.style.display = isWelcome && !isEditorMode && !isMigrationMode && !isDetailMode ? "" : "none";
    }
    if (this.promptsContentContainer) {
      this.promptsContentContainer.style.display = !isEditorMode && !isMigrationMode && !isDetailMode && isPromptsSection ? "" : "none";
    }
    if (this.migrationContentContainer) {
      this.migrationContentContainer.style.display = isMigrationMode ? "" : "none";
    }
    if (this.modelsContentContainer) {
      this.modelsContentContainer.style.display = !isEditorMode && !isMigrationMode && !isDetailMode && isModelsSection ? "" : "none";
    }
    if (this.codexContentContainer) {
      this.codexContentContainer.style.display = !isEditorMode && !isMigrationMode && !isDetailMode && isCodexSection ? "" : "none";
    }
    if (this.mcpContentContainer) {
      this.mcpContentContainer.style.display = !isEditorMode && !isMigrationMode && !isDetailMode && isMcpSection ? "" : "none";
    }
    if (this.mcpDetailContainer) {
      this.mcpDetailContainer.style.display = isMcpDetailMode ? "" : "none";
    }
    if (this.pluginContentContainer) {
      this.pluginContentContainer.style.display = !isEditorMode && !isMigrationMode && !isDetailMode && isPluginsSection ? "" : "none";
    }
    this.updateAutomationsContentVisibility(!isEditorMode && !isMigrationMode && !isDetailMode && isAutomationsSection);
    if (this.pluginDetailContainer) {
      this.pluginDetailContainer.style.display = isPluginDetailMode ? "" : "none";
    }
    if (this.toolsContentContainer) {
      this.toolsContentContainer.style.display = !isEditorMode && !isMigrationMode && !isDetailMode && isToolsSection ? "" : "none";
    }
    if (this.toolsDetailContainer) {
      this.toolsDetailContainer.style.display = isToolsDetailMode ? "" : "none";
    }
    for (const [section, container3] of this.contributedSectionContainers) {
      const visible = !isEditorMode && !isMigrationMode && !isDetailMode && this.selectedSection === section;
      container3.style.display = visible ? "" : "none";
      if (visible) {
        this.ensureContributedSectionWidget(section);
      }
    }
    if (this.editorContentContainer) {
      this.editorContentContainer.style.display = isEditorMode ? "" : "none";
    }
    if (isModelsSection && this.modelsWidget) {
      this.modelsWidget.render();
      if (this.dimension) {
        this.layout(this.dimension);
      }
    }
    if (isCodexSection && this.codexModelsWidget) {
      this.codexModelsWidget.render();
      if (this.dimension) {
        this.layout(this.dimension);
      }
    }
  }
  ensureContributedSectionWidget(section) {
    const existing = this.contributedSectionWidgets.get(section);
    if (existing) {
      return existing;
    }
    const contribution = aiCustomizationManagementSectionRegistry.get(section, this.harnessService.activeHarness.get());
    const container3 = this.contributedSectionContainers.get(section);
    if (!contribution || !container3) {
      return void 0;
    }
    const widget = contribution.create(this.instantiationService, container3);
    this.contributedSectionWidgets.set(section, widget);
    this.editorDisposables.add(widget);
    if (this.dimension) {
      widget.layout?.(this.dimension);
    }
    return widget;
  }
  updateAutomationsContentVisibility(sectionVisible) {
    if (!this.automationsContentContainer) {
      return;
    }
    if (sectionVisible) {
      this.automationsContentContainer.style.display = "";
      this.automationsListWidget?.setVisible(this.isVisible());
    } else {
      this.automationsListWidget?.setVisible(false);
      this.automationsContentContainer.style.display = "none";
    }
  }
  /**
   * Creates a new customization using the AI-guided flow.
   */
  async createNewItemWithAI(type) {
    this.telemetryService.publicLog2("chatCustomizationEditor.createItem", {
      section: this.selectedSection ?? "welcome",
      promptType: type,
      creationMode: "ai",
      target: "workspace"
    });
    if (this.input) {
      this.group.closeEditor(this.input);
    }
    await this.workspaceService.generateCustomization(type);
  }
  /**
   * Creates a new prompt file and opens it in the embedded editor.
   */
  async createNewItemManual(type, target, rootFileName) {
    this.telemetryService.publicLog2("chatCustomizationEditor.createItem", {
      section: this.selectedSection ?? "welcome",
      promptType: type,
      creationMode: "manual",
      target: target === "workspace-root" ? "workspace" : target
    });
    if (target === "workspace-root") {
      const projectRoot = this.workspaceService.getActiveProjectRoot();
      if (!projectRoot) {
        return;
      }
      const override2 = this.selectedSection ? this.harnessService.getActiveDescriptor().sectionOverrides?.get(this.selectedSection) : void 0;
      const fileName = rootFileName ?? override2?.rootFile ?? AGENT_MD_FILENAME;
      const fileUri = URI.joinPath(projectRoot, fileName);
      if (await this.fileService.exists(fileUri)) {
        await this.showEmbeddedEditor(fileUri, fileName, "instructions" /* instructions */, "local" /* local */, true);
      } else {
        await this.fileService.createFile(fileUri);
        await this.showEmbeddedEditor(fileUri, fileName, "instructions" /* instructions */, "local" /* local */, true);
      }
      this.listWidget.refresh();
      return;
    }
    if (type === "hook" /* hook */) {
      if (this.workspaceService.isSessionsWindow) {
        await this.instantiationService.invokeFunction(showConfigureHooksQuickPick, {
          openEditor: async (resource) => {
            await this.showEmbeddedEditor(resource, basename2(resource), "hook" /* hook */, "local" /* local */, true);
            return;
          },
          target: "github-copilot" /* GitHubCopilot */
        });
      } else {
        await this.instantiationService.invokeFunction(showConfigureHooksQuickPick, {
          openEditor: async (resource) => {
            await this.showEmbeddedEditor(resource, basename2(resource), "hook" /* hook */, "local" /* local */, true);
            return;
          }
        });
      }
      return;
    }
    const sessionResource = this.harnessService.activeSessionResource.get();
    const picker = this.instantiationService.createInstance(CustomizationLocationPicker);
    const targetDir = await picker.resolveTargetDirectoryWithPicker(
      sessionResource,
      type,
      target
    );
    if (targetDir === null) {
      return;
    }
    if (targetDir === void 0) {
      await this.instantiationService.invokeFunction(showNoFoldersDialog, type);
      return;
    }
    const override = this.selectedSection ? this.harnessService.getActiveDescriptor().sectionOverrides?.get(this.selectedSection) : void 0;
    const options3 = {
      targetFolder: targetDir,
      targetStorage: target === AICustomizationSources.user ? "user" /* user */ : "local" /* local */,
      fileExtension: override?.fileExtension,
      openFile: async (uri5) => {
        const isWorkspace2 = target === AICustomizationSources.local;
        await this.showEmbeddedEditor(uri5, basename2(uri5), type, target, isWorkspace2);
        return this.embeddedEditor;
      }
    };
    let commandId;
    switch (type) {
      case "prompt" /* prompt */:
        commandId = NEW_PROMPT_COMMAND_ID;
        break;
      case "instructions" /* instructions */:
        commandId = NEW_INSTRUCTIONS_COMMAND_ID;
        break;
      case "agent" /* agent */:
        commandId = NEW_AGENT_COMMAND_ID;
        break;
      case "skill" /* skill */:
        commandId = NEW_SKILL_COMMAND_ID;
        break;
      default:
        return;
    }
    await this.commandService.executeCommand(commandId, options3);
    this.listWidget.refresh();
  }
  updateStyles() {
    this.splitView?.style({ separatorBorder: Color.transparent });
  }
  async setInput(input, options3, context2, token) {
    this.workspaceService.clearOverrideProjectRoot();
    this.inEditorContextKey.set(true);
    this.sectionContextKey.set(this.selectedSection ?? "");
    input.setSaveHandler(() => this.handleBuiltinSave());
    this.telemetryService.publicLog2("chatCustomizationEditor.opened", {
      section: this.selectedSection ?? "welcome"
    });
    await super.setInput(input, options3, context2, token);
    if (this.dimension) {
      this.layout(this.dimension);
    }
  }
  clearInput() {
    const input = this.input;
    if (input instanceof AICustomizationManagementEditorInput) {
      input.setSaveHandler(void 0);
      input.setDirty(false);
    }
    this.inEditorContextKey.set(false);
    if (this.viewMode === "editor") {
      this.goBackToList();
    }
    if (this.viewMode === "migration") {
      this.viewMode = "list";
    }
    if (this.viewMode === "mcpDetail") {
      this.goBackFromMcpDetail();
    }
    if (this.viewMode === "pluginDetail") {
      this.goBackFromPluginDetail();
    }
    if (this.viewMode === "toolsDetail") {
      this.goBackFromToolDetail();
    }
    this.workspaceService.clearOverrideProjectRoot();
    this.disposeBuiltinEditingSessions();
    super.clearInput();
  }
  setEditorVisible(visible) {
    super.setEditorVisible(visible);
    this.updateAutomationsContentVisibility(this.viewMode === "list" && this.selectedSection === AICustomizationManagementSection.Automations);
    if (visible && this.dimension) {
      this.layout(this.dimension);
    }
  }
  layout(dimension) {
    this.dimension = dimension;
    if (this.container && this.splitView) {
      const contentHeight = Math.max(0, dimension.height - CUSTOMIZATION_NAVIGATION_BAR_HEIGHT);
      this.splitViewContainer.style.height = `${contentHeight}px`;
      this.splitView.layout(dimension.width, contentHeight);
    }
    for (const widget of this.contributedSectionWidgets.values()) {
      widget.layout?.(dimension);
    }
    this.migrationSearchInput?.layout();
    this.migrationListScrollable?.scanDomNode();
  }
  focus() {
    super.focus();
    if (this.viewMode === "editor") {
      if (this.editorDisplayMode === "raw") {
        this.embeddedEditor?.focus();
      } else {
        this.editorModeButton?.focus();
      }
      return;
    }
    if (this.viewMode === "migration") {
      this.migrationSearchInput?.focus();
      return;
    }
    if (this.selectedSection === void 0) {
      this.welcomePage?.focus();
      return;
    }
    if (this.selectedSection === AICustomizationManagementSection.McpServers) {
      this.mcpListWidget?.focusSearch();
    } else if (this.selectedSection === AICustomizationManagementSection.Plugins) {
      this.pluginListWidget?.focusSearch();
    } else if (this.selectedSection === AICustomizationManagementSection.Models) {
      this.modelsWidget?.focusSearch();
    } else if (this.selectedSection === AICustomizationManagementSection.Codex) {
      this.codexModelsWidget?.focusSearch();
    } else if (this.selectedSection === AICustomizationManagementSection.Tools) {
      this.toolsListWidget?.focusSearch();
    } else if (this.selectedSection === AICustomizationManagementSection.Automations) {
      this.automationsListWidget?.focus();
    } else if (this.selectedSection && this.contributedSectionContainers.has(this.selectedSection)) {
      this.ensureContributedSectionWidget(this.selectedSection)?.focus?.();
    } else {
      this.listWidget?.focusSearch();
    }
  }
  /**
   * Selects a specific section programmatically.
   */
  selectSectionById(sectionId, options3) {
    const wasNativeMcp = sectionId === AICustomizationManagementSection.McpServers && this.sections.some((section) => section.id === AICustomizationManagementSection.SkillCenter);
    if (wasNativeMcp) sectionId = AICustomizationManagementSection.SkillCenter;
    if (OPENCODE_HIDDEN_CUSTOMIZATION_SECTIONS.has(sectionId)) {
      sectionId = defaultOpenCodeCustomizationSection(this.sections) ?? sectionId;
    }
    const index2 = this.sections.findIndex((s) => s.id === sectionId);
    if (index2 >= 0) {
      if (this.viewMode === "editor") {
        this.goBackToList();
      }
      if (this.viewMode === "migration") {
        this.viewMode = "list";
      }
      if (this.viewMode === "mcpDetail") {
        this.goBackFromMcpDetail();
      }
      if (this.viewMode === "pluginDetail") {
        this.goBackFromPluginDetail();
      }
      if (this.viewMode === "toolsDetail") {
        this.goBackFromToolDetail();
      }
      this.selectedSection = sectionId;
      this.sectionContextKey.set(sectionId);
      this.storageService.store(AI_CUSTOMIZATION_MANAGEMENT_SELECTED_SECTION_KEY, sectionId, 0 /* PROFILE */, 0 /* USER */);
      this.updateContentVisibility();
      if (this.isPromptsSection(sectionId)) {
        void this.listWidget.setSection(sectionId);
      }
      if (this.dimension) {
        this.layout(this.dimension);
      }
      this.ensureSectionsListReflectsActiveSection(sectionId);
      if (options3?.showMarketplace) {
        if (sectionId === AICustomizationManagementSection.McpServers) {
          this.mcpListWidget?.showBrowseMarketplace();
        } else if (sectionId === AICustomizationManagementSection.Plugins) {
          this.pluginListWidget?.showBrowseMarketplace();
        }
      }
      if (wasNativeMcp) this.ensureContributedSectionWidget(sectionId)?.focusMcp();
    }
  }
  /**
   * Moves focus to a specific automation in the Automations section.
   */
  focusAutomation(automationId) {
    this.automationsListWidget?.focusAutomation(automationId);
  }
  showPromptMigrationPage() {
    if (!this.isPromptMigrationEnabled()) {
      return;
    }
    if (this.viewMode === "editor") {
      this.goBackToList();
    }
    if (this.viewMode === "mcpDetail") {
      this.goBackFromMcpDetail();
    }
    if (this.viewMode === "pluginDetail") {
      this.goBackFromPluginDetail();
    }
    if (this.viewMode === "toolsDetail") {
      this.goBackFromToolDetail();
    }
    this.selectedSection = void 0;
    this.sectionContextKey.set("");
    this.viewMode = "migration";
    this.ensureSectionsListReflectsActiveSection(void 0);
    this.renderPromptMigrationPage();
    this.updateContentVisibility();
    if (this.dimension) {
      this.layout(this.dimension);
    }
  }
  /**
   * Refreshes the list widget.
   */
  refreshList() {
    this.listWidget.refresh();
  }
  /**
   * Scrolls the active list widget so the last item is visible.
   */
  revealLastItem() {
    if (this.selectedSection === AICustomizationManagementSection.McpServers) {
      this.mcpListWidget?.revealLastItem();
    } else if (this.selectedSection === AICustomizationManagementSection.Plugins) {
      this.pluginListWidget?.revealLastItem();
    } else {
      this.listWidget.revealLastItem();
    }
  }
  /**
   * Generates a debug report for the current section.
   */
  async generateDebugReport() {
    return this.listWidget.generateDebugReport();
  }
  //#region Embedded Editor
  createEmbeddedEditor() {
    if (!this.editorContentContainer) {
      return;
    }
    const editorHeader = append(this.editorContentContainer, $96(".editor-header"));
    this.editorActionButton = append(editorHeader, $96("button.editor-back-button"));
    this.editorActionButton.setAttribute("aria-label", localize(9431, null));
    this.editorDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), this.editorActionButton, localize(9432, null)));
    this.editorActionButtonIcon = append(this.editorActionButton, $96(`.codicon.codicon-${Codicon.arrowLeft.id}.editor-action-button-icon`));
    this.editorActionButtonIcon.setAttribute("aria-hidden", "true");
    this.editorDisposables.add(addDisposableListener(this.editorActionButton, "click", () => {
      void this.handleEditorActionButton().catch((error) => {
        console.error("Failed to handle editor back action:", error);
        this.notificationService.error(localize(9453, null));
      });
    }));
    const itemInfo = append(editorHeader, $96(".editor-item-info"));
    this.editorItemNameElement = append(itemInfo, $96(".editor-item-name"));
    this.editorItemPathElement = append(itemInfo, $96(".editor-item-path"));
    this.editorModeButton = append(editorHeader, $96("button.editor-mode-button"));
    this.editorModeButton.type = "button";
    this.editorModeButton.setAttribute("aria-pressed", "false");
    this.editorDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), this.editorModeButton, () => this.getEditorModeButtonTooltip()));
    this.editorDisposables.add(addDisposableListener(this.editorModeButton, "click", () => {
      this.toggleEditorDisplayMode();
    }));
    this.editorSaveIndicator = append(editorHeader, $96(".editor-save-indicator"));
    this.editorPreviewContainer = append(this.editorContentContainer, $96(".editor-preview-container"));
    this.editorPreviewScrollContainer = append(this.editorPreviewContainer, $96(".editor-preview-scroll-container"));
    this.editorPreviewScrollContainer.setAttribute("role", "region");
    this.editorPreviewScrollContainer.setAttribute("aria-label", localize(9449, null));
    this.editorPreviewIssuesContainer = append(this.editorPreviewScrollContainer, $96(".editor-preview-issues"));
    const frontMatterSection = append(this.editorPreviewScrollContainer, $96(".editor-preview-section.editor-preview-frontmatter-section"));
    this.editorPreviewFrontMatterContainer = append(frontMatterSection, $96(".editor-preview-frontmatter-list"));
    const bodySection = append(this.editorPreviewScrollContainer, $96(".editor-preview-section.editor-preview-body-section"));
    this.editorPreviewBodyContainer = append(bodySection, $96(".editor-preview-body-content"));
    this.embeddedEditorContainer = append(this.editorContentContainer, $96(".embedded-editor-container"));
    const overflowWidgetsDomNode = append(this.editorContentContainer, $96(".embedded-editor-overflow-widgets.monaco-editor"));
    this.editorDisposables.add(toDisposable(() => overflowWidgetsDomNode.remove()));
    this.embeddedEditor = this.editorDisposables.add(this.instantiationService.createInstance(
      CodeEditorWidget,
      this.embeddedEditorContainer,
      {
        ...getSimpleEditorOptions(this.configurationService),
        readOnly: false,
        minimap: { enabled: false },
        lineNumbers: "on",
        wordWrap: "on",
        scrollBeyondLastLine: false,
        automaticLayout: false,
        folding: true,
        renderLineHighlight: "all",
        scrollbar: { vertical: "auto", horizontal: "auto" },
        overflowWidgetsDomNode
      },
      { isSimpleWidget: false }
    ));
    this.updateEditorDisplayMode();
  }
  async showEmbeddedEditor(uri5, displayName, promptType, source, isWorkspaceFile = false, isReadOnly2 = false) {
    this.editorReturnViewMode = this.viewMode === "migration" ? "migration" : "list";
    this.currentModelRef?.dispose();
    this.currentModelRef = void 0;
    this.editorModelChangeDisposables.clear();
    this.editorPreviewDisposables.clear();
    this.editorPreviewRenderScheduler.cancel();
    this.currentEditingUri = uri5;
    this.currentEditingProjectRoot = isWorkspaceFile ? this.workspaceService.getActiveProjectRoot() : void 0;
    this.currentEditingSource = source;
    this.currentEditingPromptType = promptType;
    this.currentEditingReadOnly = isReadOnly2;
    this.editorDisplayMode = this.isStructuredPreviewSupported(promptType) ? "preview" : "raw";
    this.viewMode = "editor";
    this.editorItemNameElement.textContent = displayName;
    this.editorItemPathElement.textContent = basename2(uri5);
    this._editorContentChanged = false;
    this.resetEditorSaveIndicator();
    this.updateEditorActionButton();
    this.updateEditorDisplayMode();
    this.updateContentVisibility();
    try {
      if (source === AICustomizationSources.builtin && (promptType === "prompt" /* prompt */ || promptType === "skill" /* skill */)) {
        const session = await this.getOrCreateBuiltinEditingSession(uri5);
        if (!isEqual2(this.currentEditingUri, uri5)) {
          return;
        }
        this.embeddedEditor.setModel(session.model);
        this.embeddedEditor.updateOptions({ readOnly: false });
        this._editorContentChanged = session.model.getValue() !== session.originalContent;
        this.renderCurrentEditorPreview();
        this.updateEditorActionButton();
        if (this.dimension) {
          this.layout(this.dimension);
        }
        if (this.editorDisplayMode === "raw") {
          this.embeddedEditor.focus();
        } else {
          this.editorModeButton?.focus();
        }
        this.editorModelChangeDisposables.add(session.model.onDidChangeContent(() => {
          this._editorContentChanged = session.model.getValue() !== session.originalContent;
          this.scheduleCurrentEditorPreviewRender();
          this.updateEditorActionButton();
        }));
        return;
      }
      const ref = await this.textModelService.createModelReference(uri5);
      if (!isEqual2(this.currentEditingUri, uri5)) {
        ref.dispose();
        return;
      }
      this.currentModelRef = ref;
      this.embeddedEditor.setModel(ref.object.textEditorModel);
      this.embeddedEditor.updateOptions({ readOnly: isReadOnly2 });
      this.renderCurrentEditorPreview();
      if (this.dimension) {
        this.layout(this.dimension);
      }
      if (this.editorDisplayMode === "raw") {
        this.embeddedEditor.focus();
      } else {
        this.editorModeButton?.focus();
      }
      this._editorContentChanged = this.workingCopyService.isDirty(uri5);
      this.editorModelChangeDisposables.add(ref.object.textEditorModel.onDidChangeContent(() => {
        this._editorContentChanged = true;
        this.scheduleCurrentEditorPreviewRender();
        this.resetEditorSaveIndicator();
      }));
      this.editorModelChangeDisposables.add(this.workingCopyService.onDidSave((e) => {
        if (isEqual2(e.workingCopy.resource, uri5)) {
          this._editorContentChanged = this.workingCopyService.isDirty(uri5);
          this.editorSaveIndicator.className = "editor-save-indicator visible saved";
          this.editorSaveIndicator.classList.add(...ThemeIcon.asClassNameArray(Codicon.check));
          this.editorSaveIndicator.title = localize(9519, null);
          this.editorSaveIndicator.setAttribute("aria-label", localize(9519, null));
          status(localize(9519, null));
        }
      }));
    } catch (error) {
      console.error("Failed to load model for embedded editor:", error);
      if (isEqual2(this.currentEditingUri, uri5)) {
        this.goBackToList();
      }
    }
  }
  goBackToList() {
    const returnViewMode = this.editorReturnViewMode;
    this.editorReturnViewMode = "list";
    const fileUri = this.currentEditingUri;
    const backgroundSaveRequest = this.createExistingCustomizationSaveRequest();
    if (backgroundSaveRequest) {
      this.telemetryService.publicLog2("chatCustomizationEditor.saveItem", {
        promptType: this.currentEditingPromptType ?? "",
        storage: String(this.currentEditingSource ?? ""),
        saveTarget: "existing"
      });
    }
    if (fileUri && this.currentEditingSource === AICustomizationSources.builtin) {
      this.disposeBuiltinEditingSession(fileUri);
    }
    this.currentModelRef?.dispose();
    this.currentModelRef = void 0;
    this.currentEditingUri = void 0;
    this.currentEditingProjectRoot = void 0;
    this.currentEditingSource = void 0;
    this.currentEditingPromptType = void 0;
    this.currentEditingReadOnly = false;
    this.editorDisplayMode = "preview";
    this._editorContentChanged = false;
    this.editorModelChangeDisposables.clear();
    this.editorPreviewRenderScheduler.cancel();
    this.clearEditorPreview();
    this.resetEditorSaveIndicator();
    this.updateEditorActionButton();
    this.updateEditorDisplayMode();
    this.embeddedEditor?.setModel(null);
    this.viewMode = returnViewMode;
    this.updateContentVisibility();
    if (returnViewMode === "migration") {
      this.renderPromptMigrationPage();
      void this.refreshPromptMigrationInfo();
    } else {
      void this.listWidget?.refresh();
    }
    if (this.dimension) {
      this.layout(this.dimension);
    }
    if (returnViewMode === "migration") {
      this.migrationSearchInput?.focus();
    } else {
      this.listWidget?.focusSearch();
    }
    if (backgroundSaveRequest) {
      const saveRequest = backgroundSaveRequest;
      void this.saveExistingCustomization(saveRequest).catch((error) => {
        console.error("Failed to save customization changes on exit:", error);
        this.notificationService.warn(localize(9518, null, basename2(saveRequest.fileUri)));
      });
    }
  }
  //#endregion
  async getOrCreateBuiltinEditingSession(uri5) {
    const key3 = uri5.toString();
    const existing = this.builtinEditingSessions.get(key3);
    if (existing && !existing.model.isDisposed()) {
      return existing;
    }
    const ref = await this.textModelService.createModelReference(uri5);
    try {
      const session = {
        model: this.modelService.createModel(
          createTextBufferFactoryFromSnapshot(ref.object.textEditorModel.createSnapshot()),
          { languageId: ref.object.textEditorModel.getLanguageId(), onDidChange: Event2.None },
          URI.from({ scheme: "ai-customization-builtin", path: uri5.path, query: generateUuid() }),
          false
        ),
        originalContent: ref.object.textEditorModel.getValue()
      };
      this.builtinEditingSessions.set(key3, session);
      return session;
    } finally {
      ref.dispose();
    }
  }
  createBuiltinPromptSaveRequest(target) {
    const sourceUri = this.currentEditingUri;
    const promptType = this.currentEditingPromptType;
    if (!sourceUri || this.currentEditingSource !== AICustomizationSources.builtin || promptType !== "prompt" /* prompt */ && promptType !== "skill" /* skill */ || !target.folder || target.target === "cancel") {
      return;
    }
    const session = this.builtinEditingSessions.get(sourceUri.toString());
    if (!session || !this._editorContentChanged) {
      return;
    }
    return {
      target: target.target,
      folder: target.folder,
      sourceUri,
      content: session.model.getValue(),
      promptType,
      projectRoot: target.target === "workspace" ? this.workspaceService.getActiveProjectRoot() : void 0
    };
  }
  createExistingCustomizationSaveRequest() {
    if (!this._editorContentChanged || this.currentEditingSource === AICustomizationSources.builtin || !this.currentEditingUri) {
      return void 0;
    }
    const model = this.currentModelRef?.object.textEditorModel;
    if (!model) {
      return void 0;
    }
    return {
      fileUri: this.currentEditingUri,
      content: model.getValue(),
      projectRoot: this.currentEditingProjectRoot
    };
  }
  async saveBuiltinPromptCopy(request2) {
    let targetUri;
    if (request2.promptType === "skill" /* skill */) {
      const skillFolderName = basename2(dirname2(request2.sourceUri));
      targetUri = URI.joinPath(request2.folder, skillFolderName, basename2(request2.sourceUri));
    } else {
      targetUri = URI.joinPath(request2.folder, basename2(request2.sourceUri));
    }
    await this.fileService.createFolder(dirname2(targetUri));
    await this.fileService.writeFile(targetUri, VSBuffer.fromString(request2.content));
    if (request2.target === "workspace" && request2.projectRoot) {
      await this.workspaceService.commitFiles(request2.projectRoot, [targetUri]);
    }
  }
  async saveExistingCustomization(request2) {
    await this.fileService.writeFile(request2.fileUri, VSBuffer.fromString(request2.content));
    if (request2.projectRoot) {
      await this.workspaceService.commitFiles(request2.projectRoot, [request2.fileUri]);
    }
  }
  async pickBuiltinPromptSaveTarget() {
    const items = [];
    const promptType = this.currentEditingPromptType ?? "prompt" /* prompt */;
    const workspaceFolder = resolveWorkspaceTargetDirectory(this.workspaceService, promptType);
    if (workspaceFolder) {
      items.push({
        label: localize(9527, null),
        description: this.labelService.getUriLabel(workspaceFolder, { relative: true }),
        target: "workspace",
        folder: workspaceFolder
      });
    }
    const userFolder = await resolveUserTargetDirectory(this.promptsService, promptType);
    if (userFolder) {
      items.push({
        label: localize(9526, null),
        description: this.labelService.getUriLabel(userFolder, { relative: true }),
        target: "user",
        folder: userFolder
      });
    }
    items.push({
      label: localize(9443, null),
      target: "cancel"
    });
    return this.quickInputService.pick(items, {
      canPickMany: false,
      placeHolder: localize(9517, null),
      matchOnDescription: true
    });
  }
  async handleEditorActionButton() {
    if (this.editorActionButtonInProgress) {
      return;
    }
    this.editorActionButtonInProgress = true;
    this.updateEditorActionButton();
    let backgroundSaveRequest;
    try {
      if (this.shouldShowBuiltinSaveAction()) {
        const selection = await this.pickBuiltinPromptSaveTarget();
        if (!selection || selection.target === "cancel") {
          return;
        }
        backgroundSaveRequest = this.createBuiltinPromptSaveRequest(selection);
        if (backgroundSaveRequest) {
          this.telemetryService.publicLog2("chatCustomizationEditor.saveItem", {
            promptType: this.currentEditingPromptType ?? "",
            storage: String(this.currentEditingSource ?? ""),
            saveTarget: selection.target
          });
        }
      }
      this.goBackToList();
      if (backgroundSaveRequest) {
        const saveRequest = backgroundSaveRequest;
        void this.saveBuiltinPromptCopy(saveRequest).then(() => {
          void this.listWidget?.refresh();
        }, (error) => {
          console.error("Failed to save built-in override:", error);
          this.notificationService.warn(saveRequest.target === "workspace" ? localize(9516, null) : localize(9515, null));
        });
      }
    } finally {
      this.editorActionButtonInProgress = false;
      this.updateEditorActionButton();
    }
  }
  updateEditorActionButton() {
    this.updateInputDirtyState();
    if (!this.editorActionButton || !this.editorActionButtonIcon) {
      return;
    }
    const shouldShowBuiltinSaveAction = this.shouldShowBuiltinSaveAction();
    this.editorActionButtonIcon.className = `codicon codicon-${shouldShowBuiltinSaveAction ? Codicon.save.id : Codicon.arrowLeft.id} editor-action-button-icon`;
    this.editorActionButton.disabled = this.editorActionButtonInProgress;
    this.editorActionButton.setAttribute("aria-label", shouldShowBuiltinSaveAction ? localize(9513, null) : this.editorReturnViewMode === "migration" ? localize(9439, null) : localize(9431, null));
    this.editorActionButton.title = shouldShowBuiltinSaveAction ? localize(9514, null) : this.editorReturnViewMode === "migration" ? localize(9440, null) : localize(9431, null);
  }
  shouldShowBuiltinSaveAction() {
    return this._editorContentChanged && this.currentEditingSource === AICustomizationSources.builtin && (this.currentEditingPromptType === "prompt" /* prompt */ || this.currentEditingPromptType === "skill" /* skill */);
  }
  updateInputDirtyState() {
    const input = this.input;
    if (input instanceof AICustomizationManagementEditorInput) {
      input.setDirty(this.shouldShowBuiltinSaveAction());
    }
  }
  async handleBuiltinSave() {
    if (!this.shouldShowBuiltinSaveAction()) {
      return false;
    }
    const target = await this.pickBuiltinPromptSaveTarget();
    if (!target || target.target === "cancel") {
      return false;
    }
    const saveRequest = this.createBuiltinPromptSaveRequest(target);
    if (!saveRequest) {
      return false;
    }
    try {
      await this.saveBuiltinPromptCopy(saveRequest);
      this.telemetryService.publicLog2("chatCustomizationEditor.saveItem", {
        promptType: this.currentEditingPromptType ?? "",
        storage: String(this.currentEditingSource ?? ""),
        saveTarget: target.target
      });
      this._editorContentChanged = false;
      this.updateEditorActionButton();
      return true;
    } catch (error) {
      console.error("Failed to save built-in override:", error);
      this.notificationService.warn(target.target === "workspace" ? localize(9516, null) : localize(9515, null));
      return false;
    }
  }
  resetEditorSaveIndicator() {
    this.editorSaveIndicator.className = "editor-save-indicator";
    this.editorSaveIndicator.title = "";
    this.editorSaveIndicator.removeAttribute("aria-label");
  }
  isStructuredPreviewSupported(promptType) {
    if (this.configurationService.getValue("chat.customizations.structuredPreview.enabled" /* ChatCustomizationsStructuredPreviewEnabled */) !== true) {
      return false;
    }
    return promptType === "agent" /* agent */ || promptType === "skill" /* skill */ || promptType === "instructions" /* instructions */ || promptType === "prompt" /* prompt */;
  }
  onStructuredPreviewSettingChanged() {
    if (this.viewMode !== "editor") {
      return;
    }
    const supportsStructuredPreview = this.isStructuredPreviewSupported(this.currentEditingPromptType);
    if (!supportsStructuredPreview) {
      this.editorDisplayMode = "raw";
      this.editorPreviewRenderScheduler.cancel();
      this.clearEditorPreview();
    } else if (this.editorDisplayMode === "preview") {
      this.editorPreviewRenderScheduler.schedule();
    }
    this.updateEditorDisplayMode();
    if (this.dimension) {
      this.layout(this.dimension);
    }
  }
  getCurrentEditingModel() {
    if (!this.currentEditingUri) {
      return void 0;
    }
    if (this.currentEditingSource === AICustomizationSources.builtin) {
      return this.builtinEditingSessions.get(this.currentEditingUri.toString())?.model;
    }
    return this.currentModelRef?.object.textEditorModel;
  }
  toggleEditorDisplayMode() {
    if (!this.isStructuredPreviewSupported(this.currentEditingPromptType)) {
      return;
    }
    this.editorDisplayMode = this.editorDisplayMode === "preview" ? "raw" : "preview";
    if (this.editorDisplayMode === "preview") {
      this.editorPreviewRenderScheduler.cancel();
      this.renderCurrentEditorPreview();
    }
    this.updateEditorDisplayMode();
    if (this.dimension) {
      this.layout(this.dimension);
    }
    if (this.editorDisplayMode === "raw") {
      this.embeddedEditor?.focus();
    } else {
      this.editorModeButton?.focus();
    }
  }
  updateEditorDisplayMode() {
    const supportsStructuredPreview = this.isStructuredPreviewSupported(this.currentEditingPromptType);
    const showPreview = supportsStructuredPreview && this.editorDisplayMode === "preview";
    if (this.editorModeButton) {
      this.editorModeButton.style.display = supportsStructuredPreview ? "" : "none";
      this.editorModeButton.textContent = this.getEditorModeButtonLabel();
      this.editorModeButton.setAttribute("aria-label", this.getEditorModeButtonTooltip());
      this.editorModeButton.setAttribute("aria-pressed", String(this.editorDisplayMode === "raw"));
      this.editorModeButton.title = this.getEditorModeButtonTooltip();
    }
    if (this.editorPreviewContainer) {
      this.editorPreviewContainer.style.display = showPreview ? "" : "none";
    }
    if (this.embeddedEditorContainer) {
      this.embeddedEditorContainer.style.display = showPreview ? "none" : "";
    }
  }
  getEditorModeButtonLabel() {
    if (!this.isStructuredPreviewSupported(this.currentEditingPromptType)) {
      return "";
    }
    if (this.editorDisplayMode === "raw") {
      return localize(9456, null);
    }
    return this.canEditCurrentRaw() ? localize(9454, null) : localize(9458, null);
  }
  getEditorModeButtonTooltip() {
    if (!this.isStructuredPreviewSupported(this.currentEditingPromptType)) {
      return "";
    }
    if (this.editorDisplayMode === "raw") {
      return localize(9457, null);
    }
    return this.canEditCurrentRaw() ? localize(9455, null) : localize(9459, null);
  }
  canEditCurrentRaw() {
    const promptType = this.currentEditingPromptType;
    if (!promptType) {
      return false;
    }
    return this.currentEditingSource === AICustomizationSources.builtin && (promptType === "prompt" /* prompt */ || promptType === "skill" /* skill */) || !this.currentEditingReadOnly;
  }
  scheduleCurrentEditorPreviewRender() {
    if (this.editorDisplayMode !== "preview") {
      return;
    }
    this.editorPreviewRenderScheduler.schedule();
  }
  renderCurrentEditorPreview() {
    const model = this.getCurrentEditingModel();
    const promptType = this.currentEditingPromptType;
    if (!model || !promptType || this.editorDisplayMode !== "preview" || !this.isStructuredPreviewSupported(promptType)) {
      this.clearEditorPreview();
      return;
    }
    const parsedPromptFile = this.promptsService.getParsedPromptFile(model);
    this.renderEditorPreview(parsedPromptFile, promptType);
  }
  renderEditorPreview(parsedPromptFile, promptType) {
    if (!this.editorPreviewIssuesContainer || !this.editorPreviewFrontMatterContainer || !this.editorPreviewBodyContainer) {
      return;
    }
    this.editorPreviewDisposables.clear();
    clearNode(this.editorPreviewIssuesContainer);
    clearNode(this.editorPreviewFrontMatterContainer);
    clearNode(this.editorPreviewBodyContainer);
    const target = getTarget(promptType, parsedPromptFile.header ?? parsedPromptFile.uri);
    this.renderPreviewIssues(parsedPromptFile);
    this.renderPreviewFrontMatter(parsedPromptFile, promptType, target);
    this.renderPreviewBody(parsedPromptFile);
  }
  renderPreviewIssues(parsedPromptFile) {
    if (!this.editorPreviewIssuesContainer || !parsedPromptFile.header?.errors.length) {
      return;
    }
    const issuesContainer = append(this.editorPreviewIssuesContainer, $96(".editor-preview-issues-box"));
    append(issuesContainer, $96("div.editor-preview-issues-title")).textContent = localize(9479, null);
    append(issuesContainer, $96("div.editor-preview-issues-description")).textContent = localize(9478, null);
    const list2 = append(issuesContainer, $96("ul.editor-preview-issues-list"));
    for (const error of parsedPromptFile.header.errors) {
      append(list2, $96("li.editor-preview-issues-item")).textContent = error.message;
    }
  }
  renderPreviewFrontMatter(parsedPromptFile, promptType, target) {
    if (!this.editorPreviewFrontMatterContainer) {
      return;
    }
    const attributes = parsedPromptFile.header?.attributes ?? [];
    if (!attributes.length) {
      append(this.editorPreviewFrontMatterContainer, $96("div.editor-preview-empty-state")).textContent = localize(9481, null);
      return;
    }
    for (const attribute of attributes) {
      this.renderPreviewAttribute(attribute, promptType, target);
    }
  }
  renderPreviewAttribute(attribute, promptType, target) {
    if (!this.editorPreviewFrontMatterContainer) {
      return;
    }
    const row = append(this.editorPreviewFrontMatterContainer, $96(".editor-preview-row"));
    const header2 = append(row, $96(".editor-preview-row-header"));
    append(header2, $96("div.editor-preview-row-key")).textContent = attribute.key;
    const helpButton = append(header2, $96("button.editor-preview-row-help"));
    helpButton.type = "button";
    helpButton.setAttribute("aria-label", localize(9477, null, attribute.key));
    const helpIcon = append(helpButton, $96("span.editor-preview-row-help-icon"));
    helpIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.info));
    helpIcon.setAttribute("aria-hidden", "true");
    const description = getAttributeDefinition(attribute.key, promptType, target)?.description ?? localize(9482, null, attribute.key);
    const helpHover = this.editorPreviewDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), helpButton, {
      markdown: new MarkdownString(description),
      markdownNotSupportedFallback: description
    }));
    this.editorPreviewDisposables.add(addDisposableListener(helpButton, "click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      helpHover.show(true);
    }));
    const valueElement = append(row, $96("div.editor-preview-row-value"));
    const valueText = this.stringifyPreviewValue(attribute.value);
    valueElement.textContent = valueText;
    valueElement.classList.toggle("multiline", valueText.includes("\n"));
  }
  renderPreviewBody(parsedPromptFile) {
    if (!this.editorPreviewBodyContainer) {
      return;
    }
    const bodyContent = parsedPromptFile.body?.getContent() ?? "";
    if (!bodyContent.trim()) {
      append(this.editorPreviewBodyContainer, $96("div.editor-preview-empty-state")).textContent = localize(9480, null);
      return;
    }
    const markdown = new MarkdownString(bodyContent, { supportThemeIcons: true });
    markdown.baseUri = parsedPromptFile.uri;
    const renderedMarkdown = this.editorPreviewDisposables.add(this.markdownRendererService.render(markdown));
    this.editorPreviewBodyContainer.appendChild(renderedMarkdown.element);
  }
  stringifyPreviewValue(value2) {
    switch (value2.type) {
      case "scalar":
        return value2.value;
      case "sequence":
        if (value2.items.every((item) => item.type === "scalar")) {
          return value2.items.map((item) => item.value).join("\n");
        }
        return JSON.stringify(this.toPreviewObject(value2), null, 2);
      case "map":
        return JSON.stringify(this.toPreviewObject(value2), null, 2);
    }
  }
  toPreviewObject(value2) {
    switch (value2.type) {
      case "scalar":
        return value2.value;
      case "sequence":
        return value2.items.map((item) => this.toPreviewObject(item));
      case "map": {
        const entries2 = {};
        for (const property of value2.properties) {
          entries2[property.key.value] = this.toPreviewObject(property.value);
        }
        return entries2;
      }
    }
  }
  clearEditorPreview() {
    this.editorPreviewRenderScheduler.cancel();
    this.editorPreviewDisposables.clear();
    if (this.editorPreviewIssuesContainer) {
      clearNode(this.editorPreviewIssuesContainer);
    }
    if (this.editorPreviewFrontMatterContainer) {
      clearNode(this.editorPreviewFrontMatterContainer);
    }
    if (this.editorPreviewBodyContainer) {
      clearNode(this.editorPreviewBodyContainer);
    }
  }
  disposeBuiltinEditingSessions() {
    for (const session of this.builtinEditingSessions.values()) {
      session.model.dispose();
    }
    this.builtinEditingSessions.clear();
  }
  disposeBuiltinEditingSession(uri5) {
    const key3 = uri5.toString();
    const session = this.builtinEditingSessions.get(key3);
    if (!session) {
      return;
    }
    session.model.dispose();
    this.builtinEditingSessions.delete(key3);
  }
  //#region Embedded MCP Server Detail
  createEmbeddedMcpDetail() {
    if (!this.mcpDetailContainer) {
      return;
    }
    const detailBody = append(this.mcpDetailContainer, $96(".mcp-detail-editor-container"));
    this.embeddedMcpDetail = this.editorDisposables.add(this.instantiationService.createInstance(EmbeddedMcpServerDetail, detailBody));
    const backButton2 = append(this.embeddedMcpDetail.leadingSlot, $96("button.editor-back-button"));
    backButton2.setAttribute("type", "button");
    backButton2.setAttribute("aria-label", localize(9433, null));
    this.editorDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), backButton2, localize(9434, null)));
    const backIconEl = append(backButton2, $96(`.codicon.codicon-${Codicon.arrowLeft.id}`));
    backIconEl.setAttribute("aria-hidden", "true");
    this.editorDisposables.add(addDisposableListener(backButton2, "click", () => {
      this.goBackFromMcpDetail();
    }));
  }
  async showEmbeddedMcpDetail(server) {
    if (!this.embeddedMcpDetail) {
      return;
    }
    this.viewMode = "mcpDetail";
    this.updateContentVisibility();
    this.mcpDetailDisposables.clear();
    this.embeddedMcpDetail.setInput(server);
    if (this.dimension) {
      this.layout(this.dimension);
    }
  }
  goBackFromMcpDetail() {
    this.mcpDetailDisposables.clear();
    this.embeddedMcpDetail?.clearInput();
    this.viewMode = "list";
    this.updateContentVisibility();
    if (this.dimension) {
      this.layout(this.dimension);
    }
    if (this.selectedSection === AICustomizationManagementSection.SkillCenter) {
      this.ensureContributedSectionWidget(AICustomizationManagementSection.SkillCenter)?.focusMcp();
    } else {
      this.mcpListWidget?.focusSearch();
    }
  }
  //#endregion
  //#region Embedded Plugin Detail
  createEmbeddedPluginDetail() {
    if (!this.pluginDetailContainer) {
      return;
    }
    const detailBody = append(this.pluginDetailContainer, $96(".plugin-detail-editor-container"));
    this.embeddedPluginDetail = this.editorDisposables.add(this.instantiationService.createInstance(EmbeddedAgentPluginDetail, detailBody));
    const backButton2 = append(this.embeddedPluginDetail.leadingSlot, $96("button.editor-back-button"));
    backButton2.setAttribute("type", "button");
    backButton2.setAttribute("aria-label", localize(9437, null));
    this.editorDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), backButton2, localize(9438, null)));
    const backIconEl = append(backButton2, $96(`.codicon.codicon-${Codicon.arrowLeft.id}`));
    backIconEl.setAttribute("aria-hidden", "true");
    this.editorDisposables.add(addDisposableListener(backButton2, "click", () => {
      this.goBackFromPluginDetail();
    }));
  }
  async showEmbeddedPluginDetail(item) {
    if (!this.embeddedPluginDetail) {
      return;
    }
    this.viewMode = "pluginDetail";
    this.updateContentVisibility();
    this.pluginDetailDisposables.clear();
    this.embeddedPluginDetail.setInput(item);
    if (this.dimension) {
      this.layout(this.dimension);
    }
  }
  /**
   * Public method to show a plugin detail from any section (e.g. from "Show Plugin" context menu).
   * Saves the current section so the back button returns the user to it.
   */
  async showPluginDetail(item) {
    if (this.selectedSection !== AICustomizationManagementSection.Plugins) {
      this.pluginDetailReturnSection = this.selectedSection ?? AICustomizationManagementSection.Agents;
    }
    await this.showEmbeddedPluginDetail(item);
  }
  goBackFromPluginDetail() {
    this.pluginDetailDisposables.clear();
    this.embeddedPluginDetail?.clearInput();
    const returnSection = this.pluginDetailReturnSection;
    this.pluginDetailReturnSection = void 0;
    if (returnSection) {
      this.viewMode = "list";
      this.updateContentVisibility();
      this.selectSection(returnSection);
    } else {
      this.viewMode = "list";
      this.updateContentVisibility();
      this.pluginListWidget?.focusSearch();
    }
    if (this.dimension) {
      this.layout(this.dimension);
    }
  }
  //#endregion
  //#region Embedded Tool Extension Detail
  createEmbeddedToolDetail() {
    if (!this.toolsDetailContainer) {
      return;
    }
    const detailBody = append(this.toolsDetailContainer, $96(".tools-detail-editor-container"));
    this.embeddedToolDetail = this.editorDisposables.add(this.instantiationService.createInstance(EmbeddedExtensionToolsDetail, detailBody));
    const backButton2 = append(this.embeddedToolDetail.leadingSlot, $96("button.editor-back-button"));
    backButton2.setAttribute("type", "button");
    backButton2.setAttribute("aria-label", localize(9441, null));
    this.editorDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), backButton2, localize(9442, null)));
    const backIconEl = append(backButton2, $96(`.codicon.codicon-${Codicon.arrowLeft.id}`));
    backIconEl.setAttribute("aria-hidden", "true");
    this.editorDisposables.add(addDisposableListener(backButton2, "click", () => {
      this.goBackFromToolDetail();
    }));
  }
  async showEmbeddedToolDetail(extension) {
    if (!this.embeddedToolDetail) {
      return;
    }
    this.viewMode = "toolsDetail";
    this.updateContentVisibility();
    this.toolsDetailDisposables.clear();
    this.embeddedToolDetail.setInput(extension);
    if (this.dimension) {
      this.layout(this.dimension);
    }
  }
  goBackFromToolDetail() {
    this.toolsDetailDisposables.clear();
    this.embeddedToolDetail?.clearInput();
    this.viewMode = "list";
    this.updateContentVisibility();
    if (this.dimension) {
      this.layout(this.dimension);
    }
    this.toolsListWidget?.focusSearch();
  }
  //#endregion
};

AICustomizationManagementEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IOpenerService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, IAICustomizationWorkspaceService),
  __decorateParam(9, IPromptsService),
  __decorateParam(10, ITextModelService),
  __decorateParam(11, IConfigurationService),
  __decorateParam(12, IWorkingCopyService),
  __decorateParam(13, IHoverService),
  __decorateParam(14, IContextViewService),
  __decorateParam(15, IMarkdownRendererService),
  __decorateParam(16, IModelService),
  __decorateParam(17, IQuickInputService),
  __decorateParam(18, IFileService),
  __decorateParam(19, INotificationService),
  __decorateParam(20, IDialogService),
  __decorateParam(21, ICustomizationHarnessService),
  __decorateParam(22, IViewsService),
  __decorateParam(23, ILabelService),
  __decorateParam(24, IAICustomizationItemsModel)
], AICustomizationManagementEditor);
export { $96, SectionItemDelegate, SectionItemRenderer, AICustomizationManagementEditor };
