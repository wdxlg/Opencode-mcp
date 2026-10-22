// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/services/extensions/common/extensionHostProtocol.ts
import { VSBuffer } from "./module-0031.mjs";


// src/vs/workbench/services/extensions/common/extensionHostProtocol.ts
var UIKind = /* @__PURE__ */ ((UIKind2) => {
  UIKind2[UIKind2["Desktop"] = 1] = "Desktop";
  UIKind2[UIKind2["Web"] = 2] = "Web";
  return UIKind2;
})(UIKind || {});

function createMessageOfType(type) {
  const result = VSBuffer.alloc(1);
  switch (type) {
    case 0 /* Initialized */:
      result.writeUInt8(1, 0);
      break;
    case 1 /* Ready */:
      result.writeUInt8(2, 0);
      break;
    case 2 /* Terminate */:
      result.writeUInt8(3, 0);
      break;
  }
  return result;
}

function isMessageOfType(message, type) {
  if (message.byteLength !== 1) {
    return false;
  }
  switch (message.readUInt8(0)) {
    case 1:
      return type === 0 /* Initialized */;
    case 2:
      return type === 1 /* Ready */;
    case 3:
      return type === 2 /* Terminate */;
    default:
      return false;
  }
}
export { createMessageOfType, isMessageOfType, UIKind };
