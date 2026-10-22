// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatManagement/chatModelsViewModel.ts
import { matchesBaseContiguousSubString, matchesCamelCase, matchesWords, or } from "./module-0453.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { distinct } from "./module-0007.mjs";
import { channelOrderKey, compareChannelOrder, compareModelOrder, moveModelOrder, readModelChannelOrder, saveModelChannelOrder } from "./module-2185.mjs";
import { ILanguageModelsService, canHideModel, getLanguageModelProviderDisplayName } from "./module-0967.mjs";
import { languageModelSourcePresentationRegistry } from "./module-2187.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/chat/browser/chatManagement/chatModelsViewModel.ts
var MODEL_ENTRY_TEMPLATE_ID = "model.entry.template";

var VENDOR_ENTRY_TEMPLATE_ID = "vendor.entry.template";

var wordFilter2 = or(matchesBaseContiguousSubString, matchesWords);

var CAPABILITY_REGEX = /@capability:\s*([^\s]+)/gi;

var PROVIDER_REGEX = /@provider:\s*((".+?")|([^\s]+))/gi;

var SEARCH_SUGGESTIONS = {
  FILTER_TYPES: [
    "@provider:",
    "@capability:"
  ],
  CAPABILITIES: [
    "@capability:tools",
    "@capability:vision",
    "@capability:agent"
  ]
};

function getManageModelsProviderLabel(model) {
  return model.provider.group.name;
}

function isLanguageModelProviderEntry(entry) {
  return entry.type === "vendor";
}

function isLanguageModelGroupEntry(entry) {
  return entry.type === "group";
}

function isStatusEntry(entry) {
  return entry.type === "status";
}

var ChatModelsViewModel = class extends Disposable {
  constructor(languageModelsService, storageService) {
    super();
    this.languageModelsService = languageModelsService;
    this.storageService = storageService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._onDidChangeGrouping = this._register(new Emitter());
    this.onDidChangeGrouping = this._onDidChangeGrouping.event;
    this.languageModelGroupStatuses = [];
    this.languageModelGroups = [];
    this.collapsedGroups = /* @__PURE__ */ new Set();
    this.searchValue = "";
    this.modelsSorted = false;
    this._groupBy = "vendor" /* Vendor */;
    this._viewModelEntries = [];
    this.languageModels = [];
    this._register(this.languageModelsService.onDidChangeLanguageModels((vendor) => this.refreshVendor(vendor)));
    this._register(this.languageModelsService.onDidChangeModelVisibility(() => this.refreshVisibility()));
  }
  get groupBy() {
    return this._groupBy;
  }
  set groupBy(groupBy3) {
    if (this._groupBy !== groupBy3) {
      this._groupBy = groupBy3;
      this.collapsedGroups.clear();
      this.languageModelGroups = this.groupModels(this.languageModels);
      this.doFilter();
      this._onDidChangeGrouping.fire(groupBy3);
    }
  }
  get viewModelEntries() {
    return this._viewModelEntries;
  }
  splice(at, removed, added) {
    this._viewModelEntries.splice(at, removed, ...added);
    if (this.selectedEntry) {
      this.selectedEntry = this._viewModelEntries.find((entry) => entry.id === this.selectedEntry?.id);
    }
    this._onDidChange.fire({ at, removed, added });
  }
  shouldRefilter() {
    return !this.modelsSorted;
  }
  filter(searchValue) {
    if (searchValue !== this.searchValue) {
      this.searchValue = searchValue;
      this.collapsedGroups.clear();
      if (!this.modelsSorted) {
        this.languageModelGroups = this.groupModels(this.languageModels);
      }
      this.doFilter();
    }
    return this.viewModelEntries;
  }
  doFilter() {
    const viewModelEntries = [];
    const shouldShowGroupHeaders = this.languageModelGroups.length > 1 || this.languageModelGroups.some((group2) => isLanguageModelProviderEntry(group2.group) && group2.group.sourcePresentation !== void 0);
    for (const group2 of this.languageModelGroups) {
      if (this.collapsedGroups.has(group2.group.id)) {
        group2.group.collapsed = true;
        if (shouldShowGroupHeaders) {
          viewModelEntries.push(group2.group);
        }
        continue;
      }
      const groupEntries = [];
      if (group2.status) {
        groupEntries.push(group2.status);
      }
      groupEntries.push(...this.filterModels(group2.models, this.searchValue));
      if (groupEntries.length > 0) {
        group2.group.collapsed = false;
        if (shouldShowGroupHeaders) {
          viewModelEntries.push(group2.group);
        }
        viewModelEntries.push(...groupEntries);
      }
    }
    this.splice(0, this._viewModelEntries.length, viewModelEntries);
  }
  filterModels(modelEntries, searchValue) {
    const providerNames = [];
    let providerMatch;
    PROVIDER_REGEX.lastIndex = 0;
    while ((providerMatch = PROVIDER_REGEX.exec(searchValue)) !== null) {
      const providerName = providerMatch[2] ? providerMatch[2].substring(1, providerMatch[2].length - 1) : providerMatch[3];
      providerNames.push(providerName);
    }
    if (providerNames.length > 0) {
      searchValue = searchValue.replace(PROVIDER_REGEX, "");
    }
    const capabilities = [];
    let capabilityMatch;
    CAPABILITY_REGEX.lastIndex = 0;
    while ((capabilityMatch = CAPABILITY_REGEX.exec(searchValue)) !== null) {
      capabilities.push(capabilityMatch[1].toLowerCase());
    }
    if (capabilities.length > 0) {
      searchValue = searchValue.replace(CAPABILITY_REGEX, "");
    }
    const quoteAtFirstChar = searchValue.charAt(0) === '"';
    const quoteAtLastChar = searchValue.charAt(searchValue.length - 1) === '"';
    const completeMatch = quoteAtFirstChar && quoteAtLastChar;
    if (quoteAtFirstChar) {
      searchValue = searchValue.substring(1);
    }
    if (quoteAtLastChar) {
      searchValue = searchValue.substring(0, searchValue.length - 1);
    }
    searchValue = searchValue.trim();
    const result = [];
    const words = searchValue.split(" ");
    const lowerProviders = providerNames.map((p) => p.toLowerCase().trim());
    for (const modelEntry of modelEntries) {
      if (lowerProviders.length > 0) {
        const matchesProvider = lowerProviders.some(
          (provider) => modelEntry.provider.vendor.vendor.toLowerCase() === provider || modelEntry.provider.vendor.displayName.toLowerCase() === provider || modelEntry.provider.group.vendor.toLowerCase() === provider || modelEntry.provider.group.name.toLowerCase() === provider
        );
        if (!matchesProvider) {
          continue;
        }
      }
      let matchedCapabilities = [];
      if (capabilities.length > 0) {
        if (!modelEntry.metadata.capabilities) {
          continue;
        }
        let matchesAll = true;
        for (const capability of capabilities) {
          const matchedForThisCapability = this.getMatchingCapabilities(modelEntry, capability);
          if (matchedForThisCapability.length === 0) {
            matchesAll = false;
            break;
          }
          matchedCapabilities.push(...matchedForThisCapability);
        }
        if (!matchesAll) {
          continue;
        }
        matchedCapabilities = distinct(matchedCapabilities);
      }
      let modelMatches;
      if (searchValue) {
        modelMatches = new ModelItemMatches(modelEntry, searchValue, words, completeMatch);
        if (!modelMatches.modelNameMatches && !modelMatches.modelIdMatches && !modelMatches.providerMatches && !modelMatches.capabilityMatches) {
          continue;
        }
      }
      const modelId = this.getModelId(modelEntry);
      result.push({
        type: "model",
        id: modelId,
        templateId: MODEL_ENTRY_TEMPLATE_ID,
        model: modelEntry,
        modelNameMatches: modelMatches?.modelNameMatches || void 0,
        modelIdMatches: modelMatches?.modelIdMatches || void 0,
        providerMatches: modelMatches?.providerMatches || void 0,
        capabilityMatches: matchedCapabilities.length ? matchedCapabilities : void 0
      });
    }
    return result;
  }
  getMatchingCapabilities(modelEntry, capability) {
    const matchedCapabilities = [];
    if (!modelEntry.metadata.capabilities) {
      return matchedCapabilities;
    }
    switch (capability) {
      case "tools":
      case "toolcalling":
        if (modelEntry.metadata.capabilities.toolCalling === true) {
          matchedCapabilities.push("toolCalling");
        }
        break;
      case "vision":
        if (modelEntry.metadata.capabilities.vision === true) {
          matchedCapabilities.push("vision");
        }
        break;
      case "agent":
      case "agentmode":
        if (modelEntry.metadata.capabilities.agentMode === true) {
          matchedCapabilities.push("agentMode");
        }
        break;
      default:
        if (modelEntry.metadata.capabilities.editTools) {
          for (const tool of modelEntry.metadata.capabilities.editTools) {
            if (tool.toLowerCase().includes(capability)) {
              matchedCapabilities.push(tool);
            }
          }
        }
        break;
    }
    return matchedCapabilities;
  }
  groupModels(languageModels) {
    const result = [];
    const saved = readModelChannelOrder(this.storageService);
    if (this.groupBy === "vendor" /* Vendor */) {
      for (const model of languageModels) {
        const groupId = this.getProviderGroupId(model.provider);
        let group2 = result.find((group3) => group3.group.id === groupId);
        if (!group2) {
          group2 = {
            group: this.createLanguageModelProviderEntry(model.provider),
            models: []
          };
          result.push(group2);
        }
        group2.models.push(model);
      }
      for (const statusGroup of this.languageModelGroupStatuses) {
        const groupId = this.getProviderGroupId(statusGroup.provider);
        let group2 = result.find((group3) => group3.group.id === groupId);
        if (!group2) {
          group2 = {
            group: this.createLanguageModelProviderEntry(statusGroup.provider),
            models: []
          };
          result.push(group2);
        }
        group2.status = {
          id: `status.${group2.group.id}`,
          type: "status",
          ...statusGroup.status
        };
      }
      result.sort((a, b) => {
        if (isLanguageModelProviderEntry(a.group) && isLanguageModelProviderEntry(b.group)) {
          const ordered = compareChannelOrder(
            channelOrderKey(a.group.vendorEntry.group.vendor, a.group.vendorEntry.group.name),
            a.group.vendorEntry.group.vendor,
            channelOrderKey(b.group.vendorEntry.group.vendor, b.group.vendorEntry.group.name),
            b.group.vendorEntry.group.vendor,
            saved.channels
          );
          if (ordered) {
            return ordered;
          }
        }
        if (saved.channels.length) {
          return 0;
        }
        if (a.models[0]?.provider.vendor.isDefault) {
          return -1;
        }
        if (b.models[0]?.provider.vendor.isDefault) {
          return 1;
        }
        return a.group.label.localeCompare(b.group.label);
      });
    }
    for (const group2 of result) {
      const channelKey = isLanguageModelProviderEntry(group2.group) ? channelOrderKey(group2.group.vendorEntry.group.vendor, group2.group.vendorEntry.group.name) : "";
      const modelOrder = saved.models[channelKey] ?? [];
      if (isLanguageModelProviderEntry(group2.group)) {
        group2.group.hidden = group2.models.length > 0 && group2.models.every((model) => model.hidden);
      }
      group2.models.sort((a, b) => {
        const ordered = compareModelOrder(a.identifier, b.identifier, modelOrder);
        if (ordered) {
          return ordered;
        }
        if (modelOrder.length) {
          return 0;
        }
        if (a.provider.vendor.isDefault && b.provider.vendor.isDefault) {
          return a.metadata.name.localeCompare(b.metadata.name);
        }
        if (a.provider.vendor.isDefault) {
          return -1;
        }
        if (b.provider.vendor.isDefault) {
          return 1;
        }
        if (a.provider.group.name === b.provider.group.name) {
          return a.metadata.name.localeCompare(b.metadata.name);
        }
        return a.provider.group.name.localeCompare(b.provider.group.name);
      });
    }
    this.modelsSorted = true;
    return result;
  }
  createLanguageModelProviderEntry(provider) {
    const id2 = this.getProviderGroupId(provider);
    return {
      type: "vendor",
      id: id2,
      label: provider.group.name,
      templateId: VENDOR_ENTRY_TEMPLATE_ID,
      collapsed: this.collapsedGroups.has(id2),
      hidden: false,
      sourcePresentation: provider.sourcePresentation,
      vendorEntry: provider
    };
  }
  getVendors() {
    return [...this.languageModelsService.getVendors()].sort((a, b) => {
      if (a.isDefault) {
        return -1;
      }
      if (b.isDefault) {
        return 1;
      }
      return a.displayName.localeCompare(b.displayName);
    });
  }
  async refresh() {
    await this.languageModelsService.selectLanguageModels({});
    await this.refreshAllVendors();
  }
  async refreshAllVendors() {
    this.languageModels = [];
    this.languageModelGroupStatuses = [];
    for (const vendor of this.getVendors()) {
      this.addVendorModels(vendor);
    }
    this.languageModelGroups = this.groupModels(this.languageModels);
    this.doFilter();
  }
  refreshVendor(vendorId) {
    const vendor = this.getVendors().find((v2) => v2.vendor === vendorId);
    if (!vendor) {
      return;
    }
    this.languageModels = this.languageModels.filter((m) => m.provider.vendor.vendor !== vendorId);
    this.languageModelGroupStatuses = this.languageModelGroupStatuses.filter((s) => s.provider.vendor.vendor !== vendorId);
    this.addVendorModels(vendor);
    this.languageModelGroups = this.groupModels(this.languageModels);
    this.doFilter();
  }
  addVendorModels(vendor) {
    const models = [];
    const languageModelsGroups = this.languageModelsService.getLanguageModelGroups(vendor.vendor);
    for (const group2 of languageModelsGroups) {
      const defaultProvider = {
        group: group2.group ?? {
          vendor: vendor.vendor,
          name: vendor.displayName
        },
        vendor
      };
      if (group2.status) {
        this.languageModelGroupStatuses.push({
          provider: defaultProvider,
          status: {
            message: group2.status.message,
            severity: group2.status.severity
          }
        });
      }
      for (const identifier2 of group2.modelIdentifiers) {
        const metadata = this.languageModelsService.lookupLanguageModel(identifier2);
        if (!metadata) {
          continue;
        }
        if (!canHideModel(identifier2, metadata)) {
          continue;
        }
        const sourcePresentation = metadata.modelGroup?.sourceId ? languageModelSourcePresentationRegistry.get(metadata.vendor, metadata.modelGroup.sourceId) : void 0;
        const provider = metadata.modelGroup ? {
          vendor,
          group: {
            vendor: metadata.modelGroup.id,
            name: sourcePresentation?.label ?? getLanguageModelProviderDisplayName(this.languageModelsService, metadata.modelGroup.id)
          },
          sourceId: metadata.modelGroup.sourceId,
          sourcePresentation
        } : defaultProvider;
        models.push({
          identifier: identifier2,
          metadata,
          provider,
          hidden: this.languageModelsService.isModelHidden(identifier2)
        });
      }
    }
    this.languageModels.push(...models.sort((a, b) => a.metadata.name.localeCompare(b.metadata.name)));
  }
  getModelsForGroup(group2) {
    if (isLanguageModelProviderEntry(group2)) {
      return this.languageModels.filter(
        (m) => this.getProviderGroupId(m.provider) === group2.id
      );
    }
    return this.languageModels;
  }
  toggleModelHidden(entry) {
    this.languageModelsService.setModelHidden(entry.model.identifier, !entry.model.hidden);
  }
  toggleGroupHidden(entry) {
    this.languageModelsService.setModelsHidden(this.getModelsForGroup(entry).map((model) => model.identifier), !entry.hidden);
  }
  setModelsHidden(entries2, hidden) {
    this.languageModelsService.setModelsHidden(entries2.map((entry) => entry.model.identifier), hidden);
  }
  refreshVisibility() {
    for (const model of this.languageModels) {
      model.hidden = this.languageModelsService.isModelHidden(model.identifier);
    }
    this.languageModelGroups = this.groupModels(this.languageModels);
    this.doFilter();
  }
  getModelId(modelEntry) {
    return `${modelEntry.provider.group.name}.${modelEntry.identifier}.${modelEntry.metadata.version}`;
  }
  getProviderGroupId(provider) {
    return `${provider.group.vendor}-${provider.group.name}-${provider.sourceId ?? "configured"}`;
  }
  /** Move only within the current channel level; a new channel stays at the end. */
  moveChannel(entry, step) {
    const visible = this.languageModelGroups.filter((g) => isLanguageModelProviderEntry(g.group)).map((g) => channelOrderKey(g.group.vendorEntry.group.vendor, g.group.vendorEntry.group.name));
    const key3 = channelOrderKey(entry.vendorEntry.group.vendor, entry.vendorEntry.group.name);
    const index2 = visible.indexOf(key3);
    const target = visible[Math.max(0, Math.min(visible.length - 1, index2 + step))];
    if (index2 < 0 || !target || target === key3) {
      return;
    }
    const saved = readModelChannelOrder(this.storageService);
    saveModelChannelOrder(this.storageService, { ...saved, channels: moveModelOrder(visible, key3, target) });
    this.languageModelGroups = this.groupModels(this.languageModels);
    this.doFilter();
  }
  moveModel(entry, step) {
    const model = entry.model;
    const key3 = channelOrderKey(model.provider.group.vendor, model.provider.group.name);
    const group2 = this.languageModelGroups.find((g) => isLanguageModelProviderEntry(g.group) && channelOrderKey(g.group.vendorEntry.group.vendor, g.group.vendorEntry.group.name) === key3);
    const visible = group2?.models.map((m) => m.identifier) ?? [];
    const index2 = visible.indexOf(model.identifier);
    const target = visible[Math.max(0, Math.min(visible.length - 1, index2 + step))];
    if (index2 < 0 || !target || target === model.identifier) {
      return;
    }
    const saved = readModelChannelOrder(this.storageService);
    saveModelChannelOrder(this.storageService, { ...saved, models: { ...saved.models, [key3]: moveModelOrder(visible, model.identifier, target) } });
    this.languageModelGroups = this.groupModels(this.languageModels);
    this.doFilter();
  }
  toggleCollapsed(viewModelEntry) {
    const id2 = isLanguageModelGroupEntry(viewModelEntry) ? viewModelEntry.id : isLanguageModelProviderEntry(viewModelEntry) ? viewModelEntry.id : void 0;
    if (!id2) {
      return;
    }
    this.selectedEntry = viewModelEntry;
    if (!this.collapsedGroups.delete(id2)) {
      this.collapsedGroups.add(id2);
    }
    this.doFilter();
  }
  collapseAll() {
    this.collapsedGroups.clear();
    for (const entry of this.viewModelEntries) {
      if (isLanguageModelProviderEntry(entry) || isLanguageModelGroupEntry(entry)) {
        this.collapsedGroups.add(entry.id);
      }
    }
    this.doFilter();
  }
  getConfiguredVendors() {
    const result = [];
    const seenVendors = /* @__PURE__ */ new Set();
    for (const modelEntry of this.languageModels) {
      if (!seenVendors.has(modelEntry.provider.group.name)) {
        seenVendors.add(modelEntry.provider.group.name);
        result.push(modelEntry.provider);
      }
    }
    return result;
  }
};

ChatModelsViewModel = __decorateClass([
  __decorateParam(0, ILanguageModelsService),
  __decorateParam(1, IStorageService)
], ChatModelsViewModel);

var ModelItemMatches = class {
  constructor(modelEntry, searchValue, words, completeMatch) {
    this.modelNameMatches = null;
    this.modelIdMatches = null;
    this.providerMatches = null;
    this.capabilityMatches = null;
    if (!completeMatch) {
      this.modelNameMatches = modelEntry.metadata.name ? this.matches(searchValue, modelEntry.metadata.name, (word, wordToMatchAgainst) => matchesWords(word, wordToMatchAgainst, true), words) : null;
      this.modelIdMatches = this.matches(searchValue, modelEntry.metadata.id, or(matchesWords, matchesCamelCase), words);
      this.providerMatches = this.matches(searchValue, modelEntry.provider.group.name, (word, wordToMatchAgainst) => matchesWords(word, wordToMatchAgainst, true), words);
      if (modelEntry.metadata.capabilities) {
        const capabilityStrings = [];
        if (modelEntry.metadata.capabilities.toolCalling) {
          capabilityStrings.push("tools", "toolCalling");
        }
        if (modelEntry.metadata.capabilities.vision) {
          capabilityStrings.push("vision");
        }
        if (modelEntry.metadata.capabilities.agentMode) {
          capabilityStrings.push("agent", "agentMode");
        }
        if (modelEntry.metadata.capabilities.editTools) {
          capabilityStrings.push(...modelEntry.metadata.capabilities.editTools);
        }
        const capabilityString = capabilityStrings.join(" ");
        if (capabilityString) {
          this.capabilityMatches = this.matches(searchValue, capabilityString, or(matchesWords, matchesCamelCase), words);
        }
      }
    }
  }
  matches(searchValue, wordToMatchAgainst, wordMatchesFilter, words) {
    let matches2 = searchValue ? wordFilter2(searchValue, wordToMatchAgainst) : null;
    if (!matches2) {
      matches2 = this.matchesWords(words, wordToMatchAgainst, wordMatchesFilter);
    }
    if (matches2) {
      matches2 = this.filterAndSort(matches2);
    }
    return matches2;
  }
  matchesWords(words, wordToMatchAgainst, wordMatchesFilter) {
    let matches2 = [];
    for (const word of words) {
      const wordMatches = wordMatchesFilter(word, wordToMatchAgainst);
      if (wordMatches) {
        matches2 = [...matches2 || [], ...wordMatches];
      } else {
        matches2 = null;
        break;
      }
    }
    return matches2;
  }
  filterAndSort(matches2) {
    return distinct(matches2, ((a) => a.start + "." + a.end)).filter((match2) => !matches2.some((m) => !(m.start === match2.start && m.end === match2.end) && (m.start <= match2.start && m.end >= match2.end))).sort((a, b) => a.start - b.start);
  }
};
export { getManageModelsProviderLabel, isLanguageModelProviderEntry, isLanguageModelGroupEntry, isStatusEntry, MODEL_ENTRY_TEMPLATE_ID, VENDOR_ENTRY_TEMPLATE_ID, wordFilter2, CAPABILITY_REGEX, PROVIDER_REGEX, SEARCH_SUGGESTIONS, ChatModelsViewModel, ModelItemMatches };
