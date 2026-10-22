// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugCollapsible.ts
import { EventType, addDisposableListener, clearNode } from "./module-0075.mjs";
import { Codicon } from "./module-0085.mjs";
import { ThemeIcon } from "./module-0086.mjs";


// src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugCollapsible.ts
function setupCollapsibleToggle(chevron, header2, contentEl, disposables, initiallyCollapsed = false, scrollable) {
  let collapsed2 = initiallyCollapsed;
  header2.tabIndex = 0;
  header2.role = "button";
  chevron.setAttribute("aria-hidden", "true");
  const updateState = () => {
    clearNode(chevron);
    const icon2 = collapsed2 ? Codicon.chevronRight : Codicon.chevronDown;
    chevron.classList.add(...ThemeIcon.asClassName(icon2).split(" "));
    contentEl.style.display = collapsed2 ? "none" : "block";
    header2.style.borderRadius = collapsed2 ? "" : "3px 3px 0 0";
    header2.setAttribute("aria-expanded", String(!collapsed2));
  };
  updateState();
  disposables.add(addDisposableListener(header2, EventType.CLICK, () => {
    collapsed2 = !collapsed2;
    chevron.className = "chat-debug-message-section-chevron";
    updateState();
    scrollable?.scanDomNode();
  }));
  disposables.add(addDisposableListener(header2, EventType.KEY_DOWN, (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      header2.click();
    }
  }));
}
export { setupCollapsibleToggle };
