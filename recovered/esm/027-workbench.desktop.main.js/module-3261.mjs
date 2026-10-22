// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/common/terminalStrings.ts
import { localize, localize2 } from "./module-0001.mjs";


// src/vs/workbench/contrib/terminal/common/terminalStrings.ts
var terminalStrings = {
  terminal: localize(20351, null),
  new: localize(20352, null),
  doNotShowAgain: localize(20340, null),
  currentSessionCategory: localize(20339, null),
  previousSessionCategory: localize(20347, null),
  typeTask: localize(20350, null),
  typeLocal: localize(20343, null),
  actionCategory: localize2(20353, "Terminal"),
  focus: localize2(20357, "Focus Terminal"),
  focusInstance: localize2(20360, "Focus Terminal"),
  focusAndHideAccessibleBuffer: localize2(20358, "Focus Terminal and Hide Accessible Buffer"),
  kill: {
    ...localize2(20341, "Kill Terminal"),
    short: localize(20342, null)
  },
  moveToEditor: localize2(20345, "Move Terminal into Editor Area"),
  moveIntoNewWindow: localize2(20344, "Move Terminal into New Window"),
  newInNewWindow: localize2(20346, "New Terminal Window"),
  moveToTerminalPanel: localize2(20361, "Move Terminal into Panel"),
  changeIcon: localize2(20356, "Change Icon..."),
  changeColor: localize2(20355, "Change Color..."),
  split: {
    ...localize2(20348, "Split Terminal"),
    short: localize(20349, null)
  },
  unsplit: localize2(20354, "Unsplit Terminal"),
  rename: localize2(20363, "Rename..."),
  toggleSizeToContentWidth: localize2(20368, "Toggle Size to Content Width"),
  focusHover: localize2(20359, "Focus Hover"),
  newWithCwd: localize2(20362, "Create New Terminal Starting in a Custom Working Directory"),
  renameWithArgs: localize2(20364, "Rename the Currently Active Terminal"),
  scrollToPreviousCommand: localize2(20367, "Scroll to Previous Command"),
  scrollToNextCommand: localize2(20366, "Scroll to Next Command"),
  revealCommand: localize2(20365, "Reveal Command in Terminal")
};
export { terminalStrings };
