// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/model/utils.ts



// src/vs/editor/common/model/utils.ts
function computeIndentLevel(line, tabSize) {
  let indent = 0;
  let i2 = 0;
  const len = line.length;
  while (i2 < len) {
    const chCode = line.charCodeAt(i2);
    if (chCode === 32 /* Space */) {
      indent++;
    } else if (chCode === 9 /* Tab */) {
      indent = indent - indent % tabSize + tabSize;
    } else {
      break;
    }
    i2++;
  }
  if (i2 === len) {
    return -1;
  }
  return indent;
}
export { computeIndentLevel };
