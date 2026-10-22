// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentPlugins/common/agentPluginParser.ts
import { joinPath } from "./module-0034.mjs";
import { parse5 } from "./module-0885.mjs";


// src/vs/platform/agentPlugins/common/agentPluginParser.ts
var agentPluginSchemaPrefix = "https://agent-plugins.org/schemas/";

async function readAgentPluginManifest(pluginUri, fileService) {
  const manifestUri = joinPath(pluginUri, "plugin.json");
  if (!await fileService.exists(manifestUri)) {
    return void 0;
  }
  let parsed;
  try {
    parsed = parse5((await fileService.readFile(manifestUri)).value.toString());
  } catch {
    return void 0;
  }
  if (!isRecord2(parsed) || !isAgentPluginSchema(parsed["$schema"])) {
    return void 0;
  }
  const manifest = {
    $schema: parsed["$schema"]
  };
  const name = asNonEmptyString(parsed["name"]);
  const version2 = asString(parsed["version"]);
  const description = asString(parsed["description"]);
  const extensions = isRecord2(parsed["extensions"]) ? parsed["extensions"] : void 0;
  return {
    ...manifest,
    ...name ? { name } : {},
    ...version2 ? { version: version2 } : {},
    ...description ? { description } : {},
    ...extensions ? { extensions } : {}
  };
}

function isAgentPluginSchema(value2) {
  return typeof value2 === "string" && value2.startsWith(agentPluginSchemaPrefix) && value2.endsWith("/plugin.schema.json");
}

function asString(value2) {
  return typeof value2 === "string" ? value2 : void 0;
}

function asNonEmptyString(value2) {
  return typeof value2 === "string" && value2.trim().length > 0 ? value2.trim() : void 0;
}

function isRecord2(value2) {
  return typeof value2 === "object" && value2 !== null && !Array.isArray(value2);
}
export { readAgentPluginManifest, isAgentPluginSchema, asString, asNonEmptyString, isRecord2, agentPluginSchemaPrefix };
