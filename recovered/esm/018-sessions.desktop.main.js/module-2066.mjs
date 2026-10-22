// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/voiceClient/voiceToolDispatchService.ts
import { createDecorator } from "./module-0077.mjs";
import { localize } from "./module-0001.mjs";
import { constObservable } from "./module-0061.mjs";
import { markPendingIdResolved, peekPendingId } from "./module-1341.mjs";
import { ChatPlanReviewData } from "./module-1191.mjs";
import { getVoiceConfirmationType } from "./module-2062.mjs";
import { IChatService, IChatToolInvocation } from "./module-0973.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { resolveQuestionAnswers } from "./module-2065.mjs";
import { ChatQuestionCarouselData } from "./module-1192.mjs";
import { isExplicitFileOrImageVariableEntry } from "./module-0980.mjs";
import { getAgentChangesSummary } from "./module-1462.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentSessionsService } from "./module-1463.mjs";
import { ILanguageModelToolsService } from "./module-0991.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/chat/browser/voiceClient/voiceToolDispatchService.ts
function voiceModelReference(model) {
  return {
    identifier: model.identifier,
    name: model.metadata.name,
    vendor: model.metadata.vendor
  };
}

function normalizeModelName(value2) {
  return value2.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function resolveVoiceModel(models, requestedModel) {
  const exactIdentifier = models.find((model) => model.identifier === requestedModel);
  if (exactIdentifier) {
    return { ok: true, identifier: exactIdentifier.identifier, selected_model: voiceModelReference(exactIdentifier) };
  }
  const normalized = normalizeModelName(requestedModel);
  const exactMatches = models.filter((model) => [
    model.metadata.name,
    model.metadata.id,
    model.metadata.family,
    `${model.metadata.name} ${model.metadata.vendor}`
  ].some((candidate) => normalizeModelName(candidate) === normalized));
  if (exactMatches.length === 1) {
    return { ok: true, identifier: exactMatches[0].identifier, selected_model: voiceModelReference(exactMatches[0]) };
  }
  if (exactMatches.length > 1) {
    return { ok: false, reason: "ambiguous_model", available_models: exactMatches.map(voiceModelReference) };
  }
  const related = normalized ? models.filter((model) => [model.metadata.name, model.metadata.id, model.metadata.family].some((candidate) => normalizeModelName(candidate).includes(normalized) || normalized.includes(normalizeModelName(candidate)))) : [];
  return {
    ok: false,
    reason: related.length > 1 ? "ambiguous_model" : "model_not_found",
    available_models: (related.length > 0 ? related : models).slice(0, 10).map(voiceModelReference)
  };
}

var IVoiceToolDispatchService = createDecorator("voiceToolDispatchService");

var ACTION_LABELS = {
  send_to_chat: localize(11841, null),
  get_session_info: localize(11837, null),
  get_session_changes: localize(11836, null),
  get_session_thread: localize(11838, null),
  respond_to_session: localize(11839, null),
  focus_session: localize(11835, null),
  set_model: localize(11842, null),
  auto_approve_session: localize(11834, null),
  revoke_auto_approve: localize(11840, null)
};

var VoiceToolDispatchService = class {
  constructor(agentSessionsService, chatService, toolsService) {
    this.agentSessionsService = agentSessionsService;
    this.chatService = chatService;
    this.toolsService = toolsService;
  }
  setDelegate(delegate) {
    this._delegate = delegate;
  }
  /** Get the action label for a tool call name. */
  static getActionLabel(name) {
    return ACTION_LABELS[name] ?? localize(11843, null);
  }
  get _agentModeOptions() {
    const allTools = {};
    for (const tool of this.toolsService.getTools(void 0)) {
      allTools[tool.id] = true;
    }
    return {
      modeInfo: {
        kind: "agent" /* Agent */,
        isBuiltin: true,
        modeInstructions: void 0,
        telemetryModeId: "agent",
        applyCodeBlockSuggestionId: void 0
      },
      instructionContext: {
        modeKind: "agent" /* Agent */,
        enabledTools: allTools
      },
      userSelectedTools: constObservable(allTools)
    };
  }
  async dispatchToolCall(toolCall) {
    const delegate = this._delegate;
    if (!delegate) {
      return "error: no delegate set";
    }
    const args2 = toolCall.args;
    const argString = (k) => {
      const v2 = args2[k];
      return typeof v2 === "string" ? v2 : "";
    };
    switch (toolCall.name) {
      case "send_to_chat": {
        const text2 = argString("text");
        if (text2) {
          if (!delegate.acceptInput(text2)) {
            const resource = await delegate.getCurrentSessionResource();
            if (resource) {
              await this.chatService.sendRequest(resource, text2, this._agentModeOptions);
            } else {
              const ref = this.chatService.startNewLocalSession("panel" /* Chat */);
              await this.chatService.sendRequest(ref.object.sessionResource, text2, this._agentModeOptions);
              ref.dispose();
            }
          }
        }
        break;
      }
      case "focus_session": {
        const targetSessionId = argString("coding_session_id");
        const targetResource = this._findSessionResource(targetSessionId);
        if (targetResource) {
          const currentResource = await delegate.getCurrentSessionResource();
          const switched = targetResource.toString() === currentResource?.toString() || await delegate.switchToSession(targetResource);
          if (switched) {
            delegate.setTargetSession(targetResource);
            return JSON.stringify({ ok: true, session_id: targetResource.toString() });
          }
        }
        return JSON.stringify({ ok: false, reason: targetResource ? "switch_failed" : "session_not_found" });
      }
      case "set_model": {
        const requestedModel = argString("model_id") || argString("model");
        if (!requestedModel) {
          return JSON.stringify({ ok: false, reason: "model_not_found" });
        }
        const target = await this._showActionTarget(argString("coding_session_id"));
        if (!target.ok) {
          return JSON.stringify(target);
        }
        return JSON.stringify(await delegate.selectModel(requestedModel));
      }
      case "auto_approve_session": {
        delegate.addAllAutoApprovedSessions();
        break;
      }
      case "revoke_auto_approve": {
        const sessionResource = await delegate.getCurrentSessionResource();
        if (sessionResource) {
          delegate.removeAutoApprovedSession(sessionResource.toString());
        }
        break;
      }
      case "get_session_info": {
        return await this._gatherSessionInfo();
      }
      case "get_session_changes": {
        const sessionId = typeof toolCall.args?.coding_session_id === "string" ? toolCall.args.coding_session_id : void 0;
        return await this._gatherSessionChanges(sessionId);
      }
      case "get_session_thread": {
        const sessionId = typeof toolCall.args?.coding_session_id === "string" ? toolCall.args.coding_session_id : void 0;
        const rawN = toolCall.args?.last_n_turns;
        const lastN = typeof rawN === "number" && rawN > 0 ? Math.min(10, Math.floor(rawN)) : 3;
        return await this._gatherSessionThread(sessionId, lastN);
      }
    }
    return "ok";
  }
  _findSessionResource(sessionId) {
    if (!sessionId) {
      return void 0;
    }
    const agentSession = this.agentSessionsService.model.sessions.find((session) => !session.isArchived() && session.resource.toString() === sessionId);
    if (agentSession) {
      return agentSession.resource;
    }
    for (const model of this.chatService.chatModels.get()) {
      if (model.sessionResource.toString() === sessionId) {
        return model.sessionResource;
      }
    }
    return void 0;
  }
  async _showActionTarget(sessionId) {
    const delegate = this._delegate;
    if (!delegate) {
      return { ok: false, reason: "no_session" };
    }
    const resource = sessionId ? this._findSessionResource(sessionId) : delegate.getTargetSessionResource() ?? await delegate.getCurrentSessionResource();
    if (!resource) {
      return { ok: false, reason: sessionId ? "session_not_found" : "no_session" };
    }
    const current = await delegate.getCurrentSessionResource();
    if (current?.toString() !== resource.toString() && !await delegate.switchToSession(resource)) {
      return { ok: false, reason: "switch_failed" };
    }
    if (sessionId) {
      delegate.setTargetSession(resource);
    }
    return { ok: true, resource };
  }
  /**
   * Apply a backend-resolved response to the exact pending part it names.
   *
   * Routing is by `pending_id` + `request_id` with no fallback: the path this
   * replaces fell back to the focused session, so a spoken "yes" could approve
   * a prompt the user was not looking at. A response that cannot find its part
   * is reported as stale instead. Answer values are matched exactly; see
   * `resolveQuestionAnswers`.
   */
  async respondToSession(toolCall) {
    const args2 = toolCall.args;
    const argString = (key3) => {
      const value2 = args2[key3];
      return typeof value2 === "string" ? value2 : "";
    };
    const response = args2["response"];
    if (!response || typeof response !== "object" || Array.isArray(response)) {
      return { ok: false, reason: "unsupported" };
    }
    const responseType = response["type"];
    if (responseType !== "approve" && responseType !== "reject" && responseType !== "answer" && responseType !== "skip") {
      return { ok: false, reason: "unsupported" };
    }
    const resolved = await this._resolveModelForResponse(argString("coding_session_id"));
    if (!resolved) {
      return { ok: false, reason: "no_session" };
    }
    try {
      return await this._applyResponse(
        resolved.model,
        argString("request_id"),
        argString("pending_id"),
        responseType,
        response
      );
    } finally {
      resolved.dispose();
    }
  }
  async _applyResponse(model, requestId, pendingId, responseType, response) {
    const request2 = model.getRequests().find((candidate) => candidate.id === requestId);
    const parts = request2?.response?.response.value;
    if (!request2 || !parts) {
      return { ok: false, reason: "stale_pending" };
    }
    const index2 = parts.findIndex((candidate) => peekPendingId(request2.id, candidate) === pendingId);
    if (index2 < 0) {
      return { ok: false, reason: "stale_pending" };
    }
    const part = parts[index2];
    if (part.kind === "questionCarousel") {
      if (responseType !== "answer" && responseType !== "skip") {
        return { ok: false, reason: "unsupported" };
      }
      return this._answerCarousel(request2.id, part, response, responseType === "skip");
    }
    if (responseType === "answer" || responseType === "skip") {
      return { ok: false, reason: "unsupported" };
    }
    const approve = responseType === "approve";
    if (part.kind === "planReview" && part instanceof ChatPlanReviewData) {
      return this._resolvePlanReview(part, approve) ? { ok: true } : { ok: false, reason: "stale_pending" };
    }
    if (part.kind === "toolInvocation") {
      if (getVoiceConfirmationType([part]) !== "tool") {
        return { ok: false, reason: "unsupported" };
      }
      markPendingIdResolved(pendingId);
      const confirmed = IChatToolInvocation.confirmWith(
        part,
        approve ? { type: 4 /* UserAction */ } : { type: 0 /* Denied */ }
      );
      return confirmed ? { ok: true } : { ok: false, reason: "stale_pending" };
    }
    return { ok: false, reason: "unsupported" };
  }
  _resolvePlanReview(plan, approve) {
    if (plan.isUsed) {
      return false;
    }
    let result;
    if (approve) {
      const action = plan.actions.find((candidate) => candidate.default) ?? plan.actions[0];
      if (!action) {
        return false;
      }
      result = {
        action: action.label,
        actionId: action.id,
        rejected: false
      };
    } else {
      result = { rejected: true };
    }
    plan.data = result;
    plan.isUsed = true;
    void plan.completion.complete(result);
    return true;
  }
  /** Resolve a coding session id to its chat model, never falling back to the focused session. */
  async _resolveModelForResponse(codingSessionId) {
    if (!codingSessionId) {
      return void 0;
    }
    const agentSession = this.agentSessionsService.model.sessions.find((session) => !session.isArchived() && session.resource.toString() === codingSessionId);
    if (agentSession) {
      const loaded = this.chatService.getSession(agentSession.resource);
      if (loaded) {
        return { model: loaded, dispose: () => {
        } };
      }
    }
    for (const chatModel of this.chatService.chatModels.get()) {
      if (chatModel.sessionResource.toString() === codingSessionId) {
        return { model: chatModel, dispose: () => {
        } };
      }
    }
    if (!agentSession) {
      return void 0;
    }
    const cts = new CancellationTokenSource();
    const ref = await this.chatService.acquireOrLoadSession(agentSession.resource, "panel" /* Chat */, cts.token, "voice-respond").catch(() => void 0);
    cts.dispose();
    if (!ref) {
      return void 0;
    }
    const model = this.chatService.getSession(agentSession.resource);
    if (!model) {
      ref.dispose();
      return void 0;
    }
    return { model, dispose: () => ref.dispose() };
  }
  /**
   * Fill in a question carousel exactly as the widget's own submit path does.
   *
   * A `skip` carries whatever the user answered before saying "skip", which on
   * an untouched form is nothing at all. That empty case is why skipping is its
   * own response type: an `answer` with zero answers is indistinguishable from
   * a backend that resolved nothing, and is correctly refused below.
   */
  _answerCarousel(requestId, carousel, response, skip) {
    if (carousel.isUsed || carousel.answeredExternally) {
      return { ok: false, reason: "stale_pending" };
    }
    if (skip && !carousel.allowSkip) {
      return { ok: false, reason: "stale_pending" };
    }
    const raw = response["answers"];
    if (raw !== void 0 && !Array.isArray(raw)) {
      return { ok: false, reason: "invalid_answer" };
    }
    const rawAnswers = raw ?? [];
    let answers;
    if (rawAnswers.length > 0) {
      answers = resolveQuestionAnswers(carousel.questions, rawAnswers);
      if (!answers) {
        return { ok: false, reason: "invalid_answer" };
      }
    } else if (!skip) {
      return { ok: false, reason: "invalid_answer" };
    }
    if (!skip && carousel.questions.some((question) => question.required && answers?.[question.id] === void 0)) {
      return { ok: false, reason: "invalid_answer" };
    }
    if (!(carousel instanceof ChatQuestionCarouselData) && !carousel.resolveId) {
      return { ok: false, reason: "unsupported" };
    }
    if (carousel instanceof ChatQuestionCarouselData) {
      carousel.dismiss(answers);
    } else {
      carousel.data = answers;
      carousel.isUsed = true;
    }
    if (carousel.resolveId) {
      this.chatService.notifyQuestionCarouselAnswer(requestId, carousel.resolveId, answers);
    }
    return { ok: true };
  }
  async _gatherSessionInfo() {
    const agentSessions = this.agentSessionsService.model.sessions.filter((session) => !session.isArchived());
    const currentResource = await this._delegate?.getCurrentSessionResource();
    const activeResource = this._delegate?.getTargetSessionResource() ?? currentResource;
    const agentResources = new Set(agentSessions.map((session) => session.resource.toString()));
    const inputDetails = (model) => {
      const state = model?.inputModel?.state?.get();
      const selected = state?.selectedModel;
      const attachments = state?.attachments.filter(isExplicitFileOrImageVariableEntry) ?? [];
      return {
        ...selected ? { selected_model: voiceModelReference(selected) } : {},
        ...attachments.length ? {
          attachment_names: attachments.map((attachment) => attachment.name).slice(0, 10),
          attachment_count: attachments.length
        } : {}
      };
    };
    const lastResponseSummary = (model) => {
      const summary = model?.getRequests().at(-1)?.response?.response.value.filter((part) => part.kind === "markdownContent").map((part) => part.content.value).join(" ").slice(0, 500);
      return summary || void 0;
    };
    const sessionData = agentSessions.map((session) => {
      const model = this.chatService.getSession(session.resource);
      const changes = getAgentChangesSummary(session.changes);
      const state = session.status === 2 /* InProgress */ ? "working" : session.status === 3 /* NeedsInput */ ? "waiting_for_input" : session.status === 1 /* Completed */ ? "idle" : "unknown";
      const lastActivity = session.timing.lastRequestEnded ?? session.timing.lastRequestStarted ?? session.timing.created ?? 0;
      return {
        id: session.resource.toString(),
        label: session.label || void 0,
        session_type: "agent",
        state,
        is_active: activeResource?.toString() === session.resource.toString(),
        insertions: changes?.insertions ?? 0,
        deletions: changes?.deletions ?? 0,
        last_activity: lastActivity,
        last_activity_minutes_ago: lastActivity ? Math.max(0, Math.round((Date.now() - lastActivity) / 6e4)) : void 0,
        last_response_summary: lastResponseSummary(model),
        ...inputDetails(model)
      };
    });
    for (const model of this.chatService.chatModels.get()) {
      const sessionId = model.sessionResource.toString();
      const isActive2 = activeResource?.toString() === sessionId;
      if (agentResources.has(sessionId) || model.getRequests().length === 0 && !isActive2) {
        continue;
      }
      const needsInput = model.requestNeedsInput?.get();
      const inProgress = model.hasActiveRequest?.get();
      const lastActivity = model.lastMessageDate || 0;
      sessionData.push({
        id: sessionId,
        label: model.title || void 0,
        session_type: "chat",
        state: needsInput ? "waiting_for_input" : inProgress ? "working" : "idle",
        is_active: isActive2,
        insertions: 0,
        deletions: 0,
        last_activity: lastActivity,
        last_activity_minutes_ago: lastActivity ? Math.max(0, Math.round((Date.now() - lastActivity) / 6e4)) : void 0,
        last_response_summary: lastResponseSummary(model),
        ...inputDetails(model)
      });
    }
    sessionData.sort((a, b) => Number(b.is_active) - Number(a.is_active) || b.last_activity - a.last_activity);
    const counts = sessionData.reduce((result, session) => {
      if (session.state === "working") {
        result.working++;
      } else if (session.state === "waiting_for_input") {
        result.waiting_for_input++;
      } else if (session.state === "idle") {
        result.idle++;
      }
      return result;
    }, { working: 0, waiting_for_input: 0, idle: 0 });
    const visibleSessions = sessionData.slice(0, 20).map(({ last_activity, ...session }) => session);
    return JSON.stringify({
      total_sessions: sessionData.length,
      counts,
      sessions: visibleSessions,
      truncated: visibleSessions.length < sessionData.length
    });
  }
  /**
   * Resolve a coding_session_id (resource URI string) to an IAgentSession.
   * Falls back to the currently active session when id is missing/unknown.
   */
  async _resolveSession(coding_session_id) {
    const sessions = this.agentSessionsService.model.sessions.filter((s) => !s.isArchived());
    if (coding_session_id) {
      const match2 = sessions.find((s) => s.resource.toString() === coding_session_id);
      if (match2) {
        return match2;
      }
    }
    const currentResource = await this._delegate?.getCurrentSessionResource();
    if (currentResource) {
      const active = sessions.find((s) => s.resource.toString() === currentResource.toString());
      if (active) {
        return active;
      }
    }
    return sessions[0];
  }
  /**
   * Gather files touched + per-file insertions/deletions for a session.
   * Returns a JSON string keyed for the LLM follow-up to summarize.
   */
  async _gatherSessionChanges(coding_session_id) {
    const session = await this._resolveSession(coding_session_id);
    if (!session) {
      return JSON.stringify({ session_id: coding_session_id ?? null, files: [], note: "session_not_found" });
    }
    const changes = session.changes;
    const files = [];
    let totalInsertions = 0;
    let totalDeletions = 0;
    let totalFiles = 0;
    if (Array.isArray(changes)) {
      for (const c of changes) {
        const uri4 = c.modifiedUri ?? c.uri;
        const path = uri4 ? this._formatPath(uri4) : "(unknown)";
        files.push({ path, insertions: c.insertions, deletions: c.deletions });
        totalInsertions += c.insertions;
        totalDeletions += c.deletions;
      }
      totalFiles = files.length;
    } else if (changes && !Array.isArray(changes)) {
      const summary = changes;
      totalInsertions = summary.insertions;
      totalDeletions = summary.deletions;
      totalFiles = summary.files;
    }
    return JSON.stringify({
      session_id: session.resource.toString(),
      total_files: totalFiles,
      total_insertions: totalInsertions,
      total_deletions: totalDeletions,
      files: files.slice(0, 20),
      // cap so LLM context stays bounded
      truncated: files.length > 20
    });
  }
  /**
   * Gather the last N user/assistant turns of a coding session — actual
   * conversation content, trimmed for spoken summarization.
   */
  async _gatherSessionThread(coding_session_id, lastN) {
    const session = await this._resolveSession(coding_session_id);
    if (!session) {
      return JSON.stringify({ session_id: coding_session_id ?? null, turns: [], note: "session_not_found" });
    }
    const model = this.chatService.getSession(session.resource);
    if (!model) {
      return JSON.stringify({
        session_id: session.resource.toString(),
        turns: [],
        note: "chat_model_not_loaded"
      });
    }
    const reqs = model.getRequests().slice(-lastN);
    const turns = reqs.map((req) => {
      const userText = req.message.text || "";
      const assistantText = req.response?.response.value.filter((p) => p.kind === "markdownContent").map((p) => p.content.value).join(" ").slice(0, 600) || "";
      return {
        user: userText.slice(0, 400),
        assistant: assistantText
      };
    });
    return JSON.stringify({
      session_id: session.resource.toString(),
      turn_count: turns.length,
      turns
    });
  }
  /** Render a URI as a short relative-ish path for spoken summaries. */
  _formatPath(uri4) {
    const parts = uri4.path.split("/").filter(Boolean);
    if (parts.length <= 2) {
      return uri4.path.replace(/^\//, "");
    }
    return parts.slice(-2).join("/");
  }
};

VoiceToolDispatchService = __decorateClass([
  __decorateParam(0, IAgentSessionsService),
  __decorateParam(1, IChatService),
  __decorateParam(2, ILanguageModelToolsService)
], VoiceToolDispatchService);

registerSingleton(IVoiceToolDispatchService, VoiceToolDispatchService, 1 /* Delayed */);
export { voiceModelReference, normalizeModelName, resolveVoiceModel, IVoiceToolDispatchService, ACTION_LABELS, VoiceToolDispatchService };
