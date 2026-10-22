// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/comments/browser/timestamp.ts
import { Disposable } from "./module-0012.mjs";
import { $, append } from "./module-0075.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { COMMENTS_SECTION } from "./module-1318.mjs";
import { fromNow } from "./module-0120.mjs";
import { language } from "./module-0014.mjs";


// src/vs/workbench/contrib/comments/browser/timestamp.ts
var TimestampWidget = class extends Disposable {
  constructor(configurationService, hoverService, container3, timeStamp) {
    super();
    this.configurationService = configurationService;
    this._date = append(container3, $("span.timestamp"));
    this._date.style.display = "none";
    this._useRelativeTime = this.useRelativeTimeSetting;
    this.hover = this._register(hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this._date, ""));
    this.setTimestamp(timeStamp);
  }
  get useRelativeTimeSetting() {
    return this.configurationService.getValue(COMMENTS_SECTION).useRelativeTime;
  }
  async setTimestamp(timestamp) {
    if (timestamp !== this._timestamp || this.useRelativeTimeSetting !== this._useRelativeTime) {
      this.updateDate(timestamp);
    }
    this._timestamp = timestamp;
    this._useRelativeTime = this.useRelativeTimeSetting;
  }
  updateDate(timestamp) {
    if (!timestamp) {
      this._date.textContent = "";
      this._date.style.display = "none";
    } else if (timestamp !== this._timestamp || this.useRelativeTimeSetting !== this._useRelativeTime) {
      this._date.style.display = "";
      let textContent;
      let tooltip;
      if (this.useRelativeTimeSetting) {
        textContent = this.getRelative(timestamp);
        tooltip = this.getDateString(timestamp);
      } else {
        textContent = this.getDateString(timestamp);
      }
      this._date.textContent = textContent;
      this.hover.update(tooltip ?? "");
    }
  }
  getRelative(date) {
    return fromNow(date, true, true);
  }
  getDateString(date) {
    return date.toLocaleString(language);
  }
};
export { TimestampWidget };
