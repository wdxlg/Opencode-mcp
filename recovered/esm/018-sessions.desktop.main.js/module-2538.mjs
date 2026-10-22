// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatClear.ts
import { IEditorService } from "./module-0935.mjs";
import { ChatEditorInput } from "./module-1112.mjs";
import { getChatSessionType, getNewChatSessionResource } from "./module-0962.mjs";
import { getDefaultNewChatSessionTypeAndReason } from "./module-0965.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatClear.ts
async function clearChatEditor(accessor, chatEditorInput, resolvedSessionType) {
  const editorService = accessor.get(IEditorService);
  if (!chatEditorInput) {
    const editorInput = editorService.activeEditor;
    chatEditorInput = editorInput instanceof ChatEditorInput ? editorInput : void 0;
  }
  if (chatEditorInput instanceof ChatEditorInput) {
    const currentResource = chatEditorInput.sessionResource;
    const currentSessionType = currentResource ? getChatSessionType(currentResource) : void 0;
    const resolved = resolvedSessionType ?? getDefaultNewChatSessionTypeAndReason(accessor, {
      currentSessionType
    });
    const resource = getNewChatSessionResource(resolved.sessionType);
    const options3 = { pinned: true, sessionTypeSelectionReason: resolved.selectionReason };
    const identifier2 = editorService.findEditors(chatEditorInput.resource)[0];
    await editorService.replaceEditors([{
      editor: chatEditorInput,
      replacement: { resource, options: options3 }
    }], identifier2.groupId);
  }
}
export { clearChatEditor };
