// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/imageCarousel/browser/imageCarouselEditorInput.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { EditorInput } from "./module-0929.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";


// src/vs/workbench/contrib/imageCarousel/browser/imageCarouselEditorInput.ts
var imageCarouselEditorIcon = registerIcon("image-carousel-editor-label-icon", Codicon.fileMedia, localize(16133, null));

var ImageCarouselEditorInput = class _ImageCarouselEditorInput extends EditorInput {
  constructor(collection, startIndex = 0) {
    super();
    this.collection = collection;
    this.startIndex = startIndex;
    this._resource = URI.from({
      scheme: Schemas.vscodeImageCarousel,
      path: `/${encodeURIComponent(collection.id)}`
    });
    this._name = collection.title;
  }
  static {
    this.ID = "workbench.input.imageCarousel";
  }
  get capabilities() {
    return super.capabilities | 8 /* Singleton */ | 2048 /* RequiresModal */;
  }
  get typeId() {
    return _ImageCarouselEditorInput.ID;
  }
  get resource() {
    return this._resource;
  }
  getName() {
    return this._name;
  }
  getIcon() {
    return imageCarouselEditorIcon;
  }
  setName(name) {
    if (this._name !== name) {
      this._name = name;
      this._onDidChangeLabel.fire();
    }
  }
  matches(other) {
    if (other instanceof _ImageCarouselEditorInput) {
      return other.collection.id === this.collection.id;
    }
    return false;
  }
};
export { imageCarouselEditorIcon, ImageCarouselEditorInput };
