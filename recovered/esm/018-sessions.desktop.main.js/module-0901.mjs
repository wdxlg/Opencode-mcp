// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/common/extHostTypes/codeActionKind.ts
import { __decorateClass } from "./module-0000.mjs";
import { es5ClassCompat } from "./module-0897.mjs";


// src/vs/workbench/api/common/extHostTypes/codeActionKind.ts
var CodeActionKind2 = class {
  constructor(value2) {
    this.value = value2;
  }
  append(parts) {
    return new CodeActionKind2(this.value ? this.value + CodeActionKind2.sep + parts : parts);
  }
  intersects(other) {
    return this.contains(other) || other.contains(this);
  }
  contains(other) {
    return this.value === other.value || other.value.startsWith(this.value + CodeActionKind2.sep);
  }
};

CodeActionKind2.sep = ".";

CodeActionKind2 = __decorateClass([
  es5ClassCompat
], CodeActionKind2);

CodeActionKind2.Empty = new CodeActionKind2("");

CodeActionKind2.QuickFix = CodeActionKind2.Empty.append("quickfix");

CodeActionKind2.Refactor = CodeActionKind2.Empty.append("refactor");

CodeActionKind2.RefactorExtract = CodeActionKind2.Refactor.append("extract");

CodeActionKind2.RefactorInline = CodeActionKind2.Refactor.append("inline");

CodeActionKind2.RefactorMove = CodeActionKind2.Refactor.append("move");

CodeActionKind2.RefactorRewrite = CodeActionKind2.Refactor.append("rewrite");

CodeActionKind2.Source = CodeActionKind2.Empty.append("source");

CodeActionKind2.SourceOrganizeImports = CodeActionKind2.Source.append("organizeImports");

CodeActionKind2.SourceFixAll = CodeActionKind2.Source.append("fixAll");

CodeActionKind2.Notebook = CodeActionKind2.Empty.append("notebook");
export { CodeActionKind2 };
