// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeBridgePaymentPresentation.ts



// src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeBridgePaymentPresentation.ts
function isBridgePaymentApplied(status2) {
  if (status2.paymentOrder.status !== "paid" || !status2.licensed || status2.error) return false;
  if (status2.permanent) return true;
  const expected = Date.parse(status2.paymentOrder.entitlementExpiresAt);
  const actual = Date.parse(status2.expiresAt);
  return Number.isFinite(expected) && Number.isFinite(actual) && actual >= expected;
}

function isBridgePaidOrderExpired(order, now = Date.now()) {
  const expiresAt = Date.parse(order.entitlementExpiresAt);
  return order.status === "paid" && Number.isFinite(expiresAt) && expiresAt <= now;
}

function canCreateBridgePaymentAfterError(status2, now = Date.now()) {
  if (status2.paymentOrder.status === "pending") return false;
  if (status2.paymentOrder.status === "paid" && !isBridgePaidOrderExpired(status2.paymentOrder, now) && !isBridgePaymentApplied(status2)) return false;
  if (!status2.error) return true;
  return isBridgePaidOrderExpired(status2.paymentOrder, now) && /no active bridge entitlement/i.test(status2.error);
}
export { isBridgePaymentApplied, isBridgePaidOrderExpired, canCreateBridgePaymentAfterError };
