// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/imageResize/browser/imageResizeService.ts
import { VSBuffer, decodeBase64 } from "./module-0038.mjs";
import { joinPath } from "./module-0034.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IImageResizeService } from "./module-2852.mjs";


// src/vs/platform/imageResize/browser/imageResizeService.ts
var ImageResizeService = class {
  /**
   * Resizes an image provided as a UInt8Array string. Resizing is based on Open AI's algorithm for tokenzing images.
   * https://platform.openai.com/docs/guides/vision#calculating-costs
   * @param data - The UInt8Array string of the image to resize.
   * @returns A promise that resolves to the UInt8Array string of the resized image.
   */
  async resizeImage(data, mimeType) {
    const isGif = mimeType === "image/gif";
    if (typeof data === "string") {
      data = this.convertStringToUInt8Array(data);
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
  convertStringToUInt8Array(data) {
    const base64Data = data.includes(",") ? data.split(",")[1] : data;
    if (this.isValidBase64(base64Data)) {
      return decodeBase64(base64Data).buffer;
    }
    return new TextEncoder().encode(data);
  }
  // Only used for URLs
  convertUint8ArrayToString(data) {
    try {
      const decoder2 = new TextDecoder();
      const decodedString = decoder2.decode(data);
      return decodedString;
    } catch {
      return "";
    }
  }
  isValidBase64(str) {
    try {
      decodeBase64(str);
      return true;
    } catch {
      return false;
    }
  }
  async createFileForMedia(fileService, imagesFolder, dataTransfer, mimeType) {
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
  async cleanupOldImages(fileService, logService, imagesFolder) {
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
        const timestamp = this.getTimestampFromFilename(file.name);
        if (timestamp && Date.now() - timestamp > duration) {
          await fileService.del(file.resource);
        }
      } catch (err) {
        logService.error("Failed to clean up old images", err);
      }
    }));
  }
  getTimestampFromFilename(filename) {
    const match2 = filename.match(/image-(\d+)\./);
    if (match2) {
      return parseInt(match2[1], 10);
    }
    return void 0;
  }
};

registerSingleton(IImageResizeService, ImageResizeService, 1 /* Delayed */);
export { ImageResizeService };
