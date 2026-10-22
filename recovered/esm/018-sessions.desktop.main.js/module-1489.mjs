// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/common/browserEditorInput.ts
import { EditorInput } from "./module-0929.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { LRUCachedFunction } from "./module-0027.mjs";
import { BrowserViewEditorId, IBrowserViewWorkbenchService } from "./module-1243.mjs";
import { localize } from "./module-0001.mjs";
import { BrowserViewUri } from "./module-1487.mjs";
import { Codicon } from "./module-0085.mjs";
import { TAB_ACTIVE_FOREGROUND } from "./module-0868.mjs";
import { URI } from "./module-0032.mjs";
import { truncate } from "./module-0030.mjs";
import { basename2, isEqual2 } from "./module-0034.mjs";
import { hasKey } from "./module-0010.mjs";
import { logBrowserOpen } from "./module-1488.mjs";
import { generateUuid } from "./module-0190.mjs";
import { isBrowserViewAssociatedResourceNavigation } from "./module-1237.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/workbench/contrib/browserView/common/browserEditorInput.ts
var LOADING_SPINNER_SVG = (color2) => `
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
		<path d="M8 1a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm0 1.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11z" fill="${color2}" opacity="0.3"/>
		<path d="M8 1a7 7 0 0 1 7 7h-1.5A5.5 5.5 0 0 0 8 2.5V1z" fill="${color2}">
			<animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" values="0 8 8;360 8 8"/>
		</path>
	</svg>
`;

var MAX_TITLE_LENGTH = 30;

function stripUrlQueryAndFragment(url) {
  const suffix = url.search(/[?#]/);
  return suffix === -1 ? url : url.slice(0, suffix);
}

var BrowserEditorInput = class extends EditorInput {
  constructor(options3, _resolveModel, themeService, instantiationService, telemetryService, browserViewWorkbenchService) {
    super();
    this._resolveModel = _resolveModel;
    this.themeService = themeService;
    this.instantiationService = instantiationService;
    this.telemetryService = telemetryService;
    this.browserViewWorkbenchService = browserViewWorkbenchService;
    this._modelStore = this._register(new DisposableStore());
    this._onBeforeDispose = this._register(new Emitter());
    this.onBeforeDispose = this._onBeforeDispose.event;
    this._onDidResolveModel = this._register(new Emitter());
    this.onDidResolveModel = this._onDidResolveModel.event;
    this.getURLTitles = new LRUCachedFunction((url) => {
      let _short = void 0;
      let _mediumlong = void 0;
      const mediumlong = () => {
        if (_mediumlong === void 0) {
          _mediumlong = stripUrlQueryAndFragment(url);
        }
        return _mediumlong;
      };
      return {
        // Host only for network URLs, path only for file URLs.
        get [0 /* SHORT */]() {
          if (_short === void 0) {
            const parsed = URL.parse(url);
            _short = parsed ? parsed.protocol === "file:" ? parsed.pathname : parsed.host : stripUrlQueryAndFragment(url);
          }
          return _short;
        },
        // Raw URL without the query/fragment. Computed by string slicing
        // (not a URI round-trip) so the displayed text stays byte-for-byte
        // consistent with the canonical URL shown in the navbar.
        get [1 /* MEDIUM */]() {
          return mediumlong();
        },
        // Raw URL without the query/fragment.
        get [2 /* LONG */]() {
          return mediumlong();
        }
      };
    });
    this._id = options3.id;
    this._associatedResource = options3.associatedResource;
    this._initialData = options3;
  }
  static {
    this.ID = "workbench.editorinputs.browser";
  }
  static {
    this.EDITOR_ID = BrowserViewEditorId;
  }
  static {
    this.DEFAULT_LABEL = localize(7973, null);
  }
  get model() {
    return this._model;
  }
  set model(model) {
    if (this._model === model) {
      return;
    }
    this._modelStore.clear();
    this._model = model;
    this._modelStore.add(this._model.onWillDispose(() => {
      this._modelStore.clear();
      this._model = void 0;
    }));
    this._modelStore.add(this._model.onDidClose(() => {
      this.dispose(true);
    }));
    this._modelStore.add(this._model.onDidChangeTitle(() => this._onDidChangeLabel.fire()));
    this._modelStore.add(this._model.onDidChangeFavicon(() => this._onDidChangeLabel.fire()));
    this._modelStore.add(this._model.onDidChangeLoadingState(() => this._onDidChangeLabel.fire()));
    this._modelStore.add(this._model.onDidNavigate(() => {
      this._initialData = { ...this._initialData, title: void 0, favicon: void 0 };
      this._onDidChangeLabel.fire();
    }));
    this._onDidChangeLabel.fire();
    this._onDidResolveModel.fire(model);
  }
  onceModelResolves(cb) {
    if (this._model) {
      cb(this._model);
      return Disposable.None;
    } else {
      return Event2.once(this.onDidResolveModel)(cb);
    }
  }
  get id() {
    return this._id;
  }
  get associatedResource() {
    return this._associatedResource;
  }
  get url() {
    return this._model?.url || this._initialData.url;
  }
  get title() {
    return this._model?.title || this._initialData.title;
  }
  get favicon() {
    return this._model?.favicon ?? this._initialData.favicon;
  }
  /**
   * Whether this editor was opened via a default localhost link open (setting
   * not explicitly configured by the user). Transient — not serialized.
   */
  get isDefaultLinkOpen() {
    return !!this._initialData.isDefaultLinkOpen;
  }
  get isSharingAvailable() {
    return this._model ? this._model.sharingState !== "unavailable" /* Unavailable */ : this.browserViewWorkbenchService.isSharingAvailable;
  }
  navigate(url, options3) {
    const destination = url.trim();
    if (this._model) {
      void this._model.loadURL(destination, options3);
    } else {
      this._initialData = {
        id: this._id,
        url: destination
      };
      this._onDidChangeLabel.fire();
    }
  }
  async resolve() {
    if (!this._model && !this._modelPromise) {
      this._modelPromise = (async () => {
        this._model = await this._resolveModel();
        this._modelPromise = void 0;
        return this._model;
      })();
    }
    return this._model || this._modelPromise;
  }
  get typeId() {
    return BrowserEditorInput.ID;
  }
  get editorId() {
    return BrowserEditorInput.EDITOR_ID;
  }
  get capabilities() {
    return 1024 /* ForceReveal */ | 2 /* Readonly */;
  }
  get resource() {
    return BrowserViewUri.forId(this._id);
  }
  get preferredResource() {
    return this._associatedResource ?? this.resource;
  }
  getIcon() {
    const defaultIcon = this._associatedResource ? void 0 : Codicon.globe;
    if (this._model) {
      if (this._model.loading) {
        const color2 = this.themeService.getColorTheme().getColor(TAB_ACTIVE_FOREGROUND);
        return URI.parse("data:image/svg+xml;utf8," + encodeURIComponent(LOADING_SPINNER_SVG(color2?.toString())));
      }
      if (this._model.favicon) {
        return URI.parse(this._model.favicon);
      }
    }
    if (this._initialData.favicon) {
      return URI.parse(this._initialData.favicon);
    }
    return defaultIcon;
  }
  getName() {
    if (this.title) {
      return truncate(this.title, MAX_TITLE_LENGTH);
    }
    const name = this._associatedResource ? basename2(this._associatedResource) : this.url && this.getURLTitles.get(this.url)[0 /* SHORT */] || BrowserEditorInput.DEFAULT_LABEL;
    return truncate(name, MAX_TITLE_LENGTH);
  }
  getTitle(verbosity = 1 /* MEDIUM */) {
    if (verbosity === 0 /* SHORT */) {
      return this.getName();
    }
    const description = this.getDescription(verbosity);
    const displayName = this.title ? verbosity === 2 /* LONG */ ? this.title : truncate(this.title, MAX_TITLE_LENGTH) : void 0;
    const title = displayName ? `${displayName} (${description})` : description;
    return title || BrowserEditorInput.DEFAULT_LABEL;
  }
  getDescription(verbosity = 1 /* MEDIUM */) {
    const base = this.url && this.getURLTitles.get(this.url)[verbosity === 2 /* LONG */ ? 2 /* LONG */ : 0 /* SHORT */];
    switch (this._model?.storageScope ?? this._initialData.storageScope) {
      case "ephemeral" /* Ephemeral */: {
        const label3 = localize(7974, null);
        return base ? `${label3} \xB7 ${base}` : label3;
      }
      case "secondAccount" /* SecondAccount */: {
        const label3 = localize(7975, null);
        return base ? `${label3} \xB7 ${base}` : label3;
      }
      default:
        return base;
    }
  }
  canReopen() {
    return true;
  }
  matches(otherInput) {
    if (this._associatedResource && !(otherInput instanceof EditorInput) && hasKey(otherInput, { resource: true }) && isEqual2(this._associatedResource, otherInput.resource)) {
      return otherInput.options?.override === BrowserEditorInput.EDITOR_ID;
    }
    if (super.matches(otherInput)) {
      return true;
    }
    if (otherInput instanceof BrowserEditorInput) {
      return this._id === otherInput._id;
    }
    if (hasKey(otherInput, { resource: true }) && otherInput.resource?.scheme === BrowserViewUri.scheme) {
      const parsed = BrowserViewUri.parse(otherInput.resource);
      if (parsed) {
        return this._id === parsed.id;
      }
    }
    return false;
  }
  /**
   * Creates a copy of this browser editor input with a new unique ID, creating an independent browser view with no linked state.
   * This is used during Copy into New Window.
   */
  copy() {
    logBrowserOpen(this.telemetryService, "copyToNewWindow");
    return this.instantiationService.invokeFunction((accessor) => {
      const browserViewWorkbenchService = accessor.get(IBrowserViewWorkbenchService);
      return browserViewWorkbenchService.getOrCreateLazy({
        id: generateUuid(),
        url: this.url,
        title: this.title,
        favicon: this.favicon,
        storageScope: this._model?.storageScope ?? this._initialData.storageScope,
        associatedResource: this._associatedResource
      });
    });
  }
  toUntyped() {
    const viewState = {
      url: this.url,
      title: this.title,
      favicon: this.favicon,
      storageScope: this._model?.storageScope ?? this._initialData.storageScope
    };
    return {
      resource: this.preferredResource,
      options: {
        override: BrowserEditorInput.EDITOR_ID,
        viewState
      }
    };
  }
  async rename(_group, target) {
    if (!this._associatedResource) {
      return void 0;
    }
    const currentUrl = this.url;
    let renamedUrl = currentUrl;
    if (currentUrl && isBrowserViewAssociatedResourceNavigation(this._associatedResource, currentUrl)) {
      const currentResource = URI.parse(currentUrl);
      renamedUrl = target.with({ query: currentResource.query, fragment: currentResource.fragment }).toString();
    }
    return {
      editor: {
        resource: target,
        options: {
          override: BrowserEditorInput.EDITOR_ID,
          viewState: {
            url: renamedUrl,
            title: this.title,
            favicon: this.favicon
          }
        }
      }
    };
  }
  dispose(force) {
    if (!force) {
      let vetoed = false;
      this._onBeforeDispose.fire({ veto: () => {
        vetoed = true;
      } });
      if (vetoed) {
        return;
      }
    }
    super.dispose();
    if (this._model) {
      this._initialData = {
        id: this._id,
        url: this._model.url,
        title: this._model.title,
        favicon: this._model.favicon,
        storageScope: this._model.storageScope
      };
      this._model.dispose();
      this._model = void 0;
    }
  }
  serialize() {
    return {
      id: this._id,
      associatedResource: this._associatedResource,
      url: this.url,
      title: this.title,
      favicon: this.favicon,
      storageScope: this._model?.storageScope ?? this._initialData.storageScope
    };
  }
};

BrowserEditorInput = __decorateClass([
  __decorateParam(2, IThemeService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ITelemetryService),
  __decorateParam(5, IBrowserViewWorkbenchService)
], BrowserEditorInput);

var BrowserEditorSerializer = class {
  canSerialize(editorInput) {
    return editorInput instanceof BrowserEditorInput;
  }
  serialize(editorInput) {
    if (!this.canSerialize(editorInput)) {
      return void 0;
    }
    return JSON.stringify(editorInput.serialize());
  }
  deserialize(instantiationService, serializedEditor) {
    try {
      const data = JSON.parse(serializedEditor);
      return instantiationService.invokeFunction((accessor) => {
        const browserViewWorkbenchService = accessor.get(IBrowserViewWorkbenchService);
        return browserViewWorkbenchService.getOrCreateLazy({
          id: data.id,
          url: data.url,
          title: data.title,
          favicon: data.favicon,
          storageScope: data.storageScope,
          associatedResource: URI.revive(data.associatedResource)
        });
      });
    } catch {
      return void 0;
    }
  }
};
export { stripUrlQueryAndFragment, LOADING_SPINNER_SVG, MAX_TITLE_LENGTH, BrowserEditorInput, BrowserEditorSerializer };
