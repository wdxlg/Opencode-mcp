// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/browserView/common/browserViewGroup.ts
import { init_browserView, matchesBrowserViewAudience } from "./module-0069.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/platform/browserView/common/browserViewGroup.ts
function matchesBrowserViewGroupFilter(browserId, audiences, filter) {
  const audienceFilter = filter.audience;
  return filter.browserIds?.includes(browserId) === true || audienceFilter !== void 0 && audiences.some((audience) => matchesBrowserViewAudience(audienceFilter, audience));
}

var ipcBrowserViewGroupChannelName;

var init_browserViewGroup = __esm({
  "src/vs/platform/browserView/common/browserViewGroup.ts"() {
    init_browserView();
    ipcBrowserViewGroupChannelName = "browserViewGroup";
  }
});
export { matchesBrowserViewGroupFilter, ipcBrowserViewGroupChannelName, init_browserViewGroup };
