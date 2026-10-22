// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/welcomeViews/common/viewsWelcomeContribution.ts
import { Registry } from "./module-0090.mjs";
import { Extensions13 } from "./module-1093.mjs";
import { Disposable } from "./module-0012.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ViewIdentifierMap } from "./module-3571.mjs";
import { isProposedApiEnabled } from "./module-0887.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/welcomeViews/common/viewsWelcomeContribution.ts
var viewsRegistry8 = Registry.as(Extensions13.ViewsRegistry);

var ViewsWelcomeContribution = class extends Disposable {
  constructor(extensionPoint5) {
    super();
    this.viewWelcomeContents = /* @__PURE__ */ new Map();
    extensionPoint5.setHandler((_, { added, removed }) => {
      for (const contribution of removed) {
        for (const welcome of contribution.value) {
          const disposable = this.viewWelcomeContents.get(welcome);
          disposable?.dispose();
        }
      }
      const welcomesByViewId = /* @__PURE__ */ new Map();
      for (const contribution of added) {
        for (const welcome of contribution.value) {
          const { group: group2, order } = parseGroupAndOrder(welcome, contribution);
          const precondition2 = ContextKeyExpr.deserialize(welcome.enablement);
          const id2 = ViewIdentifierMap[welcome.view] ?? welcome.view;
          let viewContentMap = welcomesByViewId.get(id2);
          if (!viewContentMap) {
            viewContentMap = /* @__PURE__ */ new Map();
            welcomesByViewId.set(id2, viewContentMap);
          }
          viewContentMap.set(welcome, {
            content: welcome.contents,
            when: ContextKeyExpr.deserialize(welcome.when),
            precondition: precondition2,
            group: group2,
            order
          });
        }
      }
      for (const [id2, viewContentMap] of welcomesByViewId) {
        const disposables = viewsRegistry8.registerViewWelcomeContent2(id2, viewContentMap);
        for (const [welcome, disposable] of disposables) {
          this.viewWelcomeContents.set(welcome, disposable);
        }
      }
    });
  }
};

function parseGroupAndOrder(welcome, contribution) {
  let group2;
  let order;
  if (welcome.group) {
    if (!isProposedApiEnabled(contribution.description, "contribViewsWelcome")) {
      contribution.collector.warn(localize(22253, null, contribution.description.identifier.value));
      return { group: group2, order };
    }
    const idx = welcome.group.lastIndexOf("@");
    if (idx > 0) {
      group2 = welcome.group.substr(0, idx);
      order = Number(welcome.group.substr(idx + 1)) || void 0;
    } else {
      group2 = welcome.group;
    }
  }
  return { group: group2, order };
}
export { parseGroupAndOrder, viewsRegistry8, ViewsWelcomeContribution };
