// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/textResourceEditor.ts
import { AbstractTextCodeEditor } from "./module-1542.mjs";
import { BaseTextEditorModel } from "./module-1099.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { isTextEditorViewState } from "./module-0926.mjs";
import { applyTextEditorOptions } from "./module-1525.mjs";
import { UntitledTextEditorInput } from "./module-1541.mjs";
import { TextResourceEditorInput } from "./module-1105.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IFileService } from "./module-0269.mjs";
import { PLAINTEXT_LANGUAGE_ID } from "./module-0141.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";


// src/vs/workbench/browser/parts/editor/textResourceEditor.ts
var AbstractTextResourceEditor = class extends AbstractTextCodeEditor {
  constructor(id2, group2, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorGroupService, editorService, fileService) {
    super(id2, group2, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService, fileService);
  }
  async setInput(input, options3, context2, token) {
    await super.setInput(input, options3, context2, token);
    const resolvedModel = await input.resolve();
    if (token.isCancellationRequested) {
      return void 0;
    }
    if (!(resolvedModel instanceof BaseTextEditorModel)) {
      throw new Error("Unable to open file as text");
    }
    const control = assertReturnsDefined(this.editorControl);
    const textEditorModel = resolvedModel.textEditorModel;
    control.setModel(textEditorModel);
    if (!isTextEditorViewState(options3?.viewState)) {
      const editorViewState = this.loadEditorViewState(input, context2);
      if (editorViewState) {
        if (options3?.selection) {
          editorViewState.cursorState = [];
        }
        control.restoreViewState(editorViewState);
      }
    }
    if (options3) {
      applyTextEditorOptions(options3, control, 1 /* Immediate */);
    }
    control.updateOptions(this.getReadonlyConfiguration(resolvedModel.isReadonly()));
  }
  /**
   * Reveals the last line of this editor if it has a model set.
   */
  revealLastLine() {
    const control = this.editorControl;
    if (!control) {
      return;
    }
    const model = control.getModel();
    if (model) {
      const lastLine = model.getLineCount();
      control.revealPosition({ lineNumber: lastLine, column: model.getLineMaxColumn(lastLine) }, 0 /* Smooth */);
    }
  }
  clearInput() {
    super.clearInput();
    this.editorControl?.setModel(null);
  }
  tracksEditorViewState(input) {
    return input instanceof UntitledTextEditorInput || input instanceof TextResourceEditorInput;
  }
};

AbstractTextResourceEditor = __decorateClass([
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, ITextResourceConfigurationService),
  __decorateParam(6, IThemeService),
  __decorateParam(7, IEditorGroupsService),
  __decorateParam(8, IEditorService),
  __decorateParam(9, IFileService)
], AbstractTextResourceEditor);

var TextResourceEditor = class extends AbstractTextResourceEditor {
  constructor(group2, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService, modelService, languageService, fileService) {
    super(TextResourceEditor.ID, group2, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorGroupService, editorService, fileService);
    this.modelService = modelService;
    this.languageService = languageService;
  }
  static {
    this.ID = "workbench.editors.textResourceEditor";
  }
  createEditorControl(parent, configuration2) {
    super.createEditorControl(parent, configuration2);
    const control = this.editorControl;
    if (control) {
      this._register(control.onDidPaste((e4) => this.onDidEditorPaste(e4, control)));
    }
  }
  onDidEditorPaste(e4, codeEditor) {
    if (this.input instanceof UntitledTextEditorInput && this.input.hasLanguageSetExplicitly) {
      return;
    }
    if (e4.range.startLineNumber !== 1 || e4.range.startColumn !== 1) {
      return;
    }
    if (codeEditor.getOption(104 /* readOnly */)) {
      return;
    }
    const textModel = codeEditor.getModel();
    if (!textModel) {
      return;
    }
    const pasteIsWholeContents = textModel.getLineCount() === e4.range.endLineNumber && textModel.getLineMaxColumn(e4.range.endLineNumber) === e4.range.endColumn;
    if (!pasteIsWholeContents) {
      return;
    }
    const currentLanguageId = textModel.getLanguageId();
    if (currentLanguageId !== PLAINTEXT_LANGUAGE_ID) {
      return;
    }
    let candidateLanguage = void 0;
    if (e4.languageId) {
      candidateLanguage = { id: e4.languageId, source: "event" };
    } else {
      const guess = this.languageService.guessLanguageIdByFilepathOrFirstLine(textModel.uri, textModel.getLineContent(1).substr(0, 1e3 /* FIRST_LINE_DETECTION_LENGTH_LIMIT */)) ?? void 0;
      if (guess) {
        candidateLanguage = { id: guess, source: "guess" };
      }
    }
    if (candidateLanguage && candidateLanguage.id !== PLAINTEXT_LANGUAGE_ID) {
      if (this.input instanceof UntitledTextEditorInput && candidateLanguage.source === "event") {
        this.input.setLanguageId(candidateLanguage.id);
      } else {
        textModel.setLanguage(this.languageService.createById(candidateLanguage.id));
      }
      const opts = this.modelService.getCreationOptions(textModel.getLanguageId(), textModel.uri, textModel.isForSimpleWidget);
      textModel.detectIndentation(opts.insertSpaces, opts.tabSize);
    }
  }
};

TextResourceEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, ITextResourceConfigurationService),
  __decorateParam(5, IThemeService),
  __decorateParam(6, IEditorService),
  __decorateParam(7, IEditorGroupsService),
  __decorateParam(8, IModelService),
  __decorateParam(9, ILanguageService),
  __decorateParam(10, IFileService)
], TextResourceEditor);
export { AbstractTextResourceEditor, TextResourceEditor };
