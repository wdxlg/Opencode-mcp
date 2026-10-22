// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/theme/common/theme.ts



// src/vs/platform/theme/common/theme.ts
function isHighContrast(scheme) {
  return scheme === "hcDark" /* HIGH_CONTRAST_DARK */ || scheme === "hcLight" /* HIGH_CONTRAST_LIGHT */;
}

function isDark(scheme) {
  return scheme === "dark" /* DARK */ || scheme === "hcDark" /* HIGH_CONTRAST_DARK */;
}
export { isHighContrast, isDark };
