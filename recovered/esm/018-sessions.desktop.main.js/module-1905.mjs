// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/controller/cellOutputActions.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { NOTEBOOK_CELL_HAS_HIDDEN_OUTPUTS, NOTEBOOK_CELL_HAS_OUTPUTS, NOTEBOOK_CELL_OUTPUT_MIMETYPE } from "./module-1844.mjs";
import { NOTEBOOK_ACTIONS_CATEGORY } from "./module-1845.mjs";
import { copyIcon, saveIcon } from "./module-1846.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { ILogService } from "./module-0095.mjs";
import { copyCellOutput } from "./module-1889.mjs";
import { getNotebookEditorFromEditorPane } from "./module-0942.mjs";
import { INotebookEditorModelResolverService } from "./module-0928.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { CellUri } from "./module-0911.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { IFileService } from "./module-0269.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/notebook/browser/controller/cellOutputActions.ts
var COPY_OUTPUT_COMMAND_ID = "notebook.cellOutput.copy";

registerAction2(class ShowAllOutputsAction extends Action2 {
  constructor() {
    super({
      id: "notebook.cellOuput.showEmptyOutputs",
      title: localize(17520, null),
      menu: {
        id: MenuId.NotebookOutputToolbar,
        when: ContextKeyExpr.and(NOTEBOOK_CELL_HAS_OUTPUTS, NOTEBOOK_CELL_HAS_HIDDEN_OUTPUTS)
      },
      f1: false,
      category: NOTEBOOK_ACTIONS_CATEGORY
    });
  }
  run(accessor, context2) {
    const cell = context2.cell;
    if (cell && cell.cellKind === 2 /* Code */) {
      for (let i2 = 1; i2 < cell.outputsViewModels.length; i2++) {
        if (!cell.outputsViewModels[i2].visible.get()) {
          cell.outputsViewModels[i2].setVisible(true, true);
          cell.updateOutputHeight(i2, 1, "command");
        }
      }
    }
  }
});

registerAction2(class CopyCellOutputAction extends Action2 {
  constructor() {
    super({
      id: COPY_OUTPUT_COMMAND_ID,
      title: localize(17516, null),
      menu: {
        id: MenuId.NotebookOutputToolbar,
        when: NOTEBOOK_CELL_HAS_OUTPUTS
      },
      category: NOTEBOOK_ACTIONS_CATEGORY,
      icon: copyIcon
    });
  }
  async run(accessor, outputContext) {
    const editorService = accessor.get(IEditorService);
    const clipboardService = accessor.get(IClipboardService);
    const logService = accessor.get(ILogService);
    const notebookEditor = getNotebookEditorFromContext(editorService, outputContext);
    if (!notebookEditor) {
      return;
    }
    const outputViewModel = getOutputViewModelFromContext(outputContext, notebookEditor);
    if (!outputViewModel) {
      return;
    }
    const mimeType = outputViewModel.pickedMimeType?.mimeType;
    if (mimeType?.startsWith("image/")) {
      const focusOptions = { skipReveal: true, outputId: outputViewModel.model.outputId, altOutputId: outputViewModel.model.alternativeOutputId };
      await notebookEditor.focusNotebookCell(outputViewModel.cellViewModel, "output", focusOptions);
      notebookEditor.copyOutputImage(outputViewModel);
    } else {
      copyCellOutput(mimeType, outputViewModel, clipboardService, logService);
    }
  }
});

function getOutputViewModelFromId(outputId, notebookEditor) {
  const notebookViewModel = notebookEditor.getViewModel();
  if (notebookViewModel) {
    const codeCells = notebookViewModel.viewCells.filter((cell) => cell.cellKind === 2 /* Code */);
    for (const cell of codeCells) {
      const output = cell.outputsViewModels.find((output2) => output2.model.outputId === outputId || output2.model.alternativeOutputId === outputId);
      if (output) {
        return output;
      }
    }
  }
  return void 0;
}

function getNotebookEditorFromContext(editorService, outputContext) {
  if (outputContext && "notebookEditor" in outputContext) {
    return outputContext.notebookEditor;
  }
  return getNotebookEditorFromEditorPane(editorService.activeEditorPane);
}

function getOutputViewModelFromContext(outputContext, notebookEditor) {
  let outputViewModel;
  if (outputContext && "outputId" in outputContext && typeof outputContext.outputId === "string") {
    outputViewModel = getOutputViewModelFromId(outputContext.outputId, notebookEditor);
  } else if (outputContext && "outputViewModel" in outputContext) {
    outputViewModel = outputContext.outputViewModel;
  }
  if (!outputViewModel) {
    const activeCell = notebookEditor.getActiveCell();
    if (!activeCell) {
      return void 0;
    }
    if (activeCell.focusedOutputId !== void 0) {
      outputViewModel = activeCell.outputsViewModels.find((output) => {
        return output.model.outputId === activeCell.focusedOutputId;
      });
    } else {
      outputViewModel = activeCell.outputsViewModels.find((output) => output.pickedMimeType?.isTrusted);
    }
  }
  return outputViewModel;
}

var OPEN_OUTPUT_COMMAND_ID = "notebook.cellOutput.openInTextEditor";

registerAction2(class OpenCellOutputInEditorAction extends Action2 {
  constructor() {
    super({
      id: OPEN_OUTPUT_COMMAND_ID,
      title: localize(17517, null),
      f1: false,
      category: NOTEBOOK_ACTIONS_CATEGORY,
      icon: copyIcon
    });
  }
  async run(accessor, outputContext) {
    const editorService = accessor.get(IEditorService);
    const notebookModelService = accessor.get(INotebookEditorModelResolverService);
    const openerService = accessor.get(IOpenerService);
    const notebookEditor = getNotebookEditorFromContext(editorService, outputContext);
    if (!notebookEditor) {
      return;
    }
    const outputViewModel = getOutputViewModelFromContext(outputContext, notebookEditor);
    if (outputViewModel?.model.outputId && notebookEditor.textModel?.uri) {
      const ref = await notebookModelService.resolve(notebookEditor.textModel.uri);
      await openerService.open(CellUri.generateCellOutputUriWithId(notebookEditor.textModel.uri, outputViewModel.model.outputId));
      ref.dispose();
    }
  }
});

var SAVE_OUTPUT_IMAGE_COMMAND_ID = "notebook.cellOutput.saveImage";

registerAction2(class SaveCellOutputImageAction extends Action2 {
  constructor() {
    super({
      id: SAVE_OUTPUT_IMAGE_COMMAND_ID,
      title: localize(17519, null),
      menu: {
        id: MenuId.NotebookOutputToolbar,
        when: ContextKeyExpr.regex(NOTEBOOK_CELL_OUTPUT_MIMETYPE.key, /^image\//)
      },
      f1: false,
      category: NOTEBOOK_ACTIONS_CATEGORY,
      icon: saveIcon
    });
  }
  async run(accessor, outputContext) {
    const editorService = accessor.get(IEditorService);
    const fileDialogService = accessor.get(IFileDialogService);
    const fileService = accessor.get(IFileService);
    const logService = accessor.get(ILogService);
    const notebookEditor = getNotebookEditorFromContext(editorService, outputContext);
    if (!notebookEditor) {
      return;
    }
    const outputViewModel = getOutputViewModelFromContext(outputContext, notebookEditor);
    if (!outputViewModel) {
      return;
    }
    const mimeType = outputViewModel.pickedMimeType?.mimeType;
    if (!mimeType?.startsWith("image/")) {
      return;
    }
    const outputItem = outputViewModel.model.outputs.find((output) => output.mime === mimeType);
    if (!outputItem) {
      logService.error("Could not find output item with mime type", mimeType);
      return;
    }
    const mimeToExt = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/gif": "gif",
      "image/svg+xml": "svg",
      "image/webp": "webp",
      "image/bmp": "bmp",
      "image/tiff": "tiff"
    };
    const extension = mimeToExt[mimeType] || "png";
    const defaultFileName2 = `image.${extension}`;
    const defaultUri = notebookEditor.textModel?.uri ? URI.joinPath(URI.file(notebookEditor.textModel.uri.fsPath), "..", defaultFileName2) : void 0;
    const uri4 = await fileDialogService.showSaveDialog({
      defaultUri,
      filters: [{
        name: localize(17515, null),
        extensions: [extension]
      }]
    });
    if (!uri4) {
      return;
    }
    try {
      const imageData = outputItem.data;
      await fileService.writeFile(uri4, imageData);
      logService.info("Saved image output to", uri4.toString());
    } catch (error) {
      logService.error("Failed to save image output", error);
    }
  }
});

var OPEN_OUTPUT_IN_OUTPUT_PREVIEW_COMMAND_ID = "notebook.cellOutput.openInOutputPreview";

registerAction2(class OpenCellOutputInNotebookOutputEditorAction extends Action2 {
  constructor() {
    super({
      id: OPEN_OUTPUT_IN_OUTPUT_PREVIEW_COMMAND_ID,
      title: localize(17518, null),
      menu: {
        id: MenuId.NotebookOutputToolbar,
        when: ContextKeyExpr.and(NOTEBOOK_CELL_HAS_OUTPUTS, ContextKeyExpr.equals("config.notebook.output.openInPreviewEditor.enabled", true))
      },
      f1: false,
      category: NOTEBOOK_ACTIONS_CATEGORY
    });
  }
  async run(accessor, outputContext) {
    const editorService = accessor.get(IEditorService);
    const openerService = accessor.get(IOpenerService);
    const notebookEditor = getNotebookEditorFromContext(editorService, outputContext);
    if (!notebookEditor) {
      return;
    }
    const outputViewModel = getOutputViewModelFromContext(outputContext, notebookEditor);
    if (!outputViewModel) {
      return;
    }
    const genericCellViewModel = outputViewModel.cellViewModel;
    if (!genericCellViewModel) {
      return;
    }
    const cellViewModel = notebookEditor.getCellByHandle(genericCellViewModel.handle);
    if (!cellViewModel) {
      return;
    }
    const cellIndex = notebookEditor.getCellIndex(cellViewModel);
    if (cellIndex === void 0) {
      return;
    }
    const outputIndex = genericCellViewModel.outputsViewModels.indexOf(outputViewModel);
    if (outputIndex === -1) {
      return;
    }
    if (!notebookEditor.textModel) {
      return;
    }
    const outputURI = CellUri.generateOutputEditorUri(
      notebookEditor.textModel.uri,
      cellViewModel.id,
      cellIndex,
      outputViewModel.model.outputId,
      outputIndex
    );
    openerService.open(outputURI, { openToSide: true });
  }
});
export { getOutputViewModelFromId, getNotebookEditorFromContext, getOutputViewModelFromContext, COPY_OUTPUT_COMMAND_ID, OPEN_OUTPUT_COMMAND_ID, SAVE_OUTPUT_IMAGE_COMMAND_ID, OPEN_OUTPUT_IN_OUTPUT_PREVIEW_COMMAND_ID };
