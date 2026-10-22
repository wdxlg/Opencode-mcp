// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/base/common/idGenerator.ts



// src/vs/base/common/idGenerator.ts
var IdGenerator = class {
  constructor(prefix) {
    this._prefix = prefix;
    this._lastId = 0;
  }
  nextId() {
    return this._prefix + ++this._lastId;
  }
};

var defaultGenerator = new IdGenerator("id#");
export { IdGenerator, defaultGenerator };
