// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/terminal/common/autoApprove/autoApproveParseSafety.ts



// src/vs/platform/terminal/common/autoApprove/autoApproveParseSafety.ts
function shouldRequireConfirmationForAutoApproveParse(language2, hasError) {
  return language2 === "powershell" && hasError;
}
export { shouldRequireConfirmationForAutoApproveParse };
