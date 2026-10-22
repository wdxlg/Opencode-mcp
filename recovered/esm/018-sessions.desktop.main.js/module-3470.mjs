// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/mobile/contributions/mobileChangesView.ts
import { $, EventType, addDisposableListener, append, clearNode } from "./module-0075.mjs";
import { comparePaths } from "./module-1521.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { autorun } from "./module-0052.mjs";
import { basename2, dirname2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ISessionsService } from "./module-1783.mjs";


// src/vs/sessions/browser/parts/mobile/contributions/mobileChangesView.ts
var $108 = $;

var MOBILE_OPEN_CHANGES_VIEW_COMMAND_ID = "sessions.mobile.openChangesView";

function toRow(change) {
  const v2Uri = change.uri;
  const displayUri = v2Uri ?? change.modifiedUri;
  const originalUri = change.originalUri;
  const modifiedUri = change.modifiedUri;
  const changeType = originalUri === void 0 ? "added" : modifiedUri === void 0 ? "deleted" : "modified";
  return {
    displayUri,
    originalUri,
    modifiedUri,
    changeType,
    added: change.insertions,
    removed: change.deletions
  };
}

function rowToDiffData(row) {
  return {
    originalURI: row.originalUri,
    modifiedURI: row.modifiedUri,
    identical: row.added === 0 && row.removed === 0,
    added: row.added,
    removed: row.removed
  };
}

function compareRows(a, b) {
  return comparePaths(a.displayUri.fsPath, b.displayUri.fsPath);
}

var MobileChangesView = class extends Disposable {
  constructor(workbenchContainer, onOpen, _instantiationService, sessionsService) {
    super();
    this.onOpen = onOpen;
    this.sessionsService = sessionsService;
    this._onDidDispose = this._register(new Emitter());
    /**
     * Fires when this view has been disposed (either externally or because
     * the user tapped Back). Used by the mobile overlay contribution to
     * clear its `MutableDisposable<MobileChangesView>` slot so it doesn't
     * keep a stale reference around — preserving the "value === undefined
     * <=> no overlay open" invariant.
     */
    this.onDidDispose = this._onDidDispose.event;
    this.viewStore = this._register(new DisposableStore());
    /**
     * Disposables that belong to the rows currently rendered in the list.
     * `renderList` runs on every reactive change to the active session
     * (potentially many times per session) — each render registers
     * per-row gesture targets and click/tap listeners. We hold those in a
     * dedicated store and `clear()` it at the top of every render so the
     * disposable count and gesture-target list don't grow unbounded.
     */
    this.rowsStore = this._register(new DisposableStore());
    const overlay = append(workbenchContainer, $108("div.mobile-overlay-view"));
    this.viewStore.add(addDisposableListener(overlay, EventType.CONTEXT_MENU, (e4) => e4.preventDefault()));
    this.viewStore.add(toDisposable(() => overlay.remove()));
    const header2 = append(overlay, $108("div.mobile-overlay-header"));
    const backBtn = append(header2, $108("button.mobile-overlay-back-btn", { type: "button" }));
    backBtn.setAttribute("aria-label", localize(3789, null));
    append(backBtn, $108("span")).classList.add(...ThemeIcon.asClassNameArray(Codicon.chevronLeft));
    append(backBtn, $108("span.back-btn-label")).textContent = localize(3790, null);
    this.viewStore.add(Gesture.addTarget(backBtn));
    this.viewStore.add(addDisposableListener(backBtn, EventType.CLICK, () => this.dispose()));
    this.viewStore.add(addDisposableListener(backBtn, EventType2.Tap, () => this.dispose()));
    const info = append(header2, $108("div.mobile-overlay-header-info"));
    append(info, $108("div.mobile-overlay-header-title")).textContent = localize(3798, null);
    this.subtitleEl = append(info, $108("div.mobile-overlay-header-subtitle"));
    const body = append(overlay, $108("div.mobile-overlay-body"));
    const scrollWrapper = append(body, $108("div.mobile-overlay-scroll"));
    this.listContainer = append(scrollWrapper, $108("div.mobile-changes-list"));
    this.emptyEl = append(body, $108("div.mobile-overlay-empty-state"));
    this.emptyEl.style.display = "none";
    this.emptyEl.textContent = localize(3794, null);
    this.viewStore.add(autorun((reader) => {
      const session = this.sessionsService.activeSession.read(reader);
      const rows = (session?.changes.read(reader) ?? []).map(toRow).sort(compareRows);
      this.renderList(rows);
    }));
  }
  renderList(rows) {
    this.rowsStore.clear();
    clearNode(this.listContainer);
    let totalAdded = 0;
    let totalRemoved = 0;
    for (const row of rows) {
      totalAdded += row.added;
      totalRemoved += row.removed;
    }
    if (rows.length === 0) {
      this.subtitleEl.textContent = "";
      this.emptyEl.style.display = "";
      this.listContainer.style.display = "none";
      return;
    }
    this.emptyEl.style.display = "none";
    this.listContainer.style.display = "";
    clearNode(this.subtitleEl);
    const fileWord = rows.length === 1 ? localize(3797, null) : localize(3796, null, rows.length);
    append(this.subtitleEl, $108("span.mobile-overlay-header-subtitle-files")).textContent = fileWord;
    append(this.subtitleEl, $108("span.mobile-overlay-header-subtitle-sep")).textContent = " \xB7 ";
    append(this.subtitleEl, $108("span.mobile-changes-row-added")).textContent = `+${totalAdded}`;
    append(this.subtitleEl, document.createTextNode(" "));
    append(this.subtitleEl, $108("span.mobile-changes-row-removed")).textContent = `-${totalRemoved}`;
    const siblings = rows.map(rowToDiffData);
    for (let i2 = 0; i2 < rows.length; i2++) {
      this.renderRow(rows[i2], siblings, i2);
    }
  }
  renderRow(row, siblings, index2) {
    const button = append(this.listContainer, $108("button.mobile-changes-row", { type: "button" }));
    button.classList.add(`change-${row.changeType}`);
    button.setAttribute("aria-label", localize(
      3795,
      null,
      row.displayUri.path,
      localizeChangeType(row.changeType),
      row.added,
      row.removed
    ));
    const labelHost = append(button, $108("div.mobile-changes-row-label"));
    const iconEl = append(labelHost, $108("span.mobile-changes-row-icon"));
    iconEl.classList.add(...ThemeIcon.asClassNameArray(changeTypeIcon(row.changeType)));
    const textHost = append(labelHost, $108("div.mobile-changes-row-text"));
    append(textHost, $108("span.mobile-changes-row-filename")).textContent = basename2(row.displayUri);
    const rawDir = dirname2(row.displayUri).path.replace(/^\/file\/-/, "");
    if (rawDir && rawDir !== "/") {
      append(textHost, $108("span.mobile-changes-row-dir")).textContent = rawDir;
    }
    const meta = append(button, $108("div.mobile-changes-row-meta"));
    const pill = append(meta, $108("span.mobile-changes-row-pill"));
    pill.classList.add(`change-${row.changeType}`);
    pill.textContent = changeTypeGlyph(row.changeType);
    pill.setAttribute("aria-hidden", "true");
    const counts = append(meta, $108("span.mobile-changes-row-counts"));
    if (row.added > 0) {
      append(counts, $108("span.mobile-changes-row-added")).textContent = `+${row.added}`;
    }
    if (row.removed > 0) {
      append(counts, $108("span.mobile-changes-row-removed")).textContent = `-${row.removed}`;
    }
    this.rowsStore.add(Gesture.addTarget(button));
    const onActivate = () => this.onOpen(siblings[index2], siblings, index2);
    this.rowsStore.add(addDisposableListener(button, EventType.CLICK, onActivate));
    this.rowsStore.add(addDisposableListener(button, EventType2.Tap, onActivate));
  }
  dispose() {
    this._onDidDispose.fire();
    super.dispose();
  }
};

MobileChangesView = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, ISessionsService)
], MobileChangesView);

function changeTypeGlyph(type) {
  switch (type) {
    case "added":
      return "A";
    case "modified":
      return "M";
    case "deleted":
      return "D";
  }
}

function changeTypeIcon(type) {
  switch (type) {
    case "added":
      return Codicon.diffAdded;
    case "modified":
      return Codicon.diffModified;
    case "deleted":
      return Codicon.diffRemoved;
  }
}

function localizeChangeType(type) {
  switch (type) {
    case "added":
      return localize(3791, null);
    case "modified":
      return localize(3793, null);
    case "deleted":
      return localize(3792, null);
  }
}
export { toRow, rowToDiffData, compareRows, changeTypeGlyph, changeTypeIcon, localizeChangeType, $108, MOBILE_OPEN_CHANGES_VIEW_COMMAND_ID, MobileChangesView };
