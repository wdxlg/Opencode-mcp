// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/model/chatProgressTypes/chatElicitationRequestPart.ts
import { observableValue } from "./module-0048.mjs";


// src/vs/workbench/contrib/chat/common/model/chatProgressTypes/chatElicitationRequestPart.ts
var ChatElicitationRequestPart = class {
  constructor(title, message, subtitle, acceptButtonLabel, rejectButtonLabel, _accept, reject, source, moreActions, onHide, riskAssessment) {
    this.title = title;
    this.message = message;
    this.subtitle = subtitle;
    this.acceptButtonLabel = acceptButtonLabel;
    this.rejectButtonLabel = rejectButtonLabel;
    this._accept = _accept;
    this.source = source;
    this.moreActions = moreActions;
    this.onHide = onHide;
    this.riskAssessment = riskAssessment;
    this.kind = "elicitation2";
    this.state = observableValue("state", "pending" /* Pending */);
    this._isHiddenValue = observableValue("isHidden", false);
    this.isHidden = this._isHiddenValue;
    if (reject) {
      this.reject = async () => {
        const state = await reject();
        this.state.set(state, void 0);
      };
    }
  }
  accept(value2) {
    return this._accept(value2).then((state) => {
      this.state.set(state, void 0);
    });
  }
  hide() {
    if (this._isHiddenValue.get()) {
      return;
    }
    this._isHiddenValue.set(true, void 0, void 0);
    this.onHide?.();
    if (this.state.get() === "pending" /* Pending */) {
      this.state.set("rejected" /* Rejected */, void 0);
    }
  }
  toJSON() {
    const state = this.state.get();
    return {
      kind: "elicitationSerialized",
      title: this.title,
      message: this.message,
      state: state === "pending" /* Pending */ ? "rejected" /* Rejected */ : state,
      acceptedResult: this.acceptedResult,
      subtitle: this.subtitle,
      source: this.source,
      isHidden: this._isHiddenValue.get()
    };
  }
};
export { ChatElicitationRequestPart };
