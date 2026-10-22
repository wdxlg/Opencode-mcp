// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostTimeline.ts
import { createDecorator2 } from "./module-0048.mjs";
import { MainContext } from "./module-0054.mjs";
import { isProposedApiEnabled } from "./module-0173.mjs";
import { URI } from "./module-0025.mjs";
import { DisposableStore, toDisposable } from "./module-0011.mjs";
import { ThemeIcon2 } from "./module-0244.mjs";
import { MarkdownString2 } from "./module-0231.mjs";
import { MarkdownString3 } from "./module-0245.mjs";
import { isString } from "./module-0009.mjs";


// src/vs/workbench/api/common/extHostTimeline.ts
var IExtHostTimeline = createDecorator2("IExtHostTimeline");

var ExtHostTimeline = class {
  constructor(mainContext, commands) {
    this._providers = /* @__PURE__ */ new Map();
    this._itemsBySourceAndUriMap = /* @__PURE__ */ new Map();
    this._proxy = mainContext.getProxy(MainContext.MainThreadTimeline);
    commands.registerArgumentProcessor({
      processArgument: (arg, extension) => {
        if (arg && arg.$mid === 12 /* TimelineActionContext */) {
          if (this._providers.get(arg.source) && extension && isProposedApiEnabled(extension, "timeline")) {
            const uri2 = arg.uri === void 0 ? void 0 : URI.revive(arg.uri);
            return this._itemsBySourceAndUriMap.get(arg.source)?.get(getUriKey(uri2))?.get(arg.handle);
          } else {
            return void 0;
          }
        }
        return arg;
      }
    });
  }
  async $getTimeline(id2, uri2, options2, token) {
    const item = this._providers.get(id2);
    return item?.provider.provideTimeline(URI.revive(uri2), options2, token);
  }
  registerTimelineProvider(scheme, provider, extensionId, commandConverter) {
    const timelineDisposables = new DisposableStore();
    const convertTimelineItem = this.convertTimelineItem(provider.id, commandConverter, timelineDisposables).bind(this);
    let disposable;
    if (provider.onDidChange) {
      disposable = provider.onDidChange((e) => this._proxy.$emitTimelineChangeEvent({ uri: void 0, reset: true, ...e, id: provider.id }), this);
    }
    const itemsBySourceAndUriMap = this._itemsBySourceAndUriMap;
    return this.registerTimelineProviderCore({
      ...provider,
      scheme,
      onDidChange: void 0,
      async provideTimeline(uri2, options2, token) {
        if (options2?.resetCache) {
          timelineDisposables.clear();
          itemsBySourceAndUriMap.get(provider.id)?.clear();
        }
        const result = await provider.provideTimeline(uri2, options2, token);
        if (result === void 0 || result === null) {
          return void 0;
        }
        const convertItem = convertTimelineItem(uri2, options2);
        return {
          ...result,
          source: provider.id,
          items: result.items.map(convertItem)
        };
      },
      dispose() {
        for (const sourceMap of itemsBySourceAndUriMap.values()) {
          sourceMap.get(provider.id)?.clear();
        }
        disposable?.dispose();
        timelineDisposables.dispose();
      }
    }, extensionId);
  }
  convertTimelineItem(source, commandConverter, disposables) {
    return (uri2, options2) => {
      let items;
      if (options2?.cacheResults) {
        let itemsByUri = this._itemsBySourceAndUriMap.get(source);
        if (itemsByUri === void 0) {
          itemsByUri = /* @__PURE__ */ new Map();
          this._itemsBySourceAndUriMap.set(source, itemsByUri);
        }
        const uriKey = getUriKey(uri2);
        items = itemsByUri.get(uriKey);
        if (items === void 0) {
          items = /* @__PURE__ */ new Map();
          itemsByUri.set(uriKey, items);
        }
      }
      return (item) => {
        const { iconPath, ...props } = item;
        const handle = `${source}|${item.id ?? item.timestamp}`;
        items?.set(handle, item);
        let icon;
        let iconDark;
        let themeIcon;
        if (item.iconPath) {
          if (iconPath instanceof ThemeIcon2) {
            themeIcon = { id: iconPath.id, color: iconPath.color };
          } else if (URI.isUri(iconPath)) {
            icon = iconPath;
            iconDark = iconPath;
          } else {
            ({ light: icon, dark: iconDark } = iconPath);
          }
        }
        let tooltip;
        if (MarkdownString2.isMarkdownString(props.tooltip)) {
          tooltip = MarkdownString3.from(props.tooltip);
        } else if (isString(props.tooltip)) {
          tooltip = props.tooltip;
        } else if (MarkdownString2.isMarkdownString(props.detail)) {
          console.warn("Using deprecated TimelineItem.detail, migrate to TimelineItem.tooltip");
          tooltip = MarkdownString3.from(props.detail);
        } else if (isString(props.detail)) {
          console.warn("Using deprecated TimelineItem.detail, migrate to TimelineItem.tooltip");
          tooltip = props.detail;
        }
        return {
          ...props,
          id: props.id ?? void 0,
          handle,
          source,
          command: item.command ? commandConverter.toInternal(item.command, disposables) : void 0,
          icon,
          iconDark,
          themeIcon,
          tooltip,
          accessibilityInformation: item.accessibilityInformation
        };
      };
    };
  }
  registerTimelineProviderCore(provider, extension) {
    const existing = this._providers.get(provider.id);
    if (existing) {
      throw new Error(`Timeline Provider ${provider.id} already exists.`);
    }
    this._proxy.$registerTimelineProvider({
      id: provider.id,
      label: provider.label,
      scheme: provider.scheme
    });
    this._providers.set(provider.id, { provider, extension });
    return toDisposable(() => {
      for (const sourceMap of this._itemsBySourceAndUriMap.values()) {
        sourceMap.get(provider.id)?.clear();
      }
      this._providers.delete(provider.id);
      this._proxy.$unregisterTimelineProvider(provider.id);
      provider.dispose();
    });
  }
};

function getUriKey(uri2) {
  return uri2?.toString();
}
export { getUriKey, IExtHostTimeline, ExtHostTimeline };
