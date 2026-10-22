// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugEditorInput.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { EditorInput } from "./module-0929.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugEditorInput.ts
var chatDebugEditorIcon = registerIcon("chat-debug-editor-label-icon", Codicon.bug, localize(10563, null));

var ChatDebugEditorInput = class _ChatDebugEditorInput extends EditorInput {
  constructor() {
    super(...arguments);
    this.resource = _ChatDebugEditorInput.RESOURCE;
  }
  static {
    this.ID = "workbench.editor.chatDebug";
  }
  static {
    this.RESOURCE = URI.from({
      scheme: "chat-debug",
      path: "default"
    });
  }
  static get instance() {
    if (!_ChatDebugEditorInput._instance || _ChatDebugEditorInput._instance.isDisposed()) {
      _ChatDebugEditorInput._instance = new _ChatDebugEditorInput();
    }
    return _ChatDebugEditorInput._instance;
  }
  get typeId() {
    return _ChatDebugEditorInput.ID;
  }
  get editorId() {
    return _ChatDebugEditorInput.ID;
  }
  get capabilities() {
    return 2 /* Readonly */ | 8 /* Singleton */;
  }
  getName() {
    return localize(10564, null);
  }
  getIcon() {
    return chatDebugEditorIcon;
  }
  matches(other) {
    if (super.matches(other)) {
      return true;
    }
    return other instanceof _ChatDebugEditorInput;
  }
};

var ChatDebugEditorInputSerializer = class {
  canSerialize(editorInput) {
    return true;
  }
  serialize(editorInput) {
    return "";
  }
  deserialize(instantiationService) {
    return ChatDebugEditorInput.instance;
  }
};
export { chatDebugEditorIcon, ChatDebugEditorInput, ChatDebugEditorInputSerializer };
