// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/aiCustomizationItemSource.ts
import { ExtensionIdentifier } from "./module-0688.mjs";
import { Schemas } from "./module-0033.mjs";
import { parse5 } from "./module-0885.mjs";
import { parseHooksFromFile } from "./module-1015.mjs";
import { HOOK_METADATA } from "./module-1011.mjs";
import { formatHookCommandLabel } from "./module-1012.mjs";
import { OS } from "./module-0014.mjs";
import { localize } from "./module-0001.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { AICustomizationSources, BUILTIN_STORAGE } from "./module-0996.mjs";
import { basename2, dirname2 } from "./module-0034.mjs";
import { sourceToIcon } from "./module-2615.mjs";
import { Disposable } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { CancellationToken } from "./module-0025.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/aiCustomizationItemSource.ts
function isChatExtensionItem(extensionId, productService) {
  const chatExtensionId = productService.defaultChatAgent?.chatExtensionId;
  return !!chatExtensionId && ExtensionIdentifier.equals(extensionId, chatExtensionId);
}

function getFriendlyName(filename) {
  let name = filename.replace(/\.instructions\.md$/i, "").replace(/\.prompt\.md$/i, "").replace(/\.agent\.md$/i, "").replace(/\.md$/i, "");
  name = name.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return name || filename;
}

async function expandHookFileItems(hookFileItems, workspaceService, fileService, pathService) {
  const items = [];
  const activeRoot = workspaceService.getActiveProjectRoot();
  const userHomeUri = await pathService.userHome();
  const userHome = userHomeUri.scheme === Schemas.file ? userHomeUri.fsPath : userHomeUri.path;
  for (const item of hookFileItems) {
    let parsedHooks = false;
    try {
      const content = await fileService.readFile(item.uri);
      const json = parse5(content.value.toString());
      const { hooks } = parseHooksFromFile(item.uri, json, activeRoot, userHome);
      if (hooks.size > 0) {
        parsedHooks = true;
        for (const [hookType, entry] of hooks) {
          const hookMeta = HOOK_METADATA[hookType];
          for (let i2 = 0; i2 < entry.hooks.length; i2++) {
            const hook = entry.hooks[i2];
            const cmdLabel = formatHookCommandLabel(hook, OS);
            const truncatedCmd = cmdLabel.length > 60 ? cmdLabel.substring(0, 57) + "..." : cmdLabel;
            items.push({
              uri: item.uri,
              type: "hook" /* hook */,
              name: hookMeta?.label ?? entry.originalId,
              description: truncatedCmd || localize(9288, null),
              enabled: item.enabled,
              groupKey: item.groupKey,
              source: item.source,
              extensionId: item.extensionId,
              pluginUri: item.pluginUri,
              userInvocable: item.userInvocable
            });
          }
        }
      }
    } catch {
    }
    if (!parsedHooks) {
      items.push(item);
    }
  }
  return items;
}

var AICustomizationItemNormalizer = class {
  constructor(labelService, productService) {
    this.labelService = labelService;
    this.productService = productService;
  }
  normalizeItems(items, promptType) {
    const uriUseCounts = new ResourceMap();
    return items.filter((item) => item.type === promptType).map((item) => this.normalizeItem(item, promptType, uriUseCounts)).sort((a, b) => a.name.localeCompare(b.name));
  }
  normalizeItem(item, promptType, uriUseCounts = new ResourceMap()) {
    const { source, groupKey, isBuiltin, extensionId, pluginUri } = this.inferStorageAndGroup(item);
    const seenCount = uriUseCounts.get(item.uri) ?? 0;
    uriUseCounts.set(item.uri, seenCount + 1);
    const duplicateSuffix = seenCount === 0 ? "" : `#${seenCount}`;
    const isWorkspaceItem = source === AICustomizationSources.local;
    return {
      id: `${item.uri.toString()}${duplicateSuffix}`,
      uri: item.uri,
      name: item.name,
      filename: item.uri.scheme === Schemas.file ? this.labelService.getUriLabel(item.uri, { relative: isWorkspaceItem }) : basename2(item.uri),
      description: item.description,
      source,
      promptType,
      disabled: item.enabled === false,
      groupKey,
      pluginUri,
      displayName: item.name,
      badge: item.badge,
      badgeTooltip: item.badgeTooltip,
      typeIcon: promptType === "instructions" /* instructions */ && source ? sourceToIcon(source) : void 0,
      isBuiltin,
      extensionId,
      status: item.status,
      statusMessage: item.statusMessage
    };
  }
  inferStorageAndGroup(item) {
    const groupKey = item.groupKey;
    const hasBuiltinStorage = item.source === AICustomizationSources.builtin;
    const isBuiltin = groupKey === BUILTIN_STORAGE || hasBuiltinStorage;
    if (hasBuiltinStorage) {
      return { source: AICustomizationSources.builtin, groupKey: groupKey ?? BUILTIN_STORAGE, isBuiltin: true, extensionId: item.extensionId };
    }
    if (item.source === AICustomizationSources.plugin) {
      return { source: AICustomizationSources.plugin, pluginUri: item.pluginUri, groupKey, isBuiltin };
    }
    if (item.source === AICustomizationSources.extension) {
      if (item.extensionId) {
        const extensionIdentifier = new ExtensionIdentifier(item.extensionId);
        if (isChatExtensionItem(extensionIdentifier, this.productService)) {
          return { source: AICustomizationSources.extension, groupKey: BUILTIN_STORAGE, isBuiltin: true, extensionId: item.extensionId };
        }
      }
      return { source: AICustomizationSources.extension, extensionId: item.extensionId, groupKey, isBuiltin };
    }
    return { source: item.source, groupKey, isBuiltin, pluginUri: item.pluginUri, extensionId: item.extensionId };
  }
};

var ItemProviderItemSource = class extends Disposable {
  constructor(sessionResource, itemProvider, promptsService, workspaceService, fileService, pathService, itemNormalizer) {
    super();
    this.sessionResource = sessionResource;
    this.itemProvider = itemProvider;
    this.promptsService = promptsService;
    this.workspaceService = workspaceService;
    this.fileService = fileService;
    this.pathService = pathService;
    this.itemNormalizer = itemNormalizer;
    this.onDidAICustomizationItemsChange = Event2.any(
      this.itemProvider.onDidChange,
      this.promptsService.onDidChangeSkills
    );
    this._register(this.onDidAICustomizationItemsChange(() => {
      this.cachedPromise = void 0;
    }));
  }
  dispose() {
    super.dispose();
    this.cachedPromise = void 0;
  }
  async fetchProviderItems() {
    if (!this.cachedPromise) {
      this.cachedPromise = this.itemProvider.provideChatSessionCustomizations(this.sessionResource, CancellationToken.None);
    }
    const cached = this.cachedPromise;
    const allItems = await cached;
    if (cached !== this.cachedPromise || !allItems) {
      return [];
    }
    return allItems;
  }
  async fetchAICustomizationItems(promptType) {
    const allItems = await this.fetchProviderItems();
    let providerItems;
    if (promptType === "hook" /* hook */) {
      const hookItems = allItems.filter((item) => item.type === "hook" /* hook */);
      const toExpand = hookItems.filter((item) => item.source !== AICustomizationSources.plugin);
      const preExpanded = hookItems.filter((item) => item.source === AICustomizationSources.plugin);
      const expanded2 = await expandHookFileItems(
        toExpand,
        this.workspaceService,
        this.fileService,
        this.pathService
      );
      providerItems = [...expanded2, ...preExpanded];
    } else {
      providerItems = allItems.filter((item) => item.type === promptType);
    }
    if (promptType === "skill" /* skill */) {
      providerItems = await this.addSkillDescriptionFallbacks(providerItems);
    }
    const normalized = this.itemNormalizer.normalizeItems(providerItems, promptType);
    if (promptType === "skill" /* skill */) {
      return this.mergeBuiltinSkills(normalized, promptType);
    }
    return normalized;
  }
  async fetchSourceFolders(promptType) {
    if (!this.itemProvider.provideSourceFolders) {
      return [];
    }
    return await this.itemProvider.provideSourceFolders(this.sessionResource, promptType, CancellationToken.None) ?? [];
  }
  /**
   * Merges built-in skills (bundled with the app under `vs/sessions/skills/`)
   * into the provider's items. The provider may re-discover the bundled
   * copies when scanning disk — those duplicates are dropped (deduped by
   * URI) and replaced with the authoritative built-in entry tagged
   * `groupKey: BUILTIN_STORAGE` so the UI renders them in the "Built-in"
   * group. User-authored overrides (different URI, same name) are preserved.
   *
   * A workbench that uses the base `PromptsService` contributes no built-in
   * skills, so `builtinPaths` is empty and the items are returned unchanged.
   */
  async mergeBuiltinSkills(items, promptType) {
    const builtinPaths = await this.promptsService.listPromptFilesForStorage("skill" /* skill */, "builtin" /* builtIn */, CancellationToken.None);
    if (builtinPaths.length === 0) {
      return [...items];
    }
    const builtinUris = new ResourceMap();
    for (const p of builtinPaths) {
      builtinUris.set(p.uri, p);
    }
    const deduped = items.filter((item) => !builtinUris.has(item.uri));
    const uiIntegrations = this.workspaceService.getSkillUIIntegrations();
    const uiIntegrationBadge = localize(9289, null);
    const overriddenNames = /* @__PURE__ */ new Set();
    for (const item of deduped) {
      if (item.source === AICustomizationSources.local || item.source === AICustomizationSources.user) {
        if (item.name) {
          overriddenNames.add(item.name);
        }
      }
    }
    const uriUseCounts = new ResourceMap();
    for (const item of deduped) {
      uriUseCounts.set(item.uri, (uriUseCounts.get(item.uri) ?? 0) + 1);
    }
    const appended = [];
    const disabledPromptFiles = this.promptsService.getDisabledPromptFiles("skill" /* skill */);
    for (const p of builtinPaths) {
      const name = p.name ?? basename2(p.uri);
      if (overriddenNames.has(name)) {
        continue;
      }
      const folderName = basename2(dirname2(p.uri));
      const uiTooltip = uiIntegrations.get(folderName);
      const builtinItem = {
        uri: p.uri,
        type: "skill" /* skill */,
        name,
        description: p.description,
        source: AICustomizationSources.builtin,
        groupKey: BUILTIN_STORAGE,
        enabled: !disabledPromptFiles.has(p.uri),
        badge: uiTooltip ? uiIntegrationBadge : void 0,
        badgeTooltip: uiTooltip,
        extensionId: void 0,
        pluginUri: void 0,
        userInvocable: true
      };
      appended.push(this.itemNormalizer.normalizeItem(builtinItem, promptType, uriUseCounts));
    }
    return [...deduped, ...appended];
  }
  async addSkillDescriptionFallbacks(items) {
    const descriptionsByUri = /* @__PURE__ */ new Map();
    const skills = await this.promptsService.findAgentSkills(CancellationToken.None);
    for (const skill of skills ?? []) {
      if (skill.description) {
        descriptionsByUri.set(skill.uri.toString(), skill.description);
      }
    }
    return items.map((item) => item.description ? item : { ...item, description: descriptionsByUri.get(item.uri.toString()) });
  }
};

var EmptyItemProviderItemSource = class extends Disposable {
  constructor(sessionResource) {
    super();
    this.sessionResource = sessionResource;
    this.onDidAICustomizationItemsChange = Event2.None;
  }
  fetchAICustomizationItems(promptType) {
    return Promise.resolve([]);
  }
  fetchProviderItems() {
    return Promise.resolve([]);
  }
  fetchSourceFolders(_promptType) {
    return Promise.resolve([]);
  }
};

var PureItemProviderItemSource = class extends Disposable {
  constructor(sessionResource, itemProvider, itemNormalizer) {
    super();
    this.sessionResource = sessionResource;
    this.itemProvider = itemProvider;
    this.itemNormalizer = itemNormalizer;
    this.onDidAICustomizationItemsChange = this.itemProvider.onDidChange;
    this._register(this.itemProvider.onDidChange(() => {
      this.cachedPromise = void 0;
    }));
  }
  async fetchProviderItems() {
    if (!this.cachedPromise) {
      const promise = this.itemProvider.provideChatSessionCustomizations(this.sessionResource, CancellationToken.None);
      this.cachedPromise = promise;
      promise.catch(() => {
        if (this.cachedPromise === promise) {
          this.cachedPromise = void 0;
        }
      });
    }
    const cached = this.cachedPromise;
    const allItems = await cached;
    if (cached !== this.cachedPromise || !allItems) {
      return [];
    }
    return allItems;
  }
  async fetchAICustomizationItems(promptType) {
    const allItems = await this.fetchProviderItems();
    return this.itemNormalizer.normalizeItems(allItems, promptType);
  }
  async fetchSourceFolders(promptType) {
    if (!this.itemProvider.provideSourceFolders) {
      return [];
    }
    return await this.itemProvider.provideSourceFolders(this.sessionResource, promptType, CancellationToken.None) ?? [];
  }
};
export { isChatExtensionItem, getFriendlyName, expandHookFileItems, AICustomizationItemNormalizer, ItemProviderItemSource, EmptyItemProviderItemSource, PureItemProviderItemSource };
