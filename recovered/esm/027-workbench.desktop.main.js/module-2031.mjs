// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatImageCarouselService.ts
import { createDecorator } from "./module-0077.mjs";
import { isRequestVM, isResponseVM } from "./module-0978.mjs";
import { extractImagesFromChatRequest, extractImagesFromChatResponse, extractImagesFromChatVariables } from "./module-1194.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { localize } from "./module-0001.mjs";
import { stripIcons } from "./module-0461.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";
import { getMediaMime } from "./module-0136.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IFileService } from "./module-0269.mjs";


// src/vs/workbench/contrib/chat/browser/chatImageCarouselService.ts
var IChatImageCarouselService = createDecorator("chatImageCarouselService");

async function collectCarouselSections(items, readFile, currentInput) {
  const sections = [];
  const requestMap = /* @__PURE__ */ new Map();
  for (const item of items) {
    if (isRequestVM(item)) {
      requestMap.set(item.id, item);
    }
  }
  for (const item of items) {
    if (!isResponseVM(item)) {
      continue;
    }
    const { title: extractedTitle, images: responseImages } = await extractImagesFromChatResponse(item, async (uri5) => VSBuffer.wrap(await readFile(uri5)));
    const request2 = requestMap.get(item.requestId);
    const requestImages = request2 ? extractImagesFromChatRequest(request2) : [];
    const allImages = [...requestImages, ...responseImages];
    const dedupedImages = deduplicateConsecutiveImages(allImages);
    if (dedupedImages.length > 0) {
      sections.push({
        title: request2?.messageText ?? extractedTitle,
        images: dedupedImages.map(({ uri: uri5, name, mimeType, data, caption }) => ({ id: uri5.toString(), name, mimeType, data: data.buffer, caption: toCaptionText(caption) }))
      });
    }
  }
  const respondedRequestIds = new Set(
    items.filter(isResponseVM).map((r2) => r2.requestId)
  );
  for (const item of items) {
    if (!isRequestVM(item) || respondedRequestIds.has(item.id)) {
      continue;
    }
    const requestImages = extractImagesFromChatRequest(item);
    const dedupedImages = deduplicateConsecutiveImages(requestImages);
    if (dedupedImages.length > 0) {
      sections.push({
        title: item.messageText,
        images: dedupedImages.map(({ uri: uri5, name, mimeType, data, caption }) => ({ id: uri5.toString(), name, mimeType, data: data.buffer, caption: toCaptionText(caption) }))
      });
    }
  }
  if (currentInput) {
    const inputImages = deduplicateConsecutiveImages(extractImagesFromChatVariables(currentInput.attachments));
    if (inputImages.length > 0) {
      sections.push({
        title: currentInput.text.trim() || localize(10887, null),
        images: inputImages.map(({ uri: uri5, name, mimeType, data, caption }) => ({ id: uri5.toString(), name, mimeType, data: data.buffer, caption: toCaptionText(caption) }))
      });
    }
  }
  return sections;
}

function toCaptionText(caption) {
  if (caption === void 0) {
    return void 0;
  }
  return typeof caption === "string" ? caption : stripIcons(renderAsPlaintext(caption, { useLinkFormatter: true }));
}

function deduplicateConsecutiveImages(images) {
  return images.filter((img, index2) => {
    if (index2 === 0) {
      return true;
    }
    return !isEqual2(images[index2 - 1].uri, img.uri);
  });
}

function findClickedImageIndex(sections, resource, data, preferredSectionIndex) {
  if (preferredSectionIndex !== void 0 && preferredSectionIndex >= 0 && preferredSectionIndex < sections.length) {
    const preferredSection = sections[preferredSectionIndex];
    const uriIndex = findImageInListByUri(preferredSection.images, resource);
    const localIndex = uriIndex >= 0 ? uriIndex : data ? findImageInListByData(preferredSection.images, data) : -1;
    if (localIndex >= 0) {
      return sections.slice(0, preferredSectionIndex).reduce((total, section) => total + section.images.length, 0) + localIndex;
    }
  }
  let globalOffset = 0;
  for (const section of sections) {
    const localIndex = findImageInListByUri(section.images, resource);
    if (localIndex >= 0) {
      return globalOffset + localIndex;
    }
    globalOffset += section.images.length;
  }
  if (!data) {
    return -1;
  }
  globalOffset = 0;
  for (const section of sections) {
    const localIndex = findImageInListByData(section.images, data);
    if (localIndex >= 0) {
      return globalOffset + localIndex;
    }
    globalOffset += section.images.length;
  }
  return -1;
}

function findImageInListByUri(images, resource) {
  const uriStr = resource.toString();
  const byUri = images.findIndex((img) => img.id === uriStr);
  if (byUri >= 0) {
    return byUri;
  }
  const byParsedUri = images.findIndex((img) => {
    try {
      return isEqual2(URI.parse(img.id), resource);
    } catch {
      return false;
    }
  });
  if (byParsedUri >= 0) {
    return byParsedUri;
  }
  return -1;
}

function findImageInListByData(images, data) {
  const wrapped = VSBuffer.wrap(data);
  return images.findIndex((img) => VSBuffer.wrap(img.data).equals(wrapped));
}

function buildCollectionArgs(sections, clickedGlobalIndex, sessionResource) {
  const collectionId = sessionResource.toString() + "_carousel";
  const defaultTitle = localize(10886, null);
  return {
    collection: {
      id: collectionId,
      title: sections.length === 1 ? sections[0].title || defaultTitle : defaultTitle,
      sections
    },
    startIndex: clickedGlobalIndex
  };
}

function buildSingleImageArgs(resource, data) {
  let name = resource.path.split("/").pop() ?? "image";
  try {
    name = decodeURIComponent(name);
  } catch {
  }
  const mimeType = getMediaMime(resource.path) ?? getMediaMime(name) ?? "image/png";
  return { name, mimeType, data, title: name };
}

var CAROUSEL_COMMAND = "workbench.action.chat.openImageInCarousel";

var ChatImageCarouselService = class {
  constructor(chatWidgetService, commandService, fileService) {
    this.chatWidgetService = chatWidgetService;
    this.commandService = commandService;
    this.fileService = fileService;
  }
  async openCarouselAtResource(resource, data, options3) {
    const widget = this.chatWidgetService.lastFocusedWidget;
    if (!widget?.viewModel) {
      await this.openSingleImage(resource, data);
      return;
    }
    const items = widget.viewModel.getItems().filter(
      (item) => isRequestVM(item) || isResponseVM(item)
    );
    const readFile = async (uri5) => (await this.fileService.readFile(uri5)).value.buffer;
    const sections = await collectCarouselSections(items, readFile);
    const currentInputSections = await collectCarouselSections([], readFile, {
      text: widget.getInput(),
      attachments: widget.attachmentModel.attachments
    });
    const preferredSectionIndex = options3?.preferCurrentInput && currentInputSections.length > 0 ? sections.length : void 0;
    sections.push(...currentInputSections);
    const clickedGlobalIndex = findClickedImageIndex(sections, resource, data, preferredSectionIndex);
    if (clickedGlobalIndex === -1 || sections.length === 0) {
      await this.openSingleImage(resource, data);
      return;
    }
    const args2 = buildCollectionArgs(sections, clickedGlobalIndex, widget.viewModel.sessionResource);
    await this.commandService.executeCommand(CAROUSEL_COMMAND, args2);
  }
  async openSingleImage(resource, data) {
    if (!data) {
      const content2 = await this.fileService.readFile(resource);
      data = content2.value.buffer;
    }
    const args2 = buildSingleImageArgs(resource, data);
    await this.commandService.executeCommand(CAROUSEL_COMMAND, args2);
  }
};

ChatImageCarouselService = __decorateClass([
  __decorateParam(0, IChatWidgetService),
  __decorateParam(1, ICommandService),
  __decorateParam(2, IFileService)
], ChatImageCarouselService);
export { collectCarouselSections, toCaptionText, deduplicateConsecutiveImages, findClickedImageIndex, findImageInListByUri, findImageInListByData, buildCollectionArgs, buildSingleImageArgs, IChatImageCarouselService, CAROUSEL_COMMAND, ChatImageCarouselService };
