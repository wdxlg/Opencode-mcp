// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostLanguages.ts
import { Emitter } from "./module-0019.mjs";
import { MainContext } from "./module-0025.mjs";
import { DocumentSelector, Position3, Range3, TokenType2 } from "./module-0239.mjs";
import { Range2 } from "./module-0227.mjs";
import { DisposableStore } from "./module-0011.mjs";
import { disposableTimeout } from "./module-0034.mjs";
import { severity_default } from "./module-0058.mjs";
import { checkProposedApiEnabled } from "./module-0167.mjs";


// src/vs/workbench/api/common/extHostLanguages.ts
var ExtHostLanguages = class {
  constructor(mainContext, _documents, _commands, _uriTransformer) {
    this._documents = _documents;
    this._commands = _commands;
    this._uriTransformer = _uriTransformer;
    this._languageIds = [];
    this._onDidChangeSyntaxHighlighting = new Emitter();
    this.onDidChangeSyntaxHighlighting = this._onDidChangeSyntaxHighlighting.event;
    this._handlePool = 0;
    this._ids = /* @__PURE__ */ new Set();
    this._proxy = mainContext.getProxy(MainContext.MainThreadLanguages);
  }
  $acceptLanguageIds(ids) {
    this._languageIds = ids;
  }
  $acceptSyntaxHighlightingThemeChanged() {
    this._onDidChangeSyntaxHighlighting.fire();
  }
  async computeFullSyntaxHighlighting(source, languageId) {
    const result = await this._proxy.$computeFullSyntaxHighlighting(source, languageId);
    return result;
  }
  async getLanguages() {
    return this._languageIds.slice(0);
  }
  async changeLanguage(uri2, languageId) {
    await this._proxy.$changeLanguage(uri2, languageId);
    const data2 = this._documents.getDocumentData(uri2);
    if (!data2) {
      throw new Error(`document '${uri2.toString()}' NOT found`);
    }
    return data2.document;
  }
  async tokenAtPosition(document2, position) {
    const versionNow = document2.version;
    const pos = Position3.from(position);
    const info = await this._proxy.$tokensAtPosition(document2.uri, pos);
    const defaultRange = {
      type: 0 /* Other */,
      range: document2.getWordRangeAtPosition(position) ?? new Range2(position.line, position.character, position.line, position.character)
    };
    if (!info) {
      return defaultRange;
    }
    const result = {
      range: Range3.to(info.range),
      type: TokenType2.to(info.type)
    };
    if (!result.range.contains(position)) {
      return defaultRange;
    }
    if (versionNow !== document2.version) {
      return defaultRange;
    }
    return result;
  }
  createLanguageStatusItem(extension, id2, selector) {
    const handle = this._handlePool++;
    const proxy = this._proxy;
    const ids = this._ids;
    const fullyQualifiedId = `${extension.identifier.value}/${id2}`;
    if (ids.has(fullyQualifiedId)) {
      throw new Error(`LanguageStatusItem with id '${id2}' ALREADY exists`);
    }
    ids.add(fullyQualifiedId);
    const data2 = {
      selector,
      id: id2,
      name: extension.displayName ?? extension.name,
      severity: 0 /* Information */,
      command: void 0,
      text: "",
      detail: "",
      busy: false
    };
    let soonHandle;
    const commandDisposables = new DisposableStore();
    const updateAsync = () => {
      soonHandle?.dispose();
      if (!ids.has(fullyQualifiedId)) {
        console.warn(`LanguageStatusItem (${id2}) from ${extension.identifier.value} has been disposed and CANNOT be updated anymore`);
        return;
      }
      soonHandle = disposableTimeout(() => {
        commandDisposables.clear();
        this._proxy.$setLanguageStatus(handle, {
          id: fullyQualifiedId,
          name: data2.name ?? extension.displayName ?? extension.name,
          source: extension.displayName ?? extension.name,
          selector: DocumentSelector.from(data2.selector, this._uriTransformer),
          label: data2.text,
          detail: data2.detail ?? "",
          severity: data2.severity === 2 /* Error */ ? severity_default.Error : data2.severity === 1 /* Warning */ ? severity_default.Warning : severity_default.Info,
          command: data2.command && this._commands.toInternal(data2.command, commandDisposables),
          accessibilityInfo: data2.accessibilityInformation,
          busy: data2.busy
        });
      }, 0);
    };
    const result = {
      dispose() {
        commandDisposables.dispose();
        soonHandle?.dispose();
        proxy.$removeLanguageStatus(handle);
        ids.delete(fullyQualifiedId);
      },
      get id() {
        return data2.id;
      },
      get name() {
        return data2.name;
      },
      set name(value) {
        data2.name = value;
        updateAsync();
      },
      get selector() {
        return data2.selector;
      },
      set selector(value) {
        data2.selector = value;
        updateAsync();
      },
      get text() {
        return data2.text;
      },
      set text(value) {
        data2.text = value;
        updateAsync();
      },
      set text2(value) {
        checkProposedApiEnabled(extension, "languageStatusText");
        data2.text = value;
        updateAsync();
      },
      get text2() {
        checkProposedApiEnabled(extension, "languageStatusText");
        return data2.text;
      },
      get detail() {
        return data2.detail;
      },
      set detail(value) {
        data2.detail = value;
        updateAsync();
      },
      get severity() {
        return data2.severity;
      },
      set severity(value) {
        data2.severity = value;
        updateAsync();
      },
      get accessibilityInformation() {
        return data2.accessibilityInformation;
      },
      set accessibilityInformation(value) {
        data2.accessibilityInformation = value;
        updateAsync();
      },
      get command() {
        return data2.command;
      },
      set command(value) {
        data2.command = value;
        updateAsync();
      },
      get busy() {
        return data2.busy;
      },
      set busy(value) {
        data2.busy = value;
        updateAsync();
      }
    };
    updateAsync();
    return result;
  }
};
export { ExtHostLanguages };
