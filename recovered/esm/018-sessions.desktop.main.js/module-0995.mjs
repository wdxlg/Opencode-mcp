// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadNotebookDto.ts



// src/vs/workbench/api/browser/mainThreadNotebookDto.ts
var NotebookDto;

((NotebookDto2) => {
  function toNotebookOutputItemDto(item) {
    return {
      mime: item.mime,
      valueBytes: item.data
    };
  }
  NotebookDto2.toNotebookOutputItemDto = toNotebookOutputItemDto;
  function toNotebookOutputDto(output) {
    return {
      outputId: output.outputId,
      metadata: output.metadata,
      items: output.outputs.map(toNotebookOutputItemDto)
    };
  }
  NotebookDto2.toNotebookOutputDto = toNotebookOutputDto;
  function toNotebookCellDataDto(cell) {
    return {
      cellKind: cell.cellKind,
      language: cell.language,
      mime: cell.mime,
      source: cell.source,
      internalMetadata: cell.internalMetadata,
      metadata: cell.metadata,
      outputs: cell.outputs.map(toNotebookOutputDto)
    };
  }
  NotebookDto2.toNotebookCellDataDto = toNotebookCellDataDto;
  function toNotebookDataDto(data) {
    return {
      metadata: data.metadata,
      cells: data.cells.map(toNotebookCellDataDto)
    };
  }
  NotebookDto2.toNotebookDataDto = toNotebookDataDto;
  function fromNotebookOutputItemDto(item) {
    return {
      mime: item.mime,
      data: item.valueBytes
    };
  }
  NotebookDto2.fromNotebookOutputItemDto = fromNotebookOutputItemDto;
  function fromNotebookOutputDto(output) {
    return {
      outputId: output.outputId,
      metadata: output.metadata,
      outputs: output.items.map(fromNotebookOutputItemDto)
    };
  }
  NotebookDto2.fromNotebookOutputDto = fromNotebookOutputDto;
  function fromNotebookCellDataDto(cell) {
    return {
      cellKind: cell.cellKind,
      language: cell.language,
      mime: cell.mime,
      source: cell.source,
      outputs: cell.outputs.map(fromNotebookOutputDto),
      metadata: cell.metadata,
      internalMetadata: cell.internalMetadata
    };
  }
  NotebookDto2.fromNotebookCellDataDto = fromNotebookCellDataDto;
  function fromNotebookDataDto(data) {
    return {
      metadata: data.metadata,
      cells: data.cells.map(fromNotebookCellDataDto)
    };
  }
  NotebookDto2.fromNotebookDataDto = fromNotebookDataDto;
  function toNotebookCellDto(cell) {
    return {
      handle: cell.handle,
      uri: cell.uri,
      source: cell.textBuffer.getLinesContent(),
      eol: cell.textBuffer.getEOL(),
      language: cell.language,
      cellKind: cell.cellKind,
      outputs: cell.outputs.map(toNotebookOutputDto),
      metadata: cell.metadata,
      internalMetadata: cell.internalMetadata
    };
  }
  NotebookDto2.toNotebookCellDto = toNotebookCellDto;
  function fromCellExecuteUpdateDto(data) {
    if (data.editType === 1 /* Output */) {
      return {
        editType: data.editType,
        cellHandle: data.cellHandle,
        append: data.append,
        outputs: data.outputs.map(fromNotebookOutputDto)
      };
    } else if (data.editType === 2 /* OutputItems */) {
      return {
        editType: data.editType,
        append: data.append,
        outputId: data.outputId,
        items: data.items.map(fromNotebookOutputItemDto)
      };
    } else {
      return data;
    }
  }
  NotebookDto2.fromCellExecuteUpdateDto = fromCellExecuteUpdateDto;
  function fromCellExecuteCompleteDto(data) {
    return data;
  }
  NotebookDto2.fromCellExecuteCompleteDto = fromCellExecuteCompleteDto;
  function fromCellEditOperationDto(edit3) {
    if (edit3.editType === 1 /* Replace */) {
      return {
        editType: edit3.editType,
        index: edit3.index,
        count: edit3.count,
        cells: edit3.cells.map(fromNotebookCellDataDto)
      };
    } else {
      return edit3;
    }
  }
  NotebookDto2.fromCellEditOperationDto = fromCellEditOperationDto;
})(NotebookDto || (NotebookDto = {}));
export { NotebookDto };
