// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/inlineCompletions/common/inlineCompletionsUnification.ts
import { createDecorator } from "./module-0077.mjs";
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkbenchAssignmentService } from "./module-1222.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkbenchExtensionEnablementService } from "./module-1047.mjs";
import { IExtensionManagementService } from "./module-0874.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IProductService } from "./module-0875.mjs";
import { equals } from "./module-0007.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/inlineCompletions/common/inlineCompletionsUnification.ts
var IInlineCompletionsUnificationService = createDecorator("inlineCompletionsUnificationService");

var CODE_UNIFICATION_PREFIX = "cmp-cht-";

var EXTENSION_UNIFICATION_PREFIX = "cmp-ext-";

var CODE_UNIFICATION_FF = "inlineCompletionsUnificationCode";

var MODEL_UNIFICATION_FF = "inlineCompletionsUnificationModel";

var isRunningUnificationExperiment = new RawContextKey("isRunningUnificationExperiment", false);

var ExtensionUnificationSetting = "chat.extensionUnification.enabled";

var InlineCompletionsUnificationImpl = class extends Disposable {
  constructor(_assignmentService, _contextKeyService, _configurationService, _extensionEnablementService, _extensionManagementService, _extensionService, productService) {
    super();
    this._assignmentService = _assignmentService;
    this._contextKeyService = _contextKeyService;
    this._configurationService = _configurationService;
    this._extensionEnablementService = _extensionEnablementService;
    this._extensionManagementService = _extensionManagementService;
    this._extensionService = _extensionService;
    this._state = new InlineCompletionsUnificationState(false, false, false, []);
    this._onDidStateChange = this._register(new Emitter());
    this.onDidStateChange = this._onDidStateChange.event;
    this._onDidChangeExtensionUnificationState = this._register(new Emitter());
    this._onDidChangeExtensionUnificationSetting = this._register(new Emitter());
    this._completionsExtensionId = productService.defaultChatAgent?.extensionId.toLowerCase();
    this._chatExtensionId = productService.defaultChatAgent?.chatExtensionId.toLowerCase();
    const relevantExtensions = [this._completionsExtensionId, this._chatExtensionId].filter((id2) => !!id2);
    this.isRunningUnificationExperiment = isRunningUnificationExperiment.bindTo(this._contextKeyService);
    this._assignmentService.addTelemetryAssignmentFilter({
      id: "inlineCompletionsUnification",
      exclude: (assignment) => assignment.startsWith(EXTENSION_UNIFICATION_PREFIX) && this._state.extensionUnification !== this._configurationService.getValue(ExtensionUnificationSetting),
      onDidChange: Event2.any(this._onDidChangeExtensionUnificationState.event, this._onDidChangeExtensionUnificationSetting.event)
    });
    this._register(this._extensionEnablementService.onEnablementChanged((extensions) => {
      if (extensions.some((ext) => relevantExtensions.includes(ext.identifier.id.toLowerCase()))) {
        this._update();
      }
    }));
    this._register(this._configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(ExtensionUnificationSetting)) {
        this._update();
        this._onDidChangeExtensionUnificationSetting.fire();
      }
    }));
    this._register(this._extensionService.onDidChangeExtensions(({ added }) => {
      if (added.some((ext) => relevantExtensions.includes(ext.identifier.value.toLowerCase()))) {
        this._update();
      }
    }));
    this._register(this._assignmentService.onDidRefetchAssignments(() => this._update()));
    this._update();
  }
  get state() {
    return this._state;
  }
  async _update() {
    const [codeUnificationFF, modelUnificationFF, extensionUnificationEnabled] = await Promise.all([
      this._assignmentService.getTreatment(CODE_UNIFICATION_FF),
      this._assignmentService.getTreatment(MODEL_UNIFICATION_FF),
      this._isExtensionUnificationActive()
    ]);
    const extensionStatesMatchUnificationSetting = this._configurationService.getValue(ExtensionUnificationSetting) === extensionUnificationEnabled;
    const currentExperiments = await this._assignmentService.getCurrentExperiments();
    const newState = new InlineCompletionsUnificationState(
      codeUnificationFF === true,
      modelUnificationFF === true,
      extensionUnificationEnabled,
      currentExperiments?.filter((exp) => exp.startsWith(CODE_UNIFICATION_PREFIX) || extensionStatesMatchUnificationSetting && exp.startsWith(EXTENSION_UNIFICATION_PREFIX)) ?? []
    );
    if (this._state.equals(newState)) {
      return;
    }
    const previousState = this._state;
    this._state = newState;
    this.isRunningUnificationExperiment.set(this._state.codeUnification || this._state.modelUnification || this._state.extensionUnification);
    this._onDidStateChange.fire();
    if (previousState.extensionUnification !== this._state.extensionUnification) {
      this._onDidChangeExtensionUnificationState.fire();
    }
  }
  async _isExtensionUnificationActive() {
    if (!this._configurationService.getValue(ExtensionUnificationSetting)) {
      return false;
    }
    if (!this._completionsExtensionId || !this._chatExtensionId) {
      return false;
    }
    const [completionsExtension, chatExtension, installedExtensions] = await Promise.all([
      this._extensionService.getExtension(this._completionsExtensionId),
      this._extensionService.getExtension(this._chatExtensionId),
      this._extensionManagementService.getInstalled(1 /* User */)
    ]);
    if (!chatExtension || completionsExtension) {
      return false;
    }
    const completionExtensionInstalled = installedExtensions.filter((ext) => ext.identifier.id.toLowerCase() === this._completionsExtensionId);
    if (completionExtensionInstalled.length === 0) {
      return true;
    }
    const completionsExtensionDisabledByUnification = completionExtensionInstalled.some((ext) => this._extensionEnablementService.getEnablementState(ext) === 9 /* DisabledByUnification */);
    return !!chatExtension && completionsExtensionDisabledByUnification;
  }
};

InlineCompletionsUnificationImpl = __decorateClass([
  __decorateParam(0, IWorkbenchAssignmentService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IWorkbenchExtensionEnablementService),
  __decorateParam(4, IExtensionManagementService),
  __decorateParam(5, IExtensionService),
  __decorateParam(6, IProductService)
], InlineCompletionsUnificationImpl);

var InlineCompletionsUnificationState = class {
  constructor(codeUnification, modelUnification, extensionUnification, expAssignments) {
    this.codeUnification = codeUnification;
    this.modelUnification = modelUnification;
    this.extensionUnification = extensionUnification;
    this.expAssignments = expAssignments;
  }
  equals(other) {
    return this.codeUnification === other.codeUnification && this.modelUnification === other.modelUnification && this.extensionUnification === other.extensionUnification && equals(this.expAssignments, other.expAssignments);
  }
};

registerSingleton(IInlineCompletionsUnificationService, InlineCompletionsUnificationImpl, 1 /* Delayed */);
export { IInlineCompletionsUnificationService, CODE_UNIFICATION_PREFIX, EXTENSION_UNIFICATION_PREFIX, CODE_UNIFICATION_FF, MODEL_UNIFICATION_FF, isRunningUnificationExperiment, ExtensionUnificationSetting, InlineCompletionsUnificationImpl, InlineCompletionsUnificationState };
