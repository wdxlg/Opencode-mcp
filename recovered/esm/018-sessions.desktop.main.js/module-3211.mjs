// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/notification/browser/terminalNotificationHandler.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { decodeBase64 } from "./module-0038.mjs";
import { Severity2 } from "./module-0336.mjs";
import { localize } from "./module-0001.mjs";
import { Action } from "./module-0082.mjs";
import { disposableTimeout } from "./module-0036.mjs";


// src/vs/workbench/contrib/terminalContrib/notification/browser/terminalNotificationHandler.ts
var TerminalNotificationHandler = class extends Disposable {
  constructor(_host) {
    super();
    this._host = _host;
    this._osc99PendingNotifications = /* @__PURE__ */ new Map();
    this._osc99ActiveNotifications = /* @__PURE__ */ new Map();
  }
  handleSequence(data) {
    const { metadata, payload } = this._splitOsc99Data(data);
    const metadataEntries = this._parseOsc99Metadata(metadata);
    const payloadTypes = metadataEntries.get("p");
    const rawPayloadType = payloadTypes && payloadTypes.length > 0 ? payloadTypes[payloadTypes.length - 1] : void 0;
    const payloadType = rawPayloadType && rawPayloadType.length > 0 ? rawPayloadType : "title" /* Title */;
    const id2 = this._sanitizeOsc99Id(metadataEntries.get("i")?.[0]);
    if (!this._host.isEnabled()) {
      return true;
    }
    switch (payloadType) {
      case "?" /* Query */:
        this._sendOsc99QueryResponse(id2);
        return true;
      case "alive" /* Alive */:
        this._sendOsc99AliveResponse(id2);
        return true;
      case "close" /* Close */:
        this._closeOsc99Notification(id2);
        return true;
    }
    const state = this._getOrCreateOsc99State(id2);
    this._updateOsc99StateFromMetadata(state, metadataEntries);
    const isEncoded = metadataEntries.get("e")?.[0] === "1";
    const payloadText = this._decodeOsc99Payload(payload, isEncoded);
    const isDone = metadataEntries.get("d")?.[0] !== "0";
    switch (payloadType) {
      case "title" /* Title */:
        state.title += payloadText;
        break;
      case "body" /* Body */:
        state.body += payloadText;
        break;
      case "buttons" /* Buttons */:
        state.buttonsPayload += payloadText;
        break;
      default:
        return true;
    }
    if (!isDone) {
      return true;
    }
    if (!this._shouldHonorOsc99Occasion(state.occasion)) {
      this._clearOsc99PendingState(id2);
      return true;
    }
    if (this._showOsc99Notification(state)) {
      this._clearOsc99PendingState(id2);
    }
    return true;
  }
  _splitOsc99Data(data) {
    const separatorIndex = data.indexOf(";");
    if (separatorIndex === -1) {
      return { metadata: data, payload: "" };
    }
    return {
      metadata: data.substring(0, separatorIndex),
      payload: data.substring(separatorIndex + 1)
    };
  }
  _parseOsc99Metadata(metadata) {
    const result = /* @__PURE__ */ new Map();
    if (!metadata) {
      return result;
    }
    for (const entry of metadata.split(":")) {
      if (!entry) {
        continue;
      }
      const separatorIndex = entry.indexOf("=");
      if (separatorIndex === -1) {
        continue;
      }
      const key3 = entry.substring(0, separatorIndex);
      const value2 = entry.substring(separatorIndex + 1);
      if (!key3) {
        continue;
      }
      let values = result.get(key3);
      if (!values) {
        values = [];
        result.set(key3, values);
      }
      values.push(value2);
    }
    return result;
  }
  _decodeOsc99Payload(payload, isEncoded) {
    if (!isEncoded) {
      return payload;
    }
    try {
      return decodeBase64(payload).toString();
    } catch {
      this._host.logWarn("Failed to decode OSC 99 payload");
      return "";
    }
  }
  _sanitizeOsc99Id(rawId) {
    if (!rawId) {
      return void 0;
    }
    const sanitized = rawId.replace(/[^a-zA-Z0-9_\-+.]/g, "");
    return sanitized.length > 0 ? sanitized : void 0;
  }
  _sanitizeOsc99MessageText(text2) {
    return text2.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
  }
  _getOrCreateOsc99State(id2) {
    if (!id2) {
      if (!this._osc99PendingAnonymous) {
        this._osc99PendingAnonymous = this._createOsc99State(void 0);
      }
      return this._osc99PendingAnonymous;
    }
    let state = this._osc99PendingNotifications.get(id2);
    if (!state) {
      state = this._createOsc99State(id2);
      this._osc99PendingNotifications.set(id2, state);
    }
    return state;
  }
  _createOsc99State(id2) {
    return {
      id: id2,
      title: "",
      body: "",
      buttonsPayload: "",
      focusOnActivate: true,
      reportOnActivate: false,
      reportOnClose: false,
      urgency: void 0,
      autoCloseMs: void 0,
      occasion: void 0
    };
  }
  _clearOsc99PendingState(id2) {
    if (!id2) {
      this._osc99PendingAnonymous = void 0;
      return;
    }
    this._osc99PendingNotifications.delete(id2);
  }
  _updateOsc99StateFromMetadata(state, metadataEntries) {
    const actionValues = metadataEntries.get("a");
    const actionValue = actionValues && actionValues.length > 0 ? actionValues[actionValues.length - 1] : void 0;
    if (actionValue !== void 0) {
      const actions = this._parseOsc99Actions(actionValue);
      state.focusOnActivate = actions.focusOnActivate;
      state.reportOnActivate = actions.reportOnActivate;
    }
    const closeValues = metadataEntries.get("c");
    const closeValue = closeValues && closeValues.length > 0 ? closeValues[closeValues.length - 1] : void 0;
    if (closeValue !== void 0) {
      state.reportOnClose = closeValue === "1";
    }
    const urgencyValues = metadataEntries.get("u");
    const urgencyValue = urgencyValues && urgencyValues.length > 0 ? urgencyValues[urgencyValues.length - 1] : void 0;
    if (urgencyValue !== void 0) {
      const urgency = Number.parseInt(urgencyValue, 10);
      if (!Number.isNaN(urgency)) {
        state.urgency = urgency;
      }
    }
    const autoCloseValues = metadataEntries.get("w");
    const autoCloseValue = autoCloseValues && autoCloseValues.length > 0 ? autoCloseValues[autoCloseValues.length - 1] : void 0;
    if (autoCloseValue !== void 0) {
      const autoClose = Number.parseInt(autoCloseValue, 10);
      if (!Number.isNaN(autoClose)) {
        state.autoCloseMs = autoClose;
      }
    }
    const occasionValues = metadataEntries.get("o");
    const occasionValue = occasionValues && occasionValues.length > 0 ? occasionValues[occasionValues.length - 1] : void 0;
    if (occasionValue === "always" || occasionValue === "unfocused" || occasionValue === "invisible") {
      state.occasion = occasionValue;
    }
  }
  _parseOsc99Actions(value2) {
    let focusOnActivate = true;
    let reportOnActivate = false;
    for (const token of value2.split(",")) {
      switch (token) {
        case "focus":
          focusOnActivate = true;
          break;
        case "-focus":
          focusOnActivate = false;
          break;
        case "report":
          reportOnActivate = true;
          break;
        case "-report":
          reportOnActivate = false;
          break;
      }
    }
    return { focusOnActivate, reportOnActivate };
  }
  _shouldHonorOsc99Occasion(occasion) {
    if (!occasion || occasion === "always") {
      return true;
    }
    const windowFocused = this._host.isWindowFocused();
    switch (occasion) {
      case "unfocused":
        return !windowFocused;
      case "invisible":
        return !windowFocused && !this._host.isTerminalVisible();
      default:
        return true;
    }
  }
  _showOsc99Notification(state) {
    const message = this._getOsc99NotificationMessage(state);
    if (!message) {
      return false;
    }
    const severity = state.urgency === 2 ? Severity2.Warning : Severity2.Info;
    const priority = this._getOsc99NotificationPriority(state.urgency);
    const source = {
      id: "terminal",
      label: localize(20804, null)
    };
    const buttons = state.buttonsPayload.length > 0 ? state.buttonsPayload.split("\u2028") : [];
    const actionStore = this._register(new DisposableStore());
    const handleRef = { current: void 0 };
    const activeRef = { current: void 0 };
    const reportActivation = (buttonIndex, forceFocus) => {
      if (forceFocus || state.focusOnActivate) {
        this._host.focusTerminal();
      }
      if (state.reportOnActivate) {
        this._sendOsc99ActivationReport(state.id, buttonIndex);
      }
    };
    const primaryActions = [];
    for (let i2 = 0; i2 < buttons.length; i2++) {
      const label3 = buttons[i2];
      if (!label3) {
        continue;
      }
      const action = actionStore.add(new Action(`terminal.osc99.button.${i2}`, label3, void 0, true, () => {
        if (activeRef.current) {
          activeRef.current.closeReason = "button";
        }
        reportActivation(i2 + 1);
        handleRef.current?.close();
      }));
      primaryActions.push(action);
    }
    const secondaryActions = [];
    secondaryActions.push(actionStore.add(new Action(
      "terminal.osc99.dismiss",
      localize(20803, null),
      void 0,
      true,
      () => {
        if (activeRef.current) {
          activeRef.current.closeReason = "secondary";
        }
        handleRef.current?.close();
      }
    )));
    secondaryActions.push(actionStore.add(new Action(
      "terminal.osc99.disable",
      localize(20802, null),
      void 0,
      true,
      async () => {
        await this._host.updateEnableNotifications(false);
        if (activeRef.current) {
          activeRef.current.closeReason = "secondary";
        }
        handleRef.current?.close();
      }
    )));
    const actions = { primary: primaryActions, secondary: secondaryActions };
    if (state.id) {
      const existing = this._osc99ActiveNotifications.get(state.id);
      if (existing) {
        activeRef.current = existing;
        handleRef.current = existing.handle;
        existing.handle.updateMessage(message);
        existing.handle.updateSeverity(severity);
        existing.handle.updateActions(actions);
        existing.actionStore.dispose();
        existing.actionStore = actionStore;
        existing.focusOnActivate = state.focusOnActivate;
        existing.reportOnActivate = state.reportOnActivate;
        existing.reportOnClose = state.reportOnClose;
        existing.autoCloseDisposable?.dispose();
        existing.autoCloseDisposable = this._scheduleOsc99AutoClose(existing, state.autoCloseMs);
        return true;
      }
    }
    const handle2 = this._host.notify({
      id: state.id ? `terminal.osc99.${state.id}` : void 0,
      severity,
      message,
      source,
      actions,
      priority
    });
    handleRef.current = handle2;
    const active = {
      id: state.id,
      handle: handle2,
      actionStore,
      autoCloseDisposable: void 0,
      reportOnActivate: state.reportOnActivate,
      reportOnClose: state.reportOnClose,
      focusOnActivate: state.focusOnActivate,
      closeReason: void 0
    };
    activeRef.current = active;
    active.autoCloseDisposable = this._scheduleOsc99AutoClose(active, state.autoCloseMs);
    this._register(handle2.onDidClose(() => {
      if (active.reportOnActivate && active.closeReason === void 0) {
        if (active.focusOnActivate) {
          this._host.focusTerminal();
        }
        this._sendOsc99ActivationReport(active.id);
      }
      if (active.reportOnClose) {
        this._sendOsc99CloseReport(active.id);
      }
      active.actionStore.dispose();
      active.autoCloseDisposable?.dispose();
      if (active.id) {
        this._osc99ActiveNotifications.delete(active.id);
      }
    }));
    if (active.id) {
      this._osc99ActiveNotifications.set(active.id, active);
    }
    return true;
  }
  _getOsc99NotificationMessage(state) {
    const title = this._sanitizeOsc99MessageText(state.title);
    const body = this._sanitizeOsc99MessageText(state.body);
    const hasTitle = title.trim().length > 0;
    const hasBody = body.trim().length > 0;
    if (hasTitle && hasBody) {
      return `${title}: ${body}`;
    }
    if (hasTitle) {
      return title;
    }
    if (hasBody) {
      return body;
    }
    return void 0;
  }
  _getOsc99NotificationPriority(urgency) {
    switch (urgency) {
      case 0:
        return 2 /* SILENT */;
      case 1:
        return 0 /* DEFAULT */;
      case 2:
        return 3 /* URGENT */;
      default:
        return void 0;
    }
  }
  _scheduleOsc99AutoClose(active, autoCloseMs) {
    if (autoCloseMs === void 0 || autoCloseMs <= 0) {
      return void 0;
    }
    return disposableTimeout(() => {
      active.closeReason = "auto";
      active.handle.close();
    }, autoCloseMs, this._store);
  }
  _closeOsc99Notification(id2) {
    if (!id2) {
      return;
    }
    const active = this._osc99ActiveNotifications.get(id2);
    if (active) {
      active.closeReason = "protocol";
      active.handle.close();
    }
    this._osc99PendingNotifications.delete(id2);
  }
  _sendOsc99QueryResponse(id2) {
    const requestId = id2 ?? "0";
    this._sendOsc99Response([
      `i=${requestId}`,
      "p=?",
      "a=report,focus",
      "c=1",
      "o=always,unfocused,invisible",
      "p=title,body,buttons,close,alive,?",
      "u=0,1,2",
      "w=1"
    ]);
  }
  _sendOsc99AliveResponse(id2) {
    const requestId = id2 ?? "0";
    const aliveIds = Array.from(this._osc99ActiveNotifications.keys()).join(",");
    this._sendOsc99Response([
      `i=${requestId}`,
      "p=alive"
    ], aliveIds);
  }
  _sendOsc99ActivationReport(id2, buttonIndex) {
    const reportId = id2 ?? "0";
    this._sendOsc99Response([`i=${reportId}`], buttonIndex !== void 0 ? String(buttonIndex) : "");
  }
  _sendOsc99CloseReport(id2) {
    const reportId = id2 ?? "0";
    this._sendOsc99Response([`i=${reportId}`, "p=close"]);
  }
  _sendOsc99Response(metadataParts, payload = "") {
    const metadata = metadataParts.join(":");
    this._host.writeToProcess(`\x1B]99;${metadata};${payload}\x1B\\`);
  }
};
export { TerminalNotificationHandler };
