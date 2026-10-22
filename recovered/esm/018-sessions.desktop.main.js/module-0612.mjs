// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/colorPicker/browser/colorPickerParticipantUtils.ts
import { Color, RGBA } from "./module-0197.mjs";
import { getColorPresentations } from "./module-0577.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { ColorPickerModel } from "./module-0611.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/editor/contrib/colorPicker/browser/colorPickerParticipantUtils.ts
async function createColorHover(editorModel, colorInfo, provider) {
  const originalText = editorModel.getValueInRange(colorInfo.range);
  const { red, green, blue, alpha } = colorInfo.color;
  const rgba = new RGBA(Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255), alpha);
  const color2 = new Color(rgba);
  const colorPresentations = await getColorPresentations(editorModel, colorInfo, provider, CancellationToken.None);
  const model = new ColorPickerModel(color2, [], 0);
  model.colorPresentations = colorPresentations || [];
  model.guessColorPresentation(color2, originalText);
  return {
    range: Range2.lift(colorInfo.range),
    model,
    provider
  };
}

function updateEditorModel(editor, range2, model, insertionRanges) {
  const textEdits = [];
  const edit3 = model.presentation.textEdit ?? { range: range2, text: model.presentation.label, forceMoveMarkers: false };
  if (model.presentation.additionalTextEdits) {
    textEdits.push(...model.presentation.additionalTextEdits);
  }
  const replaceRange = Range2.lift(edit3.range);
  const trackedRange = editor.getModel()._setTrackedRange(null, replaceRange, 3 /* GrowsOnlyWhenTypingAfter */);
  if (insertionRanges) {
    textEdits.push(...insertionRanges.map((insertionRange) => ({ range: insertionRange, text: edit3.text, forceMoveMarkers: false })));
  } else {
    textEdits.push(edit3);
  }
  editor.executeEdits("colorpicker", textEdits);
  editor.pushUndoStop();
  return editor.getModel()._getTrackedRange(trackedRange) ?? replaceRange;
}

async function updateColorPresentations(editorModel, colorPickerModel, color2, range2, colorHover) {
  const colorPresentations = await getColorPresentations(editorModel, {
    range: range2,
    color: {
      red: color2.rgba.r / 255,
      green: color2.rgba.g / 255,
      blue: color2.rgba.b / 255,
      alpha: color2.rgba.a
    }
  }, colorHover.provider, CancellationToken.None);
  colorPickerModel.colorPresentations = colorPresentations || [];
}
export { createColorHover, updateEditorModel, updateColorPresentations };
