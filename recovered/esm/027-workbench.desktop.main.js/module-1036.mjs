// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/tools/languageModelToolsContribution.ts
import { ExtensionsRegistry } from "./module-0876.mjs";
import { localize } from "./module-0001.mjs";
import { toolsParametersSchemaSchemaId } from "./module-1035.mjs";
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { isProposedApiEnabled } from "./module-0887.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { joinPath } from "./module-0034.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { ILanguageModelToolsService, ToolDataSource } from "./module-0990.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { isFalsyOrEmpty } from "./module-0007.mjs";
import { Codicon } from "./module-0085.mjs";
import { transaction } from "./module-0045.mjs";
import { isFalsyOrWhitespace } from "./module-0030.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0873.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions11 } from "./module-0877.mjs";
import { SyncDescriptor } from "./module-0134.mjs";


// src/vs/workbench/contrib/chat/common/tools/languageModelToolsContribution.ts
var languageModelToolsExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "languageModelTools",
  activationEventsGenerator: function* (contributions) {
    for (const contrib of contributions) {
      yield `onLanguageModelTool:${contrib.name}`;
    }
  },
  jsonSchema: {
    description: localize(13477, null),
    type: "array",
    items: {
      additionalProperties: false,
      type: "object",
      defaultSnippets: [{
        body: {
          name: "${1}",
          modelDescription: "${2}",
          inputSchema: {
            type: "object",
            properties: {
              "${3:name}": {
                type: "string",
                description: "${4:description}"
              }
            }
          }
        }
      }],
      required: ["name", "displayName", "modelDescription"],
      properties: {
        name: {
          description: localize(13465, null),
          type: "string",
          // [\\w-]+ is OpenAI's requirement for tool names
          pattern: "^(?!copilot_|vscode_)[\\w-]+$"
        },
        toolReferenceName: {
          markdownDescription: localize(13466, null, "`canBeReferencedInPrompt`"),
          type: "string",
          pattern: "^[\\w-]+$"
        },
        displayName: {
          description: localize(13463, null),
          type: "string"
        },
        userDescription: {
          description: localize(13476, null),
          type: "string"
        },
        // eslint-disable-next-line local/code-no-localized-model-description
        modelDescription: {
          description: localize(13464, null),
          type: "string"
        },
        inputSchema: {
          description: localize(13461, null),
          $ref: toolsParametersSchemaSchemaId
        },
        canBeReferencedInPrompt: {
          markdownDescription: localize(13452, null, "`ChatRequest#toolReferences`"),
          type: "boolean"
        },
        icon: {
          markdownDescription: localize(13455, null),
          anyOf: [
            {
              type: "string"
            },
            {
              type: "object",
              properties: {
                light: {
                  description: localize(13457, null),
                  type: "string"
                },
                dark: {
                  description: localize(13456, null),
                  type: "string"
                }
              }
            }
          ]
        },
        when: {
          markdownDescription: localize(13453, null),
          type: "string"
        },
        tags: {
          description: localize(13475, null),
          type: "array",
          items: {
            type: "string",
            pattern: "^(?!copilot_|vscode_)"
          }
        }
      }
    }
  }
});

var languageModelToolSetsExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "languageModelToolSets",
  deps: [languageModelToolsExtensionPoint],
  jsonSchema: {
    description: localize(13478, null),
    type: "array",
    items: {
      additionalProperties: false,
      type: "object",
      defaultSnippets: [{
        body: {
          name: "${1}",
          description: "${2}",
          tools: ["${3}"]
        }
      }],
      required: ["name", "description", "tools"],
      properties: {
        name: {
          description: localize(13470, null),
          type: "string",
          pattern: "^[\\w-]+$"
        },
        description: {
          description: localize(13468, null),
          type: "string"
        },
        icon: {
          markdownDescription: localize(13469, null, "`$(zap)`"),
          type: "string"
        },
        tools: {
          markdownDescription: localize(13471, null),
          type: "array",
          minItems: 1,
          items: {
            type: "string"
          }
        }
      }
    }
  }
});

function toToolKey(extensionIdentifier, toolName) {
  return `${extensionIdentifier.value}/${toolName}`;
}

function toToolSetKey(extensionIdentifier, toolName) {
  return `toolset:${extensionIdentifier.value}/${toolName}`;
}

function toSyntheticToolSetKey(extensionIdentifier) {
  return `synthetic-toolset:${extensionIdentifier.value}`;
}

var LanguageModelToolsExtensionPointHandler = class {
  constructor(productService, languageModelToolsService) {
    this._registrationDisposables = new DisposableMap();
    languageModelToolsExtensionPoint.setHandler((_extensions, delta2) => {
      for (const extension of delta2.added) {
        const successfullyRegisteredTools = [];
        let extensionSource;
        for (const rawTool of extension.value) {
          if (!rawTool.name || !rawTool.modelDescription || !rawTool.displayName) {
            extension.collector.error(`Extension '${extension.description.identifier.value}' CANNOT register tool without name, modelDescription, and displayName: ${JSON.stringify(rawTool)}`);
            continue;
          }
          if (!rawTool.name.match(/^[\w-]+$/)) {
            extension.collector.error(`Extension '${extension.description.identifier.value}' CANNOT register tool with invalid id: ${rawTool.name}. The id must match /^[\\w-]+$/.`);
            continue;
          }
          if (rawTool.canBeReferencedInPrompt && !rawTool.toolReferenceName) {
            extension.collector.error(`Extension '${extension.description.identifier.value}' CANNOT register tool with 'canBeReferencedInPrompt' set without a 'toolReferenceName': ${JSON.stringify(rawTool)}`);
            continue;
          }
          if ((rawTool.name.startsWith("copilot_") || rawTool.name.startsWith("vscode_")) && !isProposedApiEnabled(extension.description, "chatParticipantPrivate")) {
            extension.collector.error(`Extension '${extension.description.identifier.value}' CANNOT register tool with name starting with "vscode_" or "copilot_"`);
            continue;
          }
          if (rawTool.tags?.some((tag2) => tag2.startsWith("copilot_") || tag2.startsWith("vscode_")) && !isProposedApiEnabled(extension.description, "chatParticipantPrivate")) {
            extension.collector.error(`Extension '${extension.description.identifier.value}' CANNOT register tool with tags starting with "vscode_" or "copilot_"`);
          }
          if (rawTool.legacyToolReferenceFullNames && !isProposedApiEnabled(extension.description, "chatParticipantPrivate")) {
            extension.collector.error(`Extension '${extension.description.identifier.value}' CANNOT use 'legacyToolReferenceFullNames' without the 'chatParticipantPrivate' API proposal enabled`);
            continue;
          }
          const rawIcon = rawTool.icon;
          let icon2;
          if (typeof rawIcon === "string") {
            icon2 = ThemeIcon.fromString(rawIcon) ?? {
              dark: joinPath(extension.description.extensionLocation, rawIcon),
              light: joinPath(extension.description.extensionLocation, rawIcon)
            };
          } else if (rawIcon) {
            icon2 = {
              dark: joinPath(extension.description.extensionLocation, rawIcon.dark),
              light: joinPath(extension.description.extensionLocation, rawIcon.light)
            };
          }
          const isBuiltinTool = productService.defaultChatAgent?.chatExtensionId ? ExtensionIdentifier.equals(extension.description.identifier, productService.defaultChatAgent.chatExtensionId) : isProposedApiEnabled(extension.description, "chatParticipantPrivate");
          const source = isBuiltinTool ? ToolDataSource.Internal : { type: "extension", label: extension.description.displayName ?? extension.description.name, extensionId: extension.description.identifier };
          const tool = {
            ...rawTool,
            source,
            inputSchema: rawTool.inputSchema,
            id: rawTool.name,
            icon: icon2,
            when: rawTool.when ? ContextKeyExpr.deserialize(rawTool.when) : void 0,
            alwaysDisplayInputOutput: !isBuiltinTool
          };
          try {
            const disposable = languageModelToolsService.registerToolData(tool);
            this._registrationDisposables.set(toToolKey(extension.description.identifier, rawTool.name), disposable);
            successfullyRegisteredTools.push(tool);
            extensionSource ??= source;
          } catch (e) {
            extension.collector.error(`Failed to register tool '${rawTool.name}': ${e}`);
          }
        }
        const hasOwnToolSets = !isFalsyOrEmpty(extension.description.contributes?.languageModelToolSets);
        if (!hasOwnToolSets && extensionSource?.type === "extension" && successfullyRegisteredTools.length > 0) {
          const syntheticKey = toSyntheticToolSetKey(extension.description.identifier);
          const toolSet = languageModelToolsService.createToolSet(
            extensionSource,
            syntheticKey,
            extension.description.identifier.value,
            {
              icon: Codicon.extensions,
              description: extension.description.displayName ?? extension.description.name,
              hiddenInToolsPicker: true
            }
          );
          const store = new DisposableStore();
          store.add(toolSet);
          transaction((tx) => {
            for (const t2 of successfullyRegisteredTools) {
              store.add(toolSet.addTool(t2, tx));
            }
          });
          this._registrationDisposables.set(syntheticKey, store);
        }
      }
      for (const extension of delta2.removed) {
        this._registrationDisposables.deleteAndDispose(toSyntheticToolSetKey(extension.description.identifier));
        for (const tool of extension.value) {
          this._registrationDisposables.deleteAndDispose(toToolKey(extension.description.identifier, tool.name));
        }
      }
    });
    languageModelToolSetsExtensionPoint.setHandler((_extensions, delta2) => {
      for (const extension of delta2.added) {
        if (!isProposedApiEnabled(extension.description, "contribLanguageModelToolSets")) {
          extension.collector.error(`Extension '${extension.description.identifier.value}' CANNOT register language model tools because the 'contribLanguageModelToolSets' API proposal is not enabled.`);
          continue;
        }
        const isBuiltinTool = productService.defaultChatAgent?.chatExtensionId ? ExtensionIdentifier.equals(extension.description.identifier, productService.defaultChatAgent.chatExtensionId) : isProposedApiEnabled(extension.description, "chatParticipantPrivate");
        const source = isBuiltinTool ? ToolDataSource.Internal : { type: "extension", label: extension.description.displayName ?? extension.description.name, extensionId: extension.description.identifier };
        for (const toolSet of extension.value) {
          if (isFalsyOrWhitespace(toolSet.name)) {
            extension.collector.error(`Tool set '${toolSet.name}' CANNOT have an empty name`);
            continue;
          }
          if (toolSet.legacyFullNames && !isProposedApiEnabled(extension.description, "contribLanguageModelToolSets")) {
            extension.collector.error(`Tool set '${toolSet.name}' CANNOT use 'legacyFullNames' without the 'contribLanguageModelToolSets' API proposal enabled`);
            continue;
          }
          if (isFalsyOrEmpty(toolSet.tools)) {
            extension.collector.error(`Tool set '${toolSet.name}' CANNOT have an empty tools array`);
            continue;
          }
          const tools = [];
          const toolSets = [];
          const missingToolNames = [];
          for (const toolName of toolSet.tools) {
            const toolObj = languageModelToolsService.getToolByName(toolName);
            if (toolObj) {
              tools.push(toolObj);
              continue;
            }
            const toolSetObj = languageModelToolsService.getToolSetByName(toolName);
            if (toolSetObj) {
              toolSets.push(toolSetObj);
              continue;
            }
            missingToolNames.push(toolName);
          }
          if (toolSets.length === 0 && tools.length === 0) {
            extension.collector.error(`Tool set '${toolSet.name}' CANNOT have an empty tools array (none of the tools were found)`);
            continue;
          }
          const store = new DisposableStore();
          const referenceName = toolSet.referenceName ?? toolSet.name;
          const existingToolSet = languageModelToolsService.getToolSetByName(referenceName);
          const mergeExisting = isBuiltinTool && existingToolSet?.source === ToolDataSource.Internal;
          let obj;
          if (mergeExisting) {
            obj = existingToolSet;
          } else {
            obj = languageModelToolsService.createToolSet(
              source,
              toToolSetKey(extension.description.identifier, toolSet.name),
              referenceName,
              {
                icon: toolSet.icon ? ThemeIcon.fromString(toolSet.icon) : void 0,
                description: toolSet.description,
                legacyFullNames: toolSet.legacyFullNames,
                // Built-in tool sets are deprecated and hidden from Chat Customizations → Tools; extension-contributed sets surface there.
                deprecated: source.type !== "extension"
              }
            );
          }
          transaction((tx) => {
            if (!mergeExisting) {
              store.add(obj);
            }
            tools.forEach((tool) => store.add(obj.addTool(tool, tx)));
            toolSets.forEach((toolSet2) => store.add(obj.addToolSet(toolSet2, tx)));
          });
          if (missingToolNames.length > 0) {
            const pending = new Set(missingToolNames);
            const listener = store.add(languageModelToolsService.onDidChangeTools(() => {
              for (const toolName of pending) {
                const toolObj = languageModelToolsService.getToolByName(toolName);
                if (toolObj) {
                  store.add(obj.addTool(toolObj));
                  pending.delete(toolName);
                } else {
                  const toolSetObj = languageModelToolsService.getToolSetByName(toolName);
                  if (toolSetObj) {
                    store.add(obj.addToolSet(toolSetObj));
                    pending.delete(toolName);
                  }
                }
              }
              if (pending.size === 0) {
                store.delete(listener);
              }
            }));
          }
          this._registrationDisposables.set(toToolSetKey(extension.description.identifier, toolSet.name), store);
        }
      }
      for (const extension of delta2.removed) {
        for (const toolSet of extension.value) {
          this._registrationDisposables.deleteAndDispose(toToolSetKey(extension.description.identifier, toolSet.name));
        }
      }
    });
  }
  static {
    this.ID = "workbench.contrib.toolsExtensionPointHandler";
  }
};

LanguageModelToolsExtensionPointHandler = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, ILanguageModelToolsService)
], LanguageModelToolsExtensionPointHandler);

var LanguageModelToolDataRenderer = class extends Disposable {
  constructor() {
    super(...arguments);
    this.type = "table";
  }
  shouldRender(manifest) {
    return !!manifest.contributes?.languageModelTools;
  }
  render(manifest) {
    const contribs = manifest.contributes?.languageModelTools ?? [];
    if (!contribs.length) {
      return { data: { headers: [], rows: [] }, dispose: () => {
      } };
    }
    const headers = [
      localize(13474, null),
      localize(13473, null),
      localize(13472, null)
    ];
    const rows = contribs.map((t2) => {
      return [
        new MarkdownString(`\`${t2.name}\``),
        t2.displayName,
        t2.userDescription ?? t2.modelDescription
      ];
    });
    return {
      data: {
        headers,
        rows
      },
      dispose: () => {
      }
    };
  }
};

Registry.as(Extensions11.ExtensionFeaturesRegistry).registerExtensionFeature({
  id: "languageModelTools",
  label: localize(13458, null),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(LanguageModelToolDataRenderer)
});

var LanguageModelToolSetDataRenderer = class extends Disposable {
  constructor() {
    super(...arguments);
    this.type = "table";
  }
  shouldRender(manifest) {
    return !!manifest.contributes?.languageModelToolSets;
  }
  render(manifest) {
    const contribs = manifest.contributes?.languageModelToolSets ?? [];
    if (!contribs.length) {
      return { data: { headers: [], rows: [] }, dispose: () => {
      } };
    }
    const headers = [
      localize(13460, null),
      localize(13462, null),
      localize(13467, null),
      localize(13454, null)
    ];
    const rows = contribs.map((t2) => {
      return [
        new MarkdownString(`\`${t2.name}\``),
        t2.referenceName ? new MarkdownString(`\`#${t2.referenceName}\``) : "none",
        t2.tools.join(", "),
        t2.description
      ];
    });
    return {
      data: {
        headers,
        rows
      },
      dispose: () => {
      }
    };
  }
};

Registry.as(Extensions11.ExtensionFeaturesRegistry).registerExtensionFeature({
  id: "languageModelToolSets",
  label: localize(13459, null),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(LanguageModelToolSetDataRenderer)
});
export { toToolKey, toToolSetKey, toSyntheticToolSetKey, languageModelToolsExtensionPoint, languageModelToolSetsExtensionPoint, LanguageModelToolsExtensionPointHandler, LanguageModelToolDataRenderer, LanguageModelToolSetDataRenderer };
