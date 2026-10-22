// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/agentHostCodexApprovalsPicker.ts
import { Codicon } from "./module-0085.mjs";
import { AgentHostSessionEnumPicker } from "./module-3694.mjs";
import { isWellKnownCodexApprovalsSchema } from "./module-3693.mjs";
import { localize } from "./module-0001.mjs";
import { getCodexApprovalsPickerListOptions } from "./module-2094.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IOpenerService } from "./module-0272.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/agentHostCodexApprovalsPicker.ts
var CODEX_APPROVALS_LEARN_MORE_URL2 = "https://developers.openai.com/codex/concepts/sandboxing#how-you-control-it";

var LEARN_MORE_VALUE3 = "__agentHostCodexApprovalsPicker.learnMore__";

function getCodexApprovalsIcon(value2) {
  switch (value2) {
    case "default":
      return Codicon.shield;
    case "auto-review":
      return Codicon.sparkle;
    case "full-access":
      return Codicon.warning;
    default:
      return void 0;
  }
}

var AgentHostCodexApprovalsPicker = class extends AgentHostSessionEnumPicker {
  constructor(session, actionWidgetService, sessionsProvidersService, telemetryService, hoverService, _openerService) {
    super(session, actionWidgetService, sessionsProvidersService, telemetryService, hoverService);
    this._openerService = _openerService;
    this._property = "codex.permissionsPreset" /* PermissionsPreset */;
    this._pickerId = "agentHostCodexApprovalsPicker";
    this._telemetryId = "NewChatAgentHostCodexApprovalsPicker";
  }
  _isWellKnownSchema(schema10) {
    return isWellKnownCodexApprovalsSchema(schema10);
  }
  _getTriggerIcon(value2) {
    return getCodexApprovalsIcon(value2);
  }
  _getActionItemIcon(item) {
    return getCodexApprovalsIcon(item.value);
  }
  _getTriggerAriaLabel(label3) {
    return localize(4916, null, label3);
  }
  _getWidgetAriaLabel() {
    return localize(4915, null);
  }
  _getListOptions() {
    return getCodexApprovalsPickerListOptions();
  }
  _getFooterActionItems() {
    const learnMoreLabel = localize(4917, null);
    return [
      {
        kind: "separator" /* Separator */,
        label: ""
      },
      {
        kind: "action" /* Action */,
        label: learnMoreLabel,
        group: { title: "", icon: Codicon.blank },
        item: {
          value: LEARN_MORE_VALUE3,
          label: learnMoreLabel
        }
      }
    ];
  }
  _handleFooterActionItem(item) {
    if (item.value !== LEARN_MORE_VALUE3) {
      return false;
    }
    void this._openerService.open(URI.parse(CODEX_APPROVALS_LEARN_MORE_URL2));
    return true;
  }
};

AgentHostCodexApprovalsPicker = __decorateClass([
  __decorateParam(1, IActionWidgetService),
  __decorateParam(2, ISessionsProvidersService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, IHoverService),
  __decorateParam(5, IOpenerService)
], AgentHostCodexApprovalsPicker);
export { getCodexApprovalsIcon, CODEX_APPROVALS_LEARN_MORE_URL2, LEARN_MORE_VALUE3, AgentHostCodexApprovalsPicker };
