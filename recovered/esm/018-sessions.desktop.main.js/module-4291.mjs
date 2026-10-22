// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackOverviewRulerContribution.ts
import { registerColor } from "./module-0226.mjs";
import { overviewRulerInfo } from "./module-0288.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable } from "./module-0012.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { themeColorFromId2 } from "./module-0287.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentFeedbackService } from "./module-3611.mjs";
import { registerEditorContribution } from "./module-0097.mjs";


// src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackOverviewRulerContribution.ts
var overviewRulerAgentFeedbackForeground = registerColor(
  "editorOverviewRuler.agentFeedbackForeground",
  overviewRulerInfo,
  localize(4082, null)
);

var AgentFeedbackOverviewRulerContribution = class extends Disposable {
  constructor(_editor, _agentFeedbackService) {
    super();
    this._editor = _editor;
    this._agentFeedbackService = _agentFeedbackService;
    this._decorations = this._editor.createDecorationsCollection();
    this._store.add(this._agentFeedbackService.onDidChangeFeedback(() => this._updateDecorations()));
    this._store.add(this._agentFeedbackService.onDidChangeFeedbackVisibility(() => this._updateDecorations()));
    this._store.add(this._agentFeedbackService.onDidChangeFeedbackScope(() => {
      this._resolveSession();
      this._updateDecorations();
    }));
    this._store.add(this._editor.onDidChangeModel(() => {
      this._resolveSession();
      this._updateDecorations();
    }));
    this._resolveSession();
    this._updateDecorations();
  }
  static {
    this.ID = "agentFeedback.overviewRulerContribution";
  }
  _resolveSession() {
    const model = this._editor.getModel();
    if (!model) {
      this._sessionResource = void 0;
      return;
    }
    this._sessionResource = this._agentFeedbackService.getFeedbackSessionResource(model.uri);
  }
  _updateDecorations() {
    if (!this._sessionResource) {
      this._decorations.clear();
      return;
    }
    const model = this._editor.getModel();
    if (!model) {
      this._decorations.clear();
      return;
    }
    const feedbackItems = this._agentFeedbackService.getFeedback(this._sessionResource);
    const visibleResolvedFeedbackIds = this._agentFeedbackService.getVisibleResolvedFeedbackIds(this._sessionResource);
    this._decorations.set(
      feedbackItems.filter((item) => isEqual2(item.resourceUri, model.uri) && (item.state !== "resolved" /* Resolved */ || visibleResolvedFeedbackIds.has(item.id))).map((item) => ({
        range: item.range,
        options: {
          description: "agent-feedback-overview-ruler",
          overviewRuler: {
            color: themeColorFromId2(overviewRulerAgentFeedbackForeground),
            position: 2 /* Center */
          }
        }
      }))
    );
  }
  dispose() {
    this._decorations.clear();
    super.dispose();
  }
};

AgentFeedbackOverviewRulerContribution = __decorateClass([
  __decorateParam(1, IAgentFeedbackService)
], AgentFeedbackOverviewRulerContribution);

registerEditorContribution(AgentFeedbackOverviewRulerContribution.ID, AgentFeedbackOverviewRulerContribution, 3 /* Eventually */);
export { overviewRulerAgentFeedbackForeground, AgentFeedbackOverviewRulerContribution };
