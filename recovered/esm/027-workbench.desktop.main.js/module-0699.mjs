// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/severityIcon/severityIcon.ts
import { severity_default } from "./module-0266.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/base/browser/ui/severityIcon/severityIcon.ts
var SeverityIcon;

((SeverityIcon2) => {
  function className2(severity) {
    switch (severity) {
      case severity_default.Ignore:
        return "severity-ignore " + ThemeIcon.asClassName(Codicon.info);
      case severity_default.Info:
        return ThemeIcon.asClassName(Codicon.info);
      case severity_default.Warning:
        return ThemeIcon.asClassName(Codicon.warning);
      case severity_default.Error:
        return ThemeIcon.asClassName(Codicon.error);
      default:
        return "";
    }
  }
  SeverityIcon2.className = className2;
})(SeverityIcon || (SeverityIcon = {}));
export { SeverityIcon };
