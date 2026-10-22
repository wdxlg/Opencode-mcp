// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostPermissionUiContribution.ts
import { CommandsRegistry } from "./module-0087.mjs";
import { IAgentHostResourceService } from "./module-1803.mjs";
import { Disposable } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { MarkdownString, escapeMarkdownSyntaxTokens } from "./module-0462.mjs";
import { Schemas } from "./module-0033.mjs";
import { localize } from "./module-0001.mjs";
import { AGENT_HOST_SCHEME, agentHostAuthority } from "./module-1000.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatInputNotificationService } from "./module-1461.mjs";
import { ILabelService } from "./module-0641.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostPermissionUiContribution.ts
var ALLOW_COMMAND = "_agentHost.permission.allow";

var ALLOW_ALWAYS_COMMAND = "_agentHost.permission.allowAlways";

var DENY_COMMAND = "_agentHost.permission.deny";

CommandsRegistry.registerCommand(ALLOW_COMMAND, (accessor, requestId) => {
  accessor.get(IAgentHostResourceService).findPending(requestId)?.allow();
});

CommandsRegistry.registerCommand(ALLOW_ALWAYS_COMMAND, (accessor, requestId) => {
  accessor.get(IAgentHostResourceService).findPending(requestId)?.allowAlways();
});

CommandsRegistry.registerCommand(DENY_COMMAND, (accessor, requestId) => {
  accessor.get(IAgentHostResourceService).findPending(requestId)?.deny();
});

var AgentHostPermissionUiContribution = class extends Disposable {
  constructor(_permissionService, _chatInputNotificationService, _labelService) {
    super();
    this._permissionService = _permissionService;
    this._chatInputNotificationService = _chatInputNotificationService;
    this._labelService = _labelService;
    this._register(autorun((reader) => {
      const pending = this._permissionService.allPending.read(reader);
      this._render(pending);
    }));
  }
  static {
    this.ID = "workbench.contrib.agentHostPermissionUi";
  }
  static {
    /** Stable id used in {@link IChatInputNotification} so updates replace in place. */
    this.NOTIFICATION_ID = "agentHost.permissionRequest";
  }
  _render(pending) {
    const next = pending[0];
    if (!next) {
      if (this._lastRequestId) {
        this._chatInputNotificationService.deleteNotification(AgentHostPermissionUiContribution.NOTIFICATION_ID);
        this._lastRequestId = void 0;
      }
      return;
    }
    this._lastRequestId = next.id;
    this._chatInputNotificationService.setNotification(this._buildNotification(next, pending.length));
  }
  _buildNotification(request2, totalPending) {
    const hostName = escapeMarkdownSyntaxTokens(this._resolveHostName(request2.address));
    const path = request2.uri.scheme === Schemas.file ? request2.uri.fsPath : request2.uri.toString();
    const fence = "`".repeat((path.match(/`+/g)?.reduce((m, s) => Math.max(m, s.length), 0) ?? 0) + 1);
    const codePath = `${fence}${path}${fence}`;
    const message = new MarkdownString(
      request2.mode === "write" /* Write */ ? localize(
        8978,
        null,
        hostName,
        codePath
      ) : localize(
        8977,
        null,
        hostName,
        codePath
      )
    );
    const description = totalPending > 1 ? totalPending === 2 ? localize(8976, null) : localize(8975, null, totalPending - 1) : void 0;
    return {
      id: AgentHostPermissionUiContribution.NOTIFICATION_ID,
      severity: 1 /* Warning */,
      message,
      description,
      actions: [
        {
          kind: "command" /* Command */,
          label: localize(8974, null),
          commandId: DENY_COMMAND,
          commandArgs: [request2.id]
        },
        {
          kind: "command" /* Command */,
          label: localize(8972, null),
          commandId: ALLOW_COMMAND,
          commandArgs: [request2.id]
        },
        {
          kind: "command" /* Command */,
          label: localize(8973, null),
          commandId: ALLOW_ALWAYS_COMMAND,
          commandArgs: [request2.id]
        }
      ],
      // Do not let the user dismiss without choosing — this is a security
      // decision. Clicking any of the three buttons resolves it.
      dismissible: false,
      autoDismissOnMessage: false
    };
  }
  _resolveHostName(address) {
    const authority = agentHostAuthority(address);
    const label3 = this._labelService.getHostLabel(AGENT_HOST_SCHEME, authority);
    return label3 && label3 !== authority ? label3 : address;
  }
};

AgentHostPermissionUiContribution = __decorateClass([
  __decorateParam(0, IAgentHostResourceService),
  __decorateParam(1, IChatInputNotificationService),
  __decorateParam(2, ILabelService)
], AgentHostPermissionUiContribution);
export { ALLOW_COMMAND, ALLOW_ALWAYS_COMMAND, DENY_COMMAND, AgentHostPermissionUiContribution };
