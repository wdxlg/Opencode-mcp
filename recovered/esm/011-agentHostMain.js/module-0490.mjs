// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostInputRequestTracker.ts
import { StopWatch } from "./module-0015.mjs";
import { readChatInputRequestPurpose } from "./module-0182.mjs";
import { isAhpChatChannel, parseRequiredSessionUriFromChatUri } from "./module-0047.mjs";


// src/vs/platform/agentHost/node/agentHostInputRequestTracker.ts
var AgentHostInputRequestTracker = class {
  constructor(_reporter, _stopWatchFactory = () => StopWatch.create(true), _getClientContext = () => void 0) {
    this._reporter = _reporter;
    this._stopWatchFactory = _stopWatchFactory;
    this._getClientContext = _getClientContext;
    this._pending = /* @__PURE__ */ new Map();
  }
  inputRequested(provider, session, turnId, request) {
    const key = this._key(session, request.id);
    if (readChatInputRequestPurpose(request) !== "askUser" /* AskUser */) {
      this._pending.delete(key);
      return;
    }
    const existing = this._pending.get(key);
    if (existing) {
      existing.request = request;
      return;
    }
    this._pending.set(key, {
      stopWatch: this._stopWatchFactory(),
      provider,
      session,
      turnId,
      request
    });
  }
  inputCompleted(session, action, state) {
    const key = this._key(session, action.requestId);
    const timing = this._pending.get(key);
    if (!timing) {
      return;
    }
    this._pending.delete(key);
    if (action.response !== "accept" /* Accept */ || state?.activeTurn?.id !== timing.turnId) {
      return;
    }
    const part = state.activeTurn.responseParts.find(
      (part2) => part2.kind === "inputRequest" /* InputRequest */ && part2.request.id === action.requestId && part2.response === "accept" /* Accept */
    );
    if (!part || part.kind !== "inputRequest" /* InputRequest */ || readChatInputRequestPurpose(part.request) !== "askUser" /* AskUser */) {
      return;
    }
    const questions = part.request.questions ?? timing.request.questions ?? [];
    const answers = part.request.answers ?? {};
    const answeredCount = questions.filter((question) => this._isAnswered(answers[question.id])).length;
    this._reporter.askQuestionsToolInvoked({
      clientContext: this._getClientContext(timing.session, timing.turnId),
      provider: timing.provider,
      session: timing.session,
      requestId: timing.turnId,
      questionCount: questions.length,
      answeredCount,
      skippedCount: questions.length - answeredCount,
      freeTextCount: questions.filter((question) => this._isFreeTextAnswer(answers[question.id])).length,
      recommendedAvailableCount: questions.filter((question) => this._recommendedOptions(question).length > 0).length,
      recommendedSelectedCount: questions.filter((question) => this._isRecommendedSelected(question, answers[question.id])).length,
      duration: timing.stopWatch.elapsed()
    });
  }
  clearTurn(session, turnId) {
    for (const [key, timing] of this._pending) {
      if (timing.session === session && timing.turnId === turnId) {
        this._pending.delete(key);
      }
    }
  }
  clearChat(session) {
    for (const [key, timing] of this._pending) {
      if (timing.session === session) {
        this._pending.delete(key);
      }
    }
  }
  clearAgentSession(session) {
    for (const [key, timing] of this._pending) {
      const owningSession = isAhpChatChannel(timing.session) ? parseRequiredSessionUriFromChatUri(timing.session) : timing.session;
      if (owningSession === session) {
        this._pending.delete(key);
      }
    }
  }
  clear() {
    this._pending.clear();
  }
  _isAnswered(answer) {
    return answer !== void 0 && answer.state !== "skipped" /* Skipped */;
  }
  _isFreeTextAnswer(answer) {
    if (!this._isAnswered(answer)) {
      return false;
    }
    if (answer.value.kind === "text" /* Text */) {
      return true;
    }
    return (answer.value.kind === "selected" /* Selected */ || answer.value.kind === "selected-many" /* SelectedMany */) && answer.value.freeformValues?.some((value) => value.length > 0) === true;
  }
  _recommendedOptions(question) {
    if (question.kind !== "single-select" /* SingleSelect */ && question.kind !== "multi-select" /* MultiSelect */) {
      return [];
    }
    return question.options.filter((option) => option.recommended).map((option) => option.id);
  }
  _isRecommendedSelected(question, answer) {
    if (!this._isAnswered(answer)) {
      return false;
    }
    const recommended = this._recommendedOptions(question);
    if (answer.value.kind === "selected" /* Selected */) {
      return recommended.includes(answer.value.value);
    }
    if (answer.value.kind === "selected-many" /* SelectedMany */) {
      return answer.value.value.some((value) => recommended.includes(value));
    }
    return false;
  }
  _key(session, requestId) {
    return `${session}\0${requestId}`;
  }
};
export { AgentHostInputRequestTracker };
