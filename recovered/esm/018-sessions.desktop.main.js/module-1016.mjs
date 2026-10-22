// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/promptSyntax/languageProviders/promptFileAttributes.ts
import { PromptHeaderAttributes } from "./module-1004.mjs";
import { localize } from "./module-0001.mjs";
import { SpecedToolAliases } from "./module-0991.mjs";
import { URI } from "./module-0032.mjs";
import { dirname2 } from "./module-0034.mjs";
import { CLAUDE_AGENTS_SOURCE_FOLDER, isInClaudeRulesFolder } from "./module-0997.mjs";


// src/vs/workbench/contrib/chat/common/promptSyntax/languageProviders/promptFileAttributes.ts
var GithubPromptHeaderAttributes;

((GithubPromptHeaderAttributes2) => {
  GithubPromptHeaderAttributes2.mcpServers = "mcp-servers";
  GithubPromptHeaderAttributes2.github = "github";
})(GithubPromptHeaderAttributes || (GithubPromptHeaderAttributes = {}));

var ClaudeHeaderAttributes;

((ClaudeHeaderAttributes2) => {
  ClaudeHeaderAttributes2.disallowedTools = "disallowedTools";
})(ClaudeHeaderAttributes || (ClaudeHeaderAttributes = {}));

function isTarget(value2) {
  return value2 === "vscode" /* VSCode */ || value2 === "github-copilot" /* GitHubCopilot */ || value2 === "claude" /* Claude */ || value2 === "undefined" /* Undefined */;
}

var booleanAttributeEnumValues = [
  { name: "true" },
  { name: "false" }
];

var targetAttributeEnumValues = [
  { name: "vscode" },
  { name: "github-copilot" }
];

var promptFileAttributes = {
  [PromptHeaderAttributes.name]: {
    type: "scalar",
    description: localize(13164, null)
  },
  [PromptHeaderAttributes.description]: {
    type: "scalar",
    description: localize(13162, null)
  },
  [PromptHeaderAttributes.argumentHint]: {
    type: "scalar",
    description: localize(13161, null)
  },
  [PromptHeaderAttributes.model]: {
    type: "scalar | sequence",
    description: localize(13163, null)
  },
  [PromptHeaderAttributes.tools]: {
    type: "scalar | sequence",
    description: localize(13165, null),
    defaults: ["[]", "['search', 'edit', 'web']"]
  },
  [PromptHeaderAttributes.agent]: {
    type: "scalar",
    description: localize(13160, null)
  },
  [PromptHeaderAttributes.mode]: {
    type: "scalar",
    description: localize(13160, null)
  }
};

var instructionAttributes = {
  [PromptHeaderAttributes.name]: {
    type: "scalar",
    description: localize(13159, null)
  },
  [PromptHeaderAttributes.description]: {
    type: "scalar",
    description: localize(13157, null)
  },
  [PromptHeaderAttributes.applyTo]: {
    type: "scalar",
    description: localize(13156, null),
    defaults: [
      "'**'",
      "'**/*.ts, **/*.js'",
      "'**/*.php'",
      "'**/*.py'"
    ]
  },
  [PromptHeaderAttributes.excludeAgent]: {
    type: "scalar | sequence",
    description: localize(13158, null)
  }
};

var customAgentAttributes = {
  [PromptHeaderAttributes.name]: {
    type: "scalar",
    description: localize(13151, null)
  },
  [PromptHeaderAttributes.description]: {
    type: "scalar",
    description: localize(13144, null)
  },
  [PromptHeaderAttributes.argumentHint]: {
    type: "scalar",
    description: localize(13143, null)
  },
  [PromptHeaderAttributes.model]: {
    type: "scalar | sequence",
    description: localize(13150, null)
  },
  [PromptHeaderAttributes.reasoningEffort]: {
    type: "scalar",
    description: localize(13152, null),
    enums: [
      { name: "low" },
      { name: "medium" },
      { name: "high" },
      { name: "xhigh" },
      { name: "max" }
    ]
  },
  [PromptHeaderAttributes.tools]: {
    type: "scalar | sequence",
    description: localize(13154, null),
    defaults: ["[]", "[search, edit, web]"]
  },
  [PromptHeaderAttributes.handOffs]: {
    type: "sequence",
    description: localize(13147, null)
  },
  [PromptHeaderAttributes.target]: {
    type: "scalar",
    description: localize(13153, null),
    enums: targetAttributeEnumValues
  },
  [PromptHeaderAttributes.infer]: {
    type: "scalar",
    description: localize(13149, null),
    enums: booleanAttributeEnumValues
  },
  [PromptHeaderAttributes.agents]: {
    type: "sequence",
    description: localize(13142, null),
    defaults: ['["*"]']
  },
  [PromptHeaderAttributes.userInvocable]: {
    type: "scalar",
    description: localize(13155, null),
    enums: booleanAttributeEnumValues
  },
  [PromptHeaderAttributes.disableModelInvocation]: {
    type: "scalar",
    description: localize(13145, null),
    enums: booleanAttributeEnumValues
  },
  [PromptHeaderAttributes.advancedOptions]: {
    type: "map",
    description: localize(13141, null)
  },
  [GithubPromptHeaderAttributes.github]: {
    type: "map",
    description: localize(13146, null)
  },
  [PromptHeaderAttributes.hooks]: {
    type: "map",
    description: localize(13148, null)
  }
};

var skillAttributes = {
  [PromptHeaderAttributes.name]: {
    type: "scalar",
    description: localize(13174, null)
  },
  [PromptHeaderAttributes.description]: {
    type: "scalar",
    description: localize(13170, null)
  },
  [PromptHeaderAttributes.argumentHint]: {
    type: "scalar",
    description: localize(13166, null)
  },
  [PromptHeaderAttributes.userInvocable]: {
    type: "scalar",
    description: localize(13175, null),
    enums: booleanAttributeEnumValues
  },
  [PromptHeaderAttributes.disableModelInvocation]: {
    type: "scalar",
    description: localize(13171, null),
    enums: booleanAttributeEnumValues
  },
  [PromptHeaderAttributes.license]: {
    type: "scalar | map",
    description: localize(13172, null)
  },
  [PromptHeaderAttributes.compatibility]: {
    type: "scalar | map",
    description: localize(13167, null)
  },
  [PromptHeaderAttributes.metadata]: {
    type: "map",
    description: localize(13173, null)
  },
  [PromptHeaderAttributes.context]: {
    type: "scalar",
    description: localize(13168, null),
    enums: [{ name: "fork", description: localize(13169, null) }]
  }
};

var allAttributeNames = {
  ["prompt" /* prompt */]: Object.keys(promptFileAttributes),
  ["instructions" /* instructions */]: Object.keys(instructionAttributes),
  ["agent" /* agent */]: Object.keys(customAgentAttributes),
  ["skill" /* skill */]: Object.keys(skillAttributes),
  ["hook" /* hook */]: []
  // hooks are JSON files, not markdown with YAML frontmatter
};

var githubCopilotAgentAttributeNames = [PromptHeaderAttributes.name, PromptHeaderAttributes.description, PromptHeaderAttributes.tools, PromptHeaderAttributes.target, GithubPromptHeaderAttributes.mcpServers, GithubPromptHeaderAttributes.github, PromptHeaderAttributes.infer];

var recommendedAttributeNames = {
  ["prompt" /* prompt */]: allAttributeNames["prompt" /* prompt */].filter((name) => !isNonRecommendedAttribute(name)),
  ["instructions" /* instructions */]: allAttributeNames["instructions" /* instructions */].filter((name) => !isNonRecommendedAttribute(name)),
  ["agent" /* agent */]: allAttributeNames["agent" /* agent */].filter((name) => !isNonRecommendedAttribute(name)),
  ["skill" /* skill */]: allAttributeNames["skill" /* skill */].filter((name) => !isNonRecommendedAttribute(name)),
  ["hook" /* hook */]: []
  // hooks are JSON files, not markdown with YAML frontmatter
};

function getValidAttributeNames(promptType, includeNonRecommended, target) {
  if (target === "claude" /* Claude */) {
    if (promptType === "instructions" /* instructions */) {
      return Object.keys(claudeRulesAttributes);
    }
    return Object.keys(claudeAgentAttributes);
  } else if (target === "github-copilot" /* GitHubCopilot */) {
    if (promptType === "agent" /* agent */) {
      return githubCopilotAgentAttributeNames;
    }
  }
  return includeNonRecommended ? allAttributeNames[promptType] : recommendedAttributeNames[promptType];
}

function isNonRecommendedAttribute(attributeName) {
  return attributeName === PromptHeaderAttributes.advancedOptions || attributeName === PromptHeaderAttributes.excludeAgent || attributeName === PromptHeaderAttributes.mode || attributeName === PromptHeaderAttributes.infer;
}

function getAttributeDefinition(attributeName, promptType, target) {
  switch (promptType) {
    case "instructions" /* instructions */:
      if (target === "claude" /* Claude */) {
        return claudeRulesAttributes[attributeName];
      }
      return instructionAttributes[attributeName];
    case "skill" /* skill */:
      return skillAttributes[attributeName];
    case "agent" /* agent */:
      if (target === "claude" /* Claude */) {
        return claudeAgentAttributes[attributeName];
      }
      return customAgentAttributes[attributeName];
    case "prompt" /* prompt */:
      return promptFileAttributes[attributeName];
    default:
      return void 0;
  }
}

var knownGithubCopilotTools = [
  { name: SpecedToolAliases.execute, description: localize(13138, null) },
  { name: SpecedToolAliases.read, description: localize(13139, null) },
  { name: SpecedToolAliases.edit, description: localize(13137, null) },
  { name: SpecedToolAliases.search, description: localize(13140, null) },
  { name: SpecedToolAliases.agent, description: localize(13136, null) }
];

var knownClaudeTools = [
  { name: "Bash", description: localize(13110, null), toolEquivalent: [SpecedToolAliases.execute] },
  { name: "Edit", description: localize(13111, null), toolEquivalent: ["edit/editNotebook", "edit/editFiles"] },
  { name: "Glob", description: localize(13112, null), toolEquivalent: ["search/fileSearch"] },
  { name: "Grep", description: localize(13113, null), toolEquivalent: ["search/textSearch"] },
  { name: "Read", description: localize(13129, null), toolEquivalent: ["read/readFile", "read/getNotebookSummary"] },
  { name: "Write", description: localize(13135, null), toolEquivalent: ["edit/createDirectory", "edit/createFile", "edit/createJupyterNotebook"] },
  { name: "WebFetch", description: localize(13133, null), toolEquivalent: [SpecedToolAliases.web] },
  { name: "WebSearch", description: localize(13134, null), toolEquivalent: [SpecedToolAliases.web] },
  { name: "Task", description: localize(13132, null), toolEquivalent: [SpecedToolAliases.agent] },
  { name: "Skill", description: localize(13130, null), toolEquivalent: [] },
  { name: "LSP", description: localize(13116, null), toolEquivalent: [] },
  { name: "NotebookEdit", description: localize(13121, null), toolEquivalent: ["edit/editNotebook"] },
  { name: "AskUserQuestion", description: localize(13109, null), toolEquivalent: ["vscode/askQuestions"] },
  { name: "MCPSearch", description: localize(13117, null), toolEquivalent: [] }
];

var knownClaudeModels = [
  { name: "sonnet", description: localize(13131, null), modelEquivalent: "Claude Sonnet 4.5 (copilot)" },
  { name: "opus", description: localize(13122, null), modelEquivalent: "Claude Opus 4.6 (copilot)" },
  { name: "haiku", description: localize(13114, null), modelEquivalent: "Claude Haiku 4.5 (copilot)" },
  { name: "inherit", description: localize(13115, null), modelEquivalent: void 0 }
];

function mapClaudeModels(claudeModelNames) {
  const result = [];
  for (const name of claudeModelNames) {
    const claudeModel = knownClaudeModels.find((model) => model.name === name);
    if (claudeModel && claudeModel.modelEquivalent) {
      result.push(claudeModel.modelEquivalent);
    }
  }
  return result;
}

function mapClaudeTools(claudeToolNames) {
  const result = [];
  for (const name of claudeToolNames) {
    const claudeTool = knownClaudeTools.find((tool) => tool.name === name);
    if (claudeTool) {
      result.push(...claudeTool.toolEquivalent);
    }
  }
  return result;
}

var claudeAgentAttributes = {
  "name": {
    type: "scalar",
    description: localize(13103, null)
  },
  "description": {
    type: "scalar",
    description: localize(13097, null)
  },
  "tools": {
    type: "sequence",
    description: localize(13108, null),
    defaults: ["Read, Edit, Bash"],
    items: knownClaudeTools
  },
  "disallowedTools": {
    type: "sequence",
    description: localize(13098, null),
    defaults: ["Write, Edit, Bash"],
    items: knownClaudeTools
  },
  "model": {
    type: "scalar",
    description: localize(13102, null),
    defaults: ["sonnet", "opus", "haiku", "inherit"],
    enums: knownClaudeModels
  },
  "permissionMode": {
    type: "scalar",
    description: localize(13104, null),
    defaults: ["default", "acceptEdits", "dontAsk", "bypassPermissions", "plan"],
    enums: [
      { name: "default", description: localize(13125, null) },
      { name: "acceptEdits", description: localize(13123, null) },
      { name: "plan", description: localize(13128, null) },
      { name: "delegate", description: localize(13126, null) },
      { name: "dontAsk", description: localize(13127, null) },
      { name: "bypassPermissions", description: localize(13124, null) }
    ]
  },
  "skills": {
    type: "sequence",
    description: localize(13107, null)
  },
  "mcpServers": {
    type: "sequence",
    description: localize(13100, null)
  },
  "hooks": {
    type: "object",
    description: localize(13099, null)
  },
  "memory": {
    type: "scalar",
    description: localize(13101, null),
    defaults: ["user", "project", "local"],
    enums: [
      { name: "user", description: localize(13120, null) },
      { name: "project", description: localize(13119, null) },
      { name: "local", description: localize(13118, null) }
    ]
  }
};

var claudeRulesAttributes = {
  "description": {
    type: "scalar",
    description: localize(13105, null)
  },
  "paths": {
    type: "sequence",
    description: localize(13106, null)
  }
};

function isVSCodeOrDefaultTarget(target) {
  return target === "vscode" /* VSCode */ || target === "undefined" /* Undefined */;
}

function getTarget(promptType, header2) {
  const uri4 = header2 instanceof URI ? header2 : header2.uri;
  if (promptType === "agent" /* agent */) {
    const parentDir = dirname2(uri4);
    if (parentDir.path.endsWith(`/${CLAUDE_AGENTS_SOURCE_FOLDER}`)) {
      return "claude" /* Claude */;
    }
    if (!(header2 instanceof URI)) {
      const target = header2.target;
      if (target === "github-copilot" /* GitHubCopilot */ || target === "vscode" /* VSCode */) {
        return target;
      }
    }
    return "undefined" /* Undefined */;
  } else if (promptType === "instructions" /* instructions */) {
    if (isInClaudeRulesFolder(uri4)) {
      return "claude" /* Claude */;
    }
  }
  return "undefined" /* Undefined */;
}
export { isTarget, getValidAttributeNames, isNonRecommendedAttribute, getAttributeDefinition, mapClaudeModels, mapClaudeTools, isVSCodeOrDefaultTarget, getTarget, GithubPromptHeaderAttributes, ClaudeHeaderAttributes, booleanAttributeEnumValues, targetAttributeEnumValues, promptFileAttributes, instructionAttributes, customAgentAttributes, skillAttributes, allAttributeNames, githubCopilotAgentAttributeNames, recommendedAttributeNames, knownGithubCopilotTools, knownClaudeTools, knownClaudeModels, claudeAgentAttributes, claudeRulesAttributes };
