// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/common/terminalConfiguration.ts
import { localize } from "./module-0001.mjs";
import { isMacintosh, isWindows } from "./module-0014.mjs";
import { terminalColorSchema, terminalIconSchema } from "./module-1160.mjs";
import { Codicon } from "./module-0085.mjs";
import { DEFAULT_COMMANDS_TO_SKIP_SHELL, DEFAULT_LETTER_SPACING, DEFAULT_LINE_HEIGHT, MAXIMUM_FONT_WEIGHT, MINIMUM_FONT_WEIGHT, SUGGESTIONS_FONT_WEIGHT } from "./module-1173.mjs";
import { TerminalContribSettingId, terminalContribConfiguration } from "./module-1172.mjs";
import { product_default } from "./module-0139.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { Extensions14 } from "./module-1112.mjs";
import { isString } from "./module-0010.mjs";


// src/vs/workbench/contrib/terminal/common/terminalConfiguration.ts
var terminalDescriptors = "\n- " + [
  "`${cwd}`: " + localize(20159, null),
  "`${cwdFolder}`: " + localize(20160, null),
  "`${workspaceFolder}`: " + localize(20320, null),
  "`${workspaceFolderName}`: " + localize(20321, null),
  "`${local}`: " + localize(20167, null),
  "`${process}`: " + localize(20170, null),
  "`${progress}`: " + localize(20171, null),
  "`${separator}`: " + localize(20172, null, "(` - `)"),
  "`${sequence}`: " + localize(20173, null),
  "`${task}`: " + localize(20177, null),
  "`${shellType}`: " + localize(20176, null),
  "`${shellCommand}`: " + localize(20174, null),
  "`${shellPromptInput}`: " + localize(20175, null)
].join("\n- ");

var terminalTitle = localize(20319, null);

terminalTitle += terminalDescriptors;

var terminalDescription = localize(20317, null);

terminalDescription += terminalDescriptors;

var defaultTerminalFontSize = isMacintosh ? 12 : 14;

var terminalConfiguration = {
  ["terminal.integrated.sendKeybindingsToShell" /* SendKeybindingsToShell */]: {
    markdownDescription: localize(20268, null, "`#terminal.integrated.commandsToSkipShell#`"),
    type: "boolean",
    default: false
  },
  ["terminal.integrated.tabs.defaultColor" /* TabsDefaultColor */]: {
    description: localize(20285, null),
    ...terminalColorSchema,
    scope: 5 /* RESOURCE */
  },
  ["terminal.integrated.tabs.defaultIcon" /* TabsDefaultIcon */]: {
    description: localize(20286, null),
    ...terminalIconSchema,
    default: Codicon.terminal.id,
    scope: 5 /* RESOURCE */
  },
  ["terminal.integrated.tabs.enabled" /* TabsEnabled */]: {
    description: localize(20288, null),
    type: "boolean",
    default: true
  },
  ["terminal.integrated.tabs.enableAnimation" /* TabsEnableAnimation */]: {
    description: localize(20287, null),
    type: "boolean",
    default: true
  },
  ["terminal.integrated.tabs.hideCondition" /* TabsHideCondition */]: {
    description: localize(20292, null),
    type: "string",
    enum: ["never", "singleTerminal", "singleGroup"],
    enumDescriptions: [
      localize(20293, null),
      localize(20295, null),
      localize(20294, null)
    ],
    default: "singleTerminal"
  },
  ["terminal.integrated.tabs.showActiveTerminal" /* TabsShowActiveTerminal */]: {
    description: localize(20305, null),
    type: "string",
    enum: ["always", "singleTerminal", "singleTerminalOrNarrow", "never"],
    enumDescriptions: [
      localize(20306, null),
      localize(20308, null),
      localize(20309, null),
      localize(20307, null)
    ],
    default: "singleTerminalOrNarrow"
  },
  ["terminal.integrated.tabs.showActions" /* TabsShowActions */]: {
    description: localize(20300, null),
    type: "string",
    enum: ["always", "singleTerminal", "singleTerminalOrNarrow", "never"],
    enumDescriptions: [
      localize(20301, null),
      localize(20303, null),
      localize(20304, null),
      localize(20302, null)
    ],
    default: "singleTerminalOrNarrow"
  },
  ["terminal.integrated.tabs.location" /* TabsLocation */]: {
    type: "string",
    enum: ["left", "right"],
    enumDescriptions: [
      localize(20297, null),
      localize(20298, null)
    ],
    default: "right",
    description: localize(20296, null)
  },
  ["terminal.integrated.defaultLocation" /* DefaultLocation */]: {
    type: "string",
    enum: ["editor" /* Editor */, "view" /* TerminalView */],
    enumDescriptions: [
      localize(20202, null),
      localize(20203, null)
    ],
    default: "view",
    description: localize(20201, null),
    agentsWindow: { default: "view", readOnly: true }
  },
  ["terminal.integrated.tabs.focusMode" /* TabsFocusMode */]: {
    type: "string",
    enum: ["singleClick", "doubleClick"],
    enumDescriptions: [
      localize(20291, null),
      localize(20290, null)
    ],
    default: "doubleClick",
    description: localize(20289, null)
  },
  ["terminal.integrated.tabs.allowAgentCliTitle" /* TabsAllowAgentCliTitle */]: {
    description: localize(20284, null),
    type: "boolean",
    default: true
  },
  ["terminal.integrated.macOptionIsMeta" /* MacOptionIsMeta */]: {
    description: localize(20250, null),
    type: "boolean",
    default: false
  },
  ["terminal.integrated.macOptionClickForcesSelection" /* MacOptionClickForcesSelection */]: {
    description: localize(20249, null),
    type: "boolean",
    default: false
  },
  ["terminal.integrated.altClickMovesCursor" /* AltClickMovesCursor */]: {
    markdownDescription: localize(20182, null, "`#editor.multiCursorModifier#`", "`'alt'`"),
    type: "boolean",
    default: true
  },
  ["terminal.integrated.copyOnSelection" /* CopyOnSelection */]: {
    description: localize(20194, null),
    type: "boolean",
    default: false
  },
  ["terminal.integrated.enableMultiLinePasteWarning" /* EnableMultiLinePasteWarning */]: {
    markdownDescription: localize(20216, null),
    type: "string",
    enum: ["auto", "always", "never"],
    markdownEnumDescriptions: [
      localize(20218, null),
      localize(20217, null),
      localize(20219, null)
    ],
    default: "auto"
  },
  ["terminal.integrated.drawBoldTextInBrightColors" /* DrawBoldTextInBrightColors */]: {
    description: localize(20211, null),
    type: "boolean",
    default: true
  },
  ["terminal.integrated.fontFamily" /* FontFamily */]: {
    markdownDescription: localize(20232, null, "`#editor.fontFamily#`"),
    type: "string"
  },
  ["terminal.integrated.fontLigatures.enabled" /* FontLigaturesEnabled */]: {
    markdownDescription: localize(20233, null, `\`#${"terminal.integrated.fontFamily" /* FontFamily */}#\``),
    type: "boolean",
    default: false
  },
  ["terminal.integrated.fontLigatures.featureSettings" /* FontLigaturesFeatureSettings */]: {
    markdownDescription: localize(20235, null) + "\n\n- " + [
      `\`"calt" off, "ss03"\``,
      `\`"liga" on\``,
      `\`"calt" off, "dlig" on\``
    ].join("\n- "),
    type: "string",
    default: '"calt" on'
  },
  ["terminal.integrated.fontLigatures.fallbackLigatures" /* FontLigaturesFallbackLigatures */]: {
    markdownDescription: localize(20234, null, `\`#${"terminal.integrated.gpuAcceleration" /* GpuAcceleration */}#\``, `\`#${"terminal.integrated.fontFamily" /* FontFamily */}#\``),
    type: "array",
    items: [{ type: "string" }],
    default: [
      "<--",
      "<---",
      "<<-",
      "<-",
      "->",
      "->>",
      "-->",
      "--->",
      "<==",
      "<===",
      "<<=",
      "<=",
      "=>",
      "=>>",
      "==>",
      "===>",
      ">=",
      ">>=",
      "<->",
      "<-->",
      "<--->",
      "<---->",
      "<=>",
      "<==>",
      "<===>",
      "<====>",
      "::",
      ":::",
      "<~~",
      "</",
      "</>",
      "/>",
      "~~>",
      "==",
      "!=",
      "/=",
      "~=",
      "<>",
      "===",
      "!==",
      "!===",
      "<:",
      ":=",
      "*=",
      "*+",
      "<*",
      "<*>",
      "*>",
      "<|",
      "<|>",
      "|>",
      "+*",
      "=*",
      "=:",
      ":>",
      "/*",
      "*/",
      "+++",
      "<!--",
      "<!---"
    ]
  },
  ["terminal.integrated.fontSize" /* FontSize */]: {
    description: localize(20236, null),
    type: "number",
    default: defaultTerminalFontSize,
    minimum: 6,
    maximum: 100
  },
  ["terminal.integrated.letterSpacing" /* LetterSpacing */]: {
    description: localize(20247, null),
    type: "number",
    default: DEFAULT_LETTER_SPACING
  },
  ["terminal.integrated.lineHeight" /* LineHeight */]: {
    description: localize(20248, null),
    type: "number",
    default: DEFAULT_LINE_HEIGHT
  },
  ["terminal.integrated.minimumContrastRatio" /* MinimumContrastRatio */]: {
    markdownDescription: localize(20254, null),
    type: "number",
    default: 4.5,
    tags: ["accessibility"]
  },
  ["terminal.integrated.tabStopWidth" /* TabStopWidth */]: {
    markdownDescription: localize(20310, null),
    type: "number",
    minimum: 1,
    default: 8
  },
  ["terminal.integrated.fastScrollSensitivity" /* FastScrollSensitivity */]: {
    markdownDescription: localize(20227, null),
    type: "number",
    default: 5
  },
  ["terminal.integrated.mouseWheelScrollSensitivity" /* MouseWheelScrollSensitivity */]: {
    markdownDescription: localize(20255, null),
    type: "number",
    default: 1
  },
  ["terminal.integrated.bellDuration" /* BellDuration */]: {
    markdownDescription: localize(20183, null),
    type: "number",
    default: 1e3
  },
  ["terminal.integrated.fontWeight" /* FontWeight */]: {
    "anyOf": [
      {
        type: "number",
        minimum: MINIMUM_FONT_WEIGHT,
        maximum: MAXIMUM_FONT_WEIGHT,
        errorMessage: localize(20239, null)
      },
      {
        type: "string",
        pattern: "^(normal|bold|1000|[1-9][0-9]{0,2})$"
      },
      {
        enum: SUGGESTIONS_FONT_WEIGHT
      }
    ],
    description: localize(20237, null),
    default: "normal"
  },
  ["terminal.integrated.fontWeightBold" /* FontWeightBold */]: {
    "anyOf": [
      {
        type: "number",
        minimum: MINIMUM_FONT_WEIGHT,
        maximum: MAXIMUM_FONT_WEIGHT,
        errorMessage: localize(20239, null)
      },
      {
        type: "string",
        pattern: "^(normal|bold|1000|[1-9][0-9]{0,2})$"
      },
      {
        enum: SUGGESTIONS_FONT_WEIGHT
      }
    ],
    description: localize(20238, null),
    default: "bold"
  },
  ["terminal.integrated.cursorBlinking" /* CursorBlinking */]: {
    description: localize(20195, null),
    type: "boolean",
    default: false
  },
  ["terminal.integrated.textBlinking" /* TextBlinking */]: {
    description: localize(20311, null),
    type: "boolean",
    default: false
  },
  ["terminal.integrated.cursorStyle" /* CursorStyle */]: {
    description: localize(20196, null),
    enum: ["block", "line", "underline"],
    default: "block"
  },
  ["terminal.integrated.cursorStyleInactive" /* CursorStyleInactive */]: {
    description: localize(20197, null),
    enum: ["outline", "block", "line", "underline", "none"],
    default: "outline"
  },
  ["terminal.integrated.cursorWidth" /* CursorWidth */]: {
    markdownDescription: localize(20198, null, "`#terminal.integrated.cursorStyle#`", "`line`"),
    type: "number",
    default: 1
  },
  ["terminal.integrated.scrollback" /* Scrollback */]: {
    description: localize(20267, null),
    type: "number",
    default: 1e3
  },
  ["terminal.integrated.detectLocale" /* DetectLocale */]: {
    markdownDescription: localize(20204, null),
    type: "string",
    enum: ["auto", "off", "on"],
    markdownEnumDescriptions: [
      localize(20205, null),
      localize(20206, null),
      localize(20207, null)
    ],
    default: "auto"
  },
  ["terminal.integrated.gpuAcceleration" /* GpuAcceleration */]: {
    type: "string",
    enum: ["auto", "on", "off"],
    markdownEnumDescriptions: [
      localize(20241, null),
      localize(20243, null),
      localize(20242, null)
    ],
    default: "auto",
    description: localize(20240, null)
  },
  ["terminal.integrated.tabs.separator" /* TerminalTitleSeparator */]: {
    "type": "string",
    "default": " - ",
    "markdownDescription": localize(20299, null, `\`#${"terminal.integrated.tabs.title" /* TerminalTitle */}#\``, `\`#${"terminal.integrated.tabs.description" /* TerminalDescription */}#\``)
  },
  ["terminal.integrated.tabs.title" /* TerminalTitle */]: {
    "type": "string",
    "default": "${process}",
    "markdownDescription": terminalTitle
  },
  ["terminal.integrated.tabs.description" /* TerminalDescription */]: {
    "type": "string",
    "default": "${task}${separator}${local}${separator}${cwdFolder}",
    "markdownDescription": terminalDescription
  },
  ["terminal.integrated.rightClickBehavior" /* RightClickBehavior */]: {
    type: "string",
    enum: ["default", "copyPaste", "paste", "selectWord", "nothing"],
    enumDescriptions: [
      localize(20263, null),
      localize(20262, null),
      localize(20265, null),
      localize(20266, null),
      localize(20264, null)
    ],
    default: isMacintosh ? "selectWord" : isWindows ? "copyPaste" : "default",
    description: localize(20261, null)
  },
  ["terminal.integrated.middleClickBehavior" /* MiddleClickBehavior */]: {
    type: "string",
    enum: ["default", "paste"],
    enumDescriptions: [
      localize(20252, null),
      localize(20253, null)
    ],
    default: "default",
    description: localize(20251, null)
  },
  ["terminal.integrated.cwd" /* Cwd */]: {
    restricted: true,
    description: localize(20200, null),
    type: "string",
    default: void 0,
    scope: 5 /* RESOURCE */
  },
  ["terminal.integrated.confirmOnExit" /* ConfirmOnExit */]: {
    description: localize(20185, null),
    type: "string",
    enum: ["never", "always", "hasChildProcesses"],
    enumDescriptions: [
      localize(20188, null),
      localize(20186, null),
      localize(20187, null)
    ],
    default: "never"
  },
  ["terminal.integrated.confirmOnKill" /* ConfirmOnKill */]: {
    description: localize(20189, null),
    type: "string",
    enum: ["never", "editor", "panel", "always"],
    enumDescriptions: [
      localize(20192, null),
      localize(20191, null),
      localize(20193, null),
      localize(20190, null)
    ],
    default: "editor"
  },
  ["terminal.integrated.enableBell" /* EnableBell */]: {
    markdownDeprecationMessage: localize(20212, null),
    type: "boolean",
    default: false
  },
  ["terminal.integrated.enableVisualBell" /* EnableVisualBell */]: {
    description: localize(20221, null),
    type: "boolean",
    default: false
  },
  ["terminal.integrated.commandsToSkipShell" /* CommandsToSkipShell */]: {
    markdownDescription: localize(
      20184,
      null,
      DEFAULT_COMMANDS_TO_SKIP_SHELL.sort().map((command4) => `- ${command4}`).join("\n"),
      `[${localize(20168, null)}](command:workbench.action.openRawDefaultSettings '${localize(20169, null)}')`
    ),
    type: "array",
    items: {
      type: "string"
    },
    default: []
  },
  ["terminal.integrated.allowChords" /* AllowChords */]: {
    markdownDescription: localize(20178, null, "`#terminal.integrated.commandsToSkipShell#`"),
    type: "boolean",
    default: true
  },
  ["terminal.integrated.allowMnemonics" /* AllowMnemonics */]: {
    markdownDescription: localize(20181, null),
    type: "boolean",
    default: false
  },
  ["terminal.integrated.env.osx" /* EnvMacOs */]: {
    restricted: true,
    markdownDescription: localize(20224, null),
    type: "object",
    additionalProperties: {
      type: ["string", "null"]
    },
    default: {}
  },
  ["terminal.integrated.env.linux" /* EnvLinux */]: {
    restricted: true,
    markdownDescription: localize(20223, null),
    type: "object",
    additionalProperties: {
      type: ["string", "null"]
    },
    default: {}
  },
  ["terminal.integrated.env.windows" /* EnvWindows */]: {
    restricted: true,
    markdownDescription: localize(20225, null),
    type: "object",
    additionalProperties: {
      type: ["string", "null"]
    },
    default: {}
  },
  ["terminal.integrated.environmentChangesRelaunch" /* EnvironmentChangesRelaunch */]: {
    markdownDescription: localize(20226, null),
    type: "boolean",
    default: true
  },
  ["terminal.integrated.showExitAlert" /* ShowExitAlert */]: {
    description: localize(20278, null),
    type: "boolean",
    default: true
  },
  ["terminal.integrated.windowsUseConptyDll" /* WindowsUseConptyDll */]: {
    restricted: true,
    markdownDescription: localize(20315, null),
    type: "boolean",
    default: true
  },
  ["terminal.integrated.splitCwd" /* SplitCwd */]: {
    description: localize(20280, null),
    type: "string",
    enum: ["workspaceRoot", "initial", "inherited"],
    enumDescriptions: [
      localize(20283, null),
      localize(20282, null),
      localize(20281, null)
    ],
    default: "inherited"
  },
  ["terminal.integrated.wordSeparators" /* WordSeparators */]: {
    markdownDescription: localize(20316, null),
    type: "string",
    // allow-any-unicode-next-line
    default: " ()[]{}',\"`\u2500\u2018\u2019\u201C\u201D|"
  },
  ["terminal.integrated.enableFileLinks" /* EnableFileLinks */]: {
    description: localize(20213, null),
    type: "string",
    enum: ["off", "on", "notRemote"],
    enumDescriptions: [
      localize(20162, null),
      localize(20163, null),
      localize(20161, null)
    ],
    default: "on"
  },
  ["terminal.integrated.allowedLinkSchemes" /* AllowedLinkSchemes */]: {
    description: localize(20179, null),
    type: "array",
    items: {
      type: "string"
    },
    default: [
      "file",
      "http",
      "https",
      "mailto",
      "vscode",
      "vscode-insiders"
    ]
  },
  ["terminal.integrated.unicodeVersion" /* UnicodeVersion */]: {
    type: "string",
    enum: ["6", "11"],
    enumDescriptions: [
      localize(20314, null),
      localize(20313, null)
    ],
    default: "11",
    description: localize(20312, null)
  },
  ["terminal.integrated.enablePersistentSessions" /* EnablePersistentSessions */]: {
    description: localize(20220, null),
    type: "boolean",
    default: true
  },
  ["terminal.integrated.persistentSessionReviveProcess" /* PersistentSessionReviveProcess */]: {
    markdownDescription: localize(20256, null),
    type: "string",
    enum: ["onExit", "onExitAndWindowClose", "never"],
    markdownEnumDescriptions: [
      localize(20258, null),
      localize(20259, null),
      localize(20257, null)
    ],
    default: "onExit"
  },
  ["terminal.integrated.hideOnStartup" /* HideOnStartup */]: {
    description: localize(20245, null),
    type: "string",
    enum: ["never", "whenEmpty", "always"],
    markdownEnumDescriptions: [
      localize(20165, null),
      localize(20166, null),
      localize(20164, null)
    ],
    default: "never"
  },
  ["terminal.integrated.hideOnLastClosed" /* HideOnLastClosed */]: {
    description: localize(20244, null),
    type: "boolean",
    default: true
  },
  ["terminal.integrated.customGlyphs" /* CustomGlyphs */]: {
    markdownDescription: localize(20199, null, [
      "- Box Drawing (U+2500-U+257F)",
      "- Block Elements (U+2580-U+259F)",
      "- Braille Patterns (U+2800-U+28FF)",
      "- Powerline Symbols (U+E0A0-U+E0D4, Private Use Area)",
      "- Progress Indicators (U+EE00-U+EE0B, Private Use Area)",
      "- Git Branch Symbols (U+F5D0-U+F60D, Private Use Area)",
      "- Symbols for Legacy Computing (U+1FB00-U+1FBFF)"
    ].join("\n"), `\`#${"terminal.integrated.gpuAcceleration" /* GpuAcceleration */}#\``),
    type: "boolean",
    default: true
  },
  ["terminal.integrated.rescaleOverlappingGlyphs" /* RescaleOverlappingGlyphs */]: {
    markdownDescription: localize(20260, null),
    type: "boolean",
    default: true
  },
  ["terminal.integrated.enableKittyKeyboardProtocol" /* EnableKittyKeyboardProtocol */]: {
    restricted: true,
    markdownDescription: localize(20215, null),
    type: "boolean",
    default: true,
    tags: ["advanced"]
  },
  ["terminal.integrated.enableWin32InputMode" /* EnableWin32InputMode */]: {
    restricted: true,
    markdownDescription: localize(20222, null),
    type: "boolean",
    default: false,
    tags: ["experimental", "advanced"],
    experiment: {
      mode: "auto"
    }
  },
  ["terminal.integrated.shellIntegration.enabled" /* ShellIntegrationEnabled */]: {
    restricted: true,
    markdownDescription: localize(20274, null, "`#terminal.integrated.shellIntegration.decorationsEnabled#`", "`#editor.accessibilitySupport#`"),
    type: "boolean",
    default: true
  },
  ["terminal.integrated.shellIntegration.decorationsEnabled" /* ShellIntegrationDecorationsEnabled */]: {
    restricted: true,
    markdownDescription: localize(20269, null),
    type: "string",
    enum: ["both", "gutter", "overviewRuler", "never"],
    enumDescriptions: [
      localize(20270, null),
      localize(20271, null),
      localize(20273, null),
      localize(20272, null)
    ],
    default: "both"
  },
  ["terminal.integrated.shellIntegration.timeout" /* ShellIntegrationTimeout */]: {
    restricted: true,
    markdownDescription: localize(20277, null, "`-1`"),
    type: "integer",
    minimum: -1,
    maximum: 6e4,
    default: -1
  },
  ["terminal.integrated.shellIntegration.quickFixEnabled" /* ShellIntegrationQuickFixEnabled */]: {
    restricted: true,
    markdownDescription: localize(20276, null),
    type: "boolean",
    default: true
  },
  ["terminal.integrated.shellIntegration.environmentReporting" /* ShellIntegrationEnvironmentReporting */]: {
    markdownDescription: localize(20275, null, `\`#${TerminalContribSettingId.SuggestEnabled}#\``),
    type: "boolean",
    default: product_default.quality !== "stable"
  },
  ["terminal.integrated.smoothScrolling" /* SmoothScrolling */]: {
    markdownDescription: localize(20279, null),
    type: "boolean",
    default: false
  },
  ["terminal.integrated.ignoreBracketedPasteMode" /* IgnoreBracketedPasteMode */]: {
    markdownDescription: localize(20246, null, "`\\x1b[200~`", "`\\x1b[201~`"),
    type: "boolean",
    default: false
  },
  ["terminal.integrated.enableImages" /* EnableImages */]: {
    restricted: true,
    markdownDescription: localize(20214, null, `\`#${"terminal.integrated.gpuAcceleration" /* GpuAcceleration */}#\``, `\`#${"terminal.integrated.windowsUseConptyDll" /* WindowsUseConptyDll */}#\``),
    type: "boolean",
    default: false
  },
  ["terminal.integrated.focusAfterRun" /* FocusAfterRun */]: {
    markdownDescription: localize(20228, null),
    enum: ["terminal", "accessible-buffer", "none"],
    default: "none",
    tags: ["accessibility"],
    markdownEnumDescriptions: [
      localize(20231, null),
      localize(20229, null),
      localize(20230, null)
    ]
  },
  ["terminal.integrated.allowInUntrustedWorkspace" /* AllowInUntrustedWorkspace */]: {
    restricted: true,
    markdownDescription: localize(20180, null),
    type: "boolean",
    default: false
  },
  ["terminal.integrated.developer.ptyHost.latency" /* DeveloperPtyHostLatency */]: {
    description: localize(20209, null),
    type: "number",
    minimum: 0,
    default: 0,
    tags: ["advanced"]
  },
  ["terminal.integrated.developer.ptyHost.startupDelay" /* DeveloperPtyHostStartupDelay */]: {
    description: localize(20210, null),
    type: "number",
    minimum: 0,
    default: 0,
    tags: ["advanced"]
  },
  ["terminal.integrated.developer.devMode" /* DevMode */]: {
    description: localize(20208, null),
    type: "boolean",
    default: false,
    tags: ["advanced"]
  },
  ...terminalContribConfiguration
};

async function registerTerminalConfiguration(getFontSnippets2) {
  const configurationRegistry30 = Registry.as(Extensions4.Configuration);
  configurationRegistry30.registerConfiguration({
    id: "terminal",
    order: 100,
    title: localize(20318, null),
    type: "object",
    properties: terminalConfiguration
  });
  terminalConfiguration["terminal.integrated.fontFamily" /* FontFamily */].defaultSnippets = await getFontSnippets2();
}

Registry.as(Extensions14.ConfigurationMigration).registerConfigurationMigrations([{
  key: "terminal.integrated.enableBell" /* EnableBell */,
  migrateFn: (enableBell, accessor) => {
    const configurationKeyValuePairs = [];
    let announcement = accessor("accessibility.signals.terminalBell")?.announcement ?? accessor("accessibility.alert.terminalBell");
    if (announcement !== void 0 && !isString(announcement)) {
      announcement = announcement ? "auto" : "off";
    }
    configurationKeyValuePairs.push(["accessibility.signals.terminalBell", { value: { sound: enableBell ? "on" : "off", announcement } }]);
    configurationKeyValuePairs.push(["terminal.integrated.enableBell" /* EnableBell */, { value: void 0 }]);
    configurationKeyValuePairs.push(["terminal.integrated.enableVisualBell" /* EnableVisualBell */, { value: enableBell }]);
    return configurationKeyValuePairs;
  }
}]);
export { registerTerminalConfiguration, terminalDescriptors, terminalTitle, terminalDescription, defaultTerminalFontSize, terminalConfiguration };
