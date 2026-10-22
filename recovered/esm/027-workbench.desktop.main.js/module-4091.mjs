// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/browserView.contribution.ts
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0925.mjs";
import { EditorPaneDescriptor } from "./module-1084.mjs";
import { BrowserEditor } from "./module-4048.mjs";
import { BrowserEditorInput, BrowserEditorSerializer } from "./module-1490.mjs";
import { localize } from "./module-0001.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { Schemas } from "./module-0033.mjs";
import { BrowserViewUri } from "./module-1488.mjs";
import { logBrowserOpen } from "./module-1489.mjs";
import { generateUuid } from "./module-0190.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorResolverService } from "./module-1113.mjs";
import { IBrowserViewCDPService, IBrowserViewWorkbenchService } from "./module-1243.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { BrowserViewWorkbenchService } from "./module-4051.mjs";
import { BrowserViewCDPService } from "./module-4053.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/browserView.contribution.ts
function getBrowserViewStateUrl(viewState) {
  const url = Object.entries(viewState ?? {}).find(([key3]) => key3 === "url")?.[1];
  return typeof url === "string" ? url : void 0;
}

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    BrowserEditor,
    BrowserEditorInput.EDITOR_ID,
    localize(7991, null)
  ),
  [
    new SyncDescriptor(BrowserEditorInput)
  ]
);

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(
  BrowserEditorInput.ID,
  BrowserEditorSerializer
);

var BrowserEditorResolverContribution = class {
  static {
    this.ID = "workbench.contrib.browserEditorResolver";
  }
  constructor(editorResolverService, browserViewWorkbenchService, telemetryService) {
    editorResolverService.registerEditor(
      `${Schemas.vscodeBrowser}:/**`,
      {
        id: BrowserEditorInput.EDITOR_ID,
        label: localize(7991, null),
        priority: "exclusive" /* exclusive */
      },
      {
        canSupportResource: (resource) => resource.scheme === Schemas.vscodeBrowser,
        singlePerResource: true
      },
      {
        createEditorInput: ({ resource, options: options3 }) => {
          const parsed = BrowserViewUri.parse(resource);
          if (!parsed) {
            throw new Error(`Invalid browser view resource: ${resource.toString()}`);
          }
          const browserInput = browserViewWorkbenchService.getOrCreateLazy({
            id: parsed.id,
            ...options3?.viewState
          });
          void browserInput.resolve();
          return {
            editor: browserInput,
            options: {
              pinned: !!browserInput.url,
              // pin if navigated
              ...options3
            }
          };
        }
      }
    );
    for (const extension of ["html", "htm"]) {
      editorResolverService.registerEditor(
        `${Schemas.file}:/**/*.${extension}`,
        {
          id: BrowserEditorInput.EDITOR_ID,
          label: localize(7992, null),
          priority: "option" /* option */
        },
        {
          canSupportResource: (resource) => resource.scheme === Schemas.file,
          singlePerResource: true
        },
        {
          createEditorInput: ({ resource, options: options3 }) => {
            logBrowserOpen(telemetryService, "fileResource");
            const viewState = options3?.viewState;
            const browserInput = browserViewWorkbenchService.getOrCreateLazy({
              id: generateUuid(),
              associatedResource: resource,
              ...viewState,
              url: getBrowserViewStateUrl(viewState) ?? resource.toString()
            });
            void browserInput.resolve();
            return {
              editor: browserInput,
              options: {
                pinned: true,
                ...options3
              }
            };
          }
        }
      );
    }
  }
};

BrowserEditorResolverContribution = __decorateClass([
  __decorateParam(0, IEditorResolverService),
  __decorateParam(1, IBrowserViewWorkbenchService),
  __decorateParam(2, ITelemetryService)
], BrowserEditorResolverContribution);

registerWorkbenchContribution2(BrowserEditorResolverContribution.ID, BrowserEditorResolverContribution, WorkbenchPhase.BlockStartup);

registerSingleton(IBrowserViewWorkbenchService, BrowserViewWorkbenchService, 1 /* Delayed */);

registerSingleton(IBrowserViewCDPService, BrowserViewCDPService, 1 /* Delayed */);
export { getBrowserViewStateUrl, BrowserEditorResolverContribution };
