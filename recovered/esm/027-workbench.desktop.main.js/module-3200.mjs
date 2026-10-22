// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/markers/browser/messages.ts
import { localize, localize2 } from "./module-0001.mjs";
import { basename2 } from "./module-0034.mjs";


// src/vs/workbench/contrib/markers/browser/messages.ts
var Messages = class {
  static {
    this.MARKERS_PANEL_TOGGLE_LABEL = localize(16763, null);
  }
  static {
    this.MARKERS_PANEL_SHOW_LABEL = localize2(16762, "Focus Problems (Errors, Warnings, Infos)");
  }
  static {
    this.PROBLEMS_PANEL_CONFIGURATION_TITLE = localize(16749, null);
  }
  static {
    this.PROBLEMS_PANEL_CONFIGURATION_AUTO_REVEAL = localize(16744, null);
  }
  static {
    this.PROBLEMS_PANEL_CONFIGURATION_VIEW_MODE = localize(16750, null);
  }
  static {
    this.PROBLEMS_PANEL_CONFIGURATION_SHOW_CURRENT_STATUS = localize(16748, null);
  }
  static {
    this.PROBLEMS_PANEL_CONFIGURATION_COMPARE_ORDER = localize(16745, null);
  }
  static {
    this.PROBLEMS_PANEL_CONFIGURATION_COMPARE_ORDER_SEVERITY = localize(16747, null);
  }
  static {
    this.PROBLEMS_PANEL_CONFIGURATION_COMPARE_ORDER_POSITION = localize(16746, null);
  }
  static {
    this.MARKERS_PANEL_TITLE_PROBLEMS = localize2(16743, "Problems");
  }
  static {
    this.MARKERS_PANEL_NO_PROBLEMS_BUILT = localize(16737, null);
  }
  static {
    this.MARKERS_PANEL_NO_PROBLEMS_ACTIVE_FILE_BUILT = localize(16736, null);
  }
  static {
    this.MARKERS_PANEL_NO_PROBLEMS_FILTERS = localize(16738, null);
  }
  static {
    this.MARKERS_PANEL_ACTION_TOOLTIP_MORE_FILTERS = localize(16719, null);
  }
  static {
    this.MARKERS_PANEL_FILTER_LABEL_SHOW_ERRORS = localize(16727, null);
  }
  static {
    this.MARKERS_PANEL_FILTER_LABEL_SHOW_WARNINGS = localize(16729, null);
  }
  static {
    this.MARKERS_PANEL_FILTER_LABEL_SHOW_INFOS = localize(16728, null);
  }
  static {
    this.MARKERS_PANEL_FILTER_LABEL_EXCLUDED_FILES = localize(16730, null);
  }
  static {
    this.MARKERS_PANEL_FILTER_LABEL_ACTIVE_FILE = localize(16722, null);
  }
  static {
    this.MARKERS_PANEL_ACTION_TOOLTIP_FILTER = localize(16718, null);
  }
  static {
    this.MARKERS_PANEL_ACTION_TOOLTIP_QUICKFIX = localize(16720, null);
  }
  static {
    this.MARKERS_PANEL_FILTER_ARIA_LABEL = localize(16723, null);
  }
  static {
    this.MARKERS_PANEL_FILTER_PLACEHOLDER = localize(16726, null);
  }
  static {
    this.MARKERS_PANEL_FILTER_ERRORS = localize(16724, null);
  }
  static {
    this.MARKERS_PANEL_FILTER_WARNINGS = localize(16731, null);
  }
  static {
    this.MARKERS_PANEL_FILTER_INFOS = localize(16725, null);
  }
  static {
    this.MARKERS_PANEL_SINGLE_ERROR_LABEL = localize(16739, null);
  }
  static {
    this.MARKERS_PANEL_MULTIPLE_ERRORS_LABEL = (noOfErrors) => {
      return localize(16732, null, "" + noOfErrors);
    };
  }
  static {
    this.MARKERS_PANEL_SINGLE_WARNING_LABEL = localize(16742, null);
  }
  static {
    this.MARKERS_PANEL_MULTIPLE_WARNINGS_LABEL = (noOfWarnings) => {
      return localize(16735, null, "" + noOfWarnings);
    };
  }
  static {
    this.MARKERS_PANEL_SINGLE_INFO_LABEL = localize(16740, null);
  }
  static {
    this.MARKERS_PANEL_MULTIPLE_INFOS_LABEL = (noOfInfos) => {
      return localize(16733, null, "" + noOfInfos);
    };
  }
  static {
    this.MARKERS_PANEL_SINGLE_UNKNOWN_LABEL = localize(16741, null);
  }
  static {
    this.MARKERS_PANEL_MULTIPLE_UNKNOWNS_LABEL = (noOfUnknowns) => {
      return localize(16734, null, "" + noOfUnknowns);
    };
  }
  static {
    this.MARKERS_PANEL_AT_LINE_COL_NUMBER = (ln, col) => {
      return localize(16721, null, "" + ln, "" + col);
    };
  }
  static {
    this.MARKERS_TREE_ARIA_LABEL_RESOURCE = (noOfProblems, fileName, folder) => {
      return localize(16759, null, noOfProblems, fileName, folder);
    };
  }
  static {
    this.MARKERS_TREE_ARIA_LABEL_MARKER = (marker) => {
      const relatedInformationMessage = marker.relatedInformation.length ? localize(16757, null, marker.relatedInformation.length) : "";
      switch (marker.marker.severity) {
        case 8 /* Error */:
          return marker.marker.source ? localize(16751, null, marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage, marker.marker.source) : localize(16752, null, marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage);
        case 4 /* Warning */:
          return marker.marker.source ? localize(16760, null, marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage, marker.marker.source) : localize(16761, null, marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage, relatedInformationMessage);
        case 2 /* Info */:
          return marker.marker.source ? localize(16753, null, marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage, marker.marker.source) : localize(16754, null, marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage);
        default:
          return marker.marker.source ? localize(16755, null, marker.marker.source, marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage, marker.marker.source) : localize(16756, null, marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage);
      }
    };
  }
  static {
    this.MARKERS_TREE_ARIA_LABEL_RELATED_INFORMATION = (relatedInformation) => localize(16758, null, relatedInformation.message, relatedInformation.startLineNumber, relatedInformation.startColumn, basename2(relatedInformation.resource));
  }
  static {
    this.SHOW_ERRORS_WARNINGS_ACTION_LABEL = localize(16717, null);
  }
};
export { Messages };
