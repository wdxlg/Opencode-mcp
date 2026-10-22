// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/opener/common/opener.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/platform/opener/common/opener.ts
var IOpenerService = createDecorator("openerService");

function withSelection(uri4, selection) {
  return uri4.with({ fragment: `${selection.startLineNumber},${selection.startColumn}${selection.endLineNumber ? `-${selection.endLineNumber}${selection.endColumn ? `,${selection.endColumn}` : ""}` : ""}` });
}

function extractSelection(uri4) {
  let selection = void 0;
  const match2 = /^L?(\d+)(?:,(\d+))?(-L?(\d+)(?:,(\d+))?)?/.exec(uri4.fragment);
  if (match2) {
    selection = {
      startLineNumber: parseInt(match2[1]),
      startColumn: match2[2] ? parseInt(match2[2]) : 1,
      endLineNumber: match2[4] ? parseInt(match2[4]) : void 0,
      endColumn: match2[4] ? match2[5] ? parseInt(match2[5]) : 1 : void 0
    };
    uri4 = uri4.with({ fragment: "" });
  }
  return { selection, uri: uri4 };
}
export { withSelection, extractSelection, IOpenerService };
