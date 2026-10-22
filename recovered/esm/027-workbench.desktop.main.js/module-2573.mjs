// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatSideChat.ts
import { getActiveWindow, isAncestor } from "./module-0075.mjs";


// src/vs/workbench/contrib/chat/browser/chatSideChat.ts
function captureSideChatSelection(widget) {
  if (!widget) {
    return void 0;
  }
  const nativeSelection = getActiveWindow().getSelection();
  const selectedText = nativeSelection?.toString();
  if (!nativeSelection || !selectedText || !selectedText.trim()) {
    return void 0;
  }
  const { anchorNode, focusNode } = nativeSelection;
  if (!anchorNode || !focusNode || !isAncestor(anchorNode, widget.domNode) || !isAncestor(focusNode, widget.domNode)) {
    return void 0;
  }
  const inputEditorDomNode = widget.inputEditor.getDomNode();
  if (inputEditorDomNode && (isAncestor(anchorNode, inputEditorDomNode) || isAncestor(focusNode, inputEditorDomNode))) {
    return void 0;
  }
  return { text: selectedText };
}
export { captureSideChatSelection };
