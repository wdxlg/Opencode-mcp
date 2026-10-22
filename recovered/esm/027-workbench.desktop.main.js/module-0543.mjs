// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/dropOrPasteInto/browser/defaultProviders.ts
import { HierarchicalKind } from "./module-0535.mjs";
import { Mimes } from "./module-0136.mjs";
import { localize } from "./module-0001.mjs";
import { Schemas } from "./module-0033.mjs";
import { coalesce } from "./module-0007.mjs";
import { relativePath } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { UriList } from "./module-0264.mjs";
import { URI } from "./module-0032.mjs";
import { Disposable } from "./module-0012.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";


// src/vs/editor/contrib/dropOrPasteInto/browser/defaultProviders.ts
var SimplePasteAndDropProvider = class {
  constructor(kind) {
    this.copyMimeTypes = [];
    this.kind = kind;
    this.providedDropEditKinds = [this.kind];
    this.providedPasteEditKinds = [this.kind];
  }
  async provideDocumentPasteEdits(_model, _ranges, dataTransfer, context2, token) {
    const edit3 = await this.getEdit(dataTransfer, token);
    if (!edit3) {
      return void 0;
    }
    return {
      edits: [{ insertText: edit3.insertText, title: edit3.title, kind: edit3.kind, handledMimeType: edit3.handledMimeType, yieldTo: edit3.yieldTo }],
      dispose() {
      }
    };
  }
  async provideDocumentDropEdits(_model, _position, dataTransfer, token) {
    const edit3 = await this.getEdit(dataTransfer, token);
    if (!edit3) {
      return;
    }
    return {
      edits: [{ insertText: edit3.insertText, title: edit3.title, kind: edit3.kind, handledMimeType: edit3.handledMimeType, yieldTo: edit3.yieldTo }],
      dispose() {
      }
    };
  }
};

var DefaultTextPasteOrDropEditProvider = class _DefaultTextPasteOrDropEditProvider extends SimplePasteAndDropProvider {
  constructor() {
    super(HierarchicalKind.Empty.append("text", "plain"));
    this.id = _DefaultTextPasteOrDropEditProvider.id;
    this.dropMimeTypes = [Mimes.text];
    this.pasteMimeTypes = [Mimes.text];
  }
  static {
    this.id = "text";
  }
  async getEdit(dataTransfer, _token) {
    const textEntry = dataTransfer.get(Mimes.text);
    if (!textEntry) {
      return;
    }
    if (dataTransfer.has(Mimes.uriList)) {
      return;
    }
    const insertText = await textEntry.asString();
    return {
      handledMimeType: Mimes.text,
      title: localize(1109, null),
      insertText,
      kind: this.kind
    };
  }
};

var PathProvider = class extends SimplePasteAndDropProvider {
  constructor() {
    super(HierarchicalKind.Empty.append("uri", "path", "absolute"));
    this.dropMimeTypes = [Mimes.uriList];
    this.pasteMimeTypes = [Mimes.uriList];
  }
  async getEdit(dataTransfer, token) {
    const entries2 = await extractUriList(dataTransfer);
    if (!entries2.length || token.isCancellationRequested) {
      return;
    }
    let uriCount = 0;
    const insertText = entries2.map(({ uri: uri5, originalText }) => {
      if (uri5.scheme === Schemas.file) {
        return uri5.fsPath;
      } else {
        uriCount++;
        return originalText;
      }
    }).join(" ");
    let label3;
    if (uriCount > 0) {
      label3 = entries2.length > 1 ? localize(1107, null) : localize(1106, null);
    } else {
      label3 = entries2.length > 1 ? localize(1103, null) : localize(1102, null);
    }
    return {
      handledMimeType: Mimes.uriList,
      insertText,
      title: label3,
      kind: this.kind
    };
  }
};

var RelativePathProvider = class extends SimplePasteAndDropProvider {
  constructor(_workspaceContextService) {
    super(HierarchicalKind.Empty.append("uri", "path", "relative"));
    this._workspaceContextService = _workspaceContextService;
    this.dropMimeTypes = [Mimes.uriList];
    this.pasteMimeTypes = [Mimes.uriList];
  }
  async getEdit(dataTransfer, token) {
    const entries2 = await extractUriList(dataTransfer);
    if (!entries2.length || token.isCancellationRequested) {
      return;
    }
    const relativeUris = coalesce(entries2.map(({ uri: uri5 }) => {
      const root = this._workspaceContextService.getWorkspaceFolder(uri5);
      return root ? relativePath(root.uri, uri5) : void 0;
    }));
    if (!relativeUris.length) {
      return;
    }
    return {
      handledMimeType: Mimes.uriList,
      insertText: relativeUris.join(" "),
      title: entries2.length > 1 ? localize(1105, null) : localize(1104, null),
      kind: this.kind
    };
  }
};

RelativePathProvider = __decorateClass([
  __decorateParam(0, IWorkspaceContextService)
], RelativePathProvider);

var PasteHtmlProvider = class {
  constructor() {
    this.kind = new HierarchicalKind("html");
    this.providedPasteEditKinds = [this.kind];
    this.copyMimeTypes = [];
    this.pasteMimeTypes = ["text/html"];
    this._yieldTo = [{ mimeType: Mimes.text }];
  }
  async provideDocumentPasteEdits(_model, _ranges, dataTransfer, context2, token) {
    if (context2.triggerKind !== 1 /* PasteAs */ && !context2.only?.contains(this.kind)) {
      return;
    }
    const entry = dataTransfer.get("text/html");
    const htmlText = await entry?.asString();
    if (!htmlText || token.isCancellationRequested) {
      return;
    }
    return {
      dispose() {
      },
      edits: [{
        insertText: htmlText,
        yieldTo: this._yieldTo,
        title: localize(1108, null),
        kind: this.kind
      }]
    };
  }
};

async function extractUriList(dataTransfer) {
  const urlListEntry = dataTransfer.get(Mimes.uriList);
  if (!urlListEntry) {
    return [];
  }
  const strUriList = await urlListEntry.asString();
  const entries2 = [];
  for (const entry of UriList.parse(strUriList)) {
    try {
      entries2.push({ uri: URI.parse(entry), originalText: entry });
    } catch {
    }
  }
  return entries2;
}

var genericLanguageSelector = { scheme: "*", hasAccessToAllModels: true };

var DefaultDropProvidersFeature = class extends Disposable {
  constructor(languageFeaturesService, workspaceContextService) {
    super();
    this._register(languageFeaturesService.documentDropEditProvider.register(genericLanguageSelector, new DefaultTextPasteOrDropEditProvider()));
    this._register(languageFeaturesService.documentDropEditProvider.register(genericLanguageSelector, new PathProvider()));
    this._register(languageFeaturesService.documentDropEditProvider.register(genericLanguageSelector, new RelativePathProvider(workspaceContextService)));
  }
};

DefaultDropProvidersFeature = __decorateClass([
  __decorateParam(0, ILanguageFeaturesService),
  __decorateParam(1, IWorkspaceContextService)
], DefaultDropProvidersFeature);

var DefaultPasteProvidersFeature = class extends Disposable {
  constructor(languageFeaturesService, workspaceContextService) {
    super();
    this._register(languageFeaturesService.documentPasteEditProvider.register(genericLanguageSelector, new DefaultTextPasteOrDropEditProvider()));
    this._register(languageFeaturesService.documentPasteEditProvider.register(genericLanguageSelector, new PathProvider()));
    this._register(languageFeaturesService.documentPasteEditProvider.register(genericLanguageSelector, new RelativePathProvider(workspaceContextService)));
    this._register(languageFeaturesService.documentPasteEditProvider.register(genericLanguageSelector, new PasteHtmlProvider()));
  }
};

DefaultPasteProvidersFeature = __decorateClass([
  __decorateParam(0, ILanguageFeaturesService),
  __decorateParam(1, IWorkspaceContextService)
], DefaultPasteProvidersFeature);
export { extractUriList, SimplePasteAndDropProvider, DefaultTextPasteOrDropEditProvider, PathProvider, RelativePathProvider, PasteHtmlProvider, genericLanguageSelector, DefaultDropProvidersFeature, DefaultPasteProvidersFeature };
