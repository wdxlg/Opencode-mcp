// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/aiCustomizationTreeView/browser/aiCustomizationTreeViewViews.ts
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { $, append } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { ActionBar } from "./module-0477.mjs";
import { createActionViewItem, getContextMenuActions } from "./module-0516.mjs";
import { agentIcon, builtinIcon, extensionIcon, instructionsIcon, mcpServerIcon, pluginIcon, promptIcon, skillIcon, userIcon, workspaceIcon } from "./module-2615.mjs";
import { AICustomizationItemMenuId } from "./module-3516.mjs";
import { localize } from "./module-0001.mjs";
import { AICustomizationManagementSection, AICustomizationSources, IAICustomizationWorkspaceService } from "./module-0996.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { ResourceSet } from "./module-0008.mjs";
import { basename2, dirname2 } from "./module-0034.mjs";
import { ViewPane } from "./module-1334.mjs";
import { autorun } from "./module-0052.mjs";
import { WorkbenchAsyncDataTree } from "./module-0636.mjs";
import { AICustomizationManagementEditorInput } from "./module-2622.mjs";
import { AICustomizationManagementEditor } from "./module-2653.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IViewDescriptorService } from "./module-1094.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IPromptsService } from "./module-0987.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IMenuService } from "./module-0092.mjs";
import { ILogService } from "./module-0095.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";


// src/vs/sessions/contrib/aiCustomizationTreeView/browser/aiCustomizationTreeViewViews.ts
var AICustomizationIsEmptyContextKey = new RawContextKey("aiCustomization.isEmpty", true);

var AICustomizationItemTypeContextKey = new RawContextKey("aiCustomizationItemType", "");

var AICustomizationItemDisabledContextKey = new RawContextKey("aiCustomizationItemDisabled", false);

var AICustomizationItemStorageContextKey = new RawContextKey("aiCustomizationItemStorage", "");

var ROOT_ELEMENT = /* @__PURE__ */ Symbol("root");

var AICustomizationTreeDelegate = class {
  getHeight(_element) {
    return 22;
  }
  getTemplateId(element) {
    switch (element.type) {
      case "category":
      case "link":
        return "category";
      case "group":
        return "group";
      case "file":
        return "file";
    }
  }
};

var AICustomizationCategoryRenderer = class {
  constructor() {
    this.templateId = "category";
  }
  renderTemplate(container2) {
    const element = append(container2, $(".ai-customization-category"));
    const icon2 = append(element, $(".icon"));
    const label3 = append(element, $(".label"));
    return { container: element, icon: icon2, label: label3 };
  }
  renderElement(node, _index, templateData) {
    templateData.icon.className = "icon";
    templateData.icon.classList.add(...ThemeIcon.asClassNameArray(node.element.icon));
    templateData.label.textContent = node.element.label;
  }
  disposeTemplate(_templateData) {
  }
};

var AICustomizationGroupRenderer = class {
  constructor() {
    this.templateId = "group";
  }
  renderTemplate(container2) {
    const element = append(container2, $(".ai-customization-group-header"));
    const label3 = append(element, $(".label"));
    return { container: element, label: label3 };
  }
  renderElement(node, _index, templateData) {
    templateData.label.textContent = node.element.label;
  }
  disposeTemplate(_templateData) {
  }
};

var AICustomizationFileRenderer = class {
  constructor(menuService, contextKeyService, instantiationService) {
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.instantiationService = instantiationService;
    this.templateId = "file";
  }
  renderTemplate(container2) {
    const element = append(container2, $(".ai-customization-tree-item"));
    const icon2 = append(element, $(".icon"));
    const name = append(element, $(".name"));
    const actionsContainer = append(element, $(".actions"));
    const templateDisposables = new DisposableStore();
    const actionBar3 = templateDisposables.add(new ActionBar(actionsContainer, {
      actionViewItemProvider: createActionViewItem.bind(void 0, this.instantiationService)
    }));
    return { container: element, icon: icon2, name, actionBar: actionBar3, elementDisposables: new DisposableStore(), templateDisposables };
  }
  renderElement(node, _index, templateData) {
    const item = node.element;
    templateData.elementDisposables.clear();
    let icon2;
    switch (item.promptType) {
      case "agent" /* agent */:
        icon2 = agentIcon;
        break;
      case "skill" /* skill */:
        icon2 = skillIcon;
        break;
      case "instructions" /* instructions */:
        icon2 = instructionsIcon;
        break;
      case "prompt" /* prompt */:
      default:
        icon2 = promptIcon;
        break;
    }
    templateData.icon.className = "icon";
    templateData.icon.classList.add(...ThemeIcon.asClassNameArray(icon2));
    templateData.name.textContent = item.name;
    templateData.container.classList.toggle("disabled", item.disabled);
    const tooltip = item.description ? `${item.name} - ${item.description}` : item.name;
    templateData.container.title = tooltip;
    const context2 = {
      uri: item.uri.toString(),
      name: item.name,
      promptType: item.promptType,
      storage: item.storage
    };
    const overlay = this.contextKeyService.createOverlay([
      [AICustomizationItemTypeContextKey.key, item.promptType],
      [AICustomizationItemDisabledContextKey.key, item.disabled],
      [AICustomizationItemStorageContextKey.key, item.storage]
    ]);
    const menu = templateData.elementDisposables.add(
      this.menuService.createMenu(AICustomizationItemMenuId, overlay)
    );
    const updateActions = () => {
      const actions = menu.getActions({ arg: context2, shouldForwardArgs: true });
      const { primary } = getContextMenuActions(actions, "inline");
      templateData.actionBar.clear();
      templateData.actionBar.push(primary, { icon: true, label: false });
    };
    updateActions();
    templateData.elementDisposables.add(menu.onDidChange(updateActions));
    templateData.actionBar.context = context2;
  }
  disposeElement(_node, _index, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
    templateData.elementDisposables.dispose();
  }
};

var UnifiedAICustomizationDataSource = class {
  constructor(promptsService, logService, onItemCountChanged) {
    this.promptsService = promptsService;
    this.logService = logService;
    this.onItemCountChanged = onItemCountChanged;
    this.cache = /* @__PURE__ */ new Map();
    this.totalItemCount = 0;
  }
  /**
   * Clears the cache. Should be called when the view refreshes.
   */
  clearCache() {
    this.cache.clear();
    this.totalItemCount = 0;
  }
  hasChildren(element) {
    if (element === ROOT_ELEMENT) {
      return true;
    }
    if (element.type === "link") {
      return false;
    }
    return element.type === "category" || element.type === "group";
  }
  async getChildren(element) {
    try {
      if (element === ROOT_ELEMENT) {
        return this.getTypeCategories();
      }
      if (element.type === "category") {
        return this.getStorageGroups(element.promptType);
      }
      if (element.type === "group") {
        return this.getFilesForStorageAndType(element.storage, element.promptType);
      }
      return [];
    } catch (error) {
      this.logService.error("[AICustomization] Error fetching tree children:", error);
      return [];
    }
  }
  getTypeCategories() {
    const items = [
      {
        type: "category",
        id: "category-agents",
        label: localize(4102, null),
        promptType: "agent" /* agent */,
        icon: agentIcon
      },
      {
        type: "category",
        id: "category-skills",
        label: localize(4109, null),
        promptType: "skill" /* skill */,
        icon: skillIcon
      },
      {
        type: "category",
        id: "category-instructions",
        label: localize(4106, null),
        promptType: "instructions" /* instructions */,
        icon: instructionsIcon
      }
    ];
    items.push(
      {
        type: "link",
        id: "link-mcp-servers",
        label: localize(4107, null),
        icon: mcpServerIcon,
        section: AICustomizationManagementSection.McpServers
      }
    );
    return items;
  }
  /**
   * Fetches and caches data for a prompt type, returning storage groups with items.
   */
  async getStorageGroups(promptType) {
    const groups = [];
    let cached = this.cache.get(promptType);
    if (!cached) {
      cached = {};
      this.cache.set(promptType, cached);
    }
    if (promptType === "skill" /* skill */) {
      if (!cached.skills) {
        const skills = await this.promptsService.findAgentSkills(CancellationToken.None);
        cached.skills = skills || [];
        this.totalItemCount += cached.skills.length;
        this.onItemCountChanged(this.totalItemCount);
      }
      const workspaceSkills = cached.skills.filter((s) => s.storage === "local" /* local */);
      const userSkills = cached.skills.filter((s) => s.storage === "user" /* user */);
      const extensionSkills = cached.skills.filter((s) => s.storage === "extension" /* extension */);
      const builtinSkills = cached.skills.filter((s) => s.storage === "builtin" /* builtIn */);
      if (workspaceSkills.length > 0) {
        groups.push(this.createGroupItem(promptType, AICustomizationSources.local, workspaceSkills.length));
      }
      if (userSkills.length > 0) {
        groups.push(this.createGroupItem(promptType, AICustomizationSources.user, userSkills.length));
      }
      if (extensionSkills.length > 0) {
        groups.push(this.createGroupItem(promptType, AICustomizationSources.extension, extensionSkills.length));
      }
      if (builtinSkills.length > 0) {
        groups.push(this.createGroupItem(promptType, AICustomizationSources.builtin, builtinSkills.length));
      }
      return groups;
    }
    if (!cached.files) {
      const allItems = [...await this.promptsService.listPromptFiles(promptType, CancellationToken.None)];
      if (promptType === "instructions" /* instructions */) {
        const existingUris = new ResourceSet(allItems.map((item) => item.uri));
        const agentInstructions = await this.promptsService.listAgentInstructions(CancellationToken.None);
        for (const file of agentInstructions) {
          if (!existingUris.has(file.uri)) {
            allItems.push({ uri: file.uri, storage: "local" /* local */, type: "instructions" /* instructions */ });
          }
        }
      }
      const workspaceItems2 = allItems.filter((item) => item.storage === "local" /* local */);
      const userItems2 = allItems.filter((item) => item.storage === "user" /* user */);
      const extensionItems2 = allItems.filter((item) => item.storage === "extension" /* extension */);
      const builtinItems2 = allItems.filter((item) => item.storage === "builtin" /* builtIn */);
      cached.files = /* @__PURE__ */ new Map([
        ["local" /* local */, workspaceItems2],
        ["user" /* user */, userItems2],
        ["extension" /* extension */, extensionItems2],
        ["builtin" /* builtIn */, builtinItems2]
      ]);
      const itemCount = allItems.length;
      this.totalItemCount += itemCount;
      this.onItemCountChanged(this.totalItemCount);
    }
    const workspaceItems = cached.files.get("local" /* local */) || [];
    const userItems = cached.files.get("user" /* user */) || [];
    const extensionItems = cached.files.get("extension" /* extension */) || [];
    const builtinItems = cached.files.get("builtin" /* builtIn */) || [];
    if (workspaceItems.length > 0) {
      groups.push(this.createGroupItem(promptType, "local" /* local */, workspaceItems.length));
    }
    if (userItems.length > 0) {
      groups.push(this.createGroupItem(promptType, "user" /* user */, userItems.length));
    }
    if (extensionItems.length > 0) {
      groups.push(this.createGroupItem(promptType, "extension" /* extension */, extensionItems.length));
    }
    if (builtinItems.length > 0) {
      groups.push(this.createGroupItem(promptType, "builtin" /* builtIn */, builtinItems.length));
    }
    return groups;
  }
  /**
   * Creates a group item with consistent structure.
   */
  createGroupItem(promptType, storage, count2) {
    const storageLabels = {
      [AICustomizationSources.local]: localize(4111, null, count2),
      [AICustomizationSources.user]: localize(4110, null, count2),
      [AICustomizationSources.extension]: localize(4103, null, count2),
      [AICustomizationSources.plugin]: localize(4108, null, count2),
      [AICustomizationSources.builtin]: localize(4101, null, count2)
    };
    const storageIcons = {
      [AICustomizationSources.local]: workspaceIcon,
      [AICustomizationSources.user]: userIcon,
      [AICustomizationSources.extension]: extensionIcon,
      [AICustomizationSources.plugin]: pluginIcon,
      [AICustomizationSources.builtin]: builtinIcon
    };
    const storageSuffixes = {
      [AICustomizationSources.local]: "workspace",
      [AICustomizationSources.user]: "user",
      [AICustomizationSources.extension]: "extensions",
      [AICustomizationSources.plugin]: "plugins",
      [AICustomizationSources.builtin]: "builtin"
    };
    return {
      type: "group",
      id: `group-${promptType}-${storageSuffixes[storage]}`,
      label: storageLabels[storage],
      storage,
      promptType,
      icon: storageIcons[storage]
    };
  }
  /**
   * Returns files for a specific storage/type combination from cache.
   * getStorageGroups must be called first to populate the cache.
   */
  async getFilesForStorageAndType(storage, promptType) {
    const cached = this.cache.get(promptType);
    const disabledUris = this.promptsService.getDisabledPromptFiles(promptType);
    if (promptType === "skill" /* skill */) {
      const skills = cached?.skills || [];
      const filtered = skills.filter((skill) => skill.storage === storage);
      const seenUris = /* @__PURE__ */ new Set();
      const result = filtered.map((skill) => {
        seenUris.add(skill.uri.toString());
        const skillName = skill.name || basename2(dirname2(skill.uri)) || basename2(skill.uri);
        return {
          type: "file",
          id: skill.uri.toString(),
          uri: skill.uri,
          name: skillName,
          description: skill.description,
          storage: skill.storage,
          promptType,
          disabled: disabledUris.has(skill.uri)
        };
      });
      if (disabledUris.size > 0) {
        const allSkillFiles = await this.promptsService.listPromptFiles("skill" /* skill */, CancellationToken.None);
        for (const file of allSkillFiles) {
          if (file.storage === storage && !seenUris.has(file.uri.toString()) && disabledUris.has(file.uri)) {
            result.push({
              type: "file",
              id: file.uri.toString(),
              uri: file.uri,
              name: file.name || basename2(dirname2(file.uri)) || basename2(file.uri),
              description: file.description,
              storage: file.storage,
              promptType,
              disabled: true
            });
          }
        }
      }
      return result;
    }
    const items = [...cached?.files?.get(storage) || []];
    return items.map((item) => ({
      type: "file",
      id: item.uri.toString(),
      uri: item.uri,
      name: item.name || basename2(item.uri),
      description: item.description,
      storage: item.storage,
      promptType,
      disabled: disabledUris.has(item.uri)
    }));
  }
};

var AICustomizationViewPane = class extends ViewPane {
  constructor(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, promptsService, editorService, menuService, logService, workspaceContextService, workspaceService) {
    super(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.promptsService = promptsService;
    this.editorService = editorService;
    this.menuService = menuService;
    this.logService = logService;
    this.workspaceContextService = workspaceContextService;
    this.workspaceService = workspaceService;
    this.treeDisposables = this._register(new DisposableStore());
    this.isEmptyContextKey = AICustomizationIsEmptyContextKey.bindTo(contextKeyService);
    this.itemTypeContextKey = AICustomizationItemTypeContextKey.bindTo(contextKeyService);
    this.itemDisabledContextKey = AICustomizationItemDisabledContextKey.bindTo(contextKeyService);
    this.itemStorageContextKey = AICustomizationItemStorageContextKey.bindTo(contextKeyService);
    this._register(this.promptsService.onDidChangeCustomAgents(() => this.refresh()));
    this._register(this.promptsService.onDidChangeSlashCommands(() => this.refresh()));
    this._register(this.workspaceContextService.onDidChangeWorkspaceFolders(() => this.refresh()));
    this._register(autorun((reader) => {
      this.workspaceService.activeProjectRoot.read(reader);
      this.refresh();
    }));
  }
  static {
    this.ID = "aiCustomization.view";
  }
  renderBody(container2) {
    super.renderBody(container2);
    container2.classList.add("ai-customization-view");
    this.treeContainer = append(container2, $(".tree-container"));
    this.createTree();
  }
  createTree() {
    if (!this.treeContainer) {
      return;
    }
    this.dataSource = new UnifiedAICustomizationDataSource(
      this.promptsService,
      this.logService,
      (count2) => this.isEmptyContextKey.set(count2 === 0)
    );
    this.tree = this.treeDisposables.add(this.instantiationService.createInstance(
      WorkbenchAsyncDataTree,
      "AICustomization",
      this.treeContainer,
      new AICustomizationTreeDelegate(),
      [
        new AICustomizationCategoryRenderer(),
        new AICustomizationGroupRenderer(),
        new AICustomizationFileRenderer(this.menuService, this.contextKeyService, this.instantiationService)
      ],
      this.dataSource,
      {
        identityProvider: {
          getId: (element) => element.id
        },
        accessibilityProvider: {
          getAriaLabel: (element) => {
            if (element.type === "category" || element.type === "link") {
              return element.label;
            }
            if (element.type === "group") {
              return element.label;
            }
            const nameAndDesc = element.description ? localize(4104, null, element.name, element.description) : element.name;
            return element.disabled ? localize(4105, null, nameAndDesc) : nameAndDesc;
          },
          getWidgetAriaLabel: () => localize(4100, null)
        },
        keyboardNavigationLabelProvider: {
          getKeyboardNavigationLabel: (element) => {
            if (element.type === "file") {
              return element.name;
            }
            return element.label;
          }
        }
      }
    ));
    this.treeDisposables.add(this.tree.onDidOpen(async (e4) => {
      if (e4.element && e4.element.type === "file") {
        this.editorService.openEditor({
          resource: e4.element.uri
        });
      } else if (e4.element && e4.element.type === "link") {
        const input = AICustomizationManagementEditorInput.getOrCreate();
        const editor = await this.editorService.openEditor(input, { pinned: true });
        if (editor instanceof AICustomizationManagementEditor) {
          editor.selectSectionById(e4.element.section);
        }
      }
    }));
    this.treeDisposables.add(this.tree.onContextMenu((e4) => this.onContextMenu(e4)));
    void this.tree.setInput(ROOT_ELEMENT).then(() => this.autoExpandCategories());
  }
  async autoExpandCategories() {
    if (!this.tree) {
      return;
    }
    const rootNode = this.tree.getNode(ROOT_ELEMENT);
    for (const child of rootNode.children) {
      if (child.element !== ROOT_ELEMENT) {
        await this.tree.expand(child.element);
      }
    }
  }
  layoutBody(height, width2) {
    super.layoutBody(height, width2);
    this.tree?.layout(height, width2);
  }
  refresh() {
    this.dataSource?.clearCache();
    this.isEmptyContextKey.set(true);
    void this.tree?.setInput(ROOT_ELEMENT).then(() => this.autoExpandCategories());
  }
  collapseAll() {
    this.tree?.collapseAll();
  }
  expandAll() {
    this.tree?.expandAll();
  }
  onContextMenu(e4) {
    if (!e4.element || e4.element.type !== "file") {
      return;
    }
    const element = e4.element;
    this.itemTypeContextKey.set(element.promptType);
    this.itemDisabledContextKey.set(element.disabled);
    this.itemStorageContextKey.set(element.storage);
    const context2 = {
      uri: element.uri.toString(),
      name: element.name,
      promptType: element.promptType,
      disabled: element.disabled
    };
    const menu = this.menuService.getMenuActions(AICustomizationItemMenuId, this.contextKeyService, { arg: context2, shouldForwardArgs: true });
    const { secondary } = getContextMenuActions(menu, "inline");
    if (secondary.length > 0) {
      this.contextMenuService.showContextMenu({
        getAnchor: () => e4.anchor,
        getActions: () => secondary,
        getActionsContext: () => context2,
        onHide: () => {
          this.itemTypeContextKey.reset();
          this.itemDisabledContextKey.reset();
          this.itemStorageContextKey.reset();
        }
      });
    }
  }
};

AICustomizationViewPane = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IViewDescriptorService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, IHoverService),
  __decorateParam(10, IPromptsService),
  __decorateParam(11, IEditorService),
  __decorateParam(12, IMenuService),
  __decorateParam(13, ILogService),
  __decorateParam(14, IWorkspaceContextService),
  __decorateParam(15, IAICustomizationWorkspaceService)
], AICustomizationViewPane);
export { AICustomizationIsEmptyContextKey, AICustomizationItemTypeContextKey, AICustomizationItemDisabledContextKey, AICustomizationItemStorageContextKey, ROOT_ELEMENT, AICustomizationTreeDelegate, AICustomizationCategoryRenderer, AICustomizationGroupRenderer, AICustomizationFileRenderer, UnifiedAICustomizationDataSource, AICustomizationViewPane };
