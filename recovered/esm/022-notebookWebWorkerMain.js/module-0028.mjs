// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/contrib/notebook/common/services/notebookWebWorkerMain.js
// Original module marker: src/vs/base/common/objects.ts



// src/vs/base/common/objects.ts
function filter(obj, predicate) {
  const result = /* @__PURE__ */ Object.create(null);
  for (const [key, value] of Object.entries(obj)) {
    if (predicate(key, value)) {
      result[key] = value;
    }
  }
  return result;
}
export { filter };
