// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatTipCatalog.ts
import { MarkdownString } from "./module-0462.mjs";
import { localize } from "./module-0001.mjs";
import { GENERATE_AGENT_COMMAND_ID, GENERATE_AGENT_INSTRUCTIONS_COMMAND_ID, GENERATE_PROMPT_COMMAND_ID, GENERATE_SKILL_COMMAND_ID, INSERT_FORK_CONVERSATION_COMMAND_ID, INSERT_TROUBLESHOOT_COMMAND_ID } from "./module-1475.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { localChatSessionType } from "./module-0961.mjs";
import { TipTrackingCommands } from "./module-2360.mjs";
import { IsSessionsWindowContext } from "./module-0950.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { OPEN_AGENTS_WINDOW_COMMAND_ID, OPEN_AGENTS_WINDOW_PRECONDITION, OPEN_WORKSPACE_IN_AGENTS_WINDOW_COMMAND_ID } from "./module-0965.mjs";
import { IsWebContext } from "./module-0635.mjs";


// src/vs/workbench/contrib/chat/browser/chatTipCatalog.ts
function formatKeybinding(ctx, commandId) {
  const kb = ctx.keybindingService.lookupKeybinding(commandId);
  return kb ? ` (${kb.getLabel()})` : "";
}

function extractCommandIds(markdown) {
  const commandPattern = /\[.*?\]\(command:([^?\s)]+)/g;
  const commands = /* @__PURE__ */ new Set();
  let match2;
  while ((match2 = commandPattern.exec(markdown)) !== null) {
    commands.add(match2[1]);
  }
  return [...commands];
}

var TIP_CATALOG = [
  {
    id: "tip.switchToAuto",
    tier: "foundational" /* Foundational */,
    priority: 0,
    buildMessage(_ctx) {
      return new MarkdownString(
        localize(
          11304,
          null
        )
      );
    },
    onlyWhenModelIds: ["gpt-4.1"]
  },
  {
    id: "tip.init",
    tier: "foundational" /* Foundational */,
    priority: 50,
    buildMessage(ctx) {
      const kb = formatKeybinding(ctx, GENERATE_AGENT_INSTRUCTIONS_COMMAND_ID);
      return new MarkdownString(
        localize(
          11299,
          null,
          "/init",
          GENERATE_AGENT_INSTRUCTIONS_COMMAND_ID,
          kb
        )
      );
    },
    when: ChatContextKeys.chatSessionType.isEqualTo(localChatSessionType),
    excludeWhenCommandsExecuted: [
      GENERATE_AGENT_INSTRUCTIONS_COMMAND_ID,
      TipTrackingCommands.CreateAgentInstructionsUsed
    ]
  },
  {
    id: "tip.createPrompt",
    tier: "foundational" /* Foundational */,
    buildMessage(ctx) {
      const kb = formatKeybinding(ctx, GENERATE_PROMPT_COMMAND_ID);
      return new MarkdownString(
        localize(
          11295,
          null,
          "/create-prompt",
          GENERATE_PROMPT_COMMAND_ID,
          kb
        )
      );
    },
    when: ChatContextKeys.chatSessionType.isEqualTo(localChatSessionType),
    excludeWhenCommandsExecuted: [
      GENERATE_PROMPT_COMMAND_ID,
      TipTrackingCommands.CreatePromptUsed
    ]
  },
  {
    id: "tip.createAgent",
    tier: "foundational" /* Foundational */,
    priority: 30,
    buildMessage(ctx) {
      const kb = formatKeybinding(ctx, GENERATE_AGENT_COMMAND_ID);
      return new MarkdownString(
        localize(
          11294,
          null,
          "/create-agent",
          GENERATE_AGENT_COMMAND_ID,
          kb
        )
      );
    },
    when: ChatContextKeys.chatSessionType.isEqualTo(localChatSessionType),
    excludeWhenCommandsExecuted: [
      GENERATE_AGENT_COMMAND_ID,
      TipTrackingCommands.CreateAgentUsed
    ]
  },
  {
    id: "tip.createSkill",
    tier: "foundational" /* Foundational */,
    priority: 40,
    buildMessage(ctx) {
      const kb = formatKeybinding(ctx, GENERATE_SKILL_COMMAND_ID);
      return new MarkdownString(
        localize(
          11296,
          null,
          "/create-skill",
          GENERATE_SKILL_COMMAND_ID,
          kb
        )
      );
    },
    when: ChatContextKeys.chatSessionType.isEqualTo(localChatSessionType),
    excludeWhenCommandsExecuted: [
      GENERATE_SKILL_COMMAND_ID,
      TipTrackingCommands.CreateSkillUsed
    ]
  },
  {
    id: "tip.planMode",
    tier: "foundational" /* Foundational */,
    priority: 20,
    buildMessage(ctx) {
      const kb = formatKeybinding(ctx, "workbench.action.chat.openPlan");
      return new MarkdownString(
        localize(
          11302,
          null,
          "Plan agent",
          kb
        )
      );
    },
    when: ChatContextKeys.chatModeName.notEqualsTo("Plan"),
    requiresModeNames: ["Plan"],
    excludeWhenCommandsExecuted: ["workbench.action.chat.openPlan"],
    excludeWhenModesUsed: ["Plan"]
  },
  {
    id: "tip.attachFiles",
    tier: "qol" /* Qol */,
    buildMessage() {
      return new MarkdownString(
        localize(11290, null)
      );
    },
    excludeWhenCommandsExecuted: [
      "workbench.action.chat.attachContext",
      "workbench.action.chat.attachFile",
      "workbench.action.chat.attachFolder",
      "workbench.action.chat.attachSelection",
      TipTrackingCommands.AttachFilesReferenceUsed
    ]
  },
  {
    id: "tip.codeActions",
    tier: "qol" /* Qol */,
    buildMessage() {
      return new MarkdownString(
        localize(11292, null)
      );
    },
    when: IsSessionsWindowContext.negate(),
    excludeWhenCommandsExecuted: ["inlineChat.start"]
  },
  {
    id: "tip.undoChanges",
    tier: "qol" /* Qol */,
    buildMessage() {
      return new MarkdownString(
        localize(11307, null)
      );
    },
    when: ContextKeyExpr.and(
      ChatContextKeys.chatSessionType.isEqualTo(localChatSessionType),
      ContextKeyExpr.or(
        ChatContextKeys.chatModeKind.isEqualTo("agent" /* Agent */),
        ChatContextKeys.chatModeKind.isEqualTo("edit" /* Edit */)
      )
    ),
    excludeWhenCommandsExecuted: ["workbench.action.chat.restoreCheckpoint", "workbench.action.chat.restoreLastCheckpoint"]
  },
  {
    id: "tip.messageQueueing",
    tier: "qol" /* Qol */,
    buildMessage() {
      return new MarkdownString(
        localize(11301, null)
      );
    },
    when: ChatContextKeys.chatModeKind.isEqualTo("agent" /* Agent */),
    excludeWhenCommandsExecuted: ["workbench.action.chat.queueMessage", "workbench.action.chat.steerWithMessage"]
  },
  {
    id: "tip.forkConversation",
    tier: "qol" /* Qol */,
    buildMessage(ctx) {
      const kb = formatKeybinding(ctx, INSERT_FORK_CONVERSATION_COMMAND_ID);
      return new MarkdownString(
        localize(
          11298,
          null,
          "/fork",
          INSERT_FORK_CONVERSATION_COMMAND_ID,
          kb
        )
      );
    },
    excludeWhenCommandsExecuted: [
      INSERT_FORK_CONVERSATION_COMMAND_ID,
      "workbench.action.chat.forkConversation",
      TipTrackingCommands.ForkConversationUsed
    ]
  },
  {
    id: "tip.mermaid",
    tier: "qol" /* Qol */,
    buildMessage() {
      return new MarkdownString(
        localize(11300, null)
      );
    },
    when: ChatContextKeys.chatModeKind.isEqualTo("agent" /* Agent */),
    excludeWhenToolsInvoked: ["renderMermaidDiagram"]
  },
  {
    id: "tip.subagents",
    tier: "qol" /* Qol */,
    buildMessage() {
      return new MarkdownString(
        localize(11303, null)
      );
    },
    when: ChatContextKeys.chatModeKind.isEqualTo("agent" /* Agent */),
    excludeWhenToolsInvoked: ["runSubagent"]
  },
  {
    id: "tip.thinkingPhrases",
    tier: "qol" /* Qol */,
    buildMessage() {
      return new MarkdownString(
        localize(
          11305,
          null,
          "thinking phrases",
          "chat.agent.thinking.phrases" /* ThinkingPhrases */
        )
      );
    },
    when: ChatContextKeys.chatModeKind.isEqualTo("agent" /* Agent */),
    excludeWhenSettingsChanged: ["chat.agent.thinking.phrases" /* ThinkingPhrases */],
    dismissWhenCommandsClicked: ["workbench.action.openSettings"]
  },
  {
    id: "tip.autoAcceptDelay",
    tier: "qol" /* Qol */,
    buildMessage() {
      return new MarkdownString(
        localize(
          11291,
          null,
          "auto-accept delay"
        )
      );
    },
    when: ContextKeyExpr.and(
      IsSessionsWindowContext.negate(),
      ContextKeyExpr.or(
        ChatContextKeys.chatModeKind.isEqualTo("agent" /* Agent */),
        ChatContextKeys.chatModeKind.isEqualTo("edit" /* Edit */)
      )
    ),
    excludeWhenSettingsChanged: ["chat.editing.autoAcceptDelay"],
    dismissWhenCommandsClicked: ["workbench.action.openSettings"]
  },
  {
    id: "tip.troubleshoot",
    tier: "qol" /* Qol */,
    buildMessage(ctx) {
      const kb = formatKeybinding(ctx, INSERT_TROUBLESHOOT_COMMAND_ID);
      return new MarkdownString(
        localize(
          11306,
          null,
          "/troubleshoot",
          INSERT_TROUBLESHOOT_COMMAND_ID,
          kb
        )
      );
    },
    when: ChatContextKeys.chatSessionType.isEqualTo(localChatSessionType),
    excludeWhenToolsInvoked: ["listDebugEvents"]
  },
  {
    id: "tip.agentsWindow",
    tier: "qol" /* Qol */,
    buildMessage(ctx) {
      const defaultMessage = localize(
        11289,
        null,
        OPEN_AGENTS_WINDOW_COMMAND_ID
      );
      const experimentalTemplate = ctx.experimentalTipMessages.get("openagentswindowtip" /* OpenAgentsWindowTip */);
      const message = experimentalTemplate ? experimentalTemplate.replace(/\{0\}/g, OPEN_AGENTS_WINDOW_COMMAND_ID) : defaultMessage;
      return new MarkdownString(message);
    },
    when: ContextKeyExpr.and(IsWebContext.negate(), OPEN_AGENTS_WINDOW_PRECONDITION),
    excludeWhenCommandsExecuted: [
      OPEN_AGENTS_WINDOW_COMMAND_ID,
      OPEN_WORKSPACE_IN_AGENTS_WINDOW_COMMAND_ID
    ]
  },
  {
    id: "tip.copilotCli",
    tier: "qol" /* Qol */,
    buildMessage() {
      return new MarkdownString(
        localize(
          11293,
          null
        )
      );
    },
    when: ContextKeyExpr.and(
      IsSessionsWindowContext.negate(),
      ChatContextKeys.chatSessionType.isEqualTo(localChatSessionType),
      ChatContextKeys.chatModeKind.isEqualTo("agent" /* Agent */),
      ChatContextKeys.hasCanDelegateProviders
    ),
    excludeWhenCommandsExecuted: ["workbench.action.chat.openNewChatSessionInPlace.copilotcli"]
  }
];
export { formatKeybinding, extractCommandIds, TIP_CATALOG };
