// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/preferences/browser/tocTree.ts
import { $, append } from "./module-0075.mjs";
import { SettingsTreeGroupElement, SettingsTreeSettingElement } from "./module-1850.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { Iterable } from "./module-0011.mjs";
import { localize } from "./module-0001.mjs";
import { IListService, WorkbenchObjectTree } from "./module-0636.mjs";
import { SettingsTreeFilter } from "./module-1852.mjs";
import { DefaultStyleController } from "./module-0460.mjs";
import { createStyleSheet } from "./module-0224.mjs";
import { getListStyles } from "./module-0513.mjs";
import { editorBackground } from "./module-0229.mjs";
import { focusBorder } from "./module-0227.mjs";
import { settingsHeaderForeground, settingsHeaderHoverForeground } from "./module-1839.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/preferences/browser/tocTree.ts
var $28 = $;

var TOCTreeModel = class {
  constructor(_viewState, environmentService) {
    this._viewState = _viewState;
    this.environmentService = environmentService;
    this._currentSearchModel = null;
  }
  get settingsTreeRoot() {
    return this._settingsTreeRoot;
  }
  set settingsTreeRoot(value2) {
    this._settingsTreeRoot = value2;
    this.update();
  }
  get currentSearchModel() {
    return this._currentSearchModel;
  }
  set currentSearchModel(model) {
    this._currentSearchModel = model;
    this.update();
  }
  get children() {
    return this._settingsTreeRoot.children;
  }
  update() {
    if (this._settingsTreeRoot) {
      this.updateGroupCount(this._settingsTreeRoot);
    }
  }
  updateGroupCount(group2) {
    group2.children.forEach((child) => {
      if (child instanceof SettingsTreeGroupElement) {
        this.updateGroupCount(child);
      }
    });
    const childCount = group2.children.filter((child) => child instanceof SettingsTreeGroupElement).reduce((acc, cur) => acc + cur.count, 0);
    group2.count = childCount + this.getGroupCount(group2);
  }
  getGroupCount(group2) {
    return group2.children.filter((child) => {
      if (!(child instanceof SettingsTreeSettingElement)) {
        return false;
      }
      if (this._currentSearchModel && !this._currentSearchModel.root.containsSetting(child.setting.key)) {
        return false;
      }
      const isRemote = !!this.environmentService.remoteAuthority;
      return child.matchesScope(this._viewState.settingsTarget, isRemote) && child.matchesAllTags(this._viewState.tagFilters) && child.matchesAnyFeature(this._viewState.featureFilters) && child.matchesAnyExtension(this._viewState.extensionFilters) && child.matchesAnyId(this._viewState.idFilters);
    }).length;
  }
};

TOCTreeModel = __decorateClass([
  __decorateParam(1, IWorkbenchEnvironmentService)
], TOCTreeModel);

var TOC_ENTRY_TEMPLATE_ID = "settings.toc.entry";

var TOCRenderer = class {
  constructor(_hoverService) {
    this._hoverService = _hoverService;
    this.templateId = TOC_ENTRY_TEMPLATE_ID;
  }
  renderTemplate(container3) {
    return {
      labelElement: append(container3, $28(".settings-toc-entry")),
      countElement: append(container3, $28(".settings-toc-count")),
      elementDisposables: new DisposableStore()
    };
  }
  renderElement(node, index2, template2) {
    template2.elementDisposables.clear();
    const element = node.element;
    const count2 = element.count;
    const label3 = element.label;
    template2.labelElement.textContent = label3;
    template2.elementDisposables.add(this._hoverService.setupDelayedHover(template2.labelElement, { content: label3 }));
    if (count2) {
      template2.countElement.textContent = ` (${count2})`;
    } else {
      template2.countElement.textContent = "";
    }
  }
  disposeTemplate(templateData) {
    templateData.elementDisposables.dispose();
  }
};

var TOCTreeDelegate = class {
  getTemplateId(element) {
    return TOC_ENTRY_TEMPLATE_ID;
  }
  getHeight(element) {
    return 22;
  }
};

function createTOCIterator(model, tree) {
  const groupChildren2 = model.children.filter((c) => c instanceof SettingsTreeGroupElement);
  return Iterable.map(groupChildren2, (g) => {
    const hasGroupChildren = g.children.some((c) => c instanceof SettingsTreeGroupElement);
    return {
      element: g,
      collapsed: void 0,
      collapsible: hasGroupChildren,
      children: g instanceof SettingsTreeGroupElement ? createTOCIterator(g, tree) : void 0
    };
  });
}

var SettingsAccessibilityProvider = class {
  getWidgetAriaLabel() {
    return localize(
      18375,
      null
    );
  }
  getAriaLabel(element) {
    if (!element) {
      return "";
    }
    if (element instanceof SettingsTreeGroupElement) {
      return localize(18374, null, element.label);
    }
    return "";
  }
  getAriaLevel(element) {
    let i2 = 1;
    while (element instanceof SettingsTreeGroupElement && element.parent) {
      i2++;
      element = element.parent;
    }
    return i2;
  }
};

var TOCTree = class extends WorkbenchObjectTree {
  constructor(container3, viewState, contextKeyService, listService, configurationService, hoverService, instantiationService) {
    const filter2 = instantiationService.createInstance(SettingsTreeFilter, viewState, false);
    const options3 = {
      filter: filter2,
      multipleSelectionSupport: false,
      identityProvider: {
        getId(e) {
          return e.id;
        }
      },
      styleController: (id2) => new DefaultStyleController(createStyleSheet(container3), id2),
      accessibilityProvider: instantiationService.createInstance(SettingsAccessibilityProvider),
      collapseByDefault: true,
      horizontalScrolling: false,
      hideTwistiesOfChildlessElements: true,
      renderIndentGuides: "none" /* None */
    };
    super(
      "SettingsTOC",
      container3,
      new TOCTreeDelegate(),
      [new TOCRenderer(hoverService)],
      options3,
      instantiationService,
      contextKeyService,
      listService,
      configurationService
    );
    this.style(getListStyles({
      listBackground: editorBackground,
      listFocusOutline: focusBorder,
      listActiveSelectionBackground: editorBackground,
      listActiveSelectionForeground: settingsHeaderForeground,
      listFocusAndSelectionBackground: editorBackground,
      listFocusAndSelectionForeground: settingsHeaderForeground,
      listFocusBackground: editorBackground,
      listFocusForeground: settingsHeaderHoverForeground,
      listHoverForeground: settingsHeaderHoverForeground,
      listHoverBackground: editorBackground,
      listInactiveSelectionBackground: editorBackground,
      listInactiveSelectionForeground: settingsHeaderForeground,
      listInactiveFocusBackground: editorBackground,
      listInactiveFocusOutline: editorBackground,
      treeIndentGuidesStroke: void 0,
      treeInactiveIndentGuidesStroke: void 0
    }));
  }
};

TOCTree = __decorateClass([
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IListService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IHoverService),
  __decorateParam(6, IInstantiationService)
], TOCTree);
export { createTOCIterator, $28, TOCTreeModel, TOC_ENTRY_TEMPLATE_ID, TOCRenderer, TOCTreeDelegate, SettingsAccessibilityProvider, TOCTree };
