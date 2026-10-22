// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatTipStorageKeys.ts



// src/vs/workbench/contrib/chat/browser/chatTipStorageKeys.ts
var ChatTipStorageKeys = {
  /** IDs of tips that have been permanently dismissed by the user. */
  DismissedTips: "chat.tip.dismissed",
  /** The ID of the last tip that was shown, for round-robin selection. */
  LastTipId: "chat.tip.lastTipId",
  /** Whether the user has ever modified the thinking phrases setting. */
  ThinkingPhrasesEverModified: "chat.tip.thinkingPhrasesEverModified"
};

var TipEligibilityStorageKeys = {
  /** Command IDs that have been executed (for excludeWhenCommandsExecuted). */
  ExecutedCommands: "chat.tips.executedCommands",
  /** Chat modes that have been used (for excludeWhenModesUsed). */
  UsedModes: "chat.tips.usedModes",
  /** Tool IDs that have been invoked (for excludeWhenToolsInvoked). */
  InvokedTools: "chat.tips.invokedTools"
};

var TipTrackingCommands = {
  /** Tracked when user attaches a file/folder reference with #. */
  AttachFilesReferenceUsed: "chat.tips.attachFiles.referenceUsed",
  /** Tracked when user executes /init or /create-instructions. */
  CreateAgentInstructionsUsed: "chat.tips.createAgentInstructions.commandUsed",
  /** Tracked when user executes /create-prompt. */
  CreatePromptUsed: "chat.tips.createPrompt.commandUsed",
  /** Tracked when user executes /create-agent. */
  CreateAgentUsed: "chat.tips.createAgent.commandUsed",
  /** Tracked when user executes /create-skill. */
  CreateSkillUsed: "chat.tips.createSkill.commandUsed",
  /** Tracked when user executes /fork. */
  ForkConversationUsed: "chat.tips.forkConversation.commandUsed"
};
export { ChatTipStorageKeys, TipEligibilityStorageKeys, TipTrackingCommands };
