// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/contextkey/common/contextkeys.ts
import { RawContextKey } from "./module-0089.mjs";
import { isIOS, isLinux, isMacintosh, isMobile, isWeb, isWindows } from "./module-0014.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/platform/contextkey/common/contextkeys.ts
var IsMacContext = new RawContextKey("isMac", isMacintosh, localize(2810, null));

var IsLinuxContext = new RawContextKey("isLinux", isLinux, localize(2809, null));

var IsWindowsContext = new RawContextKey("isWindows", isWindows, localize(2814, null));

var IsWebContext = new RawContextKey("isWeb", isWeb, localize(2813, null));

var IsMacNativeContext = new RawContextKey("isMacNative", isMacintosh && !isWeb, localize(2811, null));

var IsIOSContext = new RawContextKey("isIOS", isIOS, localize(2808, null));

var IsMobileContext = new RawContextKey("isMobile", isMobile, localize(2812, null));

var IsDevelopmentContext = new RawContextKey("isDevelopment", false, true);

var ProductQualityContext = new RawContextKey("productQualityType", "", localize(2815, null));

var InputFocusedContextKey = "inputFocus";

var InputFocusedContext = new RawContextKey(InputFocusedContextKey, false, localize(2807, null));
export { IsMacContext, IsLinuxContext, IsWindowsContext, IsWebContext, IsMacNativeContext, IsIOSContext, IsMobileContext, IsDevelopmentContext, ProductQualityContext, InputFocusedContextKey, InputFocusedContext };
