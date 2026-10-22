// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/copilot/prompts/promptRegistry.ts
import { COPILOT_AGENT_HOST_FILE_LINK_INSTRUCTIONS, COPILOT_AGENT_HOST_SYSTEM_MESSAGE, COPILOT_AGENT_HOST_WORKSPACELESS_INSTRUCTIONS, appendSystemMessageContent, fullSystemPrompt, sectionOverrides, withDefaultSections } from "./module-0238.mjs";
import { resolveToolInstructionsOverride, toolSearchInstructionLines, universalToolInstructions } from "./module-0240.mjs";


// src/vs/platform/agentHost/node/copilot/prompts/promptRegistry.ts
var AgentHostPromptRegistry = class {
  constructor() {
    this._promptsWithMatcher = [];
    this._familyPrefixList = [];
  }
  registerPrompt(ctor) {
    if (ctor.matchesModel) {
      this._promptsWithMatcher.push(ctor);
    }
    for (const prefix of ctor.familyPrefixes) {
      this._familyPrefixList.push({ prefix, ctor });
    }
  }
  _getContributor(model) {
    for (const ctor of this._promptsWithMatcher) {
      if (ctor.matchesModel(model)) {
        return ctor;
      }
    }
    for (const { prefix, ctor } of this._familyPrefixList) {
      if (model.id.startsWith(prefix)) {
        return ctor;
      }
    }
    return void 0;
  }
  /**
   * The per-model (or default) config with the universal layers on top. Those
   * layers apply to every mode, including a full `replace` prompt (appended
   * after its content), so a replacement owns the prompt body but not the
   * host's plumbing.
   *
   * Lifetime: the SDK accepts a system message only at session create/resume
   * (there is no mid-session update), so this is resolved once per (re)launch
   * and any tool-gated content reflects the tool set at that moment. A change
   * to the session's tools/plugins is part of the launcher's restart-detection
   * snapshot, so it re-launches the session and recomputes this; an in-flight
   * turn keeps the prompt it launched with.
   */
  resolveSystemMessageConfig(model, context) {
    const config = this._withUniversalSections(this._resolveModelConfig(model, context), context);
    const withWorkspacelessScratch = this._withWorkspacelessScratch(config, context);
    return appendSystemMessageContent(withWorkspacelessScratch, COPILOT_AGENT_HOST_FILE_LINK_INSTRUCTIONS);
  }
  /**
   * Resolves the per-model config, before universal sections are layered on.
   *
   * Falls back to {@link COPILOT_AGENT_HOST_SYSTEM_MESSAGE} when the model is
   * unknown (e.g. server-side "Auto" selection where no model is chosen at
   * create time), when no contributor matches, or when the matching
   * contributor opts out for the current {@link context} (e.g. a setting that
   * gates it is disabled).
   */
  _resolveModelConfig(model, context) {
    if (!model) {
      return COPILOT_AGENT_HOST_SYSTEM_MESSAGE;
    }
    const ctor = this._getContributor(model);
    if (!ctor) {
      return COPILOT_AGENT_HOST_SYSTEM_MESSAGE;
    }
    const contributor = new ctor();
    const fullPrompt = contributor.resolveFullSystemPrompt?.(model, context);
    if (fullPrompt !== void 0) {
      return fullSystemPrompt(fullPrompt);
    }
    const sections = contributor.resolveSectionOverrides?.(model, context);
    if (sections && Object.keys(sections).length > 0) {
      return withDefaultSections(sectionOverrides(sections));
    }
    return COPILOT_AGENT_HOST_SYSTEM_MESSAGE;
  }
  /**
   * Layers the tool instructions that apply to EVERY model over the base config.
   * A `customize` config composes them into its `tool_instructions` section
   * rather than being overwritten by them; a `replace` prompt has no sections,
   * so they are appended after its content instead of being silently lost.
   */
  _withUniversalSections(config, context) {
    const lineContext = {
      hasTool: (name) => context.hasClientTool(name),
      getSetting: (key) => context.getSetting(key)
    };
    if (config.mode === "replace") {
      const lines = universalToolInstructions(lineContext, toolSearchInstructionLines(context.toolSearchActive));
      return lines ? appendSystemMessageContent(config, lines) : config;
    }
    if (config.mode !== "customize") {
      return config;
    }
    const toolInstructions = resolveToolInstructionsOverride(lineContext, config.sections?.tool_instructions, toolSearchInstructionLines(context.toolSearchActive));
    if (!toolInstructions) {
      return config;
    }
    return { ...config, sections: { ...config.sections, tool_instructions: toolInstructions } };
  }
  /**
   * Appends the scratch/repoless guidance as trailing `content`, so it composes
   * on top of whatever the base config carries — including a `replace` prompt.
   */
  _withWorkspacelessScratch(config, context) {
    if (!context.workspaceless) {
      return config;
    }
    return appendSystemMessageContent(config, COPILOT_AGENT_HOST_WORKSPACELESS_INSTRUCTIONS);
  }
};

var agentHostPromptRegistry = new AgentHostPromptRegistry();
export { AgentHostPromptRegistry, agentHostPromptRegistry };
