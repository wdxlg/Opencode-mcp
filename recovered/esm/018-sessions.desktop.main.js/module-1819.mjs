// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/preferences/browser/preferencesEditor.ts
import { Action } from "./module-0082.mjs";
import { EditorPane } from "./module-1090.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions19 } from "./module-1818.mjs";
import { MutableDisposable } from "./module-0012.mjs";
import { CONTEXT_PREFERENCES_SEARCH_FOCUS } from "./module-1807.mjs";
import { $, Dimension, append, clearNode } from "./module-0075.mjs";
import { SearchWidget } from "./module-1811.mjs";
import { getInputBoxStyle } from "./module-0513.mjs";
import { settingsTextInputBorder } from "./module-1815.mjs";
import { Event2 } from "./module-0017.mjs";
import { ActionBar } from "./module-0477.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/workbench/contrib/preferences/browser/preferencesEditor.ts
var PreferenceTabAction = class extends Action {
  constructor(descriptor, actionCallback) {
    super(descriptor.id, descriptor.title, "", true, actionCallback);
    this.descriptor = descriptor;
  }
};

var PreferencesEditor = class extends EditorPane {
  constructor(group2, telemetryService, themeService, storageService, instantiationService, contextKeyService) {
    super(PreferencesEditor.ID, group2, telemetryService, themeService, storageService);
    this.instantiationService = instantiationService;
    this.editorPanesRegistry = Registry.as(Extensions19.PreferencesEditorPane);
    this.preferencesTabActions = [];
    this.preferencesEditorPane = this._register(new MutableDisposable());
    this.searchFocusContextKey = CONTEXT_PREFERENCES_SEARCH_FOCUS.bindTo(contextKeyService);
    this.element = $(".preferences-editor");
    const headerContainer = append(this.element, $(".preferences-editor-header"));
    const searchContainer = append(headerContainer, $(".search-container"));
    this.searchWidget = this._register(this.instantiationService.createInstance(SearchWidget, searchContainer, {
      focusKey: this.searchFocusContextKey,
      inputBoxStyles: getInputBoxStyle({
        inputBorder: settingsTextInputBorder
      })
    }));
    this._register(Event2.debounce(this.searchWidget.onDidChange, () => void 0, 300)(() => {
      this.preferencesEditorPane.value?.search(this.searchWidget.getValue());
    }));
    const preferencesTabsContainer = append(headerContainer, $(".preferences-tabs-container"));
    this.preferencesTabActionBar = this._register(new ActionBar(preferencesTabsContainer, {
      orientation: 0 /* HORIZONTAL */,
      focusOnlyEnabledItems: true,
      ariaLabel: localize(18148, null),
      ariaRole: "tablist"
    }));
    this.onDidChangePreferencesEditorPane(this.editorPanesRegistry.getPreferencesEditorPanes(), []);
    this._register(this.editorPanesRegistry.onDidRegisterPreferencesEditorPanes((descriptors) => this.onDidChangePreferencesEditorPane(descriptors, [])));
    this._register(this.editorPanesRegistry.onDidDeregisterPreferencesEditorPanes((descriptors) => this.onDidChangePreferencesEditorPane([], descriptors)));
    this.bodyElement = append(this.element, $(".preferences-editor-body"));
  }
  static {
    this.ID = "workbench.editor.preferences";
  }
  createEditor(parent) {
    append(parent, this.element);
  }
  layout(dimension) {
    this.dimension = dimension;
    this.searchWidget.layout(dimension);
    this.searchWidget.inputBox.inputElement.style.paddingRight = `12px`;
    this.preferencesEditorPane.value?.layout(new Dimension(
      this.bodyElement.clientWidth,
      dimension.height - 87
      /* header height */
    ));
  }
  async setInput(input, options3, context2, token) {
    await super.setInput(input, options3, context2, token);
    if (this.preferencesTabActions.length) {
      this.onDidSelectPreferencesEditorPane(this.preferencesTabActions[0].id);
    }
  }
  onDidChangePreferencesEditorPane(toAdd, toRemove) {
    for (const desc of toRemove) {
      const index2 = this.preferencesTabActions.findIndex((action) => action.id === desc.id);
      if (index2 !== -1) {
        this.preferencesTabActionBar.pull(index2);
        this.preferencesTabActions[index2].dispose();
        this.preferencesTabActions.splice(index2, 1);
      }
    }
    if (toAdd.length > 0) {
      const all = this.editorPanesRegistry.getPreferencesEditorPanes();
      for (const desc of toAdd) {
        const index2 = all.findIndex((action) => action.id === desc.id);
        if (index2 !== -1) {
          const action = new PreferenceTabAction(desc, () => this.onDidSelectPreferencesEditorPane(desc.id));
          this.preferencesTabActions.splice(index2, 0, action);
          this.preferencesTabActionBar.push(action, { index: index2 });
        }
      }
    }
  }
  onDidSelectPreferencesEditorPane(id2) {
    let selectedAction;
    for (const action of this.preferencesTabActions) {
      if (action.id === id2) {
        action.checked = true;
        selectedAction = action;
      } else {
        action.checked = false;
      }
    }
    if (selectedAction) {
      this.searchWidget.inputBox.setPlaceHolder(localize(18147, null, selectedAction.descriptor.title));
      this.searchWidget.inputBox.setAriaLabel(localize(18147, null, selectedAction.descriptor.title));
    }
    this.renderBody(selectedAction?.descriptor);
    if (this.dimension) {
      this.layout(this.dimension);
    }
  }
  renderBody(descriptor) {
    this.preferencesEditorPane.value = void 0;
    clearNode(this.bodyElement);
    if (descriptor) {
      const editorPane = this.instantiationService.createInstance(descriptor.ctorDescriptor.ctor);
      this.preferencesEditorPane.value = editorPane;
      this.bodyElement.appendChild(editorPane.getDomNode());
    }
  }
  dispose() {
    super.dispose();
    this.preferencesTabActions.forEach((action) => action.dispose());
  }
};

PreferencesEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IContextKeyService)
], PreferencesEditor);
export { PreferenceTabAction, PreferencesEditor };
