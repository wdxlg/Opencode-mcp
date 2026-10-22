// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugEventList.ts
import { $, append } from "./module-0075.mjs";
import { safeIntl } from "./module-0120.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugEventList.ts
var $71 = $;

function safeStr(value2, fallback2 = "") {
  if (value2 === null || value2 === void 0 || typeof value2 !== "string") {
    return fallback2;
  }
  return value2;
}

var dateFormatter = safeIntl.DateTimeFormat(void 0, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit"
});

var numberFormatter2 = safeIntl.NumberFormat();

function getEventCreatedText(element) {
  return dateFormatter.value.format(element.created);
}

function getEventNameText(element) {
  switch (element.kind) {
    case "toolCall":
      return safeStr(element.toolName, localize(10589, null));
    case "modelTurn":
      return safeStr(element.model) || localize(10587, null);
    case "generic":
      return safeStr(element.name, localize(10589, null));
    case "subagentInvocation":
      return safeStr(element.agentName, localize(10589, null));
    case "userMessage":
      return localize(10590, null);
    case "agentResponse":
      return localize(10586, null);
  }
}

function getEventDetailsText(element) {
  switch (element.kind) {
    case "toolCall":
      return safeStr(element.result);
    case "modelTurn":
      return [
        safeStr(element.requestName),
        element.totalTokens !== void 0 ? localize(10588, null, numberFormatter2.value.format(element.totalTokens)) : ""
      ].filter(Boolean).join(" \xB7 ");
    case "generic":
      return safeStr(element.details);
    case "subagentInvocation":
      return safeStr(element.description) || safeStr(element.status);
    case "userMessage":
      return safeStr(element.message);
    case "agentResponse":
      return safeStr(element.message);
  }
}

function renderEventToTemplate(element, templateData) {
  templateData.created.textContent = getEventCreatedText(element);
  templateData.name.textContent = getEventNameText(element);
  templateData.details.textContent = getEventDetailsText(element);
  const isError = element.kind === "generic" && element.level === 3 /* Error */ || element.kind === "toolCall" && element.result === "error";
  const isWarning = element.kind === "generic" && element.level === 2 /* Warning */;
  const isTrace = element.kind === "generic" && element.level === 0 /* Trace */;
  templateData.container.classList.toggle("chat-debug-log-error", isError);
  templateData.container.classList.toggle("chat-debug-log-warning", isWarning);
  templateData.container.classList.toggle("chat-debug-log-trace", isTrace);
}

function createEventTemplate(container3) {
  container3.classList.add("chat-debug-log-row");
  const created = append(container3, $71("span.chat-debug-log-created"));
  const name = append(container3, $71("span.chat-debug-log-name"));
  const details = append(container3, $71("span.chat-debug-log-details"));
  return { container: container3, created, name, details };
}

var ChatDebugEventRenderer = class _ChatDebugEventRenderer {
  static {
    this.TEMPLATE_ID = "chatDebugEvent";
  }
  get templateId() {
    return _ChatDebugEventRenderer.TEMPLATE_ID;
  }
  renderTemplate(container3) {
    return createEventTemplate(container3);
  }
  renderElement(element, index2, templateData) {
    renderEventToTemplate(element, templateData);
  }
  disposeTemplate(_templateData) {
  }
};

var ChatDebugEventDelegate = class {
  getHeight(_element) {
    return 28;
  }
  getTemplateId(_element) {
    return ChatDebugEventRenderer.TEMPLATE_ID;
  }
};

var ChatDebugEventTreeRenderer = class _ChatDebugEventTreeRenderer {
  static {
    this.TEMPLATE_ID = "chatDebugEvent";
  }
  get templateId() {
    return _ChatDebugEventTreeRenderer.TEMPLATE_ID;
  }
  renderTemplate(container3) {
    return createEventTemplate(container3);
  }
  renderElement(node, index2, templateData) {
    renderEventToTemplate(node.element, templateData);
  }
  disposeTemplate(_templateData) {
  }
};
export { safeStr, getEventCreatedText, getEventNameText, getEventDetailsText, renderEventToTemplate, createEventTemplate, $71, dateFormatter, numberFormatter2, ChatDebugEventRenderer, ChatDebugEventDelegate, ChatDebugEventTreeRenderer };
