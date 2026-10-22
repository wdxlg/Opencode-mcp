// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/services/editor/common/editorResolverService.ts
import { createDecorator } from "./module-0038.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions2 } from "./module-0135.mjs";
import { workbenchConfigurationNodeBase } from "./module-0417.mjs";
import { localize } from "./module-0015.mjs";
import { Schemas } from "./module-0031.mjs";
import { posix } from "./module-0022.mjs";
import { basename2 } from "./module-0032.mjs";
import { match } from "./module-0179.mjs";


// src/vs/workbench/services/editor/common/editorResolverService.ts
var IEditorResolverService = createDecorator("editorResolverService");

var editorsAssociationsSettingId = "workbench.editorAssociations";

var diffEditorsAssociationsSettingId = "workbench.diffEditorAssociations";

var hiddenEditorTypesSettingId = "workbench.editor.hiddenEditorTypes";

var markdownDefaultEditorAgentsWindowSettingId = "workbench.editor.markdownDefaultEditorInAgentsWindow";

function editorsAssociationsAgentsWindowDefault(options2) {
  return {
    "*.md": options2?.markdownDefaultEditor === true ? "vscode.markdown.editor" : "vscode.markdown.preview.editor"
  };
}

function diffEditorsAssociationsAgentsWindowDefault(options2) {
  return editorsAssociationsAgentsWindowDefault(options2);
}

var configurationRegistry3 = Registry.as(Extensions2.Configuration);

var editorAssociationsConfigurationNode = {
  ...workbenchConfigurationNodeBase,
  properties: {
    [markdownDefaultEditorAgentsWindowSettingId]: {
      type: "boolean",
      default: true,
      tags: ["experimental"],
      experiment: { mode: "startup" },
      markdownDescription: localize(22917, null)
    },
    [editorsAssociationsSettingId]: {
      type: "object",
      markdownDescription: localize(22915, null),
      additionalProperties: {
        type: "string"
      },
      agentsWindow: {
        default: editorsAssociationsAgentsWindowDefault()
      }
    },
    [diffEditorsAssociationsSettingId]: {
      type: "object",
      markdownDescription: localize(22914, null),
      additionalProperties: {
        type: "string"
      },
      agentsWindow: {
        default: diffEditorsAssociationsAgentsWindowDefault()
      }
    },
    [hiddenEditorTypesSettingId]: {
      type: "array",
      default: [],
      items: {
        type: "string"
      },
      markdownDescription: localize(22916, null),
      agentsWindow: {
        default: ["vscode.markdown.preview.editor"]
      }
    }
  }
};

configurationRegistry3.registerConfiguration(editorAssociationsConfigurationNode);

function globMatchesResource(globPattern, resource) {
  const excludedSchemes = /* @__PURE__ */ new Set([
    Schemas.extension,
    Schemas.webviewPanel,
    Schemas.vscodeWorkspaceTrust,
    Schemas.vscodeSettings
  ]);
  if (excludedSchemes.has(resource.scheme)) {
    return false;
  }
  const matchOnPath = typeof globPattern === "string" && globPattern.indexOf(posix.sep) >= 0;
  const target = matchOnPath ? `${resource.scheme}:${resource.path}` : basename2(resource);
  return match(globPattern, target, { ignoreCase: true });
}
export { editorsAssociationsAgentsWindowDefault, diffEditorsAssociationsAgentsWindowDefault, globMatchesResource, IEditorResolverService, editorsAssociationsSettingId, diffEditorsAssociationsSettingId, hiddenEditorTypesSettingId, markdownDefaultEditorAgentsWindowSettingId, configurationRegistry3, editorAssociationsConfigurationNode };
