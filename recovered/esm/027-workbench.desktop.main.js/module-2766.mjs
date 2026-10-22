// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatParticipant.contribution.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions13 } from "./module-1093.mjs";
import { ChatViewContainerId, ChatViewId } from "./module-0981.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { ViewPaneContainer } from "./module-1382.mjs";
import { ChatViewPane } from "./module-2765.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { ExtensionsRegistry } from "./module-0876.mjs";
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { AmbiguousCharacters, InvisibleCharacters } from "./module-0030.mjs";
import { isProposedApiEnabled } from "./module-0887.mjs";
import { coalesce, isNonEmptyArray } from "./module-0007.mjs";
import { ChatAgentLocation } from "./module-0964.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatAgentService } from "./module-0974.mjs";
import { Event2 } from "./module-0017.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { MarkdownString, createCommandUri } from "./module-0462.mjs";
import { showExtensionsWithIdsCommandId } from "./module-1877.mjs";
import { IExtensionsWorkbenchService } from "./module-1022.mjs";
import { IProductService } from "./module-0873.mjs";
import { Extensions11 } from "./module-0877.mjs";


// src/vs/workbench/contrib/chat/browser/chatParticipant.contribution.ts
var chatViewIcon = registerIcon("chat-view-icon", Codicon.chatSparkle, localize(10926, null));

var chatViewContainer = Registry.as(Extensions13.ViewContainersRegistry).registerViewContainer({
  id: ChatViewContainerId,
  title: localize2(10903, "Chat"),
  icon: chatViewIcon,
  ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [ChatViewContainerId, { mergeViewWithContainerWhenSingleView: true }]),
  storageId: ChatViewContainerId,
  hideIfEmpty: true,
  order: 1
}, 2 /* AuxiliaryBar */, { isDefault: true, doNotRegisterOpenCommand: true });

var chatViewDescriptor = {
  id: ChatViewId,
  containerIcon: chatViewContainer.icon,
  containerTitle: chatViewContainer.title.value,
  singleViewPaneContainerTitle: chatViewContainer.title.value,
  name: localize2(10903, "Chat"),
  canToggleVisibility: false,
  canMoveView: true,
  openCommandActionDescriptor: {
    id: ChatViewContainerId,
    title: chatViewContainer.title,
    mnemonicTitle: localize(10927, null),
    keybindings: {
      primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 39 /* KeyI */,
      mac: {
        primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 39 /* KeyI */
      }
    },
    order: 1
  },
  ctorDescriptor: new SyncDescriptor(ChatViewPane),
  when: ContextKeyExpr.and(
    ChatContextKeys.accountPolicyGateActive.negate(),
    ContextKeyExpr.or(
      ContextKeyExpr.and(
        ChatContextKeys.Setup.hidden.negate(),
        ChatContextKeys.Setup.disabledInWorkspace.negate()
      ),
      ChatContextKeys.panelParticipantRegistered,
      ChatContextKeys.extensionInvalid
    )
  )
};

Registry.as(Extensions13.ViewsRegistry).registerViews([chatViewDescriptor], chatViewContainer);

var chatParticipantExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "chatParticipants",
  jsonSchema: {
    description: localize(10933, null),
    type: "array",
    items: {
      additionalProperties: false,
      type: "object",
      defaultSnippets: [{ body: { name: "", description: "" } }],
      required: ["name", "id"],
      properties: {
        id: {
          description: localize(10921, null),
          type: "string"
        },
        name: {
          description: localize(10922, null),
          type: "string",
          pattern: "^[\\w-]+$"
        },
        fullName: {
          markdownDescription: localize(10920, null, "`name`"),
          type: "string"
        },
        description: {
          description: localize(10915, null),
          type: "string"
        },
        isSticky: {
          description: localize(10912, null),
          type: "boolean"
        },
        sampleRequest: {
          description: localize(10925, null),
          type: "string"
        },
        when: {
          description: localize(10924, null),
          type: "string"
        },
        disambiguation: {
          description: localize(10916, null),
          type: "array",
          items: {
            additionalProperties: false,
            type: "object",
            defaultSnippets: [{ body: { category: "", description: "", examples: [] } }],
            required: ["category", "description", "examples"],
            properties: {
              category: {
                markdownDescription: localize(10917, null),
                type: "string"
              },
              description: {
                description: localize(10918, null),
                type: "string"
              },
              examples: {
                description: localize(10919, null),
                type: "array"
              }
            }
          }
        },
        commands: {
          markdownDescription: localize(10911, null),
          type: "array",
          items: {
            additionalProperties: false,
            type: "object",
            defaultSnippets: [{ body: { name: "", description: "" } }],
            required: ["name"],
            properties: {
              name: {
                description: localize(10904, null),
                type: "string"
              },
              description: {
                description: localize(10905, null),
                type: "string"
              },
              when: {
                description: localize(10913, null),
                type: "string"
              },
              sampleRequest: {
                description: localize(10910, null),
                type: "string"
              },
              isSticky: {
                description: localize(10912, null),
                type: "boolean"
              },
              disambiguation: {
                description: localize(10906, null),
                type: "array",
                items: {
                  additionalProperties: false,
                  type: "object",
                  defaultSnippets: [{ body: { category: "", description: "", examples: [] } }],
                  required: ["category", "description", "examples"],
                  properties: {
                    category: {
                      markdownDescription: localize(10907, null),
                      type: "string"
                    },
                    description: {
                      description: localize(10908, null),
                      type: "string"
                    },
                    examples: {
                      description: localize(10909, null),
                      type: "array"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  activationEventsGenerator: function* (contributions) {
    for (const contrib of contributions) {
      yield `onChatParticipant:${contrib.id}`;
    }
  }
});

var ChatExtensionPointHandler = class {
  constructor(_chatAgentService) {
    this._chatAgentService = _chatAgentService;
    this._participantRegistrationDisposables = new DisposableMap();
    this.handleAndRegisterChatExtensions();
  }
  static {
    this.ID = "workbench.contrib.chatExtensionPointHandler";
  }
  handleAndRegisterChatExtensions() {
    chatParticipantExtensionPoint.setHandler((extensions, delta2) => {
      for (const extension of delta2.added) {
        for (const providerDescriptor of extension.value) {
          if (!providerDescriptor.name?.match(/^[\w-]+$/)) {
            extension.collector.error(`Extension '${extension.description.identifier.value}' CANNOT register participant with invalid name: ${providerDescriptor.name}. Name must match /^[\\w-]+$/.`);
            continue;
          }
          if (providerDescriptor.fullName && AmbiguousCharacters.getInstance(/* @__PURE__ */ new Set()).containsAmbiguousCharacter(providerDescriptor.fullName)) {
            extension.collector.error(`Extension '${extension.description.identifier.value}' CANNOT register participant with fullName that contains ambiguous characters: ${providerDescriptor.fullName}.`);
            continue;
          }
          if (providerDescriptor.fullName && InvisibleCharacters.containsInvisibleCharacter(providerDescriptor.fullName.replace(/ /g, ""))) {
            extension.collector.error(`Extension '${extension.description.identifier.value}' CANNOT register participant with fullName that contains invisible characters: ${providerDescriptor.fullName}.`);
            continue;
          }
          if ((providerDescriptor.isDefault || providerDescriptor.modes) && !isProposedApiEnabled(extension.description, "defaultChatParticipant")) {
            extension.collector.error(`Extension '${extension.description.identifier.value}' CANNOT use API proposal: defaultChatParticipant.`);
            continue;
          }
          if (providerDescriptor.locations && !isProposedApiEnabled(extension.description, "chatParticipantAdditions")) {
            extension.collector.error(`Extension '${extension.description.identifier.value}' CANNOT use API proposal: chatParticipantAdditions.`);
            continue;
          }
          if (!providerDescriptor.id || !providerDescriptor.name) {
            extension.collector.error(`Extension '${extension.description.identifier.value}' CANNOT register participant without both id and name.`);
            continue;
          }
          const participantsDisambiguation = [];
          if (providerDescriptor.disambiguation?.length) {
            participantsDisambiguation.push(...providerDescriptor.disambiguation.map((d) => ({
              ...d,
              category: d.category ?? d.categoryName
            })));
          }
          try {
            const store = new DisposableStore();
            store.add(this._chatAgentService.registerAgent(
              providerDescriptor.id,
              {
                extensionId: extension.description.identifier,
                extensionVersion: extension.description.version,
                publisherDisplayName: extension.description.publisherDisplayName ?? extension.description.publisher,
                // May not be present in OSS
                extensionPublisherId: extension.description.publisher,
                extensionDisplayName: extension.description.displayName ?? extension.description.name,
                id: providerDescriptor.id,
                description: providerDescriptor.description,
                when: providerDescriptor.when,
                metadata: {
                  isSticky: providerDescriptor.isSticky,
                  sampleRequest: providerDescriptor.sampleRequest
                },
                name: providerDescriptor.name,
                fullName: providerDescriptor.fullName,
                isDefault: providerDescriptor.isDefault,
                locations: isNonEmptyArray(providerDescriptor.locations) ? providerDescriptor.locations.map(ChatAgentLocation.fromRaw) : ["panel" /* Chat */],
                modes: providerDescriptor.isDefault ? providerDescriptor.modes ?? ["ask" /* Ask */] : ["agent" /* Agent */, "ask" /* Ask */, "edit" /* Edit */],
                slashCommands: providerDescriptor.commands ?? [],
                disambiguation: coalesce(participantsDisambiguation.flat())
              }
            ));
            this._participantRegistrationDisposables.set(
              getParticipantKey(extension.description.identifier, providerDescriptor.id),
              store
            );
          } catch (e) {
            extension.collector.error(`Failed to register participant ${providerDescriptor.id}: ${toErrorMessage(e, true)}`);
          }
        }
      }
      for (const extension of delta2.removed) {
        for (const providerDescriptor of extension.value) {
          this._participantRegistrationDisposables.deleteAndDispose(getParticipantKey(extension.description.identifier, providerDescriptor.id));
        }
      }
    });
  }
};

ChatExtensionPointHandler = __decorateClass([
  __decorateParam(0, IChatAgentService)
], ChatExtensionPointHandler);

function getParticipantKey(extensionId, participantName) {
  return `${extensionId.value}_${participantName}`;
}

var ChatCompatibilityNotifier = class extends Disposable {
  constructor(extensionsWorkbenchService, contextKeyService, productService) {
    super();
    this.productService = productService;
    this.registeredWelcomeView = false;
    const isInvalid = ChatContextKeys.extensionInvalid.bindTo(contextKeyService);
    this._register(Event2.runAndSubscribe(
      extensionsWorkbenchService.onDidChangeExtensionsNotification,
      () => {
        const notification = extensionsWorkbenchService.getExtensionsNotification();
        const chatExtension = notification?.extensions.find((ext) => ExtensionIdentifier.equals(ext.identifier.id, this.productService.defaultChatAgent?.chatExtensionId));
        if (chatExtension) {
          isInvalid.set(true);
          this.registerWelcomeView(chatExtension);
        } else {
          isInvalid.set(false);
        }
      }
    ));
  }
  static {
    this.ID = "workbench.contrib.chatCompatNotifier";
  }
  registerWelcomeView(chatExtension) {
    if (this.registeredWelcomeView) {
      return;
    }
    this.registeredWelcomeView = true;
    const showExtensionLabel = localize(10932, null);
    const mainMessage = localize(10914, null, this.productService.nameLong);
    const commandButton = `[${showExtensionLabel}](${createCommandUri(showExtensionsWithIdsCommandId, [this.productService.defaultChatAgent?.chatExtensionId])})`;
    const versionMessage = `Copilot Chat version: ${chatExtension.version}`;
    const viewsRegistry9 = Registry.as(Extensions13.ViewsRegistry);
    this._register(viewsRegistry9.registerViewWelcomeContent(ChatViewId, {
      content: [mainMessage, commandButton, versionMessage].join("\n\n"),
      when: ChatContextKeys.extensionInvalid
    }));
  }
};

ChatCompatibilityNotifier = __decorateClass([
  __decorateParam(0, IExtensionsWorkbenchService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IProductService)
], ChatCompatibilityNotifier);

var ChatParticipantDataRenderer = class extends Disposable {
  constructor() {
    super(...arguments);
    this.type = "table";
  }
  shouldRender(manifest) {
    return !!manifest.contributes?.chatParticipants;
  }
  render(manifest) {
    const nonDefaultContributions = manifest.contributes?.chatParticipants?.filter((c) => !c.isDefault) ?? [];
    if (!nonDefaultContributions.length) {
      return { data: { headers: [], rows: [] }, dispose: () => {
      } };
    }
    const headers = [
      localize(10931, null),
      localize(10930, null),
      localize(10929, null),
      localize(10928, null)
    ];
    const rows = nonDefaultContributions.map((d) => {
      return [
        "@" + d.name,
        d.fullName,
        d.description ?? "-",
        d.commands?.length ? new MarkdownString(d.commands.map((c) => `- /` + c.name).join("\n")) : "-"
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
  id: "chatParticipants",
  label: localize(10923, null),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(ChatParticipantDataRenderer)
});
export { getParticipantKey, chatViewIcon, chatViewContainer, chatViewDescriptor, chatParticipantExtensionPoint, ChatExtensionPointHandler, ChatCompatibilityNotifier, ChatParticipantDataRenderer };
