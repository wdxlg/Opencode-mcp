// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/treeSitter/browser/treeSitterLibraryService.ts
import { isWeb } from "./module-0014.mjs";
import { FileAccess, nodeModulesAsarUnpackedPath, nodeModulesPath } from "./module-0033.mjs";
import { Disposable } from "./module-0012.mjs";
import { Lazy } from "./module-0028.mjs";
import { importAMDNodeModule } from "./module-0191.mjs";
import { CachedFunction } from "./module-0027.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { ObservablePromise } from "./module-0055.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IFileService, toFileOperationResult } from "./module-0269.mjs";
import { IEnvironmentService } from "./module-0508.mjs";


// src/vs/workbench/services/treeSitter/browser/treeSitterLibraryService.ts
var EDITOR_EXPERIMENTAL_PREFER_TREESITTER = "editor.experimental.preferTreeSitter";

var MODULE_LOCATION_SUBPATH = `@vscode/tree-sitter-wasm/wasm`;

var FILENAME_TREESITTER_WASM = `tree-sitter.wasm`;

function getModuleLocation(environmentService) {
  const useAsarUnpacked = environmentService.isBuilt && !isWeb;
  return `${useAsarUnpacked ? nodeModulesAsarUnpackedPath : nodeModulesPath}/${MODULE_LOCATION_SUBPATH}`;
}

var TreeSitterLibraryService = class extends Disposable {
  constructor(_configurationService, _fileService, _environmentService) {
    super();
    this._configurationService = _configurationService;
    this._fileService = _fileService;
    this._environmentService = _environmentService;
    this.isTest = false;
    this._treeSitterImport = new Lazy(async () => {
      const TreeSitter = await importAMDNodeModule("@vscode/tree-sitter-wasm", "wasm/tree-sitter.js");
      const environmentService = this._environmentService;
      const isTest = this.isTest;
      await TreeSitter.Parser.init({
        locateFile(_file, _folder) {
          const location2 = `${getModuleLocation(environmentService)}/${FILENAME_TREESITTER_WASM}`;
          if (isTest) {
            return FileAccess.asFileUri(location2).toString(true);
          } else {
            return FileAccess.asBrowserUri(location2).toString(true);
          }
        }
      });
      return TreeSitter;
    });
    this._supportsLanguage = new CachedFunction((languageId) => {
      return observableConfigValue(`${EDITOR_EXPERIMENTAL_PREFER_TREESITTER}.${languageId}`, false, this._configurationService);
    });
    this._languagesCache = new CachedFunction((languageId) => {
      return ObservablePromise.fromFn(async () => {
        const languageLocation = getModuleLocation(this._environmentService);
        const grammarName = `tree-sitter-${languageId}`;
        const wasmPath = `${languageLocation}/${grammarName}.wasm`;
        const [treeSitter, languageFile] = await Promise.all([
          this._treeSitterImport.value,
          this._fileService.readFile(FileAccess.asFileUri(wasmPath))
        ]);
        const Language2 = treeSitter.Language;
        const language2 = await Language2.load(languageFile.value.buffer);
        return language2;
      });
    });
    this._injectionQueries = new CachedFunction({ getCacheKey: JSON.stringify }, (arg) => {
      const loadQuerySource = async () => {
        const injectionsQueriesLocation = `vs/editor/common/languages/${arg.kind}/${arg.languageId}.scm`;
        const uri4 = FileAccess.asFileUri(injectionsQueriesLocation);
        if (!this._fileService.hasProvider(uri4)) {
          return void 0;
        }
        const query = await tryReadFile(this._fileService, uri4);
        if (query === void 0) {
          return void 0;
        }
        return query.value.toString();
      };
      return ObservablePromise.fromFn(async () => {
        const [
          querySource,
          language2,
          treeSitter
        ] = await Promise.all([
          loadQuerySource(),
          this._languagesCache.get(arg.languageId).promise,
          this._treeSitterImport.value
        ]);
        if (querySource === void 0) {
          return null;
        }
        const Query3 = treeSitter.Query;
        return new Query3(language2, querySource);
      }).resolvedValue;
    });
  }
  supportsLanguage(languageId, reader) {
    return this._supportsLanguage.get(languageId).read(reader);
  }
  async getParserClass() {
    const treeSitter = await this._treeSitterImport.value;
    return treeSitter.Parser;
  }
  getLanguage(languageId, ignoreSupportsCheck, reader) {
    if (!ignoreSupportsCheck && !this.supportsLanguage(languageId, reader)) {
      return void 0;
    }
    const lang = this._languagesCache.get(languageId).resolvedValue.read(reader);
    return lang;
  }
  async getLanguagePromise(languageId) {
    return this._languagesCache.get(languageId).promise;
  }
  getInjectionQueries(languageId, reader) {
    if (!this.supportsLanguage(languageId, reader)) {
      return void 0;
    }
    const query = this._injectionQueries.get({ languageId, kind: "injections" }).read(reader);
    return query;
  }
  getHighlightingQueries(languageId, reader) {
    if (!this.supportsLanguage(languageId, reader)) {
      return void 0;
    }
    const query = this._injectionQueries.get({ languageId, kind: "highlights" }).read(reader);
    return query;
  }
  async createQuery(language2, querySource) {
    const treeSitter = await this._treeSitterImport.value;
    return new treeSitter.Query(language2, querySource);
  }
};

TreeSitterLibraryService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IEnvironmentService)
], TreeSitterLibraryService);

async function tryReadFile(fileService, uri4) {
  try {
    const result = await fileService.readFile(uri4);
    return result;
  } catch (e4) {
    if (toFileOperationResult(e4) === 1 /* FILE_NOT_FOUND */) {
      return void 0;
    }
    throw e4;
  }
}
export { getModuleLocation, tryReadFile, EDITOR_EXPERIMENTAL_PREFER_TREESITTER, MODULE_LOCATION_SUBPATH, FILENAME_TREESITTER_WASM, TreeSitterLibraryService };
