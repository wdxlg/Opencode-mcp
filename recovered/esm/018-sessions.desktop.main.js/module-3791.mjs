// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/automations/browser/automationTools.ts
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { CHAT_AUTOMATIONS_ENABLED_SETTING, ChatAutomationsEnabledContext } from "./module-2638.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { ILanguageModelToolsService, ToolDataSource } from "./module-0991.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ConfigureAutomationToolReferenceName, IAutomationService, serializeAutomationEditableState } from "./module-2218.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { IAutomationRunner } from "./module-2636.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { Disposable } from "./module-0012.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/sessions/contrib/automations/browser/automationTools.ts
var ListAutomationsToolId = "vscode_listAutomations";

var ConfigureAutomationToolId = "vscode_configureAutomation";

var RunAutomationToolId = "vscode_runAutomation";

var DeleteAutomationToolId = "vscode_deleteAutomation";

var automationToolWhen = ContextKeyExpr.and(ChatContextKeys.enabled, ChatAutomationsEnabledContext);

var deleteAutomationConfirmationId = "delete";

var manualRunLeaderWindowId = 0;

var automationIntervals = ["manual", "hourly", "daily", "weekly"];

var automationIsolationKinds = ["default", "folder", "worktree"];

var chatModes = ["agent" /* Agent */, "ask" /* Ask */, "edit" /* Edit */];

var chatPermissionLevels2 = ["default" /* Default */, "assisted" /* Assisted */, "autoApprove" /* AutoApprove */, "autopilot" /* Autopilot */];

var AutomationToolInputError = class extends Error {
};

var AutomationToolMutationBlockedError = class extends Error {
  constructor(result) {
    super("Automation mutation blocked");
    this.result = result;
  }
};

var ListAutomationsTool = class {
  constructor(automationService, configurationService) {
    this.automationService = automationService;
    this.configurationService = configurationService;
  }
  getToolData() {
    return {
      id: ListAutomationsToolId,
      toolReferenceName: "listAutomations",
      canBeReferencedInPrompt: false,
      icon: Codicon.calendar,
      displayName: localize(4230, null),
      userDescription: localize(4235, null),
      modelDescription: "List all configured scheduled automations and their stable IDs, editable fields, targets, and timing metadata. Use this before configureAutomation, runAutomation, or deleteAutomation when acting on an existing automation. This tool never changes automation state.",
      source: ToolDataSource.Internal,
      when: automationToolWhen,
      runsInWorkspace: false,
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false
      }
    };
  }
  async prepareToolInvocation(_context, _token) {
    return {
      invocationMessage: localize(4231, null),
      pastTenseMessage: localize(4232, null)
    };
  }
  async invoke(_invocation, _countTokens, _progress, _token) {
    if (!isAutomationsEnabled(this.configurationService)) {
      return automationToolError("Automations are disabled.");
    }
    const automations = this.automationService.automations.get().map(toAutomationToolOutput);
    const result = automationToolResult(JSON.stringify({ automations }, void 0, 2));
    result.toolResultMessage = automations.length === 1 ? localize(4234, null) : localize(4233, null, automations.length);
    return result;
  }
};

ListAutomationsTool = __decorateClass([
  __decorateParam(0, IAutomationService),
  __decorateParam(1, IConfigurationService)
], ListAutomationsTool);

var RunAutomationTool = class {
  constructor(automationService, automationRunner, configurationService) {
    this.automationService = automationService;
    this.automationRunner = automationRunner;
    this.configurationService = configurationService;
  }
  getToolData() {
    return {
      id: RunAutomationToolId,
      toolReferenceName: "runAutomation",
      canBeReferencedInPrompt: false,
      icon: Codicon.play,
      displayName: localize(4241, null),
      userDescription: localize(4245, null),
      modelDescription: "Run a configured automation immediately by stable ID. Call listAutomations first to obtain the current ID. This starts a fresh agent session in the background using the saved prompt, target, model, mode, and permission level, even when scheduled runs are disabled. The tool returns after session dispatch commits; do not run it again unless the user asks.",
      source: ToolDataSource.Internal,
      when: automationToolWhen,
      runsInWorkspace: false,
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          automationId: {
            type: "string",
            description: "Stable automation ID from listAutomations."
          }
        },
        required: ["automationId"]
      }
    };
  }
  async prepareToolInvocation(context2, _token) {
    if (!isAutomationsEnabled(this.configurationService)) {
      throw new AutomationToolInputError("Automations are disabled.");
    }
    const automation = resolveAutomationInput(this.automationService, context2.parameters, "runAutomation");
    const activeRun = this.automationService.getActiveRunFor(automation.id);
    if (activeRun) {
      return {
        invocationMessage: localize(4236, null, automation.name),
        pastTenseMessage: localize(4246, null, automation.name)
      };
    }
    return {
      invocationMessage: localize(4242, null, automation.name),
      pastTenseMessage: localize(4243, null, automation.name),
      confirmationMessages: {
        title: localize(4240, null),
        message: new MarkdownString(localize(
          4239,
          null,
          automation.name,
          automation.id
        ))
      }
    };
  }
  async invoke(invocation, _countTokens, _progress, token) {
    if (!isAutomationsEnabled(this.configurationService)) {
      return automationToolError("Automations are disabled.");
    }
    if (token.isCancellationRequested) {
      return automationRunCancelled();
    }
    let automation;
    try {
      automation = resolveAutomationInput(this.automationService, invocation.parameters, "runAutomation");
    } catch (error) {
      if (error instanceof AutomationToolInputError) {
        return automationToolError(error.message);
      }
      throw error;
    }
    const dispatchCancellation = new CancellationTokenSource(token);
    const operation = this.automationRunner.runOnce(automation, "manual", manualRunLeaderWindowId, dispatchCancellation.token);
    let dispatch;
    try {
      dispatch = await operation.whenDispatched;
    } finally {
      dispatchCancellation.dispose();
    }
    if (dispatch.kind === "alreadyRunning") {
      return automationAlreadyRunning(automation, dispatch.activeRun);
    }
    if (dispatch.kind === "notStarted") {
      return automationNotStarted(automation, dispatch);
    }
    const result = automationToolResult(JSON.stringify({
      status: "started",
      automation: { id: automation.id, name: automation.name },
      run: {
        id: dispatch.run.id,
        status: dispatch.run.status,
        sessionResource: dispatch.sessionResource.toString()
      }
    }, void 0, 2));
    result.toolResultMessage = localize(4244, null, automation.name);
    return result;
  }
};

RunAutomationTool = __decorateClass([
  __decorateParam(0, IAutomationService),
  __decorateParam(1, IAutomationRunner),
  __decorateParam(2, IConfigurationService)
], RunAutomationTool);

var DeleteAutomationTool = class {
  constructor(automationService, configurationService) {
    this.automationService = automationService;
    this.configurationService = configurationService;
  }
  getToolData() {
    return {
      id: DeleteAutomationToolId,
      toolReferenceName: "deleteAutomation",
      canBeReferencedInPrompt: false,
      icon: Codicon.trash,
      displayName: localize(4225, null),
      userDescription: localize(4228, null),
      modelDescription: "Delete an automation by stable ID. Call listAutomations first to obtain the current ID. The current approval policy may approve the action automatically; otherwise the user is shown a Delete/Cancel confirmation.",
      source: ToolDataSource.Internal,
      when: automationToolWhen,
      runsInWorkspace: false,
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          automationId: {
            type: "string",
            description: "Stable automation ID from listAutomations."
          }
        },
        required: ["automationId"]
      }
    };
  }
  async prepareToolInvocation(context2, _token) {
    if (!isAutomationsEnabled(this.configurationService)) {
      throw new AutomationToolInputError("Automations are disabled.");
    }
    const automation = resolveAutomationInput(this.automationService, context2.parameters, "deleteAutomation");
    return {
      invocationMessage: localize(4226, null, automation.name),
      pastTenseMessage: localize(4227, null, automation.name),
      confirmationMessages: {
        title: localize(4223, null),
        message: new MarkdownString(localize(
          4222,
          null,
          automation.name,
          automation.id
        )),
        customOptions: [
          { id: deleteAutomationConfirmationId, label: localize(4221, null), kind: "approve" /* Approve */ },
          { id: "cancel", label: localize(4219, null), kind: "deny" /* Deny */ }
        ]
      }
    };
  }
  async invoke(invocation, _countTokens, _progress, token) {
    if (!isAutomationsEnabled(this.configurationService)) {
      return automationToolError("Automations are disabled.");
    }
    if (token.isCancellationRequested) {
      return automationDeleteCancelled();
    }
    let automation;
    try {
      automation = resolveAutomationInput(this.automationService, invocation.parameters, "deleteAutomation");
    } catch (error) {
      if (error instanceof AutomationToolInputError) {
        return automationToolError(error.message);
      }
      throw error;
    }
    if (invocation.selectedCustomButton !== void 0 && invocation.selectedCustomButton !== deleteAutomationConfirmationId) {
      return automationDeleteCancelled();
    }
    try {
      await this.automationService.deleteAutomation(automation.id, this.createMutationGuard(token));
    } catch (error) {
      if (error instanceof AutomationToolMutationBlockedError) {
        return error.result;
      }
      throw error;
    }
    const result = automationToolResult(JSON.stringify({
      status: "deleted",
      automation: { id: automation.id, name: automation.name }
    }));
    result.toolResultMessage = localize(4224, null, automation.name);
    return result;
  }
  createMutationGuard(token) {
    return () => {
      if (!isAutomationsEnabled(this.configurationService)) {
        throw new AutomationToolMutationBlockedError(automationToolError("Automations are disabled."));
      }
      if (token.isCancellationRequested) {
        throw new AutomationToolMutationBlockedError(automationDeleteCancelled());
      }
    };
  }
};

DeleteAutomationTool = __decorateClass([
  __decorateParam(0, IAutomationService),
  __decorateParam(1, IConfigurationService)
], DeleteAutomationTool);

var ConfigureAutomationTool = class {
  constructor(automationService, sessionsManagementService, configurationService) {
    this.automationService = automationService;
    this.sessionsManagementService = sessionsManagementService;
    this.configurationService = configurationService;
  }
  getToolData() {
    return {
      id: ConfigureAutomationToolId,
      toolReferenceName: ConfigureAutomationToolReferenceName,
      canBeReferencedInPrompt: false,
      icon: Codicon.calendar,
      displayName: localize(4212, null),
      userDescription: localize(4218, null),
      modelDescription: `Create or update a persistent scheduled automation.

Create a new automation only when the user explicitly asks for an automation, or for a prompt to run on a recurring schedule. Do not infer that intent from requests merely to monitor, watch, follow, or keep something (such as a pull request) green.

Omit "automationId" to create an automation; "name", "prompt", and "schedule.interval" are then required. If "target" is omitted, the automation targets the current Agents window session. Include "automationId" to update an existing automation, and only provide fields that should change. Call listAutomations first to obtain the stable ID and current values.

The change uses the current tool-approval policy. When approval is required, the user sees a normal tool confirmation. If the user cancels or denies the request, do not retry unless they ask you to.`,
      source: ToolDataSource.Internal,
      when: automationToolWhen,
      runsInWorkspace: false,
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          automationId: {
            type: "string",
            description: "Stable automation ID from listAutomations. Omit to create a new automation."
          },
          name: {
            type: "string",
            description: "Automation name. Required when creating."
          },
          prompt: {
            type: "string",
            description: "Prompt sent when the automation runs. Required when creating."
          },
          schedule: {
            type: "object",
            additionalProperties: false,
            description: "Schedule proposal. Required when creating. Omitted fields preserve existing values when updating; create defaults are 09:00 Monday.",
            properties: {
              interval: {
                type: "string",
                enum: [...automationIntervals],
                description: "manual, hourly, daily, or weekly."
              },
              scheduleHour: {
                type: "integer",
                minimum: 0,
                maximum: 23,
                description: "Local hour, used for daily and weekly schedules."
              },
              scheduleMinute: {
                type: "integer",
                minimum: 0,
                maximum: 59,
                description: "Local minute, used for daily and weekly schedules."
              },
              scheduleDay: {
                type: "integer",
                minimum: 0,
                maximum: 6,
                description: "Day of week for weekly schedules: 0 is Sunday and 6 is Saturday."
              }
            }
          },
          target: {
            type: "object",
            additionalProperties: false,
            description: "Run target. Omit when creating to use the current session, or omit when updating to preserve the existing target.",
            properties: {
              kind: {
                type: "string",
                enum: ["currentSession", "workspace", "quickChat"]
              },
              folderUri: {
                type: "string",
                description: "Full workspace URI for a workspace target."
              },
              providerId: {
                type: "string",
                description: "Sessions provider ID."
              },
              sessionTypeId: {
                type: "string",
                description: "Sessions provider session-type ID."
              },
              isolation: {
                type: "string",
                enum: [...automationIsolationKinds],
                description: "Workspace isolation: default, folder, or worktree."
              },
              branch: {
                type: "string",
                description: "Base branch, required for worktree isolation."
              }
            },
            required: ["kind"]
          },
          modelId: {
            type: ["string", "null"],
            description: "Language model ID, or null to use the provider default."
          },
          mode: {
            enum: [...chatModes, null],
            description: "Chat mode, or null to use the provider default."
          },
          permissionLevel: {
            enum: [...chatPermissionLevels2, null],
            description: "Permission level, or null to use the provider default."
          },
          enabled: {
            type: "boolean",
            description: "Whether scheduled runs are enabled. Defaults to true when creating."
          }
        }
      }
    };
  }
  async prepareToolInvocation(context2, _token) {
    if (!isAutomationsEnabled(this.configurationService)) {
      throw new AutomationToolInputError("Automations are disabled.");
    }
    const proposal = this.parseProposal(context2.parameters, context2.chatSessionResource);
    const isUpdate = proposal.kind === "update";
    return {
      invocationMessage: isUpdate ? localize(4215, null) : localize(4209, null),
      pastTenseMessage: isUpdate ? localize(4216, null) : localize(4210, null),
      confirmationMessages: {
        title: isUpdate ? localize(4214, null) : localize(4208, null),
        message: isUpdate ? new MarkdownString(localize(
          4213,
          null,
          proposal.existing.name,
          proposal.existing.id
        )) : new MarkdownString(localize(
          4207,
          null,
          proposal.initialValues.name
        ))
      },
      toolSpecificData: proposal.kind === "update" ? {
        kind: "automationConfiguration",
        expectedAutomationId: proposal.existing.id,
        expectedEditableState: serializeAutomationEditableState(proposal.existing)
      } : void 0
    };
  }
  async invoke(invocation, _countTokens, _progress, token) {
    if (!isAutomationsEnabled(this.configurationService)) {
      return automationToolError("Automations are disabled.");
    }
    if (token.isCancellationRequested) {
      return automationToolCancelled();
    }
    let proposal;
    try {
      proposal = this.parseProposal(invocation.parameters, invocation.context?.sessionResource);
    } catch (error) {
      if (error instanceof AutomationToolInputError) {
        return automationToolError(error.message);
      }
      throw error;
    }
    try {
      if (proposal.kind === "create") {
        const target2 = proposal.validateTargetAvailability ? this.resolveAvailableTarget(proposal.initialValues.target) : proposal.initialValues.target;
        return await this.applyCreate({ ...proposal.initialValues, target: target2 }, token);
      }
      const target = proposal.initialValues.target ? proposal.validateTargetAvailability ? this.resolveAvailableTarget(proposal.initialValues.target) : proposal.initialValues.target : void 0;
      const patch2 = target ? { ...proposal.initialValues, target } : proposal.initialValues;
      const prepared = invocation.toolSpecificData?.kind === "automationConfiguration" ? invocation.toolSpecificData : void 0;
      if (prepared && (prepared.expectedAutomationId !== proposal.existing.id || prepared.expectedEditableState !== serializeAutomationEditableState(proposal.existing))) {
        return automationToolError(`Automation "${proposal.existing.id}" changed before the update was applied. Call listAutomations to refresh it before proposing new changes. No changes were made.`);
      }
      return await this.applyUpdate(proposal.existing, patch2, token);
    } catch (error) {
      if (error instanceof AutomationToolMutationBlockedError) {
        return error.result;
      }
      if (error instanceof AutomationToolInputError) {
        return automationToolError(error.message);
      }
      throw error;
    }
  }
  async applyCreate(options3, token) {
    const blocked = this.getMutationBlockedResult(token);
    if (blocked) {
      return blocked;
    }
    const created = await this.automationService.createAutomation(options3, this.createMutationGuard(token));
    const result = automationToolResult(JSON.stringify({ status: "created", automation: toAutomationToolOutput(created) }, void 0, 2));
    result.toolSpecificData = toAutomationConfiguredData(created, "created");
    result.toolResultMessage = localize(4211, null, created.name);
    return result;
  }
  async applyUpdate(existing, patch2, token) {
    const blocked = this.getMutationBlockedResult(token);
    if (blocked) {
      return blocked;
    }
    const updateResult = await this.automationService.updateAutomationIfUnchanged(existing.id, patch2, existing, this.createMutationGuard(token));
    if (updateResult.kind === "conflict" && !updateResult.current) {
      return automationToolError(`Automation "${existing.id}" was deleted before the update was applied. No changes were made.`);
    }
    if (updateResult.kind === "conflict") {
      return automationToolError(`Automation "${existing.id}" changed before the update was applied. Call listAutomations to refresh it before proposing new changes. No changes were made.`);
    }
    const updated = updateResult.automation;
    const result = automationToolResult(JSON.stringify({ status: "updated", automation: toAutomationToolOutput(updated) }, void 0, 2));
    result.toolSpecificData = toAutomationConfiguredData(updated, "updated");
    result.toolResultMessage = localize(4217, null, updated.name);
    return result;
  }
  createMutationGuard(token) {
    return () => {
      const blocked = this.getMutationBlockedResult(token);
      if (blocked) {
        throw new AutomationToolMutationBlockedError(blocked);
      }
    };
  }
  getMutationBlockedResult(token) {
    if (!isAutomationsEnabled(this.configurationService)) {
      return automationToolError("Automations are disabled.");
    }
    if (token.isCancellationRequested) {
      return automationToolCancelled();
    }
    return void 0;
  }
  resolveAvailableTarget(target) {
    const candidates = target.kind === "quickChat" ? this.sessionsManagementService.getQuickChatSessionTypes() : this.sessionsManagementService.getSessionTypesForFolder(target.folderUri);
    const candidate = findSessionType(candidates, target.providerId, target.sessionTypeId);
    if (!candidate) {
      throw new AutomationToolInputError(target.kind === "quickChat" ? `The quick-chat target "${target.providerId}/${target.sessionTypeId}" is not available.` : "The proposed workspace target is not available for the selected provider and session type.");
    }
    if (target.kind === "workspace" && target.isolation.kind === "worktree" && !candidate.sessionType.supportsWorktreeConfiguration) {
      throw new AutomationToolInputError(`Session type "${candidate.sessionType.id}" does not support worktree isolation.`);
    }
    return {
      ...target,
      providerId: candidate.providerId,
      sessionTypeId: candidate.sessionType.id
    };
  }
  parseProposal(parameters, sessionResource) {
    const rawInput = parameters;
    if (!isRecord7(rawInput)) {
      throw new AutomationToolInputError("configureAutomation input must be an object.");
    }
    const input = rawInput;
    assertKnownProperties(input, ["automationId", "name", "prompt", "schedule", "target", "modelId", "mode", "permissionLevel", "enabled"], "configureAutomation input");
    const automationId2 = readOptionalNonEmptyString(input, "automationId");
    const existing = automationId2 ? this.automationService.getAutomation(automationId2) : void 0;
    if (automationId2 && !existing) {
      throw new AutomationToolInputError(`Automation "${automationId2}" does not exist. Call listAutomations to refresh the available IDs.`);
    }
    const name = readOptionalRequiredText(input, "name");
    const prompt = readOptionalRequiredText(input, "prompt");
    if (!existing && name === void 0) {
      throw new AutomationToolInputError('"name" is required when creating an automation.');
    }
    if (!existing && prompt === void 0) {
      throw new AutomationToolInputError('"prompt" is required when creating an automation.');
    }
    const schedule = parseSchedule(input, existing?.schedule, !existing);
    const currentTarget = this.getCurrentSessionTarget(sessionResource);
    const target = parseTarget(input, existing, currentTarget);
    const modelId = readOptionalNullableNonEmptyString(input, "modelId");
    const mode = readOptionalNullableEnum(input, "mode", chatModes);
    const permissionLevel = readOptionalNullableEnum(input, "permissionLevel", chatPermissionLevels2);
    const enabled = readOptionalBoolean(input, "enabled");
    const proposedValues = {
      ...name !== void 0 ? { name } : {},
      ...prompt !== void 0 ? { prompt } : {},
      ...schedule ? { schedule } : {},
      ...target ? { target } : {},
      ...modelId !== void 0 ? { modelId } : {},
      ...mode !== void 0 ? { mode } : {},
      ...permissionLevel !== void 0 ? { permissionLevel } : {},
      ...enabled !== void 0 ? { enabled } : {}
    };
    const validateTargetAvailability = input.target !== void 0 && !(isRecord7(input.target) && input.target.kind === "currentSession");
    if (existing) {
      return { kind: "update", existing, initialValues: proposedValues, validateTargetAvailability };
    }
    if (!schedule) {
      throw new AutomationToolInputError('"schedule" is required when creating an automation.');
    }
    if (!target) {
      throw new AutomationToolInputError('A target could not be derived from the current session. Provide an explicit "target".');
    }
    if (name === void 0 || prompt === void 0) {
      throw new Error("Automation create proposal is missing required values.");
    }
    return {
      kind: "create",
      existing: void 0,
      initialValues: {
        name,
        prompt,
        schedule,
        target,
        ...modelId ? { modelId } : {},
        ...mode ? { mode } : {},
        ...permissionLevel ? { permissionLevel } : {},
        ...enabled !== void 0 ? { enabled } : {}
      },
      validateTargetAvailability
    };
  }
  getCurrentSessionTarget(resource) {
    if (!resource) {
      return void 0;
    }
    const session = this.sessionsManagementService.getSession(resource) ?? this.sessionsManagementService.getSessionForChatResource(resource)?.session;
    return session ? automationTargetFromSession(session) : void 0;
  }
};

ConfigureAutomationTool = __decorateClass([
  __decorateParam(0, IAutomationService),
  __decorateParam(1, ISessionsManagementService),
  __decorateParam(2, IConfigurationService)
], ConfigureAutomationTool);

var AutomationToolsContribution = class extends Disposable {
  static {
    this.ID = "sessions.contrib.automationTools";
  }
  constructor(toolsService, instantiationService) {
    super();
    const listTool = instantiationService.createInstance(ListAutomationsTool);
    const configureTool = instantiationService.createInstance(ConfigureAutomationTool);
    const runTool = instantiationService.createInstance(RunAutomationTool);
    const deleteTool = instantiationService.createInstance(DeleteAutomationTool);
    this._register(toolsService.registerTool(listTool.getToolData(), listTool));
    this._register(toolsService.registerTool(configureTool.getToolData(), configureTool));
    this._register(toolsService.registerTool(runTool.getToolData(), runTool));
    this._register(toolsService.registerTool(deleteTool.getToolData(), deleteTool));
  }
};

AutomationToolsContribution = __decorateClass([
  __decorateParam(0, ILanguageModelToolsService),
  __decorateParam(1, IInstantiationService)
], AutomationToolsContribution);

function isAutomationsEnabled(configurationService) {
  return configurationService.getValue(CHAT_AUTOMATIONS_ENABLED_SETTING) === true;
}

function findSessionType(candidates, providerId, sessionTypeId) {
  return candidates.find((candidate) => (providerId === void 0 || candidate.providerId === providerId) && (sessionTypeId === void 0 || candidate.sessionType.id === sessionTypeId));
}

function automationTargetFromSession(session) {
  if (session.isQuickChat?.get() === true) {
    return {
      kind: "quickChat",
      providerId: session.providerId,
      sessionTypeId: session.sessionType
    };
  }
  const workspace = session.workspace.get();
  return workspace ? {
    kind: "workspace",
    folderUri: workspace.uri,
    providerId: session.providerId,
    sessionTypeId: session.sessionType,
    isolation: { kind: "default" }
  } : void 0;
}

function parseSchedule(input, existing, required) {
  const value2 = readOptionalObject(input, "schedule");
  if (!value2) {
    if (required) {
      throw new AutomationToolInputError('"schedule" is required when creating an automation.');
    }
    return void 0;
  }
  assertKnownProperties(value2, ["interval", "scheduleHour", "scheduleMinute", "scheduleDay"], '"schedule"');
  const interval = readOptionalEnum(value2, "interval", automationIntervals) ?? existing?.interval;
  if (!interval) {
    throw new AutomationToolInputError('"schedule.interval" is required when creating an automation.');
  }
  const scheduleHour = readOptionalInteger(value2, "scheduleHour", 0, 23) ?? existing?.scheduleHour ?? 9;
  const scheduleMinute = readOptionalInteger(value2, "scheduleMinute", 0, 59) ?? existing?.scheduleMinute ?? 0;
  const scheduleDay = readOptionalInteger(value2, "scheduleDay", 0, 6) ?? existing?.scheduleDay ?? 1;
  return { interval, scheduleHour, scheduleMinute, scheduleDay };
}

function parseTarget(input, existing, currentTarget) {
  const value2 = readOptionalObject(input, "target");
  if (!value2) {
    return existing ? void 0 : currentTarget;
  }
  assertKnownProperties(value2, ["kind", "folderUri", "providerId", "sessionTypeId", "isolation", "branch"], '"target"');
  const kind = readRequiredEnum(value2, "kind", ["currentSession", "workspace", "quickChat"]);
  if (kind === "currentSession") {
    assertPropertiesAbsent(value2, ["folderUri", "providerId", "sessionTypeId", "isolation", "branch"], "A currentSession target");
    if (!currentTarget) {
      throw new AutomationToolInputError("The current session does not have a resolved automation target.");
    }
    return currentTarget;
  }
  if (kind === "quickChat") {
    assertPropertiesAbsent(value2, ["folderUri", "isolation", "branch"], "A quickChat target");
    const existingTarget2 = existing?.target.kind === "quickChat" ? existing.target : void 0;
    const providerId2 = readOptionalNonEmptyString(value2, "providerId") ?? existingTarget2?.providerId ?? currentTarget?.providerId;
    const sessionTypeId2 = readOptionalNonEmptyString(value2, "sessionTypeId") ?? existingTarget2?.sessionTypeId ?? currentTarget?.sessionTypeId;
    if (!providerId2 || !sessionTypeId2) {
      throw new AutomationToolInputError('A quickChat target requires "providerId" and "sessionTypeId".');
    }
    return { kind: "quickChat", providerId: providerId2, sessionTypeId: sessionTypeId2 };
  }
  const existingTarget = existing?.target.kind === "workspace" ? existing.target : void 0;
  const sessionTarget = currentTarget?.kind === "workspace" ? currentTarget : void 0;
  const baseTarget = existingTarget ?? sessionTarget;
  const folderUriValue = readOptionalNonEmptyString(value2, "folderUri");
  const folderUri = folderUriValue ? parseUri2(folderUriValue, "target.folderUri") : baseTarget?.folderUri;
  if (!folderUri) {
    throw new AutomationToolInputError('A workspace target requires "folderUri".');
  }
  const providerId = readOptionalNonEmptyString(value2, "providerId") ?? baseTarget?.providerId;
  const sessionTypeId = readOptionalNonEmptyString(value2, "sessionTypeId") ?? baseTarget?.sessionTypeId;
  const isolationKind = readOptionalEnum(value2, "isolation", automationIsolationKinds) ?? baseTarget?.isolation.kind ?? "default";
  const branch = readOptionalNonEmptyString(value2, "branch") ?? (baseTarget?.isolation.kind === "worktree" ? baseTarget.isolation.branch : void 0);
  if (isolationKind !== "worktree" && readOptionalNonEmptyString(value2, "branch") !== void 0) {
    throw new AutomationToolInputError('"target.branch" is only valid with worktree isolation.');
  }
  let isolation;
  if (isolationKind === "worktree") {
    if (!branch) {
      throw new AutomationToolInputError('A workspace target with worktree isolation requires "branch".');
    }
    isolation = { kind: "worktree", branch };
  } else {
    isolation = { kind: isolationKind };
  }
  return { kind: "workspace", folderUri, providerId, sessionTypeId, isolation };
}

function parseUri2(value2, field) {
  try {
    const uri4 = URI.parse(value2, true);
    if (!uri4.scheme) {
      throw new Error("URI has no scheme.");
    }
    return uri4;
  } catch {
    throw new AutomationToolInputError(`"${field}" must be a valid absolute URI.`);
  }
}

function toAutomationToolOutput(automation) {
  const target = automation.target.kind === "workspace" ? {
    kind: "workspace",
    folderUri: automation.target.folderUri.toString(),
    providerId: automation.target.providerId ?? null,
    sessionTypeId: automation.target.sessionTypeId ?? null,
    isolation: automation.target.isolation
  } : {
    kind: "quickChat",
    providerId: automation.target.providerId,
    sessionTypeId: automation.target.sessionTypeId
  };
  return {
    id: automation.id,
    name: automation.name,
    prompt: automation.prompt,
    schedule: automation.schedule,
    target,
    modelId: automation.modelId ?? null,
    mode: automation.mode ?? null,
    permissionLevel: automation.permissionLevel ?? null,
    enabled: automation.enabled,
    createdAt: automation.createdAt,
    updatedAt: automation.updatedAt,
    lastRunAt: automation.lastRunAt ?? null,
    nextRunAt: automation.nextRunAt ?? null
  };
}

function toAutomationConfiguredData(automation, operation) {
  return {
    kind: "automationConfigured",
    automationId: automation.id,
    automationName: automation.name,
    operation
  };
}

function automationToolResult(value2) {
  return { content: [{ kind: "text", value: value2 }] };
}

function automationToolError(message) {
  return {
    content: [{ kind: "text", value: message }],
    toolResultError: message,
    toolResultMessage: localize(4229, null)
  };
}

function automationToolCancelled() {
  const result = automationToolResult(JSON.stringify({
    status: "cancelled",
    message: "The automation change was cancelled. No changes were made."
  }));
  result.toolResultMessage = localize(4206, null);
  return result;
}

function automationDeleteCancelled() {
  const result = automationToolResult(JSON.stringify({
    status: "cancelled",
    message: "The automation was not deleted."
  }));
  result.toolResultMessage = localize(4220, null);
  return result;
}

function automationRunCancelled() {
  const result = automationToolResult(JSON.stringify({
    status: "cancelled",
    message: "The automation was not started."
  }));
  result.toolResultMessage = localize(4238, null);
  return result;
}

function automationAlreadyRunning(automation, run) {
  const result = automationToolResult(JSON.stringify({
    status: "already_running",
    automation: { id: automation.id, name: automation.name },
    run: {
      id: run.id,
      status: run.status,
      sessionResource: run.sessionResource?.toString() ?? null
    }
  }, void 0, 2));
  result.toolResultMessage = localize(4237, null, automation.name);
  return result;
}

function automationNotStarted(automation, dispatch) {
  if (dispatch.reason === "cancelled") {
    return automationRunCancelled();
  }
  if (dispatch.reason === "deleted") {
    return automationToolError(`Automation "${automation.id}" no longer exists.`);
  }
  if (dispatch.reason === "targetUnavailable") {
    return automationToolError(`Automation "${automation.id}" did not start. Its configured agent is unavailable.`);
  }
  return automationToolError(dispatch.run?.errorMessage ? `Automation "${automation.id}" failed to start: ${dispatch.run.errorMessage}` : `Automation "${automation.id}" failed to start.`);
}

function resolveAutomationInput(automationService, rawInput, toolName) {
  if (!isRecord7(rawInput)) {
    throw new AutomationToolInputError(`${toolName} input must be an object.`);
  }
  assertKnownProperties(rawInput, ["automationId"], `${toolName} input`);
  const automationId2 = readOptionalNonEmptyString(rawInput, "automationId");
  if (!automationId2) {
    throw new AutomationToolInputError('"automationId" is required.');
  }
  const automation = automationService.getAutomation(automationId2);
  if (!automation) {
    throw new AutomationToolInputError(`Automation "${automationId2}" does not exist. Call listAutomations to refresh the available IDs.`);
  }
  return automation;
}

function assertKnownProperties(value2, properties, field) {
  const known = new Set(properties);
  const unexpected = Object.keys(value2).find((key3) => !known.has(key3));
  if (unexpected) {
    throw new AutomationToolInputError(`${field} has an unsupported "${unexpected}" property.`);
  }
}

function assertPropertiesAbsent(value2, properties, field) {
  const present = properties.find((property) => value2[property] !== void 0);
  if (present) {
    throw new AutomationToolInputError(`${field} cannot include "${present}".`);
  }
}

function readOptionalObject(value2, property) {
  const candidate = value2[property];
  if (candidate === void 0) {
    return void 0;
  }
  if (!isRecord7(candidate)) {
    throw new AutomationToolInputError(`"${property}" must be an object.`);
  }
  return candidate;
}

function readOptionalRequiredText(value2, property) {
  const candidate = value2[property];
  if (candidate === void 0) {
    return void 0;
  }
  if (typeof candidate !== "string" || candidate.trim() === "") {
    throw new AutomationToolInputError(`"${property}" must be a non-empty string.`);
  }
  return candidate;
}

function readOptionalNonEmptyString(value2, property) {
  const candidate = readOptionalRequiredText(value2, property);
  return candidate?.trim();
}

function readOptionalNullableNonEmptyString(value2, property) {
  const candidate = value2[property];
  if (candidate === void 0 || candidate === null) {
    return candidate;
  }
  if (typeof candidate !== "string" || candidate.trim() === "") {
    throw new AutomationToolInputError(`"${property}" must be a non-empty string or null.`);
  }
  return candidate.trim();
}

function readOptionalBoolean(value2, property) {
  const candidate = value2[property];
  if (candidate === void 0) {
    return void 0;
  }
  if (typeof candidate !== "boolean") {
    throw new AutomationToolInputError(`"${property}" must be a boolean.`);
  }
  return candidate;
}

function readOptionalInteger(value2, property, minimum, maximum) {
  const candidate = value2[property];
  if (candidate === void 0) {
    return void 0;
  }
  if (typeof candidate !== "number" || !Number.isInteger(candidate) || candidate < minimum || candidate > maximum) {
    throw new AutomationToolInputError(`"${property}" must be an integer from ${minimum} through ${maximum}.`);
  }
  return candidate;
}

function readRequiredEnum(value2, property, allowed) {
  const candidate = readOptionalEnum(value2, property, allowed);
  if (candidate === void 0) {
    throw new AutomationToolInputError(`"${property}" is required.`);
  }
  return candidate;
}

function readOptionalEnum(value2, property, allowed) {
  const candidate = value2[property];
  if (candidate === void 0) {
    return void 0;
  }
  if (!isAllowedString(candidate, allowed)) {
    throw new AutomationToolInputError(`"${property}" must be one of: ${allowed.join(", ")}.`);
  }
  return candidate;
}

function readOptionalNullableEnum(value2, property, allowed) {
  const candidate = value2[property];
  if (candidate === void 0 || candidate === null) {
    return candidate;
  }
  if (!isAllowedString(candidate, allowed)) {
    throw new AutomationToolInputError(`"${property}" must be null or one of: ${allowed.join(", ")}.`);
  }
  return candidate;
}

function isRecord7(value2) {
  return !!value2 && typeof value2 === "object" && !Array.isArray(value2);
}

function isAllowedString(value2, allowed) {
  return typeof value2 === "string" && allowed.some((candidate) => candidate === value2);
}
export { isAutomationsEnabled, findSessionType, automationTargetFromSession, parseSchedule, parseTarget, parseUri2, toAutomationToolOutput, toAutomationConfiguredData, automationToolResult, automationToolError, automationToolCancelled, automationDeleteCancelled, automationRunCancelled, automationAlreadyRunning, automationNotStarted, resolveAutomationInput, assertKnownProperties, assertPropertiesAbsent, readOptionalObject, readOptionalRequiredText, readOptionalNonEmptyString, readOptionalNullableNonEmptyString, readOptionalBoolean, readOptionalInteger, readRequiredEnum, readOptionalEnum, readOptionalNullableEnum, isRecord7, isAllowedString, ListAutomationsToolId, ConfigureAutomationToolId, RunAutomationToolId, DeleteAutomationToolId, automationToolWhen, deleteAutomationConfirmationId, manualRunLeaderWindowId, automationIntervals, automationIsolationKinds, chatModes, chatPermissionLevels2, AutomationToolInputError, AutomationToolMutationBlockedError, ListAutomationsTool, RunAutomationTool, DeleteAutomationTool, ConfigureAutomationTool, AutomationToolsContribution };
