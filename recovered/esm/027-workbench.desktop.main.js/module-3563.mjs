// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/welcomeWalkthrough/common/walkThroughContentProvider.ts
import { Schemas } from "./module-0033.mjs";
import { createTextBufferFactory } from "./module-0423.mjs";
import { marked } from "./module-0464.mjs";
import { Range2 } from "./module-0106.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IModelService } from "./module-0080.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/welcomeWalkthrough/common/walkThroughContentProvider.ts
var WalkThroughContentProviderRegistry = class {
  constructor() {
    this.providers = /* @__PURE__ */ new Map();
  }
  registerProvider(moduleId, provider) {
    this.providers.set(moduleId, provider);
  }
  getProvider(moduleId) {
    return this.providers.get(moduleId);
  }
};

var walkThroughContentRegistry = new WalkThroughContentProviderRegistry();

async function moduleToContent(instantiationService, resource) {
  if (!resource.query) {
    throw new Error("Walkthrough: invalid resource");
  }
  const query = JSON.parse(resource.query);
  if (!query.moduleId) {
    throw new Error("Walkthrough: invalid resource");
  }
  const provider = walkThroughContentRegistry.getProvider(query.moduleId);
  if (!provider) {
    throw new Error(`Walkthrough: no provider registered for ${query.moduleId}`);
  }
  return instantiationService.invokeFunction(provider);
}

var WalkThroughSnippetContentProvider = class {
  constructor(textModelResolverService, languageService, modelService, instantiationService) {
    this.textModelResolverService = textModelResolverService;
    this.languageService = languageService;
    this.modelService = modelService;
    this.instantiationService = instantiationService;
    this.loads = /* @__PURE__ */ new Map();
    this.textModelResolverService.registerTextModelContentProvider(Schemas.walkThroughSnippet, this);
  }
  static {
    this.ID = "workbench.contrib.walkThroughSnippetContentProvider";
  }
  async textBufferFactoryFromResource(resource) {
    let ongoing = this.loads.get(resource.toString());
    if (!ongoing) {
      ongoing = moduleToContent(this.instantiationService, resource).then((content2) => createTextBufferFactory(content2)).finally(() => this.loads.delete(resource.toString()));
      this.loads.set(resource.toString(), ongoing);
    }
    return ongoing;
  }
  async provideTextContent(resource) {
    const factory = await this.textBufferFactoryFromResource(resource.with({ fragment: "" }));
    let codeEditorModel = this.modelService.getModel(resource);
    if (!codeEditorModel) {
      const j = parseInt(resource.fragment);
      let i2 = 0;
      const renderer = new marked.Renderer();
      renderer.code = ({ text: text2, lang }) => {
        i2++;
        const languageId = typeof lang === "string" ? this.languageService.getLanguageIdByLanguageName(lang) || "" : "";
        const languageSelection = this.languageService.createById(languageId);
        const model = this.modelService.createModel(text2, languageSelection, resource.with({ fragment: `${i2}.${lang}` }));
        if (i2 === j) {
          codeEditorModel = model;
        }
        return "";
      };
      const textBuffer = factory.create(1 /* LF */).textBuffer;
      const lineCount = textBuffer.getLineCount();
      const range2 = new Range2(1, 1, lineCount, textBuffer.getLineLength(lineCount) + 1);
      const markdown = textBuffer.getValueInRange(range2, 0 /* TextDefined */);
      marked(markdown, { renderer });
    }
    return assertReturnsDefined(codeEditorModel);
  }
};

WalkThroughSnippetContentProvider = __decorateClass([
  __decorateParam(0, ITextModelService),
  __decorateParam(1, ILanguageService),
  __decorateParam(2, IModelService),
  __decorateParam(3, IInstantiationService)
], WalkThroughSnippetContentProvider);
export { moduleToContent, WalkThroughContentProviderRegistry, walkThroughContentRegistry, WalkThroughSnippetContentProvider };
