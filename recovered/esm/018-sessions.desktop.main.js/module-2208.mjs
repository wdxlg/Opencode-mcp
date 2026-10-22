// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/chatErrorMessages.ts
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/common/chatErrorMessages.ts
var RATE_LIMIT_LEARN_MORE_URL = "https://aka.ms/github-copilot-rate-limit-error";

var FILTERED_DOCS_URL = "https://aka.ms/copilot-chat-filtered-docs";

var GITHUB_SUPPORT_URL = "https://support.github.com/contact";

var CanceledMessage = { message: localize(12850, null) };

function secondsToHumanReadableTime(seconds) {
  if (seconds < 90) {
    return localize(12854, null, seconds);
  }
  const minutes = Math.floor(seconds / 60);
  if (seconds <= 5400) {
    return localize(12853, null, minutes);
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes > 0) {
    return localize(12852, null, hours, remainingMinutes);
  }
  return localize(12851, null, hours);
}

function getRateLimitMessage(fetchError, copilotPlan) {
  const retryAfterString = fetchError.retryAfter ? secondsToHumanReadableTime(fetchError.retryAfter) : localize(12849, null);
  const code = fetchError.capiError?.code;
  if (code?.startsWith("agent_mode_limit_exceeded")) {
    return localize(12891, null, retryAfterString, RATE_LIMIT_LEARN_MORE_URL);
  }
  if (code?.startsWith("model_overloaded") || code?.startsWith("upstream_provider_rate_limit")) {
    if (fetchError.isAuto) {
      return localize(12898, null, retryAfterString, RATE_LIMIT_LEARN_MORE_URL);
    }
    return localize(12897, null, retryAfterString, RATE_LIMIT_LEARN_MORE_URL);
  }
  if (code?.startsWith("user_global_rate_limited")) {
    if (copilotPlan === "free" || copilotPlan === "individual" || copilotPlan === "individual_pro" || copilotPlan === "edu") {
      return localize(12902, null, retryAfterString, RATE_LIMIT_LEARN_MORE_URL);
    }
    return localize(12901, null, retryAfterString, RATE_LIMIT_LEARN_MORE_URL);
  }
  if (code?.startsWith("user_weekly_rate_limited")) {
    if (fetchError.retryAfter) {
      const resetDate = new Date(Date.now() + fetchError.retryAfter * 1e3);
      const resetDateString = resetDate.toLocaleString(void 0, { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });
      if (fetchError.isAuto) {
        return localize(12906, null, resetDateString, RATE_LIMIT_LEARN_MORE_URL);
      }
      return localize(12905, null, resetDateString, RATE_LIMIT_LEARN_MORE_URL);
    }
    if (fetchError.isAuto) {
      return localize(12904, null, retryAfterString, RATE_LIMIT_LEARN_MORE_URL);
    }
    return localize(12903, null, retryAfterString, RATE_LIMIT_LEARN_MORE_URL);
  }
  if (code?.startsWith("user_model_rate_limited")) {
    if (fetchError.isAuto) {
      return localize(12896, null, retryAfterString, RATE_LIMIT_LEARN_MORE_URL);
    }
    return localize(12895, null, retryAfterString, RATE_LIMIT_LEARN_MORE_URL);
  }
  if (code?.startsWith("integration_rate_limited")) {
    return localize(12894, null, retryAfterString, RATE_LIMIT_LEARN_MORE_URL);
  }
  if (fetchError.capiError?.code && fetchError.capiError?.message) {
    if (fetchError.isAuto) {
      return localize(12900, null, retryAfterString, RATE_LIMIT_LEARN_MORE_URL, fetchError.capiError.message, fetchError.capiError.code);
    }
    return localize(12899, null, retryAfterString, RATE_LIMIT_LEARN_MORE_URL, fetchError.capiError.message, fetchError.capiError.code);
  }
  if (fetchError.isAuto) {
    return localize(12893, null, retryAfterString, RATE_LIMIT_LEARN_MORE_URL);
  }
  return localize(12892, null, retryAfterString, RATE_LIMIT_LEARN_MORE_URL);
}

function getQuotaMessageForPlan(copilotPlan, isUsageBasedBilling, quotaResetDate) {
  const resetDateString = quotaResetDate ? new Date(quotaResetDate).toLocaleString(void 0, { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" }) : void 0;
  if (isUsageBasedBilling) {
    switch (copilotPlan) {
      case "free":
        return resetDateString ? localize(12886, null, resetDateString) : localize(12885, null);
      case "individual":
        return resetDateString ? localize(12888, null, resetDateString) : localize(12887, null);
      case "edu":
        return resetDateString ? localize(12884, null, resetDateString) : localize(12883, null);
      case "individual_pro":
      case "individual_max":
        return resetDateString ? localize(12890, null, resetDateString) : localize(12889, null);
      case "business":
      case "enterprise":
        return resetDateString ? localize(12880, null, resetDateString) : localize(12879, null);
      default:
        return resetDateString ? localize(12882, null, resetDateString) : localize(12881, null);
    }
  }
  switch (copilotPlan) {
    case "free":
      return localize(12873, null);
    case "individual":
      return localize(12875, null);
    case "edu":
      return localize(12872, null);
    case "individual_pro":
    case "individual_max":
      return localize(12877, null);
    case "business":
    case "enterprise":
      return localize(12870, null);
    default:
      return localize(12871, null);
  }
}

function getQuotaHitMessage(fetchError, copilotPlan, isUsageBasedBilling, quotaResetDate) {
  let code = fetchError.capiError?.code;
  if (code === "free_quota_exceeded") {
    code = "quota_exceeded";
  }
  if (code === "quota_exceeded") {
    return getQuotaMessageForPlan(copilotPlan, isUsageBasedBilling, quotaResetDate);
  } else if (code === "overage_limit_reached") {
    return localize(12876, null, GITHUB_SUPPORT_URL);
  } else if (code === "additional_spend_limit_reached") {
    return localize(12869, null);
  } else if (code === "billing_not_configured" && fetchError.capiError?.message) {
    return fetchError.capiError.message;
  } else if (fetchError.capiError?.code && fetchError.capiError?.message) {
    return localize(12878, null, fetchError.capiError.message, fetchError.capiError.code);
  } else {
    return localize(12874, null);
  }
}

function getFilteredMessage(category9, supportsMarkdown = true) {
  switch (category9) {
    case "snippy" /* Copyright */:
      if (supportsMarkdown) {
        return localize(12859, null, FILTERED_DOCS_URL);
      }
      return localize(12858, null);
    case "prompt" /* Prompt */:
      if (supportsMarkdown) {
        return localize(12863, null, FILTERED_DOCS_URL);
      }
      return localize(12862, null);
    default:
      if (supportsMarkdown) {
        return localize(12861, null, FILTERED_DOCS_URL);
      }
      return localize(12860, null);
  }
}

function getChatErrorDetailsFromFetchError(fetchError, copilotPlan, isUsageBasedBilling, quotaResetDate) {
  return { code: fetchError.type, ...getChatErrorDetailsInner(fetchError, copilotPlan, isUsageBasedBilling, quotaResetDate) };
}

function getChatErrorDetailsInner(fetchError, copilotPlan, isUsageBasedBilling, quotaResetDate) {
  const requestId = fetchError.requestId ?? "";
  const reason = fetchError.reason ?? "";
  switch (fetchError.type) {
    case "offTopic" /* OffTopic */:
      return { message: localize(12868, null) };
    case "canceled" /* Canceled */:
      return CanceledMessage;
    case "rateLimited" /* RateLimited */:
      return {
        message: getRateLimitMessage(fetchError, copilotPlan),
        level: 0 /* Info */,
        isRateLimited: true
      };
    case "quotaExceeded" /* QuotaExceeded */:
      return {
        message: getQuotaHitMessage(fetchError, copilotPlan, isUsageBasedBilling, quotaResetDate),
        isQuotaExceeded: true,
        ...fetchError.capiError?.code && { code: fetchError.capiError.code }
      };
    case "badRequest" /* BadRequest */:
    case "failed" /* Failed */:
      return fetchError.serverRequestId ? { message: localize(12857, null, requestId, fetchError.serverRequestId, reason) } : { message: localize(12856, null, requestId, reason) };
    case "networkError" /* NetworkError */:
      return { message: localize(12866, null, requestId, reason) };
    case "filtered" /* Filtered */:
    case "promptFiltered" /* PromptFiltered */:
      return {
        message: getFilteredMessage(fetchError.category ?? ""),
        responseIsFiltered: true,
        level: 0 /* Info */
      };
    case "agent_unauthorized" /* AgentUnauthorized */:
      return { message: localize(12907, null) };
    case "agent_failed_dependency" /* AgentFailedDependency */:
      return { message: reason };
    case "length" /* Length */:
      return { message: localize(12865, null) };
    case "notFound" /* NotFound */:
      return { message: localize(12867, null) };
    case "unknown" /* Unknown */:
      return { message: localize(12908, null) };
    case "extensionBlocked" /* ExtensionBlocked */:
      return { message: localize(12855, null) };
    case "invalid_stateful_marker" /* InvalidStatefulMarker */:
      return { message: localize(12864, null) };
    default:
      return { message: reason || localize(12907, null) };
  }
}

function isForwardedChatError(value2) {
  return !!value2 && typeof value2 === "object" && "fetchError" in value2 && !!value2.fetchError && typeof value2.fetchError === "object" && typeof value2.fetchError.type === "string";
}

function getChatErrorDetailsFromMeta(error, context2) {
  const meta = error?._meta;
  const chatError = meta?.chatError;
  if (!isForwardedChatError(chatError)) {
    return void 0;
  }
  return getChatErrorDetailsFromFetchError(
    chatError.fetchError,
    context2?.copilotPlan ?? chatError.copilotPlan,
    context2?.isUsageBasedBilling ?? chatError.isUsageBasedBilling,
    context2?.quotaResetDate ?? chatError.quotaResetDate
  );
}

function getCopilotPlanFromEntitlement(entitlement) {
  switch (entitlement) {
    case 5 /* Free */:
      return "free";
    case 6 /* Pro */:
      return "individual";
    case 7 /* ProPlus */:
      return "individual_pro";
    case 11 /* Max */:
      return "individual_max";
    case 8 /* Business */:
      return "business";
    case 9 /* Enterprise */:
      return "enterprise";
    case 10 /* EDU */:
      return "edu";
    default:
      return void 0;
  }
}
export { secondsToHumanReadableTime, getRateLimitMessage, getQuotaMessageForPlan, getQuotaHitMessage, getFilteredMessage, getChatErrorDetailsFromFetchError, getChatErrorDetailsInner, isForwardedChatError, getChatErrorDetailsFromMeta, getCopilotPlanFromEntitlement, RATE_LIMIT_LEARN_MORE_URL, FILTERED_DOCS_URL, GITHUB_SUPPORT_URL, CanceledMessage };
