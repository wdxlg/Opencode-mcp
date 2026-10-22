// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/tools/builtinTools/setArtifactsTool.ts
import { localize } from "./module-0001.mjs";
import { ToolDataSource } from "./module-0991.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatArtifactsService } from "./module-1479.mjs";
import { IFileService } from "./module-0269.mjs";
import { IChatService } from "./module-0973.mjs";


// src/vs/workbench/contrib/chat/common/tools/builtinTools/setArtifactsTool.ts
var SetArtifactsToolId = "setArtifacts";

var inputSchema = {
  type: "object",
  properties: {
    artifacts: {
      type: "array",
      description: "The complete list of artifacts for this session. Overwrites any existing artifacts.",
      items: {
        type: "object",
        properties: {
          label: {
            type: "string",
            description: "Display label for the artifact."
          },
          uri: {
            type: "string",
            description: "Fully qualified URI of the artifact (e.g. https://localhost:3000 or file:///path/to/file). Must include the scheme."
          },
          type: {
            type: "string",
            enum: ["devServer", "screenshot", "plan"],
            description: "The type of artifact."
          }
        },
        required: ["label"]
      }
    }
  },
  required: ["artifacts"]
};

var SetArtifactsToolData = {
  id: SetArtifactsToolId,
  toolReferenceName: "artifacts",
  legacyToolReferenceFullNames: ["Set Session Artifacts"],
  displayName: localize(13448, null),
  modelDescription: "Set the list of artifacts for the current session. Each artifact has a label and either a uri or a toolCallId+dataPartIndex reference, plus an optional type (devServer, screenshot, plan). This overwrites the entire artifact list. URIs must be fully qualified with a scheme (e.g. https://localhost:3000, file:///tmp/plan.md). To reference a screenshot or image from a previous tool result, use toolCallId and dataPartIndex instead of uri.\n\nWhen to use this tool:\n- When creating or updating a plan saved to session memory \u2014 set a plan artifact so the user can view it in the artifact panel\n- When taking screenshots or producing visual output \u2014 set a screenshot artifact to surface the image\n- When starting a dev server \u2014 set a devServer artifact with the URL so the user can access it\n- When producing important documents, drafts, or temporary markdown files \u2014 set an artifact to make them easily accessible\n- After verification steps that produce visual results \u2014 update artifacts with screenshots showing the outcome\n\nWorkflow:\n- Prefer artifacts over printing long content inline in chat. Save content to a file or memory, then set an artifact pointing to it.\n- When updating plans or documents, update both the underlying file AND the artifact list.\n- Keep artifact labels concise and descriptive.",
  canBeReferencedInPrompt: true,
  source: ToolDataSource.Internal,
  inputSchema
};

var SetArtifactsTool = class {
  constructor(_chatArtifactsService, _fileService, _chatService) {
    this._chatArtifactsService = _chatArtifactsService;
    this._fileService = _fileService;
    this._chatService = _chatService;
  }
  async prepareToolInvocation(_context, _token) {
    return {
      pastTenseMessage: new MarkdownString(localize(13449, null)),
      presentation: "hidden" /* Hidden */
    };
  }
  async invoke(invocation, _countTokens, _progress, _token) {
    const args2 = invocation.parameters;
    const chatSessionResource = invocation.context?.sessionResource;
    if (!chatSessionResource) {
      return {
        content: [{ kind: "text", value: "Error: No session resource available" }]
      };
    }
    const artifacts = [];
    for (const a of args2.artifacts ?? []) {
      let uri4 = a.uri;
      if (!uri4) {
        uri4 = "";
      }
      if (uri4) {
        const parsed = URI.parse(uri4);
        if (parsed.scheme !== "http" && parsed.scheme !== "https") {
          if (!await this._fileService.exists(parsed)) {
            throw new Error(localize(13451, null, uri4));
          }
        }
      }
      artifacts.push({ label: a.label, uri: uri4, type: a.type });
    }
    const chatArtifacts = this._chatArtifactsService.getArtifacts(chatSessionResource);
    const subAgentInvocationId = invocation.subAgentInvocationId;
    if (subAgentInvocationId) {
      const agentName = this._resolveSubagentName(chatSessionResource, subAgentInvocationId);
      chatArtifacts.setSubagentArtifacts(subAgentInvocationId, agentName, artifacts);
    } else {
      chatArtifacts.setAgentArtifacts(artifacts);
    }
    return {
      content: [{ kind: "text", value: localize(13450, null, artifacts.length) }]
    };
  }
  _resolveSubagentName(sessionResource, subAgentInvocationId) {
    const model = this._chatService.getSession(sessionResource);
    if (!model) {
      return void 0;
    }
    for (const request2 of model.getRequests()) {
      const response = request2.response;
      if (!response) {
        continue;
      }
      for (const part of response.response.value) {
        if ((part.kind === "toolInvocation" || part.kind === "toolInvocationSerialized") && part.toolCallId === subAgentInvocationId && part.toolSpecificData?.kind === "subagent") {
          return part.toolSpecificData.agentName;
        }
      }
    }
    return void 0;
  }
};

SetArtifactsTool = __decorateClass([
  __decorateParam(0, IChatArtifactsService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IChatService)
], SetArtifactsTool);
export { SetArtifactsToolId, inputSchema, SetArtifactsToolData, SetArtifactsTool };
