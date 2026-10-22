// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/promptSyntax/service/extensionPromptFileService.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { Emitter } from "./module-0017.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { CancellationError, isCancellationError } from "./module-0004.mjs";
import { CUSTOM_AGENT_PROVIDER_ACTIVATION_EVENT, INSTRUCTIONS_PROVIDER_ACTIVATION_EVENT, PROMPT_FILE_PROVIDER_ACTIVATION_EVENT, SKILL_PROVIDER_ACTIVATION_EVENT } from "./module-0987.mjs";
import { getSkillFolderName } from "./module-0997.mjs";
import { PromptFileParser } from "./module-1004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { IFileService } from "./module-0269.mjs";
import { IModelService } from "./module-0080.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IFilesConfigurationService } from "./module-0931.mjs";


// src/vs/workbench/contrib/chat/common/promptSyntax/service/extensionPromptFileService.ts
var ALL_PROMPT_TYPES = [
  "prompt" /* prompt */,
  "instructions" /* instructions */,
  "agent" /* agent */,
  "skill" /* skill */,
  "hook" /* hook */
];

var ExtensionPromptFileService = class extends Disposable {
  constructor(logger, fileService, modelService, extensionService, filesConfigService, contextKeyService) {
    super();
    this.logger = logger;
    this.fileService = fileService;
    this.modelService = modelService;
    this.extensionService = extensionService;
    this.filesConfigService = filesConfigService;
    this.contextKeyService = contextKeyService;
    /**
     * Files contributed via extension contribution points, keyed by type then URI.
     */
    this.contributedFiles = {
      ["prompt" /* prompt */]: new ResourceMap(),
      ["instructions" /* instructions */]: new ResourceMap(),
      ["agent" /* agent */]: new ResourceMap(),
      ["skill" /* skill */]: new ResourceMap(),
      ["hook" /* hook */]: new ResourceMap()
    };
    /**
     * Providers registered via the proposed extension API.
     */
    this._promptFileProviders = [];
    /**
     * Context keys referenced by tracked `when` clauses (from contributed
     * files and provider results). Used to know when to re-evaluate.
     */
    this._contributedWhenKeys = /* @__PURE__ */ new Set();
    this._contributedWhenClauses = /* @__PURE__ */ new Map();
    this._providerWhenClauses = /* @__PURE__ */ new Map();
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    /**
     * Pending URIs to mark as readonly, flushed on the next microtask.
     * Batches multiple `registerContributedFile` calls (which happen
     * synchronously in the extension point handler) into a single
     * `updateReadonly` call to avoid firing `onDidChangeReadonly` per file.
     */
    this._pendingReadonlyUris = [];
    this._pendingReadonlyFlush = false;
    this._register(this.contextKeyService.onDidChangeContext((e4) => {
      if (e4.affectsSome(this._contributedWhenKeys)) {
        for (const type of ALL_PROMPT_TYPES) {
          this._onDidChange.fire({ type });
        }
      }
    }));
  }
  /**
   * Returns the merged list of extension-contributed prompt files for the
   * given type, filtered by their `when` clause.
   */
  async getExtensionPromptFiles(type, token) {
    await this.extensionService.whenInstalledExtensionsRegistered();
    const settledResults = await Promise.allSettled(this.contributedFiles[type].values());
    const contributedFiles = settledResults.filter((result) => result.status === "fulfilled").map((result) => result.value);
    const activationEvent = this._getProviderActivationEvent(type);
    const providerFiles = activationEvent ? await this._listFromProviders(type, activationEvent, token) : [];
    return [...contributedFiles, ...providerFiles].filter((file) => {
      if (!file.when) {
        return true;
      }
      const when = ContextKeyExpr.deserialize(file.when);
      if (!when) {
        this.logger.warn(`[getExtensionPromptFiles] Ignoring contributed prompt file with invalid when clause: ${file.when}`);
        return false;
      }
      return this.contextKeyService.contextMatchesRules(when);
    });
  }
  /**
   * Registers a file contributed via a static contribution point. Returns
   * a disposable that removes the contribution.
   */
  registerContributedFile(type, uri4, extension, name, description, when, sessionTypes) {
    const bucket = this.contributedFiles[type];
    if (bucket.has(uri4)) {
      return Disposable.None;
    }
    const entryPromise = (async () => {
      if (type === "skill" /* skill */) {
        try {
          const validated = await this._validateAndSanitizeSkillFile(uri4, CancellationToken.None);
          name = validated.name;
          description = validated.description;
        } catch (e4) {
          const msg = e4 instanceof Error ? e4.message : String(e4);
          this.logger.error(`[registerContributedFile] Extension '${extension.identifier.value}' failed to validate skill file: ${uri4}`, msg);
          throw e4;
        }
      }
      return { uri: uri4, name, description, when, sessionTypes, storage: "extension" /* extension */, type, extension, source: "extension-contribution" /* ExtensionContribution */ };
    })();
    bucket.set(uri4, entryPromise);
    this._enqueueReadonlyUpdate(uri4);
    if (when) {
      this._contributedWhenClauses.set(`${type}/${uri4.toString()}`, when);
      this._updateContributedWhenKeys();
    }
    this._onDidChange.fire({ type });
    return {
      dispose: () => {
        bucket.delete(uri4);
        if (when) {
          this._contributedWhenClauses.delete(`${type}/${uri4.toString()}`);
          this._updateContributedWhenKeys();
        }
        this._onDidChange.fire({ type });
      }
    };
  }
  /**
   * Registers a prompt file provider (CustomAgentProvider, InstructionsProvider, or PromptFileProvider).
   * This is called by the extension host bridge when an extension registers a provider via
   * vscode.chat.registerCustomAgentProvider(), registerInstructionsProvider(), or
   * registerPromptFileProvider().
   */
  registerPromptFileProvider(extension, type, provider) {
    const providerEntry = { extension, type, ...provider };
    this._promptFileProviders.push(providerEntry);
    const disposables = new DisposableStore();
    if (provider.onDidChangePromptFiles) {
      disposables.add(provider.onDidChangePromptFiles(() => {
        this._onDidChange.fire({ type });
      }));
    }
    this._onDidChange.fire({ type });
    disposables.add({
      dispose: () => {
        const index2 = this._promptFileProviders.findIndex((p) => p === providerEntry);
        if (index2 >= 0) {
          this._promptFileProviders.splice(index2, 1);
          this._providerWhenClauses.delete(providerEntry);
          this._updateContributedWhenKeys();
          this._onDidChange.fire({ type });
        }
      }
    });
    return disposables;
  }
  async _listFromProviders(type, activationEvent, token) {
    const result = [];
    const readonlyUris = [];
    await this.extensionService.activateByEvent(activationEvent);
    const providers2 = this._promptFileProviders.filter((p) => p.type === type);
    if (providers2.length === 0) {
      return result;
    }
    for (const providerEntry of providers2) {
      if (token.isCancellationRequested) {
        break;
      }
      try {
        const files = await providerEntry.providePromptFiles({}, token);
        this._providerWhenClauses.set(providerEntry, files?.flatMap((file) => file.when ? [file.when] : []) ?? []);
        this._updateContributedWhenKeys();
        if (!files || token.isCancellationRequested) {
          continue;
        }
        for (const file of files) {
          readonlyUris.push(file.uri);
          result.push({
            uri: file.uri,
            storage: "extension" /* extension */,
            type,
            extension: providerEntry.extension,
            source: "extension-api" /* ExtensionAPI */,
            name: file.name,
            description: file.description,
            when: file.when,
            sessionTypes: file.sessionTypes
          });
        }
      } catch (e4) {
        if (token.isCancellationRequested || isCancellationError(e4)) {
          break;
        }
        this.logger.error(`[listFromProviders] Failed to get ${type} files from provider`, e4 instanceof Error ? e4.message : String(e4));
      }
    }
    void this.filesConfigService.updateReadonly(readonlyUris, true);
    return result;
  }
  _getProviderActivationEvent(type) {
    switch (type) {
      case "agent" /* agent */:
        return CUSTOM_AGENT_PROVIDER_ACTIVATION_EVENT;
      case "instructions" /* instructions */:
        return INSTRUCTIONS_PROVIDER_ACTIVATION_EVENT;
      case "prompt" /* prompt */:
        return PROMPT_FILE_PROVIDER_ACTIVATION_EVENT;
      case "skill" /* skill */:
        return SKILL_PROVIDER_ACTIVATION_EVENT;
      case "hook" /* hook */:
        return void 0;
    }
  }
  _enqueueReadonlyUpdate(uri4) {
    this._pendingReadonlyUris.push(uri4);
    if (!this._pendingReadonlyFlush) {
      this._pendingReadonlyFlush = true;
      queueMicrotask(() => {
        const uris = this._pendingReadonlyUris;
        this._pendingReadonlyUris = [];
        this._pendingReadonlyFlush = false;
        void this.filesConfigService.updateReadonly(uris, true);
      });
    }
  }
  _updateContributedWhenKeys() {
    this._contributedWhenKeys.clear();
    for (const whenClause of this._contributedWhenClauses.values()) {
      const expr = ContextKeyExpr.deserialize(whenClause);
      for (const key3 of expr?.keys() ?? []) {
        this._contributedWhenKeys.add(key3);
      }
    }
    for (const whenClauses of this._providerWhenClauses.values()) {
      for (const whenClause of whenClauses) {
        const expr = ContextKeyExpr.deserialize(whenClause);
        for (const key3 of expr?.keys() ?? []) {
          this._contributedWhenKeys.add(key3);
        }
      }
    }
  }
  // Skill validation
  async _validateAndSanitizeSkillFile(uri4, token) {
    const parsedFile = await this._parsePromptFile(uri4, token);
    const folderName = getSkillFolderName(uri4);
    let name = parsedFile.header?.name;
    if (!name) {
      this.logger.debug(`[validateAndSanitizeSkillFile] Agent skill file missing name attribute, using folder name "${folderName}": ${uri4}`);
      name = folderName;
    }
    const description = parsedFile.header?.description;
    let sanitizedName = this._truncateAgentSkillName(name, uri4);
    if (sanitizedName !== folderName) {
      this.logger.debug(`[validateAndSanitizeSkillFile] Agent skill name "${sanitizedName}" does not match folder name "${folderName}", using folder name: ${uri4}`);
      sanitizedName = folderName;
    }
    const sanitizedDescription = description ? this._truncateAgentSkillDescription(description, uri4) : void 0;
    return { name: sanitizedName, description: sanitizedDescription };
  }
  async _parsePromptFile(uri4, token) {
    const model = this.modelService.getModel(uri4);
    if (model) {
      return new PromptFileParser().parse(uri4, model.getValue());
    }
    const fileContent = await this.fileService.readFile(uri4);
    if (token.isCancellationRequested) {
      throw new CancellationError();
    }
    return new PromptFileParser().parse(uri4, fileContent.value.toString());
  }
  _sanitizeAgentSkillText(text2) {
    return text2.replace(/<[^>]+>/g, "");
  }
  _truncateAgentSkillName(name, uri4) {
    const MAX_NAME_LENGTH = 64;
    const sanitized = this._sanitizeAgentSkillText(name);
    if (sanitized !== name) {
      this.logger.debug(`[findAgentSkills] Agent skill name contains XML tags, removed: ${uri4}`);
    }
    if (sanitized.length > MAX_NAME_LENGTH) {
      this.logger.debug(`[findAgentSkills] Agent skill name exceeds ${MAX_NAME_LENGTH} characters, truncated: ${uri4}`);
      return sanitized.substring(0, MAX_NAME_LENGTH);
    }
    return sanitized;
  }
  _truncateAgentSkillDescription(description, uri4) {
    const MAX_DESCRIPTION_LENGTH2 = 1024;
    const sanitized = this._sanitizeAgentSkillText(description);
    if (sanitized !== description) {
      this.logger.debug(`[findAgentSkills] Agent skill description contains XML tags, removed: ${uri4}`);
    }
    if (sanitized.length > MAX_DESCRIPTION_LENGTH2) {
      this.logger.debug(`[findAgentSkills] Agent skill description exceeds ${MAX_DESCRIPTION_LENGTH2} characters, truncated: ${uri4}`);
      return sanitized.substring(0, MAX_DESCRIPTION_LENGTH2);
    }
    return sanitized;
  }
};

ExtensionPromptFileService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IModelService),
  __decorateParam(3, IExtensionService),
  __decorateParam(4, IFilesConfigurationService),
  __decorateParam(5, IContextKeyService)
], ExtensionPromptFileService);
export { ALL_PROMPT_TYPES, ExtensionPromptFileService };
