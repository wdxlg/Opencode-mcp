// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/github/browser/githubReferenceList.ts
import { Disposable } from "./module-0012.mjs";
import { $, append } from "./module-0075.mjs";
import { ActionBar } from "./module-0477.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { toAction } from "./module-0082.mjs";


// src/vs/sessions/contrib/github/browser/githubReferenceList.ts
var GitHubReferenceList = class extends Disposable {
  constructor(entries2, _onDidSelect) {
    super();
    this._onDidSelect = _onDidSelect;
    this.element = $(".sessions-github-reference-list", { role: "list" });
    this._rows = [];
    this.update(entries2);
  }
  update(entries2) {
    const numberDigits = entries2.reduce((max, entry) => Math.max(max, entry.number.toString().length), 0);
    for (let index2 = 0; index2 < entries2.length; index2++) {
      const entry = entries2[index2];
      const row = this._rows[index2] ?? this._createRow(entry);
      row.entry = entry;
      this._updateRow(row, numberDigits);
    }
    for (let index2 = this._rows.length - 1; index2 >= entries2.length; index2--) {
      this._store.delete(this._rows[index2].actionBar);
      this._rows[index2].item.remove();
      this._rows.splice(index2, 1);
    }
  }
  _createRow(entry) {
    const item = append(this.element, $(".sessions-github-reference-list-item", { role: "listitem" }));
    const button = append(item, document.createElement("button"));
    button.className = "sessions-github-reference-list-entry";
    button.type = "button";
    const row = {
      entry,
      item,
      button,
      icon: append(button, $("span.sessions-github-reference-list-entry-icon", { "aria-hidden": "true" })),
      number: append(button, $("span.sessions-github-reference-list-entry-number")),
      title: append(button, $("span.sessions-github-reference-list-entry-title")),
      actionBar: this._register(new ActionBar(append(item, $(".sessions-github-reference-list-entry-actions")))),
      actionsKey: ""
    };
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this._onDidSelect(row.entry);
    };
    this._rows.push(row);
    return row;
  }
  _updateRow(row, numberDigits) {
    const entry = row.entry;
    if (entry.ariaLabel) {
      row.button.setAttribute("aria-label", entry.ariaLabel);
    } else {
      row.button.removeAttribute("aria-label");
    }
    row.icon.className = `sessions-github-reference-list-entry-icon ${ThemeIcon.asClassName(entry.icon)}`;
    if (entry.icon.color) {
      row.icon.style.color = asCssVariable(entry.icon.color.id);
    } else {
      row.icon.style.removeProperty("color");
    }
    row.number.textContent = `#${entry.number}`;
    row.number.style.width = `calc(${numberDigits}ch + 1em)`;
    row.title.textContent = entry.title ?? "";
    row.title.title = entry.title ?? "";
    row.title.hidden = !entry.title;
    this._updateRowActions(row);
  }
  /**
   * Renders the row's actions, keeping the rendered buttons as long as their presentation
   * is unchanged so a focused action survives a state update. The rendered actions run
   * against the row's current entry rather than the one they were rendered for.
   */
  _updateRowActions(row) {
    const actions = row.entry.toolbarActions ?? [];
    const actionsKey = actions.map((action) => `${action.id}\0${action.label}\0${action.tooltip}\0${action.class}\0${action.enabled}\0${action.checked}`).join("");
    if (row.actionsKey === actionsKey) {
      return;
    }
    row.actionsKey = actionsKey;
    row.actionBar.clear();
    if (actions.length) {
      row.actionBar.push(actions.map((action, index2) => toAction({
        id: action.id,
        label: action.label,
        tooltip: action.tooltip,
        class: action.class,
        enabled: action.enabled,
        checked: action.checked,
        run: (...args2) => row.entry.toolbarActions?.[index2]?.run(...args2)
      })), { icon: true, label: false });
    }
  }
};
export { GitHubReferenceList };
