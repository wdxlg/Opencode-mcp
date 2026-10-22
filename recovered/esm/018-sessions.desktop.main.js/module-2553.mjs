// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/titlebar/titlebarActions.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { IsCompactTitleBarContext, IsMainWindowFullscreenContext, TitleBarStyleContext, TitleBarVisibleContext } from "./module-0950.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ACCOUNTS_ACTIVITY_ID, GLOBAL_ACTIVITY_ID } from "./module-1604.mjs";


// src/vs/workbench/browser/parts/titlebar/titlebarActions.ts
var ToggleTitleBarConfigAction = class extends Action2 {
  constructor(section, title, description, order, when) {
    super({
      id: `toggle.${section}`,
      title,
      metadata: description ? { description } : void 0,
      toggled: ContextKeyExpr.equals(`config.${section}`, true),
      menu: [
        {
          id: MenuId.TitleBarContext,
          when,
          order,
          group: "2_config"
        },
        {
          id: MenuId.TitleBarTitleContext,
          when,
          order,
          group: "2_config"
        }
      ]
    });
    this.section = section;
  }
  run(accessor, ...args2) {
    const configService = accessor.get(IConfigurationService);
    const value2 = configService.getValue(this.section);
    configService.updateValue(this.section, !value2);
  }
};

registerAction2(class ToggleCommandCenter extends ToggleTitleBarConfigAction {
  constructor() {
    super("window.commandCenter" /* COMMAND_CENTER */, localize(6946, null), localize(6947, null), 1, IsCompactTitleBarContext.toNegated());
  }
});

registerAction2(class ToggleNavigationControl extends ToggleTitleBarConfigAction {
  constructor() {
    super("workbench.navigationControl.enabled", localize(6954, null), localize(6955, null), 2, ContextKeyExpr.and(IsCompactTitleBarContext.toNegated(), ContextKeyExpr.has(`config.${"window.commandCenter" /* COMMAND_CENTER */}`)));
  }
});

registerAction2(class ToggleLayoutControl extends ToggleTitleBarConfigAction {
  constructor() {
    super("workbench.layoutControl.enabled" /* LAYOUT_ACTIONS */, localize(6952, null), localize(6953, null), 4);
  }
});

registerAction2(class ToggleNotificationsButton extends ToggleTitleBarConfigAction {
  constructor() {
    super("workbench.notifications.showInTitleBar" /* NOTIFICATIONS_BUTTON */, localize(6956, null), localize(6957, null), 5, ContextKeyExpr.equals(`config.${"workbench.notifications.position" /* NOTIFICATIONS_POSITION */}`, "top-right" /* TOP_RIGHT */));
  }
});

registerAction2(class ToggleCustomTitleBar extends Action2 {
  constructor() {
    super({
      id: `toggle.${"window.customTitleBarVisibility" /* CUSTOM_TITLE_BAR_VISIBILITY */}`,
      title: localize(6950, null),
      menu: [
        { id: MenuId.TitleBarContext, order: 0, when: ContextKeyExpr.equals(TitleBarStyleContext.key, "native" /* NATIVE */), group: "3_toggle" },
        { id: MenuId.TitleBarTitleContext, order: 0, when: ContextKeyExpr.equals(TitleBarStyleContext.key, "native" /* NATIVE */), group: "3_toggle" }
      ]
    });
  }
  run(accessor, ...args2) {
    const configService = accessor.get(IConfigurationService);
    configService.updateValue("window.customTitleBarVisibility" /* CUSTOM_TITLE_BAR_VISIBILITY */, "never" /* NEVER */);
  }
});

registerAction2(class ToggleCustomTitleBarWindowed extends Action2 {
  constructor() {
    super({
      id: `toggle.${"window.customTitleBarVisibility" /* CUSTOM_TITLE_BAR_VISIBILITY */}.windowed`,
      title: localize(6951, null),
      menu: [
        { id: MenuId.TitleBarContext, order: 1, when: IsMainWindowFullscreenContext, group: "3_toggle" },
        { id: MenuId.TitleBarTitleContext, order: 1, when: IsMainWindowFullscreenContext, group: "3_toggle" }
      ]
    });
  }
  run(accessor, ...args2) {
    const configService = accessor.get(IConfigurationService);
    configService.updateValue("window.customTitleBarVisibility" /* CUSTOM_TITLE_BAR_VISIBILITY */, "windowed" /* WINDOWED */);
  }
});

var ToggleCustomTitleBar2 = class extends Action2 {
  constructor() {
    super({
      id: `toggle.toggleCustomTitleBar`,
      title: localize(6948, null),
      toggled: TitleBarVisibleContext,
      menu: [
        {
          id: MenuId.MenubarAppearanceMenu,
          order: 6,
          when: ContextKeyExpr.or(
            ContextKeyExpr.and(
              ContextKeyExpr.equals(TitleBarStyleContext.key, "native" /* NATIVE */),
              ContextKeyExpr.and(
                ContextKeyExpr.equals("config.workbench.layoutControl.enabled", false),
                ContextKeyExpr.equals("config.window.commandCenter", false),
                ContextKeyExpr.notEquals("config.workbench.editor.editorActionsLocation", "titleBar"),
                ContextKeyExpr.notEquals("config.workbench.activityBar.location", "top"),
                ContextKeyExpr.notEquals("config.workbench.activityBar.location", "bottom")
              )?.negate()
            ),
            IsMainWindowFullscreenContext
          ),
          group: "2_workbench_layout"
        }
      ]
    });
  }
  run(accessor, ...args2) {
    const configService = accessor.get(IConfigurationService);
    const contextKeyService = accessor.get(IContextKeyService);
    const titleBarVisibility = configService.getValue("window.customTitleBarVisibility" /* CUSTOM_TITLE_BAR_VISIBILITY */);
    switch (titleBarVisibility) {
      case "never" /* NEVER */:
        configService.updateValue("window.customTitleBarVisibility" /* CUSTOM_TITLE_BAR_VISIBILITY */, "auto" /* AUTO */);
        break;
      case "windowed" /* WINDOWED */: {
        const isFullScreen = IsMainWindowFullscreenContext.evaluate(contextKeyService.getContext(null));
        if (isFullScreen) {
          configService.updateValue("window.customTitleBarVisibility" /* CUSTOM_TITLE_BAR_VISIBILITY */, "auto" /* AUTO */);
        } else {
          configService.updateValue("window.customTitleBarVisibility" /* CUSTOM_TITLE_BAR_VISIBILITY */, "never" /* NEVER */);
        }
        break;
      }
      case "auto" /* AUTO */:
      default:
        configService.updateValue("window.customTitleBarVisibility" /* CUSTOM_TITLE_BAR_VISIBILITY */, "never" /* NEVER */);
        break;
    }
  }
};

registerAction2(ToggleCustomTitleBar2);

registerAction2(class ShowCustomTitleBar extends Action2 {
  constructor() {
    super({
      id: `showCustomTitleBar`,
      title: localize2(6945, "Show Custom Title Bar"),
      precondition: TitleBarVisibleContext.negate(),
      f1: true
    });
  }
  run(accessor, ...args2) {
    const configService = accessor.get(IConfigurationService);
    configService.updateValue("window.customTitleBarVisibility" /* CUSTOM_TITLE_BAR_VISIBILITY */, "auto" /* AUTO */);
  }
});

registerAction2(class HideCustomTitleBar extends Action2 {
  constructor() {
    super({
      id: `hideCustomTitleBar`,
      title: localize2(6942, "Hide Custom Title Bar"),
      precondition: TitleBarVisibleContext,
      f1: true
    });
  }
  run(accessor, ...args2) {
    const configService = accessor.get(IConfigurationService);
    configService.updateValue("window.customTitleBarVisibility" /* CUSTOM_TITLE_BAR_VISIBILITY */, "never" /* NEVER */);
  }
});

registerAction2(class HideCustomTitleBar2 extends Action2 {
  constructor() {
    super({
      id: `hideCustomTitleBarInFullScreen`,
      title: localize2(6943, "Hide Custom Title Bar In Full Screen"),
      precondition: ContextKeyExpr.and(TitleBarVisibleContext, IsMainWindowFullscreenContext),
      f1: true
    });
  }
  run(accessor, ...args2) {
    const configService = accessor.get(IConfigurationService);
    configService.updateValue("window.customTitleBarVisibility" /* CUSTOM_TITLE_BAR_VISIBILITY */, "windowed" /* WINDOWED */);
  }
});

registerAction2(class ToggleEditorActions extends Action2 {
  static {
    this.settingsID = `workbench.editor.editorActionsLocation`;
  }
  constructor() {
    const titleBarContextCondition = ContextKeyExpr.and(
      ContextKeyExpr.equals(`config.workbench.editor.showTabs`, "none").negate(),
      ContextKeyExpr.equals(`config.${ToggleEditorActions.settingsID}`, "default")
    )?.negate();
    super({
      id: `toggle.${ToggleEditorActions.settingsID}`,
      title: localize(6949, null),
      toggled: ContextKeyExpr.equals(`config.${ToggleEditorActions.settingsID}`, "hidden").negate(),
      menu: [
        { id: MenuId.TitleBarContext, order: 3, when: titleBarContextCondition, group: "2_config" },
        { id: MenuId.TitleBarTitleContext, order: 3, when: titleBarContextCondition, group: "2_config" }
      ]
    });
  }
  run(accessor, ...args2) {
    const configService = accessor.get(IConfigurationService);
    const storageService = accessor.get(IStorageService);
    const location2 = configService.getValue(ToggleEditorActions.settingsID);
    if (location2 === "hidden") {
      const showTabs = configService.getValue("workbench.editor.showTabs" /* EDITOR_TABS_MODE */);
      if (showTabs !== "none") {
        configService.updateValue(ToggleEditorActions.settingsID, "titleBar");
      } else {
        const storedValue = storageService.get(ToggleEditorActions.settingsID, 0 /* PROFILE */);
        configService.updateValue(ToggleEditorActions.settingsID, storedValue ?? "default");
      }
      storageService.remove(ToggleEditorActions.settingsID, 0 /* PROFILE */);
    } else {
      configService.updateValue(ToggleEditorActions.settingsID, "hidden");
      storageService.store(ToggleEditorActions.settingsID, location2, 0 /* PROFILE */, 0 /* USER */);
    }
  }
});

var ACCOUNTS_ACTIVITY_TILE_ACTION = {
  id: ACCOUNTS_ACTIVITY_ID,
  label: localize(6941, null),
  tooltip: localize(6941, null),
  class: void 0,
  enabled: true,
  run: function() {
  }
};

var GLOBAL_ACTIVITY_TITLE_ACTION = {
  id: GLOBAL_ACTIVITY_ID,
  label: localize(6944, null),
  tooltip: localize(6944, null),
  class: void 0,
  enabled: true,
  run: function() {
  }
};
export { ToggleTitleBarConfigAction, ToggleCustomTitleBar2, ACCOUNTS_ACTIVITY_TILE_ACTION, GLOBAL_ACTIVITY_TITLE_ACTION };
