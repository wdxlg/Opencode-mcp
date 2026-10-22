// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/titlebar/commandCenterControl.ts
import { DisposableStore } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { MenuWorkbenchToolBar, WorkbenchToolBar } from "./module-0519.mjs";
import { MenuId, MenuRegistry, SubmenuItemAction } from "./module-0092.mjs";
import { createActionViewItem } from "./module-0516.mjs";
import { isActiveDocument, reset } from "./module-0075.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { BaseActionViewItem } from "./module-0476.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { SubmenuAction } from "./module-0082.mjs";
import { ChatAIDisabledSettingId } from "./module-0950.mjs";
import { localize } from "./module-0001.mjs";
import { renderIcon } from "./module-0467.mjs";
import { Codicon } from "./module-0085.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/browser/parts/titlebar/commandCenterControl.ts
var AGENT_STATUS_ENABLED_SETTING = "chat.agentsControl.enabled";

var CommandCenterControl = class {
  constructor(windowTitle, hoverDelegate, instantiationService, quickInputService) {
    this._disposables = new DisposableStore();
    this._onDidChangeVisibility = this._disposables.add(new Emitter());
    this.onDidChangeVisibility = this._onDidChangeVisibility.event;
    this.element = document.createElement("div");
    this.element.classList.add("command-center");
    const titleToolbar = instantiationService.createInstance(MenuWorkbenchToolBar, this.element, MenuId.CommandCenter, {
      contextMenu: MenuId.TitleBarContext,
      hiddenItemStrategy: -1 /* NoHide */,
      toolbarOptions: {
        primaryGroup: () => true
      },
      telemetrySource: "commandCenter",
      actionViewItemProvider: (action, options3) => {
        if (action instanceof SubmenuItemAction && action.item.submenu === MenuId.CommandCenterCenter) {
          return instantiationService.createInstance(CommandCenterCenterViewItem, action, windowTitle, { ...options3, hoverDelegate });
        } else {
          return createActionViewItem(instantiationService, action, { ...options3, hoverDelegate });
        }
      }
    });
    let quickInputVisible = false;
    this._disposables.add(Event2.filter(quickInputService.onShow, () => isActiveDocument(this.element), this._disposables)(() => {
      quickInputVisible = true;
      this._setVisibility(quickInputService.alignment.get() !== "top");
    }));
    this._disposables.add(quickInputService.onHide(() => {
      quickInputVisible = false;
      this._setVisibility(true);
    }));
    this._disposables.add(autorun((reader) => {
      const alignment = quickInputService.alignment.read(reader);
      if (quickInputVisible) {
        this._setVisibility(alignment !== "top");
      }
    }));
    this._disposables.add(titleToolbar);
  }
  _setVisibility(show3) {
    this.element.classList.toggle("hide", !show3);
    this._onDidChangeVisibility.fire();
  }
  dispose() {
    this._disposables.dispose();
  }
};

CommandCenterControl = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IQuickInputService)
], CommandCenterControl);

var CommandCenterCenterViewItem = class extends BaseActionViewItem {
  constructor(_submenu, _windowTitle, options3, _hoverService, _keybindingService, _instaService, _editorGroupService, _configurationService) {
    super(void 0, _submenu.actions.find((action) => action.id === "workbench.action.quickOpenWithModes") ?? _submenu.actions[0], options3);
    this._submenu = _submenu;
    this._windowTitle = _windowTitle;
    this._hoverService = _hoverService;
    this._keybindingService = _keybindingService;
    this._instaService = _instaService;
    this._editorGroupService = _editorGroupService;
    this._configurationService = _configurationService;
    this._hoverDelegate = options3.hoverDelegate ?? getDefaultHoverDelegate("mouse");
  }
  static {
    this._quickOpenCommandId = "workbench.action.quickOpenWithModes";
  }
  render(container3) {
    super.render(container3);
    container3.classList.add("command-center-center");
    container3.classList.toggle("multiple", this._submenu.actions.length > 1);
    const hover = this._store.add(this._hoverService.setupManagedHover(this._hoverDelegate, container3, this.getTooltip()));
    this._store.add(this._windowTitle.onDidChange(() => {
      hover.update(this.getTooltip());
    }));
    const groups = [];
    for (const action of this._submenu.actions) {
      if (action instanceof SubmenuAction) {
        groups.push(action.actions);
      } else {
        groups.push([action]);
      }
    }
    for (let i2 = 0; i2 < groups.length; i2++) {
      const group2 = groups[i2];
      const toolbar = this._instaService.createInstance(WorkbenchToolBar, container3, {
        hiddenItemStrategy: -1 /* NoHide */,
        telemetrySource: "commandCenterCenter",
        actionViewItemProvider: (action, options3) => {
          options3 = {
            ...options3,
            hoverDelegate: this._hoverDelegate
          };
          if (action.id !== CommandCenterCenterViewItem._quickOpenCommandId) {
            return createActionViewItem(this._instaService, action, options3);
          }
          const that = this;
          return this._instaService.createInstance(class CommandCenterQuickPickItem extends BaseActionViewItem {
            constructor() {
              super(void 0, action, options3);
            }
            render(container4) {
              super.render(container4);
              container4.classList.toggle("command-center-quick-pick");
              container4.role = "button";
              container4.setAttribute("aria-description", this.getTooltip());
              const aiFeaturesDisabled = that._configurationService.getValue(ChatAIDisabledSettingId) === true;
              const aiCustomizationsDisabled = that._configurationService.getValue("disableAICustomizations") === true || that._configurationService.getValue("workbench.disableAICustomizations") === true;
              const forcedHidden = aiFeaturesDisabled && aiCustomizationsDisabled;
              const agentControlValue = that._configurationService.getValue(AGENT_STATUS_ENABLED_SETTING);
              const isCompactMode = !forcedHidden && (agentControlValue === true || agentControlValue === void 0 || agentControlValue === "compact");
              container4.classList.toggle("compact-mode", isCompactMode);
              const action2 = this.action;
              const searchIcon = document.createElement("span");
              searchIcon.ariaHidden = "true";
              searchIcon.className = action2.class ?? "";
              searchIcon.classList.add("search-icon");
              const label3 = this._getLabel();
              const labelElement = document.createElement("span");
              labelElement.classList.add("search-label");
              labelElement.textContent = label3;
              if (isCompactMode) {
                reset(container4, labelElement);
              } else {
                reset(container4, searchIcon, labelElement);
              }
              const hover2 = this._store.add(that._hoverService.setupManagedHover(that._hoverDelegate, container4, this.getTooltip()));
              this._store.add(that._windowTitle.onDidChange(() => {
                hover2.update(this.getTooltip());
                labelElement.textContent = this._getLabel();
              }));
              this._store.add(that._editorGroupService.onDidChangeEditorPartOptions(({ newPartOptions, oldPartOptions }) => {
                if (newPartOptions.showTabs !== oldPartOptions.showTabs) {
                  hover2.update(this.getTooltip());
                  labelElement.textContent = this._getLabel();
                }
              }));
            }
            getTooltip() {
              return that.getTooltip();
            }
            _getLabel() {
              const { prefix, suffix } = that._windowTitle.getTitleDecorations();
              let label3 = that._windowTitle.workspaceName;
              if (that._windowTitle.isCustomTitleFormat()) {
                label3 = that._windowTitle.getWindowTitle();
              } else if (that._editorGroupService.partOptions.showTabs === "none") {
                label3 = that._windowTitle.fileName ?? label3;
              }
              if (!label3) {
                label3 = localize(6916, null);
              }
              if (prefix) {
                label3 = localize(6917, null, prefix, label3);
              }
              if (suffix) {
                label3 = localize(6918, null, label3, suffix);
              }
              return label3.replaceAll(/\r\n|\r|\n/g, "\u23CE");
            }
          });
        }
      });
      toolbar.setActions(group2);
      this._store.add(toolbar);
      if (i2 < groups.length - 1) {
        const icon2 = renderIcon(Codicon.circleSmallFilled);
        icon2.style.padding = "0 8px";
        icon2.style.height = "100%";
        icon2.style.opacity = "0.5";
        container3.appendChild(icon2);
      }
    }
  }
  getTooltip() {
    const kb = this._keybindingService.lookupKeybinding(this.action.id)?.getLabel();
    const title = kb ? localize(6919, null, this._windowTitle.workspaceName, kb, this._windowTitle.value) : localize(6920, null, this._windowTitle.workspaceName, this._windowTitle.value);
    return title;
  }
};

CommandCenterCenterViewItem = __decorateClass([
  __decorateParam(3, IHoverService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IEditorGroupsService),
  __decorateParam(7, IConfigurationService)
], CommandCenterCenterViewItem);

MenuRegistry.appendMenuItem(MenuId.CommandCenter, {
  submenu: MenuId.CommandCenterCenter,
  title: localize(6921, null),
  icon: Codicon.shield,
  order: 101
});
export { AGENT_STATUS_ENABLED_SETTING, CommandCenterControl, CommandCenterCenterViewItem };
