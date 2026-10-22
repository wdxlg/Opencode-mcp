// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/sessions/electron-browser/sessionsApplicationBadge.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { derived } from "./module-0054.mjs";
import { autorun } from "./module-0052.mjs";
import { isWindows } from "./module-0014.mjs";
import { localize } from "./module-0001.mjs";
import { mainWindow } from "./module-0002.mjs";
import { ACTIVITY_BAR_BADGE_BACKGROUND, ACTIVITY_BAR_BADGE_FOREGROUND } from "./module-0868.mjs";
import { Color } from "./module-0197.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { INativeHostService } from "./module-2566.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IThemeService } from "./module-0287.mjs";


// src/vs/sessions/contrib/sessions/electron-browser/sessionsApplicationBadge.ts
var SESSIONS_APPLICATION_BADGE_SETTING = "sessions.showApplicationBadge";

var SessionsApplicationBadge = class extends Disposable {
  constructor(_sessionsManagementService, _nativeHostService, _configurationService, _themeService) {
    super();
    this._sessionsManagementService = _sessionsManagementService;
    this._nativeHostService = _nativeHostService;
    this._configurationService = _configurationService;
    this._themeService = _themeService;
    this._lastCount = 0;
    this._enabled = observableConfigValue(SESSIONS_APPLICATION_BADGE_SETTING, false, this._configurationService);
    this._sessions = observableFromEvent(this, this._sessionsManagementService.onDidChangeSessions, () => this._sessionsManagementService.getSessions());
    this._colorTheme = observableFromEvent(this, this._themeService.onDidColorThemeChange, () => this._themeService.getColorTheme());
    this._count = derived(this, (reader) => {
      if (!this._enabled.read(reader)) {
        return 0;
      }
      let count2 = 0;
      for (const session of this._sessions.read(reader)) {
        if (session.isArchived.read(reader)) {
          continue;
        }
        if (!session.isRead.read(reader) || session.status.read(reader) === 2 /* NeedsInput */) {
          count2++;
        }
      }
      return count2;
    });
    this._register(autorun((reader) => {
      const count2 = this._count.read(reader);
      this._setBadge(count2, isWindows ? this._colorTheme.read(reader) : void 0);
    }));
    this._register(toDisposable(() => this._setBadge(0, void 0)));
  }
  static {
    this.ID = "workbench.contrib.sessionsApplicationBadge";
  }
  static {
    /** Windows renders the taskbar overlay small, so draw at 2x for HiDPI. */
    this.ICON_SIZE = 32;
  }
  static {
    /** Beyond this the label no longer fits into a 16x16 overlay. */
    this.MAX_ICON_COUNT = 9;
  }
  _setBadge(count2, colorTheme) {
    if (count2 === 0 && this._lastCount === 0) {
      return;
    }
    this._lastCount = count2;
    let badge;
    if (count2 > 0) {
      const description = count2 === 1 ? localize(5620, null) : localize(5619, null, count2);
      const iconDataURL = colorTheme ? this._renderIcon(count2, colorTheme) : void 0;
      badge = iconDataURL ? { count: count2, description, iconDataURL } : { count: count2, description };
    }
    this._nativeHostService.setApplicationBadge(badge);
  }
  _renderIcon(count2, colorTheme) {
    const size3 = SessionsApplicationBadge.ICON_SIZE;
    const canvas = mainWindow.document.createElement("canvas");
    canvas.width = size3;
    canvas.height = size3;
    const context2 = canvas.getContext("2d");
    if (!context2) {
      return void 0;
    }
    context2.fillStyle = (colorTheme.getColor(ACTIVITY_BAR_BADGE_BACKGROUND) ?? Color.blue).toString();
    context2.beginPath();
    context2.arc(size3 / 2, size3 / 2, size3 / 2, 0, 2 * Math.PI);
    context2.fill();
    const label3 = count2 > SessionsApplicationBadge.MAX_ICON_COUNT ? `${SessionsApplicationBadge.MAX_ICON_COUNT}+` : String(count2);
    context2.fillStyle = (colorTheme.getColor(ACTIVITY_BAR_BADGE_FOREGROUND) ?? Color.white).toString();
    context2.font = `600 ${label3.length > 1 ? 17 : 21}px "Segoe UI", sans-serif`;
    context2.textAlign = "center";
    context2.textBaseline = "middle";
    context2.fillText(label3, size3 / 2, size3 / 2 + 1);
    return canvas.toDataURL("image/png");
  }
};

SessionsApplicationBadge = __decorateClass([
  __decorateParam(0, ISessionsManagementService),
  __decorateParam(1, INativeHostService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IThemeService)
], SessionsApplicationBadge);
export { SESSIONS_APPLICATION_BADGE_SETTING, SessionsApplicationBadge };
