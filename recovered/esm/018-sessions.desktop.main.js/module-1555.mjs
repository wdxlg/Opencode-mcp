// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/editorConfiguration.ts
import { Disposable } from "./module-0012.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { localize } from "./module-0001.mjs";
import { IEditorResolverService, diffEditorsAssociationsAgentsWindowDefault, diffEditorsAssociationsSettingId, editorsAssociationsAgentsWindowDefault, editorsAssociationsSettingId, markdownDefaultEditorAgentsWindowSettingId, toRegisteredEditorPriorityInfo } from "./module-1114.mjs";
import { Event2 } from "./module-0017.mjs";
import { workbenchConfigurationNodeBase } from "./module-1113.mjs";
import { ByteSize, getLargeFileConfirmationLimit } from "./module-0269.mjs";
import { coalesce } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/browser/parts/editor/editorConfiguration.ts
var DynamicEditorConfigurations = class extends Disposable {
  constructor(editorResolverService, extensionService, environmentService, configurationService) {
    super();
    this.editorResolverService = editorResolverService;
    this.environmentService = environmentService;
    this.configurationService = configurationService;
    this.configurationRegistry = Registry.as(Extensions4.Configuration);
    (async () => {
      await extensionService.whenInstalledExtensionsRegistered();
      this.updateDynamicEditorConfigurations();
      this.registerListeners();
    })();
  }
  static {
    this.ID = "workbench.contrib.dynamicEditorConfigurations";
  }
  static {
    this.AUTO_LOCK_DEFAULT_ENABLED = /* @__PURE__ */ new Set([
      "terminalEditor",
      "mainThreadWebview-simpleBrowser.view",
      "mainThreadWebview-browserPreview",
      "workbench.editor.processExplorer"
    ]);
  }
  static {
    this.AUTO_LOCK_EXTRA_EDITORS = [
      // List some editor input identifiers that are not
      // registered yet via the editor resolver infrastructure
      {
        id: "workbench.input.interactive",
        label: localize(6640, null),
        priority: toRegisteredEditorPriorityInfo("builtin" /* builtin */)
      },
      {
        id: "mainThreadWebview-markdown.preview",
        label: localize(6642, null),
        priority: toRegisteredEditorPriorityInfo("builtin" /* builtin */)
      },
      {
        id: "mainThreadWebview-simpleBrowser.view",
        label: localize(6643, null),
        priority: toRegisteredEditorPriorityInfo("builtin" /* builtin */)
      },
      {
        id: "mainThreadWebview-browserPreview",
        label: localize(6641, null),
        priority: toRegisteredEditorPriorityInfo("builtin" /* builtin */)
      }
    ];
  }
  static {
    this.AUTO_LOCK_REMOVE_EDITORS = /* @__PURE__ */ new Set([
      // List some editor types that the above `AUTO_LOCK_EXTRA_EDITORS`
      // already covers to avoid duplicates.
      "vscode-interactive-input",
      "interactive",
      "vscode.markdown.preview.editor"
    ]);
  }
  registerListeners() {
    this._register(Event2.debounce(this.editorResolverService.onDidChangeEditorRegistrations, (_, e4) => e4)(() => this.updateDynamicEditorConfigurations()));
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(markdownDefaultEditorAgentsWindowSettingId)) {
        this.updateDynamicEditorConfigurations();
      }
    }));
  }
  updateDynamicEditorConfigurations() {
    const lockableEditors = [...this.editorResolverService.getEditors(), ...DynamicEditorConfigurations.AUTO_LOCK_EXTRA_EDITORS].filter((e4) => !DynamicEditorConfigurations.AUTO_LOCK_REMOVE_EDITORS.has(e4.id));
    const binaryEditorCandidates = this.editorResolverService.getEditors({ excludeExclusiveEditors: true }).map((e4) => e4.id);
    const autoLockGroupConfiguration = /* @__PURE__ */ Object.create(null);
    for (const editor of lockableEditors) {
      autoLockGroupConfiguration[editor.id] = {
        type: "boolean",
        default: DynamicEditorConfigurations.AUTO_LOCK_DEFAULT_ENABLED.has(editor.id),
        description: editor.label
      };
    }
    const defaultAutoLockGroupConfiguration = /* @__PURE__ */ Object.create(null);
    for (const editor of lockableEditors) {
      defaultAutoLockGroupConfiguration[editor.id] = DynamicEditorConfigurations.AUTO_LOCK_DEFAULT_ENABLED.has(editor.id);
    }
    const oldAutoLockConfigurationNode = this.autoLockConfigurationNode;
    this.autoLockConfigurationNode = {
      ...workbenchConfigurationNodeBase,
      properties: {
        "workbench.editor.autoLockGroups": {
          type: "object",
          description: localize(6644, null),
          properties: autoLockGroupConfiguration,
          default: defaultAutoLockGroupConfiguration,
          additionalProperties: false
        }
      }
    };
    const oldDefaultBinaryEditorConfigurationNode = this.defaultBinaryEditorConfigurationNode;
    this.defaultBinaryEditorConfigurationNode = {
      ...workbenchConfigurationNodeBase,
      properties: {
        "workbench.editor.defaultBinaryEditor": {
          type: "string",
          default: "",
          // This allows for intellisense autocompletion
          enum: [...binaryEditorCandidates, ""],
          description: localize(6645, null)
        }
      }
    };
    const oldEditorAssociationsConfigurationNode = this.editorAssociationsConfigurationNode;
    const markdownDefaultEditorEnabled = this.configurationService.getValue(markdownDefaultEditorAgentsWindowSettingId) === true;
    this.editorAssociationsConfigurationNode = {
      ...workbenchConfigurationNodeBase,
      properties: {
        [editorsAssociationsSettingId]: {
          type: "object",
          markdownDescription: localize(6638, null),
          patternProperties: {
            ".*": {
              type: "string",
              enum: binaryEditorCandidates
            }
          },
          agentsWindow: {
            default: editorsAssociationsAgentsWindowDefault({ markdownDefaultEditor: markdownDefaultEditorEnabled })
          }
        }
      }
    };
    const oldDiffEditorAssociationsConfigurationNode = this.diffEditorAssociationsConfigurationNode;
    this.diffEditorAssociationsConfigurationNode = {
      ...workbenchConfigurationNodeBase,
      properties: {
        [diffEditorsAssociationsSettingId]: {
          type: "object",
          markdownDescription: localize(6637, null),
          patternProperties: {
            ".*": {
              type: "string",
              enum: binaryEditorCandidates
            }
          },
          agentsWindow: {
            default: diffEditorsAssociationsAgentsWindowDefault({ markdownDefaultEditor: markdownDefaultEditorEnabled })
          }
        }
      }
    };
    const oldEditorLargeFileConfirmationConfigurationNode = this.editorLargeFileConfirmationConfigurationNode;
    this.editorLargeFileConfirmationConfigurationNode = {
      ...workbenchConfigurationNodeBase,
      properties: {
        "workbench.editorLargeFileConfirmation": {
          type: "number",
          default: getLargeFileConfirmationLimit(this.environmentService.remoteAuthority) / ByteSize.MB,
          minimum: 1,
          scope: 5 /* RESOURCE */,
          markdownDescription: localize(6639, null)
        }
      }
    };
    this.configurationRegistry.updateConfigurations({
      add: [
        this.autoLockConfigurationNode,
        this.defaultBinaryEditorConfigurationNode,
        this.editorAssociationsConfigurationNode,
        this.diffEditorAssociationsConfigurationNode,
        this.editorLargeFileConfirmationConfigurationNode
      ],
      remove: coalesce([
        oldAutoLockConfigurationNode,
        oldDefaultBinaryEditorConfigurationNode,
        oldEditorAssociationsConfigurationNode,
        oldDiffEditorAssociationsConfigurationNode,
        oldEditorLargeFileConfirmationConfigurationNode
      ])
    });
  }
};

DynamicEditorConfigurations = __decorateClass([
  __decorateParam(0, IEditorResolverService),
  __decorateParam(1, IExtensionService),
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, IConfigurationService)
], DynamicEditorConfigurations);
export { DynamicEditorConfigurations };
