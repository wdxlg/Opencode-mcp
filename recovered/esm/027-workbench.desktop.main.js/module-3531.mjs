// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/snippets/browser/snippets.contribution.ts
import { registerAction2 } from "./module-0092.mjs";
import { InsertSnippetAction } from "./module-3528.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { SurroundWithSnippetEditorAction } from "./module-3529.mjs";
import { ApplyFileSnippetAction } from "./module-3526.mjs";
import { ConfigureSnippetsAction } from "./module-3525.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0870.mjs";
import { SnippetCodeActions } from "./module-3530.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { editorConfigurationBaseNode } from "./module-0557.mjs";
import { localize } from "./module-0001.mjs";
import { Extensions3 } from "./module-0138.mjs";


// src/vs/workbench/contrib/snippets/browser/snippets.contribution.ts
registerAction2(InsertSnippetAction);

CommandsRegistry.registerCommandAlias("editor.action.showSnippets", "editor.action.insertSnippet");

registerAction2(SurroundWithSnippetEditorAction);

registerAction2(ApplyFileSnippetAction);

registerAction2(ConfigureSnippetsAction);

var workbenchContribRegistry = Registry.as(Extensions10.Workbench);

workbenchContribRegistry.registerWorkbenchContribution(SnippetCodeActions, 3 /* Restored */);

Registry.as(Extensions4.Configuration).registerConfiguration({
  ...editorConfigurationBaseNode,
  "properties": {
    "editor.snippets.codeActions.enabled": {
      "description": localize(19355, null),
      "type": "boolean",
      "default": true
    }
  }
});

var languageScopeSchemaId = "vscode://schemas/snippets";

var snippetSchemaProperties = {
  prefix: {
    description: localize(19363, null),
    type: ["string", "array"]
  },
  isFileTemplate: {
    description: localize(19362, null),
    type: "boolean"
  },
  body: {
    markdownDescription: localize(19357, null),
    type: ["string", "array"],
    items: {
      type: "string"
    }
  },
  description: {
    description: localize(19359, null),
    type: ["string", "array"]
  },
  include: {
    markdownDescription: localize(19361, null),
    type: ["string", "array"],
    items: {
      type: "string"
    }
  },
  exclude: {
    markdownDescription: localize(19360, null),
    type: ["string", "array"],
    items: {
      type: "string"
    }
  }
};

var languageScopeSchema = {
  id: languageScopeSchemaId,
  allowComments: true,
  allowTrailingCommas: true,
  defaultSnippets: [{
    label: localize(19358, null),
    body: { "${1:snippetName}": { "prefix": "${2:prefix}", "body": "${3:snippet}", "description": "${4:description}" } }
  }],
  type: "object",
  description: localize(19356, null),
  additionalProperties: {
    type: "object",
    required: ["body"],
    properties: snippetSchemaProperties,
    additionalProperties: false
  }
};

var globalSchemaId = "vscode://schemas/global-snippets";

var globalSchema = {
  id: globalSchemaId,
  allowComments: true,
  allowTrailingCommas: true,
  defaultSnippets: [{
    label: localize(19358, null),
    body: { "${1:snippetName}": { "scope": "${2:scope}", "prefix": "${3:prefix}", "body": "${4:snippet}", "description": "${5:description}" } }
  }],
  type: "object",
  description: localize(19356, null),
  additionalProperties: {
    type: "object",
    required: ["body"],
    properties: {
      ...snippetSchemaProperties,
      scope: {
        description: localize(19364, null),
        type: "string"
      }
    },
    additionalProperties: false
  }
};

var reg2 = Registry.as(Extensions3.JSONContribution);

reg2.registerSchema(languageScopeSchemaId, languageScopeSchema);

reg2.registerSchema(globalSchemaId, globalSchema);
export { workbenchContribRegistry, languageScopeSchemaId, snippetSchemaProperties, languageScopeSchema, globalSchemaId, globalSchema, reg2 };
