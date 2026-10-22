// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/aiCustomizationListWidget.ts
import { $, DisposableResizeObserver, addDisposableListener, append, getWindow } from "./module-0075.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { agentIcon, builtinIcon, extensionIcon, hookIcon, instructionsIcon, pluginIcon, promptIcon, skillIcon, userIcon, workspaceIcon } from "./module-2640.mjs";
import { HighlightedLabel } from "./module-0639.mjs";
import { ActionBar } from "./module-0477.mjs";
import { createActionViewItem, getContextMenuActions } from "./module-0516.mjs";
import { localize } from "./module-0001.mjs";
import { AICustomizationManagementSection, AICustomizationSources, IAICustomizationWorkspaceService } from "./module-0995.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { getCustomizationSecondaryText } from "./module-2650.mjs";
import { AICustomizationManagementCreateMenuId, AICustomizationManagementItemMenuId, AI_CUSTOMIZATION_ITEM_DISABLED_KEY, AI_CUSTOMIZATION_ITEM_PLUGIN_URI_KEY, AI_CUSTOMIZATION_ITEM_STORAGE_KEY, AI_CUSTOMIZATION_ITEM_TYPE_KEY, AI_CUSTOMIZATION_ITEM_URI_KEY, sectionToPromptType } from "./module-1472.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHoverService } from "./module-0520.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IMenuService, MenuItemAction } from "./module-0092.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IAgentPluginService } from "./module-1016.mjs";
import { Delayer } from "./module-0036.mjs";
import { Emitter } from "./module-0017.mjs";
import { autorun } from "./module-0052.mjs";
import { URI } from "./module-0032.mjs";
import { InputBox } from "./module-0600.mjs";
import { defaultButtonStyles, defaultInputBoxStyles } from "./module-0513.mjs";
import { Button, ButtonWithDropdown } from "./module-0546.mjs";
import { WorkbenchList } from "./module-0636.mjs";
import { NotSelectableGroupId } from "./module-0454.mjs";
import { Action, Separator } from "./module-0082.mjs";
import { status } from "./module-0076.mjs";
import { matchesContiguousSubString } from "./module-0453.mjs";
import { generateCustomizationDebugReport } from "./module-2649.mjs";
import { IPromptsService } from "./module-0986.mjs";
import { IContextMenuService, IContextViewService } from "./module-0488.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { IFileService } from "./module-0269.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ICustomizationHarnessService } from "./module-1031.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IAICustomizationItemsModel } from "./module-2643.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/aiCustomizationListWidget.ts
var $83 = $;

var ITEM_HEIGHT = 44;

var GROUP_HEADER_HEIGHT = 36;

var GROUP_HEADER_HEIGHT_WITH_SEPARATOR = 40;

var AICustomizationListDelegate = class {
  getHeight(element) {
    if (element.type === "group-header") {
      return element.isFirst ? GROUP_HEADER_HEIGHT : GROUP_HEADER_HEIGHT_WITH_SEPARATOR;
    }
    return ITEM_HEIGHT;
  }
  getTemplateId(element) {
    return element.type === "group-header" ? "groupHeader" : "aiCustomizationItem";
  }
};

var GroupHeaderRenderer = class {
  constructor(hoverService) {
    this.hoverService = hoverService;
    this.templateId = "groupHeader";
  }
  renderTemplate(container3) {
    const disposables = new DisposableStore();
    const elementDisposables = new DisposableStore();
    container3.classList.add("ai-customization-group-header");
    const chevron = append(container3, $83(".group-chevron"));
    const icon2 = append(container3, $83(".group-icon"));
    const labelGroup = append(container3, $83(".group-label-group"));
    const label3 = append(labelGroup, $83(".group-label"));
    const count2 = append(container3, $83(".group-count"));
    const infoIcon2 = append(container3, $83(".group-info"));
    infoIcon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.info));
    return { container: container3, chevron, icon: icon2, label: label3, count: count2, infoIcon: infoIcon2, disposables, elementDisposables };
  }
  renderElement(element, _index, templateData) {
    templateData.elementDisposables.clear();
    templateData.chevron.className = "group-chevron";
    templateData.chevron.classList.add(...ThemeIcon.asClassNameArray(element.collapsed ? Codicon.chevronRight : Codicon.chevronDown));
    templateData.icon.className = "group-icon";
    templateData.icon.classList.add(...ThemeIcon.asClassNameArray(element.icon));
    templateData.label.textContent = element.label;
    templateData.count.textContent = `${element.count}`;
    templateData.elementDisposables.add(this.hoverService.setupDelayedHover(templateData.infoIcon, () => ({
      content: element.description,
      appearance: {
        compact: true,
        skipFadeInAnimation: true
      }
    })));
    templateData.container.classList.toggle("collapsed", element.collapsed);
    templateData.container.classList.toggle("has-previous-group", !element.isFirst);
  }
  disposeTemplate(templateData) {
    templateData.elementDisposables.dispose();
    templateData.disposables.dispose();
  }
};

function promptTypeToIcon(type) {
  switch (type) {
    case "agent" /* agent */:
      return agentIcon;
    case "skill" /* skill */:
      return skillIcon;
    case "instructions" /* instructions */:
      return instructionsIcon;
    case "prompt" /* prompt */:
      return promptIcon;
    case "hook" /* hook */:
      return hookIcon;
    default:
      return promptIcon;
  }
}

function formatDisplayName(name) {
  return name.replace(/\.md$/i, "");
}

var AICustomizationItemRenderer = class {
  constructor(hoverService, labelService, menuService, contextKeyService, instantiationService, agentPluginService) {
    this.hoverService = hoverService;
    this.labelService = labelService;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.instantiationService = instantiationService;
    this.agentPluginService = agentPluginService;
    this.templateId = "aiCustomizationItem";
    /**
     * Live (non-disposed) templates. Used to keep only the focused row's
     * inline action bar in the document tab order so that Tab from a focused
     * row enters that row's actions exactly once instead of cycling through
     * every row's actions.
     */
    this.templates = /* @__PURE__ */ new Set();
    this.focusedIndex = -1;
  }
  /**
   * Tell the renderer which row index is currently focused in the list.
   * The action bar of that row (and only that row) is made tab-focusable.
   * Pass -1 to clear focus; in that case all action bars are made non-focusable.
   */
  setFocusedIndex(index2) {
    this.focusedIndex = index2;
    for (const template2 of this.templates) {
      template2.actionBar.setFocusable(index2 !== -1 && template2.currentIndex === index2);
    }
  }
  renderTemplate(container3) {
    const disposables = new DisposableStore();
    const elementDisposables = new DisposableStore();
    container3.classList.add("ai-customization-list-item");
    const leftSection = append(container3, $83(".item-left"));
    const typeIcon = append(leftSection, $83(".item-type-icon"));
    const textContainer = append(leftSection, $83(".item-text"));
    const nameRow = append(textContainer, $83(".item-name-row"));
    const nameLabel = disposables.add(new HighlightedLabel(append(nameRow, $83(".item-name"))));
    const badge = append(nameRow, $83(".inline-badge.item-badge"));
    const statusIcon = append(nameRow, $83(".item-status-icon"));
    const description = disposables.add(new HighlightedLabel(append(textContainer, $83(".item-description"))));
    const actionsContainer = append(container3, $83(".item-right"));
    const actionBar3 = disposables.add(new ActionBar(actionsContainer, {
      actionViewItemProvider: createActionViewItem.bind(void 0, this.instantiationService)
    }));
    actionBar3.setFocusable(false);
    const template2 = {
      container: container3,
      actionsContainer,
      actionBar: actionBar3,
      typeIcon,
      nameLabel,
      badge,
      statusIcon,
      description,
      disposables,
      elementDisposables,
      currentIndex: -1
    };
    this.templates.add(template2);
    return template2;
  }
  renderElement(entry, index2, templateData) {
    templateData.elementDisposables.clear();
    templateData.currentIndex = index2;
    templateData.actionBar.setFocusable(this.focusedIndex !== -1 && index2 === this.focusedIndex);
    const element = entry.item;
    templateData.typeIcon.className = "item-type-icon";
    templateData.typeIcon.classList.add(...ThemeIcon.asClassNameArray(element.typeIcon ?? promptTypeToIcon(element.promptType)));
    templateData.elementDisposables.add(this.hoverService.setupDelayedHover(templateData.container, () => {
      let content2;
      if (element.isBuiltin) {
        content2 = `${element.name}
${localize(9297, null)}`;
      } else if (element.extensionId) {
        content2 = `${element.name}
${localize(9343, null, element.extensionId)}`;
      } else {
        const isWorkspaceItem = element.source === AICustomizationSources.local;
        const uriLabel = this.labelService.getUriLabel(element.uri, { relative: isWorkspaceItem });
        content2 = `${element.name}
${uriLabel}`;
      }
      if (element.badgeTooltip) {
        content2 += `

${element.badgeTooltip}`;
      }
      const plugin = element.pluginUri && this.agentPluginService.plugins.get().find((p) => isEqual2(p.uri, element.pluginUri));
      if (plugin) {
        content2 += `
${localize(9344, null, plugin.label)}`;
      }
      return {
        content: content2,
        appearance: {
          compact: true,
          skipFadeInAnimation: true
        }
      };
    }));
    templateData.container.classList.toggle("disabled", element.disabled);
    const displayName = element.displayName ?? formatDisplayName(element.name);
    templateData.nameLabel.set(displayName, element.nameMatches);
    if (element.badge) {
      templateData.badge.textContent = element.badge;
      templateData.badge.style.display = "";
      if (element.badgeTooltip) {
        templateData.elementDisposables.add(this.hoverService.setupManagedHover(
          getDefaultHoverDelegate("mouse"),
          templateData.badge,
          element.badgeTooltip
        ));
      }
    } else {
      templateData.badge.textContent = "";
      templateData.badge.style.display = "none";
    }
    if (element.status) {
      templateData.statusIcon.style.display = "";
      templateData.statusIcon.className = "item-status-icon";
      switch (element.status) {
        case "loading":
          templateData.statusIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.loading), "codicon-modifier-spin");
          break;
        case "loaded":
          templateData.statusIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.check));
          break;
        case "degraded":
          templateData.statusIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.warning));
          break;
        case "error":
          templateData.statusIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.error));
          break;
      }
      if (element.statusMessage) {
        templateData.elementDisposables.add(this.hoverService.setupManagedHover(
          getDefaultHoverDelegate("mouse"),
          templateData.statusIcon,
          element.statusMessage
        ));
      }
    } else {
      templateData.statusIcon.style.display = "none";
      templateData.statusIcon.className = "item-status-icon";
    }
    const secondaryText = getCustomizationSecondaryText(element.description, element.filename, element.promptType);
    let secondaryTextMatches;
    if (secondaryText && element.description && element.descriptionMatches) {
      if (secondaryText === element.description) {
        secondaryTextMatches = element.descriptionMatches;
      } else {
        const maxLength = secondaryText.length;
        const clampedMatches = element.descriptionMatches.map((match2) => {
          if (match2.start >= maxLength || match2.end <= 0) {
            return void 0;
          }
          const clampedStart = Math.max(0, match2.start);
          const clampedEnd = Math.min(match2.end, maxLength);
          return clampedEnd > clampedStart ? { start: clampedStart, end: clampedEnd } : void 0;
        }).filter((match2) => !!match2);
        secondaryTextMatches = clampedMatches.length ? clampedMatches : void 0;
      }
    }
    if (secondaryText) {
      templateData.description.set(secondaryText, secondaryTextMatches);
      templateData.description.element.style.display = "";
      templateData.description.element.classList.toggle("is-filename", !element.description);
    } else {
      templateData.description.set("", void 0);
      templateData.description.element.style.display = "none";
    }
    const context2 = {
      uri: element.uri.toString(),
      name: element.name,
      promptType: element.promptType,
      source: element.source,
      pluginUri: element.pluginUri?.toString(),
      itemId: element.id
    };
    const overlayPairs = [
      [AI_CUSTOMIZATION_ITEM_TYPE_KEY, element.promptType],
      [AI_CUSTOMIZATION_ITEM_URI_KEY, element.uri.toString()],
      [AI_CUSTOMIZATION_ITEM_DISABLED_KEY, element.disabled]
    ];
    if (element.source) {
      overlayPairs.push([AI_CUSTOMIZATION_ITEM_STORAGE_KEY, element.source]);
    }
    if (element.pluginUri) {
      overlayPairs.push([AI_CUSTOMIZATION_ITEM_PLUGIN_URI_KEY, element.pluginUri.toString()]);
    }
    const overlay = this.contextKeyService.createOverlay(overlayPairs);
    const menu = templateData.elementDisposables.add(
      this.menuService.createMenu(AICustomizationManagementItemMenuId, overlay)
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
  disposeElement(_entry, _index, templateData) {
    templateData.currentIndex = -1;
  }
  disposeTemplate(templateData) {
    this.templates.delete(templateData);
    templateData.elementDisposables.dispose();
    templateData.disposables.dispose();
  }
};

AICustomizationItemRenderer = __decorateClass([
  __decorateParam(0, IHoverService),
  __decorateParam(1, ILabelService),
  __decorateParam(2, IMenuService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IAgentPluginService)
], AICustomizationItemRenderer);

function toItemsModelSection(section) {
  switch (section) {
    case AICustomizationManagementSection.Agents:
    case AICustomizationManagementSection.Skills:
    case AICustomizationManagementSection.Instructions:
    case AICustomizationManagementSection.Prompts:
    case AICustomizationManagementSection.Hooks:
      return section;
    default:
      return void 0;
  }
}

function getCountAnnouncement(section, count2, isFiltering) {
  switch (section) {
    case AICustomizationManagementSection.Agents:
      if (isFiltering) {
        if (count2 === 0) {
          return localize(9307, null);
        }
        if (count2 === 1) {
          return localize(9309, null);
        }
        return localize(9310, null, count2);
      }
      if (count2 === 0) {
        return localize(9306, null);
      }
      if (count2 === 1) {
        return localize(9308, null);
      }
      return localize(9305, null, count2);
    case AICustomizationManagementSection.Skills:
      if (isFiltering) {
        if (count2 === 0) {
          return localize(9331, null);
        }
        if (count2 === 1) {
          return localize(9333, null);
        }
        return localize(9334, null, count2);
      }
      if (count2 === 0) {
        return localize(9330, null);
      }
      if (count2 === 1) {
        return localize(9332, null);
      }
      return localize(9329, null, count2);
    case AICustomizationManagementSection.Instructions:
      if (isFiltering) {
        if (count2 === 0) {
          return localize(9319, null);
        }
        if (count2 === 1) {
          return localize(9321, null);
        }
        return localize(9322, null, count2);
      }
      if (count2 === 0) {
        return localize(9318, null);
      }
      if (count2 === 1) {
        return localize(9320, null);
      }
      return localize(9317, null, count2);
    case AICustomizationManagementSection.Hooks:
      if (isFiltering) {
        if (count2 === 0) {
          return localize(9313, null);
        }
        if (count2 === 1) {
          return localize(9315, null);
        }
        return localize(9316, null, count2);
      }
      if (count2 === 0) {
        return localize(9312, null);
      }
      if (count2 === 1) {
        return localize(9314, null);
      }
      return localize(9311, null, count2);
    case AICustomizationManagementSection.Prompts:
    default:
      if (isFiltering) {
        if (count2 === 0) {
          return localize(9325, null);
        }
        if (count2 === 1) {
          return localize(9327, null);
        }
        return localize(9328, null, count2);
      }
      if (count2 === 0) {
        return localize(9324, null);
      }
      if (count2 === 1) {
        return localize(9326, null);
      }
      return localize(9323, null, count2);
  }
}

var AICustomizationListWidget = class extends Disposable {
  constructor(instantiationService, promptsService, contextViewService, openerService, contextMenuService, menuService, contextKeyService, labelService, workspaceService, clipboardService, hoverService, fileService, telemetryService, harnessService, commandService, itemsModel, agentPluginService) {
    super();
    this.instantiationService = instantiationService;
    this.promptsService = promptsService;
    this.contextViewService = contextViewService;
    this.openerService = openerService;
    this.contextMenuService = contextMenuService;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.labelService = labelService;
    this.workspaceService = workspaceService;
    this.clipboardService = clipboardService;
    this.hoverService = hoverService;
    this.fileService = fileService;
    this.telemetryService = telemetryService;
    this.harnessService = harnessService;
    this.commandService = commandService;
    this.itemsModel = itemsModel;
    this.agentPluginService = agentPluginService;
    this.currentSection = AICustomizationManagementSection.Agents;
    this.allItems = [];
    this.displayEntries = [];
    this.searchQuery = "";
    this.collapsedGroups = /* @__PURE__ */ new Set();
    this._layoutDeferred = false;
    this.lastLayoutWidth = 0;
    this.lastLayoutHeight = 0;
    this.lastHeaderHeight = 0;
    this.dropdownActionDisposables = this._register(new DisposableStore());
    /** Monotonically increasing counter; guards the post-load announcement against stale calls. */
    this._sectionLoadId = 0;
    this.delayedFilter = new Delayer(200);
    /** Subscription to the items model for the current section; refreshed on setSection. */
    this.currentSectionSubscription = this._register(new MutableDisposable());
    this._onDidSelectItem = this._register(new Emitter());
    this.onDidSelectItem = this._onDidSelectItem.event;
    this._onDidChangeItemCount = this._register(new Emitter());
    this.onDidChangeItemCount = this._onDidChangeItemCount.event;
    this._onDidRequestCreate = this._register(new Emitter());
    this.onDidRequestCreate = this._onDidRequestCreate.event;
    this._onDidRequestCreateManual = this._register(new Emitter());
    this.onDidRequestCreateManual = this._onDidRequestCreateManual.event;
    this.element = $83(".ai-customization-list-widget");
    this.create();
    this._register(autorun((reader) => {
      this.workspaceService.activeProjectRoot.read(reader);
      this.updateAddButton();
    }));
    this._register(autorun((reader) => {
      this.harnessService.activeHarness.read(reader);
      this.harnessService.availableHarnesses.read(reader);
      this.updateAddButton();
    }));
  }
  create() {
    this.sectionTitleHeader = append(this.element, $83(".section-title-header"));
    const titleRow = append(this.sectionTitleHeader, $83(".section-title-row"));
    this.sectionTitle = append(titleRow, $83("h2.section-title"));
    this.sectionTitleDescription = append(this.sectionTitleHeader, $83("p.section-title-description"));
    this.sectionTitleDescriptionText = append(this.sectionTitleDescription, $83("span.section-title-description-text"));
    this.sectionTitleDescription.appendChild(document.createTextNode(" "));
    this.sectionLink = append(this.sectionTitleDescription, $83("a.section-title-link"));
    this._register(addDisposableListener(this.sectionLink, "click", (e) => {
      e.preventDefault();
      const href = this.sectionLink.href;
      if (href) {
        this.openerService.open(URI.parse(href));
      }
    }));
    const targetWindow = getWindow(this.element);
    const headerObserver = this._register(new DisposableResizeObserver(
      "AICustomizationListWidget.sectionTitleHeader",
      () => {
        if (this.lastLayoutWidth <= 0 || this.lastLayoutHeight <= 0) {
          return;
        }
        const headerHeight = this.sectionTitleHeader.offsetHeight;
        if (headerHeight === this.lastHeaderHeight) {
          return;
        }
        this.layout(this.lastLayoutHeight, this.lastLayoutWidth);
      },
      targetWindow
    ));
    this._register(headerObserver.observe(this.sectionTitleHeader));
    this.searchAndButtonContainer = append(this.element, $83(".list-search-and-button-container"));
    this.searchContainer = append(this.searchAndButtonContainer, $83(".list-search-container"));
    this.searchInput = this._register(new InputBox(this.searchContainer, this.contextViewService, {
      placeholder: localize(9374, null),
      inputBoxStyles: defaultInputBoxStyles
    }));
    this._register(this.searchInput.onDidChange(() => {
      this.searchQuery = this.searchInput.value;
      this.delayedFilter.trigger(() => {
        const matchCount = this.filterItems();
        this.announceItemCount(matchCount);
        if (this.searchQuery.trim()) {
          this.telemetryService.publicLog2("chatCustomizationEditor.search", {
            section: this.currentSection,
            resultCount: matchCount
          });
        }
      });
    }));
    this.addButtonContainer = append(this.searchAndButtonContainer, $83(".list-add-button-container"));
    this.addButtonSimple = this._register(new Button(this.addButtonContainer, {
      ...defaultButtonStyles,
      supportIcons: true
    }));
    this.addButtonSimple.element.classList.add("list-add-button");
    this._register(this.addButtonSimple.onDidClick(() => this.executePrimaryCreateAction()));
    this.addButton = this._register(new ButtonWithDropdown(this.addButtonContainer, {
      ...defaultButtonStyles,
      supportIcons: true,
      contextMenuProvider: this.contextMenuService,
      addPrimaryActionToDropdown: false,
      actions: { getActions: () => this.getDropdownActions() }
    }));
    this.addButton.element.classList.add("list-add-button");
    this._register(this.addButton.onDidClick(() => this.executePrimaryCreateAction()));
    this.updateAddButton();
    this.listContainer = append(this.element, $83(".list-container"));
    this.emptyStateContainer = append(this.element, $83(".list-empty-state"));
    const emptyStateHeader = append(this.emptyStateContainer, $83(".empty-state-header"));
    this.emptyStateText = append(emptyStateHeader, $83(".empty-state-text"));
    this.emptyStateSubtext = append(this.emptyStateContainer, $83(".empty-state-subtext"));
    this.emptyStateContainer.style.display = "none";
    const itemRenderer = this.instantiationService.createInstance(AICustomizationItemRenderer);
    this.list = this._register(this.instantiationService.createInstance(
      WorkbenchList,
      "AICustomizationManagementList",
      this.listContainer,
      new AICustomizationListDelegate(),
      [
        new GroupHeaderRenderer(this.hoverService),
        itemRenderer
      ],
      {
        identityProvider: {
          getId: (entry) => entry.type === "group-header" ? entry.id : entry.item.id,
          getGroupId: (entry) => entry.type === "group-header" ? NotSelectableGroupId : 0
        },
        accessibilityProvider: {
          getAriaLabel: (entry) => {
            if (entry.type === "group-header") {
              return localize(9345, null, entry.label, entry.count, entry.collapsed ? localize(9298, null) : localize(9340, null));
            }
            const displayName = entry.item.displayName ?? formatDisplayName(entry.item.name);
            const secondaryText = getCustomizationSecondaryText(entry.item.description, entry.item.filename, entry.item.promptType);
            const nameAndDesc = secondaryText ? localize(9351, null, displayName, secondaryText) : displayName;
            return entry.item.disabled ? localize(9352, null, nameAndDesc) : nameAndDesc;
          },
          getWidgetAriaLabel: () => localize(9358, null)
        },
        keyboardNavigationLabelProvider: {
          getKeyboardNavigationLabel: (entry) => entry.type === "group-header" ? entry.label : entry.item.name
        },
        multipleSelectionSupport: false,
        openOnSingleClick: true
      }
    ));
    this._register(this.list.onDidOpen((e) => {
      if (e.element) {
        if (e.element.type === "group-header") {
          this.toggleGroup(e.element);
        } else {
          this._onDidSelectItem.fire(e.element.item);
        }
      }
    }));
    this._register(this.list.onDidChangeFocus((e) => {
      itemRenderer.setFocusedIndex(e.indexes.length ? e.indexes[0] : -1);
    }));
    this._register(this.list.onDidFocus(() => {
      if (this.list.getFocus().length === 0 && this.displayEntries.length > 0) {
        const firstItemIndex = this.displayEntries.findIndex((e) => e.type !== "group-header");
        if (firstItemIndex >= 0) {
          this.list.setFocus([firstItemIndex]);
        }
      }
    }));
    this._register(this.list.onContextMenu((e) => this.onContextMenu(e)));
    this._register(this.fileService.onDidFilesChange((e) => {
      if (e.gotDeleted()) {
        this.refresh();
      }
    }));
    this.updateSectionHeader();
  }
  /**
   * Handles context menu for list items.
   */
  onContextMenu(e) {
    if (!e.element || e.element.type !== "file-item") {
      return;
    }
    const item = e.element.item;
    const context2 = {
      uri: item.uri.toString(),
      name: item.name,
      promptType: item.promptType,
      source: item.source,
      pluginUri: item.pluginUri?.toString(),
      itemId: item.id
    };
    const overlayPairs = [
      [AI_CUSTOMIZATION_ITEM_TYPE_KEY, item.promptType],
      [AI_CUSTOMIZATION_ITEM_URI_KEY, item.uri.toString()],
      [AI_CUSTOMIZATION_ITEM_DISABLED_KEY, item.disabled]
    ];
    if (item.source) {
      overlayPairs.push([AI_CUSTOMIZATION_ITEM_STORAGE_KEY, item.source]);
    }
    if (item.pluginUri) {
      overlayPairs.push([AI_CUSTOMIZATION_ITEM_PLUGIN_URI_KEY, item.pluginUri.toString()]);
    }
    const overlay = this.contextKeyService.createOverlay(overlayPairs);
    const actions = this.menuService.getMenuActions(AICustomizationManagementItemMenuId, overlay, {
      arg: context2,
      shouldForwardArgs: true
    });
    const { secondary } = getContextMenuActions(actions, "inline");
    const copyActions = item.isBuiltin ? [] : [
      new Separator(),
      new Action("copyFullPath", localize(9303, null), void 0, true, async () => {
        await this.clipboardService.writeText(item.uri.fsPath);
      }),
      new Action("copyRelativePath", localize(9304, null), void 0, true, async () => {
        const basePath = this.workspaceService.getActiveProjectRoot();
        if (basePath && item.uri.fsPath.startsWith(basePath.fsPath)) {
          const relative2 = item.uri.fsPath.substring(basePath.fsPath.length + 1);
          await this.clipboardService.writeText(relative2);
        } else {
          const relativePath2 = this.labelService.getUriLabel(item.uri, { relative: true });
          await this.clipboardService.writeText(relativePath2);
        }
      })
    ];
    this.contextMenuService.showContextMenu({
      getAnchor: () => e.anchor,
      getActions: () => [...secondary, ...copyActions]
    });
  }
  /**
   * Sets the current section and binds the list to the model's per-section
   * observable. Returns once the initial fetch for the section has resolved
   * so that callers (e.g. tests/fixtures) can rely on rendered output
   * reflecting at least one fetch.
   */
  async setSection(section) {
    const loadId = ++this._sectionLoadId;
    this.currentSection = section;
    this.updateSectionHeader();
    const modelSection = toItemsModelSection(section);
    if (!modelSection) {
      this.currentSectionSubscription.clear();
      this.allItems = [];
      const matchCount = this.filterItems();
      this._onDidChangeItemCount.fire(0);
      this.updateAddButton();
      this.announceItemCount(matchCount);
      return;
    }
    const observable = this.itemsModel.getItems(modelSection);
    this.currentSectionSubscription.value = autorun((reader) => {
      const items = observable.read(reader);
      this.allItems = items;
      this.filterItems();
      this._onDidChangeItemCount.fire(items.length);
    });
    this.updateAddButton();
    await this.itemsModel.whenSectionLoaded(modelSection);
    if (loadId === this._sectionLoadId) {
      this.announceItemCount(this.applySearchFilter(this.allItems).length);
    }
  }
  /**
   * Updates the section header based on the current section.
   */
  updateSectionHeader() {
    let title;
    let description;
    let docsUrl;
    let learnMoreLabel;
    switch (this.currentSection) {
      case AICustomizationManagementSection.Agents:
        title = localize(9293, null);
        description = localize(9294, null);
        docsUrl = "https://code.visualstudio.com/docs/agent-customization/custom-agents?referrer=in-product";
        learnMoreLabel = localize(9353, null);
        break;
      case AICustomizationManagementSection.Skills:
        title = localize(9376, null);
        description = localize(9377, null);
        docsUrl = "https://code.visualstudio.com/docs/agent-customization/agent-skills?referrer=in-product";
        learnMoreLabel = localize(9357, null);
        break;
      case AICustomizationManagementSection.Instructions:
        title = localize(9349, null);
        description = localize(9350, null);
        docsUrl = "https://code.visualstudio.com/docs/agent-customization/custom-instructions?referrer=in-product";
        learnMoreLabel = localize(9355, null);
        break;
      case AICustomizationManagementSection.Hooks:
        title = localize(9347, null);
        description = localize(9348, null);
        docsUrl = "https://code.visualstudio.com/docs/agent-customization/hooks?referrer=in-product";
        learnMoreLabel = localize(9354, null);
        break;
      case AICustomizationManagementSection.Prompts:
      default:
        title = localize(9370, null);
        description = localize(9371, null);
        docsUrl = "https://code.visualstudio.com/docs/agent-customization/prompt-files?referrer=in-product";
        learnMoreLabel = localize(9356, null);
        break;
    }
    this.sectionTitle.textContent = title;
    this.sectionTitleDescriptionText.textContent = description;
    this.sectionLink.textContent = learnMoreLabel;
    this.sectionLink.href = docsUrl;
  }
  /**
   * Updates the add button by building a unified action list.
   * The first action becomes the primary button; the rest go in the dropdown.
   */
  updateAddButton() {
    const actions = this.buildCreateActions();
    const [primary, ...dropdown] = actions;
    const hasDropdown = dropdown.length > 0;
    this.addButton.element.style.display = hasDropdown ? "" : "none";
    this.addButtonSimple.element.style.display = hasDropdown ? "none" : "";
    if (!primary) {
      this.addButtonSimple.element.style.display = "none";
      this.addButton.element.style.display = "none";
      return;
    }
    if (hasDropdown) {
      this.addButton.label = primary.label;
      this.addButton.enabled = primary.enabled;
      this.addButton.primaryButton.setTitle(primary.tooltip ?? "");
      this.addButton.dropdownButton.setTitle("");
    } else {
      this.addButtonSimple.label = primary.label;
      this.addButtonSimple.enabled = primary.enabled;
      this.addButtonSimple.setTitle(primary.tooltip ?? "");
    }
  }
  /**
   * Builds an ordered list of create actions for the current section.
   * The first entry is the primary button; remaining entries are dropdown items.
   */
  buildCreateActions() {
    const typeLabel = this.getTypeLabel();
    const promptType = sectionToPromptType(this.currentSection);
    const descriptor = this.harnessService.getActiveDescriptor();
    const override = descriptor.sectionOverrides?.get(this.currentSection);
    const hasWorkspace = this.hasActiveWorkspace();
    if (override?.commandId) {
      return [{
        label: `$(${Codicon.add.id}) ${override.label}`,
        enabled: true,
        run: () => {
          this.commandService.executeCommand(override.commandId);
        }
      }];
    }
    const menuActions = this.menuService.getMenuActions(
      AICustomizationManagementCreateMenuId,
      this.contextKeyService,
      { shouldForwardArgs: true }
    );
    const extensionCreateActions = [];
    for (const [, group2] of menuActions) {
      for (const menuItem of group2) {
        if (menuItem instanceof MenuItemAction) {
          const icon2 = ThemeIcon.isThemeIcon(menuItem.item.icon) ? menuItem.item.icon.id : Codicon.add.id;
          extensionCreateActions.push({
            label: `$(${icon2}) ${typeof menuItem.item.title === "string" ? menuItem.item.title : menuItem.item.title.value}`,
            enabled: menuItem.enabled,
            run: () => {
              menuItem.run();
            }
          });
        }
      }
    }
    if (extensionCreateActions.length > 0) {
      return extensionCreateActions;
    }
    const createTypeLabel = override?.typeLabel ?? typeLabel;
    const actions = [];
    const addedTargets = /* @__PURE__ */ new Set();
    if (override?.rootFile && hasWorkspace) {
      actions.push({
        label: `$(${Codicon.add.id}) ${override.label}`,
        enabled: true,
        run: () => {
          this._onDidRequestCreateManual.fire({ type: promptType, target: "workspace-root" });
        }
      });
      addedTargets.add("workspace-root");
    }
    if (promptType === "hook" /* hook */) {
      if (!this.workspaceService.isSessionsWindow && !descriptor.hideGenerateButton) {
        actions.push({
          label: `$(${Codicon.sparkle.id}) Generate ${typeLabel}`,
          enabled: true,
          run: () => {
            this._onDidRequestCreate.fire(promptType);
          }
        });
        if (hasWorkspace) {
          actions.push({
            label: `$(${Codicon.add.id}) ${localize(9299, null)}`,
            enabled: true,
            run: () => {
              this._onDidRequestCreateManual.fire({ type: promptType, target: "local" });
            }
          });
        }
      } else if (!override?.commandId) {
        actions.push({
          label: `$(${Codicon.add.id}) ${localize(9299, null)}`,
          enabled: hasWorkspace,
          tooltip: hasWorkspace ? void 0 : localize(9300, null),
          run: () => {
            this._onDidRequestCreateManual.fire({ type: promptType, target: "local" });
          }
        });
      }
      return actions;
    }
    if (!override?.rootFile) {
      if (!this.workspaceService.isSessionsWindow && !descriptor.hideGenerateButton) {
        actions.push({
          label: `$(${Codicon.sparkle.id}) Generate ${typeLabel}`,
          enabled: true,
          run: () => {
            this._onDidRequestCreate.fire(promptType);
          }
        });
      } else if (hasWorkspace) {
        actions.push({
          label: `$(${Codicon.add.id}) New ${createTypeLabel} (Workspace)`,
          enabled: true,
          run: () => {
            this._onDidRequestCreateManual.fire({ type: promptType, target: "local" });
          }
        });
        addedTargets.add("workspace");
      } else {
        actions.push({
          label: `$(${Codicon.add.id}) New ${createTypeLabel} (User)`,
          enabled: true,
          run: () => {
            this._onDidRequestCreateManual.fire({ type: promptType, target: "user" });
          }
        });
        addedTargets.add("user");
      }
    }
    if (hasWorkspace && !addedTargets.has("workspace")) {
      actions.push({
        label: `$(${Codicon.folder.id}) New ${createTypeLabel} (Workspace)`,
        enabled: true,
        run: () => {
          this._onDidRequestCreateManual.fire({ type: promptType, target: "local" });
        }
      });
    }
    if (!addedTargets.has("user")) {
      actions.push({
        label: `$(${Codicon.account.id}) New ${createTypeLabel} (User)`,
        enabled: true,
        run: () => {
          this._onDidRequestCreateManual.fire({ type: promptType, target: "user" });
        }
      });
    }
    if (hasWorkspace && override?.rootFileShortcuts && !addedTargets.has("workspace-root")) {
      for (const fileName of override.rootFileShortcuts) {
        actions.push({
          label: `$(${Codicon.file.id}) New ${fileName}`,
          enabled: true,
          run: () => {
            this._onDidRequestCreateManual.fire({ type: promptType, target: "workspace-root", rootFileName: fileName });
          }
        });
      }
    }
    return actions;
  }
  /**
   * Gets the dropdown actions for the add button (consumed by ButtonWithDropdown).
   * Returns all actions except the primary (first) from buildCreateActions.
   */
  getDropdownActions() {
    this.dropdownActionDisposables.clear();
    const allActions = this.buildCreateActions();
    return allActions.slice(1).map(
      (a, i2) => this.dropdownActionDisposables.add(new Action(`create_${i2}`, a.label, void 0, a.enabled, () => a.run()))
    );
  }
  /**
   * Checks if there's an active project root (workspace folder or session repository).
   */
  hasActiveWorkspace() {
    return !!this.workspaceService.getActiveProjectRoot();
  }
  /**
   * Executes the primary create action based on context.
   */
  executePrimaryCreateAction() {
    const actions = this.buildCreateActions();
    if (actions.length > 0 && actions[0].enabled) {
      actions[0].run();
    }
  }
  /**
   * Gets the type label for the current section.
   */
  getTypeLabel() {
    switch (this.currentSection) {
      case AICustomizationManagementSection.Agents:
        return localize(9290, null);
      case AICustomizationManagementSection.Skills:
        return localize(9375, null);
      case AICustomizationManagementSection.Instructions:
        return localize(9349, null);
      case AICustomizationManagementSection.Hooks:
        return localize(9346, null);
      case AICustomizationManagementSection.Prompts:
      default:
        return localize(9369, null);
    }
  }
  /**
   * Announces the current number of items (after search filtering) to
   * screen readers via an aria status message. Called when the section
   * is loaded and after the search filter changes so assistive technology
   * users hear the count, including "no results".
   */
  announceItemCount(count2) {
    const isFiltering = this.searchQuery.trim().length > 0;
    status(getCountAnnouncement(this.currentSection, count2, isFiltering));
  }
  /**
   * Refreshes the current section's items.
   *
   * Item discovery is owned by `IAICustomizationItemsModel`. This method
   * pulls the current value from the model and re-renders. Callers do not
   * need to invoke this in response to data change events — the per-section
   * autorun bound in `setSection` already does that.
   */
  refresh() {
    if (this._store.isDisposed) {
      return;
    }
    this.applyItemsFromModel();
    this.updateAddButton();
  }
  applyItemsFromModel() {
    const section = toItemsModelSection(this.currentSection);
    this.allItems = section ? this.itemsModel.getItems(section).get() : [];
    this.filterItems();
    this._onDidChangeItemCount.fire(this.allItems.length);
  }
  /**
   * Computes the item count for a given section without updating the display.
   * Reads from the items model so the count is consistent with what the
   * editor and sidebar render. Returns 0 for sections not modeled here
   * (McpServers / Plugins / Models — those have their own services).
   */
  computeItemCountForSection(section) {
    const modelSection = toItemsModelSection(section);
    return modelSection ? this.itemsModel.getCount(modelSection).get() : 0;
  }
  /**
   * Filters items based on the current search query and builds grouped display entries.
   */
  /**
   * Applies the search query to items, returning matched items with highlight info.
   */
  applySearchFilter(items) {
    if (!this.searchQuery.trim()) {
      return items.map((item) => ({ ...item, nameMatches: void 0, descriptionMatches: void 0 }));
    }
    const query = this.searchQuery.toLowerCase();
    const matched = [];
    for (const item of items) {
      const displayName = item.displayName ?? formatDisplayName(item.name);
      const nameMatches = matchesContiguousSubString(query, displayName);
      const descriptionMatches = item.description ? matchesContiguousSubString(query, item.description) : null;
      const filenameMatches = matchesContiguousSubString(query, item.filename);
      const badgeMatches = item.badge ? matchesContiguousSubString(query, item.badge) : null;
      if (nameMatches || descriptionMatches || filenameMatches || badgeMatches) {
        matched.push({
          ...item,
          nameMatches: nameMatches || void 0,
          descriptionMatches: descriptionMatches || void 0
        });
      }
    }
    return matched;
  }
  /**
   * Builds grouped display entries from items assigned to groups.
   * Empty groups are omitted. Collapsed groups show only their header.
   */
  buildGroupedEntries(groups) {
    for (const group2 of groups) {
      group2.items.sort((a, b) => a.name.localeCompare(b.name));
    }
    this.displayEntries = [];
    let isFirstGroup = true;
    for (const group2 of groups) {
      if (group2.items.length === 0) {
        continue;
      }
      const collapsed2 = this.collapsedGroups.has(group2.groupKey);
      this.displayEntries.push({
        type: "group-header",
        id: `group-${group2.groupKey}`,
        groupKey: group2.groupKey,
        label: group2.label,
        icon: group2.icon,
        count: group2.items.length,
        isFirst: isFirstGroup,
        description: group2.description,
        collapsed: collapsed2
      });
      isFirstGroup = false;
      if (!collapsed2) {
        for (const item of group2.items) {
          this.displayEntries.push({ type: "file-item", item });
        }
      }
    }
  }
  /**
   * Commits the current displayEntries to the list and updates empty state.
   */
  commitDisplayEntries() {
    this.list.splice(0, this.list.length, this.displayEntries);
    this.updateEmptyState();
  }
  /**
   * Groups normalized list items for display.
   * Groups items by normalized storage/groupKey.
   */
  groupMatchedItems(matchedItems) {
    const groups = this.currentSection === AICustomizationManagementSection.Instructions ? [
      { groupKey: "agent-instructions", label: localize(9291, null), icon: instructionsIcon, description: localize(9292, null), items: [] },
      { groupKey: "context-instructions", label: localize(9301, null), icon: instructionsIcon, description: localize(9302, null), items: [] },
      { groupKey: "on-demand-instructions", label: localize(9365, null), icon: instructionsIcon, description: localize(9366, null), items: [] },
      { groupKey: "local" /* local */, label: localize(9381, null), icon: workspaceIcon, description: localize(9382, null), items: [] },
      { groupKey: "user" /* user */, label: localize(9379, null), icon: userIcon, description: localize(9380, null), items: [] },
      { groupKey: "plugin" /* plugin */, label: localize(9367, null), icon: pluginIcon, description: localize(9368, null), items: [] },
      { groupKey: "builtin" /* builtIn */, label: localize(9295, null), icon: builtinIcon, description: localize(9296, null), items: [] }
    ] : [
      { groupKey: "local" /* local */, label: localize(9381, null), icon: workspaceIcon, description: localize(9382, null), items: [] },
      { groupKey: "user" /* user */, label: localize(9379, null), icon: userIcon, description: localize(9380, null), items: [] },
      { groupKey: "plugin" /* plugin */, label: localize(9367, null), icon: pluginIcon, description: localize(9368, null), items: [] },
      { groupKey: "extension" /* extension */, label: localize(9341, null), icon: extensionIcon, description: localize(9342, null), items: [] },
      { groupKey: "builtin" /* builtIn */, label: localize(9295, null), icon: builtinIcon, description: localize(9296, null), items: [] }
    ];
    for (const item of matchedItems) {
      const key3 = item.groupKey ?? item.source ?? AICustomizationSources.local;
      let group2 = groups.find((g) => g.groupKey === key3);
      if (!group2) {
        let label3;
        switch (key3) {
          case "remote-host":
            label3 = localize(9373, null);
            break;
          case "remote-client":
            label3 = localize(9372, null);
            break;
          default:
            label3 = formatDisplayName(key3);
        }
        group2 = { groupKey: key3, label: label3, icon: Codicon.folder, description: "", items: [] };
        const builtinIdx = groups.findIndex((g) => g.groupKey === "builtin" /* builtIn */);
        if (builtinIdx >= 0) {
          groups.splice(builtinIdx, 0, group2);
        } else {
          groups.push(group2);
        }
      }
      group2.items.push(item);
    }
    this.buildGroupedEntries(groups);
    this.commitDisplayEntries();
  }
  /**
   * Filters items based on the current search query and builds grouped display entries.
   */
  filterItems() {
    const matchedItems = this.applySearchFilter(this.allItems);
    this.groupMatchedItems(matchedItems);
    return matchedItems.length;
  }
  /**
   * Toggles the collapsed state of a group.
   */
  toggleGroup(entry) {
    if (this.collapsedGroups.has(entry.groupKey)) {
      this.collapsedGroups.delete(entry.groupKey);
    } else {
      this.collapsedGroups.add(entry.groupKey);
    }
    this.filterItems();
  }
  updateEmptyState() {
    const hasItems = this.displayEntries.length > 0;
    if (!hasItems) {
      this.emptyStateContainer.style.display = "flex";
      this.listContainer.style.display = "none";
      if (this.searchQuery.trim()) {
        this.emptyStateText.textContent = localize(9362, null, this.searchQuery);
        this.emptyStateSubtext.textContent = localize(9378, null);
      } else {
        const emptyInfo = this.getEmptyStateInfo();
        this.emptyStateText.textContent = emptyInfo.title;
        this.emptyStateSubtext.textContent = emptyInfo.description;
      }
    } else {
      this.emptyStateContainer.style.display = "none";
      this.listContainer.style.display = "";
    }
  }
  getEmptyStateInfo() {
    switch (this.currentSection) {
      case AICustomizationManagementSection.Agents:
        return {
          title: localize(9359, null),
          description: localize(9335, null)
        };
      case AICustomizationManagementSection.Skills:
        return {
          title: localize(9364, null),
          description: localize(9339, null)
        };
      case AICustomizationManagementSection.Instructions:
        return {
          title: localize(9361, null),
          description: localize(9337, null)
        };
      case AICustomizationManagementSection.Hooks:
        return {
          title: localize(9360, null),
          description: localize(9336, null)
        };
      case AICustomizationManagementSection.Prompts:
      default:
        return {
          title: localize(9363, null),
          description: localize(9338, null)
        };
    }
  }
  /**
   * Sets the search query programmatically.
   */
  setSearchQuery(query) {
    this.searchInput.value = query;
  }
  /**
   * Clears the search query.
   */
  clearSearch() {
    this.searchInput.value = "";
  }
  /**
   * Focuses the search input.
   */
  focusSearch() {
    this.searchInput.focus();
  }
  /**
   * Focuses the list.
   */
  focusList() {
    this.list.domFocus();
    if (this.displayEntries.length > 0) {
      this.list.setFocus([0]);
    }
  }
  /**
   * Scrolls the list so the last item is visible.
   */
  revealLastItem() {
    if (this.displayEntries.length > 0) {
      this.list.reveal(this.displayEntries.length - 1);
    }
  }
  /**
   * Reveals and selects the first list item whose URI matches one of the provided URIs.
   */
  revealAndSelectFirstItemByUri(uris) {
    const entryIndex = this.displayEntries.findIndex((entry) => {
      return entry.type === "file-item" && uris.some((uri5) => isEqual2(entry.item.uri, uri5));
    });
    if (entryIndex < 0) {
      return false;
    }
    this.list.reveal(entryIndex);
    this.list.setFocus([entryIndex]);
    this.list.setSelection([entryIndex]);
    this.list.domFocus();
    return true;
  }
  /**
   * Layouts the widget.
   */
  layout(height, width2) {
    this.lastLayoutHeight = height;
    this.lastLayoutWidth = width2;
    this.element.style.height = "";
    this.searchInput.layout();
    const searchBarHeight = this.searchAndButtonContainer.offsetHeight;
    if (searchBarHeight === 0 && !this._layoutDeferred) {
      this._layoutDeferred = true;
      getWindow(this.element).requestAnimationFrame(() => {
        try {
          this.layout(height, width2);
        } finally {
          this._layoutDeferred = false;
        }
      });
      return;
    }
    const headerHeight = this.sectionTitleHeader.offsetHeight;
    this.lastHeaderHeight = headerHeight;
    const availableHeight = this.element.clientHeight || height;
    const listHeight = Math.max(0, availableHeight - searchBarHeight - headerHeight);
    this.listContainer.style.height = `${listHeight}px`;
    this.list.layout(listHeight, width2);
  }
  /**
   * Gets the total item count (before filtering).
   */
  get itemCount() {
    return this.allItems.length;
  }
  /**
   * Generates a debug report for the current section.
   */
  async generateDebugReport() {
    if (this._store.isDisposed) {
      return "";
    }
    return generateCustomizationDebugReport(
      this.currentSection,
      this.promptsService,
      this.workspaceService,
      { allItems: this.allItems, displayEntries: this.displayEntries },
      this.itemsModel.getActiveItemSource(),
      this.harnessService,
      this.agentPluginService
    );
  }
};

AICustomizationListWidget = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IPromptsService),
  __decorateParam(2, IContextViewService),
  __decorateParam(3, IOpenerService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IMenuService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, ILabelService),
  __decorateParam(8, IAICustomizationWorkspaceService),
  __decorateParam(9, IClipboardService),
  __decorateParam(10, IHoverService),
  __decorateParam(11, IFileService),
  __decorateParam(12, ITelemetryService),
  __decorateParam(13, ICustomizationHarnessService),
  __decorateParam(14, ICommandService),
  __decorateParam(15, IAICustomizationItemsModel),
  __decorateParam(16, IAgentPluginService)
], AICustomizationListWidget);
export { promptTypeToIcon, formatDisplayName, toItemsModelSection, getCountAnnouncement, $83, ITEM_HEIGHT, GROUP_HEADER_HEIGHT, GROUP_HEADER_HEIGHT_WITH_SEPARATOR, AICustomizationListDelegate, GroupHeaderRenderer, AICustomizationItemRenderer, AICustomizationListWidget };
