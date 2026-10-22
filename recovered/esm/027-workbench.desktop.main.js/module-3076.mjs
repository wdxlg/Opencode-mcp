// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/browser/testingExplorerFilter.ts
import { localize } from "./module-0001.mjs";
import { BaseActionViewItem } from "./module-0476.mjs";
import { Emitter } from "./module-0017.mjs";
import { Action, Separator } from "./module-0082.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { testingFilterIcon } from "./module-3039.mjs";
import { StoredValue } from "./module-1426.mjs";
import { Delayer } from "./module-0036.mjs";
import { $, Dimension } from "./module-0075.mjs";
import { ContextScopedSuggestEnabledInputWithHistory } from "./module-1838.mjs";
import { Iterable } from "./module-0011.mjs";
import { denamespaceTestTag } from "./module-1208.mjs";
import { ActionBar } from "./module-0477.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITestExplorerFilterState } from "./module-3026.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITestService } from "./module-1435.mjs";
import { DropdownMenuActionViewItem } from "./module-0502.mjs";
import { IContextMenuService } from "./module-0488.mjs";


// src/vs/workbench/contrib/testing/browser/testingExplorerFilter.ts
var testFilterDescriptions = {
  ["@failed" /* Failed */]: localize(21175, null),
  ["@executed" /* Executed */]: localize(21174, null),
  ["@doc" /* CurrentDoc */]: localize(21168, null),
  ["@openedFiles" /* OpenedFiles */]: localize(21171, null),
  ["@hidden" /* Hidden */]: localize(21173, null)
};

var TestingExplorerFilter = class extends BaseActionViewItem {
  constructor(action, options3, state, instantiationService, testService) {
    super(null, action, options3);
    this.state = state;
    this.instantiationService = instantiationService;
    this.testService = testService;
    this.focusEmitter = this._register(new Emitter());
    this.onDidFocus = this.focusEmitter.event;
    this.filtersAction = new Action("markersFiltersAction", localize(21170, null), "testing-filter-button " + ThemeIcon.asClassName(testingFilterIcon));
    this.history = this._register(instantiationService.createInstance(StoredValue, {
      key: "testing.filterHistory2",
      scope: 1 /* WORKSPACE */,
      target: 1 /* MACHINE */
    }));
    this.updateFilterActiveState();
    this._register(testService.excluded.onTestExclusionsChanged(this.updateFilterActiveState, this));
  }
  /**
   * @override
   */
  render(container3) {
    container3.classList.add("testing-filter-action-item");
    const updateDelayer = this._register(new Delayer(400));
    const wrapper = this.wrapper = $(".testing-filter-wrapper");
    container3.appendChild(wrapper);
    let history = this.history.get({ lastValue: "", values: [] });
    if (history instanceof Array) {
      history = { lastValue: "", values: history };
    }
    if (history.lastValue) {
      this.state.setText(history.lastValue);
    }
    const input = this.input = this._register(this.instantiationService.createInstance(ContextScopedSuggestEnabledInputWithHistory, {
      id: "testing.explorer.filter",
      ariaLabel: localize(21167, null),
      parent: wrapper,
      suggestionProvider: {
        triggerCharacters: ["@"],
        provideResults: () => [
          ...Object.entries(testFilterDescriptions).map(([label3, detail2]) => ({ label: label3, detail: detail2 })),
          ...Iterable.map(this.testService.collection.tags.values(), (tag2) => {
            const { ctrlId, tagId } = denamespaceTestTag(tag2.id);
            const insertText = `@${ctrlId}:${tagId}`;
            return {
              label: `@${ctrlId}:${tagId}`,
              detail: this.testService.collection.getNodeById(ctrlId)?.item.label,
              insertText: tagId.includes(" ") ? `@${ctrlId}:"${tagId.replace(/(["\\])/g, "\\$1")}"` : insertText
            };
          })
        ].filter((r2) => !this.state.text.value.includes(r2.label))
      },
      resourceHandle: "testing:filter",
      suggestOptions: {
        value: this.state.text.value,
        placeholderText: localize(21166, null)
      },
      history: history.values
    }));
    this._register(this.state.text.onDidChange((newValue) => {
      if (input.getValue() !== newValue) {
        input.setValue(newValue);
      }
    }));
    this._register(this.state.onDidRequestInputFocus(() => {
      input.focus();
    }));
    this._register(input.onDidFocus(() => {
      this.focusEmitter.fire();
    }));
    this._register(input.onInputDidChange(() => updateDelayer.trigger(() => {
      input.addToHistory();
      this.state.setText(input.getValue());
    })));
    const actionbar = this._register(new ActionBar(container3, {
      actionViewItemProvider: (action, options3) => {
        if (action.id === this.filtersAction.id) {
          return this.instantiationService.createInstance(FiltersDropdownMenuActionViewItem, action, options3, this.state, this.actionRunner);
        }
        return void 0;
      }
    }));
    actionbar.push(this.filtersAction, { icon: true, label: false });
    this.layout(this.wrapper.clientWidth);
  }
  layout(width2) {
    this.input.layout(new Dimension(
      width2 - /* horizontal padding */
      24 - /* editor padding */
      8 - /* filter button padding */
      22,
      20
      // line height from suggestEnabledInput.ts
    ));
  }
  /**
   * Focuses the filter input.
   */
  focus() {
    this.input.focus();
  }
  /**
   * Persists changes to the input history.
   */
  saveState() {
    this.history.store({ lastValue: this.input.getValue(), values: this.input.getHistory() });
  }
  /**
   * @override
   */
  dispose() {
    this.saveState();
    super.dispose();
  }
  /**
   * Updates the 'checked' state of the filter submenu.
   */
  updateFilterActiveState() {
    this.filtersAction.checked = this.testService.excluded.hasAny;
  }
};

TestingExplorerFilter = __decorateClass([
  __decorateParam(2, ITestExplorerFilterState),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ITestService)
], TestingExplorerFilter);

var FiltersDropdownMenuActionViewItem = class extends DropdownMenuActionViewItem {
  constructor(action, options3, filters2, actionRunner, contextMenuService, testService) {
    super(
      action,
      { getActions: () => this.getActions() },
      contextMenuService,
      {
        actionRunner,
        classNames: action.class,
        anchorAlignmentProvider: () => 1 /* RIGHT */,
        menuAsChild: true
      }
    );
    this.filters = filters2;
    this.testService = testService;
  }
  render(container3) {
    super.render(container3);
    this.updateChecked();
  }
  getActions() {
    return [
      ...["@failed" /* Failed */, "@executed" /* Executed */, "@doc" /* CurrentDoc */, "@openedFiles" /* OpenedFiles */].map((term) => ({
        checked: this.filters.isFilteringFor(term),
        class: void 0,
        enabled: true,
        id: term,
        label: testFilterDescriptions[term],
        run: () => this.filters.toggleFilteringFor(term),
        tooltip: "",
        dispose: () => null
      })),
      new Separator(),
      {
        checked: this.filters.fuzzy.value,
        class: void 0,
        enabled: true,
        id: "fuzzy",
        label: localize(21169, null),
        run: () => this.filters.fuzzy.value = !this.filters.fuzzy.value,
        tooltip: ""
      },
      new Separator(),
      {
        checked: this.filters.isFilteringFor("@hidden" /* Hidden */),
        class: void 0,
        enabled: this.testService.excluded.hasAny,
        id: "showExcluded",
        label: localize(21173, null),
        run: () => this.filters.toggleFilteringFor("@hidden" /* Hidden */),
        tooltip: ""
      },
      {
        class: void 0,
        enabled: this.testService.excluded.hasAny,
        id: "removeExcluded",
        label: localize(21172, null),
        run: async () => this.testService.excluded.clear(),
        tooltip: ""
      }
    ];
  }
  updateChecked() {
    this.element.classList.toggle("checked", this._action.checked);
  }
};

FiltersDropdownMenuActionViewItem = __decorateClass([
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, ITestService)
], FiltersDropdownMenuActionViewItem);
export { testFilterDescriptions, TestingExplorerFilter, FiltersDropdownMenuActionViewItem };
