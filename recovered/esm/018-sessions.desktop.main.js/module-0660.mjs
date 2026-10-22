// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/colorPicker/browser/colorPickerContribution.ts
import { registerEditorAction, registerEditorContribution } from "./module-0097.mjs";
import { HideStandaloneColorPicker, InsertColorWithStandaloneColorPicker, ShowOrFocusStandaloneColorPicker } from "./module-0659.mjs";
import { registerAction2 } from "./module-0092.mjs";
import { HoverColorPickerContribution } from "./module-0655.mjs";
import { StandaloneColorPickerController } from "./module-0658.mjs";
import { ColorDetector } from "./module-0578.mjs";
import { registerEditorFeature } from "./module-0574.mjs";
import { DefaultDocumentColorProviderFeature } from "./module-0576.mjs";
import { HoverParticipantRegistry } from "./module-0575.mjs";
import { HoverColorPickerParticipant } from "./module-0618.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { URI } from "./module-0032.mjs";
import { illegalArgument } from "./module-0004.mjs";
import { ColorPresentationsCollector, ExtColorDataCollector, _findColorData, _setupColorCommand } from "./module-0577.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/editor/contrib/colorPicker/browser/colorPickerContribution.ts
registerEditorAction(HideStandaloneColorPicker);

registerEditorAction(InsertColorWithStandaloneColorPicker);

registerAction2(ShowOrFocusStandaloneColorPicker);

registerEditorContribution(HoverColorPickerContribution.ID, HoverColorPickerContribution, 2 /* BeforeFirstInteraction */);

registerEditorContribution(StandaloneColorPickerController.ID, StandaloneColorPickerController, 1 /* AfterFirstRender */);

registerEditorContribution(ColorDetector.ID, ColorDetector, 1 /* AfterFirstRender */);

registerEditorFeature(DefaultDocumentColorProviderFeature);

HoverParticipantRegistry.register(HoverColorPickerParticipant);

CommandsRegistry.registerCommand("_executeDocumentColorProvider", function(accessor, ...args2) {
  const [resource] = args2;
  if (!(resource instanceof URI)) {
    throw illegalArgument();
  }
  const { model, colorProviderRegistry, defaultColorDecoratorsEnablement } = _setupColorCommand(accessor, resource);
  return _findColorData(new ExtColorDataCollector(), colorProviderRegistry, model, CancellationToken.None, defaultColorDecoratorsEnablement);
});

CommandsRegistry.registerCommand("_executeColorPresentationProvider", function(accessor, ...args2) {
  const [color2, context2] = args2;
  if (!context2) {
    return;
  }
  const { uri: uri4, range: range2 } = context2;
  if (!(uri4 instanceof URI) || !Array.isArray(color2) || color2.length !== 4 || !Range2.isIRange(range2)) {
    throw illegalArgument();
  }
  const { model, colorProviderRegistry, defaultColorDecoratorsEnablement } = _setupColorCommand(accessor, uri4);
  const [red, green, blue, alpha] = color2;
  return _findColorData(new ColorPresentationsCollector({ range: range2, color: { red, green, blue, alpha } }), colorProviderRegistry, model, CancellationToken.None, defaultColorDecoratorsEnablement);
});
export {};
