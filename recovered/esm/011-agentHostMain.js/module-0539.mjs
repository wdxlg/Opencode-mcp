// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/chatContributions/markdownPlanRichLinks/markdownPlanRichLinksContribution.ts
import { buildOpenSessionLinkForChatResource } from "./module-0230.mjs";
import { Disposable } from "./module-0010.mjs";
import { AgentHostMarkdownPlanRichLinksEnabledConfigKey, platformRootSchema } from "./module-0057.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentConfigurationService } from "./module-0104.mjs";


// src/vs/platform/agentHost/node/chatContributions/markdownPlanRichLinks/markdownPlanRichLinksContribution.ts
function createMarkdownPlanRichLinksInstruction(chat) {
  const currentChatLink = buildOpenSessionLinkForChatResource(chat);
  return [
    "<rich_plan_markdown>",
    "When creating or editing a Markdown plan document, use these formats when the exact target is known:",
    "- Use canonical HTTPS links for GitHub issues and pull requests.",
    "- Use `commit://<sha>` for commits in the current Git repository.",
    "- Preserve exact `agent-host-session://...` links returned by session and chat tools when referring to sessions, chats, or subagents. Do not construct these links yourself.",
    ...currentChatLink ? [`- Link to the current chat as [Current chat](${currentChatLink}).`] : [],
    "- Use `- [ ] :running: Description` for a task that is actively running, `- [ ]` for a pending task, and `- [x]` for a completed task.",
    "- Keep link labels meaningful so the document remains readable without rich rendering.",
    "</rich_plan_markdown>"
  ].join("\n");
}

var MarkdownPlanRichLinksContribution = class extends Disposable {
  constructor(_context, _agentConfigService) {
    super();
    this._context = _context;
    this._agentConfigService = _agentConfigService;
    // Send contributions reserve 100-400 for the original host-instruction sequence.
    this.order = 100;
  }
  static {
    this.id = "markdownPlanRichLinks";
  }
  onOutgoingTurn(turn) {
    return this._agentConfigService.getRootValue(platformRootSchema, AgentHostMarkdownPlanRichLinksEnabledConfigKey) ? { instructions: [createMarkdownPlanRichLinksInstruction(turn.chat)] } : void 0;
  }
};

MarkdownPlanRichLinksContribution = __decorateClass([
  __decorateParam(1, IAgentConfigurationService)
], MarkdownPlanRichLinksContribution);
export { createMarkdownPlanRichLinksInstruction, MarkdownPlanRichLinksContribution };
