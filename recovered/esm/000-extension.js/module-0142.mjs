// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/skill-list-tool.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// extensions/opencode/src/skill-list-tool.ts
init_define_OPENCODE_BUILD_INFO();

var LIST_SKILLS_TOOL = {
  name: "list_skills",
  title: "List Installed Skills",
  description: "Discover installed Skills and their absolute directory and skillFile paths on the connected host. Skills are folders of instructions and resources, NOT MCP tools. Read the returned SKILL.md / skill.md file, then relevant referenced files as needed; do not invoke the Skill name as a tool. Read-only: does not execute, install or modify Skills. A failed listing does not mean no Skills are installed.",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  outputSchema: {
    type: "object",
    required: ["directory", "enabled", "skills"],
    additionalProperties: false,
    properties: {
      directory: { type: "string", description: "Configured global skill directory." },
      enabled: { type: "boolean", description: "Effective Skill master switch." },
      skills: { type: "array", items: {
        type: "object",
        required: ["name", "title", "description", "scope", "directory", "skillFile", "loaded", "enabled"],
        additionalProperties: false,
        properties: {
          name: { type: "string", description: "Skill identifier, not an MCP tool name." },
          title: { type: "string" },
          description: { type: "string" },
          scope: { type: "string", enum: ["global", "workspace"] },
          directory: { type: "string", description: "Absolute Skill directory on the connected host." },
          skillFile: { type: ["string", "null"], description: "Actual root instruction file path, or null if missing." },
          loaded: { type: "boolean", description: "Root instruction file found; not tool availability." },
          enabled: { type: "boolean" },
          reason: { type: "string" },
          reasonCode: { type: "string" }
        }
      } }
    }
  },
  annotations: { title: "List Installed Skills", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
};

function formatSkillListing(listing) {
  const lines = [`\u5DF2\u5B89\u88C5 Skills\uFF1A\u5171 ${listing.skills.length} \u4E2A\u3002\u603B\u5F00\u5173\uFF1A${listing.enabled ? "\u5F00" : "\u5173"}\u3002`, `\u5168\u5C40\u76EE\u5F55\uFF1A${listing.directory}`];
  if (!listing.skills.length) lines.push("\u5F53\u524D\u6CA1\u6709\u5DF2\u5B89\u88C5\u7684 Skill\uFF1B\u65E0\u9700\u4E3A\u4E86\u67E5\u770B\u6E05\u5355\u800C\u521B\u5EFA\u6280\u80FD\u8349\u7A3F\u3002");
  else lines.push("Skill \u4E0D\u662F MCP \u5DE5\u5177\u3002\u8BF7\u5148\u8BFB\u53D6\u4E0B\u5217\u8BF4\u660E\u6587\u4EF6\uFF0C\u518D\u6309\u9700\u8BFB\u53D6\u76EE\u5F55\u5185\u7684\u53C2\u8003\u8D44\u6599\u3001\u8D44\u6E90\u6216\u811A\u672C\uFF1B\u4E0D\u8981\u628A Skill \u540D\u79F0\u5F53\u4F5C\u5DE5\u5177\u8C03\u7528\u3002\u8DEF\u5F84\u5C5E\u4E8E\u6240\u8FDE\u63A5\u7684\u4E3B\u673A\uFF0C\u4E0D\u662F\u804A\u5929\u6C99\u7BB1\u3002");
  for (const skill of listing.skills) {
    lines.push(`- ${skill.name || skill.title} [${skill.scope === "global" ? "\u5168\u5C40" : "\u9879\u76EE"}\xB7${skill.loaded ? "\u5DF2\u52A0\u8F7D" : "\u672A\u52A0\u8F7D"}]${skill.reason ? ` ${skill.reason}` : ""}`);
    lines.push(`  \u76EE\u5F55\uFF1A${skill.directory}`, `  \u8BF4\u660E\u6587\u4EF6\uFF1A${skill.skillFile ?? "\u7F3A\u5C11\u6839\u76EE\u5F55 skill.md / SKILL.md"}`);
    const description = skill.description.replace(/\s+/g, " ").trim();
    if (description) lines.push(`  \u8BF4\u660E\uFF1A${description.slice(0, 300)}${description.length > 300 ? "\u2026" : ""}`);
  }
  return lines.join("\n");
}
export { formatSkillListing, LIST_SKILLS_TOOL };
