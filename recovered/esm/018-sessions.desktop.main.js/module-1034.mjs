// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/editing/chatCodeMapperService.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/common/editing/chatCodeMapperService.ts
var ICodeMapperService = createDecorator("codeMapperService");

var CodeMapperService = class {
  constructor() {
    this.providers = [];
  }
  registerCodeMapperProvider(handle2, provider) {
    this.providers.push(provider);
    return {
      dispose: () => {
        const index2 = this.providers.indexOf(provider);
        if (index2 >= 0) {
          this.providers.splice(index2, 1);
        }
      }
    };
  }
  async mapCode(request2, response, token) {
    for (const provider of this.providers) {
      const result = await provider.mapCode(request2, response, token);
      if (token.isCancellationRequested) {
        return void 0;
      }
      return result;
    }
    return void 0;
  }
};
export { ICodeMapperService, CodeMapperService };
