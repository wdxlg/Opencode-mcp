// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/share/browser/share.contribution.ts
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ShareProviderCountContext, ShareService } from "./module-3674.mjs";
import { WorkspaceFolderCountContext } from "./module-0949.mjs";
import { IShareService } from "./module-1438.mjs";
import { IEditorService } from "./module-0934.mjs";
import { EditorResourceAccessor } from "./module-0925.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IProgressService } from "./module-0446.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { Severity2 } from "./module-0336.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0870.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { workbenchConfigurationNodeBase } from "./module-1112.mjs";


// src/vs/workbench/contrib/share/browser/share.contribution.ts
var targetMenus = [
  MenuId.EditorContextShare,
  MenuId.SCMResourceContextShare,
  MenuId.OpenEditorsContextShare,
  MenuId.EditorTitleContextShare,
  MenuId.MenubarShare,
  // MenuId.EditorLineNumberContext, // todo@joyceerhl add share
  MenuId.ExplorerContextShare
];

var ShareWorkbenchContribution = class extends Disposable {
  constructor(shareService, configurationService) {
    super();
    this.shareService = shareService;
    this.configurationService = configurationService;
    if (this.configurationService.getValue(ShareWorkbenchContribution.SHARE_ENABLED_SETTING)) {
      this.registerActions();
    }
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(ShareWorkbenchContribution.SHARE_ENABLED_SETTING)) {
        const settingValue = this.configurationService.getValue(ShareWorkbenchContribution.SHARE_ENABLED_SETTING);
        if (settingValue === true && this._disposables === void 0) {
          this.registerActions();
        } else if (settingValue === false && this._disposables !== void 0) {
          this._disposables?.clear();
          this._disposables = void 0;
        }
      }
    }));
  }
  static {
    this.SHARE_ENABLED_SETTING = "workbench.experimental.share.enabled";
  }
  dispose() {
    super.dispose();
    this._disposables?.dispose();
  }
  registerActions() {
    if (!this._disposables) {
      this._disposables = new DisposableStore();
    }
    this._disposables.add(
      registerAction2(class ShareAction extends Action2 {
        static {
          this.ID = "workbench.action.share";
        }
        static {
          this.LABEL = localize2(19313, "Share...");
        }
        constructor() {
          super({
            id: ShareAction.ID,
            title: ShareAction.LABEL,
            f1: true,
            icon: Codicon.linkExternal,
            precondition: ContextKeyExpr.and(ShareProviderCountContext.notEqualsTo(0), WorkspaceFolderCountContext.notEqualsTo(0)),
            keybinding: {
              weight: 200 /* WorkbenchContrib */,
              primary: 512 /* Alt */ | 2048 /* CtrlCmd */ | 49 /* KeyS */
            },
            menu: [
              { id: MenuId.CommandCenter, order: 3 }
            ]
          });
        }
        async run(accessor, ...args2) {
          const shareService = accessor.get(IShareService);
          const activeEditor = accessor.get(IEditorService)?.activeEditor;
          const resourceUri = (activeEditor && EditorResourceAccessor.getOriginalUri(activeEditor, { supportSideBySide: 1 /* PRIMARY */ })) ?? accessor.get(IWorkspaceContextService).getWorkspace().folders[0].uri;
          const clipboardService = accessor.get(IClipboardService);
          const dialogService = accessor.get(IDialogService);
          const urlService = accessor.get(IOpenerService);
          const progressService = accessor.get(IProgressService);
          const selection = accessor.get(ICodeEditorService).getActiveCodeEditor()?.getSelection() ?? void 0;
          const result = await progressService.withProgress({
            location: 10 /* Window */,
            detail: localize(19311, null)
          }, async () => shareService.provideShare({ resourceUri, selection }, CancellationToken.None));
          if (result) {
            const uriText = result.toString();
            const isResultText = typeof result === "string";
            await clipboardService.writeText(uriText);
            dialogService.prompt(
              {
                type: Severity2.Info,
                message: isResultText ? localize(19315, null) : localize(19314, null),
                custom: {
                  icon: Codicon.check,
                  markdownDetails: [{
                    markdown: new MarkdownString(`<div aria-label='${uriText}'>${uriText}</div>`, { supportHtml: true }),
                    classes: [isResultText ? "share-dialog-input-text" : "share-dialog-input-link"]
                  }]
                },
                cancelButton: localize(19309, null),
                buttons: isResultText ? [] : [{ label: localize(19312, null), run: () => {
                  urlService.open(result, { openExternal: true });
                } }]
              }
            );
          }
        }
      })
    );
    const actions = this.shareService.getShareActions();
    for (const menuId of targetMenus) {
      for (const action of actions) {
        this._disposables.add(MenuRegistry.appendMenuItem(menuId, action));
      }
    }
  }
};

ShareWorkbenchContribution = __decorateClass([
  __decorateParam(0, IShareService),
  __decorateParam(1, IConfigurationService)
], ShareWorkbenchContribution);

registerSingleton(IShareService, ShareService, 1 /* Delayed */);

var workbenchContributionsRegistry7 = Registry.as(Extensions10.Workbench);

workbenchContributionsRegistry7.registerWorkbenchContribution(ShareWorkbenchContribution, 4 /* Eventually */);

Registry.as(Extensions4.Configuration).registerConfiguration({
  ...workbenchConfigurationNodeBase,
  properties: {
    "workbench.experimental.share.enabled": {
      type: "boolean",
      default: false,
      tags: ["experimental"],
      markdownDescription: localize(19310, null, "`#window.commandCenter#`", "`true`"),
      restricted: false
    }
  }
});
export { targetMenus, ShareWorkbenchContribution, workbenchContributionsRegistry7 };
