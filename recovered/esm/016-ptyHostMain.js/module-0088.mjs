// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/terminal/node/ptyHostMain.js
// Original module marker: src/vs/platform/terminal/node/terminalContrib/autoReplies/terminalAutoResponder.ts
import { Disposable } from "./module-0011.mjs";
import { isString } from "./module-0009.mjs";
import { timeout } from "./module-0028.mjs";
import { isWindows } from "./module-0014.mjs";


// src/vs/platform/terminal/node/terminalContrib/autoReplies/terminalAutoResponder.ts
var TerminalAutoResponder = class extends Disposable {
  constructor(proc, matchWord, response, logService) {
    super();
    this._pointer = 0;
    this._paused = false;
    /**
     * Each reply is throttled by a second to avoid resource starvation and responding to screen
     * reprints on Winodws.
     */
    this._throttled = false;
    this._register(proc.onProcessData((e) => {
      if (this._paused || this._throttled) {
        return;
      }
      const data = isString(e) ? e : e.data;
      for (let i = 0; i < data.length; i++) {
        if (data[i] === matchWord[this._pointer]) {
          this._pointer++;
        } else {
          this._reset();
        }
        if (this._pointer === matchWord.length) {
          logService.debug(`Auto reply match: "${matchWord}", response: "${response}"`);
          proc.input(response);
          this._throttled = true;
          timeout(1e3).then(() => this._throttled = false);
          this._reset();
        }
      }
    }));
  }
  _reset() {
    this._pointer = 0;
  }
  /**
   * No auto response will happen after a resize on Windows in case the resize is a result of
   * reprinting the screen.
   */
  handleResize() {
    if (isWindows) {
      this._paused = true;
    }
  }
  handleInput() {
    this._paused = false;
  }
};
export { TerminalAutoResponder };
