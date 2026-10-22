// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/promptsDebugContribution.ts
import { Disposable } from "./module-0012.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { isAgentHostTarget } from "./module-0961.mjs";
import { getChatSessionType } from "./module-0962.mjs";
import { generateUuid } from "./module-0190.mjs";
import { lastInstructionsCollectionResult } from "./module-2479.mjs";
import { localize } from "./module-0001.mjs";
import { HookType } from "./module-1011.mjs";
import { formatHookCommandLabel } from "./module-1012.mjs";
import { OS } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPromptsService } from "./module-0987.mjs";
import { IChatAgentService } from "./module-0975.mjs";
import { IChatService } from "./module-0973.mjs";
import { IChatDebugService } from "./module-1455.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/chat/browser/promptsDebugContribution.ts
var PromptsDebugContribution = class extends Disposable {
  constructor(promptsService, chatAgentService, chatService, chatDebugService, logService) {
    super();
    this.promptsService = promptsService;
    /**
     * Maps debug event IDs to their discovery info, so that
     * {@link IChatDebugService.resolveEvent} can return rich details.
     */
    this._discoveryEventDetails = /* @__PURE__ */ new Map();
    this._customizationEventDetails = /* @__PURE__ */ new Map();
    this._loggedSessions = /* @__PURE__ */ new Set();
    this._register(chatService.onDidDisposeSession((e4) => {
      for (const sessionResource of e4.sessionResources) {
        this._loggedSessions.delete(sessionResource.toString());
      }
    }));
    this._register(chatAgentService.onWillInvokeAgent(async (e4) => {
      const sessionKey = e4.request.sessionResource.toString();
      const isFirstInvocation = !this._loggedSessions.has(sessionKey);
      this._loggedSessions.add(sessionKey);
      const sessionResource = e4.request.sessionResource;
      if (isFirstInvocation) {
        const cts = new CancellationTokenSource();
        try {
          const discoveryTypes = isAgentHostTarget(getChatSessionType(sessionResource)) ? ["instructions" /* instructions */, "hook" /* hook */] : ["agent" /* agent */, "instructions" /* instructions */, "prompt" /* prompt */, "skill" /* skill */, "hook" /* hook */];
          const discoveryInfos = await Promise.all(discoveryTypes.map((type) => this.promptsService.getDiscoveryInfo(type, cts.token)));
          for (const discoveryInfo of discoveryInfos) {
            const { name, details } = this.getDiscoveryLogEntry(discoveryInfo);
            const eventId = generateUuid();
            this._discoveryEventDetails.set(eventId, discoveryInfo);
            if (this._discoveryEventDetails.size > PromptsDebugContribution.MAX_DISCOVERY_DETAILS) {
              const first2 = this._discoveryEventDetails.keys().next().value;
              if (first2 !== void 0) {
                this._discoveryEventDetails.delete(first2);
              }
            }
            const loaded = discoveryInfo.files.filter((f) => f.status === "loaded").map((f) => f.promptPath.name ?? f.promptPath.uri.path.split("/").pop() ?? f.promptPath.uri.toString());
            const skipped = discoveryInfo.files.filter((f) => f.status === "skipped").map((f) => {
              const label3 = f.promptPath.uri.toString();
              return f.skipReason ? `${label3} (${f.skipReason})` : label3;
            });
            const folders = discoveryInfo.sourceFolders?.map((sf) => sf.uri.path) ?? [];
            const parts = [];
            if (details) {
              parts.push(details);
            }
            if (loaded.length > 0) {
              parts.push(`loaded: [${truncateList(loaded)}]`);
            }
            if (skipped.length > 0) {
              parts.push(`skipped: [${truncateList(skipped)}]`);
            }
            if (folders.length > 0) {
              parts.push(`folders: [${truncateList(folders)}]`);
            }
            const newDetails = parts.join(" | ") || void 0;
            chatDebugService.log(
              sessionResource,
              name,
              newDetails,
              void 0,
              { id: eventId, category: "discovery" }
            );
          }
        } catch (error) {
          logService.error("Error while logging prompt discovery info to chat debug service", error);
        } finally {
          cts.dispose();
        }
      }
      const lastResult = lastInstructionsCollectionResult;
      if (!isFirstInvocation && lastResult) {
        const { telemetryEvent: collectionEvent, debugInfo } = lastResult;
        let resolvedHooks;
        try {
          const hookDiscoveryInfo = await this.promptsService.getDiscoveryInfo("hook" /* hook */, CancellationToken.None);
          resolvedHooks = hookDiscoveryInfo.hooksInfo?.hooks;
        } catch (error) {
          logService.warn("Error while fetching hooks for customization debug event", error);
        }
        const parts = [];
        if (collectionEvent.applyingInstructionsCount > 0) {
          parts.push(localize(11402, null, collectionEvent.applyingInstructionsCount));
        }
        if (collectionEvent.referencedInstructionsCount > 0) {
          parts.push(localize(11404, null, collectionEvent.referencedInstructionsCount));
        }
        if (collectionEvent.agentInstructionsCount > 0) {
          parts.push(localize(11401, null, collectionEvent.agentInstructionsCount));
        }
        if (collectionEvent.listedInstructionsCount > 0) {
          parts.push(localize(11403, null, collectionEvent.listedInstructionsCount));
        }
        const durationStr = debugInfo.durationInMillis.toFixed(1);
        const summary = parts.length > 0 ? localize(11406, null, collectionEvent.totalInstructionsCount, parts.join(", "), durationStr) : localize(11407, null);
        const detailSummaries = debugInfo.debugDetails.map((e5) => {
          const detail2 = e5.reason ? `${e5.name} \u2014 ${e5.reason}` : e5.name;
          return `[${e5.category}] ${detail2}`;
        });
        const details = detailSummaries.length > 0 ? `${summary} | ${detailSummaries.join(", ")}` : summary;
        const customizationEventId = generateUuid();
        this._customizationEventDetails.set(customizationEventId, { debugInfo, hooks: resolvedHooks });
        if (this._customizationEventDetails.size > PromptsDebugContribution.MAX_DISCOVERY_DETAILS) {
          const first2 = this._customizationEventDetails.keys().next().value;
          if (first2 !== void 0) {
            this._customizationEventDetails.delete(first2);
          }
        }
        chatDebugService.log(
          sessionResource,
          localize(11405, null),
          details,
          void 0,
          { id: customizationEventId, category: "customization" }
        );
      }
    }));
    this._register(chatDebugService.registerProvider({
      provideChatDebugLog: async () => void 0,
      resolveChatDebugLogEvent: async (eventId) => {
        return this._resolveDiscoveryEvent(eventId) ?? this._resolveCustomizationEvent(eventId);
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.promptsDebug";
  }
  static {
    this.MAX_DISCOVERY_DETAILS = 1e4;
  }
  getDiscoveryLogEntry(discoveryInfo) {
    const durationInMillis = discoveryInfo.durationInMillis.toFixed(1);
    const loadedCount = discoveryInfo.files.filter((file) => file.status === "loaded").length;
    const skippedCount = discoveryInfo.files.length - loadedCount;
    switch (discoveryInfo.type) {
      case "prompt" /* prompt */:
        return {
          name: localize(11424, null),
          details: loadedCount === 1 ? localize(11418, null, loadedCount, durationInMillis) : localize(11419, null, loadedCount, durationInMillis)
        };
      case "agent" /* agent */:
        return {
          name: localize(11420, null),
          details: loadedCount === 1 ? localize(11409, null, loadedCount, durationInMillis) : localize(11410, null, loadedCount, durationInMillis)
        };
      case "skill" /* skill */:
        return {
          name: localize(11423, null),
          details: loadedCount === 1 ? localize(11416, null, loadedCount, durationInMillis) : localize(11417, null, loadedCount, durationInMillis)
        };
      case "instructions" /* instructions */:
        return {
          name: localize(11422, null),
          details: loadedCount === 1 ? localize(11414, null, loadedCount, durationInMillis) : localize(11415, null, loadedCount, durationInMillis)
        };
      case "hook" /* hook */: {
        const hookDiscoveryInfo = discoveryInfo;
        const hookCount = hookDiscoveryInfo.hooksInfo ? Object.values(hookDiscoveryInfo.hooksInfo.hooks).reduce((total, hooks) => total + hooks.length, 0) : loadedCount;
        const details = skippedCount > 0 ? localize(11413, null, hookCount, loadedCount, durationInMillis, skippedCount) : hookCount === 1 ? localize(11411, null, hookCount, durationInMillis) : localize(11412, null, hookCount, durationInMillis);
        return {
          name: localize(11421, null),
          details
        };
      }
    }
  }
  _resolveDiscoveryEvent(eventId) {
    const info = this._discoveryEventDetails.get(eventId);
    if (!info) {
      return void 0;
    }
    return this._toFileListContent(info);
  }
  _resolveCustomizationEvent(eventId) {
    const data = this._customizationEventDetails.get(eventId);
    if (!data) {
      return void 0;
    }
    const { debugInfo, hooks } = data;
    const logs = [...debugInfo.debugDetails];
    if (hooks) {
      for (const hookType of Object.values(HookType)) {
        const commands = hooks[hookType];
        if (commands && commands.length > 0) {
          for (const cmd of commands) {
            const commandLabel = formatHookCommandLabel(cmd, OS) || localize(11408, null);
            logs.push({
              category: "hook",
              name: commandLabel,
              reason: hookType,
              uri: cmd.sourceUri
            });
          }
        }
      }
    }
    return {
      kind: "customizationSummary",
      resolutionLogs: logs,
      durationInMillis: debugInfo.durationInMillis,
      counts: {
        instructions: logs.filter((e4) => e4.category === "applying" || e4.category === "referenced").length,
        skills: logs.filter((e4) => e4.category === "skill").length,
        agents: logs.filter((e4) => e4.category === "custom-agent").length,
        hooks: logs.filter((e4) => e4.category === "hook").length,
        skipped: logs.filter((e4) => e4.category === "skipped").length
      }
    };
  }
  _toFileListContent(info) {
    return {
      kind: "fileList",
      discoveryType: info.type,
      durationInMillis: info.durationInMillis,
      files: info.files.map((f) => ({
        uri: f.promptPath.uri,
        name: f.promptPath.name,
        status: f.status,
        storage: f.promptPath.storage,
        extensionId: f.promptPath.extension?.identifier.value,
        skipReason: f.skipReason,
        errorMessage: f.errorMessage,
        duplicateOf: f.duplicateOf
      })),
      sourceFolders: info.sourceFolders?.map((sf) => ({
        uri: sf.uri,
        storage: sf.storage
      }))
    };
  }
};

PromptsDebugContribution = __decorateClass([
  __decorateParam(0, IPromptsService),
  __decorateParam(1, IChatAgentService),
  __decorateParam(2, IChatService),
  __decorateParam(3, IChatDebugService),
  __decorateParam(4, ILogService)
], PromptsDebugContribution);

var MAX_LIST_ITEMS = 100;

function truncateList(items) {
  if (items.length <= MAX_LIST_ITEMS) {
    return items.join(", ");
  }
  return items.slice(0, MAX_LIST_ITEMS).join(", ") + ` (+${items.length - MAX_LIST_ITEMS} more)`;
}
export { truncateList, PromptsDebugContribution, MAX_LIST_ITEMS };
