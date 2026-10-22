// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/actions/helpActions.ts
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { isLinux, isMacintosh, isWeb, language } from "./module-0014.mjs";
import { product_default } from "./module-0139.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { KeyChord } from "./module-0019.mjs";
import { IProductService } from "./module-0875.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { URI } from "./module-0032.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IsSessionsWindowContext } from "./module-0950.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";


// src/vs/workbench/browser/actions/helpActions.ts
var KeybindingsReferenceAction = class _KeybindingsReferenceAction extends Action2 {
  static {
    this.ID = "workbench.action.keybindingsReference";
  }
  static {
    this.AVAILABLE = !!(isLinux ? product_default.keyboardShortcutsUrlLinux : isMacintosh ? product_default.keyboardShortcutsUrlMac : product_default.keyboardShortcutsUrlWin);
  }
  constructor() {
    super({
      id: _KeybindingsReferenceAction.ID,
      title: {
        ...localize2(5965, "Keyboard Shortcuts Reference"),
        mnemonicTitle: localize(5967, null)
      },
      category: Categories.Help,
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: null,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 48 /* KeyR */)
      },
      menu: {
        id: MenuId.MenubarHelpMenu,
        group: "2_reference",
        order: 1
      }
    });
  }
  run(accessor) {
    const productService = accessor.get(IProductService);
    const openerService = accessor.get(IOpenerService);
    const url = isLinux ? productService.keyboardShortcutsUrlLinux : isMacintosh ? productService.keyboardShortcutsUrlMac : productService.keyboardShortcutsUrlWin;
    if (url) {
      openerService.open(URI.parse(url));
    }
  }
};

var OpenIntroductoryVideosUrlAction = class _OpenIntroductoryVideosUrlAction extends Action2 {
  static {
    this.ID = "workbench.action.openVideoTutorialsUrl";
  }
  static {
    this.AVAILABLE = !!product_default.introductoryVideosUrl;
  }
  constructor() {
    super({
      id: _OpenIntroductoryVideosUrlAction.ID,
      title: {
        ...localize2(5980, "Video Tutorials"),
        mnemonicTitle: localize(5972, null)
      },
      category: Categories.Help,
      f1: true,
      menu: {
        id: MenuId.MenubarHelpMenu,
        group: "2_reference",
        order: 2
      }
    });
  }
  run(accessor) {
    const productService = accessor.get(IProductService);
    const openerService = accessor.get(IOpenerService);
    if (productService.introductoryVideosUrl) {
      openerService.open(URI.parse(productService.introductoryVideosUrl));
    }
  }
};

var OpenTipsAndTricksUrlAction = class _OpenTipsAndTricksUrlAction extends Action2 {
  static {
    this.ID = "workbench.action.openTipsAndTricksUrl";
  }
  static {
    this.AVAILABLE = !!product_default.tipsAndTricksUrl;
  }
  constructor() {
    super({
      id: _OpenTipsAndTricksUrlAction.ID,
      title: {
        ...localize2(5978, "Tips and Tricks"),
        mnemonicTitle: localize(5970, null)
      },
      category: Categories.Help,
      f1: true,
      menu: {
        id: MenuId.MenubarHelpMenu,
        group: "2_reference",
        order: 3
      }
    });
  }
  run(accessor) {
    const productService = accessor.get(IProductService);
    const openerService = accessor.get(IOpenerService);
    if (productService.tipsAndTricksUrl) {
      openerService.open(URI.parse(productService.tipsAndTricksUrl));
    }
  }
};

var OpenDocumentationUrlAction = class _OpenDocumentationUrlAction extends Action2 {
  static {
    this.ID = "workbench.action.openDocumentationUrl";
  }
  static {
    this.AVAILABLE = !!(isWeb ? product_default.serverDocumentationUrl : product_default.documentationUrl);
  }
  constructor() {
    super({
      id: _OpenDocumentationUrlAction.ID,
      title: {
        ...localize2(5975, "Documentation"),
        mnemonicTitle: localize(5966, null)
      },
      category: Categories.Help,
      f1: true,
      menu: {
        id: MenuId.MenubarHelpMenu,
        group: "1_welcome",
        order: 3
      }
    });
  }
  run(accessor) {
    const productService = accessor.get(IProductService);
    const openerService = accessor.get(IOpenerService);
    const url = isWeb ? productService.serverDocumentationUrl : productService.documentationUrl;
    if (url) {
      openerService.open(URI.parse(url));
    }
  }
};

var OpenNewsletterSignupUrlAction = class _OpenNewsletterSignupUrlAction extends Action2 {
  static {
    this.ID = "workbench.action.openNewsletterSignupUrl";
  }
  static {
    this.AVAILABLE = !!product_default.newsletterSignupUrl;
  }
  constructor() {
    super({
      id: _OpenNewsletterSignupUrlAction.ID,
      title: localize2(5974, "Signup for the VS Code Newsletter"),
      category: Categories.Help,
      f1: true
    });
  }
  run(accessor) {
    const productService = accessor.get(IProductService);
    const openerService = accessor.get(IOpenerService);
    const telemetryService = accessor.get(ITelemetryService);
    openerService.open(URI.parse(`${productService.newsletterSignupUrl}?machineId=${encodeURIComponent(telemetryService.machineId)}`));
  }
};

var OpenYouTubeUrlAction = class _OpenYouTubeUrlAction extends Action2 {
  static {
    this.ID = "workbench.action.openYouTubeUrl";
  }
  static {
    this.AVAILABLE = !!product_default.youTubeUrl;
  }
  constructor() {
    super({
      id: _OpenYouTubeUrlAction.ID,
      title: {
        ...localize2(5981, "Join Us on YouTube"),
        mnemonicTitle: localize(5973, null)
      },
      category: Categories.Help,
      f1: true,
      menu: {
        id: MenuId.MenubarHelpMenu,
        group: "3_feedback",
        order: 1
      }
    });
  }
  run(accessor) {
    const productService = accessor.get(IProductService);
    const openerService = accessor.get(IOpenerService);
    if (productService.youTubeUrl) {
      openerService.open(URI.parse(productService.youTubeUrl));
    }
  }
};

var OpenRequestFeatureUrlAction = class _OpenRequestFeatureUrlAction extends Action2 {
  static {
    this.ID = "workbench.action.openRequestFeatureUrl";
  }
  static {
    this.AVAILABLE = !!product_default.requestFeatureUrl;
  }
  constructor() {
    super({
      id: _OpenRequestFeatureUrlAction.ID,
      title: {
        ...localize2(5979, "Search Feature Requests"),
        mnemonicTitle: localize(5971, null)
      },
      category: Categories.Help,
      f1: true,
      menu: {
        id: MenuId.MenubarHelpMenu,
        group: "3_feedback",
        order: 2
      }
    });
  }
  run(accessor) {
    const productService = accessor.get(IProductService);
    const openerService = accessor.get(IOpenerService);
    if (productService.requestFeatureUrl) {
      openerService.open(URI.parse(productService.requestFeatureUrl));
    }
  }
};

var OpenLicenseUrlAction = class _OpenLicenseUrlAction extends Action2 {
  static {
    this.ID = "workbench.action.openLicenseUrl";
  }
  static {
    this.AVAILABLE = !!(isWeb ? product_default.serverLicense : product_default.licenseUrl);
  }
  constructor() {
    super({
      id: _OpenLicenseUrlAction.ID,
      title: {
        ...localize2(5976, "View License"),
        mnemonicTitle: localize(5968, null)
      },
      category: Categories.Help,
      f1: true,
      menu: {
        id: MenuId.MenubarHelpMenu,
        group: "4_legal",
        order: 1
      }
    });
  }
  run(accessor) {
    const productService = accessor.get(IProductService);
    const openerService = accessor.get(IOpenerService);
    const url = isWeb ? productService.serverLicenseUrl : productService.licenseUrl;
    if (url) {
      if (language) {
        const queryArgChar = url.indexOf("?") > 0 ? "&" : "?";
        openerService.open(URI.parse(`${url}${queryArgChar}lang=${language}`));
      } else {
        openerService.open(URI.parse(url));
      }
    }
  }
};

var OpenPrivacyStatementUrlAction = class _OpenPrivacyStatementUrlAction extends Action2 {
  static {
    this.ID = "workbench.action.openPrivacyStatementUrl";
  }
  static {
    this.AVAILABLE = !!product_default.privacyStatementUrl;
  }
  constructor() {
    super({
      id: _OpenPrivacyStatementUrlAction.ID,
      title: {
        ...localize2(5977, "Privacy Statement"),
        mnemonicTitle: localize(5969, null)
      },
      category: Categories.Help,
      f1: true,
      menu: {
        id: MenuId.MenubarHelpMenu,
        group: "4_legal",
        order: 2
      }
    });
  }
  run(accessor) {
    const productService = accessor.get(IProductService);
    const openerService = accessor.get(IOpenerService);
    if (productService.privacyStatementUrl) {
      openerService.open(URI.parse(productService.privacyStatementUrl));
    }
  }
};

var GetStartedWithAccessibilityFeatures = class _GetStartedWithAccessibilityFeatures extends Action2 {
  static {
    this.ID = "workbench.action.getStartedWithAccessibilityFeatures";
  }
  constructor() {
    super({
      id: _GetStartedWithAccessibilityFeatures.ID,
      title: localize2(5964, "Get Started with Accessibility Features"),
      category: Categories.Help,
      f1: true,
      precondition: IsSessionsWindowContext.negate(),
      menu: {
        id: MenuId.MenubarHelpMenu,
        group: "1_welcome",
        order: 6,
        when: IsSessionsWindowContext.negate()
      }
    });
  }
  run(accessor) {
    const commandService = accessor.get(ICommandService);
    commandService.executeCommand("workbench.action.openWalkthrough", "SetupAccessibility");
  }
};

var AskVSCodeCopilot = class _AskVSCodeCopilot extends Action2 {
  static {
    this.ID = "workbench.action.askVScode";
  }
  constructor() {
    super({
      id: _AskVSCodeCopilot.ID,
      title: localize2(5963, "Ask @vscode"),
      category: Categories.Help,
      f1: true,
      precondition: ContextKeyExpr.and(ContextKeyExpr.equals("chatSetupHidden", false), ContextKeyExpr.equals("chatSetupDisabledInWorkspace", false), IsSessionsWindowContext.negate())
    });
  }
  async run(accessor) {
    const commandService = accessor.get(ICommandService);
    commandService.executeCommand("workbench.action.chat.open", { mode: "agent", query: "@vscode ", isPartialQuery: true });
  }
};

MenuRegistry.appendMenuItem(MenuId.MenubarHelpMenu, {
  command: {
    id: AskVSCodeCopilot.ID,
    title: localize2(5963, "Ask @vscode")
  },
  order: 7,
  group: "1_welcome",
  when: ContextKeyExpr.and(ContextKeyExpr.equals("chatSetupHidden", false), ContextKeyExpr.equals("chatSetupDisabledInWorkspace", false), IsSessionsWindowContext.negate())
});

if (KeybindingsReferenceAction.AVAILABLE) {
  registerAction2(KeybindingsReferenceAction);
}

if (OpenIntroductoryVideosUrlAction.AVAILABLE) {
  registerAction2(OpenIntroductoryVideosUrlAction);
}

if (OpenTipsAndTricksUrlAction.AVAILABLE) {
  registerAction2(OpenTipsAndTricksUrlAction);
}

if (OpenDocumentationUrlAction.AVAILABLE) {
  registerAction2(OpenDocumentationUrlAction);
}

if (OpenNewsletterSignupUrlAction.AVAILABLE) {
  registerAction2(OpenNewsletterSignupUrlAction);
}

if (OpenYouTubeUrlAction.AVAILABLE) {
  registerAction2(OpenYouTubeUrlAction);
}

if (OpenRequestFeatureUrlAction.AVAILABLE) {
  registerAction2(OpenRequestFeatureUrlAction);
}

if (OpenLicenseUrlAction.AVAILABLE) {
  registerAction2(OpenLicenseUrlAction);
}

if (OpenPrivacyStatementUrlAction.AVAILABLE) {
  registerAction2(OpenPrivacyStatementUrlAction);
}

registerAction2(GetStartedWithAccessibilityFeatures);

registerAction2(AskVSCodeCopilot);
export { KeybindingsReferenceAction, OpenIntroductoryVideosUrlAction, OpenTipsAndTricksUrlAction, OpenDocumentationUrlAction, OpenNewsletterSignupUrlAction, OpenYouTubeUrlAction, OpenRequestFeatureUrlAction, OpenLicenseUrlAction, OpenPrivacyStatementUrlAction, GetStartedWithAccessibilityFeatures, AskVSCodeCopilot };
