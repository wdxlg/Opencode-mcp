// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalEscapeSequences.ts



// src/vs/workbench/contrib/terminal/browser/terminalEscapeSequences.ts
function VSCodeSequence(osc, data) {
  return oscSequence(633 /* VSCode */, osc, data);
}

function oscSequence(ps, pt, data) {
  let result = `\x1B]${ps};${pt}`;
  if (data) {
    result += `;${data}`;
  }
  result += `\x07`;
  return result;
}
export { VSCodeSequence, oscSequence };
