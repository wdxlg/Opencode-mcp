// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/modelPicker.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { derived } from "./module-0054.mjs";
import { ChatPetAchievementIds, didExplicitlySwitchChatPetModel } from "./module-2111.mjs";
import { reportNewChatPickerClosed } from "./module-3541.mjs";
import { ModelPickerActionItem } from "./module-2168.mjs";
import { autorun } from "./module-0052.mjs";
import { markOnboardingTarget } from "./module-3542.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { INewChatModelPickerService } from "./module-3540.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { IChatEntitlementService } from "./module-0954.mjs";
import { ISessionContext } from "./module-3499.mjs";
import { ISessionModelSelection } from "./module-3539.mjs";
import { IChatPetService } from "./module-2112.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { Menus } from "./module-3437.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { IsPhoneLayoutContext, SessionUsesCombinedConfigPickerContext } from "./module-1770.mjs";
import { BaseActionViewItem } from "./module-0476.mjs";


// src/vs/sessions/contrib/chat/browser/modelPicker.ts
var ModelPicker = class extends Disposable {
  constructor(compact2, instantiationService, _telemetryService, _newChatModelPickerService, _workspaceTrustManagementService, _chatEntitlementService, _sessionContext, _selectionModel, _chatPetService) {
    super();
    this._telemetryService = _telemetryService;
    this._newChatModelPickerService = _newChatModelPickerService;
    this._workspaceTrustManagementService = _workspaceTrustManagementService;
    this._chatEntitlementService = _chatEntitlementService;
    this._sessionContext = _sessionContext;
    this._selectionModel = _selectionModel;
    this._chatPetService = _chatPetService;
    this._renderDisposables = this._register(new DisposableStore());
    const currentModel = derived(this, (reader) => this._selectionModel.state.read(reader).currentModel);
    this._delegate = {
      currentModel,
      setModel: (model) => {
        const previousModel = this._selectionModel.state.get().currentModel;
        if (this._selectionModel.selectModel(model.identifier)) {
          if (didExplicitlySwitchChatPetModel(previousModel?.identifier, model.identifier)) {
            this._chatPetService.unlockAchievement(ChatPetAchievementIds.ModelSwitch);
          }
          reportNewChatPickerClosed(this._telemetryService, {
            id: "NewChatModelPicker",
            optionIdBefore: previousModel?.identifier,
            optionIdAfter: model.identifier,
            optionLabelBefore: previousModel?.metadata.name,
            optionLabelAfter: model.metadata.name,
            isPII: false
          });
        }
      },
      getModels: () => [...this._selectionModel.state.get().models],
      getPresentationOptions: () => ({
        ...this._selectionModel.state.get().options,
        showModelIcon: true
      }),
      isCacheWarm: () => {
        const session = this._sessionContext.session.get();
        return session ? session.status.get() !== 0 /* Untitled */ : false;
      }
    };
    const pickerOptions = {
      compact: compact2
    };
    const action = { id: "sessions.modelPicker", label: "", enabled: true, class: void 0, tooltip: "", run: () => {
    } };
    this._modelPicker = this._register(instantiationService.createInstance(ModelPickerActionItem, action, this._delegate, pickerOptions));
    this._register(this._newChatModelPickerService.registerModelPicker({
      open: () => this._modelPicker.openModelPicker(),
      switchToModel: (modelIdentifier) => this.switchToModel(modelIdentifier)
    }));
    this._register(autorun((reader) => {
      this._selectionModel.state.read(reader);
      this._updatePickerState();
    }));
    this._register(this._workspaceTrustManagementService.onDidChangeTrust(() => this._updatePickerState()));
    this._workspaceTrustManagementService.workspaceTrustInitialized.then(() => {
      if (!this._store.isDisposed) {
        this._updatePickerState();
      }
    });
    this._register(this._chatEntitlementService.onDidChangeEntitlement(() => this._updatePickerState()));
    this._register(this._chatEntitlementService.onDidChangeSentiment(() => this._updatePickerState()));
    this._register(this._chatEntitlementService.onDidChangeAnonymous(() => this._updatePickerState()));
  }
  render(container2) {
    this._renderDisposables.clear();
    this._container = container2;
    this._modelPicker.render(container2);
    this._renderDisposables.add(markOnboardingTarget(container2, "sessions.newSession.modelPicker", {
      open: () => this._modelPicker.openModelPicker()
    }));
    this._updatePickerState();
  }
  switchToModel(modelIdentifier) {
    return this._selectionModel.selectModel(modelIdentifier);
  }
  /**
   * Whether the model picker should be shown for the given session. Visible
   * when the session has models, when its Auto model is unavailable (so the
   * widget can render the "No models available" empty state), or when the
   * workspace is untrusted / Chat still needs sign-in (so the widget can render
   * its Restricted Mode or Sign In state). Otherwise hidden, matching the
   * historical behavior for providers that offer no models.
   */
  _shouldShowPicker() {
    const state = this._selectionModel.state.get();
    if (state.models.length > 0) {
      return true;
    }
    if (this._modelPicker.isRestrictedMode() || this._modelPicker.isSetupRequired()) {
      return true;
    }
    return !state.options.showAutoModel;
  }
  _updatePickerState() {
    const visible = this._shouldShowPicker();
    this._modelPicker.setEnabled(visible);
    this._updateVisibility(visible);
  }
  _updateVisibility(visible) {
    if (this._container) {
      this._container.style.display = visible ? "" : "none";
    }
  }
};

ModelPicker = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, INewChatModelPickerService),
  __decorateParam(4, IWorkspaceTrustManagementService),
  __decorateParam(5, IChatEntitlementService),
  __decorateParam(6, ISessionContext),
  __decorateParam(7, ISessionModelSelection),
  __decorateParam(8, IChatPetService)
], ModelPicker);

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "sessions.modelPicker",
      title: localize2(4425, "Model"),
      f1: false,
      menu: [{
        id: Menus.NewSessionConfig,
        group: "navigation",
        order: 1,
        // Hidden on phone when the active provider supplies a combined
        // mode + model picker instead (see MobileChatInputConfigPicker).
        when: ContextKeyExpr.or(IsPhoneLayoutContext.negate(), SessionUsesCombinedConfigPickerContext.negate())
      }]
    });
  }
  async run() {
  }
});

var ModelPickerActionViewItem = class extends BaseActionViewItem {
  constructor(picker) {
    super(void 0, { id: "", label: "", enabled: true, class: void 0, tooltip: "", run: () => {
    } });
    this.picker = picker;
  }
  render(container2) {
    this.picker.render(container2);
  }
  dispose() {
    this.picker.dispose();
    super.dispose();
  }
};
export { ModelPicker, ModelPickerActionViewItem };
