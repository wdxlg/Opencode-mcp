// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatExternalEditContentPart.ts
import { ChatEditPillElement, isResourceContentEmpty } from "./module-2279.mjs";
import { Emitter } from "./module-0017.mjs";
import { localize } from "./module-0001.mjs";
import { IEditorService, SIDE_GROUP } from "./module-0934.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IHoverService } from "./module-0520.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatExternalEditContentPart.ts
var ChatExternalEditContentPart = class extends ChatEditPillElement {
  constructor(edit3, _context, labelService, modelService, languageService, hoverService, editorService, textModelService) {
    super(labelService, modelService, languageService, hoverService);
    this.edit = edit3;
    this.editorService = editorService;
    this.textModelService = textModelService;
    this._onDidChangeDiff = this._register(new Emitter());
    /**
     * Fires once with the static diff data from the part data. Wired up by
     * the list renderer so {@link ChatThinkingContentPart} can aggregate
     * per-file changes into the thinking title.
     *
     * The fire is deferred to the next microtask so that consumers
     * subscribing immediately after construction (e.g. via
     * `ChatThinkingContentPart.appendItem`) still receive the initial value.
     */
    this.onDidChangeDiff = this._onDidChangeDiff.event;
    this.render(edit3);
    this._register(this.onDidClick((opts) => this.openEdit(opts)));
  }
  get domNode() {
    return this.element;
  }
  render(edit3) {
    this.setUri(edit3.uri);
    const { icon: icon2, label: label3 } = describeEdit(edit3);
    this.setStatus(icon2, label3);
    this.setProgressFill(void 0);
    this.setLabelDetail("");
    if (edit3.diff && (edit3.diff.added > 0 || edit3.diff.removed > 0)) {
      this.setDiff(edit3.diff);
      const fileName = this.labelService.getUriBasenameLabel(edit3.uri);
      const insertionsFragment = edit3.diff.added === 1 ? localize(11906, null) : localize(11905, null, edit3.diff.added);
      const deletionsFragment = edit3.diff.removed === 1 ? localize(11903, null) : localize(11902, null, edit3.diff.removed);
      this.setAriaLabel(localize(11910, null, fileName, insertionsFragment, deletionsFragment));
      const diff4 = edit3.diff;
      queueMicrotask(() => {
        if (this._store.isDisposed) {
          return;
        }
        this._onDidChangeDiff.fire({
          added: diff4.added,
          removed: diff4.removed,
          resources: [{
            resource: edit3.uri,
            originalURI: edit3.beforeContentUri,
            modifiedURI: edit3.editKind === "delete" ? void 0 : edit3.afterContentUri ?? edit3.uri
          }]
        });
      });
    } else {
      this.setDiff(void 0);
      this.setAriaLabel(`${label3} ${this.labelService.getUriBasenameLabel(edit3.uri)}`);
    }
  }
  async openEdit({ editorOptions: options3, openToSide }) {
    const group2 = openToSide ? SIDE_GROUP : void 0;
    if (this.edit.beforeContentUri && this.edit.afterContentUri) {
      if (this.edit.editKind === "edit" && (this.edit.diff?.removed ?? 0) === 0 && await isResourceContentEmpty(this.textModelService, this.edit.beforeContentUri)) {
        this.editorService.openEditor({ resource: this.edit.uri, options: options3 }, group2);
        return;
      }
      this.editorService.openEditor({
        original: { resource: this.edit.beforeContentUri },
        modified: { resource: this.edit.afterContentUri },
        options: options3
      }, group2);
    } else if (this.edit.editKind === "delete" && this.edit.beforeContentUri) {
      this.editorService.openEditor({ resource: this.edit.beforeContentUri, options: options3 }, group2);
    } else if (this.edit.editKind !== "delete") {
      this.editorService.openEditor({ resource: this.edit.uri, options: options3 }, group2);
    }
  }
  hasSameContent(other, _followingContent, _element) {
    if (other.kind !== "externalEdit") {
      return false;
    }
    return isEqual2(other.uri, this.edit.uri) && other.editKind === this.edit.editKind && (other.diff?.added ?? 0) === (this.edit.diff?.added ?? 0) && (other.diff?.removed ?? 0) === (this.edit.diff?.removed ?? 0);
  }
};

ChatExternalEditContentPart = __decorateClass([
  __decorateParam(2, ILabelService),
  __decorateParam(3, IModelService),
  __decorateParam(4, ILanguageService),
  __decorateParam(5, IHoverService),
  __decorateParam(6, IEditorService),
  __decorateParam(7, ITextModelService)
], ChatExternalEditContentPart);

function describeEdit(edit3) {
  switch (edit3.editKind) {
    case "create":
      return { icon: Codicon.check, label: localize(11907, null) };
    case "delete":
      return { icon: Codicon.check, label: localize(11908, null) };
    case "rename":
      return { icon: Codicon.check, label: localize(11909, null) };
    case "edit":
      return { icon: Codicon.check, label: localize(11904, null) };
  }
}
export { describeEdit, ChatExternalEditContentPart };
