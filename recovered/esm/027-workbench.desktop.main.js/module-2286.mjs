// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatResourceGroupWidget.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { h } from "./module-0075.mjs";
import { generateUuid } from "./module-0190.mjs";
import { basename2, extname2, joinPath } from "./module-0034.mjs";
import { ChatAttachmentsContentPart } from "./module-2034.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { decodeBase64 } from "./module-0038.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IFileService } from "./module-0269.mjs";
import { CHAT_ATTACHABLE_IMAGE_MIME_TYPES, getAttachableImageExtension } from "./module-1193.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IProgressService } from "./module-0446.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ILabelService } from "./module-0641.mjs";
import { REVEAL_IN_EXPLORER_COMMAND_ID } from "./module-2017.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatResourceGroupWidget.ts
var IMAGE_DECODE_DELAY_MS = 100;

var ChatResourceGroupWidget = class extends Disposable {
  constructor(parts, _options, _instantiationService, _contextMenuService, _fileService) {
    super();
    this._options = _options;
    this._instantiationService = _instantiationService;
    this._contextMenuService = _contextMenuService;
    this._fileService = _fileService;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    const el = h(".chat-collapsible-io-resource-group", [
      h(".chat-collapsible-io-resource-items@items"),
      h(".chat-collapsible-io-resource-actions@actions")
    ]);
    this.domNode = el.root;
    this._fillInResourceGroup(parts, el.items, el.actions);
  }
  async _fillInResourceGroup(parts, itemsContainer, actionsContainer) {
    const entries2 = [];
    const deferredImageParts = [];
    for (let i2 = 0; i2 < parts.length; i2++) {
      const part = parts[i2];
      const imageMimeType = getResourceImageMimeType(part);
      if (imageMimeType) {
        if (part.base64Value) {
          entries2.push({ kind: "file", id: generateUuid(), name: basename2(part.uri), fullName: part.uri.path, value: part.uri });
          deferredImageParts.push({ index: i2, part, mimeType: imageMimeType });
        } else if (part.value) {
          entries2.push({ kind: "image", id: generateUuid(), name: basename2(part.uri), value: part.value, mimeType: imageMimeType, isURL: false, references: [{ kind: "reference", reference: part.uri }] });
        } else {
          const value2 = await this._fileService.readFile(part.uri).then((f) => f.value.buffer, () => void 0);
          if (!value2) {
            entries2.push({ kind: "file", id: generateUuid(), name: basename2(part.uri), fullName: part.uri.path, value: part.uri });
          } else {
            entries2.push({ kind: "image", id: generateUuid(), name: basename2(part.uri), value: value2, mimeType: imageMimeType, isURL: false, references: [{ kind: "reference", reference: part.uri }] });
          }
        }
      } else {
        entries2.push({ kind: "file", id: generateUuid(), name: basename2(part.uri), fullName: part.uri.path, value: part.uri });
      }
    }
    if (this._store.isDisposed) {
      return;
    }
    const attachments = this._register(this._instantiationService.createInstance(
      ChatAttachmentsContentPart,
      {
        variables: entries2,
        limit: 5,
        contentReferences: void 0,
        domNode: void 0,
        showImageInHover: this._options?.showImageInHover
      }
    ));
    attachments.contextMenuHandler = (attachment, event) => {
      const index2 = entries2.indexOf(attachment);
      const part = parts[index2];
      if (part) {
        event.preventDefault();
        event.stopPropagation();
        this._contextMenuService.showContextMenu({
          menuId: MenuId.ChatToolOutputResourceContext,
          menuActionOptions: { shouldForwardArgs: true },
          getAnchor: () => ({ x: event.pageX, y: event.pageY }),
          getActionsContext: () => ({ parts: [part] })
        });
      }
    };
    itemsContainer.appendChild(attachments.domNode);
    this._onDidChangeHeight.fire();
    const toolbar = this._register(this._instantiationService.createInstance(MenuWorkbenchToolBar, actionsContainer, MenuId.ChatToolOutputResourceToolbar, {
      menuOptions: {
        shouldForwardArgs: true
      }
    }));
    toolbar.context = { parts };
    if (deferredImageParts.length > 0) {
      this._register(disposableTimeout(() => {
        for (const { index: index2, part, mimeType } of deferredImageParts) {
          try {
            const value2 = decodeBase64(part.base64Value).buffer;
            entries2[index2] = { kind: "image", id: generateUuid(), name: basename2(part.uri), value: value2, mimeType, isURL: false, references: [{ kind: "reference", reference: part.uri }] };
          } catch {
          }
        }
        attachments.updateVariables(entries2);
        this._onDidChangeHeight.fire();
      }, IMAGE_DECODE_DELAY_MS));
    }
  }
};

ChatResourceGroupWidget = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IFileService)
], ChatResourceGroupWidget);

function getResourceImageMimeType(part) {
  if (part.mimeType && getAttachableImageExtension(part.mimeType)) {
    return part.mimeType;
  }
  const extension = extname2(part.uri).slice(1).toLowerCase();
  return CHAT_ATTACHABLE_IMAGE_MIME_TYPES[extension];
}

var SaveResourcesAction = class _SaveResourcesAction extends Action2 {
  static {
    this.ID = "chat.toolOutput.save";
  }
  constructor() {
    super({
      id: _SaveResourcesAction.ID,
      title: localize2(12060, "Save..."),
      icon: Codicon.cloudDownload,
      menu: [{
        id: MenuId.ChatToolOutputResourceToolbar,
        group: "navigation",
        order: 1
      }, {
        id: MenuId.ChatToolOutputResourceContext
      }]
    });
  }
  async run(accessor, context2) {
    const fileDialog = accessor.get(IFileDialogService);
    const fileService = accessor.get(IFileService);
    const notificationService = accessor.get(INotificationService);
    const progressService = accessor.get(IProgressService);
    const workspaceContextService = accessor.get(IWorkspaceContextService);
    const commandService = accessor.get(ICommandService);
    const labelService = accessor.get(ILabelService);
    const defaultFilepath = await fileDialog.defaultFilePath();
    const savePart = async (part, isFolder, uri5) => {
      const target = isFolder ? joinPath(uri5, basename2(part.uri)) : uri5;
      try {
        if (part.kind === "data") {
          await fileService.copy(part.uri, target, true);
        } else {
          const contents = await fileService.readFile(part.uri);
          await fileService.writeFile(target, contents.value);
        }
      } catch (e) {
        notificationService.error(localize(12061, null, basename2(part.uri), e));
      }
    };
    const withProgress = async (thenReveal, todo) => {
      await progressService.withProgress({
        location: 15 /* Notification */,
        delay: 5e3,
        title: localize(12062, null)
      }, async (report) => {
        for (const task of todo) {
          await task();
          report.report({ increment: 1, total: todo.length });
        }
      });
      if (workspaceContextService.isInsideWorkspace(thenReveal)) {
        commandService.executeCommand(REVEAL_IN_EXPLORER_COMMAND_ID, thenReveal);
      } else {
        notificationService.info(localize(12063, null, labelService.getUriLabel(thenReveal)));
      }
    };
    if (context2.parts.length === 1) {
      const part = context2.parts[0];
      const uri5 = await fileDialog.pickFileToSave(joinPath(defaultFilepath, basename2(part.uri)));
      if (!uri5) {
        return;
      }
      await withProgress(uri5, [() => savePart(part, false, uri5)]);
    } else {
      const uris = await fileDialog.showOpenDialog({
        title: localize(12064, null),
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        defaultUri: workspaceContextService.getWorkspace().folders[0]?.uri
      });
      if (!uris?.length) {
        return;
      }
      await withProgress(uris[0], context2.parts.map((part) => () => savePart(part, true, uris[0])));
    }
  }
};

registerAction2(SaveResourcesAction);
export { getResourceImageMimeType, IMAGE_DECODE_DELAY_MS, ChatResourceGroupWidget, SaveResourcesAction };
