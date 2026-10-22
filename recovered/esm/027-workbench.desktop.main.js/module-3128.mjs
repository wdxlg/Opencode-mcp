// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/searchAccessibilityHelp.ts
import { SearchContext } from "./module-1262.mjs";
import { ISearchViewModelWorkbenchService } from "./module-2845.mjs";
import { IViewsService } from "./module-1246.mjs";
import { Disposable } from "./module-0012.mjs";
import { getSearchView } from "./module-2836.mjs";
import { localize } from "./module-0001.mjs";
import { isMacintosh } from "./module-0014.mjs";


// src/vs/workbench/contrib/search/browser/searchAccessibilityHelp.ts
var SearchAccessibilityHelp = class {
  constructor() {
    this.priority = 105;
    this.name = "search";
    this.type = "help" /* Help */;
    this.when = SearchContext.SearchInputBoxFocusedKey;
  }
  getProvider(accessor) {
    const searchViewModelService = accessor.get(ISearchViewModelWorkbenchService);
    const viewsService = accessor.get(IViewsService);
    const searchModel = searchViewModelService.searchModel;
    if (!searchModel) {
      return void 0;
    }
    return new SearchAccessibilityHelpProvider(searchModel, viewsService);
  }
};

var SearchAccessibilityHelpProvider = class extends Disposable {
  constructor(_searchModel, _viewsService) {
    super();
    this._searchModel = _searchModel;
    this._viewsService = _viewsService;
    this.id = "searchHelp" /* SearchHelp */;
    this.verbositySettingKey = "accessibility.verbosity.find" /* Find */;
    this.options = { type: "help" /* Help */ };
  }
  onClose() {
    getSearchView(this._viewsService)?.focus();
  }
  provideContent() {
    const content2 = [];
    const resultCount = this._searchModel.searchResult.count();
    const isReplaceMode = this._searchModel.replaceActive;
    content2.push(localize(19045, null));
    content2.push(localize(19040, null));
    content2.push("");
    content2.push(localize(19091, null));
    content2.push(localize(19092, null));
    if (resultCount !== void 0) {
      if (resultCount === 0) {
        content2.push(localize(19066, null));
      } else {
        content2.push(localize(19076, null, resultCount));
      }
    } else {
      content2.push(localize(19067, null));
    }
    content2.push("");
    content2.push(localize(19053, null));
    content2.push(localize(19052, null));
    content2.push("");
    content2.push(localize(19051, null));
    content2.push(localize(19050, null));
    content2.push(localize(19046, null));
    content2.push(localize(19047, null));
    content2.push(localize(19048, null));
    content2.push(localize(19049, null));
    content2.push("");
    content2.push(localize(19044, null));
    content2.push(localize(19041, null));
    content2.push(localize(19042, null));
    content2.push(localize(19043, null, "<keybinding:search.action.focusNextSearchResult>"));
    content2.push("");
    content2.push(localize(19055, null));
    content2.push("");
    content2.push(localize(19060, null));
    content2.push(localize(19056, null));
    content2.push(localize(19063, null));
    content2.push("");
    content2.push(localize(19059, null));
    content2.push(localize(19054, null));
    content2.push(localize(19061, null));
    content2.push("");
    content2.push(localize(19058, null));
    content2.push(localize(19057, null, "<keybinding:search.action.focusNextSearchResult>"));
    content2.push(localize(19062, null, "<keybinding:search.action.focusPreviousSearchResult>"));
    content2.push("");
    content2.push(localize(19070, null));
    content2.push(localize(19068, null));
    content2.push(localize(19071, null));
    content2.push(localize(19069, null));
    content2.push("");
    if (isReplaceMode) {
      content2.push(localize(19074, null));
      content2.push(localize(19072, null));
      content2.push(localize(19073, null));
      content2.push(localize(19075, null));
      content2.push("");
    }
    content2.push(localize(19085, null, "<keybinding:workbench.action.openSettings>"));
    content2.push(localize(19086, null));
    content2.push(localize(19089, null));
    content2.push(localize(19087, null));
    content2.push(localize(19084, null));
    content2.push(localize(19080, null));
    content2.push(localize(19082, null));
    content2.push(localize(19078, null));
    content2.push(localize(19081, null));
    content2.push(localize(19088, null));
    content2.push(localize(19079, null));
    content2.push(localize(19090, null));
    content2.push(localize(19077, null));
    if (isReplaceMode) {
      content2.push(localize(19083, null));
    }
    if (isMacintosh) {
      content2.push("");
      content2.push(localize(19065, null));
      content2.push(localize(19064, null));
    }
    content2.push("");
    content2.push(localize(19039, null));
    content2.push(localize(19038, null));
    return content2.join("\n");
  }
};
export { SearchAccessibilityHelp, SearchAccessibilityHelpProvider };
