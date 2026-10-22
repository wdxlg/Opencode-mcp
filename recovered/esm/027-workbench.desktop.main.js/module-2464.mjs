// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/multiDiffEditor/multiDiffEditorLogging.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { autorun, autorunWithStore } from "./module-0052.mjs";
import { basename2 } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/editor/browser/widget/multiDiffEditor/multiDiffEditorLogging.ts
var MultiDiffEditorLogger = class extends Disposable {
  constructor(_logService) {
    super();
    this._logService = _logService;
    /** Last logged collapsed state per diff item, to only log actual changes. */
    this._lastLoggedCollapsed = /* @__PURE__ */ new Map();
    /** Last logged content height per diff item, to only log actual changes. */
    this._lastLoggedContentHeight = /* @__PURE__ */ new Map();
    this._isEnabled = observableFromEvent(this, this._logService.onDidChangeLogLevel, () => this._logService.getLevel() <= 1 /* Trace */);
  }
  /**
   * Whether trace logging is on. Check this before computing data that is only
   * needed for logging.
   */
  get isEnabled() {
    return this._isEnabled.get();
  }
  log(message, data) {
    if (!this.isEnabled) {
      return;
    }
    const formattedData = data ? Object.entries(data).map(([key3, value2]) => `${key3}: ${formatValue2(value2)}`).join(", ") : void 0;
    this._logService.trace(`[MultiDiffEditor] ${message}${formattedData ? ` (${formattedData})` : ""}`);
  }
  /**
   * Traces the state transitions that cannot be reconstructed after the fact:
   * view model/loading changes, collapsed state changes (no matter who caused
   * them) and content height changes, which are the usual cause of the view
   * jumping while scrolling. Per-frame rendering is deliberately not traced.
   *
   * The observers only exist while trace logging is on, so nothing is observed
   * (and no state is tracked) in the default case; they are recreated when the
   * log level is raised to trace again.
   */
  logStateChanges(state) {
    this._register(autorunWithStore((reader, store) => {
      if (!this._isEnabled.read(reader)) {
        return;
      }
      store.add(toDisposable(() => {
        this._lastLoggedCollapsed.clear();
        this._lastLoggedContentHeight.clear();
      }));
      store.add(autorun((reader2) => {
        const viewModel = state.viewModel.read(reader2);
        this.log("view model changed", {
          hasViewModel: !!viewModel,
          isLoading: viewModel?.isLoading.read(reader2),
          preserveFocusOnLoad: state.isPreserveFocusOnLoad()
        });
      }));
      store.add(autorun((reader2) => {
        const changed = [];
        for (const item of state.items.read(reader2)) {
          const collapsed2 = item.collapsed.read(reader2);
          const key3 = item.getKey();
          if (this._lastLoggedCollapsed.get(key3) !== collapsed2) {
            this._lastLoggedCollapsed.set(key3, collapsed2);
            changed.push(`${item.getLabel()}=${collapsed2}`);
          }
        }
        if (changed.length > 0) {
          this.log("collapsed state changed", { changed });
        }
      }));
      store.add(autorun((reader2) => {
        const scrollTop = state.getScrollTop();
        const changed = [];
        let totalHeight = 0;
        for (const item of state.items.read(reader2)) {
          const contentHeight = item.contentHeight.read(reader2);
          const key3 = item.getKey();
          const lastContentHeight = this._lastLoggedContentHeight.get(key3);
          if (lastContentHeight !== contentHeight) {
            const abovePosition = totalHeight < scrollTop ? " (above scroll offset)" : "";
            changed.push(`${item.getLabel()}: ${lastContentHeight ?? "?"} -> ${contentHeight}${abovePosition}`);
            this._lastLoggedContentHeight.set(key3, contentHeight);
          }
          totalHeight += contentHeight + state.spaceBetweenPx;
        }
        if (changed.length > 0) {
          this.log("content height changed", { changed, totalHeight, scrollTop });
        }
      }));
    }));
  }
};

function formatUri(uri5) {
  if (!uri5) {
    return "<none>";
  }
  return basename2(uri5) || uri5.authority || uri5.scheme;
}

function formatDiffItemKey(key3) {
  if (key3 === void 0) {
    return "<none>";
  }
  try {
    const [original, modified] = JSON.parse(key3);
    const uri5 = modified ?? original;
    return uri5 ? formatUri(URI.parse(uri5)) : "<none>";
  } catch {
    return key3;
  }
}

function formatValue2(value2) {
  if (value2 === void 0) {
    return "<undefined>";
  }
  if (URI.isUri(value2)) {
    return formatUri(value2);
  }
  if (Array.isArray(value2)) {
    return `[${value2.map(formatValue2).join(", ")}]`;
  }
  if (typeof value2 === "number") {
    return String(Math.round(value2 * 100) / 100);
  }
  if (typeof value2 === "object") {
    return JSON.stringify(value2);
  }
  return String(value2);
}
export { formatUri, formatDiffItemKey, formatValue2, MultiDiffEditorLogger };
