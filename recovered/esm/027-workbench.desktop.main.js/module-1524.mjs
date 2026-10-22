// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/actions/common/menusExtensionPoint.ts
import { MenuId, MenuRegistry } from "./module-0092.mjs";
import { localize } from "./module-0001.mjs";
import { index } from "./module-0007.mjs";
import { isFalsyOrWhitespace } from "./module-0030.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { ExtensionsRegistry } from "./module-0876.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { joinPath } from "./module-0034.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { isProposedApiEnabled } from "./module-0887.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { platform2 } from "./module-0015.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions11 } from "./module-0877.mjs";
import { SyncDescriptor } from "./module-0134.mjs";


// src/vs/workbench/services/actions/common/menusExtensionPoint.ts
var apiMenus = [
  {
    key: "commandPalette",
    id: MenuId.CommandPalette,
    description: localize(22611, null),
    supportsSubmenus: false
  },
  {
    key: "touchBar",
    id: MenuId.TouchBarContext,
    description: localize(22650, null),
    supportsSubmenus: false
  },
  {
    key: "editor/title",
    id: MenuId.EditorTitle,
    description: localize(22622, null)
  },
  {
    key: "modalEditor/editorTitle",
    id: MenuId.ModalEditorEditorTitle,
    description: localize(22633, null)
  },
  {
    key: "editor/title/run",
    id: MenuId.EditorTitleRun,
    description: localize(22624, null)
  },
  {
    key: "editor/context",
    id: MenuId.EditorContext,
    description: localize(22618, null)
  },
  {
    key: "editor/context/copy",
    id: MenuId.EditorContextCopy,
    description: localize(22619, null)
  },
  {
    key: "editor/context/share",
    id: MenuId.EditorContextShare,
    description: localize(22620, null),
    proposed: "contribShareMenu"
  },
  {
    key: "explorer/context",
    id: MenuId.ExplorerContext,
    description: localize(22625, null)
  },
  {
    key: "explorer/context/share",
    id: MenuId.ExplorerContextShare,
    description: localize(22626, null),
    proposed: "contribShareMenu"
  },
  {
    key: "editor/title/context",
    id: MenuId.EditorTitleContext,
    description: localize(22621, null)
  },
  {
    key: "editor/title/context/share",
    id: MenuId.EditorTitleContextShare,
    description: localize(22623, null),
    proposed: "contribShareMenu"
  },
  {
    key: "debug/callstack/context",
    id: MenuId.DebugCallStackContext,
    description: localize(22612, null)
  },
  {
    key: "debug/variables/context",
    id: MenuId.DebugVariablesContext,
    description: localize(22615, null)
  },
  {
    key: "debug/watch/context",
    id: MenuId.DebugWatchContext,
    description: localize(22616, null)
  },
  {
    key: "debug/toolBar",
    id: MenuId.DebugToolBar,
    description: localize(22614, null)
  },
  {
    key: "debug/createConfiguration",
    id: MenuId.DebugCreateConfiguration,
    proposed: "contribDebugCreateConfiguration",
    description: localize(22613, null)
  },
  {
    key: "notebook/variables/context",
    id: MenuId.NotebookVariablesContext,
    description: localize(22636, null)
  },
  {
    key: "menuBar/home",
    id: MenuId.MenubarHomeMenu,
    description: localize(22630, null),
    proposed: "contribMenuBarHome",
    supportsSubmenus: false
  },
  {
    key: "menuBar/edit/copy",
    id: MenuId.MenubarCopy,
    description: localize(22637, null)
  },
  {
    key: "chat/input/status",
    id: MenuId.ChatInputStatus,
    description: localize(22604, null),
    supportsSubmenus: false
  },
  {
    key: "scm/title",
    id: MenuId.SCMTitle,
    description: localize(22645, null)
  },
  {
    key: "scm/sourceControl",
    id: MenuId.SCMSourceControl,
    description: localize(22642, null)
  },
  {
    key: "scm/repositories/title",
    id: MenuId.SCMSourceControlTitle,
    description: localize(22644, null),
    proposed: "contribSourceControlTitleMenu"
  },
  {
    key: "scm/repository",
    id: MenuId.SCMSourceControlInline,
    description: localize(22643, null)
  },
  {
    key: "scm/resourceState/context",
    id: MenuId.SCMResourceContext,
    description: localize(22640, null)
  },
  {
    key: "scm/resourceFolder/context",
    id: MenuId.SCMResourceFolderContext,
    description: localize(22638, null)
  },
  {
    key: "scm/resourceGroup/context",
    id: MenuId.SCMResourceGroupContext,
    description: localize(22639, null)
  },
  {
    key: "scm/change/title",
    id: MenuId.SCMChangeContext,
    description: localize(22597, null)
  },
  {
    key: "scm/inputBox",
    id: MenuId.SCMInputBox,
    description: localize(22631, null),
    proposed: "contribSourceControlInputBoxMenu"
  },
  {
    key: "scm/history/title",
    id: MenuId.SCMHistoryTitle,
    description: localize(22641, null),
    proposed: "contribSourceControlHistoryTitleMenu"
  },
  {
    key: "scm/historyItem/context",
    id: MenuId.SCMHistoryItemContext,
    description: localize(22628, null),
    proposed: "contribSourceControlHistoryItemMenu"
  },
  {
    key: "scm/historyItemRef/context",
    id: MenuId.SCMHistoryItemRefContext,
    description: localize(22629, null),
    proposed: "contribSourceControlHistoryItemMenu"
  },
  {
    key: "scm/artifactGroup/context",
    id: MenuId.SCMArtifactGroupContext,
    description: localize(22596, null),
    proposed: "contribSourceControlArtifactGroupMenu"
  },
  {
    key: "scm/artifact/context",
    id: MenuId.SCMArtifactContext,
    description: localize(22595, null),
    proposed: "contribSourceControlArtifactMenu"
  },
  {
    key: "statusBar/remoteIndicator",
    id: MenuId.StatusBarRemoteIndicatorMenu,
    description: localize(22647, null),
    supportsSubmenus: false
  },
  {
    key: "terminal/context",
    id: MenuId.TerminalInstanceContext,
    description: localize(22648, null)
  },
  {
    key: "terminal/title/context",
    id: MenuId.TerminalTabContext,
    description: localize(22649, null)
  },
  {
    key: "view/title",
    id: MenuId.ViewTitle,
    description: localize(22688, null)
  },
  {
    key: "viewContainer/title",
    id: MenuId.ViewContainerTitle,
    description: localize(22681, null),
    proposed: "contribViewContainerTitle"
  },
  {
    key: "view/item/context",
    id: MenuId.ViewItemContext,
    description: localize(22682, null)
  },
  {
    key: "comments/comment/editorActions",
    id: MenuId.CommentEditorActions,
    description: localize(22578, null),
    proposed: "contribCommentEditorActionsMenu"
  },
  {
    key: "comments/commentThread/title",
    id: MenuId.CommentThreadTitle,
    description: localize(22579, null)
  },
  {
    key: "comments/commentThread/context",
    id: MenuId.CommentThreadActions,
    description: localize(22577, null),
    supportsSubmenus: false
  },
  {
    key: "comments/commentThread/additionalActions",
    id: MenuId.CommentThreadAdditionalActions,
    description: localize(22577, null),
    supportsSubmenus: true,
    proposed: "contribCommentThreadAdditionalMenu"
  },
  {
    key: "comments/commentThread/title/context",
    id: MenuId.CommentThreadTitleContext,
    description: localize(22580, null),
    proposed: "contribCommentPeekContext"
  },
  {
    key: "comments/comment/title",
    id: MenuId.CommentTitle,
    description: localize(22575, null)
  },
  {
    key: "comments/comment/context",
    id: MenuId.CommentActions,
    description: localize(22573, null),
    supportsSubmenus: false
  },
  {
    key: "comments/commentThread/comment/context",
    id: MenuId.CommentThreadCommentContext,
    description: localize(22574, null),
    proposed: "contribCommentPeekContext"
  },
  {
    key: "commentsView/commentThread/context",
    id: MenuId.CommentsViewThreadActions,
    description: localize(22576, null),
    proposed: "contribCommentsViewThreadMenus"
  },
  {
    key: "notebook/toolbar",
    id: MenuId.NotebookToolbar,
    description: localize(22659, null)
  },
  {
    key: "notebook/kernelSource",
    id: MenuId.NotebookKernelSource,
    description: localize(22658, null),
    proposed: "notebookKernelSource"
  },
  {
    key: "notebook/cell/title",
    id: MenuId.NotebookCellTitle,
    description: localize(22657, null)
  },
  {
    key: "notebook/cell/execute",
    id: MenuId.NotebookCellExecute,
    description: localize(22656, null)
  },
  {
    key: "interactive/toolbar",
    id: MenuId.InteractiveToolbar,
    description: localize(22588, null)
  },
  {
    key: "interactive/cell/title",
    id: MenuId.InteractiveCellTitle,
    description: localize(22587, null)
  },
  {
    key: "issue/reporter",
    id: MenuId.IssueReporter,
    description: localize(22589, null)
  },
  {
    key: "testing/item/context",
    id: MenuId.TestItem,
    description: localize(22674, null)
  },
  {
    key: "testing/item/gutter",
    id: MenuId.TestItemGutter,
    description: localize(22675, null)
  },
  {
    key: "testing/profiles/context",
    id: MenuId.TestProfilesContext,
    description: localize(22679, null)
  },
  {
    key: "testing/item/result",
    id: MenuId.TestPeekElement,
    description: localize(22676, null)
  },
  {
    key: "testing/message/context",
    id: MenuId.TestMessageContext,
    description: localize(22678, null)
  },
  {
    key: "testing/message/content",
    id: MenuId.TestMessageContent,
    description: localize(22677, null)
  },
  {
    key: "extension/context",
    id: MenuId.ExtensionContext,
    description: localize(22627, null)
  },
  {
    key: "timeline/title",
    id: MenuId.TimelineTitle,
    description: localize(22684, null)
  },
  {
    key: "timeline/item/context",
    id: MenuId.TimelineItemContext,
    description: localize(22683, null)
  },
  {
    key: "ports/item/context",
    id: MenuId.TunnelContext,
    description: localize(22685, null)
  },
  {
    key: "ports/item/origin/inline",
    id: MenuId.TunnelOriginInline,
    description: localize(22686, null)
  },
  {
    key: "ports/item/port/inline",
    id: MenuId.TunnelPortInline,
    description: localize(22687, null)
  },
  {
    key: "file/newFile",
    id: MenuId.NewFile,
    description: localize(22585, null),
    supportsSubmenus: false
  },
  {
    key: "webview/context",
    id: MenuId.WebviewContext,
    description: localize(22711, null)
  },
  {
    key: "file/share",
    id: MenuId.MenubarShare,
    description: localize(22646, null),
    proposed: "contribShareMenu"
  },
  {
    key: "editor/inlineCompletions/actions",
    id: MenuId.InlineCompletionsActions,
    description: localize(22586, null),
    supportsSubmenus: false,
    proposed: "inlineCompletionsAdditions"
  },
  {
    key: "editor/content",
    id: MenuId.EditorContent,
    description: localize(22651, null),
    proposed: "contribEditorContentMenu"
  },
  {
    key: "editor/lineNumber/context",
    id: MenuId.EditorLineNumberContext,
    description: localize(22584, null)
  },
  {
    key: "mergeEditor/result/title",
    id: MenuId.MergeInputResultToolbar,
    description: localize(22632, null),
    proposed: "contribMergeEditorMenus"
  },
  {
    key: "multiDiffEditor/content",
    id: MenuId.MultiDiffEditorContent,
    description: localize(22634, null),
    proposed: "contribEditorContentMenu"
  },
  {
    key: "multiDiffEditor/resource/title",
    id: MenuId.MultiDiffEditorFileToolbar,
    description: localize(22635, null),
    proposed: "contribMultiDiffEditorMenus"
  },
  {
    key: "diffEditor/gutter/hunk",
    id: MenuId.DiffEditorHunkToolbar,
    description: localize(22617, null),
    proposed: "contribDiffEditorGutterToolBarMenus"
  },
  {
    key: "diffEditor/gutter/selection",
    id: MenuId.DiffEditorSelectionToolbar,
    description: localize(22617, null),
    proposed: "contribDiffEditorGutterToolBarMenus"
  },
  {
    key: "searchPanel/aiResults/commands",
    id: MenuId.SearchActionMenu,
    description: localize(22669, null)
  },
  {
    key: "editor/context/chat",
    id: MenuId.ChatTextEditorMenu,
    description: localize(22610, null),
    supportsSubmenus: false,
    proposed: "chatParticipantPrivate"
  },
  {
    key: "chat/input/editing/sessionToolbar",
    id: MenuId.ChatEditingSessionChangesToolbar,
    description: localize(22601, null),
    proposed: "chatSessionsProvider"
  },
  {
    key: "chat/input/editing/sessionTitleToolbar",
    id: MenuId.ChatEditingSessionTitleToolbar,
    description: localize(22602, null),
    proposed: "chatSessionsProvider"
  },
  {
    // TODO: rename this to something like: `chatSessions/item/inline`
    key: "chat/chatSessions",
    id: MenuId.AgentSessionsContext,
    description: localize(22607, null),
    supportsSubmenus: false,
    proposed: "chatSessionsProvider"
  },
  {
    key: "chatSessions/item/context",
    id: MenuId.SessionItemContextMenu,
    description: localize(22608, null),
    supportsSubmenus: false,
    proposed: "chatSessionsProvider"
  },
  {
    key: "chatSessions/newSession",
    id: MenuId.AgentSessionsCreateSubMenu,
    description: localize(22609, null),
    supportsSubmenus: false,
    proposed: "chatSessionsProvider"
  },
  {
    key: "chat/multiDiff/context",
    id: MenuId.ChatMultiDiffContext,
    description: localize(22605, null),
    supportsSubmenus: false,
    proposed: "chatSessionsProvider"
  },
  {
    key: "chat/customizations/create",
    id: MenuId.for("AICustomizationManagementCreate"),
    description: localize(22599, null),
    supportsSubmenus: false,
    proposed: "chatSessionCustomizationProvider"
  },
  {
    key: "chat/customizations/item",
    id: MenuId.for("AICustomizationManagementEditorItem"),
    description: localize(22600, null),
    supportsSubmenus: false,
    proposed: "chatSessionCustomizationProvider"
  },
  {
    key: "chat/editor/inlineGutter",
    id: MenuId.ChatEditorInlineMenu,
    description: localize(22603, null),
    supportsSubmenus: false,
    proposed: "contribChatEditorInlineGutterMenu"
  },
  {
    key: "chat/contextUsage/actions",
    id: MenuId.ChatContextUsageActions,
    description: localize(22598, null),
    proposed: "chatParticipantAdditions"
  },
  {
    key: "chat/newSession",
    id: MenuId.ChatNewMenu,
    description: localize(22606, null),
    proposed: "chatSessionsProvider"
  },
  {
    key: "agents/changes/actions",
    id: MenuId.AgentsChangesToolbar,
    description: localize(22594, null),
    proposed: "chatSessionsProvider"
  },
  {
    key: "agents/changes/actions/primary",
    id: MenuId.AgentsChangesPrimaryActionSubMenu,
    description: localize(22593, null),
    proposed: "chatSessionsProvider"
  },
  {
    key: "agents/change/inline",
    id: MenuId.AgentsChangeInlineToolbar,
    description: localize(22592, null),
    proposed: "chatSessionsProvider"
  }
];

var schema3;

((schema10) => {
  function isMenuItem(item) {
    return typeof item.command === "string";
  }
  schema10.isMenuItem = isMenuItem;
  function isValidMenuItem(item, collector) {
    if (typeof item.command !== "string") {
      collector.error(localize(22666, null, "command"));
      return false;
    }
    if (item.alt && typeof item.alt !== "string") {
      collector.error(localize(22661, null, "alt"));
      return false;
    }
    if (item.when && typeof item.when !== "string") {
      collector.error(localize(22661, null, "when"));
      return false;
    }
    if (item.group && typeof item.group !== "string") {
      collector.error(localize(22661, null, "group"));
      return false;
    }
    return true;
  }
  schema10.isValidMenuItem = isValidMenuItem;
  function isValidSubmenuItem(item, collector) {
    if (typeof item.submenu !== "string") {
      collector.error(localize(22666, null, "submenu"));
      return false;
    }
    if (item.when && typeof item.when !== "string") {
      collector.error(localize(22661, null, "when"));
      return false;
    }
    if (item.group && typeof item.group !== "string") {
      collector.error(localize(22661, null, "group"));
      return false;
    }
    return true;
  }
  schema10.isValidSubmenuItem = isValidSubmenuItem;
  function isValidItems(items, collector) {
    if (!Array.isArray(items)) {
      collector.error(localize(22665, null));
      return false;
    }
    for (const item of items) {
      if (isMenuItem(item)) {
        if (!isValidMenuItem(item, collector)) {
          return false;
        }
      } else {
        if (!isValidSubmenuItem(item, collector)) {
          return false;
        }
      }
    }
    return true;
  }
  schema10.isValidItems = isValidItems;
  function isValidSubmenu(submenu2, collector) {
    if (typeof submenu2 !== "object") {
      collector.error(localize(22664, null));
      return false;
    }
    if (typeof submenu2.id !== "string") {
      collector.error(localize(22666, null, "id"));
      return false;
    }
    if (typeof submenu2.label !== "string") {
      collector.error(localize(22666, null, "label"));
      return false;
    }
    return true;
  }
  schema10.isValidSubmenu = isValidSubmenu;
  const menuItem = {
    type: "object",
    required: ["command"],
    properties: {
      command: {
        description: localize(22700, null),
        type: "string"
      },
      alt: {
        description: localize(22699, null),
        type: "string"
      },
      when: {
        description: localize(22703, null),
        type: "string"
      },
      group: {
        description: localize(22701, null),
        type: "string"
      }
    }
  };
  const submenuItem = {
    type: "object",
    required: ["submenu"],
    properties: {
      submenu: {
        description: localize(22702, null),
        type: "string"
      },
      when: {
        description: localize(22703, null),
        type: "string"
      },
      group: {
        description: localize(22701, null),
        type: "string"
      }
    }
  };
  const submenu = {
    type: "object",
    required: ["id", "label"],
    properties: {
      id: {
        description: localize(22708, null),
        type: "string"
      },
      label: {
        description: localize(22709, null),
        type: "string"
      },
      icon: {
        description: localize(22705, null),
        anyOf: [
          {
            type: "string"
          },
          {
            type: "object",
            properties: {
              light: {
                description: localize(22707, null),
                type: "string"
              },
              dark: {
                description: localize(22706, null),
                type: "string"
              }
            }
          }
        ]
      }
    }
  };
  schema10.menusContribution = {
    description: localize(22704, null),
    type: "object",
    properties: index(apiMenus, (menu) => menu.key, (menu) => ({
      markdownDescription: menu.proposed ? localize(22662, null, menu.proposed, menu.description) : menu.description,
      type: "array",
      items: menu.supportsSubmenus === false ? menuItem : { oneOf: [menuItem, submenuItem] }
    })),
    additionalProperties: {
      description: "Submenu",
      type: "array",
      items: { oneOf: [menuItem, submenuItem] }
    }
  };
  schema10.submenusContribution = {
    description: localize(22710, null),
    type: "array",
    items: submenu
  };
  function isValidCommand(command4, collector) {
    if (!command4) {
      collector.error(localize(22655, null));
      return false;
    }
    if (isFalsyOrWhitespace(command4.command)) {
      collector.error(localize(22666, null, "command"));
      return false;
    }
    if (!isValidLocalizedString(command4.title, collector, "title")) {
      return false;
    }
    if (command4.shortTitle && !isValidLocalizedString(command4.shortTitle, collector, "shortTitle")) {
      return false;
    }
    if (command4.enablement && typeof command4.enablement !== "string") {
      collector.error(localize(22661, null, "precondition"));
      return false;
    }
    if (command4.category && !isValidLocalizedString(command4.category, collector, "category")) {
      return false;
    }
    if (!isValidIcon(command4.icon, collector)) {
      return false;
    }
    return true;
  }
  schema10.isValidCommand = isValidCommand;
  function isValidIcon(icon2, collector) {
    if (typeof icon2 === "undefined") {
      return true;
    }
    if (typeof icon2 === "string") {
      return true;
    } else if (typeof icon2.dark === "string" && typeof icon2.light === "string") {
      return true;
    }
    collector.error(localize(22660, null));
    return false;
  }
  function isValidLocalizedString(localized, collector, propertyName) {
    if (typeof localized === "undefined") {
      collector.error(localize(22667, null, propertyName));
      return false;
    } else if (typeof localized === "string" && isFalsyOrWhitespace(localized)) {
      collector.error(localize(22666, null, propertyName));
      return false;
    } else if (typeof localized !== "string" && (isFalsyOrWhitespace(localized.original) || isFalsyOrWhitespace(localized.value))) {
      collector.error(localize(22668, null, `${propertyName}.value`, `${propertyName}.original`));
      return false;
    }
    return true;
  }
  const commandType = {
    type: "object",
    required: ["command", "title"],
    properties: {
      command: {
        description: localize(22692, null),
        type: "string"
      },
      title: {
        description: localize(22698, null),
        type: "string"
      },
      shortTitle: {
        markdownDescription: localize(22697, null),
        type: "string"
      },
      category: {
        description: localize(22691, null),
        type: "string"
      },
      enablement: {
        description: localize(22696, null),
        type: "string"
      },
      icon: {
        description: localize(22693, null),
        anyOf: [
          {
            type: "string"
          },
          {
            type: "object",
            properties: {
              light: {
                description: localize(22695, null),
                type: "string"
              },
              dark: {
                description: localize(22694, null),
                type: "string"
              }
            }
          }
        ]
      }
    }
  };
  schema10.commandsContribution = {
    description: localize(22690, null),
    oneOf: [
      commandType,
      {
        type: "array",
        items: commandType
      }
    ]
  };
})(schema3 || (schema3 = {}));

var _commandRegistrations = new DisposableStore();

var commandsExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "commands",
  jsonSchema: schema3.commandsContribution,
  activationEventsGenerator: function* (contribs) {
    for (const contrib of contribs) {
      if (contrib.command) {
        yield `onCommand:${contrib.command}`;
      }
    }
  }
});

commandsExtensionPoint.setHandler((extensions) => {
  function handleCommand(userFriendlyCommand, extension) {
    if (!schema3.isValidCommand(userFriendlyCommand, extension.collector)) {
      return;
    }
    const { icon: icon2, enablement, category: category11, title, shortTitle, command: command4 } = userFriendlyCommand;
    let absoluteIcon;
    if (icon2) {
      if (typeof icon2 === "string") {
        absoluteIcon = ThemeIcon.fromString(icon2) ?? { dark: joinPath(extension.description.extensionLocation, icon2), light: joinPath(extension.description.extensionLocation, icon2) };
      } else {
        absoluteIcon = {
          dark: joinPath(extension.description.extensionLocation, icon2.dark),
          light: joinPath(extension.description.extensionLocation, icon2.light)
        };
      }
    }
    const existingCmd = MenuRegistry.getCommand(command4);
    if (existingCmd) {
      if (existingCmd.source) {
        extension.collector.info(localize(22582, null, userFriendlyCommand.command, existingCmd.source.title, existingCmd.source.id));
      } else {
        extension.collector.info(localize(22581, null, userFriendlyCommand.command));
      }
    }
    _commandRegistrations.add(MenuRegistry.addCommand({
      id: command4,
      title,
      source: { id: extension.description.identifier.value, title: extension.description.displayName ?? extension.description.name },
      shortTitle,
      tooltip: title,
      category: category11,
      precondition: ContextKeyExpr.deserialize(enablement),
      icon: absoluteIcon
    }));
  }
  _commandRegistrations.clear();
  for (const extension of extensions) {
    const { value: value2 } = extension;
    if (Array.isArray(value2)) {
      for (const command4 of value2) {
        handleCommand(command4, extension);
      }
    } else {
      handleCommand(value2, extension);
    }
  }
});

var _submenus = /* @__PURE__ */ new Map();

var submenusExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "submenus",
  jsonSchema: schema3.submenusContribution
});

submenusExtensionPoint.setHandler((extensions) => {
  _submenus.clear();
  for (const extension of extensions) {
    const { value: value2, collector } = extension;
    for (const [, submenuInfo] of Object.entries(value2)) {
      if (!schema3.isValidSubmenu(submenuInfo, collector)) {
        continue;
      }
      if (!submenuInfo.id) {
        collector.warn(localize(22671, null, submenuInfo.id));
        continue;
      }
      if (_submenus.has(submenuInfo.id)) {
        collector.info(localize(22670, null, submenuInfo.id));
        continue;
      }
      if (!submenuInfo.label) {
        collector.warn(localize(22672, null, submenuInfo.label));
        continue;
      }
      let absoluteIcon;
      if (submenuInfo.icon) {
        if (typeof submenuInfo.icon === "string") {
          absoluteIcon = ThemeIcon.fromString(submenuInfo.icon) || { dark: joinPath(extension.description.extensionLocation, submenuInfo.icon) };
        } else {
          absoluteIcon = {
            dark: joinPath(extension.description.extensionLocation, submenuInfo.icon.dark),
            light: joinPath(extension.description.extensionLocation, submenuInfo.icon.light)
          };
        }
      }
      const item = {
        id: MenuId.for(`api:${submenuInfo.id}`),
        label: submenuInfo.label,
        icon: absoluteIcon
      };
      _submenus.set(submenuInfo.id, item);
    }
  }
});

var _apiMenusByKey = new Map(apiMenus.map((menu) => [menu.key, menu]));

var _menuRegistrations = new DisposableStore();

var _submenuMenuItems = /* @__PURE__ */ new Map();

var menusExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "menus",
  jsonSchema: schema3.menusContribution,
  deps: [submenusExtensionPoint]
});

menusExtensionPoint.setHandler((extensions) => {
  _menuRegistrations.clear();
  _submenuMenuItems.clear();
  for (const extension of extensions) {
    const { value: value2, collector } = extension;
    for (const entry of Object.entries(value2)) {
      if (!schema3.isValidItems(entry[1], collector)) {
        continue;
      }
      let menu = _apiMenusByKey.get(entry[0]);
      if (!menu) {
        const submenu = _submenus.get(entry[0]);
        if (submenu) {
          menu = {
            key: entry[0],
            id: submenu.id,
            description: ""
          };
        }
      }
      if (!menu) {
        continue;
      }
      if (menu.proposed && !isProposedApiEnabled(extension.description, menu.proposed)) {
        collector.error(localize(22663, null, entry[0], menu.proposed, extension.description.identifier.value));
        continue;
      }
      for (const menuItem of entry[1]) {
        let item;
        if (schema3.isMenuItem(menuItem)) {
          const command4 = MenuRegistry.getCommand(menuItem.command);
          const alt = menuItem.alt && MenuRegistry.getCommand(menuItem.alt) || void 0;
          if (!command4) {
            collector.error(localize(22653, null, menuItem.command));
            continue;
          }
          if (menuItem.alt && !alt) {
            collector.warn(localize(22652, null, menuItem.alt));
          }
          if (menuItem.command === menuItem.alt) {
            collector.info(localize(22583, null));
          }
          item = { command: command4, alt, group: void 0, order: void 0, when: void 0 };
        } else {
          if (menu.supportsSubmenus === false) {
            collector.error(localize(22680, null));
            continue;
          }
          const submenu = _submenus.get(menuItem.submenu);
          if (!submenu) {
            collector.error(localize(22654, null, menuItem.submenu));
            continue;
          }
          let submenuRegistrations = _submenuMenuItems.get(menu.id.id);
          if (!submenuRegistrations) {
            submenuRegistrations = /* @__PURE__ */ new Set();
            _submenuMenuItems.set(menu.id.id, submenuRegistrations);
          }
          if (submenuRegistrations.has(submenu.id.id)) {
            collector.warn(localize(22673, null, menuItem.submenu, entry[0]));
            continue;
          }
          submenuRegistrations.add(submenu.id.id);
          item = { submenu: submenu.id, icon: submenu.icon, title: submenu.label, group: void 0, order: void 0, when: void 0 };
        }
        if (menuItem.group) {
          const idx = menuItem.group.lastIndexOf("@");
          if (idx > 0) {
            item.group = menuItem.group.substr(0, idx);
            item.order = Number(menuItem.group.substr(idx + 1)) || void 0;
          } else {
            item.group = menuItem.group;
          }
        }
        if (menu.id === MenuId.ViewContainerTitle && !menuItem.when?.includes("viewContainer == workbench.view.debug")) {
          collector.error(localize(22689, null, "`viewContainer/title`", "`viewContainer == workbench.view.debug`", '"when"'));
          continue;
        }
        item.when = ContextKeyExpr.deserialize(menuItem.when);
        _menuRegistrations.add(MenuRegistry.appendMenuItem(menu.id, item));
      }
    }
  }
});

var CommandsTableRenderer = class extends Disposable {
  constructor(_keybindingService) {
    super();
    this._keybindingService = _keybindingService;
    this.type = "table";
  }
  shouldRender(manifest) {
    return !!manifest.contributes?.commands;
  }
  render(manifest) {
    const rawCommands = manifest.contributes?.commands || [];
    const commands = rawCommands.map((c) => ({
      id: c.command,
      title: c.title,
      keybindings: [],
      menus: []
    }));
    const byId = index(commands, (c) => c.id);
    const menus = manifest.contributes?.menus || {};
    const implicitlyOnCommandPalette = index(commands, (c) => c.id);
    if (menus["commandPalette"]) {
      for (const command4 of menus["commandPalette"]) {
        delete implicitlyOnCommandPalette[command4.command];
      }
    }
    if (Object.keys(implicitlyOnCommandPalette).length) {
      if (!menus["commandPalette"]) {
        menus["commandPalette"] = [];
      }
      for (const command4 in implicitlyOnCommandPalette) {
        menus["commandPalette"].push({ command: command4 });
      }
    }
    for (const context2 in menus) {
      for (const menu of menus[context2]) {
        if (menu.when === "false") {
          continue;
        }
        if (menu.command) {
          let command4 = byId[menu.command];
          if (command4) {
            if (!command4.menus.includes(context2)) {
              command4.menus.push(context2);
            }
          } else {
            command4 = { id: menu.command, title: "", keybindings: [], menus: [context2] };
            byId[command4.id] = command4;
            commands.push(command4);
          }
        }
      }
    }
    const rawKeybindings = manifest.contributes?.keybindings ? Array.isArray(manifest.contributes.keybindings) ? manifest.contributes.keybindings : [manifest.contributes.keybindings] : [];
    rawKeybindings.forEach((rawKeybinding) => {
      const keybinding = this.resolveKeybinding(rawKeybinding);
      if (!keybinding) {
        return;
      }
      let command4 = byId[rawKeybinding.command];
      if (command4) {
        command4.keybindings.push(keybinding);
      } else {
        command4 = { id: rawKeybinding.command, title: "", keybindings: [keybinding], menus: [] };
        byId[command4.id] = command4;
        commands.push(command4);
      }
    });
    if (!commands.length) {
      return { data: { headers: [], rows: [] }, dispose: () => {
      } };
    }
    const headers = [
      localize(22570, null),
      localize(22571, null),
      localize(22590, null),
      localize(22591, null)
    ];
    const rows = commands.sort((a, b) => a.id.localeCompare(b.id)).map((command4) => {
      return [
        new MarkdownString().appendMarkdown(`\`${command4.id}\``),
        typeof command4.title === "string" ? command4.title : command4.title.value,
        command4.keybindings,
        new MarkdownString().appendMarkdown(`${command4.menus.sort((a, b) => a.localeCompare(b)).map((menu) => `\`${menu}\``).join("&nbsp;")}`)
      ];
    });
    return {
      data: {
        headers,
        rows
      },
      dispose: () => {
      }
    };
  }
  resolveKeybinding(rawKeyBinding) {
    let key3;
    switch (platform2) {
      case "win32":
        key3 = rawKeyBinding.win;
        break;
      case "linux":
        key3 = rawKeyBinding.linux;
        break;
      case "darwin":
        key3 = rawKeyBinding.mac;
        break;
    }
    return this._keybindingService.resolveUserBinding(key3 ?? rawKeyBinding.key)[0];
  }
};

CommandsTableRenderer = __decorateClass([
  __decorateParam(0, IKeybindingService)
], CommandsTableRenderer);

Registry.as(Extensions11.ExtensionFeaturesRegistry).registerExtensionFeature({
  id: "commands",
  label: localize(22572, null),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(CommandsTableRenderer)
});
export { apiMenus, schema3, _commandRegistrations, commandsExtensionPoint, _submenus, submenusExtensionPoint, _apiMenusByKey, _menuRegistrations, _submenuMenuItems, menusExtensionPoint, CommandsTableRenderer };
