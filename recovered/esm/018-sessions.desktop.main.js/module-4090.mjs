// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/electron-browser/extensions.contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { IExtensionHostProfileService, OpenExtensionHostProfileACtion, RuntimeExtensionsEditor, SaveExtensionHostProfileAction, StartExtensionHostProfileAction, StopExtensionHostProfileAction } from "./module-4077.mjs";
import { ExtensionHostProfileService } from "./module-4082.mjs";
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0926.mjs";
import { EditorPaneDescriptor } from "./module-1085.mjs";
import { localize } from "./module-0001.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { RuntimeExtensionsInput } from "./module-4073.mjs";
import { Disposable } from "./module-0012.mjs";
import { ExtensionRecommendationNotificationServiceChannel } from "./module-4080.mjs";
import { registerAction2 } from "./module-0092.mjs";
import { CleanUpExtensionsFolderAction, OpenExtensionsFolderAction } from "./module-4083.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionRecommendationNotificationService } from "./module-3018.mjs";
import { ISharedProcessService } from "./module-3826.mjs";
import { Extensions10 } from "./module-0872.mjs";
import { ExtensionsAutoProfiler } from "./module-4086.mjs";
import { InstallRemoteExtensionsContribution, RemoteExtensionsInitializerContribution } from "./module-4089.mjs";
import { DebugExtensionHostAndRendererAction, DebugExtensionHostInNewWindowAction, DebugExtensionsContribution, DebugRendererInNewWindowAction } from "./module-4078.mjs";
import { ShowRuntimeExtensionsAction } from "./module-4074.mjs";


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

var ExtensionsContributions = class extends Disposable {
  constructor(extensionRecommendationNotificationService, sharedProcessService) {
    super();
    sharedProcessService.registerChannel("extensionRecommendationNotification", new ExtensionRecommendationNotificationServiceChannel(extensionRecommendationNotificationService));
    this._register(registerAction2(OpenExtensionsFolderAction));
    this._register(registerAction2(CleanUpExtensionsFolderAction));
  }
};

ExtensionsContributions = __decorateClass([
  __decorateParam(0, IExtensionRecommendationNotificationService),
  __decorateParam(1, ISharedProcessService)
], ExtensionsContributions);

var workbenchRegistry7 = Registry.as(Extensions10.Workbench);

workbenchRegistry7.registerWorkbenchContribution(ExtensionsContributions, 3 /* Restored */);

workbenchRegistry7.registerWorkbenchContribution(ExtensionsAutoProfiler, 4 /* Eventually */);

workbenchRegistry7.registerWorkbenchContribution(RemoteExtensionsInitializerContribution, 3 /* Restored */);

workbenchRegistry7.registerWorkbenchContribution(InstallRemoteExtensionsContribution, 3 /* Restored */);

workbenchRegistry7.registerWorkbenchContribution(DebugExtensionsContribution, 3 /* Restored */);

registerAction2(DebugExtensionHostInNewWindowAction);

registerAction2(DebugRendererInNewWindowAction);

registerAction2(DebugExtensionHostAndRendererAction);

registerAction2(StartExtensionHostProfileAction);

registerAction2(StopExtensionHostProfileAction);

registerAction2(SaveExtensionHostProfileAction);

registerAction2(OpenExtensionHostProfileACtion);

registerAction2(ShowRuntimeExtensionsAction);
export { RuntimeExtensionsInputSerializer, ExtensionsContributions, workbenchRegistry7 };
