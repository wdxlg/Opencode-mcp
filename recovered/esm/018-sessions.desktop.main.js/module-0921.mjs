// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
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

function createProxyIdentifier(identifier2) {
  const result = new ProxyIdentifier(identifier2);
  identifiers[result.nid] = result;
  return result;
}

function getStringIdentifierForProxy(nid) {
  return identifiers[nid].sid;
}

var SerializableObjectWithBuffers = class {
  constructor(value2) {
    this.value = value2;
  }
};
export { createProxyIdentifier, getStringIdentifierForProxy, ProxyIdentifier, identifiers, SerializableObjectWithBuffers };
