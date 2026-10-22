// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/readOnlyMessage/browser/contribution.ts
import { Disposable } from "./module-0012.mjs";
import { MessageController } from "./module-0542.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { localize } from "./module-0001.mjs";
import { registerEditorContribution } from "./module-0097.mjs";


// src/vs/editor/contrib/readOnlyMessage/browser/contribution.ts
var ReadOnlyMessageController = class extends Disposable {
  constructor(editor) {
    super();
    this.editor = editor;
    this._register(this.editor.onDidAttemptReadOnlyEdit(() => this._onDidAttemptReadOnlyEdit()));
  }
  static {
    this.ID = "editor.contrib.readOnlyMessageController";
  }
  _onDidAttemptReadOnlyEdit() {
    const messageController = MessageController.get(this.editor);
    if (messageController && this.editor.hasModel()) {
      let message = this.editor.getOptions().get(105 /* readOnlyMessage */);
      if (!message) {
        if (this.editor.isSimpleWidget) {
          message = new MarkdownString(localize(1564, null));
        } else {
          message = new MarkdownString(localize(1563, null));
        }
      }
      messageController.showMessage(message, this.editor.getPosition());
    }
  }
};

registerEditorContribution(ReadOnlyMessageController.ID, ReadOnlyMessageController, 2 /* BeforeFirstInteraction */);
export { ReadOnlyMessageController };
