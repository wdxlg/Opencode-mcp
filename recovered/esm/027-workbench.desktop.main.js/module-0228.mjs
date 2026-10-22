// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/theme/common/colors/miscColors.ts
import { registerColor, transparent } from "./module-0226.mjs";
import { contrastBorder, focusBorder } from "./module-0227.mjs";
import { localize } from "./module-0001.mjs";
import { Color } from "./module-0197.mjs";


// src/vs/platform/theme/common/colors/miscColors.ts
var sashHoverBorder = registerColor(
  "sash.hoverBorder",
  focusBorder,
  localize(3539, null)
);

var badgeBackground = registerColor(
  "badge.background",
  { dark: "#4D4D4D", light: "#C4C4C4", hcDark: Color.black, hcLight: "#0F4A85" },
  localize(3533, null)
);

var badgeForeground = registerColor(
  "badge.foreground",
  { dark: Color.white, light: "#333", hcDark: Color.white, hcLight: Color.white },
  localize(3534, null)
);

var activityWarningBadgeForeground = registerColor(
  "activityWarningBadge.foreground",
  { dark: Color.white, light: Color.white, hcDark: Color.white, hcLight: Color.white },
  localize(3532, null)
);

var activityWarningBadgeBackground = registerColor(
  "activityWarningBadge.background",
  { dark: "#B27C00", light: "#B27C00", hcDark: null, hcLight: "#B27C00" },
  localize(3531, null)
);

var activityErrorBadgeForeground = registerColor(
  "activityErrorBadge.foreground",
  { dark: Color.black.lighten(0.2), light: Color.white, hcDark: null, hcLight: Color.black.lighten(0.2) },
  localize(3530, null)
);

var activityErrorBadgeBackground = registerColor(
  "activityErrorBadge.background",
  { dark: "#F14C4C", light: "#E51400", hcDark: null, hcLight: "#F14C4C" },
  localize(3529, null)
);

var scrollbarShadow = registerColor(
  "scrollbar.shadow",
  { dark: "#000000", light: "#DDDDDD", hcDark: null, hcLight: null },
  localize(3541, null)
);

var scrollbarSliderBackground = registerColor(
  "scrollbarSlider.background",
  { dark: Color.fromHex("#797979").transparent(0.4), light: Color.fromHex("#646464").transparent(0.4), hcDark: transparent(contrastBorder, 0.6), hcLight: transparent(contrastBorder, 0.4) },
  localize(3543, null)
);

var scrollbarSliderHoverBackground = registerColor(
  "scrollbarSlider.hoverBackground",
  { dark: Color.fromHex("#646464").transparent(0.7), light: Color.fromHex("#646464").transparent(0.7), hcDark: transparent(contrastBorder, 0.8), hcLight: transparent(contrastBorder, 0.8) },
  localize(3544, null)
);

var scrollbarSliderActiveBackground = registerColor(
  "scrollbarSlider.activeBackground",
  { dark: Color.fromHex("#BFBFBF").transparent(0.4), light: Color.fromHex("#000000").transparent(0.6), hcDark: contrastBorder, hcLight: contrastBorder },
  localize(3542, null)
);

var scrollbarBackground = registerColor(
  "scrollbar.background",
  null,
  localize(3540, null)
);

var progressBarBackground = registerColor(
  "progressBar.background",
  { dark: Color.fromHex("#0E70C0"), light: Color.fromHex("#0E70C0"), hcDark: contrastBorder, hcLight: contrastBorder },
  localize(3538, null)
);

var chartLine = registerColor(
  "chart.line",
  { dark: "#236B8E", light: "#236B8E", hcDark: "#236B8E", hcLight: "#236B8E" },
  localize(3537, null)
);

var chartAxis = registerColor(
  "chart.axis",
  { dark: Color.fromHex("#BFBFBF").transparent(0.4), light: Color.fromHex("#000000").transparent(0.6), hcDark: contrastBorder, hcLight: contrastBorder },
  localize(3535, null)
);

var chartGuide = registerColor(
  "chart.guide",
  { dark: Color.fromHex("#BFBFBF").transparent(0.2), light: Color.fromHex("#000000").transparent(0.2), hcDark: contrastBorder, hcLight: contrastBorder },
  localize(3536, null)
);
export { sashHoverBorder, badgeBackground, badgeForeground, activityWarningBadgeForeground, activityWarningBadgeBackground, activityErrorBadgeForeground, activityErrorBadgeBackground, scrollbarShadow, scrollbarSliderBackground, scrollbarSliderHoverBackground, scrollbarSliderActiveBackground, scrollbarBackground, progressBarBackground, chartLine, chartAxis, chartGuide };
