// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/accessibility/browser/accessibleViewRegistry.ts



// src/vs/platform/accessibility/browser/accessibleViewRegistry.ts
var AccessibleViewRegistry = new class AccessibleViewRegistry2 {
  constructor() {
    this._implementations = [];
  }
  register(implementation) {
    this._implementations.push(implementation);
    return {
      dispose: () => {
        const idx = this._implementations.indexOf(implementation);
        if (idx !== -1) {
          this._implementations.splice(idx, 1);
        }
      }
    };
  }
  getImplementations() {
    return this._implementations;
  }
}();
export { AccessibleViewRegistry };
