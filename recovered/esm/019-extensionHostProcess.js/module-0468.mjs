// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/editor/common/services/treeViewsDnd.ts



// src/vs/editor/common/services/treeViewsDnd.ts
var TreeViewsDnDService = class {
  constructor() {
    this._dragOperations = /* @__PURE__ */ new Map();
  }
  removeDragOperationTransfer(uuid) {
    if (uuid && this._dragOperations.has(uuid)) {
      const operation = this._dragOperations.get(uuid);
      this._dragOperations.delete(uuid);
      return operation;
    }
    return void 0;
  }
  addDragOperationTransfer(uuid, transferPromise) {
    this._dragOperations.set(uuid, transferPromise);
  }
};
export { TreeViewsDnDService };
