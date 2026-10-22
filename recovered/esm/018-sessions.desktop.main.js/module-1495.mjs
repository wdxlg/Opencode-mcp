// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/workbench.contribution.ts
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { ConfigurationMigrationWorkbenchContribution, DynamicWindowConfiguration, DynamicWorkbenchSecurityConfiguration, Extensions14, problemsConfigurationNodeBase, windowConfigurationNodeBase, workbenchConfigurationNodeBase } from "./module-1113.mjs";
import { localize } from "./module-0001.mjs";
import { isLinux, isMacintosh, isNative, isWeb, isWindows } from "./module-0014.mjs";
import { CustomEditorLabelService } from "./module-0932.mjs";
import { MOUSE_BACK_FORWARD_NAVIGATION_SETTING } from "./module-1493.mjs";
import { product_default } from "./module-0139.mjs";
import { ACCOUNTS_AVATAR_SETTING } from "./module-0952.mjs";
import { defaultWindowTitle, defaultWindowTitleSeparator } from "./module-1494.mjs";
import { isStandalone } from "./module-0018.mjs";


// src/vs/workbench/browser/workbench.contribution.ts
var registry2 = Registry.as(Extensions4.Configuration);

(function registerConfiguration() {
  registerWorkbenchContribution2(ConfigurationMigrationWorkbenchContribution.ID, ConfigurationMigrationWorkbenchContribution, WorkbenchPhase.Eventually);
  registerWorkbenchContribution2(DynamicWorkbenchSecurityConfiguration.ID, DynamicWorkbenchSecurityConfiguration, WorkbenchPhase.AfterRestored);
  registry2.registerConfiguration({
    ...workbenchConfigurationNodeBase,
    "properties": {
      "workbench.externalBrowser": {
        type: "string",
        markdownDescription: localize(7031, null),
        included: isNative,
        restricted: true
      },
      "workbench.editor.titleScrollbarSizing": {
        type: "string",
        enum: ["default", "large"],
        enumDescriptions: [
          localize(7227, null),
          localize(7228, null)
        ],
        description: localize(7129, null),
        default: "default"
      },
      "workbench.editor.titleScrollbarVisibility": {
        type: "string",
        enum: ["auto", "visible", "hidden"],
        enumDescriptions: [
          localize(7229, null),
          localize(7231, null),
          localize(7230, null)
        ],
        description: localize(7132, null),
        default: "auto"
      },
      ["workbench.editor.showTabs" /* EDITOR_TABS_MODE */]: {
        "type": "string",
        "enum": ["multiple" /* MULTIPLE */, "single" /* SINGLE */, "none" /* NONE */],
        "enumDescriptions": [
          localize(7210, null),
          localize(7212, null),
          localize(7211, null)
        ],
        "description": localize(7116, null),
        "default": "multiple"
      },
      ["workbench.editor.editorActionsLocation" /* EDITOR_ACTIONS_LOCATION */]: {
        "type": "string",
        "enum": ["default" /* DEFAULT */, "titleBar" /* TITLEBAR */, "hidden" /* HIDDEN */],
        "markdownEnumDescriptions": [
          localize(7176, null, "`#workbench.editor.showTabs#`", "`none`"),
          localize(7178, null, "`#window.customTitleBarVisibility#`", "`never`"),
          localize(7177, null)
        ],
        "markdownDescription": localize(7047, null),
        "default": "default",
        agentsWindow: { default: "default", readOnly: true }
      },
      "workbench.editor.alwaysShowEditorActions": {
        "type": "boolean",
        "markdownDescription": localize(7026, null),
        "default": false
      },
      "workbench.editor.wrapTabs": {
        "type": "boolean",
        "markdownDescription": localize(7262, null, "`#workbench.editor.showTabs#`", "`multiple`"),
        "default": false
      },
      "workbench.editor.scrollToSwitchTabs": {
        "type": "boolean",
        "markdownDescription": localize(7104, null, "`#workbench.editor.showTabs#`", "`multiple`"),
        "default": false
      },
      "workbench.editor.highlightModifiedTabs": {
        "type": "boolean",
        "markdownDescription": localize(7060, null, "`#workbench.editor.showTabs#`", `multiple`),
        "default": false
      },
      "workbench.editor.decorations.badges": {
        "type": "boolean",
        "markdownDescription": localize(7042, null),
        "default": true
      },
      "workbench.editor.decorations.colors": {
        "type": "boolean",
        "markdownDescription": localize(7043, null),
        "default": true
      },
      [CustomEditorLabelService.SETTING_ID_ENABLED]: {
        "type": "boolean",
        "markdownDescription": localize(7182, null),
        "default": true
      },
      [CustomEditorLabelService.SETTING_ID_PATTERNS]: {
        "type": "object",
        "markdownDescription": (() => {
          let customEditorLabelDescription = localize(7187, null);
          customEditorLabelDescription += "\n- " + [
            localize(7181, null),
            localize(7185, null),
            localize(7184, null),
            localize(7183, null),
            localize(7186, null)
          ].join("\n- ");
          customEditorLabelDescription += "\n\n" + localize(7040, null);
          return customEditorLabelDescription;
        })(),
        additionalProperties: {
          type: ["string", "null"],
          markdownDescription: localize(7188, null),
          minLength: 1,
          pattern: ".*[a-zA-Z0-9].*"
        },
        "default": {}
      },
      "workbench.editor.labelFormat": {
        "type": "string",
        "enum": ["default", "short", "medium", "long"],
        "enumDescriptions": [
          localize(7189, null),
          localize(7192, null),
          localize(7191, null),
          localize(7190, null)
        ],
        "default": "default",
        "description": localize(7128, null)
      },
      "workbench.editor.untitled.labelFormat": {
        "type": "string",
        "enum": ["content", "name"],
        "enumDescriptions": [
          localize(7232, null),
          localize(7233, null)
        ],
        "default": "content",
        "description": localize(7133, null)
      },
      "workbench.editor.empty.hint": {
        "type": "string",
        "enum": ["text", "hidden"],
        "default": "text",
        "markdownDescription": localize(7179, null)
      },
      "workbench.editor.languageDetection": {
        type: "boolean",
        default: true,
        description: localize(7193, null),
        scope: 6 /* LANGUAGE_OVERRIDABLE */
      },
      "workbench.editor.historyBasedLanguageDetection": {
        type: "boolean",
        default: true,
        description: localize(7180, null)
      },
      "workbench.editor.preferHistoryBasedLanguageDetection": {
        type: "boolean",
        default: false,
        description: localize(7201, null)
      },
      "workbench.editor.languageDetectionHints": {
        type: "object",
        default: { "untitledEditors": true, "notebookEditors": true },
        description: localize(7207, null),
        additionalProperties: false,
        properties: {
          untitledEditors: {
            type: "boolean",
            description: localize(7208, null)
          },
          notebookEditors: {
            type: "boolean",
            description: localize(7209, null)
          }
        }
      },
      "workbench.editor.tabActionLocation": {
        type: "string",
        enum: ["left", "right"],
        default: "right",
        markdownDescription: localize(7127, null, "`#workbench.editor.showTabs#`", "`multiple`")
      },
      "workbench.editor.tabActionReserveSpace": {
        type: "boolean",
        default: true,
        description: localize(7219, null)
      },
      "workbench.editor.tabActionCloseVisibility": {
        type: "boolean",
        default: true,
        description: localize(7218, null)
      },
      "workbench.editor.tabActionUnpinVisibility": {
        type: "boolean",
        default: true,
        description: localize(7220, null)
      },
      "workbench.editor.showTabIndex": {
        "type": "boolean",
        "default": false,
        "markdownDescription": localize(7118, null, "`#workbench.editor.showTabs#`", "`multiple`")
      },
      "workbench.editor.tabSizing": {
        "type": "string",
        "enum": ["fit", "shrink", "fixed"],
        "default": "fit",
        "enumDescriptions": [
          localize(7222, null),
          localize(7224, null),
          localize(7223, null)
        ],
        "markdownDescription": localize(7130, null, "`#workbench.editor.showTabs#`", "`multiple`")
      },
      "workbench.editor.tabSizingFixedMinWidth": {
        "type": "number",
        "default": 50,
        "minimum": 38,
        "markdownDescription": localize(7226, null, "`#workbench.editor.tabSizing#`", "`fixed`")
      },
      "workbench.editor.tabSizingFixedMaxWidth": {
        "type": "number",
        "default": 160,
        "minimum": 38,
        "markdownDescription": localize(7225, null, "`#workbench.editor.tabSizing#`", "`fixed`")
      },
      "window.density.editorTabHeight": {
        "type": "string",
        "enum": ["default", "compact"],
        "default": "default",
        "markdownDescription": localize(7221, null, "`#workbench.editor.showTabs#`", "`multiple`")
      },
      ["window.density.layout" /* MODERN_UI_DENSITY */]: {
        "type": "string",
        "enum": ["default" /* Default */, "compact" /* Compact */],
        "enumDescriptions": [
          localize(7165, null),
          localize(7164, null)
        ],
        "default": "default" /* Default */,
        "markdownDescription": localize(7163, null, "`#workbench.experimental.modernUI#`")
      },
      "workbench.editor.pinnedTabSizing": {
        "type": "string",
        "enum": ["normal", "compact", "shrink"],
        "default": "normal",
        "enumDescriptions": [
          localize(7198, null),
          localize(7197, null),
          localize(7199, null)
        ],
        "markdownDescription": localize(7093, null, "`#workbench.editor.showTabs#`", "`multiple`")
      },
      "workbench.editor.pinnedTabsOnSeparateRow": {
        "type": "boolean",
        "default": false,
        "markdownDescription": localize(7200, null, "`#workbench.editor.showTabs#`", "`multiple`")
      },
      "workbench.editor.preventPinnedEditorClose": {
        "type": "string",
        "enum": ["keyboardAndMouse", "keyboard", "mouse", "never"],
        "default": "keyboardAndMouse",
        "enumDescriptions": [
          localize(7203, null),
          localize(7205, null),
          localize(7206, null),
          localize(7204, null)
        ],
        description: localize(7202, null)
      },
      "workbench.editor.splitSizing": {
        "type": "string",
        "enum": ["auto", "distribute", "split"],
        "default": "auto",
        "enumDescriptions": [
          localize(7215, null),
          localize(7216, null),
          localize(7217, null)
        ],
        "description": localize(7123, null),
        "keywords": ["pane"]
      },
      "workbench.editor.splitOnDragAndDrop": {
        "type": "boolean",
        "default": true,
        "description": localize(7122, null),
        "keywords": ["pane"]
      },
      "workbench.editor.dragToOpenWindow": {
        "type": "boolean",
        "default": true,
        "markdownDescription": localize(7046, null)
      },
      "workbench.editor.focusRecentEditorAfterClose": {
        "type": "boolean",
        "description": localize(7056, null),
        "default": true
      },
      "workbench.editor.showIcons": {
        "type": "boolean",
        "description": localize(7117, null),
        "default": true
      },
      "workbench.editor.enablePreview": {
        "type": "boolean",
        "description": localize(7051, null),
        "default": true
      },
      "workbench.editor.enablePreviewFromQuickOpen": {
        "type": "boolean",
        "markdownDescription": localize(7053, null, "`#workbench.editor.showTabs#`", "`multiple`"),
        "default": false
      },
      "workbench.editor.enablePreviewFromCodeNavigation": {
        "type": "boolean",
        "markdownDescription": localize(7052, null, "`#workbench.editor.showTabs#`", "`multiple`"),
        "default": false
      },
      "workbench.editor.closeOnFileDelete": {
        "type": "boolean",
        "description": localize(7035, null),
        "default": false
      },
      "workbench.editor.openPositioning": {
        "type": "string",
        "enum": ["left", "right", "first", "last"],
        "default": "right",
        "markdownDescription": localize(7048, null, "`left`", "`right`", "`first`", "`last`")
      },
      "workbench.editor.openSideBySideDirection": {
        "type": "string",
        "enum": ["right", "down"],
        "default": "right",
        "markdownDescription": localize(7120, null)
      },
      "workbench.editor.closeEmptyGroups": {
        "type": "boolean",
        "description": localize(7034, null),
        "default": true,
        "keywords": ["pane"]
      },
      "workbench.editor.revealIfOpen": {
        "type": "boolean",
        "description": localize(7100, null),
        "default": false
      },
      "workbench.editor.useModal": {
        "type": "string",
        "enum": ["off", "some", "all"],
        "enumDescriptions": [
          localize(7136, null),
          localize(7137, null),
          localize(7135, null)
        ],
        "description": localize(7134, null),
        "default": "some",
        experiment: {
          mode: "startup"
        }
      },
      "workbench.editor.swipeToNavigate": {
        "type": "boolean",
        "description": localize(7126, null),
        "default": false,
        "included": isMacintosh && !isWeb
      },
      [MOUSE_BACK_FORWARD_NAVIGATION_SETTING]: {
        "type": "boolean",
        "description": localize(7078, null),
        "default": true
      },
      "workbench.editor.navigationScope": {
        "type": "string",
        "enum": ["default", "editorGroup", "editor"],
        "default": "default",
        "markdownDescription": localize(7081, null),
        "enumDescriptions": [
          localize(7194, null),
          localize(7196, null),
          localize(7195, null)
        ]
      },
      "workbench.editor.restoreViewState": {
        "type": "boolean",
        "markdownDescription": localize(7099, null, "`#workbench.editor.sharedViewState#`"),
        "default": true,
        "scope": 6 /* LANGUAGE_OVERRIDABLE */
      },
      "workbench.editor.sharedViewState": {
        "type": "boolean",
        "description": localize(7114, null),
        "default": false
      },
      "workbench.editor.restoreEditors": {
        "type": "boolean",
        "description": localize(7098, null),
        "default": true,
        agentsWindow: { default: false, readOnly: true }
      },
      "workbench.editor.splitInGroupLayout": {
        "type": "string",
        "enum": ["vertical", "horizontal"],
        "default": "horizontal",
        "markdownDescription": localize(7121, null),
        "enumDescriptions": [
          localize(7214, null),
          localize(7213, null)
        ]
      },
      "workbench.editor.centeredLayoutAutoResize": {
        "type": "boolean",
        "default": true,
        "description": localize(7032, null)
      },
      "workbench.editor.centeredLayoutFixedWidth": {
        "type": "boolean",
        "default": false,
        "description": localize(7033, null)
      },
      "workbench.editor.doubleClickTabToToggleEditorGroupSizes": {
        "type": "string",
        "enum": ["maximize", "expand", "off"],
        "default": "expand",
        "markdownDescription": localize(7045, null, "`#workbench.editor.showTabs#`", "`multiple`"),
        "enumDescriptions": [
          localize(7174, null),
          localize(7173, null),
          localize(7175, null)
        ],
        agentsWindow: { default: "maximize", readOnly: true }
      },
      "workbench.editor.limit.enabled": {
        "type": "boolean",
        "default": false,
        "description": localize(7067, null)
      },
      "workbench.editor.limit.value": {
        "type": "number",
        "default": 10,
        "exclusiveMinimum": 0,
        "markdownDescription": localize(7069, null, "`#workbench.editor.limit.perEditorGroup#`")
      },
      "workbench.editor.limit.excludeDirty": {
        "type": "boolean",
        "default": false,
        "description": localize(7068, null)
      },
      "workbench.editor.limit.perEditorGroup": {
        "type": "boolean",
        "default": false,
        "description": localize(7092, null)
      },
      "workbench.localHistory.enabled": {
        "type": "boolean",
        "default": true,
        "description": localize(7070, null),
        "scope": 5 /* RESOURCE */
      },
      "workbench.localHistory.maxFileSize": {
        "type": "number",
        "default": 256,
        "minimum": 1,
        "description": localize(7072, null),
        "scope": 5 /* RESOURCE */
      },
      "workbench.localHistory.maxFileEntries": {
        "type": "number",
        "default": 50,
        "minimum": 0,
        "description": localize(7071, null),
        "scope": 5 /* RESOURCE */
      },
      "workbench.localHistory.exclude": {
        "type": "object",
        "patternProperties": {
          ".*": { "type": "boolean" }
        },
        "markdownDescription": localize(7054, null),
        "scope": 5 /* RESOURCE */
      },
      "workbench.localHistory.mergeWindow": {
        "type": "number",
        "default": 10,
        "minimum": 1,
        "markdownDescription": localize(7075, null),
        "scope": 5 /* RESOURCE */
      },
      "workbench.commandPalette.history": {
        "type": "number",
        "description": localize(7037, null),
        "default": 50,
        "minimum": 0
      },
      "workbench.commandPalette.preserveInput": {
        "type": "boolean",
        "description": localize(7094, null),
        "default": false
      },
      "workbench.commandPalette.experimental.suggestCommands": {
        "type": "boolean",
        tags: ["experimental"],
        "description": localize(7125, null),
        "default": false
      },
      "workbench.commandPalette.experimental.askChatLocation": {
        "type": "string",
        tags: ["experimental"],
        "description": localize(7028, null),
        "default": "chatView",
        enum: ["chatView", "quickChat"],
        enumDescriptions: [
          localize(7029, null),
          localize(7030, null)
        ]
      },
      "workbench.commandPalette.showAskInChat": {
        "type": "boolean",
        tags: ["experimental"],
        "description": localize(7115, null),
        "default": true
      },
      "workbench.commandPalette.experimental.enableNaturalLanguageSearch": {
        "type": "boolean",
        tags: ["experimental"],
        "description": localize(7050, null),
        "default": true
      },
      "workbench.quickOpen.closeOnFocusLost": {
        "type": "boolean",
        "description": localize(7036, null),
        "default": true
      },
      "workbench.quickOpen.preserveInput": {
        "type": "boolean",
        "description": localize(7247, null),
        "default": false
      },
      "workbench.settings.openDefaultSettings": {
        "type": "boolean",
        "description": localize(7085, null),
        "default": false
      },
      "workbench.settings.useSplitJSON": {
        "type": "boolean",
        "markdownDescription": localize(7138, null),
        "default": false
      },
      "workbench.settings.openDefaultKeybindings": {
        "type": "boolean",
        "description": localize(7084, null),
        "default": false
      },
      "workbench.settings.alwaysShowAdvancedSettings": {
        "type": "boolean",
        "description": localize(7025, null),
        "default": product_default.quality !== "stable"
      },
      "workbench.sideBar.location": {
        "type": "string",
        "enum": ["left", "right"],
        "default": "left",
        "description": localize(7119, null),
        agentsWindow: { default: "left", readOnly: true }
      },
      "workbench.panel.showLabels": {
        "type": "boolean",
        "default": true,
        "description": localize(7091, null)
      },
      "workbench.panel.defaultLocation": {
        "type": "string",
        "enum": ["left", "bottom", "top", "right"],
        "default": "bottom",
        "description": localize(7089, null),
        agentsWindow: { default: "bottom", readOnly: true }
      },
      "workbench.panel.opensMaximized": {
        "type": "string",
        "enum": ["always", "never", "preserve"],
        "default": "preserve",
        "description": localize(7090, null),
        "enumDescriptions": [
          localize(7243, null),
          localize(7244, null),
          localize(7245, null)
        ],
        agentsWindow: { default: "never", readOnly: true }
      },
      "workbench.secondarySideBar.defaultVisibility": {
        "type": "string",
        "enum": ["hidden", "visibleInWorkspace", "visible", "maximizedInWorkspace", "maximized"],
        "default": "visibleInWorkspace",
        "description": localize(7105, null),
        "enumDescriptions": [
          localize(7256, null),
          localize(7260, null),
          localize(7259, null),
          localize(7258, null),
          localize(7257, null)
        ],
        agentsWindow: { default: "visibleInWorkspace", readOnly: true }
      },
      "workbench.secondarySideBar.forceMaximized": {
        "type": "boolean",
        "default": false,
        tags: ["experimental"],
        "description": localize(7106, null),
        agentsWindow: { default: false, readOnly: true }
      },
      "workbench.secondarySideBar.showLabels": {
        "type": "boolean",
        "default": true,
        "markdownDescription": localize(7107, null, "`#workbench.activityBar.location#`", "`top`"),
        agentsWindow: { default: true, readOnly: true }
      },
      "workbench.statusBar.visible": {
        "type": "boolean",
        "default": true,
        "description": localize(7124, null),
        agentsWindow: { default: false, readOnly: true }
      },
      ["workbench.notifications.position" /* NOTIFICATIONS_POSITION */]: {
        "type": "string",
        "enum": ["bottom-right" /* BOTTOM_RIGHT */, "bottom-left" /* BOTTOM_LEFT */, "top-right" /* TOP_RIGHT */],
        "default": "bottom-right" /* BOTTOM_RIGHT */,
        "description": localize(7083, null),
        "enumDescriptions": [
          localize(7241, null),
          localize(7240, null),
          localize(7242, null)
        ],
        "tags": ["experimental"],
        "experiment": {
          "mode": "auto"
        }
      },
      ["workbench.notifications.showInTitleBar" /* NOTIFICATIONS_BUTTON */]: {
        "type": "boolean",
        "default": true,
        "description": localize(7082, null)
      },
      [ACCOUNTS_AVATAR_SETTING]: {
        "type": "boolean",
        "default": true,
        "description": localize(7010, null)
      },
      ["workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */]: {
        "type": "string",
        "enum": ["default", "top", "bottom", "hidden"],
        "default": "default",
        "markdownDescription": localize(7024, null),
        "enumDescriptions": [
          localize(7170, null),
          localize(7172, null),
          localize(7169, null),
          localize(7171, null)
        ],
        agentsWindow: { default: "default", readOnly: true }
      },
      ["workbench.activityBar.autoHide" /* ACTIVITY_BAR_AUTO_HIDE */]: {
        "type": "boolean",
        "default": false,
        "markdownDescription": localize(7021, null, "`#workbench.activityBar.location#`", "`top`", "`bottom`"),
        agentsWindow: { default: false, readOnly: true }
      },
      ["workbench.activityBar.compact" /* ACTIVITY_BAR_COMPACT */]: {
        "type": "boolean",
        "default": false,
        "markdownDescription": localize(7022, null, "`#workbench.activityBar.location#`", "`default`"),
        agentsWindow: { default: false, readOnly: true }
      },
      "workbench.activityBar.iconClickBehavior": {
        "type": "string",
        "enum": ["toggle", "focus"],
        "default": "toggle",
        "markdownDescription": localize(7023, null, "`#workbench.activityBar.location#`", "`default`"),
        "enumDescriptions": [
          localize(7168, null),
          localize(7167, null)
        ],
        agentsWindow: { default: "toggle", readOnly: true }
      },
      "workbench.view.alwaysShowHeaderActions": {
        "type": "boolean",
        "default": false,
        "description": localize(7139, null)
      },
      "workbench.view.showQuietly": {
        "type": "object",
        "description": localize(7261, null),
        "scope": 4 /* WINDOW */,
        "properties": {
          "workbench.panel.output": {
            "type": "boolean",
            "description": localize(7246, null)
          }
        },
        "additionalProperties": false
      },
      "workbench.fontAliasing": {
        "type": "string",
        "enum": ["default", "antialiased", "none", "auto"],
        "default": "default",
        "description": localize(7059, null),
        "enumDescriptions": [
          localize(7236, null),
          localize(7234, null),
          localize(7237, null),
          localize(7235, null)
        ],
        "included": isMacintosh
      },
      "workbench.settings.editor": {
        "type": "string",
        "enum": ["ui", "json"],
        "enumDescriptions": [
          localize(7111, null),
          localize(7110, null)
        ],
        "description": localize(7109, null),
        "default": "ui",
        "scope": 4 /* WINDOW */
      },
      "workbench.settings.showAISearchToggle": {
        "type": "boolean",
        "default": true,
        "description": localize(7112, null)
      },
      "workbench.hover.delay": {
        "type": "number",
        "description": localize(7238, null),
        // Testing has indicated that on Windows and Linux 500 ms matches the native hovers most closely.
        // On Mac, the delay is 1500.
        "default": isMacintosh ? 1500 : 500,
        "minimum": 0
      },
      "workbench.hover.reducedDelay": {
        "type": "number",
        "description": localize(7239, null),
        "default": 500,
        "minimum": 0
      },
      "workbench.reduceMotion": {
        type: "string",
        description: localize(7248, null),
        "enumDescriptions": [
          localize(7251, null),
          localize(7250, null),
          localize(7249, null)
        ],
        default: "auto",
        tags: ["accessibility"],
        enum: ["on", "off", "auto"]
      },
      "workbench.reduceTransparency": {
        type: "string",
        description: localize(7252, null),
        "enumDescriptions": [
          localize(7255, null),
          localize(7254, null),
          localize(7253, null)
        ],
        default: "off",
        tags: ["accessibility"],
        enum: ["on", "off", "auto"]
      },
      "workbench.navigationControl.enabled": {
        "type": "boolean",
        "default": true,
        "markdownDescription": isWeb ? localize(7080, null) : localize(7079, null, "`#window.customTitleBarVisibility#`", "`never`"),
        agentsWindow: { default: false, readOnly: true }
      },
      ["workbench.layoutControl.enabled" /* LAYOUT_ACTIONS */]: {
        "type": "boolean",
        "default": true,
        "markdownDescription": isWeb ? localize(7065, null) : localize(7064, null, "`#window.customTitleBarVisibility#`", "`never`"),
        agentsWindow: { default: true, readOnly: true }
      },
      "workbench.layoutControl.type": {
        "type": "string",
        "enum": ["menu", "toggles", "both"],
        "enumDescriptions": [
          localize(7062, null),
          localize(7063, null),
          localize(7061, null)
        ],
        "default": "both",
        "description": localize(7066, null),
        agentsWindow: { default: "both", readOnly: true }
      },
      "workbench.tips.enabled": {
        "type": "boolean",
        "default": true,
        "description": localize(7131, null),
        agentsWindow: { default: false }
      },
      ["workbench.shadows" /* SHADOWS */]: {
        "type": "boolean",
        "default": true,
        "description": localize(7113, null)
      },
      ["workbench.experimental.modernUI" /* MODERN_UI */]: {
        "type": "boolean",
        "default": false,
        "description": localize(7076, null),
        experiment: { mode: "auto" }
      },
      ["workbench.experimental.modernUIUppercaseViewHeaders" /* MODERN_UI_UPPERCASE_VIEW_HEADERS */]: {
        "type": "boolean",
        "default": false,
        "tags": ["experimental"],
        "markdownDescription": localize(7077, null, "`#workbench.experimental.modernUI#`")
      }
    }
  });
  let windowTitleDescription = localize(7166, null);
  windowTitleDescription += "\n- " + [
    localize(7014, null),
    localize(7013, null),
    localize(7012, null),
    localize(7011, null),
    localize(7018, null),
    localize(7017, null),
    localize(7016, null),
    localize(7057, null),
    localize(7058, null),
    localize(7101, null),
    localize(7102, null),
    localize(7103, null),
    localize(7096, null),
    localize(7027, null),
    localize(7097, null),
    localize(7044, null),
    localize(7055, null),
    localize(7020, null),
    localize(7019, null),
    localize(7015, null, "`accessibility.windowTitleOptimized`"),
    localize(7108, null)
  ].join("\n- ");
  registry2.registerConfiguration({
    ...windowConfigurationNodeBase,
    "properties": {
      "window.title": {
        "type": "string",
        "default": defaultWindowTitle,
        "markdownDescription": windowTitleDescription,
        agentsWindow: { default: "${appName}", readOnly: true }
      },
      "window.titleSeparator": {
        "type": "string",
        "default": defaultWindowTitleSeparator,
        "markdownDescription": localize(7162, null, "`#window.title#`")
      },
      ["window.commandCenter" /* COMMAND_CENTER */]: {
        type: "boolean",
        default: true,
        markdownDescription: isWeb ? localize(7141, null) : localize(7140, null, "`#window.customTitleBarVisibility#`", "`never`"),
        agentsWindow: { default: false, readOnly: true }
      },
      "window.menuBarVisibility": {
        "type": "string",
        "enum": ["classic", "visible", "toggle", "hidden", "compact"],
        "markdownEnumDescriptions": [
          localize(7148, null),
          localize(7154, null),
          isMacintosh ? localize(7153, null) : localize(7152, null),
          localize(7151, null),
          isWeb ? localize(7150, null) : localize(7149, null, "`#window.titleBarStyle#`", "`native`", "`#window.menuStyle#`", "`native`", "`inherit`")
        ],
        "default": isWeb ? "compact" : "classic",
        "scope": 1 /* APPLICATION */,
        "markdownDescription": isMacintosh ? localize(7074, null) : localize(7073, null),
        "included": isWindows || isLinux || isWeb
      },
      "window.enableMenuBarMnemonics": {
        "type": "boolean",
        "default": true,
        "scope": 1 /* APPLICATION */,
        "description": localize(7049, null),
        "included": isWindows || isLinux
      },
      "window.customMenuBarAltFocus": {
        "type": "boolean",
        "default": true,
        "scope": 1 /* APPLICATION */,
        "markdownDescription": localize(7041, null),
        "included": isWindows || isLinux,
        agentsWindow: { default: false, readOnly: true }
      },
      "window.openFilesInNewWindow": {
        "type": "string",
        "enum": ["on", "off", "default"],
        "enumDescriptions": [
          localize(7158, null),
          localize(7157, null),
          isMacintosh ? localize(7156, null) : localize(7155, null)
        ],
        "default": "off",
        "scope": 1 /* APPLICATION */,
        "markdownDescription": isMacintosh ? localize(7087, null) : localize(7086, null)
      },
      "window.openFoldersInNewWindow": {
        "type": "string",
        "enum": ["on", "off", "default"],
        "enumDescriptions": [
          localize(7161, null),
          localize(7160, null),
          localize(7159, null)
        ],
        "default": "default",
        "scope": 1 /* APPLICATION */,
        "markdownDescription": localize(7088, null)
      },
      "window.confirmBeforeClose": {
        "type": "string",
        "enum": ["always", "keyboardOnly", "never"],
        "enumDescriptions": [
          isWeb ? localize(7143, null) : localize(7142, null),
          isWeb ? localize(7145, null) : localize(7144, null),
          isWeb ? localize(7147, null) : localize(7146, null)
        ],
        "default": isWeb && !isStandalone() ? "keyboardOnly" : "never",
        // on by default in web, unless PWA, never on desktop
        "markdownDescription": isWeb ? localize(7039, null) : localize(7038, null),
        "scope": 1 /* APPLICATION */
      }
    }
  });
  registerWorkbenchContribution2(DynamicWindowConfiguration.ID, DynamicWindowConfiguration, WorkbenchPhase.Eventually);
  registry2.registerConfiguration({
    ...problemsConfigurationNodeBase,
    "properties": {
      "problems.visibility": {
        "type": "boolean",
        "default": true,
        "description": localize(7095, null)
      }
    }
  });
})();

Registry.as(Extensions14.ConfigurationMigration).registerConfigurationMigrations([{
  key: "workbench.activityBar.visible",
  migrateFn: (value2) => {
    const result = [];
    if (value2 !== void 0) {
      result.push(["workbench.activityBar.visible", { value: void 0 }]);
    }
    if (value2 === false) {
      result.push(["workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */, { value: "hidden" /* HIDDEN */ }]);
    }
    return result;
  }
}]);

Registry.as(Extensions14.ConfigurationMigration).registerConfigurationMigrations([{
  key: "workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */,
  migrateFn: (value2) => {
    const results = [];
    if (value2 === "side") {
      results.push(["workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */, { value: "default" /* DEFAULT */ }]);
    }
    return results;
  }
}]);

Registry.as(Extensions14.ConfigurationMigration).registerConfigurationMigrations([{
  key: "workbench.editor.doubleClickTabToToggleEditorGroupSizes",
  migrateFn: (value2) => {
    const results = [];
    if (typeof value2 === "boolean") {
      value2 = value2 ? "expand" : "off";
      results.push(["workbench.editor.doubleClickTabToToggleEditorGroupSizes", { value: value2 }]);
    }
    return results;
  }
}, {
  key: "workbench.editor.showTabs" /* EDITOR_TABS_MODE */,
  migrateFn: (value2) => {
    const results = [];
    if (typeof value2 === "boolean") {
      value2 = value2 ? "multiple" /* MULTIPLE */ : "single" /* SINGLE */;
      results.push(["workbench.editor.showTabs" /* EDITOR_TABS_MODE */, { value: value2 }]);
    }
    return results;
  }
}, {
  key: "workbench.editor.tabCloseButton",
  migrateFn: (value2) => {
    const result = [];
    if (value2 === "left" || value2 === "right") {
      result.push(["workbench.editor.tabActionLocation", { value: value2 }]);
    } else if (value2 === "off") {
      result.push(["workbench.editor.tabActionCloseVisibility", { value: false }]);
    }
    return result;
  }
}, {
  key: "zenMode.hideTabs",
  migrateFn: (value2) => {
    const result = [["zenMode.hideTabs", { value: void 0 }]];
    if (value2 === true) {
      result.push(["zenMode.showTabs", { value: "single" }]);
    }
    return result;
  }
}]);

Registry.as(Extensions14.ConfigurationMigration).registerConfigurationMigrations([{
  key: "workbench.experimental.floatingPanels",
  migrateFn: (value2, valueAccessor) => {
    const result = [["workbench.experimental.floatingPanels", { value: void 0 }]];
    if (value2 === true && valueAccessor("workbench.experimental.modernUI" /* MODERN_UI */) === void 0) {
      result.push(["workbench.experimental.modernUI" /* MODERN_UI */, { value: true }]);
    }
    return result;
  }
}, {
  key: "workbench.experimental.styleOverrides",
  migrateFn: (value2, valueAccessor) => {
    const result = [["workbench.experimental.styleOverrides", { value: void 0 }]];
    if (Array.isArray(value2) && value2.length > 0 && valueAccessor("workbench.experimental.modernUI" /* MODERN_UI */) === void 0) {
      result.push(["workbench.experimental.modernUI" /* MODERN_UI */, { value: true }]);
    }
    return result;
  }
}]);
export { registry2 };
