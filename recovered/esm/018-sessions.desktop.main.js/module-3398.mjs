// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/accessibility/browser/extensionAccesibilityHelp.contribution.ts
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions13 } from "./module-1094.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { AccessibleViewRegistry } from "./module-0693.mjs";
import { FocusedViewContext } from "./module-0950.mjs";
import { IViewsService } from "./module-1246.mjs";
import { ExtensionContentProvider } from "./module-0799.mjs";


// src/vs/workbench/contrib/accessibility/browser/extensionAccesibilityHelp.contribution.ts
var ExtensionAccessibilityHelpDialogContribution = class extends Disposable {
  constructor(keybindingService) {
    super();
    this._viewHelpDialogMap = this._register(new DisposableMap());
    this._register(Registry.as(Extensions13.ViewsRegistry).onViewsRegistered((e4) => {
      for (const view of e4) {
        for (const viewDescriptor3 of view.views) {
          if (viewDescriptor3.accessibilityHelpContent) {
            this._viewHelpDialogMap.set(viewDescriptor3.id, registerAccessibilityHelpAction(keybindingService, viewDescriptor3));
          }
        }
      }
    }));
    this._register(Registry.as(Extensions13.ViewsRegistry).onViewsDeregistered((e4) => {
      for (const viewDescriptor3 of e4.views) {
        if (viewDescriptor3.accessibilityHelpContent) {
          this._viewHelpDialogMap.get(viewDescriptor3.id)?.dispose();
        }
      }
    }));
  }
  static {
    this.ID = "extensionAccessibilityHelpDialogContribution";
  }
};

ExtensionAccessibilityHelpDialogContribution = __decorateClass([
  __decorateParam(0, IKeybindingService)
], ExtensionAccessibilityHelpDialogContribution);

function registerAccessibilityHelpAction(keybindingService, viewDescriptor3) {
  const disposableStore = new DisposableStore();
  const content = viewDescriptor3.accessibilityHelpContent?.value;
  if (!content) {
    throw new Error("No content provided for the accessibility help dialog");
  }
  disposableStore.add(AccessibleViewRegistry.register({
    priority: 95,
    name: viewDescriptor3.id,
    type: "help" /* Help */,
    when: FocusedViewContext.isEqualTo(viewDescriptor3.id),
    getProvider: (accessor) => {
      const viewsService = accessor.get(IViewsService);
      return new ExtensionContentProvider(
        viewDescriptor3.id,
        { type: "help" /* Help */ },
        () => content,
        () => viewsService.openView(viewDescriptor3.id, true)
      );
    }
  }));
  disposableStore.add(keybindingService.onDidUpdateKeybindings(() => {
    disposableStore.clear();
    disposableStore.add(registerAccessibilityHelpAction(keybindingService, viewDescriptor3));
  }));
  return disposableStore;
}
export { registerAccessibilityHelpAction, ExtensionAccessibilityHelpDialogContribution };
