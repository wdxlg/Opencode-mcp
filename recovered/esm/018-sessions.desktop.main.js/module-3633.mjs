// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/externalSessionBanner.ts
import { localize } from "./module-0001.mjs";
import { Disposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { $, append } from "./module-0075.mjs";
import { SelectBox } from "./module-0475.mjs";
import { defaultButtonStyles, defaultSelectBoxStyles } from "./module-0513.mjs";
import { Button } from "./module-0546.mjs";
import { WorkbenchToolBar } from "./module-0519.mjs";
import { Action } from "./module-0082.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { autorun } from "./module-0052.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IProductService } from "./module-0875.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/sessions/contrib/chat/browser/externalSessionBanner.ts
var EXTERNAL_SESSION_BANNER_DISMISSED_STORAGE_KEY = "sessions.externalSessionBanner.dismissed";

var DAY = 24 * 60 * 60 * 1e3;

function shouldConfirmExternalSessionVisibilityChange(mode, updatedAt, now) {
  switch (mode) {
    case "recent" /* Recent */:
      return true;
    case "none" /* None */:
      return true;
    case "last24Hours" /* Last24Hours */:
      return updatedAt.getTime() < now - DAY;
    case "last7Days" /* Last7Days */:
      return updatedAt.getTime() < now - 7 * DAY;
    case "last30Days" /* Last30Days */:
      return updatedAt.getTime() < now - 30 * DAY;
  }
}

function getExternalSessionBannerSelectedMode(initialMode, configuredMode) {
  return initialMode ?? configuredMode;
}

function getExternalSessionVisibilityConfirmation(mode, updatedAt, now, productName) {
  const message = mode === "recent" /* Recent */ ? localize(4399, null, productName) : localize(4395, null, productName);
  const primaryButton = localize(4400, null);
  if (mode === "recent" /* Recent */) {
    return {
      type: "warning",
      message,
      detail: localize(4398, null),
      primaryButton
    };
  }
  if (mode === "none" /* None */) {
    return {
      type: "warning",
      message,
      detail: localize(4396, null),
      primaryButton
    };
  }
  const daysAgo = Math.max(1, Math.ceil((now - updatedAt.getTime()) / DAY));
  const lastUpdated = daysAgo === 1 ? localize(4397, null) : localize(4391, null, daysAgo);
  const detail2 = mode === "last24Hours" /* Last24Hours */ ? localize(4394, null, lastUpdated) : mode === "last7Days" /* Last7Days */ ? localize(4393, null, lastUpdated) : localize(4392, null, lastUpdated);
  return { type: "warning", message, detail: detail2, primaryButton };
}

var ExternalSessionBanner = class extends Disposable {
  constructor(container2, _bannerOptions, contextViewService, _configurationService, _dialogService, instantiationService, _notificationService, _productService, _storageService) {
    super();
    this._bannerOptions = _bannerOptions;
    this._configurationService = _configurationService;
    this._dialogService = _dialogService;
    this._notificationService = _notificationService;
    this._productService = _productService;
    this._storageService = _storageService;
    this._visible = false;
    this._saving = false;
    this._session = observableValue(this, void 0);
    this._dismissed = observableValue(this, this._storageService.getBoolean(EXTERNAL_SESSION_BANNER_DISMISSED_STORAGE_KEY, 0 /* PROFILE */, false));
    this._selectedMode = this._getSelectedMode();
    this._options = this._createOptions();
    this.domNode = append(container2, $(".external-session-banner.hidden"));
    this.domNode.setAttribute("role", "group");
    this.domNode.setAttribute("aria-label", localize(4389, null));
    const content = append(this.domNode, $(".external-session-banner-content"));
    append(content, $(".external-session-banner-message")).textContent = localize(
      4402,
      null,
      this._productService.nameShort
    );
    append(content, $(".external-session-banner-description", { role: "status" })).textContent = localize(
      4401,
      null,
      this._productService.nameShort
    );
    const controls = append(content, $(".external-session-banner-controls"));
    const selectContainer = append(controls, $(".external-session-banner-select"));
    const selectedIndex = Math.max(0, this._options.findIndex((option2) => option2.mode === this._selectedMode));
    this._selectBox = this._register(new SelectBox(
      this._options.map((option2) => option2.item),
      selectedIndex,
      contextViewService,
      defaultSelectBoxStyles,
      {
        ariaLabel: localize(4405, null),
        hideDisabledOptions: true,
        showOptionDescriptionHovers: true,
        useCustomDrawn: true
      }
    ));
    this._selectBox.render(selectContainer);
    this._register(this._selectBox.onDidSelect((event) => this._setSelectedMode(this._options[event.index]?.mode)));
    this._saveButton = this._register(new Button(controls, defaultButtonStyles));
    this._saveButton.element.classList.add("external-session-banner-save");
    this._saveButton.label = localize(4403, null);
    this._register(this._saveButton.onDidClick(() => {
      void this._saveSelection().catch((error) => this._notificationService.error(error));
    }));
    this._setSaveButtonVisible(this._selectedMode !== void 0);
    const actionsContainer = append(this.domNode, $(".external-session-banner-actions"));
    const toolbar = this._register(instantiationService.createInstance(WorkbenchToolBar, actionsContainer, {
      ariaLabel: localize(4388, null)
    }));
    const closeAction = this._register(new Action(
      "externalSessionBanner.close",
      localize(4390, null),
      ThemeIcon.asClassName(Codicon.closeCompact),
      true,
      () => this._dismiss()
    ));
    toolbar.setActions([closeAction]);
    this._register(this._storageService.onDidChangeValue(
      0 /* PROFILE */,
      EXTERNAL_SESSION_BANNER_DISMISSED_STORAGE_KEY,
      this._store
    )(() => {
      this._dismissed.set(this._storageService.getBoolean(EXTERNAL_SESSION_BANNER_DISMISSED_STORAGE_KEY, 0 /* PROFILE */, false), void 0);
    }));
    this._register(autorun((reader) => {
      const session = this._session.read(reader);
      const visible = !this._dismissed.read(reader) && session?.isExternal?.read(reader) === true;
      this._setVisible(visible);
    }));
  }
  get visible() {
    return this._visible;
  }
  setSession(session) {
    if (this._lastSession && (!session || !isEqual2(this._lastSession.resource, session.resource))) {
      const mode = this._getSelectedMode();
      this._setSelectedMode(mode);
      this._selectBox.select(Math.max(0, this._options.findIndex((option2) => option2.mode === mode)));
    }
    this._lastSession = session;
    this._session.set(session, void 0);
  }
  _createOptions() {
    return [
      {
        mode: void 0,
        item: {
          text: localize(4414, null),
          isDisabled: true
        }
      },
      {
        mode: "none" /* None */,
        item: {
          text: localize(4412, null),
          description: localize(4413, null)
        }
      },
      {
        mode: "recent" /* Recent */,
        item: {
          text: localize(4415, null),
          description: localize(4416, null)
        }
      },
      {
        mode: "last24Hours" /* Last24Hours */,
        item: {
          text: localize(4406, null),
          description: localize(4407, null)
        }
      },
      {
        mode: "last7Days" /* Last7Days */,
        item: {
          text: localize(4410, null),
          description: localize(4411, null)
        }
      },
      {
        mode: "last30Days" /* Last30Days */,
        item: {
          text: localize(4408, null),
          description: localize(4409, null)
        }
      }
    ];
  }
  _getSelectedMode() {
    return getExternalSessionBannerSelectedMode(
      this._bannerOptions.initialMode,
      this._configurationService.getValue("chat.agentSessions.showExternal" /* ShowExternalAgentSessions */)
    );
  }
  _setSelectedMode(mode) {
    this._selectedMode = mode;
    this._setSaveButtonVisible(mode !== void 0);
  }
  _setSaveButtonVisible(visible) {
    const wasVisible = !this._saveButton.element.classList.contains("hidden");
    this._saveButton.element.classList.toggle("hidden", !visible);
    if (wasVisible !== visible) {
      this._bannerOptions.onDidChangeLayout?.(this._visible);
    }
  }
  _setVisible(visible) {
    if (this._visible === visible) {
      return;
    }
    const hadFocus = !visible && this.domNode.contains(this.domNode.ownerDocument.activeElement);
    this._visible = visible;
    this.domNode.classList.toggle("hidden", !visible);
    this._bannerOptions.onDidChangeLayout?.(visible);
    if (hadFocus) {
      this._bannerOptions.onDidDismissWithFocus?.();
    }
  }
  async _saveSelection() {
    const mode = this._selectedMode;
    const session = this._session.get();
    if (!mode || !session) {
      throw new Error(localize(4404, null));
    }
    if (this._saving) {
      return;
    }
    this._saving = true;
    this._saveButton.enabled = false;
    try {
      const now = Date.now();
      const updatedAt = session.updatedAt.get();
      if (shouldConfirmExternalSessionVisibilityChange(mode, updatedAt, now)) {
        const confirmation = await this._dialogService.confirm(getExternalSessionVisibilityConfirmation(mode, updatedAt, now, this._productService.nameShort));
        if (!confirmation.confirmed) {
          return;
        }
      }
      await this._configurationService.updateValue("chat.agentSessions.showExternal" /* ShowExternalAgentSessions */, mode, 2 /* USER */);
      this._dismiss();
    } finally {
      this._saving = false;
      this._saveButton.enabled = true;
    }
  }
  _dismiss() {
    this._storageService.store(EXTERNAL_SESSION_BANNER_DISMISSED_STORAGE_KEY, true, 0 /* PROFILE */, 0 /* USER */);
    this._dismissed.set(true, void 0);
  }
};

ExternalSessionBanner = __decorateClass([
  __decorateParam(2, IContextViewService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IDialogService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, INotificationService),
  __decorateParam(7, IProductService),
  __decorateParam(8, IStorageService)
], ExternalSessionBanner);
export { shouldConfirmExternalSessionVisibilityChange, getExternalSessionBannerSelectedMode, getExternalSessionVisibilityConfirmation, EXTERNAL_SESSION_BANNER_DISMISSED_STORAGE_KEY, DAY, ExternalSessionBanner };
