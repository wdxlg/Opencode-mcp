// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/shared/sessionServerTools.ts
import { buildChatUri, buildDefaultChatUri, getInlineToolInput, getSessionRelatedPullRequestUrls, isDefaultChatUri, isSessionStatusArchived, isSessionStatusRead, parseChatUri, readSessionGitHubState, readSessionGitState, withSessionCreationReference } from "./module-0047.mjs";
import { URI } from "./module-0023.mjs";
import { isEqual2 } from "./module-0025.mjs";
import { buildOpenSessionLinkUri, parseOpenSessionLinkChatId, parseOpenSessionLinkUri } from "./module-0230.mjs";
import { AgentSession } from "./module-0048.mjs";
import { generateUuid } from "./module-0042.mjs";
import { localize } from "./module-0012.mjs";


// src/vs/platform/agentHost/node/shared/sessionServerTools.ts
var maxSessionSpawnDepth = 3;

var maxCreatedSessions = 25;

var maxCreatedChats = 25;

var maxSentMessages = 50;

var sessionConfirmationToolNames = /* @__PURE__ */ new Set(["create_session" /* CreateSession */, "create_chat" /* CreateChat */, "send_message" /* SendMessage */, "delete_session" /* DeleteSession */]);

var createSessionRelationshipValues = ["currentSession", "independent"];

function sessionToolRequiresConfirmation(toolName) {
  return sessionConfirmationToolNames.has(toolName);
}

var listSessionsStatusValues = ["idle", "inProgress", "inputNeeded", "error", "archived"];

var listSessionsInputSchema = {
  type: "object",
  properties: {
    session: { type: "string", description: "Return only the session with this URI or `agent-host-session://` link (a direct lookup that ignores the other filters). Use this to fetch one known session's metadata." },
    status: {
      type: "array",
      items: { type: "string", enum: [...listSessionsStatusValues] },
      description: "Only return sessions whose status matches one of these (e.g. `inputNeeded` for sessions awaiting a reply, `inProgress` for running ones, `archived` for sessions marked Done/completed \u2014 implies `includeArchived`). Omit to return every status."
    },
    workspace: { type: "string", description: "Only return sessions for this project name, project URI, or working directory path/URI." },
    withChanges: { type: "boolean", description: "When true, only return sessions that have pending worktree changes." },
    unread: { type: "boolean", description: "When true, only return sessions with updates the user has not seen yet." },
    withPullRequest: { type: "boolean", description: "When true, only return sessions that have a linked GitHub pull request." },
    includeArchived: { type: "boolean", description: "Whether to include archived sessions. Defaults to false; set true to also return archived sessions." },
    createdAfter: { type: "string", description: "Only return sessions created at or after this time (ISO-8601 timestamp, e.g. `2025-01-31T00:00:00Z`)." },
    createdBefore: { type: "string", description: "Only return sessions created at or before this time (ISO-8601 timestamp)." }
  }
};

var createSessionInputSchema = {
  type: "object",
  properties: {
    relationship: {
      type: "string",
      enum: [...createSessionRelationshipValues],
      description: "Whether this work belongs to the current session or is independently managed. Use `currentSession` for tasks from the current plan or deliverable, including parallel or delegated tasks. Use `independent` only for a separate deliverable that needs its own workspace and top-level lifecycle."
    },
    prompt: { type: "string", description: "Initial prompt to send to the new session." },
    workspace: { type: "string", description: "For `independent` work: unique project name, project/workspace URI, absolute folder path, or working directory from an existing session. Required for `independent` and invalid for `currentSession`." },
    title: { type: "string", maxLength: 200, description: "Short title for the new chat or independent session." },
    model: { type: "string", description: "Optional model ID or display name. Defaults to the current chat's model. For `currentSession`, the model must belong to the current session's provider; for `independent`, the model selects the new session's provider." }
  },
  required: ["relationship", "prompt", "title"]
};

var getCurrentSessionInputSchema = {
  type: "object",
  properties: {}
};

var renameChatInputSchema = {
  type: "object",
  properties: {
    session: { type: "string", description: "Optional owning session: a session URI from `list_sessions` or an `agent-host-session://` link. When provided with `chat`, it must match that chat's session." },
    chat: { type: "string", description: "The chat to rename: pass an `agent-host-session://` session or chat link. Omit when renaming the chat in which this tool is running." },
    title: { type: "string", maxLength: 200, description: "Short, descriptive chat title, ideally 1-4 words." },
    automatic: { type: "boolean", description: "Set to true only when this call is fulfilling the host's automatic title reminder. Omit for user-requested renames." }
  },
  required: ["title"]
};

var deleteSessionInputSchema = {
  type: "object",
  properties: {
    session: { type: "string", description: "The session to delete: a session URI from `list_sessions` or an `agent-host-session://` link (e.g. from `create_session`)." }
  },
  required: ["session"]
};

var sendMessageInputSchema = {
  type: "object",
  properties: {
    session: { type: "string", description: "The session or chat to message: a session URI from `list_sessions`, or an `agent-host-session://` link. A link carrying a chat id targets that specific chat." },
    message: { type: "string", description: "The message to send." }
  },
  required: ["session", "message"]
};

var sessionContextDetailValues = ["summary", "digest", "full"];

var getSessionContextInputSchema = {
  type: "object",
  properties: {
    session: { type: "string", description: "The session or chat to read: a session URI from `list_sessions`, or an `agent-host-session://` link. A link carrying a chat id targets that specific chat." },
    detail: {
      type: "string",
      enum: [...sessionContextDetailValues],
      description: "How much conversation detail to return. `summary` (default): status and a short per-turn gist (the message plus a compact snippet of the reply). `digest`: adds the full assistant reply text and tool-call names. `full`: adds tool-call inputs. Higher levels return more tokens."
    },
    transcriptLimit: { type: "number", description: "Maximum number of most-recent turns to include. Defaults to 10; capped at 50." }
  },
  required: ["session"]
};

var sessionServerToolDefinitions = [
  {
    name: "list_sessions" /* ListSessions */,
    title: "List Sessions",
    description: "List sessions and their compact metadata (status, activity, working directory, project, worktree changes, git/GitHub info, timestamps). Each result includes `session` for identity and tool inputs and `openLink` for clickable Markdown links; do not use `session` as a link target. Pass `session` to fetch a single known session by URI. By default archived sessions are omitted. Optionally filter by `status`, `workspace`, `withChanges`, `unread`, `withPullRequest`, `includeArchived`, `createdAfter`, or `createdBefore`.",
    inputSchema: listSessionsInputSchema,
    annotations: { readOnlyHint: true }
  },
  {
    name: "get_current_session" /* GetCurrentSession */,
    title: "Get Current Session",
    description: "Get metadata and the open link for the session this conversation is running in. Use this to reference the current session (for example before adding a chat to it).",
    inputSchema: getCurrentSessionInputSchema,
    annotations: { readOnlyHint: true }
  },
  {
    name: "create_session" /* CreateSession */,
    title: "Create Session",
    description: "Create delegated work and start it with an initial prompt. Set `relationship` to `currentSession` when the task belongs to the current plan or deliverable; this creates a new chat that shares the current session's workspace, lifecycle, and aggregate diff. Set it to `independent` only for a separate deliverable that needs its own workspace, provider, or top-level lifecycle.",
    inputSchema: createSessionInputSchema,
    annotations: { readOnlyHint: false }
  },
  {
    name: "rename_chat" /* RenameChat */,
    title: "Rename Chat",
    description: "Rename one specific chat so it is easy to find later. Renaming the default chat also names its owning session, while peer-chat titles remain independent. Use a short, human-friendly chat name in sentence case (1-4 words). Pass an `agent-host-session://` session or chat link to target another chat, or omit `chat` to rename the chat in which this tool is running. Name a fresh chat once its scope is clear. Call this tool again whenever the user explicitly asks to rename the chat; every invocation replaces the current title.",
    inputSchema: renameChatInputSchema,
    annotations: { readOnlyHint: false }
  },
  {
    name: "send_message" /* SendMessage */,
    title: "Send Message",
    description: "Send a message to an existing session or chat, starting a new turn there. Provide a session URI from `list_sessions` or an `agent-host-session://` link; a link carrying a chat id targets that specific chat. The message is delivered asynchronously \u2014 this tool does not wait for or return the reply.",
    inputSchema: sendMessageInputSchema,
    annotations: { readOnlyHint: false }
  },
  {
    name: "get_session_context" /* GetSessionContext */,
    title: "Get Session Context",
    description: 'Read the recent conversation of an existing session or chat: a compacted transcript of its turns (messages, replies, and tool calls). Use this to see what a session you created is doing, or to gather context before sending it a message. Returns a compacted summary by default (`detail: "summary"`); request `digest` or `full` for more detail. For session metadata (status, working directory, changes, \u2026) use `list_sessions` with the `session` argument.',
    inputSchema: getSessionContextInputSchema,
    annotations: { readOnlyHint: true }
  },
  {
    name: "delete_session" /* DeleteSession */,
    title: "Delete Session",
    description: "Permanently delete a session (identified by a session URI from `list_sessions`), including its stored data. This cannot be undone. Refuses to delete the current session.",
    inputSchema: deleteSessionInputSchema,
    annotations: { readOnlyHint: false, destructiveHint: true }
  }
];

function currentSessionUri(toolCallChannel) {
  const owning = parseChatUri(toolCallChannel) ?? void 0;
  return URI.parse(owning?.session ?? toolCallChannel);
}

function getRequiredString2(value, field, toolName) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Invalid ${toolName} input: ${field} must be a non-empty string.`);
  }
  return value;
}

function getOptionalString(value, field, toolName) {
  if (value === void 0) {
    return void 0;
  }
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Invalid ${toolName} input: ${field} must be a non-empty string.`);
  }
  return value;
}

function decodeHtmlEntities(value) {
  const namedEntities = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: "\xA0",
    quot: '"'
  };
  return value.replace(/&(?:#(\d+)|#x([\da-f]+)|([a-z]+));/gi, (match2, decimal, hexadecimal, named) => {
    const numeric = decimal ?? hexadecimal;
    if (numeric !== void 0) {
      const codePoint = Number.parseInt(numeric, decimal !== void 0 ? 10 : 16);
      return Number.isSafeInteger(codePoint) && codePoint >= 0 && codePoint <= 1114111 ? String.fromCodePoint(codePoint) : match2;
    }
    return named ? namedEntities[named.toLowerCase()] ?? match2 : match2;
  });
}

function normalizeGeneralChatTitle(title) {
  return decodeHtmlEntities(title).trim().replace(/\s+/g, " ");
}

function normalizeProjectSessionTitle(title) {
  const trimmed = decodeHtmlEntities(title).trim().replace(/^["'`]+|["'`]+$/g, "").trim().replace(/^[.,;:!?\-\u2014]+|[.,;:!?\-\u2014]+$/g, "").trim();
  const humanized = !/\s/.test(trimmed) && /[/_-]/.test(trimmed) ? trimmed.replace(/[/_\-\s]+/g, " ") : trimmed;
  return humanized.replace(/\s+/g, " ").trim();
}

function validateRenameTitle(title, toolName) {
  if (!title.trim()) {
    throw new Error(`Invalid ${toolName} input: title must contain non-whitespace characters.`);
  }
  if (Array.from(title).length > 200) {
    throw new Error(`Invalid ${toolName} input: title must not exceed 200 characters.`);
  }
}

function parseWorkspaceUri(workspace) {
  if (/^(\/|[a-zA-Z]:[\\/]|\\\\)/.test(workspace)) {
    return URI.file(workspace);
  }
  try {
    const parsed = URI.parse(workspace, true);
    return parsed.scheme ? parsed : void 0;
  } catch {
    return void 0;
  }
}

function resolveWorkspace(workspace, sessions) {
  const parsed = parseWorkspaceUri(workspace);
  for (const session of sessions) {
    for (const candidate of [session.project?.uri, ...session.workingDirectories ?? []]) {
      if (candidate && parsed && isEqual2(candidate, parsed)) {
        return candidate;
      }
    }
  }
  const projects = [];
  for (const session of sessions) {
    const project = session.project;
    if (project?.displayName.toLowerCase() === workspace.toLowerCase() && !projects.some((candidate) => isEqual2(candidate.uri, project.uri))) {
      projects.push(project);
    }
  }
  if (projects.length === 1) {
    return projects[0].uri;
  }
  if (projects.length > 1) {
    throw new Error(`Invalid ${"create_session" /* CreateSession */} input: workspace "${workspace}" is ambiguous; use one of these project URIs: ${projects.map((project) => project.uri.toString()).join(", ")}.`);
  }
  if (!parsed) {
    throw new Error(`Invalid ${"create_session" /* CreateSession */} input: workspace must match a unique known project name, project URI, working directory, absolute path, or valid URI string.`);
  }
  return parsed;
}

function resolveModel(modelName, models, provider) {
  if (modelName === void 0) {
    return void 0;
  }
  const availableModels = provider === void 0 ? models : models.filter((candidate) => candidate.provider === provider);
  const idMatches = availableModels.filter((candidate) => candidate.id === modelName);
  const matches = idMatches.length > 0 ? idMatches : availableModels.filter((candidate) => candidate.name === modelName);
  if (matches.length === 0) {
    const providerSuffix = provider === void 0 ? "" : ` for provider "${provider}"`;
    throw new Error(`Invalid ${"create_session" /* CreateSession */} input: model must match an available model id or name${providerSuffix}.`);
  }
  if (matches.length > 1) {
    throw new Error(`Invalid ${"create_session" /* CreateSession */} input: model "${modelName}" is ambiguous; use one of these model ids: ${matches.map((model) => model.id).join(", ")}.`);
  }
  return matches[0];
}

function getCreateSessionRelationship(rawArgs) {
  const args = rawArgs ?? {};
  const relationship = getRequiredString2(args.relationship, "relationship", "create_session" /* CreateSession */);
  if (!createSessionRelationshipValues.includes(relationship)) {
    throw new Error(`Invalid ${"create_session" /* CreateSession */} input: relationship must be "currentSession" or "independent".`);
  }
  return relationship;
}

function getCreateSessionArgs(rawArgs, sessions, models, currentProvider) {
  const args = rawArgs ?? {};
  const relationship = getCreateSessionRelationship(args);
  const prompt = getRequiredString2(args.prompt, "prompt", "create_session" /* CreateSession */);
  const title = getRequiredString2(args.title, "title", "create_session" /* CreateSession */);
  validateRenameTitle(title, "create_session" /* CreateSession */);
  const workspace = getOptionalString(args.workspace, "workspace", "create_session" /* CreateSession */);
  const modelName = getOptionalString(args.model, "model", "create_session" /* CreateSession */);
  const model = resolveModel(modelName, models, relationship === "currentSession" ? currentProvider : void 0);
  if (relationship === "currentSession") {
    if (workspace !== void 0) {
      throw new Error(`Invalid ${"create_session" /* CreateSession */} input: workspace is only valid when relationship is "independent".`);
    }
    return {
      relationship,
      prompt,
      title,
      ...model !== void 0 ? { model } : {}
    };
  }
  return {
    relationship,
    workspace: resolveWorkspace(getRequiredString2(workspace, "workspace", "create_session" /* CreateSession */), sessions),
    prompt,
    title,
    ...model !== void 0 ? { model } : {}
  };
}

function describeSessionStatusBits(status) {
  const names = [];
  if ((status & 24 /* InputNeeded */) === 24 /* InputNeeded */) {
    names.push("inputNeeded");
  } else if (status & 8 /* InProgress */) {
    names.push("inProgress");
  } else if (status & 1 /* Idle */) {
    names.push("idle");
  }
  if (status & 2 /* Error */) {
    names.push("error");
  }
  if (status & 64 /* IsArchived */) {
    names.push("archived");
  }
  return names;
}

function describeSessionStatusNames(session) {
  return session.status !== void 0 ? describeSessionStatusBits(session.status) : [];
}

function describeSessionStatus(session) {
  const names = describeSessionStatusNames(session);
  if (names.length > 0) {
    return names.join(",");
  }
  return session.status !== void 0 ? "unknown" : void 0;
}

function getOptionalBoolean(value, field, toolName) {
  if (value === void 0) {
    return void 0;
  }
  if (typeof value !== "boolean") {
    throw new Error(`Invalid ${toolName} input: ${field} must be a boolean.`);
  }
  return value;
}

function getOptionalTimestamp(value, field, toolName) {
  if (value === void 0) {
    return void 0;
  }
  if (typeof value !== "string") {
    throw new Error(`Invalid ${toolName} input: ${field} must be an ISO-8601 timestamp string.`);
  }
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid ${toolName} input: ${field} must be a valid ISO-8601 timestamp (e.g. 2025-01-31T00:00:00Z).`);
  }
  return parsed;
}

function getListSessionsArgs(rawArgs) {
  const args = rawArgs ?? {};
  let status;
  if (args.status !== void 0) {
    if (!Array.isArray(args.status) || args.status.some((value) => typeof value !== "string")) {
      throw new Error(`Invalid ${"list_sessions" /* ListSessions */} input: status must be an array of status names.`);
    }
    const invalid = args.status.filter((value) => !listSessionsStatusValues.includes(value));
    if (invalid.length > 0) {
      throw new Error(`Invalid ${"list_sessions" /* ListSessions */} input: unknown status value(s) ${invalid.join(", ")}. Valid values: ${listSessionsStatusValues.join(", ")}.`);
    }
    status = new Set(args.status);
  }
  return {
    session: getOptionalString(args.session, "session", "list_sessions" /* ListSessions */),
    status,
    workspace: getOptionalString(args.workspace, "workspace", "list_sessions" /* ListSessions */),
    withChanges: getOptionalBoolean(args.withChanges, "withChanges", "list_sessions" /* ListSessions */),
    unread: getOptionalBoolean(args.unread, "unread", "list_sessions" /* ListSessions */),
    withPullRequest: getOptionalBoolean(args.withPullRequest, "withPullRequest", "list_sessions" /* ListSessions */),
    includeArchived: getOptionalBoolean(args.includeArchived, "includeArchived", "list_sessions" /* ListSessions */),
    createdAfter: getOptionalTimestamp(args.createdAfter, "createdAfter", "list_sessions" /* ListSessions */),
    createdBefore: getOptionalTimestamp(args.createdBefore, "createdBefore", "list_sessions" /* ListSessions */)
  };
}

function sessionHasChanges(session) {
  const changes = session.changes;
  return !!changes && ((changes.files ?? 0) > 0 || (changes.additions ?? 0) > 0 || (changes.deletions ?? 0) > 0);
}

function sessionIsArchived(session) {
  return isSessionStatusArchived(session.status);
}

function sessionIsUnread(session) {
  return session.status !== void 0 && !isSessionStatusRead(session.status);
}

function sessionMatchesWorkspace(session, workspace) {
  if (session.project?.displayName.toLowerCase() === workspace.toLowerCase()) {
    return true;
  }
  const parsed = parseWorkspaceUri(workspace);
  return parsed !== void 0 && [session.project?.uri, ...session.workingDirectories ?? []].some((candidate) => candidate !== void 0 && isEqual2(candidate, parsed));
}

function filterSessions(sessions, args) {
  if (args.session !== void 0) {
    const target = parseOpenSessionLinkUri(args.session)?.toString() ?? args.session;
    return sessions.filter((session) => session.session.toString() === target);
  }
  return sessions.filter((session) => {
    if (args.status) {
      const names = describeSessionStatusNames(session);
      if (!names.some((name) => args.status.has(name))) {
        return false;
      }
    }
    if (args.workspace !== void 0 && !sessionMatchesWorkspace(session, args.workspace)) {
      return false;
    }
    if (args.withChanges && !sessionHasChanges(session)) {
      return false;
    }
    if (args.unread && !sessionIsUnread(session)) {
      return false;
    }
    if (args.withPullRequest && getSessionRelatedPullRequestUrls(readSessionGitHubState(session._meta)).length === 0) {
      return false;
    }
    if (args.includeArchived !== true && !args.status?.has("archived") && sessionIsArchived(session)) {
      return false;
    }
    if (args.createdAfter !== void 0 && session.startTime < args.createdAfter) {
      return false;
    }
    if (args.createdBefore !== void 0 && session.startTime > args.createdBefore) {
      return false;
    }
    return true;
  });
}

function serializeGitState(session) {
  const git = readSessionGitState(session._meta);
  if (!git) {
    return void 0;
  }
  const result = {};
  if (git.branchName !== void 0) {
    result.branch = git.branchName;
  }
  if (git.baseBranchName !== void 0) {
    result.baseBranch = git.baseBranchName;
  }
  if (git.upstreamBranchName !== void 0) {
    result.upstreamBranch = git.upstreamBranchName;
  }
  if (git.outgoingChanges !== void 0) {
    result.ahead = git.outgoingChanges;
  }
  if (git.incomingChanges !== void 0) {
    result.behind = git.incomingChanges;
  }
  if (git.uncommittedChanges !== void 0) {
    result.uncommittedChanges = git.uncommittedChanges;
  }
  return Object.keys(result).length > 0 ? result : void 0;
}

function serializeGitHubState(session) {
  const github = readSessionGitHubState(session._meta);
  if (!github) {
    return void 0;
  }
  const result = {};
  if (github.owner !== void 0) {
    result.owner = github.owner;
  }
  if (github.repo !== void 0) {
    result.repo = github.repo;
  }
  const pullRequestUrl = getSessionRelatedPullRequestUrls(github)[0];
  if (pullRequestUrl !== void 0) {
    result.pullRequestUrl = pullRequestUrl;
  }
  return Object.keys(result).length > 0 ? result : void 0;
}

function serializeSession(session) {
  const git = serializeGitState(session);
  const github = serializeGitHubState(session);
  const status = describeSessionStatus(session);
  return {
    session: session.session.toString(),
    openLink: buildOpenSessionLinkUri(session.session),
    ...session.summary !== void 0 ? { title: session.summary } : {},
    ...status !== void 0 ? { status } : {},
    ...session.activity !== void 0 ? { activity: session.activity } : {},
    ...session.workingDirectories?.[0] !== void 0 ? { workingDirectory: session.workingDirectories[0].toString() } : {},
    ...session.workingDirectories !== void 0 && session.workingDirectories.length > 1 ? { workingDirectories: session.workingDirectories.map((directory) => directory.toString()) } : {},
    ...session.project !== void 0 ? { project: session.project.displayName } : {},
    ...session.project !== void 0 ? { projectUri: session.project.uri.toString() } : {},
    ...sessionIsUnread(session) ? { unread: true } : {},
    ...session.startTime > 0 ? { createdAt: new Date(session.startTime).toISOString() } : {},
    ...session.modifiedTime > 0 ? { modifiedAt: new Date(session.modifiedTime).toISOString() } : {},
    ...session.changes !== void 0 ? { changes: session.changes } : {},
    ...session.changesets !== void 0 ? {
      changesets: session.changesets.map((changeset) => ({
        label: changeset.label,
        changeKind: changeset.changeKind,
        uriTemplate: changeset.uriTemplate,
        ...changeset.description !== void 0 ? { description: changeset.description } : {}
      }))
    } : {},
    ...git !== void 0 ? { git } : {},
    ...github !== void 0 ? { github } : {}
  };
}

function serializeSessions(sessions) {
  return JSON.stringify({ sessions: sessions.map(serializeSession) });
}

async function applyCreateSessionTool(accessor, rawArgs, source, sourceTurnId) {
  const sessions = await accessor.listSessions();
  const currentSession = source ? currentSessionUri(source.toString()) : void 0;
  const currentProvider = currentSession ? AgentSession.provider(currentSession) : void 0;
  const args = getCreateSessionArgs(rawArgs, sessions, accessor.getModels(), currentProvider);
  if (args.relationship === "currentSession") {
    if (!currentSession) {
      throw new Error(`Invalid ${"create_session" /* CreateSession */} input: relationship "currentSession" requires an invoking session.`);
    }
    if (args.model !== void 0 && args.model.provider !== currentProvider) {
      throw new Error(`Invalid ${"create_session" /* CreateSession */} input: model "${args.model.id}" belongs to provider "${args.model.provider}", but relationship "currentSession" targets provider "${currentProvider}".`);
    }
    const result = await createChat(accessor, {
      session: currentSession,
      prompt: args.prompt,
      title: args.title,
      model: args.model
    }, source, sourceTurnId);
    return { relationship: args.relationship, ...result };
  }
  const parentDepth = currentSession ? accessor.getSessionSpawnDepth(currentSession) : 0;
  if (parentDepth >= maxSessionSpawnDepth) {
    throw new Error(`Refusing to create a session: recursion limit reached (max spawn depth ${maxSessionSpawnDepth}). This session was itself created ${parentDepth} level(s) deep.`);
  }
  const defaults = source ? accessor.getCreationDefaults(source) : void 0;
  const provider = args.model?.provider ?? defaults?.provider;
  const inheritsSourceProvider = provider !== void 0 && provider === defaults?.provider;
  const inheritedProviderConfig = inheritsSourceProvider ? defaults?.config : void 0;
  const configValues = inheritedProviderConfig === void 0 && defaults?.isolation === void 0 ? void 0 : {
    ...inheritedProviderConfig,
    ...defaults?.isolation !== void 0 ? { ["isolation" /* Isolation */]: defaults.isolation } : {}
  };
  const config = {
    workingDirectories: args.workspace ? [args.workspace] : void 0,
    ...provider !== void 0 ? { provider } : {},
    ...args.model !== void 0 ? { model: { id: args.model.id } } : defaults?.model !== void 0 ? { model: defaults.model } : {},
    ...configValues !== void 0 ? { config: configValues } : {},
    ...currentSession !== void 0 && source !== void 0 ? {
      _meta: withSessionCreationReference(void 0, {
        session: currentSession.toString(),
        chat: source.toString(),
        ...sourceTurnId !== void 0 ? { turnId: sourceTurnId } : {}
      })
    } : {}
  };
  const session = await accessor.createSession(config);
  accessor.setSessionSpawnDepth(session, parentDepth + 1);
  const chat = URI.parse(buildDefaultChatUri(session));
  await accessor.renameChat(session, chat, args.title);
  await accessor.startPrompt(session, chat, args.prompt, currentSession ? {
    sourceSession: currentSession.toString(),
    sourceChat: source?.toString(),
    ...sourceTurnId !== void 0 ? { sourceTurnId } : {}
  } : void 0);
  return { relationship: args.relationship, session: session.toString(), chat: chat.toString(), openLink: buildOpenSessionLinkUri(session) };
}

function formatCreateSessionResult(result) {
  if (result.relationship === "currentSession") {
    return `Chat created in the current session (${result.openLink}).`;
  }
  return `New session created (${result.openLink}).`;
}

function resolveKnownSession(sessionInput, sessions) {
  const fromLink = parseOpenSessionLinkUri(sessionInput);
  const candidate = fromLink?.toString() ?? sessionInput;
  const match2 = sessions.find((s) => s.session.toString() === candidate);
  return match2?.session;
}

function resolveChatSession(sessionInput, sessions) {
  const session = resolveKnownSession(sessionInput, sessions);
  if (!session) {
    throw new Error(`Invalid ${"create_chat" /* CreateChat */} input: session must match the URI of a known session (see list_sessions).`);
  }
  return session;
}

function getCreateChatArgs(rawArgs, sessions, models, currentSession) {
  const args = rawArgs ?? {};
  const prompt = getRequiredString2(args.prompt, "prompt", "create_chat" /* CreateChat */);
  const title = getOptionalString(args.title, "title", "create_chat" /* CreateChat */);
  if (title !== void 0) {
    validateRenameTitle(title, "create_chat" /* CreateChat */);
  }
  const modelName = getOptionalString(args.model, "model", "create_chat" /* CreateChat */);
  const sessionInput = getOptionalString(args.session, "session", "create_chat" /* CreateChat */);
  let session;
  if (sessionInput !== void 0) {
    session = resolveChatSession(sessionInput, sessions);
  } else if (currentSession) {
    session = currentSession;
  } else {
    throw new Error(`Invalid ${"create_chat" /* CreateChat */} input: no session provided and the current session could not be determined.`);
  }
  const model = resolveModel(modelName, models, AgentSession.provider(session));
  return { session, prompt, ...title !== void 0 ? { title } : {}, ...model !== void 0 ? { model } : {} };
}

async function createChat(accessor, args, source, sourceTurnId) {
  const currentSession = source ? currentSessionUri(source.toString()) : void 0;
  const defaults = source ? accessor.getCreationDefaults(source) : void 0;
  const targetProvider = AgentSession.provider(args.session);
  const model = args.model !== void 0 ? { id: args.model.id } : targetProvider === defaults?.provider ? defaults?.model : void 0;
  const chatId = generateUuid();
  const chat = URI.parse(buildChatUri(args.session.toString(), chatId));
  await accessor.createChat(args.session, chat, { title: args.title, model });
  if (args.title !== void 0) {
    await accessor.renameChat(args.session, chat, args.title);
  }
  await accessor.startPrompt(args.session, chat, args.prompt, currentSession ? {
    sourceSession: currentSession.toString(),
    sourceChat: source?.toString(),
    ...sourceTurnId !== void 0 ? { sourceTurnId } : {}
  } : void 0);
  return { session: args.session.toString(), chat: chat.toString(), openLink: buildOpenSessionLinkUri(args.session, chatId) };
}

async function applyCreateChatTool(accessor, rawArgs, source, sourceTurnId) {
  const sessions = await accessor.listSessions();
  const currentSession = source ? currentSessionUri(source.toString()) : void 0;
  return createChat(accessor, getCreateChatArgs(rawArgs, sessions, accessor.getModels(), currentSession), source, sourceTurnId);
}

function formatCreateChatResult(result) {
  return `Chat created (${result.openLink}).`;
}

function currentChatUri(toolCallChannel) {
  if (!toolCallChannel) {
    return void 0;
  }
  const parsed = parseChatUri(toolCallChannel);
  if (!parsed) {
    return void 0;
  }
  return URI.parse(toolCallChannel);
}

function normalizeRenameChatTitle(requestedTitle, sessions, session, chat) {
  const metadata = sessions.find((candidate) => candidate.session.toString() === session.toString());
  const title = isDefaultChatUri(chat) && metadata?.workingDirectories?.length ? normalizeProjectSessionTitle(requestedTitle) : normalizeGeneralChatTitle(requestedTitle);
  if (!title) {
    throw new Error(`Invalid ${"rename_chat" /* RenameChat */} input: title must contain non-whitespace characters.`);
  }
  validateRenameTitle(title, "rename_chat" /* RenameChat */);
  return title;
}

function getRenameChatArgs(rawArgs, sessions, currentChannel) {
  const args = rawArgs ?? {};
  const requestedTitle = getRequiredString2(args.title, "title", "rename_chat" /* RenameChat */);
  const sessionInput = getOptionalString(args.session, "session", "rename_chat" /* RenameChat */);
  const chatInput = getOptionalString(args.chat, "chat", "rename_chat" /* RenameChat */);
  if (chatInput !== void 0) {
    const session2 = resolveKnownSession(chatInput, sessions);
    const chatId = parseOpenSessionLinkChatId(chatInput);
    if (!session2) {
      throw new Error(`Invalid ${"rename_chat" /* RenameChat */} input: chat must be an agent-host-session:// link targeting a known chat.`);
    }
    if (sessionInput !== void 0) {
      const explicitSession = resolveKnownSession(sessionInput, sessions);
      if (!explicitSession) {
        throw new Error(`Invalid ${"rename_chat" /* RenameChat */} input: session must match the URI of a known session (see list_sessions).`);
      }
      if (explicitSession.toString() !== session2.toString()) {
        throw new Error(`Invalid ${"rename_chat" /* RenameChat */} input: session must match the owning session of chat.`);
      }
    }
    const chat = URI.parse(chatId ? buildChatUri(session2.toString(), chatId) : buildDefaultChatUri(session2.toString()));
    const parsed2 = parseChatUri(chat);
    if (!parsed2) {
      throw new Error(`Invalid ${"rename_chat" /* RenameChat */} input: chat must target a known chat.`);
    }
    const title2 = normalizeRenameChatTitle(requestedTitle, sessions, session2, chat);
    return { session: session2, chat, title: title2, chatId: parsed2.chatId };
  }
  const currentChat = currentChatUri(currentChannel);
  if (!currentChat || !currentChannel) {
    throw new Error(`Invalid ${"rename_chat" /* RenameChat */} input: chat must target a known chat, or the tool must run inside that chat.`);
  }
  const session = currentSessionUri(currentChannel);
  if (sessionInput !== void 0) {
    const explicitSession = resolveKnownSession(sessionInput, sessions);
    if (!explicitSession) {
      throw new Error(`Invalid ${"rename_chat" /* RenameChat */} input: session must match the URI of a known session (see list_sessions).`);
    }
    if (explicitSession.toString() !== session.toString()) {
      throw new Error(`Invalid ${"rename_chat" /* RenameChat */} input: session must match the current chat's owning session.`);
    }
  }
  const parsed = parseChatUri(currentChat.toString());
  if (!parsed) {
    throw new Error(`Invalid ${"rename_chat" /* RenameChat */} input: current channel is not a chat.`);
  }
  const title = normalizeRenameChatTitle(requestedTitle, sessions, session, currentChat);
  return { session, chat: currentChat, title, chatId: parsed.chatId };
}

function getRenameChatSession(rawArgs, currentChannel) {
  const args = rawArgs ?? {};
  const chatInput = getOptionalString(args.chat, "chat", "rename_chat" /* RenameChat */);
  if (chatInput !== void 0) {
    const session = parseOpenSessionLinkUri(chatInput);
    if (!session) {
      throw new Error(`Invalid ${"rename_chat" /* RenameChat */} input: chat must be an agent-host-session:// link targeting a known chat.`);
    }
    return session;
  }
  if (!currentChannel || !currentChatUri(currentChannel)) {
    throw new Error(`Invalid ${"rename_chat" /* RenameChat */} input: chat must target a known chat, or the tool must run inside that chat.`);
  }
  return currentSessionUri(currentChannel);
}

async function applyRenameChatTool(accessor, rawArgs, currentChannel) {
  const args = rawArgs ?? {};
  const isAutomaticTitleRename = getOptionalBoolean(args.automatic, "automatic", "rename_chat" /* RenameChat */) === true;
  const rename2 = async () => {
    const targetSession = getRenameChatSession(rawArgs, currentChannel);
    const metadata = await accessor.getSession(targetSession);
    const { session, chat, title } = getRenameChatArgs(rawArgs, metadata ? [metadata] : [], currentChannel);
    return accessor.renameChat(session, chat, title);
  };
  if (isAutomaticTitleRename) {
    void rename2().catch((error) => accessor.reportToolError("rename_chat" /* RenameChat */, error));
    return "Renaming chat.";
  }
  const result = await rename2();
  return `Renamed chat to "${result.title}".`;
}

function getSendMessageArgs(rawArgs, sessions) {
  const args = rawArgs ?? {};
  const message = getRequiredString2(args.message, "message", "send_message" /* SendMessage */);
  const sessionInput = getRequiredString2(args.session, "session", "send_message" /* SendMessage */);
  const session = resolveKnownSession(sessionInput, sessions);
  if (!session) {
    throw new Error(`Invalid ${"send_message" /* SendMessage */} input: session must match the URI of a known session (see list_sessions).`);
  }
  const chatId = parseOpenSessionLinkChatId(sessionInput);
  const chat = URI.parse(chatId ? buildChatUri(session.toString(), chatId) : buildDefaultChatUri(session.toString()));
  return { session, chat, message, ...chatId !== void 0 ? { chatId } : {} };
}

async function applySendMessageTool(accessor, rawArgs, currentChannel, sourceTurnId) {
  const sessions = await accessor.listSessions();
  const { session, chat, chatId, message } = getSendMessageArgs(rawArgs, sessions);
  if (currentChannel && chat.toString() === URI.parse(currentChannel).toString()) {
    throw new Error(`Invalid ${"send_message" /* SendMessage */} input: refusing to send a message to the current chat.`);
  }
  const sourceChat = currentChannel ? URI.parse(currentChannel) : void 0;
  const sourceSession = sourceChat ? currentSessionUri(sourceChat.toString()) : void 0;
  await accessor.startPrompt(session, chat, message, sourceSession ? {
    sourceSession: sourceSession.toString(),
    sourceChat: sourceChat?.toString(),
    ...sourceTurnId !== void 0 ? { sourceTurnId } : {}
  } : void 0);
  return formatSendMessageResult(buildOpenSessionLinkUri(session, chatId));
}

function formatSendMessageResult(openLink) {
  return `Message sent (${openLink}).`;
}

var defaultTranscriptLimit = 10;

var maxTranscriptLimit = 50;

var contextCaps = {
  // `summary` still carries a short assistant gist per turn so the reader sees
  // what each turn actually did, not just what was asked.
  summary: { user: 160, assistant: 140, toolInput: 0 },
  digest: { user: 300, assistant: 800, toolInput: 0 },
  full: { user: 1e3, assistant: 2e3, toolInput: 200 }
};

function getSessionContextArgs(rawArgs, sessions) {
  const args = rawArgs ?? {};
  const sessionInput = getRequiredString2(args.session, "session", "get_session_context" /* GetSessionContext */);
  const session = resolveKnownSession(sessionInput, sessions);
  if (!session) {
    throw new Error(`Invalid ${"get_session_context" /* GetSessionContext */} input: session must match the URI of a known session (see list_sessions).`);
  }
  let detail = "summary";
  if (args.detail !== void 0) {
    if (typeof args.detail !== "string" || !sessionContextDetailValues.includes(args.detail)) {
      throw new Error(`Invalid ${"get_session_context" /* GetSessionContext */} input: detail must be one of ${sessionContextDetailValues.join(", ")}.`);
    }
    detail = args.detail;
  }
  let transcriptLimit = defaultTranscriptLimit;
  if (args.transcriptLimit !== void 0) {
    if (typeof args.transcriptLimit !== "number" || !Number.isFinite(args.transcriptLimit) || args.transcriptLimit < 1) {
      throw new Error(`Invalid ${"get_session_context" /* GetSessionContext */} input: transcriptLimit must be a positive number.`);
    }
    transcriptLimit = Math.min(Math.floor(args.transcriptLimit), maxTranscriptLimit);
  }
  const chatId = parseOpenSessionLinkChatId(sessionInput);
  return { session, detail, transcriptLimit, ...chatId !== void 0 ? { chatId } : {} };
}

function truncateText(text, max) {
  const trimmed = text.trim();
  if (trimmed.length <= max) {
    return { text: trimmed, truncated: false };
  }
  return { text: `${trimmed.slice(0, Math.max(0, max - 1))}\u2026`, truncated: true };
}

function toolCallsOf(parts) {
  return parts.filter((p) => p.kind === "toolCall" /* ToolCall */).map((p) => p.toolCall);
}

function assistantTextOf(parts) {
  return parts.filter((p) => p.kind === "markdown" /* Markdown */).map((p) => p.content).join("").trim();
}

function describeTurnState(state) {
  switch (state) {
    case "complete" /* Complete */:
      return "complete";
    case "cancelled" /* Cancelled */:
      return "cancelled";
    case "error" /* Error */:
      return "error";
    default:
      return "inProgress";
  }
}

function serializeSessionContext(session, chatId, snapshot, detail, transcriptLimit) {
  const caps = contextCaps[detail];
  let truncated = false;
  const trunc = (text, max) => {
    if (max <= 0 || !text) {
      return void 0;
    }
    const result = truncateText(text, max);
    truncated = truncated || result.truncated;
    return result.text || void 0;
  };
  const entries = snapshot.turns.map((t) => ({ message: t.message, parts: t.responseParts, state: t.state }));
  if (snapshot.activeTurn) {
    entries.push({ message: snapshot.activeTurn.message, parts: snapshot.activeTurn.responseParts, state: "inProgress" });
  }
  if (entries.length > transcriptLimit) {
    truncated = true;
  }
  const windowStart = Math.max(0, entries.length - transcriptLimit);
  const windowed = entries.slice(windowStart);
  const transcript = windowed.map((entry, index) => {
    const user = trunc(entry.message.text, caps.user);
    const assistant = trunc(assistantTextOf(entry.parts), caps.assistant);
    const toolCalls = toolCallsOf(entry.parts);
    let serializedToolCalls;
    if (detail !== "summary" && toolCalls.length > 0) {
      serializedToolCalls = toolCalls.map((tc) => {
        if (caps.toolInput > 0) {
          const input = trunc(tc.status === "streaming" /* Streaming */ ? "" : getInlineToolInput(tc.toolInput) ?? "", caps.toolInput);
          return input !== void 0 ? { name: tc.toolName, input } : { name: tc.toolName };
        }
        return tc.toolName;
      });
    }
    return {
      turn: windowStart + index + 1,
      state: describeTurnState(entry.state),
      ...user !== void 0 ? { user } : {},
      ...assistant !== void 0 ? { assistant } : {},
      ...serializedToolCalls ? { toolCalls: serializedToolCalls } : {}
    };
  });
  const payload = {
    session: session.toString(),
    openLink: buildOpenSessionLinkUri(session, chatId),
    detail,
    transcript,
    hasMoreHistory: snapshot.hasMoreHistory,
    truncated
  };
  return JSON.stringify(payload);
}

async function applyGetSessionContextTool(accessor, rawArgs) {
  const sessions = await accessor.listSessions();
  const { session, chatId, detail, transcriptLimit } = getSessionContextArgs(rawArgs, sessions);
  const snapshot = await accessor.getChatContext(session, chatId);
  if (!snapshot) {
    return JSON.stringify({
      session: session.toString(),
      openLink: buildOpenSessionLinkUri(session, chatId),
      detail,
      transcript: [],
      hasMoreHistory: false,
      truncated: false
    });
  }
  return serializeSessionContext(session, chatId, snapshot, detail, transcriptLimit);
}

function serializeCurrentSession(currentSession, sessions) {
  const meta = sessions.find((s) => s.session.toString() === currentSession.toString());
  return JSON.stringify({
    session: currentSession.toString(),
    openLink: buildOpenSessionLinkUri(currentSession),
    ...meta ? serializeSession(meta) : {}
  });
}

function getDeleteSessionArgs(rawArgs, sessions, currentSession) {
  const args = rawArgs ?? {};
  const sessionInput = getRequiredString2(args.session, "session", "delete_session" /* DeleteSession */);
  const session = resolveKnownSession(sessionInput, sessions);
  if (!session) {
    throw new Error(`Invalid ${"delete_session" /* DeleteSession */} input: session must match the URI of a known session (see list_sessions).`);
  }
  if (currentSession && session.toString() === currentSession.toString()) {
    throw new Error(`Invalid ${"delete_session" /* DeleteSession */} input: refusing to delete the current session.`);
  }
  return session;
}

async function applyDeleteSessionTool(accessor, rawArgs, currentSession) {
  const sessions = await accessor.listSessions();
  const session = getDeleteSessionArgs(rawArgs, sessions, currentSession);
  await accessor.deleteSession(session);
  return `Deleted session ${session.toString()}. Reply with one short sentence confirming the session was deleted.`;
}

function getSessionToolDisplay(toolName, args, _result) {
  switch (toolName) {
    case "list_sessions" /* ListSessions */:
      return {
        displayName: localize(2683, null),
        invocationMessage: localize(2673, null)
      };
    case "create_session" /* CreateSession */:
      if (args?.relationship === "currentSession") {
        return {
          displayName: localize(2677, null),
          invocationMessage: localize(2667, null),
          pastTenseMessage: localize(2661, null)
        };
      }
      if (args?.relationship === "independent") {
        return {
          displayName: localize(2678, null),
          invocationMessage: localize(2668, null),
          pastTenseMessage: localize(2662, null)
        };
      }
      return {
        displayName: localize(2679, null),
        invocationMessage: localize(2669, null),
        pastTenseMessage: localize(2663, null)
      };
    case "create_chat" /* CreateChat */:
      return {
        displayName: localize(2676, null),
        invocationMessage: localize(2666, null)
      };
    case "rename_chat" /* RenameChat */:
      return {
        displayName: localize(2684, null),
        invocationMessage: localize(2674, null),
        pastTenseMessage: localize(2665, null)
      };
    case "send_message" /* SendMessage */:
      return {
        displayName: localize(2685, null),
        invocationMessage: localize(2675, null)
      };
    case "get_session_context" /* GetSessionContext */:
      return {
        displayName: localize(2682, null),
        invocationMessage: localize(2672, null)
      };
    case "get_current_session" /* GetCurrentSession */:
      return {
        displayName: localize(2681, null),
        invocationMessage: localize(2671, null)
      };
    case "delete_session" /* DeleteSession */:
      return {
        displayName: localize(2680, null),
        invocationMessage: localize(2670, null),
        pastTenseMessage: localize(2664, null)
      };
    default:
      return void 0;
  }
}

function createSessionServerToolGroup(accessor) {
  let createdSessionCount = 0;
  let createdChatCount = 0;
  let sentMessageCount = 0;
  const group = {
    definitions: sessionServerToolDefinitions,
    // Remove after 2026-10-26; self-mapped because its arguments differ from create_session.
    legacyToolNames: /* @__PURE__ */ new Map([["create_chat" /* CreateChat */, "create_chat" /* CreateChat */]]),
    materializeDefinitions: true,
    isEnabled(toolName) {
      return toolName !== "rename_chat" /* RenameChat */ || accessor?.isActiveAgentTitleGenerationEnabled() !== false;
    },
    canRequireConfirmation(toolName) {
      return sessionToolRequiresConfirmation(toolName);
    },
    getDisplay(toolName, args, result) {
      return getSessionToolDisplay(toolName, args, result);
    },
    async execute(_stateManager, context, toolName, rawArgs) {
      if (!accessor) {
        throw new Error(`Session server tool "${toolName}" cannot run: the group was built without a session accessor.`);
      }
      const currentChannel = context.chatUri;
      switch (toolName) {
        case "list_sessions" /* ListSessions */: {
          return serializeSessions(filterSessions(await accessor.listSessions(), getListSessionsArgs(rawArgs)));
        }
        case "get_current_session" /* GetCurrentSession */:
          return serializeCurrentSession(currentSessionUri(currentChannel), await accessor.listSessions());
        case "create_session" /* CreateSession */: {
          const relationship = getCreateSessionRelationship(rawArgs);
          if (relationship === "currentSession" && createdChatCount >= maxCreatedChats) {
            throw new Error(`Refusing to create more than ${maxCreatedChats} chats from server tools in this process.`);
          }
          if (relationship === "independent" && createdSessionCount >= maxCreatedSessions) {
            throw new Error(`Refusing to create more than ${maxCreatedSessions} sessions from server tools in this process.`);
          }
          const result = await applyCreateSessionTool(accessor, rawArgs, URI.parse(currentChannel), context.turnId);
          if (relationship === "currentSession") {
            createdChatCount++;
          } else {
            createdSessionCount++;
          }
          return formatCreateSessionResult(result);
        }
        case "create_chat" /* CreateChat */: {
          if (createdChatCount >= maxCreatedChats) {
            throw new Error(`Refusing to create more than ${maxCreatedChats} chats from server tools in this process.`);
          }
          const result = await applyCreateChatTool(accessor, rawArgs, URI.parse(currentChannel), context.turnId);
          createdChatCount++;
          return formatCreateChatResult(result);
        }
        case "rename_chat" /* RenameChat */:
          return applyRenameChatTool(accessor, rawArgs, currentChannel);
        case "send_message" /* SendMessage */: {
          if (sentMessageCount >= maxSentMessages) {
            throw new Error(`Refusing to send more than ${maxSentMessages} messages from server tools in this process.`);
          }
          const result = await applySendMessageTool(accessor, rawArgs, currentChannel, context.turnId);
          sentMessageCount++;
          return result;
        }
        case "get_session_context" /* GetSessionContext */:
          return applyGetSessionContextTool(accessor, rawArgs);
        case "delete_session" /* DeleteSession */:
          return applyDeleteSessionTool(accessor, rawArgs, currentSessionUri(currentChannel));
        default:
          throw new Error(`Unknown session server tool: ${toolName}`);
      }
    }
  };
  return group;
}
export { sessionToolRequiresConfirmation, currentSessionUri, getRequiredString2, getOptionalString, decodeHtmlEntities, normalizeGeneralChatTitle, normalizeProjectSessionTitle, validateRenameTitle, parseWorkspaceUri, resolveWorkspace, resolveModel, getCreateSessionRelationship, getCreateSessionArgs, describeSessionStatusBits, describeSessionStatusNames, describeSessionStatus, getOptionalBoolean, getOptionalTimestamp, getListSessionsArgs, sessionHasChanges, sessionIsArchived, sessionIsUnread, sessionMatchesWorkspace, filterSessions, serializeGitState, serializeGitHubState, serializeSession, serializeSessions, applyCreateSessionTool, formatCreateSessionResult, resolveKnownSession, resolveChatSession, getCreateChatArgs, createChat, applyCreateChatTool, formatCreateChatResult, currentChatUri, normalizeRenameChatTitle, getRenameChatArgs, getRenameChatSession, applyRenameChatTool, getSendMessageArgs, applySendMessageTool, formatSendMessageResult, getSessionContextArgs, truncateText, toolCallsOf, assistantTextOf, describeTurnState, serializeSessionContext, applyGetSessionContextTool, serializeCurrentSession, getDeleteSessionArgs, applyDeleteSessionTool, getSessionToolDisplay, createSessionServerToolGroup, maxSessionSpawnDepth, maxCreatedSessions, maxCreatedChats, maxSentMessages, sessionConfirmationToolNames, createSessionRelationshipValues, listSessionsStatusValues, listSessionsInputSchema, createSessionInputSchema, getCurrentSessionInputSchema, renameChatInputSchema, deleteSessionInputSchema, sendMessageInputSchema, sessionContextDetailValues, getSessionContextInputSchema, sessionServerToolDefinitions, defaultTranscriptLimit, maxTranscriptLimit, contextCaps };
