// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHost.api.impl.ts
import { checkProposedApiEnabled, isProposedApiEnabled } from "./module-0167.mjs";
import { IExtHostInitDataService } from "./module-0049.mjs";
import { IExtHostFileSystemInfo } from "./module-0061.mjs";
import { IExtHostConsumerFileSystem } from "./module-0252.mjs";
import { Extension, IExtHostExtensionService } from "./module-0282.mjs";
import { IExtHostWorkspace } from "./module-0245.mjs";
import { ExtHostTelemetryLogger, IExtHostTelemetry, isNewAppInstall } from "./module-0260.mjs";
import { IExtHostConfiguration } from "./module-0247.mjs";
import { IURITransformerService } from "./module-0053.mjs";
import { IExtHostRpcService } from "./module-0052.mjs";
import { IExtHostStorage } from "./module-0250.mjs";
import { IExtensionStoragePaths } from "./module-0253.mjs";
import { ILogService, ILoggerService, LogLevel } from "./module-0045.mjs";
import { IExtHostTunnelService } from "./module-0255.mjs";
import { IExtHostApiDeprecationService } from "./module-0283.mjs";
import { IExtHostWindow } from "./module-0264.mjs";
import { IExtHostPower } from "./module-0313.mjs";
import { IExtHostUrlsService } from "./module-0265.mjs";
import { IExtHostSecretState } from "./module-0278.mjs";
import { IExtHostEditorTabs } from "./module-0300.mjs";
import { IExtHostManagedSockets } from "./module-0281.mjs";
import { IExtHostBrowserTunnelProxy } from "./module-0315.mjs";
import { IExtHostProgress } from "./module-0267.mjs";
import { IExtHostAuthentication } from "./module-0269.mjs";
import { IExtHostLanguageModels } from "./module-0270.mjs";
import { IExtHostMpcService } from "./module-0320.mjs";
import { IExtHostDataChannels } from "./module-0322.mjs";
import { IExtHostMeteredConnection } from "./module-0323.mjs";
import { IExtHostGitExtensionService } from "./module-0324.mjs";
import { CandidatePortSource, ExtHostContext, MainContext } from "./module-0025.mjs";
import { IExtHostDecorations } from "./module-0288.mjs";
import { IExtHostDocumentsAndEditors } from "./module-0294.mjs";
import { IExtHostCommands } from "./module-0261.mjs";
import { IExtHostTerminalService } from "./module-0262.mjs";
import { IExtHostTerminalShellIntegration } from "./module-0316.mjs";
import { IExtHostDebugService } from "./module-0307.mjs";
import { IExtHostSearch } from "./module-0312.mjs";
import { IExtHostTask } from "./module-0297.mjs";
import { IExtHostOutputService } from "./module-0287.mjs";
import { IExtHostLocalizationService } from "./module-0280.mjs";
import { ExtHostDocuments } from "./module-0359.mjs";
import { ExtHostDocumentContentProvider } from "./module-0357.mjs";
import { ExtHostDocumentSaveParticipant } from "./module-0358.mjs";
import { ExtHostNotebookController } from "./module-0419.mjs";
import { ExtHostNotebookDocuments } from "./module-0421.mjs";
import { ExtHostNotebookEditors } from "./module-0422.mjs";
import { ExtHostNotebookKernels } from "./module-0425.mjs";
import { ExtHostNotebookRenderers } from "./module-0426.mjs";
import { ExtHostNotebookDocumentSaveParticipant } from "./module-0420.mjs";
import { ExtHostEditors } from "./module-0437.mjs";
import { ExtHostTreeViews } from "./module-0442.mjs";
import { ExtHostEditorInsets } from "./module-0346.mjs";
import { ExtHostDiagnostics } from "./module-0355.mjs";
import { ExtHostLanguages } from "./module-0404.mjs";
import { ExtHostLanguageFeatures } from "./module-0369.mjs";
import { ExtHostCodeMapper } from "./module-0347.mjs";
import { ExtHostFileSystem } from "./module-0363.mjs";
import { ExtHostFileSystemEventService } from "./module-0365.mjs";
import { createExtHostQuickOpen } from "./module-0430.mjs";
import { ExtHostSCM } from "./module-0432.mjs";
import { ExtHostQuickDiff } from "./module-0428.mjs";
import { ExtHostAgentEditorComments } from "./module-0429.mjs";
import { ExtHostShare } from "./module-0433.mjs";
import { createExtHostComments } from "./module-0348.mjs";
import { ExtHostLabelService } from "./module-0367.mjs";
import { ExtHostTheming } from "./module-0438.mjs";
import { ExtHostTimeline } from "./module-0439.mjs";
import { ExtHostWebviews } from "./module-0352.mjs";
import { ExtHostWebviewPanels } from "./module-0444.mjs";
import { ExtHostCustomEditors } from "./module-0354.mjs";
import { ExtHostWebviewViews } from "./module-0445.mjs";
import { IExtHostTesting } from "./module-0302.mjs";
import { ExtHostUriOpeners } from "./module-0443.mjs";
import { ExtHostProfileContentHandlers } from "./module-0427.mjs";
import { ExtHostChatOutputRenderer } from "./module-0339.mjs";
import { ExtHostInteractive } from "./module-0366.mjs";
import { ExtHostLanguageModelTools } from "./module-0403.mjs";
import { ExtHostChatSessions } from "./module-0340.mjs";
import { ExtHostChatAgents2 } from "./module-0338.mjs";
import { ExtHostChatContext } from "./module-0446.mjs";
import { ExtHostChatDebug } from "./module-0447.mjs";
import { ExtHostRelatedInformation } from "./module-0331.mjs";
import { ExtHostAiEmbeddingVector } from "./module-0361.mjs";
import { ExtHostAiSettingsSearch } from "./module-0332.mjs";
import { ExtHostStatusBar } from "./module-0436.mjs";
import { ExtHostSpeech } from "./module-0434.mjs";
import { ExtHostEmbeddings } from "./module-0360.mjs";
import { ExtHostBrowsers } from "./module-0435.mjs";
import { ExtHostChatQuota } from "./module-0342.mjs";
import { ExtHostBulkEdits } from "./module-0335.mjs";
import { ExtHostClipboard } from "./module-0344.mjs";
import { ExtHostMessageService } from "./module-0405.mjs";
import { ExtHostDialogs } from "./module-0356.mjs";
import { ExtHostChatStatus } from "./module-0341.mjs";
import { ExtHostChatInputNotification } from "./module-0343.mjs";
import { ExtHostApiCommands } from "./module-0334.mjs";
import { CancellationError, ReadonlyError, onUnexpectedExternalError } from "./module-0002.mjs";
import { ExtensionError, ExtensionIdentifierSet } from "./module-0040.mjs";
import { Schemas, matchesScheme } from "./module-0031.mjs";
import { getRemoteName } from "./module-0039.mjs";
import { Emitter, Event } from "./module-0019.mjs";
import { LanguageSelector, Range3 } from "./module-0239.mjs";
import { score, targetsNotebooks } from "./module-0328.mjs";
import { URI } from "./module-0023.mjs";
import { severity_default } from "./module-0058.mjs";
import { AsyncIterableObject, raceCancellationError } from "./module-0034.mjs";
import { combinedDisposable } from "./module-0011.mjs";
import { BranchCoverage, Breakpoint, CallHierarchyIncomingCall, CallHierarchyItem, CallHierarchyOutgoingCall, CellErrorStackFrame, ChatCompletionItem, ChatCopyKind, ChatDebugAgentResponseEvent, ChatDebugEventHookContent, ChatDebugEventMessageContent, ChatDebugEventModelTurnContent, ChatDebugEventTextContent, ChatDebugEventToolCallContent, ChatDebugGenericEvent, ChatDebugHookResult, ChatDebugLogLevel, ChatDebugMessageContentType, ChatDebugMessageSection, ChatDebugModelTurnEvent, ChatDebugSubagentInvocationEvent, ChatDebugSubagentStatus, ChatDebugToolCallEvent, ChatDebugToolCallResult, ChatDebugUserMessageEvent, ChatEditingSessionActionOutcome, ChatEditorTabInput, ChatErrorLevel, ChatImageMimeType, ChatInputNotificationSeverity, ChatLocation, ChatQuestion, ChatQuestionType, ChatReferenceBinaryData, ChatReferenceDiagnostic, ChatRequestEditedFileEventKind, ChatRequestEditorData, ChatRequestNotebookData, ChatRequestTurn, ChatResponseAnchorPart, ChatResponseAutoModeResolutionPart, ChatResponseClearToPreviousToolInvocationReason2, ChatResponseCodeCitationPart, ChatResponseCodeblockUriPart, ChatResponseCommandButtonPart, ChatResponseConfirmationPart, ChatResponseExtensionsPart, ChatResponseExternalEditPart, ChatResponseFileTreePart, ChatResponseHookPart, ChatResponseInfoPart, ChatResponseMarkdownPart, ChatResponseMarkdownWithVulnerabilitiesPart, ChatResponseMovePart, ChatResponseMultiDiffPart, ChatResponseNotebookEditPart, ChatResponseProgressPart, ChatResponseProgressPart2, ChatResponsePullRequestPart, ChatResponseQuestionCarouselPart, ChatResponseReferencePart, ChatResponseReferencePartStatusKind, ChatResponseTextEditPart, ChatResponseThinkingProgressPart, ChatResponseTurn, ChatResponseTurn2, ChatResponseVoiceProgressPart, ChatResponseWarningPart, ChatResponseWorkspaceEditPart, ChatResultFeedbackKind, ChatSessionChangedFile, ChatSessionCustomizationType, ChatSessionStatus, ChatSubagentToolInvocationData, ChatTodoStatus, ChatToolInvocationPart, ChatVariableLevel, CodeAction, CodeActionTriggerKind, CodeLens, Color, ColorInformation, ColorPresentation, ColorThemeKind, CommentMode, CommentState, CommentThreadApplicability, CommentThreadCollapsibleState, CommentThreadFocus, CommentThreadState, CompletionItem, CompletionItemKind, CompletionItemTag, CompletionList, CompletionTriggerKind, ConfigurationTarget2, CustomEditorTabInput, CustomExecution, DataTransfer, DataTransferItem, DebugAdapterExecutable, DebugAdapterInlineImplementation, DebugAdapterNamedPipeServer, DebugAdapterServer, DebugConsoleMode, DebugStackFrame, DebugThread, DebugVisualization, DeclarationCoverage, DecorationRangeBehavior, Disposable2, DocumentDropEdit, DocumentDropOrPasteEditKind, DocumentHighlight, DocumentHighlightKind, DocumentLink, DocumentPasteEdit, DocumentPasteTriggerKind, DocumentSymbol, EnvironmentVariableMutatorType, EvaluatableExpression, ExtendedLanguageModelToolResult, ExtensionKind, ExtensionMode, ExtensionRuntime, ExternalUriOpenerPriority, FileChangeType, FileCoverage, FileDecoration, FileSystemError, FoldingRange, FoldingRangeKind2, FunctionBreakpoint, Hover, HoverVerbosityAction, InlayHint, InlayHintKind, InlayHintLabelPart, InlineCompletionDisplayLocationKind, InlineCompletionEndOfLifeReasonKind, InlineCompletionTriggerKind, InlineCompletionsDisposeReasonKind, InlineSuggestion, InlineSuggestionList, InlineValueEvaluatableExpression, InlineValueText, InlineValueVariableLookup, InputBoxValidationSeverity, InteractiveEditorResponseFeedbackKind, InteractiveSessionVoteDirection, InteractiveWindowInput, KeywordRecognitionStatus, LanguageModelChatMessage, LanguageModelChatMessage2, LanguageModelChatMessageRole, LanguageModelChatToolMode, LanguageModelDataPart, LanguageModelError, LanguageModelPartAudience, LanguageModelPromptTsxPart, LanguageModelTextPart, LanguageModelThinkingPart, LanguageModelToolCallPart, LanguageModelToolExtensionSource, LanguageModelToolMCPSource, LanguageModelToolResult, LanguageModelToolResult2, LanguageModelToolResultPart, LanguageStatusSeverity, LinkedEditingRanges, ManagedResolvedAuthority, McpHttpServerDefinition, McpStdioServerDefinition, McpToolAvailability, McpToolInvocationContentData, MultiDocumentHighlight, NewSymbolName, NewSymbolNameTag, NewSymbolNameTriggerKind, NotebookCellExecutionState, NotebookCellStatusBarAlignment, NotebookCellStatusBarItem, NotebookControllerAffinity, NotebookControllerAffinity2, NotebookDiffEditorTabInput, NotebookEditorRevealType, NotebookEditorTabInput, NotebookKernelSourceAction, NotebookRendererScript, NotebookVariablesRequestKind, ParameterInformation, PartialAcceptTriggerKind, PortAttributes, PortAutoForwardAction, ProcessExecution, ProgressLocation, QuickInputButtonLocation, QuickInputButtons, QuickPickItemKind, RelatedInformationType, RelativePattern, RemoteAuthorityResolverError, ResolvedAuthority, SelectionRange, SemanticTokens, SemanticTokensBuilder, SemanticTokensEdit, SemanticTokensEdits, SemanticTokensLegend, SettingsSearchResultKind, ShellExecution, ShellQuoting, SignatureHelp, SignatureHelpTriggerKind, SignatureInformation, SourceBreakpoint, SourceControlInputBoxValidationType, SpeechToTextStatus, StandardTokenType, StatementCoverage, StatusBarAlignment, SyntaxHighlightingTokenFontStyle, SyntaxTokenType, Task, TaskEventKind, TaskGroup, TaskPanelKind, TaskRevealKind, TaskRunOn, TaskScope, TerminalCompletionItem, TerminalCompletionItemKind, TerminalCompletionList, TerminalEditorTabInput, TerminalExitReason, TerminalLink, TerminalLocation, TerminalOutputAnchor, TerminalProfile, TerminalQuickFixCommand, TerminalQuickFixOpener, TerminalShellExecutionCommandLineConfidence, TerminalShellType, TestCoverageCount, TestMessage, TestMessageStackFrame, TestResultState, TestRunProfileKind, TestRunRequest, TestTag, TextDiffTabInput, TextDocumentChangeReason, TextDocumentSaveReason, TextEditorChangeKind, TextEditorLineNumbersStyle, TextEditorRevealType, TextEditorSelectionChangeKind, TextMergeTabInput, TextMultiDiffTabInput, TextTabInput, TextToSpeechStatus, ThemeColor2, ThemeIcon2, TimelineItem, TreeItem, TreeItemCheckboxState, TreeItemCollapsibleState, TypeHierarchyItem, VerboseHover, ViewColumn, WebviewEditorTabInput, WorkspaceTrustState } from "./module-0238.mjs";
import { CancellationTokenSource } from "./module-0026.mjs";
import { CodeActionKind } from "./module-0228.mjs";
import { DebugConfigurationProviderTriggerKind } from "./module-0199.mjs";
import { Diagnostic, DiagnosticRelatedInformation, DiagnosticSeverity, DiagnosticTag } from "./module-0229.mjs";
import { EndOfLine, TextEdit } from "./module-0236.mjs";
import { FilePermission, FileType } from "./module-0057.mjs";
import { IndentAction } from "./module-0329.mjs";
import { Location2 } from "./module-0230.mjs";
import { MarkdownString2 } from "./module-0225.mjs";
import { OverviewRulerLane } from "./module-0087.mjs";
import { Position2 } from "./module-0226.mjs";
import { Range2 } from "./module-0227.mjs";
import { Selection } from "./module-0232.mjs";
import { SnippetString } from "./module-0233.mjs";
import { SymbolInformation, SymbolKind2, SymbolTag } from "./module-0235.mjs";
import { SnippetTextEdit } from "./module-0234.mjs";
import { TextEditorCursorStyle } from "./module-0082.mjs";
import { UIKind } from "./module-0020.mjs";
import { WorkspaceEdit } from "./module-0237.mjs";
import { NotebookCellData, NotebookCellKind, NotebookCellOutput, NotebookCellOutputItem, NotebookData, NotebookEdit, NotebookRange } from "./module-0231.mjs";
import { AISearchKeyword, ExcludeSettingOptions, TextSearchCompleteMessageType, TextSearchContext2, TextSearchMatch2 } from "./module-0240.mjs";
import { TelemetryTrustedValue } from "./module-0164.mjs";
import { EditSessionIdentityMatch } from "./module-0330.mjs";


// src/vs/workbench/api/common/extHost.api.impl.ts
function getTerminalInternalOptions(extension, options2) {
  if (options2.isRemoteResolverTerminal) {
    checkProposedApiEnabled(extension, "terminalRemoteResolver");
    return { isRemoteResolverTerminal: true };
  }
  return void 0;
}

function createApiFactoryAndRegisterActors(accessor) {
  const initData = accessor.get(IExtHostInitDataService);
  const extHostFileSystemInfo = accessor.get(IExtHostFileSystemInfo);
  const extHostConsumerFileSystem = accessor.get(IExtHostConsumerFileSystem);
  const extensionService = accessor.get(IExtHostExtensionService);
  const extHostWorkspace = accessor.get(IExtHostWorkspace);
  const extHostTelemetry = accessor.get(IExtHostTelemetry);
  const extHostConfiguration = accessor.get(IExtHostConfiguration);
  const uriTransformer = accessor.get(IURITransformerService);
  const rpcProtocol = accessor.get(IExtHostRpcService);
  const extHostStorage = accessor.get(IExtHostStorage);
  const extensionStoragePaths = accessor.get(IExtensionStoragePaths);
  const extHostLoggerService = accessor.get(ILoggerService);
  const extHostLogService = accessor.get(ILogService);
  const extHostTunnelService = accessor.get(IExtHostTunnelService);
  const extHostApiDeprecation = accessor.get(IExtHostApiDeprecationService);
  const extHostWindow = accessor.get(IExtHostWindow);
  const extHostPower = accessor.get(IExtHostPower);
  const extHostUrls = accessor.get(IExtHostUrlsService);
  const extHostSecretState = accessor.get(IExtHostSecretState);
  const extHostEditorTabs = accessor.get(IExtHostEditorTabs);
  const extHostManagedSockets = accessor.get(IExtHostManagedSockets);
  const extHostBrowserTunnelProxy = accessor.get(IExtHostBrowserTunnelProxy);
  const extHostProgress = accessor.get(IExtHostProgress);
  const extHostAuthentication = accessor.get(IExtHostAuthentication);
  const extHostLanguageModels = accessor.get(IExtHostLanguageModels);
  const extHostMcp = accessor.get(IExtHostMpcService);
  const extHostDataChannels = accessor.get(IExtHostDataChannels);
  const extHostMeteredConnection = accessor.get(IExtHostMeteredConnection);
  const extHostGitExtensionService = accessor.get(IExtHostGitExtensionService);
  rpcProtocol.set(ExtHostContext.ExtHostFileSystemInfo, extHostFileSystemInfo);
  rpcProtocol.set(ExtHostContext.ExtHostLogLevelServiceShape, extHostLoggerService);
  rpcProtocol.set(ExtHostContext.ExtHostWorkspace, extHostWorkspace);
  rpcProtocol.set(ExtHostContext.ExtHostConfiguration, extHostConfiguration);
  rpcProtocol.set(ExtHostContext.ExtHostExtensionService, extensionService);
  rpcProtocol.set(ExtHostContext.ExtHostStorage, extHostStorage);
  rpcProtocol.set(ExtHostContext.ExtHostTunnelService, extHostTunnelService);
  rpcProtocol.set(ExtHostContext.ExtHostWindow, extHostWindow);
  rpcProtocol.set(ExtHostContext.ExtHostPower, extHostPower);
  rpcProtocol.set(ExtHostContext.ExtHostUrls, extHostUrls);
  rpcProtocol.set(ExtHostContext.ExtHostSecretState, extHostSecretState);
  rpcProtocol.set(ExtHostContext.ExtHostTelemetry, extHostTelemetry);
  rpcProtocol.set(ExtHostContext.ExtHostEditorTabs, extHostEditorTabs);
  rpcProtocol.set(ExtHostContext.ExtHostManagedSockets, extHostManagedSockets);
  rpcProtocol.set(ExtHostContext.ExtHostBrowserTunnelProxy, extHostBrowserTunnelProxy);
  rpcProtocol.set(ExtHostContext.ExtHostProgress, extHostProgress);
  rpcProtocol.set(ExtHostContext.ExtHostAuthentication, extHostAuthentication);
  rpcProtocol.set(ExtHostContext.ExtHostChatProvider, extHostLanguageModels);
  rpcProtocol.set(ExtHostContext.ExtHostDataChannels, extHostDataChannels);
  rpcProtocol.set(ExtHostContext.ExtHostMeteredConnection, extHostMeteredConnection);
  rpcProtocol.set(ExtHostContext.ExtHostGitExtension, extHostGitExtensionService);
  const extHostDecorations = rpcProtocol.set(ExtHostContext.ExtHostDecorations, accessor.get(IExtHostDecorations));
  const extHostDocumentsAndEditors = rpcProtocol.set(ExtHostContext.ExtHostDocumentsAndEditors, accessor.get(IExtHostDocumentsAndEditors));
  const extHostCommands = rpcProtocol.set(ExtHostContext.ExtHostCommands, accessor.get(IExtHostCommands));
  const extHostTerminalService = rpcProtocol.set(ExtHostContext.ExtHostTerminalService, accessor.get(IExtHostTerminalService));
  const extHostTerminalShellIntegration = rpcProtocol.set(ExtHostContext.ExtHostTerminalShellIntegration, accessor.get(IExtHostTerminalShellIntegration));
  const extHostDebugService = rpcProtocol.set(ExtHostContext.ExtHostDebugService, accessor.get(IExtHostDebugService));
  const extHostSearch = rpcProtocol.set(ExtHostContext.ExtHostSearch, accessor.get(IExtHostSearch));
  const extHostTask = rpcProtocol.set(ExtHostContext.ExtHostTask, accessor.get(IExtHostTask));
  const extHostOutputService = rpcProtocol.set(ExtHostContext.ExtHostOutputService, accessor.get(IExtHostOutputService));
  const extHostLocalization = rpcProtocol.set(ExtHostContext.ExtHostLocalization, accessor.get(IExtHostLocalizationService));
  const extHostDocuments = rpcProtocol.set(ExtHostContext.ExtHostDocuments, new ExtHostDocuments(rpcProtocol, extHostDocumentsAndEditors));
  const extHostDocumentContentProviders = rpcProtocol.set(ExtHostContext.ExtHostDocumentContentProviders, new ExtHostDocumentContentProvider(rpcProtocol, extHostDocumentsAndEditors, extHostLogService));
  const extHostDocumentSaveParticipant = rpcProtocol.set(ExtHostContext.ExtHostDocumentSaveParticipant, new ExtHostDocumentSaveParticipant(extHostLogService, extHostDocuments, rpcProtocol.getProxy(MainContext.MainThreadBulkEdits)));
  const extHostNotebook = rpcProtocol.set(ExtHostContext.ExtHostNotebook, new ExtHostNotebookController(rpcProtocol, extHostCommands, extHostDocumentsAndEditors, extHostDocuments, extHostConsumerFileSystem, extHostSearch, extHostLogService));
  const extHostNotebookDocuments = rpcProtocol.set(ExtHostContext.ExtHostNotebookDocuments, new ExtHostNotebookDocuments(extHostNotebook));
  const extHostNotebookEditors = rpcProtocol.set(ExtHostContext.ExtHostNotebookEditors, new ExtHostNotebookEditors(extHostLogService, extHostNotebook));
  const extHostNotebookKernels = rpcProtocol.set(ExtHostContext.ExtHostNotebookKernels, new ExtHostNotebookKernels(rpcProtocol, initData, extHostNotebook, extHostCommands, extHostLogService));
  const extHostNotebookRenderers = rpcProtocol.set(ExtHostContext.ExtHostNotebookRenderers, new ExtHostNotebookRenderers(rpcProtocol, extHostNotebook));
  const extHostNotebookDocumentSaveParticipant = rpcProtocol.set(ExtHostContext.ExtHostNotebookDocumentSaveParticipant, new ExtHostNotebookDocumentSaveParticipant(extHostLogService, extHostNotebook, rpcProtocol.getProxy(MainContext.MainThreadBulkEdits)));
  const extHostEditors = rpcProtocol.set(ExtHostContext.ExtHostEditors, new ExtHostEditors(rpcProtocol, extHostDocumentsAndEditors));
  const extHostTreeViews = rpcProtocol.set(ExtHostContext.ExtHostTreeViews, new ExtHostTreeViews(rpcProtocol.getProxy(MainContext.MainThreadTreeViews), extHostCommands, extHostLogService));
  const extHostEditorInsets = rpcProtocol.set(ExtHostContext.ExtHostEditorInsets, new ExtHostEditorInsets(rpcProtocol.getProxy(MainContext.MainThreadEditorInsets), extHostEditors, initData.remote));
  const extHostDiagnostics = rpcProtocol.set(ExtHostContext.ExtHostDiagnostics, new ExtHostDiagnostics(rpcProtocol, extHostLogService, extHostFileSystemInfo, extHostDocumentsAndEditors));
  const extHostLanguages = rpcProtocol.set(ExtHostContext.ExtHostLanguages, new ExtHostLanguages(rpcProtocol, extHostDocuments, extHostCommands.converter, uriTransformer));
  const extHostLanguageFeatures = rpcProtocol.set(ExtHostContext.ExtHostLanguageFeatures, new ExtHostLanguageFeatures(rpcProtocol, uriTransformer, extHostDocuments, extHostCommands, extHostDiagnostics, extHostLogService, extHostApiDeprecation, extHostTelemetry));
  const extHostCodeMapper = rpcProtocol.set(ExtHostContext.ExtHostCodeMapper, new ExtHostCodeMapper(rpcProtocol));
  const extHostFileSystem = rpcProtocol.set(ExtHostContext.ExtHostFileSystem, new ExtHostFileSystem(rpcProtocol, extHostLanguageFeatures));
  const extHostFileSystemEvent = rpcProtocol.set(ExtHostContext.ExtHostFileSystemEventService, new ExtHostFileSystemEventService(rpcProtocol, extHostLogService, extHostDocumentsAndEditors));
  const extHostQuickOpen = rpcProtocol.set(ExtHostContext.ExtHostQuickOpen, createExtHostQuickOpen(rpcProtocol, extHostWorkspace, extHostCommands));
  const extHostSCM = rpcProtocol.set(ExtHostContext.ExtHostSCM, new ExtHostSCM(rpcProtocol, extHostCommands, extHostDocuments, extHostLogService));
  const extHostQuickDiff = rpcProtocol.set(ExtHostContext.ExtHostQuickDiff, new ExtHostQuickDiff(rpcProtocol, extHostDocuments, uriTransformer));
  const extHostAgentEditorComments = rpcProtocol.set(ExtHostContext.ExtHostAgentEditorComments, new ExtHostAgentEditorComments(rpcProtocol));
  const extHostShare = rpcProtocol.set(ExtHostContext.ExtHostShare, new ExtHostShare(rpcProtocol, uriTransformer));
  const extHostComment = rpcProtocol.set(ExtHostContext.ExtHostComments, createExtHostComments(rpcProtocol, extHostCommands, extHostDocuments));
  const extHostLabelService = rpcProtocol.set(ExtHostContext.ExtHostLabelService, new ExtHostLabelService(rpcProtocol));
  const extHostTheming = rpcProtocol.set(ExtHostContext.ExtHostTheming, new ExtHostTheming(rpcProtocol));
  const extHostTimeline = rpcProtocol.set(ExtHostContext.ExtHostTimeline, new ExtHostTimeline(rpcProtocol, extHostCommands));
  const extHostWebviews = rpcProtocol.set(ExtHostContext.ExtHostWebviews, new ExtHostWebviews(rpcProtocol, initData.remote, extHostWorkspace, extHostLogService, extHostApiDeprecation));
  const extHostWebviewPanels = rpcProtocol.set(ExtHostContext.ExtHostWebviewPanels, new ExtHostWebviewPanels(rpcProtocol, extHostWebviews, extHostWorkspace));
  const extHostCustomEditors = rpcProtocol.set(ExtHostContext.ExtHostCustomEditors, new ExtHostCustomEditors(rpcProtocol, extHostDocuments, extensionStoragePaths, extHostWebviews, extHostWebviewPanels));
  const extHostWebviewViews = rpcProtocol.set(ExtHostContext.ExtHostWebviewViews, new ExtHostWebviewViews(rpcProtocol, extHostWebviews));
  const extHostTesting = rpcProtocol.set(ExtHostContext.ExtHostTesting, accessor.get(IExtHostTesting));
  const extHostUriOpeners = rpcProtocol.set(ExtHostContext.ExtHostUriOpeners, new ExtHostUriOpeners(rpcProtocol));
  const extHostProfileContentHandlers = rpcProtocol.set(ExtHostContext.ExtHostProfileContentHandlers, new ExtHostProfileContentHandlers(rpcProtocol));
  const extHostChatOutputRenderer = rpcProtocol.set(ExtHostContext.ExtHostChatOutputRenderer, new ExtHostChatOutputRenderer(rpcProtocol, extHostWebviews));
  rpcProtocol.set(ExtHostContext.ExtHostInteractive, new ExtHostInteractive(rpcProtocol, extHostNotebook, extHostDocumentsAndEditors, extHostCommands, extHostLogService));
  const extHostLanguageModelTools = rpcProtocol.set(ExtHostContext.ExtHostLanguageModelTools, new ExtHostLanguageModelTools(rpcProtocol, extHostLanguageModels));
  const extHostChatSessions = rpcProtocol.set(ExtHostContext.ExtHostChatSessions, new ExtHostChatSessions(extHostCommands, extHostLanguageModels, rpcProtocol, extHostLogService));
  const extHostChatAgents2 = rpcProtocol.set(ExtHostContext.ExtHostChatAgents2, new ExtHostChatAgents2(rpcProtocol, extHostLogService, extHostCommands, extHostDocuments, extHostDocumentsAndEditors, extHostLanguageModels, extHostDiagnostics, extHostLanguageModelTools, extHostChatSessions));
  const extHostChatContext = rpcProtocol.set(ExtHostContext.ExtHostChatContext, new ExtHostChatContext(rpcProtocol, extHostCommands, extHostEditorTabs));
  const extHostChatDebug = rpcProtocol.set(ExtHostContext.ExtHostChatDebug, new ExtHostChatDebug(rpcProtocol));
  const extHostAiRelatedInformation = rpcProtocol.set(ExtHostContext.ExtHostAiRelatedInformation, new ExtHostRelatedInformation(rpcProtocol));
  const extHostAiEmbeddingVector = rpcProtocol.set(ExtHostContext.ExtHostAiEmbeddingVector, new ExtHostAiEmbeddingVector(rpcProtocol));
  const extHostAiSettingsSearch = rpcProtocol.set(ExtHostContext.ExtHostAiSettingsSearch, new ExtHostAiSettingsSearch(rpcProtocol));
  const extHostStatusBar = rpcProtocol.set(ExtHostContext.ExtHostStatusBar, new ExtHostStatusBar(rpcProtocol, extHostCommands.converter));
  const extHostSpeech = rpcProtocol.set(ExtHostContext.ExtHostSpeech, new ExtHostSpeech(rpcProtocol));
  const extHostEmbeddings = rpcProtocol.set(ExtHostContext.ExtHostEmbeddings, new ExtHostEmbeddings(rpcProtocol));
  const extHostBrowsers = rpcProtocol.set(ExtHostContext.ExtHostBrowsers, new ExtHostBrowsers(rpcProtocol));
  const extHostChatQuota = rpcProtocol.set(ExtHostContext.ExtHostChatQuota, new ExtHostChatQuota(rpcProtocol));
  rpcProtocol.set(ExtHostContext.ExtHostMcp, accessor.get(IExtHostMpcService));
  const expected = Object.values(ExtHostContext);
  rpcProtocol.assertRegistered(expected);
  const extHostBulkEdits = new ExtHostBulkEdits(rpcProtocol, extHostDocumentsAndEditors);
  const extHostClipboard = new ExtHostClipboard(rpcProtocol);
  const extHostMessageService = new ExtHostMessageService(rpcProtocol, extHostLogService);
  const extHostDialogs = new ExtHostDialogs(rpcProtocol);
  const extHostChatStatus = new ExtHostChatStatus(rpcProtocol);
  const extHostChatInputNotification = new ExtHostChatInputNotification(rpcProtocol);
  ExtHostApiCommands.register(extHostCommands);
  return function(extension, extensionInfo, configProvider) {
    function _asExtensionEvent(actual) {
      return (listener, thisArgs, disposables) => {
        const handle = actual((e) => {
          try {
            listener.call(thisArgs, e);
          } catch (err) {
            onUnexpectedExternalError(new ExtensionError(extension.identifier, err, "FAILED to handle event"));
          }
        });
        disposables?.push(handle);
        return handle;
      };
    }
    const checkSelector = (function() {
      let done = !extension.isUnderDevelopment;
      function informOnce() {
        if (!done) {
          extHostLogService.info(`Extension '${extension.identifier.value}' uses a document selector without scheme. Learn more about this: https://go.microsoft.com/fwlink/?linkid=872305`);
          done = true;
        }
      }
      return function perform(selector) {
        if (Array.isArray(selector)) {
          selector.forEach(perform);
        } else if (typeof selector === "string") {
          informOnce();
        } else {
          const filter2 = selector;
          if (typeof filter2.scheme === "undefined") {
            informOnce();
          }
          if (typeof filter2.exclusive === "boolean") {
            checkProposedApiEnabled(extension, "documentFiltersExclusive");
          }
        }
        return selector;
      };
    })();
    const authentication = {
      getSession(providerId, scopesOrChallenge, options2) {
        if (typeof options2?.forceNewSession === "object" && options2.forceNewSession.learnMore || typeof options2?.createIfNone === "object" && options2.createIfNone.learnMore) {
          checkProposedApiEnabled(extension, "authLearnMore");
        }
        if (options2?.authorizationServer) {
          checkProposedApiEnabled(extension, "authIssuers");
        }
        return extHostAuthentication.getSession(extension, providerId, scopesOrChallenge, options2);
      },
      getAccounts(providerId) {
        return extHostAuthentication.getAccounts(providerId);
      },
      // TODO: remove this after GHPR and Codespaces move off of it
      async hasSession(providerId, scopes) {
        checkProposedApiEnabled(extension, "authSession");
        return !!await extHostAuthentication.getSession(extension, providerId, scopes, { silent: true });
      },
      get onDidChangeSessions() {
        return _asExtensionEvent(extHostAuthentication.getExtensionScopedSessionsEvent(extension.identifier.value));
      },
      registerAuthenticationProvider(id2, label, provider, options2) {
        if (options2?.supportedAuthorizationServers) {
          checkProposedApiEnabled(extension, "authIssuers");
        }
        return extHostAuthentication.registerAuthenticationProvider(id2, label, provider, options2);
      }
    };
    const commands = {
      registerCommand(id2, command, thisArgs) {
        return extHostCommands.registerCommand(true, id2, command, thisArgs, void 0, extension);
      },
      registerTextEditorCommand(id2, callback, thisArg) {
        return extHostCommands.registerCommand(true, id2, (...args) => {
          const activeTextEditor = extHostEditors.getActiveTextEditor();
          if (!activeTextEditor) {
            extHostLogService.warn("Cannot execute " + id2 + " because there is no active text editor.");
            return void 0;
          }
          return activeTextEditor.edit((edit2) => {
            callback.apply(thisArg, [activeTextEditor, edit2, ...args]);
          }).then((result) => {
            if (!result) {
              extHostLogService.warn("Edits from command " + id2 + " were not applied.");
            }
          }, (err) => {
            extHostLogService.warn("An error occurred while running command " + id2, err);
          });
        }, void 0, void 0, extension);
      },
      registerDiffInformationCommand: (id2, callback, thisArg) => {
        checkProposedApiEnabled(extension, "diffCommand");
        return extHostCommands.registerCommand(true, id2, async (...args) => {
          const activeTextEditor = extHostDocumentsAndEditors.activeEditor(true);
          if (!activeTextEditor) {
            extHostLogService.warn("Cannot execute " + id2 + " because there is no active text editor.");
            return void 0;
          }
          const diff2 = await extHostEditors.getDiffInformation(activeTextEditor.id);
          callback.apply(thisArg, [diff2, ...args]);
        }, void 0, void 0, extension);
      },
      executeCommand(id2, ...args) {
        return extHostCommands.executeCommand(id2, ...args);
      },
      getCommands(filterInternal = false) {
        return extHostCommands.getCommands(filterInternal);
      }
    };
    const env2 = {
      get machineId() {
        return initData.telemetryInfo.machineId;
      },
      get devDeviceId() {
        checkProposedApiEnabled(extension, "devDeviceId");
        return initData.telemetryInfo.devDeviceId ?? initData.telemetryInfo.machineId;
      },
      get isAppPortable() {
        return initData.environment.isPortable ?? false;
      },
      get sessionId() {
        return initData.telemetryInfo.sessionId;
      },
      get language() {
        return initData.environment.appLanguage;
      },
      get appName() {
        return initData.environment.appName;
      },
      get appRoot() {
        return initData.environment.appRoot?.fsPath ?? "";
      },
      get appHost() {
        return initData.environment.appHost;
      },
      get uriScheme() {
        return initData.environment.appUriScheme;
      },
      get clipboard() {
        return extHostClipboard.value;
      },
      get shell() {
        return extHostTerminalService.getDefaultShell(false);
      },
      get onDidChangeShell() {
        return _asExtensionEvent(extHostTerminalService.onDidChangeShell);
      },
      get isTelemetryEnabled() {
        return extHostTelemetry.getTelemetryConfiguration();
      },
      get onDidChangeTelemetryEnabled() {
        return _asExtensionEvent(extHostTelemetry.onDidChangeTelemetryEnabled);
      },
      get telemetryConfiguration() {
        checkProposedApiEnabled(extension, "telemetry");
        return extHostTelemetry.getTelemetryDetails();
      },
      get onDidChangeTelemetryConfiguration() {
        checkProposedApiEnabled(extension, "telemetry");
        return _asExtensionEvent(extHostTelemetry.onDidChangeTelemetryConfiguration);
      },
      get isMeteredConnection() {
        checkProposedApiEnabled(extension, "envIsConnectionMetered");
        return extHostMeteredConnection.isConnectionMetered;
      },
      get onDidChangeMeteredConnection() {
        checkProposedApiEnabled(extension, "envIsConnectionMetered");
        return _asExtensionEvent(extHostMeteredConnection.onDidChangeIsConnectionMetered);
      },
      get isNewAppInstall() {
        return isNewAppInstall(initData.telemetryInfo.firstSessionDate);
      },
      createTelemetryLogger(sender, options2) {
        ExtHostTelemetryLogger.validateSender(sender);
        return extHostTelemetry.instantiateLogger(extension, sender, options2);
      },
      async openExternal(uri2, options2) {
        return extHostWindow.openUri(uri2, {
          allowTunneling: initData.remote.isRemote ?? (initData.remote.authority ? await extHostTunnelService.hasTunnelProvider() : false),
          allowContributedOpeners: options2?.allowContributedOpeners
        });
      },
      async asExternalUri(uri2) {
        if (uri2.scheme === initData.environment.appUriScheme) {
          return extHostUrls.createAppUri(uri2);
        }
        try {
          return await extHostWindow.asExternalUri(uri2, { allowTunneling: !!initData.remote.authority });
        } catch (err) {
          if (matchesScheme(uri2, Schemas.http) || matchesScheme(uri2, Schemas.https)) {
            return uri2;
          }
          throw err;
        }
      },
      get remoteName() {
        return getRemoteName(initData.remote.authority);
      },
      get remoteAuthority() {
        checkProposedApiEnabled(extension, "resolvers");
        return initData.remote.authority;
      },
      get uiKind() {
        return initData.uiKind;
      },
      get logLevel() {
        return extHostLogService.getLevel();
      },
      get onDidChangeLogLevel() {
        return _asExtensionEvent(extHostLogService.onDidChangeLogLevel);
      },
      get appQuality() {
        checkProposedApiEnabled(extension, "resolvers");
        return initData.quality;
      },
      get appCommit() {
        checkProposedApiEnabled(extension, "resolvers");
        return initData.commit;
      },
      getDataChannel(channelId) {
        checkProposedApiEnabled(extension, "dataChannels");
        return extHostDataChannels.createDataChannel(extension, channelId);
      },
      get power() {
        checkProposedApiEnabled(extension, "environmentPower");
        return {
          get onDidSuspend() {
            return _asExtensionEvent(extHostPower.onDidSuspend);
          },
          get onDidResume() {
            return _asExtensionEvent(extHostPower.onDidResume);
          },
          get onDidChangeOnBatteryPower() {
            return _asExtensionEvent(extHostPower.onDidChangeOnBatteryPower);
          },
          get onDidChangeThermalState() {
            return _asExtensionEvent(extHostPower.onDidChangeThermalState);
          },
          get onDidChangeSpeedLimit() {
            return _asExtensionEvent(extHostPower.onDidChangeSpeedLimit);
          },
          get onWillShutdown() {
            return _asExtensionEvent(extHostPower.onWillShutdown);
          },
          get onDidLockScreen() {
            return _asExtensionEvent(extHostPower.onDidLockScreen);
          },
          get onDidUnlockScreen() {
            return _asExtensionEvent(extHostPower.onDidUnlockScreen);
          },
          getSystemIdleState(idleThresholdSeconds) {
            return extHostPower.getSystemIdleState(idleThresholdSeconds);
          },
          getSystemIdleTime() {
            return extHostPower.getSystemIdleTime();
          },
          getCurrentThermalState() {
            return extHostPower.getCurrentThermalState();
          },
          isOnBatteryPower() {
            return extHostPower.isOnBatteryPower();
          },
          async startPowerSaveBlocker(type) {
            const blocker = await extHostPower.startPowerSaveBlocker(type);
            return {
              id: blocker.id,
              get isStarted() {
                return blocker.isStarted;
              },
              dispose() {
                blocker.dispose();
              }
            };
          }
        };
      }
    };
    if (!initData.environment.extensionTestsLocationURI) {
      Object.freeze(env2);
    }
    const tests = {
      createTestController(provider, label, refreshHandler) {
        return extHostTesting.createTestController(extension, provider, label, refreshHandler);
      },
      createTestObserver() {
        checkProposedApiEnabled(extension, "testObserver");
        return extHostTesting.createTestObserver();
      },
      runTests(provider) {
        checkProposedApiEnabled(extension, "testObserver");
        return extHostTesting.runTests(provider);
      },
      registerTestFollowupProvider(provider) {
        checkProposedApiEnabled(extension, "testObserver");
        return extHostTesting.registerTestFollowupProvider(provider);
      },
      get onDidChangeTestResults() {
        checkProposedApiEnabled(extension, "testObserver");
        return _asExtensionEvent(extHostTesting.onResultsChanged);
      },
      get testResults() {
        checkProposedApiEnabled(extension, "testObserver");
        return extHostTesting.results;
      }
    };
    const extensionKind = initData.remote.isRemote ? 2 /* Workspace */ : 1 /* UI */;
    const extensions = {
      getExtension(extensionId, includeFromDifferentExtensionHosts) {
        if (!isProposedApiEnabled(extension, "extensionsAny")) {
          includeFromDifferentExtensionHosts = false;
        }
        const mine = extensionInfo.mine.getExtensionDescription(extensionId);
        if (mine) {
          return new Extension(extensionService, extension.identifier, mine, extensionKind, false);
        }
        if (includeFromDifferentExtensionHosts) {
          const foreign = extensionInfo.all.getExtensionDescription(extensionId);
          if (foreign) {
            return new Extension(extensionService, extension.identifier, foreign, extensionKind, true);
          }
        }
        return void 0;
      },
      get all() {
        const result = [];
        for (const desc of extensionInfo.mine.getAllExtensionDescriptions()) {
          result.push(new Extension(extensionService, extension.identifier, desc, extensionKind, false));
        }
        return result;
      },
      get allAcrossExtensionHosts() {
        checkProposedApiEnabled(extension, "extensionsAny");
        const local = new ExtensionIdentifierSet(extensionInfo.mine.getAllExtensionDescriptions().map((desc) => desc.identifier));
        const result = [];
        for (const desc of extensionInfo.all.getAllExtensionDescriptions()) {
          const isFromDifferentExtensionHost = !local.has(desc.identifier);
          result.push(new Extension(extensionService, extension.identifier, desc, extensionKind, isFromDifferentExtensionHost));
        }
        return result;
      },
      get onDidChange() {
        if (isProposedApiEnabled(extension, "extensionsAny")) {
          return _asExtensionEvent(Event.any(extensionInfo.mine.onDidChange, extensionInfo.all.onDidChange));
        }
        return _asExtensionEvent(extensionInfo.mine.onDidChange);
      }
    };
    const languages = {
      createDiagnosticCollection(name2) {
        return extHostDiagnostics.createDiagnosticCollection(extension.identifier, name2);
      },
      get onDidChangeDiagnostics() {
        return _asExtensionEvent(extHostDiagnostics.onDidChangeDiagnostics);
      },
      getDiagnostics: (resource) => {
        return extHostDiagnostics.getDiagnostics(resource);
      },
      getLanguages() {
        return extHostLanguages.getLanguages();
      },
      setTextDocumentLanguage(document2, languageId) {
        return extHostLanguages.changeLanguage(document2.uri, languageId);
      },
      match(selector, document2) {
        const interalSelector = LanguageSelector.from(selector);
        let notebook;
        if (targetsNotebooks(interalSelector)) {
          notebook = extHostNotebook.notebookDocuments.find((value) => value.apiNotebook.getCells().find((c) => c.document === document2))?.apiNotebook;
        }
        return score(interalSelector, document2.uri, document2.languageId, true, notebook?.uri, notebook?.notebookType);
      },
      registerCodeActionsProvider(selector, provider, metadata) {
        return extHostLanguageFeatures.registerCodeActionProvider(extension, checkSelector(selector), provider, metadata);
      },
      registerDocumentPasteEditProvider(selector, provider, metadata) {
        return extHostLanguageFeatures.registerDocumentPasteEditProvider(extension, checkSelector(selector), provider, metadata);
      },
      registerCodeLensProvider(selector, provider) {
        return extHostLanguageFeatures.registerCodeLensProvider(extension, checkSelector(selector), provider);
      },
      registerDefinitionProvider(selector, provider) {
        return extHostLanguageFeatures.registerDefinitionProvider(extension, checkSelector(selector), provider);
      },
      registerDeclarationProvider(selector, provider) {
        return extHostLanguageFeatures.registerDeclarationProvider(extension, checkSelector(selector), provider);
      },
      registerImplementationProvider(selector, provider) {
        return extHostLanguageFeatures.registerImplementationProvider(extension, checkSelector(selector), provider);
      },
      registerTypeDefinitionProvider(selector, provider) {
        return extHostLanguageFeatures.registerTypeDefinitionProvider(extension, checkSelector(selector), provider);
      },
      registerHoverProvider(selector, provider) {
        return extHostLanguageFeatures.registerHoverProvider(extension, checkSelector(selector), provider, extension.identifier);
      },
      registerEvaluatableExpressionProvider(selector, provider) {
        return extHostLanguageFeatures.registerEvaluatableExpressionProvider(extension, checkSelector(selector), provider, extension.identifier);
      },
      registerInlineValuesProvider(selector, provider) {
        return extHostLanguageFeatures.registerInlineValuesProvider(extension, checkSelector(selector), provider, extension.identifier);
      },
      registerDocumentHighlightProvider(selector, provider) {
        return extHostLanguageFeatures.registerDocumentHighlightProvider(extension, checkSelector(selector), provider);
      },
      registerMultiDocumentHighlightProvider(selector, provider) {
        return extHostLanguageFeatures.registerMultiDocumentHighlightProvider(extension, checkSelector(selector), provider);
      },
      registerLinkedEditingRangeProvider(selector, provider) {
        return extHostLanguageFeatures.registerLinkedEditingRangeProvider(extension, checkSelector(selector), provider);
      },
      registerReferenceProvider(selector, provider) {
        return extHostLanguageFeatures.registerReferenceProvider(extension, checkSelector(selector), provider);
      },
      registerRenameProvider(selector, provider) {
        return extHostLanguageFeatures.registerRenameProvider(extension, checkSelector(selector), provider);
      },
      registerNewSymbolNamesProvider(selector, provider) {
        checkProposedApiEnabled(extension, "newSymbolNamesProvider");
        return extHostLanguageFeatures.registerNewSymbolNamesProvider(extension, checkSelector(selector), provider);
      },
      registerDocumentSymbolProvider(selector, provider, metadata) {
        return extHostLanguageFeatures.registerDocumentSymbolProvider(extension, checkSelector(selector), provider, metadata);
      },
      registerWorkspaceSymbolProvider(provider) {
        return extHostLanguageFeatures.registerWorkspaceSymbolProvider(extension, provider);
      },
      registerDocumentFormattingEditProvider(selector, provider) {
        return extHostLanguageFeatures.registerDocumentFormattingEditProvider(extension, checkSelector(selector), provider);
      },
      registerDocumentRangeFormattingEditProvider(selector, provider) {
        return extHostLanguageFeatures.registerDocumentRangeFormattingEditProvider(extension, checkSelector(selector), provider);
      },
      registerOnTypeFormattingEditProvider(selector, provider, firstTriggerCharacter, ...moreTriggerCharacters) {
        return extHostLanguageFeatures.registerOnTypeFormattingEditProvider(extension, checkSelector(selector), provider, [firstTriggerCharacter].concat(moreTriggerCharacters));
      },
      registerDocumentSemanticTokensProvider(selector, provider, legend) {
        return extHostLanguageFeatures.registerDocumentSemanticTokensProvider(extension, checkSelector(selector), provider, legend);
      },
      registerDocumentRangeSemanticTokensProvider(selector, provider, legend) {
        return extHostLanguageFeatures.registerDocumentRangeSemanticTokensProvider(extension, checkSelector(selector), provider, legend);
      },
      registerSignatureHelpProvider(selector, provider, firstItem, ...remaining) {
        if (typeof firstItem === "object") {
          return extHostLanguageFeatures.registerSignatureHelpProvider(extension, checkSelector(selector), provider, firstItem);
        }
        return extHostLanguageFeatures.registerSignatureHelpProvider(extension, checkSelector(selector), provider, typeof firstItem === "undefined" ? [] : [firstItem, ...remaining]);
      },
      registerCompletionItemProvider(selector, provider, ...triggerCharacters) {
        return extHostLanguageFeatures.registerCompletionItemProvider(extension, checkSelector(selector), provider, triggerCharacters);
      },
      registerInlineCompletionItemProvider(selector, provider, metadata) {
        if (provider.handleDidShowCompletionItem) {
          checkProposedApiEnabled(extension, "inlineCompletionsAdditions");
        }
        if (provider.handleDidPartiallyAcceptCompletionItem) {
          checkProposedApiEnabled(extension, "inlineCompletionsAdditions");
        }
        if (metadata) {
          checkProposedApiEnabled(extension, "inlineCompletionsAdditions");
        }
        return extHostLanguageFeatures.registerInlineCompletionsProvider(extension, checkSelector(selector), provider, metadata);
      },
      get inlineCompletionsUnificationState() {
        checkProposedApiEnabled(extension, "inlineCompletionsAdditions");
        return extHostLanguageFeatures.inlineCompletionsUnificationState;
      },
      onDidChangeCompletionsUnificationState(listener, thisArg, disposables) {
        checkProposedApiEnabled(extension, "inlineCompletionsAdditions");
        return _asExtensionEvent(extHostLanguageFeatures.onDidChangeInlineCompletionsUnificationState)(listener, thisArg, disposables);
      },
      registerDocumentLinkProvider(selector, provider) {
        return extHostLanguageFeatures.registerDocumentLinkProvider(extension, checkSelector(selector), provider);
      },
      registerColorProvider(selector, provider) {
        return extHostLanguageFeatures.registerColorProvider(extension, checkSelector(selector), provider);
      },
      registerFoldingRangeProvider(selector, provider) {
        return extHostLanguageFeatures.registerFoldingRangeProvider(extension, checkSelector(selector), provider);
      },
      registerSelectionRangeProvider(selector, provider) {
        return extHostLanguageFeatures.registerSelectionRangeProvider(extension, selector, provider);
      },
      registerCallHierarchyProvider(selector, provider) {
        return extHostLanguageFeatures.registerCallHierarchyProvider(extension, selector, provider);
      },
      registerTypeHierarchyProvider(selector, provider) {
        return extHostLanguageFeatures.registerTypeHierarchyProvider(extension, selector, provider);
      },
      setLanguageConfiguration: (language2, configuration) => {
        return extHostLanguageFeatures.setLanguageConfiguration(extension, language2, configuration);
      },
      getTokenInformationAtPosition(doc, pos) {
        checkProposedApiEnabled(extension, "tokenInformation");
        return extHostLanguages.tokenAtPosition(doc, pos);
      },
      computeFullSyntaxHighlighting(source, languageId) {
        checkProposedApiEnabled(extension, "documentSyntaxHighlighting");
        return extHostLanguages.computeFullSyntaxHighlighting(source, languageId);
      },
      get onDidChangeSyntaxHighlighting() {
        checkProposedApiEnabled(extension, "documentSyntaxHighlighting");
        return extHostLanguages.onDidChangeSyntaxHighlighting;
      },
      registerInlayHintsProvider(selector, provider) {
        return extHostLanguageFeatures.registerInlayHintsProvider(extension, selector, provider);
      },
      createLanguageStatusItem(id2, selector) {
        return extHostLanguages.createLanguageStatusItem(extension, id2, selector);
      },
      registerDocumentDropEditProvider(selector, provider, metadata) {
        return extHostLanguageFeatures.registerDocumentOnDropEditProvider(extension, selector, provider, metadata);
      }
    };
    const window2 = {
      get activeTextEditor() {
        return extHostEditors.getActiveTextEditor();
      },
      get visibleTextEditors() {
        return extHostEditors.getVisibleTextEditors();
      },
      get activeTerminal() {
        return extHostTerminalService.activeTerminal;
      },
      get terminals() {
        return extHostTerminalService.terminals;
      },
      async showTextDocument(documentOrUri, columnOrOptions, preserveFocus) {
        if (URI.isUri(documentOrUri) && documentOrUri.scheme === Schemas.vscodeRemote && !documentOrUri.authority) {
          extHostApiDeprecation.report("workspace.showTextDocument", extension, `A URI of 'vscode-remote' scheme requires an authority.`);
        }
        const document2 = await (URI.isUri(documentOrUri) ? Promise.resolve(workspace.openTextDocument(documentOrUri)) : Promise.resolve(documentOrUri));
        return extHostEditors.showTextDocument(document2, columnOrOptions, preserveFocus);
      },
      createTextEditorDecorationType(options2) {
        return extHostEditors.createTextEditorDecorationType(extension, options2);
      },
      onDidChangeActiveTextEditor(listener, thisArg, disposables) {
        return _asExtensionEvent(extHostEditors.onDidChangeActiveTextEditor)(listener, thisArg, disposables);
      },
      onDidChangeVisibleTextEditors(listener, thisArg, disposables) {
        return _asExtensionEvent(extHostEditors.onDidChangeVisibleTextEditors)(listener, thisArg, disposables);
      },
      onDidChangeTextEditorSelection(listener, thisArgs, disposables) {
        return _asExtensionEvent(extHostEditors.onDidChangeTextEditorSelection)(listener, thisArgs, disposables);
      },
      onDidChangeTextEditorOptions(listener, thisArgs, disposables) {
        return _asExtensionEvent(extHostEditors.onDidChangeTextEditorOptions)(listener, thisArgs, disposables);
      },
      onDidChangeTextEditorVisibleRanges(listener, thisArgs, disposables) {
        return _asExtensionEvent(extHostEditors.onDidChangeTextEditorVisibleRanges)(listener, thisArgs, disposables);
      },
      onDidChangeTextEditorViewColumn(listener, thisArg, disposables) {
        return _asExtensionEvent(extHostEditors.onDidChangeTextEditorViewColumn)(listener, thisArg, disposables);
      },
      onDidChangeTextEditorDiffInformation(listener, thisArg, disposables) {
        checkProposedApiEnabled(extension, "textEditorDiffInformation");
        return _asExtensionEvent(extHostEditors.onDidChangeTextEditorDiffInformation)(listener, thisArg, disposables);
      },
      onDidCloseTerminal(listener, thisArg, disposables) {
        return _asExtensionEvent(extHostTerminalService.onDidCloseTerminal)(listener, thisArg, disposables);
      },
      onDidOpenTerminal(listener, thisArg, disposables) {
        return _asExtensionEvent(extHostTerminalService.onDidOpenTerminal)(listener, thisArg, disposables);
      },
      onDidChangeActiveTerminal(listener, thisArg, disposables) {
        return _asExtensionEvent(extHostTerminalService.onDidChangeActiveTerminal)(listener, thisArg, disposables);
      },
      onDidChangeTerminalDimensions(listener, thisArg, disposables) {
        checkProposedApiEnabled(extension, "terminalDimensions");
        return _asExtensionEvent(extHostTerminalService.onDidChangeTerminalDimensions)(listener, thisArg, disposables);
      },
      onDidChangeTerminalState(listener, thisArg, disposables) {
        return _asExtensionEvent(extHostTerminalService.onDidChangeTerminalState)(listener, thisArg, disposables);
      },
      onDidWriteTerminalData(listener, thisArg, disposables) {
        checkProposedApiEnabled(extension, "terminalDataWriteEvent");
        return _asExtensionEvent(extHostTerminalService.onDidWriteTerminalData)(listener, thisArg, disposables);
      },
      onDidExecuteTerminalCommand(listener, thisArg, disposables) {
        checkProposedApiEnabled(extension, "terminalExecuteCommandEvent");
        return _asExtensionEvent(extHostTerminalService.onDidExecuteTerminalCommand)(listener, thisArg, disposables);
      },
      onDidChangeTerminalShellIntegration(listener, thisArg, disposables) {
        return _asExtensionEvent(extHostTerminalShellIntegration.onDidChangeTerminalShellIntegration)(listener, thisArg, disposables);
      },
      onDidStartTerminalShellExecution(listener, thisArg, disposables) {
        return _asExtensionEvent(extHostTerminalShellIntegration.onDidStartTerminalShellExecution)(listener, thisArg, disposables);
      },
      onDidEndTerminalShellExecution(listener, thisArg, disposables) {
        return _asExtensionEvent(extHostTerminalShellIntegration.onDidEndTerminalShellExecution)(listener, thisArg, disposables);
      },
      get state() {
        return extHostWindow.getState();
      },
      onDidChangeWindowState(listener, thisArg, disposables) {
        return _asExtensionEvent(extHostWindow.onDidChangeWindowState)(listener, thisArg, disposables);
      },
      showInformationMessage(message, ...rest) {
        return extHostMessageService.showMessage(extension, severity_default.Info, message, rest[0], rest.slice(1));
      },
      showWarningMessage(message, ...rest) {
        return extHostMessageService.showMessage(extension, severity_default.Warning, message, rest[0], rest.slice(1));
      },
      showErrorMessage(message, ...rest) {
        return extHostMessageService.showMessage(extension, severity_default.Error, message, rest[0], rest.slice(1));
      },
      showQuickPick(items, options2, token) {
        return extHostQuickOpen.showQuickPick(extension, items, options2, token);
      },
      showWorkspaceFolderPick(options2) {
        return extHostQuickOpen.showWorkspaceFolderPick(options2);
      },
      showInputBox(options2, token) {
        return extHostQuickOpen.showInput(options2, token);
      },
      showOpenDialog(options2) {
        return extHostDialogs.showOpenDialog(options2);
      },
      showSaveDialog(options2) {
        return extHostDialogs.showSaveDialog(options2);
      },
      createStatusBarItem(alignmentOrId, priorityOrAlignment, priorityArg) {
        let id2;
        let alignment;
        let priority;
        if (typeof alignmentOrId === "string") {
          id2 = alignmentOrId;
          alignment = priorityOrAlignment;
          priority = priorityArg;
        } else {
          alignment = alignmentOrId;
          priority = priorityOrAlignment;
        }
        return extHostStatusBar.createStatusBarEntry(extension, id2, alignment, priority);
      },
      setStatusBarMessage(text, timeoutOrThenable) {
        return extHostStatusBar.setStatusBarMessage(text, timeoutOrThenable);
      },
      withScmProgress(task) {
        extHostApiDeprecation.report(
          "window.withScmProgress",
          extension,
          `Use 'withProgress' instead.`
        );
        return extHostProgress.withProgress(extension, { location: 1 /* SourceControl */ }, (progress, token) => task({ report(n) {
        } }));
      },
      withProgress(options2, task) {
        return extHostProgress.withProgress(extension, options2, task);
      },
      createOutputChannel(name2, options2) {
        return extHostOutputService.createOutputChannel(name2, options2, extension);
      },
      createWebviewPanel(viewType, title, showOptions, options2) {
        return extHostWebviewPanels.createWebviewPanel(extension, viewType, title, showOptions, options2);
      },
      createWebviewTextEditorInset(editor, line, height, options2) {
        checkProposedApiEnabled(extension, "editorInsets");
        return extHostEditorInsets.createWebviewEditorInset(editor, line, height, options2, extension);
      },
      createTerminal(nameOrOptions, shellPath, shellArgs) {
        if (typeof nameOrOptions === "object") {
          let options2 = nameOrOptions;
          if (!isProposedApiEnabled(extension, "terminalTitle") && "titleTemplate" in nameOrOptions && nameOrOptions.titleTemplate !== void 0) {
            console.error(`[${extension.identifier.value}] \`titleTemplate\` was provided to window.createTerminal but is ignored because the \`terminalTitle\` proposed API is not enabled.`);
            options2 = { ...nameOrOptions, titleTemplate: void 0 };
          }
          if ("pty" in options2) {
            return extHostTerminalService.createExtensionTerminal(options2);
          }
          return extHostTerminalService.createTerminalFromOptions(options2, getTerminalInternalOptions(extension, options2));
        }
        return extHostTerminalService.createTerminal(nameOrOptions, shellPath, shellArgs);
      },
      registerTerminalLinkProvider(provider) {
        return extHostTerminalService.registerLinkProvider(provider);
      },
      registerTerminalProfileProvider(id2, provider) {
        return extHostTerminalService.registerProfileProvider(extension, id2, provider);
      },
      registerTerminalCompletionProvider(provider, ...triggerCharacters) {
        checkProposedApiEnabled(extension, "terminalCompletionProvider");
        return extHostTerminalService.registerTerminalCompletionProvider(extension, provider, ...triggerCharacters);
      },
      registerTerminalQuickFixProvider(id2, provider) {
        checkProposedApiEnabled(extension, "terminalQuickFixProvider");
        return extHostTerminalService.registerTerminalQuickFixProvider(id2, extension.identifier.value, provider);
      },
      registerTreeDataProvider(viewId, treeDataProvider) {
        return extHostTreeViews.registerTreeDataProvider(viewId, treeDataProvider, extension);
      },
      createTreeView(viewId, options2) {
        return extHostTreeViews.createTreeView(viewId, options2, extension);
      },
      registerWebviewPanelSerializer: (viewType, serializer) => {
        return extHostWebviewPanels.registerWebviewPanelSerializer(extension, viewType, serializer);
      },
      registerCustomEditorProvider: (viewType, provider, options2 = {}) => {
        return extHostCustomEditors.registerCustomEditorProvider(extension, viewType, provider, options2);
      },
      registerFileDecorationProvider(provider) {
        return extHostDecorations.registerFileDecorationProvider(provider, extension);
      },
      registerUriHandler(handler) {
        return extHostUrls.registerUriHandler(extension, handler);
      },
      createQuickPick() {
        return extHostQuickOpen.createQuickPick(extension);
      },
      createInputBox() {
        return extHostQuickOpen.createInputBox(extension);
      },
      get activeColorTheme() {
        return extHostTheming.activeColorTheme;
      },
      onDidChangeActiveColorTheme(listener, thisArg, disposables) {
        return _asExtensionEvent(extHostTheming.onDidChangeActiveColorTheme)(listener, thisArg, disposables);
      },
      registerWebviewViewProvider(viewId, provider, options2) {
        return extHostWebviewViews.registerWebviewViewProvider(extension, viewId, provider, options2?.webviewOptions);
      },
      get activeNotebookEditor() {
        return extHostNotebook.activeNotebookEditor;
      },
      onDidChangeActiveNotebookEditor(listener, thisArgs, disposables) {
        return _asExtensionEvent(extHostNotebook.onDidChangeActiveNotebookEditor)(listener, thisArgs, disposables);
      },
      get visibleNotebookEditors() {
        return extHostNotebook.visibleNotebookEditors;
      },
      get onDidChangeVisibleNotebookEditors() {
        return _asExtensionEvent(extHostNotebook.onDidChangeVisibleNotebookEditors);
      },
      onDidChangeNotebookEditorSelection(listener, thisArgs, disposables) {
        return _asExtensionEvent(extHostNotebookEditors.onDidChangeNotebookEditorSelection)(listener, thisArgs, disposables);
      },
      onDidChangeNotebookEditorVisibleRanges(listener, thisArgs, disposables) {
        return _asExtensionEvent(extHostNotebookEditors.onDidChangeNotebookEditorVisibleRanges)(listener, thisArgs, disposables);
      },
      showNotebookDocument(document2, options2) {
        return extHostNotebook.showNotebookDocument(document2, options2);
      },
      registerExternalUriOpener(id2, opener, metadata) {
        checkProposedApiEnabled(extension, "externalUriOpener");
        return extHostUriOpeners.registerExternalUriOpener(extension.identifier, id2, opener, metadata);
      },
      registerProfileContentHandler(id2, handler) {
        checkProposedApiEnabled(extension, "profileContentHandlers");
        return extHostProfileContentHandlers.registerProfileContentHandler(extension, id2, handler);
      },
      registerQuickDiffProvider(selector, quickDiffProvider, id2, label, rootUri) {
        checkProposedApiEnabled(extension, "quickDiffProvider");
        return extHostQuickDiff.registerQuickDiffProvider(extension, checkSelector(selector), quickDiffProvider, id2, label, rootUri);
      },
      createSourceControlDiffInformation(uri2) {
        checkProposedApiEnabled(extension, "textEditorDiffInformation");
        return extHostQuickDiff.createSourceControlDiffInformation(uri2);
      },
      get linkPresentationRules() {
        checkProposedApiEnabled(extension, "linkPresentation");
        return extHostDataChannels.linkPresentationRules;
      },
      get onDidChangeLinkPresentationRules() {
        checkProposedApiEnabled(extension, "linkPresentation");
        return extHostDataChannels.onDidChangeLinkPresentationRules;
      },
      createLinkPresentationWatcher(id2, resource) {
        checkProposedApiEnabled(extension, "linkPresentation");
        return extHostDataChannels.createLinkPresentationWatcher(extension, id2, resource);
      },
      registerLinkPresentationProvider(id2, provider) {
        checkProposedApiEnabled(extension, "linkPresentation");
        return extHostDataChannels.registerLinkPresentationProvider(extension, id2, provider);
      },
      createAgentEditorComments(uri2) {
        checkProposedApiEnabled(extension, "agentEditorComments");
        return extHostAgentEditorComments.createAgentEditorComments(uri2);
      },
      get tabGroups() {
        return extHostEditorTabs.tabGroups;
      },
      registerShareProvider(selector, provider) {
        checkProposedApiEnabled(extension, "shareProvider");
        return extHostShare.registerShareProvider(checkSelector(selector), provider);
      },
      get nativeHandle() {
        checkProposedApiEnabled(extension, "nativeWindowHandle");
        return extHostWindow.nativeHandle;
      },
      createChatStatusItem: (id2) => {
        checkProposedApiEnabled(extension, "chatStatusItem");
        return extHostChatStatus.createChatStatusItem(extension, id2);
      },
      get activeChatPanelSessionResource() {
        checkProposedApiEnabled(extension, "chatParticipantPrivate");
        return extHostChatAgents2.activeChatPanelSessionResource;
      },
      onDidChangeActiveChatPanelSessionResource: (listeners, thisArgs, disposables) => {
        checkProposedApiEnabled(extension, "chatParticipantPrivate");
        return _asExtensionEvent(extHostChatAgents2.onDidChangeActiveChatPanelSessionResource)(listeners, thisArgs, disposables);
      },
      get browserTabs() {
        checkProposedApiEnabled(extension, "browser");
        return extHostBrowsers.browserTabs;
      },
      onDidOpenBrowserTab(listener, thisArg, disposables) {
        checkProposedApiEnabled(extension, "browser");
        return _asExtensionEvent(extHostBrowsers.onDidOpenBrowserTab)(listener, thisArg, disposables);
      },
      onDidCloseBrowserTab(listener, thisArg, disposables) {
        checkProposedApiEnabled(extension, "browser");
        return _asExtensionEvent(extHostBrowsers.onDidCloseBrowserTab)(listener, thisArg, disposables);
      },
      get activeBrowserTab() {
        checkProposedApiEnabled(extension, "browser");
        return extHostBrowsers.activeBrowserTab;
      },
      onDidChangeActiveBrowserTab(listener, thisArg, disposables) {
        checkProposedApiEnabled(extension, "browser");
        return _asExtensionEvent(extHostBrowsers.onDidChangeActiveBrowserTab)(listener, thisArg, disposables);
      },
      onDidChangeBrowserTabState(listener, thisArg, disposables) {
        checkProposedApiEnabled(extension, "browser");
        return _asExtensionEvent(extHostBrowsers.onDidChangeBrowserTabState)(listener, thisArg, disposables);
      },
      openBrowserTab(url, options2) {
        checkProposedApiEnabled(extension, "browser");
        return extHostBrowsers.openBrowserTab(url, options2);
      }
    };
    const workspace = {
      get rootPath() {
        extHostApiDeprecation.report(
          "workspace.rootPath",
          extension,
          `Please use 'workspace.workspaceFolders' instead. More details: https://aka.ms/vscode-eliminating-rootpath`
        );
        return extHostWorkspace.getPath();
      },
      set rootPath(value) {
        throw new ReadonlyError("rootPath");
      },
      getWorkspaceFolder(resource) {
        return extHostWorkspace.getWorkspaceFolder(resource);
      },
      get workspaceFolders() {
        return extHostWorkspace.getWorkspaceFolders();
      },
      get name() {
        return extHostWorkspace.name;
      },
      set name(value) {
        throw new ReadonlyError("name");
      },
      get workspaceFile() {
        return extHostWorkspace.workspaceFile;
      },
      set workspaceFile(value) {
        throw new ReadonlyError("workspaceFile");
      },
      get isAgentSessionsWorkspace() {
        checkProposedApiEnabled(extension, "agentSessionsWorkspace");
        return !!initData.environment.isSessionsWindow;
      },
      updateWorkspaceFolders: (index, deleteCount, ...workspaceFoldersToAdd) => {
        return extHostWorkspace.updateWorkspaceFolders(extension, index, deleteCount || 0, ...workspaceFoldersToAdd);
      },
      onDidChangeWorkspaceFolders: function(listener, thisArgs, disposables) {
        return _asExtensionEvent(extHostWorkspace.onDidChangeWorkspace)(listener, thisArgs, disposables);
      },
      asRelativePath: (pathOrUri, includeWorkspace) => {
        return extHostWorkspace.getRelativePath(pathOrUri, includeWorkspace);
      },
      findFiles: (include, exclude, maxResults, token) => {
        return extHostWorkspace.findFiles(include, exclude, maxResults, extension.identifier, token);
      },
      findFiles2: (filePattern, options2, token) => {
        checkProposedApiEnabled(extension, "findFiles2");
        return extHostWorkspace.findFiles2(filePattern, options2, extension.identifier, token);
      },
      findTextInFiles: (query, optionsOrCallback, callbackOrToken, token) => {
        checkProposedApiEnabled(extension, "findTextInFiles");
        let options2;
        let callback;
        if (typeof optionsOrCallback === "object") {
          options2 = optionsOrCallback;
          callback = callbackOrToken;
        } else {
          options2 = {};
          callback = optionsOrCallback;
          token = callbackOrToken;
        }
        return extHostWorkspace.findTextInFiles(query, options2 || {}, callback, extension.identifier, token);
      },
      findTextInFiles2: (query, options2, token) => {
        checkProposedApiEnabled(extension, "findTextInFiles2");
        checkProposedApiEnabled(extension, "textSearchProvider2");
        return extHostWorkspace.findTextInFiles2(query, options2, extension.identifier, token);
      },
      getTextDiff(originalDocument, modifiedDocument, options2, token) {
        checkProposedApiEnabled(extension, "documentDiff");
        const proxy = rpcProtocol.getProxy(MainContext.MainThreadDocumentDiff);
        if (token?.isCancellationRequested) {
          const error = new CancellationError();
          return {
            changes: AsyncIterableObject.EMPTY,
            complete: Promise.reject(error)
          };
        }
        const resultPromise = proxy.$computeDocumentDiff(
          originalDocument.uri,
          modifiedDocument.uri,
          options2?.ignoreTrimWhitespace ?? false,
          options2?.maxComputationTimeMs ?? 5e3,
          options2?.computeMoves ?? false
        );
        const diffPromise = token ? raceCancellationError(resultPromise, token) : resultPromise;
        const mappedPromise = diffPromise.then((result) => {
          if (!result) {
            throw new Error("Could not compute diff. Make sure both documents are available.");
          }
          return result;
        });
        const mapChange = (c) => ({
          originalRange: Range3.to(c.originalRange),
          modifiedRange: Range3.to(c.modifiedRange),
          innerChanges: c.innerChanges?.map((ic) => ({
            originalRange: Range3.to(ic.originalRange),
            modifiedRange: Range3.to(ic.modifiedRange)
          }))
        });
        return {
          changes: new AsyncIterableObject(async (emitter) => {
            const result = await mappedPromise;
            emitter.emitMany(result.changes.map(mapChange));
          }),
          complete: mappedPromise.then((result) => ({
            identical: result.identical,
            mayBeIncomplete: result.quitEarly,
            moves: result.moves.map((m) => ({
              originalRange: Range3.to(m.originalRange),
              modifiedRange: Range3.to(m.modifiedRange),
              changes: m.changes.map(mapChange)
            }))
          }))
        };
      },
      save: (uri2) => {
        return extHostWorkspace.save(uri2);
      },
      saveAs: (uri2) => {
        return extHostWorkspace.saveAs(uri2);
      },
      saveAll: (includeUntitled) => {
        return extHostWorkspace.saveAll(includeUntitled);
      },
      applyEdit(edit2, metadata) {
        return extHostBulkEdits.applyWorkspaceEdit(edit2, extension, metadata);
      },
      createFileSystemWatcher: (pattern, optionsOrIgnoreCreate, ignoreChange, ignoreDelete) => {
        const options2 = {
          ignoreCreateEvents: Boolean(optionsOrIgnoreCreate),
          ignoreChangeEvents: Boolean(ignoreChange),
          ignoreDeleteEvents: Boolean(ignoreDelete)
        };
        return extHostFileSystemEvent.createFileSystemWatcher(extHostWorkspace, configProvider, extHostFileSystemInfo, extension, pattern, options2);
      },
      get textDocuments() {
        return extHostDocuments.getAllDocumentData().map((data2) => data2.document);
      },
      set textDocuments(value) {
        throw new ReadonlyError("textDocuments");
      },
      openTextDocument(uriOrFileNameOrOptions, options2) {
        let uriPromise;
        options2 = options2 ?? uriOrFileNameOrOptions;
        if (typeof uriOrFileNameOrOptions === "string") {
          uriPromise = Promise.resolve(URI.file(uriOrFileNameOrOptions));
        } else if (URI.isUri(uriOrFileNameOrOptions)) {
          uriPromise = Promise.resolve(uriOrFileNameOrOptions);
        } else if (!options2 || typeof options2 === "object") {
          uriPromise = extHostDocuments.createDocumentData(options2);
        } else {
          throw new Error("illegal argument - uriOrFileNameOrOptions");
        }
        return uriPromise.then((uri2) => {
          extHostLogService.trace(`openTextDocument from ${extension.identifier}`);
          if (uri2.scheme === Schemas.vscodeRemote && !uri2.authority) {
            extHostApiDeprecation.report("workspace.openTextDocument", extension, `A URI of 'vscode-remote' scheme requires an authority.`);
          }
          return extHostDocuments.ensureDocumentData(uri2, options2).then((documentData) => {
            return documentData.document;
          });
        });
      },
      onDidOpenTextDocument: (listener, thisArgs, disposables) => {
        return _asExtensionEvent(extHostDocuments.onDidAddDocument)(listener, thisArgs, disposables);
      },
      onDidCloseTextDocument: (listener, thisArgs, disposables) => {
        return _asExtensionEvent(extHostDocuments.onDidRemoveDocument)(listener, thisArgs, disposables);
      },
      onDidChangeTextDocument: (listener, thisArgs, disposables) => {
        if (isProposedApiEnabled(extension, "textDocumentChangeReason")) {
          return _asExtensionEvent(extHostDocuments.onDidChangeDocumentWithReason)(listener, thisArgs, disposables);
        }
        return _asExtensionEvent(extHostDocuments.onDidChangeDocument)(listener, thisArgs, disposables);
      },
      onDidSaveTextDocument: (listener, thisArgs, disposables) => {
        return _asExtensionEvent(extHostDocuments.onDidSaveDocument)(listener, thisArgs, disposables);
      },
      onWillSaveTextDocument: (listener, thisArgs, disposables) => {
        return _asExtensionEvent(extHostDocumentSaveParticipant.getOnWillSaveTextDocumentEvent(extension))(listener, thisArgs, disposables);
      },
      get notebookDocuments() {
        return extHostNotebook.notebookDocuments.map((d) => d.apiNotebook);
      },
      async openNotebookDocument(uriOrType, content) {
        let uri2;
        if (URI.isUri(uriOrType)) {
          uri2 = uriOrType;
          await extHostNotebook.openNotebookDocument(uriOrType);
        } else if (typeof uriOrType === "string") {
          uri2 = URI.revive(await extHostNotebook.createNotebookDocument({ viewType: uriOrType, content }));
        } else {
          throw new Error("Invalid arguments");
        }
        return extHostNotebook.getNotebookDocument(uri2).apiNotebook;
      },
      onDidSaveNotebookDocument(listener, thisArg, disposables) {
        return _asExtensionEvent(extHostNotebookDocuments.onDidSaveNotebookDocument)(listener, thisArg, disposables);
      },
      onDidChangeNotebookDocument(listener, thisArg, disposables) {
        return _asExtensionEvent(extHostNotebookDocuments.onDidChangeNotebookDocument)(listener, thisArg, disposables);
      },
      onWillSaveNotebookDocument(listener, thisArg, disposables) {
        return _asExtensionEvent(extHostNotebookDocumentSaveParticipant.getOnWillSaveNotebookDocumentEvent(extension))(listener, thisArg, disposables);
      },
      get onDidOpenNotebookDocument() {
        return _asExtensionEvent(extHostNotebook.onDidOpenNotebookDocument);
      },
      get onDidCloseNotebookDocument() {
        return _asExtensionEvent(extHostNotebook.onDidCloseNotebookDocument);
      },
      registerNotebookSerializer(viewType, serializer, options2, registration) {
        return extHostNotebook.registerNotebookSerializer(extension, viewType, serializer, options2, isProposedApiEnabled(extension, "notebookLiveShare") ? registration : void 0);
      },
      onDidChangeConfiguration: (listener, thisArgs, disposables) => {
        return _asExtensionEvent(configProvider.onDidChangeConfiguration)(listener, thisArgs, disposables);
      },
      getConfiguration(section, scope) {
        scope = arguments.length === 1 ? void 0 : scope;
        return configProvider.getConfiguration(section, scope, extension);
      },
      registerTextDocumentContentProvider(scheme, provider) {
        return extHostDocumentContentProviders.registerTextDocumentContentProvider(scheme, provider);
      },
      registerTaskProvider: (type, provider) => {
        extHostApiDeprecation.report(
          "window.registerTaskProvider",
          extension,
          `Use the corresponding function on the 'tasks' namespace instead`
        );
        return extHostTask.registerTaskProvider(extension, type, provider);
      },
      registerFileSystemProvider(scheme, provider, options2) {
        return combinedDisposable(
          extHostFileSystem.registerFileSystemProvider(extension, scheme, provider, options2),
          extHostConsumerFileSystem.addFileSystemProvider(scheme, provider, options2)
        );
      },
      get fs() {
        return extHostConsumerFileSystem.value;
      },
      registerFileSearchProvider: (scheme, provider) => {
        checkProposedApiEnabled(extension, "fileSearchProvider");
        return extHostSearch.registerFileSearchProviderOld(scheme, provider);
      },
      registerTextSearchProvider: (scheme, provider) => {
        checkProposedApiEnabled(extension, "textSearchProvider");
        return extHostSearch.registerTextSearchProviderOld(scheme, provider);
      },
      registerAITextSearchProvider: (scheme, provider) => {
        checkProposedApiEnabled(extension, "aiTextSearchProvider");
        checkProposedApiEnabled(extension, "textSearchProvider2");
        return extHostSearch.registerAITextSearchProvider(scheme, provider);
      },
      registerFileSearchProvider2: (scheme, provider) => {
        checkProposedApiEnabled(extension, "fileSearchProvider2");
        return extHostSearch.registerFileSearchProvider(scheme, provider);
      },
      registerTextSearchProvider2: (scheme, provider) => {
        checkProposedApiEnabled(extension, "textSearchProvider2");
        return extHostSearch.registerTextSearchProvider(scheme, provider);
      },
      registerRemoteAuthorityResolver: (authorityPrefix, resolver) => {
        checkProposedApiEnabled(extension, "resolvers");
        return extensionService.registerRemoteAuthorityResolver(authorityPrefix, resolver);
      },
      registerResourceLabelFormatter: (formatter) => {
        checkProposedApiEnabled(extension, "resolvers");
        return extHostLabelService.$registerResourceLabelFormatter(formatter);
      },
      getRemoteExecServer: (authority) => {
        checkProposedApiEnabled(extension, "resolvers");
        return extensionService.getRemoteExecServer(authority);
      },
      onDidCreateFiles: (listener, thisArg, disposables) => {
        return _asExtensionEvent(extHostFileSystemEvent.onDidCreateFile)(listener, thisArg, disposables);
      },
      onDidDeleteFiles: (listener, thisArg, disposables) => {
        return _asExtensionEvent(extHostFileSystemEvent.onDidDeleteFile)(listener, thisArg, disposables);
      },
      onDidRenameFiles: (listener, thisArg, disposables) => {
        return _asExtensionEvent(extHostFileSystemEvent.onDidRenameFile)(listener, thisArg, disposables);
      },
      onWillCreateFiles: (listener, thisArg, disposables) => {
        return _asExtensionEvent(extHostFileSystemEvent.getOnWillCreateFileEvent(extension))(listener, thisArg, disposables);
      },
      onWillDeleteFiles: (listener, thisArg, disposables) => {
        return _asExtensionEvent(extHostFileSystemEvent.getOnWillDeleteFileEvent(extension))(listener, thisArg, disposables);
      },
      onWillRenameFiles: (listener, thisArg, disposables) => {
        return _asExtensionEvent(extHostFileSystemEvent.getOnWillRenameFileEvent(extension))(listener, thisArg, disposables);
      },
      openTunnel: (forward) => {
        checkProposedApiEnabled(extension, "tunnels");
        return extHostTunnelService.openTunnel(extension, forward).then((value) => {
          if (!value) {
            throw new Error("cannot open tunnel");
          }
          return value;
        });
      },
      get tunnels() {
        checkProposedApiEnabled(extension, "tunnels");
        return extHostTunnelService.getTunnels();
      },
      onDidChangeTunnels: (listener, thisArg, disposables) => {
        checkProposedApiEnabled(extension, "tunnels");
        return _asExtensionEvent(extHostTunnelService.onDidChangeTunnels)(listener, thisArg, disposables);
      },
      registerPortAttributesProvider: (portSelector, provider) => {
        checkProposedApiEnabled(extension, "portsAttributes");
        return extHostTunnelService.registerPortsAttributesProvider(portSelector, provider);
      },
      registerTunnelProvider: (tunnelProvider, information) => {
        checkProposedApiEnabled(extension, "tunnelFactory");
        return extHostTunnelService.registerTunnelProvider(tunnelProvider, information);
      },
      registerTimelineProvider: (scheme, provider) => {
        checkProposedApiEnabled(extension, "timeline");
        return extHostTimeline.registerTimelineProvider(scheme, provider, extension.identifier, extHostCommands.converter);
      },
      get isTrusted() {
        return extHostWorkspace.trusted;
      },
      requestResourceTrust: (options2) => {
        checkProposedApiEnabled(extension, "workspaceTrust");
        return extHostWorkspace.requestResourceTrust(options2);
      },
      requestWorkspaceTrust: (options2) => {
        checkProposedApiEnabled(extension, "workspaceTrust");
        return extHostWorkspace.requestWorkspaceTrust(options2);
      },
      isResourceTrusted: (resource) => {
        checkProposedApiEnabled(extension, "workspaceTrust");
        return extHostWorkspace.isResourceTrusted(resource);
      },
      onDidChangeWorkspaceTrustedFolders: (listener, thisArgs, disposables) => {
        checkProposedApiEnabled(extension, "workspaceTrust");
        return _asExtensionEvent(extHostWorkspace.onDidChangeWorkspaceTrustedFolders)(listener, thisArgs, disposables);
      },
      onDidGrantWorkspaceTrust: (listener, thisArgs, disposables) => {
        return _asExtensionEvent(extHostWorkspace.onDidGrantWorkspaceTrust)(listener, thisArgs, disposables);
      },
      registerEditSessionIdentityProvider: (scheme, provider) => {
        checkProposedApiEnabled(extension, "editSessionIdentityProvider");
        return extHostWorkspace.registerEditSessionIdentityProvider(scheme, provider);
      },
      onWillCreateEditSessionIdentity: (listener, thisArgs, disposables) => {
        checkProposedApiEnabled(extension, "editSessionIdentityProvider");
        return _asExtensionEvent(extHostWorkspace.getOnWillCreateEditSessionIdentityEvent(extension))(listener, thisArgs, disposables);
      },
      registerCanonicalUriProvider: (scheme, provider) => {
        checkProposedApiEnabled(extension, "canonicalUriProvider");
        return extHostWorkspace.registerCanonicalUriProvider(scheme, provider);
      },
      getCanonicalUri: (uri2, options2, token) => {
        checkProposedApiEnabled(extension, "canonicalUriProvider");
        return extHostWorkspace.provideCanonicalUri(uri2, options2, token);
      },
      decode(content, options2) {
        return extHostWorkspace.decode(content, options2);
      },
      encode(content, options2) {
        return extHostWorkspace.encode(content, options2);
      }
    };
    const scm = {
      get inputBox() {
        extHostApiDeprecation.report(
          "scm.inputBox",
          extension,
          `Use 'SourceControl.inputBox' instead`
        );
        return extHostSCM.getLastInputBox(extension);
      },
      createSourceControl(id2, label, rootUri, iconPath, isHidden, parent) {
        if (iconPath || isHidden || parent) {
          checkProposedApiEnabled(extension, "scmProviderOptions");
        }
        return extHostSCM.createSourceControl(extension, id2, label, rootUri, iconPath, isHidden, parent);
      }
    };
    const comments = {
      createCommentController(id2, label) {
        return extHostComment.createCommentController(extension, id2, label);
      }
    };
    const debug = {
      get activeDebugSession() {
        return extHostDebugService.activeDebugSession;
      },
      get activeDebugConsole() {
        return extHostDebugService.activeDebugConsole;
      },
      get breakpoints() {
        return extHostDebugService.breakpoints;
      },
      get activeStackItem() {
        return extHostDebugService.activeStackItem;
      },
      registerDebugVisualizationProvider(id2, provider) {
        checkProposedApiEnabled(extension, "debugVisualization");
        return extHostDebugService.registerDebugVisualizationProvider(extension, id2, provider);
      },
      registerDebugVisualizationTreeProvider(id2, provider) {
        checkProposedApiEnabled(extension, "debugVisualization");
        return extHostDebugService.registerDebugVisualizationTree(extension, id2, provider);
      },
      onDidStartDebugSession(listener, thisArg, disposables) {
        return _asExtensionEvent(extHostDebugService.onDidStartDebugSession)(listener, thisArg, disposables);
      },
      onDidTerminateDebugSession(listener, thisArg, disposables) {
        return _asExtensionEvent(extHostDebugService.onDidTerminateDebugSession)(listener, thisArg, disposables);
      },
      onDidChangeActiveDebugSession(listener, thisArg, disposables) {
        return _asExtensionEvent(extHostDebugService.onDidChangeActiveDebugSession)(listener, thisArg, disposables);
      },
      onDidReceiveDebugSessionCustomEvent(listener, thisArg, disposables) {
        return _asExtensionEvent(extHostDebugService.onDidReceiveDebugSessionCustomEvent)(listener, thisArg, disposables);
      },
      onDidChangeBreakpoints(listener, thisArgs, disposables) {
        return _asExtensionEvent(extHostDebugService.onDidChangeBreakpoints)(listener, thisArgs, disposables);
      },
      onDidChangeActiveStackItem(listener, thisArg, disposables) {
        return _asExtensionEvent(extHostDebugService.onDidChangeActiveStackItem)(listener, thisArg, disposables);
      },
      registerDebugConfigurationProvider(debugType, provider, triggerKind) {
        return extHostDebugService.registerDebugConfigurationProvider(debugType, provider, triggerKind || 1 /* Initial */);
      },
      registerDebugAdapterDescriptorFactory(debugType, factory) {
        return extHostDebugService.registerDebugAdapterDescriptorFactory(extension, debugType, factory);
      },
      registerDebugAdapterTrackerFactory(debugType, factory) {
        return extHostDebugService.registerDebugAdapterTrackerFactory(debugType, factory);
      },
      startDebugging(folder, nameOrConfig, parentSessionOrOptions) {
        if (!parentSessionOrOptions || typeof parentSessionOrOptions === "object" && "configuration" in parentSessionOrOptions) {
          return extHostDebugService.startDebugging(folder, nameOrConfig, { parentSession: parentSessionOrOptions });
        }
        return extHostDebugService.startDebugging(folder, nameOrConfig, parentSessionOrOptions || {});
      },
      stopDebugging(session) {
        return extHostDebugService.stopDebugging(session);
      },
      addBreakpoints(breakpoints) {
        return extHostDebugService.addBreakpoints(breakpoints);
      },
      removeBreakpoints(breakpoints) {
        return extHostDebugService.removeBreakpoints(breakpoints);
      },
      asDebugSourceUri(source, session) {
        return extHostDebugService.asDebugSourceUri(source, session);
      }
    };
    const tasks = {
      registerTaskProvider: (type, provider) => {
        return extHostTask.registerTaskProvider(extension, type, provider);
      },
      fetchTasks: (filter2) => {
        return extHostTask.fetchTasks(filter2);
      },
      executeTask: (task) => {
        return extHostTask.executeTask(extension, task);
      },
      get taskExecutions() {
        return extHostTask.taskExecutions;
      },
      onDidStartTask: (listener, thisArgs, disposables) => {
        const wrappedListener = (event) => {
          if (!isProposedApiEnabled(extension, "taskExecutionTerminal")) {
            if (event?.execution?.terminal !== void 0) {
              event.execution.terminal = void 0;
            }
          }
          const eventWithExecution = {
            ...event,
            execution: event.execution
          };
          return listener.call(thisArgs, eventWithExecution);
        };
        return _asExtensionEvent(extHostTask.onDidStartTask)(wrappedListener, thisArgs, disposables);
      },
      onDidEndTask: (listeners, thisArgs, disposables) => {
        return _asExtensionEvent(extHostTask.onDidEndTask)(listeners, thisArgs, disposables);
      },
      onDidStartTaskProcess: (listeners, thisArgs, disposables) => {
        return _asExtensionEvent(extHostTask.onDidStartTaskProcess)(listeners, thisArgs, disposables);
      },
      onDidEndTaskProcess: (listeners, thisArgs, disposables) => {
        return _asExtensionEvent(extHostTask.onDidEndTaskProcess)(listeners, thisArgs, disposables);
      },
      onDidStartTaskProblemMatchers: (listeners, thisArgs, disposables) => {
        checkProposedApiEnabled(extension, "taskProblemMatcherStatus");
        return _asExtensionEvent(extHostTask.onDidStartTaskProblemMatchers)(listeners, thisArgs, disposables);
      },
      onDidEndTaskProblemMatchers: (listeners, thisArgs, disposables) => {
        checkProposedApiEnabled(extension, "taskProblemMatcherStatus");
        return _asExtensionEvent(extHostTask.onDidEndTaskProblemMatchers)(listeners, thisArgs, disposables);
      }
    };
    const notebooks = {
      createNotebookController(id2, notebookType, label, handler, rendererScripts) {
        return extHostNotebookKernels.createNotebookController(extension, id2, notebookType, label, handler, isProposedApiEnabled(extension, "notebookMessaging") ? rendererScripts : void 0);
      },
      registerNotebookCellStatusBarItemProvider: (notebookType, provider) => {
        return extHostNotebook.registerNotebookCellStatusBarItemProvider(extension, notebookType, provider);
      },
      createRendererMessaging(rendererId) {
        return extHostNotebookRenderers.createRendererMessaging(extension, rendererId);
      },
      createNotebookControllerDetectionTask(notebookType) {
        checkProposedApiEnabled(extension, "notebookKernelSource");
        return extHostNotebookKernels.createNotebookControllerDetectionTask(extension, notebookType);
      },
      registerKernelSourceActionProvider(notebookType, provider) {
        checkProposedApiEnabled(extension, "notebookKernelSource");
        return extHostNotebookKernels.registerKernelSourceActionProvider(extension, notebookType, provider);
      }
    };
    const l10n = {
      t(...params) {
        if (typeof params[0] === "string") {
          const key = params.shift();
          const argsFormatted = !params || typeof params[0] !== "object" ? params : params[0];
          return extHostLocalization.getMessage(extension.identifier.value, { message: key, args: argsFormatted });
        }
        return extHostLocalization.getMessage(extension.identifier.value, params[0]);
      },
      get bundle() {
        return extHostLocalization.getBundle(extension.identifier.value);
      },
      get uri() {
        return extHostLocalization.getBundleUri(extension.identifier.value);
      }
    };
    const interactive = {
      transferActiveChat(toWorkspace) {
        checkProposedApiEnabled(extension, "interactive");
        return extHostChatAgents2.transferActiveChat(toWorkspace);
      }
    };
    const ai = {
      getRelatedInformation(query, types) {
        checkProposedApiEnabled(extension, "aiRelatedInformation");
        return extHostAiRelatedInformation.getRelatedInformation(extension, query, types);
      },
      registerRelatedInformationProvider(type, provider) {
        checkProposedApiEnabled(extension, "aiRelatedInformation");
        return extHostAiRelatedInformation.registerRelatedInformationProvider(extension, type, provider);
      },
      registerEmbeddingVectorProvider(model, provider) {
        checkProposedApiEnabled(extension, "aiRelatedInformation");
        return extHostAiEmbeddingVector.registerEmbeddingVectorProvider(extension, model, provider);
      },
      registerSettingsSearchProvider(provider) {
        checkProposedApiEnabled(extension, "aiSettingsSearch");
        return extHostAiSettingsSearch.registerSettingsSearchProvider(extension, provider);
      }
    };
    const chat = {
      registerMappedEditsProvider(_selector, _provider) {
        checkProposedApiEnabled(extension, "mappedEditsProvider");
        return { dispose() {
        } };
      },
      registerMappedEditsProvider2(provider) {
        checkProposedApiEnabled(extension, "mappedEditsProvider");
        return extHostCodeMapper.registerMappedEditsProvider(extension, provider);
      },
      createChatParticipant(id2, handler) {
        return extHostChatAgents2.createChatAgent(extension, id2, handler);
      },
      createDynamicChatParticipant(id2, dynamicProps, handler) {
        checkProposedApiEnabled(extension, "chatParticipantPrivate");
        return extHostChatAgents2.createDynamicChatAgent(extension, id2, dynamicProps, handler);
      },
      registerChatParticipantDetectionProvider(provider) {
        checkProposedApiEnabled(extension, "chatParticipantPrivate");
        return extHostChatAgents2.registerChatParticipantDetectionProvider(extension, provider);
      },
      onDidDisposeChatSession: (listeners, thisArgs, disposables) => {
        checkProposedApiEnabled(extension, "chatParticipantPrivate");
        return _asExtensionEvent(extHostChatAgents2.onDidDisposeChatSession)(listeners, thisArgs, disposables);
      },
      updateQuotas: (quotas) => {
        checkProposedApiEnabled(extension, "chatParticipantPrivate");
        extHostChatQuota.updateQuotas(quotas);
      },
      registerChatSessionItemProvider: (chatSessionType, provider) => {
        checkProposedApiEnabled(extension, "chatSessionsProvider");
        extHostApiDeprecation.report("chat.registerChatSessionItemProvider", extension, `Please migrate to the new chat session controller API`, {
          usageId: chatSessionType
        });
        return extHostChatSessions.registerChatSessionItemProvider(extension, chatSessionType, provider);
      },
      createChatSessionItemController: (chatSessionType, refreshHandler) => {
        checkProposedApiEnabled(extension, "chatSessionsProvider");
        return extHostChatSessions.createChatSessionItemController(extension, chatSessionType, refreshHandler);
      },
      registerChatSessionContentProvider(scheme, provider, chatParticipant, capabilities) {
        checkProposedApiEnabled(extension, "chatSessionsProvider");
        return extHostChatSessions.registerChatSessionContentProvider(extension, scheme, chatParticipant, provider, capabilities);
      },
      registerChatOutputRenderer: (viewType, renderer) => {
        checkProposedApiEnabled(extension, "chatOutputRenderer");
        return extHostChatOutputRenderer.registerChatOutputRenderer(extension, viewType, renderer);
      },
      registerChatWorkspaceContextProvider(id2, provider) {
        checkProposedApiEnabled(extension, "chatContextProvider");
        return extHostChatContext.registerChatWorkspaceContextProvider(`${extension.id}-${id2}`, provider);
      },
      registerChatAttachContextProvider(id2, provider) {
        checkProposedApiEnabled(extension, "chatContextProvider");
        return extHostChatContext.registerChatAttachContextProvider(`${extension.id}-${id2}`, provider);
      },
      registerChatTabContextProvider(selector, id2, provider) {
        checkProposedApiEnabled(extension, "chatContextProvider");
        return extHostChatContext.registerChatTabContextProvider(selector, `${extension.id}-${id2}`, provider);
      },
      registerChatExplicitContextProvider(_id, _provider) {
        checkProposedApiEnabled(extension, "chatContextProvider");
        return { dispose: () => {
        } };
      },
      registerChatResourceContextProvider(_selector, _id, _provider) {
        checkProposedApiEnabled(extension, "chatContextProvider");
        return { dispose: () => {
        } };
      },
      registerCustomAgentProvider(provider) {
        checkProposedApiEnabled(extension, "chatPromptFiles");
        return extHostChatAgents2.registerPromptFileProvider(extension, "agent" /* agent */, provider);
      },
      registerInstructionsProvider(provider) {
        checkProposedApiEnabled(extension, "chatPromptFiles");
        return extHostChatAgents2.registerPromptFileProvider(extension, "instructions" /* instructions */, provider);
      },
      registerPromptFileProvider(provider) {
        checkProposedApiEnabled(extension, "chatPromptFiles");
        return extHostChatAgents2.registerPromptFileProvider(extension, "prompt" /* prompt */, provider);
      },
      registerSkillProvider(provider) {
        checkProposedApiEnabled(extension, "chatPromptFiles");
        return extHostChatAgents2.registerPromptFileProvider(extension, "skill" /* skill */, provider);
      },
      registerHookProvider(provider) {
        checkProposedApiEnabled(extension, "chatPromptFiles");
        return extHostChatAgents2.registerPromptFileProvider(extension, "hook" /* hook */, provider);
      },
      registerChatDebugLogProvider(provider) {
        checkProposedApiEnabled(extension, "chatDebug");
        return extHostChatDebug.registerChatDebugLogProvider(provider);
      },
      onDidReceiveChatDebugEvent: (listener, thisArgs, disposables) => {
        checkProposedApiEnabled(extension, "chatDebug");
        return extHostChatDebug.onDidAddCoreEvent(listener, thisArgs, disposables);
      },
      getCustomAgents(token) {
        checkProposedApiEnabled(extension, "chatPromptFiles");
        return extHostChatAgents2.provideCustomAgents(token);
      },
      onDidChangeCustomAgents: (listener, thisArgs, disposables) => {
        checkProposedApiEnabled(extension, "chatPromptFiles");
        return extHostChatAgents2.onDidChangeCustomAgents(listener, thisArgs, disposables);
      },
      getInstructions(token) {
        checkProposedApiEnabled(extension, "chatPromptFiles");
        return extHostChatAgents2.provideInstructions(token);
      },
      onDidChangeInstructions: (listener, thisArgs, disposables) => {
        checkProposedApiEnabled(extension, "chatPromptFiles");
        return extHostChatAgents2.onDidChangeInstructions(listener, thisArgs, disposables);
      },
      getSkills(token) {
        checkProposedApiEnabled(extension, "chatPromptFiles");
        return extHostChatAgents2.provideSkills(token);
      },
      onDidChangeSkills: (listener, thisArgs, disposables) => {
        checkProposedApiEnabled(extension, "chatPromptFiles");
        return extHostChatAgents2.onDidChangeSkills(listener, thisArgs, disposables);
      },
      getSlashCommands(token) {
        checkProposedApiEnabled(extension, "chatPromptFiles");
        return extHostChatAgents2.provideSlashCommands(token);
      },
      onDidChangeSlashCommands: (listener, thisArgs, disposables) => {
        checkProposedApiEnabled(extension, "chatPromptFiles");
        return extHostChatAgents2.onDidChangeSlashCommands(listener, thisArgs, disposables);
      },
      getHooks(token) {
        checkProposedApiEnabled(extension, "chatPromptFiles");
        return extHostChatAgents2.provideHooks(token);
      },
      onDidChangeHooks: (listener, thisArgs, disposables) => {
        checkProposedApiEnabled(extension, "chatPromptFiles");
        return extHostChatAgents2.onDidChangeHooks(listener, thisArgs, disposables);
      },
      getPlugins(token) {
        checkProposedApiEnabled(extension, "chatPromptFiles");
        return extHostChatAgents2.providePlugins(token);
      },
      onDidChangePlugins: (listener, thisArgs, disposables) => {
        checkProposedApiEnabled(extension, "chatPromptFiles");
        return extHostChatAgents2.onDidChangePlugins(listener, thisArgs, disposables);
      },
      registerChatSessionCustomizationProvider(chatSessionType, metadata, provider) {
        checkProposedApiEnabled(extension, "chatSessionCustomizationProvider");
        return extHostChatAgents2.registerChatSessionCustomizationProvider(extension, chatSessionType, metadata, provider);
      },
      createInputNotification(id2) {
        checkProposedApiEnabled(extension, "chatInputNotification");
        return extHostChatInputNotification.createInputNotification(extension, id2);
      }
    };
    const lm = {
      selectChatModels: (selector) => {
        return extHostLanguageModels.selectLanguageModels(extension, selector ?? {});
      },
      onDidChangeChatModels: (listener, thisArgs, disposables) => {
        return extHostLanguageModels.onDidChangeProviders(listener, thisArgs, disposables);
      },
      registerLanguageModelChatProvider: (vendor, provider) => {
        return extHostLanguageModels.registerLanguageModelChatProvider(extension, vendor, provider);
      },
      get isModelProxyAvailable() {
        checkProposedApiEnabled(extension, "languageModelProxy");
        return extHostLanguageModels.isModelProxyAvailable;
      },
      onDidChangeModelProxyAvailability: (listener, thisArgs, disposables) => {
        checkProposedApiEnabled(extension, "languageModelProxy");
        return extHostLanguageModels.onDidChangeModelProxyAvailability(listener, thisArgs, disposables);
      },
      getModelProxy: () => {
        checkProposedApiEnabled(extension, "languageModelProxy");
        return extHostLanguageModels.getModelProxy(extension);
      },
      registerLanguageModelProxyProvider: (provider) => {
        checkProposedApiEnabled(extension, "chatParticipantPrivate");
        return extHostLanguageModels.registerLanguageModelProxyProvider(extension, provider);
      },
      // --- embeddings
      get embeddingModels() {
        checkProposedApiEnabled(extension, "embeddings");
        return extHostEmbeddings.embeddingsModels;
      },
      onDidChangeEmbeddingModels: (listener, thisArgs, disposables) => {
        checkProposedApiEnabled(extension, "embeddings");
        return extHostEmbeddings.onDidChange(listener, thisArgs, disposables);
      },
      registerEmbeddingsProvider(embeddingsModel, provider) {
        checkProposedApiEnabled(extension, "embeddings");
        return extHostEmbeddings.registerEmbeddingsProvider(extension, embeddingsModel, provider);
      },
      async computeEmbeddings(embeddingsModel, input, token) {
        checkProposedApiEnabled(extension, "embeddings");
        if (typeof input === "string") {
          return extHostEmbeddings.computeEmbeddings(embeddingsModel, input, token);
        } else {
          return extHostEmbeddings.computeEmbeddings(embeddingsModel, input, token);
        }
      },
      registerTool(name2, tool) {
        return extHostLanguageModelTools.registerTool(extension, name2, tool);
      },
      registerToolDefinition(definition, tool) {
        return extHostLanguageModelTools.registerToolDefinition(extension, definition, tool);
      },
      invokeTool(nameOrInfo, parameters, token) {
        if (typeof nameOrInfo !== "string") {
          checkProposedApiEnabled(extension, "chatParticipantAdditions");
        }
        return extHostLanguageModelTools.invokeTool(extension, nameOrInfo, parameters, token);
      },
      get tools() {
        return extHostLanguageModelTools.getTools(extension);
      },
      fileIsIgnored(uri2, token) {
        return extHostLanguageModels.fileIsIgnored(extension, uri2, token);
      },
      registerIgnoredFileProvider(provider) {
        return extHostLanguageModels.registerIgnoredFileProvider(extension, provider);
      },
      registerMcpServerDefinitionProvider(id2, provider) {
        return extHostMcp.registerMcpConfigurationProvider(extension, id2, provider);
      },
      onDidChangeMcpServerDefinitions: (...args) => {
        checkProposedApiEnabled(extension, "mcpServerDefinitions");
        return _asExtensionEvent(extHostMcp.onDidChangeMcpServerDefinitions)(...args);
      },
      get mcpServerDefinitions() {
        checkProposedApiEnabled(extension, "mcpServerDefinitions");
        return extHostMcp.mcpServerDefinitions;
      },
      startMcpGateway(chatSessionResource) {
        checkProposedApiEnabled(extension, "mcpServerDefinitions");
        return extHostMcp.startMcpGateway(chatSessionResource);
      },
      onDidChangeChatRequestTools(...args) {
        checkProposedApiEnabled(extension, "chatParticipantAdditions");
        return _asExtensionEvent(extHostChatAgents2.onDidChangeChatRequestTools)(...args);
      }
    };
    const speech = {
      registerSpeechProvider(id2, provider) {
        checkProposedApiEnabled(extension, "speech");
        return extHostSpeech.registerProvider(extension.identifier, id2, provider);
      }
    };
    return {
      version: initData.version,
      // namespaces
      ai,
      authentication,
      commands,
      comments,
      chat,
      debug,
      env: env2,
      extensions,
      interactive,
      l10n,
      languages,
      lm,
      notebooks,
      scm,
      speech,
      tasks,
      tests,
      window: window2,
      workspace,
      // types
      Breakpoint,
      TerminalOutputAnchor,
      ChatResultFeedbackKind,
      ChatVariableLevel,
      ChatCompletionItem,
      ChatReferenceDiagnostic,
      CallHierarchyIncomingCall,
      CallHierarchyItem,
      CallHierarchyOutgoingCall,
      CancellationError,
      CancellationTokenSource,
      CandidatePortSource,
      CodeAction,
      CodeActionKind,
      CodeActionTriggerKind,
      CodeLens,
      Color,
      ColorInformation,
      ColorPresentation,
      ColorThemeKind,
      CommentMode,
      CommentState,
      CommentThreadCollapsibleState,
      CommentThreadState,
      CommentThreadApplicability,
      CommentThreadFocus,
      CompletionItem,
      CompletionItemKind,
      CompletionItemTag,
      CompletionList,
      CompletionTriggerKind,
      ConfigurationTarget: ConfigurationTarget2,
      CustomExecution,
      DebugAdapterExecutable,
      DebugAdapterInlineImplementation,
      DebugAdapterNamedPipeServer,
      DebugAdapterServer,
      DebugConfigurationProviderTriggerKind,
      DebugConsoleMode,
      DebugVisualization,
      DecorationRangeBehavior,
      Diagnostic,
      DiagnosticRelatedInformation,
      DiagnosticSeverity,
      DiagnosticTag,
      Disposable: Disposable2,
      DocumentHighlight,
      DocumentHighlightKind,
      MultiDocumentHighlight,
      DocumentLink,
      DocumentSymbol,
      EndOfLine,
      EnvironmentVariableMutatorType,
      EvaluatableExpression,
      InlineValueText,
      InlineValueVariableLookup,
      InlineValueEvaluatableExpression,
      InlineCompletionTriggerKind,
      InlineCompletionsDisposeReasonKind,
      EventEmitter: Emitter,
      ExtensionKind,
      ExtensionMode,
      ExternalUriOpenerPriority,
      FileChangeType,
      FileDecoration,
      FileDecoration2: FileDecoration,
      FileSystemError,
      FileType,
      FilePermission,
      FoldingRange,
      FoldingRangeKind: FoldingRangeKind2,
      FunctionBreakpoint,
      InlineCompletionItem: InlineSuggestion,
      InlineCompletionList: InlineSuggestionList,
      Hover,
      VerboseHover,
      HoverVerbosityAction,
      IndentAction,
      Location: Location2,
      MarkdownString: MarkdownString2,
      OverviewRulerLane,
      ParameterInformation,
      PortAutoForwardAction,
      Position: Position2,
      ProcessExecution,
      ProgressLocation,
      QuickInputButtonLocation,
      QuickInputButtons,
      Range: Range2,
      RelativePattern,
      Selection,
      SelectionRange,
      SemanticTokens,
      SemanticTokensBuilder,
      SemanticTokensEdit,
      SemanticTokensEdits,
      SemanticTokensLegend,
      ShellExecution,
      ShellQuoting,
      SignatureHelp,
      SignatureHelpTriggerKind,
      SignatureInformation,
      SnippetString,
      SourceBreakpoint,
      StandardTokenType,
      SyntaxHighlightingTokenFontStyle,
      StatusBarAlignment,
      SymbolInformation,
      SymbolKind: SymbolKind2,
      SymbolTag,
      Task,
      TaskEventKind,
      TaskGroup,
      TaskPanelKind,
      TaskRevealKind,
      TaskRunOn,
      TaskScope,
      TerminalLink,
      TerminalQuickFixTerminalCommand: TerminalQuickFixCommand,
      TerminalQuickFixOpener,
      TerminalLocation,
      TerminalProfile,
      TerminalExitReason,
      TerminalShellExecutionCommandLineConfidence,
      TerminalCompletionItem,
      TerminalCompletionItemKind,
      TerminalCompletionList,
      TerminalShellType,
      TextDocumentSaveReason,
      TextEdit,
      SnippetTextEdit,
      TextEditorCursorStyle,
      TextEditorChangeKind,
      TextEditorLineNumbersStyle,
      TextEditorRevealType,
      TextEditorSelectionChangeKind,
      SyntaxTokenType,
      TextDocumentChangeReason,
      ThemeColor: ThemeColor2,
      ThemeIcon: ThemeIcon2,
      TreeItem,
      TreeItemCheckboxState,
      TreeItemCollapsibleState,
      TypeHierarchyItem,
      UIKind,
      Uri: URI,
      ViewColumn,
      WorkspaceEdit,
      // proposed api types
      DocumentPasteTriggerKind,
      DocumentDropEdit,
      DocumentDropOrPasteEditKind,
      DocumentPasteEdit,
      InlayHint,
      InlayHintLabelPart,
      InlayHintKind,
      RemoteAuthorityResolverError,
      ResolvedAuthority,
      ManagedResolvedAuthority,
      SourceControlInputBoxValidationType,
      ExtensionRuntime,
      TimelineItem,
      NotebookRange,
      NotebookCellKind,
      NotebookCellExecutionState,
      NotebookCellData,
      NotebookData,
      NotebookRendererScript,
      NotebookCellStatusBarAlignment,
      NotebookEditorRevealType,
      NotebookCellOutput,
      NotebookCellOutputItem,
      CellErrorStackFrame,
      NotebookCellStatusBarItem,
      NotebookControllerAffinity,
      NotebookControllerAffinity2,
      NotebookEdit,
      NotebookKernelSourceAction,
      NotebookVariablesRequestKind,
      PortAttributes,
      LinkedEditingRanges,
      TestResultState,
      TestRunRequest,
      TestMessage,
      TestMessageStackFrame,
      TestTag,
      TestRunProfileKind,
      TextSearchCompleteMessageType,
      DataTransfer,
      DataTransferItem,
      TestCoverageCount,
      FileCoverage,
      StatementCoverage,
      BranchCoverage,
      DeclarationCoverage,
      WorkspaceTrustState,
      LanguageStatusSeverity,
      QuickPickItemKind,
      InputBoxValidationSeverity,
      TabInputText: TextTabInput,
      TabInputTextDiff: TextDiffTabInput,
      TabInputTextMerge: TextMergeTabInput,
      TabInputCustom: CustomEditorTabInput,
      TabInputNotebook: NotebookEditorTabInput,
      TabInputNotebookDiff: NotebookDiffEditorTabInput,
      TabInputWebview: WebviewEditorTabInput,
      TabInputTerminal: TerminalEditorTabInput,
      TabInputInteractiveWindow: InteractiveWindowInput,
      TabInputChat: ChatEditorTabInput,
      TabInputTextMultiDiff: TextMultiDiffTabInput,
      TelemetryTrustedValue,
      LogLevel,
      EditSessionIdentityMatch,
      InteractiveSessionVoteDirection,
      ChatCopyKind,
      ChatSessionChangedFile,
      ChatEditingSessionActionOutcome,
      InteractiveEditorResponseFeedbackKind,
      DebugStackFrame,
      DebugThread,
      RelatedInformationType,
      SpeechToTextStatus,
      TextToSpeechStatus,
      PartialAcceptTriggerKind,
      InlineCompletionEndOfLifeReasonKind,
      InlineCompletionDisplayLocationKind,
      KeywordRecognitionStatus,
      ChatImageMimeType,
      ChatResponseMarkdownPart,
      ChatResponseFileTreePart,
      ChatResponseAnchorPart,
      ChatResponseProgressPart,
      ChatResponseProgressPart2,
      ChatResponseThinkingProgressPart,
      ChatResponseHookPart,
      ChatResponseVoiceProgressPart,
      ChatResponseAutoModeResolutionPart,
      ChatResponseReferencePart,
      ChatResponseReferencePart2: ChatResponseReferencePart,
      ChatResponseCodeCitationPart,
      ChatResponseCodeblockUriPart,
      ChatResponseWarningPart,
      ChatResponseInfoPart,
      ChatResponseTextEditPart,
      ChatResponseNotebookEditPart,
      ChatResponseWorkspaceEditPart,
      ChatResponseMarkdownWithVulnerabilitiesPart,
      ChatResponseCommandButtonPart,
      ChatResponseConfirmationPart,
      ChatQuestion,
      ChatQuestionType,
      ChatResponseQuestionCarouselPart,
      ChatResponseMovePart,
      ChatResponseExtensionsPart,
      ChatResponseExternalEditPart,
      ChatResponsePullRequestPart,
      ChatResponseMultiDiffPart,
      ChatResponseReferencePartStatusKind,
      ChatResponseClearToPreviousToolInvocationReason: ChatResponseClearToPreviousToolInvocationReason2,
      ChatRequestTurn,
      ChatRequestTurn2: ChatRequestTurn,
      ChatResponseTurn,
      ChatResponseTurn2,
      ChatSubagentToolInvocationData,
      ChatToolInvocationPart,
      ChatLocation,
      ChatSessionStatus,
      ChatSessionCustomizationType,
      ChatDebugLogLevel,
      ChatDebugToolCallResult,
      ChatDebugHookResult,
      ChatDebugToolCallEvent,
      ChatDebugModelTurnEvent,
      ChatDebugGenericEvent,
      ChatDebugSubagentInvocationEvent,
      ChatDebugUserMessageEvent,
      ChatDebugAgentResponseEvent,
      ChatDebugMessageSection,
      ChatDebugEventTextContent,
      ChatDebugMessageContentType,
      ChatDebugEventMessageContent,
      ChatDebugEventToolCallContent,
      ChatDebugEventModelTurnContent,
      ChatDebugEventHookContent,
      ChatRequestEditorData,
      ChatRequestNotebookData,
      ChatReferenceBinaryData,
      ChatRequestEditedFileEventKind,
      LanguageModelChatMessageRole,
      LanguageModelChatMessage,
      LanguageModelChatMessage2,
      LanguageModelToolResultPart,
      LanguageModelToolResultPart2: LanguageModelToolResultPart,
      LanguageModelTextPart,
      LanguageModelTextPart2: LanguageModelTextPart,
      LanguageModelPartAudience,
      ToolResultAudience: LanguageModelPartAudience,
      // back compat
      LanguageModelToolCallPart,
      LanguageModelThinkingPart,
      LanguageModelError,
      LanguageModelToolResult,
      LanguageModelToolResult2,
      LanguageModelDataPart,
      LanguageModelDataPart2: LanguageModelDataPart,
      LanguageModelToolExtensionSource,
      LanguageModelToolMCPSource,
      ExtendedLanguageModelToolResult,
      LanguageModelChatToolMode,
      LanguageModelPromptTsxPart,
      NewSymbolName,
      NewSymbolNameTag,
      NewSymbolNameTriggerKind,
      ExcludeSettingOptions,
      TextSearchContext2,
      TextSearchMatch2,
      AISearchKeyword,
      TextSearchCompleteMessageTypeNew: TextSearchCompleteMessageType,
      ChatErrorLevel,
      ChatInputNotificationSeverity,
      McpHttpServerDefinition,
      McpHttpServerDefinition2: McpHttpServerDefinition,
      McpStdioServerDefinition,
      McpStdioServerDefinition2: McpStdioServerDefinition,
      McpToolAvailability,
      McpToolInvocationContentData,
      SettingsSearchResultKind,
      ChatTodoStatus,
      ChatDebugSubagentStatus
    };
  };
}
export { getTerminalInternalOptions, createApiFactoryAndRegisterActors };
