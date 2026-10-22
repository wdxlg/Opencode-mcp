// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/userActivity/common/userActivityRegistry.ts



// src/vs/workbench/services/userActivity/common/userActivityRegistry.ts
var UserActivityRegistry = class {
  constructor() {
    this.todo = [];
    this.add = (ctor) => {
      this.todo.push(ctor);
    };
  }
  take(userActivityService, instantiation) {
    this.add = (ctor) => instantiation.createInstance(ctor, userActivityService);
    this.todo.forEach(this.add);
    this.todo = [];
  }
};

var userActivityRegistry = new UserActivityRegistry();
export { UserActivityRegistry, userActivityRegistry };
