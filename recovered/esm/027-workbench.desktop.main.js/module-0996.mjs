// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/promptSyntax/config/promptFileLocations.ts
import { compareIgnoreCase } from "./module-0030.mjs";
import { basename2, dirname2 } from "./module-0034.mjs";


// src/vs/workbench/contrib/chat/common/promptSyntax/config/promptFileLocations.ts
var PROMPT_FILE_EXTENSION = ".prompt.md";

var INSTRUCTION_FILE_EXTENSION = ".instructions.md";

var LEGACY_MODE_FILE_EXTENSION = ".chatmode.md";

var AGENT_FILE_EXTENSION = ".agent.md";

var SKILL_FILENAME = "SKILL.md";

function isSkillFilename(filename) {
  return compareIgnoreCase(filename, SKILL_FILENAME) === 0;
}

var VALID_SKILL_NAME_REGEX = /^[a-z0-9-]+$/;

var AGENT_MD_FILENAME = "AGENTS.md";

var CLAUDE_MD_FILENAME = "CLAUDE.md";

var CLAUDE_LOCAL_MD_FILENAME = "CLAUDE.local.md";

var CLAUDE_CONFIG_FOLDER = ".claude";

var COPILOT_CONFIG_FOLDER = ".copilot";

var COPILOT_CUSTOM_INSTRUCTIONS_FILENAME = "copilot-instructions.md";

var VOICE_INSTRUCTIONS_FILENAME = "voice.md";

var DICTATION_INSTRUCTIONS_FILENAME = "dictation.md";

var GITHUB_CONFIG_FOLDER = ".github";

var PROMPT_DEFAULT_SOURCE_FOLDER = ".github/prompts";

var INSTRUCTIONS_DEFAULT_SOURCE_FOLDER = ".github/instructions";

var LEGACY_MODE_DEFAULT_SOURCE_FOLDER = ".github/chatmodes";

var AGENTS_SOURCE_FOLDER = ".github/agents";

var CLAUDE_AGENTS_SOURCE_FOLDER = ".claude/agents";

var COPILOT_USER_AGENTS_SOURCE_FOLDER = "~/.copilot/agents";

var CLAUDE_RULES_SOURCE_FOLDER = ".claude/rules";

var DEFAULT_SKILL_SOURCE_FOLDERS = [
  { path: ".agents/skills", source: "agents-workspace" /* AgentsWorkspace */, storage: "local" /* local */ },
  { path: ".github/skills", source: "github-workspace" /* GitHubWorkspace */, storage: "local" /* local */ },
  { path: ".claude/skills", source: "claude-workspace" /* ClaudeWorkspace */, storage: "local" /* local */ },
  { path: "~/.agents/skills", source: "agents-personal" /* AgentsPersonal */, storage: "user" /* user */ },
  { path: "~/.copilot/skills", source: "copilot-personal" /* CopilotPersonal */, storage: "user" /* user */ },
  { path: "~/.claude/skills", source: "claude-personal" /* ClaudePersonal */, storage: "user" /* user */ }
];

var DEFAULT_INSTRUCTIONS_SOURCE_FOLDERS = [
  { path: INSTRUCTIONS_DEFAULT_SOURCE_FOLDER, source: "github-workspace" /* GitHubWorkspace */, storage: "local" /* local */ },
  { path: CLAUDE_RULES_SOURCE_FOLDER, source: "claude-workspace" /* ClaudeWorkspace */, storage: "local" /* local */ },
  { path: "~/.copilot/instructions", source: "copilot-personal" /* CopilotPersonal */, storage: "user" /* user */ },
  { path: "~/" + CLAUDE_RULES_SOURCE_FOLDER, source: "claude-personal" /* ClaudePersonal */, storage: "user" /* user */ }
];

var DEFAULT_PROMPT_SOURCE_FOLDERS = [
  { path: PROMPT_DEFAULT_SOURCE_FOLDER, source: "github-workspace" /* GitHubWorkspace */, storage: "local" /* local */ }
];

var DEFAULT_AGENT_SOURCE_FOLDERS = [
  { path: AGENTS_SOURCE_FOLDER, source: "github-workspace" /* GitHubWorkspace */, storage: "local" /* local */ },
  { path: CLAUDE_AGENTS_SOURCE_FOLDER, source: "claude-workspace" /* ClaudeWorkspace */, storage: "local" /* local */ },
  { path: COPILOT_USER_AGENTS_SOURCE_FOLDER, source: "copilot-personal" /* CopilotPersonal */, storage: "user" /* user */ },
  { path: "~/" + CLAUDE_AGENTS_SOURCE_FOLDER, source: "claude-personal" /* ClaudePersonal */, storage: "user" /* user */ }
];

var DEFAULT_HOOK_FILE_PATHS = [
  { path: ".github/hooks", source: "github-workspace" /* GitHubWorkspace */, storage: "local" /* local */ },
  { path: ".claude/settings.local.json", source: "claude-workspace-local" /* ClaudeWorkspaceLocal */, storage: "local" /* local */ },
  { path: ".claude/settings.json", source: "claude-workspace" /* ClaudeWorkspace */, storage: "local" /* local */ },
  { path: "~/.copilot/hooks", source: "copilot-personal" /* CopilotPersonal */, storage: "user" /* user */ },
  { path: "~/.claude/settings.json", source: "claude-personal" /* ClaudePersonal */, storage: "user" /* user */ }
];

function isInAgentsFolder(fileUri) {
  const dir = dirname2(fileUri).path;
  return dir.endsWith("/" + AGENTS_SOURCE_FOLDER) || dir.endsWith("/" + CLAUDE_AGENTS_SOURCE_FOLDER) || isInCopilotAgentsFolder(fileUri);
}

function isInClaudeAgentsFolder(fileUri) {
  const dir = dirname2(fileUri).path;
  return dir.endsWith("/" + CLAUDE_AGENTS_SOURCE_FOLDER);
}

function isInCopilotAgentsFolder(fileUri) {
  const dir = dirname2(fileUri).path;
  return dir.endsWith(COPILOT_USER_AGENTS_SOURCE_FOLDER.substring(1));
}

function isInClaudeRulesFolder(fileUri) {
  const path = fileUri.path;
  return path.includes("/" + CLAUDE_RULES_SOURCE_FOLDER + "/");
}

function getPromptFileType(fileUri) {
  const filename = basename2(fileUri);
  if (filename.endsWith(PROMPT_FILE_EXTENSION)) {
    return "prompt" /* prompt */;
  }
  if (filename.endsWith(INSTRUCTION_FILE_EXTENSION) || filename === COPILOT_CUSTOM_INSTRUCTIONS_FILENAME) {
    return "instructions" /* instructions */;
  }
  if (filename.endsWith(LEGACY_MODE_FILE_EXTENSION) || filename.endsWith(AGENT_FILE_EXTENSION)) {
    return "agent" /* agent */;
  }
  if (isSkillFilename(filename)) {
    return "skill" /* skill */;
  }
  if (filename.endsWith(".md") && filename !== "README.md" && isInAgentsFolder(fileUri)) {
    return "agent" /* agent */;
  }
  if (filename.endsWith(".md") && filename !== "README.md" && isInClaudeRulesFolder(fileUri)) {
    return "instructions" /* instructions */;
  }
  if (filename.toLowerCase().endsWith(".json")) {
    return "hook" /* hook */;
  }
  return void 0;
}

function isPromptOrInstructionsFile(fileUri) {
  return getPromptFileType(fileUri) !== void 0;
}

function getPromptFileExtension(type) {
  switch (type) {
    case "instructions" /* instructions */:
      return INSTRUCTION_FILE_EXTENSION;
    case "prompt" /* prompt */:
      return PROMPT_FILE_EXTENSION;
    case "agent" /* agent */:
      return AGENT_FILE_EXTENSION;
    case "skill" /* skill */:
      return SKILL_FILENAME;
    case "hook" /* hook */:
      return ".json";
    default:
      throw new Error("Unknown prompt type");
  }
}

function getPromptFileDefaultLocations(type) {
  switch (type) {
    case "instructions" /* instructions */:
      return DEFAULT_INSTRUCTIONS_SOURCE_FOLDERS;
    case "prompt" /* prompt */:
      return DEFAULT_PROMPT_SOURCE_FOLDERS;
    case "agent" /* agent */:
      return DEFAULT_AGENT_SOURCE_FOLDERS;
    case "skill" /* skill */:
      return DEFAULT_SKILL_SOURCE_FOLDERS;
    case "hook" /* hook */:
      return DEFAULT_HOOK_FILE_PATHS;
    default:
      throw new Error("Unknown prompt type");
  }
}

function getSkillFolderName(fileUri) {
  return basename2(dirname2(fileUri));
}

function getCleanPromptName(fileUri) {
  const fileName = basename2(fileUri);
  const extensions = [
    PROMPT_FILE_EXTENSION,
    INSTRUCTION_FILE_EXTENSION,
    LEGACY_MODE_FILE_EXTENSION,
    AGENT_FILE_EXTENSION
  ];
  for (const ext of extensions) {
    if (fileName.endsWith(ext)) {
      return basename2(fileUri, ext);
    }
  }
  if (fileName === COPILOT_CUSTOM_INSTRUCTIONS_FILENAME) {
    return basename2(fileUri, ".md");
  }
  if (isSkillFilename(fileName)) {
    return getSkillFolderName(fileUri);
  }
  if (fileName.endsWith(".md") && fileName !== "README.md" && isInAgentsFolder(fileUri)) {
    return basename2(fileUri, ".md");
  }
  if (fileName.endsWith(".md") && fileName !== "README.md" && isInClaudeRulesFolder(fileUri)) {
    return basename2(fileUri, ".md");
  }
  return basename2(fileUri);
}
export { isSkillFilename, isInAgentsFolder, isInClaudeAgentsFolder, isInCopilotAgentsFolder, isInClaudeRulesFolder, getPromptFileType, isPromptOrInstructionsFile, getPromptFileExtension, getPromptFileDefaultLocations, getSkillFolderName, getCleanPromptName, PROMPT_FILE_EXTENSION, INSTRUCTION_FILE_EXTENSION, LEGACY_MODE_FILE_EXTENSION, AGENT_FILE_EXTENSION, SKILL_FILENAME, VALID_SKILL_NAME_REGEX, AGENT_MD_FILENAME, CLAUDE_MD_FILENAME, CLAUDE_LOCAL_MD_FILENAME, CLAUDE_CONFIG_FOLDER, COPILOT_CONFIG_FOLDER, COPILOT_CUSTOM_INSTRUCTIONS_FILENAME, VOICE_INSTRUCTIONS_FILENAME, DICTATION_INSTRUCTIONS_FILENAME, GITHUB_CONFIG_FOLDER, PROMPT_DEFAULT_SOURCE_FOLDER, INSTRUCTIONS_DEFAULT_SOURCE_FOLDER, LEGACY_MODE_DEFAULT_SOURCE_FOLDER, AGENTS_SOURCE_FOLDER, CLAUDE_AGENTS_SOURCE_FOLDER, COPILOT_USER_AGENTS_SOURCE_FOLDER, CLAUDE_RULES_SOURCE_FOLDER, DEFAULT_SKILL_SOURCE_FOLDERS, DEFAULT_INSTRUCTIONS_SOURCE_FOLDERS, DEFAULT_PROMPT_SOURCE_FOLDERS, DEFAULT_AGENT_SOURCE_FOLDERS, DEFAULT_HOOK_FILE_PATHS };
