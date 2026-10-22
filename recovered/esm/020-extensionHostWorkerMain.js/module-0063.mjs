// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/base/common/dataTransfer.ts
import { distinct } from "./module-0004.mjs";


// src/vs/base/common/dataTransfer.ts
var UriList = Object.freeze({
  // http://amundsen.com/hypermedia/urilist/
  create: (entries) => {
    return distinct(entries.map((x) => x.toString())).join("\r\n");
  },
  split: (str) => {
    return str.split("\r\n");
  },
  parse: (str) => {
    return UriList.split(str).filter((value) => !value.startsWith("#"));
  }
});
export { UriList };
