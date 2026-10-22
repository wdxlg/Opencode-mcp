// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentModelPricing.ts



// src/vs/platform/agentHost/common/agentModelPricing.ts
function createAgentModelPricingMeta(pricing) {
  const entries = Object.entries(pricing).filter(([, value]) => value !== void 0);
  return entries.length > 0 ? Object.fromEntries(entries) : void 0;
}

function normalizeCAPIBilling(raw) {
  if (!raw || typeof raw !== "object") {
    return void 0;
  }
  const billing = raw;
  const multiplier = typeof billing.multiplier === "number" ? billing.multiplier : void 0;
  const priceCategory = typeof billing.priceCategory === "string" ? billing.priceCategory : typeof billing.price_category === "string" ? billing.price_category : void 0;
  const discountPercent = typeof billing.discountPercent === "number" ? billing.discountPercent : typeof billing.discount_percent === "number" ? billing.discount_percent : void 0;
  const rawTokenPrices = billing.tokenPrices ?? billing.token_prices;
  let tokenPrices = void 0;
  if (rawTokenPrices && typeof rawTokenPrices === "object") {
    const defaultTier = rawTokenPrices.default;
    const hasDefault = defaultTier && typeof defaultTier === "object";
    const batchSize = asNumber(rawTokenPrices.batchSize) ?? asNumber(rawTokenPrices.batch_size) ?? 1e6;
    const scale = batchSize > 0 ? 1e6 / batchSize : 1;
    const price = (...values) => {
      const value = values.map(asNumber).find((candidate) => candidate !== void 0);
      return value === void 0 ? void 0 : value * scale;
    };
    const inputPrice = price(rawTokenPrices.inputPrice, hasDefault ? defaultTier.input_price : void 0);
    const cachePrice = price(rawTokenPrices.cacheReadPrice, rawTokenPrices.cachePrice, hasDefault ? defaultTier.cache_read_price : void 0, hasDefault ? defaultTier.cache_price : void 0);
    const cacheWritePrice = price(rawTokenPrices.cacheWritePrice, hasDefault ? defaultTier.cache_write_price : void 0);
    const outputPrice = price(rawTokenPrices.outputPrice, hasDefault ? defaultTier.output_price : void 0);
    const contextMax = asNumber(rawTokenPrices.maxPromptTokens) ?? asNumber(rawTokenPrices.contextMax) ?? asNumber(hasDefault ? defaultTier.max_prompt_tokens : void 0) ?? asNumber(hasDefault ? defaultTier.context_max : void 0);
    const rawLong = rawTokenPrices.longContext ?? rawTokenPrices.long_context;
    let longContext;
    if (rawLong && typeof rawLong === "object") {
      longContext = {
        inputPrice: price(rawLong.inputPrice, rawLong.input_price),
        cachePrice: price(rawLong.cacheReadPrice, rawLong.cachePrice, rawLong.cache_read_price, rawLong.cache_price),
        cacheWritePrice: price(rawLong.cacheWritePrice, rawLong.cache_write_price),
        outputPrice: price(rawLong.outputPrice, rawLong.output_price),
        contextMax: asNumber(rawLong.maxPromptTokens) ?? asNumber(rawLong.contextMax) ?? asNumber(rawLong.max_prompt_tokens) ?? asNumber(rawLong.context_max)
      };
    }
    tokenPrices = { inputPrice, cachePrice, cacheWritePrice, outputPrice, contextMax, longContext };
  }
  return { multiplier, priceCategory, discountPercent, promo: normalizePromo(billing), tokenPrices };
}

function asNumber(v) {
  return typeof v === "number" ? v : void 0;
}

function normalizePromo(billing) {
  const raw = billing.promo;
  if (!raw || typeof raw !== "object") {
    return void 0;
  }
  const id2 = typeof raw.id === "string" ? raw.id : void 0;
  const discountPercent = asNumber(raw.discountPercent) ?? asNumber(raw.discount_percent);
  const endsAt = typeof raw.endsAt === "string" ? raw.endsAt : typeof raw.ends_at === "string" ? raw.ends_at : void 0;
  const message = typeof raw.message === "string" ? raw.message : void 0;
  const showBanner = typeof raw.showBanner === "boolean" ? raw.showBanner : typeof raw.show_banner === "boolean" ? raw.show_banner : void 0;
  if (id2 && typeof discountPercent === "number" && message) {
    return { id: id2, discountPercent, message, ...endsAt ? { endsAt } : {}, ...showBanner !== void 0 ? { showBanner } : {} };
  }
  return void 0;
}

function createPricingMetaFromBilling(billing, priceCategory, category) {
  const tokenPrices = billing?.tokenPrices;
  const longContext = tokenPrices?.longContext;
  const showLongContext = longContext !== void 0 && (longContext.inputPrice !== void 0 && longContext.inputPrice !== tokenPrices?.inputPrice || longContext.outputPrice !== void 0 && longContext.outputPrice !== tokenPrices?.outputPrice || longContext.cachePrice !== void 0 && longContext.cachePrice !== tokenPrices?.cachePrice || longContext.cacheWritePrice !== void 0 && longContext.cacheWritePrice !== tokenPrices?.cacheWritePrice);
  return createAgentModelPricingMeta({
    multiplierNumeric: typeof billing?.multiplier === "number" ? billing.multiplier : void 0,
    inputCost: tokenPrices?.inputPrice,
    cacheCost: tokenPrices?.cachePrice,
    cacheWriteCost: tokenPrices?.cacheWritePrice,
    outputCost: tokenPrices?.outputPrice,
    longContextInputCost: showLongContext ? longContext.inputPrice ?? tokenPrices?.inputPrice : void 0,
    longContextCacheCost: showLongContext ? longContext.cachePrice ?? tokenPrices?.cachePrice : void 0,
    longContextCacheWriteCost: showLongContext ? longContext.cacheWritePrice ?? tokenPrices?.cacheWritePrice : void 0,
    longContextOutputCost: showLongContext ? longContext.outputPrice ?? tokenPrices?.outputPrice : void 0,
    priceCategory: priceCategory ?? (typeof billing?.priceCategory === "string" ? billing.priceCategory : void 0),
    category,
    discountPercent: typeof billing?.discountPercent === "number" ? billing.discountPercent : void 0,
    promo: billing?.promo
  });
}

function hasLongContextSurcharge(billing) {
  const tokenPrices = billing?.tokenPrices;
  const longContext = tokenPrices?.longContext;
  if (!longContext) {
    return false;
  }
  return longContext.inputPrice !== void 0 && longContext.inputPrice !== tokenPrices?.inputPrice || longContext.outputPrice !== void 0 && longContext.outputPrice !== tokenPrices?.outputPrice || longContext.cachePrice !== void 0 && longContext.cachePrice !== tokenPrices?.cachePrice || longContext.cacheWritePrice !== void 0 && longContext.cacheWritePrice !== tokenPrices?.cacheWritePrice;
}
export { createAgentModelPricingMeta, normalizeCAPIBilling, asNumber, normalizePromo, createPricingMetaFromBilling, hasLongContextSurcharge };
