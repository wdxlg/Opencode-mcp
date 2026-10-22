// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/promptMigration.ts
import { PromptFileParser, PromptHeaderAttributes } from "./module-1003.mjs";
import { SKILL_FILENAME, VALID_SKILL_NAME_REGEX, getCleanPromptName } from "./module-0996.mjs";
import { basename2, dirname2 } from "./module-0034.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { splitLinesIncludeSeparators } from "./module-0030.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/promptMigration.ts
var retainedPromptHeaderKeys = /* @__PURE__ */ new Set([
  PromptHeaderAttributes.name,
  PromptHeaderAttributes.description,
  PromptHeaderAttributes.argumentHint
]);

function getPromptMigrationInfo(promptFiles) {
  const workspacePromptCount = promptFiles.filter((file) => file.storage === "local" /* local */).length;
  const userPromptCount = promptFiles.filter((file) => file.storage === "user" /* user */).length;
  const totalPromptCount = workspacePromptCount + userPromptCount;
  if (totalPromptCount === 0) {
    return void 0;
  }
  return {
    totalPromptCount,
    workspacePromptCount,
    userPromptCount
  };
}

function migratePromptFileToSkill(promptFile, content2, skillNameOverride) {
  const parser2 = new PromptFileParser();
  const parsed = parser2.parse(promptFile.uri, content2);
  const friendlyName = promptFile.name?.trim() || parsed.header?.name?.trim() || getCleanPromptName(promptFile.uri);
  const skillName = skillNameOverride ?? sanitizeSkillName(friendlyName);
  const description = promptFile.description?.trim() || parsed.header?.description?.trim() || friendlyName;
  const argumentHint = parsed.header?.argumentHint?.trim();
  const argumentHintAttribute = parsed.header?.getAttribute(PromptHeaderAttributes.argumentHint);
  const body = getPromptBody(parsed, content2);
  const unsupportedHeaderKeys = parsed.header?.attributes.filter((attribute) => !retainedPromptHeaderKeys.has(attribute.key)).map((attribute) => attribute.key) ?? [];
  const headerLines = [
    "---",
    `name: ${skillName}`,
    `description: ${description}`,
    "disable-model-invocation: true"
  ];
  if (argumentHint) {
    headerLines.push(`argument-hint: ${formatMigratedHeaderValue(argumentHint, argumentHintAttribute)}`);
  }
  headerLines.push("---", "");
  return {
    skillName,
    content: `${headerLines.join("\n")}${body}`,
    unsupportedHeaderKeys
  };
}

function formatMigratedHeaderValue(value2, sourceAttribute) {
  if (sourceAttribute?.value.type === "scalar") {
    switch (sourceAttribute.value.format) {
      case "single":
        return `'${value2.replace(/'/g, `''`)}'`;
      case "double":
        return JSON.stringify(value2);
      case "none":
        return value2;
    }
  }
  return value2;
}

async function migratePromptFilesToSkills(promptFiles, skillSourceFoldersByStorage, fileService, onMigrationError, options3) {
  const reservedSkillNames = /* @__PURE__ */ new Map();
  const unsupportedHeaderKeys = /* @__PURE__ */ new Set();
  const failedPromptFileNames = [];
  const convertedSkillFileUris = [];
  let convertedCount = 0;
  const deleteOriginalPromptFiles = options3?.deleteOriginalPromptFiles ?? true;
  for (const promptFile of promptFiles) {
    const skillSourceFolder = skillSourceFoldersByStorage.get(promptFile.storage);
    if (!skillSourceFolder) {
      continue;
    }
    try {
      const content2 = (await fileService.readFile(promptFile.uri)).value.toString();
      const migratedPrompt = migratePromptFileToSkill(promptFile, content2);
      const reservedNamesForFolder = reservedSkillNames.get(skillSourceFolder.uri.toString()) ?? /* @__PURE__ */ new Set();
      reservedSkillNames.set(skillSourceFolder.uri.toString(), reservedNamesForFolder);
      const skillName = await getAvailableMigratedSkillName(skillSourceFolder.uri, migratedPrompt.skillName, reservedNamesForFolder, fileService);
      const migratedSkill = skillName === migratedPrompt.skillName ? migratedPrompt : migratePromptFileToSkill(promptFile, content2, skillName);
      for (const key3 of migratedSkill.unsupportedHeaderKeys) {
        unsupportedHeaderKeys.add(key3);
      }
      const skillFileUri = createSkillFileUri(skillSourceFolder.uri, skillName);
      await fileService.createFolder(skillSourceFolder.uri);
      await fileService.createFolder(dirname2(skillFileUri));
      await fileService.writeFile(skillFileUri, VSBuffer.fromString(migratedSkill.content));
      if (deleteOriginalPromptFiles) {
        await fileService.del(promptFile.uri);
      }
      convertedSkillFileUris.push(skillFileUri);
      convertedCount++;
    } catch (error) {
      failedPromptFileNames.push(basename2(promptFile.uri));
      onMigrationError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }
  return {
    convertedCount,
    failedPromptFileNames,
    unsupportedHeaderKeys: Array.from(unsupportedHeaderKeys).sort(),
    convertedSkillFileUris
  };
}

function getPromptBody(parsed, content2) {
  const linesWithEol = splitLinesIncludeSeparators(content2);
  if (!parsed.body) {
    return "";
  }
  return linesWithEol.slice(parsed.body.range.startLineNumber - 1).join("").replace(/^\r?\n/, "");
}

function createSkillFileUri(skillSourceFolder, skillName) {
  return URI.joinPath(skillSourceFolder, skillName, SKILL_FILENAME);
}

function sanitizeSkillName(name) {
  const strippedName = name.replace(/<[^>]+>/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-+/g, "-");
  const trimmedName = trimSkillName(strippedName, 0);
  if (trimmedName && VALID_SKILL_NAME_REGEX.test(trimmedName)) {
    return trimmedName;
  }
  return "migrated-skill";
}

function trimSkillName(skillName, suffixLength) {
  const maxBaseLength = Math.max(1, 64 - suffixLength);
  return skillName.slice(0, maxBaseLength).replace(/-+$/g, "");
}

async function getAvailableMigratedSkillName(skillSourceFolder, baseSkillName, reservedNames, fileService) {
  let candidate = baseSkillName;
  let counter = 2;
  while (reservedNames.has(candidate) || await fileService.exists(createSkillFileUri(skillSourceFolder, candidate))) {
    const suffix = `-${counter++}`;
    const trimmedBaseName = trimSkillName(baseSkillName, suffix.length);
    candidate = `${trimmedBaseName}${suffix}`;
  }
  reservedNames.add(candidate);
  return candidate;
}
export { getPromptMigrationInfo, migratePromptFileToSkill, formatMigratedHeaderValue, migratePromptFilesToSkills, getPromptBody, createSkillFileUri, sanitizeSkillName, trimSkillName, getAvailableMigratedSkillName, retainedPromptHeaderKeys };
