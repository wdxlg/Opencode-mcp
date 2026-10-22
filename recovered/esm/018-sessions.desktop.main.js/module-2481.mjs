// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/promptSyntax/chatPromptFilesContribution.ts
import { ExtensionsRegistry } from "./module-0878.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { isEqualOrParent2, joinPath } from "./module-0034.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPromptsService } from "./module-0987.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions11 } from "./module-0879.mjs";
import { SyncDescriptor } from "./module-0134.mjs";


// src/vs/workbench/contrib/chat/common/promptSyntax/chatPromptFilesContribution.ts
function registerChatFilesExtensionPoint(point) {
  return ExtensionsRegistry.registerExtensionPoint({
    extensionPoint: point,
    jsonSchema: {
      description: localize(13022, null, point),
      type: "array",
      items: {
        additionalProperties: false,
        type: "object",
        defaultSnippets: [{
          body: {
            path: point === "chatSkills" /* chatSkills */ ? "./relative/path/to/skill-name/SKILL.md" : "./relative/path/to/file.md"
          }
        }],
        required: ["path"],
        properties: {
          path: {
            description: point === "chatSkills" /* chatSkills */ ? localize(13019, null) : localize(13018, null),
            type: "string"
          },
          name: {
            description: localize(13016, null),
            deprecationMessage: localize(13017, null),
            type: "string"
          },
          description: {
            description: localize(13014, null),
            deprecationMessage: localize(13015, null),
            type: "string"
          },
          when: {
            description: localize(13021, null),
            type: "string"
          },
          sessionTypes: {
            description: localize(13020, null),
            type: "array",
            items: { type: "string" }
          }
        }
      }
    }
  });
}

var epPrompt = registerChatFilesExtensionPoint("chatPromptFiles" /* chatPromptFiles */);

var epInstructions = registerChatFilesExtensionPoint("chatInstructions" /* chatInstructions */);

var epAgents = registerChatFilesExtensionPoint("chatAgents" /* chatAgents */);

var epSkills = registerChatFilesExtensionPoint("chatSkills" /* chatSkills */);

function pointToType(contributionPoint) {
  switch (contributionPoint) {
    case "chatPromptFiles" /* chatPromptFiles */:
      return "prompt" /* prompt */;
    case "chatInstructions" /* chatInstructions */:
      return "instructions" /* instructions */;
    case "chatAgents" /* chatAgents */:
      return "agent" /* agent */;
    case "chatSkills" /* chatSkills */:
      return "skill" /* skill */;
    default: {
      const exhaustiveCheck = contributionPoint;
      throw new Error(`Unknown contribution point: ${exhaustiveCheck}`);
    }
  }
}

function key2(extensionId, type, path) {
  return `${extensionId.value}/${type}/${path}`;
}

var ChatPromptFilesExtensionPointHandler = class {
  constructor(promptsService) {
    this.promptsService = promptsService;
    this.registrations = new DisposableMap();
    this.handle(epPrompt, "chatPromptFiles" /* chatPromptFiles */);
    this.handle(epInstructions, "chatInstructions" /* chatInstructions */);
    this.handle(epAgents, "chatAgents" /* chatAgents */);
    this.handle(epSkills, "chatSkills" /* chatSkills */);
  }
  static {
    this.ID = "workbench.contrib.chatPromptFilesExtensionPointHandler";
  }
  handle(extensionPoint5, contributionPoint) {
    extensionPoint5.setHandler((_extensions, delta2) => {
      for (const ext of delta2.added) {
        const type = pointToType(contributionPoint);
        for (const raw of ext.value) {
          if (!raw.path) {
            ext.collector.error(localize(13031, null, ext.description.identifier.value, contributionPoint));
            continue;
          }
          const fileUri = joinPath(ext.description.extensionLocation, raw.path);
          if (!isEqualOrParent2(fileUri, ext.description.extensionLocation)) {
            ext.collector.error(localize(13029, null, ext.description.identifier.value, contributionPoint, raw.path));
            continue;
          }
          if (raw.when && !ContextKeyExpr.deserialize(raw.when)) {
            ext.collector.error(localize(13030, null, ext.description.identifier.value, contributionPoint, raw.path, raw.when));
            continue;
          }
          try {
            const d = this.promptsService.registerContributedFile(type, fileUri, ext.description, raw.name, raw.description, raw.when, raw.sessionTypes);
            this.registrations.set(key2(ext.description.identifier, type, raw.path), d);
          } catch (e4) {
            const msg = e4 instanceof Error ? e4.message : String(e4);
            ext.collector.error(localize(13032, null, ext.description.identifier.value, contributionPoint, raw.path, msg));
          }
        }
      }
      for (const ext of delta2.removed) {
        const type = pointToType(contributionPoint);
        for (const raw of ext.value) {
          this.registrations.deleteAndDispose(key2(ext.description.identifier, type, raw.path));
        }
      }
    });
  }
};

ChatPromptFilesExtensionPointHandler = __decorateClass([
  __decorateParam(0, IPromptsService)
], ChatPromptFilesExtensionPointHandler);

CommandsRegistry.registerCommand("_listExtensionPromptFiles", async (accessor) => {
  const promptsService = accessor.get(IPromptsService);
  const [agents, instructions, prompts, skills, hooks] = await Promise.all([
    promptsService.listPromptFiles("agent" /* agent */, CancellationToken.None),
    promptsService.listPromptFiles("instructions" /* instructions */, CancellationToken.None),
    promptsService.listPromptFiles("prompt" /* prompt */, CancellationToken.None),
    promptsService.listPromptFiles("skill" /* skill */, CancellationToken.None),
    promptsService.listPromptFiles("hook" /* hook */, CancellationToken.None)
  ]);
  const result = [];
  for (const file of [...agents, ...instructions, ...prompts, ...skills, ...hooks]) {
    if (file.storage === "extension" /* extension */) {
      result.push({ uri: file.uri.toJSON(), type: file.type, extensionId: file.extension.identifier.value });
    } else if (file.storage === "plugin" /* plugin */) {
      result.push({ uri: file.uri.toJSON(), type: file.type, extensionId: file.pluginUri.toString() });
    }
  }
  return result;
});

var ChatPromptFilesDataRenderer = class extends Disposable {
  constructor(contributionPoint) {
    super();
    this.contributionPoint = contributionPoint;
    this.type = "table";
  }
  shouldRender(manifest) {
    return !!manifest.contributes?.[this.contributionPoint];
  }
  render(manifest) {
    const contributions = manifest.contributes?.[this.contributionPoint] ?? [];
    if (!contributions.length) {
      return { data: { headers: [], rows: [] }, dispose: () => {
      } };
    }
    const headers = [
      localize(13024, null),
      localize(13023, null),
      localize(13025, null)
    ];
    const rows = contributions.map((d) => {
      return [
        d.name ?? "-",
        d.description ?? "-",
        d.path
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
  id: "chatPromptFiles" /* chatPromptFiles */,
  label: localize(13027, null),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(ChatPromptFilesDataRenderer, ["chatPromptFiles" /* chatPromptFiles */])
});

Registry.as(Extensions11.ExtensionFeaturesRegistry).registerExtensionFeature({
  id: "chatInstructions" /* chatInstructions */,
  label: localize(13026, null),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(ChatPromptFilesDataRenderer, ["chatInstructions" /* chatInstructions */])
});

Registry.as(Extensions11.ExtensionFeaturesRegistry).registerExtensionFeature({
  id: "chatAgents" /* chatAgents */,
  label: localize(13013, null),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(ChatPromptFilesDataRenderer, ["chatAgents" /* chatAgents */])
});

Registry.as(Extensions11.ExtensionFeaturesRegistry).registerExtensionFeature({
  id: "chatSkills" /* chatSkills */,
  label: localize(13028, null),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(ChatPromptFilesDataRenderer, ["chatSkills" /* chatSkills */])
});
export { registerChatFilesExtensionPoint, pointToType, key2, epPrompt, epInstructions, epAgents, epSkills, ChatPromptFilesExtensionPointHandler, ChatPromptFilesDataRenderer };
