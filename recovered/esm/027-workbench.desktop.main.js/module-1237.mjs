// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/browserView/common/browserView.ts
import { URI } from "./module-0032.mjs";
import { extUriBiasedIgnorePathCase } from "./module-0034.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/platform/browserView/common/browserView.ts
var commandPrefix = "workbench.action.browser";

var BrowserViewCommandId = ((BrowserViewCommandId2) => {
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

function isBrowserViewAssociatedResourceNavigation(associatedResource, target) {
  const targetResource = URI.parse(target);
  return extUriBiasedIgnorePathCase.isEqual(
    associatedResource.with({ query: null, fragment: null }),
    targetResource.with({ query: null, fragment: null })
  );
}

function getAgentBrowserViewCreationDefaults(sessionId) {
  return {
    owner: { type: "agent", sessionId },
    initialAudiences: [{ type: "agent" }],
    session: {
      scope: "ephemeral" /* Ephemeral */,
      affinity: sessionId
    }
  };
}

var ipcBrowserViewChannelName = "browserView";

var browserZoomFactors = [0.25, 1 / 3, 0.5, 2 / 3, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5];

var browserZoomDefaultIndex = browserZoomFactors.indexOf(1);

function browserZoomLabel(zoomFactor) {
  return localize(2750, null, Math.round(zoomFactor * 100));
}

function browserZoomAccessibilityLabel(zoomFactor) {
  return localize(2749, null, Math.round(zoomFactor * 100));
}
export { isBrowserViewAssociatedResourceNavigation, getAgentBrowserViewCreationDefaults, browserZoomLabel, browserZoomAccessibilityLabel, commandPrefix, BrowserViewCommandId, ipcBrowserViewChannelName, browserZoomFactors, browserZoomDefaultIndex };
