// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentCustomizationContentExpander.ts
import { URI } from "./module-0032.mjs";
import { joinPath } from "./module-0034.mjs";
import { SKILL_FILENAME } from "./module-0997.mjs";
import { extname } from "./module-0026.mjs";
import { parseFrontMatter } from "./module-1003.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentCustomizationContentExpander.ts
var AgentCustomizationContentExpander = class {
  constructor(fileService, logService) {
    this.fileService = fileService;
    this.logService = logService;
  }
  async expandPluginContents(pluginUri, groupKey, isBundleItem, source, pluginLabel, token) {
    const fsRoot = pluginUri;
    const children = [];
    try {
      if (!await this.fileService.canHandleResource(fsRoot)) {
        return [];
      }
      if (token.isCancellationRequested) {
        return [];
      }
      const dirNames = ["agents", "skills", "commands", "rules"];
      const promptTypes = ["agent" /* agent */, "skill" /* skill */, "prompt" /* prompt */, "instructions" /* instructions */];
      const stats = await this.fileService.resolveAll(dirNames.map((name) => ({ resource: URI.joinPath(fsRoot, name) })));
      if (token.isCancellationRequested) {
        return [];
      }
      for (let i2 = 0; i2 < dirNames.length; i2++) {
        const stat = stats[i2];
        const promptType = promptTypes[i2];
        if (!stat.success || !stat.stat?.isDirectory || !stat.stat.children) {
          continue;
        }
        if (promptType === "skill" /* skill */) {
          children.push(...await this.collectFromSkillDir(stat.stat.children, pluginUri, source, groupKey, isBundleItem, pluginLabel, token));
        } else {
          children.push(...await this.collectFromRegularDir(stat.stat.children, pluginUri, source, promptType, groupKey, isBundleItem, pluginLabel, token));
        }
      }
      children.sort((a, b) => `${a.type}:${a.name}`.localeCompare(`${b.type}:${b.name}`));
    } catch (err) {
      this.logService.trace(`[AgentCustomizationContentExpander] Failed to expand plugin ${pluginUri.toString()}: ${err}`);
      return [];
    }
    return children;
  }
  /**
   * Emits one item per skill subfolder that contains a SKILL.md file.
   * The skill metadata comes from SKILL.md frontmatter.
   */
  async collectFromSkillDir(entries2, pluginUri, source, groupKey, isBundleItem, pluginLabel, token) {
    const eligible = [];
    const readMetaDataPromises = [];
    for (const child of entries2) {
      if (child.name.startsWith(".")) {
        continue;
      }
      if (!child.isDirectory) {
        continue;
      }
      eligible.push(child);
      readMetaDataPromises.push(this.readPromptMetadata(joinPath(child.resource, SKILL_FILENAME), token));
    }
    const promptMetadata = await Promise.all(readMetaDataPromises);
    if (token.isCancellationRequested) {
      return [];
    }
    const items = [];
    for (let i2 = 0; i2 < eligible.length; i2++) {
      const child = eligible[i2];
      const meta = promptMetadata[i2];
      if (!meta) {
        continue;
      }
      const uri4 = joinPath(child.resource, SKILL_FILENAME);
      const name = meta.name ?? child.name;
      const description = meta.description;
      const userInvocable = meta.userInvocable;
      items.push({
        uri: uri4,
        type: "skill" /* skill */,
        name,
        description,
        source,
        groupKey,
        extensionId: void 0,
        pluginUri: isBundleItem ? void 0 : pluginUri,
        pluginLabel: isBundleItem ? void 0 : pluginLabel,
        userInvocable
      });
    }
    return items;
  }
  /**
   * Emits one item per markdown file for agent/rules/command folders.
   * Agents and instructions read frontmatter name/description, and
   * agents additionally surface userInvocable. Instruction (rules)
   * folders additionally accept `.mdc` files per the Open Plugins spec.
   */
  async collectFromRegularDir(entries2, pluginUri, source, promptType, groupKey, isBundleItem, pluginLabel, token) {
    const eligible = [];
    for (const child of entries2) {
      if (child.name.startsWith(".")) {
        continue;
      }
      if (child.isDirectory) {
        continue;
      }
      const ext = extname(child.name);
      if (ext !== ".md" && !(promptType === "instructions" /* instructions */ && ext === ".mdc")) {
        continue;
      }
      eligible.push(child);
    }
    const parseMetadata = promptType === "agent" /* agent */ || promptType === "instructions" /* instructions */;
    const promptMetadata = parseMetadata ? await Promise.all(eligible.map((child) => this.readPromptMetadata(child.resource, token))) : void 0;
    if (token.isCancellationRequested) {
      return [];
    }
    const items = [];
    for (let i2 = 0; i2 < eligible.length; i2++) {
      const child = eligible[i2];
      const meta = promptMetadata?.[i2];
      items.push({
        uri: child.resource,
        type: promptType,
        name: meta?.name ?? stripPromptFileExtensions(child.name),
        description: meta?.description,
        source,
        groupKey,
        extensionId: void 0,
        pluginUri: isBundleItem ? void 0 : pluginUri,
        pluginLabel: isBundleItem ? void 0 : pluginLabel,
        userInvocable: promptType === "agent" /* agent */ ? meta?.userInvocable : void 0
      });
    }
    return items;
  }
  /**
   * Reads a prompt markdown file and returns selected frontmatter
   * metadata. Returns `undefined` when the file is not markdown, or
   * when it cannot be read/parsed.
   */
  async readPromptMetadata(promptFileUri, token) {
    if (extname(promptFileUri.path) !== ".md") {
      return void 0;
    }
    try {
      const content = await this.fileService.readFile(promptFileUri);
      if (token.isCancellationRequested) {
        return void 0;
      }
      const frontmatter = parseFrontMatter(content.value.toString());
      if (frontmatter) {
        const name = frontmatter.getStringValue("name");
        const description = frontmatter.getStringValue("description");
        const userInvocableStr = frontmatter.getStringValue("user-invocable");
        const userInvocable = userInvocableStr === "true" ? true : userInvocableStr === "false" ? false : void 0;
        return { name, description, userInvocable };
      }
      return { name: void 0, description: void 0, userInvocable: void 0 };
    } catch (err) {
      this.logService.trace(`[AgentCustomizationContentExpander] Failed to read prompt metadata ${promptFileUri.toString()}: ${err}`);
      return void 0;
    }
  }
};

function stripPromptFileExtensions(filename) {
  const ext = extname(filename);
  if (!ext) {
    return filename;
  }
  const stem = filename.slice(0, -ext.length);
  const dotInStem = stem.lastIndexOf(".");
  return dotInStem > 0 ? stem.slice(0, dotInStem) : stem;
}
export { stripPromptFileExtensions, AgentCustomizationContentExpander };
