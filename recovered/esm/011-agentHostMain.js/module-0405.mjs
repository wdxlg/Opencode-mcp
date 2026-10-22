// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/state/protocol/version/registry.ts



// src/vs/platform/agentHost/common/state/protocol/version/registry.ts
var PROTOCOL_VERSION = "0.9.0";

var SUPPORTED_PROTOCOL_VERSIONS = Object.freeze([
  "1.0.0",
  "0.9.0",
  "0.8.0",
  "0.7.0",
  "0.6.0",
  "0.5.2",
  "0.5.1"
]);

function parseSemver(version) {
  const match2 = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match2) {
    throw new Error(`Invalid protocol version: ${version}`);
  }
  return [Number(match2[1]), Number(match2[2]), Number(match2[3])];
}

function compareProtocolVersions(a, b) {
  const [aMajor, aMinor, aPatch] = parseSemver(a);
  const [bMajor, bMinor, bPatch] = parseSemver(b);
  return aMajor - bMajor || aMinor - bMinor || aPatch - bPatch;
}

var ACTION_INTRODUCED_IN = {
  ["root/agentsChanged" /* RootAgentsChanged */]: "0.1.0",
  ["root/activeSessionsChanged" /* RootActiveSessionsChanged */]: "0.1.0",
  ["session/ready" /* SessionReady */]: "0.1.0",
  ["session/creationFailed" /* SessionCreationFailed */]: "0.1.0",
  ["session/chatAdded" /* SessionChatAdded */]: "0.4.0",
  ["session/chatRemoved" /* SessionChatRemoved */]: "0.4.0",
  ["session/chatUpdated" /* SessionChatUpdated */]: "0.4.0",
  ["session/defaultChatChanged" /* SessionDefaultChatChanged */]: "0.4.0",
  ["session/titleChanged" /* SessionTitleChanged */]: "0.1.0",
  ["session/serverToolsChanged" /* SessionServerToolsChanged */]: "0.1.0",
  ["session/activeClientSet" /* SessionActiveClientSet */]: "0.5.0",
  ["session/activeClientRemoved" /* SessionActiveClientRemoved */]: "0.5.0",
  ["session/workingDirectorySet" /* SessionWorkingDirectorySet */]: "0.7.0",
  ["session/workingDirectoryRemoved" /* SessionWorkingDirectoryRemoved */]: "0.7.0",
  ["session/workingDirectoryReplaced" /* SessionWorkingDirectoryReplaced */]: "0.8.0",
  ["session/inputNeededSet" /* SessionInputNeededSet */]: "0.5.1",
  ["session/inputNeededRemoved" /* SessionInputNeededRemoved */]: "0.5.1",
  ["session/customizationsChanged" /* SessionCustomizationsChanged */]: "0.1.0",
  ["session/customizationToggled" /* SessionCustomizationToggled */]: "0.1.0",
  ["session/customizationUpdated" /* SessionCustomizationUpdated */]: "0.1.0",
  ["session/customizationRemoved" /* SessionCustomizationRemoved */]: "0.2.0",
  ["session/mcpServerStateChanged" /* SessionMcpServerStateChanged */]: "0.3.0",
  ["session/mcpServerStartRequested" /* SessionMcpServerStartRequested */]: "0.5.2",
  ["session/mcpServerStopRequested" /* SessionMcpServerStopRequested */]: "0.5.2",
  ["session/isReadChanged" /* SessionIsReadChanged */]: "0.1.0",
  ["session/isArchivedChanged" /* SessionIsArchivedChanged */]: "0.1.0",
  ["session/activityChanged" /* SessionActivityChanged */]: "0.1.0",
  ["session/changesetsChanged" /* SessionChangesetsChanged */]: "0.2.0",
  ["session/configChanged" /* SessionConfigChanged */]: "0.1.0",
  ["session/metaChanged" /* SessionMetaChanged */]: "0.1.0",
  ["chat/turnStarted" /* ChatTurnStarted */]: "0.4.0",
  ["chat/delta" /* ChatDelta */]: "0.4.0",
  ["chat/responsePart" /* ChatResponsePart */]: "0.4.0",
  ["chat/toolCallStart" /* ChatToolCallStart */]: "0.4.0",
  ["chat/toolCallDelta" /* ChatToolCallDelta */]: "0.4.0",
  ["chat/toolCallReady" /* ChatToolCallReady */]: "0.4.0",
  ["chat/toolCallConfirmed" /* ChatToolCallConfirmed */]: "0.4.0",
  ["chat/toolCallComplete" /* ChatToolCallComplete */]: "0.4.0",
  ["chat/toolCallResultConfirmed" /* ChatToolCallResultConfirmed */]: "0.4.0",
  ["chat/toolCallContentChanged" /* ChatToolCallContentChanged */]: "0.4.0",
  ["chat/toolCallAuthRequired" /* ChatToolCallAuthRequired */]: "0.6.0",
  ["chat/toolCallAuthResolved" /* ChatToolCallAuthResolved */]: "0.6.0",
  ["chat/turnComplete" /* ChatTurnComplete */]: "0.4.0",
  ["chat/turnCancelled" /* ChatTurnCancelled */]: "0.4.0",
  ["chat/error" /* ChatError */]: "0.4.0",
  ["chat/turnResume" /* ChatTurnResume */]: "0.9.0",
  ["chat/activityChanged" /* ChatActivityChanged */]: "0.5.0",
  ["chat/workingDirectorySet" /* ChatWorkingDirectorySet */]: "0.7.0",
  ["chat/workingDirectoryRemoved" /* ChatWorkingDirectoryRemoved */]: "0.7.0",
  ["chat/usage" /* ChatUsage */]: "0.4.0",
  ["chat/reasoning" /* ChatReasoning */]: "0.4.0",
  ["chat/pendingMessageSet" /* ChatPendingMessageSet */]: "0.4.0",
  ["chat/pendingMessageRemoved" /* ChatPendingMessageRemoved */]: "0.4.0",
  ["chat/queuedMessagesReordered" /* ChatQueuedMessagesReordered */]: "0.4.0",
  ["chat/draftChanged" /* ChatDraftChanged */]: "0.5.0",
  ["chat/inputRequested" /* ChatInputRequested */]: "0.4.0",
  ["chat/inputAnswerChanged" /* ChatInputAnswerChanged */]: "0.4.0",
  ["chat/inputCompleted" /* ChatInputCompleted */]: "0.4.0",
  ["chat/truncated" /* ChatTruncated */]: "0.4.0",
  ["chat/turnsLoaded" /* ChatTurnsLoaded */]: "0.5.1",
  ["changeset/statusChanged" /* ChangesetStatusChanged */]: "0.2.0",
  ["changeset/fileSet" /* ChangesetFileSet */]: "0.2.0",
  ["changeset/fileRemoved" /* ChangesetFileRemoved */]: "0.2.0",
  ["changeset/filesReviewChanged" /* ChangesetFilesReviewChanged */]: "0.6.0",
  ["changeset/contentChanged" /* ChangesetContentChanged */]: "0.4.0",
  ["changeset/operationsChanged" /* ChangesetOperationsChanged */]: "0.2.0",
  ["changeset/operationStatusChanged" /* ChangesetOperationStatusChanged */]: "0.3.0",
  ["changeset/cleared" /* ChangesetCleared */]: "0.2.0",
  ["annotations/set" /* AnnotationsSet */]: "0.4.0",
  ["annotations/updated" /* AnnotationsUpdated */]: "0.4.0",
  ["annotations/removed" /* AnnotationsRemoved */]: "0.4.0",
  ["annotations/entrySet" /* AnnotationsEntrySet */]: "0.4.0",
  ["annotations/entryRemoved" /* AnnotationsEntryRemoved */]: "0.4.0",
  ["root/terminalsChanged" /* RootTerminalsChanged */]: "0.1.0",
  ["root/configChanged" /* RootConfigChanged */]: "0.1.0",
  ["terminal/data" /* TerminalData */]: "0.1.0",
  ["terminal/input" /* TerminalInput */]: "0.1.0",
  ["terminal/resized" /* TerminalResized */]: "0.1.0",
  ["terminal/claimed" /* TerminalClaimed */]: "0.1.0",
  ["terminal/titleChanged" /* TerminalTitleChanged */]: "0.1.0",
  ["terminal/cwdChanged" /* TerminalCwdChanged */]: "0.1.0",
  ["terminal/exited" /* TerminalExited */]: "0.1.0",
  ["terminal/cleared" /* TerminalCleared */]: "0.1.0",
  ["terminal/commandDetectionAvailable" /* TerminalCommandDetectionAvailable */]: "0.1.0",
  ["terminal/commandExecuted" /* TerminalCommandExecuted */]: "0.1.0",
  ["terminal/commandFinished" /* TerminalCommandFinished */]: "0.1.0",
  ["resourceWatch/changed" /* ResourceWatchChanged */]: "0.2.0",
  ["automation/createRequested" /* AutomationCreateRequested */]: "0.8.0",
  ["automation/updateRequested" /* AutomationUpdateRequested */]: "0.8.0",
  ["automation/set" /* AutomationSet */]: "0.8.0",
  ["automation/removed" /* AutomationRemoved */]: "0.8.0",
  ["automationRun/lifecycleChanged" /* AutomationRunLifecycleChanged */]: "0.8.0",
  ["automationRun/sessionSet" /* AutomationRunSessionSet */]: "0.8.0",
  ["automationRun/sessionRemoved" /* AutomationRunSessionRemoved */]: "0.8.0",
  ["automationRun/primarySessionChanged" /* AutomationRunPrimarySessionChanged */]: "0.8.0",
  ["automationRun/cancelRequested" /* AutomationRunCancelRequested */]: "0.8.0"
};
export { parseSemver, compareProtocolVersions, PROTOCOL_VERSION, SUPPORTED_PROTOCOL_VERSIONS, ACTION_INTRODUCED_IN };
