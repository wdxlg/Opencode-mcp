// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/toggleRenderWhitespace.ts
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/codeEditor/browser/toggleRenderWhitespace.ts
var renderWhitespaceSetting = "editor.renderWhitespace";

var RenderWhitespaceNoneAction = class _RenderWhitespaceNoneAction extends Action2 {
  static {
    this.ID = "editor.action.renderWhitespace.none";
  }
  constructor() {
    super({
      id: _RenderWhitespaceNoneAction.ID,
      title: localize2(13847, "Set Render Whitespace to None"),
      shortTitle: localize2(13843, "None"),
      category: Categories.View,
      f1: false,
      toggled: ContextKeyExpr.equals(`config.${renderWhitespaceSetting}`, "none"),
      menu: { id: MenuId.EditorRenderWhitespaceSubmenu, group: "1_config", order: 1 }
    });
  }
  run(accessor) {
    return accessor.get(IConfigurationService).updateValue(renderWhitespaceSetting, "none");
  }
};

var RenderWhitespaceBoundaryAction = class _RenderWhitespaceBoundaryAction extends Action2 {
  static {
    this.ID = "editor.action.renderWhitespace.boundary";
  }
  constructor() {
    super({
      id: _RenderWhitespaceBoundaryAction.ID,
      title: localize2(13846, "Set Render Whitespace to Boundary"),
      shortTitle: localize2(13842, "Boundary"),
      category: Categories.View,
      f1: false,
      toggled: ContextKeyExpr.equals(`config.${renderWhitespaceSetting}`, "boundary"),
      menu: { id: MenuId.EditorRenderWhitespaceSubmenu, group: "1_config", order: 2 }
    });
  }
  run(accessor) {
    return accessor.get(IConfigurationService).updateValue(renderWhitespaceSetting, "boundary");
  }
};

var RenderWhitespaceSelectionAction = class _RenderWhitespaceSelectionAction extends Action2 {
  static {
    this.ID = "editor.action.renderWhitespace.selection";
  }
  constructor() {
    super({
      id: _RenderWhitespaceSelectionAction.ID,
      title: localize2(13848, "Set Render Whitespace to Selection"),
      shortTitle: localize2(13844, "Selection"),
      category: Categories.View,
      f1: false,
      toggled: ContextKeyExpr.equals(`config.${renderWhitespaceSetting}`, "selection"),
      menu: { id: MenuId.EditorRenderWhitespaceSubmenu, group: "1_config", order: 3 }
    });
  }
  run(accessor) {
    return accessor.get(IConfigurationService).updateValue(renderWhitespaceSetting, "selection");
  }
};

var RenderWhitespaceTrailingAction = class _RenderWhitespaceTrailingAction extends Action2 {
  static {
    this.ID = "editor.action.renderWhitespace.trailing";
  }
  constructor() {
    super({
      id: _RenderWhitespaceTrailingAction.ID,
      title: localize2(13849, "Set Render Whitespace to Trailing"),
      shortTitle: localize2(13850, "Trailing"),
      category: Categories.View,
      f1: false,
      toggled: ContextKeyExpr.equals(`config.${renderWhitespaceSetting}`, "trailing"),
      menu: { id: MenuId.EditorRenderWhitespaceSubmenu, group: "1_config", order: 4 }
    });
  }
  run(accessor) {
    return accessor.get(IConfigurationService).updateValue(renderWhitespaceSetting, "trailing");
  }
};

var RenderWhitespaceAllAction = class _RenderWhitespaceAllAction extends Action2 {
  static {
    this.ID = "editor.action.renderWhitespace.all";
  }
  constructor() {
    super({
      id: _RenderWhitespaceAllAction.ID,
      title: localize2(13845, "Set Render Whitespace to All"),
      shortTitle: localize2(13841, "All"),
      category: Categories.View,
      f1: false,
      toggled: ContextKeyExpr.equals(`config.${renderWhitespaceSetting}`, "all"),
      menu: { id: MenuId.EditorRenderWhitespaceSubmenu, group: "1_config", order: 5 }
    });
  }
  run(accessor) {
    return accessor.get(IConfigurationService).updateValue(renderWhitespaceSetting, "all");
  }
};

var ToggleRenderWhitespaceAction = class _ToggleRenderWhitespaceAction extends Action2 {
  static {
    this.ID = "editor.action.toggleRenderWhitespace";
  }
  constructor() {
    super({
      id: _ToggleRenderWhitespaceAction.ID,
      title: localize2(13851, "Toggle Render Whitespace"),
      category: Categories.View,
      f1: true
    });
  }
  run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    const renderWhitespace = configurationService.getValue(renderWhitespaceSetting);
    let newRenderWhitespace;
    if (renderWhitespace === "none") {
      newRenderWhitespace = "all";
    } else {
      newRenderWhitespace = "none";
    }
    return configurationService.updateValue(renderWhitespaceSetting, newRenderWhitespace);
  }
};

registerAction2(RenderWhitespaceNoneAction);

registerAction2(RenderWhitespaceBoundaryAction);

registerAction2(RenderWhitespaceSelectionAction);

registerAction2(RenderWhitespaceTrailingAction);

registerAction2(RenderWhitespaceAllAction);

registerAction2(ToggleRenderWhitespaceAction);

MenuRegistry.appendMenuItem(MenuId.MenubarAppearanceMenu, {
  submenu: MenuId.EditorRenderWhitespaceSubmenu,
  title: localize(13840, null),
  group: "4_editor",
  order: 4
});
export { renderWhitespaceSetting, RenderWhitespaceNoneAction, RenderWhitespaceBoundaryAction, RenderWhitespaceSelectionAction, RenderWhitespaceTrailingAction, RenderWhitespaceAllAction, ToggleRenderWhitespaceAction };
