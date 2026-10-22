// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/sessions/browser/customizationsToolbar.contribution.ts
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { agentIcon, hookIcon, instructionsIcon, mcpServerIcon, pluginIcon, skillIcon, toolsIcon } from "./module-2615.mjs";
import { AICustomizationManagementSection } from "./module-0996.mjs";
import { AICustomizationManagementEditorInput } from "./module-2622.mjs";
import { AICustomizationManagementEditor } from "./module-2653.mjs";
import { ActionViewItem } from "./module-0476.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { $, append } from "./module-0075.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { autorun } from "./module-0052.mjs";
import { AGENT_HOST_COPILOT_CLI_SESSION_TYPE, IAgentHostToolSetEnablementService, countEnabledCustomizationTools } from "./module-1749.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAICustomizationItemsModel } from "./module-2618.mjs";
import { IMcpService } from "./module-1206.mjs";
import { ILanguageModelToolsService } from "./module-0991.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { SessionType } from "./module-0961.mjs";
import { Menus } from "./module-3437.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ICustomizationHarnessService } from "./module-1032.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/sessions/browser/customizationsToolbar.contribution.ts
function customizationSectionVisibleKey(section) {
  return `sessionsCustomizationSectionVisible.${section}`;
}

var CUSTOMIZATION_OVERVIEW_ITEM = {
  id: "sessions.customization.overview",
  label: localize(5321, null),
  icon: Codicon.home
};

var CUSTOMIZATION_ITEMS = [
  {
    id: "sessions.customization.plugins",
    label: localize(5322, null),
    icon: pluginIcon,
    section: AICustomizationManagementSection.Plugins,
    isPlugins: true
  },
  {
    id: "sessions.customization.mcpServers",
    label: localize(5320, null),
    icon: mcpServerIcon,
    section: AICustomizationManagementSection.McpServers,
    isMcp: true
  },
  {
    id: "sessions.customization.skills",
    label: localize(5323, null),
    icon: skillIcon,
    section: AICustomizationManagementSection.Skills,
    modelSection: AICustomizationManagementSection.Skills
  },
  {
    id: "sessions.customization.instructions",
    label: localize(5319, null),
    icon: instructionsIcon,
    section: AICustomizationManagementSection.Instructions,
    modelSection: AICustomizationManagementSection.Instructions
  },
  {
    id: "sessions.customization.agents",
    label: localize(5316, null),
    icon: agentIcon,
    section: AICustomizationManagementSection.Agents,
    modelSection: AICustomizationManagementSection.Agents
  },
  {
    id: "sessions.customization.hooks",
    label: localize(5318, null),
    icon: hookIcon,
    section: AICustomizationManagementSection.Hooks,
    modelSection: AICustomizationManagementSection.Hooks
  },
  {
    id: "sessions.customization.tools",
    label: localize(5324, null),
    icon: toolsIcon,
    section: AICustomizationManagementSection.Tools,
    isTools: true
  },
  {
    id: "sessions.customization.harnessSettings",
    label: localize(5317, null),
    icon: Codicon.openai,
    section: AICustomizationManagementSection.HarnessSettings
  }
];

async function openCustomizationOverviewPage(editorService, harnessService, sessionsService) {
  const sessionResource = sessionsService.activeSession.get()?.resource;
  if (sessionResource) {
    harnessService.setActiveSession(sessionResource);
  }
  const input = AICustomizationManagementEditorInput.getOrCreate();
  input.setTargetLabel(harnessService.getActiveDescriptor().label);
  const pane = await editorService.openEditor(input, { pinned: true });
  if (pane instanceof AICustomizationManagementEditor) {
    pane.showWelcomePage();
  }
}

async function openCustomizationSectionPage(editorService, harnessService, sessionsService, section) {
  const sessionResource = sessionsService.activeSession.get()?.resource;
  if (sessionResource) {
    harnessService.setActiveSession(sessionResource);
  }
  const input = AICustomizationManagementEditorInput.getOrCreate();
  input.setTargetLabel(harnessService.getActiveDescriptor().label);
  const pane = await editorService.openEditor(input, { pinned: true });
  if (pane instanceof AICustomizationManagementEditor) {
    pane.selectSectionById(section);
  }
}

var CustomizationLinkViewItem = class extends ActionViewItem {
  constructor(action, options3, _config, _itemsModel, _mcpService, _toolsService, _toolEnablementService) {
    super(void 0, action, { ...options3, icon: false, label: false });
    this._config = _config;
    this._itemsModel = _itemsModel;
    this._mcpService = _mcpService;
    this._toolsService = _toolsService;
    this._toolEnablementService = _toolEnablementService;
    this._viewItemDisposables = this._register(new DisposableStore());
  }
  getTooltip() {
    return void 0;
  }
  render(container2) {
    super.render(container2);
    container2.classList.add("customization-link-widget", "sidebar-action");
    const buttonContainer = append(container2, $(".customization-link-button-container"));
    this._button = this._viewItemDisposables.add(new Button(buttonContainer, {
      ...defaultButtonStyles,
      secondary: true,
      title: false,
      supportIcons: true,
      buttonSecondaryBackground: "transparent",
      buttonSecondaryHoverBackground: void 0,
      buttonSecondaryForeground: void 0,
      buttonSecondaryBorder: void 0
    }));
    this._button.element.classList.add("customization-link-button", "sidebar-action-button");
    this._button.label = `$(${this._config.icon.id}) ${this._config.label}`;
    this._viewItemDisposables.add(this._button.onDidClick(() => {
      this._action.run();
    }));
    this._countContainer = append(this._button.element, $("span.customization-link-counts"));
    this._viewItemDisposables.add(autorun((reader) => {
      const count2 = this._readCount(reader);
      if (this._countContainer) {
        this._renderTotalCount(this._countContainer, count2);
      }
    }));
  }
  _readCount(reader) {
    if (this._config.modelSection) {
      return this._itemsModel.getCount(this._config.modelSection).read(reader);
    }
    if (this._config.isMcp) {
      return this._mcpService.servers.read(reader).length;
    }
    if (this._config.isPlugins) {
      return this._itemsModel.getPluginCount().read(reader);
    }
    if (this._config.isTools) {
      const state = this._toolEnablementService.observe(AGENT_HOST_COPILOT_CLI_SESSION_TYPE).read(reader);
      const toolSets = this._toolsService.toolSets.read(reader);
      return countEnabledCustomizationTools(toolSets, state, reader);
    }
    return 0;
  }
  _renderTotalCount(container2, count2) {
    container2.textContent = "";
    container2.classList.toggle("hidden", count2 === 0);
    if (count2 > 0) {
      const badge = append(container2, $("span.source-count-badge"));
      const num = append(badge, $("span.source-count-num"));
      num.textContent = `${count2}`;
    }
  }
};

CustomizationLinkViewItem = __decorateClass([
  __decorateParam(3, IAICustomizationItemsModel),
  __decorateParam(4, IMcpService),
  __decorateParam(5, ILanguageModelToolsService),
  __decorateParam(6, IAgentHostToolSetEnablementService)
], CustomizationLinkViewItem);

var CustomizationsToolbarContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.sessionsCustomizationsToolbar";
  }
  constructor(actionViewItemService, instantiationService, harnessService, contextKeyService) {
    super();
    const visibilityKeys = /* @__PURE__ */ new Map();
    for (const config of CUSTOMIZATION_ITEMS) {
      if (!config.section) {
        continue;
      }
      const key3 = new RawContextKey(customizationSectionVisibleKey(config.section), true).bindTo(contextKeyService);
      visibilityKeys.set(config.section, key3);
    }
    this._register(autorun((reader) => {
      const activeHarness = harnessService.activeHarness.read(reader);
      harnessService.availableHarnesses.read(reader);
      const descriptor = harnessService.getActiveDescriptor();
      const hidden = new Set(descriptor.hiddenSections ?? []);
      for (const config of CUSTOMIZATION_ITEMS) {
        if (!config.section) {
          continue;
        }
        const supported3 = config.section !== AICustomizationManagementSection.HarnessSettings || activeHarness === SessionType.AgentHostCodex;
        visibilityKeys.get(config.section).set(!hidden.has(config.section) && supported3);
      }
    }));
    this._register(actionViewItemService.register(Menus.SidebarCustomizations, CUSTOMIZATION_OVERVIEW_ITEM.id, (action, options3) => {
      return instantiationService.createInstance(CustomizationLinkViewItem, action, options3, CUSTOMIZATION_OVERVIEW_ITEM);
    }, void 0));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: CUSTOMIZATION_OVERVIEW_ITEM.id,
          title: CUSTOMIZATION_OVERVIEW_ITEM.label,
          menu: {
            id: Menus.SidebarCustomizations,
            group: "navigation",
            order: 0,
            when: ChatContextKeys.enabled
          }
        });
      }
      async run(accessor) {
        await openCustomizationOverviewPage(
          accessor.get(IEditorService),
          accessor.get(ICustomizationHarnessService),
          accessor.get(ISessionsService)
        );
      }
    }));
    for (const [index2, config] of CUSTOMIZATION_ITEMS.entries()) {
      if (!config.section) {
        continue;
      }
      const section = config.section;
      this._register(actionViewItemService.register(Menus.SidebarCustomizations, config.id, (action, options3) => {
        return instantiationService.createInstance(CustomizationLinkViewItem, action, options3, config);
      }, void 0));
      const sectionVisibleWhen = ContextKeyExpr.has(customizationSectionVisibleKey(section));
      const combinedWhen = config.when ? ContextKeyExpr.and(ChatContextKeys.enabled, sectionVisibleWhen, config.when) : ContextKeyExpr.and(ChatContextKeys.enabled, sectionVisibleWhen);
      this._register(registerAction2(class extends Action2 {
        constructor() {
          super({
            id: config.id,
            title: config.label,
            menu: {
              id: Menus.SidebarCustomizations,
              group: "navigation",
              order: index2 + 1,
              when: combinedWhen
            }
          });
        }
        async run(accessor) {
          const editorService = accessor.get(IEditorService);
          const harnessService2 = accessor.get(ICustomizationHarnessService);
          const sessionsService = accessor.get(ISessionsService);
          await openCustomizationSectionPage(editorService, harnessService2, sessionsService, section);
        }
      }));
    }
  }
};

CustomizationsToolbarContribution = __decorateClass([
  __decorateParam(0, IActionViewItemService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ICustomizationHarnessService),
  __decorateParam(3, IContextKeyService)
], CustomizationsToolbarContribution);

registerWorkbenchContribution2(CustomizationsToolbarContribution.ID, CustomizationsToolbarContribution, WorkbenchPhase.AfterRestored);

var ActiveSessionHarnessSyncContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.sessionsActiveHarnessSync";
  }
  constructor(sessionsService, harnessService) {
    super();
    this._register(autorun((reader) => {
      const session = sessionsService.activeSession.read(reader);
      if (!session) {
        return;
      }
      harnessService.availableHarnesses.read(reader);
      harnessService.setActiveSession(session.resource);
    }));
  }
};

ActiveSessionHarnessSyncContribution = __decorateClass([
  __decorateParam(0, ISessionsService),
  __decorateParam(1, ICustomizationHarnessService)
], ActiveSessionHarnessSyncContribution);

registerWorkbenchContribution2(ActiveSessionHarnessSyncContribution.ID, ActiveSessionHarnessSyncContribution, WorkbenchPhase.AfterRestored);
export { customizationSectionVisibleKey, openCustomizationOverviewPage, openCustomizationSectionPage, CUSTOMIZATION_OVERVIEW_ITEM, CUSTOMIZATION_ITEMS, CustomizationLinkViewItem, CustomizationsToolbarContribution, ActiveSessionHarnessSyncContribution };
