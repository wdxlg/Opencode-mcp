// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/snippets/browser/snippetsService.ts
import { isFalsyOrWhitespace } from "./module-0030.mjs";
import { localize } from "./module-0001.mjs";
import { basename2, extname2, isEqualOrParent2, joinPath } from "./module-0034.mjs";
import { ExtensionsRegistry } from "./module-0878.mjs";
import { languagesExtPoint } from "./module-1356.mjs";
import { DisposableStore, combinedDisposable } from "./module-0012.mjs";
import { isStringArray } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { setSnippetSuggestSupport } from "./module-0696.mjs";
import { SnippetCompletionProvider } from "./module-1357.mjs";
import { insertInto } from "./module-0007.mjs";
import { SnippetFile } from "./module-1352.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IUserDataProfileService } from "./module-0998.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { ILogService } from "./module-0095.mjs";
import { IFileService } from "./module-0269.mjs";
import { ITextFileService } from "./module-1064.mjs";
import { IExtensionResourceLoaderService } from "./module-0893.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";


// src/vs/workbench/contrib/snippets/browser/snippetsService.ts
var snippetExt;

((snippetExt2) => {
  function toValidSnippet(extension, snippet, languageService) {
    if (isFalsyOrWhitespace(snippet.path)) {
      extension.collector.error(localize(
        19372,
        null,
        extension.description.name,
        String(snippet.path)
      ));
      return null;
    }
    if (isFalsyOrWhitespace(snippet.language) && !snippet.path.endsWith(".code-snippets")) {
      extension.collector.error(localize(
        19371,
        null,
        extension.description.name,
        String(snippet.path)
      ));
      return null;
    }
    if (!isFalsyOrWhitespace(snippet.language) && !languageService.isRegisteredLanguageId(snippet.language)) {
      extension.collector.error(localize(
        19370,
        null,
        extension.description.name,
        String(snippet.language)
      ));
      return null;
    }
    const extensionLocation = extension.description.extensionLocation;
    const snippetLocation = joinPath(extensionLocation, snippet.path);
    if (!isEqualOrParent2(snippetLocation, extensionLocation)) {
      extension.collector.error(localize(
        19373,
        null,
        extension.description.name,
        snippetLocation.path,
        extensionLocation.path
      ));
      return null;
    }
    return {
      language: snippet.language,
      location: snippetLocation
    };
  }
  snippetExt2.toValidSnippet = toValidSnippet;
  snippetExt2.snippetsContribution = {
    description: localize(19374, null),
    type: "array",
    defaultSnippets: [{ body: [{ language: "", path: "" }] }],
    items: {
      type: "object",
      defaultSnippets: [{ body: { language: "${1:id}", path: "./snippets/${2:id}.json." } }],
      properties: {
        language: {
          description: localize(19375, null),
          type: "string"
        },
        path: {
          description: localize(19376, null),
          type: "string"
        }
      }
    }
  };
  snippetExt2.point = ExtensionsRegistry.registerExtensionPoint({
    extensionPoint: "snippets",
    deps: [languagesExtPoint],
    jsonSchema: snippetExt2.snippetsContribution
  });
})(snippetExt || (snippetExt = {}));

function watch(service, resource, callback) {
  return combinedDisposable(
    service.watch(resource),
    service.onDidFilesChange((e4) => {
      if (e4.affects(resource)) {
        callback();
      }
    })
  );
}

var SnippetEnablement = class {
  constructor(_storageService) {
    this._storageService = _storageService;
    const raw = _storageService.get(SnippetEnablement._key, 0 /* PROFILE */, "");
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
    }
    this._ignored = isStringArray(data) ? new Set(data) : /* @__PURE__ */ new Set();
  }
  static {
    this._key = "snippets.ignoredSnippets";
  }
  isIgnored(id2) {
    return this._ignored.has(id2);
  }
  updateIgnored(id2, value2) {
    let changed = false;
    if (this._ignored.has(id2) && !value2) {
      this._ignored.delete(id2);
      changed = true;
    } else if (!this._ignored.has(id2) && value2) {
      this._ignored.add(id2);
      changed = true;
    }
    if (changed) {
      this._storageService.store(SnippetEnablement._key, JSON.stringify(Array.from(this._ignored)), 0 /* PROFILE */, 0 /* USER */);
    }
  }
};

SnippetEnablement = __decorateClass([
  __decorateParam(0, IStorageService)
], SnippetEnablement);

var SnippetUsageTimestamps = class {
  constructor(_storageService) {
    this._storageService = _storageService;
    const raw = _storageService.get(SnippetUsageTimestamps._key, 0 /* PROFILE */, "");
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = [];
    }
    this._usages = Array.isArray(data) ? new Map(data) : /* @__PURE__ */ new Map();
  }
  static {
    this._key = "snippets.usageTimestamps";
  }
  getUsageTimestamp(id2) {
    return this._usages.get(id2);
  }
  updateUsageTimestamp(id2) {
    this._usages.delete(id2);
    this._usages.set(id2, Date.now());
    const all = [...this._usages].slice(-100);
    this._storageService.store(SnippetUsageTimestamps._key, JSON.stringify(all), 0 /* PROFILE */, 0 /* USER */);
  }
};

SnippetUsageTimestamps = __decorateClass([
  __decorateParam(0, IStorageService)
], SnippetUsageTimestamps);

var SnippetsService = class {
  constructor(_environmentService, _userDataProfileService, _contextService, _languageService, _logService, _fileService, _textfileService, _extensionResourceLoaderService, lifecycleService, instantiationService, languageConfigurationService) {
    this._environmentService = _environmentService;
    this._userDataProfileService = _userDataProfileService;
    this._contextService = _contextService;
    this._languageService = _languageService;
    this._logService = _logService;
    this._fileService = _fileService;
    this._textfileService = _textfileService;
    this._extensionResourceLoaderService = _extensionResourceLoaderService;
    this._disposables = new DisposableStore();
    this._pendingWork = /* @__PURE__ */ new Set();
    this._files = new ResourceMap();
    this._trackPendingWork(Promise.resolve(lifecycleService.when(3 /* Restored */).then(() => {
      this._initExtensionSnippets();
      this._initUserSnippets();
      this._initWorkspaceSnippets();
    })));
    setSnippetSuggestSupport(new SnippetCompletionProvider(this._languageService, this, languageConfigurationService));
    this._enablement = instantiationService.createInstance(SnippetEnablement);
    this._usageTimestamps = instantiationService.createInstance(SnippetUsageTimestamps);
  }
  dispose() {
    this._disposables.dispose();
  }
  isEnabled(snippet) {
    return !this._enablement.isIgnored(snippet.snippetIdentifier);
  }
  updateEnablement(snippet, enabled) {
    this._enablement.updateIgnored(snippet.snippetIdentifier, !enabled);
  }
  updateUsageTimestamp(snippet) {
    this._usageTimestamps.updateUsageTimestamp(snippet.snippetIdentifier);
  }
  async _joinSnippets() {
    const promises = [...this._pendingWork];
    await Promise.all(promises);
  }
  _trackPendingWork(work) {
    this._pendingWork.add(work);
    work.then(
      () => this._pendingWork.delete(work),
      (error) => {
        this._pendingWork.delete(work);
        this._logService.error(error);
      }
    );
  }
  async getSnippetFiles() {
    await this._joinSnippets();
    return this._files.values();
  }
  async getSnippets(languageId, resourceUri, opts) {
    await this._joinSnippets();
    const result = [];
    const promises = [];
    if (languageId) {
      if (this._languageService.isRegisteredLanguageId(languageId)) {
        for (const file of this._files.values()) {
          promises.push(
            file.load().then((file2) => file2.select(languageId, result)).catch((err) => this._logService.error(err, file.location.toString()))
          );
        }
      }
    } else {
      for (const file of this._files.values()) {
        promises.push(
          file.load().then((file2) => insertInto(result, result.length, file2.data)).catch((err) => this._logService.error(err, file.location.toString()))
        );
      }
    }
    await Promise.all(promises);
    return this._filterAndSortSnippets(result, resourceUri, opts);
  }
  getSnippetsSync(languageId, resourceUri, opts) {
    const result = [];
    if (this._languageService.isRegisteredLanguageId(languageId)) {
      for (const file of this._files.values()) {
        file.load().catch((_err) => {
        });
        file.select(languageId, result);
      }
    }
    return this._filterAndSortSnippets(result, resourceUri, opts);
  }
  _filterAndSortSnippets(snippets, resourceUri, opts) {
    const result = [];
    for (const snippet of snippets) {
      if (!snippet.prefix && !opts?.includeNoPrefixSnippets) {
        continue;
      }
      if (!this.isEnabled(snippet) && !opts?.includeDisabledSnippets) {
        continue;
      }
      if (typeof opts?.fileTemplateSnippets === "boolean" && opts.fileTemplateSnippets !== snippet.isFileTemplate) {
        continue;
      }
      if (resourceUri && !snippet.isFileIncluded(resourceUri)) {
        continue;
      }
      result.push(snippet);
    }
    return result.sort((a, b) => {
      let result2 = 0;
      if (!opts?.noRecencySort) {
        const val1 = this._usageTimestamps.getUsageTimestamp(a.snippetIdentifier) ?? -1;
        const val2 = this._usageTimestamps.getUsageTimestamp(b.snippetIdentifier) ?? -1;
        result2 = val2 - val1;
      }
      if (result2 === 0) {
        result2 = this._compareSnippet(a, b);
      }
      return result2;
    });
  }
  _compareSnippet(a, b) {
    if (a.snippetSource < b.snippetSource) {
      return -1;
    } else if (a.snippetSource > b.snippetSource) {
      return 1;
    } else if (a.source < b.source) {
      return -1;
    } else if (a.source > b.source) {
      return 1;
    } else if (a.name > b.name) {
      return 1;
    } else if (a.name < b.name) {
      return -1;
    } else {
      return 0;
    }
  }
  // --- loading, watching
  _initExtensionSnippets() {
    snippetExt.point.setHandler((extensions) => {
      for (const [key3, value2] of this._files) {
        if (value2.source === 3 /* Extension */) {
          this._files.delete(key3);
        }
      }
      for (const extension of extensions) {
        for (const contribution of extension.value) {
          const validContribution = snippetExt.toValidSnippet(extension, contribution, this._languageService);
          if (!validContribution) {
            continue;
          }
          const file = this._files.get(validContribution.location);
          if (file) {
            if (file.defaultScopes) {
              file.defaultScopes.push(validContribution.language);
            } else {
              file.defaultScopes = [];
            }
          } else {
            const file2 = new SnippetFile(3 /* Extension */, validContribution.location, validContribution.language ? [validContribution.language] : void 0, extension.description, this._fileService, this._extensionResourceLoaderService);
            this._files.set(file2.location, file2);
            if (this._environmentService.isExtensionDevelopment) {
              file2.load().then((file3) => {
                if (file3.data.some((snippet) => snippet.isBogous)) {
                  extension.collector.warn(localize(
                    19369,
                    null,
                    extension.description.name
                  ));
                }
              }, (err) => {
                extension.collector.warn(localize(
                  19368,
                  null,
                  file2.location.toString()
                ));
              });
            }
          }
        }
      }
    });
  }
  _initWorkspaceSnippets() {
    const disposables = new DisposableStore();
    const updateWorkspaceSnippets = () => {
      disposables.clear();
      this._trackPendingWork(this._initWorkspaceFolderSnippets(this._contextService.getWorkspace(), disposables));
    };
    this._disposables.add(disposables);
    this._disposables.add(this._contextService.onDidChangeWorkspaceFolders(updateWorkspaceSnippets));
    this._disposables.add(this._contextService.onDidChangeWorkbenchState(updateWorkspaceSnippets));
    updateWorkspaceSnippets();
  }
  async _initWorkspaceFolderSnippets(workspace, bucket) {
    const promises = workspace.folders.map(async (folder) => {
      const snippetFolder = folder.toResource(".vscode");
      const value2 = await this._fileService.exists(snippetFolder);
      if (value2) {
        this._initFolderSnippets(2 /* Workspace */, snippetFolder, bucket);
      } else {
        bucket.add(this._fileService.onDidFilesChange((e4) => {
          if (e4.contains(snippetFolder, 1 /* ADDED */)) {
            this._initFolderSnippets(2 /* Workspace */, snippetFolder, bucket);
          }
        }));
      }
    });
    await Promise.all(promises);
  }
  async _initUserSnippets() {
    const disposables = new DisposableStore();
    const updateUserSnippets = async () => {
      disposables.clear();
      const userSnippetsFolder = this._userDataProfileService.currentProfile.snippetsHome;
      await this._fileService.createFolder(userSnippetsFolder);
      await this._initFolderSnippets(1 /* User */, userSnippetsFolder, disposables);
    };
    this._disposables.add(disposables);
    this._disposables.add(this._userDataProfileService.onDidChangeCurrentProfile((e4) => e4.join((async () => {
      this._trackPendingWork(updateUserSnippets());
    })())));
    await updateUserSnippets();
  }
  _initFolderSnippets(source, folder, bucket) {
    const disposables = new DisposableStore();
    const addFolderSnippets = async () => {
      disposables.clear();
      if (!await this._fileService.exists(folder)) {
        return;
      }
      try {
        const stat = await this._fileService.resolve(folder);
        for (const entry of stat.children || []) {
          disposables.add(this._addSnippetFile(entry.resource, source));
        }
      } catch (err) {
        this._logService.error(`Failed snippets from folder '${folder.toString()}'`, err);
      }
    };
    bucket.add(this._textfileService.files.onDidSave((e4) => {
      if (isEqualOrParent2(e4.model.resource, folder)) {
        addFolderSnippets();
      }
    }));
    bucket.add(watch(this._fileService, folder, addFolderSnippets));
    bucket.add(disposables);
    return addFolderSnippets();
  }
  _addSnippetFile(uri4, source) {
    const ext = extname2(uri4);
    if (source === 1 /* User */ && ext === ".json") {
      const langName = basename2(uri4).replace(/\.json/, "");
      this._files.set(uri4, new SnippetFile(source, uri4, [langName], void 0, this._fileService, this._extensionResourceLoaderService));
    } else if (ext === ".code-snippets") {
      this._files.set(uri4, new SnippetFile(source, uri4, void 0, void 0, this._fileService, this._extensionResourceLoaderService));
    }
    return {
      dispose: () => this._files.delete(uri4)
    };
  }
};

SnippetsService = __decorateClass([
  __decorateParam(0, IEnvironmentService),
  __decorateParam(1, IUserDataProfileService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, ILanguageService),
  __decorateParam(4, ILogService),
  __decorateParam(5, IFileService),
  __decorateParam(6, ITextFileService),
  __decorateParam(7, IExtensionResourceLoaderService),
  __decorateParam(8, ILifecycleService),
  __decorateParam(9, IInstantiationService),
  __decorateParam(10, ILanguageConfigurationService)
], SnippetsService);

function getNonWhitespacePrefix(model, position2) {
  const MAX_PREFIX_LENGTH = 100;
  const line = model.getLineContent(position2.lineNumber).substr(0, position2.column - 1);
  const minChIndex = Math.max(0, line.length - MAX_PREFIX_LENGTH);
  for (let chIndex = line.length - 1; chIndex >= minChIndex; chIndex--) {
    const ch = line.charAt(chIndex);
    if (/\s/.test(ch)) {
      return line.substr(chIndex + 1);
    }
  }
  if (minChIndex === 0) {
    return line;
  }
  return "";
}
export { watch, getNonWhitespacePrefix, snippetExt, SnippetEnablement, SnippetUsageTimestamps, SnippetsService };
