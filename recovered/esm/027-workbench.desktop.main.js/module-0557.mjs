// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/config/editorConfigurationSchema.ts
import { localize } from "./module-0001.mjs";
import { EDITOR_MODEL_DEFAULTS } from "./module-0102.mjs";
import { diffEditorDefaultOptions } from "./module-0499.mjs";
import { editorOptionsRegistry } from "./module-0105.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";


// src/vs/editor/common/config/editorConfigurationSchema.ts
var editorConfigurationBaseNode = Object.freeze({
  id: "editor",
  order: 5,
  type: "object",
  title: localize(283, null),
  scope: 6 /* LANGUAGE_OVERRIDABLE */
});

var editorConfiguration = {
  ...editorConfigurationBaseNode,
  properties: {
    "editor.tabSize": {
      type: "number",
      default: EDITOR_MODEL_DEFAULTS.tabSize,
      minimum: 1,
      maximum: 100,
      markdownDescription: localize(311, null, "`#editor.detectIndentation#`")
    },
    "editor.indentSize": {
      "anyOf": [
        {
          type: "string",
          enum: ["tabSize"]
        },
        {
          type: "number",
          minimum: 1
        }
      ],
      default: "tabSize",
      markdownDescription: localize(289, null)
    },
    "editor.insertSpaces": {
      type: "boolean",
      default: EDITOR_MODEL_DEFAULTS.insertSpaces,
      markdownDescription: localize(290, null, "`#editor.detectIndentation#`")
    },
    "editor.detectIndentation": {
      type: "boolean",
      default: EDITOR_MODEL_DEFAULTS.detectIndentation,
      markdownDescription: localize(270, null, "`#editor.tabSize#`", "`#editor.insertSpaces#`")
    },
    "editor.trimAutoWhitespace": {
      type: "boolean",
      default: EDITOR_MODEL_DEFAULTS.trimAutoWhitespace,
      description: localize(312, null)
    },
    "editor.largeFileOptimizations": {
      type: "boolean",
      default: EDITOR_MODEL_DEFAULTS.largeFileOptimizations,
      description: localize(291, null)
    },
    "editor.wordBasedSuggestions": {
      enum: ["off", "offWithInlineSuggestions", "currentDocument", "matchingDocuments", "allDocuments"],
      default: "offWithInlineSuggestions",
      enumDescriptions: [
        localize(319, null),
        localize(320, null),
        localize(317, null),
        localize(318, null),
        localize(316, null)
      ],
      description: localize(315, null),
      experiment: { mode: "auto" }
    },
    "editor.semanticHighlighting.enabled": {
      enum: [true, false, "configuredByTheme"],
      enumDescriptions: [
        localize(306, null),
        localize(305, null),
        localize(303, null)
      ],
      default: "configuredByTheme",
      description: localize(304, null)
    },
    "editor.stablePeek": {
      type: "boolean",
      default: false,
      markdownDescription: localize(310, null)
    },
    "editor.maxTokenizationLineLength": {
      type: "integer",
      default: 2e4,
      description: localize(294, null)
    },
    "editor.experimental.asyncTokenization": {
      type: "boolean",
      default: true,
      description: localize(275, null),
      tags: ["experimental"]
    },
    "editor.experimental.asyncTokenizationLogging": {
      type: "boolean",
      default: false,
      description: localize(276, null)
    },
    "editor.experimental.asyncTokenizationVerification": {
      type: "boolean",
      default: false,
      description: localize(277, null),
      tags: ["experimental"]
    },
    "editor.experimental.treeSitterTelemetry": {
      type: "boolean",
      default: false,
      markdownDescription: localize(282, null),
      tags: ["experimental"],
      experiment: {
        mode: "auto"
      }
    },
    "editor.experimental.preferTreeSitter.css": {
      type: "boolean",
      default: false,
      markdownDescription: localize(278, null),
      tags: ["experimental"],
      experiment: {
        mode: "auto"
      }
    },
    "editor.experimental.preferTreeSitter.typescript": {
      type: "boolean",
      default: false,
      markdownDescription: localize(281, null),
      tags: ["experimental"],
      experiment: {
        mode: "auto"
      }
    },
    "editor.experimental.preferTreeSitter.ini": {
      type: "boolean",
      default: false,
      markdownDescription: localize(279, null),
      tags: ["experimental"],
      experiment: {
        mode: "auto"
      }
    },
    "editor.experimental.preferTreeSitter.regex": {
      type: "boolean",
      default: false,
      markdownDescription: localize(280, null),
      tags: ["experimental"],
      experiment: {
        mode: "auto"
      }
    },
    "editor.language.brackets": {
      type: ["array", "null"],
      default: null,
      // We want to distinguish the empty array from not configured.
      description: localize(299, null),
      items: {
        type: "array",
        items: [
          {
            type: "string",
            description: localize(302, null)
          },
          {
            type: "string",
            description: localize(300, null)
          }
        ]
      }
    },
    "editor.language.colorizedBracketPairs": {
      type: ["array", "null"],
      default: null,
      // We want to distinguish the empty array from not configured.
      description: localize(301, null),
      items: {
        type: "array",
        items: [
          {
            type: "string",
            description: localize(302, null)
          },
          {
            type: "string",
            description: localize(300, null)
          }
        ]
      }
    },
    "diffEditor.maxComputationTime": {
      type: "number",
      default: diffEditorDefaultOptions.maxComputationTime,
      description: localize(292, null)
    },
    "diffEditor.maxFileSize": {
      type: "number",
      default: diffEditorDefaultOptions.maxFileSize,
      description: localize(293, null)
    },
    "diffEditor.renderSideBySide": {
      type: "boolean",
      default: diffEditorDefaultOptions.renderSideBySide,
      description: localize(309, null),
      agentsWindow: { default: true }
    },
    "diffEditor.renderSideBySideInlineBreakpoint": {
      type: "number",
      default: diffEditorDefaultOptions.renderSideBySideInlineBreakpoint,
      description: localize(298, null)
    },
    "diffEditor.useInlineViewWhenSpaceIsLimited": {
      type: "boolean",
      default: diffEditorDefaultOptions.useInlineViewWhenSpaceIsLimited,
      description: localize(313, null),
      agentsWindow: { default: true }
    },
    "diffEditor.renderMarginRevertIcon": {
      type: "boolean",
      default: diffEditorDefaultOptions.renderMarginRevertIcon,
      description: localize(297, null),
      agentsWindow: { default: false }
    },
    "diffEditor.renderGutterMenu": {
      type: "boolean",
      default: diffEditorDefaultOptions.renderGutterMenu,
      description: localize(295, null),
      agentsWindow: { default: false }
    },
    "diffEditor.ignoreTrimWhitespace": {
      type: "boolean",
      default: diffEditorDefaultOptions.ignoreTrimWhitespace,
      description: localize(288, null)
    },
    "diffEditor.renderIndicators": {
      type: "boolean",
      default: diffEditorDefaultOptions.renderIndicators,
      description: localize(296, null),
      agentsWindow: { default: false }
    },
    "diffEditor.codeLens": {
      type: "boolean",
      default: diffEditorDefaultOptions.diffCodeLens,
      description: localize(269, null)
    },
    "diffEditor.wordWrap": {
      type: "string",
      enum: ["off", "on", "inherit"],
      default: diffEditorDefaultOptions.diffWordWrap,
      markdownEnumDescriptions: [
        localize(322, null),
        localize(323, null),
        localize(321, null, "`#editor.wordWrap#`")
      ]
    },
    "diffEditor.diffAlgorithm": {
      type: "string",
      enum: ["legacy", "advanced", "advanced-external", "advanced-wasm"],
      default: diffEditorDefaultOptions.diffAlgorithm,
      markdownEnumDescriptions: [
        localize(274, null),
        localize(271, null),
        localize(272, null),
        localize(273, null)
      ]
    },
    "diffEditor.hideUnchangedRegions.enabled": {
      type: "boolean",
      default: diffEditorDefaultOptions.hideUnchangedRegions.enabled,
      markdownDescription: localize(285, null),
      agentsWindow: { default: true }
    },
    "diffEditor.hideUnchangedRegions.revealLineCount": {
      type: "integer",
      default: diffEditorDefaultOptions.hideUnchangedRegions.revealLineCount,
      markdownDescription: localize(287, null),
      minimum: 1
    },
    "diffEditor.hideUnchangedRegions.minimumLineCount": {
      type: "integer",
      default: diffEditorDefaultOptions.hideUnchangedRegions.minimumLineCount,
      markdownDescription: localize(286, null),
      minimum: 1
    },
    "diffEditor.hideUnchangedRegions.contextLineCount": {
      type: "integer",
      default: diffEditorDefaultOptions.hideUnchangedRegions.contextLineCount,
      markdownDescription: localize(284, null),
      minimum: 1
    },
    "diffEditor.experimental.showMoves": {
      type: "boolean",
      default: diffEditorDefaultOptions.experimental.showMoves,
      markdownDescription: localize(308, null)
    },
    "diffEditor.experimental.showEmptyDecorations": {
      type: "boolean",
      default: diffEditorDefaultOptions.experimental.showEmptyDecorations,
      description: localize(307, null)
    },
    "diffEditor.experimental.useTrueInlineView": {
      type: "boolean",
      default: diffEditorDefaultOptions.experimental.useTrueInlineView,
      description: localize(314, null)
    }
  }
};

function isConfigurationPropertySchema(x) {
  return typeof x.type !== "undefined" || typeof x.anyOf !== "undefined";
}

for (const editorOption of editorOptionsRegistry) {
  const schema10 = editorOption.schema;
  if (typeof schema10 !== "undefined") {
    if (isConfigurationPropertySchema(schema10)) {
      editorConfiguration.properties[`editor.${editorOption.name}`] = schema10;
    } else {
      for (const key3 in schema10) {
        if (Object.hasOwnProperty.call(schema10, key3)) {
          editorConfiguration.properties[key3] = schema10[key3];
        }
      }
    }
  }
}

var configurationRegistry2 = Registry.as(Extensions4.Configuration);

configurationRegistry2.registerConfiguration(editorConfiguration);

async function registerEditorFontConfigurations(getFontSnippets2) {
  const editorKeysWithFont = ["editor.fontFamily"];
  const fontSnippets = await getFontSnippets2();
  for (const key3 of editorKeysWithFont) {
    if (editorConfiguration.properties && editorConfiguration.properties[key3]) {
      editorConfiguration.properties[key3].defaultSnippets = fontSnippets;
    }
  }
}
export { isConfigurationPropertySchema, registerEditorFontConfigurations, editorConfigurationBaseNode, editorConfiguration, configurationRegistry2 };
