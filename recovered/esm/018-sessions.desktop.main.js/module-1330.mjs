// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/progressbar/progressbar.ts
import { localize } from "./module-0001.mjs";
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { hide, show } from "./module-0075.mjs";
import { isNumber } from "./module-0010.mjs";
import { getProgressAccessibilitySignalScheduler } from "./module-1329.mjs";


// src/vs/base/browser/ui/progressbar/progressbar.ts
var CSS_DONE = "done";

var CSS_ACTIVE = "active";

var CSS_INFINITE = "infinite";

var CSS_INFINITE_LONG_RUNNING = "infinite-long-running";

var CSS_DISCRETE = "discrete";

var NLS_PROGRESS_LABEL = localize(28, null);

var ProgressBar = class _ProgressBar extends Disposable {
  constructor(container2, options3) {
    super();
    this.progressSignal = this._register(new MutableDisposable());
    this.workedVal = 0;
    this.showDelayedScheduler = this._register(new RunOnceScheduler(() => show(this.element), 0));
    this.longRunningScheduler = this._register(new RunOnceScheduler(() => this.infiniteLongRunning(), _ProgressBar.LONG_RUNNING_INFINITE_THRESHOLD));
    this.create(container2, options3);
  }
  static {
    /**
     * After a certain time of showing the progress bar, switch
     * to long-running mode and throttle animations to reduce
     * the pressure on the GPU process.
     *
     * https://github.com/microsoft/vscode/issues/97900
     * https://github.com/microsoft/vscode/issues/138396
     */
    this.LONG_RUNNING_INFINITE_THRESHOLD = 1e4;
  }
  static {
    this.PROGRESS_SIGNAL_DEFAULT_DELAY = 3e3;
  }
  create(container2, options3) {
    this.element = document.createElement("div");
    this.element.classList.add("monaco-progress-container");
    this.element.setAttribute("role", "progressbar");
    this.element.setAttribute("aria-valuemin", "0");
    this.element.setAttribute("aria-label", options3?.ariaLabel && options3.ariaLabel.trim() ? options3.ariaLabel : NLS_PROGRESS_LABEL);
    container2.appendChild(this.element);
    this.bit = document.createElement("div");
    this.bit.classList.add("progress-bit");
    this.bit.style.backgroundColor = options3?.progressBarBackground || "#0E70C0";
    this.element.appendChild(this.bit);
  }
  off() {
    this.bit.style.width = "inherit";
    this.bit.style.opacity = "1";
    this.element.classList.remove(CSS_ACTIVE, CSS_INFINITE, CSS_INFINITE_LONG_RUNNING, CSS_DISCRETE);
    this.workedVal = 0;
    this.totalWork = void 0;
    this.longRunningScheduler.cancel();
    this.progressSignal.clear();
  }
  /**
   * Indicates to the progress bar that all work is done.
   */
  done() {
    return this.doDone(true);
  }
  /**
   * Stops the progressbar from showing any progress instantly without fading out.
   */
  stop() {
    return this.doDone(false);
  }
  doDone(delayed) {
    this.element.classList.add(CSS_DONE);
    if (!this.element.classList.contains(CSS_INFINITE)) {
      this.bit.style.width = "inherit";
      if (delayed) {
        setTimeout(() => this.off(), 200);
      } else {
        this.off();
      }
    } else {
      this.bit.style.opacity = "0";
      if (delayed) {
        setTimeout(() => this.off(), 200);
      } else {
        this.off();
      }
    }
    return this;
  }
  /**
   * Use this mode to indicate progress that has no total number of work units.
   */
  infinite() {
    this.bit.style.width = "2%";
    this.bit.style.opacity = "1";
    this.element.classList.remove(CSS_DISCRETE, CSS_DONE, CSS_INFINITE_LONG_RUNNING);
    this.element.classList.add(CSS_ACTIVE, CSS_INFINITE);
    this.longRunningScheduler.schedule();
    return this;
  }
  infiniteLongRunning() {
    this.element.classList.add(CSS_INFINITE_LONG_RUNNING);
  }
  /**
   * Tells the progress bar the total number of work. Use in combination with workedVal() to let
   * the progress bar show the actual progress based on the work that is done.
   */
  total(value2) {
    this.workedVal = 0;
    this.totalWork = value2;
    this.element.setAttribute("aria-valuemax", value2.toString());
    return this;
  }
  /**
   * Finds out if this progress bar is configured with total work
   */
  hasTotal() {
    return isNumber(this.totalWork);
  }
  /**
   * Tells the progress bar that an increment of work has been completed.
   */
  worked(value2) {
    value2 = Math.max(1, Number(value2));
    return this.doSetWorked(this.workedVal + value2);
  }
  /**
   * Tells the progress bar the total amount of work (0 to 100) that has been completed.
   */
  setWorked(value2) {
    value2 = Math.max(1, Number(value2));
    return this.doSetWorked(value2);
  }
  doSetWorked(value2) {
    const totalWork = this.totalWork || 100;
    this.workedVal = value2;
    this.workedVal = Math.min(totalWork, this.workedVal);
    this.element.classList.remove(CSS_INFINITE, CSS_INFINITE_LONG_RUNNING, CSS_DONE);
    this.element.classList.add(CSS_ACTIVE, CSS_DISCRETE);
    this.element.setAttribute("aria-valuenow", value2.toString());
    this.bit.style.width = 100 * (this.workedVal / totalWork) + "%";
    return this;
  }
  getContainer() {
    return this.element;
  }
  show(delay) {
    this.showDelayedScheduler.cancel();
    this.progressSignal.value = getProgressAccessibilitySignalScheduler(_ProgressBar.PROGRESS_SIGNAL_DEFAULT_DELAY);
    if (typeof delay === "number") {
      this.showDelayedScheduler.schedule(delay);
    } else {
      show(this.element);
    }
  }
  hide() {
    hide(this.element);
    this.showDelayedScheduler.cancel();
    this.progressSignal.clear();
  }
};
export { CSS_DONE, CSS_ACTIVE, CSS_INFINITE, CSS_INFINITE_LONG_RUNNING, CSS_DISCRETE, NLS_PROGRESS_LABEL, ProgressBar };
