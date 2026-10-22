// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/services/extensions/common/proxyIdentifier.ts



// src/vs/workbench/services/extensions/common/proxyIdentifier.ts
var ProxyIdentifier = class _ProxyIdentifier {
  constructor(sid) {
    this._proxyIdentifierBrand = void 0;
    this.sid = sid;
    this.nid = ++_ProxyIdentifier.count;
  }
  static {
    this.count = 0;
  }
};

var identifiers = [];

function createProxyIdentifier(identifier) {
  const result = new ProxyIdentifier(identifier);
  identifiers[result.nid] = result;
  return result;
}

function getStringIdentifierForProxy(nid) {
  return identifiers[nid].sid;
}

var SerializableObjectWithBuffers = class {
  constructor(value) {
    this.value = value;
  }
};
export { createProxyIdentifier, getStringIdentifierForProxy, ProxyIdentifier, identifiers, SerializableObjectWithBuffers };
