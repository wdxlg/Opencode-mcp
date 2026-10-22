// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/features/browserEditorArenaFollowLatestFeature.ts
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { browserArenaFollowLatestSettingId } from "./module-4049.mjs";
import { localize } from "./module-0001.mjs";
import { BrowserEditor, BrowserEditorContribution } from "./module-4048.mjs";
import { $, EventType, addDisposableListener } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IHoverService } from "./module-0520.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/features/browserEditorArenaFollowLatestFeature.ts
Registry.as(Extensions4.Configuration).registerConfiguration({
  id: "browserArenaFollowLatest",
  properties: {
    [browserArenaFollowLatestSettingId]: {
      type: "boolean",
      default: true,
      scope: 1 /* APPLICATION */,
      description: localize(8014, null)
    }
  }
});

var BrowserEditorArenaFollowLatestContribution = class extends BrowserEditorContribution {
  constructor(editor, configurationService, hoverService) {
    super(editor);
    this.button = $("button.browser-arena-follow-latest");
    this.pending = false;
    this.message = "";
    this.button.type = "button";
    const icon2 = $("span." + ThemeIcon.asClassName(Codicon.arrowDown).split(" ").join("."));
    icon2.setAttribute("aria-hidden", "true");
    this.button.append(icon2);
    this._register(addDisposableListener(this.button, EventType.CLICK, () => {
      void this.toggle();
    }));
    this._register(hoverService.setupDelayedHover(this.button, () => ({ content: this.message })));
    this._register(configurationService.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(browserArenaFollowLatestSettingId)) {
        this.refresh();
      }
    }));
    this.refresh();
  }
  get widgets() {
    return [{ location: "postUrl" /* PostUrl */, element: this.button, order: 21 }];
  }
  onModelAttached(model, store) {
    this.model = model;
    store.add(model.onDidNavigate(() => this.refresh()));
    store.add(model.onDidChangeArenaFollowLatest(() => this.refresh()));
    this.refresh();
  }
  onModelDetached() {
    this.model = void 0;
    this.refresh();
  }
  refresh() {
    const enabled = this.model?.arenaFollowLatestState.enabled !== false;
    const generating = this.model?.arenaFollowLatestState.generating === true;
    const arena = /^https:\/\/(www\.)?arena\.ai(?:[/:?#]|$)/i.test(this.model?.url ?? "");
    this.button.disabled = !arena || this.pending;
    this.button.setAttribute("aria-pressed", String(enabled));
    this.button.classList.toggle("active", enabled && arena);
    this.message = !arena ? localize(8013, null) : !generating ? localize(8010, null) : enabled ? localize(8012, null) : localize(8011, null);
    this.button.setAttribute("aria-label", this.message);
  }
  async toggle() {
    if (this.button.disabled) {
      return;
    }
    this.pending = true;
    this.refresh();
    let failed = false;
    try {
      await this.model?.setArenaFollowLatestEnabled(!this.model.arenaFollowLatestState.enabled);
    } catch {
      failed = true;
    } finally {
      this.pending = false;
      this.refresh();
    }
    if (failed) {
      this.message = localize(8009, null);
      this.button.setAttribute("aria-label", this.message);
    }
  }
};

BrowserEditorArenaFollowLatestContribution = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IHoverService)
], BrowserEditorArenaFollowLatestContribution);

BrowserEditor.registerContribution(BrowserEditorArenaFollowLatestContribution);
export { BrowserEditorArenaFollowLatestContribution };
