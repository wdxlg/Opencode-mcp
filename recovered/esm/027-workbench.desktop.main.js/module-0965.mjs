// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/actions/chatContextKeys.ts
import { ContextKeyExpr, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { IsWebContext } from "./module-0635.mjs";
import { RemoteNameContext } from "./module-0949.mjs";
import { ChatAccountPolicyGateActiveContext } from "./module-0957.mjs";
import { ChatEntitlementContextKeys } from "./module-0953.mjs";


// src/vs/workbench/contrib/chat/common/actions/chatContextKeys.ts
var ChatContextKeys;

((ChatContextKeys2) => {
  ChatContextKeys2.responseVote = new RawContextKey("chatSessionResponseVote", "", { type: "string", description: localize(12820, null) });
  ChatContextKeys2.responseDetectedAgentCommand = new RawContextKey("chatSessionResponseDetectedAgentOrCommand", false, { type: "boolean", description: localize(12791, null) });
  ChatContextKeys2.responseSupportsIssueReporting = new RawContextKey("chatResponseSupportsIssueReporting", false, { type: "boolean", description: localize(12782, null) });
  ChatContextKeys2.responseIsFiltered = new RawContextKey("chatSessionResponseFiltered", false, { type: "boolean", description: localize(12780, null) });
  ChatContextKeys2.responseHasError = new RawContextKey("chatSessionResponseError", false, { type: "boolean", description: localize(12778, null) });
  ChatContextKeys2.responseHasFeedbackSurvey = new RawContextKey("chatSessionResponseHasFeedbackSurvey", false, { type: "boolean", description: localize(12781, null) });
  ChatContextKeys2.responseFeedbackSurveyOpen = new RawContextKey("chatSessionResponseFeedbackSurveyOpen", false, { type: "boolean", description: localize(12779, null) });
  ChatContextKeys2.requestInProgress = new RawContextKey("chatSessionRequestInProgress", false, { type: "boolean", description: localize(12819, null) });
  ChatContextKeys2.hasActiveRequest = new RawContextKey("chatSessionHasActiveRequest", false, { type: "boolean", description: localize(12783, null) });
  ChatContextKeys2.currentlyEditing = new RawContextKey("chatSessionCurrentlyEditing", false, { type: "boolean", description: localize(12817, null) });
  ChatContextKeys2.currentlyEditingInput = new RawContextKey("chatSessionCurrentlyEditingInput", false, { type: "boolean", description: localize(12818, null) });
  let EditingRequestType;
  ((EditingRequestType2) => {
    EditingRequestType2["Sent"] = "s";
    EditingRequestType2["Queue"] = "q";
    EditingRequestType2["Steer"] = "st";
  })(EditingRequestType = ChatContextKeys2.EditingRequestType || (ChatContextKeys2.EditingRequestType = {}));
  ChatContextKeys2.editingRequestType = new RawContextKey("chatEditingSentRequest", void 0, { type: "string", description: localize(12744, null) });
  ChatContextKeys2.isResponse = new RawContextKey("chatResponse", false, { type: "boolean", description: localize(12777, null) });
  ChatContextKeys2.isRequest = new RawContextKey("chatRequest", false, { type: "boolean", description: localize(12775, null) });
  ChatContextKeys2.isFirstRequest = new RawContextKey("chatFirstRequest", false, { type: "boolean", description: localize(12750, null) });
  ChatContextKeys2.isPendingRequest = new RawContextKey("chatRequestIsPending", false, { type: "boolean", description: localize(12776, null) });
  ChatContextKeys2.itemId = new RawContextKey("chatItemId", "", { type: "string", description: localize(12762, null) });
  ChatContextKeys2.lastItemId = new RawContextKey("chatLastItemId", [], { type: "string", description: localize(12763, null) });
  ChatContextKeys2.editApplied = new RawContextKey("chatEditApplied", false, { type: "boolean", description: localize(12738, null) });
  ChatContextKeys2.inputHasText = new RawContextKey("chatInputHasText", false, { type: "boolean", description: localize(12816, null) });
  ChatContextKeys2.inputHasSendableContent = new RawContextKey("chatInputHasSendableContent", false, { type: "boolean", description: localize(12815, null) });
  ChatContextKeys2.inputHasBranch = new RawContextKey("chatInputHasBranch", false, { type: "boolean", description: localize(12831, null) });
  ChatContextKeys2.openCodeBranchVariant = new RawContextKey("chatOpenCodeBranchVariant", false, { type: "boolean", description: localize(12829, null) });
  ChatContextKeys2.openCodeBranchCanMerge = new RawContextKey("chatOpenCodeBranchCanMerge", false, { type: "boolean", description: localize(12826, null) });
  ChatContextKeys2.openCodeBranchCanAdopt = new RawContextKey("chatOpenCodeBranchCanAdopt", false, { type: "boolean", description: localize(12824, null) });
  ChatContextKeys2.openCodeBranchCanDelete = new RawContextKey("chatOpenCodeBranchCanDelete", false, { type: "boolean", description: localize(12825, null) });
  ChatContextKeys2.openCodeBranchHasPrev = new RawContextKey("chatOpenCodeBranchHasPrev", false, { type: "boolean", description: localize(12828, null) });
  ChatContextKeys2.openCodeBranchHasNext = new RawContextKey("chatOpenCodeBranchHasNext", false, { type: "boolean", description: localize(12827, null) });
  ChatContextKeys2.openCodeBranchCanRunAll = new RawContextKey("chatOpenCodeBranchCanRunAll", false, { type: "boolean" });
  ChatContextKeys2.openCodeBranchCanCompare = new RawContextKey("chatOpenCodeBranchCanCompare", false, { type: "boolean" });
  ChatContextKeys2.inputHasFocus = new RawContextKey("chatInputHasFocus", false, { type: "boolean", description: localize(12814, null) });
  ChatContextKeys2.inChatInput = new RawContextKey("inChatInput", false, { type: "boolean", description: localize(12812, null) });
  ChatContextKeys2.inChatSession = new RawContextKey("inChat", false, { type: "boolean", description: localize(12805, null) });
  ChatContextKeys2.inChatQuestionCarousel = new RawContextKey("inChatQuestionCarousel", false, { type: "boolean", description: localize(12808, null) });
  ChatContextKeys2.chatQuestionCarouselHasTerminal = new RawContextKey("chatQuestionCarouselHasTerminal", false, { type: "boolean", description: localize(12773, null) });
  ChatContextKeys2.inChatEditor = new RawContextKey("inChatEditor", false, { type: "boolean", description: localize(12807, null) });
  ChatContextKeys2.findSupported = new RawContextKey("chatFindSupported", false, { type: "boolean", description: localize(12747, null) });
  ChatContextKeys2.findWidgetVisible = new RawContextKey("chatFindWidgetVisible", false, { type: "boolean", description: localize(12749, null) });
  ChatContextKeys2.findInputFocused = new RawContextKey("chatFindInputFocused", false, { type: "boolean", description: localize(12746, null) });
  ChatContextKeys2.findWidgetFocused = new RawContextKey("chatFindWidgetFocused", false, { type: "boolean", description: localize(12748, null) });
  ChatContextKeys2.inChatTodoList = new RawContextKey("inChatTodoList", false, { type: "boolean", description: localize(12811, null) });
  ChatContextKeys2.inChatTip = new RawContextKey("inChatTip", false, { type: "boolean", description: localize(12810, null) });
  ChatContextKeys2.inChatComposer = new RawContextKey("inChatComposer", false, { type: "boolean", description: localize(12806, null) });
  ChatContextKeys2.multipleChatTips = new RawContextKey("multipleChatTips", false, { type: "boolean", description: localize(12823, null) });
  ChatContextKeys2.inChatTerminalToolOutput = new RawContextKey("inChatTerminalToolOutput", false, { type: "boolean", description: localize(12809, null) });
  ChatContextKeys2.chatModeKind = new RawContextKey("chatAgentKind", "ask" /* Ask */, { type: "string", description: localize(12719, null) });
  ChatContextKeys2.chatModeName = new RawContextKey("chatModeName", "", { type: "string", description: localize(12766, null) });
  ChatContextKeys2.openCodeBridgeMode = new RawContextKey("opencodeBridgeMode", false, { type: "boolean", description: localize(12830, null) });
  ChatContextKeys2.chatModelId = new RawContextKey("chatModelId", "", { type: "string", description: localize(12764, null) });
  ChatContextKeys2.speechToTextRecording = new RawContextKey("chatSpeechToTextRecording", false, { type: "boolean", description: localize(12799, null) });
  ChatContextKeys2.speechToTextConfigured = new RawContextKey("chatSpeechToTextConfigured", false, { type: "boolean", description: localize(12797, null) });
  ChatContextKeys2.speechToTextPreparing = new RawContextKey("chatSpeechToTextPreparing", false, { type: "boolean", description: localize(12798, null) });
  ChatContextKeys2.supported = ContextKeyExpr.or(IsWebContext.negate(), RemoteNameContext.notEqualsTo(""), ContextKeyExpr.has("config.chat.experimental.serverlessWebEnabled"));
  ChatContextKeys2.enabled = new RawContextKey("chatIsEnabled", false, { type: "boolean", description: localize(12759, null) });
  ChatContextKeys2.accountPolicyGateActive = ChatAccountPolicyGateActiveContext;
  ChatContextKeys2.lockedToCodingAgent = new RawContextKey("lockedToCodingAgent", false, { type: "boolean", description: localize(12822, null) });
  ChatContextKeys2.lockedCodingAgentId = new RawContextKey("lockedCodingAgentId", "", { type: "string", description: localize(12821, null) });
  ChatContextKeys2.readOnly = new RawContextKey("chatIsReadonly", false, { type: "boolean", description: localize(12761, null) });
  ChatContextKeys2.chatIsAgentHostSession = new RawContextKey("chatIsAgentHostSession", false, { type: "boolean", description: localize(12758, null) });
  ChatContextKeys2.chatAgentHostProviderId = new RawContextKey("chatAgentHostProviderId", "", { type: "string", description: localize(12735, null) });
  ChatContextKeys2.chatAgentHostHasImmutablePrimaryWorkingDirectory = new RawContextKey("chatAgentHostHasImmutablePrimaryWorkingDirectory", false, { type: "boolean", description: localize(12734, null) });
  ChatContextKeys2.chatAgentHostFolderPickerVisible = new RawContextKey("chatAgentHostFolderPickerVisible", false, { type: "boolean", description: localize(12733, null) });
  ChatContextKeys2.chatSessionHasCustomAgentTarget = new RawContextKey("chatSessionHasCustomAgentTarget", false, { type: "boolean", description: localize(12784, null) });
  ChatContextKeys2.chatSessionHasTargetedModels = new RawContextKey("chatSessionHasTargetedModels", false, { type: "boolean", description: localize(12788, null) });
  ChatContextKeys2.agentSupportsAttachments = new RawContextKey("agentSupportsAttachments", false, { type: "boolean", description: localize(12732, null) });
  ChatContextKeys2.withinEditSessionDiff = new RawContextKey("withinEditSessionDiff", false, { type: "boolean", description: localize(12833, null) });
  ChatContextKeys2.filePartOfEditSession = new RawContextKey("filePartOfEditSession", false, { type: "boolean", description: localize(12801, null) });
  ChatContextKeys2.extensionParticipantRegistered = new RawContextKey("chatPanelExtensionParticipantRegistered", false, { type: "boolean", description: localize(12769, null) });
  ChatContextKeys2.panelParticipantRegistered = new RawContextKey("chatPanelParticipantRegistered", false, { type: "boolean", description: localize(12771, null) });
  ChatContextKeys2.chatEditingCanUndo = new RawContextKey("chatEditingCanUndo", false, { type: "boolean", description: localize(12740, null) });
  ChatContextKeys2.chatEditingCanRedo = new RawContextKey("chatEditingCanRedo", false, { type: "boolean", description: localize(12739, null) });
  ChatContextKeys2.languageModelsAreUserSelectable = new RawContextKey("chatModelsAreUserSelectable", false, { type: "boolean", description: localize(12765, null) });
  ChatContextKeys2.nonCopilotLanguageModelsAreUserSelectable = new RawContextKey("chatNonCopilotModelsAreUserSelectable", false, { type: "boolean", description: localize(12768, null) });
  ChatContextKeys2.chatSessionHasModels = new RawContextKey("chatSessionHasModels", false, { type: "boolean", description: localize(12787, null) });
  ChatContextKeys2.chatSessionOptionsValid = new RawContextKey("chatSessionOptionsValid", true, { type: "boolean", description: localize(12790, null) });
  ChatContextKeys2.extensionInvalid = new RawContextKey("chatExtensionInvalid", false, { type: "boolean", description: localize(12745, null) });
  ChatContextKeys2.inputCursorAtTop = new RawContextKey("chatCursorAtTop", false);
  ChatContextKeys2.inputHasAgent = new RawContextKey("chatInputHasAgent", false);
  ChatContextKeys2.location = new RawContextKey("chatLocation", void 0);
  ChatContextKeys2.inQuickChat = new RawContextKey("quickChatHasFocus", false, { type: "boolean", description: localize(12813, null) });
  ChatContextKeys2.inAgentSessionsWelcome = new RawContextKey("inAgentSessionsWelcome", false, { type: "boolean", description: localize(12803, null) });
  ChatContextKeys2.inAutomationsDialog = new RawContextKey("inAutomationsDialog", false, { type: "boolean", description: localize(12804, null) });
  ChatContextKeys2.chatSessionType = new RawContextKey("chatSessionType", "", { type: "string", description: localize(12795, null) });
  ChatContextKeys2.hasFileAttachments = new RawContextKey("chatHasFileAttachments", false, { type: "boolean", description: localize(12754, null) });
  ChatContextKeys2.chatSessionIsEmpty = new RawContextKey("chatSessionIsEmpty", true, { type: "boolean", description: localize(12789, null) });
  ChatContextKeys2.hasPendingRequests = new RawContextKey("chatHasPendingRequests", false, { type: "boolean", description: localize(12756, null) });
  ChatContextKeys2.chatSessionHasDebugData = new RawContextKey("chatSessionHasDebugData", false, { type: "boolean", description: localize(12785, null) });
  ChatContextKeys2.chatSessionHasDebugTools = new RawContextKey("chatSessionHasDebugTools", false, { type: "boolean", description: localize(12786, null) });
  ChatContextKeys2.remoteJobCreating = new RawContextKey("chatRemoteJobCreating", false, { type: "boolean", description: localize(12774, null) });
  ChatContextKeys2.hasRemoteCodingAgent = new RawContextKey("hasRemoteCodingAgent", false, localize(12802, null));
  ChatContextKeys2.hasCanDelegateProviders = new RawContextKey("chatHasCanDelegateProviders", false, { type: "boolean", description: localize(12753, null) });
  ChatContextKeys2.enableRemoteCodingAgentPromptFileOverlay = new RawContextKey("enableRemoteCodingAgentPromptFileOverlay", false, localize(12800, null));
  ChatContextKeys2.skipChatRequestInProgressMessage = new RawContextKey("chatSkipRequestInProgressMessage", false, { type: "boolean", description: localize(12796, null) });
  ChatContextKeys2.Setup = ChatEntitlementContextKeys.Setup;
  ChatContextKeys2.Entitlement = ChatEntitlementContextKeys.Entitlement;
  ChatContextKeys2.chatQuotaExceeded = ChatEntitlementContextKeys.chatQuotaExceeded;
  ChatContextKeys2.completionsQuotaExceeded = ChatEntitlementContextKeys.completionsQuotaExceeded;
  ChatContextKeys2.Editing = {
    hasToolConfirmation: new RawContextKey("chatHasToolConfirmation", false, { type: "boolean", description: localize(12743, null) }),
    hasElicitationRequest: new RawContextKey("chatHasElicitationRequest", false, { type: "boolean", description: localize(12741, null) }),
    hasQuestionCarousel: new RawContextKey("chatHasQuestionCarousel", false, { type: "boolean", description: localize(12742, null) })
  };
  ChatContextKeys2.Tools = {
    toolsCount: new RawContextKey("toolsCount", 0, { type: "number", description: localize(12832, null) })
  };
  ChatContextKeys2.foregroundSessionCount = new RawContextKey("chatForegroundSessionCount", 0, { type: "number", description: localize(12751, null) });
  ChatContextKeys2.Modes = {
    hasCustomChatModes: new RawContextKey("chatHasCustomAgents", false, { type: "boolean", description: localize(12752, null) }),
    agentModeDisabledByPolicy: new RawContextKey("chatAgentModeDisabledByPolicy", false, { type: "boolean", description: localize(12736, null) })
  };
  ChatContextKeys2.panelLocation = new RawContextKey("chatPanelLocation", void 0, { type: "number", description: localize(12770, null) });
  ChatContextKeys2.agentSessionsViewerFocused = new RawContextKey("agentSessionsViewerFocused", true, { type: "boolean", description: localize(12727, null) });
  ChatContextKeys2.agentSessionsViewerOrientation = new RawContextKey("agentSessionsViewerOrientation", void 0, { type: "number", description: localize(12728, null) });
  ChatContextKeys2.agentSessionsViewerPosition = new RawContextKey("agentSessionsViewerPosition", void 0, { type: "number", description: localize(12729, null) });
  ChatContextKeys2.agentSessionsViewerVisible = new RawContextKey("agentSessionsViewerVisible", void 0, { type: "boolean", description: localize(12730, null) });
  ChatContextKeys2.agentSessionType = new RawContextKey("chatSessionType", "", { type: "string", description: localize(12731, null) });
  ChatContextKeys2.agentSessionPullRequest = new RawContextKey("chatSessionPullRequest", "", { type: "string", description: localize(12725, null) });
  ChatContextKeys2.chatSessionSupportsDelegation = new RawContextKey("chatSessionSupportsDelegation", true, { type: "boolean", description: localize(12792, null) });
  ChatContextKeys2.hasPendingDelegationTarget = new RawContextKey("chatHasPendingDelegationTarget", false, { type: "boolean", description: localize(12755, null) });
  ChatContextKeys2.chatSessionSupportsFork = new RawContextKey("chatSessionSupportsFork", false, { type: "boolean", description: localize(12793, null) });
  ChatContextKeys2.chatSessionSupportsRename = new RawContextKey("chatSessionSupportsRename", false, { type: "boolean", description: localize(12794, null) });
  ChatContextKeys2.agentSessionSection = new RawContextKey("agentSessionSection", "", { type: "string", description: localize(12726, null) });
  ChatContextKeys2.isArchivedAgentSession = new RawContextKey("agentSessionIsArchived", false, { type: "boolean", description: localize(12722, null) });
  ChatContextKeys2.isPinnedAgentSession = new RawContextKey("agentSessionIsPinned", false, { type: "boolean", description: localize(12723, null) });
  ChatContextKeys2.isReadAgentSession = new RawContextKey("agentSessionIsRead", false, { type: "boolean", description: localize(12724, null) });
  ChatContextKeys2.hasMultipleAgentSessionsSelected = new RawContextKey("agentSessionHasMultipleSelected", false, { type: "boolean", description: localize(12721, null) });
  ChatContextKeys2.hasAgentSessionChanges = new RawContextKey("agentSessionHasChanges", false, { type: "boolean", description: localize(12720, null) });
  ChatContextKeys2.isKatexMathElement = new RawContextKey("chatIsKatexMathElement", false, { type: "boolean", description: localize(12760, null) });
  ChatContextKeys2.hasUsedCreateSlashCommands = new RawContextKey("chatHasUsedCreateSlashCommands", false, { type: "boolean", description: localize(12757, null) });
  ChatContextKeys2.contextUsageHasBeenOpened = new RawContextKey("chatContextUsageHasBeenOpened", false, { type: "boolean", description: localize(12737, null) });
  ChatContextKeys2.newChatButtonExperimentIcon = new RawContextKey("chatNewChatButtonExperimentIcon", "", { type: "string", description: localize(12767, null) });
})(ChatContextKeys || (ChatContextKeys = {}));

var ChatContextKeyExprs;

((ChatContextKeyExprs2) => {
  ChatContextKeyExprs2.inEditingMode = ContextKeyExpr.or(
    ChatContextKeys.chatModeKind.isEqualTo("edit" /* Edit */),
    ChatContextKeys.chatModeKind.isEqualTo("agent" /* Agent */)
  );
  ChatContextKeyExprs2.isAgentHostSession = ChatContextKeys.chatIsAgentHostSession.isEqualTo(true);
  ChatContextKeyExprs2.isAgentHostSessionItem = ContextKeyExpr.or(
    ContextKeyExpr.regex(ChatContextKeys.agentSessionType.key, /^agent-host-/),
    ContextKeyExpr.regex(ChatContextKeys.agentSessionType.key, /^remote-/)
  );
})(ChatContextKeyExprs || (ChatContextKeyExprs = {}));
export { ChatContextKeys, ChatContextKeyExprs };
