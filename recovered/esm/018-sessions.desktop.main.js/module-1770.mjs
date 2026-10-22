// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/common/contextkeys.ts
import { ContextKeyExpr, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { AuxiliaryBarFocusContext, EditorAreaFocusContext } from "./module-0950.mjs";


// src/vs/sessions/common/contextkeys.ts
var IsNewChatSessionContext = new RawContextKey("isNewChatSession", true);

var SessionIdContext = new RawContextKey("sessionId", "", localize(3902, null));

var SessionProviderIdContext = new RawContextKey("sessionProviderId", "", localize(3911, null));

var SessionTypeContext = new RawContextKey("sessionType", "", localize(3933, null));

var SessionWorkspaceIsVirtualContext = new RawContextKey("sessionWorkspaceIsVirtual", true, localize(3935, null));

var SessionHasGitRepositoryContext = new RawContextKey("sessionHasGitRepository", false, localize(3893, null));

var SessionHasGitSyncActionRunningContext = new RawContextKey("sessionHasGitSyncActionRunning", false, localize(3894, null));

var SessionUsesCombinedConfigPickerContext = new RawContextKey("sessionUsesCombinedConfigPicker", false, localize(3934, null));

var SessionSupportsRenameContext = new RawContextKey("sessionSupportsRename", false, localize(3929, null));

var SessionSupportsDeleteContext = new RawContextKey("sessionSupportsDelete", false, localize(3926, null));

var SessionIsCreatedContext = new RawContextKey("sessionIsCreated", false, localize(3905, null));

var SessionIsStickyContext = new RawContextKey("sessionIsSticky", false, localize(3909, null));

var SessionIsMaximizedContext = new RawContextKey("sessionIsMaximized", false, localize(3906, null));

var SessionSupportsMultipleChatsContext = new RawContextKey("sessionSupportsMultipleChats", false, localize(3928, null));

var SessionSupportsForkContext = new RawContextKey("sessionSupportsFork", false, localize(3927, null));

var SessionSupportsSideChatContext = new RawContextKey("sessionSupportsSideChat", false, localize(3930, null));

var SessionHasMultipleCommittedChatsContext = new RawContextKey("sessionHasMultipleCommittedChats", false, localize(3896, null));

var SessionHasSideChatsContext = new RawContextKey("sessionHasSideChats", false, localize(3900, null));

var SessionShouldShowChatTabsContext = new RawContextKey("sessionShouldShowChatTabs", false, localize(3921, null));

var SessionHasMultipleOpenChatsContext = new RawContextKey("sessionHasMultipleOpenChats", false, localize(3897, null));

var SessionActiveChatIsClosableContext = new RawContextKey("sessionActiveChatIsClosable", false, localize(3885, null));

var SessionActiveChatIsDeletableContext = new RawContextKey("sessionActiveChatIsDeletable", false, localize(3886, null));

var SessionIsReadContext = new RawContextKey("sessionIsRead", true, localize(3908, null));

var SessionIsArchivedContext = new RawContextKey("sessionIsArchived", false, localize(3904, null));

var SessionIsActiveContext = new RawContextKey("sessionIsActive", false, localize(3903, null));

var SessionHasChangesContext = new RawContextKey("sessionHasChanges", false, localize(3892, null));

var SessionHasCachedChangesContext = new RawContextKey("sessionHasCachedChanges", false, localize(3891, null));

var SessionHasPullRequestContext = new RawContextKey("sessionHasPullRequest", false, localize(3899, null));

var SessionHasIssuesContext = new RawContextKey("sessionHasIssues", false, localize(3895, null));

var SessionHasWorkspaceContext = new RawContextKey("sessionHasWorkspace", false, localize(3901, null));

var SessionsChatBackgroundAvailableContext = new RawContextKey("sessionsChatBackgroundAvailable", false, localize(3916, null));

var SessionsChatBackgroundConfiguredContext = new RawContextKey("sessionsChatBackgroundConfigured", false, localize(3917, null));

var SessionsChatBackgroundImageConfiguredContext = new RawContextKey("sessionsChatBackgroundImageConfigured", false, localize(3918, null));

var IsQuickChatSessionContext = new RawContextKey("isQuickChatSession", false, localize(3883, null));

var ActiveSessionsContext = new RawContextKey("activeSessions", "", localize(3870, null));

var SessionsFocusContext = new RawContextKey("sessionsFocus", false, localize(3919, null));

var SessionsVisibleContext = new RawContextKey("sessionsVisible", false, localize(3931, null));

var MultipleSessionsVisibleContext = new RawContextKey("multipleSessionsVisible", false, localize(3884, null));

var SessionsHasClosedItemContext = new RawContextKey("sessionsHasClosedItem", false, localize(3920, null));

var SessionsEditorScopeContext = ContextKeyExpr.or(EditorAreaFocusContext, AuxiliaryBarFocusContext);

var CustomViewVisibleContext = new RawContextKey("customViewVisible", false, localize(3881, null));

var AutomationsCustomViewFocusContext = new RawContextKey("automationsCustomViewFocus", false, localize(3879, null));

var AutomationsHasItemsContext = new RawContextKey("automationsHasItems", false, localize(3880, null));

var SessionPrimaryPullRequestOperationContext = new RawContextKey("sessionPrimaryPullRequestOperation", "", localize(3910, null));

var SessionAgentMergeEnabledContext = new RawContextKey("sessionAgentMergeEnabled", false, localize(3887, null));

var SessionHasOpenPullRequestContext = new RawContextKey("sessionHasOpenPullRequest", false, localize(3898, null));

var SessionsWelcomeVisibleContext = new RawContextKey("sessionsWelcomeVisible", false, localize(3932, null));

var SessionsTitleBarNewSessionEnabledContext = new RawContextKey("sessionsTitleBarNewSessionEnabled", false, localize(3925, null));

var SessionWorkspacePickerGroupContext = new RawContextKey("sessionWorkspacePickerGroup", "", localize(3936, null));

var SessionWorkspacePickerVisibleContext = new RawContextKey("sessionWorkspacePickerVisible", false, localize(3937, null));

var SessionHarnessPickerVisibleContext = new RawContextKey("sessionHarnessPickerVisible", false, localize(3890, null));

var SessionHarnessPickerInteractiveContext = new RawContextKey("sessionHarnessPickerInteractive", false, localize(3889, null));

var SessionIsolationPickerVisibleContext = new RawContextKey("sessionIsolationPickerVisible", false, localize(3907, null));

var AgentHostSessionTypesAvailableContext = new RawContextKey("agentHostSessionTypesAvailable", false, localize(3871, null));

var SessionsPickerVisibleContext = new RawContextKey("sessionsPickerVisible", false, localize(3924, null));

var SessionChatsPickerVisibleContext = new RawContextKey("sessionChatsPickerVisible", false, localize(3888, null));

var SessionsBlockedSessionsVisibleContext = new RawContextKey("sessionsBlockedSessionsVisible", false, localize(3913, null));

var SessionsAquariumActiveContext = new RawContextKey("sessionsAquariumActive", false, localize(3912, null));

var CanGoBackContext = new RawContextKey("sessionsCanGoBack", false, localize(3914, null));

var CanGoForwardContext = new RawContextKey("sessionsCanGoForward", false, localize(3915, null));

var EditorMaximizedContext = new RawContextKey("editorMaximized", false, localize(3882, null));

var SinglePaneLayoutEnabledContext = new RawContextKey("agentSessionsSinglePaneLayoutEnabled", false, localize(3878, null));

var HasDockedDetailsContext = new RawContextKey("agentSessionsHasDockedDetails", false, localize(3872, null));

var SinglePaneDiffEditorInputActiveContext = new RawContextKey("agentSessionsSinglePaneDiffEditorInputActive", false, localize(3875, null));

var SinglePaneChangesTabMissingContext = new RawContextKey("agentSessionsSinglePaneChangesTabMissing", false, localize(3874, null));

var SinglePaneFilesTabMissingContext = new RawContextKey("agentSessionsSinglePaneFilesTabMissing", false, localize(3877, null));

var SinglePaneChangesTabAvailableContext = new RawContextKey("agentSessionsSinglePaneChangesTabAvailable", false, localize(3873, null));

var SinglePaneFilesTabAvailableContext = new RawContextKey("agentSessionsSinglePaneFilesTabAvailable", false, localize(3876, null));

var IsPhoneLayoutContext = new RawContextKey("sessionsIsPhoneLayout", false, localize(3922, null));

var KeyboardVisibleContext = new RawContextKey("sessionsKeyboardVisible", false, localize(3923, null));
export { IsNewChatSessionContext, SessionIdContext, SessionProviderIdContext, SessionTypeContext, SessionWorkspaceIsVirtualContext, SessionHasGitRepositoryContext, SessionHasGitSyncActionRunningContext, SessionUsesCombinedConfigPickerContext, SessionSupportsRenameContext, SessionSupportsDeleteContext, SessionIsCreatedContext, SessionIsStickyContext, SessionIsMaximizedContext, SessionSupportsMultipleChatsContext, SessionSupportsForkContext, SessionSupportsSideChatContext, SessionHasMultipleCommittedChatsContext, SessionHasSideChatsContext, SessionShouldShowChatTabsContext, SessionHasMultipleOpenChatsContext, SessionActiveChatIsClosableContext, SessionActiveChatIsDeletableContext, SessionIsReadContext, SessionIsArchivedContext, SessionIsActiveContext, SessionHasChangesContext, SessionHasCachedChangesContext, SessionHasPullRequestContext, SessionHasIssuesContext, SessionHasWorkspaceContext, SessionsChatBackgroundAvailableContext, SessionsChatBackgroundConfiguredContext, SessionsChatBackgroundImageConfiguredContext, IsQuickChatSessionContext, ActiveSessionsContext, SessionsFocusContext, SessionsVisibleContext, MultipleSessionsVisibleContext, SessionsHasClosedItemContext, SessionsEditorScopeContext, CustomViewVisibleContext, AutomationsCustomViewFocusContext, AutomationsHasItemsContext, SessionPrimaryPullRequestOperationContext, SessionAgentMergeEnabledContext, SessionHasOpenPullRequestContext, SessionsWelcomeVisibleContext, SessionsTitleBarNewSessionEnabledContext, SessionWorkspacePickerGroupContext, SessionWorkspacePickerVisibleContext, SessionHarnessPickerVisibleContext, SessionHarnessPickerInteractiveContext, SessionIsolationPickerVisibleContext, AgentHostSessionTypesAvailableContext, SessionsPickerVisibleContext, SessionChatsPickerVisibleContext, SessionsBlockedSessionsVisibleContext, SessionsAquariumActiveContext, CanGoBackContext, CanGoForwardContext, EditorMaximizedContext, SinglePaneLayoutEnabledContext, HasDockedDetailsContext, SinglePaneDiffEditorInputActiveContext, SinglePaneChangesTabMissingContext, SinglePaneFilesTabMissingContext, SinglePaneChangesTabAvailableContext, SinglePaneFilesTabAvailableContext, IsPhoneLayoutContext, KeyboardVisibleContext };
