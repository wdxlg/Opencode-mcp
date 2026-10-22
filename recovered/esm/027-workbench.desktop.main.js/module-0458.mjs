// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/dnd/dnd.ts
import { $ } from "./module-0075.mjs";


// src/vs/base/browser/ui/dnd/dnd.ts
function applyDragImage(event, container3, label3, extraClasses = []) {
  if (!event.dataTransfer) {
    return;
  }
  const dragImage = $(".monaco-drag-image");
  dragImage.textContent = label3;
  dragImage.classList.add(...extraClasses);
  const getDragImageContainer = (e) => {
    while (e && !e.classList.contains("monaco-workbench")) {
      e = e.parentElement;
    }
    return e || container3.ownerDocument.body;
  };
  const dragContainer = getDragImageContainer(container3);
  dragContainer.appendChild(dragImage);
  event.dataTransfer.setDragImage(dragImage, -10, -10);
  setTimeout(() => dragImage.remove(), 0);
}
export { applyDragImage };
