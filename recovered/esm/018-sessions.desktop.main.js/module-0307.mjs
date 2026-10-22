// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/viewParts/minimap/minimapCharSheet.ts



// src/vs/editor/browser/viewParts/minimap/minimapCharSheet.ts
var allCharCodes = (() => {
  const v2 = [];
  for (let i2 = 32 /* START_CH_CODE */; i2 <= 126 /* END_CH_CODE */; i2++) {
    v2.push(i2);
  }
  v2.push(65533 /* UNKNOWN_CODE */);
  return v2;
})();

var getCharIndex = (chCode, fontScale) => {
  chCode -= 32 /* START_CH_CODE */;
  if (chCode < 0 || chCode > 96 /* CHAR_COUNT */) {
    if (fontScale <= 2) {
      return (chCode + 96 /* CHAR_COUNT */) % 96 /* CHAR_COUNT */;
    }
    return 96 /* CHAR_COUNT */ - 1;
  }
  return chCode;
};
export { allCharCodes, getCharIndex };
