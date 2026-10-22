// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/promptsService.ts
import { FileAccess } from "./module-0033.mjs";
import { PromptsService } from "./module-1031.mjs";
import { basename2, joinPath } from "./module-0034.mjs";
import { SKILL_FILENAME } from "./module-0997.mjs";
import { CancellationToken } from "./module-0025.mjs";


// src/vs/sessions/contrib/chat/browser/promptsService.ts
var BUILTIN_SKILLS_URI = FileAccess.asFileUri("vs/sessions/skills");

var AgenticPromptsService = class extends PromptsService {
  async getBuiltinSkills() {
    if (!this._builtinSkillsCache) {
      this._builtinSkillsCache = this.discoverBuiltinSkills();
    }
    return this._builtinSkillsCache;
  }
  async discoverBuiltinSkills() {
    try {
      const stat = await this.fileService.resolve(BUILTIN_SKILLS_URI);
      if (!stat.children) {
        return [];
      }
      const skills = [];
      for (const child of stat.children) {
        if (!child.isDirectory) {
          continue;
        }
        const skillFileUri = joinPath(child.resource, SKILL_FILENAME);
        try {
          const parsed = await this.parseNew(skillFileUri, CancellationToken.None);
          const rawName = parsed.header?.name;
          const rawDescription = parsed.header?.description;
          if (!rawName || !rawDescription) {
            continue;
          }
          const name = sanitizeSkillText(rawName, 64);
          const description = sanitizeSkillText(rawDescription, 1024);
          const folderName = basename2(child.resource);
          if (name !== folderName) {
            continue;
          }
          skills.push({
            uri: skillFileUri,
            storage: "builtin" /* builtIn */,
            name,
            description,
            disableModelInvocation: parsed.header?.disableModelInvocation === true,
            userInvocable: parsed.header?.userInvocable !== false
          });
        } catch (e4) {
          this.logger.warn(`[AgenticPromptsService] Failed to parse built-in skill: ${skillFileUri}`, e4 instanceof Error ? e4.message : String(e4));
        }
      }
      return skills;
    } catch {
      return [];
    }
  }
  async getBuiltinSkillPaths() {
    const skills = await this.getBuiltinSkills();
    return skills.map((s) => ({
      uri: s.uri,
      storage: "builtin" /* builtIn */,
      type: "skill" /* skill */,
      name: s.name,
      description: s.description
    }));
  }
  /**
   * Contributes the built-in skills bundled with the Agents app. The base
   * {@link PromptsService} merges these into skill discovery
   * (`findAgentSkills()`), `listPromptFiles(skill)` and
   * `listPromptFilesForStorage(skill, PromptsStorage.builtIn)`, applying its
   * own parsing, sanitization and duplicate-name precedence (built-ins have
   * the lowest priority, so user/workspace skills of the same name win).
   */
  async getBuiltinPromptFiles(type, token) {
    if (type !== "skill" /* skill */) {
      return [];
    }
    return this.getBuiltinSkillPaths();
  }
};

function sanitizeSkillText(text2, maxLength) {
  const sanitized = text2.replace(/<[^>]+>/g, "");
  return sanitized.length > maxLength ? sanitized.substring(0, maxLength) : sanitized;
}
export { sanitizeSkillText, BUILTIN_SKILLS_URI, AgenticPromptsService };
