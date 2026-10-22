// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/viewModel/cellOutputTextHelper.ts
import { isTextStreamMime } from "./module-0136.mjs";


// src/vs/workbench/contrib/notebook/browser/viewModel/cellOutputTextHelper.ts
function getAllOutputsText(notebook, viewCell, shortErrors = false) {
  const outputText = [];
  for (let i2 = 0; i2 < viewCell.outputsViewModels.length; i2++) {
    const outputViewModel = viewCell.outputsViewModels[i2];
    const outputTextModel = viewCell.model.outputs[i2];
    const [mimeTypes, pick] = outputViewModel.resolveMimeTypes(notebook, void 0);
    const mimeType = mimeTypes[pick].mimeType;
    let buffer = outputTextModel.outputs.find((output) => output.mime === mimeType);
    if (!buffer || mimeType.startsWith("image")) {
      buffer = outputTextModel.outputs.find((output) => !output.mime.startsWith("image"));
    }
    if (!buffer) {
      continue;
    }
    let text2 = "";
    if (isTextStreamMime(mimeType)) {
      const { text: stream, count: count2 } = getOutputStreamText(outputViewModel);
      text2 = stream;
      if (count2 > 1) {
        i2 += count2 - 1;
      }
    } else {
      text2 = getOutputText(mimeType, buffer, shortErrors);
    }
    outputText.push(text2);
  }
  let outputContent;
  if (outputText.length > 1) {
    outputContent = outputText.map((output, i2) => {
      return `Cell output ${i2 + 1} of ${outputText.length}
${output}`;
    }).join("\n");
  } else {
    outputContent = outputText[0] ?? "";
  }
  return outputContent;
}

function getOutputStreamText(output) {
  let text2 = "";
  const cellViewModel = output.cellViewModel;
  let index2 = cellViewModel.outputsViewModels.indexOf(output);
  let count2 = 0;
  while (index2 < cellViewModel.model.outputs.length) {
    const nextCellOutput = cellViewModel.model.outputs[index2];
    const nextOutput = nextCellOutput.outputs.find((output2) => isTextStreamMime(output2.mime));
    if (!nextOutput) {
      break;
    }
    text2 = text2 + decoder.decode(nextOutput.data.buffer);
    index2 = index2 + 1;
    count2++;
  }
  return { text: text2.trim(), count: count2 };
}

var decoder = new TextDecoder();

function getOutputText(mimeType, buffer, shortError = false) {
  let text2 = `${mimeType}`;
  const charLimit = 1e5;
  text2 = decoder.decode(buffer.data.slice(0, charLimit).buffer);
  if (buffer.data.byteLength > charLimit) {
    text2 = text2 + "...(truncated)";
  } else if (mimeType === "application/vnd.code.notebook.error") {
    text2 = text2.replace(/\\u001b\[[0-9;]*m/gi, "");
    try {
      const error = JSON.parse(text2);
      if (!error.stack || shortError) {
        text2 = `${error.name}: ${error.message}`;
      } else {
        text2 = error.stack;
      }
    } catch {
    }
  }
  return text2.trim();
}

async function copyCellOutput(mimeType, outputViewModel, clipboardService, logService) {
  const cellOutput = outputViewModel.model;
  const output = mimeType && TEXT_BASED_MIMETYPES.includes(mimeType) ? cellOutput.outputs.find((output2) => output2.mime === mimeType) : cellOutput.outputs.find((output2) => TEXT_BASED_MIMETYPES.includes(output2.mime));
  mimeType = output?.mime;
  if (!mimeType || !output) {
    return;
  }
  const text2 = isTextStreamMime(mimeType) ? getOutputStreamText(outputViewModel).text : getOutputText(mimeType, output);
  try {
    await clipboardService.writeText(text2);
  } catch (e) {
    logService.error(`Failed to copy content: ${e}`);
  }
}

var TEXT_BASED_MIMETYPES = [
  "text/latex",
  "text/html",
  "application/vnd.code.notebook.error",
  "application/vnd.code.notebook.stdout",
  "application/x.notebook.stdout",
  "application/x.notebook.stream",
  "application/vnd.code.notebook.stderr",
  "application/x.notebook.stderr",
  "text/plain",
  "text/markdown",
  "application/json"
];
export { getAllOutputsText, getOutputStreamText, getOutputText, copyCellOutput, decoder, TEXT_BASED_MIMETYPES };
