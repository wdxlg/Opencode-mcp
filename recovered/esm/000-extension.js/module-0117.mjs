// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/bridge-route-token.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// extensions/opencode/src/bridge-route-token.ts
init_define_OPENCODE_BUILD_INFO();

var DurableBridgeRouteToken = class {
  constructor(deps) {
    this.deps = deps;
  }
  deps;
  token = "";
  pending = Promise.resolve();
  get value() {
    return this.token;
  }
  initialize() {
    return this.enqueue(async () => {
      const stored = await this.deps.read();
      const candidate = stored || this.token || this.deps.generate();
      if (!stored) await this.deps.write(candidate);
      this.token = candidate;
    });
  }
  rotate() {
    return this.enqueue(async () => {
      const candidate = this.deps.generate();
      await this.deps.write(candidate);
      this.token = candidate;
    });
  }
  enqueue(action) {
    const result = this.pending.then(() => this.deps.withLock ? this.deps.withLock(action) : action());
    this.pending = result.catch(() => {
    });
    return result;
  }
};
export { DurableBridgeRouteToken };
