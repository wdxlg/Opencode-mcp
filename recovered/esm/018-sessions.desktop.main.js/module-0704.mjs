// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/indentation/common/indentUtils.ts



// src/vs/editor/contrib/indentation/common/indentUtils.ts
function getSpaceCnt(str, tabSize) {
  let spacesCnt = 0;
  for (let i2 = 0; i2 < str.length; i2++) {
    if (str.charAt(i2) === "	") {
      spacesCnt += tabSize;
    } else {
      spacesCnt++;
    }
  }
  return spacesCnt;
}

function generateIndent(spacesCnt, tabSize, insertSpaces) {
  spacesCnt = spacesCnt < 0 ? 0 : spacesCnt;
  let result = "";
  if (!insertSpaces) {
    const tabsCnt = Math.floor(spacesCnt / tabSize);
    spacesCnt = spacesCnt % tabSize;
    for (let i2 = 0; i2 < tabsCnt; i2++) {
      result += "	";
    }
  }
  for (let i2 = 0; i2 < spacesCnt; i2++) {
    result += " ";
  }
  return result;
}
export { getSpaceCnt, generateIndent };
