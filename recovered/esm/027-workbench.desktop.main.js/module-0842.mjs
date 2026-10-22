// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/semanticTokens/common/semanticTokensConfig.ts



// src/vs/editor/contrib/semanticTokens/common/semanticTokensConfig.ts
var SEMANTIC_HIGHLIGHTING_SETTING_ID = "editor.semanticHighlighting";

function isSemanticColoringEnabled(model, themeService, configurationService) {
  const setting = configurationService.getValue(SEMANTIC_HIGHLIGHTING_SETTING_ID, { overrideIdentifier: model.getLanguageId(), resource: model.uri })?.enabled;
  if (typeof setting === "boolean") {
    return setting;
  }
  return themeService.getColorTheme().semanticHighlighting;
}
export { isSemanticColoringEnabled, SEMANTIC_HIGHLIGHTING_SETTING_ID };
