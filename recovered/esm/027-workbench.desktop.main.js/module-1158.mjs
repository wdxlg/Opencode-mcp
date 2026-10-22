// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/terminal/common/autoApprove/sortAutoApproveRules.ts



// src/vs/platform/terminal/common/autoApprove/sortAutoApproveRules.ts
var sortAutoApproveRules = {
  "/^sort\\b(?!-)/": true,
  // - `-o`: Writes output to a file.
  // - `-S`: Can request enough memory to cause denial of service.
  "/^sort\\b.*\\s-(o|S)\\b/": false,
  // GNU sort accepts unique long-option abbreviations. `--co` is the shortest unique
  // abbreviation for `--compress-program`; deny it and every longer spelling. Ignore
  // shell quote and escape syntax within the prefix since the shell removes it.
  "/^sort\\b.*\\s(?:\\$?['\"]|\\\\)*-(?:\\$?['\"]|\\\\)*-(?:\\$?['\"]|\\\\)*c(?:\\$?['\"]|\\\\)*o/": false
};
export { sortAutoApproveRules };
