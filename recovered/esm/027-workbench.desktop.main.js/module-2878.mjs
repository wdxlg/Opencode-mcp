// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/agentModelPricing.ts



// src/vs/platform/agentHost/common/agentModelPricing.ts
var NUMBER_KEYS = [
  "multiplierNumeric",
  "inputCost",
  "cacheCost",
  "cacheWriteCost",
  "outputCost",
  "longContextInputCost",
  "longContextCacheCost",
  "longContextCacheWriteCost",
  "longContextOutputCost",
  "discountPercent"
];

function readAgentModelPricingMeta(model) {
  const meta = model._meta;
  if (!meta) {
    return {};
  }
  const result = {};
  for (const key3 of NUMBER_KEYS) {
    const value2 = meta[key3];
    if (typeof value2 === "number") {
      result[key3] = value2;
    }
  }
  if (typeof meta.priceCategory === "string") {
    result.priceCategory = meta.priceCategory;
  }
  if (typeof meta.category === "string") {
    result.category = meta.category;
  }
  const rawPromo = meta.promo;
  if (rawPromo && typeof rawPromo === "object" && !Array.isArray(rawPromo)) {
    const p = rawPromo;
    if (typeof p.id === "string" && typeof p.discountPercent === "number" && typeof p.message === "string") {
      result.promo = {
        id: p.id,
        discountPercent: p.discountPercent,
        message: p.message,
        ...typeof p.endsAt === "string" ? { endsAt: p.endsAt } : {},
        ...typeof p.showBanner === "boolean" ? { showBanner: p.showBanner } : {}
      };
    }
  }
  return result;
}
export { readAgentModelPricingMeta, NUMBER_KEYS };
