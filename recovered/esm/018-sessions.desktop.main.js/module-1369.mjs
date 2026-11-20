// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/accessibility/browser/accessibilityConfiguration.ts
import { RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { Extensions14, workbenchConfigurationNodeBase } from "./module-1113.mjs";
import { Disposable } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { ISpeechService, SPEECH_LANGUAGES } from "./module-1254.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { AccessibilitySignal } from "./module-0445.mjs";
import { isDefined } from "./module-0010.mjs";


// src/vs/workbench/contrib/accessibility/browser/accessibilityConfiguration.ts
var accessibilityHelpIsShown = new RawContextKey("accessibilityHelpIsShown", false, true);

var accessibleViewIsShown = new RawContextKey("accessibleViewIsShown", false, true);

var accessibleViewSupportsNavigation = new RawContextKey("accessibleViewSupportsNavigation", false, true);

var accessibleViewVerbosityEnabled = new RawContextKey("accessibleViewVerbosityEnabled", false, true);

var accessibleViewGoToSymbolSupported = new RawContextKey("accessibleViewGoToSymbolSupported", false, true);

var accessibleViewOnLastLine = new RawContextKey("accessibleViewOnLastLine", false, true);

var accessibleViewCurrentProviderId = new RawContextKey("accessibleViewCurrentProviderId", void 0, void 0);

var accessibleViewInCodeBlock = new RawContextKey("accessibleViewInCodeBlock", void 0, void 0);

var accessibleViewContainsCodeBlocks = new RawContextKey("accessibleViewContainsCodeBlocks", void 0, void 0);

var accessibleViewHasUnassignedKeybindings = new RawContextKey("accessibleViewHasUnassignedKeybindings", void 0, void 0);

var accessibleViewHasAssignedKeybindings = new RawContextKey("accessibleViewHasAssignedKeybindings", void 0, void 0);

var baseVerbosityProperty = {
  type: "boolean",
  default: true,
  tags: ["accessibility"]
};

var accessibilityConfigurationNodeBase = Object.freeze({
  id: "accessibility",
  title: localize(7711, null),
  type: "object"
});

var soundFeatureBase = {
  "type": "string",
  "enum": ["auto", "on", "off"],
  "default": "off",
  "enumDescriptions": [
    localize(7718, null),
    localize(7721, null),
    localize(7720, null)
  ],
  tags: ["accessibility"]
};

var signalFeatureBase = {
  "type": "object",
  "tags": ["accessibility"],
  additionalProperties: false,
  default: {
    sound: "off",
    announcement: "auto"
  }
};

var announcementFeatureBase = {
  "type": "string",
  "enum": ["auto", "off"],
  "default": "auto",
  "enumDescriptions": [
    localize(7712, null),
    localize(7713, null)
  ],
  tags: ["accessibility"]
};

var defaultNoAnnouncement = {
  "type": "object",
  "tags": ["accessibility"],
  additionalProperties: false,
  "default": {
    "sound": "off"
  }
};

var configuration = {
  ...accessibilityConfigurationNodeBase,
  scope: 5 /* RESOURCE */,
  properties: {
    ["accessibility.verbosity.terminal" /* Terminal */]: {
      description: localize(7746, null),
      ...baseVerbosityProperty
    },
    ["accessibility.verbosity.diffEditor" /* DiffEditor */]: {
      description: localize(7731, null),
      ...baseVerbosityProperty
    },
    ["accessibility.verbosity.panelChat" /* Chat */]: {
      description: localize(7726, null),
      ...baseVerbosityProperty
    },
    ["accessibility.verbosity.inlineChat" /* InlineChat */]: {
      description: localize(7737, null),
      ...baseVerbosityProperty
    },
    ["accessibility.verbosity.terminalChatOutput" /* TerminalChatOutput */]: {
      description: localize(7747, null),
      ...baseVerbosityProperty
    },
    ["accessibility.verbosity.inlineCompletions" /* InlineCompletions */]: {
      description: localize(7736, null),
      ...baseVerbosityProperty
    },
    ["accessibility.verbosity.keybindingsEditor" /* KeybindingsEditor */]: {
      description: localize(7738, null),
      ...baseVerbosityProperty
    },
    ["accessibility.verbosity.notebook" /* Notebook */]: {
      description: localize(7739, null),
      ...baseVerbosityProperty
    },
    ["accessibility.verbosity.hover" /* Hover */]: {
      description: localize(7735, null),
      ...baseVerbosityProperty
    },
    ["accessibility.verbosity.notification" /* Notification */]: {
      description: localize(7740, null),
      ...baseVerbosityProperty
    },
    ["accessibility.verbosity.emptyEditorHint" /* EmptyEditorHint */]: {
      description: localize(7733, null),
      ...baseVerbosityProperty
    },
    ["accessibility.verbosity.replEditor" /* ReplEditor */]: {
      description: localize(7741, null),
      ...baseVerbosityProperty
    },
    ["accessibility.verbosity.comments" /* Comments */]: {
      description: localize(7729, null),
      ...baseVerbosityProperty
    },
    ["accessibility.verbosity.diffEditorActive" /* DiffEditorActive */]: {
      description: localize(7732, null),
      ...baseVerbosityProperty
    },
    ["accessibility.verbosity.debug" /* Debug */]: {
      description: localize(7730, null),
      ...baseVerbosityProperty
    },
    ["accessibility.verbosity.walkthrough" /* Walkthrough */]: {
      description: localize(7748, null),
      ...baseVerbosityProperty
    },
    ["accessibility.accessibleView.closeOnKeyPress" /* AccessibleViewCloseOnKeyPress */]: {
      markdownDescription: localize(7723, null),
      type: "boolean",
      default: true
    },
    ["accessibility.verbosity.sourceControl" /* SourceControl */]: {
      description: localize(7742, null),
      ...baseVerbosityProperty
    },
    ["accessibility.verbosity.find" /* Find */]: {
      description: localize(7734, null),
      ...baseVerbosityProperty
    },
    ["accessibility.verbosity.sessionsChat" /* SessionsChat */]: {
      description: localize(7744, null),
      ...baseVerbosityProperty
    },
    ["accessibility.verbosity.sessionsChanges" /* SessionsChanges */]: {
      description: localize(7743, null),
      ...baseVerbosityProperty
    },
    ["accessibility.verbosity.chatQuestionCarousel" /* ChatQuestionCarousel */]: {
      description: localize(7728, null),
      ...baseVerbosityProperty
    },
    ["accessibility.verbosity.survey" /* Survey */]: {
      description: localize(7745, null),
      ...baseVerbosityProperty
    },
    ["accessibility.verbosity.automations" /* Automations */]: {
      description: localize(7724, null),
      ...baseVerbosityProperty
    },
    ["accessibility.verbosity.browserElementCommenting" /* BrowserElementCommenting */]: {
      description: localize(7725, null),
      ...baseVerbosityProperty
    },
    ["accessibility.verbosity.chatPetAchievements" /* ChatPetAchievements */]: {
      description: localize(7727, null),
      ...baseVerbosityProperty
    },
    "accessibility.signalOptions.volume": {
      "description": localize(7592, null),
      "type": "number",
      "minimum": 0,
      "maximum": 100,
      "default": 0,
      "tags": ["accessibility"]
    },
    "accessibility.signalOptions.debouncePositionChanges": {
      "description": localize(7585, null),
      "type": "boolean",
      "default": false,
      "tags": ["accessibility"]
    },
    "accessibility.signalOptions.experimental.delays.general": {
      "type": "object",
      "description": "Delays for all signals besides error and warning at position",
      "additionalProperties": false,
      "properties": {
        "announcement": {
          "description": localize(7588, null),
          "type": "number",
          "minimum": 0,
          "default": 3e3
        },
        "sound": {
          "description": localize(7589, null),
          "type": "number",
          "minimum": 0,
          "default": 400
        }
      },
      "tags": ["accessibility"]
    },
    "accessibility.signalOptions.experimental.delays.warningAtPosition": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "announcement": {
          "description": localize(7590, null),
          "type": "number",
          "minimum": 0,
          "default": 3e3
        },
        "sound": {
          "description": localize(7591, null),
          "type": "number",
          "minimum": 0,
          "default": 1e3
        }
      },
      "tags": ["accessibility"]
    },
    "accessibility.signalOptions.experimental.delays.errorAtPosition": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "announcement": {
          "description": localize(7586, null),
          "type": "number",
          "minimum": 0,
          "default": 3e3
        },
        "sound": {
          "description": localize(7587, null),
          "type": "number",
          "minimum": 0,
          "default": 1e3
        }
      },
      "tags": ["accessibility"]
    },
    "accessibility.signals.lineHasBreakpoint": {
      ...signalFeatureBase,
      "description": localize(7630, null),
      "properties": {
        "sound": {
          "description": localize(7632, null),
          ...soundFeatureBase
        },
        "announcement": {
          "description": localize(7631, null),
          ...announcementFeatureBase
        }
      }
    },
    "accessibility.signals.lineHasInlineSuggestion": {
      ...defaultNoAnnouncement,
      "description": localize(7639, null),
      "properties": {
        "sound": {
          "description": localize(7640, null),
          ...soundFeatureBase,
          "default": "off"
        }
      }
    },
    "accessibility.signals.nextEditSuggestion": {
      ...signalFeatureBase,
      "description": localize(7644, null),
      "properties": {
        "sound": {
          "description": localize(7646, null),
          ...soundFeatureBase
        },
        "announcement": {
          "description": localize(7645, null),
          ...announcementFeatureBase
        }
      }
    },
    "accessibility.signals.lineHasError": {
      ...signalFeatureBase,
      "description": localize(7633, null),
      "properties": {
        "sound": {
          "description": localize(7635, null),
          ...soundFeatureBase
        },
        "announcement": {
          "description": localize(7634, null),
          ...announcementFeatureBase,
          default: "off"
        }
      }
    },
    "accessibility.signals.lineHasFoldedArea": {
      ...signalFeatureBase,
      "description": localize(7636, null),
      "properties": {
        "sound": {
          "description": localize(7638, null),
          ...soundFeatureBase,
          default: "off"
        },
        "announcement": {
          "description": localize(7637, null),
          ...announcementFeatureBase
        }
      }
    },
    "accessibility.signals.lineHasWarning": {
      ...signalFeatureBase,
      "description": localize(7641, null),
      "properties": {
        "sound": {
          "description": localize(7643, null),
          ...soundFeatureBase
        },
        "announcement": {
          "description": localize(7642, null),
          ...announcementFeatureBase,
          default: "off"
        }
      }
    },
    "accessibility.signals.positionHasError": {
      ...signalFeatureBase,
      "description": localize(7659, null),
      "properties": {
        "sound": {
          "description": localize(7661, null),
          ...soundFeatureBase
        },
        "announcement": {
          "description": localize(7660, null),
          ...announcementFeatureBase,
          default: "on"
        }
      }
    },
    "accessibility.signals.positionHasWarning": {
      ...signalFeatureBase,
      "description": localize(7662, null),
      "properties": {
        "sound": {
          "description": localize(7664, null),
          ...soundFeatureBase
        },
        "announcement": {
          "description": localize(7663, null),
          ...announcementFeatureBase,
          default: "on"
        }
      }
    },
    "accessibility.signals.onDebugBreak": {
      ...signalFeatureBase,
      "description": localize(7656, null),
      "properties": {
        "sound": {
          "description": localize(7658, null),
          ...soundFeatureBase
        },
        "announcement": {
          "description": localize(7657, null),
          ...announcementFeatureBase
        }
      }
    },
    "accessibility.signals.noInlayHints": {
      ...signalFeatureBase,
      "description": localize(7647, null),
      "properties": {
        "sound": {
          "description": localize(7649, null),
          ...soundFeatureBase
        },
        "announcement": {
          "description": localize(7648, null),
          ...announcementFeatureBase
        }
      }
    },
    "accessibility.signals.taskCompleted": {
      ...signalFeatureBase,
      "description": localize(7678, null),
      "properties": {
        "sound": {
          "description": localize(7680, null),
          ...soundFeatureBase
        },
        "announcement": {
          "description": localize(7679, null),
          ...announcementFeatureBase
        }
      }
    },
    "accessibility.signals.taskFailed": {
      ...signalFeatureBase,
      "description": localize(7681, null),
      "properties": {
        "sound": {
          "description": localize(7683, null),
          ...soundFeatureBase
        },
        "announcement": {
          "description": localize(7682, null),
          ...announcementFeatureBase
        }
      }
    },
    "accessibility.signals.terminalCommandFailed": {
      ...signalFeatureBase,
      "description": localize(7687, null),
      "properties": {
        "sound": {
          "description": localize(7689, null),
          ...soundFeatureBase
        },
        "announcement": {
          "description": localize(7688, null),
          ...announcementFeatureBase
        }
      }
    },
    "accessibility.signals.terminalCommandSucceeded": {
      ...signalFeatureBase,
      "description": localize(7690, null),
      "properties": {
        "sound": {
          "description": localize(7692, null),
          ...soundFeatureBase
        },
        "announcement": {
          "description": localize(7691, null),
          ...announcementFeatureBase
        }
      }
    },
    "accessibility.signals.terminalQuickFix": {
      ...signalFeatureBase,
      "description": localize(7693, null),
      "properties": {
        "sound": {
          "description": localize(7695, null),
          ...soundFeatureBase
        },
        "announcement": {
          "description": localize(7694, null),
          ...announcementFeatureBase
        }
      }
    },
    "accessibility.signals.terminalBell": {
      ...signalFeatureBase,
      "description": localize(7684, null),
      "properties": {
        "sound": {
          "description": localize(7686, null),
          ...soundFeatureBase
        },
        "announcement": {
          "description": localize(7685, null),
          ...announcementFeatureBase
        }
      }
    },
    "accessibility.signals.diffLineInserted": {
      ...defaultNoAnnouncement,
      "description": localize(7612, null),
      "properties": {
        "sound": {
          "description": localize(7677, null),
          ...soundFeatureBase
        }
      }
    },
    "accessibility.signals.diffLineModified": {
      ...defaultNoAnnouncement,
      "description": localize(7613, null),
      "properties": {
        "sound": {
          "description": localize(7614, null),
          ...soundFeatureBase
        }
      }
    },
    "accessibility.signals.diffLineDeleted": {
      ...defaultNoAnnouncement,
      "description": localize(7610, null),
      "properties": {
        "sound": {
          "description": localize(7611, null),
          ...soundFeatureBase
        }
      }
    },
    "accessibility.signals.chatEditModifiedFile": {
      ...defaultNoAnnouncement,
      "description": localize(7593, null),
      "properties": {
        "sound": {
          "description": localize(7594, null),
          ...soundFeatureBase
        }
      }
    },
    "accessibility.signals.notebookCellCompleted": {
      ...signalFeatureBase,
      "description": localize(7650, null),
      "properties": {
        "sound": {
          "description": localize(7652, null),
          ...soundFeatureBase
        },
        "announcement": {
          "description": localize(7651, null),
          ...announcementFeatureBase
        }
      }
    },
    "accessibility.signals.notebookCellFailed": {
      ...signalFeatureBase,
      "description": localize(7653, null),
      "properties": {
        "sound": {
          "description": localize(7655, null),
          ...soundFeatureBase
        },
        "announcement": {
          "description": localize(7654, null),
          ...announcementFeatureBase
        }
      }
    },
    "accessibility.signals.progress": {
      ...signalFeatureBase,
      "description": localize(7665, null),
      "default": {
        "sound": "off",
        "announcement": "off"
      },
      "properties": {
        "sound": {
          "description": localize(7667, null),
          ...soundFeatureBase
        },
        "announcement": {
          "description": localize(7666, null),
          ...announcementFeatureBase
        }
      }
    },
    "accessibility.signals.chatRequestSent": {
      ...signalFeatureBase,
      "description": localize(7595, null),
      "properties": {
        "sound": {
          "description": localize(7597, null),
          ...soundFeatureBase
        },
        "announcement": {
          "description": localize(7596, null),
          ...announcementFeatureBase
        }
      }
    },
    "accessibility.signals.chatResponseReceived": {
      ...defaultNoAnnouncement,
      "description": localize(7598, null),
      "properties": {
        "sound": {
          "description": localize(7599, null),
          ...soundFeatureBase
        }
      }
    },
    "accessibility.signals.codeActionTriggered": {
      ...defaultNoAnnouncement,
      "description": localize(7608, null),
      "properties": {
        "sound": {
          "description": localize(7609, null),
          ...soundFeatureBase
        }
      }
    },
    "accessibility.signals.codeActionApplied": {
      ...defaultNoAnnouncement,
      "description": localize(7606, null),
      "properties": {
        "sound": {
          "description": localize(7607, null),
          ...soundFeatureBase
        }
      }
    },
    "accessibility.signals.voiceRecordingStarted": {
      ...defaultNoAnnouncement,
      "description": localize(7702, null),
      "properties": {
        "sound": {
          "description": localize(7703, null),
          ...soundFeatureBase
        }
      },
      "default": {
        "sound": "off"
      }
    },
    "accessibility.signals.voiceModeStarted": {
      ...signalFeatureBase,
      "description": localize(7696, null),
      "properties": {
        "sound": {
          "description": localize(7698, null),
          ...soundFeatureBase
        },
        "announcement": {
          "description": localize(7697, null),
          ...announcementFeatureBase
        }
      },
      "default": {
        "sound": "off",
        "announcement": "auto"
      }
    },
    "accessibility.signals.voiceRecordingStopped": {
      ...defaultNoAnnouncement,
      "description": localize(7704, null),
      "properties": {
        "sound": {
          "description": localize(7705, null),
          ...soundFeatureBase
        }
      },
      "default": {
        "sound": "off"
      }
    },
    "accessibility.signals.voiceModeStopped": {
      ...signalFeatureBase,
      "description": localize(7699, null),
      "properties": {
        "sound": {
          "description": localize(7701, null),
          ...soundFeatureBase
        },
        "announcement": {
          "description": localize(7700, null),
          ...announcementFeatureBase
        }
      },
      "default": {
        "sound": "off",
        "announcement": "auto"
      }
    },
    "accessibility.signals.clear": {
      ...signalFeatureBase,
      "description": localize(7603, null),
      "properties": {
        "sound": {
          "description": localize(7605, null),
          ...soundFeatureBase
        },
        "announcement": {
          "description": localize(7604, null),
          ...announcementFeatureBase
        }
      }
    },
    "accessibility.signals.editsUndone": {
      ...signalFeatureBase,
      "description": localize(7618, null),
      "properties": {
        "sound": {
          "description": localize(7620, null),
          ...soundFeatureBase
        },
        "announcement": {
          "description": localize(7619, null),
          ...announcementFeatureBase
        }
      }
    },
    "accessibility.signals.editsKept": {
      ...signalFeatureBase,
      "description": localize(7615, null),
      "properties": {
        "sound": {
          "description": localize(7617, null),
          ...soundFeatureBase
        },
        "announcement": {
          "description": localize(7616, null),
          ...announcementFeatureBase
        }
      }
    },
    "accessibility.signals.save": {
      "type": "object",
      "tags": ["accessibility"],
      additionalProperties: false,
      "markdownDescription": localize(7668, null),
      "properties": {
        "sound": {
          "description": localize(7673, null),
          "type": "string",
          "enum": ["userGesture", "always", "never"],
          "default": "never",
          "enumDescriptions": [
            localize(7676, null),
            localize(7674, null),
            localize(7675, null)
          ]
        },
        "announcement": {
          "description": localize(7669, null),
          "type": "string",
          "enum": ["userGesture", "always", "never"],
          "default": "never",
          "enumDescriptions": [
            localize(7672, null),
            localize(7670, null),
            localize(7671, null)
          ]
        }
      },
      default: {
        "sound": "never",
        "announcement": "never"
      }
    },
    "accessibility.signals.format": {
      "type": "object",
      "tags": ["accessibility"],
      additionalProperties: false,
      "markdownDescription": localize(7621, null),
      "properties": {
        "sound": {
          "description": localize(7628, null),
          "type": "string",
          "enum": ["userGesture", "always", "never"],
          "default": "never",
          "enumDescriptions": [
            localize(7629, null),
            localize(7622, null),
            localize(7627, null)
          ]
        },
        "announcement": {
          "description": localize(7623, null),
          "type": "string",
          "enum": ["userGesture", "always", "never"],
          "default": "never",
          "enumDescriptions": [
            localize(7626, null),
            localize(7624, null),
            localize(7625, null)
          ]
        }
      },
      default: {
        "sound": "never",
        "announcement": "never"
      }
    },
    "accessibility.signals.chatUserActionRequired": {
      ...signalFeatureBase,
      "markdownDescription": localize(7600, null),
      "properties": {
        "sound": {
          "description": localize(7602, null),
          "type": "string",
          "enum": ["auto", "on", "off"],
          "default": "off",
          "enumDescriptions": [
            localize(7719, null),
            localize(7721, null),
            localize(7720, null)
          ]
        },
        "announcement": {
          "description": localize(7601, null),
          ...announcementFeatureBase
        }
      },
      default: {
        "sound": "off",
        "announcement": "auto"
      },
      tags: ["accessibility"]
    },
    "accessibility.underlineLinks": {
      "type": "boolean",
      "description": localize(7706, null),
      "default": false
    },
    "accessibility.debugWatchVariableAnnouncements": {
      "type": "boolean",
      "description": localize(7581, null),
      "default": true
    },
    "accessibility.replEditor.readLastExecutionOutput": {
      "type": "boolean",
      "description": localize(7584, null),
      "default": true
    },
    "accessibility.replEditor.autoFocusReplExecution": {
      type: "string",
      enum: ["none", "input", "lastExecution"],
      default: "input",
      description: localize(7717, null)
    },
    "accessibility.windowTitleOptimized": {
      "type": "boolean",
      "default": true,
      "markdownDescription": localize(7710, null, "`#window.title#`", "`activeEditorState`")
    },
    "accessibility.openChatEditedFiles": {
      "type": "boolean",
      "default": false,
      "markdownDescription": localize(7583, null)
    },
    "accessibility.verboseChatProgressUpdates": {
      "type": "boolean",
      "default": true,
      "markdownDescription": localize(7707, null)
    }
  }
};

function registerAccessibilityConfiguration() {
  const registry4 = Registry.as(Extensions4.Configuration);
  registry4.registerConfiguration(configuration);
  registry4.registerConfiguration({
    ...workbenchConfigurationNodeBase,
    properties: {
      ["accessibility.dimUnfocused.enabled" /* DimUnfocusedEnabled */]: {
        description: localize(7715, null),
        type: "boolean",
        default: false,
        tags: ["accessibility"],
        scope: 1 /* APPLICATION */
      },
      ["accessibility.dimUnfocused.opacity" /* DimUnfocusedOpacity */]: {
        markdownDescription: localize(7716, null, `\`#${"accessibility.dimUnfocused.enabled" /* DimUnfocusedEnabled */}#\``),
        type: "number",
        minimum: 0.2 /* Minimum */,
        maximum: 1 /* Maximum */,
        default: 0.75 /* Default */,
        tags: ["accessibility"],
        scope: 1 /* APPLICATION */
      },
      ["accessibility.hideAccessibleView" /* HideAccessibleView */]: {
        description: localize(7582, null),
        type: "boolean",
        default: false,
        tags: ["accessibility"]
      },
      ["accessibility.verboseChatProgressUpdates" /* VerboseChatProgressUpdates */]: {
        "type": "boolean",
        "default": true,
        "markdownDescription": localize(7707, null)
      },
      ["accessibility.chat.showCheckmarks" /* ShowChatCheckmarks */]: {
        "type": "boolean",
        "default": false,
        "tags": ["accessibility"],
        "markdownDescription": localize(7580, null)
      }
    }
  });
}

var SpeechTimeoutDefault = 0;

var DynamicSpeechAccessibilityConfiguration = class extends Disposable {
  constructor(speechService) {
    super();
    this.speechService = speechService;
    this._register(Event2.runAndSubscribe(speechService.onDidChangeHasSpeechProvider, () => this.updateConfiguration()));
  }
  static {
    this.ID = "workbench.contrib.dynamicSpeechAccessibilityConfiguration";
  }
  updateConfiguration() {
    if (!this.speechService.hasSpeechProvider) {
      return;
    }
    const languages = this.getLanguages();
    const languagesSorted = Object.keys(languages).sort((langA, langB) => {
      return languages[langA].name.localeCompare(languages[langB].name);
    });
    const registry4 = Registry.as(Extensions4.Configuration);
    registry4.registerConfiguration({
      ...accessibilityConfigurationNodeBase,
      properties: {
        ["accessibility.voice.speechTimeout" /* SpeechTimeout */]: {
          "markdownDescription": localize(7751, null),
          "type": "number",
          "default": SpeechTimeoutDefault,
          "minimum": 0,
          "tags": ["accessibility"]
        },
        ["accessibility.voice.ignoreCodeBlocks" /* IgnoreCodeBlocks */]: {
          "markdownDescription": localize(7749, null),
          "type": "boolean",
          "default": false,
          "tags": ["accessibility"]
        },
        ["accessibility.voice.speechLanguage" /* SpeechLanguage */]: {
          "markdownDescription": localize(7750, null),
          "type": "string",
          "enum": languagesSorted,
          "default": "auto",
          "tags": ["accessibility"],
          "enumDescriptions": languagesSorted.map((key3) => languages[key3].name),
          "enumItemLabels": languagesSorted.map((key3) => languages[key3].name)
        },
        ["accessibility.voice.autoSynthesize" /* AutoSynthesize */]: {
          "type": "string",
          "enum": ["on", "off"],
          "enumDescriptions": [
            localize(7709, null),
            localize(7708, null)
          ],
          "markdownDescription": localize(7714, null),
          "default": "off",
          "tags": ["accessibility"]
        }
      }
    });
  }
  getLanguages() {
    return {
      ["auto"]: {
        name: localize(7722, null)
      },
      ...SPEECH_LANGUAGES
    };
  }
};

DynamicSpeechAccessibilityConfiguration = __decorateClass([
  __decorateParam(0, ISpeechService)
], DynamicSpeechAccessibilityConfiguration);

Registry.as(Extensions14.ConfigurationMigration).registerConfigurationMigrations([{
  key: "audioCues.volume",
  migrateFn: (value2, accessor) => {
    return [
      ["accessibility.signalOptions.volume", { value: value2 }],
      ["audioCues.volume", { value: void 0 }]
    ];
  }
}]);

Registry.as(Extensions14.ConfigurationMigration).registerConfigurationMigrations([{
  key: "audioCues.debouncePositionChanges",
  migrateFn: (value2) => {
    return [
      ["accessibility.signalOptions.debouncePositionChanges", { value: value2 }],
      ["audioCues.debouncePositionChanges", { value: void 0 }]
    ];
  }
}]);

Registry.as(Extensions14.ConfigurationMigration).registerConfigurationMigrations([{
  key: "accessibility.signalOptions",
  migrateFn: (value2, accessor) => {
    const delayGeneral = getDelaysFromConfig(accessor, "general");
    const delayError = getDelaysFromConfig(accessor, "errorAtPosition");
    const delayWarning = getDelaysFromConfig(accessor, "warningAtPosition");
    const volume = getVolumeFromConfig(accessor);
    const debouncePositionChanges = getDebouncePositionChangesFromConfig(accessor);
    const result = [];
    if (!!volume) {
      result.push(["accessibility.signalOptions.volume", { value: volume }]);
    }
    if (!!delayGeneral) {
      result.push(["accessibility.signalOptions.experimental.delays.general", { value: delayGeneral }]);
    }
    if (!!delayError) {
      result.push(["accessibility.signalOptions.experimental.delays.errorAtPosition", { value: delayError }]);
    }
    if (!!delayWarning) {
      result.push(["accessibility.signalOptions.experimental.delays.warningAtPosition", { value: delayWarning }]);
    }
    if (!!debouncePositionChanges) {
      result.push(["accessibility.signalOptions.debouncePositionChanges", { value: debouncePositionChanges }]);
    }
    result.push(["accessibility.signalOptions", { value: void 0 }]);
    return result;
  }
}]);

Registry.as(Extensions14.ConfigurationMigration).registerConfigurationMigrations([{
  key: "accessibility.signals.sounds.volume",
  migrateFn: (value2) => {
    return [
      ["accessibility.signalOptions.volume", { value: value2 }],
      ["accessibility.signals.sounds.volume", { value: void 0 }]
    ];
  }
}]);

Registry.as(Extensions14.ConfigurationMigration).registerConfigurationMigrations([{
  key: "accessibility.signals.debouncePositionChanges",
  migrateFn: (value2) => {
    return [
      ["accessibility.signalOptions.debouncePositionChanges", { value: value2 }],
      ["accessibility.signals.debouncePositionChanges", { value: void 0 }]
    ];
  }
}]);

function getDelaysFromConfig(accessor, type) {
  return accessor(`accessibility.signalOptions.experimental.delays.${type}`) || accessor("accessibility.signalOptions")?.["experimental.delays"]?.[`${type}`] || accessor("accessibility.signalOptions")?.["delays"]?.[`${type}`];
}

function getVolumeFromConfig(accessor) {
  return accessor("accessibility.signalOptions.volume") || accessor("accessibility.signalOptions")?.volume || accessor("accessibility.signals.sounds.volume") || accessor("audioCues.volume");
}

function getDebouncePositionChangesFromConfig(accessor) {
  return accessor("accessibility.signalOptions.debouncePositionChanges") || accessor("accessibility.signalOptions")?.debouncePositionChanges || accessor("accessibility.signals.debouncePositionChanges") || accessor("audioCues.debouncePositionChanges");
}

Registry.as(Extensions14.ConfigurationMigration).registerConfigurationMigrations([{
  key: "accessibility.voice.autoSynthesize" /* AutoSynthesize */,
  migrateFn: (value2) => {
    let newValue;
    if (value2 === true) {
      newValue = "on";
    } else if (value2 === false) {
      newValue = "off";
    } else {
      return [];
    }
    return [
      ["accessibility.voice.autoSynthesize" /* AutoSynthesize */, { value: newValue }]
    ];
  }
}]);

Registry.as(Extensions14.ConfigurationMigration).registerConfigurationMigrations([{
  key: "accessibility.signals.chatResponsePending",
  migrateFn: (value2, accessor) => {
    return [
      ["accessibility.signals.progress", { value: value2 }],
      ["accessibility.signals.chatResponsePending", { value: void 0 }]
    ];
  }
}]);

Registry.as(Extensions14.ConfigurationMigration).registerConfigurationMigrations(AccessibilitySignal.allAccessibilitySignals.map((item) => item.legacySoundSettingsKey ? {
  key: item.legacySoundSettingsKey,
  migrateFn: (sound, accessor) => {
    const configurationKeyValuePairs = [];
    const legacyAnnouncementSettingsKey = item.legacyAnnouncementSettingsKey;
    let announcement;
    if (legacyAnnouncementSettingsKey) {
      announcement = accessor(legacyAnnouncementSettingsKey) ?? void 0;
      if (announcement !== void 0 && typeof announcement !== "string") {
        announcement = announcement ? "auto" : "off";
      }
    }
    configurationKeyValuePairs.push([`${item.legacySoundSettingsKey}`, { value: void 0 }]);
    configurationKeyValuePairs.push([`${item.settingsKey}`, { value: announcement !== void 0 ? { announcement, sound } : { sound } }]);
    return configurationKeyValuePairs;
  }
} : void 0).filter(isDefined));

Registry.as(Extensions14.ConfigurationMigration).registerConfigurationMigrations(AccessibilitySignal.allAccessibilitySignals.filter((i2) => !!i2.legacyAnnouncementSettingsKey && !!i2.legacySoundSettingsKey).map((item) => ({
  key: item.legacyAnnouncementSettingsKey,
  migrateFn: (announcement, accessor) => {
    const configurationKeyValuePairs = [];
    const sound = accessor(item.settingsKey)?.sound || accessor(item.legacySoundSettingsKey);
    if (announcement !== void 0 && typeof announcement !== "string") {
      announcement = announcement ? "auto" : "off";
    }
    configurationKeyValuePairs.push([`${item.settingsKey}`, { value: announcement !== void 0 ? { announcement, sound } : { sound } }]);
    configurationKeyValuePairs.push([`${item.legacyAnnouncementSettingsKey}`, { value: void 0 }]);
    configurationKeyValuePairs.push([`${item.legacySoundSettingsKey}`, { value: void 0 }]);
    return configurationKeyValuePairs;
  }
})));
export { registerAccessibilityConfiguration, getDelaysFromConfig, getVolumeFromConfig, getDebouncePositionChangesFromConfig, accessibilityHelpIsShown, accessibleViewIsShown, accessibleViewSupportsNavigation, accessibleViewVerbosityEnabled, accessibleViewGoToSymbolSupported, accessibleViewOnLastLine, accessibleViewCurrentProviderId, accessibleViewInCodeBlock, accessibleViewContainsCodeBlocks, accessibleViewHasUnassignedKeybindings, accessibleViewHasAssignedKeybindings, baseVerbosityProperty, accessibilityConfigurationNodeBase, soundFeatureBase, signalFeatureBase, announcementFeatureBase, defaultNoAnnouncement, configuration, SpeechTimeoutDefault, DynamicSpeechAccessibilityConfiguration };
