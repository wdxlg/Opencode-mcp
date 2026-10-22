// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostSkillCompletionProvider.ts
import { Disposable } from "./module-0010.mjs";
import { extractWhitespaceDelimitedSlashToken, matchesSlashCompletion } from "./module-0298.mjs";
import { URI } from "./module-0023.mjs";
import { toSkillCompletionAttachmentMeta } from "./module-0297.mjs";
import { buildDefaultChatUri } from "./module-0047.mjs";
import { isCustomizationEnabled } from "./module-0157.mjs";
import { SYNCED_CUSTOMIZATION_SCHEME } from "./module-0304.mjs";


// src/vs/platform/agentHost/node/agentHostSkillCompletionProvider.ts
var AgentHostSkillCompletionProvider = class extends Disposable {
  constructor(_getAgent, _getHostCustomizations = () => void 0) {
    super();
    this._getAgent = _getAgent;
    this._getHostCustomizations = _getHostCustomizations;
    this.kinds = /* @__PURE__ */ new Set(["userMessage" /* UserMessage */]);
    this.triggerCharacters = ["/" /* Slash */];
  }
  async provideCompletionItems(params, token) {
    const leading = extractWhitespaceDelimitedSlashToken(params.text, params.offset);
    if (!leading) {
      return [];
    }
    const sessionUri = typeof params.channel === "string" ? URI.parse(params.channel) : params.channel;
    const agent = this._getAgent(sessionUri);
    if (!agent) {
      return [];
    }
    const candidates = await this._getCandidates(agent, sessionUri);
    if (token.isCancellationRequested || candidates.length === 0) {
      return [];
    }
    const typed = leading.typed;
    const skillsSeen = /* @__PURE__ */ new Set();
    return candidates.filter((skill) => {
      const identity2 = `${skill.slashCommandName}\0${skill.description ?? ""}`;
      if (matchesSlashCompletion(typed, skill.slashCommandName) && !skillsSeen.has(identity2)) {
        skillsSeen.add(identity2);
        return true;
      }
      return false;
    }).map((skill) => ({
      insertText: "/" + skill.slashCommandName + " ",
      rangeStart: leading.rangeStart,
      rangeEnd: leading.rangeEnd,
      attachment: {
        type: "simple" /* Simple */,
        label: "/" + skill.slashCommandName,
        _meta: toSkillCompletionAttachmentMeta({
          uri: skill.uri,
          name: skill.name,
          displayName: skill.slashCommandName,
          description: skill.description
        })
      }
    }));
  }
  async _getCandidates(agent, session) {
    const chat = URI.parse(buildDefaultChatUri(session));
    const customizations = await agent.getChatCustomizations(chat, { configurationResource: session, resource: session }, this._getHostCustomizations(session));
    const result = [];
    for (const c of customizations) {
      if (c.type === "mcpServer" /* McpServer */ || (c.type === "plugin" /* Plugin */ ? !isCustomizationEnabled(c) : !c.enabled) || !c.children) {
        continue;
      }
      for (const child of c.children) {
        if (child.type === "skill" /* Skill */) {
          result.push(this._toSlashCommandCandidate(c, child));
        }
      }
    }
    return result;
  }
  _toSlashCommandCandidate(container, skill) {
    let slashCommandName = skill.name;
    if (container.type === "plugin" /* Plugin */ && !isSyncedCustomization2(container) && skill.name !== container.name) {
      slashCommandName = `${container.name}:${skill.name}`;
    }
    return {
      slashCommandName,
      name: skill.name,
      description: skill.description,
      uri: skill.uri
    };
  }
};

function isSyncedCustomization2(container) {
  return container.uri.startsWith(SYNCED_CUSTOMIZATION_SCHEME + ":");
}
export { isSyncedCustomization2, AgentHostSkillCompletionProvider };
