// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatImageUtils.ts
import { LRUCache } from "./module-0008.mjs";
import { raceTimeout } from "./module-0036.mjs";
import { VSBuffer, decodeBase64 } from "./module-0038.mjs";
import { joinPath } from "./module-0034.mjs";
import { CommandsRegistry } from "./module-0087.mjs";


// src/vs/workbench/contrib/chat/browser/chatImageUtils.ts
async function resizeImage(data, mimeType) {
  const isGif = mimeType === "image/gif";
  if (typeof data === "string") {
    data = convertStringToUInt8Array(data);
  }
  return new Promise((resolve3, reject) => {
    const blob = new Blob([data], { type: mimeType });
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.src = url;
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width: width2, height } = img;
      if ((width2 <= 768 || height <= 768) && !isGif) {
        resolve3(data);
        return;
      }
      if (width2 > 2048 || height > 2048) {
        const scaleFactor2 = 2048 / Math.max(width2, height);
        width2 = Math.round(width2 * scaleFactor2);
        height = Math.round(height * scaleFactor2);
      }
      const scaleFactor = 768 / Math.min(width2, height);
      width2 = Math.round(width2 * scaleFactor);
      height = Math.round(height * scaleFactor);
      const canvas = document.createElement("canvas");
      canvas.width = width2;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width2, height);
        const jpegTypes = ["image/jpeg", "image/jpg"];
        const outputMimeType = mimeType && jpegTypes.includes(mimeType) ? "image/jpeg" : "image/png";
        canvas.toBlob((blob2) => {
          if (blob2) {
            const reader = new FileReader();
            reader.onload = () => {
              resolve3(new Uint8Array(reader.result));
            };
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(blob2);
          } else {
            reject(new Error("Failed to create blob from canvas"));
          }
        }, outputMimeType);
      } else {
        reject(new Error("Failed to get canvas context"));
      }
    };
    img.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    };
  });
}

function createImageThumbnail(data, maxSize) {
  return new Promise((resolve3) => {
    const blob = new Blob([data]);
    const img = document.createElement("img");
    const url = URL.createObjectURL(blob);
    img.src = url;
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { width: width2, height } = img;
      const scaleFactor = Math.min(1, maxSize / Math.max(width2, height));
      const targetWidth = Math.max(1, Math.round(width2 * scaleFactor));
      const targetHeight = Math.max(1, Math.round(height * scaleFactor));
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve3(void 0);
        return;
      }
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      const outputMimeType = data.length >= 3 && data[0] === 255 && data[1] === 216 && data[2] === 255 ? "image/jpeg" : "image/png";
      canvas.toBlob((thumbnail) => resolve3(thumbnail ?? void 0), outputMimeType);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve3(void 0);
    };
  });
}

var thumbnailCache = new LRUCache(50);

var THUMBNAIL_DECODE_TIMEOUT_MS = 1e4;

var CHAT_IMAGE_HOVER_THUMBNAIL_MAX_SIZE = 768;

function getOrCreateImageThumbnail(cacheKey2, data, maxSize) {
  const key3 = `${cacheKey2}:${maxSize}:${data.byteLength}`;
  const cached = thumbnailCache.get(key3);
  if (cached) {
    return cached;
  }
  const thumbnail = raceTimeout(createImageThumbnail(data, maxSize), THUMBNAIL_DECODE_TIMEOUT_MS).then((blob) => {
    if (!blob && thumbnailCache.peek(key3) === thumbnail) {
      thumbnailCache.delete(key3);
    }
    return blob;
  });
  thumbnailCache.set(key3, thumbnail);
  return thumbnail;
}

function convertStringToUInt8Array(data) {
  const base64Data = data.includes(",") ? data.split(",")[1] : data;
  if (isValidBase64(base64Data)) {
    return decodeBase64(base64Data).buffer;
  }
  return new TextEncoder().encode(data);
}

function isValidBase64(str) {
  return /^[A-Za-z0-9+/]*={0,2}$/.test(str) && (() => {
    try {
      atob(str);
      return true;
    } catch {
      return false;
    }
  })();
}

async function createFileForMedia(fileService, imagesFolder, dataTransfer, mimeType) {
  const exists = await fileService.exists(imagesFolder);
  if (!exists) {
    await fileService.createFolder(imagesFolder);
  }
  const ext = mimeType.split("/")[1] || "png";
  const filename = `image-${Date.now()}.${ext}`;
  const fileUri = joinPath(imagesFolder, filename);
  const buffer = VSBuffer.wrap(dataTransfer);
  await fileService.writeFile(fileUri, buffer);
  return fileUri;
}

async function cleanupOldImages(fileService, logService, imagesFolder) {
  const exists = await fileService.exists(imagesFolder);
  if (!exists) {
    return;
  }
  const duration = 7 * 24 * 60 * 60 * 1e3;
  const files = await fileService.resolve(imagesFolder);
  if (!files.children) {
    return;
  }
  await Promise.all(files.children.map(async (file) => {
    try {
      const timestamp = getTimestampFromFilename(file.name);
      if (timestamp && Date.now() - timestamp > duration) {
        await fileService.del(file.resource);
      }
    } catch (err) {
      logService.error("Failed to clean up old images", err);
    }
  }));
}

function getTimestampFromFilename(filename) {
  const match2 = filename.match(/image-(\d+)\./);
  if (match2) {
    return parseInt(match2[1], 10);
  }
  return void 0;
}

CommandsRegistry.registerCommand("_chat.resizeImage", async (_accessor, data, mimeType) => {
  if (data instanceof VSBuffer) {
    data = data.buffer;
  }
  return resizeImage(data, mimeType);
});
export { resizeImage, createImageThumbnail, getOrCreateImageThumbnail, convertStringToUInt8Array, isValidBase64, createFileForMedia, cleanupOldImages, getTimestampFromFilename, thumbnailCache, THUMBNAIL_DECODE_TIMEOUT_MS, CHAT_IMAGE_HOVER_THUMBNAIL_MAX_SIZE };
