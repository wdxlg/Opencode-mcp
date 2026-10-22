// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/features/browserHistoryFeature.ts
import { BROWSER_EDITOR_ACTIVE, BrowserActionCategory, BrowserEditor, BrowserEditorContribution } from "./module-4159.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { URI } from "./module-0032.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { BrowserViewCommandId } from "./module-1237.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { CONTEXT_BROWSER_STORAGE_SCOPE } from "./module-4172.mjs";
import { IEditorService } from "./module-0935.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { workbenchConfigurationNodeBase } from "./module-1113.mjs";
import { BrowserMaxHistoryEntriesSettingId } from "./module-4162.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/features/browserHistoryFeature.ts
var MAX_RECENTS = 3;

var MAX_HISTORY = 6;

var BrowserHistoryFeature = class extends BrowserEditorContribution {
  constructor(editor, _quickInputService) {
    super(editor);
    this._quickInputService = _quickInputService;
    this._modelDisposables = this._register(new DisposableStore());
    this._onDidChange = this._register(new Emitter());
    this._recentsProvider = {
      label: localize(8124, null),
      order: 5,
      onDidChange: this._onDidChange.event,
      getSuggestions: async ({ input, text: text2 }) => this._buildRecents(input.url, text2)
    };
    this._historyProvider = {
      label: localize(8116, null),
      order: 10,
      onDidChange: this._onDidChange.event,
      getSuggestions: async ({ input, text: text2 }) => this._buildHistory(input.url, text2)
    };
  }
  get urlSuggestionProviders() {
    return [this._recentsProvider, this._historyProvider];
  }
  onModelAttached() {
    this._modelDisposables.clear();
    this._model = this.editor.model;
    this._history = this._model.history;
    this._modelDisposables.add(this._history.onDidChange(() => this._onDidChange.fire()));
    this._onDidChange.fire();
  }
  onModelDetached() {
    this._modelDisposables.clear();
    this._model = void 0;
    this._history = void 0;
    this._onDidChange.fire();
  }
  showManagementPicker() {
    const model = this._model;
    const history = this._history;
    if (!model || !history) {
      return;
    }
    showHistoryPicker(this._quickInputService, model, history);
  }
  _buildRecents(currentUrl, text2) {
    if (text2.trim().length > 0) {
      return [];
    }
    return this._buildList(
      currentUrl,
      "",
      /* onlyUserInitiated */
      true,
      MAX_RECENTS
    );
  }
  _buildHistory(currentUrl, text2) {
    const needle = text2.trim().toLowerCase();
    if (needle.length === 0) {
      return [];
    }
    return this._buildList(
      currentUrl,
      needle,
      /* onlyUserInitiated */
      false,
      MAX_HISTORY
    );
  }
  _buildList(currentUrl, needle, onlyUserInitiated, max) {
    const history = this._history;
    const model = this._model;
    if (!history || !model) {
      return [];
    }
    const entries2 = history.entries.items;
    if (entries2.length === 0) {
      return [];
    }
    const seen = /* @__PURE__ */ new Set();
    if (currentUrl) {
      seen.add(dedupKey(currentUrl));
    }
    const out = [];
    for (let i2 = entries2.length - 1; i2 >= 0 && out.length < max; i2--) {
      const entry = entries2[i2];
      if (onlyUserInitiated && !entry.explicit) {
        continue;
      }
      const key3 = dedupKey(entry.url);
      if (seen.has(key3)) {
        continue;
      }
      if (needle && !matches(entry, needle)) {
        continue;
      }
      seen.add(key3);
      out.push(toSuggestion(model, history, entry));
    }
    return out;
  }
};

BrowserHistoryFeature = __decorateClass([
  __decorateParam(1, IQuickInputService)
], BrowserHistoryFeature);

BrowserEditor.registerContribution(BrowserHistoryFeature);

function toSuggestion(model, history, entry) {
  const label3 = entry.title || entry.url;
  const description = entry.title ? entry.url : void 0;
  const faviconUri = entry.icon ? resolveFavicon(history, entry.icon) : void 0;
  const deleteAction = {
    id: "browser.history.delete",
    iconClass: ThemeIcon.asClassName(Codicon.close),
    tooltip: localize(8125, null),
    run: () => model.deleteHistory([entry.id])
  };
  return {
    id: "history:" + entry.id,
    label: label3,
    description,
    icon: faviconUri ? void 0 : Codicon.globe,
    iconPath: faviconUri ? { dark: faviconUri } : void 0,
    apply: (input) => input.navigate(entry.url),
    actions: [deleteAction]
  };
}

function dedupKey(url) {
  const parsed = URL.parse(url);
  if (!parsed) {
    return url;
  }
  return parsed.host + parsed.pathname;
}

function matches(entry, needle) {
  return entry.url.toLowerCase().includes(needle) || entry.title.toLowerCase().includes(needle);
}

function resolveFavicon(history, hash2) {
  const dataUri = history.favicons.get(hash2);
  if (!dataUri) {
    return void 0;
  }
  try {
    return URI.parse(dataUri);
  } catch {
    return void 0;
  }
}

function showHistoryPicker(quickInputService, model, history) {
  const disposables = new DisposableStore();
  const picker = disposables.add(quickInputService.createQuickPick({ useSeparators: true }));
  picker.title = localize(8120, null);
  picker.placeholder = localize(8119, null);
  picker.matchOnDescription = true;
  picker.matchOnDetail = true;
  const clearAllButton = {
    iconClass: ThemeIcon.asClassName(Codicon.trash),
    tooltip: localize(8117, null)
  };
  const clearDayButton = {
    iconClass: ThemeIcon.asClassName(Codicon.trash),
    tooltip: localize(8118, null)
  };
  const removeEntryButton = {
    iconClass: ThemeIcon.asClassName(Codicon.close),
    tooltip: localize(8125, null)
  };
  picker.buttons = [clearAllButton];
  const rebuild = () => {
    picker.items = buildPickerItems(history, clearDayButton, removeEntryButton);
  };
  rebuild();
  disposables.add(history.onDidChange(rebuild));
  disposables.add(picker.onDidTriggerButton((button) => {
    if (button === clearAllButton) {
      void model.deleteHistory();
    }
  }));
  disposables.add(picker.onDidTriggerSeparatorButton(({ button, separator: separator2 }) => {
    if (button === clearDayButton) {
      void model.deleteHistory(separator2.entryIds);
    }
  }));
  disposables.add(picker.onDidTriggerItemButton(({ button, item }) => {
    if (button === removeEntryButton) {
      void model.deleteHistory([item.entryId]);
    }
  }));
  disposables.add(picker.onDidAccept(() => {
    const selected = picker.selectedItems[0];
    if (selected) {
      void model.loadURL(selected.entryUrl);
    }
    picker.hide();
  }));
  disposables.add(picker.onDidHide(() => disposables.dispose()));
  picker.show();
}

function buildPickerItems(history, clearDayButton, removeEntryButton) {
  const sorted = [...history.entries.items].sort((a, b) => b.time - a.time);
  const groups = /* @__PURE__ */ new Map();
  const orderedKeys = [];
  const now = /* @__PURE__ */ new Date();
  for (const entry of sorted) {
    const key3 = dayKey(entry.time);
    let group2 = groups.get(key3);
    if (!group2) {
      group2 = { label: dayLabel(entry.time, now), entries: [] };
      groups.set(key3, group2);
      orderedKeys.push(key3);
    }
    group2.entries.push(entry);
  }
  const out = [];
  for (const key3 of orderedKeys) {
    const group2 = groups.get(key3);
    out.push({
      type: "separator",
      id: key3,
      label: group2.label,
      buttons: [clearDayButton],
      entryIds: group2.entries.map((e4) => e4.id)
    });
    for (const entry of group2.entries) {
      const faviconUri = entry.icon ? resolveFavicon(history, entry.icon) : void 0;
      out.push({
        label: entry.title || entry.url,
        description: entry.title ? entry.url : void 0,
        iconPath: faviconUri ? { dark: faviconUri } : void 0,
        iconClass: faviconUri ? void 0 : ThemeIcon.asClassName(Codicon.globe),
        buttons: [removeEntryButton],
        entryId: entry.id,
        entryUrl: entry.url
      });
    }
  }
  return out;
}

function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(ts, now) {
  const d = new Date(ts);
  if (isSameDay(d, now)) {
    return localize(8121, null);
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d, yesterday)) {
    return localize(8122, null);
  }
  return d.toLocaleDateString(void 0, { year: "numeric", month: "long", day: "numeric" });
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

var ShowBrowserHistoryAction = class _ShowBrowserHistoryAction extends Action2 {
  static {
    this.ID = BrowserViewCommandId.ShowHistory;
  }
  constructor() {
    const when = ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, ContextKeyExpr.equals(CONTEXT_BROWSER_STORAGE_SCOPE.key, "ephemeral" /* Ephemeral */).negate());
    super({
      id: _ShowBrowserHistoryAction.ID,
      title: localize2(8126, "History"),
      category: BrowserActionCategory,
      icon: Codicon.history,
      f1: true,
      precondition: when,
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: "4_data" /* Data */,
        order: 1,
        when,
        isHiddenByDefault: true
      },
      keybinding: {
        primary: 2048 /* CtrlCmd */ | 38 /* KeyH */,
        mac: { primary: 2048 /* CtrlCmd */ | 55 /* KeyY */ },
        weight: 200 /* WorkbenchContrib */
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      browserEditor.getContribution(BrowserHistoryFeature)?.showManagementPicker();
    }
  }
};

registerAction2(ShowBrowserHistoryAction);

Registry.as(Extensions4.Configuration).registerConfiguration({
  ...workbenchConfigurationNodeBase,
  properties: {
    [BrowserMaxHistoryEntriesSettingId]: {
      type: "integer",
      default: 200,
      minimum: 0,
      maximum: 1e4,
      scope: 1 /* APPLICATION */,
      description: localize(8123, null),
      order: 110
    }
  }
});
export { toSuggestion, dedupKey, matches, resolveFavicon, showHistoryPicker, buildPickerItems, dayKey, dayLabel, isSameDay, MAX_RECENTS, MAX_HISTORY, BrowserHistoryFeature, ShowBrowserHistoryAction };
