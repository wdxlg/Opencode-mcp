// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/cli.js
// Original module marker: src/vs/base/common/linkedList.ts
import { __esm } from "./module-0000.mjs";


// src/vs/base/common/linkedList.ts
var Node;

var init_linkedList = __esm({
  "src/vs/base/common/linkedList.ts"() {
    Node = class _Node {
      static {
        this.Undefined = new _Node(void 0);
      }
      constructor(element) {
        this.element = element;
        this.next = _Node.Undefined;
        this.prev = _Node.Undefined;
      }
    };
  }
});
export { Node, init_linkedList };
