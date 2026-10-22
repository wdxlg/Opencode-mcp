// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/inlayHints/browser/inlayHintsAccessibilty.ts
import { DisposableStore } from "./module-0012.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { addDisposableListener, clearNode, reset } from "./module-0075.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { Link } from "./module-0550.mjs";
import { asCommandLink } from "./module-0620.mjs";
import { InlayHintsController } from "./module-0649.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { registerAction2 } from "./module-0092.mjs";
import { EditorAction2, registerEditorContribution } from "./module-0097.mjs";
import { EditorContextKeys } from "./module-0154.mjs";


// src/vs/workbench/contrib/inlayHints/browser/inlayHintsAccessibilty.ts
var InlayHintsAccessibility = class {
  constructor(_editor, contextKeyService, _accessibilitySignalService, _instaService) {
    this._editor = _editor;
    this._accessibilitySignalService = _accessibilitySignalService;
    this._instaService = _instaService;
    this._sessionDispoosables = new DisposableStore();
    this._ariaElement = document.createElement("span");
    this._ariaElement.style.position = "fixed";
    this._ariaElement.className = "inlayhint-accessibility-element";
    this._ariaElement.tabIndex = 0;
    this._ariaElement.setAttribute("aria-description", localize(16134, null));
    this._ctxIsReading = InlayHintsAccessibility.IsReading.bindTo(contextKeyService);
  }
  static {
    this.IsReading = new RawContextKey("isReadingLineWithInlayHints", false, { type: "boolean", description: localize(16135, null) });
  }
  static {
    this.ID = "editor.contrib.InlayHintsAccessibility";
  }
  static get(editor) {
    return editor.getContribution(InlayHintsAccessibility.ID) ?? void 0;
  }
  dispose() {
    this._sessionDispoosables.dispose();
    this._ctxIsReading.reset();
    this._ariaElement.remove();
  }
  _reset() {
    clearNode(this._ariaElement);
    this._sessionDispoosables.clear();
    this._ctxIsReading.reset();
  }
  async _read(line, hints) {
    this._sessionDispoosables.clear();
    if (!this._ariaElement.isConnected) {
      this._editor.getDomNode()?.appendChild(this._ariaElement);
    }
    if (!this._editor.hasModel() || !this._ariaElement.isConnected) {
      this._ctxIsReading.set(false);
      return;
    }
    const cts = new CancellationTokenSource();
    this._sessionDispoosables.add(cts);
    for (const hint of hints) {
      await hint.resolve(cts.token);
    }
    if (cts.token.isCancellationRequested) {
      return;
    }
    const model = this._editor.getModel();
    const newChildren = [];
    let start = 0;
    let tooLongToRead = false;
    for (const item of hints) {
      const part = model.getValueInRange({ startLineNumber: line, startColumn: start + 1, endLineNumber: line, endColumn: item.hint.position.column });
      if (part.length > 0) {
        newChildren.push(part);
        start = item.hint.position.column - 1;
      }
      if (start > 750) {
        newChildren.push("\u2026");
        tooLongToRead = true;
        break;
      }
      const em = document.createElement("em");
      const { label: label3 } = item.hint;
      if (typeof label3 === "string") {
        em.innerText = label3;
      } else {
        for (const part2 of label3) {
          if (part2.command) {
            const link2 = this._instaService.createInstance(
              Link,
              em,
              { href: asCommandLink(part2.command), label: part2.label, title: part2.command.title },
              void 0
            );
            this._sessionDispoosables.add(link2);
          } else {
            em.innerText += part2.label;
          }
        }
      }
      newChildren.push(em);
    }
    if (!tooLongToRead) {
      newChildren.push(model.getValueInRange({ startLineNumber: line, startColumn: start + 1, endLineNumber: line, endColumn: Number.MAX_SAFE_INTEGER }));
    }
    reset(this._ariaElement, ...newChildren);
    this._ariaElement.focus();
    this._ctxIsReading.set(true);
    this._sessionDispoosables.add(addDisposableListener(this._ariaElement, "focusout", () => {
      this._reset();
    }));
  }
  startInlayHintsReading() {
    if (!this._editor.hasModel()) {
      return;
    }
    const line = this._editor.getPosition().lineNumber;
    const hints = InlayHintsController.get(this._editor)?.getInlayHintsForLine(line);
    if (!hints || hints.length === 0) {
      this._accessibilitySignalService.playSignal(AccessibilitySignal.noInlayHints);
    } else {
      this._read(line, hints);
    }
  }
  stopInlayHintsReading() {
    this._reset();
    this._editor.focus();
  }
};

InlayHintsAccessibility = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IAccessibilitySignalService),
  __decorateParam(3, IInstantiationService)
], InlayHintsAccessibility);

registerAction2(class StartReadHints extends EditorAction2 {
  constructor() {
    super({
      id: "inlayHints.startReadingLineWithHint",
      title: localize2(16136, "Read Line with Inlay Hints"),
      precondition: EditorContextKeys.hasInlayHintsProvider,
      f1: true
    });
  }
  runEditorCommand(_accessor, editor) {
    const ctrl = InlayHintsAccessibility.get(editor);
    ctrl?.startInlayHintsReading();
  }
});

registerAction2(class StopReadHints extends EditorAction2 {
  constructor() {
    super({
      id: "inlayHints.stopReadingLineWithHint",
      title: localize2(16137, "Stop Inlay Hints Reading"),
      precondition: InlayHintsAccessibility.IsReading,
      f1: true,
      keybinding: {
        weight: 100 /* EditorContrib */,
        primary: 9 /* Escape */
      }
    });
  }
  runEditorCommand(_accessor, editor) {
    const ctrl = InlayHintsAccessibility.get(editor);
    ctrl?.stopInlayHintsReading();
  }
});

registerEditorContribution(InlayHintsAccessibility.ID, InlayHintsAccessibility, 4 /* Lazy */);
export { InlayHintsAccessibility };
