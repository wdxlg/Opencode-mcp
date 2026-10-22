// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/base/common/uriIpc.ts



// src/vs/base/common/uriIpc.ts
var DefaultURITransformer = new class {
  transformIncoming(uri) {
    return uri;
  }
  transformOutgoing(uri) {
    return uri;
  }
  transformOutgoingURI(uri) {
    return uri;
  }
  transformOutgoingScheme(scheme) {
    return scheme;
  }
}();
export { DefaultURITransformer };
