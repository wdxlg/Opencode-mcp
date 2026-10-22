// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostSessionTitleController.ts
import { createDecorator } from "./module-0044.mjs";
import { Disposable } from "./module-0010.mjs";
import { buildDefaultChatUri, isAhpChatChannel, isDefaultChatUri } from "./module-0047.mjs";
import { AGENT_HOST_TITLE_SOURCE_AGENT, AGENT_HOST_TITLE_SOURCE_AUTO, AGENT_HOST_TITLE_SOURCE_USER, SESSION_CUSTOM_TITLE_KEY, SESSION_CUSTOM_TITLE_SOURCE_KEY, customChatTitleMetadataKey, customChatTitleSourceMetadataKey, persistSessionMetadata } from "./module-0482.mjs";
import { CancellationTokenSource } from "./module-0017.mjs";
import { Limiter } from "./module-0027.mjs";
import { buildConversationContext, renderResponseMarkdown, truncateMiddle } from "./module-0486.mjs";
import { URI } from "./module-0023.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/agentHostSessionTitleController.ts
var MAX_TITLE_LENGTH = 200;

var MAX_ACTIVE_AGENT_FALLBACK_TITLE_LENGTH = 40;

var MAX_TITLE_TOKENS = 32;

var GITHUB_CONTEXT_REQUEST_TIMEOUT = 5e3;

var MAX_CONCURRENT_GITHUB_CONTEXT_REQUESTS = 5;

var MAX_GITHUB_CONTEXT_BODY_CHARS = 4e3;

var MAX_GITHUB_CONTEXT_REFERENCES = 10;

var MAX_TRAILING_HAN_SUFFIX_CODE_UNITS = 6;

var MIN_LATIN_LETTERS_BEFORE_HAN_SUFFIX = 4;

var MIN_LATIN_LETTER_RATIO = 0.8;

var HAN_CHARACTER = /\p{sc=Han}/u;

var TRAILING_HAN_SUFFIX = /(?<!\p{sc=Han})\p{sc=Han}{2,3}$/u;

var GITHUB_ISSUE_OR_PULL_REQUEST_URL_PATTERN = /\bhttps?:\/\/(?<host>[\w.-]+)\/(?<owner>[\w.-]+)\/(?<repo>[\w.-]+)\/(?<kind>issues|pull)\/(?<number>\d+)\b/gi;

var CHAT_RENAME_REMINDER = "Reminder: This chat currently has an auto-generated or placeholder title. If the user references an issue or PR, fetch it first. Please give the chat a short, descriptive title based on the user's intent by calling `rename_chat` with `automatic: true`, silently and without a preamble. The user must not know that you are renaming. Do not skip it.";

var MAX_TITLE_CONTEXT_CHARS = 2e4;

var MIN_GITHUB_CONTEXT_CHARS = 4e3;

var IAgentHostSessionTitleController = createDecorator("agentHostSessionTitleController");

var AgentHostSessionTitleController = class extends Disposable {
  constructor(_stateManager, _options, _logService) {
    super();
    this._stateManager = _stateManager;
    this._options = _options;
    this._logService = _logService;
    this._titleGenerationCancellationSources = /* @__PURE__ */ new Map();
    /**
     * The most recent title this controller applied for a given session/chat
     * key. Used to detect whether the title was changed (e.g. a manual
     * `/rename` or user edit) since we last set it, so we never clobber a
     * deliberate title with an auto-generated one.
     */
    this._lastAppliedTitle = /* @__PURE__ */ new Map();
    /**
     * Session/chat keys whose current title is a provisional placeholder set by
     * {@link seedProvisionalTitle} (e.g. from a `!command`). Such a title does
     * not describe the session's topic, so the first subsequent request that
     * carries real intent replaces it with a generated title via
     * {@link seedTitleFromFirstMessage}.
     */
    this._provisionalTitles = /* @__PURE__ */ new Set();
    this._autoTitles = /* @__PURE__ */ new Set();
    this._renamedTitles = /* @__PURE__ */ new Set();
  }
  seedTitleFromFirstMessage(channel, userPrompt, chatChannel) {
    if (this._isEphemeralSession(channel)) {
      return;
    }
    const activeAgentTitleGenerationEnabled = this._isActiveAgentTitleGenerationEnabled(channel);
    const fallbackTitle = activeAgentTitleGenerationEnabled ? this._normalizeActiveAgentFallbackTitle(userPrompt) : this._normalizeTitle(userPrompt);
    if (!fallbackTitle) {
      return;
    }
    const independentChat = this._independentChatChannel(channel, chatChannel);
    const key = independentChat ?? channel;
    const state = independentChat ? this._stateManager.getChatState(independentChat) : this._stateManager.getSessionState(channel);
    if (!state || !this._canSeedFirstMessageTitle(key, state.turns.length, state.title)) {
      return;
    }
    const replacesProvisionalTitle = this._provisionalTitles.has(key);
    this._provisionalTitles.delete(key);
    this._applySeedTitle(channel, independentChat, fallbackTitle);
    if (activeAgentTitleGenerationEnabled) {
      this.markTitleAuto(channel, independentChat, fallbackTitle);
      return;
    }
    if (replacesProvisionalTitle) {
      this._persistAutoTitle(channel, independentChat, fallbackTitle);
    }
    this._generateTitleSoon(
      key,
      { content: userPrompt, isConversation: false, gitHubReferenceSource: userPrompt },
      fallbackTitle,
      (title) => this._applySeedTitle(channel, independentChat, title),
      () => this._currentSeedTitle(channel, independentChat) === this._lastAppliedTitle.get(key),
      (title) => this._persistAutoTitle(channel, independentChat, title)
    );
  }
  /** Seeds and persists a provisional title suggested by a locally handled command. */
  seedProvisionalTitle(channel, suggestedTitle, chatChannel) {
    if (this._isEphemeralSession(channel)) {
      return;
    }
    const title = this._normalizeTitle(suggestedTitle, this._isActiveAgentTitleGenerationEnabled(channel) ? MAX_ACTIVE_AGENT_FALLBACK_TITLE_LENGTH : MAX_TITLE_LENGTH);
    if (!title) {
      return;
    }
    const independentChat = this._independentChatChannel(channel, chatChannel);
    const key = independentChat ?? channel;
    const state = independentChat ? this._stateManager.getChatState(independentChat) : this._stateManager.getSessionState(channel);
    if (!state || !this._canSeedProvisionalTitle(key, state.title)) {
      return;
    }
    this._provisionalTitles.add(key);
    this._applySeedTitle(channel, independentChat, title);
    this._persistAutoTitle(channel, independentChat, title);
  }
  /** Trims, collapses whitespace, and length-caps a candidate title. */
  _normalizeTitle(text, maxLength = MAX_TITLE_LENGTH) {
    return Array.from(text.trim().replace(/\s+/g, " ")).slice(0, maxLength).join("").trim();
  }
  _normalizeActiveAgentFallbackTitle(text) {
    const normalized = text.trim().replace(/\s+/g, " ");
    const characters = Array.from(normalized);
    if (characters.length <= MAX_ACTIVE_AGENT_FALLBACK_TITLE_LENGTH) {
      return normalized;
    }
    const limited = characters.slice(0, MAX_ACTIVE_AGENT_FALLBACK_TITLE_LENGTH).join("");
    if (!limited.includes(" ")) {
      return `${Array.from(limited).slice(0, MAX_ACTIVE_AGENT_FALLBACK_TITLE_LENGTH - 3).join("")}...`;
    }
    const remaining = characters.slice(MAX_ACTIVE_AGENT_FALLBACK_TITLE_LENGTH).join("");
    const nextWordBoundary = remaining.indexOf(" ");
    const completedWord = nextWordBoundary >= 0 ? remaining.slice(0, nextWordBoundary) : remaining;
    if (Array.from(completedWord).length > MAX_ACTIVE_AGENT_FALLBACK_TITLE_LENGTH) {
      return `${Array.from(limited).slice(0, MAX_ACTIVE_AGENT_FALLBACK_TITLE_LENGTH - 3).join("")}...`;
    }
    return nextWordBoundary >= 0 ? `${limited}${completedWord}...` : normalized;
  }
  /**
   * The independently titled chat a seed should target, or `undefined` to
   * title the session-backed sole default chat.
   */
  _independentChatChannel(channel, chatChannel) {
    if (!chatChannel || !isAhpChatChannel(chatChannel)) {
      return void 0;
    }
    return !isDefaultChatUri(chatChannel) || (this._stateManager.getSessionState(channel)?.chats.length ?? 1) > 1 ? chatChannel : void 0;
  }
  /**
   * Applies `title` to the independently titled chat (`independentChat`) or, when
   * that is `undefined`, to the session itself, recording it as last-applied.
   */
  _applySeedTitle(channel, independentChat, title) {
    if (independentChat) {
      this._applyTitle(independentChat, title, (t) => this._stateManager.updateChatTitle(channel, independentChat, t));
      this._persistAutoTitleSource(channel, independentChat);
    } else {
      this._applyTitle(channel, title, (t) => this._stateManager.dispatchServerAction(channel, {
        type: "session/titleChanged" /* SessionTitleChanged */,
        title: t
      }));
      this._persistAutoTitleSource(channel, void 0);
    }
  }
  /** Persists `title` as the custom title of the addressed independent chat or session. */
  _persistAutoTitle(channel, independentChat, title) {
    if (independentChat) {
      this._persistSessionFlag(channel, customChatTitleMetadataKey(independentChat), title);
      this._persistSessionFlag(channel, customChatTitleSourceMetadataKey(independentChat), AGENT_HOST_TITLE_SOURCE_AUTO);
      return;
    }
    this._persistSessionFlag(channel, SESSION_CUSTOM_TITLE_KEY, title);
    this._persistSessionFlag(channel, SESSION_CUSTOM_TITLE_SOURCE_KEY, AGENT_HOST_TITLE_SOURCE_AUTO);
  }
  _persistAutoTitleSource(channel, independentChat) {
    this._persistSessionFlag(channel, independentChat ? customChatTitleSourceMetadataKey(independentChat) : SESSION_CUSTOM_TITLE_SOURCE_KEY, AGENT_HOST_TITLE_SOURCE_AUTO);
  }
  /** The live title of the addressed independent chat or session. */
  _currentSeedTitle(channel, independentChat) {
    return independentChat ? this._stateManager.getChatState(independentChat)?.title : this._stateManager.getSessionState(channel)?.title;
  }
  /**
   * Whether {@link seedTitleFromFirstMessage} may (re)title `key`: true for a
   * fresh, untitled target (its first message) or when its title is a
   * provisional placeholder we applied and no one has changed it since — the
   * first real request supersedes the placeholder.
   */
  _canSeedFirstMessageTitle(key, turnsLength, currentTitle) {
    if (turnsLength === 0 && !currentTitle) {
      return true;
    }
    return this._provisionalTitles.has(key) && !!currentTitle && currentTitle === this._lastAppliedTitle.get(key);
  }
  /**
   * Whether {@link seedProvisionalTitle} may (re)title `key`: true when it is
   * untitled (the first message carried a suggestion) or when its title is a
   * provisional placeholder we applied and no one has changed it since —
   * successive suggestions keep the newest one visible without clobbering a
   * manual rename.
   */
  _canSeedProvisionalTitle(key, currentTitle) {
    if (!currentTitle) {
      return true;
    }
    return this._provisionalTitles.has(key) && currentTitle === this._lastAppliedTitle.get(key);
  }
  /**
   * Re-generates the title once the first turn has completed, this time
   * using the full first-turn context (the user request plus the agent's
   * textual response) rather than just the opening message. This only runs
   * for the very first turn and only when the current title is still the one
   * this controller last applied — a manual `/rename`, a user edit, or a
   * forked session's inherited title all suppress it.
   *
   * Only normal text response parts are considered (tool calls, reasoning,
   * and other parts are ignored). If the context still exceeds the budget
   * the middle is removed (marked with `...`). The user's first request is
   * always preserved.
   */
  refineTitleFromFirstTurn(channel, chatChannel) {
    if (this._isEphemeralSession(channel)) {
      return;
    }
    if (this._isActiveAgentTitleGenerationEnabled(channel)) {
      return;
    }
    const isAdditionalChat = !!chatChannel && isAhpChatChannel(chatChannel) && !isDefaultChatUri(chatChannel);
    if (isAdditionalChat) {
      const chatState = this._stateManager.getChatState(chatChannel);
      if (!chatState || chatState.turns.length !== 1) {
        return;
      }
      const lastApplied2 = this._lastAppliedTitle.get(chatChannel);
      if (lastApplied2 === void 0 || chatState.title !== lastApplied2) {
        return;
      }
      const turn2 = chatState.turns[0];
      const context2 = this._buildFirstTurnContext(turn2);
      if (!context2) {
        return;
      }
      const apply2 = (title) => {
        this._applyTitle(chatChannel, title, (t) => this._stateManager.updateChatTitle(channel, chatChannel, t));
        this._persistAutoTitleSource(channel, chatChannel);
      };
      this._generateTitleSoon(
        chatChannel,
        { content: context2, isConversation: true, gitHubReferenceSource: turn2.message.text, currentTitle: lastApplied2 },
        lastApplied2,
        apply2,
        () => this._stateManager.getChatState(chatChannel)?.title === this._lastAppliedTitle.get(chatChannel),
        (title) => this._persistAutoTitle(channel, chatChannel, title)
      );
      return;
    }
    const state = this._stateManager.getSessionState(channel);
    if (!state || state.turns.length !== 1) {
      return;
    }
    const lastApplied = this._lastAppliedTitle.get(channel);
    if (lastApplied === void 0 || state.title !== lastApplied) {
      return;
    }
    const turn = state.turns[0];
    const context = this._buildFirstTurnContext(turn);
    if (!context) {
      return;
    }
    const apply = (title) => {
      this._applyTitle(channel, title, (t) => this._stateManager.dispatchServerAction(channel, {
        type: "session/titleChanged" /* SessionTitleChanged */,
        title: t
      }));
      this._persistAutoTitleSource(channel, void 0);
    };
    this._generateTitleSoon(
      channel,
      { content: context, isConversation: true, gitHubReferenceSource: turn.message.text, currentTitle: lastApplied },
      lastApplied,
      apply,
      () => this._stateManager.getSessionState(channel)?.title === this._lastAppliedTitle.get(channel),
      (title) => this._persistAutoTitle(channel, void 0, title)
    );
  }
  /**
   * Generates a title for a freshly forked session or chat from its
   * inherited conversation context. Forks copy the source history up to the
   * fork point, so neither {@link seedTitleFromFirstMessage} nor
   * {@link refineTitleFromFirstTurn} (which require an empty / single-turn
   * state) ever fire for them. This is the fork equivalent, run once at fork
   * time over the kept turns, so the new chat gets a content-derived title
   * instead of permanently inheriting the source's `Forked: …` title.
   *
   * `fallbackTitle` is the title the caller already applied to the new
   * session/chat (e.g. `Forked: <source>`); it is recorded as the
   * last-applied title so a concurrent manual rename suppresses the
   * generated title, and stays visible until generation completes. The
   * context is bounded to {@link MAX_TITLE_CONTEXT_CHARS} (middle-truncated),
   * so generation costs at most a single small-model call.
   */
  generateForkedTitle(channel, chatChannel, turns, fallbackTitle, sourceTitle) {
    if (this._isEphemeralSession(channel)) {
      return;
    }
    if (this._isActiveAgentTitleGenerationEnabled(channel)) {
      this.markTitleAuto(channel, chatChannel, fallbackTitle);
      return;
    }
    const context = this._buildConversationContext(turns, sourceTitle);
    if (!context) {
      return;
    }
    const isAdditionalChat = !!chatChannel && isAhpChatChannel(chatChannel) && !isDefaultChatUri(chatChannel);
    if (isAdditionalChat) {
      const key = chatChannel;
      this._lastAppliedTitle.set(key, fallbackTitle);
      this._persistAutoTitleSource(channel, key);
      const apply2 = (title) => this._applyTitle(key, title, (t) => this._stateManager.updateChatTitle(channel, key, t));
      this._generateTitleSoon(
        key,
        { content: context, isConversation: true },
        fallbackTitle,
        apply2,
        () => this._stateManager.getChatState(key)?.title === this._lastAppliedTitle.get(key),
        (title) => this._persistAutoTitle(channel, key, title)
      );
      return;
    }
    this._lastAppliedTitle.set(channel, fallbackTitle);
    this._persistAutoTitleSource(channel, void 0);
    const apply = (title) => this._applyTitle(channel, title, (t) => this._stateManager.dispatchServerAction(channel, {
      type: "session/titleChanged" /* SessionTitleChanged */,
      title: t
    }));
    this._generateTitleSoon(
      channel,
      { content: context, isConversation: true },
      fallbackTitle,
      apply,
      () => this._stateManager.getSessionState(channel)?.title === this._lastAppliedTitle.get(channel),
      (title) => this._persistAutoTitle(channel, void 0, title)
    );
  }
  _applyTitle(key, title, dispatch) {
    this._lastAppliedTitle.set(key, title);
    dispatch(title);
  }
  /**
   * Generates a title for an external session whose provider surfaced it
   * without one, from the user's first prompt. Such a session usually has no
   * live state (it is materialized when opened), so the generated title is
   * persisted and pushed onto its surfaced summary. A session that already
   * carries a persisted title keeps it; a rename during generation cancels it.
   *
   * Unlike the other entry points this awaits generation, so the caller's
   * deferred-work lane stays serialized against it.
   */
  async generateExternalSessionTitle(session, userPrompt) {
    if (this._isEphemeralSession(session) || await this._readPersistedTitleMetadata(session, SESSION_CUSTOM_TITLE_KEY)) {
      return;
    }
    await this._startTitleGeneration(
      session,
      { content: userPrompt, isConversation: false, gitHubReferenceSource: userPrompt },
      "",
      (title) => this._applyExternalSessionTitle(session, title),
      () => true,
      (title) => this._persistAutoTitle(session, void 0, title)
    );
  }
  _applyExternalSessionTitle(session, title) {
    if (this._stateManager.getSessionState(session)) {
      this._applySeedTitle(session, void 0, title);
    } else {
      this._applyTitle(session, title, (t) => this._stateManager.updateSurfacedSessionTitle(session, t));
    }
  }
  cancelTitleGeneration(session) {
    this._cancelTitleGeneration(session);
  }
  clearSession(session, chatChannels) {
    for (const key of [session, buildDefaultChatUri(session), ...chatChannels]) {
      this._cancelTitleGeneration(key);
      this._lastAppliedTitle.delete(key);
      this._provisionalTitles.delete(key);
      this._autoTitles.delete(key);
      this._renamedTitles.delete(key);
    }
  }
  markTitleAuto(channel, chatChannel, title) {
    const independentChat = this._independentChatChannel(channel, chatChannel);
    const key = independentChat ?? channel;
    this._lastAppliedTitle.set(key, title);
    this._autoTitles.add(key);
    this._renamedTitles.delete(key);
    this._persistAutoTitle(channel, independentChat, title);
  }
  markTitleRenamed(channel, chatChannel) {
    const key = this._independentChatChannel(channel, chatChannel) ?? channel;
    this._cancelTitleGeneration(key);
    this._autoTitles.delete(key);
    this._provisionalTitles.delete(key);
    this._renamedTitles.add(key);
  }
  async prepareInstructionForAgent(channel, chatChannel) {
    if (this._isEphemeralSession(channel)) {
      return void 0;
    }
    if (!this._isActiveAgentTitleGenerationEnabled(channel)) {
      return void 0;
    }
    const independentChat = this._independentChatChannel(channel, chatChannel);
    const key = independentChat ?? channel;
    if (this._renamedTitles.has(key)) {
      return void 0;
    }
    const sourceKey = independentChat ? customChatTitleSourceMetadataKey(independentChat) : SESSION_CUSTOM_TITLE_SOURCE_KEY;
    const source = await this._readPersistedTitleMetadata(channel, sourceKey);
    if (source === AGENT_HOST_TITLE_SOURCE_USER || source === AGENT_HOST_TITLE_SOURCE_AGENT) {
      this.markTitleRenamed(channel, independentChat);
      return void 0;
    }
    if (source !== AGENT_HOST_TITLE_SOURCE_AUTO && !this._autoTitles.has(key)) {
      return void 0;
    }
    return CHAT_RENAME_REMINDER;
  }
  _generateTitleSoon(key, prompt, fallbackTitle, apply, currentTitleMatchesFallback, persist) {
    void this._startTitleGeneration(key, prompt, fallbackTitle, apply, currentTitleMatchesFallback, persist);
  }
  /** Starts generation and resolves once the title has been applied and persisted. */
  _startTitleGeneration(key, prompt, fallbackTitle, apply, currentTitleMatchesFallback, persist) {
    this._cancelTitleGeneration(key);
    const source = new CancellationTokenSource();
    this._titleGenerationCancellationSources.set(key, source);
    return this._generateTitle(key, prompt, fallbackTitle, apply, currentTitleMatchesFallback, persist, source.token).catch((err) => {
      if (!source.token.isCancellationRequested) {
        this._logService.warn(`[AgentHostSessionTitleController] Failed to apply generated title for ${key}`, err);
      }
    }).finally(() => {
      if (this._titleGenerationCancellationSources.get(key) === source) {
        this._titleGenerationCancellationSources.delete(key);
        source.dispose();
      }
    });
  }
  async _generateTitle(key, prompt, fallbackTitle, apply, currentTitleMatchesFallback, persist, token) {
    const generatedTitle = await this._generateTitleFromPrompt(prompt, token);
    if (token.isCancellationRequested || !generatedTitle) {
      return;
    }
    if (!currentTitleMatchesFallback()) {
      return;
    }
    if (generatedTitle !== fallbackTitle) {
      apply(generatedTitle);
    }
    persist(generatedTitle);
  }
  async _generateTitleFromPrompt(prompt, token) {
    if (token.isCancellationRequested) {
      return void 0;
    }
    const githubToken = this._options.getGitHubCopilotToken?.();
    const copilotApiService = this._options.copilotApiService;
    if (!githubToken || !copilotApiService) {
      return void 0;
    }
    const abortController = new AbortController();
    const cancellationListener = token.onCancellationRequested(() => abortController.abort());
    try {
      const titlePromptContent = prompt.gitHubReferenceSource === void 0 ? prompt.content : await this._appendGitHubContext(prompt.content, prompt.gitHubReferenceSource, abortController.signal, token);
      if (token.isCancellationRequested) {
        return void 0;
      }
      const rawTitle = await copilotApiService.utilityChatCompletion(githubToken, {
        messages: this._buildTitlePrompt(titlePromptContent, prompt),
        maxTokens: MAX_TITLE_TOKENS
      }, {
        signal: abortController.signal
      });
      return this._cleanTitle(rawTitle, titlePromptContent);
    } catch (err) {
      if (token.isCancellationRequested) {
        return void 0;
      }
      this._logService.warn("[AgentHostSessionTitleController] Failed to generate session title", err);
      return void 0;
    } finally {
      cancellationListener.dispose();
    }
  }
  /**
   * Appends the GitHub issue / pull requests linked from `referenceSource` to
   * `promptContent`, keeping the combined text within
   * {@link MAX_TITLE_CONTEXT_CHARS}. Enrichment is guaranteed
   * {@link MIN_GITHUB_CONTEXT_CHARS}; whatever it leaves over bounds
   * `promptContent`, whose middle is dropped so the request at its head and
   * the response tail both survive.
   */
  async _appendGitHubContext(promptContent, referenceSource, cancellationSignal, token) {
    const references = this._parseGitHubReferences(referenceSource);
    const githubToken = this._options.getGitHubToken?.();
    const octoKitService = this._options.octoKitService;
    if (references.length === 0 || !githubToken || !octoKitService) {
      return promptContent;
    }
    const signal = AbortSignal.any([cancellationSignal, AbortSignal.timeout(this._options.gitHubContextRequestTimeout ?? GITHUB_CONTEXT_REQUEST_TIMEOUT)]);
    const limiter = new Limiter(MAX_CONCURRENT_GITHUB_CONTEXT_REQUESTS);
    try {
      const contexts = await Promise.all(references.map((reference) => limiter.queue(async () => {
        try {
          const value = await octoKitService.getIssueOrPullRequest(
            reference.owner,
            reference.repo,
            reference.number,
            githubToken,
            signal
          );
          return { reference, value };
        } catch (error) {
          if (!token.isCancellationRequested) {
            this._logService.warn(`[AgentHostSessionTitleController] Failed to fetch GitHub ${reference.kind} ${reference.owner}/${reference.repo}#${reference.number}`, error);
          }
          return void 0;
        }
      })));
      const successfulContexts = contexts.filter((context) => context !== void 0);
      if (successfulContexts.length === 0) {
        return promptContent;
      }
      const separator = "\n\n";
      const gitHubBudget = Math.max(MIN_GITHUB_CONTEXT_CHARS, MAX_TITLE_CONTEXT_CHARS - promptContent.length - separator.length);
      const gitHubContext = this._formatGitHubContexts(successfulContexts, gitHubBudget);
      const contentBudget = Math.max(0, MAX_TITLE_CONTEXT_CHARS - gitHubContext.length - separator.length);
      const content = promptContent.length > contentBudget ? truncateMiddle(promptContent, contentBudget) : promptContent;
      return `${content}${separator}${gitHubContext}`;
    } finally {
      limiter.dispose();
    }
  }
  _parseGitHubReferences(text) {
    const references = [];
    const seen = /* @__PURE__ */ new Set();
    const configuredHost = this._normalizeGitHubHost(this._options.getGitHubHost?.() ?? "github.com");
    for (const match2 of text.matchAll(GITHUB_ISSUE_OR_PULL_REQUEST_URL_PATTERN)) {
      const host = match2.groups?.host;
      const owner = match2.groups?.owner;
      const repo = match2.groups?.repo;
      const rawKind = match2.groups?.kind;
      const number = Number(match2.groups?.number);
      if (!host || this._normalizeGitHubHost(host) !== configuredHost || !owner || !repo || rawKind !== "issues" && rawKind !== "pull" || !Number.isSafeInteger(number) || number <= 0) {
        continue;
      }
      const kind = rawKind === "issues" ? "issue" : "pull request";
      const key = `${owner.toLowerCase()}/${repo.toLowerCase()}/${kind}/${number}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      references.push({ owner, repo, number, kind });
      if (references.length === MAX_GITHUB_CONTEXT_REFERENCES) {
        break;
      }
    }
    return references;
  }
  _normalizeGitHubHost(host) {
    const normalizedHost = host.toLowerCase();
    return normalizedHost === "www.github.com" ? "github.com" : normalizedHost;
  }
  _formatGitHubContexts(contexts, budget) {
    const heading = "GitHub issue and pull request context:\n\n";
    const fixedLength = heading.length + contexts.reduce((length, context, index) => {
      return length + this._formatGitHubContext(context.reference, context.value, "").length + (index === 0 ? 0 : 2);
    }, 0);
    let remainingBodyBudget = Math.max(0, budget - fixedLength);
    const sections = contexts.map((context, index) => {
      const bodyBudget = Math.min(
        MAX_GITHUB_CONTEXT_BODY_CHARS,
        Math.floor(remainingBodyBudget / (contexts.length - index))
      );
      const body = truncateMiddle(context.value.body, bodyBudget);
      remainingBodyBudget -= body.length;
      return this._formatGitHubContext(context.reference, context.value, body);
    });
    return truncateMiddle(`${heading}${sections.join("\n\n")}`, budget);
  }
  _formatGitHubContext(reference, value, body) {
    return [
      `GitHub ${reference.kind} ${reference.owner}/${reference.repo}#${reference.number}:`,
      `The title of the ${reference.kind} is: ${value.title}`,
      `The body of the ${reference.kind} is:`,
      body
    ].join("\n");
  }
  _buildTitlePrompt(promptContent, prompt) {
    const request = prompt.isConversation ? `Please write a brief title for the following conversation:

${promptContent}` : `Please write a brief title for the following request:

${promptContent}`;
    const currentTitle = prompt.currentTitle?.trim();
    const userInstruction = currentTitle ? `${request}

Its current title is: ${currentTitle}
Reply with that same title unless the text above supports a clearly more accurate one.` : request;
    return [
      {
        role: "system",
        content: [
          "You are an expert in crafting ultra-compact titles for chatbot conversations.",
          "You are presented with a chat request or conversation, and you reply with only a brief title that captures the main topic.",
          "Write the title in sentence case, not title case.",
          "Preserve product names, abbreviations, code symbols, and proper nouns.",
          "Aim for 3-6 words. Prefer the shortest accurate title.",
          'Drop articles like "a", "an", and "the" unless needed for clarity.',
          'Drop filler and generic framing like "help with", "question about", "request for", or "issue with".',
          "Never describe the chat itself as forked, branched, or continued \u2014 title only the underlying topic.",
          "Prefer short, concrete synonyms and omit unnecessary words.",
          "Do not wrap the title in quotes or add trailing punctuation."
        ].join(" ")
      },
      {
        role: "user",
        content: userInstruction
      }
    ];
  }
  _cleanTitle(rawTitle, promptContent) {
    let title = rawTitle.trim();
    const firstLine = title.split(/\r?\n/).map((line) => line.trim()).find((line) => line.length > 0);
    title = firstLine ?? "";
    if (title.startsWith('"') && title.endsWith('"') && title.length > 1) {
      title = title.slice(1, -1).trim();
    }
    title = title.replace(/[.!?]+$/, "").trim();
    if (!title || title.includes("can't assist with that")) {
      return void 0;
    }
    title = title.slice(0, MAX_TITLE_LENGTH + MAX_TRAILING_HAN_SUFFIX_CODE_UNITS);
    return this._stripUnexpectedTrailingHanSuffix(title, promptContent).slice(0, MAX_TITLE_LENGTH);
  }
  _stripUnexpectedTrailingHanSuffix(title, promptContent) {
    if (HAN_CHARACTER.test(promptContent)) {
      return title;
    }
    const suffix = TRAILING_HAN_SUFFIX.exec(title);
    if (!suffix) {
      return title;
    }
    const prefix = title.slice(0, suffix.index).trimEnd();
    const letterCount = prefix.match(/\p{L}/gu)?.length ?? 0;
    const latinLetterCount = prefix.match(/\p{sc=Latin}/gu)?.length ?? 0;
    if (latinLetterCount < MIN_LATIN_LETTERS_BEFORE_HAN_SUFFIX || latinLetterCount / letterCount < MIN_LATIN_LETTER_RATIO) {
      return title;
    }
    return prefix;
  }
  /**
   * Builds the first-turn context string for title refinement. The user's
   * request is always kept (truncated in the middle only if it alone exceeds
   * half the budget). Only normal text (markdown) response parts are
   * considered — tool calls, reasoning, and other parts are ignored. If the
   * combined text is over budget, the middle of the response is removed.
   *
   * @returns the context string, or `undefined` when the turn has no text
   * response worth refining from (the opening message already produced a
   * title in that case).
   */
  _buildFirstTurnContext(turn) {
    const response = renderResponseMarkdown(turn.responseParts);
    if (!response) {
      return void 0;
    }
    const userBudget = Math.floor(MAX_TITLE_CONTEXT_CHARS / 2);
    let userRequest = turn.message.text.trim();
    if (userRequest.length > userBudget) {
      userRequest = truncateMiddle(userRequest, userBudget);
    }
    const userBlock = `User request:
${userRequest}`;
    const responseLabel = "\n\nAgent response:\n";
    const responseBudget = Math.max(0, MAX_TITLE_CONTEXT_CHARS - userBlock.length - responseLabel.length);
    const trimmedResponse = response.length > responseBudget ? truncateMiddle(response, responseBudget) : response;
    return trimmedResponse ? `${userBlock}${responseLabel}${trimmedResponse}` : userBlock;
  }
  /**
   * Builds a conversation context string for forked-title generation by
   * concatenating each kept turn's user request and textual response. Only
   * normal text (markdown) response parts are considered — tool calls,
   * reasoning, and other parts are ignored, mirroring
   * {@link _buildFirstTurnContext}. When the fork's `sourceTitle` is known, a
   * short framing note is prepended so the model understands the conversation
   * is a branch continued from an earlier chat. The conversation is
   * middle-truncated to {@link MAX_TITLE_CONTEXT_CHARS} to bound model cost;
   * the framing note is always preserved in full.
   *
   * @returns the context string, or `undefined` when no turn carries any
   * text worth titling from.
   */
  _buildConversationContext(turns, sourceTitle) {
    const framedTitle = sourceTitle?.trim();
    const framing = framedTitle ? `This conversation was branched from an earlier chat titled "${framedTitle}". The turns below, oldest first, are the inherited history up to the branch point.

` : void 0;
    return buildConversationContext(turns, { maxChars: MAX_TITLE_CONTEXT_CHARS, framing });
  }
  _persistSessionFlag(session, key, value) {
    persistSessionMetadata(this._options.sessionDataService, this._logService, session, key, value);
  }
  _isActiveAgentTitleGenerationEnabled(channel) {
    const serverTools = this._stateManager.getSessionState(channel)?.serverTools;
    return serverTools ? serverTools.some((tool) => tool.name === "rename_chat" /* RenameChat */) : this._options.isActiveAgentTitleGenerationEnabled?.() === true;
  }
  _isEphemeralSession(channel) {
    return this._stateManager.isEphemeralSession(channel);
  }
  async _readPersistedTitleMetadata(session, key) {
    try {
      const ref = await this._options.sessionDataService.tryOpenDatabase?.(URI.parse(session));
      if (!ref) {
        return void 0;
      }
      try {
        return await ref.object.getMetadata(key);
      } finally {
        ref.dispose();
      }
    } catch (err) {
      this._logService.warn(`[AgentHostSessionTitleController] Failed to read title metadata '${key}'`, err);
      return void 0;
    }
  }
  _cancelTitleGeneration(session) {
    const source = this._titleGenerationCancellationSources.get(session);
    if (!source) {
      return;
    }
    source.dispose(true);
    this._titleGenerationCancellationSources.delete(session);
  }
  dispose() {
    for (const source of this._titleGenerationCancellationSources.values()) {
      source.dispose(true);
    }
    this._titleGenerationCancellationSources.clear();
    this._lastAppliedTitle.clear();
    this._provisionalTitles.clear();
    this._autoTitles.clear();
    this._renamedTitles.clear();
    super.dispose();
  }
};

AgentHostSessionTitleController = __decorateClass([
  __decorateParam(2, ILogService)
], AgentHostSessionTitleController);
export { MAX_TITLE_LENGTH, MAX_ACTIVE_AGENT_FALLBACK_TITLE_LENGTH, MAX_TITLE_TOKENS, GITHUB_CONTEXT_REQUEST_TIMEOUT, MAX_CONCURRENT_GITHUB_CONTEXT_REQUESTS, MAX_GITHUB_CONTEXT_BODY_CHARS, MAX_GITHUB_CONTEXT_REFERENCES, MAX_TRAILING_HAN_SUFFIX_CODE_UNITS, MIN_LATIN_LETTERS_BEFORE_HAN_SUFFIX, MIN_LATIN_LETTER_RATIO, HAN_CHARACTER, TRAILING_HAN_SUFFIX, GITHUB_ISSUE_OR_PULL_REQUEST_URL_PATTERN, CHAT_RENAME_REMINDER, MAX_TITLE_CONTEXT_CHARS, MIN_GITHUB_CONTEXT_CHARS, IAgentHostSessionTitleController, AgentHostSessionTitleController };
