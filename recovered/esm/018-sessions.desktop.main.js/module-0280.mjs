// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/trustedTypes.ts
import { getMonacoEnvironment } from "./module-0018.mjs";
import { onUnexpectedError } from "./module-0004.mjs";


// src/vs/base/browser/trustedTypes.ts
function createTrustedTypesPolicy(policyName, policyOptions) {
  const monacoEnvironment = getMonacoEnvironment();
  if (monacoEnvironment?.createTrustedTypesPolicy) {
    try {
      return monacoEnvironment.createTrustedTypesPolicy(policyName, policyOptions);
    } catch (err) {
      onUnexpectedError(err);
      return void 0;
    }
  }
  try {
    return globalThis.trustedTypes?.createPolicy(policyName, policyOptions);
  } catch (err) {
    onUnexpectedError(err);
    return void 0;
  }
}
export { createTrustedTypesPolicy };
