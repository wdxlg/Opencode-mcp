// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/editor/common/editorResolverService.ts
import { createDecorator } from "./module-0077.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { workbenchConfigurationNodeBase } from "./module-1112.mjs";
import { localize } from "./module-0001.mjs";
import { Schemas } from "./module-0033.mjs";
import { posix } from "./module-0026.mjs";
import { basename2 } from "./module-0034.mjs";
import { match } from "./module-0857.mjs";


// src/vs/workbench/services/editor/common/editorResolverService.ts
var IEditorResolverService = createDecorator("editorResolverService");

var editorsAssociationsSettingId = "workbench.editorAssociations";

var diffEditorsAssociationsSettingId = "workbench.diffEditorAssociations";

var hiddenEditorTypesSettingId = "workbench.editor.hiddenEditorTypes";

var markdownDefaultEditorAgentsWindowSettingId = "workbench.editor.markdownDefaultEditorInAgentsWindow";

function editorsAssociationsAgentsWindowDefault(options3) {
  return {
    "*.md": options3?.markdownDefaultEditor === true ? "vscode.markdown.editor" : "vscode.markdown.preview.editor"
  };
}

function diffEditorsAssociationsAgentsWindowDefault(options3) {
  return editorsAssociationsAgentsWindowDefault(options3);
}

var configurationRegistry5 = Registry.as(Extensions4.Configuration);

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

configurationRegistry5.registerConfiguration(editorAssociationsConfigurationNode);

function toRegisteredEditorPriorityInfo(priority) {
  if (typeof priority !== "string") {
    return {
      editor: priority.editor,
      diff: priority.diff,
      merge: priority.merge ?? priority.editor
    };
  }
  return {
    editor: priority,
    diff: priority,
    merge: priority
  };
}

function priorityToRank(priority) {
  switch (priority) {
    case "exclusive" /* exclusive */:
      return 5;
    case "default" /* default */:
      return 4;
    case "builtin" /* builtin */:
      return 3;
    // Text editor is priority 2
    case "option" /* option */:
      return 1;
    case "explicit" /* explicit */:
      return 0;
    default:
      return 1;
  }
}

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
export { editorsAssociationsAgentsWindowDefault, diffEditorsAssociationsAgentsWindowDefault, toRegisteredEditorPriorityInfo, priorityToRank, globMatchesResource, IEditorResolverService, editorsAssociationsSettingId, diffEditorsAssociationsSettingId, hiddenEditorTypesSettingId, markdownDefaultEditorAgentsWindowSettingId, configurationRegistry5, editorAssociationsConfigurationNode };
