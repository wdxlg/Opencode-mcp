// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/shared/artifactServerTools.ts
import { SESSION_ARTIFACT_TYPES, readSessionArtifacts, withSessionArtifacts } from "./module-0233.mjs";
import { parseRequiredSessionUriFromChatUri } from "./module-0047.mjs";
import { SessionArtifactCollection, parseSessionArtifactInput } from "./module-0234.mjs";
import { LEGACY_ARTIFACT_SERVER_TOOL_NAMES } from "./module-0229.mjs";
import { generateUuid } from "./module-0042.mjs";


// src/vs/platform/agentHost/node/shared/artifactServerTools.ts
var addArtifactInputSchema = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: [...SESSION_ARTIFACT_TYPES],
      description: "The kind of artifact or reference. Use `resource` only when no other kind applies."
    },
    label: { type: "string", description: "Short label shown to the user." },
    isArtifact: {
      type: "boolean",
      description: "Required. `true` for an artifact \u2014 something this session produced, such as a pull request or issue it opened, a plan file it wrote outside the workspace, or another side effect of its work. `false` for a reference \u2014 something it did not produce but the user should look at, such as the pull request or commit that introduced a bug, or a website that matters for the task."
    },
    link: { type: "string", description: "URL of the pull request, issue, commit or website. Required for those kinds." },
    uri: { type: "string", description: "Absolute URI including its scheme. For a local file, pass a file URI such as `file:///C:/path/to/file`, not a plain file system path such as `C:\\path\\to\\file`. Required for the `file` and `resource` kinds." },
    commitHash: { type: "string", description: "The commit hash. Required for the `commit` kind." }
  },
  required: ["type", "label", "isArtifact"]
};

var removeArtifactInputSchema = {
  type: "object",
  properties: {
    id: { type: "string", description: `The id returned by \`${"add_artifact_or_reference" /* AddArtifactOrReference */}\` or \`${"list_artifacts_and_references" /* ListArtifactsAndReferences */}\`.` }
  },
  required: ["id"]
};

var listArtifactsInputSchema = {
  type: "object",
  properties: {}
};

var artifactServerToolDefinitions = [
  {
    name: "add_artifact_or_reference" /* AddArtifactOrReference */,
    title: "Add Artifact or Reference",
    description: "Record an artifact or a reference so it is surfaced next to the chat input. An artifact is something this session produced that is not just an ordinary workspace edit: a pull request or issue it opened, a plan or report file it wrote outside the workspace, or another side effect of its work. A reference is something the session did not produce but the user should look at because of this task: the pull request or commit that introduced a bug, an issue it investigated, or a website worth reading. Set `isArtifact` accordingly. Do not record routine files you merely edited.",
    inputSchema: addArtifactInputSchema,
    annotations: { readOnlyHint: false }
  },
  {
    name: "remove_artifact_or_reference" /* RemoveArtifactOrReference */,
    title: "Remove Artifact or Reference",
    description: "Remove an artifact or reference from this session by id.",
    inputSchema: removeArtifactInputSchema,
    annotations: { readOnlyHint: false, destructiveHint: true }
  },
  {
    name: "list_artifacts_and_references" /* ListArtifactsAndReferences */,
    title: "List Artifacts and References",
    description: "List the artifacts and references recorded on this session, with their ids.",
    inputSchema: listArtifactsInputSchema,
    annotations: { readOnlyHint: true }
  }
];

function entryNoun(isArtifact) {
  return isArtifact ? "artifact" : "reference";
}

var REMOVED_ARTIFACT_MESSAGE = "Removed artifact";

var REMOVED_REFERENCE_MESSAGE = "Removed reference";

function describeArtifact(artifact) {
  const value = artifact.link ?? artifact.uri ?? artifact.commitHash ?? "";
  return `${artifact.id} (${artifact.type}, ${entryNoun(artifact.isArtifact)}) ${artifact.label}${value ? ` \u2014 ${value}` : ""}`;
}

var SessionArtifacts = class {
  constructor(_stateManager, context) {
    this._stateManager = _stateManager;
    this._session = parseRequiredSessionUriFromChatUri(context.chatUri);
  }
  read() {
    return new SessionArtifactCollection(readSessionArtifacts(this._stateManager.getSessionState(this._session)?._meta));
  }
  write(artifacts, accessor) {
    const meta = this._stateManager.getSessionState(this._session)?._meta;
    this._stateManager.setSessionMeta(this._session, withSessionArtifacts(meta, artifacts));
    accessor.persist(this._session, artifacts);
  }
};

function createArtifactServerToolGroup(accessor) {
  return {
    definitions: artifactServerToolDefinitions,
    legacyToolNames: LEGACY_ARTIFACT_SERVER_TOOL_NAMES,
    isEnabled() {
      return accessor?.isEnabled() === true;
    },
    getDisplay(toolName, args, result) {
      switch (toolName) {
        case "add_artifact_or_reference" /* AddArtifactOrReference */: {
          const { label, isArtifact } = args ?? {};
          const noun = typeof isArtifact === "boolean" ? entryNoun(isArtifact) : "artifact or reference";
          const suffix = typeof label === "string" && label.length > 0 ? ` "${label}"` : "";
          return {
            displayName: typeof isArtifact === "boolean" ? isArtifact ? "Add Artifact" : "Add Reference" : "Add Artifact or Reference",
            invocationMessage: `Add ${noun}${suffix}`,
            pastTenseMessage: `Added ${noun}${suffix}`
          };
        }
        case "remove_artifact_or_reference" /* RemoveArtifactOrReference */: {
          const text = result?.text ?? "";
          const pastTenseMessage = text.startsWith(REMOVED_REFERENCE_MESSAGE) ? REMOVED_REFERENCE_MESSAGE : text.startsWith(REMOVED_ARTIFACT_MESSAGE) ? REMOVED_ARTIFACT_MESSAGE : void 0;
          return {
            displayName: "Remove Artifact or Reference",
            invocationMessage: "Remove artifact or reference",
            ...pastTenseMessage ? { pastTenseMessage } : {}
          };
        }
        case "list_artifacts_and_references" /* ListArtifactsAndReferences */:
          return { displayName: "List Artifacts and References", invocationMessage: "List artifacts and references", pastTenseMessage: "Listed artifacts and references" };
        default:
          return void 0;
      }
    },
    execute(stateManager, context, toolName, rawArgs) {
      if (!accessor) {
        throw new Error(`${toolName} is unavailable in this host.`);
      }
      const artifacts = new SessionArtifacts(stateManager, context);
      switch (toolName) {
        case "add_artifact_or_reference" /* AddArtifactOrReference */: {
          const input = parseSessionArtifactInput(rawArgs, "add_artifact_or_reference" /* AddArtifactOrReference */);
          const result = artifacts.read().add(input, generateUuid);
          if (!result.added) {
            return `Already recorded: ${describeArtifact(result.artifact)}`;
          }
          artifacts.write(result.artifacts, accessor);
          return `Added ${entryNoun(result.artifact.isArtifact)}: ${describeArtifact(result.artifact)}`;
        }
        case "remove_artifact_or_reference" /* RemoveArtifactOrReference */: {
          const id2 = rawArgs?.id;
          if (typeof id2 !== "string" || id2.length === 0) {
            throw new Error(`Invalid ${"remove_artifact_or_reference" /* RemoveArtifactOrReference */} input: id must be a non-empty string.`);
          }
          const result = artifacts.read().remove(id2);
          if (!result.removed) {
            return `No artifact or reference with id ${id2}.`;
          }
          artifacts.write(result.artifacts, accessor);
          const message = result.removed.isArtifact ? REMOVED_ARTIFACT_MESSAGE : REMOVED_REFERENCE_MESSAGE;
          return `${message}: ${describeArtifact(result.removed)}`;
        }
        case "list_artifacts_and_references" /* ListArtifactsAndReferences */: {
          const current = artifacts.read().artifacts;
          return current.length === 0 ? "No artifacts or references recorded for this session." : current.map(describeArtifact).join("\n");
        }
        default:
          throw new Error(`Unknown artifact tool: ${toolName}`);
      }
    }
  };
}

var ARTIFACT_TOOLS_INSTRUCTION = `Record the notable results of your work with \`${"add_artifact_or_reference" /* AddArtifactOrReference */}\` (types: ${SESSION_ARTIFACT_TYPES.join(", ")}; use \`${"resource" /* Resource */}\` when nothing else fits) so they are surfaced next to the chat input. Pass \`isArtifact: true\` for an artifact \u2014 something this session produced beyond ordinary workspace edits, such as a pull request or issue you opened, a plan or report file you wrote outside the workspace, or another side effect of your work. Pass \`isArtifact: false\` for a reference \u2014 something you did not produce but the user should look at because of this task, such as the pull request or commit that introduced a bug, an issue you investigated, or a website worth reading. Record each one once, and do not record routine files you merely edited or commits you create unless the user asks for them.`;
export { entryNoun, describeArtifact, createArtifactServerToolGroup, addArtifactInputSchema, removeArtifactInputSchema, listArtifactsInputSchema, artifactServerToolDefinitions, REMOVED_ARTIFACT_MESSAGE, REMOVED_REFERENCE_MESSAGE, SessionArtifacts, ARTIFACT_TOOLS_INSTRUCTION };
