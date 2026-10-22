// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/electron-browser/desktop.contribution.ts
import { MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { CloseOtherWindowsAction, CloseWindowAction, DisableWindowAlwaysOnTopAction, EnableWindowAlwaysOnTopAction, FocusWindowAction, MergeWindowTabsHandlerHandler, MoveWindowTabToNewWindowHandler, NewWindowTabHandler, QuickSwitchWindowAction, ShowNextWindowTabHandler, ShowPreviousWindowTabHandler, SwitchToMainWindowAction, SwitchWindowAction, ToggleWindowAlwaysOnTopAction, ToggleWindowTabsBarHandler, ZoomInAction, ZoomOutAction, ZoomResetAction } from "./module-3884.mjs";
import { isLinux, isMacintosh, isWindows } from "./module-0014.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { EditorsVisibleContext, SingleEditorGroupsContext } from "./module-0950.mjs";
import { InstallShellScriptAction, UninstallShellScriptAction } from "./module-3885.mjs";
import { INativeHostService } from "./module-2566.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ModifierKeyEmitter } from "./module-0075.mjs";
import { NativeWindow } from "./module-3831.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { ConfigureRuntimeArgumentsAction, OpenUserDataFolderAction, ReloadWindowWithExtensionsDisabledAction, ShowContentTracingAction, ShowGPUInfoAction, StartHeapTracing, StartTracing, StopTracing, ToggleDevToolsAction } from "./module-3883.mjs";
import { IsMacContext } from "./module-0635.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { applicationConfigurationNodeBase, securityConfigurationNodeBase } from "./module-1113.mjs";
import { MAX_ZOOM_LEVEL, MIN_ZOOM_LEVEL } from "./module-3822.mjs";
import { product_default } from "./module-0139.mjs";
import { TELEMETRY_SETTING_ID } from "./module-0093.mjs";
import { Extensions3 } from "./module-0138.mjs";


// src/vs/workbench/electron-browser/desktop.contribution.ts
(function registerActions() {
  registerAction2(ZoomInAction);
  registerAction2(ZoomOutAction);
  registerAction2(ZoomResetAction);
  registerAction2(SwitchWindowAction);
  registerAction2(QuickSwitchWindowAction);
  registerAction2(SwitchToMainWindowAction);
  registerAction2(FocusWindowAction);
  registerAction2(CloseWindowAction);
  registerAction2(CloseOtherWindowsAction);
  registerAction2(ToggleWindowAlwaysOnTopAction);
  registerAction2(EnableWindowAlwaysOnTopAction);
  registerAction2(DisableWindowAlwaysOnTopAction);
  if (isMacintosh) {
    KeybindingsRegistry.registerKeybindingRule({
      id: CloseWindowAction.ID,
      weight: 200 /* WorkbenchContrib */,
      when: ContextKeyExpr.and(EditorsVisibleContext.toNegated(), SingleEditorGroupsContext),
      primary: 2048 /* CtrlCmd */ | 53 /* KeyW */
    });
  }
  if (isMacintosh) {
    registerAction2(InstallShellScriptAction);
    registerAction2(UninstallShellScriptAction);
  }
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: "workbench.action.quit",
    weight: 200 /* WorkbenchContrib */,
    async handler(accessor) {
      const nativeHostService = accessor.get(INativeHostService);
      const configurationService = accessor.get(IConfigurationService);
      const confirmBeforeClose = configurationService.getValue("window.confirmBeforeClose");
      if (confirmBeforeClose === "always" || confirmBeforeClose === "keyboardOnly" && ModifierKeyEmitter.getInstance().isModifierPressed) {
        const confirmed = await NativeWindow.confirmOnShutdown(accessor, 2 /* QUIT */);
        if (!confirmed) {
          return;
        }
      }
      nativeHostService.quit();
    },
    when: void 0,
    mac: { primary: 2048 /* CtrlCmd */ | 47 /* KeyQ */ },
    linux: { primary: 2048 /* CtrlCmd */ | 47 /* KeyQ */ }
  });
  if (isMacintosh) {
    for (const command4 of [
      { handler: NewWindowTabHandler, id: "workbench.action.newWindowTab", title: localize2(22474, "New Window Tab") },
      { handler: ShowPreviousWindowTabHandler, id: "workbench.action.showPreviousWindowTab", title: localize2(22482, "Show Previous Window Tab") },
      { handler: ShowNextWindowTabHandler, id: "workbench.action.showNextWindowTab", title: localize2(22481, "Show Next Window Tab") },
      { handler: MoveWindowTabToNewWindowHandler, id: "workbench.action.moveWindowTabToNewWindow", title: localize2(22473, "Move Window Tab to New Window") },
      { handler: MergeWindowTabsHandlerHandler, id: "workbench.action.mergeAllWindowTabs", title: localize2(22471, "Merge All Windows") },
      { handler: ToggleWindowTabsBarHandler, id: "workbench.action.toggleWindowTabsBar", title: localize2(22486, "Toggle Window Tabs Bar") }
    ]) {
      CommandsRegistry.registerCommand(command4.id, command4.handler);
      MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
        command: command4,
        when: ContextKeyExpr.equals("config.window.nativeTabs", true)
      });
    }
  }
  registerAction2(ReloadWindowWithExtensionsDisabledAction);
  registerAction2(ConfigureRuntimeArgumentsAction);
  registerAction2(ToggleDevToolsAction);
  registerAction2(OpenUserDataFolderAction);
  registerAction2(ShowGPUInfoAction);
  registerAction2(ShowContentTracingAction);
  registerAction2(StopTracing);
  registerAction2(StartTracing);
  registerAction2(StartHeapTracing);
})();

(function registerMenu() {
  MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
    group: "z_Exit",
    command: {
      id: "workbench.action.quit",
      title: localize(22472, null)
    },
    order: 1,
    when: IsMacContext.toNegated()
  });
})();

(function registerConfiguration2() {
  const registry4 = Registry.as(Extensions4.Configuration);
  registry4.registerConfiguration({
    ...applicationConfigurationNodeBase,
    "properties": {
      "application.shellEnvironmentResolutionTimeout": {
        "type": "number",
        "default": 10,
        "minimum": 1,
        "maximum": 120,
        "included": !isWindows,
        "scope": 1 /* APPLICATION */,
        "markdownDescription": localize(22448, null)
      }
    }
  });
  registry4.registerConfiguration({
    "id": "window",
    "order": 8,
    "title": localize(22523, null),
    "type": "object",
    "properties": {
      "window.confirmSaveUntitledWorkspace": {
        "type": "boolean",
        "default": true,
        "description": localize(22466, null)
      },
      "window.openWithoutArgumentsInNewWindow": {
        "type": "string",
        "enum": ["on", "off"],
        "enumDescriptions": [
          localize(22517, null),
          localize(22516, null)
        ],
        "default": isMacintosh ? "off" : "on",
        "scope": 1 /* APPLICATION */,
        "markdownDescription": localize(22476, null)
      },
      "window.restoreWindows": {
        "type": "string",
        "enum": ["preserve", "all", "folders", "one", "none"],
        "enumDescriptions": [
          localize(22522, null),
          localize(22518, null),
          localize(22519, null),
          localize(22521, null),
          localize(22520, null)
        ],
        "default": "all",
        "scope": 1 /* APPLICATION */,
        "description": localize(22478, null)
      },
      "window.restoreFullscreen": {
        "type": "boolean",
        "default": false,
        "scope": 1 /* APPLICATION */,
        "description": localize(22477, null)
      },
      "window.zoomLevel": {
        "type": "number",
        "default": 0,
        "minimum": MIN_ZOOM_LEVEL,
        "maximum": MAX_ZOOM_LEVEL,
        "markdownDescription": localize(22524, null, "`#window.zoomPerWindow#`"),
        ignoreSync: true,
        tags: ["accessibility"]
      },
      "window.zoomPerWindow": {
        "type": "boolean",
        "default": true,
        "markdownDescription": localize(22525, null, "`#window.zoomLevel#`"),
        tags: ["accessibility"]
      },
      "window.newWindowDimensions": {
        "type": "string",
        "enum": ["default", "inherit", "offset", "maximized", "fullscreen"],
        "enumDescriptions": [
          localize(22511, null),
          localize(22513, null),
          localize(22515, null),
          localize(22514, null),
          localize(22512, null)
        ],
        "default": "default",
        "scope": 1 /* APPLICATION */,
        "description": localize(22475, null)
      },
      "window.closeWhenEmpty": {
        "type": "boolean",
        "default": false,
        "description": localize(22465, null)
      },
      "window.doubleClickIconToClose": {
        "type": "boolean",
        "default": false,
        "scope": 1 /* APPLICATION */,
        "markdownDescription": localize(22500, null, "`#window.titleBarStyle#`")
      },
      "window.titleBarStyle": {
        "type": "string",
        "enum": ["native", "custom"],
        "default": "custom",
        "scope": 1 /* APPLICATION */,
        "description": localize(22485, null)
      },
      "window.controlsStyle": {
        "type": "string",
        "enum": ["native", "custom", "hidden"],
        "default": "native",
        "included": !isMacintosh,
        "scope": 1 /* APPLICATION */,
        "description": localize(22467, null)
      },
      "window.customTitleBarVisibility": {
        "type": "string",
        "enum": ["auto", "windowed", "never"],
        "markdownEnumDescriptions": [
          localize(22497, null),
          localize(22499, null),
          localize(22498, null, "`#window.titleBarStyle#`")
        ],
        "default": "auto",
        "scope": 1 /* APPLICATION */,
        "markdownDescription": localize(22496, null, "`#window.titleBarStyle#`")
      },
      "window.menuStyle": {
        "type": "string",
        "enum": ["custom", "native", "inherit"],
        "markdownEnumDescriptions": isMacintosh ? [
          localize(22503, null),
          localize(22508, null),
          localize(22505, null, "`#window.titleBarStyle#`")
        ] : [
          localize(22502, null),
          localize(22507, null, "`#window.titleBarStyle#`", "`custom`"),
          localize(22504, null, "`#window.titleBarStyle#`")
        ],
        "default": product_default.quality !== "stable" ? "inherit" : isMacintosh ? "native" : "inherit",
        // TODO@bpasero figure out the default
        "scope": 1 /* APPLICATION */,
        "markdownDescription": isMacintosh ? localize(22506, null, "`#window.titleBarStyle#`") : localize(22501, null, "`#window.titleBarStyle#`"),
        agentsWindow: { default: "custom" }
      },
      "window.dialogStyle": {
        "type": "string",
        "enum": ["native", "custom"],
        "default": "native",
        "scope": 1 /* APPLICATION */,
        "description": localize(22468, null),
        agentsWindow: { default: "custom" }
      },
      "window.nativeTabs": {
        "type": "boolean",
        "default": false,
        "scope": 1 /* APPLICATION */,
        "description": localize(22510, null),
        "included": isMacintosh
      },
      "window.nativeFullScreen": {
        "type": "boolean",
        "default": true,
        "description": localize(22509, null),
        "scope": 1 /* APPLICATION */,
        "included": isMacintosh
      },
      "window.clickThroughInactive": {
        "type": "boolean",
        "default": true,
        "scope": 1 /* APPLICATION */,
        "description": localize(22495, null),
        "included": isMacintosh
      },
      "window.border": {
        "type": "string",
        "default": "default",
        "markdownDescription": (() => {
          let windowBorderDescription = localize(22492, null);
          windowBorderDescription += "\n- " + [
            localize(22490, null, "`default`"),
            localize(22494, null, "`system`"),
            localize(22491, null, "`off`"),
            localize(22489, null, "`<color>`")
          ].join("\n- ");
          windowBorderDescription += "\n\n" + localize(22493, null, "`#workbench.colorCustomizations#`", "`#window.titleBarStyle#`", "`native`");
          return windowBorderDescription;
        })(),
        "included": isWindows
      }
    }
  });
  registry4.registerConfiguration({
    "id": "telemetry",
    "order": 110,
    title: localize(22484, null),
    "type": "object",
    "properties": {
      "telemetry.enableCrashReporter": {
        "type": "boolean",
        "description": localize(22483, null),
        "default": true,
        "tags": ["usesOnlineServices", "telemetry"],
        "markdownDeprecationMessage": localize(22469, null, `\`#${TELEMETRY_SETTING_ID}#\``)
      }
    }
  });
  registry4.registerConfiguration({
    "id": "keyboard",
    "order": 15,
    "type": "object",
    "title": localize(22470, null),
    "properties": {
      "keyboard.touchbar.enabled": {
        "type": "boolean",
        "default": true,
        "description": localize(22487, null),
        "included": isMacintosh
      },
      "keyboard.touchbar.ignored": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "default": [],
        "markdownDescription": localize(22488, null),
        "included": isMacintosh
      }
    }
  });
  registry4.registerConfiguration({
    ...securityConfigurationNodeBase,
    "properties": {
      "security.promptForLocalFileProtocolHandling": {
        "type": "boolean",
        "default": true,
        "markdownDescription": localize(22479, null),
        "scope": 1 /* APPLICATION */
      },
      "security.promptForRemoteFileProtocolHandling": {
        "type": "boolean",
        "default": true,
        "markdownDescription": localize(22480, null),
        "scope": 1 /* APPLICATION */
      }
    }
  });
})();

(function registerJSONSchemas() {
  const argvDefinitionFileSchemaId = "vscode://schemas/argv";
  const jsonRegistry4 = Registry.as(Extensions3.JSONContribution);
  const schema10 = {
    id: argvDefinitionFileSchemaId,
    allowComments: true,
    allowTrailingCommas: true,
    description: "VSCode static command line definition file",
    type: "object",
    additionalProperties: false,
    properties: {
      locale: {
        type: "string",
        description: localize(22459, null)
      },
      "disable-lcd-text": {
        type: "boolean",
        description: localize(22452, null)
      },
      "proxy-bypass-list": {
        type: "string",
        description: localize(22462, null)
      },
      "disable-hardware-acceleration": {
        type: "boolean",
        description: localize(22451, null)
      },
      "force-color-profile": {
        type: "string",
        markdownDescription: localize(22457, null)
      },
      "enable-crash-reporter": {
        type: "boolean",
        markdownDescription: localize(22453, null)
      },
      "crash-reporter-id": {
        type: "string",
        markdownDescription: localize(22449, null)
      },
      "enable-proposed-api": {
        type: "array",
        description: localize(22455, null),
        items: {
          type: "string"
        }
      },
      "log-level": {
        type: ["string", "array"],
        description: localize(22460, null)
      },
      "disable-chromium-sandbox": {
        type: "boolean",
        description: localize(22450, null)
      },
      "use-inmemory-secretstorage": {
        type: "boolean",
        description: localize(22464, null)
      },
      "remote-debugging-port": {
        type: "string",
        description: localize(22463, null)
      },
      "js-flags": {
        type: "string",
        description: localize(22458, null)
      }
    }
  };
  if (isLinux) {
    schema10.properties["force-renderer-accessibility"] = {
      type: "boolean",
      description: localize(22456, null)
    };
    schema10.properties["password-store"] = {
      type: "string",
      description: localize(22461, null)
    };
  }
  if (isWindows) {
    schema10.properties["enable-rdp-display-tracking"] = {
      type: "boolean",
      description: localize(22454, null)
    };
  }
  jsonRegistry4.registerSchema(argvDefinitionFileSchemaId, schema10);
})();
export {};
