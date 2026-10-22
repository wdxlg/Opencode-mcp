// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/aria/aria.ts
import { clearNode } from "./module-0075.mjs";


// src/vs/base/browser/ui/aria/aria.ts
var MAX_MESSAGE_LENGTH = 2e4;

var ariaContainer;

var alertContainer;

var alertContainer2;

var statusContainer;

var statusContainer2;

function setARIAContainer(parent) {
  ariaContainer = document.createElement("div");
  ariaContainer.className = "monaco-aria-container";
  const createAlertContainer = () => {
    const element = document.createElement("div");
    element.className = "monaco-alert";
    element.setAttribute("role", "alert");
    element.setAttribute("aria-atomic", "true");
    ariaContainer.appendChild(element);
    return element;
  };
  alertContainer = createAlertContainer();
  alertContainer2 = createAlertContainer();
  const createStatusContainer = () => {
    const element = document.createElement("div");
    element.className = "monaco-status";
    element.setAttribute("aria-live", "polite");
    element.setAttribute("aria-atomic", "true");
    ariaContainer.appendChild(element);
    return element;
  };
  statusContainer = createStatusContainer();
  statusContainer2 = createStatusContainer();
  parent.appendChild(ariaContainer);
}

function alert(msg) {
  if (!ariaContainer) {
    return;
  }
  if (alertContainer.textContent !== msg) {
    clearNode(alertContainer2);
    insertMessage(alertContainer, msg);
  } else {
    clearNode(alertContainer);
    insertMessage(alertContainer2, msg);
  }
}

function status(msg) {
  if (!ariaContainer) {
    return;
  }
  if (statusContainer.textContent !== msg) {
    clearNode(statusContainer2);
    insertMessage(statusContainer, msg);
  } else {
    clearNode(statusContainer);
    insertMessage(statusContainer2, msg);
  }
}

function insertMessage(target, msg) {
  clearNode(target);
  if (msg.length > MAX_MESSAGE_LENGTH) {
    msg = msg.substr(0, MAX_MESSAGE_LENGTH);
  }
  target.textContent = msg;
  target.style.visibility = "hidden";
  target.style.visibility = "visible";
}
export { setARIAContainer, alert, status, insertMessage, MAX_MESSAGE_LENGTH, ariaContainer, alertContainer, alertContainer2, statusContainer, statusContainer2 };
