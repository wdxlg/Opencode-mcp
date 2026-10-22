// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlayHints/browser/inlayHints.ts
import { CancellationError, onUnexpectedExternalError } from "./module-0004.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { Range2 } from "./module-0106.mjs";
import { Position } from "./module-0079.mjs";
import { createCommandUri } from "./module-0462.mjs";


// src/vs/editor/contrib/inlayHints/browser/inlayHints.ts
var InlayHintAnchor = class {
  constructor(range2, direction) {
    this.range = range2;
    this.direction = direction;
  }
};

var InlayHintItem = class _InlayHintItem {
  constructor(hint, anchor, provider) {
    this.hint = hint;
    this.anchor = anchor;
    this.provider = provider;
    this._isResolved = false;
  }
  with(delta2) {
    const result = new _InlayHintItem(this.hint, delta2.anchor, this.provider);
    result._isResolved = this._isResolved;
    result._currentResolve = this._currentResolve;
    return result;
  }
  async resolve(token) {
    if (typeof this.provider.resolveInlayHint !== "function") {
      return;
    }
    if (this._currentResolve) {
      await this._currentResolve;
      if (token.isCancellationRequested) {
        return;
      }
      return this.resolve(token);
    }
    if (!this._isResolved) {
      this._currentResolve = this._doResolve(token).finally(() => this._currentResolve = void 0);
    }
    await this._currentResolve;
  }
  async _doResolve(token) {
    try {
      const newHint = await Promise.resolve(this.provider.resolveInlayHint(this.hint, token));
      this.hint.tooltip = newHint?.tooltip ?? this.hint.tooltip;
      this.hint.label = newHint?.label ?? this.hint.label;
      this.hint.textEdits = newHint?.textEdits ?? this.hint.textEdits;
      this._isResolved = true;
    } catch (err) {
      onUnexpectedExternalError(err);
      this._isResolved = false;
    }
  }
};

var InlayHintsFragments = class _InlayHintsFragments {
  constructor(ranges, data, model) {
    this._disposables = new DisposableStore();
    this.ranges = ranges;
    this.provider = /* @__PURE__ */ new Set();
    const items = [];
    for (const [list2, provider] of data) {
      this._disposables.add(list2);
      this.provider.add(provider);
      for (const hint of list2.hints) {
        const position2 = model.validatePosition(hint.position);
        let direction = "before";
        const wordRange = _InlayHintsFragments._getRangeAtPosition(model, position2);
        let range2;
        if (wordRange.getStartPosition().isBefore(position2)) {
          range2 = Range2.fromPositions(wordRange.getStartPosition(), position2);
          direction = "after";
        } else {
          range2 = Range2.fromPositions(position2, wordRange.getEndPosition());
          direction = "before";
        }
        items.push(new InlayHintItem(hint, new InlayHintAnchor(range2, direction), provider));
      }
    }
    this.items = items.sort((a, b) => Position.compare(a.hint.position, b.hint.position));
  }
  static {
    this._emptyInlayHintList = Object.freeze({ dispose() {
    }, hints: [] });
  }
  static async create(registry4, model, ranges, token) {
    const data = [];
    const promises = registry4.ordered(model).reverse().map((provider) => ranges.map(async (range2) => {
      try {
        const result = await provider.provideInlayHints(model, range2, token);
        if (result?.hints.length || provider.onDidChangeInlayHints) {
          data.push([result ?? _InlayHintsFragments._emptyInlayHintList, provider]);
        }
      } catch (err) {
        onUnexpectedExternalError(err);
      }
    }));
    await Promise.all(promises.flat());
    if (token.isCancellationRequested || model.isDisposed()) {
      throw new CancellationError();
    }
    return new _InlayHintsFragments(ranges, data, model);
  }
  dispose() {
    this._disposables.dispose();
  }
  static _getRangeAtPosition(model, position2) {
    const line = position2.lineNumber;
    const word = model.getWordAtPosition(position2);
    if (word) {
      return new Range2(line, word.startColumn, line, word.endColumn);
    }
    model.tokenization.tokenizeIfCheap(line);
    const tokens = model.tokenization.getLineTokens(line);
    const offset = position2.column - 1;
    const idx = tokens.findTokenIndexAtOffset(offset);
    let start = tokens.getStartOffset(idx);
    let end = tokens.getEndOffset(idx);
    if (end - start === 1) {
      if (start === offset && idx > 1) {
        start = tokens.getStartOffset(idx - 1);
        end = tokens.getEndOffset(idx - 1);
      } else if (end === offset && idx < tokens.getCount() - 1) {
        start = tokens.getStartOffset(idx + 1);
        end = tokens.getEndOffset(idx + 1);
      }
    }
    return new Range2(line, start + 1, line, end + 1);
  }
};

function asCommandLink(command4) {
  return createCommandUri(command4.id, ...command4.arguments ?? []).toString();
}
export { asCommandLink, InlayHintAnchor, InlayHintItem, InlayHintsFragments };
