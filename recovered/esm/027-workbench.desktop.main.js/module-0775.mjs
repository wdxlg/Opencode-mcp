// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsNewUsers.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { derived } from "./module-0054.mjs";
import { runOnChange, runOnChangeWithCancellationToken } from "./module-0064.mjs";
import { timeout } from "./module-0036.mjs";
import { autorun } from "./module-0052.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsNewUsers.ts
var InlineEditsOnboardingExperience = class extends Disposable {
  constructor(_model, _indicator, _collapsedView, _storageService, _configurationService) {
    super();
    this._model = _model;
    this._indicator = _indicator;
    this._collapsedView = _collapsedView;
    this._storageService = _storageService;
    this._configurationService = _configurationService;
    this._disposables = this._register(new MutableDisposable());
    this._setupDone = observableValue({ name: "setupDone" }, false);
    this._activeCompletionId = derived((reader) => {
      const model = this._model.read(reader);
      if (!model) {
        return void 0;
      }
      if (!this._setupDone.read(reader)) {
        return void 0;
      }
      const indicator = this._indicator.read(reader);
      if (!indicator || !indicator.isVisible.read(reader)) {
        return void 0;
      }
      return model.inlineEdit.inlineCompletion.identity.id;
    });
    this._register(this._initializeDebugSetting());
    this._disposables.value = this.setupNewUserExperience();
    this._setupDone.set(true, void 0);
  }
  setupNewUserExperience() {
    if (this.getNewUserType() === "active" /* Active */) {
      return void 0;
    }
    const disposableStore = new DisposableStore();
    let userHasHoveredOverIcon = false;
    let inlineEditHasBeenAccepted = false;
    let firstTimeUserAnimationCount = 0;
    let secondTimeUserAnimationCount = 0;
    disposableStore.add(runOnChangeWithCancellationToken(this._activeCompletionId, async (id2, _, __, token) => {
      if (id2 === void 0) {
        return;
      }
      let userType = this.getNewUserType();
      switch (userType) {
        case "firstTime" /* FirstTime */: {
          if (firstTimeUserAnimationCount++ >= 5 || userHasHoveredOverIcon) {
            userType = "secondTime" /* SecondTime */;
            this.setNewUserType(userType);
          }
          break;
        }
        case "secondTime" /* SecondTime */: {
          if (secondTimeUserAnimationCount++ >= 3 && inlineEditHasBeenAccepted) {
            userType = "active" /* Active */;
            this.setNewUserType(userType);
          }
          break;
        }
      }
      switch (userType) {
        case "firstTime" /* FirstTime */: {
          for (let i2 = 0; i2 < 3 && !token.isCancellationRequested; i2++) {
            await this._indicator.get()?.triggerAnimation();
            await timeout(500);
          }
          break;
        }
        case "secondTime" /* SecondTime */: {
          this._indicator.get()?.triggerAnimation();
          break;
        }
      }
    }));
    disposableStore.add(autorun((reader) => {
      if (this._collapsedView.isVisible.read(reader)) {
        if (this.getNewUserType() !== "active" /* Active */) {
          this._collapsedView.triggerAnimation();
        }
      }
    }));
    disposableStore.add(autorun((reader) => {
      const indicator = this._indicator.read(reader);
      if (!indicator) {
        return;
      }
      reader.store.add(runOnChange(indicator.isHoveredOverIcon, async (isHovered) => {
        if (isHovered) {
          userHasHoveredOverIcon = true;
        }
      }));
    }));
    disposableStore.add(autorun((reader) => {
      const model = this._model.read(reader);
      if (!model) {
        return;
      }
      reader.store.add(model.onDidAccept(() => {
        inlineEditHasBeenAccepted = true;
      }));
    }));
    return disposableStore;
  }
  getNewUserType() {
    return this._storageService.get("inlineEditsGutterIndicatorUserKind", -1 /* APPLICATION */, "firstTime" /* FirstTime */);
  }
  setNewUserType(value2) {
    switch (value2) {
      case "firstTime" /* FirstTime */:
        throw new BugIndicatingError("UserKind should not be set to first time");
      case "secondTime" /* SecondTime */:
        break;
      case "active" /* Active */:
        this._disposables.clear();
        break;
    }
    this._storageService.store("inlineEditsGutterIndicatorUserKind", value2, -1 /* APPLICATION */, 0 /* USER */);
  }
  _initializeDebugSetting() {
    const hiddenDebugSetting = "editor.inlineSuggest.edits.resetNewUserExperience";
    if (this._configurationService.getValue(hiddenDebugSetting)) {
      this._storageService.remove("inlineEditsGutterIndicatorUserKind", -1 /* APPLICATION */);
    }
    const disposable = this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(hiddenDebugSetting) && this._configurationService.getValue(hiddenDebugSetting)) {
        this._storageService.remove("inlineEditsGutterIndicatorUserKind", -1 /* APPLICATION */);
        this._disposables.value = this.setupNewUserExperience();
      }
    });
    return disposable;
  }
};

InlineEditsOnboardingExperience = __decorateClass([
  __decorateParam(3, IStorageService),
  __decorateParam(4, IConfigurationService)
], InlineEditsOnboardingExperience);
export { InlineEditsOnboardingExperience };
