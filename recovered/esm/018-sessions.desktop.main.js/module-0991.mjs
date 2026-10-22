// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/tools/languageModelToolsService.ts
import { localize } from "./module-0001.mjs";
import { ByteSize } from "./module-0269.mjs";
import { stringifyPromptElementJSON } from "./module-0990.mjs";
import { ObservableSet } from "./module-0066.mjs";
import { derived } from "./module-0054.mjs";
import { Iterable } from "./module-0011.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { createDecorator } from "./module-0077.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";


// src/vs/workbench/contrib/chat/common/tools/languageModelToolsService.ts
function toolMatchesModel(toolData, model) {
  if (!toolData.models || toolData.models.length === 0) {
    return true;
  }
  if (!model) {
    return true;
  }
  return toolData.models.some(
    (selector) => (!selector.id || selector.id === model.id) && (!selector.vendor || selector.vendor === model.vendor) && (!selector.family || selector.family === model.family) && (!selector.version || selector.version === model.version)
  );
}

var ToolDataSource;

((ToolDataSource4) => {
  ToolDataSource4.Internal = { type: "internal", label: "Built-In" };
  ToolDataSource4.External = { type: "external", label: "External" };
  function toKey3(source) {
    switch (source.type) {
      case "extension":
        return `extension:${source.extensionId.value}`;
      case "mcp":
        return `mcp:${source.collectionId}:${source.definitionId}`;
      case "user":
        return `user:${source.file.toString()}`;
      case "internal":
        return "internal";
      case "external":
        return "external";
    }
  }
  ToolDataSource4.toKey = toKey3;
  function equals5(a, b) {
    return toKey3(a) === toKey3(b);
  }
  ToolDataSource4.equals = equals5;
  function classify(source) {
    if (source.type === "internal") {
      return { ordinal: 1, label: localize(13479, null) };
    } else if (source.type === "mcp") {
      return { ordinal: 2, label: source.serverLabel || source.label };
    } else if (source.type === "user") {
      return { ordinal: 0, label: localize(13481, null) };
    } else {
      return { ordinal: 3, label: source.label };
    }
  }
  ToolDataSource4.classify = classify;
})(ToolDataSource || (ToolDataSource = {}));

function isToolResultInputOutputDetails(obj) {
  return typeof obj === "object" && typeof obj?.input === "string" && (typeof obj?.output === "string" || Array.isArray(obj?.output));
}

function isToolResultOutputDetails(obj) {
  return typeof obj === "object" && typeof obj?.output === "object" && typeof obj?.output?.mimeType === "string" && obj?.output?.type === "data";
}

function toolContentToA11yString(part) {
  return part.map((p) => {
    switch (p.kind) {
      case "promptTsx":
        return stringifyPromptTsxPart(p);
      case "text":
        return p.value;
      case "data":
        return localize(13480, null, ByteSize.formatSize(p.value.data.byteLength), p.value.mimeType || "unknown");
    }
  }).join(", ");
}

function toolResultHasBuffers(result) {
  return result.content.some((part) => part.kind === "data");
}

function stringifyPromptTsxPart(part) {
  return stringifyPromptElementJSON(part.value);
}

var ToolAndToolSetEnablementMap = class _ToolAndToolSetEnablementMap {
  constructor(_map) {
    this._map = _map;
  }
  static fromEntries(entries2) {
    return new _ToolAndToolSetEnablementMap(new Map(entries2));
  }
  static fromMap(map) {
    return new _ToolAndToolSetEnablementMap(new Map(map));
  }
  [Symbol.iterator]() {
    return this._map[Symbol.iterator]();
  }
  get(toolOrToolSet) {
    return this._map.get(toolOrToolSet);
  }
  has(toolOrToolSet) {
    return this._map.has(toolOrToolSet);
  }
  get size() {
    return this._map.size;
  }
  entries() {
    return this._map.entries();
  }
};

function isToolSet(obj) {
  return !!obj && obj.getTools !== void 0;
}

var ToolSet = class {
  constructor(id2, referenceName, icon2, source, description, detail2, legacyFullNames, deprecated, hiddenInToolsPicker, _contextKeyService) {
    this.id = id2;
    this.referenceName = referenceName;
    this.icon = icon2;
    this.source = source;
    this.description = description;
    this.detail = detail2;
    this.legacyFullNames = legacyFullNames;
    this.deprecated = deprecated;
    this.hiddenInToolsPicker = hiddenInToolsPicker;
    this._contextKeyService = _contextKeyService;
    this._tools = new ObservableSet();
    this._toolSets = new ObservableSet();
    this.isHomogenous = derived((r2) => {
      return !Iterable.some(this._tools.observable.read(r2), (tool) => !ToolDataSource.equals(tool.source, this.source)) && !Iterable.some(this._toolSets.observable.read(r2), (toolSet) => !ToolDataSource.equals(toolSet.source, this.source));
    });
  }
  addTool(data, tx) {
    this._tools.add(data, tx);
    return toDisposable(() => {
      this._tools.delete(data);
    });
  }
  addToolSet(toolSet, tx) {
    if (toolSet === this) {
      return Disposable.None;
    }
    this._toolSets.add(toolSet, tx);
    return toDisposable(() => {
      this._toolSets.delete(toolSet);
    });
  }
  getTools(r2) {
    return Iterable.concat(
      Iterable.filter(this._tools.observable.read(r2), (toolData) => this._contextKeyService.contextMatchesRules(toolData.when)),
      ...Iterable.map(this._toolSets.observable.read(r2), (toolSet) => toolSet.getTools(r2))
    );
  }
};

var ToolSetForModel = class {
  constructor(_toolSet, model, toolFilter) {
    this._toolSet = _toolSet;
    this.model = model;
    this.toolFilter = toolFilter;
  }
  get id() {
    return this._toolSet.id;
  }
  get referenceName() {
    return this._toolSet.referenceName;
  }
  get icon() {
    return this._toolSet.icon;
  }
  get source() {
    return this._toolSet.source;
  }
  get description() {
    return this._toolSet.description;
  }
  get detail() {
    return this._toolSet.detail;
  }
  get legacyFullNames() {
    return this._toolSet.legacyFullNames;
  }
  get deprecated() {
    return this._toolSet.deprecated;
  }
  get hiddenInToolsPicker() {
    return this._toolSet.hiddenInToolsPicker;
  }
  getTools(r2) {
    return Iterable.filter(this._toolSet.getTools(r2), (toolData) => toolMatchesModel(toolData, this.model) && (!this.toolFilter || this.toolFilter(toolData)));
  }
};

var ILanguageModelToolsService = createDecorator("ILanguageModelToolsService");

function createToolSchemaUri(toolOrId) {
  if (typeof toolOrId !== "string") {
    toolOrId = toolOrId.id;
  }
  return URI.from({ scheme: Schemas.vscode, authority: "schemas", path: `/lm/tool/${toolOrId}` });
}

var SpecedToolAliases;

((SpecedToolAliases2) => {
  SpecedToolAliases2.execute = "execute";
  SpecedToolAliases2.edit = "edit";
  SpecedToolAliases2.search = "search";
  SpecedToolAliases2.agent = "agent";
  SpecedToolAliases2.read = "read";
  SpecedToolAliases2.web = "web";
  SpecedToolAliases2.todo = "todo";
})(SpecedToolAliases || (SpecedToolAliases = {}));

var VSCodeToolReference;

((VSCodeToolReference2) => {
  VSCodeToolReference2.runSubagent = "runSubagent";
  VSCodeToolReference2.vscode = "vscode";
})(VSCodeToolReference || (VSCodeToolReference = {}));
export { toolMatchesModel, isToolResultInputOutputDetails, isToolResultOutputDetails, toolContentToA11yString, toolResultHasBuffers, stringifyPromptTsxPart, isToolSet, createToolSchemaUri, ToolDataSource, ToolAndToolSetEnablementMap, ToolSet, ToolSetForModel, ILanguageModelToolsService, SpecedToolAliases, VSCodeToolReference };
