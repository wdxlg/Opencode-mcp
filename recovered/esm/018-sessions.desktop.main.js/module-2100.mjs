// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/chatPermissionWarnings.ts
import { ASSISTED_APPROVAL_DONT_SHOW_AGAIN_KEY, AUTOPILOT_DONT_SHOW_AGAIN_KEY, AUTO_APPROVE_DONT_SHOW_AGAIN_KEY } from "./module-2099.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { severity_default } from "./module-0266.mjs";
import { MarkdownString } from "./module-0462.mjs";


// src/vs/workbench/contrib/chat/common/chatPermissionWarnings.ts
var shownWarnings = /* @__PURE__ */ new Set();

function dontShowAgainKey(level) {
  if (level === "autopilot" /* Autopilot */) {
    return AUTOPILOT_DONT_SHOW_AGAIN_KEY;
  }
  if (level === "autoApprove" /* AutoApprove */) {
    return AUTO_APPROVE_DONT_SHOW_AGAIN_KEY;
  }
  if (level === "assisted" /* Assisted */) {
    return ASSISTED_APPROVAL_DONT_SHOW_AGAIN_KEY;
  }
  return void 0;
}

function resetShownWarnings() {
  shownWarnings.clear();
}

var ELEVATION_RANK = /* @__PURE__ */ new Map([
  ["assisted" /* Assisted */, 1],
  ["autoApprove" /* AutoApprove */, 2],
  ["autopilot" /* Autopilot */, 2]
]);

function hasShownElevatedWarning(level, storageService) {
  const rank = ELEVATION_RANK.get(level);
  if (rank === void 0) {
    return false;
  }
  for (const [candidate, candidateRank] of ELEVATION_RANK) {
    if (candidateRank < rank) {
      continue;
    }
    if (shownWarnings.has(candidate)) {
      return true;
    }
    const key3 = dontShowAgainKey(candidate);
    if (key3 && storageService.getBoolean(key3, 0 /* PROFILE */, false)) {
      return true;
    }
  }
  return false;
}

function getElevatedWarningCopy(level, defaultSettingKey, levelLabel) {
  switch (level) {
    case "assisted" /* Assisted */:
      levelLabel ??= localize(12917, null);
      return {
        title: localize(12920, null, levelLabel),
        confirm: localize(12918, null),
        icon: Codicon.sparkle,
        detail: localize(12919, null, levelLabel, defaultSettingKey)
      };
    case "autopilot" /* Autopilot */:
      return {
        title: localize(12927, null),
        confirm: localize(12925, null),
        icon: Codicon.rocket,
        detail: localize(12926, null, defaultSettingKey)
      };
    case "autoApprove" /* AutoApprove */:
      levelLabel ??= localize(12921, null);
      return {
        title: localize(12924, null, levelLabel),
        confirm: localize(12922, null),
        icon: Codicon.warning,
        detail: localize(12923, null, levelLabel, defaultSettingKey)
      };
    default:
      return void 0;
  }
}

async function maybeConfirmElevatedPermissionLevel(level, dialogService, storageService, options3) {
  const key3 = dontShowAgainKey(level);
  if (!key3 || hasShownElevatedWarning(level, storageService)) {
    return true;
  }
  const copy = getElevatedWarningCopy(level, options3?.defaultSettingKey ?? "chat.permissions.default" /* DefaultPermissionLevel */, options3?.levelLabel);
  if (!copy) {
    return true;
  }
  const result = await dialogService.prompt({
    type: severity_default.Warning,
    message: copy.title,
    buttons: [
      {
        label: copy.confirm,
        run: () => true
      },
      {
        label: localize(12928, null),
        run: () => false
      }
    ],
    checkbox: {
      label: localize(12929, null),
      checked: false
    },
    custom: {
      icon: copy.icon,
      markdownDetails: [{
        markdown: new MarkdownString(
          copy.detail,
          { isTrusted: { enabledCommands: ["workbench.action.openSettings"] } }
        )
      }]
    }
  });
  if (result.result !== true) {
    return false;
  }
  if (result.checkboxChecked) {
    storageService.store(key3, true, 0 /* PROFILE */, 0 /* USER */);
  }
  shownWarnings.add(level);
  return true;
}
export { dontShowAgainKey, resetShownWarnings, hasShownElevatedWarning, getElevatedWarningCopy, maybeConfirmElevatedPermissionLevel, shownWarnings, ELEVATION_RANK };
