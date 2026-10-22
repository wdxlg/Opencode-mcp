// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/tools/builtinTools/setArtifactRulesTool.ts
import { localize } from "./module-0001.mjs";
import { ToolDataSource } from "./module-0990.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatArtifactsService } from "./module-1480.mjs";


// src/vs/workbench/contrib/chat/common/tools/builtinTools/setArtifactRulesTool.ts
var SetArtifactRulesToolId = "setArtifactRules";

var artifactGroupConfigSchema = {
  type: "object",
  properties: {
    groupName: {
      type: "string",
      description: "Display name for the artifact group."
    },
    onlyShowGroup: {
      type: "boolean",
      description: "When true, show only the group header instead of individual items."
    }
  },
  required: ["groupName"]
};

var inputSchema2 = {
  type: "object",
  properties: {
    byMimeType: {
      type: "object",
      description: "Rules for extracting artifacts from tool results by MIME type. Maps MIME type patterns (e.g. 'image/*') to group configuration.",
      additionalProperties: artifactGroupConfigSchema
    },
    byFilePath: {
      type: "object",
      description: "Rules for extracting artifacts from written files by file path glob pattern. Maps glob patterns (e.g. '**/*plan*.md') to group configuration.",
      additionalProperties: artifactGroupConfigSchema
    },
    byMemoryFilePath: {
      type: "object",
      description: "Rules for extracting artifacts from memory tool writes by memory file path glob pattern. Maps glob patterns to group configuration.",
      additionalProperties: artifactGroupConfigSchema
    }
  }
};

var SetArtifactRulesToolData = {
  id: SetArtifactRulesToolId,
  toolReferenceName: "artifactRules",
  legacyToolReferenceFullNames: [],
  displayName: localize(13445, null),
  modelDescription: 'Override the artifact extraction rules for this session. Rules control which tool results, files, and memory writes are automatically surfaced as artifacts.\n\nProvide rules as MIME type patterns, file path globs, or memory file path globs, each mapped to a group configuration with a groupName and optional onlyShowGroup flag.\n\nExamples:\n- byMimeType: { "image/*": { "groupName": "Screenshots", "onlyShowGroup": true } }\n- byFilePath: { "**/*plan*.md": { "groupName": "Plans" } }\n- byMemoryFilePath: { "**/*plan*.md": { "groupName": "Plans" } }\n\nThis fully replaces any settings-based rules for the duration of this session.',
  canBeReferencedInPrompt: true,
  source: ToolDataSource.Internal,
  inputSchema: inputSchema2
};

var SetArtifactRulesTool = class {
  constructor(_chatArtifactsService) {
    this._chatArtifactsService = _chatArtifactsService;
  }
  async prepareToolInvocation(_context, _token) {
    return {
      pastTenseMessage: new MarkdownString(localize(13446, null)),
      presentation: "hidden" /* Hidden */
    };
  }
  async invoke(invocation, _countTokens, _progress, _token) {
    const args2 = invocation.parameters;
    const chatSessionResource = invocation.context?.sessionResource;
    if (!chatSessionResource) {
      return {
        content: [{ kind: "text", value: "Error: No session resource available" }]
      };
    }
    const rules = {
      byMimeType: args2.byMimeType,
      byFilePath: args2.byFilePath,
      byMemoryFilePath: args2.byMemoryFilePath
    };
    this._chatArtifactsService.getArtifacts(chatSessionResource).setRuleOverrides(rules);
    return {
      content: [{ kind: "text", value: localize(13447, null) }]
    };
  }
};

SetArtifactRulesTool = __decorateClass([
  __decorateParam(0, IChatArtifactsService)
], SetArtifactRulesTool);
export { SetArtifactRulesToolId, artifactGroupConfigSchema, inputSchema2, SetArtifactRulesToolData, SetArtifactRulesTool };
