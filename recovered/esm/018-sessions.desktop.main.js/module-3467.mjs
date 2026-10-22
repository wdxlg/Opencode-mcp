// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/accountTitleBarState.ts
import { FileAccess } from "./module-0033.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/sessions/browser/accountTitleBarState.ts
async function resolveAccountInfo(defaultAccountService, authenticationService) {
  const account = await defaultAccountService.getDefaultAccount();
  if (account) {
    return {
      accountName: account.accountName,
      accountProviderId: account.authenticationProvider.id,
      accountProviderLabel: account.authenticationProvider.name,
      accountIcon: await getSessionAccountIcon(authenticationService, account.authenticationProvider.id, account.sessionId)
    };
  }
  try {
    const sessions = await authenticationService.getSessions("github");
    if (sessions.length > 0) {
      return {
        accountName: sessions[0].account.label,
        accountProviderId: "github",
        accountProviderLabel: "GitHub",
        accountIcon: sessions[0].account.icon
      };
    }
  } catch {
  }
  return void 0;
}

async function getSessionAccountIcon(authenticationService, providerId, sessionId) {
  try {
    const sessions = await authenticationService.getSessions(providerId);
    return sessions.find((session) => session.id === sessionId)?.account.icon;
  } catch {
    return void 0;
  }
}

function getAccountProfileImageUrl(accountProviderId, accountName, accountIcon) {
  if (accountIcon) {
    return FileAccess.uriToBrowserUri(accountIcon).toString(true);
  }
  if (accountProviderId !== "github" || !accountName?.trim()) {
    return void 0;
  }
  return `https://github.com/${encodeURIComponent(accountName.trim())}.png?size=64`;
}

function getAccountTitleBarBadgeKey(state) {
  if (!state.dotBadge) {
    return void 0;
  }
  return `${state.source}:${state.dotBadge}:${state.badge ?? ""}`;
}

function getAccountTitleBarState(context2) {
  if (context2.isAccountLoading) {
    return {
      source: "account",
      kind: "default",
      icon: ThemeIcon.modify(Codicon.loading, "spin"),
      label: localize(3751, null),
      ariaLabel: localize(3752, null),
      revealLabelOnHover: true
    };
  }
  const copilotState = getCopilotPresentation(context2.entitlement, context2.sentiment, context2.quotas, context2.allowSignedOutWhenUsable);
  if (copilotState) {
    return copilotState;
  }
  if (context2.accountName) {
    return {
      source: "account",
      kind: "default",
      icon: Codicon.account,
      label: context2.accountName,
      revealLabelOnHover: true,
      ariaLabel: context2.accountProviderLabel ? localize(3736, null, context2.accountName, context2.accountProviderLabel) : localize(3737, null, context2.accountName)
    };
  }
  return {
    source: "account",
    kind: "prominent",
    icon: Codicon.account,
    label: localize(3754, null),
    ariaLabel: localize(3753, null)
  };
}

function getCopilotPresentation(entitlement, sentiment, quotas, allowSignedOutWhenUsable) {
  if (sentiment.hidden) {
    return void 0;
  }
  if (entitlement === 1 /* Unknown */) {
    if (allowSignedOutWhenUsable) {
      return {
        source: "copilot",
        kind: "default",
        icon: Codicon.account,
        label: localize(3740, null),
        ariaLabel: localize(3741, null)
      };
    }
    return {
      source: "copilot",
      kind: "prominent",
      icon: Codicon.account,
      label: localize(3738, null),
      ariaLabel: localize(3739, null)
    };
  }
  if (sentiment.disabled || sentiment.untrusted) {
    return {
      source: "copilot",
      kind: "warning",
      icon: Codicon.account,
      label: localize(3748, null),
      ariaLabel: sentiment.untrusted ? localize(3750, null) : localize(3749, null)
    };
  }
  const chatQuotaExceeded = quotas.chat?.percentRemaining === 0;
  const completionsQuotaExceeded = quotas.completions?.percentRemaining === 0;
  if (entitlement === 5 /* Free */ && (chatQuotaExceeded || completionsQuotaExceeded)) {
    return {
      source: "copilot",
      kind: "warning",
      icon: Codicon.account,
      label: localize(3745, null),
      dotBadge: "error",
      ariaLabel: getQuotaReachedAriaLabel(chatQuotaExceeded, completionsQuotaExceeded)
    };
  }
  const remainingPercent = getLowestPositivePercent(quotas.chat, quotas.completions);
  if (entitlement === 5 /* Free */ && typeof remainingPercent === "number" && remainingPercent <= 25) {
    return {
      source: "copilot",
      kind: remainingPercent <= 10 ? "warning" : "accent",
      icon: Codicon.account,
      label: localize(3746, null),
      badge: `${remainingPercent}%`,
      dotBadge: remainingPercent <= 10 ? "error" : "warning",
      ariaLabel: localize(3747, null, remainingPercent)
    };
  }
  return void 0;
}

function getLowestPositivePercent(...quotas) {
  let lowest;
  for (const quota of quotas) {
    if (typeof quota?.percentRemaining !== "number" || quota.percentRemaining <= 0) {
      continue;
    }
    lowest = typeof lowest === "number" ? Math.min(lowest, quota.percentRemaining) : quota.percentRemaining;
  }
  return lowest;
}

function getQuotaReachedAriaLabel(chatQuotaExceeded, completionsQuotaExceeded) {
  if (chatQuotaExceeded && completionsQuotaExceeded) {
    return localize(3742, null);
  }
  if (chatQuotaExceeded) {
    return localize(3743, null);
  }
  return localize(3744, null);
}
export { resolveAccountInfo, getSessionAccountIcon, getAccountProfileImageUrl, getAccountTitleBarBadgeKey, getAccountTitleBarState, getCopilotPresentation, getLowestPositivePercent, getQuotaReachedAriaLabel };
