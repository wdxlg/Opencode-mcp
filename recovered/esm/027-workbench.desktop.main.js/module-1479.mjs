// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/chatArtifactExtraction.ts
import { URI } from "./module-0032.mjs";
import { basename } from "./module-0026.mjs";
import { match } from "./module-0857.mjs";
import { basename2 } from "./module-0034.mjs";
import { IChatToolInvocation } from "./module-0972.mjs";
import { isToolResultInputOutputDetails } from "./module-0990.mjs";
import { getExtensionForMimeType } from "./module-0136.mjs";
import { ChatResponseResource } from "./module-1193.mjs";


// src/vs/workbench/contrib/chat/common/chatArtifactExtraction.ts
var CHAT_MEMORY_FILE_SCHEME = "chat-memory-file";

var MEMORY_TOOL_ID = "copilot_memory";

var ChatMemoryFileResource;

((ChatMemoryFileResource2) => {
  function createUri(memoryPath, sessionResource) {
    return URI.from({
      scheme: CHAT_MEMORY_FILE_SCHEME,
      path: memoryPath,
      query: sessionResource.toString()
    });
  }
  ChatMemoryFileResource2.createUri = createUri;
  function isChatMemoryFileUri(uri5) {
    return uri5.scheme === CHAT_MEMORY_FILE_SCHEME;
  }
  ChatMemoryFileResource2.isChatMemoryFileUri = isChatMemoryFileUri;
  function parse14(uri5) {
    return {
      memoryPath: uri5.path,
      sessionResource: uri5.query
    };
  }
  ChatMemoryFileResource2.parse = parse14;
})(ChatMemoryFileResource || (ChatMemoryFileResource = {}));

function matchMimeType(pattern, mimeType) {
  if (pattern === mimeType) {
    return true;
  }
  const [patternType, patternSubtype] = pattern.split("/");
  const [type] = mimeType.split("/");
  return patternSubtype === "*" && patternType === type;
}

function findFilePathRule(filePath, byFilePath) {
  const fileBasename = basename(filePath);
  for (const [pattern, config] of Object.entries(byFilePath)) {
    if (match(pattern, filePath) || match(pattern, fileBasename)) {
      return config;
    }
  }
  return void 0;
}

function findMimeTypeRule(mimeType, byMimeType) {
  for (const [pattern, config] of Object.entries(byMimeType)) {
    if (matchMimeType(pattern, mimeType)) {
      return config;
    }
  }
  return void 0;
}

function isToolResultOutputDetailsSerialized(obj) {
  return typeof obj === "object" && obj !== null && "output" in obj && typeof obj.output === "object" && obj.output?.type === "data" && typeof obj.output?.mimeType === "string";
}

function getMemoryPathFromParams(params) {
  if (typeof params !== "object" || params === null) {
    return void 0;
  }
  const path = params["path"];
  return typeof path === "string" ? path : void 0;
}

var memoryWriteCommands = /* @__PURE__ */ new Set(["create", "str_replace", "insert"]);

function isMemoryWriteCommand(params) {
  if (typeof params !== "object" || params === null) {
    return false;
  }
  const command4 = params["command"];
  return typeof command4 === "string" && memoryWriteCommands.has(command4);
}

function extractArtifactsFromResponse(response, sessionResource, byMimeType, byFilePath, byMemoryFilePath = {}) {
  const artifacts = [];
  const seenUris = /* @__PURE__ */ new Set();
  for (const part of response.value) {
    if (part.kind === "codeblockUri") {
      const uri5 = part.uri;
      const uriStr = uri5.toString();
      if (seenUris.has(uriStr)) {
        continue;
      }
      const rule = findFilePathRule(uri5.path, byFilePath);
      if (rule) {
        seenUris.add(uriStr);
        artifacts.push({
          label: basename2(uri5),
          uri: uriStr,
          type: "plan",
          groupName: rule.groupName,
          onlyShowGroup: rule.onlyShowGroup
        });
      }
    }
    if (part.kind === "textEditGroup") {
      const uri5 = part.uri;
      const uriStr = uri5.toString();
      if (seenUris.has(uriStr)) {
        continue;
      }
      const rule = findFilePathRule(uri5.path, byFilePath);
      if (rule) {
        seenUris.add(uriStr);
        artifacts.push({
          label: basename2(uri5),
          uri: uriStr,
          type: "plan",
          groupName: rule.groupName,
          onlyShowGroup: rule.onlyShowGroup
        });
      }
    }
    if (part.kind === "workspaceEdit") {
      for (const edit3 of part.edits) {
        const uri5 = edit3.newResource ?? edit3.oldResource;
        if (!uri5) {
          continue;
        }
        const uriStr = uri5.toString();
        if (seenUris.has(uriStr)) {
          continue;
        }
        const rule = findFilePathRule(uri5.path, byFilePath);
        if (rule) {
          seenUris.add(uriStr);
          artifacts.push({
            label: basename2(uri5),
            uri: uriStr,
            type: "plan",
            groupName: rule.groupName,
            onlyShowGroup: rule.onlyShowGroup
          });
        }
      }
    }
    if (part.kind === "externalEdit") {
      const uri5 = part.uri;
      const uriStr = uri5.toString();
      if (seenUris.has(uriStr)) {
        continue;
      }
      const rule = findFilePathRule(uri5.path, byFilePath);
      if (rule) {
        seenUris.add(uriStr);
        artifacts.push({
          label: basename2(uri5),
          uri: uriStr,
          type: "plan",
          groupName: rule.groupName,
          onlyShowGroup: rule.onlyShowGroup
        });
      }
    }
    if ((part.kind === "toolInvocation" || part.kind === "toolInvocationSerialized") && part.toolId === MEMORY_TOOL_ID) {
      const params = IChatToolInvocation.getParameters(part);
      const memoryPath = getMemoryPathFromParams(params);
      if (memoryPath && isMemoryWriteCommand(params)) {
        const rule = findFilePathRule(memoryPath, byMemoryFilePath);
        if (rule) {
          const key3 = `memory:${part.toolCallId}:${memoryPath}`;
          if (!seenUris.has(key3)) {
            seenUris.add(key3);
            artifacts.push({
              label: basename(memoryPath),
              uri: ChatMemoryFileResource.createUri(memoryPath, sessionResource).toString(),
              type: "plan",
              groupName: rule.groupName,
              onlyShowGroup: rule.onlyShowGroup
            });
          }
        }
      }
    }
    if (part.kind === "toolInvocation" || part.kind === "toolInvocationSerialized") {
      const details = IChatToolInvocation.resultDetails(part);
      if (!details) {
        continue;
      }
      if (isToolResultInputOutputDetails(details)) {
        for (let i2 = 0; i2 < details.output.length; i2++) {
          const outputPart = details.output[i2];
          if (outputPart.type === "embed" && !outputPart.isText && outputPart.mimeType) {
            const rule = findMimeTypeRule(outputPart.mimeType, byMimeType);
            if (rule) {
              const key3 = `${part.toolCallId}:${i2}`;
              if (!seenUris.has(key3)) {
                seenUris.add(key3);
                const ext = getExtensionForMimeType(outputPart.mimeType);
                const permalinkBasename = ext ? `file${ext}` : "file.bin";
                const artifactUri = ChatResponseResource.createUri(sessionResource, part.toolCallId, i2, permalinkBasename);
                artifacts.push({
                  label: outputPart.uri?.path.split("/").pop() ?? `${rule.groupName} ${i2 + 1}`,
                  uri: artifactUri.toString(),
                  toolCallId: part.toolCallId,
                  dataPartIndex: i2,
                  type: "screenshot",
                  groupName: rule.groupName,
                  onlyShowGroup: rule.onlyShowGroup
                });
              }
            }
          }
        }
      }
      if (isToolResultOutputDetailsSerialized(details)) {
        const rule = findMimeTypeRule(details.output.mimeType, byMimeType);
        if (rule) {
          const key3 = `${part.toolCallId}:0`;
          if (!seenUris.has(key3)) {
            seenUris.add(key3);
            const ext = getExtensionForMimeType(details.output.mimeType);
            const permalinkBasename = ext ? `file${ext}` : "file.bin";
            const artifactUri = ChatResponseResource.createUri(sessionResource, part.toolCallId, 0, permalinkBasename);
            artifacts.push({
              label: `${rule.groupName}`,
              uri: artifactUri.toString(),
              toolCallId: part.toolCallId,
              dataPartIndex: 0,
              type: "screenshot",
              groupName: rule.groupName,
              onlyShowGroup: rule.onlyShowGroup
            });
          }
        }
      }
    }
  }
  return artifacts;
}
export { matchMimeType, findFilePathRule, findMimeTypeRule, isToolResultOutputDetailsSerialized, getMemoryPathFromParams, isMemoryWriteCommand, extractArtifactsFromResponse, CHAT_MEMORY_FILE_SCHEME, MEMORY_TOOL_ID, ChatMemoryFileResource, memoryWriteCommands };
