// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/contrib/chat/common/tools/languageModelToolsService.ts
import { localize } from "./module-0015.mjs";
import { URI } from "./module-0023.mjs";
import { createDecorator } from "./module-0038.mjs";


// src/vs/workbench/contrib/chat/common/tools/languageModelToolsService.ts
var ToolDataSource;

((ToolDataSource3) => {
  ToolDataSource3.Internal = { type: "internal", label: "Built-In" };
  ToolDataSource3.External = { type: "external", label: "External" };
  function toKey(source) {
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
  ToolDataSource3.toKey = toKey;
  function equals5(a, b) {
    return toKey(a) === toKey(b);
  }
  ToolDataSource3.equals = equals5;
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
  ToolDataSource3.classify = classify;
})(ToolDataSource || (ToolDataSource = {}));

function isToolInvocationContext(obj) {
  return obj !== null && typeof obj === "object" && URI.isUri(obj.sessionResource);
}

function isToolResultInputOutputDetails(obj) {
  return typeof obj === "object" && typeof obj?.input === "string" && (typeof obj?.output === "string" || Array.isArray(obj?.output));
}

function isToolResultOutputDetails(obj) {
  return typeof obj === "object" && typeof obj?.output === "object" && typeof obj?.output?.mimeType === "string" && obj?.output?.type === "data";
}

function isToolSet(obj) {
  return !!obj && obj.getTools !== void 0;
}

var ILanguageModelToolsService = createDecorator("ILanguageModelToolsService");

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
export { isToolInvocationContext, isToolResultInputOutputDetails, isToolResultOutputDetails, isToolSet, ToolDataSource, ILanguageModelToolsService, SpecedToolAliases, VSCodeToolReference };
