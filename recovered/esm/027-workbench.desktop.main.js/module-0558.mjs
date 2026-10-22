// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/codeAction/common/types.ts
import { HierarchicalKind } from "./module-0535.mjs";
import { onUnexpectedExternalError } from "./module-0004.mjs";


// src/vs/editor/contrib/codeAction/common/types.ts
var CodeActionKind = new class {
  constructor() {
    this.QuickFix = new HierarchicalKind("quickfix");
    this.Refactor = new HierarchicalKind("refactor");
    this.RefactorExtract = this.Refactor.append("extract");
    this.RefactorInline = this.Refactor.append("inline");
    this.RefactorMove = this.Refactor.append("move");
    this.RefactorRewrite = this.Refactor.append("rewrite");
    this.Notebook = new HierarchicalKind("notebook");
    this.Source = new HierarchicalKind("source");
    this.SourceOrganizeImports = this.Source.append("organizeImports");
    this.SourceFixAll = this.Source.append("fixAll");
    this.SurroundWith = this.Refactor.append("surround");
  }
}();

function mayIncludeActionsOfKind(filter2, providedKind) {
  if (filter2.include && !filter2.include.intersects(providedKind)) {
    return false;
  }
  if (filter2.excludes) {
    if (filter2.excludes.some((exclude) => excludesAction(providedKind, exclude, filter2.include))) {
      return false;
    }
  }
  if (!filter2.includeSourceActions && CodeActionKind.Source.contains(providedKind)) {
    return false;
  }
  return true;
}

function filtersAction(filter2, action) {
  const actionKind = action.kind ? new HierarchicalKind(action.kind) : void 0;
  if (filter2.include) {
    if (!actionKind || !filter2.include.contains(actionKind)) {
      return false;
    }
  }
  if (filter2.excludes) {
    if (actionKind && filter2.excludes.some((exclude) => excludesAction(actionKind, exclude, filter2.include))) {
      return false;
    }
  }
  if (!filter2.includeSourceActions) {
    if (actionKind && CodeActionKind.Source.contains(actionKind)) {
      return false;
    }
  }
  if (filter2.onlyIncludePreferredActions) {
    if (!action.isPreferred) {
      return false;
    }
  }
  return true;
}

function excludesAction(providedKind, exclude, include) {
  if (!exclude.contains(providedKind)) {
    return false;
  }
  if (include && exclude.contains(include)) {
    return false;
  }
  return true;
}

var CodeActionCommandArgs = class _CodeActionCommandArgs {
  constructor(kind, apply2, preferred) {
    this.kind = kind;
    this.apply = apply2;
    this.preferred = preferred;
  }
  static fromUser(arg, defaults) {
    if (!arg || typeof arg !== "object") {
      return new _CodeActionCommandArgs(defaults.kind, defaults.apply, false);
    }
    return new _CodeActionCommandArgs(
      _CodeActionCommandArgs.getKindFromUser(arg, defaults.kind),
      _CodeActionCommandArgs.getApplyFromUser(arg, defaults.apply),
      _CodeActionCommandArgs.getPreferredUser(arg)
    );
  }
  static getApplyFromUser(arg, defaultAutoApply) {
    switch (typeof arg.apply === "string" ? arg.apply.toLowerCase() : "") {
      case "first":
        return "first" /* First */;
      case "never":
        return "never" /* Never */;
      case "ifsingle":
        return "ifSingle" /* IfSingle */;
      default:
        return defaultAutoApply;
    }
  }
  static getKindFromUser(arg, defaultKind) {
    return typeof arg.kind === "string" ? new HierarchicalKind(arg.kind) : defaultKind;
  }
  static getPreferredUser(arg) {
    return typeof arg.preferred === "boolean" ? arg.preferred : false;
  }
};

var CodeActionItem = class {
  constructor(action, provider, highlightRange2) {
    this.action = action;
    this.provider = provider;
    this.highlightRange = highlightRange2;
  }
  async resolve(token) {
    if (this.provider?.resolveCodeAction && !this.action.edit) {
      let action;
      try {
        action = await this.provider.resolveCodeAction(this.action, token);
      } catch (err) {
        onUnexpectedExternalError(err);
      }
      if (action) {
        this.action.edit = action.edit;
      }
    }
    return this;
  }
};
export { mayIncludeActionsOfKind, filtersAction, excludesAction, CodeActionKind, CodeActionCommandArgs, CodeActionItem };
