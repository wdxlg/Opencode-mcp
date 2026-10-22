// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostTypes/codeActionKind.ts
import { __decorateClass } from "./module-0000.mjs";
import { es5ClassCompat } from "./module-0230.mjs";


// src/vs/workbench/api/common/extHostTypes/codeActionKind.ts
var CodeActionKind = class {
  constructor(value) {
    this.value = value;
  }
  append(parts) {
    return new CodeActionKind(this.value ? this.value + CodeActionKind.sep + parts : parts);
  }
  intersects(other) {
    return this.contains(other) || other.contains(this);
  }
  contains(other) {
    return this.value === other.value || other.value.startsWith(this.value + CodeActionKind.sep);
  }
};

CodeActionKind.sep = ".";

CodeActionKind = __decorateClass([
  es5ClassCompat
], CodeActionKind);

CodeActionKind.Empty = new CodeActionKind("");

CodeActionKind.QuickFix = CodeActionKind.Empty.append("quickfix");

CodeActionKind.Refactor = CodeActionKind.Empty.append("refactor");

CodeActionKind.RefactorExtract = CodeActionKind.Refactor.append("extract");

CodeActionKind.RefactorInline = CodeActionKind.Refactor.append("inline");

CodeActionKind.RefactorMove = CodeActionKind.Refactor.append("move");

CodeActionKind.RefactorRewrite = CodeActionKind.Refactor.append("rewrite");

CodeActionKind.Source = CodeActionKind.Empty.append("source");

CodeActionKind.SourceOrganizeImports = CodeActionKind.Source.append("organizeImports");

CodeActionKind.SourceFixAll = CodeActionKind.Source.append("fixAll");

CodeActionKind.Notebook = CodeActionKind.Empty.append("notebook");
export { CodeActionKind };
