// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/window/electron-main/window.ts
import { __esm } from "./module-0000.mjs";
import { DEFAULT_AUX_WINDOW_SIZE, DEFAULT_EMPTY_WINDOW_SIZE, DEFAULT_WORKSPACE_WINDOW_SIZE, init_window } from "./module-0096.mjs";


// src/vs/platform/window/electron-main/window.ts
import electron2 from "electron";

var defaultWindowState, defaultAuxWindowState;

var init_window2 = __esm({
  "src/vs/platform/window/electron-main/window.ts"() {
    init_window();
    defaultWindowState = function(mode = 1 /* Normal */, hasWorkspace = false) {
      const size = hasWorkspace ? DEFAULT_WORKSPACE_WINDOW_SIZE : DEFAULT_EMPTY_WINDOW_SIZE;
      return {
        width: size.width,
        height: size.height,
        mode
      };
    };
    defaultAuxWindowState = function() {
      const width = DEFAULT_AUX_WINDOW_SIZE.width;
      const height = DEFAULT_AUX_WINDOW_SIZE.height;
      const workArea = electron2.screen.getPrimaryDisplay().workArea;
      const x = Math.max(workArea.x + workArea.width / 2 - width / 2, 0);
      const y = Math.max(workArea.y + workArea.height / 2 - height / 2, 0);
      return {
        x,
        y,
        width,
        height,
        mode: 1 /* Normal */
      };
    };
  }
});
export { electron2, defaultWindowState, defaultAuxWindowState, init_window2 };
