// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/reviewEdits.ts
import { IChatService } from "./module-0973.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { assertType } from "./module-0010.mjs";
import { derived } from "./module-0054.mjs";
import { waitForState } from "./module-0056.mjs";
import { raceCancellation } from "./module-0036.mjs";
import { INotebookService } from "./module-0927.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/chat/browser/actions/reviewEdits.ts
async function reviewEdits(accessor, editor, stream, token, applyCodeBlockSuggestionId) {
  if (!editor.hasModel()) {
    return false;
  }
  const chatService = accessor.get(IChatService);
  const uri4 = editor.getModel().uri;
  const chatModelRef = chatService.startNewLocalSession("editor" /* EditorInline */);
  const chatModel = chatModelRef.object;
  chatModel.startEditingSession(true);
  const store = new DisposableStore();
  store.add(chatModelRef);
  const chatRequest = chatModel?.addRequest({ text: "", parts: [] }, { variables: [] }, 0, {
    kind: void 0,
    telemetryModeId: "applyCodeBlock",
    modeInstructions: void 0,
    isBuiltin: true,
    applyCodeBlockSuggestionId
  });
  assertType(chatRequest.response);
  chatRequest.response.updateContent({ kind: "textEdit", uri: uri4, edits: [], done: false });
  for await (const chunk2 of stream) {
    if (token.isCancellationRequested) {
      chatRequest.response.cancel();
      break;
    }
    chatRequest.response.updateContent({ kind: "textEdit", uri: uri4, edits: chunk2, done: false });
  }
  chatRequest.response.updateContent({ kind: "textEdit", uri: uri4, edits: [], done: true });
  if (!token.isCancellationRequested) {
    chatRequest.response.complete();
  }
  const isSettled = derived((r2) => {
    const entry = chatModel.editingSession?.readEntry(uri4, r2);
    if (!entry) {
      return false;
    }
    const state = entry.state.read(r2);
    return state === 1 /* Accepted */ || state === 2 /* Rejected */;
  });
  const whenDecided = waitForState(isSettled, Boolean);
  await raceCancellation(whenDecided, token);
  store.dispose();
  return true;
}

async function reviewNotebookEdits(accessor, uri4, stream, token) {
  const chatService = accessor.get(IChatService);
  const notebookService = accessor.get(INotebookService);
  const isNotebook = notebookService.hasSupportedNotebooks(uri4);
  const chatModelRef = chatService.startNewLocalSession("editor" /* EditorInline */);
  const chatModel = chatModelRef.object;
  chatModel.startEditingSession(true);
  const store = new DisposableStore();
  store.add(chatModelRef);
  const chatRequest = chatModel?.addRequest({ text: "", parts: [] }, { variables: [] }, 0);
  assertType(chatRequest.response);
  if (isNotebook) {
    chatRequest.response.updateContent({ kind: "notebookEdit", uri: uri4, edits: [], done: false });
  } else {
    chatRequest.response.updateContent({ kind: "textEdit", uri: uri4, edits: [], done: false });
  }
  for await (const chunk2 of stream) {
    if (token.isCancellationRequested) {
      chatRequest.response.cancel();
      break;
    }
    if (chunk2.every(isCellEditOperation)) {
      chatRequest.response.updateContent({ kind: "notebookEdit", uri: uri4, edits: chunk2, done: false });
    } else {
      chatRequest.response.updateContent({ kind: "textEdit", uri: chunk2[0], edits: chunk2[1], done: false });
    }
  }
  if (isNotebook) {
    chatRequest.response.updateContent({ kind: "notebookEdit", uri: uri4, edits: [], done: true });
  } else {
    chatRequest.response.updateContent({ kind: "textEdit", uri: uri4, edits: [], done: true });
  }
  if (!token.isCancellationRequested) {
    chatRequest.response.complete();
  }
  const isSettled = derived((r2) => {
    const entry = chatModel.editingSession?.readEntry(uri4, r2);
    if (!entry) {
      return false;
    }
    const state = entry.state.read(r2);
    return state === 1 /* Accepted */ || state === 2 /* Rejected */;
  });
  const whenDecided = waitForState(isSettled, Boolean);
  await raceCancellation(whenDecided, token);
  store.dispose();
  return true;
}

function isCellEditOperation(edit3) {
  if (URI.isUri(edit3)) {
    return false;
  }
  if (Array.isArray(edit3)) {
    return false;
  }
  return true;
}
export { reviewEdits, reviewNotebookEdits, isCellEditOperation };
