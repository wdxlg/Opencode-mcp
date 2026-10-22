// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/imageCarousel/browser/imageCarousel.contribution.ts
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { EditorExtensions } from "./module-0926.mjs";
import { EditorPaneDescriptor } from "./module-1085.mjs";
import { ImageCarouselEditor } from "./module-2888.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { ImageCarouselEditorInput } from "./module-2886.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { IEditorService } from "./module-0935.mjs";
import { generateUuid } from "./module-0190.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { basename2, dirname2, extname2 } from "./module-0034.mjs";
import { getMediaMime } from "./module-0136.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ExplorerFolderContext } from "./module-1534.mjs";
import { ResourceContextKey } from "./module-0950.mjs";
import { IExplorerService } from "./module-1997.mjs";
import { IFileService } from "./module-0269.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { URI } from "./module-0032.mjs";
import { ResourceSet } from "./module-0008.mjs";


// src/vs/workbench/contrib/imageCarousel/browser/imageCarousel.contribution.ts
Registry.as(Extensions4.Configuration).registerConfiguration({
  id: "imageCarousel",
  title: localize(16116, null),
  type: "object",
  properties: {
    "imageCarousel.explorerContextMenu.enabled": {
      type: "boolean",
      default: true,
      markdownDescription: localize(16113, null),
      tags: ["experimental"]
    },
    "imageCarousel.chat.enabled": {
      type: "boolean",
      default: true,
      description: localize(16112, null)
    }
  }
});

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    ImageCarouselEditor,
    ImageCarouselEditor.ID,
    localize(16117, null)
  ),
  [
    new SyncDescriptor(ImageCarouselEditorInput)
  ]
);

var ImageCarouselEditorInputSerializer = class {
  canSerialize() {
    return false;
  }
  serialize() {
    return void 0;
  }
  deserialize() {
    return void 0;
  }
};

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(ImageCarouselEditorInput.ID, ImageCarouselEditorInputSerializer);

function isCollectionArgs(args2) {
  return typeof args2 === "object" && args2 !== null && typeof args2.collection === "object" && typeof args2.startIndex === "number";
}

function isSingleImageArgs(args2) {
  return typeof args2 === "object" && args2 !== null && typeof args2.name === "string" && typeof args2.mimeType === "string" && args2.data instanceof Uint8Array;
}

var OpenImageInCarouselAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.openImageInCarousel",
      title: localize2(16119, "Open in Images Preview"),
      f1: false
    });
  }
  async run(accessor, args2) {
    const editorService = accessor.get(IEditorService);
    let collection;
    let startIndex;
    if (isCollectionArgs(args2)) {
      collection = args2.collection;
      startIndex = args2.startIndex;
    } else if (isSingleImageArgs(args2)) {
      collection = {
        id: generateUuid(),
        title: args2.title ?? localize(16115, null),
        sections: [{
          title: "",
          images: [{
            id: generateUuid(),
            name: args2.name,
            mimeType: args2.mimeType,
            data: VSBuffer.wrap(args2.data)
          }]
        }]
      };
      startIndex = 0;
    } else {
      return;
    }
    const input = new ImageCarouselEditorInput(collection, startIndex);
    await editorService.openEditor(input, { pinned: true });
  }
};

registerAction2(OpenImageInCarouselAction);

var MEDIA_EXTENSION_REGEX = /^\.(png|jpg|jpeg|jpe|gif|webp|svg|bmp|ico|mp4|webm|mov)$/i;

function isMediaResource(uri4) {
  return MEDIA_EXTENSION_REGEX.test(extname2(uri4));
}

async function collectImageFilesFromFolder(fileService, folderUri) {
  const stat = await fileService.resolve(folderUri);
  const imageUris = [];
  if (stat.children) {
    for (const child of stat.children) {
      if (child.isFile && isMediaResource(child.resource)) {
        imageUris.push(child.resource);
      }
    }
  }
  imageUris.sort((a, b) => basename2(a).localeCompare(basename2(b)));
  return imageUris;
}

function createImageEntries(uris) {
  return uris.map((uri4) => ({
    id: generateUuid(),
    name: basename2(uri4),
    mimeType: getMediaMime(uri4.path) ?? "image/png",
    uri: uri4
  }));
}

var OpenImagesInCarouselFromExplorerAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.openImagesInCarousel",
      title: localize2(16120, "Open in Images Preview"),
      f1: false,
      menu: [{
        id: MenuId.ExplorerContext,
        group: "navigation",
        order: 25,
        when: ContextKeyExpr.and(
          ContextKeyExpr.has("config.imageCarousel.explorerContextMenu.enabled"),
          ContextKeyExpr.or(
            ExplorerFolderContext,
            ContextKeyExpr.regex(ResourceContextKey.Extension.key, MEDIA_EXTENSION_REGEX)
          )
        )
      }]
    });
  }
  async run(accessor, resource) {
    const explorerService = accessor.get(IExplorerService);
    const fileService = accessor.get(IFileService);
    const editorService = accessor.get(IEditorService);
    const notificationService = accessor.get(INotificationService);
    const contextService = accessor.get(IWorkspaceContextService);
    const context2 = explorerService.getContext(true);
    let imageUris = [];
    let startUri;
    try {
      if (context2.length === 0) {
        let folderUri;
        if (URI.isUri(resource)) {
          folderUri = resource;
        } else {
          const folders = contextService.getWorkspace().folders;
          if (folders.length > 0) {
            folderUri = folders[0].uri;
          }
        }
        if (folderUri) {
          imageUris = await collectImageFilesFromFolder(fileService, folderUri);
        }
      } else {
        const hasSingleImageFile = context2.length === 1 && !context2[0].isDirectory && isMediaResource(context2[0].resource);
        if (hasSingleImageFile) {
          startUri = context2[0].resource;
          const parentUri = dirname2(context2[0].resource);
          imageUris = await collectImageFilesFromFolder(fileService, parentUri);
        } else {
          const seen = new ResourceSet();
          for (const item of context2) {
            if (item.isDirectory) {
              const folderImages = await collectImageFilesFromFolder(fileService, item.resource);
              for (const uri4 of folderImages) {
                if (!seen.has(uri4)) {
                  seen.add(uri4);
                  imageUris.push(uri4);
                }
              }
            } else if (isMediaResource(item.resource)) {
              if (!seen.has(item.resource)) {
                seen.add(item.resource);
                imageUris.push(item.resource);
                if (!startUri) {
                  startUri = item.resource;
                }
              }
            }
          }
        }
      }
    } catch {
      notificationService.error(localize(16111, null));
      return;
    }
    if (imageUris.length === 0) {
      notificationService.info(localize(16118, null));
      return;
    }
    const images = createImageEntries(imageUris);
    let startIndex = 0;
    if (startUri) {
      const idx = images.findIndex((img) => img.uri?.toString() === startUri.toString());
      if (idx >= 0) {
        startIndex = idx;
      }
    }
    const collection = {
      id: generateUuid(),
      title: localize(16114, null),
      sections: [{
        title: "",
        images
      }]
    };
    const input = new ImageCarouselEditorInput(collection, startIndex);
    await editorService.openEditor(input, { pinned: true });
  }
};

registerAction2(OpenImagesInCarouselFromExplorerAction);
export { isCollectionArgs, isSingleImageArgs, isMediaResource, collectImageFilesFromFolder, createImageEntries, ImageCarouselEditorInputSerializer, OpenImageInCarouselAction, MEDIA_EXTENSION_REGEX, OpenImagesInCarouselFromExplorerAction };
