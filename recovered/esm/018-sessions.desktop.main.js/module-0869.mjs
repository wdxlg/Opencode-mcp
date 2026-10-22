// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/common/terminalColorRegistry.ts
import { registerColor, transparent } from "./module-0226.mjs";
import { localize } from "./module-0001.mjs";
import { editorFindMatch, editorFindMatchHighlight, editorHoverHighlight, editorSelectionBackground, overviewRulerFindMatchForeground } from "./module-0229.mjs";
import { EDITOR_DRAG_AND_DROP_BACKGROUND, PANEL_BORDER, TAB_ACTIVE_BORDER } from "./module-0868.mjs";
import { editorOverviewRulerBorder } from "./module-0288.mjs";


// src/vs/workbench/contrib/terminal/common/terminalColorRegistry.ts
var ansiColorIdentifiers = [];

var TERMINAL_BACKGROUND_COLOR = registerColor("terminal.background", null, localize(20137, null));

var TERMINAL_FOREGROUND_COLOR = registerColor("terminal.foreground", {
  light: "#333333",
  dark: "#CCCCCC",
  hcDark: "#FFFFFF",
  hcLight: "#292929"
}, localize(20144, null));

var TERMINAL_CURSOR_FOREGROUND_COLOR = registerColor("terminalCursor.foreground", null, localize(20154, null));

var TERMINAL_CURSOR_BACKGROUND_COLOR = registerColor("terminalCursor.background", null, localize(20153, null));

var TERMINAL_SELECTION_BACKGROUND_COLOR = registerColor("terminal.selectionBackground", editorSelectionBackground, localize(20147, null));

var TERMINAL_INACTIVE_SELECTION_BACKGROUND_COLOR = registerColor("terminal.inactiveSelectionBackground", {
  light: transparent(TERMINAL_SELECTION_BACKGROUND_COLOR, 0.5),
  dark: transparent(TERMINAL_SELECTION_BACKGROUND_COLOR, 0.5),
  hcDark: transparent(TERMINAL_SELECTION_BACKGROUND_COLOR, 0.7),
  hcLight: transparent(TERMINAL_SELECTION_BACKGROUND_COLOR, 0.5)
}, localize(20146, null));

var TERMINAL_SELECTION_FOREGROUND_COLOR = registerColor("terminal.selectionForeground", {
  light: null,
  dark: null,
  hcDark: "#000000",
  hcLight: "#ffffff"
}, localize(20148, null));

var TERMINAL_COMMAND_DECORATION_DEFAULT_BACKGROUND_COLOR = registerColor("terminalCommandDecoration.defaultBackground", {
  light: "#00000040",
  dark: "#ffffff40",
  hcDark: "#ffffff80",
  hcLight: "#00000040"
}, localize(20150, null));

var TERMINAL_COMMAND_DECORATION_SUCCESS_BACKGROUND_COLOR = registerColor("terminalCommandDecoration.successBackground", {
  dark: "#1B81A8",
  light: "#2090D3",
  hcDark: "#1B81A8",
  hcLight: "#007100"
}, localize(20152, null));

var TERMINAL_COMMAND_DECORATION_ERROR_BACKGROUND_COLOR = registerColor("terminalCommandDecoration.errorBackground", {
  dark: "#F14C4C",
  light: "#E51400",
  hcDark: "#F14C4C",
  hcLight: "#B5200D"
}, localize(20151, null));

var TERMINAL_OVERVIEW_RULER_CURSOR_FOREGROUND_COLOR = registerColor("terminalOverviewRuler.cursorForeground", "#A0A0A0CC", localize(20157, null));

var TERMINAL_BORDER_COLOR = registerColor("terminal.border", PANEL_BORDER, localize(20138, null));

var TERMINAL_OVERVIEW_RULER_BORDER_COLOR = registerColor("terminalOverviewRuler.border", editorOverviewRulerBorder, localize(20156, null));

var TERMINAL_FIND_MATCH_BACKGROUND_COLOR = registerColor("terminal.findMatchBackground", {
  dark: editorFindMatch,
  light: editorFindMatch,
  // Use regular selection background in high contrast with a thick border
  hcDark: null,
  hcLight: "#0F4A85"
}, localize(20140, null), true);

var TERMINAL_HOVER_HIGHLIGHT_BACKGROUND_COLOR = registerColor("terminal.hoverHighlightBackground", transparent(editorHoverHighlight, 0.5), localize(20145, null));

var TERMINAL_FIND_MATCH_BORDER_COLOR = registerColor("terminal.findMatchBorder", {
  dark: null,
  light: null,
  hcDark: "#f38518",
  hcLight: "#0F4A85"
}, localize(20141, null));

var TERMINAL_FIND_MATCH_HIGHLIGHT_BACKGROUND_COLOR = registerColor("terminal.findMatchHighlightBackground", {
  dark: editorFindMatchHighlight,
  light: editorFindMatchHighlight,
  hcDark: null,
  hcLight: null
}, localize(20142, null), true);

var TERMINAL_FIND_MATCH_HIGHLIGHT_BORDER_COLOR = registerColor("terminal.findMatchHighlightBorder", {
  dark: null,
  light: null,
  hcDark: "#f38518",
  hcLight: "#0F4A85"
}, localize(20143, null));

var TERMINAL_OVERVIEW_RULER_FIND_MATCH_FOREGROUND_COLOR = registerColor("terminalOverviewRuler.findMatchForeground", {
  dark: overviewRulerFindMatchForeground,
  light: overviewRulerFindMatchForeground,
  hcDark: "#f38518",
  hcLight: "#0F4A85"
}, localize(20158, null));

var TERMINAL_DRAG_AND_DROP_BACKGROUND = registerColor("terminal.dropBackground", EDITOR_DRAG_AND_DROP_BACKGROUND, localize(20139, null), true);

var TERMINAL_TAB_ACTIVE_BORDER = registerColor("terminal.tab.activeBorder", TAB_ACTIVE_BORDER, localize(20149, null));

var TERMINAL_INITIAL_HINT_FOREGROUND = registerColor("terminal.initialHintForeground", {
  dark: "#ffffff56",
  light: "#0007",
  hcDark: null,
  hcLight: null
}, localize(20155, null));

var ansiColorMap = {
  "terminal.ansiBlack": {
    index: 0,
    defaults: {
      light: "#000000",
      dark: "#000000",
      hcDark: "#000000",
      hcLight: "#292929"
    }
  },
  "terminal.ansiRed": {
    index: 1,
    defaults: {
      light: "#cd3131",
      dark: "#cd3131",
      hcDark: "#cd0000",
      hcLight: "#cd3131"
    }
  },
  "terminal.ansiGreen": {
    index: 2,
    defaults: {
      light: "#107C10",
      dark: "#0DBC79",
      hcDark: "#00cd00",
      hcLight: "#136C13"
    }
  },
  "terminal.ansiYellow": {
    index: 3,
    defaults: {
      light: "#949800",
      dark: "#e5e510",
      hcDark: "#cdcd00",
      hcLight: "#949800"
    }
  },
  "terminal.ansiBlue": {
    index: 4,
    defaults: {
      light: "#0451a5",
      dark: "#2472c8",
      hcDark: "#0000ee",
      hcLight: "#0451a5"
    }
  },
  "terminal.ansiMagenta": {
    index: 5,
    defaults: {
      light: "#bc05bc",
      dark: "#bc3fbc",
      hcDark: "#cd00cd",
      hcLight: "#bc05bc"
    }
  },
  "terminal.ansiCyan": {
    index: 6,
    defaults: {
      light: "#0598bc",
      dark: "#11a8cd",
      hcDark: "#00cdcd",
      hcLight: "#0598bc"
    }
  },
  "terminal.ansiWhite": {
    index: 7,
    defaults: {
      light: "#555555",
      dark: "#e5e5e5",
      hcDark: "#e5e5e5",
      hcLight: "#555555"
    }
  },
  "terminal.ansiBrightBlack": {
    index: 8,
    defaults: {
      light: "#666666",
      dark: "#666666",
      hcDark: "#7f7f7f",
      hcLight: "#666666"
    }
  },
  "terminal.ansiBrightRed": {
    index: 9,
    defaults: {
      light: "#cd3131",
      dark: "#f14c4c",
      hcDark: "#ff0000",
      hcLight: "#cd3131"
    }
  },
  "terminal.ansiBrightGreen": {
    index: 10,
    defaults: {
      light: "#14CE14",
      dark: "#23d18b",
      hcDark: "#00ff00",
      hcLight: "#00bc00"
    }
  },
  "terminal.ansiBrightYellow": {
    index: 11,
    defaults: {
      light: "#b5ba00",
      dark: "#f5f543",
      hcDark: "#ffff00",
      hcLight: "#b5ba00"
    }
  },
  "terminal.ansiBrightBlue": {
    index: 12,
    defaults: {
      light: "#0451a5",
      dark: "#3b8eea",
      hcDark: "#5c5cff",
      hcLight: "#0451a5"
    }
  },
  "terminal.ansiBrightMagenta": {
    index: 13,
    defaults: {
      light: "#bc05bc",
      dark: "#d670d6",
      hcDark: "#ff00ff",
      hcLight: "#bc05bc"
    }
  },
  "terminal.ansiBrightCyan": {
    index: 14,
    defaults: {
      light: "#0598bc",
      dark: "#29b8db",
      hcDark: "#00ffff",
      hcLight: "#0598bc"
    }
  },
  "terminal.ansiBrightWhite": {
    index: 15,
    defaults: {
      light: "#a5a5a5",
      dark: "#e5e5e5",
      hcDark: "#ffffff",
      hcLight: "#a5a5a5"
    }
  }
};

function registerColors() {
  for (const id2 in ansiColorMap) {
    const entry = ansiColorMap[id2];
    const colorName = id2.substring(13);
    ansiColorIdentifiers[entry.index] = registerColor(id2, entry.defaults, localize(20136, null, colorName));
  }
}
export { registerColors, ansiColorIdentifiers, TERMINAL_BACKGROUND_COLOR, TERMINAL_FOREGROUND_COLOR, TERMINAL_CURSOR_FOREGROUND_COLOR, TERMINAL_CURSOR_BACKGROUND_COLOR, TERMINAL_SELECTION_BACKGROUND_COLOR, TERMINAL_INACTIVE_SELECTION_BACKGROUND_COLOR, TERMINAL_SELECTION_FOREGROUND_COLOR, TERMINAL_COMMAND_DECORATION_DEFAULT_BACKGROUND_COLOR, TERMINAL_COMMAND_DECORATION_SUCCESS_BACKGROUND_COLOR, TERMINAL_COMMAND_DECORATION_ERROR_BACKGROUND_COLOR, TERMINAL_OVERVIEW_RULER_CURSOR_FOREGROUND_COLOR, TERMINAL_BORDER_COLOR, TERMINAL_OVERVIEW_RULER_BORDER_COLOR, TERMINAL_FIND_MATCH_BACKGROUND_COLOR, TERMINAL_HOVER_HIGHLIGHT_BACKGROUND_COLOR, TERMINAL_FIND_MATCH_BORDER_COLOR, TERMINAL_FIND_MATCH_HIGHLIGHT_BACKGROUND_COLOR, TERMINAL_FIND_MATCH_HIGHLIGHT_BORDER_COLOR, TERMINAL_OVERVIEW_RULER_FIND_MATCH_FOREGROUND_COLOR, TERMINAL_DRAG_AND_DROP_BACKGROUND, TERMINAL_TAB_ACTIVE_BORDER, TERMINAL_INITIAL_HINT_FOREGROUND, ansiColorMap };
