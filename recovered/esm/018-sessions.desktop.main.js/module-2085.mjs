// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/editor/chatPasteProviders.ts
import { HierarchicalKind } from "./module-0535.mjs";
import { basename2, joinPath } from "./module-0034.mjs";
import { cleanupOldImages, createFileForMedia, resizeImage } from "./module-0945.mjs";
import { IExtensionService, isProposedApiEnabled } from "./module-0889.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { ILogService } from "./module-0095.mjs";
import { Codicon } from "./module-0085.mjs";
import { chatInputSchemes, isChatInputModel } from "./module-0965.mjs";
import { VSDataTransfer, createStringDataTransferItem } from "./module-0264.mjs";
import { Mimes } from "./module-0136.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IOutlineModelService } from "./module-0691.mjs";
import { revive } from "./module-0265.mjs";
import { IChatPasteTargetService } from "./module-0982.mjs";
import { URI } from "./module-0032.mjs";
import { Range2 } from "./module-0106.mjs";
import { ChatPasteAttachmentMetadata, isImageVariableEntry, toPasteVariableEntry } from "./module-0980.mjs";
import { chatVariableLeader } from "./module-0988.mjs";
import { alert } from "./module-0076.mjs";
import { Position } from "./module-0079.mjs";
import { getDefinitionsAtPosition } from "./module-0646.mjs";
import { SymbolKinds } from "./module-0164.mjs";
import { convertHtmlToMarkdown } from "./module-2084.mjs";
import { Disposable } from "./module-0012.mjs";
import { Schemas } from "./module-0033.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/editor/chatPasteProviders.ts
var COPY_MIME_TYPES = "application/vnd.code.additional-editor-data";

var pastedTextArtifactDefaultMinLength = 1e4;

var pastedTextArtifactMinLines = 10;

var CHAT_ATTACHMENT_MIME_TYPE = "application/vnd.chat.attachment+json";

var PasteImageProvider = class {
  constructor(pasteTargetService, extensionService, fileService, environmentService, logService) {
    this.pasteTargetService = pasteTargetService;
    this.extensionService = extensionService;
    this.fileService = fileService;
    this.environmentService = environmentService;
    this.logService = logService;
    this.kind = new HierarchicalKind("chat.attach.image");
    this.providedPasteEditKinds = [this.kind];
    this.copyMimeTypes = [];
    this.pasteMimeTypes = ["image/*"];
    this.imagesFolder = joinPath(this.environmentService.workspaceStorageHome, "vscode-chat-images");
    cleanupOldImages(this.fileService, this.logService, this.imagesFolder);
  }
  async provideDocumentPasteEdits(model, ranges, dataTransfer, context2, token) {
    if (!this.extensionService.extensions.some((ext) => isProposedApiEnabled(ext, "chatReferenceBinaryData"))) {
      return;
    }
    const supportedMimeTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/bmp",
      "image/gif",
      "image/tiff"
    ];
    let mimeType;
    let imageItem;
    for (const type of supportedMimeTypes) {
      imageItem = dataTransfer.get(type);
      if (imageItem) {
        mimeType = type;
        break;
      }
    }
    if (!imageItem || !mimeType) {
      return;
    }
    const currClipboard = await imageItem.asFile()?.data();
    if (token.isCancellationRequested || !currClipboard) {
      return;
    }
    const target = this.pasteTargetService.getTarget(model.uri);
    if (!target) {
      return;
    }
    const attachedVariables = target.attachments;
    const displayName = localize(12542, null);
    let tempDisplayName = displayName;
    for (let appendValue = 2; attachedVariables.some((attachment) => attachment.name === tempDisplayName); appendValue++) {
      tempDisplayName = `${displayName} ${appendValue}`;
    }
    const fileReference = await createFileForMedia(this.fileService, this.imagesFolder, currClipboard, mimeType);
    if (token.isCancellationRequested || !fileReference) {
      return;
    }
    const scaledImageData = await resizeImage(currClipboard);
    if (token.isCancellationRequested || !scaledImageData) {
      return;
    }
    const scaledImageContext = await getImageAttachContext(scaledImageData, mimeType, token, tempDisplayName, fileReference);
    if (token.isCancellationRequested || !scaledImageContext) {
      return;
    }
    const currentContextIds = new Set(target.attachments.map((attachment) => attachment.id));
    if (currentContextIds.has(scaledImageContext.id)) {
      return;
    }
    const edit3 = createCustomPasteEdit(model, [scaledImageContext], mimeType, this.kind, localize(12541, null), this.pasteTargetService);
    return createEditSession(edit3);
  }
};

PasteImageProvider = __decorateClass([
  __decorateParam(2, IFileService),
  __decorateParam(3, IEnvironmentService),
  __decorateParam(4, ILogService)
], PasteImageProvider);

async function getImageAttachContext(data, mimeType, token, displayName, resource) {
  const imageHash = await imageToHash(data);
  if (token.isCancellationRequested) {
    return void 0;
  }
  return {
    kind: "image",
    value: data,
    id: imageHash,
    name: displayName,
    icon: Codicon.fileMedia,
    mimeType,
    isPasted: true,
    references: [{ reference: resource, kind: "reference" }]
  };
}

async function imageToHash(data) {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function isImage(array3) {
  if (array3.length < 4) {
    return false;
  }
  const identifier2 = {
    png: [137, 80, 78, 71, 13, 10, 26, 10],
    jpeg: [255, 216, 255],
    bmp: [66, 77],
    gif: [71, 73, 70, 56],
    tiff: [73, 73, 42, 0]
  };
  return Object.values(identifier2).some(
    (signature) => signature.every((byte, index2) => array3[index2] === byte)
  );
}

var CopyTextProvider = class {
  constructor(modelService, languageFeaturesService, outlineModelService) {
    this.modelService = modelService;
    this.languageFeaturesService = languageFeaturesService;
    this.outlineModelService = outlineModelService;
    this.providedPasteEditKinds = [];
    this.copyMimeTypes = [COPY_MIME_TYPES];
    this.pasteMimeTypes = [];
  }
  async prepareDocumentPaste(model, ranges, dataTransfer, token) {
    if (isChatInputModel(model.uri)) {
      return;
    }
    const customDataTransfer = new VSDataTransfer();
    const data = { range: ranges[0], uri: model.uri.toJSON() };
    customDataTransfer.append(COPY_MIME_TYPES, createStringDataTransferItem(JSON.stringify(data)));
    const text2 = dataTransfer.get(Mimes.text);
    if (text2 && ranges.length) {
      void this.primeSymbolReferenceCache(model, ranges[0], text2, token);
    }
    return customDataTransfer;
  }
  async primeSymbolReferenceCache(model, range2, textItem, token) {
    const copiedText = model.getValueInRange(range2);
    if (range2.startLineNumber !== range2.endLineNumber) {
      return;
    }
    if (token.isCancellationRequested || !identifierPattern.test(copiedText)) {
      return;
    }
    cacheSymbolReference(model.uri, range2, copiedText, resolveSymbolReference(
      this.modelService,
      this.languageFeaturesService,
      this.outlineModelService,
      model.uri,
      range2,
      copiedText,
      token
    ));
  }
};

CopyTextProvider = __decorateClass([
  __decorateParam(0, IModelService),
  __decorateParam(1, ILanguageFeaturesService),
  __decorateParam(2, IOutlineModelService)
], CopyTextProvider);

var CopyAttachmentsProvider = class {
  constructor(pasteTargetService) {
    this.pasteTargetService = pasteTargetService;
    this.kind = new HierarchicalKind("chat.attach.attachments");
    this.providedPasteEditKinds = [this.kind];
    this.copyMimeTypes = [CHAT_ATTACHMENT_MIME_TYPE];
    this.pasteMimeTypes = [CHAT_ATTACHMENT_MIME_TYPE];
  }
  async prepareDocumentPaste(model, _ranges, _dataTransfer, _token) {
    const target = this.pasteTargetService.getTarget(model.uri);
    if (!target) {
      return void 0;
    }
    const dynamicVariables = target.inlineReferences;
    const referencedIds = new Set(dynamicVariables.map((variable) => variable.id));
    const attachments = target.attachments.map((attachment) => attachment.range && !referencedIds.has(attachment.id) ? { ...attachment, range: void 0 } : attachment);
    if (attachments.length === 0 && dynamicVariables.length === 0) {
      return void 0;
    }
    const result = new VSDataTransfer();
    result.append(CHAT_ATTACHMENT_MIME_TYPE, createStringDataTransferItem(JSON.stringify({ attachments, dynamicVariables })));
    return result;
  }
  async provideDocumentPasteEdits(model, _ranges, dataTransfer, _context, token) {
    const target = this.pasteTargetService.getTarget(model.uri);
    if (!target) {
      return void 0;
    }
    const text2 = dataTransfer.get(Mimes.text);
    const data = dataTransfer.get(CHAT_ATTACHMENT_MIME_TYPE);
    const rawData = await data?.asString();
    const textdata = await text2?.asString();
    if (textdata === void 0 || rawData === void 0) {
      return;
    }
    if (token.isCancellationRequested) {
      return;
    }
    let pastedData;
    try {
      pastedData = revive(JSON.parse(rawData));
    } catch {
    }
    if (!Array.isArray(pastedData?.attachments) && !Array.isArray(pastedData?.dynamicVariables)) {
      return;
    }
    const edit3 = {
      insertText: textdata,
      title: localize(12539, null),
      kind: this.kind,
      handledMimeType: CHAT_ATTACHMENT_MIME_TYPE,
      additionalEdit: {
        edits: []
      }
    };
    edit3.additionalEdit?.edits.push({
      resource: model.uri,
      redo: () => {
        target.addAttachments(pastedData.attachments);
        for (const dynamicVariable of pastedData.dynamicVariables) {
          target.addInlineReference(dynamicVariable);
        }
      },
      undo: () => {
        target.removeAttachments(pastedData.attachments.map((c) => c.id));
      }
    });
    return createEditSession(edit3);
  }
};

CopyAttachmentsProvider = __decorateClass([
  __decorateParam(0, IChatPasteTargetService)
], CopyAttachmentsProvider);

var PasteTextProvider = class {
  constructor(pasteTargetService, modelService, logService, configurationService) {
    this.pasteTargetService = pasteTargetService;
    this.modelService = modelService;
    this.logService = logService;
    this.configurationService = configurationService;
    this.kind = new HierarchicalKind("chat.attach.text");
    this.providedPasteEditKinds = [this.kind];
    this.copyMimeTypes = [];
    this.pasteMimeTypes = [COPY_MIME_TYPES, Mimes.text];
  }
  async provideDocumentPasteEdits(model, ranges, dataTransfer, _context, token) {
    if (!isChatInputModel(model.uri)) {
      return;
    }
    const text2 = dataTransfer.get(Mimes.text);
    const editorData = dataTransfer.get("vscode-editor-data");
    const additionalEditorData = dataTransfer.get(COPY_MIME_TYPES);
    if (!text2) {
      return;
    }
    const textdata = await text2.asString();
    const target = this.pasteTargetService.getTarget(model.uri);
    if (!target) {
      return;
    }
    let copiedContext;
    if (editorData && additionalEditorData) {
      try {
        const metadata = JSON.parse(await editorData.asString());
        const additionalData = JSON.parse(await additionalEditorData.asString());
        const start = additionalData.range.startLineNumber;
        const end = additionalData.range.endLineNumber;
        let isWholeLine = true;
        if (start === end) {
          const textModel = this.modelService.getModel(URI.revive(additionalData.uri));
          isWholeLine = !!textModel && start >= 1 && start <= textModel.getLineCount() && textModel.getLineContent(start) === textdata;
        }
        if (isWholeLine) {
          copiedContext = getCopiedContext(textdata, URI.revive(additionalData.uri), metadata.mode, additionalData.range);
        }
      } catch (error) {
        this.logService.warn("Failed to read copied text metadata", error);
      }
    }
    if (token.isCancellationRequested) {
      return;
    }
    const hasRicherPaste = !!copiedContext || dataTransfer.has(CHAT_ATTACHMENT_MIME_TYPE) || dataTransfer.matches("image/*");
    const markdown = hasRicherPaste ? void 0 : await getMeaningfulMarkdown(dataTransfer);
    if (token.isCancellationRequested) {
      return;
    }
    const artifact = hasRicherPaste ? void 0 : createPastedTextArtifact(textdata, target.attachments, {
      content: markdown,
      minLength: this.configurationService.getValue("chat.pasteAsAttachmentThreshold" /* PasteAsAttachmentThreshold */, { resource: model.uri })
    });
    if (artifact) {
      if (ranges.length !== 1 || target.isTerminalCommandPaste(textdata, ranges[0])) {
        return;
      }
      const pasteRange = ranges[0];
      const referenceRange = new Range2(
        pasteRange.startLineNumber,
        pasteRange.startColumn,
        pasteRange.startLineNumber,
        pasteRange.startColumn + artifact.referenceText.length
      );
      const referenceOffset = model.getOffsetAt(referenceRange.getStartPosition());
      const edit4 = createCustomPasteEdit(
        model,
        [{
          ...artifact.attachment,
          range: { start: referenceOffset, endExclusive: referenceOffset + artifact.referenceText.length }
        }],
        Mimes.text,
        this.kind,
        localize(12544, null),
        this.pasteTargetService,
        {
          inlineReference: { text: artifact.referenceText, range: referenceRange },
          announcement: localize(12535, null, artifact.attachment.name)
        }
      );
      return createEditSession(edit4);
    }
    if (!copiedContext) {
      return;
    }
    const currentContextIds = new Set(target.attachments.map((attachment) => attachment.id));
    if (currentContextIds.has(copiedContext.id)) {
      return;
    }
    const edit3 = createCustomPasteEdit(model, [copiedContext], Mimes.text, this.kind, localize(12540, null), this.pasteTargetService);
    edit3.yieldTo = [{ kind: HierarchicalKind.Empty.append("text", "plain") }];
    return createEditSession(edit3);
  }
};

function createPastedTextArtifact(text2, existingAttachments, options3) {
  const trimmed = text2.trim();
  const minLength = options3?.minLength ?? pastedTextArtifactDefaultMinLength;
  if (trimmed.length < minLength || countLines2(trimmed) < pastedTextArtifactMinLines) {
    return void 0;
  }
  let index2 = 1;
  let name;
  do {
    name = localize(12546, null, index2++);
  } while (existingAttachments.some((attachment2) => attachment2.name === name));
  const content = options3?.content;
  const value2 = content ?? text2;
  const lineCount = countLines2(value2);
  const pastedLines = lineCount === 1 ? localize(12547, null) : localize(12545, null, lineCount);
  const attachment = toPasteVariableEntry(name, value2, {
    language: content ? "markdown" : "plaintext",
    fileName: name,
    pastedLines,
    _meta: { [ChatPasteAttachmentMetadata.TextArtifact]: true }
  });
  return {
    attachment,
    referenceText: `${chatVariableLeader}attachment:${name}`
  };
}

function countLines2(value2) {
  return value2.split(/\r\n|\r|\n/).length;
}

function getCopiedContext(code, file, language2, range2) {
  const fileName = basename2(file);
  const start = range2.startLineNumber;
  const end = range2.endLineNumber;
  const resultText = `Copied Selection of Code: 


 From the file: ${fileName} From lines ${start} to ${end} 
 \`\`\`${code}\`\`\``;
  const pastedLines = start === end ? localize(12538, null) : localize(12537, null, end + 1 - start);
  return {
    kind: "paste",
    value: resultText,
    id: `${fileName}${start}${end}${range2.startColumn}${range2.endColumn}`,
    name: `${fileName} ${pastedLines}`,
    icon: Codicon.code,
    pastedLines,
    language: language2,
    fileName: file.toString(),
    copiedFrom: {
      uri: file,
      range: range2
    },
    code,
    references: [{
      reference: file,
      kind: "reference"
    }]
  };
}

function createCustomPasteEdit(model, context2, handledMimeType, kind, title, pasteTargetService, options3) {
  const label3 = context2.length === 1 ? context2[0].name : localize(12536, null, context2[0].name, context2.length - 1);
  const announceImageAttachment = context2.length === 1 && isImageVariableEntry(context2[0]);
  const inlineReference = context2.length === 1 ? options3?.inlineReference : void 0;
  const resolveTarget = (operation) => {
    const target = pasteTargetService.getTarget(model.uri);
    if (!target) {
      throw new Error(`No chat paste target found for ${operation}`);
    }
    return target;
  };
  const customEdit = {
    resource: model.uri,
    variable: context2,
    undo: () => {
      resolveTarget("undo").removeAttachments(context2.map((c) => c.id));
    },
    redo: () => {
      const target = resolveTarget("redo");
      if (inlineReference) {
        target.addInlineAttachment(context2[0], inlineReference.text, inlineReference.range);
      } else {
        target.addAttachments(context2);
      }
      if (options3?.announcement) {
        alert(options3.announcement);
      } else if (announceImageAttachment) {
        alert(localize(12534, null));
      }
    },
    metadata: {
      needsConfirmation: false,
      label: label3
    }
  };
  return {
    insertText: options3?.inlineReference ? `${options3.inlineReference.text} ` : "",
    title,
    kind,
    handledMimeType,
    additionalEdit: {
      edits: [customEdit]
    }
  };
}

function createEditSession(edit3) {
  return {
    edits: [edit3],
    dispose: () => {
    }
  };
}

var identifierPattern = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

var symbolCacheMaxSize = 3;

var symbolReferenceCache = [];

function getSymbolReferenceCacheKey(uri4, range2, text2) {
  return `${uri4.toString()}|${range2.startLineNumber}:${range2.startColumn}-${range2.endLineNumber}:${range2.endColumn}|${text2}`;
}

async function getCachedSymbolReference(uri4, range2, text2) {
  const key3 = getSymbolReferenceCacheKey(uri4, range2, text2);
  return symbolReferenceCache.find((e4) => e4.key === key3)?.promise;
}

function cacheSymbolReference(uri4, range2, text2, valuePromise) {
  const entry = {
    key: getSymbolReferenceCacheKey(uri4, range2, text2),
    promise: valuePromise
  };
  symbolReferenceCache.unshift(entry);
  while (symbolReferenceCache.length > symbolCacheMaxSize) {
    symbolReferenceCache.pop();
  }
  valuePromise.catch(() => {
    const i2 = symbolReferenceCache.indexOf(entry);
    if (i2 !== -1) {
      symbolReferenceCache.splice(i2, 1);
    }
  });
}

async function resolveSymbolReference(modelService, languageFeaturesService, outlineModelService, sourceUri, sourceRange, pastedText, token) {
  const sourceModel = modelService.getModel(sourceUri);
  if (!sourceModel) {
    return;
  }
  const sourcePosition = new Position(sourceRange.startLineNumber, sourceRange.startColumn);
  const definitions3 = await getDefinitionsAtPosition(languageFeaturesService.definitionProvider, sourceModel, sourcePosition, false, token);
  if (token.isCancellationRequested || !definitions3.length) {
    return;
  }
  const def2 = definitions3[0];
  const defRange = def2.targetSelectionRange ?? def2.range;
  const defLocation = { uri: def2.uri, range: defRange };
  let icon2 = Codicon.symbolProperty;
  const defModel = modelService.getModel(def2.uri);
  if (defModel) {
    try {
      const outline = await outlineModelService.getOrCreate(defModel, token);
      if (!token.isCancellationRequested) {
        const element = outline.getItemEnclosingPosition({ lineNumber: defRange.startLineNumber, column: defRange.startColumn });
        if (element) {
          icon2 = SymbolKinds.toIcon(element.symbol.kind);
        }
      }
    } catch {
    }
  }
  if (token.isCancellationRequested) {
    return;
  }
  return {
    id: `vscode.symbol/${JSON.stringify(defLocation)}`,
    fullName: pastedText,
    data: defLocation,
    icon: icon2
  };
}

var PasteSymbolProvider = class {
  constructor(pasteTargetService, modelService, languageFeaturesService, outlineModelService) {
    this.pasteTargetService = pasteTargetService;
    this.modelService = modelService;
    this.languageFeaturesService = languageFeaturesService;
    this.outlineModelService = outlineModelService;
    this.kind = new HierarchicalKind("chat.attach.symbol");
    this.providedPasteEditKinds = [this.kind];
    this.copyMimeTypes = [];
    this.pasteMimeTypes = [COPY_MIME_TYPES];
  }
  async provideDocumentPasteEdits(model, ranges, dataTransfer, _context, token) {
    if (!isChatInputModel(model.uri)) {
      return;
    }
    const text2 = dataTransfer.get(Mimes.text);
    const additionalEditorData = dataTransfer.get(COPY_MIME_TYPES);
    if (!text2 || !additionalEditorData) {
      return;
    }
    const pastedText = await text2.asString();
    if (!identifierPattern.test(pastedText)) {
      return;
    }
    let additionalData;
    try {
      additionalData = JSON.parse(await additionalEditorData.asString());
    } catch {
      return;
    }
    const sourceUri = URI.revive(additionalData.uri);
    const sourceRange = additionalData.range;
    if (!this.pasteTargetService.getTarget(model.uri)) {
      return;
    }
    const cached = await getCachedSymbolReference(sourceUri, sourceRange, pastedText);
    let resolved = cached;
    if (!resolved) {
      resolved = await resolveSymbolReference(
        this.modelService,
        this.languageFeaturesService,
        this.outlineModelService,
        sourceUri,
        sourceRange,
        pastedText,
        token
      );
    }
    if (!resolved) {
      return;
    }
    if (token.isCancellationRequested) {
      return;
    }
    const symText = `${chatVariableLeader}sym:${pastedText}`;
    const pasteRange = ranges[0];
    const insertText = `${symText} `;
    const refRange = {
      startLineNumber: pasteRange.startLineNumber,
      startColumn: pasteRange.startColumn,
      endLineNumber: pasteRange.startLineNumber,
      endColumn: pasteRange.startColumn + symText.length
    };
    const dynamicRef = {
      id: resolved.id,
      fullName: resolved.fullName,
      range: refRange,
      data: resolved.data,
      icon: resolved.icon
    };
    const edit3 = {
      insertText,
      title: localize(12543, null),
      kind: this.kind,
      handledMimeType: COPY_MIME_TYPES,
      additionalEdit: {
        edits: [{
          resource: model.uri,
          redo: () => {
            this.pasteTargetService.getTarget(model.uri)?.addInlineReference(dynamicRef);
          },
          undo: () => {
          }
        }]
      }
    };
    edit3.yieldTo = [{ kind: new HierarchicalKind("chat.attach.text") }];
    return createEditSession(edit3);
  }
};

PasteSymbolProvider = __decorateClass([
  __decorateParam(0, IChatPasteTargetService),
  __decorateParam(1, IModelService),
  __decorateParam(2, ILanguageFeaturesService),
  __decorateParam(3, IOutlineModelService)
], PasteSymbolProvider);

var PasteHtmlProvider2 = class {
  constructor() {
    this.kind = new HierarchicalKind("chat.paste.html");
    this.providedPasteEditKinds = [this.kind];
    this.copyMimeTypes = [];
    this.pasteMimeTypes = [Mimes.html];
  }
  async provideDocumentPasteEdits(model, _ranges, dataTransfer, context2, token) {
    if (!isChatInputModel(model.uri)) {
      return;
    }
    if (context2.triggerKind !== 0 /* Automatic */) {
      return;
    }
    const entry = dataTransfer.get(Mimes.html);
    const htmlText = await entry?.asString();
    if (!htmlText || token.isCancellationRequested) {
      return;
    }
    if (!isMeaningfulHtml(htmlText)) {
      return;
    }
    const markdown = convertHtmlToMarkdown(htmlText);
    if (!markdown) {
      return;
    }
    return createEditSession({
      insertText: markdown,
      title: localize(12548, null),
      kind: this.kind,
      handledMimeType: Mimes.html,
      yieldTo: [
        { kind: new HierarchicalKind("chat.attach.text") },
        { kind: new HierarchicalKind("chat.attach.image") }
      ]
    });
  }
};

async function getMeaningfulMarkdown(dataTransfer) {
  const htmlText = await dataTransfer.get(Mimes.html)?.asString();
  if (!htmlText || !isMeaningfulHtml(htmlText)) {
    return void 0;
  }
  return convertHtmlToMarkdown(htmlText) || void 0;
}

function isMeaningfulHtml(value2) {
  return /<(a|strong|b|em|i|h[1-6]|code|pre|ul|ol|li|blockquote|del|s|strike|img|hr)\b/i.test(value2);
}

var ChatPasteProvidersFeature = class extends Disposable {
  constructor(instaService, languageFeaturesService, pasteTargetService, extensionService, fileService, modelService, environmentService, logService, configurationService) {
    super();
    const chatInputProviders = [
      instaService.createInstance(CopyAttachmentsProvider),
      new PasteImageProvider(pasteTargetService, extensionService, fileService, environmentService, logService),
      new PasteTextProvider(pasteTargetService, modelService, logService, configurationService),
      new PasteHtmlProvider2()
    ];
    for (const scheme of chatInputSchemes) {
      for (const provider of chatInputProviders) {
        this._register(languageFeaturesService.documentPasteEditProvider.register({ scheme, pattern: "*", hasAccessToAllModels: true }, provider));
      }
    }
    this._register(languageFeaturesService.documentPasteEditProvider.register({ scheme: Schemas.vscodeChatInput, pattern: "*", hasAccessToAllModels: true }, instaService.createInstance(PasteSymbolProvider)));
    this._register(languageFeaturesService.documentPasteEditProvider.register("*", instaService.createInstance(CopyTextProvider)));
  }
};

ChatPasteProvidersFeature = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ILanguageFeaturesService),
  __decorateParam(2, IChatPasteTargetService),
  __decorateParam(3, IExtensionService),
  __decorateParam(4, IFileService),
  __decorateParam(5, IModelService),
  __decorateParam(6, IEnvironmentService),
  __decorateParam(7, ILogService),
  __decorateParam(8, IConfigurationService)
], ChatPasteProvidersFeature);
export { getImageAttachContext, imageToHash, isImage, createPastedTextArtifact, countLines2, getCopiedContext, createCustomPasteEdit, createEditSession, getSymbolReferenceCacheKey, getCachedSymbolReference, cacheSymbolReference, resolveSymbolReference, getMeaningfulMarkdown, isMeaningfulHtml, COPY_MIME_TYPES, pastedTextArtifactDefaultMinLength, pastedTextArtifactMinLines, CHAT_ATTACHMENT_MIME_TYPE, PasteImageProvider, CopyTextProvider, CopyAttachmentsProvider, PasteTextProvider, identifierPattern, symbolCacheMaxSize, symbolReferenceCache, PasteSymbolProvider, PasteHtmlProvider2, ChatPasteProvidersFeature };
