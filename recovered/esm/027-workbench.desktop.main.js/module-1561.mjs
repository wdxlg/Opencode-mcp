// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/textfile/common/textEditorService.ts
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { Registry } from "./module-0090.mjs";
import { DEFAULT_EDITOR_ASSOCIATION, EditorExtensions, isResourceDiffEditorInput, isResourceMergeEditorInput, isResourceSideBySideEditorInput } from "./module-0925.mjs";
import { DiffEditorInput } from "./module-1101.mjs";
import { SideBySideEditorInput } from "./module-1095.mjs";
import { Schemas } from "./module-0033.mjs";
import { UntitledTextEditorInput } from "./module-1549.mjs";
import { URI } from "./module-0032.mjs";
import { basename2 } from "./module-0034.mjs";
import { TextResourceEditorInput } from "./module-1104.mjs";
import { Event2 } from "./module-0017.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUntitledTextEditorService } from "./module-1125.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IFileService } from "./module-0269.mjs";
import { IEditorResolverService } from "./module-1113.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/textfile/common/textEditorService.ts
var ITextEditorService = createDecorator("textEditorService");

var FileEditorInputLeakError = class extends Error {
  constructor(message, stack) {
    super(message);
    this.name = "FileEditorInputLeakError";
    this.stack = stack;
  }
};

var TextEditorService = class extends Disposable {
  constructor(untitledTextEditorService, instantiationService, uriIdentityService, fileService, editorResolverService) {
    super();
    this.untitledTextEditorService = untitledTextEditorService;
    this.instantiationService = instantiationService;
    this.uriIdentityService = uriIdentityService;
    this.fileService = fileService;
    this.editorResolverService = editorResolverService;
    this.editorInputCache = new ResourceMap();
    this.fileEditorFactory = Registry.as(EditorExtensions.EditorFactory).getFileEditorFactory();
    this.mapLeakToCounter = /* @__PURE__ */ new Map();
    this.registerDefaultEditor();
  }
  registerDefaultEditor() {
    this._register(this.editorResolverService.registerEditor(
      "*",
      {
        id: DEFAULT_EDITOR_ASSOCIATION.id,
        label: DEFAULT_EDITOR_ASSOCIATION.displayName,
        detail: DEFAULT_EDITOR_ASSOCIATION.providerDisplayName,
        priority: "builtin" /* builtin */
      },
      {},
      {
        createEditorInput: (editor) => ({ editor: this.createTextEditor(editor) }),
        createUntitledEditorInput: (untitledEditor) => ({ editor: this.createTextEditor(untitledEditor) }),
        createDiffEditorInput: (diffEditor) => ({ editor: this.createTextEditor(diffEditor) })
      }
    ));
  }
  async resolveTextEditor(input) {
    return this.createTextEditor(input);
  }
  createTextEditor(input) {
    if (isResourceMergeEditorInput(input)) {
      return this.createTextEditor(input.result);
    }
    if (isResourceDiffEditorInput(input)) {
      const original = this.createTextEditor(input.original);
      const modified = this.createTextEditor(input.modified);
      return this.instantiationService.createInstance(DiffEditorInput, input.label, input.description, original, modified, void 0);
    }
    if (isResourceSideBySideEditorInput(input)) {
      const primary = this.createTextEditor(input.primary);
      const secondary = this.createTextEditor(input.secondary);
      return this.instantiationService.createInstance(SideBySideEditorInput, input.label, input.description, secondary, primary);
    }
    const untitledInput = input;
    if (untitledInput.forceUntitled || !untitledInput.resource || untitledInput.resource.scheme === Schemas.untitled) {
      const untitledOptions = {
        languageId: untitledInput.languageId,
        initialValue: untitledInput.contents,
        encoding: untitledInput.encoding
      };
      let untitledModel;
      if (untitledInput.resource?.scheme === Schemas.untitled) {
        untitledModel = this.untitledTextEditorService.create({ untitledResource: untitledInput.resource, ...untitledOptions });
      } else {
        untitledModel = this.untitledTextEditorService.create({ associatedResource: untitledInput.resource, ...untitledOptions });
      }
      return this.createOrGetCached(untitledModel.resource, () => this.instantiationService.createInstance(UntitledTextEditorInput, untitledModel));
    }
    const textResourceEditorInput = input;
    if (textResourceEditorInput.resource instanceof URI) {
      const label3 = textResourceEditorInput.label || basename2(textResourceEditorInput.resource);
      const preferredResource = textResourceEditorInput.resource;
      const canonicalResource = this.uriIdentityService.asCanonicalUri(preferredResource);
      return this.createOrGetCached(canonicalResource, () => {
        if (textResourceEditorInput.forceFile || this.fileService.hasProvider(canonicalResource)) {
          return this.fileEditorFactory.createFileEditor(canonicalResource, preferredResource, textResourceEditorInput.label, textResourceEditorInput.description, textResourceEditorInput.encoding, textResourceEditorInput.languageId, textResourceEditorInput.contents, this.instantiationService);
        }
        return this.instantiationService.createInstance(TextResourceEditorInput, canonicalResource, textResourceEditorInput.label, textResourceEditorInput.description, textResourceEditorInput.languageId, textResourceEditorInput.contents);
      }, (cachedInput) => {
        if (cachedInput instanceof UntitledTextEditorInput) {
          return;
        } else if (!(cachedInput instanceof TextResourceEditorInput)) {
          cachedInput.setPreferredResource(preferredResource);
          if (textResourceEditorInput.label) {
            cachedInput.setPreferredName(textResourceEditorInput.label);
          }
          if (textResourceEditorInput.description) {
            cachedInput.setPreferredDescription(textResourceEditorInput.description);
          }
          if (textResourceEditorInput.encoding) {
            cachedInput.setPreferredEncoding(textResourceEditorInput.encoding);
          }
          if (textResourceEditorInput.languageId) {
            cachedInput.setPreferredLanguageId(textResourceEditorInput.languageId);
          }
          if (typeof textResourceEditorInput.contents === "string") {
            cachedInput.setPreferredContents(textResourceEditorInput.contents);
          }
        } else {
          if (label3) {
            cachedInput.setName(label3);
          }
          if (textResourceEditorInput.description) {
            cachedInput.setDescription(textResourceEditorInput.description);
          }
          if (textResourceEditorInput.languageId) {
            cachedInput.setPreferredLanguageId(textResourceEditorInput.languageId);
          }
          if (typeof textResourceEditorInput.contents === "string") {
            cachedInput.setPreferredContents(textResourceEditorInput.contents);
          }
        }
      });
    }
    throw new Error(`ITextEditorService: Unable to create texteditor from ${JSON.stringify(input)}`);
  }
  createOrGetCached(resource, factoryFn, cachedFn) {
    let input = this.editorInputCache.get(resource);
    if (input) {
      cachedFn?.(input);
      return input;
    }
    input = factoryFn();
    this.editorInputCache.set(resource, input);
    const leakId = this.trackLeaks(input);
    Event2.once(input.onWillDispose)(() => {
      this.editorInputCache.delete(resource);
      if (leakId) {
        this.untrackLeaks(leakId);
      }
    });
    return input;
  }
  static {
    //#region Leak Monitoring
    this.LEAK_TRACKING_THRESHOLD = 256;
  }
  static {
    this.LEAK_REPORTING_THRESHOLD = 2 * this.LEAK_TRACKING_THRESHOLD;
  }
  static {
    this.LEAK_REPORTED = false;
  }
  trackLeaks(input) {
    if (TextEditorService.LEAK_REPORTED || this.editorInputCache.size < TextEditorService.LEAK_TRACKING_THRESHOLD) {
      return void 0;
    }
    const leakId = `${input.resource.scheme}#${input.typeId || "<no typeId>"}#${input.editorId || "<no editorId>"}
${new Error().stack?.split("\n").slice(2).join("\n") ?? ""}`;
    const leakCounter = (this.mapLeakToCounter.get(leakId) ?? 0) + 1;
    this.mapLeakToCounter.set(leakId, leakCounter);
    if (this.editorInputCache.size > TextEditorService.LEAK_REPORTING_THRESHOLD) {
      TextEditorService.LEAK_REPORTED = true;
      const [topLeak, topCount] = Array.from(this.mapLeakToCounter.entries()).reduce(
        ([topLeak2, topCount2], [key3, val]) => val > topCount2 ? [key3, val] : [topLeak2, topCount2]
      );
      const message = `Potential text editor input LEAK detected, having ${this.editorInputCache.size} text editor inputs already. Most frequent owner (${topCount})`;
      onUnexpectedError(new FileEditorInputLeakError(message, topLeak));
    }
    return leakId;
  }
  untrackLeaks(leakId) {
    const stackCounter = (this.mapLeakToCounter.get(leakId) ?? 1) - 1;
    this.mapLeakToCounter.set(leakId, stackCounter);
    if (stackCounter === 0) {
      this.mapLeakToCounter.delete(leakId);
    }
  }
  //#endregion
};

TextEditorService = __decorateClass([
  __decorateParam(0, IUntitledTextEditorService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IUriIdentityService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IEditorResolverService)
], TextEditorService);

registerSingleton(
  ITextEditorService,
  TextEditorService,
  0 /* Eager */
  /* do not change: https://github.com/microsoft/vscode/issues/137675 */
);
export { ITextEditorService, FileEditorInputLeakError, TextEditorService };
