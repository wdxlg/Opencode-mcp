// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/copilot/copilotSlashCommandCompletionProvider.ts
import { AgentSession } from "./module-0048.mjs";
import { extractLeadingSlashToken, extractWhitespaceDelimitedSlashToken, matchesSlashCompletion } from "./module-0298.mjs";
import { isCustomizationEnabled } from "./module-0157.mjs";
import { getCopilotConfigSlashCommandItems, isCopilotConfigSlashCommand } from "./module-0186.mjs";
import { getCompletionAction, toCommandCompletionAttachmentMeta } from "./module-0297.mjs";
import { SYNCED_CUSTOMIZATION_SCHEME } from "./module-0304.mjs";


// src/vs/platform/agentHost/node/copilot/copilotSlashCommandCompletionProvider.ts
var HIDDEN_RUNTIME_COMMANDS = /* @__PURE__ */ new Set(["agent", "app", "changelog", "context", "copy", "exit", "extensions", "feedback", "help", "ide", "instructions", "login", "logout", "mcp", "model", "new", "plugin", "rename", "restart", "resume", "sandbox", "session", "settings", "skills", "statusline", "streamer-mode", "subagents", "tasks", "terminal-setup", "theme", "undo", "update", "user", "voice", "worktree", "autopilot", "yolo", "cd", "cwd", "after", "before", "add-dir", "allow-all", "list-dirs", "reset-allowed-tools"]);

var DEFAULT_RUNTIME_SLASH_COMMAND_COMPLETION_WAIT_MS = 300;

var CopilotSlashCommandCompletionProvider = class {
  constructor(copilotcliId, _sessionInfo, _runtimeSlashCommandCompletionWaitMs = DEFAULT_RUNTIME_SLASH_COMMAND_COMPLETION_WAIT_MS) {
    this.copilotcliId = copilotcliId;
    this._sessionInfo = _sessionInfo;
    this._runtimeSlashCommandCompletionWaitMs = _runtimeSlashCommandCompletionWaitMs;
    this.kinds = /* @__PURE__ */ new Set(["userMessage" /* UserMessage */]);
    this.triggerCharacters = ["/" /* Slash */];
  }
  async provideCompletionItems(params, _token) {
    if (AgentSession.provider(params.channel) !== this.copilotcliId) {
      return [];
    }
    const leadingTokenForSkills = extractWhitespaceDelimitedSlashToken(params.text, params.offset);
    const leadingTokenForCommands = extractLeadingSlashToken(params.text, params.offset);
    const leading = leadingTokenForCommands ?? leadingTokenForSkills;
    const returnJustSkills = !leadingTokenForCommands && !!leadingTokenForSkills;
    if (!leading) {
      return [];
    }
    const sessionId = AgentSession.id(params.channel);
    const typed = leading.typed;
    return await this._getRuntimeSlashCommandCompletionInfo(sessionId, typed, leading, returnJustSkills);
  }
  async _getKnownSkills(sessionId) {
    const known = /* @__PURE__ */ new Set();
    const syncedContainerNames = /* @__PURE__ */ new Set();
    const customizations = await this._sessionInfo.getSessionCustomizations(sessionId) ?? [];
    for (const c of customizations) {
      if (c.type === "mcpServer" /* McpServer */ || (c.type === "plugin" /* Plugin */ ? !isCustomizationEnabled(c) : !c.enabled) || !c.children) {
        continue;
      }
      if (c.type === "plugin" /* Plugin */ && isSyncedCustomization(c)) {
        syncedContainerNames.add(c.name.toLowerCase());
      }
      for (const child of c.children) {
        if (child.type === "skill" /* Skill */) {
          known.add(this._toSlashCommandCandidate(c, child).toLowerCase());
        }
      }
    }
    return { known, syncedContainerNames };
  }
  /**
   * Whether a runtime skill command duplicates one the generic skill-completion
   * provider already surfaces, including the synced bundle's namespaced
   * `<bundleName>:<skill>` form (kept when its bare name is reserved).
   */
  _isKnownSkillDuplicate(name, knownSkills, syncedContainerNames, runtimeCommands) {
    const lower = name.toLowerCase();
    if (knownSkills.has(lower)) {
      return true;
    }
    for (const syncedName of syncedContainerNames) {
      const prefix = `${syncedName}:`;
      if (lower.startsWith(prefix)) {
        const stripped = lower.slice(prefix.length);
        return knownSkills.has(stripped) && !this._isReservedBareName(stripped, runtimeCommands);
      }
    }
    return false;
  }
  /**
   * Whether a bare slash name would be intercepted by something other than a
   * bundled skill on send: a Copilot config action, the client-handled
   * `compact` / `rubber-duck` commands, or a non-skill runtime command (by name
   * or alias).
   */
  _isReservedBareName(name, runtimeCommands) {
    if (isCopilotConfigSlashCommand(name) || name === "compact" || name === "rubber-duck") {
      return true;
    }
    return runtimeCommands.some((command) => command.kind !== "skill" && (command.name?.toLowerCase() === name || !!command.aliases?.some((alias) => alias.toLowerCase() === name)));
  }
  _toSlashCommandCandidate(container, skill) {
    let slashCommandName = skill.name;
    if (container.type === "plugin" /* Plugin */ && !isSyncedCustomization(container) && skill.name !== container.name) {
      slashCommandName = `${container.name}:${skill.name}`;
    }
    return slashCommandName;
  }
  async _getRuntimeSlashCommandCompletionInfo(sessionId, typed, { rangeStart, rangeEnd }, returnJustSkills) {
    const [runtimeCommands, { known: knownSkills, syncedContainerNames }] = await Promise.all([
      this._sessionInfo.getRuntimeSlashCommands?.(sessionId, { maxWaitMs: this._runtimeSlashCommandCompletionWaitMs }) ?? [],
      this._getKnownSkills(sessionId)
    ]);
    const typedLower = typed.toLowerCase();
    const rubberDuckEnabled = this._sessionInfo?.isRubberDuckEnabled?.() ?? true;
    const completionItems = [];
    const addedAliases = /* @__PURE__ */ new Set();
    for (const command of runtimeCommands) {
      if (!command.name) {
        continue;
      }
      if (returnJustSkills && command.kind !== "skill") {
        continue;
      }
      if (command.kind === "skill" && this._isKnownSkillDuplicate(command.name, knownSkills, syncedContainerNames, runtimeCommands)) {
        continue;
      }
      if (HIDDEN_RUNTIME_COMMANDS.has(command.name) || command.aliases?.some((alias) => HIDDEN_RUNTIME_COMMANDS.has(alias))) {
        continue;
      }
      if (isCopilotConfigSlashCommand(command.name) || command.aliases?.some((alias) => isCopilotConfigSlashCommand(alias))) {
        continue;
      }
      if (!rubberDuckEnabled && command.name === "rubber-duck") {
        continue;
      }
      if (!matchesSlashCompletion(typedLower, command.name) && !command.aliases?.some((alias) => matchesSlashCompletion(typedLower, alias))) {
        continue;
      }
      const options = [];
      if (command.input?.hint || !command.input?.choices?.length) {
        options.push({ name: "", description: command.description, argumentHint: command.input?.hint });
      }
      if (command.input?.choices?.length) {
        options.push(...command.input.choices);
      }
      const aliases = Array.from(new Set([command.name].concat(command.aliases ?? [])));
      aliases.filter((alias) => !addedAliases.has(alias)).forEach((alias) => {
        options.forEach((option) => {
          const insertText = `/${alias}${option.name ? " " + option.name : ""} `;
          const description = option.description ?? command.description;
          const argumentHint = option.argumentHint;
          addedAliases.add(alias);
          completionItems.push({
            insertText,
            rangeStart,
            rangeEnd,
            attachment: {
              type: "simple" /* Simple */,
              label: insertText,
              _meta: toCommandCompletionAttachmentMeta({
                command: command.name,
                ...description !== void 0 ? { description } : {},
                ...argumentHint !== void 0 ? { argumentHint } : {}
              })
            }
          });
        });
      });
    }
    if (!returnJustSkills) {
      const configState = this._sessionInfo.getSessionConfigState?.(sessionId);
      for (const item of getCopilotConfigSlashCommandItems(typed, configState)) {
        completionItems.push({
          insertText: item.insertText,
          rangeStart,
          rangeEnd,
          attachment: {
            type: "simple" /* Simple */,
            label: item.label,
            _meta: toCommandCompletionAttachmentMeta({
              command: item.command,
              description: item.description,
              ...item.argumentHint !== void 0 ? { argumentHint: item.argumentHint } : {},
              action: { applyConfig: item.applyConfig }
            })
          }
        });
      }
    }
    const getSortText = (item) => {
      return getCompletionAction(item.attachment._meta) ? item.attachment.label : item.insertText;
    };
    return completionItems.sort((a, b) => getSortText(a).localeCompare(getSortText(b)));
  }
};

function isSyncedCustomization(container) {
  return container.uri.startsWith(SYNCED_CUSTOMIZATION_SCHEME + ":");
}
export { isSyncedCustomization, HIDDEN_RUNTIME_COMMANDS, DEFAULT_RUNTIME_SLASH_COMMAND_COMPLETION_WAIT_MS, CopilotSlashCommandCompletionProvider };
