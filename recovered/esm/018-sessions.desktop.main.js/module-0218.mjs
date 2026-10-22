// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/config/migrateOptions.ts



// src/vs/editor/browser/config/migrateOptions.ts
var EditorSettingMigration = class _EditorSettingMigration {
  constructor(key3, migrate) {
    this.key = key3;
    this.migrate = migrate;
  }
  static {
    this.items = [];
  }
  apply(options3) {
    const value2 = _EditorSettingMigration._read(options3, this.key);
    const read = (key3) => _EditorSettingMigration._read(options3, key3);
    const write = (key3, value3) => _EditorSettingMigration._write(options3, key3, value3);
    this.migrate(value2, read, write);
  }
  static _read(source, key3) {
    if (typeof source === "undefined" || source === null) {
      return void 0;
    }
    const firstDotIndex = key3.indexOf(".");
    if (firstDotIndex >= 0) {
      const firstSegment = key3.substring(0, firstDotIndex);
      return this._read(source[firstSegment], key3.substring(firstDotIndex + 1));
    }
    return source[key3];
  }
  static _write(target, key3, value2) {
    const firstDotIndex = key3.indexOf(".");
    if (firstDotIndex >= 0) {
      const firstSegment = key3.substring(0, firstDotIndex);
      target[firstSegment] = target[firstSegment] || {};
      this._write(target[firstSegment], key3.substring(firstDotIndex + 1), value2);
      return;
    }
    target[key3] = value2;
  }
};

function registerEditorSettingMigration(key3, migrate) {
  EditorSettingMigration.items.push(new EditorSettingMigration(key3, migrate));
}

function registerSimpleEditorSettingMigration(key3, values) {
  registerEditorSettingMigration(key3, (value2, read, write) => {
    if (typeof value2 !== "undefined") {
      for (const [oldValue, newValue] of values) {
        if (value2 === oldValue) {
          write(key3, newValue);
          return;
        }
      }
    }
  });
}

function migrateOptions(options3) {
  EditorSettingMigration.items.forEach((migration) => migration.apply(options3));
}

registerSimpleEditorSettingMigration("wordWrap", [[true, "on"], [false, "off"]]);

registerSimpleEditorSettingMigration("lineNumbers", [[true, "on"], [false, "off"]]);

registerSimpleEditorSettingMigration("cursorBlinking", [["visible", "solid"]]);

registerSimpleEditorSettingMigration("renderWhitespace", [[true, "boundary"], [false, "none"]]);

registerSimpleEditorSettingMigration("renderLineHighlight", [[true, "line"], [false, "none"]]);

registerSimpleEditorSettingMigration("acceptSuggestionOnEnter", [[true, "on"], [false, "off"]]);

registerSimpleEditorSettingMigration("tabCompletion", [[false, "off"], [true, "onlySnippets"]]);

registerSimpleEditorSettingMigration("hover", [[true, { enabled: true }], [false, { enabled: false }]]);

registerSimpleEditorSettingMigration("parameterHints", [[true, { enabled: true }], [false, { enabled: false }]]);

registerSimpleEditorSettingMigration("autoIndent", [[false, "advanced"], [true, "full"]]);

registerSimpleEditorSettingMigration("matchBrackets", [[true, "always"], [false, "never"]]);

registerSimpleEditorSettingMigration("renderFinalNewline", [[true, "on"], [false, "off"]]);

registerSimpleEditorSettingMigration("cursorSmoothCaretAnimation", [[true, "on"], [false, "off"]]);

registerSimpleEditorSettingMigration("occurrencesHighlight", [[true, "singleFile"], [false, "off"]]);

registerSimpleEditorSettingMigration("wordBasedSuggestions", [[true, "matchingDocuments"], [false, "off"]]);

registerSimpleEditorSettingMigration("defaultColorDecorators", [[true, "auto"], [false, "never"]]);

registerSimpleEditorSettingMigration("minimap.autohide", [[true, "mouseover"], [false, "none"]]);

registerEditorSettingMigration("autoClosingBrackets", (value2, read, write) => {
  if (value2 === false) {
    write("autoClosingBrackets", "never");
    if (typeof read("autoClosingQuotes") === "undefined") {
      write("autoClosingQuotes", "never");
    }
    if (typeof read("autoSurround") === "undefined") {
      write("autoSurround", "never");
    }
  }
});

registerEditorSettingMigration("renderIndentGuides", (value2, read, write) => {
  if (typeof value2 !== "undefined") {
    write("renderIndentGuides", void 0);
    if (typeof read("guides.indentation") === "undefined") {
      write("guides.indentation", !!value2);
    }
  }
});

registerEditorSettingMigration("highlightActiveIndentGuide", (value2, read, write) => {
  if (typeof value2 !== "undefined") {
    write("highlightActiveIndentGuide", void 0);
    if (typeof read("guides.highlightActiveIndentation") === "undefined") {
      write("guides.highlightActiveIndentation", !!value2);
    }
  }
});

var suggestFilteredTypesMapping = {
  method: "showMethods",
  function: "showFunctions",
  constructor: "showConstructors",
  deprecated: "showDeprecated",
  field: "showFields",
  variable: "showVariables",
  class: "showClasses",
  struct: "showStructs",
  interface: "showInterfaces",
  module: "showModules",
  property: "showProperties",
  event: "showEvents",
  operator: "showOperators",
  unit: "showUnits",
  value: "showValues",
  constant: "showConstants",
  enum: "showEnums",
  enumMember: "showEnumMembers",
  keyword: "showKeywords",
  text: "showWords",
  color: "showColors",
  file: "showFiles",
  reference: "showReferences",
  folder: "showFolders",
  typeParameter: "showTypeParameters",
  snippet: "showSnippets"
};

registerEditorSettingMigration("suggest.filteredTypes", (value2, read, write) => {
  if (value2 && typeof value2 === "object") {
    for (const entry of Object.entries(suggestFilteredTypesMapping)) {
      const v2 = value2[entry[0]];
      if (v2 === false) {
        if (typeof read(`suggest.${entry[1]}`) === "undefined") {
          write(`suggest.${entry[1]}`, false);
        }
      }
    }
    write("suggest.filteredTypes", void 0);
  }
});

registerEditorSettingMigration("quickSuggestions", (input, read, write) => {
  if (typeof input === "boolean") {
    const value2 = input ? "on" : "off";
    const newValue = { comments: value2, strings: value2, other: value2 };
    write("quickSuggestions", newValue);
  }
});

registerEditorSettingMigration("experimental.stickyScroll.enabled", (value2, read, write) => {
  if (typeof value2 === "boolean") {
    write("experimental.stickyScroll.enabled", void 0);
    if (typeof read("stickyScroll.enabled") === "undefined") {
      write("stickyScroll.enabled", value2);
    }
  }
});

registerEditorSettingMigration("experimental.stickyScroll.maxLineCount", (value2, read, write) => {
  if (typeof value2 === "number") {
    write("experimental.stickyScroll.maxLineCount", void 0);
    if (typeof read("stickyScroll.maxLineCount") === "undefined") {
      write("stickyScroll.maxLineCount", value2);
    }
  }
});

registerEditorSettingMigration("editor.experimentalEditContextEnabled", (value2, read, write) => {
  if (typeof value2 === "boolean") {
    write("editor.experimentalEditContextEnabled", void 0);
    if (typeof read("editor.editContext") === "undefined") {
      write("editor.editContext", value2);
    }
  }
});

registerEditorSettingMigration("codeActionsOnSave", (value2, read, write) => {
  if (value2 && typeof value2 === "object") {
    let toBeModified = false;
    const newValue = {};
    for (const entry of Object.entries(value2)) {
      if (typeof entry[1] === "boolean") {
        toBeModified = true;
        newValue[entry[0]] = entry[1] ? "explicit" : "never";
      } else {
        newValue[entry[0]] = entry[1];
      }
    }
    if (toBeModified) {
      write(`codeActionsOnSave`, newValue);
    }
  }
});

registerEditorSettingMigration("codeActionWidget.includeNearbyQuickfixes", (value2, read, write) => {
  if (typeof value2 === "boolean") {
    write("codeActionWidget.includeNearbyQuickfixes", void 0);
    if (typeof read("codeActionWidget.includeNearbyQuickFixes") === "undefined") {
      write("codeActionWidget.includeNearbyQuickFixes", value2);
    }
  }
});

registerEditorSettingMigration("lightbulb.enabled", (value2, read, write) => {
  if (typeof value2 === "boolean") {
    write("lightbulb.enabled", value2 ? void 0 : "off");
  }
});

registerEditorSettingMigration("inlineSuggest.edits.codeShifting", (value2, read, write) => {
  if (typeof value2 === "boolean") {
    write("inlineSuggest.edits.codeShifting", void 0);
    write("inlineSuggest.edits.allowCodeShifting", value2 ? "always" : "never");
  }
});

registerEditorSettingMigration("hover.enabled", (value2, read, write) => {
  if (typeof value2 === "boolean") {
    write("hover.enabled", value2 ? "on" : "off");
  }
});
export { registerEditorSettingMigration, registerSimpleEditorSettingMigration, migrateOptions, EditorSettingMigration, suggestFilteredTypesMapping };
