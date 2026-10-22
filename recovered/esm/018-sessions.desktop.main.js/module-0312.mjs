// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/fonts.ts
import { isElectron, isMacintosh, isWindows } from "./module-0014.mjs";
import { mainWindow } from "./module-0002.mjs";


// src/vs/base/browser/fonts.ts
var DEFAULT_FONT_FAMILY = isWindows ? '"Segoe WPC", "Segoe UI", sans-serif' : isMacintosh ? "-apple-system, BlinkMacSystemFont, sans-serif" : 'system-ui, "Ubuntu", "Droid Sans", sans-serif';

var getFonts = async () => {
  try {
    const fonts = await mainWindow.queryLocalFonts();
    const fontsArray = [...fonts];
    const families = fontsArray.map((font) => font.family);
    return families;
  } catch (error) {
    console.error(`Failed to query fonts: ${error}`);
    return [];
  }
};

var getFontSnippets = async () => {
  if (!isElectron) {
    return [];
  }
  const fonts = await getFonts();
  const snippets = fonts.map((font) => {
    return {
      body: `${font}`
    };
  });
  return snippets;
};
export { DEFAULT_FONT_FAMILY, getFonts, getFontSnippets };
