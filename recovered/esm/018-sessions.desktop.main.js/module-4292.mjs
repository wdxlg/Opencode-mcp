// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackAttachment.ts
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { isAgentHostProviderId } from "./module-1764.mjs";
import { ATTACHMENT_ID_PREFIX, createAgentFeedbackVariableEntry } from "./module-3589.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentFeedbackService } from "./module-3611.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";


// src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackAttachment.ts
var AgentFeedbackAttachmentContribution = class extends Disposable {
  constructor(_agentFeedbackService, _chatWidgetService, _sessionsManagementService) {
    super();
    this._agentFeedbackService = _agentFeedbackService;
    this._chatWidgetService = _chatWidgetService;
    this._sessionsManagementService = _sessionsManagementService;
    /** Track onDidAcceptInput subscriptions per widget session */
    this._widgetListeners = this._store.add(new DisposableMap());
    this._store.add(this._agentFeedbackService.onDidChangeFeedback((e4) => {
      if (this._isAgentHostSession(e4.sessionResource)) {
        return;
      }
      this._updateAttachment(e4.sessionResource);
      this._ensureAcceptListener(e4.sessionResource);
    }));
  }
  static {
    this.ID = "workbench.contrib.agentFeedbackAttachment";
  }
  _isAgentHostSession(sessionResource) {
    const session = this._sessionsManagementService.getSession(sessionResource);
    return session ? isAgentHostProviderId(session.providerId) : false;
  }
  async _updateAttachment(sessionResource) {
    const widget = this._chatWidgetService.getWidgetBySessionResource(sessionResource);
    if (!widget) {
      return;
    }
    const feedbackItems = this._agentFeedbackService.getFeedback(sessionResource).filter((item) => item.state === "accepted" /* Accepted */);
    const attachmentId = ATTACHMENT_ID_PREFIX + sessionResource.toString();
    if (feedbackItems.length === 0) {
      widget.attachmentModel.delete(attachmentId);
      return;
    }
    const entry = createAgentFeedbackVariableEntry(sessionResource, feedbackItems);
    widget.attachmentModel.delete(attachmentId);
    widget.attachmentModel.addContext(entry);
  }
  /**
   * Ensure we listen for the chat widget's submit event so we can clear feedback after send.
   */
  _ensureAcceptListener(sessionResource) {
    const key3 = sessionResource.toString();
    if (this._widgetListeners.has(key3)) {
      return;
    }
    const widget = this._chatWidgetService.getWidgetBySessionResource(sessionResource);
    if (!widget) {
      return;
    }
    this._widgetListeners.set(key3, widget.onDidSubmitAgent(() => {
      this._agentFeedbackService.markFeedbackSubmitted(sessionResource);
      this._widgetListeners.deleteAndDispose(key3);
    }));
  }
};

AgentFeedbackAttachmentContribution = __decorateClass([
  __decorateParam(0, IAgentFeedbackService),
  __decorateParam(1, IChatWidgetService),
  __decorateParam(2, ISessionsManagementService)
], AgentFeedbackAttachmentContribution);
export { AgentFeedbackAttachmentContribution };
