// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/chatImageExtraction.ts
import { isRequestVM } from "./module-0978.mjs";
import { getExplicitFileOrImageAttachmentSummary, isImageVariableEntry } from "./module-0979.mjs";
import { localize } from "./module-0001.mjs";
import { IChatToolInvocation } from "./module-0972.mjs";
import { getExtensionForMimeType, getMediaMime } from "./module-0136.mjs";
import { ChatResponseResource } from "./module-1193.mjs";
import { isToolResultInputOutputDetails, isToolResultOutputDetails } from "./module-0990.mjs";
import { VSBuffer, decodeBase64 } from "./module-0038.mjs";
import { URI } from "./module-0032.mjs";
import { isLocation } from "./module-0164.mjs";


// src/vs/workbench/contrib/chat/common/chatImageExtraction.ts
async function extractImagesFromChatResponse(response, readFile) {
  const allImages = [];
  for (const item of response.response.value) {
    if (item.kind === "toolInvocation" || item.kind === "toolInvocationSerialized") {
      const images = extractImagesFromToolInvocationOutputDetails(item, response.sessionResource);
      allImages.push(...images);
      const messageImages = await extractImagesFromToolInvocationMessages(item, readFile);
      allImages.push(...messageImages);
    } else if (item.kind === "inlineReference") {
      const image = await extractImageFromInlineReference(item, readFile);
      if (image) {
        allImages.push(image);
      }
    }
  }
  const request2 = response.session.getItems().find((item) => isRequestVM(item) && item.id === response.requestId);
  const title = request2 ? request2.messageText.trim() || getExplicitFileOrImageAttachmentSummary(request2.variables) || localize(12909, null) : localize(12909, null);
  return {
    id: response.sessionResource.toString() + "_" + response.id,
    title,
    images: allImages
  };
}

function extractImagesFromToolInvocationOutputDetails(toolInvocation, sessionResource) {
  const images = [];
  const resultDetails = IChatToolInvocation.resultDetails(toolInvocation);
  const caption = toolInvocation.pastTenseMessage ?? toolInvocation.invocationMessage;
  const pushImage = (mimeType, data, outputIndex) => {
    const ext = getExtensionForMimeType(mimeType);
    const permalinkBasename = ext ? `file${ext}` : "file.bin";
    const uri5 = ChatResponseResource.createUri(sessionResource, toolInvocation.toolCallId, outputIndex, permalinkBasename);
    images.push({
      id: `${toolInvocation.toolCallId}_${outputIndex}`,
      uri: uri5,
      name: localize(12910, null, images.length + 1),
      mimeType,
      data,
      source: localize(12912, null, toolInvocation.toolId),
      caption
    });
  };
  if (isToolResultInputOutputDetails(resultDetails)) {
    for (let i2 = 0; i2 < resultDetails.output.length; i2++) {
      const outputItem = resultDetails.output[i2];
      if (outputItem.type === "embed" && outputItem.mimeType?.startsWith("image/") && !outputItem.isText) {
        pushImage(outputItem.mimeType, decodeBase64(outputItem.value), i2);
      }
    }
  } else if (isToolResultOutputDetails(resultDetails)) {
    const output = resultDetails.output;
    if (output.mimeType?.startsWith("image/")) {
      const data = getImageDataFromOutputDetails(resultDetails, toolInvocation);
      if (data) {
        pushImage(output.mimeType, data, 0);
      }
    }
  }
  return images;
}

async function extractImagesFromToolInvocationMessages(toolInvocation, readFile) {
  const message = toolInvocation.pastTenseMessage ?? toolInvocation.invocationMessage;
  if (!message || typeof message === "string" || !message.uris || Object.keys(message.uris).length === 0) {
    return [];
  }
  const images = [];
  for (const uriComponents of Object.values(message.uris)) {
    const uri5 = URI.revive(uriComponents);
    const mimeType = getMediaMime(uri5.path);
    if (mimeType?.startsWith("image/")) {
      let data;
      try {
        data = await readFile(uri5);
      } catch {
        continue;
      }
      const name = uri5.path.split("/").pop() ?? "image";
      images.push({
        id: uri5.toString(),
        uri: uri5,
        name,
        mimeType,
        data,
        source: localize(12912, null, toolInvocation.toolId),
        caption: message
      });
    }
  }
  return images;
}

function getImageDataFromOutputDetails(resultDetails, toolInvocation) {
  if (toolInvocation.kind === "toolInvocationSerialized") {
    const serializedDetails = resultDetails;
    if (serializedDetails.output.base64Data) {
      return decodeBase64(serializedDetails.output.base64Data);
    }
    return void 0;
  } else {
    return resultDetails.output.value;
  }
}

async function extractImageFromInlineReference(part, readFile) {
  const ref = part.inlineReference;
  const refUri = URI.isUri(ref) ? ref : isLocation(ref) ? ref.uri : ref.location.uri;
  const mime = getMediaMime(refUri.path);
  if (!mime?.startsWith("image/")) {
    return void 0;
  }
  let data;
  try {
    data = await readFile(refUri);
  } catch {
    return void 0;
  }
  const name = part.name ?? refUri.path.split("/").pop() ?? "image";
  return {
    id: refUri.toString(),
    uri: refUri,
    name,
    mimeType: mime,
    data,
    source: localize(12911, null),
    caption: void 0
  };
}

function coerceImageBuffer(value2) {
  if (value2 instanceof Uint8Array) {
    return value2;
  }
  if (value2 instanceof ArrayBuffer) {
    return new Uint8Array(value2);
  }
  if (!value2 || typeof value2 !== "object" || Array.isArray(value2)) {
    return void 0;
  }
  const record = value2;
  const keys = Object.keys(record).sort((a, b) => Number(a) - Number(b));
  if (keys.length === 0) {
    return void 0;
  }
  const result = new Uint8Array(keys.length);
  for (let index2 = 0; index2 < keys.length; index2++) {
    const byte = record[keys[index2]];
    if (keys[index2] !== String(index2) || typeof byte !== "number" || !Number.isInteger(byte) || byte < 0 || byte > 255) {
      return void 0;
    }
    result[index2] = byte;
  }
  return result;
}

function extractImagesFromChatRequest(request2) {
  return extractImagesFromChatVariables(request2.variables);
}

function extractImagesFromChatVariables(variables) {
  const images = [];
  for (const variable of variables) {
    if (!isImageVariableEntry(variable)) {
      continue;
    }
    const buffer = coerceImageBuffer(variable.value);
    if (!buffer) {
      continue;
    }
    const mimeType = variable.mimeType ?? getMediaMime(variable.name) ?? "image/png";
    const uri5 = variable.references?.[0]?.reference;
    const imageUri = URI.isUri(uri5) ? uri5 : URI.from({ scheme: "data", path: `${variable.id}/${encodeURIComponent(variable.name)}` });
    images.push({
      id: imageUri.toString(),
      uri: imageUri,
      name: variable.name,
      mimeType,
      data: VSBuffer.wrap(buffer),
      source: localize(12913, null),
      caption: void 0
    });
  }
  return images;
}
export { extractImagesFromChatResponse, extractImagesFromToolInvocationOutputDetails, extractImagesFromToolInvocationMessages, getImageDataFromOutputDetails, extractImageFromInlineReference, coerceImageBuffer, extractImagesFromChatRequest, extractImagesFromChatVariables };
