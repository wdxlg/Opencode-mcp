// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostTypes/es5ClassCompat.ts



// src/vs/workbench/api/common/extHostTypes/es5ClassCompat.ts
function es5ClassCompat(target) {
  const interceptFunctions = {
    apply: function(...args) {
      if (args.length === 0) {
        return Reflect.construct(target, []);
      } else {
        const argsList = args.length === 1 ? [] : args[1];
        return Reflect.construct(target, argsList, args[0].constructor);
      }
    },
    call: function(...args) {
      if (args.length === 0) {
        return Reflect.construct(target, []);
      } else {
        const [thisArg, ...restArgs] = args;
        return Reflect.construct(target, restArgs, thisArg.constructor);
      }
    }
  };
  return Object.assign(target, interceptFunctions);
}
export { es5ClassCompat };
