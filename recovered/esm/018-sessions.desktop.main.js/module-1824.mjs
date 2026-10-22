// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/preferences/browser/settingsSearchMenu.ts
import { DropdownMenuActionViewItem } from "./module-0502.mjs";
import { SuggestController } from "./module-0758.mjs";
import { localize } from "./module-0001.mjs";
import { ADVANCED_SETTING_TAG, EXTENSION_SETTING_TAG, FEATURE_SETTING_TAG, GENERAL_TAG_SETTING_TAG, ID_SETTING_TAG, LANGUAGE_SETTING_TAG, MODIFIED_SETTING_TAG, POLICY_SETTING_TAG } from "./module-1807.mjs";
import { Separator } from "./module-0082.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService } from "./module-0488.mjs";


// src/vs/workbench/contrib/preferences/browser/settingsSearchMenu.ts
var SettingsSearchFilterDropdownMenuActionViewItem = class extends DropdownMenuActionViewItem {
  constructor(action, options3, actionRunner, searchWidget, contextMenuService) {
    super(
      action,
      { getActions: () => this.getActions() },
      contextMenuService,
      {
        ...options3,
        actionRunner,
        classNames: action.class,
        anchorAlignmentProvider: () => 1 /* RIGHT */,
        menuAsChild: true
      }
    );
    this.searchWidget = searchWidget;
    this.suggestController = SuggestController.get(this.searchWidget.inputWidget);
  }
  render(container2) {
    super.render(container2);
  }
  doSearchWidgetAction(queryToAppend, triggerSuggest) {
    this.searchWidget.setValue(this.searchWidget.getValue().trimEnd() + " " + queryToAppend);
    this.searchWidget.focus();
    if (triggerSuggest && this.suggestController) {
      this.suggestController.triggerSuggest();
    }
  }
  /**
   * The created action appends a query to the search widget search string. It optionally triggers suggestions.
   */
  createAction(id2, label3, tooltip, queryToAppend, triggerSuggest) {
    return {
      id: id2,
      label: label3,
      tooltip,
      class: void 0,
      enabled: true,
      run: () => {
        this.doSearchWidgetAction(queryToAppend, triggerSuggest);
      }
    };
  }
  /**
   * The created action appends a query to the search widget search string, if the query does not exist.
   * Otherwise, it removes the query from the search widget search string.
   * The action does not trigger suggestions after adding or removing the query.
   */
  createToggleAction(id2, label3, tooltip, queryToAppend) {
    const splitCurrentQuery = this.searchWidget.getValue().split(" ");
    const queryContainsQueryToAppend = splitCurrentQuery.includes(queryToAppend);
    return {
      id: id2,
      label: label3,
      tooltip,
      class: void 0,
      enabled: true,
      checked: queryContainsQueryToAppend,
      run: () => {
        if (!queryContainsQueryToAppend) {
          const trimmedCurrentQuery = this.searchWidget.getValue().trimEnd();
          const newQuery = trimmedCurrentQuery ? trimmedCurrentQuery + " " + queryToAppend : queryToAppend;
          this.searchWidget.setValue(newQuery);
        } else {
          const queryWithRemovedTags = this.searchWidget.getValue().split(" ").filter((word) => word !== queryToAppend).join(" ");
          this.searchWidget.setValue(queryWithRemovedTags);
        }
        this.searchWidget.focus();
      }
    };
  }
  createMutuallyExclusiveToggleAction(id2, label3, tooltip, filter2, excludeFilters) {
    const isFilterEnabled = this.searchWidget.getValue().split(" ").includes(filter2);
    return {
      id: id2,
      label: label3,
      tooltip,
      class: void 0,
      enabled: true,
      checked: isFilterEnabled,
      run: () => {
        if (isFilterEnabled) {
          const queryWithRemovedTags = this.searchWidget.getValue().split(" ").filter((word) => word !== filter2).join(" ");
          this.searchWidget.setValue(queryWithRemovedTags);
        } else {
          let newQuery = this.searchWidget.getValue().split(" ").filter((word) => !excludeFilters.includes(word) && word !== filter2).join(" ").trimEnd();
          newQuery = newQuery ? newQuery + " " + filter2 : filter2;
          this.searchWidget.setValue(newQuery);
        }
        this.searchWidget.focus();
      }
    };
  }
  getActions() {
    return [
      this.createToggleAction(
        "modifiedSettingsSearch",
        localize(18314, null),
        localize(18315, null),
        `@${MODIFIED_SETTING_TAG}`
      ),
      new Separator(),
      this.createAction(
        "extSettingsSearch",
        localize(18306, null),
        localize(18307, null),
        `@${EXTENSION_SETTING_TAG}`,
        true
      ),
      this.createAction(
        "featuresSettingsSearch",
        localize(18308, null),
        localize(18309, null),
        `@${FEATURE_SETTING_TAG}`,
        true
      ),
      this.createAction(
        "tagSettingsSearch",
        localize(18324, null),
        localize(18325, null),
        `@${GENERAL_TAG_SETTING_TAG}`,
        true
      ),
      this.createAction(
        "langSettingsSearch",
        localize(18312, null),
        localize(18313, null),
        `@${LANGUAGE_SETTING_TAG}`,
        true
      ),
      this.createAction(
        "idSettingsSearch",
        localize(18310, null),
        localize(18311, null),
        `@${ID_SETTING_TAG}`,
        false
      ),
      new Separator(),
      this.createToggleAction(
        "onlineSettingsSearch",
        localize(18316, null),
        localize(18317, null),
        "@tag:usesOnlineServices"
      ),
      this.createToggleAction(
        "policySettingsSearch",
        localize(18318, null),
        localize(18319, null),
        `@${POLICY_SETTING_TAG}`
      ),
      new Separator(),
      this.createMutuallyExclusiveToggleAction(
        "stableSettingsSearch",
        localize(18322, null),
        localize(18323, null),
        `@stable`,
        ["@tag:preview", "@tag:experimental"]
      ),
      this.createMutuallyExclusiveToggleAction(
        "previewSettingsSearch",
        localize(18320, null),
        localize(18321, null),
        `@tag:preview`,
        ["@stable", "@tag:experimental"]
      ),
      this.createMutuallyExclusiveToggleAction(
        "experimentalSettingsSearch",
        localize(18304, null),
        localize(18305, null),
        `@tag:experimental`,
        ["@stable", "@tag:preview"]
      ),
      new Separator(),
      this.createToggleAction(
        "advancedSettingsSearch",
        localize(18302, null),
        localize(18303, null),
        `@tag:${ADVANCED_SETTING_TAG}`
      )
    ];
  }
};

SettingsSearchFilterDropdownMenuActionViewItem = __decorateClass([
  __decorateParam(4, IContextMenuService)
], SettingsSearchFilterDropdownMenuActionViewItem);
export { SettingsSearchFilterDropdownMenuActionViewItem };
