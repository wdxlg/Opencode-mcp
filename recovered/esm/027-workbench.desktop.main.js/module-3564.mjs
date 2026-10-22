// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughInput.ts
import { EditorModel } from "./module-1096.mjs";
import { EditorInput } from "./module-0928.mjs";
import { moduleToContent } from "./module-3563.mjs";
import { Marked, marked } from "./module-0464.mjs";
import { Schemas } from "./module-0033.mjs";
import { markedGfmHeadingIdPlugin } from "./module-2745.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITextModelService } from "./module-0081.mjs";


// src/vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughInput.ts
var WalkThroughModel = class extends EditorModel {
  constructor(mainRef, snippetRefs) {
    super();
    this.mainRef = mainRef;
    this.snippetRefs = snippetRefs;
  }
  get main() {
    return this.mainRef;
  }
  get snippets() {
    return this.snippetRefs.map((snippet) => snippet.object);
  }
  dispose() {
    this.snippetRefs.forEach((ref) => ref.dispose());
    super.dispose();
  }
};

var WalkThroughInput = class extends EditorInput {
  constructor(options3, instantiationService, textModelResolverService) {
    super();
    this.options = options3;
    this.instantiationService = instantiationService;
    this.textModelResolverService = textModelResolverService;
    this.promise = null;
    this.maxTopScroll = 0;
    this.maxBottomScroll = 0;
  }
  get capabilities() {
    return 8 /* Singleton */ | super.capabilities;
  }
  get resource() {
    return this.options.resource;
  }
  get typeId() {
    return this.options.typeId;
  }
  getName() {
    return this.options.name;
  }
  getDescription() {
    return this.options.description || "";
  }
  getTelemetryFrom() {
    return this.options.telemetryFrom;
  }
  getTelemetryDescriptor() {
    const descriptor = super.getTelemetryDescriptor();
    descriptor["target"] = this.getTelemetryFrom();
    return descriptor;
  }
  get onReady() {
    return this.options.onReady;
  }
  get layout() {
    return this.options.layout;
  }
  resolve() {
    if (!this.promise) {
      this.promise = moduleToContent(this.instantiationService, this.options.resource).then((content2) => {
        if (this.resource.path.endsWith(".html")) {
          return new WalkThroughModel(content2, []);
        }
        const snippets = [];
        let i2 = 0;
        const renderer = new marked.Renderer();
        renderer.code = ({ lang }) => {
          i2++;
          const resource = this.options.resource.with({ scheme: Schemas.walkThroughSnippet, fragment: `${i2}.${lang}` });
          snippets.push(this.textModelResolverService.createModelReference(resource));
          return `<div id="snippet-${resource.fragment}" class="walkThroughEditorContainer" ></div>`;
        };
        const m = new Marked({ renderer }, markedGfmHeadingIdPlugin());
        content2 = m.parse(content2, { async: false });
        return Promise.all(snippets).then((refs) => new WalkThroughModel(content2, refs));
      });
    }
    return this.promise;
  }
  matches(otherInput) {
    if (super.matches(otherInput)) {
      return true;
    }
    if (otherInput instanceof WalkThroughInput) {
      return isEqual2(otherInput.options.resource, this.options.resource);
    }
    return false;
  }
  dispose() {
    if (this.promise) {
      this.promise.then((model) => model.dispose());
      this.promise = null;
    }
    super.dispose();
  }
  relativeScrollPosition(topScroll, bottomScroll) {
    this.maxTopScroll = Math.max(this.maxTopScroll, topScroll);
    this.maxBottomScroll = Math.max(this.maxBottomScroll, bottomScroll);
  }
};

WalkThroughInput = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ITextModelService)
], WalkThroughInput);
export { WalkThroughModel, WalkThroughInput };
