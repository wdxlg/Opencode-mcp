// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/platform/actions/common/actions.ts
import { createDecorator2 } from "./module-0048.mjs";
import { MicrotaskEmitter } from "./module-0017.mjs";
import { DisposableStore, markAsSingleton, toDisposable } from "./module-0011.mjs";
import { LinkedList } from "./module-0012.mjs";
import { ThemeIcon } from "./module-0084.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0049.mjs";
import { ICommandService } from "./module-0165.mjs";


// src/vs/platform/actions/common/actions.ts
function isIMenuItem(item) {
  return item.command !== void 0;
}

var MenuId = class _MenuId {
  static {
    this._instances = /* @__PURE__ */ new Map();
  }
  static {
    this.CommandPalette = new _MenuId("CommandPalette");
  }
  static {
    this.DebugBreakpointsContext = new _MenuId("DebugBreakpointsContext");
  }
  static {
    this.DebugCallStackContext = new _MenuId("DebugCallStackContext");
  }
  static {
    this.DebugConsoleContext = new _MenuId("DebugConsoleContext");
  }
  static {
    this.DebugVariablesContext = new _MenuId("DebugVariablesContext");
  }
  static {
    this.NotebookVariablesContext = new _MenuId("NotebookVariablesContext");
  }
  static {
    this.DebugHoverContext = new _MenuId("DebugHoverContext");
  }
  static {
    this.DebugWatchContext = new _MenuId("DebugWatchContext");
  }
  static {
    this.DebugToolBar = new _MenuId("DebugToolBar");
  }
  static {
    this.DebugToolBarStop = new _MenuId("DebugToolBarStop");
  }
  static {
    this.DebugDisassemblyContext = new _MenuId("DebugDisassemblyContext");
  }
  static {
    this.DebugCallStackToolbar = new _MenuId("DebugCallStackToolbar");
  }
  static {
    this.DebugCreateConfiguration = new _MenuId("DebugCreateConfiguration");
  }
  static {
    this.DebugScopesContext = new _MenuId("DebugScopesContext");
  }
  static {
    this.EditorContext = new _MenuId("EditorContext");
  }
  static {
    this.SimpleEditorContext = new _MenuId("SimpleEditorContext");
  }
  static {
    this.EditorContent = new _MenuId("EditorContent");
  }
  static {
    this.EditorLineNumberContext = new _MenuId("EditorLineNumberContext");
  }
  static {
    this.EditorContextCopy = new _MenuId("EditorContextCopy");
  }
  static {
    this.EditorContextPeek = new _MenuId("EditorContextPeek");
  }
  static {
    this.EditorContextShare = new _MenuId("EditorContextShare");
  }
  static {
    this.EditorTitle = new _MenuId("EditorTitle");
  }
  static {
    this.EditorTitleLayout = new _MenuId("EditorTitleLayout");
  }
  static {
    this.ModalEditorTitle = new _MenuId("ModalEditorTitle");
  }
  static {
    this.ModalEditorTitleContext = new _MenuId("ModalEditorTitleContext");
  }
  static {
    this.ModalEditorEditorTitle = new _MenuId("ModalEditorEditorTitle");
  }
  static {
    this.CompactWindowEditorTitle = new _MenuId("CompactWindowEditorTitle");
  }
  static {
    this.EditorTitleRun = new _MenuId("EditorTitleRun");
  }
  static {
    this.EditorTitleContext = new _MenuId("EditorTitleContext");
  }
  static {
    this.EditorTitleContextShare = new _MenuId("EditorTitleContextShare");
  }
  static {
    this.EmptyEditorGroup = new _MenuId("EmptyEditorGroup");
  }
  static {
    this.EmptyEditorGroupContext = new _MenuId("EmptyEditorGroupContext");
  }
  static {
    this.EditorGroupWatermarkToolbar = new _MenuId("EditorGroupWatermarkToolbar");
  }
  static {
    this.EditorTabsBarContext = new _MenuId("EditorTabsBarContext");
  }
  static {
    this.EditorTabsBarShowTabsSubmenu = new _MenuId("EditorTabsBarShowTabsSubmenu");
  }
  static {
    this.EditorTabsBarShowTabsZenModeSubmenu = new _MenuId("EditorTabsBarShowTabsZenModeSubmenu");
  }
  static {
    this.EditorActionsPositionSubmenu = new _MenuId("EditorActionsPositionSubmenu");
  }
  static {
    this.EditorRenderWhitespaceSubmenu = new _MenuId("EditorRenderWhitespaceSubmenu");
  }
  static {
    this.EditorSplitMoveSubmenu = new _MenuId("EditorSplitMoveSubmenu");
  }
  static {
    this.ExplorerContext = new _MenuId("ExplorerContext");
  }
  static {
    this.ExplorerContextShare = new _MenuId("ExplorerContextShare");
  }
  static {
    this.ExtensionContext = new _MenuId("ExtensionContext");
  }
  static {
    this.ExtensionEditorContextMenu = new _MenuId("ExtensionEditorContextMenu");
  }
  static {
    this.GlobalActivity = new _MenuId("GlobalActivity");
  }
  static {
    this.CommandCenter = new _MenuId("CommandCenter");
  }
  static {
    this.CommandCenterCenter = new _MenuId("CommandCenterCenter");
  }
  static {
    this.LayoutControlMenuSubmenu = new _MenuId("LayoutControlMenuSubmenu");
  }
  static {
    this.LayoutControlMenu = new _MenuId("LayoutControlMenu");
  }
  static {
    this.MenubarMainMenu = new _MenuId("MenubarMainMenu");
  }
  static {
    this.MenubarAppearanceMenu = new _MenuId("MenubarAppearanceMenu");
  }
  static {
    this.MenubarDebugMenu = new _MenuId("MenubarDebugMenu");
  }
  static {
    this.MenubarEditMenu = new _MenuId("MenubarEditMenu");
  }
  static {
    this.MenubarCopy = new _MenuId("MenubarCopy");
  }
  static {
    this.MenubarFileMenu = new _MenuId("MenubarFileMenu");
  }
  static {
    this.MenubarGoMenu = new _MenuId("MenubarGoMenu");
  }
  static {
    this.MenubarHelpMenu = new _MenuId("MenubarHelpMenu");
  }
  static {
    this.MenubarLayoutMenu = new _MenuId("MenubarLayoutMenu");
  }
  static {
    this.MenubarNewBreakpointMenu = new _MenuId("MenubarNewBreakpointMenu");
  }
  static {
    this.PanelAlignmentMenu = new _MenuId("PanelAlignmentMenu");
  }
  static {
    this.PanelPositionMenu = new _MenuId("PanelPositionMenu");
  }
  static {
    this.ActivityBarPositionMenu = new _MenuId("ActivityBarPositionMenu");
  }
  static {
    this.NotificationsCenterPositionMenu = new _MenuId("NotificationsCenterPositionMenu");
  }
  static {
    this.MenubarPreferencesMenu = new _MenuId("MenubarPreferencesMenu");
  }
  static {
    this.MenubarRecentMenu = new _MenuId("MenubarRecentMenu");
  }
  static {
    this.MenubarSelectionMenu = new _MenuId("MenubarSelectionMenu");
  }
  static {
    this.MenubarShare = new _MenuId("MenubarShare");
  }
  static {
    this.MenubarSwitchEditorMenu = new _MenuId("MenubarSwitchEditorMenu");
  }
  static {
    this.MenubarSwitchGroupMenu = new _MenuId("MenubarSwitchGroupMenu");
  }
  static {
    this.MenubarTerminalMenu = new _MenuId("MenubarTerminalMenu");
  }
  static {
    this.MenubarTerminalSuggestStatusMenu = new _MenuId("MenubarTerminalSuggestStatusMenu");
  }
  static {
    this.MenubarViewMenu = new _MenuId("MenubarViewMenu");
  }
  static {
    this.MenubarHomeMenu = new _MenuId("MenubarHomeMenu");
  }
  static {
    this.OpenEditorsContext = new _MenuId("OpenEditorsContext");
  }
  static {
    this.OpenEditorsContextShare = new _MenuId("OpenEditorsContextShare");
  }
  static {
    this.ProblemsPanelContext = new _MenuId("ProblemsPanelContext");
  }
  static {
    this.SCMInputBox = new _MenuId("SCMInputBox");
  }
  static {
    this.SCMChangeContext = new _MenuId("SCMChangeContext");
  }
  static {
    this.SCMResourceContext = new _MenuId("SCMResourceContext");
  }
  static {
    this.SCMResourceContextShare = new _MenuId("SCMResourceContextShare");
  }
  static {
    this.SCMResourceFolderContext = new _MenuId("SCMResourceFolderContext");
  }
  static {
    this.SCMResourceGroupContext = new _MenuId("SCMResourceGroupContext");
  }
  static {
    this.SCMSourceControl = new _MenuId("SCMSourceControl");
  }
  static {
    this.SCMSourceControlInline = new _MenuId("SCMSourceControlInline");
  }
  static {
    this.SCMSourceControlTitle = new _MenuId("SCMSourceControlTitle");
  }
  static {
    this.SCMHistoryTitle = new _MenuId("SCMHistoryTitle");
  }
  static {
    this.SCMHistoryItemContext = new _MenuId("SCMHistoryItemContext");
  }
  static {
    this.SCMHistoryItemChangeContext = new _MenuId("SCMHistoryItemChangeContext");
  }
  static {
    this.SCMHistoryItemRefContext = new _MenuId("SCMHistoryItemRefContext");
  }
  static {
    this.SCMArtifactGroupContext = new _MenuId("SCMArtifactGroupContext");
  }
  static {
    this.SCMArtifactContext = new _MenuId("SCMArtifactContext");
  }
  static {
    this.SCMQuickDiffDecorations = new _MenuId("SCMQuickDiffDecorations");
  }
  static {
    this.SCMTitle = new _MenuId("SCMTitle");
  }
  static {
    this.SearchContext = new _MenuId("SearchContext");
  }
  static {
    this.SearchActionMenu = new _MenuId("SearchActionContext");
  }
  static {
    this.StatusBarWindowIndicatorMenu = new _MenuId("StatusBarWindowIndicatorMenu");
  }
  static {
    this.StatusBarRemoteIndicatorMenu = new _MenuId("StatusBarRemoteIndicatorMenu");
  }
  static {
    this.StickyScrollContext = new _MenuId("StickyScrollContext");
  }
  static {
    this.TestItem = new _MenuId("TestItem");
  }
  static {
    this.TestItemGutter = new _MenuId("TestItemGutter");
  }
  static {
    this.TestProfilesContext = new _MenuId("TestProfilesContext");
  }
  static {
    this.TestMessageContext = new _MenuId("TestMessageContext");
  }
  static {
    this.TestMessageContent = new _MenuId("TestMessageContent");
  }
  static {
    this.TestPeekElement = new _MenuId("TestPeekElement");
  }
  static {
    this.TestPeekTitle = new _MenuId("TestPeekTitle");
  }
  static {
    this.TestCallStack = new _MenuId("TestCallStack");
  }
  static {
    this.TestCoverageFilterItem = new _MenuId("TestCoverageFilterItem");
  }
  static {
    this.TouchBarContext = new _MenuId("TouchBarContext");
  }
  static {
    this.TitleBar = new _MenuId("TitleBar");
  }
  static {
    this.TitleBarAdjacentCenter = new _MenuId("TitleBarAdjacentCenter");
  }
  static {
    this.TitleBarUpdate = new _MenuId("TitleBarUpdate");
  }
  static {
    this.TitleBarContext = new _MenuId("TitleBarContext");
  }
  static {
    this.TitleBarTitleContext = new _MenuId("TitleBarTitleContext");
  }
  static {
    this.TunnelContext = new _MenuId("TunnelContext");
  }
  static {
    this.TunnelPrivacy = new _MenuId("TunnelPrivacy");
  }
  static {
    this.TunnelProtocol = new _MenuId("TunnelProtocol");
  }
  static {
    this.TunnelPortInline = new _MenuId("TunnelInline");
  }
  static {
    this.TunnelTitle = new _MenuId("TunnelTitle");
  }
  static {
    this.TunnelLocalAddressInline = new _MenuId("TunnelLocalAddressInline");
  }
  static {
    this.TunnelOriginInline = new _MenuId("TunnelOriginInline");
  }
  static {
    this.ViewItemContext = new _MenuId("ViewItemContext");
  }
  static {
    this.ViewContainerTitle = new _MenuId("ViewContainerTitle");
  }
  static {
    this.ViewContainerTitleContext = new _MenuId("ViewContainerTitleContext");
  }
  static {
    this.ViewTitle = new _MenuId("ViewTitle");
  }
  static {
    this.ViewTitleContext = new _MenuId("ViewTitleContext");
  }
  static {
    this.CommentEditorActions = new _MenuId("CommentEditorActions");
  }
  static {
    this.CommentThreadTitle = new _MenuId("CommentThreadTitle");
  }
  static {
    this.CommentThreadActions = new _MenuId("CommentThreadActions");
  }
  static {
    this.CommentThreadAdditionalActions = new _MenuId("CommentThreadAdditionalActions");
  }
  static {
    this.CommentThreadTitleContext = new _MenuId("CommentThreadTitleContext");
  }
  static {
    this.CommentThreadCommentContext = new _MenuId("CommentThreadCommentContext");
  }
  static {
    this.CommentTitle = new _MenuId("CommentTitle");
  }
  static {
    this.CommentActions = new _MenuId("CommentActions");
  }
  static {
    this.CommentsViewThreadActions = new _MenuId("CommentsViewThreadActions");
  }
  static {
    this.InteractiveToolbar = new _MenuId("InteractiveToolbar");
  }
  static {
    this.InteractiveCellTitle = new _MenuId("InteractiveCellTitle");
  }
  static {
    this.InteractiveCellDelete = new _MenuId("InteractiveCellDelete");
  }
  static {
    this.InteractiveCellExecute = new _MenuId("InteractiveCellExecute");
  }
  static {
    this.InteractiveInputExecute = new _MenuId("InteractiveInputExecute");
  }
  static {
    this.InteractiveInputConfig = new _MenuId("InteractiveInputConfig");
  }
  static {
    this.ReplInputExecute = new _MenuId("ReplInputExecute");
  }
  static {
    this.IssueReporter = new _MenuId("IssueReporter");
  }
  static {
    this.NotebookToolbar = new _MenuId("NotebookToolbar");
  }
  static {
    this.NotebookToolbarContext = new _MenuId("NotebookToolbarContext");
  }
  static {
    this.NotebookStickyScrollContext = new _MenuId("NotebookStickyScrollContext");
  }
  static {
    this.NotebookCellTitle = new _MenuId("NotebookCellTitle");
  }
  static {
    this.NotebookCellDelete = new _MenuId("NotebookCellDelete");
  }
  static {
    this.NotebookCellInsert = new _MenuId("NotebookCellInsert");
  }
  static {
    this.NotebookCellBetween = new _MenuId("NotebookCellBetween");
  }
  static {
    this.NotebookCellListTop = new _MenuId("NotebookCellTop");
  }
  static {
    this.NotebookCellExecute = new _MenuId("NotebookCellExecute");
  }
  static {
    this.NotebookCellExecuteGoTo = new _MenuId("NotebookCellExecuteGoTo");
  }
  static {
    this.NotebookCellExecutePrimary = new _MenuId("NotebookCellExecutePrimary");
  }
  static {
    this.NotebookDiffCellInputTitle = new _MenuId("NotebookDiffCellInputTitle");
  }
  static {
    this.NotebookDiffDocumentMetadata = new _MenuId("NotebookDiffDocumentMetadata");
  }
  static {
    this.NotebookDiffCellMetadataTitle = new _MenuId("NotebookDiffCellMetadataTitle");
  }
  static {
    this.NotebookDiffCellOutputsTitle = new _MenuId("NotebookDiffCellOutputsTitle");
  }
  static {
    this.NotebookOutputToolbar = new _MenuId("NotebookOutputToolbar");
  }
  static {
    this.NotebookOutlineFilter = new _MenuId("NotebookOutlineFilter");
  }
  static {
    this.NotebookOutlineActionMenu = new _MenuId("NotebookOutlineActionMenu");
  }
  static {
    this.NotebookEditorLayoutConfigure = new _MenuId("NotebookEditorLayoutConfigure");
  }
  static {
    this.NotebookKernelSource = new _MenuId("NotebookKernelSource");
  }
  static {
    this.BulkEditTitle = new _MenuId("BulkEditTitle");
  }
  static {
    this.BulkEditContext = new _MenuId("BulkEditContext");
  }
  static {
    this.TimelineItemContext = new _MenuId("TimelineItemContext");
  }
  static {
    this.TimelineTitle = new _MenuId("TimelineTitle");
  }
  static {
    this.TimelineTitleContext = new _MenuId("TimelineTitleContext");
  }
  static {
    this.TimelineFilterSubMenu = new _MenuId("TimelineFilterSubMenu");
  }
  static {
    this.AccountsContext = new _MenuId("AccountsContext");
  }
  static {
    this.SidebarTitle = new _MenuId("SidebarTitle");
  }
  static {
    this.PanelTitle = new _MenuId("PanelTitle");
  }
  static {
    this.AuxiliaryBarTitle = new _MenuId("AuxiliaryBarTitle");
  }
  static {
    this.TerminalInstanceContext = new _MenuId("TerminalInstanceContext");
  }
  static {
    this.TerminalEditorInstanceContext = new _MenuId("TerminalEditorInstanceContext");
  }
  static {
    this.TerminalNewDropdownContext = new _MenuId("TerminalNewDropdownContext");
  }
  static {
    this.TerminalTabContext = new _MenuId("TerminalTabContext");
  }
  static {
    this.TerminalTabEmptyAreaContext = new _MenuId("TerminalTabEmptyAreaContext");
  }
  static {
    this.TerminalStickyScrollContext = new _MenuId("TerminalStickyScrollContext");
  }
  static {
    this.WebviewContext = new _MenuId("WebviewContext");
  }
  static {
    this.InlineCompletionsActions = new _MenuId("InlineCompletionsActions");
  }
  static {
    this.InlineEditsActions = new _MenuId("InlineEditsActions");
  }
  static {
    this.NewFile = new _MenuId("NewFile");
  }
  static {
    this.MergeInput1Toolbar = new _MenuId("MergeToolbar1Toolbar");
  }
  static {
    this.MergeInput2Toolbar = new _MenuId("MergeToolbar2Toolbar");
  }
  static {
    this.MergeBaseToolbar = new _MenuId("MergeBaseToolbar");
  }
  static {
    this.MergeInputResultToolbar = new _MenuId("MergeToolbarResultToolbar");
  }
  static {
    this.InlineSuggestionToolbar = new _MenuId("InlineSuggestionToolbar");
  }
  static {
    this.InlineEditToolbar = new _MenuId("InlineEditToolbar");
  }
  static {
    this.ChatContext = new _MenuId("ChatContext");
  }
  static {
    this.ChatCodeBlock = new _MenuId("ChatCodeblock");
  }
  static {
    this.ChatCompareBlock = new _MenuId("ChatCompareBlock");
  }
  static {
    this.ChatMessageTitle = new _MenuId("ChatMessageTitle");
  }
  static {
    this.ChatWelcomeContext = new _MenuId("ChatWelcomeContext");
  }
  static {
    this.ChatMessageFooter = new _MenuId("ChatMessageFooter");
  }
  static {
    this.ChatSubagentContent = new _MenuId("ChatSubagentContent");
  }
  static {
    this.ChatExecute = new _MenuId("ChatExecute");
  }
  static {
    this.ChatExecuteQueue = new _MenuId("ChatExecuteQueue");
  }
  static {
    this.ChatInput = new _MenuId("ChatInput");
  }
  static {
    this.ChatInputSecondary = new _MenuId("ChatInputSecondary");
  }
  static {
    this.ChatInputStatus = new _MenuId("ChatInputStatus");
  }
  static {
    this.ChatInputSide = new _MenuId("ChatInputSide");
  }
  static {
    this.AutomationsDialogInput = new _MenuId("AutomationsDialogInput");
  }
  static {
    this.ChatModePicker = new _MenuId("ChatModePicker");
  }
  static {
    this.ChatEditingWidgetToolbar = new _MenuId("ChatEditingWidgetToolbar");
  }
  static {
    this.ChatEditingSessionChangesToolbar = new _MenuId("ChatEditingSessionChangesToolbar");
  }
  static {
    this.ChatEditingSessionTitleToolbar = new _MenuId("ChatEditingSessionTitleToolbar");
  }
  static {
    this.ChatEditingSessionChangesVersionsSubmenu = new _MenuId("ChatEditingSessionChangesVersionsSubmenu");
  }
  static {
    this.ChatEditingSessionChangesFileHeaderToolbar = new _MenuId("ChatEditingSessionChangesFileHeaderToolbar");
  }
  static {
    this.ChatEditingSessionChangesFileHeaderRightToolbar = new _MenuId("ChatEditingSessionChangesFileHeaderRightToolbar");
  }
  static {
    this.ChatEditingEditorContent = new _MenuId("ChatEditingEditorContent");
  }
  static {
    this.ChatEditingEditorHunk = new _MenuId("ChatEditingEditorHunk");
  }
  static {
    this.ChatEditingDeletedNotebookCell = new _MenuId("ChatEditingDeletedNotebookCell");
  }
  static {
    this.ChatInputAttachmentToolbar = new _MenuId("ChatInputAttachmentToolbar");
  }
  static {
    this.ChatEditingWidgetModifiedFilesToolbar = new _MenuId("ChatEditingWidgetModifiedFilesToolbar");
  }
  static {
    this.ChatInputResourceAttachmentContext = new _MenuId("ChatInputResourceAttachmentContext");
  }
  static {
    this.ChatInputSymbolAttachmentContext = new _MenuId("ChatInputSymbolAttachmentContext");
  }
  static {
    this.ChatInlineResourceAnchorContext = new _MenuId("ChatInlineResourceAnchorContext");
  }
  static {
    this.ChatInlineSymbolAnchorContext = new _MenuId("ChatInlineSymbolAnchorContext");
  }
  static {
    this.ChatMessageCheckpoint = new _MenuId("ChatMessageCheckpoint");
  }
  static {
    this.ChatMessageRestoreCheckpoint = new _MenuId("ChatMessageRestoreCheckpoint");
  }
  static {
    this.ChatNewMenu = new _MenuId("ChatNewMenu");
  }
  static {
    this.ChatEditingCodeBlockContext = new _MenuId("ChatEditingCodeBlockContext");
  }
  static {
    this.ChatTitleBarMenu = new _MenuId("ChatTitleBarMenu");
  }
  static {
    this.ChatAttachmentsContext = new _MenuId("ChatAttachmentsContext");
  }
  static {
    this.ChatTipContext = new _MenuId("ChatTipContext");
  }
  static {
    this.ChatTipToolbar = new _MenuId("ChatTipToolbar");
  }
  static {
    this.ChatToolOutputResourceToolbar = new _MenuId("ChatToolOutputResourceToolbar");
  }
  static {
    this.ChatTextEditorMenu = new _MenuId("ChatTextEditorMenu");
  }
  static {
    this.ChatToolOutputResourceContext = new _MenuId("ChatToolOutputResourceContext");
  }
  static {
    this.ChatMultiDiffContext = new _MenuId("ChatMultiDiffContext");
  }
  static {
    this.ChatConfirmationMenu = new _MenuId("ChatConfirmationMenu");
  }
  static {
    this.ChatEditorInlineMenu = new _MenuId("ChatEditorInlineGutter");
  }
  static {
    this.ChatEditorInlineExecute = new _MenuId("ChatEditorInputExecute");
  }
  static {
    this.ChatEditorInlineInputSide = new _MenuId("ChatEditorInputSide");
  }
  static {
    this.InlineChatEditorAffordance = new _MenuId("InlineChatEditorAffordance");
  }
  static {
    this.AccessibleView = new _MenuId("AccessibleView");
  }
  static {
    this.MultiDiffEditorContent = new _MenuId("MultiDiffEditorContent");
  }
  static {
    this.MultiDiffEditorFileToolbar = new _MenuId("MultiDiffEditorFileToolbar");
  }
  static {
    this.DiffEditorHunkToolbar = new _MenuId("DiffEditorHunkToolbar");
  }
  static {
    this.DiffEditorSelectionToolbar = new _MenuId("DiffEditorSelectionToolbar");
  }
  static {
    this.BrowserNavigationToolbar = new _MenuId("BrowserNavigationToolbar");
  }
  static {
    this.BrowserActionsToolbar = new _MenuId("BrowserActionsToolbar");
  }
  static {
    this.BrowserChatActionsMenu = new _MenuId("BrowserChatActionsMenu");
  }
  static {
    this.BrowserEmulationToolbar = new _MenuId("BrowserEmulationToolbar");
  }
  static {
    this.AgentSessionsViewerFilterSubMenu = new _MenuId("AgentSessionsViewerFilterSubMenu");
  }
  static {
    this.AgentSessionsExternalFilterSubMenu = new _MenuId("AgentSessionsExternalFilterSubMenu");
  }
  static {
    this.AgentSessionsContext = new _MenuId("AgentSessionsContext");
  }
  static {
    this.AgentSessionSectionContext = new _MenuId("AgentSessionSectionContext");
  }
  static {
    this.AgentSessionsCreateSubMenu = new _MenuId("AgentSessionsCreateSubMenu");
  }
  static {
    this.AgentSessionsToolbar = new _MenuId("AgentSessionsToolbar");
  }
  static {
    this.AgentSessionItemToolbar = new _MenuId("AgentSessionItemToolbar");
  }
  static {
    this.AgentSessionSectionToolbar = new _MenuId("AgentSessionSectionToolbar");
  }
  static {
    this.SessionItemContextMenu = new _MenuId("SessionItemContextMenu");
  }
  static {
    this.SessionHeaderContext = new _MenuId("SessionsSessionHeaderContext");
  }
  static {
    this.AgentsTitleBarControlMenu = new _MenuId("AgentsTitleBarControlMenu");
  }
  static {
    this.AgentsChangesToolbar = new _MenuId("AgentsChangesToolbar");
  }
  static {
    this.AgentsChangesPrimaryActionSubMenu = new _MenuId("AgentsChangesPrimaryActionSubMenu");
  }
  static {
    this.AgentsChangeInlineToolbar = new _MenuId("AgentsChangeInlineToolbar");
  }
  static {
    this.ChatViewSessionTitleNavigationToolbar = new _MenuId("ChatViewSessionTitleNavigationToolbar");
  }
  static {
    this.ChatViewSessionTitleToolbar = new _MenuId("ChatViewSessionTitleToolbar");
  }
  static {
    this.ChatContextUsageActions = new _MenuId("ChatContextUsageActions");
  }
  static {
    this.MarkerHoverStatusBar = new _MenuId("MarkerHoverParticipant.StatusBar");
  }
  /**
   * Create or reuse a `MenuId` with the given identifier
   */
  static for(identifier) {
    return _MenuId._instances.get(identifier) ?? new _MenuId(identifier);
  }
  /**
   * Create a new `MenuId` with the unique identifier. Will throw if a menu
   * with the identifier already exists, use `MenuId.for(ident)` or a unique
   * identifier
   */
  constructor(identifier) {
    if (_MenuId._instances.has(identifier)) {
      throw new TypeError(`MenuId with identifier '${identifier}' already exists. Use MenuId.for(ident) or a unique identifier`);
    }
    _MenuId._instances.set(identifier, this);
    this.id = identifier;
  }
};

var IMenuService = createDecorator2("menuService");

var MenuRegistryChangeEvent = class _MenuRegistryChangeEvent {
  constructor(id2) {
    this.id = id2;
    this.has = (candidate) => candidate === id2;
  }
  static {
    this._all = /* @__PURE__ */ new Map();
  }
  static for(id2) {
    let value = this._all.get(id2);
    if (!value) {
      value = new _MenuRegistryChangeEvent(id2);
      this._all.set(id2, value);
    }
    return value;
  }
  static merge(events) {
    const ids = /* @__PURE__ */ new Set();
    for (const item of events) {
      if (item instanceof _MenuRegistryChangeEvent) {
        ids.add(item.id);
      }
    }
    return ids;
  }
};

var MenuRegistry = new class {
  constructor() {
    this._commands = /* @__PURE__ */ new Map();
    this._menuItems = /* @__PURE__ */ new Map();
    this._onDidChangeMenu = new MicrotaskEmitter({
      merge: MenuRegistryChangeEvent.merge
    });
    this.onDidChangeMenu = this._onDidChangeMenu.event;
  }
  addCommand(command) {
    this._commands.set(command.id, command);
    this._onDidChangeMenu.fire(MenuRegistryChangeEvent.for(MenuId.CommandPalette));
    return markAsSingleton(toDisposable(() => {
      if (this._commands.delete(command.id)) {
        this._onDidChangeMenu.fire(MenuRegistryChangeEvent.for(MenuId.CommandPalette));
      }
    }));
  }
  getCommand(id2) {
    return this._commands.get(id2);
  }
  getCommands() {
    const map = /* @__PURE__ */ new Map();
    this._commands.forEach((value, key) => map.set(key, value));
    return map;
  }
  appendMenuItem(id2, item) {
    let list2 = this._menuItems.get(id2);
    if (!list2) {
      list2 = new LinkedList();
      this._menuItems.set(id2, list2);
    }
    const rm = list2.push(item);
    this._onDidChangeMenu.fire(MenuRegistryChangeEvent.for(id2));
    return markAsSingleton(toDisposable(() => {
      rm();
      this._onDidChangeMenu.fire(MenuRegistryChangeEvent.for(id2));
    }));
  }
  appendMenuItems(items) {
    const result = new DisposableStore();
    for (const { id: id2, item } of items) {
      result.add(this.appendMenuItem(id2, item));
    }
    return result;
  }
  getMenuItems(id2) {
    let result;
    if (this._menuItems.has(id2)) {
      result = [...this._menuItems.get(id2)];
    } else {
      result = [];
    }
    if (id2 === MenuId.CommandPalette) {
      this._appendImplicitItems(result);
    }
    return result;
  }
  _appendImplicitItems(result) {
    const set = /* @__PURE__ */ new Set();
    for (const item of result) {
      if (isIMenuItem(item)) {
        set.add(item.command.id);
        if (item.alt) {
          set.add(item.alt.id);
        }
      }
    }
    this._commands.forEach((command, id2) => {
      if (!set.has(id2)) {
        result.push({ command });
      }
    });
  }
}();

var MenuItemAction = class {
  constructor(item, alt, options2, hideActions, menuKeybinding, contextKeyService, _commandService) {
    this.hideActions = hideActions;
    this.menuKeybinding = menuKeybinding;
    this._commandService = _commandService;
    this.id = item.id;
    this.label = MenuItemAction.label(item, options2);
    this.tooltip = (typeof item.tooltip === "string" ? item.tooltip : item.tooltip?.value) ?? "";
    this.enabled = !item.precondition || contextKeyService.contextMatchesRules(item.precondition);
    this.checked = void 0;
    let icon;
    if (item.toggled) {
      const toggled = item.toggled.condition ? item.toggled : { condition: item.toggled };
      this.checked = contextKeyService.contextMatchesRules(toggled.condition);
      if (this.checked && toggled.tooltip) {
        this.tooltip = typeof toggled.tooltip === "string" ? toggled.tooltip : toggled.tooltip.value;
      }
      if (this.checked && ThemeIcon.isThemeIcon(toggled.icon)) {
        icon = toggled.icon;
      }
      if (this.checked && toggled.title) {
        this.label = typeof toggled.title === "string" ? toggled.title : toggled.title.value;
      }
    }
    if (!icon) {
      icon = ThemeIcon.isThemeIcon(item.icon) ? item.icon : void 0;
    }
    this.item = item;
    this.alt = alt ? new MenuItemAction(alt, void 0, options2, hideActions, void 0, contextKeyService, _commandService) : void 0;
    this._options = options2;
    this.class = icon && ThemeIcon.asClassName(icon);
  }
  static label(action, options2) {
    return options2?.renderShortTitle && action.shortTitle ? typeof action.shortTitle === "string" ? action.shortTitle : action.shortTitle.value : typeof action.title === "string" ? action.title : action.title.value;
  }
  run(...args2) {
    let runArgs = [];
    if (this._options?.args) {
      runArgs = [...runArgs, ...this._options.args];
    } else if (this._options?.arg) {
      runArgs = [...runArgs, this._options.arg];
    }
    if (this._options?.shouldForwardArgs) {
      runArgs = [...runArgs, ...args2];
    }
    return this._commandService.executeCommand(this.id, ...runArgs);
  }
};

MenuItemAction = __decorateClass([
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, ICommandService)
], MenuItemAction);
export { isIMenuItem, MenuId, IMenuService, MenuRegistryChangeEvent, MenuRegistry, MenuItemAction };
