// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostTypes/es5ClassCompat.ts



// src/vs/workbench/api/common/extHostTypes/es5ClassCompat.ts
function es5ClassCompat(target) {
  const interceptFunctions = {
    apply: function(...args2) {
      if (args2.length === 0) {
        return Reflect.construct(target, []);
      } else {
        const argsList = args2.length === 1 ? [] : args2[1];
        return Reflect.construct(target, argsList, args2[0].constructor);
      }
    },
    call: function(...args2) {
      if (args2.length === 0) {
        return Reflect.construct(target, []);
      } else {
        const [thisArg, ...restArgs] = args2;
        return Reflect.construct(target, restArgs, thisArg.constructor);
      }
    }
  };
  return Object.assign(target, interceptFunctions);
}
export { es5ClassCompat };
