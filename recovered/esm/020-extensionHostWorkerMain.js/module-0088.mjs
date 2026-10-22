// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/platform/markers/common/markers.ts
import { localize } from "./module-0015.mjs";
import { severity_default } from "./module-0058.mjs";
import { createDecorator } from "./module-0038.mjs";


// src/vs/platform/markers/common/markers.ts
var MarkerSeverity = /* @__PURE__ */ ((MarkerSeverity2) => {
  MarkerSeverity2[MarkerSeverity2["Hint"] = 1] = "Hint";
  MarkerSeverity2[MarkerSeverity2["Info"] = 2] = "Info";
  MarkerSeverity2[MarkerSeverity2["Warning"] = 4] = "Warning";
  MarkerSeverity2[MarkerSeverity2["Error"] = 8] = "Error";
  return MarkerSeverity2;
})(MarkerSeverity || {});

((MarkerSeverity2) => {
  function compare4(a, b) {
    return b - a;
  }
  MarkerSeverity2.compare = compare4;
  const _displayStrings = /* @__PURE__ */ Object.create(null);
  _displayStrings[8 /* Error */] = localize(3105, null);
  _displayStrings[4 /* Warning */] = localize(3109, null);
  _displayStrings[2 /* Info */] = localize(3107, null);
  function toString(a) {
    return _displayStrings[a] || "";
  }
  MarkerSeverity2.toString = toString;
  const _displayStringsPlural = /* @__PURE__ */ Object.create(null);
  _displayStringsPlural[8 /* Error */] = localize(3106, null);
  _displayStringsPlural[4 /* Warning */] = localize(3110, null);
  _displayStringsPlural[2 /* Info */] = localize(3108, null);
  function toStringPlural(a) {
    return _displayStringsPlural[a] || "";
  }
  MarkerSeverity2.toStringPlural = toStringPlural;
  function fromSeverity(severity) {
    switch (severity) {
      case severity_default.Error:
        return 8 /* Error */;
      case severity_default.Warning:
        return 4 /* Warning */;
      case severity_default.Info:
        return 2 /* Info */;
      case severity_default.Ignore:
        return 1 /* Hint */;
    }
  }
  MarkerSeverity2.fromSeverity = fromSeverity;
  function toSeverity(severity) {
    switch (severity) {
      case 8 /* Error */:
        return severity_default.Error;
      case 4 /* Warning */:
        return severity_default.Warning;
      case 2 /* Info */:
        return severity_default.Info;
      case 1 /* Hint */:
        return severity_default.Ignore;
    }
  }
  MarkerSeverity2.toSeverity = toSeverity;
})(MarkerSeverity || (MarkerSeverity = {}));

var IMarkerData;

((IMarkerData4) => {
  const emptyString = "";
  function makeKey(markerData) {
    return makeKeyOptionalMessage(markerData, true);
  }
  IMarkerData4.makeKey = makeKey;
  function makeKeyOptionalMessage(markerData, useMessage) {
    const result = [emptyString];
    if (markerData.source) {
      result.push(markerData.source.replace("\xA6", "\\\xA6"));
    } else {
      result.push(emptyString);
    }
    if (markerData.code) {
      if (typeof markerData.code === "string") {
        result.push(markerData.code.replace("\xA6", "\\\xA6"));
      } else {
        result.push(markerData.code.value.replace("\xA6", "\\\xA6"));
      }
    } else {
      result.push(emptyString);
    }
    if (markerData.severity !== void 0 && markerData.severity !== null) {
      result.push(MarkerSeverity.toString(markerData.severity));
    } else {
      result.push(emptyString);
    }
    if (markerData.message && useMessage) {
      result.push(markerData.message.replace("\xA6", "\\\xA6"));
    } else {
      result.push(emptyString);
    }
    if (markerData.startLineNumber !== void 0 && markerData.startLineNumber !== null) {
      result.push(markerData.startLineNumber.toString());
    } else {
      result.push(emptyString);
    }
    if (markerData.startColumn !== void 0 && markerData.startColumn !== null) {
      result.push(markerData.startColumn.toString());
    } else {
      result.push(emptyString);
    }
    if (markerData.endLineNumber !== void 0 && markerData.endLineNumber !== null) {
      result.push(markerData.endLineNumber.toString());
    } else {
      result.push(emptyString);
    }
    if (markerData.endColumn !== void 0 && markerData.endColumn !== null) {
      result.push(markerData.endColumn.toString());
    } else {
      result.push(emptyString);
    }
    result.push(emptyString);
    return result.join("\xA6");
  }
  IMarkerData4.makeKeyOptionalMessage = makeKeyOptionalMessage;
})(IMarkerData || (IMarkerData = {}));

var IMarkerService = createDecorator("markerService");
export { MarkerSeverity, IMarkerData, IMarkerService };
