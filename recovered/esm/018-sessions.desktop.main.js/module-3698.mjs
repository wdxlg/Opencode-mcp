// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/agentHostClaudePermissionModePicker.ts
import { Codicon } from "./module-0085.mjs";
import { AgentHostSessionEnumPicker } from "./module-3694.mjs";
import { isWellKnownClaudePermissionModeSchema } from "./module-3693.mjs";
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IOpenerService } from "./module-0272.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/agentHostClaudePermissionModePicker.ts
var CLAUDE_PERMISSION_MODE_LEARN_MORE_URL = "https://code.claude.com/docs/en/permission-modes#available-modes";

var LEARN_MORE_VALUE2 = "__agentHostClaudePermissionModePicker.learnMore__";

function getClaudePermissionModeIcon(value2) {
  switch (value2) {
    case "default":
      return Codicon.shield;
    case "acceptEdits":
      return Codicon.edit;
    case "plan":
      return Codicon.lightbulb;
    case "auto":
      return Codicon.sparkle;
    case "bypassPermissions":
      return Codicon.warning;
    default:
      return void 0;
  }
}

var AgentHostClaudePermissionModePicker = class extends AgentHostSessionEnumPicker {
  constructor(session, actionWidgetService, sessionsProvidersService, telemetryService, hoverService, _openerService) {
    super(session, actionWidgetService, sessionsProvidersService, telemetryService, hoverService);
    this._openerService = _openerService;
    this._property = "permissionMode" /* PermissionMode */;
    this._pickerId = "agentHostClaudePermissionModePicker";
    this._telemetryId = "NewChatAgentHostClaudePermissionModePicker";
  }
  _isWellKnownSchema(schema10) {
    return isWellKnownClaudePermissionModeSchema(schema10);
  }
  _getTriggerIcon(value2) {
    return getClaudePermissionModeIcon(value2);
  }
  _getActionItemIcon(item) {
    return getClaudePermissionModeIcon(item.value);
  }
  _getTriggerAriaLabel(label3) {
    return localize(4913, null, label3);
  }
  _getWidgetAriaLabel() {
    return localize(4912, null);
  }
  _getFooterActionItems() {
    const learnMoreLabel = localize(4914, null);
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
          value: LEARN_MORE_VALUE2,
          label: learnMoreLabel
        }
      }
    ];
  }
  _handleFooterActionItem(item) {
    if (item.value !== LEARN_MORE_VALUE2) {
      return false;
    }
    void this._openerService.open(URI.parse(CLAUDE_PERMISSION_MODE_LEARN_MORE_URL));
    return true;
  }
};

AgentHostClaudePermissionModePicker = __decorateClass([
  __decorateParam(1, IActionWidgetService),
  __decorateParam(2, ISessionsProvidersService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, IHoverService),
  __decorateParam(5, IOpenerService)
], AgentHostClaudePermissionModePicker);
export { getClaudePermissionModeIcon, CLAUDE_PERMISSION_MODE_LEARN_MORE_URL, LEARN_MORE_VALUE2, AgentHostClaudePermissionModePicker };
