// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostUriTransformerService.ts
import { createDecorator2 } from "./module-0048.mjs";


// src/vs/workbench/api/common/extHostUriTransformerService.ts
var IURITransformerService = createDecorator2("IURITransformerService");

var URITransformerService = class {
  constructor(delegate) {
    if (!delegate) {
      this.transformIncoming = (arg) => arg;
      this.transformOutgoing = (arg) => arg;
      this.transformOutgoingURI = (arg) => arg;
      this.transformOutgoingScheme = (arg) => arg;
    } else {
      this.transformIncoming = delegate.transformIncoming.bind(delegate);
      this.transformOutgoing = delegate.transformOutgoing.bind(delegate);
      this.transformOutgoingURI = delegate.transformOutgoingURI.bind(delegate);
      this.transformOutgoingScheme = delegate.transformOutgoingScheme.bind(delegate);
    }
  }
};
export { IURITransformerService, URITransformerService };
