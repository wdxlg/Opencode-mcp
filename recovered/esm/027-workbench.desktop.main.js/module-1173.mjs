// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/common/terminal.ts
import { isLinux } from "./module-0014.mjs";
import { createDecorator } from "./module-0077.mjs";
import { defaultTerminalContribCommandsToSkipShell } from "./module-1172.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/terminal/common/terminal.ts
var TERMINAL_VIEW_ID = "terminal";

var TERMINAL_CONFIG_SECTION = "terminal.integrated";

var DEFAULT_LETTER_SPACING = 0;

var MINIMUM_LETTER_SPACING = -5;

var DEFAULT_LINE_HEIGHT = isLinux ? 1.1 : 1;

var MINIMUM_FONT_WEIGHT = 1;

var MAXIMUM_FONT_WEIGHT = 1e3;

var DEFAULT_FONT_WEIGHT = "normal";

var DEFAULT_BOLD_FONT_WEIGHT = "bold";

var SUGGESTIONS_FONT_WEIGHT = ["normal", "bold", "100", "200", "300", "400", "500", "600", "700", "800", "900"];

var ITerminalProfileResolverService = createDecorator("terminalProfileResolverService");

var ITerminalProfileService = createDecorator("terminalProfileService");

var isTerminalProcessManager = (t2) => typeof t2.write === "function";

var DEFAULT_COMMANDS_TO_SKIP_SHELL = [
  "workbench.action.terminal.clearSelection" /* ClearSelection */,
  "workbench.action.terminal.clear" /* Clear */,
  "workbench.action.terminal.copyAndClearSelection" /* CopyAndClearSelection */,
  "workbench.action.terminal.copySelection" /* CopySelection */,
  "workbench.action.terminal.copySelectionAsHtml" /* CopySelectionAsHtml */,
  "workbench.action.terminal.copyLastCommand" /* CopyLastCommand */,
  "workbench.action.terminal.copyLastCommandOutput" /* CopyLastCommandOutput */,
  "workbench.action.terminal.copyLastCommandAndLastCommandOutput" /* CopyLastCommandAndLastCommandOutput */,
  "workbench.action.terminal.deleteToLineStart" /* DeleteToLineStart */,
  "workbench.action.terminal.deleteWordLeft" /* DeleteWordLeft */,
  "workbench.action.terminal.deleteWordRight" /* DeleteWordRight */,
  "workbench.action.terminal.focusNextPane" /* FocusNextPane */,
  "workbench.action.terminal.focusNext" /* FocusNext */,
  "workbench.action.terminal.focusPreviousPane" /* FocusPreviousPane */,
  "workbench.action.terminal.focusPrevious" /* FocusPrevious */,
  "workbench.action.terminal.focus" /* Focus */,
  "workbench.action.terminal.sizeToContentWidth" /* SizeToContentWidth */,
  "workbench.action.terminal.kill" /* Kill */,
  "workbench.action.terminal.killEditor" /* KillEditor */,
  "workbench.action.terminal.moveToEditor" /* MoveToEditor */,
  "workbench.action.terminal.moveToLineEnd" /* MoveToLineEnd */,
  "workbench.action.terminal.moveToLineStart" /* MoveToLineStart */,
  "workbench.action.terminal.moveToTerminalPanel" /* MoveToTerminalPanel */,
  "workbench.action.terminal.newInActiveWorkspace" /* NewInActiveWorkspace */,
  "workbench.action.terminal.new" /* New */,
  "workbench.action.terminal.newInNewWindow" /* NewInNewWindow */,
  "workbench.action.terminal.paste" /* Paste */,
  "workbench.action.terminal.pastePwsh" /* PastePwsh */,
  "workbench.action.terminal.pasteSelection" /* PasteSelection */,
  "workbench.action.terminal.resizePaneDown" /* ResizePaneDown */,
  "workbench.action.terminal.resizePaneLeft" /* ResizePaneLeft */,
  "workbench.action.terminal.resizePaneRight" /* ResizePaneRight */,
  "workbench.action.terminal.resizePaneUp" /* ResizePaneUp */,
  "workbench.action.terminal.runActiveFile" /* RunActiveFile */,
  "workbench.action.terminal.runSelectedText" /* RunSelectedText */,
  "workbench.action.terminal.scrollDown" /* ScrollDownLine */,
  "workbench.action.terminal.scrollDownPage" /* ScrollDownPage */,
  "workbench.action.terminal.scrollToBottom" /* ScrollToBottom */,
  "workbench.action.terminal.scrollToNextCommand" /* ScrollToNextCommand */,
  "workbench.action.terminal.scrollToPreviousCommand" /* ScrollToPreviousCommand */,
  "workbench.action.terminal.scrollToTop" /* ScrollToTop */,
  "workbench.action.terminal.scrollUp" /* ScrollUpLine */,
  "workbench.action.terminal.scrollUpPage" /* ScrollUpPage */,
  "workbench.action.terminal.sendSequence" /* SendSequence */,
  "workbench.action.terminal.selectAll" /* SelectAll */,
  "workbench.action.terminal.selectToNextCommand" /* SelectToNextCommand */,
  "workbench.action.terminal.selectToNextLine" /* SelectToNextLine */,
  "workbench.action.terminal.selectToPreviousCommand" /* SelectToPreviousCommand */,
  "workbench.action.terminal.selectToPreviousLine" /* SelectToPreviousLine */,
  "workbench.action.terminal.splitInActiveWorkspace" /* SplitInActiveWorkspace */,
  "workbench.action.terminal.split" /* Split */,
  "workbench.action.terminal.toggleTerminal" /* Toggle */,
  "workbench.action.terminal.focusHover" /* FocusHover */,
  "editor.action.accessibilityHelp" /* OpenAccessibilityHelp */,
  "workbench.action.terminal.stopVoice" /* StopVoice */,
  "workbench.action.terminal.sendSignal" /* SendSignal */,
  "workbench.action.tasks.rerunForActiveTerminal",
  "editor.action.toggleTabFocusMode",
  "notifications.hideList",
  "notifications.hideToasts",
  "workbench.action.closeQuickOpen",
  "workbench.action.quickOpen",
  "workbench.action.quickOpenPreviousEditor",
  "workbench.action.showCommands",
  "workbench.action.tasks.build",
  "workbench.action.tasks.restartTask",
  "workbench.action.tasks.runTask",
  "workbench.action.tasks.reRunTask",
  "workbench.action.tasks.showLog",
  "workbench.action.tasks.showTasks",
  "workbench.action.tasks.terminate",
  "workbench.action.tasks.test",
  "workbench.action.toggleFullScreen",
  "workbench.action.terminal.focusAtIndex1",
  "workbench.action.terminal.focusAtIndex2",
  "workbench.action.terminal.focusAtIndex3",
  "workbench.action.terminal.focusAtIndex4",
  "workbench.action.terminal.focusAtIndex5",
  "workbench.action.terminal.focusAtIndex6",
  "workbench.action.terminal.focusAtIndex7",
  "workbench.action.terminal.focusAtIndex8",
  "workbench.action.terminal.focusAtIndex9",
  "workbench.action.focusSecondEditorGroup",
  "workbench.action.focusThirdEditorGroup",
  "workbench.action.focusFourthEditorGroup",
  "workbench.action.focusFifthEditorGroup",
  "workbench.action.focusSixthEditorGroup",
  "workbench.action.focusSeventhEditorGroup",
  "workbench.action.focusEighthEditorGroup",
  "workbench.action.focusNextPart",
  "workbench.action.focusPreviousPart",
  "workbench.action.nextPanelView",
  "workbench.action.previousPanelView",
  "workbench.action.nextSideBarView",
  "workbench.action.previousSideBarView",
  "workbench.action.debug.disconnect",
  "workbench.action.debug.start",
  "workbench.action.debug.stop",
  "workbench.action.debug.run",
  "workbench.action.debug.restart",
  "workbench.action.debug.continue",
  "workbench.action.debug.pause",
  "workbench.action.debug.stepInto",
  "workbench.action.debug.stepOut",
  "workbench.action.debug.stepOver",
  "sessions.goBack",
  "sessions.goForward",
  "sessions.focusActiveSession",
  "sessions.focusSessionInGrid1",
  "sessions.focusSessionInGrid2",
  "sessions.focusSessionInGrid3",
  "sessions.focusSessionInGrid4",
  "sessions.focusSessionInGrid5",
  "sessions.focusSessionInGrid6",
  "sessions.focusSessionInGrid7",
  "sessions.focusSessionInGrid8",
  "sessions.focusSessionInGrid9",
  "sessionsViewPane.navigatePreviousSession",
  "sessionsViewPane.navigateNextSession",
  "workbench.action.nextEditor",
  "workbench.action.previousEditor",
  "workbench.action.nextEditorInGroup",
  "workbench.action.previousEditorInGroup",
  "workbench.action.openNextRecentlyUsedEditor",
  "workbench.action.openPreviousRecentlyUsedEditor",
  "workbench.action.openNextRecentlyUsedEditorInGroup",
  "workbench.action.openPreviousRecentlyUsedEditorInGroup",
  "workbench.action.quickOpenPreviousRecentlyUsedEditor",
  "workbench.action.quickOpenLeastRecentlyUsedEditor",
  "workbench.action.quickOpenPreviousRecentlyUsedEditorInGroup",
  "workbench.action.quickOpenLeastRecentlyUsedEditorInGroup",
  "workbench.action.focusActiveEditorGroup",
  "workbench.action.focusFirstEditorGroup",
  "workbench.action.focusLastEditorGroup",
  "workbench.action.firstEditorInGroup",
  "workbench.action.lastEditorInGroup",
  "workbench.action.navigateUp",
  "workbench.action.navigateDown",
  "workbench.action.navigateRight",
  "workbench.action.navigateLeft",
  "workbench.action.togglePanel",
  "workbench.action.quickOpenView",
  "workbench.action.toggleMaximizedPanel",
  "workbench.action.zoomIn",
  "workbench.action.zoomOut",
  "workbench.action.zoomReset",
  "notification.acceptPrimaryAction",
  "runCommands",
  "workbench.action.terminal.chat.start",
  "workbench.action.terminal.chat.close",
  "workbench.action.terminal.chat.discard",
  "workbench.action.terminal.chat.makeRequest",
  "workbench.action.terminal.chat.cancel",
  "workbench.action.terminal.chat.feedbackHelpful",
  "workbench.action.terminal.chat.feedbackUnhelpful",
  "workbench.action.terminal.chat.feedbackReportIssue",
  "workbench.action.terminal.chat.runCommand",
  "workbench.action.terminal.chat.insertCommand",
  "workbench.action.terminal.chat.viewInChat",
  ...defaultTerminalContribCommandsToSkipShell
];

var terminalContributionsDescriptor = {
  extensionPoint: "terminal",
  defaultExtensionKind: ["workspace"],
  activationEventsGenerator: function* (contribs) {
    for (const contrib of contribs) {
      for (const profileContrib of contrib.profiles ?? []) {
        yield `onTerminalProfile:${profileContrib.id}`;
      }
    }
  },
  jsonSchema: {
    description: localize(20126, null),
    type: "object",
    properties: {
      profiles: {
        type: "array",
        description: localize(20129, null),
        items: {
          type: "object",
          required: ["id", "title"],
          defaultSnippets: [{
            body: {
              id: "$1",
              title: "$2"
            }
          }],
          properties: {
            id: {
              description: localize(20130, null),
              type: "string"
            },
            title: {
              description: localize(20131, null),
              type: "string"
            },
            icon: {
              description: localize(20133, null),
              anyOf: [
                {
                  type: "string"
                },
                {
                  type: "object",
                  properties: {
                    light: {
                      description: localize(20135, null),
                      type: "string"
                    },
                    dark: {
                      description: localize(20134, null),
                      type: "string"
                    }
                  }
                }
              ]
            },
            titleTemplate: {
              description: localize(20132, null),
              type: "string"
            }
          }
        }
      },
      completionProviders: {
        type: "array",
        description: localize(20127, null),
        items: {
          type: "object",
          required: ["id"],
          defaultSnippets: [{
            body: {
              id: "$1",
              description: "$2"
            }
          }],
          properties: {
            description: {
              description: localize(20128, null),
              type: "string"
            }
          }
        }
      }
    }
  }
};
export { TERMINAL_VIEW_ID, TERMINAL_CONFIG_SECTION, DEFAULT_LETTER_SPACING, MINIMUM_LETTER_SPACING, DEFAULT_LINE_HEIGHT, MINIMUM_FONT_WEIGHT, MAXIMUM_FONT_WEIGHT, DEFAULT_FONT_WEIGHT, DEFAULT_BOLD_FONT_WEIGHT, SUGGESTIONS_FONT_WEIGHT, ITerminalProfileResolverService, ITerminalProfileService, isTerminalProcessManager, DEFAULT_COMMANDS_TO_SKIP_SHELL, terminalContributionsDescriptor };
