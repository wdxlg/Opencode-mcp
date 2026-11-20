// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chat.shared.contribution.ts
import { CommandsRegistry } from "./module-0087.mjs";
import { IChatService } from "./module-0972.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions3 } from "./module-0138.mjs";
import { HOOK_SCHEMA_URI, hookFileSchema } from "./module-1011.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { localize } from "./module-0001.mjs";
import { DEFAULT_LOCAL_TRANSCRIPTION_MODEL } from "./module-1341.mjs";
import { CONFIGURE_DICTATION_INSTRUCTIONS_ACTION_ID, registerConfigureSpeechInstructionsActions } from "./module-2037.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { AgentHostAutoReplyEnabledConfigKey, AgentHostEditAutoApprovePatternsConfigKey, AgentHostMigrateLegacyCopilotCliEnabledConfigKey, AgentHostSessionSyncEnabledConfigKey, AgentHostShowExternalSessionsConfigKey } from "./module-2102.mjs";
import { product_default } from "./module-0139.mjs";
import { COPILOT_ALLOWED_MCP_SERVERS_KEY, COPILOT_ALLOW_MANAGED_HOOKS_ONLY_CONFIG, COPILOT_ALLOW_MANAGED_HOOKS_ONLY_KEY, COPILOT_ALLOW_MANAGED_MCP_SERVERS_ONLY_CONFIG, COPILOT_ALLOW_MANAGED_MCP_SERVERS_ONLY_KEY, COPILOT_DENIED_MCP_SERVERS_KEY, COPILOT_ENABLED_PLUGINS_KEY, COPILOT_EXTRA_MARKETPLACES_KEY, COPILOT_MODEL_KEY, COPILOT_STRICT_MARKETPLACES_KEY, COPILOT_STRICT_PLUGIN_ONLY_CUSTOMIZATION_CONFIG, COPILOT_STRICT_PLUGIN_ONLY_CUSTOMIZATION_KEY, COPILOT_TOP_LEVEL_MODEL_KEY, managedModelValue, managedSettingValue } from "./module-0955.mjs";
import { LanguageModelToolsService } from "./module-2812.mjs";
import { ChatAIDisabledSettingId, ChatMicrosoftAuthenticationEnabledSettingId, DEFAULT_EDIT_AUTO_APPROVE_PATTERNS, mergeChatEditAutoApprovePatterns } from "./module-0950.mjs";
import { ChatSessionArchiveActionWordingSettingId } from "./module-2494.mjs";
import { AgentHostAhpJsonlLoggingSettingId, AgentHostAllowSignedOutWhenUsableSettingId, AgentHostSdkSandboxEnabledSettingId, AgentHostSdkSandboxWindowsEnabledSettingId, CodexPreferAgentHostEditorSettingId } from "./module-1107.mjs";
import { mcpAccessConfig, mcpAllowedServersConfig, mcpAppsEnabledConfig, mcpAutoStartConfig, mcpDeniedServersConfig, mcpGalleryServiceEnablementConfig, mcpGalleryServiceUrlConfig } from "./module-1196.mjs";
import { allDiscoverySources, discoverySourceSettingsLabel, mcpDiscoverySection, mcpEnterpriseManagedAuthIdpSection, mcpServerCollisionBehaviorSection, mcpServerSamplingSection } from "./module-1421.mjs";
import { AssistedTypes } from "./module-2495.mjs";
import { AGENT_DOCUMENTATION_URL, AgentHostAgentDebugLogEnabledSettingId, AgentHostAgentDebugLogMaxEventsSettingId, HOOK_DOCUMENTATION_URL, INSTRUCTIONS_DOCUMENTATION_URL, PROMPT_DOCUMENTATION_URL, SKILL_DOCUMENTATION_URL } from "./module-0985.mjs";
import { AgentHostCopilotModelCapabilityOverridesSettingId, AgentHostCopilotSdkLogLevelSettingId, AgentHostCustomTerminalToolEnabledSettingId, AgentHostMultiTurnContextRoutingEnabledSettingId, AgentHostOpus48PromptEnabledSettingId, AgentHostReasoningEffortOverrideSettingId, AgentHostReasoningSummaryEnabledSettingId, AgentHostToolSearchDeferThresholdSettingId, AgentHostToolSearchEnabledSettingId, CopilotSubagentModelGuidanceEnabledSettingId, copilotSdkLogLevelSettingValues } from "./module-2104.mjs";
import { AgentHostMapLegacySettingsToManagedSettingsSettingId } from "./module-2491.mjs";
import { CopilotSemanticSearchEnabledSettingId } from "./module-2110.mjs";
import { reasoningEffortLevels } from "./module-2103.mjs";
import { PlanAgentDefaultModel } from "./module-2796.mjs";
import { ExploreAgentDefaultModel } from "./module-2794.mjs";
import { UtilityModelContribution, UtilitySmallModelContribution } from "./module-2814.mjs";
import { PromptsConfig, isTildePath } from "./module-0998.mjs";
import { AGENTS_SOURCE_FOLDER, AGENT_FILE_EXTENSION, CLAUDE_AGENTS_SOURCE_FOLDER, COPILOT_USER_AGENTS_SOURCE_FOLDER, DEFAULT_HOOK_FILE_PATHS, DEFAULT_INSTRUCTIONS_SOURCE_FOLDERS, DEFAULT_SKILL_SOURCE_FOLDERS, INSTRUCTIONS_DEFAULT_SOURCE_FOLDER, INSTRUCTION_FILE_EXTENSION, LEGACY_MODE_DEFAULT_SOURCE_FOLDER, LEGACY_MODE_FILE_EXTENSION, PROMPT_DEFAULT_SOURCE_FOLDER, PROMPT_FILE_EXTENSION, SKILL_FILENAME } from "./module-0996.mjs";
import { VALID_PROMPT_FOLDER_PATTERN } from "./module-1001.mjs";
import { EditorExtensions } from "./module-0925.mjs";
import { EditorPaneDescriptor } from "./module-1084.mjs";
import { ChatEditor } from "./module-2565.mjs";
import { ChatEditorInput, ChatEditorInputSerializer } from "./module-1111.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { ChatDebugEditor } from "./module-2619.mjs";
import { ChatDebugEditorInput, ChatDebugEditorInputSerializer } from "./module-2568.mjs";
import { AgentPluginEditor } from "./module-2748.mjs";
import { AgentPluginEditorInput } from "./module-2749.mjs";
import { Extensions14 } from "./module-1112.mjs";
import { AgentMergeSettingId } from "./module-2492.mjs";
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatSessionsService } from "./module-0960.mjs";
import { IEditorResolverService } from "./module-1113.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IChatEntitlementService } from "./module-0953.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { Event2 } from "./module-0017.mjs";
import { IWorkbenchAssignmentService } from "./module-1222.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ChatViewId, IChatAccessibilityService, IChatCodeBlockContextProviderService, IChatPasteTargetService, IChatWidgetService, IQuickChatService, isIChatResourceViewContext, isIChatViewViewContext } from "./module-0981.mjs";
import { IViewsService } from "./module-1246.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { autorun } from "./module-0052.mjs";
import { ModeOpenChatGlobalAction, registerChatActions } from "./module-1476.mjs";
import { registerAction2 } from "./module-0092.mjs";
import { ChatModeService, IChatModeService } from "./module-1470.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IPathService } from "./module-0938.mjs";
import { ILanguageModelToolsService } from "./module-0990.mjs";
import { ChatSpeechToTextService, IChatSpeechToTextService } from "./module-1348.mjs";
import { ICustomizationMigrationService } from "./module-2508.mjs";
import { AccessibleViewRegistry } from "./module-0693.mjs";
import { ChatTerminalOutputAccessibleView } from "./module-2743.mjs";
import { ChatResponseAccessibleView } from "./module-2521.mjs";
import { AgentChatAccessibilityHelp, EditsChatAccessibilityHelp, PanelChatAccessibilityHelp, QuickChatAccessibilityHelp } from "./module-2532.mjs";
import { ChatFindAccessibilityHelp } from "./module-2817.mjs";
import { ChatPetAchievementsAccessibilityHelp, ChatPetContextContribution, ChatPetCustomizationAchievementContribution, ChatPetEditingAchievementContribution } from "./module-2771.mjs";
import { registerEditorFeature } from "./module-0574.mjs";
import { ChatInputBoxContentProvider } from "./module-2739.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { PromptsDebugContribution } from "./module-2620.mjs";
import { AgentHostChatDebugContribution } from "./module-2594.mjs";
import { ChatLanguageModelsDataContribution, LanguageModelsConfigurationService } from "./module-2737.mjs";
import { ChatSessionOptionSlashCommandsContribution, ChatSlashCommandsContribution } from "./module-2784.mjs";
import { ChatOutlineCreator } from "./module-2736.mjs";
import { ChatCompatibilityNotifier, ChatExtensionPointHandler } from "./module-2766.mjs";
import { LanguageModelToolsExtensionPointHandler } from "./module-1036.mjs";
import { ChatPromptFilesExtensionPointHandler } from "./module-2507.mjs";
import { CodeBlockActionRendering, registerChatCodeBlockActions, registerChatCodeCompareBlockActions } from "./module-2537.mjs";
import { ChatCopyActionRendering, registerChatCopyActions } from "./module-2535.mjs";
import { ChatModelFeedbackSurveyActionRendering, registerChatModelFeedbackSurveyActions } from "./module-2218.mjs";
import { ChatModelFeedbackSurveyPromptContribution } from "./module-2555.mjs";
import { ChatImplicitContextContribution } from "./module-2094.mjs";
import { ChatViewsWelcomeHandler } from "./module-2815.mjs";
import { ChatGettingStartedContribution } from "./module-2561.mjs";
import { ChatSetupContribution, ChatTeardownContribution } from "./module-2783.mjs";
import { ChatQuotaNotificationContribution } from "./module-2775.mjs";
import { ChatPromoNotificationContribution } from "./module-2772.mjs";
import { ChatExpNotificationContribution } from "./module-2774.mjs";
import { HasByokModelsContribution } from "./module-2795.mjs";
import { BuiltinToolsContribution } from "./module-2519.mjs";
import { ClientToolSetsContribution } from "./module-2632.mjs";
import { UsagesToolContribution } from "./module-2636.mjs";
import { RenameToolContribution } from "./module-2635.mjs";
import { ChatAgentRecommendation } from "./module-2533.mjs";
import { ChatEditingEditorAccessibility } from "./module-2705.mjs";
import { ChatQueuePickerRendering } from "./module-2819.mjs";
import { ChatEditingEditorOverlay } from "./module-2710.mjs";
import { ChatEditingEditorContextKeys } from "./module-2057.mjs";
import { ChatTransferContribution } from "./module-2575.mjs";
import { ChatContextContributions } from "./module-2167.mjs";
import { PromptUrlHandler } from "./module-2809.mjs";
import { PluginUrlHandler } from "./module-2803.mjs";
import { ChatEditingNotebookFileSystemProviderContrib } from "./module-2727.mjs";
import { ChatResponseResourceFileSystemProvider, ChatResponseResourceWorkbenchContribution, IChatResponseResourceFileSystemProvider } from "./module-2030.mjs";
import { ConfigureToolSets, UserToolSetsContributions } from "./module-2201.mjs";
import { PromptLanguageFeaturesProvider } from "./module-2629.mjs";
import { ChatWindowNotifier } from "./module-2790.mjs";
import { ChatRepoInfoContribution } from "./module-2776.mjs";
import { AgentPluginRecommendations } from "./module-2791.mjs";
import { AgentPluginCommandsContribution } from "./module-2744.mjs";
import { PluginAutoUpdate } from "./module-2799.mjs";
import { ChatReferenceAttachmentWidgetContribution } from "./module-2703.mjs";
import { TranscriptContextAttachmentWidgetContribution } from "./module-2704.mjs";
import { registerChatAccessibilityActions } from "./module-2522.mjs";
import { registerChatBranchActions } from "./module-2556.mjs";
import { registerChatOpenAgentDebugPanelAction } from "./module-2569.mjs";
import { registerChatFileTreeActions } from "./module-2559.mjs";
import { registerChatPromptNavigationActions } from "./module-2572.mjs";
import { registerChatTitleActions } from "./module-2213.mjs";
import { registerChatExecuteActions } from "./module-2062.mjs";
import { registerChatFindActions } from "./module-2560.mjs";
import { ChatVoiceInputModeAction, ChatVoiceInputModeToggleListenAction, registerVoiceInputModeSimulateActions } from "./module-2084.mjs";
import { registerChatSpeechToTextActions } from "./module-2085.mjs";
import { registerChatQueueActions } from "./module-2574.mjs";
import { registerQuickChatActions } from "./module-2543.mjs";
import { registerChatExportActions } from "./module-2562.mjs";
import { registerMoveActions } from "./module-2566.mjs";
import { registerNewChatActions } from "./module-2567.mjs";
import { registerChatContextActions } from "./module-2554.mjs";
import { registerChatDeveloperActions } from "./module-2558.mjs";
import { registerChatEditorActions } from "./module-2709.mjs";
import { registerChatElicitationActions } from "./module-2303.mjs";
import { registerChatToolActions } from "./module-2203.mjs";
import { registerLanguageModelActions } from "./module-2563.mjs";
import { registerChatPluginActions } from "./module-2571.mjs";
import { ChatPasteProvidersFeature } from "./module-2091.mjs";
import { IAgentPluginService, agentPluginDiscoveryRegistry } from "./module-1016.mjs";
import { AgentPluginService, ConfiguredAgentPluginDiscovery, CopilotCliAgentPluginDiscovery, ExtensionAgentPluginDiscovery, MarketplaceAgentPluginDiscovery } from "./module-2740.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { ChatTransferService, IChatTransferService } from "./module-2504.mjs";
import { ChatService } from "./module-2506.mjs";
import { ChatWidgetService } from "./module-2818.mjs";
import { ChatPasteTargetService } from "./module-2752.mjs";
import { ChatBranchService, IChatBranchService } from "./module-2015.mjs";
import { ChatSideChatService, IChatSideChatService } from "./module-2317.mjs";
import { ChatRequestOriginService, IChatRequestOriginService } from "./module-1189.mjs";
import { ChatModelFeedbackSurveyService, IChatModelFeedbackSurveyService } from "./module-2217.mjs";
import { ChatPetService, IChatPetService } from "./module-2139.mjs";
import { ChatPetWidgetService, IChatPetWidgetService } from "./module-2393.mjs";
import { QuickChatService } from "./module-2864.mjs";
import { ChatAccessibilityService } from "./module-2639.mjs";
import { ChatWidgetHistoryService, IChatWidgetHistoryService } from "./module-1471.mjs";
import { ILanguageModelsConfigurationService } from "./module-0966.mjs";
import { ILanguageModelsService, LanguageModelsService } from "./module-0967.mjs";
import { ILanguageModelStatsService, LanguageModelStatsService } from "./module-1473.mjs";
import { ChatSlashCommandService, IChatSlashCommandService } from "./module-0988.mjs";
import { ChatAgentNameService, ChatAgentService, IChatAgentNameService, IChatAgentService } from "./module-0974.mjs";
import { IChatVariablesService } from "./module-0983.mjs";
import { ChatVariablesService } from "./module-0992.mjs";
import { IPluginMarketplaceService, PluginMarketplaceService } from "./module-1028.mjs";
import { IWorkspacePluginSettingsService, WorkspacePluginSettingsService } from "./module-1026.mjs";
import { IAgentPluginRepositoryService } from "./module-1023.mjs";
import { AgentPluginRepositoryService } from "./module-2751.mjs";
import { IPluginGitService } from "./module-2741.mjs";
import { BrowserPluginGitCommandService } from "./module-2801.mjs";
import { IPluginInstallService } from "./module-2570.mjs";
import { PluginInstallService } from "./module-2802.mjs";
import { IToolResultCompressor } from "./module-2742.mjs";
import { ToolResultCompressorService } from "./module-2813.mjs";
import { ILanguageModelToolsConfirmationService } from "./module-1474.mjs";
import { LanguageModelToolsConfirmationService } from "./module-2811.mjs";
import { ChatToolRiskAssessmentService, IChatToolRiskAssessmentService } from "./module-2304.mjs";
import { ChatSubmitRequestHandlerService, IChatSubmitRequestHandlerService } from "./module-2392.mjs";
import { IVoiceChatService, VoiceChatService } from "./module-2520.mjs";
import { ChatCodeBlockContextProviderService } from "./module-2792.mjs";
import { CodeMapperService, ICodeMapperService } from "./module-1033.mjs";
import { IChatEditingService } from "./module-1081.mjs";
import { ChatEditingService } from "./module-2732.mjs";
import { ChatMarkdownAnchorService, IChatMarkdownAnchorService } from "./module-2140.mjs";
import { AgentNetworkFilterService, IAgentNetworkFilterService } from "./module-1241.mjs";
import { ILanguageModelIgnoredFilesService, LanguageModelIgnoredFilesService } from "./module-0945.mjs";
import { IPromptsService } from "./module-0986.mjs";
import { PromptsService } from "./module-1030.mjs";
import { CustomizationMigrationService } from "./module-2509.mjs";
import { ChatContextPickService, IChatContextPickService } from "./module-1453.mjs";
import { ChatAttachmentResolveService, IChatAttachmentResolveService } from "./module-2092.mjs";
import { ChatAttachmentWidgetRegistry, IChatAttachmentWidgetRegistry } from "./module-2033.mjs";
import { ChatTodoListService, IChatTodoListService } from "./module-1481.mjs";
import { ChatArtifactsService, IChatArtifactsService } from "./module-1480.mjs";
import { ChatOutputRendererService, IChatOutputRendererService } from "./module-1309.mjs";
import { IChatLayoutService } from "./module-2012.mjs";
import { ChatLayoutService } from "./module-2738.mjs";
import { IPlanReviewFeedbackService, PlanReviewFeedbackService } from "./module-2137.mjs";
import { ChatTipService, IChatTipService } from "./module-2388.mjs";
import { IChatDebugService } from "./module-1456.mjs";
import { ChatDebugServiceImpl } from "./module-2496.mjs";
import { ChatImageCarouselService, IChatImageCarouselService } from "./module-2031.mjs";
import { AgentHostImportConversationStore, IAgentHostImportConversationStore } from "./module-1477.mjs";
import { ISessionSummaryHoverService, SessionSummaryHoverService } from "./module-2273.mjs";
import { ChatWidget } from "./module-2394.mjs";
import { ChatDynamicVariableModel } from "./module-0984.mjs";


// src/vs/workbench/contrib/chat/browser/chat.shared.contribution.ts
CommandsRegistry.registerCommand("_chat.notifyQuestionCarouselAnswer", (accessor, resolveId, answers) => {
  accessor.get(IChatService).notifyQuestionCarouselAnswer("", resolveId, answers);
});

var toolReferenceNameEnumValues = [];

var toolReferenceNameEnumDescriptions = [];

var jsonContributionRegistry2 = Registry.as(Extensions3.JSONContribution);

jsonContributionRegistry2.registerSchema(HOOK_SCHEMA_URI, hookFileSchema);

var configurationRegistry13 = Registry.as(Extensions4.Configuration);

configurationRegistry13.registerConfiguration({
  id: "chatSidebar",
  title: localize(10266, null),
  type: "object",
  properties: {
    "chat.experimentalSessionsWindowOverride": {
      type: "boolean",
      description: localize(10084, null),
      default: false,
      tags: ["experimental"],
      agentsWindow: { default: true }
    },
    "chat.fontSize": {
      type: "number",
      description: localize(10089, null),
      default: 13,
      minimum: 6,
      maximum: 100
    },
    "chat.fontFamily": {
      type: "string",
      description: localize(10088, null),
      default: "default"
    },
    "dictation.enabled": {
      type: "boolean",
      markdownDescription: localize(10246, null),
      default: true,
      tags: ["experimental"],
      policy: {
        name: "DictationEnabled",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.131",
        localization: {
          description: {
            key: "dictation.enabled.policy",
            value: localize(10247, null)
          }
        }
      }
    },
    "dictation.model": {
      type: "string",
      enum: [
        DEFAULT_LOCAL_TRANSCRIPTION_MODEL,
        "mai"
      ],
      enumItemLabels: [
        localize(10256, null),
        localize(10253, null)
      ],
      markdownEnumDescriptions: [
        localize(10255, null),
        localize(10252, null)
      ],
      markdownDescription: localize(10251, null),
      default: DEFAULT_LOCAL_TRANSCRIPTION_MODEL,
      tags: ["experimental"],
      experiment: { mode: "auto" },
      policy: {
        name: "DictationModel",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.136",
        localization: {
          description: {
            key: "dictation.model.policy",
            value: localize(10258, null)
          },
          enumDescriptions: [
            {
              key: "dictation.model.nemotronMultilingual.policy",
              value: localize(10257, null)
            },
            {
              key: "dictation.model.mai.policy",
              value: localize(10254, null)
            }
          ]
        }
      }
    },
    ["dictation.showTranscript" /* ShowTranscript */]: {
      type: "boolean",
      markdownDescription: localize(10260, null),
      default: true,
      tags: ["experimental"]
    },
    ["dictation.showButton" /* ShowButton */]: {
      type: "boolean",
      markdownDescription: localize(10259, null),
      default: true,
      tags: ["experimental"]
    },
    "dictation.experimental.llmCleanup": {
      type: "boolean",
      markdownDescription: localize(10248, null, CONFIGURE_DICTATION_INSTRUCTIONS_ACTION_ID),
      default: true,
      tags: ["experimental"],
      policy: {
        name: "DictationLLMCleanup",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.136",
        localization: {
          description: {
            key: "dictation.experimental.llmCleanup.policy",
            value: localize(10249, null)
          }
        }
      }
    },
    "dictation.experimental.llmCleanupModel": {
      type: "string",
      enum: ["auto", "copilot-utility-small", "gpt-5.4-nano", "gpt-5.6-luna"],
      markdownDescription: localize(10250, null),
      default: "auto",
      tags: ["experimental"]
    },
    "chat.editor.fontSize": {
      type: "number",
      description: localize(10262, null),
      default: isMacintosh ? 12 : 14
    },
    "chat.editor.fontFamily": {
      type: "string",
      description: localize(10261, null),
      default: "default"
    },
    "chat.editor.fontWeight": {
      type: "string",
      description: localize(10263, null),
      default: "default"
    },
    "chat.editor.wordWrap": {
      type: "string",
      description: localize(10265, null),
      default: "off",
      enum: ["on", "off"]
    },
    "chat.editor.lineHeight": {
      type: "number",
      description: localize(10264, null),
      default: 0
    },
    ["chat.agentsControl.enabled" /* AgentStatusEnabled */]: {
      type: "string",
      enum: ["hidden", "badge", "compact"],
      enumDescriptions: [
        localize(9985, null),
        localize(9982, null),
        localize(9983, null)
      ],
      markdownDescription: localize(9984, null, "`#window.commandCenter#`", "`#chat.viewSessions.enabled#`"),
      default: "compact",
      tags: ["experimental"]
    },
    ["chat.unifiedAgentsBar.enabled" /* UnifiedAgentsBar */]: {
      type: "boolean",
      markdownDescription: localize(10214, null),
      default: false,
      tags: ["experimental"]
    },
    ["chat.agentSessionProjection.enabled" /* AgentSessionProjectionEnabled */]: {
      type: "boolean",
      markdownDescription: localize(9986, null),
      default: false,
      tags: ["experimental"]
    },
    ["chat.agentSessions.migrateLegacyCopilotCli" /* MigrateLegacyCopilotCliSessions */]: {
      type: "boolean",
      markdownDescription: localize(9987, null),
      default: false,
      tags: ["experimental"],
      // Migration is a global, one-time behavior over the shared agent host, so it is a
      // single value for all windows rather than a per-window preference.
      scope: 1 /* APPLICATION */,
      experiment: {
        mode: "startup"
      },
      agentHost: { key: AgentHostMigrateLegacyCopilotCliEnabledConfigKey }
    },
    ["chat.agentSessions.showExternal" /* ShowExternalAgentSessions */]: {
      type: "string",
      enum: ["none" /* None */, "recent" /* Recent */, "last24Hours" /* Last24Hours */, "last7Days" /* Last7Days */, "last30Days" /* Last30Days */],
      enumDescriptions: [
        localize(9992, null),
        localize(9993, null),
        localize(9989, null),
        localize(9991, null),
        localize(9990, null)
      ],
      default: "recent" /* Recent */,
      markdownDescription: localize(9988, null),
      tags: ["experimental"],
      experiment: { mode: "auto" },
      agentHost: { key: AgentHostShowExternalSessionsConfigKey }
    },
    ["chat.saveBeforeSend" /* SaveBeforeSend */]: {
      type: "boolean",
      description: localize(10186, null),
      default: true
    },
    "chat.implicitContext.enabled": {
      type: "object",
      description: localize(10096, null),
      additionalProperties: {
        type: "string",
        enum: ["never", "first", "always"],
        description: localize(10099, null),
        enumDescriptions: [
          localize(10102, null),
          localize(10101, null),
          localize(10100, null)
        ]
      },
      default: {
        "panel": "always"
      },
      tags: ["experimental"],
      experiment: {
        mode: "startup"
      },
      agentsWindow: { default: { "panel": "never" } }
    },
    "chat.implicitContext.suggestedContext": {
      type: "boolean",
      markdownDescription: localize(10098, null),
      default: true,
      agentsWindow: { default: false }
    },
    "chat.implicitContext.includeActiveEditor": {
      type: "boolean",
      markdownDescription: localize(10097, null),
      default: true,
      tags: ["experimental"],
      agentsWindow: { default: false }
    },
    "chat.editing.autoAcceptDelay": {
      type: "number",
      markdownDescription: localize(10052, null),
      default: 0,
      minimum: 0,
      maximum: 100
    },
    "chat.editing.confirmEditRequestRemoval": {
      type: "boolean",
      scope: 1 /* APPLICATION */,
      markdownDescription: localize(10053, null),
      default: true
    },
    "chat.editing.confirmEditRequestRetry": {
      type: "boolean",
      scope: 1 /* APPLICATION */,
      markdownDescription: localize(10054, null),
      default: true
    },
    "chat.editing.explainChanges.enabled": {
      type: "boolean",
      markdownDescription: localize(10055, null),
      default: false,
      tags: ["experimental"],
      experiment: {
        mode: "auto"
      }
    },
    ["chat.editing.revealNextChangeOnResolve" /* RevealNextChangeOnResolve */]: {
      type: "boolean",
      markdownDescription: localize(10057, null),
      default: true
    },
    ["chat.editing.openChangedFileInDiffEditor" /* OpenChangedFileInDiffEditor */]: {
      type: "boolean",
      markdownDescription: localize(10056, null),
      default: true
    },
    "chat.tips.enabled": {
      type: "boolean",
      scope: 1 /* APPLICATION */,
      description: localize(10194, null),
      default: true
    },
    "chat.upvoteAnimation": {
      type: "string",
      enum: ["off", "confetti", "floatingThumbs", "pulseWave", "radiantLines"],
      enumDescriptions: [
        localize(10218, null),
        localize(10216, null),
        localize(10217, null),
        localize(10219, null),
        localize(10220, null)
      ],
      description: localize(10215, null),
      default: "floatingThumbs"
    },
    "chat.experimental.detectParticipant.enabled": {
      type: "boolean",
      deprecationMessage: localize(10064, null),
      description: localize(10063, null),
      default: null
    },
    ["chat.experimental.incrementalRendering.enabled" /* IncrementalRendering */]: {
      type: "boolean",
      description: localize(10077, null),
      default: false,
      tags: ["experimental"]
    },
    ["chat.experimental.richLinks.enabled" /* RichLinks */]: {
      type: "boolean",
      description: localize(10079, null),
      default: false,
      tags: ["experimental"],
      experiment: { mode: "auto" }
    },
    ["chat.experimental.incrementalRendering.animationStyle" /* IncrementalRenderingStyle */]: {
      type: "string",
      enum: ["none", "fade", "rise", "blur", "scale", "slide", "reveal"],
      enumDescriptions: [
        localize(10068, null),
        localize(10067, null),
        localize(10070, null),
        localize(10066, null),
        localize(10071, null),
        localize(10072, null),
        localize(10069, null)
      ],
      description: localize(10065, null),
      default: "fade",
      tags: ["experimental"]
    },
    ["chat.experimental.incrementalRendering.buffering" /* IncrementalRenderingBuffering */]: {
      type: "string",
      enum: ["off", "word", "paragraph"],
      enumDescriptions: [
        localize(10074, null),
        localize(10076, null),
        localize(10075, null)
      ],
      description: localize(10073, null),
      default: "word",
      tags: ["experimental"]
    },
    ["chat.agent.collapseCompletedResponses" /* CollapseCompletedResponses */]: {
      type: "boolean",
      description: localize(9934, null),
      default: true
    },
    "chat.detectParticipant.enabled": {
      type: "boolean",
      description: localize(10050, null),
      default: true
    },
    ["chat.experimental.stickyScroll.enabled" /* ExperimentalStickyScrollEnabled */]: {
      type: "boolean",
      description: localize(10083, null),
      default: true,
      tags: ["experimental"]
    },
    ["chat.inlineReferences.style" /* InlineReferencesStyle */]: {
      type: "string",
      enum: ["box", "link"],
      enumDescriptions: [
        localize(10109, null),
        localize(10110, null)
      ],
      description: localize(10108, null),
      default: "box"
    },
    ["chat.editorAssociations" /* EditorAssociations */]: {
      type: "object",
      markdownDescription: localize(10059, null),
      additionalProperties: {
        type: "string"
      },
      default: {}
    },
    ["chat.notifyWindowOnConfirmation" /* NotifyWindowOnConfirmation */]: {
      type: "string",
      enum: ["off", "windowNotFocused", "always"],
      enumDescriptions: [
        localize(10152, null),
        localize(10153, null),
        localize(10151, null)
      ],
      description: localize(10150, null),
      default: "windowNotFocused"
    },
    ["chat.autoReply" /* AutoReply */]: {
      default: false,
      markdownDescription: localize(10016, null),
      type: "boolean",
      scope: 3 /* APPLICATION_MACHINE */,
      tags: ["experimental", "advanced"],
      agentHost: { key: AgentHostAutoReplyEnabledConfigKey }
    },
    ["chat.defaultConfiguration" /* DefaultConfiguration */]: {
      type: "object",
      additionalProperties: false,
      properties: {
        mode: {
          type: "string",
          enum: ["interactive", "plan"],
          enumDescriptions: [
            localize(10045, null),
            localize(10046, null)
          ],
          default: "interactive",
          description: localize(10044, null)
        }
      },
      default: { mode: "interactive" },
      markdownDescription: localize(10047, null)
    },
    ["chat.defaultModel" /* DefaultModel */]: {
      type: "string",
      default: "",
      markdownDescription: localize(10048, null),
      experiment: {
        mode: "auto"
      },
      policy: {
        name: "ChatDefaultModel",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.127",
        value: managedModelValue(),
        managedSettings: {
          [COPILOT_MODEL_KEY]: { type: "string" },
          [COPILOT_TOP_LEVEL_MODEL_KEY]: { type: "string" }
        },
        localization: {
          description: {
            key: "chat.defaultModel.policy",
            value: localize(10049, null)
          }
        }
      }
    },
    ["chat.sessionSync.enabled" /* SessionSyncEnabled */]: {
      default: false,
      markdownDescription: localize(10187, null),
      type: "boolean",
      tags: ["experimental"],
      experiment: {
        mode: "auto"
      },
      policy: {
        name: "CopilotSessionSync",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.121",
        value: (policyData) => policyData.cloud_session_storage_enabled === false ? false : void 0,
        localization: {
          description: {
            key: "chat.sessionSync.enabled.policy",
            value: localize(10188, null)
          }
        }
      },
      agentHost: { key: AgentHostSessionSyncEnabledConfigKey }
    },
    ["chat.sessionSync.excludeRepositories" /* SessionSyncExcludeRepositories */]: {
      type: "array",
      items: { type: "string" },
      default: [],
      markdownDescription: localize(10189, null),
      tags: ["experimental", "advanced"]
    },
    ["chat.tools.edits.autoApprove" /* AutoApproveEdits */]: {
      default: DEFAULT_EDIT_AUTO_APPROVE_PATTERNS,
      markdownDescription: localize(10198, null),
      type: "object",
      additionalProperties: {
        type: "boolean"
      },
      scope: 1 /* APPLICATION */,
      agentHost: {
        key: AgentHostEditAutoApprovePatternsConfigKey,
        transform: mergeChatEditAutoApprovePatterns
      }
    },
    ["chat.tools.urls.autoApprove" /* AutoApprovedUrls */]: {
      default: {
        "https://code.visualstudio.com": true,
        "https://github.com/microsoft/vscode/wiki/*": true
      },
      markdownDescription: localize(10203, null),
      type: "object",
      additionalProperties: {
        oneOf: [
          { type: "boolean" },
          {
            type: "object",
            properties: {
              approveRequest: { type: "boolean" },
              approveResponse: { type: "boolean" }
            }
          }
        ]
      }
    },
    ["chat.tools.eligibleForAutoApproval" /* EligibleForAutoApproval */]: {
      default: {},
      markdownDescription: localize(10202, null),
      type: "object",
      propertyNames: {
        enum: toolReferenceNameEnumValues,
        enumDescriptions: toolReferenceNameEnumDescriptions
      },
      additionalProperties: {
        type: "boolean"
      },
      examples: [
        {
          "fetch": false,
          "runTask": false
        }
      ],
      policy: {
        name: "ChatToolsEligibleForAutoApproval",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.107",
        localization: {
          description: {
            key: "chat.tools.eligibleForAutoApproval",
            value: localize(10202, null)
          }
        }
      }
    },
    ["chat.artifacts.enabled" /* ArtifactsEnabled */]: {
      default: false,
      description: localize(10004, null),
      type: "boolean",
      tags: ["experimental"]
    },
    ["chat.artifacts.rules.byMimeType" /* ArtifactsRulesByMimeType */]: {
      default: {
        "image/*": { groupName: "Screenshots", onlyShowGroup: true }
      },
      description: localize(10011, null),
      type: "object",
      additionalProperties: {
        type: "object",
        properties: {
          groupName: { type: "string", description: localize(10012, null) },
          onlyShowGroup: { type: "boolean", description: localize(10013, null) }
        },
        required: ["groupName"]
      },
      tags: ["experimental"]
    },
    ["chat.artifacts.rules.byFilePath" /* ArtifactsRulesByFilePath */]: {
      default: {
        "**/*plan*.md": { groupName: "Plans" }
      },
      description: localize(10005, null),
      type: "object",
      additionalProperties: {
        type: "object",
        properties: {
          groupName: { type: "string", description: localize(10006, null) },
          onlyShowGroup: { type: "boolean", description: localize(10007, null) }
        },
        required: ["groupName"]
      },
      tags: ["experimental"]
    },
    ["chat.artifacts.rules.byMemoryFilePath" /* ArtifactsRulesByMemoryFilePath */]: {
      default: {
        "**/*plan*.md": { groupName: "Plans" }
      },
      description: localize(10008, null),
      type: "object",
      additionalProperties: {
        type: "object",
        properties: {
          groupName: { type: "string", description: localize(10009, null) },
          onlyShowGroup: { type: "boolean", description: localize(10010, null) }
        },
        required: ["groupName"]
      },
      tags: ["experimental"]
    },
    "chat.undoRequests.restoreInput": {
      default: true,
      markdownDescription: localize(10213, null),
      type: "boolean"
    },
    "chat.editRequests": {
      markdownDescription: localize(10060, null),
      type: "string",
      enum: ["inline", "hover", "input", "none"],
      default: "inline"
    },
    ["chat.pasteAsAttachmentThreshold" /* PasteAsAttachmentThreshold */]: {
      markdownDescription: localize(10158, null),
      type: "number",
      minimum: 0,
      default: 1e4
    },
    ["chat.viewSessions.enabled" /* ChatViewSessionsEnabled */]: {
      type: "boolean",
      default: true,
      description: localize(10241, null),
      agentsWindow: { default: false }
    },
    ["chat.viewSessions.orientation" /* ChatViewSessionsOrientation */]: {
      type: "string",
      enum: ["stacked", "sideBySide"],
      enumDescriptions: [
        localize(10244, null),
        localize(10243, null)
      ],
      default: "sideBySide",
      description: localize(10242, null)
    },
    ["chat.viewProgressBadge.enabled" /* ChatViewProgressBadgeEnabled */]: {
      type: "boolean",
      default: false,
      description: localize(10240, null)
    },
    [ChatSessionArchiveActionWordingSettingId]: {
      type: "string",
      enum: ["archive", "done"],
      enumDescriptions: [
        localize(10081, null),
        localize(10082, null)
      ],
      default: "archive",
      tags: ["experimental"],
      experiment: { mode: "startup" },
      description: localize(10080, null)
    },
    ["chat.agentsHandoffTip.mode" /* AgentsHandoffTipMode */]: {
      type: "string",
      enum: ["hidden", "default", "custom"],
      enumDescriptions: [
        localize(9997, null),
        localize(9996, null),
        localize(9995, null)
      ],
      default: "hidden",
      tags: ["experimental"],
      experiment: { mode: "startup" },
      description: localize(9994, null)
    },
    [CodexPreferAgentHostEditorSettingId]: {
      type: "boolean",
      markdownDescription: localize(10058, null),
      default: false,
      tags: ["experimental"],
      experiment: { mode: "startup" }
    },
    ["chat.contextUsage.enabled" /* ChatContextUsageEnabled */]: {
      type: "boolean",
      default: true,
      description: localize(10027, null)
    },
    ["chat.verbose" /* Verbose */]: {
      type: "boolean",
      default: true,
      description: localize(10239, null)
    },
    ["chat.progressBorder.enabled" /* ProgressBorder */]: {
      type: "boolean",
      default: true,
      markdownDescription: localize(10176, null)
    },
    ["chat.notifyWindowOnResponseReceived" /* NotifyWindowOnResponseReceived */]: {
      type: "string",
      enum: ["off", "windowNotFocused", "always"],
      enumDescriptions: [
        localize(10156, null),
        localize(10157, null),
        localize(10155, null)
      ],
      default: "windowNotFocused",
      description: localize(10154, null)
    },
    "chat.checkpoints.enabled": {
      type: "boolean",
      default: true,
      description: localize(10024, null)
    },
    "chat.checkpoints.showFileChanges": {
      type: "boolean",
      description: localize(10025, null),
      default: false
    },
    ["chat.turnStatusPills" /* TurnStatusPills */]: {
      anyOf: [
        {
          type: "boolean"
        },
        {
          type: "object",
          properties: {
            changes: {
              type: "boolean",
              default: false,
              description: localize(10210, null)
            },
            preview: {
              type: "boolean",
              default: false,
              description: localize(10212, null)
            },
            browser: {
              type: "boolean",
              default: false,
              description: localize(10209, null)
            }
          },
          additionalProperties: false,
          deprecationMessage: localize(10211, null)
        }
      ],
      markdownDescription: localize(10208, null),
      default: true
    },
    [mcpAccessConfig]: {
      type: "string",
      description: localize(10115, null),
      enum: [
        "none" /* None */,
        "registry" /* Registry */,
        "all" /* All */
      ],
      enumDescriptions: [
        localize(10117, null),
        localize(10118, null),
        localize(10116, null)
      ],
      default: "all" /* All */,
      policy: {
        name: "ChatMCP",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.99",
        value: (policyData) => {
          if (policyData.mcp === false) {
            return "none" /* None */;
          }
          if (policyData.mcpAccess === "registry_only") {
            return "registry" /* Registry */;
          }
          return void 0;
        },
        localization: {
          description: {
            key: "chat.mcp.access",
            value: localize(10115, null)
          },
          enumDescriptions: [
            {
              key: "chat.mcp.access.none",
              value: localize(10117, null)
            },
            {
              key: "chat.mcp.access.registry",
              value: localize(10118, null)
            },
            {
              key: "chat.mcp.access.any",
              value: localize(10116, null)
            }
          ]
        }
      }
    },
    [mcpAllowedServersConfig]: {
      type: ["array", "null"],
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          serverName: { type: "string", minLength: 1, description: localize(10122, null) },
          serverUrl: { type: "string", minLength: 1, description: localize(10123, null) },
          serverCommand: { type: "array", minItems: 1, items: { type: "string" }, description: localize(10121, null) }
        },
        oneOf: [
          { required: ["serverName"] },
          { required: ["serverUrl"] },
          { required: ["serverCommand"] }
        ]
      },
      markdownDescription: localize(10119, null),
      default: null,
      scope: 1 /* APPLICATION */,
      // Governance-only: delivered via the `ChatAllowedMcpServers` enterprise policy and hidden
      // from the Settings UI so it is not configurable by end users.
      included: false,
      policy: {
        name: "ChatAllowedMcpServers",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.130",
        value: managedSettingValue(COPILOT_ALLOWED_MCP_SERVERS_KEY),
        managedSettings: {
          [COPILOT_ALLOWED_MCP_SERVERS_KEY]: { type: "string" }
        },
        localization: {
          description: {
            key: "chat.mcp.allowedServers.policy",
            value: localize(10120, null)
          }
        }
      }
    },
    [mcpDeniedServersConfig]: {
      type: ["array", "null"],
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          serverName: { type: "string", minLength: 1, description: localize(10137, null) },
          serverUrl: { type: "string", minLength: 1, description: localize(10138, null) },
          serverCommand: { type: "array", minItems: 1, items: { type: "string" }, description: localize(10136, null) }
        },
        oneOf: [
          { required: ["serverName"] },
          { required: ["serverUrl"] },
          { required: ["serverCommand"] }
        ]
      },
      markdownDescription: localize(10134, null),
      default: null,
      scope: 1 /* APPLICATION */,
      // Governance-only: delivered via the `ChatDeniedMcpServers` enterprise policy and hidden
      // from the Settings UI so it is not configurable by end users.
      included: false,
      policy: {
        name: "ChatDeniedMcpServers",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.130",
        value: managedSettingValue(COPILOT_DENIED_MCP_SERVERS_KEY),
        managedSettings: {
          [COPILOT_DENIED_MCP_SERVERS_KEY]: { type: "string" }
        },
        localization: {
          description: {
            key: "chat.mcp.deniedServers.policy",
            value: localize(10135, null)
          }
        }
      }
    },
    [COPILOT_ALLOW_MANAGED_MCP_SERVERS_ONLY_CONFIG]: {
      type: "boolean",
      default: false,
      scope: 1 /* APPLICATION */,
      included: false,
      description: localize(10124, null),
      policy: {
        name: "ChatAllowManagedMcpServersOnly",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.132",
        value: managedSettingValue(COPILOT_ALLOW_MANAGED_MCP_SERVERS_ONLY_KEY),
        managedSettings: {
          [COPILOT_ALLOW_MANAGED_MCP_SERVERS_ONLY_KEY]: { type: "boolean" }
        },
        localization: {
          description: {
            key: "chat.mcp.allowManagedServersOnly.policy",
            value: localize(10125, null)
          }
        }
      }
    },
    [mcpAutoStartConfig]: {
      type: "string",
      description: localize(10127, null),
      default: "never" /* Never */,
      enum: [
        "never" /* Never */,
        "onlyNew" /* OnlyNew */,
        "newAndOutdated" /* NewAndOutdated */
      ],
      enumDescriptions: [
        localize(10128, null),
        localize(10130, null),
        localize(10129, null)
      ],
      tags: ["experimental"]
    },
    // OpenCode: MCP 守护参数
    "chat.mcp.autostartWaitSeconds": {
      type: "number",
      description: "自动连接 MCP 开启时，发送消息前最多等待正在启动的 MCP 服务器多少秒；超时后照常发送已连接服务器的工具。",
      default: 8,
      minimum: 0,
      maximum: 120
    },
    "chat.mcp.autostartHeartbeatSeconds": {
      type: "number",
      description: "自动连接 MCP 开启时，每隔多少秒 ping 一次已连接的 MCP 服务器；连续 2 次 5 秒内无响应即强制重启。",
      default: 30,
      minimum: 10,
      maximum: 600
    },
    [mcpAppsEnabledConfig]: {
      type: "boolean",
      description: localize(10144, null),
      default: true,
      tags: ["experimental"]
    },
    [mcpEnterpriseManagedAuthIdpSection]: {
      type: "object",
      default: {},
      scope: 1 /* APPLICATION */,
      tags: ["preview", "experimental"],
      additionalProperties: false,
      included: false,
      properties: {
        issuer: {
          type: "string",
          format: "uri",
          markdownDescription: localize(10271, null)
        },
        clientId: {
          type: "string",
          markdownDescription: localize(10269, null)
        },
        clientSecret: {
          type: "string",
          markdownDescription: localize(10270, null)
        }
      },
      markdownDescription: localize(10268, null),
      policy: {
        name: "McpEnterpriseManagedAuthIdp",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.122",
        localization: {
          description: {
            key: "mcp.enterpriseManagedAuth.idp.policy",
            value: localize(10272, null)
          }
        }
      }
    },
    [mcpServerCollisionBehaviorSection]: {
      type: "string",
      description: localize(10131, null),
      enum: [
        "disable" /* Disable */,
        "suffix" /* Suffix */
      ],
      enumDescriptions: [
        localize(10132, null),
        localize(10133, null)
      ],
      default: "disable" /* Disable */
    },
    [mcpServerSamplingSection]: {
      type: "object",
      description: localize(10140, null, "MCP: " + localize(10274, null)),
      scope: 5 /* RESOURCE */,
      additionalProperties: {
        type: "object",
        properties: {
          allowedDuringChat: {
            type: "boolean",
            description: localize(10141, null),
            default: true
          },
          allowedOutsideChat: {
            type: "boolean",
            description: localize(10142, null),
            default: false
          },
          allowedModels: {
            type: "array",
            items: {
              type: "string",
              description: localize(10143, null)
            }
          }
        }
      }
    },
    [AssistedTypes[4 /* NuGetPackage */].enabledConfigKey]: {
      type: "boolean",
      description: localize(10126, null),
      default: false,
      tags: ["experimental"],
      experiment: {
        mode: "startup"
      }
    },
    ["chat.extensionTools.enabled" /* ExtensionToolsEnabled */]: {
      type: "boolean",
      description: localize(10086, null),
      default: true,
      policy: {
        name: "ChatAgentExtensionTools",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.99",
        localization: {
          description: {
            key: "chat.extensionToolsEnabled",
            value: localize(10086, null)
          }
        }
      }
    },
    ["chat.plugins.enabled" /* PluginsEnabled */]: {
      type: "boolean",
      description: localize(10168, null),
      default: true,
      policy: {
        name: "ChatPluginsEnabled",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.116",
        localization: {
          description: {
            key: "chat.plugins.enabled",
            value: localize(10168, null)
          }
        }
      }
    },
    ["chat.pluginLocations" /* PluginLocations */]: {
      type: "object",
      additionalProperties: { type: "boolean" },
      restricted: true,
      markdownDescription: localize(10167, null),
      scope: 2 /* MACHINE */,
      tags: ["experimental"]
    },
    ["chat.plugins.enabledPlugins" /* EnabledPlugins */]: {
      type: "object",
      additionalProperties: { type: "boolean" },
      markdownDescription: localize(10169, null, `\`#${"chat.pluginLocations" /* PluginLocations */}#\``, `\`#${"chat.plugins.marketplaces" /* PluginMarketplaces */}#\``),
      scope: 1 /* APPLICATION */,
      policy: {
        name: "ChatEnabledPlugins",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.122",
        value: managedSettingValue(COPILOT_ENABLED_PLUGINS_KEY),
        managedSettings: {
          [COPILOT_ENABLED_PLUGINS_KEY]: { type: "string" }
        },
        localization: {
          description: {
            key: "chat.plugins.enabledPlugins.policy",
            value: localize(10170, null)
          }
        }
      }
    },
    ["chat.plugins.marketplaces" /* PluginMarketplaces */]: {
      type: "array",
      items: {
        type: "string"
      },
      markdownDescription: localize(10173, null),
      default: ["github/copilot-plugins", "github/awesome-copilot#marketplace"],
      scope: 1 /* APPLICATION */,
      tags: ["experimental"]
    },
    ["chat.plugins.extraMarketplaces" /* ExtraMarketplaces */]: {
      // Policy-only delivery slot for enterprise-managed marketplace entries (via the
      // `ChatExtraMarketplaces` policy). Consumers union this with `chat.plugins.marketplaces`.
      //
      // Stored as a named string map. Explicit update overrides are JSON-encoded
      // inside the value string so the Settings Editor can use its inline object renderer.
      // This ensures:
      //   - The Settings Editor (ComplexObject renderer) can display entries inline when
      //     managed by policy, rather than only showing "Edit in settings.json".
      //   - Marketplace names are preserved for `enabledPlugins["plugin@<name>"]` resolution.
      //
      type: "object",
      additionalProperties: { type: ["string"] },
      default: {},
      scope: 1 /* APPLICATION */,
      included: false,
      markdownDescription: localize(10171, null, `\`#${"chat.plugins.marketplaces" /* PluginMarketplaces */}#\``, "`#extensions.autoUpdate#`"),
      policy: {
        name: "ChatExtraMarketplaces",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.122",
        value: managedSettingValue(COPILOT_EXTRA_MARKETPLACES_KEY),
        managedSettings: {
          [COPILOT_EXTRA_MARKETPLACES_KEY]: { type: "string" }
        },
        localization: {
          description: {
            key: "chat.plugins.extraMarketplaces.policy",
            value: localize(10172, null)
          }
        }
      }
    },
    ["chat.plugins.strictMarketplaces" /* StrictMarketplaces */]: {
      type: ["array", "null"],
      items: {
        type: "object",
        properties: {
          source: {
            type: "string",
            enum: ["github", "git", "url", "npm", "file", "directory", "hostPattern", "pathPattern"]
          },
          repo: { type: "string" },
          url: { type: "string" },
          ref: { type: "string" },
          path: { type: "string" },
          package: { type: "string" },
          hostPattern: { type: "string" },
          pathPattern: { type: "string" },
          headers: { type: "object", additionalProperties: { type: "string" } }
        },
        required: ["source"]
      },
      markdownDescription: localize(10174, null),
      default: null,
      restricted: true,
      scope: 1 /* APPLICATION */,
      tags: ["experimental"],
      policy: {
        name: "ChatStrictMarketplaces",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.122",
        value: managedSettingValue(COPILOT_STRICT_MARKETPLACES_KEY),
        managedSettings: {
          [COPILOT_STRICT_MARKETPLACES_KEY]: { type: "string" }
        },
        localization: {
          description: {
            key: "chat.plugins.strictMarketplaces.policy",
            value: localize(10175, null)
          }
        }
      }
    },
    [COPILOT_STRICT_PLUGIN_ONLY_CUSTOMIZATION_CONFIG]: {
      type: "boolean",
      default: false,
      scope: 1 /* APPLICATION */,
      included: false,
      description: localize(10035, null),
      policy: {
        name: "ChatStrictPluginOnlyCustomization",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.132",
        value: managedSettingValue(COPILOT_STRICT_PLUGIN_ONLY_CUSTOMIZATION_KEY),
        managedSettings: {
          [COPILOT_STRICT_PLUGIN_ONLY_CUSTOMIZATION_KEY]: { type: "boolean" }
        },
        localization: {
          description: {
            key: "chat.customizations.strictPluginOnlyCustomization.policy",
            value: localize(10036, null)
          }
        }
      }
    },
    [COPILOT_ALLOW_MANAGED_HOOKS_ONLY_CONFIG]: {
      type: "boolean",
      default: false,
      scope: 1 /* APPLICATION */,
      included: false,
      description: localize(10094, null),
      policy: {
        name: "ChatAllowManagedHooksOnly",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.132",
        value: managedSettingValue(COPILOT_ALLOW_MANAGED_HOOKS_ONLY_KEY),
        managedSettings: {
          [COPILOT_ALLOW_MANAGED_HOOKS_ONLY_KEY]: { type: "boolean" }
        },
        localization: {
          description: {
            key: "chat.hooks.allowManagedOnly.policy",
            value: localize(10095, null)
          }
        }
      }
    },
    ["chat.agent.enabled" /* AgentEnabled */]: {
      type: "boolean",
      description: localize(9936, null),
      default: true,
      order: 1,
      policy: {
        name: "ChatAgentMode",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.99",
        value: (policyData) => policyData.chat_agent_enabled === false ? false : void 0,
        localization: {
          description: {
            key: "chat.agent.enabled.description",
            value: localize(9936, null)
          }
        }
      }
    },
    ["chat.agent.networkFilter" /* NetworkFilter */]: {
      markdownDescription: localize(9938, null, `\`#${"chat.agent.allowedNetworkDomains" /* AllowedNetworkDomains */}#\``, `\`#${"chat.agent.deniedNetworkDomains" /* DeniedNetworkDomains */}#\``, `\`#${"chat.agent.sandbox.enabled" /* AgentSandboxEnabled */}#\``),
      type: "boolean",
      default: false,
      restricted: true,
      policy: {
        name: "ChatAgentNetworkFilter",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.116",
        localization: {
          description: {
            key: "chat.agent.networkFilter",
            value: localize(9938, null, `\`#${"chat.agent.allowedNetworkDomains" /* AllowedNetworkDomains */}#\``, `\`#${"chat.agent.deniedNetworkDomains" /* DeniedNetworkDomains */}#\``, `\`#${"chat.agent.sandbox.enabled" /* AgentSandboxEnabled */}#\``)
          }
        }
      }
    },
    ["chat.agent.allowedNetworkDomains" /* AllowedNetworkDomains */]: {
      markdownDescription: localize(9933, null, `\`#${"chat.agent.networkFilter" /* NetworkFilter */}#\``, `\`#${"chat.agent.sandbox.enabled" /* AgentSandboxEnabled */}#\``, `\`#${"chat.agent.sandbox.allowNetwork" /* AgentSandboxAllowNetwork */}#\``, "`*.example.com`", `\`#${"chat.agent.deniedNetworkDomains" /* DeniedNetworkDomains */}#\``),
      type: "array",
      items: { type: "string" },
      default: [],
      restricted: true,
      policy: {
        name: "ChatAgentAllowedNetworkDomains",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.116",
        localization: {
          description: {
            key: "chat.agent.allowedNetworkDomains",
            value: localize(9933, null, `\`#${"chat.agent.networkFilter" /* NetworkFilter */}#\``, `\`#${"chat.agent.sandbox.enabled" /* AgentSandboxEnabled */}#\``, `\`#${"chat.agent.sandbox.allowNetwork" /* AgentSandboxAllowNetwork */}#\``, "`*.example.com`", `\`#${"chat.agent.deniedNetworkDomains" /* DeniedNetworkDomains */}#\``)
          }
        }
      }
    },
    ["chat.agent.deniedNetworkDomains" /* DeniedNetworkDomains */]: {
      markdownDescription: localize(9935, null, `\`#${"chat.agent.networkFilter" /* NetworkFilter */}#\``, `\`#${"chat.agent.sandbox.enabled" /* AgentSandboxEnabled */}#\``, `\`#${"chat.agent.sandbox.allowNetwork" /* AgentSandboxAllowNetwork */}#\``, `\`#${"chat.agent.allowedNetworkDomains" /* AllowedNetworkDomains */}#\``, "`*.example.com`"),
      type: "array",
      items: { type: "string" },
      default: [],
      restricted: true,
      policy: {
        name: "ChatAgentDeniedNetworkDomains",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.116",
        localization: {
          description: {
            key: "chat.agent.deniedNetworkDomains",
            value: localize(9935, null, `\`#${"chat.agent.networkFilter" /* NetworkFilter */}#\``, `\`#${"chat.agent.sandbox.enabled" /* AgentSandboxEnabled */}#\``, `\`#${"chat.agent.sandbox.allowNetwork" /* AgentSandboxAllowNetwork */}#\``, `\`#${"chat.agent.allowedNetworkDomains" /* AllowedNetworkDomains */}#\``, "`*.example.com`")
          }
        }
      }
    },
    ["chat.newSession.defaultMode" /* DefaultNewSessionMode */]: {
      type: "string",
      description: localize(10149, null),
      default: ""
    },
    [AgentHostAhpJsonlLoggingSettingId]: {
      type: "boolean",
      description: localize(9954, null),
      default: product_default.quality !== "stable",
      tags: ["experimental", "advanced"]
    },
    [AgentHostAgentDebugLogEnabledSettingId]: {
      type: "boolean",
      markdownDescription: localize(9952, null),
      default: false,
      tags: ["experimental", "advanced"],
      experiment: {
        mode: "startup"
      }
    },
    [AgentHostAgentDebugLogMaxEventsSettingId]: {
      type: "number",
      minimum: 10,
      markdownDescription: localize(9953, null),
      default: 1e4,
      tags: ["experimental", "advanced"],
      experiment: {
        mode: "startup"
      }
    },
    [AgentHostCustomTerminalToolEnabledSettingId]: {
      type: "boolean",
      description: localize(9969, null),
      default: false,
      tags: ["experimental", "advanced"]
    },
    [AgentHostCopilotSdkLogLevelSettingId]: {
      type: "string",
      enum: [...copilotSdkLogLevelSettingValues],
      enumDescriptions: [
        localize(9967, null),
        localize(9968, null)
      ],
      markdownDescription: localize(9966, null),
      default: "info",
      scope: 1 /* APPLICATION */,
      tags: ["experimental", "advanced"]
    },
    [AgentHostMapLegacySettingsToManagedSettingsSettingId]: {
      type: "boolean",
      markdownDescription: localize(9956, null),
      default: false,
      scope: 3 /* APPLICATION_MACHINE */,
      tags: ["experimental", "advanced"]
    },
    [AgentHostOpus48PromptEnabledSettingId]: {
      type: "boolean",
      description: localize(9970, null),
      default: false,
      tags: ["experimental", "advanced"]
    },
    [AgentHostToolSearchEnabledSettingId]: {
      type: "boolean",
      description: localize(9965, null),
      default: true,
      tags: ["experimental", "advanced"]
    },
    [AgentHostToolSearchDeferThresholdSettingId]: {
      type: "number",
      description: localize(9964, null),
      default: 1,
      minimum: 0,
      tags: ["experimental", "advanced"]
    },
    [CopilotSemanticSearchEnabledSettingId]: {
      type: "boolean",
      description: localize(10028, null),
      default: false,
      tags: ["experimental", "advanced"]
    },
    [AgentHostReasoningEffortOverrideSettingId]: {
      type: "string",
      markdownDescription: localize(9971, null),
      default: "",
      tags: ["experimental", "advanced"]
    },
    [AgentHostReasoningSummaryEnabledSettingId]: {
      type: "boolean",
      markdownDescription: localize(9972, null),
      default: false,
      experiment: { mode: "startup" },
      tags: ["experimental", "advanced"]
    },
    [AgentHostMultiTurnContextRoutingEnabledSettingId]: {
      type: "boolean",
      markdownDescription: localize(9963, null),
      default: false,
      experiment: { mode: "startup" },
      tags: ["experimental", "advanced"]
    },
    [CopilotSubagentModelGuidanceEnabledSettingId]: {
      type: "boolean",
      markdownDescription: localize(10029, null),
      default: false,
      experiment: { mode: "startup" },
      tags: ["experimental", "advanced"]
    },
    [AgentHostCopilotModelCapabilityOverridesSettingId]: {
      type: "object",
      markdownDescription: localize(9957, null),
      additionalProperties: {
        type: "object",
        properties: {
          family: {
            type: "string",
            description: localize(9960, null)
          },
          reasoningEffort: {
            type: "string",
            enum: [...reasoningEffortLevels],
            description: localize(9962, null)
          },
          availableTools: {
            type: "array",
            items: { type: "string" },
            description: localize(9958, null)
          },
          excludedTools: {
            type: "array",
            items: { type: "string" },
            description: localize(9959, null)
          },
          modelCapabilities: {
            type: "object",
            additionalProperties: true,
            description: localize(9961, null)
          }
        }
      },
      default: {},
      scope: 1 /* APPLICATION */,
      tags: ["experimental", "advanced"]
    },
    [AgentHostAllowSignedOutWhenUsableSettingId]: {
      type: "boolean",
      markdownDescription: localize(9955, null),
      default: false,
      scope: 1 /* APPLICATION */,
      tags: ["experimental", "advanced"],
      experiment: { mode: "startup" }
    },
    [ChatMicrosoftAuthenticationEnabledSettingId]: {
      type: "boolean",
      markdownDescription: localize(10145, null),
      default: false,
      scope: 1 /* APPLICATION */,
      tags: ["experimental", "advanced"],
      // Read when a sign-in dialog opens, so `startup` keeps the offered buttons stable for the
      // life of the window instead of changing under a dialog the user already has open.
      experiment: { mode: "startup" }
    },
    [AgentHostSdkSandboxEnabledSettingId]: {
      type: "string",
      enum: ["off" /* Off */, "on" /* On */],
      enumDescriptions: [
        localize(9974, null),
        localize(9975, null)
      ],
      markdownDescription: localize(9973, null),
      default: "off" /* Off */,
      tags: ["experimental", "advanced"],
      experiment: {
        mode: "auto"
      }
    },
    [AgentHostSdkSandboxWindowsEnabledSettingId]: {
      type: "string",
      enum: ["off" /* Off */, "on" /* On */],
      enumDescriptions: [
        localize(9977, null),
        localize(9978, null)
      ],
      markdownDescription: localize(9976, null),
      default: "off" /* Off */,
      tags: ["experimental", "advanced"],
      experiment: {
        mode: "auto"
      }
    },
    ["chat.tools.confirmationCarousel.enabled" /* ToolConfirmationCarousel */]: {
      type: "boolean",
      description: localize(10201, null),
      default: true
    },
    ["chat.tools.riskAssessment.enabled" /* ToolRiskAssessmentEnabled */]: {
      type: "boolean",
      description: localize(10204, null),
      default: true,
      experiment: {
        mode: "auto"
      }
    },
    ["chat.tools.riskAssessment.model" /* ToolRiskAssessmentModel */]: {
      type: "string",
      description: localize(10205, null),
      default: "copilot-utility-small",
      tags: ["experimental", "advanced"],
      experiment: {
        mode: "auto"
      }
    },
    ["chat.planAgent.defaultModel" /* PlanAgentDefaultModel */]: {
      type: "string",
      description: localize(10166, null),
      default: "",
      enum: PlanAgentDefaultModel.modelIds,
      enumItemLabels: PlanAgentDefaultModel.modelLabels,
      markdownEnumDescriptions: PlanAgentDefaultModel.modelDescriptions
    },
    ["chat.exploreAgent.defaultModel" /* ExploreAgentDefaultModel */]: {
      type: "string",
      description: localize(10085, null),
      default: "",
      enum: ExploreAgentDefaultModel.modelIds,
      enumItemLabels: ExploreAgentDefaultModel.modelLabels,
      markdownEnumDescriptions: ExploreAgentDefaultModel.modelDescriptions
    },
    ["chat.byokUtilityModelDefault" /* BYOKUtilityModelDefault */]: {
      type: "string",
      markdownDescription: localize(10019, null, "`#chat.utilityModel#`", "`#chat.utilitySmallModel#`"),
      enum: ["none" /* None */, "mainAgent" /* MainAgent */, "copilot" /* Copilot */],
      enumItemLabels: [
        localize(10023, null),
        localize(10021, null),
        localize(10018, null)
      ],
      markdownEnumDescriptions: [
        localize(10022, null),
        localize(10020, null),
        localize(10017, null)
      ],
      default: "copilot" /* Copilot */
    },
    ["chat.utilityModel" /* UtilityModel */]: {
      type: "string",
      description: localize(10237, null),
      default: "",
      enum: UtilityModelContribution.modelIds,
      enumItemLabels: UtilityModelContribution.modelLabels,
      markdownEnumDescriptions: UtilityModelContribution.modelDescriptions
    },
    ["chat.utilitySmallModel" /* UtilitySmallModel */]: {
      type: "string",
      description: localize(10238, null),
      default: "",
      enum: UtilitySmallModelContribution.modelIds,
      enumItemLabels: UtilitySmallModelContribution.modelLabels,
      markdownEnumDescriptions: UtilitySmallModelContribution.modelDescriptions
    },
    ["chat.requestQueuing.defaultAction" /* RequestQueueingDefaultAction */]: {
      type: "string",
      enum: ["queue", "steer"],
      enumDescriptions: [
        localize(10181, null),
        localize(10182, null)
      ],
      description: localize(10180, null),
      default: "steer"
    },
    ["chat.math.enabled" /* EnableMath */]: {
      type: "boolean",
      description: localize(10114, null),
      default: true
    },
    ["chat.agent.codeBlockProgress" /* ShowCodeBlockProgressAnimation */]: {
      type: "boolean",
      description: localize(10026, null),
      default: true,
      tags: ["experimental"]
    },
    [mcpDiscoverySection]: {
      type: "object",
      properties: Object.fromEntries(allDiscoverySources.map((k) => [k, { type: "boolean", description: discoverySourceSettingsLabel[k] }])),
      additionalProperties: false,
      default: Object.fromEntries(allDiscoverySources.map((k) => [k, false])),
      markdownDescription: localize(10267, null)
    },
    [mcpGalleryServiceEnablementConfig]: {
      type: "boolean",
      default: false,
      tags: ["preview"],
      description: localize(10139, null),
      included: product_default.quality === "stable"
    },
    [mcpGalleryServiceUrlConfig]: {
      type: "string",
      description: localize(10273, null),
      default: "",
      scope: 1 /* APPLICATION */,
      tags: ["usesOnlineServices", "advanced"],
      included: false,
      policy: {
        name: "McpGalleryServiceUrl",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.101",
        value: (policyData) => policyData.mcpRegistryUrl,
        localization: {
          description: {
            key: "mcp.gallery.serviceUrl",
            value: localize(10273, null)
          }
        }
      }
    },
    [PromptsConfig.INSTRUCTIONS_LOCATION_KEY]: {
      type: "object",
      title: localize(
        10112,
        null
      ),
      markdownDescription: localize(
        10111,
        null,
        INSTRUCTION_FILE_EXTENSION,
        INSTRUCTIONS_DOCUMENTATION_URL
      ),
      default: {
        ...DEFAULT_INSTRUCTIONS_SOURCE_FOLDERS.map((folder) => ({ [folder.path]: true })).reduce((acc, curr) => ({ ...acc, ...curr }), {})
      },
      additionalProperties: { type: "boolean" },
      propertyNames: {
        pattern: VALID_PROMPT_FOLDER_PATTERN,
        patternErrorMessage: localize(10113, null)
      },
      restricted: true,
      tags: ["prompts", "reusable prompts", "prompt snippets", "instructions"],
      examples: [
        {
          [DEFAULT_INSTRUCTIONS_SOURCE_FOLDERS[0].path]: true
        },
        {
          [INSTRUCTIONS_DEFAULT_SOURCE_FOLDER]: true,
          "/Users/vscode/repos/instructions": true
        }
      ]
    },
    [PromptsConfig.PROMPT_LOCATIONS_KEY]: {
      type: "object",
      title: localize(
        10185,
        null
      ),
      markdownDescription: localize(
        10184,
        null,
        PROMPT_FILE_EXTENSION,
        PROMPT_DOCUMENTATION_URL
      ),
      default: {
        [PROMPT_DEFAULT_SOURCE_FOLDER]: true
      },
      additionalProperties: { type: "boolean" },
      unevaluatedProperties: { type: "boolean" },
      propertyNames: {
        pattern: VALID_PROMPT_FOLDER_PATTERN,
        patternErrorMessage: localize(10177, null)
      },
      restricted: true,
      tags: ["prompts", "reusable prompts", "prompt snippets", "instructions"],
      examples: [
        {
          [PROMPT_DEFAULT_SOURCE_FOLDER]: true
        },
        {
          [PROMPT_DEFAULT_SOURCE_FOLDER]: true,
          "/Users/vscode/repos/prompts": true
        }
      ]
    },
    [PromptsConfig.MODE_LOCATION_KEY]: {
      type: "object",
      title: localize(
        10148,
        null
      ),
      markdownDescription: localize(
        10147,
        null,
        LEGACY_MODE_FILE_EXTENSION,
        AGENT_DOCUMENTATION_URL
      ),
      default: {
        [LEGACY_MODE_DEFAULT_SOURCE_FOLDER]: true
      },
      deprecationMessage: localize(10146, null),
      additionalProperties: { type: "boolean" },
      unevaluatedProperties: { type: "boolean" },
      restricted: true,
      tags: ["experimental", "prompts", "reusable prompts", "prompt snippets", "instructions"],
      examples: [
        {
          [LEGACY_MODE_DEFAULT_SOURCE_FOLDER]: true
        },
        {
          [LEGACY_MODE_DEFAULT_SOURCE_FOLDER]: true,
          "/Users/vscode/repos/chatmodes": true
        }
      ]
    },
    [PromptsConfig.AGENTS_LOCATION_KEY]: {
      type: "object",
      title: localize(
        9981,
        null
      ),
      markdownDescription: localize(
        9980,
        null,
        AGENT_FILE_EXTENSION,
        AGENT_DOCUMENTATION_URL
      ),
      default: {
        [AGENTS_SOURCE_FOLDER]: true,
        [CLAUDE_AGENTS_SOURCE_FOLDER]: true,
        [COPILOT_USER_AGENTS_SOURCE_FOLDER]: true
      },
      additionalProperties: { type: "boolean" },
      propertyNames: {
        pattern: VALID_PROMPT_FOLDER_PATTERN,
        patternErrorMessage: localize(9979, null)
      },
      restricted: true,
      tags: ["prompts", "reusable prompts", "prompt snippets", "instructions"],
      examples: [
        {
          [AGENTS_SOURCE_FOLDER]: true
        },
        {
          [AGENTS_SOURCE_FOLDER]: true,
          "my-agents": true,
          "../shared-agents": true,
          "~/.copilot/agents": true
        }
      ]
    },
    [PromptsConfig.USE_AGENT_MD]: {
      type: "boolean",
      title: localize(10222, null),
      markdownDescription: localize(10221, null),
      default: true,
      restricted: true,
      disallowConfigurationDefault: true,
      tags: ["prompts", "reusable prompts", "prompt snippets", "instructions"]
    },
    [PromptsConfig.USE_NESTED_AGENT_MD]: {
      type: "boolean",
      title: localize(10234, null),
      markdownDescription: localize(10233, null),
      default: false,
      restricted: true,
      disallowConfigurationDefault: true,
      tags: ["experimental", "prompts", "reusable prompts", "prompt snippets", "instructions"]
    },
    [PromptsConfig.USE_CLAUDE_MD]: {
      type: "boolean",
      title: localize(10228, null),
      markdownDescription: localize(10227, null),
      default: true,
      restricted: true,
      disallowConfigurationDefault: true,
      tags: ["prompts", "reusable prompts", "prompt snippets", "instructions"]
    },
    [PromptsConfig.USE_AGENT_SKILLS]: {
      type: "boolean",
      title: localize(10224, null),
      markdownDescription: localize(10223, null),
      default: true,
      restricted: true,
      disallowConfigurationDefault: true,
      tags: ["prompts", "reusable prompts", "prompt snippets", "instructions"]
    },
    [PromptsConfig.USE_SKILL_ADHERENCE_PROMPT]: {
      type: "boolean",
      title: localize(10236, null),
      markdownDescription: localize(10235, null),
      default: false,
      restricted: true,
      disallowConfigurationDefault: true,
      tags: ["experimental", "prompts", "reusable prompts", "prompt snippets", "instructions"],
      experiment: {
        mode: "auto"
      }
    },
    [PromptsConfig.INCLUDE_APPLYING_INSTRUCTIONS]: {
      type: "boolean",
      title: localize(10104, null),
      markdownDescription: localize(10103, null),
      default: true,
      restricted: true,
      disallowConfigurationDefault: true,
      tags: ["prompts", "reusable prompts", "prompt snippets", "instructions"]
    },
    [PromptsConfig.INCLUDE_REFERENCED_INSTRUCTIONS]: {
      type: "boolean",
      title: localize(10106, null),
      markdownDescription: localize(10105, null),
      default: false,
      restricted: true,
      disallowConfigurationDefault: true,
      tags: ["prompts", "reusable prompts", "prompt snippets", "instructions"]
    },
    [PromptsConfig.USE_CUSTOMIZATIONS_IN_PARENT_REPOS]: {
      type: "boolean",
      title: localize(10230, null),
      markdownDescription: localize(10229, null),
      default: false,
      restricted: true,
      disallowConfigurationDefault: true,
      tags: ["prompts", "reusable prompts", "prompt snippets", "instructions"]
    },
    [PromptsConfig.SKILLS_LOCATION_KEY]: {
      type: "object",
      title: localize(10000, null),
      markdownDescription: localize(
        9998,
        null,
        SKILL_FILENAME,
        SKILL_DOCUMENTATION_URL
      ),
      default: {
        ...DEFAULT_SKILL_SOURCE_FOLDERS.map((folder) => ({ [folder.path]: true })).reduce((acc, curr) => ({ ...acc, ...curr }), {})
      },
      additionalProperties: { type: "boolean" },
      propertyNames: {
        pattern: VALID_PROMPT_FOLDER_PATTERN,
        patternErrorMessage: localize(9999, null)
      },
      restricted: true,
      tags: ["prompts", "reusable prompts", "prompt snippets", "instructions"],
      examples: [
        {
          [DEFAULT_SKILL_SOURCE_FOLDERS[0].path]: true
        },
        {
          [DEFAULT_SKILL_SOURCE_FOLDERS[0].path]: true,
          "my-skills": true,
          "../shared-skills": true,
          "~/.custom/skills": true
        }
      ]
    },
    [PromptsConfig.HOOKS_LOCATION_KEY]: {
      type: "object",
      title: localize(10093, null),
      markdownDescription: localize(
        10091,
        null,
        HOOK_DOCUMENTATION_URL
      ),
      default: {
        ...DEFAULT_HOOK_FILE_PATHS.map((f) => ({ [f.path]: true })).reduce((acc, curr) => ({ ...acc, ...curr }), {})
      },
      additionalProperties: { type: "boolean" },
      propertyNames: {
        pattern: VALID_PROMPT_FOLDER_PATTERN,
        patternErrorMessage: localize(10092, null)
      },
      restricted: true,
      tags: ["preview", "prompts", "hooks", "agent"],
      examples: [
        {
          [DEFAULT_HOOK_FILE_PATHS[0].path]: true
        },
        {
          [DEFAULT_HOOK_FILE_PATHS[0].path]: true,
          "custom-hooks/hooks.json": true
        }
      ],
      agentsWindow: { default: { ".claude/settings.local.json": false, ".claude/settings.json": false, "~/.claude/settings.json": false } }
    },
    [PromptsConfig.USE_CHAT_HOOKS]: {
      type: "boolean",
      title: localize(10232, null),
      markdownDescription: localize(10231, null),
      default: true,
      restricted: true,
      disallowConfigurationDefault: true,
      tags: ["preview", "prompts", "hooks", "agent"],
      policy: {
        name: "ChatHooks",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.109",
        value: (policyData) => policyData.chat_preview_features_enabled === false ? false : void 0,
        localization: {
          description: {
            key: "chat.useHooks.description",
            value: localize(10231, null)
          }
        }
      }
    },
    [PromptsConfig.USE_CLAUDE_HOOKS]: {
      type: "boolean",
      title: localize(10226, null),
      markdownDescription: localize(10225, null),
      default: false,
      restricted: true,
      disallowConfigurationDefault: true,
      tags: ["preview", "prompts", "hooks", "agent"]
    },
    [PromptsConfig.PROMPT_FILES_SUGGEST_KEY]: {
      type: "object",
      scope: 5 /* RESOURCE */,
      title: localize(
        10179,
        null
      ),
      markdownDescription: localize(
        10178,
        null
      ),
      default: {},
      additionalProperties: {
        oneOf: [
          { type: "boolean" },
          { type: "string" }
        ]
      },
      tags: ["prompts", "reusable prompts", "prompt snippets", "instructions"],
      examples: [
        {
          "plan": true,
          "a11y-audit": "resourceExtname == .html",
          "document": "resourceLangId == markdown"
        }
      ]
    },
    ["chat.tools.todos.showWidget" /* TodosShowWidget */]: {
      type: "boolean",
      default: true,
      description: localize(10207, null)
    },
    ["chat.agent.thinkingStyle" /* ThinkingStyle */]: {
      type: "string",
      default: "fixedScrolling",
      enum: ["collapsed", "collapsedPreview", "fixedScrolling"],
      enumDescriptions: [
        localize(9948, null),
        localize(9949, null),
        localize(9950, null)
      ],
      description: localize(9951, null),
      tags: ["experimental"]
    },
    ["chat.agent.thinking.generateTitles" /* ThinkingGenerateTitles */]: {
      type: "boolean",
      default: true,
      description: localize(9943, null),
      tags: ["experimental"]
    },
    "chat.agent.thinking.collapsedTools": {
      type: "string",
      default: "always",
      enum: ["off", "withThinking", "always"],
      enumDescriptions: [
        localize(9941, null),
        localize(9942, null),
        localize(9940, null)
      ],
      markdownDescription: localize(9939, null),
      tags: ["experimental"]
    },
    ["chat.agent.thinking.terminalTools" /* TerminalToolsInThinking */]: {
      type: "boolean",
      default: true,
      markdownDescription: localize(9947, null),
      tags: ["experimental"]
    },
    ["chat.tools.terminal.simpleCollapsible" /* SimpleTerminalCollapsible */]: {
      type: "boolean",
      default: true,
      markdownDescription: localize(10206, null),
      tags: ["experimental"]
    },
    ["chat.tools.compressOutput.enabled" /* CompressOutputEnabled */]: {
      type: "boolean",
      default: false,
      markdownDescription: localize(10200, null),
      tags: ["preview"],
      experiment: {
        mode: "auto"
      }
    },
    ["chat.agent.thinking.phrases" /* ThinkingPhrases */]: {
      type: "object",
      default: {
        mode: "append",
        phrases: []
      },
      properties: {
        mode: {
          type: "string",
          enum: ["replace", "append"],
          default: "append",
          description: localize(9945, null)
        },
        phrases: {
          type: "array",
          items: { type: "string" },
          default: [],
          description: localize(9946, null)
        }
      },
      additionalProperties: false,
      markdownDescription: localize(9944, null),
      tags: ["experimental"]
    },
    ["chat.tools.autoExpandFailures" /* AutoExpandToolFailures */]: {
      type: "boolean",
      default: true,
      markdownDescription: localize(10199, null)
    },
    [ChatAIDisabledSettingId]: {
      type: "boolean",
      description: localize(10051, null),
      default: false,
      scope: 4 /* WINDOW */
    },
    ["chat.titleBar.signIn.enabled" /* TitleBarSignInEnabled */]: {
      type: "boolean",
      description: localize(10196, null),
      default: true
    },
    ["chat.titleBar.openInAgentsWindow.enabled" /* TitleBarOpenInAgentsWindowEnabled */]: {
      type: "boolean",
      description: localize(10195, null),
      default: true
    },
    "chat.approvedAccountOrganizations": {
      type: "array",
      items: { type: "string" },
      description: localize(10002, null),
      default: [],
      included: false,
      policy: {
        name: "ChatApprovedAccountOrganizations",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.118",
        localization: {
          description: {
            key: "chat.approvedAccountOrganizations.policy.description",
            value: localize(10003, null)
          }
        }
      }
    },
    "chat.allowAnonymousAccess": {
      // TODO@bpasero remove me eventually
      type: "boolean",
      description: localize(10001, null),
      default: false,
      included: false,
      tags: ["experimental"],
      experiment: {
        mode: "auto"
      }
    },
    ["chat.growthNotification.enabled" /* GrowthNotificationEnabled */]: {
      type: "boolean",
      description: localize(10090, null),
      default: false,
      tags: ["experimental"],
      experiment: {
        mode: "auto"
      }
    },
    ["chat.restoreLastPanelSession" /* RestoreLastPanelSession */]: {
      type: "boolean",
      description: localize(10183, null),
      default: false
    },
    ["chat.exitAfterDelegation" /* ExitAfterDelegation */]: {
      type: "boolean",
      description: localize(10061, null),
      default: false,
      tags: ["preview"]
    },
    "chat.extensionUnification.enabled": {
      type: "boolean",
      description: localize(10087, null),
      default: true,
      tags: ["experimental"],
      experiment: {
        mode: "auto"
      }
    },
    ["chat.subagents.allowInvocationsFromSubagents" /* SubagentsAllowInvocationsFromSubagents */]: {
      type: "boolean",
      description: localize(10190, null),
      markdownDescription: localize(10191, null),
      default: false,
      experiment: {
        mode: "auto"
      }
    },
    ["chat.subagents.useRichRendering" /* SubagentsUseRichRendering */]: {
      type: "boolean",
      description: localize(10192, null),
      default: true
    },
    ["chat.terminal.agentHost.enabled" /* TerminalAgentHostEnabled */]: {
      type: "boolean",
      description: localize(10193, null),
      default: false,
      tags: ["experimental"],
      experiment: {
        mode: "startup"
      }
    },
    ["chat.inlineChat.agentHost.enabled" /* InlineChatAgentHostEnabled */]: {
      type: "boolean",
      description: localize(10107, null),
      default: false,
      tags: ["experimental"],
      experiment: {
        mode: "startup"
      }
    },
    ["chat.experimental.collectInstructionsInExtension" /* CollectInstructionsInExtension */]: {
      type: "boolean",
      description: localize(10062, null),
      default: false,
      tags: ["experimental"]
    },
    ["chat.customizations.structuredPreview.enabled" /* ChatCustomizationsStructuredPreviewEnabled */]: {
      type: "boolean",
      tags: ["preview"],
      description: localize(10037, null),
      default: false
    },
    ["chat.customizations.promptMigration.enabled" /* ChatCustomizationsPromptMigrationEnabled */]: {
      type: "boolean",
      tags: ["experimental"],
      description: localize(10034, null),
      default: true
    },
    ["chat.customizations.userDataMigration.enabled" /* ChatCustomizationsUserDataMigrationEnabled */]: {
      type: "boolean",
      tags: ["experimental"],
      description: localize(10038, null),
      default: false
    },
    ["chat.customizations.migrationHint" /* ChatCustomizationsMigrationHint */]: {
      type: "string",
      enum: ["never" /* Never */, "once" /* Once */, "always" /* Always */],
      enumDescriptions: [
        localize(10032, null),
        localize(10033, null),
        localize(10031, null)
      ],
      description: localize(10030, null),
      default: "never" /* Never */,
      tags: ["experimental"],
      experiment: { mode: "auto" }
    }
  }
});

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    ChatEditor,
    ChatEditorInput.EditorID,
    localize(9932, null)
  ),
  [
    new SyncDescriptor(ChatEditorInput)
  ]
);

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    ChatDebugEditor,
    ChatDebugEditorInput.ID,
    localize(10245, null)
  ),
  [
    new SyncDescriptor(ChatDebugEditorInput)
  ]
);

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    AgentPluginEditor,
    AgentPluginEditor.ID,
    localize(9930, null)
  ),
  [
    new SyncDescriptor(AgentPluginEditorInput)
  ]
);

function isStringKeyedObject(value2) {
  return !!value2 && typeof value2 === "object" && !Array.isArray(value2);
}

// OpenCode: 旧审批体系（approvals：manual / assisted / allowAll，以及 Autopilot 模式）已删除，迁移时去掉这些值
function migrateChatDefaultConfiguration(value2) {
  if (!isStringKeyedObject(value2)) {
    return void 0;
  }
  if (!("approvals" in value2) && value2.mode !== "autopilot") {
    return void 0;
  }
  const { approvals: _approvals, ...rest } = value2;
  return rest.mode === "autopilot" ? { ...rest, mode: "interactive" } : rest;
}

function migrateAgentMergeMergePullRequest(value2) {
  return typeof value2 === "boolean" ? value2 ? "always" : "never" : value2;
}

Registry.as(Extensions14.ConfigurationMigration).registerConfigurationMigrations([
  {
    key: "chat.agentSessions.defaultConfiguration",
    migrateFn: (value2, _accessor) => [
      ["chat.agentSessions.defaultConfiguration", { value: void 0 }],
      ["chat.defaultConfiguration" /* DefaultConfiguration */, { value: migrateChatDefaultConfiguration(value2) ?? value2 }]
    ]
  },
  {
    key: "chat.defaultConfiguration" /* DefaultConfiguration */,
    migrateFn: (value2) => ({ value: migrateChatDefaultConfiguration(value2) ?? value2 })
  },
  {
    key: "chat.experimental.detectParticipant.enabled",
    migrateFn: (value2, _accessor) => [
      ["chat.experimental.detectParticipant.enabled", { value: void 0 }],
      ["chat.detectParticipant.enabled", { value: value2 !== false }]
    ]
  },
  {
    key: "chat.useCopilotModelsForUtilityModels",
    migrateFn: (value2, valueAccessor) => {
      const result = [["chat.useCopilotModelsForUtilityModels", { value: void 0 }]];
      if (typeof value2 === "boolean" && valueAccessor("chat.byokUtilityModelDefault" /* BYOKUtilityModelDefault */) === void 0) {
        result.push(["chat.byokUtilityModelDefault" /* BYOKUtilityModelDefault */, { value: value2 ? "copilot" /* Copilot */ : "none" /* None */ }]);
      }
      return result;
    }
  },
  {
    key: "chat.useClaudeSkills",
    migrateFn: (value2, _accessor) => [
      ["chat.useClaudeSkills", { value: void 0 }],
      ["chat.useAgentSkills", { value: value2 }]
    ]
  },
  {
    key: mcpDiscoverySection,
    migrateFn: (value2) => {
      if (typeof value2 === "boolean") {
        return { value: Object.fromEntries(allDiscoverySources.map((k) => [k, value2])) };
      }
      return { value: value2 };
    }
  },
  {
    key: "chat.agentSessions.showExternal" /* ShowExternalAgentSessions */,
    migrateFn: (value2) => ({
      value: value2 === "all" ? "last30Days" /* Last30Days */ : value2
    })
  },
  {
    key: "chat.notifyWindowOnConfirmation" /* NotifyWindowOnConfirmation */,
    migrateFn: (value2) => {
      if (value2 === true) {
        return { value: "windowNotFocused" /* WindowNotFocused */ };
      } else if (value2 === false) {
        return { value: "off" /* Off */ };
      }
      return [];
    }
  },
  {
    key: "chat.notifyWindowOnResponseReceived" /* NotifyWindowOnResponseReceived */,
    migrateFn: (value2) => {
      if (value2 === true) {
        return { value: "windowNotFocused" /* WindowNotFocused */ };
      } else if (value2 === false) {
        return { value: "off" /* Off */ };
      }
      return [];
    }
  },
  {
    key: "chat.plugins.paths",
    migrateFn: (value2, _accessor) => [
      ["chat.plugins.paths", { value: void 0 }],
      ["chat.pluginLocations" /* PluginLocations */, { value: value2 }]
    ]
  },
  // Agent Merge settings dropped the `agentHost` segment from their ids. Without
  // this an explicit opt-out (for example `fixCI: false`) would silently revert to
  // the permissive default for sessions that already have Agent Merge enabled.
  ...Object.values(AgentMergeSettingId).map((settingId) => {
    const legacyKey = settingId.replace(/^chat\./, "chat.agentHost.");
    return {
      key: legacyKey,
      migrateFn: (value2, accessor) => {
        const pairs2 = [[legacyKey, { value: void 0 }]];
        if (accessor(settingId) === void 0) {
          pairs2.push([settingId, { value: settingId === AgentMergeSettingId.MergePullRequest ? migrateAgentMergeMergePullRequest(value2) : value2 }]);
        }
        return pairs2;
      }
    };
  }),
  {
    // `chat.agentMerge.mergePullRequest` became a three-way enum. An explicit
    // `true` must keep merging rather than fall back to the `never` default.
    key: AgentMergeSettingId.MergePullRequest,
    migrateFn: (value2) => {
      if (typeof value2 !== "boolean") {
        return [];
      }
      return [[AgentMergeSettingId.MergePullRequest, { value: migrateAgentMergeMergePullRequest(value2) }]];
    }
  },
  {
    // The on-device dictation runtime moved to Foundry Local; the old
    // transformers.js/onnxruntime model IDs no longer resolve and would fail
    // with an unknown-model error. Map any explicitly-stored legacy value to
    // the new default so existing users keep working. Also migrate the setting
    // from its old `chat.speechToText.model` id to `dictation.model`.
    key: "chat.speechToText.model",
    migrateFn: (value2, accessor) => {
      const legacyModelIds = [
        "onnx-community/whisper-tiny",
        "onnx-community/whisper-base",
        "onnx-community/whisper-small",
        "onnx-community/nemotron-3.5-asr-streaming-0.6b-onnx-int4",
        "nemotron-speech-streaming-en-0.6b"
      ];
      const migrated = typeof value2 === "string" && legacyModelIds.includes(value2) ? DEFAULT_LOCAL_TRANSCRIPTION_MODEL : value2;
      const pairs2 = [["chat.speechToText.model", { value: void 0 }]];
      if (accessor("dictation.model") === void 0) {
        pairs2.push(["dictation.model", { value: migrated }]);
      }
      return pairs2;
    }
  },
  {
    // Existing users may have the former English-only default stored
    // explicitly. Move them to the multilingual replacement as well.
    key: "dictation.model",
    migrateFn: (value2) => ({
      value: value2 === "nemotron-speech-streaming-en-0.6b" ? DEFAULT_LOCAL_TRANSCRIPTION_MODEL : value2
    })
  },
  {
    // Dictation settings were regrouped under the top-level `dictation.*`
    // namespace (they govern dictation across chat, editor, and terminal).
    key: "chat.speechToText.enabled",
    migrateFn: (value2, accessor) => {
      const pairs2 = [["chat.speechToText.enabled", { value: void 0 }]];
      if (accessor("dictation.enabled") === void 0) {
        pairs2.push(["dictation.enabled", { value: value2 }]);
      }
      return pairs2;
    }
  },
  {
    // `chat.speechToText.mode` was removed (the shortcut is always tap-toggle /
    // hold-to-talk); clear it so it does not linger as an unknown setting.
    key: "chat.speechToText.mode",
    migrateFn: () => [["chat.speechToText.mode", { value: void 0 }]]
  }
]);

var ChatResolverContribution = class extends Disposable {
  constructor(chatSessionsService, editorResolverService, instantiationService) {
    super();
    this.editorResolverService = editorResolverService;
    this.instantiationService = instantiationService;
    this._editorRegistrations = this._register(new DisposableMap());
    this._registerEditor(Schemas.vscodeChatEditor);
    this._registerEditor(Schemas.vscodeLocalChatSession);
    this._register(chatSessionsService.onDidChangeContentProviderSchemes((e) => {
      for (const scheme of e.added) {
        this._registerEditor(scheme);
      }
      for (const scheme of e.removed) {
        this._editorRegistrations.deleteAndDispose(scheme);
      }
    }));
    for (const scheme of chatSessionsService.getContentProviderSchemes()) {
      this._registerEditor(scheme);
    }
  }
  static {
    this.ID = "workbench.contrib.chatResolver";
  }
  _registerEditor(scheme) {
    this._editorRegistrations.set(scheme, this.editorResolverService.registerEditor(
      `${scheme}:**/**`,
      {
        id: ChatEditorInput.EditorID,
        label: localize(9932, null),
        priority: "builtin" /* builtin */
      },
      {
        singlePerResource: true,
        canSupportResource: (resource) => resource.scheme === scheme
      },
      {
        createEditorInput: ({ resource, options: options3 }) => {
          return {
            editor: this.instantiationService.createInstance(ChatEditorInput, resource, options3),
            options: options3
          };
        }
      }
    ));
  }
};

ChatResolverContribution = __decorateClass([
  __decorateParam(0, IChatSessionsService),
  __decorateParam(1, IEditorResolverService),
  __decorateParam(2, IInstantiationService)
], ChatResolverContribution);

var CopilotTelemetryContribution = class extends Disposable {
  constructor(telemetryService, chatEntitlementService) {
    super();
    this.telemetryService = telemetryService;
    this.chatEntitlementService = chatEntitlementService;
    this.updateCommonProperties();
    this._register(this.chatEntitlementService.onDidChangeEntitlement(() => {
      this.updateCommonProperties();
    }));
  }
  static {
    this.ID = "workbench.contrib.copilotTelemetry";
  }
  updateCommonProperties() {
    const copilotTrackingId = this.chatEntitlementService.copilotTrackingId;
    if (copilotTrackingId) {
      this.telemetryService.setCommonProperty("common.copilotTrackingId", copilotTrackingId);
    }
    if (this.chatEntitlementService.isInternal) {
      this.telemetryService.setCommonProperty("common.msftInternal", true);
    }
  }
};

CopilotTelemetryContribution = __decorateClass([
  __decorateParam(0, ITelemetryService),
  __decorateParam(1, IChatEntitlementService)
], CopilotTelemetryContribution);

var ChatDebugResolverContribution = class {
  static {
    this.ID = "workbench.contrib.chatDebugResolver";
  }
  constructor(editorResolverService) {
    editorResolverService.registerEditor(
      `${ChatDebugEditorInput.RESOURCE.scheme}:**/**`,
      {
        id: ChatDebugEditorInput.ID,
        label: localize(10245, null),
        priority: "exclusive" /* exclusive */
      },
      {
        singlePerResource: true,
        canSupportResource: (resource) => resource.scheme === ChatDebugEditorInput.RESOURCE.scheme
      },
      {
        createEditorInput: () => {
          return {
            editor: ChatDebugEditorInput.instance,
            options: { pinned: true }
          };
        }
      }
    );
  }
};

ChatDebugResolverContribution = __decorateClass([
  __decorateParam(0, IEditorResolverService)
], ChatDebugResolverContribution);

var ChatAgentSettingContribution = class extends Disposable {
  constructor(experimentService, entitlementService, contextKeyService) {
    super();
    this.experimentService = experimentService;
    this.entitlementService = entitlementService;
    this.contextKeyService = contextKeyService;
    this.newChatButtonExperimentIcon = ChatContextKeys.newChatButtonExperimentIcon.bindTo(this.contextKeyService);
    this.registerMaxRequestsSetting();
    this.registerNewChatButtonIcon();
    this.registerDefaultModeSetting();
  }
  static {
    this.ID = "workbench.contrib.chatAgentSetting";
  }
  registerMaxRequestsSetting() {
    let lastNode;
    const registerMaxRequestsSetting = () => {
      const treatmentId = this.entitlementService.entitlement === 5 /* Free */ ? "chatAgentMaxRequestsFree" : "chatAgentMaxRequestsPro";
      this.experimentService.getTreatment(treatmentId).then((value2) => {
        const node = {
          id: "chatSidebar",
          title: localize(10266, null),
          type: "object",
          properties: {
            "chat.agent.maxRequests": {
              type: "number",
              markdownDescription: localize(9937, null),
              default: value2 ?? 50,
              order: 2,
              agentsWindow: { default: 1e3 }
            }
          }
        };
        configurationRegistry13.updateConfigurations({ remove: lastNode ? [lastNode] : [], add: [node] });
        lastNode = node;
      });
    };
    this._register(Event2.runAndSubscribe(Event2.debounce(this.entitlementService.onDidChangeEntitlement, () => {
    }, 1e3), () => registerMaxRequestsSetting()));
  }
  registerNewChatButtonIcon() {
    this.experimentService.getTreatment("chatNewButtonIcon").then((value2) => {
      const supportedValues = ["copilot", "new-session", "comment"];
      if (typeof value2 === "string" && supportedValues.includes(value2)) {
        this.newChatButtonExperimentIcon.set(value2);
      } else {
        this.newChatButtonExperimentIcon.reset();
      }
    });
  }
  registerDefaultModeSetting() {
    this.experimentService.getTreatment("chatDefaultNewSessionMode").then((value2) => {
      const node = {
        id: "chatSidebar",
        title: localize(10266, null),
        type: "object",
        properties: {
          ["chat.newSession.defaultMode" /* DefaultNewSessionMode */]: {
            type: "string",
            description: localize(10149, null),
            default: typeof value2 === "string" ? value2 : ""
          }
        }
      };
      configurationRegistry13.updateConfigurations({ add: [node], remove: [] });
    });
  }
};

ChatAgentSettingContribution = __decorateClass([
  __decorateParam(0, IWorkbenchAssignmentService),
  __decorateParam(1, IChatEntitlementService),
  __decorateParam(2, IContextKeyService)
], ChatAgentSettingContribution);

var ChatForegroundSessionCountContribution = class extends Disposable {
  constructor(contextKeyService, chatWidgetService, viewsService) {
    super();
    this.contextKeyService = contextKeyService;
    this.chatWidgetService = chatWidgetService;
    this.viewsService = viewsService;
    this.foregroundSessionCountContextKey = ChatContextKeys.foregroundSessionCount.bindTo(this.contextKeyService);
    this._register(this.chatWidgetService.onDidAddWidget(() => {
      this.updateForegroundSessionCount();
    }));
    this._register(this.chatWidgetService.onDidChangeWidgetVisibility(() => {
      this.updateForegroundSessionCount();
    }));
    this._register(Event2.filter(this.viewsService.onDidChangeViewVisibility, (e) => e.id === ChatViewId)(() => {
      this.updateForegroundSessionCount();
    }));
    this.updateForegroundSessionCount();
  }
  static {
    this.ID = "workbench.contrib.chatForegroundSessionCount";
  }
  updateForegroundSessionCount() {
    let count2 = this.viewsService.isViewVisible(ChatViewId) ? 1 : 0;
    for (const widget of this.chatWidgetService.getWidgetsByLocations("panel" /* Chat */)) {
      if (!widget.visible) {
        continue;
      }
      if (isIChatViewViewContext(widget.viewContext)) {
        continue;
      }
      if (isIChatResourceViewContext(widget.viewContext) && widget.viewContext.isQuickChat) {
        continue;
      }
      count2++;
    }
    this.foregroundSessionCountContextKey.set(count2);
  }
};

ChatForegroundSessionCountContribution = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IChatWidgetService),
  __decorateParam(2, IViewsService)
], ChatForegroundSessionCountContribution);

function getCustomModesWithUniqueNames(builtinModes, customModes) {
  const customModeIds = /* @__PURE__ */ new Set();
  const builtinNames = new Set(builtinModes.map((mode) => mode.name.get()));
  const customNameToId = /* @__PURE__ */ new Map();
  for (const mode of customModes) {
    const modeName = mode.name.get();
    if (builtinNames.has(modeName)) {
      continue;
    }
    const existingId = customNameToId.get(modeName);
    if (existingId) {
      customModeIds.delete(existingId);
    }
    customNameToId.set(modeName, mode.id);
    customModeIds.add(mode.id);
  }
  return customModeIds;
}

var ChatAgentActionsContribution = class extends Disposable {
  constructor(_chatModeService, chatWidgetService) {
    super();
    this.chatWidgetService = chatWidgetService;
    this._modeActionDisposables = new DisposableMap();
    this._store.add(this._modeActionDisposables);
    const focusedWidget = observableFromEvent(this, this.chatWidgetService.onDidChangeFocusedSession, () => this.chatWidgetService.lastFocusedWidget);
    this._register(autorun((reader) => {
      const chatModes = focusedWidget.read(reader)?.input.currentChatModesObs.read(reader);
      this._syncModeActions(chatModes);
    }));
  }
  static {
    this.ID = "workbench.contrib.chatAgentActions";
  }
  _syncModeActions(chatModes) {
    if (!chatModes) {
      this._modeActionDisposables.clearAndDisposeAll();
      return;
    }
    const { builtin, custom } = chatModes;
    const currentModeIds = getCustomModesWithUniqueNames(builtin, custom);
    for (const modeId of this._modeActionDisposables.keys()) {
      if (!currentModeIds.has(modeId)) {
        this._modeActionDisposables.deleteAndDispose(modeId);
      }
    }
    for (const mode of custom) {
      if (currentModeIds.has(mode.id) && !this._modeActionDisposables.has(mode.id)) {
        this._registerModeAction(mode);
      }
    }
  }
  _registerModeAction(mode) {
    const actionClass = class extends ModeOpenChatGlobalAction {
      constructor() {
        super(mode);
      }
    };
    this._modeActionDisposables.set(mode.id, registerAction2(actionClass));
  }
};

ChatAgentActionsContribution = __decorateClass([
  __decorateParam(0, IChatModeService),
  __decorateParam(1, IChatWidgetService)
], ChatAgentActionsContribution);

var HookSchemaAssociationContribution = class extends Disposable {
  constructor(_configurationService, _pathService) {
    super();
    this._configurationService = _configurationService;
    this._pathService = _pathService;
    this._registrations = this._register(new DisposableStore());
    this._updateAssociations();
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(PromptsConfig.HOOKS_LOCATION_KEY)) {
        this._updateAssociations();
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.hookSchemaAssociation";
  }
  async _updateAssociations() {
    this._registrations.clear();
    const folders = PromptsConfig.promptSourceFolders(this._configurationService, "hook" /* hook */);
    const userHomeUri = await this._pathService.userHome();
    const userHome = userHomeUri.fsPath ?? userHomeUri.path;
    for (const folder of folders) {
      if (folder.source === "claude-workspace" /* ClaudeWorkspace */ || folder.source === "claude-workspace-local" /* ClaudeWorkspaceLocal */ || folder.source === "claude-personal" /* ClaudePersonal */) {
        continue;
      }
      const resolvedPath = isTildePath(folder.path) ? userHome + folder.path.substring(1) : folder.path;
      const glob = resolvedPath.toLowerCase().endsWith(".json") ? resolvedPath : `${resolvedPath}/*.json`;
      this._registrations.add(
        jsonContributionRegistry2.registerSchemaAssociation(HOOK_SCHEMA_URI, glob)
      );
    }
  }
};

HookSchemaAssociationContribution = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IPathService)
], HookSchemaAssociationContribution);

var ToolReferenceNamesContribution = class extends Disposable {
  constructor(_languageModelToolsService) {
    super();
    this._languageModelToolsService = _languageModelToolsService;
    this._updateToolReferenceNames();
    this._register(this._languageModelToolsService.onDidChangeTools(() => this._updateToolReferenceNames()));
  }
  static {
    this.ID = "workbench.contrib.toolReferenceNames";
  }
  _updateToolReferenceNames() {
    const tools = Array.from(this._languageModelToolsService.getAllToolsIncludingDisabled()).filter((tool) => typeof tool.toolReferenceName === "string").sort((a, b) => a.toolReferenceName.localeCompare(b.toolReferenceName));
    toolReferenceNameEnumValues.length = 0;
    toolReferenceNameEnumDescriptions.length = 0;
    for (const tool of tools) {
      toolReferenceNameEnumValues.push(tool.toolReferenceName);
      toolReferenceNameEnumDescriptions.push(localize(
        10197,
        null,
        tool.toolReferenceName,
        tool.userDescription || tool.displayName
      ));
    }
    configurationRegistry13.notifyConfigurationSchemaUpdated({
      id: "chatSidebar",
      properties: {
        ["chat.tools.eligibleForAutoApproval" /* EligibleForAutoApproval */]: {}
      }
    });
  }
};

ToolReferenceNamesContribution = __decorateClass([
  __decorateParam(0, ILanguageModelToolsService)
], ToolReferenceNamesContribution);

var ChatSpeechToTextInitContribution = class {
  static {
    this.ID = "workbench.contrib.chatSpeechToTextInit";
  }
  constructor(_chatSpeechToTextService) {
  }
};

ChatSpeechToTextInitContribution = __decorateClass([
  __decorateParam(0, IChatSpeechToTextService)
], ChatSpeechToTextInitContribution);

var CustomizationMigrationHintContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.customizationMigrationHint";
  }
  constructor(chatService, customizationMigrationService) {
    super();
    this._register(chatService.registerCustomizationMigrationHintProvider(
      (sessionResource) => customizationMigrationService.computeMigrationHint(sessionResource)
    ));
  }
};

CustomizationMigrationHintContribution = __decorateClass([
  __decorateParam(0, IChatService),
  __decorateParam(1, ICustomizationMigrationService)
], CustomizationMigrationHintContribution);

AccessibleViewRegistry.register(new ChatTerminalOutputAccessibleView());

AccessibleViewRegistry.register(new ChatResponseAccessibleView());

AccessibleViewRegistry.register(new PanelChatAccessibilityHelp());

AccessibleViewRegistry.register(new QuickChatAccessibilityHelp());

AccessibleViewRegistry.register(new EditsChatAccessibilityHelp());

AccessibleViewRegistry.register(new AgentChatAccessibilityHelp());

AccessibleViewRegistry.register(new ChatFindAccessibilityHelp());

AccessibleViewRegistry.register(new ChatPetAchievementsAccessibilityHelp());

registerEditorFeature(ChatInputBoxContentProvider);

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(ChatEditorInput.TypeID, ChatEditorInputSerializer);

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(ChatDebugEditorInput.ID, ChatDebugEditorInputSerializer);

registerWorkbenchContribution2(CopilotTelemetryContribution.ID, CopilotTelemetryContribution, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(ChatSpeechToTextInitContribution.ID, ChatSpeechToTextInitContribution, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(CustomizationMigrationHintContribution.ID, CustomizationMigrationHintContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(ChatResolverContribution.ID, ChatResolverContribution, WorkbenchPhase.BlockStartup);

registerWorkbenchContribution2(ChatDebugResolverContribution.ID, ChatDebugResolverContribution, WorkbenchPhase.BlockStartup);

registerWorkbenchContribution2(PromptsDebugContribution.ID, PromptsDebugContribution, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(AgentHostChatDebugContribution.ID, AgentHostChatDebugContribution, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(ChatLanguageModelsDataContribution.ID, ChatLanguageModelsDataContribution, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(ChatSlashCommandsContribution.ID, ChatSlashCommandsContribution, WorkbenchPhase.Eventually);

registerWorkbenchContribution2(ChatSessionOptionSlashCommandsContribution.ID, ChatSessionOptionSlashCommandsContribution, WorkbenchPhase.Eventually);

registerWorkbenchContribution2(ChatOutlineCreator.ID, ChatOutlineCreator, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(ChatExtensionPointHandler.ID, ChatExtensionPointHandler, WorkbenchPhase.BlockStartup);

registerWorkbenchContribution2(LanguageModelToolsExtensionPointHandler.ID, LanguageModelToolsExtensionPointHandler, WorkbenchPhase.BlockStartup);

registerWorkbenchContribution2(ChatPromptFilesExtensionPointHandler.ID, ChatPromptFilesExtensionPointHandler, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(ChatCompatibilityNotifier.ID, ChatCompatibilityNotifier, WorkbenchPhase.Eventually);

registerWorkbenchContribution2(CodeBlockActionRendering.ID, CodeBlockActionRendering, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(ChatCopyActionRendering.ID, ChatCopyActionRendering, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(ChatModelFeedbackSurveyActionRendering.ID, ChatModelFeedbackSurveyActionRendering, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(ChatModelFeedbackSurveyPromptContribution.ID, ChatModelFeedbackSurveyPromptContribution, WorkbenchPhase.Eventually);

registerWorkbenchContribution2(ChatImplicitContextContribution.ID, ChatImplicitContextContribution, WorkbenchPhase.Eventually);

registerWorkbenchContribution2(ChatViewsWelcomeHandler.ID, ChatViewsWelcomeHandler, WorkbenchPhase.BlockStartup);

registerWorkbenchContribution2(ChatGettingStartedContribution.ID, ChatGettingStartedContribution, WorkbenchPhase.Eventually);

registerWorkbenchContribution2(ChatSetupContribution.ID, ChatSetupContribution, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(ChatQuotaNotificationContribution.ID, ChatQuotaNotificationContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(ChatPromoNotificationContribution.ID, ChatPromoNotificationContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(ChatExpNotificationContribution.ID, ChatExpNotificationContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(HasByokModelsContribution.ID, HasByokModelsContribution, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(ChatTeardownContribution.ID, ChatTeardownContribution, WorkbenchPhase.AfterRestored);

// OpenCode deliberately omits the bundled Copilot status-bar icon and dashboard.

registerWorkbenchContribution2(BuiltinToolsContribution.ID, BuiltinToolsContribution, WorkbenchPhase.Eventually);

registerWorkbenchContribution2(ClientToolSetsContribution.ID, ClientToolSetsContribution, WorkbenchPhase.Eventually);

registerWorkbenchContribution2(UsagesToolContribution.ID, UsagesToolContribution, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(RenameToolContribution.ID, RenameToolContribution, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(ChatAgentSettingContribution.ID, ChatAgentSettingContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(ChatForegroundSessionCountContribution.ID, ChatForegroundSessionCountContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(ChatAgentActionsContribution.ID, ChatAgentActionsContribution, WorkbenchPhase.Eventually);

registerWorkbenchContribution2(HookSchemaAssociationContribution.ID, HookSchemaAssociationContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(ToolReferenceNamesContribution.ID, ToolReferenceNamesContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(ChatAgentRecommendation.ID, ChatAgentRecommendation, WorkbenchPhase.Eventually);

registerWorkbenchContribution2(ChatEditingEditorAccessibility.ID, ChatEditingEditorAccessibility, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(ChatQueuePickerRendering.ID, ChatQueuePickerRendering, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(ChatEditingEditorOverlay.ID, ChatEditingEditorOverlay, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(ChatEditingEditorContextKeys.ID, ChatEditingEditorContextKeys, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(ChatTransferContribution.ID, ChatTransferContribution, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(ChatContextContributions.ID, ChatContextContributions, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(PromptUrlHandler.ID, PromptUrlHandler, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(PluginUrlHandler.ID, PluginUrlHandler, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(ChatEditingNotebookFileSystemProviderContrib.ID, ChatEditingNotebookFileSystemProviderContrib, WorkbenchPhase.BlockStartup);

registerWorkbenchContribution2(ChatResponseResourceWorkbenchContribution.ID, ChatResponseResourceWorkbenchContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(UserToolSetsContributions.ID, UserToolSetsContributions, WorkbenchPhase.Eventually);

registerWorkbenchContribution2(PromptLanguageFeaturesProvider.ID, PromptLanguageFeaturesProvider, WorkbenchPhase.Eventually);

registerWorkbenchContribution2(ChatWindowNotifier.ID, ChatWindowNotifier, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(ChatRepoInfoContribution.ID, ChatRepoInfoContribution, WorkbenchPhase.Eventually);

registerWorkbenchContribution2(AgentPluginRecommendations.ID, AgentPluginRecommendations, WorkbenchPhase.Eventually);

registerWorkbenchContribution2(AgentPluginCommandsContribution.ID, AgentPluginCommandsContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(PluginAutoUpdate.ID, PluginAutoUpdate, WorkbenchPhase.Eventually);

registerWorkbenchContribution2(ChatReferenceAttachmentWidgetContribution.ID, ChatReferenceAttachmentWidgetContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(TranscriptContextAttachmentWidgetContribution.ID, TranscriptContextAttachmentWidgetContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(ChatPetContextContribution.ID, ChatPetContextContribution, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(ChatPetCustomizationAchievementContribution.ID, ChatPetCustomizationAchievementContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(ChatPetEditingAchievementContribution.ID, ChatPetEditingAchievementContribution, WorkbenchPhase.AfterRestored);

registerChatActions();

registerChatAccessibilityActions();

registerChatCopyActions();

registerChatModelFeedbackSurveyActions();

registerChatBranchActions();

registerChatOpenAgentDebugPanelAction();

registerChatCodeBlockActions();

registerChatCodeCompareBlockActions();

registerChatFileTreeActions();

registerChatPromptNavigationActions();

registerChatTitleActions();

registerChatExecuteActions();

registerChatFindActions();

registerAction2(ChatVoiceInputModeAction);

registerAction2(ChatVoiceInputModeToggleListenAction);

registerVoiceInputModeSimulateActions();

registerChatSpeechToTextActions();

registerConfigureSpeechInstructionsActions();

registerChatQueueActions();

registerQuickChatActions();

registerChatExportActions();

registerMoveActions();

registerNewChatActions();

registerChatContextActions();

registerChatDeveloperActions();

registerChatEditorActions();

registerChatElicitationActions();

registerChatToolActions();

registerLanguageModelActions();

registerChatPluginActions();

registerAction2(ConfigureToolSets);

registerEditorFeature(ChatPasteProvidersFeature);

agentPluginDiscoveryRegistry.register(new SyncDescriptor(ConfiguredAgentPluginDiscovery), 10 /* Configured */);

agentPluginDiscoveryRegistry.register(new SyncDescriptor(MarketplaceAgentPluginDiscovery), 20 /* Marketplace */);

agentPluginDiscoveryRegistry.register(new SyncDescriptor(ExtensionAgentPluginDiscovery), 30 /* Extension */);

agentPluginDiscoveryRegistry.register(new SyncDescriptor(CopilotCliAgentPluginDiscovery), 40 /* CopilotCli */);

registerSingleton(IChatResponseResourceFileSystemProvider, ChatResponseResourceFileSystemProvider, 1 /* Delayed */);

registerSingleton(IChatSpeechToTextService, ChatSpeechToTextService, 0 /* Eager */);

registerSingleton(IChatTransferService, ChatTransferService, 1 /* Delayed */);

registerSingleton(IChatService, ChatService, 1 /* Delayed */);

registerSingleton(IChatWidgetService, ChatWidgetService, 1 /* Delayed */);

registerSingleton(IChatPasteTargetService, ChatPasteTargetService, 1 /* Delayed */);

registerSingleton(IChatBranchService, ChatBranchService, 1 /* Delayed */);

registerSingleton(IChatSideChatService, ChatSideChatService, 1 /* Delayed */);

registerSingleton(IChatRequestOriginService, ChatRequestOriginService, 1 /* Delayed */);

registerSingleton(IChatModelFeedbackSurveyService, ChatModelFeedbackSurveyService, 1 /* Delayed */);

registerSingleton(IChatPetService, ChatPetService, 1 /* Delayed */);

registerSingleton(IChatPetWidgetService, ChatPetWidgetService, 1 /* Delayed */);

registerSingleton(IQuickChatService, QuickChatService, 1 /* Delayed */);

registerSingleton(IChatAccessibilityService, ChatAccessibilityService, 1 /* Delayed */);

registerSingleton(IChatWidgetHistoryService, ChatWidgetHistoryService, 1 /* Delayed */);

registerSingleton(ILanguageModelsConfigurationService, LanguageModelsConfigurationService, 1 /* Delayed */);

registerSingleton(ILanguageModelsService, LanguageModelsService, 1 /* Delayed */);

registerSingleton(ILanguageModelStatsService, LanguageModelStatsService, 1 /* Delayed */);

registerSingleton(IChatSlashCommandService, ChatSlashCommandService, 1 /* Delayed */);

registerSingleton(IChatAgentService, ChatAgentService, 1 /* Delayed */);

registerSingleton(IChatAgentNameService, ChatAgentNameService, 1 /* Delayed */);

registerSingleton(IChatVariablesService, ChatVariablesService, 1 /* Delayed */);

registerSingleton(IAgentPluginService, AgentPluginService, 1 /* Delayed */);

registerSingleton(IPluginMarketplaceService, PluginMarketplaceService, 1 /* Delayed */);

registerSingleton(IWorkspacePluginSettingsService, WorkspacePluginSettingsService, 1 /* Delayed */);

registerSingleton(IAgentPluginRepositoryService, AgentPluginRepositoryService, 1 /* Delayed */);

registerSingleton(IPluginGitService, BrowserPluginGitCommandService, 1 /* Delayed */);

registerSingleton(IPluginInstallService, PluginInstallService, 1 /* Delayed */);

registerSingleton(ILanguageModelToolsService, LanguageModelToolsService, 1 /* Delayed */);

registerSingleton(IToolResultCompressor, ToolResultCompressorService, 1 /* Delayed */);

registerSingleton(ILanguageModelToolsConfirmationService, LanguageModelToolsConfirmationService, 1 /* Delayed */);

registerSingleton(IChatToolRiskAssessmentService, ChatToolRiskAssessmentService, 1 /* Delayed */);

registerSingleton(IChatSubmitRequestHandlerService, ChatSubmitRequestHandlerService, 1 /* Delayed */);

registerSingleton(IVoiceChatService, VoiceChatService, 1 /* Delayed */);

registerSingleton(IChatCodeBlockContextProviderService, ChatCodeBlockContextProviderService, 1 /* Delayed */);

registerSingleton(ICodeMapperService, CodeMapperService, 1 /* Delayed */);

registerSingleton(IChatEditingService, ChatEditingService, 1 /* Delayed */);

registerSingleton(IChatMarkdownAnchorService, ChatMarkdownAnchorService, 1 /* Delayed */);

registerSingleton(IAgentNetworkFilterService, AgentNetworkFilterService, 1 /* Delayed */);

registerSingleton(ILanguageModelIgnoredFilesService, LanguageModelIgnoredFilesService, 1 /* Delayed */);

registerSingleton(IPromptsService, PromptsService, 1 /* Delayed */);

registerSingleton(ICustomizationMigrationService, CustomizationMigrationService, 1 /* Delayed */);

registerSingleton(IChatContextPickService, ChatContextPickService, 1 /* Delayed */);

registerSingleton(IChatModeService, ChatModeService, 1 /* Delayed */);

registerSingleton(IChatAttachmentResolveService, ChatAttachmentResolveService, 1 /* Delayed */);

registerSingleton(IChatAttachmentWidgetRegistry, ChatAttachmentWidgetRegistry, 1 /* Delayed */);

registerSingleton(IChatTodoListService, ChatTodoListService, 1 /* Delayed */);

registerSingleton(IChatArtifactsService, ChatArtifactsService, 1 /* Delayed */);

registerSingleton(IChatOutputRendererService, ChatOutputRendererService, 1 /* Delayed */);

registerSingleton(IChatLayoutService, ChatLayoutService, 1 /* Delayed */);

registerSingleton(IPlanReviewFeedbackService, PlanReviewFeedbackService, 1 /* Delayed */);

registerSingleton(IChatTipService, ChatTipService, 1 /* Delayed */);

registerSingleton(IChatDebugService, ChatDebugServiceImpl, 1 /* Delayed */);

registerSingleton(IChatImageCarouselService, ChatImageCarouselService, 1 /* Delayed */);

registerSingleton(IAgentHostImportConversationStore, AgentHostImportConversationStore, 1 /* Delayed */);

registerSingleton(ISessionSummaryHoverService, SessionSummaryHoverService, 1 /* Delayed */);

ChatWidget.CONTRIBS.push(ChatDynamicVariableModel);
export { isStringKeyedObject, migrateChatDefaultConfiguration, migrateAgentMergeMergePullRequest, getCustomModesWithUniqueNames, toolReferenceNameEnumValues, toolReferenceNameEnumDescriptions, jsonContributionRegistry2, configurationRegistry13, ChatResolverContribution, CopilotTelemetryContribution, ChatDebugResolverContribution, ChatAgentSettingContribution, ChatForegroundSessionCountContribution, ChatAgentActionsContribution, HookSchemaAssociationContribution, ToolReferenceNamesContribution, ChatSpeechToTextInitContribution, CustomizationMigrationHintContribution };
