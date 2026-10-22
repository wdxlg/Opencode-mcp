// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/dnd/dnd.ts
import { $ } from "./module-0075.mjs";


// src/vs/base/browser/ui/dnd/dnd.ts
function applyDragImage(event, container2, label3, extraClasses = []) {
  if (!event.dataTransfer) {
    return;
  }
  const dragImage = $(".monaco-drag-image");
  dragImage.textContent = label3;
  dragImage.classList.add(...extraClasses);
  const getDragImageContainer = (e4) => {
    while (e4 && !e4.classList.contains("monaco-workbench")) {
      e4 = e4.parentElement;
    }
    return e4 || container2.ownerDocument.body;
  };
  const dragContainer = getDragImageContainer(container2);
  dragContainer.appendChild(dragImage);
  event.dataTransfer.setDragImage(dragImage, -10, -10);
  setTimeout(() => dragImage.remove(), 0);
}
export { applyDragImage };
