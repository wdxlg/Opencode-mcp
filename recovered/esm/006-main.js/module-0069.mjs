// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/browserView/common/browserView.ts
import { URI, init_uri } from "./module-0030.mjs";
import { extUriBiasedIgnorePathCase, init_resources } from "./module-0032.mjs";
import { __esm } from "./module-0000.mjs";
import { init_nls } from "./module-0005.mjs";


// src/vs/platform/browserView/common/browserView.ts
function equalsBrowserViewAudience(first2, second) {
  return first2.type === second.type && first2.sessionId === second.sessionId;
}

function matchesBrowserViewAudience(candidate, pattern) {
  return candidate.type === pattern.type && (pattern.sessionId === void 0 || pattern.sessionId === candidate.sessionId);
}

function isBrowserViewAssociatedResourceNavigation(associatedResource, target) {
  const targetResource = URI.parse(target);
  return extUriBiasedIgnorePathCase.isEqual(
    associatedResource.with({ query: null, fragment: null }),
    targetResource.with({ query: null, fragment: null })
  );
}

var commandPrefix, BrowserViewCommandId, ipcBrowserViewChannelName, browserZoomFactors, browserZoomDefaultIndex, browserViewIsolatedWorldId;

var init_browserView = __esm({
  "src/vs/platform/browserView/common/browserView.ts"() {
    init_resources();
    init_uri();
    init_nls();
    commandPrefix = "workbench.action.browser";
    BrowserViewCommandId = ((BrowserViewCommandId2) => {
      BrowserViewCommandId2["Open"] = `${commandPrefix}.open`;
      BrowserViewCommandId2["OpenFile"] = `${commandPrefix}.openFile`;
      BrowserViewCommandId2["NewTab"] = `${commandPrefix}.newTab`;
      BrowserViewCommandId2["NewIncognitoTab"] = `${commandPrefix}.newIncognitoTab`;
      BrowserViewCommandId2["NewSecondAccountTab"] = `${commandPrefix}.newSecondAccountTab`;
      BrowserViewCommandId2["QuickOpen"] = `${commandPrefix}.quickOpen`;
      BrowserViewCommandId2["OpenOrList"] = `${commandPrefix}.openOrList`;
      BrowserViewCommandId2["CloseAll"] = `${commandPrefix}.closeAll`;
      BrowserViewCommandId2["CloseAllInGroup"] = `${commandPrefix}.closeAllInGroup`;
      BrowserViewCommandId2["GoBack"] = `${commandPrefix}.goBack`;
      BrowserViewCommandId2["GoForward"] = `${commandPrefix}.goForward`;
      BrowserViewCommandId2["Reload"] = `${commandPrefix}.reload`;
      BrowserViewCommandId2["HardReload"] = `${commandPrefix}.hardReload`;
      BrowserViewCommandId2["FocusUrlInput"] = `${commandPrefix}.focusUrlInput`;
      BrowserViewCommandId2["OpenExternal"] = `${commandPrefix}.openExternal`;
      BrowserViewCommandId2["OpenSettings"] = `${commandPrefix}.openSettings`;
      BrowserViewCommandId2["ToggleFavorite"] = `${commandPrefix}.toggleFavorite`;
      BrowserViewCommandId2["ShowHistory"] = `${commandPrefix}.showHistory`;
      BrowserViewCommandId2["ManagePermissions"] = `${commandPrefix}.managePermissions`;
      BrowserViewCommandId2["AddElementToChat"] = `${commandPrefix}.addElementToChat`;
      BrowserViewCommandId2["AddElementCommentToChat"] = `${commandPrefix}.addElementCommentToChat`;
      BrowserViewCommandId2["AddConsoleLogsToChat"] = `${commandPrefix}.addConsoleLogsToChat`;
      BrowserViewCommandId2["AddScreenshotToChat"] = `${commandPrefix}.addScreenshotToChat`;
      BrowserViewCommandId2["AddAreaScreenshotToChat"] = `${commandPrefix}.addAreaScreenshotToChat`;
      BrowserViewCommandId2["AddFullPageScreenshotToChat"] = `${commandPrefix}.addFullPageScreenshotToChat`;
      BrowserViewCommandId2["ToggleDevTools"] = `${commandPrefix}.toggleDevTools`;
      BrowserViewCommandId2["ClearGlobalStorage"] = `${commandPrefix}.clearGlobalStorage`;
      BrowserViewCommandId2["ClearWorkspaceStorage"] = `${commandPrefix}.clearWorkspaceStorage`;
      BrowserViewCommandId2["ClearEphemeralStorage"] = `${commandPrefix}.clearEphemeralStorage`;
      BrowserViewCommandId2["ClearSecondAccountStorage"] = `${commandPrefix}.clearSecondAccountStorage`;
      BrowserViewCommandId2["ShowFind"] = `${commandPrefix}.showFind`;
      BrowserViewCommandId2["HideFind"] = `${commandPrefix}.hideFind`;
      BrowserViewCommandId2["FindNext"] = `${commandPrefix}.findNext`;
      BrowserViewCommandId2["FindPrevious"] = `${commandPrefix}.findPrevious`;
      return BrowserViewCommandId2;
    })(BrowserViewCommandId || {});
    ipcBrowserViewChannelName = "browserView";
    browserZoomFactors = [0.25, 1 / 3, 0.5, 2 / 3, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5];
    browserZoomDefaultIndex = browserZoomFactors.indexOf(1);
    browserViewIsolatedWorldId = 999;
  }
});
export { equalsBrowserViewAudience, matchesBrowserViewAudience, isBrowserViewAssociatedResourceNavigation, commandPrefix, BrowserViewCommandId, ipcBrowserViewChannelName, browserZoomFactors, browserZoomDefaultIndex, browserViewIsolatedWorldId, init_browserView };
