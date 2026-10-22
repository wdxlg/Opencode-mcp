// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/quickinput/browser/commandsQuickAccess.ts
import { PickerQuickAccessProvider } from "./module-1520.mjs";
import { matchesBaseContiguousSubString, matchesWords, or } from "./module-0453.mjs";
import { createSingleCallFunction } from "./module-0005.mjs";
import { TfIdfCalculator, normalizeTfIdfScores } from "./module-1836.mjs";
import { Categories } from "./module-0847.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IDialogService } from "./module-0267.mjs";
import { Disposable } from "./module-0012.mjs";
import { LRUCache } from "./module-0008.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/platform/quickinput/browser/commandsQuickAccess.ts
var AbstractCommandsQuickAccessProvider = class extends PickerQuickAccessProvider {
  constructor(options3, instantiationService, keybindingService, commandService, telemetryService, dialogService) {
    super(AbstractCommandsQuickAccessProvider.PREFIX, options3);
    this.keybindingService = keybindingService;
    this.commandService = commandService;
    this.telemetryService = telemetryService;
    this.dialogService = dialogService;
    this.commandsHistory = this._register(instantiationService.createInstance(CommandsHistory));
    this.options = options3;
  }
  static {
    this.PREFIX = ">";
  }
  static {
    this.TFIDF_THRESHOLD = 0.5;
  }
  static {
    this.TFIDF_MAX_RESULTS = 5;
  }
  static {
    this.WORD_FILTER = or(matchesBaseContiguousSubString, matchesWords);
  }
  async _getPicks(filter2, _disposables, token, runOptions2) {
    const allCommandPicks = await this.getCommandPicks(token);
    if (token.isCancellationRequested) {
      return [];
    }
    const runTfidf = createSingleCallFunction(() => {
      const tfidf = new TfIdfCalculator();
      tfidf.updateDocuments(allCommandPicks.map((commandPick) => ({
        key: commandPick.commandId,
        textChunks: [this.getTfIdfChunk(commandPick)]
      })));
      const result = tfidf.calculateScores(filter2, token);
      return normalizeTfIdfScores(result).filter((score3) => score3.score > AbstractCommandsQuickAccessProvider.TFIDF_THRESHOLD).slice(0, AbstractCommandsQuickAccessProvider.TFIDF_MAX_RESULTS);
    });
    const filteredCommandPicks = [];
    for (const commandPick of allCommandPicks) {
      const labelHighlights = AbstractCommandsQuickAccessProvider.WORD_FILTER(filter2, commandPick.label) ?? void 0;
      let aliasHighlights;
      if (commandPick.commandAlias) {
        aliasHighlights = AbstractCommandsQuickAccessProvider.WORD_FILTER(filter2, commandPick.commandAlias) ?? void 0;
      }
      if (labelHighlights || aliasHighlights) {
        commandPick.highlights = {
          label: labelHighlights,
          detail: this.options.showAlias ? aliasHighlights : void 0
        };
        filteredCommandPicks.push(commandPick);
      } else if (filter2 === commandPick.commandId) {
        filteredCommandPicks.push(commandPick);
      } else if (filter2.length >= 3) {
        const tfidf = runTfidf();
        if (token.isCancellationRequested) {
          return [];
        }
        const tfidfScore = tfidf.find((score3) => score3.key === commandPick.commandId);
        if (tfidfScore) {
          commandPick.tfIdfScore = tfidfScore.score;
          filteredCommandPicks.push(commandPick);
        }
      }
    }
    const mapLabelToCommand = /* @__PURE__ */ new Map();
    for (const commandPick of filteredCommandPicks) {
      const existingCommandForLabel = mapLabelToCommand.get(commandPick.label);
      if (existingCommandForLabel) {
        commandPick.description = commandPick.commandId;
        existingCommandForLabel.description = existingCommandForLabel.commandId;
      } else {
        mapLabelToCommand.set(commandPick.label, commandPick);
      }
    }
    filteredCommandPicks.sort((commandPickA, commandPickB) => {
      if (commandPickA.tfIdfScore && commandPickB.tfIdfScore) {
        if (commandPickA.tfIdfScore === commandPickB.tfIdfScore) {
          return commandPickA.label.localeCompare(commandPickB.label);
        }
        return commandPickB.tfIdfScore - commandPickA.tfIdfScore;
      } else if (commandPickA.tfIdfScore) {
        return 1;
      } else if (commandPickB.tfIdfScore) {
        return -1;
      }
      const commandACounter = this.commandsHistory.peek(commandPickA.commandId);
      const commandBCounter = this.commandsHistory.peek(commandPickB.commandId);
      if (commandACounter && commandBCounter) {
        return commandACounter > commandBCounter ? -1 : 1;
      }
      if (commandACounter) {
        return -1;
      }
      if (commandBCounter) {
        return 1;
      }
      if (this.options.suggestedCommandIds) {
        const commandASuggestion = this.options.suggestedCommandIds.has(commandPickA.commandId);
        const commandBSuggestion = this.options.suggestedCommandIds.has(commandPickB.commandId);
        if (commandASuggestion && commandBSuggestion) {
          return 0;
        }
        if (commandASuggestion) {
          return -1;
        }
        if (commandBSuggestion) {
          return 1;
        }
      }
      const isDeveloperA = commandPickA.commandCategory === Categories.Developer.value;
      const isDeveloperB = commandPickB.commandCategory === Categories.Developer.value;
      if (isDeveloperA && !isDeveloperB) {
        return 1;
      }
      if (!isDeveloperA && isDeveloperB) {
        return -1;
      }
      return commandPickA.label.localeCompare(commandPickB.label);
    });
    const commandPicks = [];
    let addOtherSeparator = false;
    let addSuggestedSeparator = true;
    let addCommonlyUsedSeparator = !!this.options.suggestedCommandIds;
    for (let i2 = 0; i2 < filteredCommandPicks.length; i2++) {
      const commandPick = filteredCommandPicks[i2];
      const isInHistory = !!this.commandsHistory.peek(commandPick.commandId);
      if (i2 === 0 && isInHistory) {
        commandPicks.push({ type: "separator", label: localize(3186, null) });
        addOtherSeparator = true;
      }
      if (addSuggestedSeparator && commandPick.tfIdfScore !== void 0) {
        commandPicks.push({ type: "separator", label: localize(3188, null) });
        addSuggestedSeparator = false;
      }
      if (addCommonlyUsedSeparator && commandPick.tfIdfScore === void 0 && !isInHistory && this.options.suggestedCommandIds?.has(commandPick.commandId)) {
        commandPicks.push({ type: "separator", label: localize(3184, null) });
        addOtherSeparator = true;
        addCommonlyUsedSeparator = false;
      }
      if (addOtherSeparator && commandPick.tfIdfScore === void 0 && !isInHistory && !this.options.suggestedCommandIds?.has(commandPick.commandId)) {
        commandPicks.push({ type: "separator", label: localize(3185, null) });
        addOtherSeparator = false;
      }
      commandPicks.push(this.toCommandPick(commandPick, runOptions2, isInHistory));
    }
    if (!this.hasAdditionalCommandPicks(filter2, token)) {
      return commandPicks;
    }
    return {
      picks: commandPicks,
      additionalPicks: (async () => {
        const additionalCommandPicks = await this.getAdditionalCommandPicks(allCommandPicks, filteredCommandPicks, filter2, token);
        if (token.isCancellationRequested) {
          return [];
        }
        const commandPicks2 = additionalCommandPicks.map((commandPick) => this.toCommandPick(commandPick, runOptions2));
        if (addSuggestedSeparator && commandPicks2[0]?.type !== "separator") {
          commandPicks2.unshift({ type: "separator", label: localize(3188, null) });
        }
        return commandPicks2;
      })()
    };
  }
  toCommandPick(commandPick, runOptions2, isRecentlyUsed = false) {
    if (commandPick.type === "separator") {
      return commandPick;
    }
    const tooltip = commandPick.tooltip ?? commandPick.commandDescription?.value;
    const keybinding = this.keybindingService.lookupKeybinding(commandPick.commandId);
    const ariaLabel = keybinding ? localize(3183, null, commandPick.label, keybinding.getAriaLabel()) : commandPick.label;
    const existingButtons = commandPick.buttons || [];
    const buttons = isRecentlyUsed ? [
      ...existingButtons,
      {
        iconClass: ThemeIcon.asClassName(Codicon.close),
        tooltip: localize(3187, null)
      }
    ] : commandPick.buttons;
    return {
      ...commandPick,
      id: commandPick.commandId,
      tooltip,
      ariaLabel,
      detail: this.options.showAlias && commandPick.commandAlias !== commandPick.label ? commandPick.commandAlias : void 0,
      keybinding,
      buttons,
      accept: async () => {
        this.commandsHistory.push(commandPick.commandId);
        this.telemetryService.publicLog2("workbenchActionExecuted", {
          id: commandPick.commandId,
          from: runOptions2?.from ?? "quick open"
        });
        try {
          commandPick.args?.length ? await this.commandService.executeCommand(commandPick.commandId, ...commandPick.args) : await this.commandService.executeCommand(commandPick.commandId);
        } catch (error) {
          if (!isCancellationError(error)) {
            this.dialogService.error(localize(3182, null, commandPick.label), toErrorMessage(error));
          }
        }
      },
      trigger: isRecentlyUsed ? (buttonIndex, keyMods) => {
        const removeButtonIndex = existingButtons.length;
        if (buttonIndex === removeButtonIndex) {
          this.commandsHistory.remove(commandPick.commandId);
          return 3 /* REMOVE_ITEM */;
        }
        if (commandPick.trigger) {
          return commandPick.trigger(buttonIndex, keyMods);
        }
        return 0 /* NO_ACTION */;
      } : commandPick.trigger
    };
  }
  // TF-IDF string to be indexed
  getTfIdfChunk({ label: label3, commandAlias, commandDescription }) {
    let chunk2 = label3;
    if (commandAlias && commandAlias !== label3) {
      chunk2 += ` - ${commandAlias}`;
    }
    if (commandDescription && commandDescription.value !== label3) {
      chunk2 += ` - ${commandDescription.value === commandDescription.original ? commandDescription.value : `${commandDescription.value} (${commandDescription.original})`}`;
    }
    return chunk2;
  }
};

AbstractCommandsQuickAccessProvider = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, ITelemetryService),
  __decorateParam(5, IDialogService)
], AbstractCommandsQuickAccessProvider);

var CommandsHistory = class extends Disposable {
  constructor(storageService, configurationService, logService) {
    super();
    this.storageService = storageService;
    this.configurationService = configurationService;
    this.logService = logService;
    this.configuredCommandsHistoryLength = 0;
    this.updateConfiguration();
    this.load();
    this.registerListeners();
  }
  static {
    this.DEFAULT_COMMANDS_HISTORY_LENGTH = 50;
  }
  static {
    this.PREF_KEY_CACHE = "commandPalette.mru.cache";
  }
  static {
    this.PREF_KEY_COUNTER = "commandPalette.mru.counter";
  }
  static {
    this.counter = 1;
  }
  static {
    this.hasChanges = false;
  }
  registerListeners() {
    this._register(this.configurationService.onDidChangeConfiguration((e4) => this.updateConfiguration(e4)));
    this._register(this.storageService.onWillSaveState((e4) => {
      if (e4.reason === 1 /* SHUTDOWN */) {
        this.saveState();
      }
    }));
  }
  updateConfiguration(e4) {
    if (e4 && !e4.affectsConfiguration("workbench.commandPalette.history")) {
      return;
    }
    this.configuredCommandsHistoryLength = CommandsHistory.getConfiguredCommandHistoryLength(this.configurationService);
    if (CommandsHistory.cache && CommandsHistory.cache.limit !== this.configuredCommandsHistoryLength) {
      CommandsHistory.cache.limit = this.configuredCommandsHistoryLength;
      CommandsHistory.hasChanges = true;
    }
  }
  load() {
    const raw = this.storageService.get(CommandsHistory.PREF_KEY_CACHE, 0 /* PROFILE */);
    let serializedCache;
    if (raw) {
      try {
        serializedCache = JSON.parse(raw);
      } catch (error) {
        this.logService.error(`[CommandsHistory] invalid data: ${error}`);
      }
    }
    const cache2 = CommandsHistory.cache = new LRUCache(this.configuredCommandsHistoryLength, 1);
    if (serializedCache) {
      let entries2;
      if (serializedCache.usesLRU) {
        entries2 = serializedCache.entries;
      } else {
        entries2 = serializedCache.entries.sort((a, b) => a.value - b.value);
      }
      entries2.forEach((entry) => cache2.set(entry.key, entry.value));
    }
    CommandsHistory.counter = this.storageService.getNumber(CommandsHistory.PREF_KEY_COUNTER, 0 /* PROFILE */, CommandsHistory.counter);
  }
  push(commandId) {
    if (!CommandsHistory.cache) {
      return;
    }
    CommandsHistory.cache.set(commandId, CommandsHistory.counter++);
    CommandsHistory.hasChanges = true;
  }
  peek(commandId) {
    return CommandsHistory.cache?.peek(commandId);
  }
  remove(commandId) {
    if (!CommandsHistory.cache) {
      return;
    }
    CommandsHistory.cache.delete(commandId);
    CommandsHistory.hasChanges = true;
  }
  saveState() {
    if (!CommandsHistory.cache) {
      return;
    }
    if (!CommandsHistory.hasChanges) {
      return;
    }
    const serializedCache = { usesLRU: true, entries: [] };
    CommandsHistory.cache.forEach((value2, key3) => serializedCache.entries.push({ key: key3, value: value2 }));
    this.storageService.store(CommandsHistory.PREF_KEY_CACHE, JSON.stringify(serializedCache), 0 /* PROFILE */, 0 /* USER */);
    this.storageService.store(CommandsHistory.PREF_KEY_COUNTER, CommandsHistory.counter, 0 /* PROFILE */, 0 /* USER */);
    CommandsHistory.hasChanges = false;
  }
  static getConfiguredCommandHistoryLength(configurationService) {
    const config = configurationService.getValue();
    const configuredCommandHistoryLength = config.workbench?.commandPalette?.history;
    if (typeof configuredCommandHistoryLength === "number") {
      return configuredCommandHistoryLength;
    }
    return CommandsHistory.DEFAULT_COMMANDS_HISTORY_LENGTH;
  }
  static clearHistory(configurationService, storageService) {
    const commandHistoryLength = CommandsHistory.getConfiguredCommandHistoryLength(configurationService);
    CommandsHistory.cache = new LRUCache(commandHistoryLength);
    CommandsHistory.counter = 1;
    CommandsHistory.hasChanges = true;
  }
};

CommandsHistory = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, ILogService)
], CommandsHistory);
export { AbstractCommandsQuickAccessProvider, CommandsHistory };
