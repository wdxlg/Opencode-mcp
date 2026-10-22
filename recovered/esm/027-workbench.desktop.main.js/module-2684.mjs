// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeBridgePurchasePresentation.ts



// src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeBridgePurchasePresentation.ts
function getOpenCodeBridgePurchasePresentation(input) {
  const planState = input.planCount > 0 ? "available" : input.loading ? "loading" : input.plansError ? "failed" : "unavailable";
  return {
    mode: input.permanent ? "support" : input.licensed ? "renew" : "purchase",
    planState,
    canPurchase: planState === "available",
    canRetry: planState === "failed" || planState === "unavailable"
  };
}
export { getOpenCodeBridgePurchasePresentation };
