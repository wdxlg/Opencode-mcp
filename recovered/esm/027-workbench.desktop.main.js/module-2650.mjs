// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/aiCustomizationListWidgetUtils.ts



// src/vs/workbench/contrib/chat/browser/aiCustomization/aiCustomizationListWidgetUtils.ts
function truncateToFirstLine(text2) {
  const newlineIndex = text2.search(/[\r\n]/);
  if (newlineIndex !== -1) {
    return text2.substring(0, newlineIndex);
  }
  return text2;
}

function getCustomizationSecondaryText(description, filename, promptType) {
  if (!description) {
    return filename;
  }
  return promptType === "hook" /* hook */ ? description : truncateToFirstLine(description);
}
export { truncateToFirstLine, getCustomizationSecondaryText };
