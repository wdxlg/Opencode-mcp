// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/webviewPanel/browser/webviewEditorInputSerializer.ts
import { WebviewInput } from "./module-1116.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWebviewWorkbenchService } from "./module-1120.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/webviewPanel/browser/webviewEditorInputSerializer.ts
var WebviewEditorInputSerializer = class {
  constructor(_webviewWorkbenchService) {
    this._webviewWorkbenchService = _webviewWorkbenchService;
  }
  static {
    this.ID = WebviewInput.typeId;
  }
  canSerialize(input) {
    return this._webviewWorkbenchService.shouldPersist(input);
  }
  serialize(input) {
    if (!this.canSerialize(input)) {
      return void 0;
    }
    const data = this.toJson(input);
    try {
      return JSON.stringify(data);
    } catch {
      return void 0;
    }
  }
  deserialize(_instantiationService, serializedEditorInput) {
    const data = this.fromJson(JSON.parse(serializedEditorInput));
    return this._webviewWorkbenchService.openRevivedWebview({
      webviewInitInfo: {
        providedViewType: data.providedId,
        origin: data.origin,
        title: data.title,
        options: data.webviewOptions,
        contentOptions: data.contentOptions,
        extension: data.extension
      },
      viewType: data.viewType,
      title: data.title,
      iconPath: data.iconPath,
      state: data.state,
      group: data.group
    });
  }
  fromJson(data) {
    return {
      ...data,
      extension: reviveWebviewExtensionDescription(data.extensionId, data.extensionLocation),
      iconPath: reviveWebviewIconPath(data.iconPath),
      state: reviveState(data.state),
      webviewOptions: restoreWebviewOptions(data.options),
      contentOptions: restoreWebviewContentOptions(data.options)
    };
  }
  toJson(input) {
    return {
      origin: input.webview.origin,
      viewType: input.viewType,
      providedId: input.providerId,
      title: input.getName(),
      options: { ...input.webview.options, ...input.webview.contentOptions },
      extensionLocation: input.extension?.location,
      extensionId: input.extension?.id.value,
      state: input.webview.state,
      iconPath: input.iconPath ? ThemeIcon.isThemeIcon(input.iconPath) ? input.iconPath : { light: input.iconPath.light, dark: input.iconPath.dark } : void 0,
      group: input.group
    };
  }
};

WebviewEditorInputSerializer = __decorateClass([
  __decorateParam(0, IWebviewWorkbenchService)
], WebviewEditorInputSerializer);

function reviveWebviewExtensionDescription(extensionId, extensionLocation) {
  if (!extensionId) {
    return void 0;
  }
  const location2 = reviveUri(extensionLocation);
  if (!location2) {
    return void 0;
  }
  return {
    id: new ExtensionIdentifier(extensionId),
    location: location2
  };
}

function reviveWebviewIconPath(data) {
  if (!data) {
    return void 0;
  }
  if (ThemeIcon.isThemeIcon(data)) {
    return data;
  }
  const light = reviveUri(data.light);
  const dark = reviveUri(data.dark);
  return light && dark ? { light, dark } : void 0;
}

function reviveUri(data) {
  if (!data) {
    return void 0;
  }
  try {
    if (typeof data === "string") {
      return URI.parse(data);
    }
    return URI.from(data);
  } catch {
    return void 0;
  }
}

function reviveState(state) {
  return typeof state === "string" ? state : void 0;
}

function restoreWebviewOptions(options3) {
  return options3;
}

function restoreWebviewContentOptions(options3) {
  return {
    ...options3,
    forwardUntrustedKeypressEvents: options3.forwardUntrustedKeypressEvents ?? true,
    // default to true for backwards compatibility
    localResourceRoots: options3.localResourceRoots?.map((uri5) => reviveUri(uri5))
  };
}
export { reviveWebviewExtensionDescription, reviveWebviewIconPath, reviveUri, reviveState, restoreWebviewOptions, restoreWebviewContentOptions, WebviewEditorInputSerializer };
