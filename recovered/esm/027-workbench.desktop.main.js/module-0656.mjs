// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/colorPicker/browser/standaloneColorPicker/standaloneColorPickerParticipant.ts
import { Disposable } from "./module-0012.mjs";
import { ColorPickerWidget } from "./module-0617.mjs";
import { createColorHover, updateColorPresentations, updateEditorModel } from "./module-0612.mjs";
import { ColorDetector } from "./module-0578.mjs";
import { getColors } from "./module-0577.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { Range2 } from "./module-0106.mjs";
import { Dimension } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";


// src/vs/editor/contrib/colorPicker/browser/standaloneColorPicker/standaloneColorPickerParticipant.ts
var StandaloneColorPickerHover = class _StandaloneColorPickerHover {
  constructor(owner, range2, model, provider) {
    this.owner = owner;
    this.range = range2;
    this.model = model;
    this.provider = provider;
  }
  static fromBaseColor(owner, color2) {
    return new _StandaloneColorPickerHover(owner, color2.range, color2.model, color2.provider);
  }
};

var StandaloneColorPickerRenderedParts = class extends Disposable {
  constructor(editor, context2, colorHover, themeService) {
    super();
    const editorModel = editor.getModel();
    const colorPickerModel = colorHover.model;
    this.color = colorHover.model.color;
    this.colorPicker = this._register(new ColorPickerWidget(
      context2.fragment,
      colorPickerModel,
      editor.getOption(163 /* pixelRatio */),
      themeService,
      "standalone" /* Standalone */
    ));
    this._register(colorPickerModel.onColorFlushed((color2) => {
      this.color = color2;
    }));
    this._register(colorPickerModel.onDidChangeColor((color2) => {
      updateColorPresentations(editorModel, colorPickerModel, color2, colorHover.range, colorHover);
    }));
    let editorUpdatedByColorPicker = false;
    this._register(editor.onDidChangeModelContent((e) => {
      if (editorUpdatedByColorPicker) {
        editorUpdatedByColorPicker = false;
      } else {
        context2.hide();
        editor.focus();
      }
    }));
    updateColorPresentations(editorModel, colorPickerModel, this.color, colorHover.range, colorHover);
  }
};

var StandaloneColorPickerParticipant = class {
  constructor(_editor, _themeService) {
    this._editor = _editor;
    this._themeService = _themeService;
    this.hoverOrdinal = 2;
  }
  async createColorHover(defaultColorInfo, defaultColorProvider, colorProviderRegistry) {
    if (!this._editor.hasModel()) {
      return null;
    }
    const colorDetector = ColorDetector.get(this._editor);
    if (!colorDetector) {
      return null;
    }
    const colors = await getColors(colorProviderRegistry, this._editor.getModel(), CancellationToken.None);
    let foundColorInfo = null;
    let foundColorProvider = null;
    for (const colorData of colors) {
      const colorInfo2 = colorData.colorInfo;
      if (Range2.containsRange(colorInfo2.range, defaultColorInfo.range)) {
        foundColorInfo = colorInfo2;
        foundColorProvider = colorData.provider;
      }
    }
    const colorInfo = foundColorInfo ?? defaultColorInfo;
    const colorProvider = foundColorProvider ?? defaultColorProvider;
    const foundInEditor = !!foundColorInfo;
    const colorHover = StandaloneColorPickerHover.fromBaseColor(this, await createColorHover(this._editor.getModel(), colorInfo, colorProvider));
    return { colorHover, foundInEditor };
  }
  async updateEditorModel(colorHoverData, insertionRanges) {
    if (!this._editor.hasModel()) {
      return;
    }
    const colorPickerModel = colorHoverData.model;
    let range2 = new Range2(colorHoverData.range.startLineNumber, colorHoverData.range.startColumn, colorHoverData.range.endLineNumber, colorHoverData.range.endColumn);
    if (this._color) {
      await updateColorPresentations(this._editor.getModel(), colorPickerModel, this._color, range2, colorHoverData);
      range2 = updateEditorModel(this._editor, range2, colorPickerModel, insertionRanges);
    }
  }
  renderHoverParts(context2, hoverParts) {
    if (hoverParts.length === 0 || !this._editor.hasModel()) {
      return void 0;
    }
    this._setMinimumDimensions(context2);
    this._renderedParts = new StandaloneColorPickerRenderedParts(this._editor, context2, hoverParts[0], this._themeService);
    return this._renderedParts;
  }
  _setMinimumDimensions(context2) {
    const minimumHeight = this._editor.getOption(75 /* lineHeight */) + 8;
    context2.setMinimumDimensions(new Dimension(302, minimumHeight));
  }
  get _color() {
    return this._renderedParts?.color;
  }
};

StandaloneColorPickerParticipant = __decorateClass([
  __decorateParam(1, IThemeService)
], StandaloneColorPickerParticipant);
export { StandaloneColorPickerHover, StandaloneColorPickerRenderedParts, StandaloneColorPickerParticipant };
