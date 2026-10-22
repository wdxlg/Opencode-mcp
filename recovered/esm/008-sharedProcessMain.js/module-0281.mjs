// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/webContentExtractor/node/sharedWebContentExtractorService.ts
import { VSBuffer } from "./module-0031.mjs";


// src/vs/platform/webContentExtractor/node/sharedWebContentExtractorService.ts
var SharedWebContentExtractorService = class {
  async readImage(uri, token) {
    if (token.isCancellationRequested) {
      return void 0;
    }
    try {
      const response = await fetch(uri.toString(true), {
        headers: {
          "Accept": "image/*",
          "User-Agent": "Mozilla/5.0"
        }
      });
      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType?.startsWith("image/") || !/(webp|jpg|jpeg|gif|png|bmp)$/i.test(contentType)) {
        return void 0;
      }
      const content = VSBuffer.wrap(await response.bytes());
      return content;
    } catch (err) {
      console.error(err);
      return void 0;
    }
  }
};
export { SharedWebContentExtractorService };
