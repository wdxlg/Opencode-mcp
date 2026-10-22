// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatGeneratedImageResultSubPart.ts
import { getExtensionForMimeType } from "./module-0136.mjs";
import { ChatResponseResource } from "./module-1193.mjs";
import { IChatToolInvocation } from "./module-0972.mjs";
import { isToolResultInputOutputDetails } from "./module-0990.mjs";
import { BaseChatToolInvocationSubPart } from "./module-2323.mjs";
import { Emitter } from "./module-0017.mjs";
import { ChatResourceGroupWidget } from "./module-2286.mjs";
import { $ } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatGeneratedImageResultSubPart.ts
function getGeneratedImageResultParts(details, sessionResource, toolCallId) {
  if (!details) {
    return [];
  }
  const parts = [];
  for (let index2 = 0; index2 < details.output.length; index2++) {
    const output = details.output[index2];
    if (!output.mimeType?.startsWith("image/")) {
      continue;
    }
    if (output.type === "ref") {
      parts.push({ kind: "data", uri: output.uri, mimeType: output.mimeType, audience: output.audience });
      continue;
    }
    if (output.isText) {
      continue;
    }
    const extension = getExtensionForMimeType(output.mimeType) ?? "";
    const uri5 = ChatResponseResource.createUri(sessionResource, toolCallId, index2, `generated-image${extension}`);
    parts.push({ kind: "data", base64Value: output.value, mimeType: output.mimeType, uri: uri5, audience: output.audience });
  }
  return parts;
}

function getGeneratedImageResultDetails(toolInvocation) {
  const resultDetails = toolInvocation.kind === "toolInvocation" ? IChatToolInvocation.resultDetails(toolInvocation) : toolInvocation.resultDetails;
  return isToolResultInputOutputDetails(resultDetails) ? resultDetails : void 0;
}

function getGeneratedImageResultCount(content2) {
  let count2 = 0;
  for (const part of content2) {
    if (part.kind !== "toolInvocation" && part.kind !== "toolInvocationSerialized" || part.toolSpecificData?.kind !== "generatedImage") {
      continue;
    }
    const details = getGeneratedImageResultDetails(part);
    count2 += details?.output.filter((output) => output.mimeType?.startsWith("image/") && (output.type === "ref" || !output.isText)).length ?? 0;
  }
  return count2;
}

function getGeneratedImageResultPartsFromContent(content2, sessionResource) {
  const parts = [];
  for (const part of content2) {
    if (part.kind !== "toolInvocation" && part.kind !== "toolInvocationSerialized" || part.toolSpecificData?.kind !== "generatedImage") {
      continue;
    }
    parts.push(...getGeneratedImageResultParts(getGeneratedImageResultDetails(part), sessionResource, part.toolCallId));
  }
  if (parts.length < 2) {
    return parts;
  }
  return parts.map((part, index2) => ({
    ...part,
    // Distinguish each attachment in the gallery's visible and accessible labels.
    uri: part.uri.with({ path: part.uri.path.replace(/generated-image(?=\.[^/]+$|$)/, `generated-image-${index2 + 1}`) })
  }));
}

var ChatGeneratedImageResultSubPart = class extends BaseChatToolInvocationSubPart {
  constructor(toolInvocation, context2, instantiationService) {
    super(toolInvocation);
    this.codeblocks = [];
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    const parts = getGeneratedImageResultPartsFromContent(context2.content, context2.element.sessionResource);
    const resourceGroup = this._register(instantiationService.createInstance(ChatResourceGroupWidget, parts, { showImageInHover: false }));
    this._register(resourceGroup.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
    this.domNode = $(".chat-generated-image-result", void 0, resourceGroup.domNode);
    const hasMultipleGeneratedImages = getGeneratedImageResultCount(context2.content) > 1;
    this.domNode.classList.toggle("multiple", hasMultipleGeneratedImages);
  }
};

ChatGeneratedImageResultSubPart = __decorateClass([
  __decorateParam(2, IInstantiationService)
], ChatGeneratedImageResultSubPart);
export { getGeneratedImageResultParts, getGeneratedImageResultDetails, getGeneratedImageResultCount, getGeneratedImageResultPartsFromContent, ChatGeneratedImageResultSubPart };
