// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/quickaccess/browser/commandsQuickAccess.ts
import { AbstractEditorCommandsQuickAccessProvider } from "./module-3086.mjs";
import { Language } from "./module-0014.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { raceTimeout, timeout } from "./module-0036.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { createKeybindingCommandQuery } from "./module-1646.mjs";
import { ASK_QUICK_QUESTION_ACTION_ID } from "./module-2543.mjs";
import { CHAT_OPEN_ACTION_ID } from "./module-1476.mjs";
import { Action2, IMenuService, MenuId, MenuItemAction } from "./module-0092.mjs";
import { isLocalizedString } from "./module-0505.mjs";
import { stripIcons } from "./module-0461.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { IPreferencesService } from "./module-1294.mjs";
import { IProductService } from "./module-0873.mjs";
import { IAiRelatedInformationService } from "./module-1441.mjs";
import { IChatAgentService } from "./module-0974.mjs";
import { isFirefox2 } from "./module-0018.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IStorageService } from "./module-0512.mjs";
import { CommandsHistory } from "./module-3085.mjs";


// src/vs/workbench/contrib/quickaccess/browser/commandsQuickAccess.ts
var CommandsQuickAccessProvider = class extends AbstractEditorCommandsQuickAccessProvider {
  constructor(editorService, menuService, extensionService, instantiationService, keybindingService, commandService, telemetryService, dialogService, configurationService, editorGroupService, preferencesService, productService, aiRelatedInformationService, chatAgentService) {
    super({
      showAlias: !Language.isDefaultVariant(),
      noResultsPick: () => ({
        label: localize(18429, null),
        commandId: ""
      })
    }, instantiationService, keybindingService, commandService, telemetryService, dialogService);
    this.editorService = editorService;
    this.menuService = menuService;
    this.configurationService = configurationService;
    this.editorGroupService = editorGroupService;
    this.preferencesService = preferencesService;
    this.productService = productService;
    this.aiRelatedInformationService = aiRelatedInformationService;
    this.chatAgentService = chatAgentService;
    this.useAiRelatedInfo = false;
    this.extensionRegistrationRace = raceTimeout(extensionService.whenInstalledExtensionsRegistered(), 800);
    this._register(configurationService.onDidChangeConfiguration((e) => this.updateOptions(e)));
    this.updateOptions();
  }
  static {
    this.AI_RELATED_INFORMATION_MAX_PICKS = 5;
  }
  static {
    this.AI_RELATED_INFORMATION_DEBOUNCE = 200;
  }
  get activeTextEditorControl() {
    return this.editorService.activeTextEditorControl;
  }
  get defaultFilterValue() {
    if (this.configuration.preserveInput) {
      return 1 /* LAST */;
    }
    return void 0;
  }
  get configuration() {
    const commandPaletteConfig = this.configurationService.getValue().workbench.commandPalette;
    return {
      preserveInput: commandPaletteConfig.preserveInput,
      showAskInChat: commandPaletteConfig.showAskInChat,
      experimental: commandPaletteConfig.experimental
    };
  }
  updateOptions(e) {
    if (e && !e.affectsConfiguration("workbench.commandPalette.experimental")) {
      return;
    }
    const config = this.configuration;
    const suggestedCommandIds = config.experimental.suggestCommands && this.productService.commandPaletteSuggestedCommandIds?.length ? new Set(this.productService.commandPaletteSuggestedCommandIds) : void 0;
    this.options.suggestedCommandIds = suggestedCommandIds;
    this.useAiRelatedInfo = config.experimental.enableNaturalLanguageSearch;
  }
  async getCommandPicks(token) {
    await this.extensionRegistrationRace;
    if (token.isCancellationRequested) {
      return [];
    }
    return [
      ...this.getCodeEditorCommandPicks(),
      ...this.getGlobalCommandPicks()
    ].map((picks) => ({
      ...picks,
      buttons: [{
        iconClass: ThemeIcon.asClassName(Codicon.gear),
        tooltip: localize(18426, null)
      }],
      trigger: () => {
        this.preferencesService.openGlobalKeybindingSettings(false, { query: createKeybindingCommandQuery(picks.commandId, picks.commandWhen) });
        return 1 /* CLOSE_PICKER */;
      }
    }));
  }
  hasAdditionalCommandPicks(filter2, token) {
    if (!this.useAiRelatedInfo || token.isCancellationRequested || filter2 === "" || !this.aiRelatedInformationService.isEnabled()) {
      return false;
    }
    return true;
  }
  async getAdditionalCommandPicks(allPicks, picksSoFar, filter2, token) {
    if (!this.hasAdditionalCommandPicks(filter2, token)) {
      return [];
    }
    let additionalPicks = [];
    try {
      await timeout(CommandsQuickAccessProvider.AI_RELATED_INFORMATION_DEBOUNCE, token);
      additionalPicks = await this.getRelatedInformationPicks(allPicks, picksSoFar, filter2, token);
    } catch (e) {
    }
    if (this.configuration.showAskInChat) {
      const defaultAgent = this.chatAgentService.getDefaultAgent("panel" /* Chat */);
      if (defaultAgent) {
        if (picksSoFar.length || additionalPicks.length) {
          additionalPicks.push({
            type: "separator"
          });
        }
        additionalPicks.push({
          label: localize(18423, null, filter2),
          commandId: this.configuration.experimental.askChatLocation === "quickChat" ? ASK_QUICK_QUESTION_ACTION_ID : CHAT_OPEN_ACTION_ID,
          args: [filter2],
          buttons: [{
            iconClass: ThemeIcon.asClassName(Codicon.gear),
            tooltip: localize(18424, null)
          }],
          trigger: () => {
            void this.preferencesService.openSettings({ jsonEditor: false, query: "workbench.commandPalette.showAskInChat" });
            return 1 /* CLOSE_PICKER */;
          }
        });
      }
    }
    return additionalPicks;
  }
  async getRelatedInformationPicks(allPicks, picksSoFar, filter2, token) {
    const relatedInformation = await this.aiRelatedInformationService.getRelatedInformation(
      filter2,
      [2 /* CommandInformation */],
      token
    );
    relatedInformation.sort((a, b) => b.weight - a.weight);
    const setOfPicksSoFar = new Set(picksSoFar.map((p) => p.commandId));
    const additionalPicks = new Array();
    for (const info of relatedInformation) {
      if (additionalPicks.length === CommandsQuickAccessProvider.AI_RELATED_INFORMATION_MAX_PICKS) {
        break;
      }
      const pick = allPicks.find((p) => p.commandId === info.command && !setOfPicksSoFar.has(p.commandId));
      if (pick) {
        additionalPicks.push(pick);
      }
    }
    return additionalPicks;
  }
  getGlobalCommandPicks() {
    const globalCommandPicks = [];
    const scopedContextKeyService = this.editorService.activeEditorPane?.scopedContextKeyService || this.editorGroupService.activeGroup.scopedContextKeyService;
    const globalCommandsMenu = this.menuService.getMenuActions(MenuId.CommandPalette, scopedContextKeyService);
    const globalCommandsMenuActions = globalCommandsMenu.reduce((r2, [, actions]) => [...r2, ...actions], []).filter((action) => action instanceof MenuItemAction && action.enabled);
    for (const action of globalCommandsMenuActions) {
      let label3 = (typeof action.item.title === "string" ? action.item.title : action.item.title.value) || action.item.id;
      const category11 = typeof action.item.category === "string" ? action.item.category : action.item.category?.value;
      if (category11) {
        label3 = localize(18425, null, category11, label3);
      }
      const aliasLabel = typeof action.item.title !== "string" ? action.item.title.original : void 0;
      const aliasCategory = category11 && action.item.category && typeof action.item.category !== "string" ? action.item.category.original : void 0;
      const commandAlias = aliasLabel && category11 ? aliasCategory ? `${aliasCategory}: ${aliasLabel}` : `${category11}: ${aliasLabel}` : aliasLabel;
      const metadataDescription = action.item.metadata?.description;
      const commandDescription = metadataDescription === void 0 || isLocalizedString(metadataDescription) ? metadataDescription : { value: metadataDescription, original: metadataDescription };
      globalCommandPicks.push({
        commandId: action.item.id,
        commandWhen: action.item.precondition?.serialize(),
        commandAlias,
        label: stripIcons(label3),
        commandDescription,
        commandCategory: category11
      });
    }
    return globalCommandPicks;
  }
};

CommandsQuickAccessProvider = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IMenuService),
  __decorateParam(2, IExtensionService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, ITelemetryService),
  __decorateParam(7, IDialogService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, IEditorGroupsService),
  __decorateParam(10, IPreferencesService),
  __decorateParam(11, IProductService),
  __decorateParam(12, IAiRelatedInformationService),
  __decorateParam(13, IChatAgentService)
], CommandsQuickAccessProvider);

var ShowAllCommandsAction = class _ShowAllCommandsAction extends Action2 {
  static {
    this.ID = "workbench.action.showCommands";
  }
  constructor() {
    super({
      id: _ShowAllCommandsAction.ID,
      title: localize2(18430, "Show All Commands"),
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: void 0,
        primary: !isFirefox2 ? 2048 /* CtrlCmd */ | 1024 /* Shift */ | 46 /* KeyP */ : void 0,
        secondary: [59 /* F1 */]
      },
      f1: true
    });
  }
  async run(accessor) {
    accessor.get(IQuickInputService).quickAccess.show(CommandsQuickAccessProvider.PREFIX);
  }
};

var ClearCommandHistoryAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.clearCommandHistory",
      title: localize2(18422, "Clear Command History"),
      f1: true
    });
  }
  async run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    const storageService = accessor.get(IStorageService);
    const dialogService = accessor.get(IDialogService);
    const commandHistoryLength = CommandsHistory.getConfiguredCommandHistoryLength(configurationService);
    if (commandHistoryLength > 0) {
      const { confirmed } = await dialogService.confirm({
        type: "warning",
        message: localize(18428, null),
        detail: localize(18427, null),
        primaryButton: localize(18421, null)
      });
      if (!confirmed) {
        return;
      }
      CommandsHistory.clearHistory(configurationService, storageService);
    }
  }
};
export { CommandsQuickAccessProvider, ShowAllCommandsAction, ClearCommandHistoryAction };
