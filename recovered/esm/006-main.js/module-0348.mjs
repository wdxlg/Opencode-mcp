// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/webContentExtractor/common/webContentExtractor.ts
import { __esm } from "./module-0000.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";


// src/vs/platform/webContentExtractor/common/webContentExtractor.ts
var IWebContentExtractorService, ISharedWebContentExtractorService;

var init_webContentExtractor = __esm({
  "src/vs/platform/webContentExtractor/common/webContentExtractor.ts"() {
    init_instantiation();
    IWebContentExtractorService = createDecorator("IWebContentExtractorService");
    ISharedWebContentExtractorService = createDecorator("ISharedWebContentExtractorService");
  }
});
export { IWebContentExtractorService, ISharedWebContentExtractorService, init_webContentExtractor };
