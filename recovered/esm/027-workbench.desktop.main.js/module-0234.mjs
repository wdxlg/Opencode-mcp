// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/theme/common/colors/menuColors.ts
import { registerColor, transparent } from "./module-0226.mjs";
import { activeContrastBorder, contrastBorder, foreground } from "./module-0227.mjs";
import { localize } from "./module-0001.mjs";
import { selectBackground, selectForeground } from "./module-0233.mjs";
import { listActiveSelectionBackground, listActiveSelectionForeground } from "./module-0232.mjs";


// src/vs/platform/theme/common/colors/menuColors.ts
var menuBorder = registerColor(
  "menu.border",
  { dark: null, light: null, hcDark: contrastBorder, hcLight: contrastBorder },
  localize(3512, null)
);

var menuForeground = registerColor(
  "menu.foreground",
  selectForeground,
  localize(3513, null)
);

var menuBackground = registerColor(
  "menu.background",
  selectBackground,
  localize(3511, null)
);

var menuSelectionForeground = registerColor(
  "menu.selectionForeground",
  listActiveSelectionForeground,
  localize(3516, null)
);

var menuSelectionBackground = registerColor(
  "menu.selectionBackground",
  listActiveSelectionBackground,
  localize(3514, null)
);

var menuSelectionBorder = registerColor(
  "menu.selectionBorder",
  { dark: null, light: null, hcDark: activeContrastBorder, hcLight: activeContrastBorder },
  localize(3515, null)
);

var menuSeparatorBackground = registerColor(
  "menu.separatorBackground",
  { dark: transparent(foreground, 0.2), light: transparent(foreground, 0.2), hcDark: contrastBorder, hcLight: contrastBorder },
  localize(3517, null)
);
export { menuBorder, menuForeground, menuBackground, menuSelectionForeground, menuSelectionBackground, menuSelectionBorder, menuSeparatorBackground };
