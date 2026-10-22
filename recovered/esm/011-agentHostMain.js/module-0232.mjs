// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/shared/agentMergeServerTools.ts
import { localize } from "./module-0012.mjs";


// src/vs/platform/agentHost/node/shared/agentMergeServerTools.ts
var readAgentMergeCIToolName = "readAgentMergeCI";

var replyToAgentMergeReviewThreadToolName = "replyToAgentMergeReviewThread";

var rerunAgentMergeWorkflowToolName = "rerunAgentMergeWorkflow";

var definitions = [
  {
    name: readAgentMergeCIToolName,
    title: "Read Agent Merge CI",
    description: "Read annotations, failed jobs, and bounded logs for failed required checks on the pull request authorized for the active Agent Merge turn.",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true }
  },
  {
    name: replyToAgentMergeReviewThreadToolName,
    title: "Reply to Agent Merge Review Thread",
    description: "Reply to an unresolved review thread authorized for the active Agent Merge turn and optionally resolve it.",
    inputSchema: {
      type: "object",
      properties: {
        threadId: { type: "string", description: "GraphQL node ID of an authorized unresolved review thread." },
        body: { type: "string", description: "Concise reply describing how the feedback was addressed." },
        resolve: { type: "boolean", description: "Whether to resolve the thread after posting the reply. Defaults to true." }
      },
      required: ["threadId", "body"]
    },
    annotations: { readOnlyHint: false }
  },
  {
    name: rerunAgentMergeWorkflowToolName,
    title: "Rerun Agent Merge Workflow",
    description: "Rerun a GitHub Actions workflow associated with a failed required check in the active Agent Merge turn.",
    inputSchema: {
      type: "object",
      properties: {
        runId: { type: "string", description: "GitHub Actions workflow run ID." },
        failedJobsOnly: { type: "boolean", description: "Whether to rerun only failed jobs. Defaults to true." }
      },
      required: ["runId"]
    },
    annotations: { readOnlyHint: false }
  }
];

function createAgentMergeServerToolGroup(accessor) {
  return {
    definitions,
    isEnabled: (toolName) => accessor?.isEnabled() === true && definitions.some((definition) => definition.name === toolName),
    execute: (_stateManager, context, toolName, rawArgs) => {
      if (!accessor) {
        throw new Error("Agent Merge tools are not available without an Agent Merge controller.");
      }
      switch (toolName) {
        case readAgentMergeCIToolName:
          return accessor.readFailedCI(context.sessionUri);
        case replyToAgentMergeReviewThreadToolName: {
          const args = asRecord(rawArgs, toolName);
          return accessor.replyToReviewThread(
            context.sessionUri,
            requiredString2(args.threadId, "threadId", toolName),
            requiredString2(args.body, "body", toolName),
            optionalBoolean(args.resolve, "resolve", toolName) ?? true
          );
        }
        case rerunAgentMergeWorkflowToolName: {
          const args = asRecord(rawArgs, toolName);
          return accessor.rerunFailedWorkflow(
            context.sessionUri,
            requiredString2(args.runId, "runId", toolName),
            optionalBoolean(args.failedJobsOnly, "failedJobsOnly", toolName) ?? true
          );
        }
        default:
          throw new Error(`Unknown Agent Merge server tool: ${toolName}`);
      }
    },
    getDisplay: (toolName, _args, result) => getDisplay(toolName, result)
  };
}

function getDisplay(toolName, result) {
  switch (toolName) {
    case readAgentMergeCIToolName:
      return {
        displayName: localize(2649, null),
        invocationMessage: localize(2652, null),
        pastTenseMessage: result?.success === false ? localize(2651, null) : localize(2650, null)
      };
    case replyToAgentMergeReviewThreadToolName:
      return {
        displayName: localize(2653, null),
        invocationMessage: localize(2656, null),
        pastTenseMessage: result?.success === false ? localize(2655, null) : localize(2654, null)
      };
    case rerunAgentMergeWorkflowToolName:
      return {
        displayName: localize(2657, null),
        invocationMessage: localize(2660, null),
        pastTenseMessage: result?.success === false ? localize(2659, null) : localize(2658, null)
      };
    default:
      return void 0;
  }
}

function asRecord(value, toolName) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`Invalid ${toolName} input: expected an object.`);
  }
  return value;
}

function requiredString2(value, field, toolName) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid ${toolName} input: ${field} must be a non-empty string.`);
  }
  return value;
}

function optionalBoolean(value, field, toolName) {
  if (value === void 0) {
    return void 0;
  }
  if (typeof value !== "boolean") {
    throw new Error(`Invalid ${toolName} input: ${field} must be a boolean.`);
  }
  return value;
}
export { createAgentMergeServerToolGroup, getDisplay, asRecord, requiredString2, optionalBoolean, readAgentMergeCIToolName, replyToAgentMergeReviewThreadToolName, rerunAgentMergeWorkflowToolName, definitions };
