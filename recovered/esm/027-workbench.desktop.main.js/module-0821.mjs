// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/links/browser/getLinks.ts
import { DisposableStore, isDisposable } from "./module-0012.mjs";
import { Range2 } from "./module-0106.mjs";
import { onUnexpectedExternalError } from "./module-0004.mjs";
import { coalesce } from "./module-0007.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { assertType } from "./module-0010.mjs";
import { URI } from "./module-0032.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IModelService } from "./module-0080.mjs";
import { CancellationToken } from "./module-0025.mjs";


// src/vs/editor/contrib/links/browser/getLinks.ts
var Link2 = class {
  constructor(link2, provider) {
    this._link = link2;
    this._provider = provider;
  }
  toJSON() {
    return {
      range: this.range,
      url: this.url,
      tooltip: this.tooltip
    };
  }
  get range() {
    return this._link.range;
  }
  get url() {
    return this._link.url;
  }
  get tooltip() {
    return this._link.tooltip;
  }
  async resolve(token) {
    if (this._link.url) {
      return this._link.url;
    }
    if (typeof this._provider.resolveLink === "function") {
      return Promise.resolve(this._provider.resolveLink(this._link, token)).then((value2) => {
        this._link = value2 || this._link;
        if (this._link.url) {
          return this.resolve(token);
        }
        return Promise.reject(new Error("missing"));
      });
    }
    return Promise.reject(new Error("missing"));
  }
};

var LinksList = class _LinksList {
  constructor(tuples) {
    this._disposables = new DisposableStore();
    let links = [];
    for (const [list2, provider] of tuples) {
      const newLinks = list2.links.map((link2) => new Link2(link2, provider));
      links = _LinksList._union(links, newLinks);
      if (isDisposable(list2)) {
        this._disposables ??= new DisposableStore();
        this._disposables.add(list2);
      }
    }
    this.links = links;
  }
  static {
    this.Empty = new _LinksList([]);
  }
  dispose() {
    this._disposables?.dispose();
    this.links.length = 0;
  }
  static _union(oldLinks, newLinks) {
    const result = [];
    let oldIndex;
    let oldLen;
    let newIndex;
    let newLen;
    for (oldIndex = 0, newIndex = 0, oldLen = oldLinks.length, newLen = newLinks.length; oldIndex < oldLen && newIndex < newLen; ) {
      const oldLink = oldLinks[oldIndex];
      const newLink = newLinks[newIndex];
      if (Range2.areIntersectingOrTouching(oldLink.range, newLink.range)) {
        oldIndex++;
        continue;
      }
      const comparisonResult = Range2.compareRangesUsingStarts(oldLink.range, newLink.range);
      if (comparisonResult < 0) {
        result.push(oldLink);
        oldIndex++;
      } else {
        result.push(newLink);
        newIndex++;
      }
    }
    for (; oldIndex < oldLen; oldIndex++) {
      result.push(oldLinks[oldIndex]);
    }
    for (; newIndex < newLen; newIndex++) {
      result.push(newLinks[newIndex]);
    }
    return result;
  }
};

async function getLinks(providers2, model, token) {
  const lists = [];
  const promises = providers2.ordered(model).reverse().map(async (provider, i2) => {
    try {
      const result = await provider.provideLinks(model, token);
      if (result) {
        lists[i2] = [result, provider];
      }
    } catch (err) {
      onUnexpectedExternalError(err);
    }
  });
  await Promise.all(promises);
  let res = new LinksList(coalesce(lists));
  if (token.isCancellationRequested) {
    res.dispose();
    res = LinksList.Empty;
  }
  return res;
}

CommandsRegistry.registerCommand("_executeLinkProvider", async (accessor, ...args2) => {
  let [uri5, resolveCount] = args2;
  assertType(uri5 instanceof URI);
  if (typeof resolveCount !== "number") {
    resolveCount = 0;
  }
  const { linkProvider } = accessor.get(ILanguageFeaturesService);
  const model = accessor.get(IModelService).getModel(uri5);
  if (!model) {
    return [];
  }
  const list2 = await getLinks(linkProvider, model, CancellationToken.None);
  if (!list2) {
    return [];
  }
  for (let i2 = 0; i2 < Math.min(resolveCount, list2.links.length); i2++) {
    await list2.links[i2].resolve(CancellationToken.None);
  }
  const result = list2.links.slice(0);
  list2.dispose();
  return result;
});
export { getLinks, Link2, LinksList };
