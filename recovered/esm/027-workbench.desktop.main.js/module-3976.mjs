// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/electron-browser/extensions.contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { IExtensionHostProfileService, OpenExtensionHostProfileACtion, RuntimeExtensionsEditor, SaveExtensionHostProfileAction, StartExtensionHostProfileAction, StopExtensionHostProfileAction } from "./module-3965.mjs";
import { ExtensionHostProfileService } from "./module-3968.mjs";
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0925.mjs";
import { EditorPaneDescriptor } from "./module-1084.mjs";
import { localize } from "./module-0001.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { RuntimeExtensionsInput } from "./module-3960.mjs";
import { Disposable } from "./module-0012.mjs";
import { ExtensionRecommendationNotificationServiceChannel } from "./module-3959.mjs";
import { registerAction2 } from "./module-0092.mjs";
import { CleanUpExtensionsFolderAction, OpenExtensionsFolderAction } from "./module-3969.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionRecommendationNotificationService } from "./module-2916.mjs";
import { ISharedProcessService } from "./module-3729.mjs";
import { Extensions10 } from "./module-0870.mjs";
import { ExtensionsAutoProfiler } from "./module-3972.mjs";
import { InstallRemoteExtensionsContribution, RemoteExtensionsInitializerContribution } from "./module-3975.mjs";
import { DebugExtensionHostAndRendererAction, DebugExtensionHostInNewWindowAction, DebugExtensionsContribution, DebugRendererInNewWindowAction } from "./module-3966.mjs";
import { ShowRuntimeExtensionsAction } from "./module-3962.mjs";


// src/vs/workbench/contrib/extensions/electron-browser/extensions.contribution.ts
registerSingleton(IExtensionHostProfileService, ExtensionHostProfileService, 1 /* Delayed */);

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(RuntimeExtensionsEditor, RuntimeExtensionsEditor.ID, localize(15634, null)),
  [new SyncDescriptor(RuntimeExtensionsInput)]
);

var RuntimeExtensionsInputSerializer = class {
  canSerialize(editorInput) {
    return true;
  }
  serialize(editorInput) {
    return "";
  }
  deserialize(instantiationService) {
    return RuntimeExtensionsInput.instance;
  }
};

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(RuntimeExtensionsInput.ID, RuntimeExtensionsInputSerializer);

var ExtensionsContributions2 = class extends Disposable {
  constructor(extensionRecommendationNotificationService, sharedProcessService) {
    super();
    sharedProcessService.registerChannel("extensionRecommendationNotification", new ExtensionRecommendationNotificationServiceChannel(extensionRecommendationNotificationService));
    this._register(registerAction2(OpenExtensionsFolderAction));
    this._register(registerAction2(CleanUpExtensionsFolderAction));
  }
};

ExtensionsContributions2 = __decorateClass([
  __decorateParam(0, IExtensionRecommendationNotificationService),
  __decorateParam(1, ISharedProcessService)
], ExtensionsContributions2);

var workbenchRegistry10 = Registry.as(Extensions10.Workbench);

workbenchRegistry10.registerWorkbenchContribution(ExtensionsContributions2, 3 /* Restored */);

workbenchRegistry10.registerWorkbenchContribution(ExtensionsAutoProfiler, 4 /* Eventually */);

workbenchRegistry10.registerWorkbenchContribution(RemoteExtensionsInitializerContribution, 3 /* Restored */);

workbenchRegistry10.registerWorkbenchContribution(InstallRemoteExtensionsContribution, 3 /* Restored */);

workbenchRegistry10.registerWorkbenchContribution(DebugExtensionsContribution, 3 /* Restored */);

registerAction2(DebugExtensionHostInNewWindowAction);

registerAction2(DebugRendererInNewWindowAction);

registerAction2(DebugExtensionHostAndRendererAction);

registerAction2(StartExtensionHostProfileAction);

registerAction2(StopExtensionHostProfileAction);

registerAction2(SaveExtensionHostProfileAction);

registerAction2(OpenExtensionHostProfileACtion);

registerAction2(ShowRuntimeExtensionsAction);
export { RuntimeExtensionsInputSerializer, ExtensionsContributions2, workbenchRegistry10 };
