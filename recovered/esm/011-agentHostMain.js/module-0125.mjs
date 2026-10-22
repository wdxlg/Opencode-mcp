// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentPlugins/common/agentPluginParser.ts
import { joinPath } from "./module-0025.mjs";
import { parse3 } from "./module-0122.mjs";


// src/vs/platform/agentPlugins/common/agentPluginParser.ts
var agentPluginSchemaPrefix = "https://agent-plugins.org/schemas/";

async function readAgentPluginManifest(pluginUri, fileService) {
  const manifestUri = joinPath(pluginUri, "plugin.json");
  if (!await fileService.exists(manifestUri)) {
    return void 0;
  }
  let parsed;
  try {
    parsed = parse3((await fileService.readFile(manifestUri)).value.toString());
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
  const version = asString(parsed["version"]);
  const description = asString(parsed["description"]);
  const extensions = isRecord2(parsed["extensions"]) ? parsed["extensions"] : void 0;
  return {
    ...manifest,
    ...name ? { name } : {},
    ...version ? { version } : {},
    ...description ? { description } : {},
    ...extensions ? { extensions } : {}
  };
}

function isAgentPluginSchema(value) {
  return typeof value === "string" && value.startsWith(agentPluginSchemaPrefix) && value.endsWith("/plugin.schema.json");
}

function asString(value) {
  return typeof value === "string" ? value : void 0;
}

function asNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : void 0;
}

function isRecord2(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export { readAgentPluginManifest, isAgentPluginSchema, asString, asNonEmptyString, isRecord2, agentPluginSchemaPrefix };
