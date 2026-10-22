// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/feedbackSurvey/chatModelFeedbackSurveyService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { matchesChatModelFeedbackSurvey, parseChatModelFeedbackSurveyConfig } from "./module-2215.mjs";
import { generateUuid } from "./module-0190.mjs";
import { expandModelMatchCandidates, modelSelectorAliases } from "./module-2214.mjs";
import { getChatSessionType } from "./module-0961.mjs";
import { ITelemetryService, escapeModelIdForTelemetry } from "./module-0093.mjs";
import { CHAT_MODEL_FEEDBACK_SURVEY_TELEMETRY_COMMAND_ID } from "./module-2216.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkbenchAssignmentService } from "./module-1222.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ILanguageModelsService } from "./module-0967.mjs";
import { IChatSessionsService } from "./module-0960.mjs";
import { IChatService } from "./module-0972.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/chat/browser/feedbackSurvey/chatModelFeedbackSurveyService.ts
var CHAT_MODEL_FEEDBACK_SURVEY_TREATMENT = "chatModelFeedbackSurvey";

var FEEDBACK_ENABLED_CONFIG = "telemetry.feedback.enabled";

var STORAGE_PREFIX = "chat.modelFeedbackSurvey.";

var IChatModelFeedbackSurveyService = createDecorator("chatModelFeedbackSurveyService");

function isInProgress(state) {
  return state.status === "open" /* Open */ && !state.isSubmitted;
}

var ChatModelFeedbackSurveyService = class extends Disposable {
  constructor(assignmentService, configurationService, storageService, telemetryService, commandService, languageModelsService, chatSessionsService, chatService, logService) {
    super();
    this.assignmentService = assignmentService;
    this.configurationService = configurationService;
    this.storageService = storageService;
    this.telemetryService = telemetryService;
    this.commandService = commandService;
    this.languageModelsService = languageModelsService;
    this.chatSessionsService = chatSessionsService;
    this.chatService = chatService;
    this.logService = logService;
    this._onDidChangeSurveyState = this._register(new Emitter());
    this.onDidChangeSurveyState = this._onDidChangeSurveyState.event;
    this._onDidChangeConfiguration = this._register(new Emitter());
    this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
    this._configResolved = false;
    /** Increments on every treatment refresh so a slow in-flight resolution cannot overwrite a newer one. */
    this._configGeneration = 0;
    this._states = /* @__PURE__ */ new Map();
    /** How many times the survey has opened itself in each session, keyed by session resource. */
    this._sessionPromptCounts = /* @__PURE__ */ new Map();
    /** The most recent response carrying a survey in each session, for event-driven prompting. */
    this._lastSurveyedResponse = /* @__PURE__ */ new Map();
    void this.resolveConfig();
    this._register(this.assignmentService.onDidRefetchAssignments(() => void this.resolveConfig()));
    this._register(this.chatService.onDidDisposeSession((e) => this.forgetSessions(e.sessionResources)));
  }
  async resolveConfig() {
    const generation = ++this._configGeneration;
    let payload;
    try {
      payload = await this.assignmentService.getTreatment(CHAT_MODEL_FEEDBACK_SURVEY_TREATMENT);
    } catch (err) {
      this.logService.trace(`[chatModelFeedbackSurvey] failed to resolve treatment: ${err}`);
    }
    if (generation !== this._configGeneration) {
      return;
    }
    const previousId = this._config?.id;
    if (payload === void 0) {
      this._config = void 0;
    } else {
      const result = parseChatModelFeedbackSurveyConfig(payload);
      if (result.error) {
        this.logService.warn(`[chatModelFeedbackSurvey] ignoring invalid survey config: ${result.error}`);
        this._config = void 0;
      } else {
        this._config = result.config;
      }
    }
    this._configResolved = true;
    if (this._config && this._config.id !== previousId) {
      this._states.clear();
      this._sessionPromptCounts.clear();
      this._lastSurveyedResponse.clear();
    }
    if (this._config?.id !== previousId) {
      this._onDidChangeConfiguration.fire();
    }
  }
  getSurvey(response) {
    const key3 = this.getKey(response);
    const existing = this._states.get(key3);
    if (existing) {
      const stillApplies = this._config?.id === existing.config.id && this.isFeedbackUiEnabled();
      if (!stillApplies && !isInProgress(existing)) {
        this._states.delete(key3);
        return void 0;
      }
      if (!response.isLast && !isInProgress(existing)) {
        this._states.delete(key3);
        return void 0;
      }
      this.reportShownOnce(existing);
      return this.toReadonly(existing);
    }
    if (!response.isLast) {
      return void 0;
    }
    this.dropSupersededStates(response.sessionResource, key3);
    const config = this.getMatchingConfig(response);
    if (!config) {
      return void 0;
    }
    const state = {
      config,
      instanceId: generateUuid(),
      sessionResource: response.sessionResource,
      requestId: response.requestId,
      status: "collapsed" /* Collapsed */,
      stepIndex: 0,
      answers: /* @__PURE__ */ new Map(),
      commentDraft: "",
      isSubmitted: false,
      openTrigger: void 0,
      dimensions: this.readDimensions(response),
      shownReported: false
    };
    this._states.set(key3, state);
    this._lastSurveyedResponse.set(response.sessionResource.toString(), key3);
    this.reportShownOnce(state);
    if (this.shouldPromptByChance(state)) {
      this.beginPrompt(state, "chance", false);
    }
    return this.toReadonly(state);
  }
  toggle(response) {
    const state = this._states.get(this.getKey(response));
    if (!state) {
      return;
    }
    if (state.status === "open" /* Open */) {
      this.dismiss(response);
    } else {
      this.openState(state, "manual");
    }
  }
  notifyModelSwitchedAway(sessionResource, fromModelId, toModelId) {
    const key3 = this._lastSurveyedResponse.get(sessionResource.toString());
    const state = key3 ? this._states.get(key3) : void 0;
    if (!state || state.status === "open" /* Open */ || state.isSubmitted) {
      return;
    }
    if (!this.isSurveyedModel(state.config, fromModelId) || this.isSurveyedModel(state.config, toModelId)) {
      return;
    }
    const trigger = state.config.prompt.triggers.modelSwitchedAway;
    if (!trigger.enabled || this.hasSurveyInProgress() || !this.hasPromptBudget(state, trigger.bypassCooldown)) {
      return;
    }
    this.beginPrompt(state, "modelSwitchedAway");
  }
  /** Whether a model identifier is one the survey's `selectedModels` selectors name. */
  isSurveyedModel(config, modelId) {
    const selectors = config.match.selectedModels;
    if (!selectors.length) {
      return false;
    }
    const candidates = expandModelMatchCandidates(modelId, this.getModelAliases(modelId));
    return selectors.some((selector) => candidates.has(selector));
  }
  /** The other identifiers a selector may name a model by. */
  getModelAliases(modelId) {
    const metadata = modelId ? this.languageModelsService.lookupLanguageModel(modelId) : void 0;
    return metadata ? modelSelectorAliases(metadata) : void 0;
  }
  answerChoice(response, stepId, optionId) {
    const state = this._states.get(this.getKey(response));
    if (!state || state.status !== "open" /* Open */ || state.isSubmitted) {
      return;
    }
    const stepIndex = state.config.steps.findIndex((step2) => step2.id === stepId);
    const step = state.config.steps[stepIndex];
    if (!step || step.kind !== "choice" /* Choice */) {
      return;
    }
    if (!step.options.some((option2) => option2.id === optionId)) {
      return;
    }
    state.answers.set(stepId, optionId);
    this.report(state, "step", { stepId, stepIndex, answerId: optionId });
    const isLastStep = stepIndex === state.config.steps.length - 1;
    if (isLastStep) {
      this.finish(state, true, "submitted");
      return;
    }
    state.stepIndex = stepIndex + 1;
    this._onDidChangeSurveyState.fire(this.toChangeEvent(state));
  }
  submit(response, comment) {
    const state = this._states.get(this.getKey(response));
    if (!state || state.status !== "open" /* Open */ || state.isSubmitted) {
      return;
    }
    this.reportCommentOnce(state, comment);
    this.finish(state, true, "submitted");
  }
  dismiss(response) {
    const state = this._states.get(this.getKey(response));
    if (!state || state.status !== "open" /* Open */) {
      return;
    }
    if (state.isSubmitted) {
      state.status = "collapsed" /* Collapsed */;
      this._onDidChangeSurveyState.fire(this.toChangeEvent(state));
      return;
    }
    this.reportCommentOnce(state, state.commentDraft);
    this.finish(state, false, "dismissed");
  }
  setCommentDraft(response, comment) {
    const state = this._states.get(this.getKey(response));
    if (!state || state.status !== "open" /* Open */) {
      return;
    }
    state.commentDraft = comment;
  }
  // --- automatic prompting
  /**
   * Decides whether a newly surveyed response should prompt on its own. The odds ramp with
   * every response that passed without prompting, so heavier users reach the survey sooner.
   */
  shouldPromptByChance(state) {
    const { chance } = state.config.prompt;
    if (chance.initial <= 0 && chance.increment <= 0) {
      return false;
    }
    if (this.hasSurveyInProgress()) {
      return false;
    }
    if (!this.hasPromptBudget(state, false)) {
      return false;
    }
    const misses = this.readPromptMisses(state.config);
    const probability = Math.min(chance.initial + chance.increment * misses, chance.max);
    if (Math.random() < probability) {
      return true;
    }
    this.writePromptMisses(state.config, misses + 1);
    return false;
  }
  /** Releases everything held for sessions that have gone away. */
  forgetSessions(sessionResources) {
    for (const sessionResource of sessionResources) {
      const session = sessionResource.toString();
      this._sessionPromptCounts.delete(session);
      this._lastSurveyedResponse.delete(session);
      for (const [key3, state] of [...this._states]) {
        if (state.sessionResource.toString() === session) {
          this._states.delete(key3);
        }
      }
    }
  }
  /** Whether any survey is part way through, which an unrequested prompt must not displace. */
  hasSurveyInProgress() {
    for (const state of this._states.values()) {
      if (isInProgress(state)) {
        return true;
      }
    }
    return false;
  }
  hasPromptBudget(state, bypassCooldown) {
    const { prompt } = state.config;
    const sessionKey = state.sessionResource.toString();
    if ((this._sessionPromptCounts.get(sessionKey) ?? 0) >= prompt.maxPerSession) {
      return false;
    }
    if (bypassCooldown || prompt.cooldownDays <= 0) {
      return true;
    }
    const lastPromptAt = this.readLastPromptAt(state.config);
    if (lastPromptAt === void 0) {
      return true;
    }
    return Date.now() - lastPromptAt >= prompt.cooldownDays * 24 * 60 * 60 * 1e3;
  }
  /** Opens the survey unprompted and charges it against the pacing budgets. */
  beginPrompt(state, trigger, announce = true) {
    const sessionKey = state.sessionResource.toString();
    this._sessionPromptCounts.set(sessionKey, (this._sessionPromptCounts.get(sessionKey) ?? 0) + 1);
    this.writeLastPromptAt(state.config, Date.now());
    this.writePromptMisses(state.config, 0);
    this.openState(state, trigger, announce);
  }
  openState(state, trigger, announce = true) {
    this.closeOtherOpenSurveys(state);
    if (!state.isSubmitted && state.stepIndex >= state.config.steps.length) {
      state.stepIndex = 0;
    }
    state.status = "open" /* Open */;
    state.openTrigger = trigger;
    if (!state.isSubmitted) {
      this.report(state, "opened", { trigger });
    }
    if (announce) {
      this._onDidChangeSurveyState.fire(this.toChangeEvent(state));
    }
  }
  finish(state, submitted, kind) {
    const stepIndex = state.stepIndex;
    state.isSubmitted = submitted;
    state.status = submitted ? "open" /* Open */ : "collapsed" /* Collapsed */;
    this.report(state, kind, { stepIndex });
    this._onDidChangeSurveyState.fire(this.toChangeEvent(state));
  }
  toChangeEvent(state) {
    return { sessionResource: state.sessionResource, requestId: state.requestId };
  }
  // --- eligibility
  getMatchingConfig(response) {
    if (!this._configResolved || !this._config) {
      return void 0;
    }
    if (!this.isFeedbackUiEnabled()) {
      return void 0;
    }
    if (!response.isComplete || response.isCanceled || response.errorDetails) {
      return void 0;
    }
    const request2 = response.model.request;
    const selectedModelId = request2?.modelId;
    return matchesChatModelFeedbackSurvey(this._config, {
      selectedModelId,
      selectedModelAliases: this.getModelAliases(selectedModelId),
      resolvedModelId: this.getResolvedModelId(response),
      modeId: request2?.modeInfo?.telemetryModeId,
      harness: this.getHarness(response.sessionResource),
      sessionType: getChatSessionType(response.sessionResource)
    }) ? this._config : void 0;
  }
  /** Answers that could never be sent must not be collected in the first place. */
  isFeedbackUiEnabled() {
    return this.configurationService.getValue(FEEDBACK_ENABLED_CONFIG) !== false && this.telemetryService.telemetryLevel !== 0 /* NONE */;
  }
  getResolvedModelId(response) {
    const resolvedModel = response.result?.metadata?.resolvedModel;
    return typeof resolvedModel === "string" ? resolvedModel : void 0;
  }
  /** Normalizes local and remote session types to one provider id, which is what a config targets. */
  getHarness(sessionResource) {
    return this.chatSessionsService.getChatSessionContribution(getChatSessionType(sessionResource))?.agentHostProviderId;
  }
  // --- prompt pacing storage
  readPromptMisses(config) {
    const value2 = this.storageService.getNumber(`${STORAGE_PREFIX}${config.id}.promptMisses`, 0 /* PROFILE */, 0);
    return Number.isFinite(value2) && value2 > 0 ? value2 : 0;
  }
  writePromptMisses(config, misses) {
    this.storageService.store(`${STORAGE_PREFIX}${config.id}.promptMisses`, misses, 0 /* PROFILE */, 1 /* MACHINE */);
  }
  readLastPromptAt(config) {
    const value2 = this.storageService.getNumber(`${STORAGE_PREFIX}${config.id}.lastPromptAt`, 0 /* PROFILE */);
    return typeof value2 === "number" && Number.isFinite(value2) && value2 > 0 ? value2 : void 0;
  }
  writeLastPromptAt(config, timestamp) {
    this.storageService.store(`${STORAGE_PREFIX}${config.id}.lastPromptAt`, timestamp, 0 /* PROFILE */, 1 /* MACHINE */);
  }
  // --- state bookkeeping
  getKey(response) {
    return `${response.sessionResource.toString()}\0${response.requestId}`;
  }
  toReadonly(state) {
    return {
      config: state.config,
      instanceId: state.instanceId,
      status: state.status,
      stepIndex: state.stepIndex,
      answers: state.answers,
      commentDraft: state.commentDraft,
      isSubmitted: state.isSubmitted,
      openTrigger: state.openTrigger
    };
  }
  /**
   * Closes whichever survey was already showing, since only one is open at a time. This is the
   * UI moving on rather than the user rejecting anything, so nothing is reported.
   */
  closeOtherOpenSurveys(keep) {
    for (const other of [...this._states.values()]) {
      if (other === keep || other.status !== "open" /* Open */) {
        continue;
      }
      other.status = "collapsed" /* Collapsed */;
      this._onDidChangeSurveyState.fire(this.toChangeEvent(other));
    }
  }
  /**
   * Within one session, keeps the newest response plus anything the user is part way through.
   * Other sessions are separate transcripts and are left alone.
   */
  dropSupersededStates(sessionResource, currentKey) {
    const session = sessionResource.toString();
    for (const [key3, state] of [...this._states]) {
      if (key3 !== currentKey && state.sessionResource.toString() === session && !isInProgress(state)) {
        this._states.delete(key3);
      }
    }
  }
  // --- telemetry
  reportShownOnce(state) {
    if (state.shownReported) {
      return;
    }
    state.shownReported = true;
    this.report(state, "shown", {});
  }
  reportCommentOnce(state, comment) {
    const textStep = state.config.steps.at(-1);
    if (textStep?.kind !== "text" /* Text */) {
      return;
    }
    const trimmed = comment?.trim();
    if (!trimmed || trimmed === state.reportedComment) {
      return;
    }
    const clamped = trimmed.slice(0, textStep.maxLength);
    state.reportedComment = trimmed;
    state.answers.set(textStep.id, clamped);
    this.report(state, "step", {
      stepId: textStep.id,
      stepIndex: state.config.steps.length - 1,
      comment: clamped
    });
  }
  readDimensions(response) {
    const request2 = response.model.request;
    return {
      modelId: escapeModelIdForTelemetry(request2?.modelId),
      resolvedModelId: escapeModelIdForTelemetry(this.getResolvedModelId(response)),
      modeId: request2?.modeInfo?.telemetryModeId,
      harness: this.getHarness(response.sessionResource),
      sessionType: getChatSessionType(response.sessionResource)
    };
  }
  report(state, kind, details) {
    if (!this.isFeedbackUiEnabled()) {
      return;
    }
    const event = {
      kind,
      surveyId: state.config.id,
      surveyInstanceId: state.instanceId,
      stepCount: state.config.steps.length,
      ...details,
      ...state.dimensions,
      requestId: state.requestId
    };
    this.commandService.executeCommand(CHAT_MODEL_FEEDBACK_SURVEY_TELEMETRY_COMMAND_ID, event).catch((err) => this.logService.trace(`[chatModelFeedbackSurvey] failed to report '${kind}': ${err}`));
  }
};

ChatModelFeedbackSurveyService = __decorateClass([
  __decorateParam(0, IWorkbenchAssignmentService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, ICommandService),
  __decorateParam(5, ILanguageModelsService),
  __decorateParam(6, IChatSessionsService),
  __decorateParam(7, IChatService),
  __decorateParam(8, ILogService)
], ChatModelFeedbackSurveyService);
export { isInProgress, CHAT_MODEL_FEEDBACK_SURVEY_TREATMENT, FEEDBACK_ENABLED_CONFIG, STORAGE_PREFIX, IChatModelFeedbackSurveyService, ChatModelFeedbackSurveyService };
