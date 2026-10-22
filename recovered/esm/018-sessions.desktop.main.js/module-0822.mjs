// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/links/browser/links.ts
import { Disposable } from "./module-0012.mjs";
import { RunOnceScheduler, createCancelablePromise } from "./module-0036.mjs";
import { ClickLinkGesture } from "./module-0619.mjs";
import { getLinks } from "./module-0821.mjs";
import { StopWatch } from "./module-0016.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { Schemas } from "./module-0033.mjs";
import { URI } from "./module-0032.mjs";
import { joinPath, originalFSPath } from "./module-0034.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { INotificationService } from "./module-0336.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { ILanguageFeatureDebounceService } from "./module-0572.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { EditorAction, registerEditorAction, registerEditorContribution } from "./module-0097.mjs";


// src/vs/editor/contrib/links/browser/links.ts
var LinkDetector = class extends Disposable {
  constructor(editor, openerService, notificationService, languageFeaturesService, languageFeatureDebounceService) {
    super();
    this.editor = editor;
    this.openerService = openerService;
    this.notificationService = notificationService;
    this.languageFeaturesService = languageFeaturesService;
    this.providers = this.languageFeaturesService.linkProvider;
    this.debounceInformation = languageFeatureDebounceService.for(this.providers, "Links", { min: 1e3, max: 4e3 });
    this.computeLinks = this._register(new RunOnceScheduler(() => this.computeLinksNow(), 1e3));
    this.computePromise = null;
    this.activeLinksList = null;
    this.currentOccurrences = {};
    this.activeLinkDecorationId = null;
    const clickLinkGesture = this._register(new ClickLinkGesture(editor));
    this._register(clickLinkGesture.onMouseMoveOrRelevantKeyDown(([mouseEvent, keyboardEvent]) => {
      this._onEditorMouseMove(mouseEvent, keyboardEvent);
    }));
    this._register(clickLinkGesture.onExecute((e4) => {
      this.onEditorMouseUp(e4);
    }));
    this._register(clickLinkGesture.onCancel((e4) => {
      this.cleanUpActiveLinkDecoration();
    }));
    this._register(editor.onDidChangeConfiguration((e4) => {
      if (!e4.hasChanged(79 /* links */)) {
        return;
      }
      this.updateDecorations([]);
      this.stop();
      this.computeLinks.schedule(0);
    }));
    this._register(editor.onDidChangeModelContent((e4) => {
      if (!this.editor.hasModel()) {
        return;
      }
      this.computeLinks.schedule(this.debounceInformation.get(this.editor.getModel()));
    }));
    this._register(editor.onDidChangeModel((e4) => {
      this.currentOccurrences = {};
      this.activeLinkDecorationId = null;
      this.stop();
      this.computeLinks.schedule(0);
    }));
    this._register(editor.onDidChangeModelLanguage((e4) => {
      this.stop();
      this.computeLinks.schedule(0);
    }));
    this._register(this.providers.onDidChange((e4) => {
      this.stop();
      this.computeLinks.schedule(0);
    }));
    this.computeLinks.schedule(0);
  }
  static {
    this.ID = "editor.linkDetector";
  }
  static get(editor) {
    return editor.getContribution(LinkDetector.ID);
  }
  async computeLinksNow() {
    if (!this.editor.hasModel() || !this.editor.getOption(79 /* links */)) {
      return;
    }
    const model = this.editor.getModel();
    if (model.isTooLargeForSyncing()) {
      return;
    }
    if (!this.providers.has(model)) {
      return;
    }
    if (this.activeLinksList) {
      this.activeLinksList.dispose();
      this.activeLinksList = null;
    }
    this.computePromise = createCancelablePromise((token) => getLinks(this.providers, model, token));
    try {
      const sw = new StopWatch(false);
      this.activeLinksList = await this.computePromise;
      this.debounceInformation.update(model, sw.elapsed());
      if (model.isDisposed()) {
        return;
      }
      this.updateDecorations(this.activeLinksList.links);
    } catch (err) {
      onUnexpectedError(err);
    } finally {
      this.computePromise = null;
    }
  }
  updateDecorations(links) {
    const useMetaKey = this.editor.getOption(86 /* multiCursorModifier */) === "altKey";
    const oldDecorations = [];
    const keys = Object.keys(this.currentOccurrences);
    for (const decorationId of keys) {
      const occurence = this.currentOccurrences[decorationId];
      oldDecorations.push(occurence.decorationId);
    }
    const newDecorations = [];
    if (links) {
      for (const link2 of links) {
        newDecorations.push(LinkOccurrence.decoration(link2, useMetaKey));
      }
    }
    this.editor.changeDecorations((changeAccessor) => {
      const decorations = changeAccessor.deltaDecorations(oldDecorations, newDecorations);
      this.currentOccurrences = {};
      this.activeLinkDecorationId = null;
      for (let i2 = 0, len = decorations.length; i2 < len; i2++) {
        const occurence = new LinkOccurrence(links[i2], decorations[i2]);
        this.currentOccurrences[occurence.decorationId] = occurence;
      }
    });
  }
  _onEditorMouseMove(mouseEvent, withKey) {
    const useMetaKey = this.editor.getOption(86 /* multiCursorModifier */) === "altKey";
    if (this.isEnabled(mouseEvent, withKey)) {
      this.cleanUpActiveLinkDecoration();
      const occurrence = this.getLinkOccurrence(mouseEvent.target.position);
      if (occurrence) {
        this.editor.changeDecorations((changeAccessor) => {
          occurrence.activate(changeAccessor, useMetaKey);
          this.activeLinkDecorationId = occurrence.decorationId;
        });
      }
    } else {
      this.cleanUpActiveLinkDecoration();
    }
  }
  cleanUpActiveLinkDecoration() {
    const useMetaKey = this.editor.getOption(86 /* multiCursorModifier */) === "altKey";
    if (this.activeLinkDecorationId) {
      const occurrence = this.currentOccurrences[this.activeLinkDecorationId];
      if (occurrence) {
        this.editor.changeDecorations((changeAccessor) => {
          occurrence.deactivate(changeAccessor, useMetaKey);
        });
      }
      this.activeLinkDecorationId = null;
    }
  }
  onEditorMouseUp(mouseEvent) {
    if (!this.isEnabled(mouseEvent)) {
      return;
    }
    const occurrence = this.getLinkOccurrence(mouseEvent.target.position);
    if (!occurrence) {
      return;
    }
    this.openLinkOccurrence(
      occurrence,
      mouseEvent.hasSideBySideModifier,
      true
      /* from user gesture */
    );
  }
  openLinkOccurrence(occurrence, openToSide, fromUserGesture = false) {
    if (!this.openerService) {
      return;
    }
    const { link: link2 } = occurrence;
    link2.resolve(CancellationToken.None).then((uri4) => {
      if (typeof uri4 === "string" && this.editor.hasModel()) {
        const modelUri = this.editor.getModel().uri;
        if (modelUri.scheme === Schemas.file && uri4.startsWith(`${Schemas.file}:`)) {
          const parsedUri = URI.parse(uri4);
          if (parsedUri.scheme === Schemas.file) {
            const fsPath = originalFSPath(parsedUri);
            let relativePath2 = null;
            if (fsPath.startsWith("/./") || fsPath.startsWith("\\.\\")) {
              relativePath2 = `.${fsPath.substr(1)}`;
            } else if (fsPath.startsWith("//./") || fsPath.startsWith("\\\\.\\")) {
              relativePath2 = `.${fsPath.substr(2)}`;
            }
            if (relativePath2) {
              uri4 = joinPath(modelUri, relativePath2);
            }
          }
        }
      }
      return this.openerService.open(uri4, { openToSide, fromUserGesture, allowContributedOpeners: true, allowCommands: true, fromWorkspace: true });
    }, (err) => {
      const messageOrError = err instanceof Error ? err.message : err;
      if (messageOrError === "invalid") {
        this.notificationService.warn(localize(1462, null, link2.url.toString()));
      } else if (messageOrError === "missing") {
        this.notificationService.warn(localize(1470, null));
      } else {
        onUnexpectedError(err);
      }
    });
  }
  getLinkOccurrence(position2) {
    if (!this.editor.hasModel() || !position2) {
      return null;
    }
    const decorations = this.editor.getModel().getDecorationsInRange({
      startLineNumber: position2.lineNumber,
      startColumn: position2.column,
      endLineNumber: position2.lineNumber,
      endColumn: position2.column
    }, 0, true);
    for (const decoration3 of decorations) {
      const currentOccurrence = this.currentOccurrences[decoration3.id];
      if (currentOccurrence) {
        return currentOccurrence;
      }
    }
    return null;
  }
  isEnabled(mouseEvent, withKey) {
    return Boolean(
      mouseEvent.target.type === 6 /* CONTENT_TEXT */ && (mouseEvent.hasTriggerModifier || withKey && withKey.keyCodeIsTriggerKey || mouseEvent.isMiddleClick && mouseEvent.mouseMiddleClickAction === "openLink")
    );
  }
  stop() {
    this.computeLinks.cancel();
    if (this.activeLinksList) {
      this.activeLinksList?.dispose();
      this.activeLinksList = null;
    }
    if (this.computePromise) {
      this.computePromise.cancel();
      this.computePromise = null;
    }
  }
  dispose() {
    super.dispose();
    this.stop();
  }
};

LinkDetector = __decorateClass([
  __decorateParam(1, IOpenerService),
  __decorateParam(2, INotificationService),
  __decorateParam(3, ILanguageFeaturesService),
  __decorateParam(4, ILanguageFeatureDebounceService)
], LinkDetector);

var decoration = {
  general: ModelDecorationOptions.register({
    description: "detected-link",
    stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
    collapseOnReplaceEdit: true,
    inlineClassName: "detected-link"
  }),
  active: ModelDecorationOptions.register({
    description: "detected-link-active",
    stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
    collapseOnReplaceEdit: true,
    inlineClassName: "detected-link-active"
  })
};

var LinkOccurrence = class _LinkOccurrence {
  static decoration(link2, useMetaKey) {
    return {
      range: link2.range,
      options: _LinkOccurrence._getOptions(link2, useMetaKey, false)
    };
  }
  static _getOptions(link2, useMetaKey, isActive2) {
    const options3 = { ...isActive2 ? decoration.active : decoration.general };
    options3.hoverMessage = getHoverMessage(link2, useMetaKey);
    return options3;
  }
  constructor(link2, decorationId) {
    this.link = link2;
    this.decorationId = decorationId;
  }
  activate(changeAccessor, useMetaKey) {
    changeAccessor.changeDecorationOptions(this.decorationId, _LinkOccurrence._getOptions(this.link, useMetaKey, true));
  }
  deactivate(changeAccessor, useMetaKey) {
    changeAccessor.changeDecorationOptions(this.decorationId, _LinkOccurrence._getOptions(this.link, useMetaKey, false));
  }
};

function getHoverMessage(link2, useMetaKey) {
  const executeCmd = link2.url && /^command:/i.test(link2.url.toString());
  const label3 = link2.tooltip ? link2.tooltip : executeCmd ? localize(1464, null) : localize(1465, null);
  const kb = useMetaKey ? isMacintosh ? localize(1469, null) : localize(1468, null) : isMacintosh ? localize(1467, null) : localize(1466, null);
  if (link2.url) {
    let nativeLabel = "";
    if (/^command:/i.test(link2.url.toString())) {
      const match2 = link2.url.toString().match(/^command:([^?#]+)/);
      if (match2) {
        const commandId = match2[1];
        nativeLabel = localize(1471, null, commandId);
      }
    }
    const hoverMessage = new MarkdownString("", true).appendLink(link2.url.toString(true).replace(/ /g, "%20"), label3, nativeLabel).appendMarkdown(` (${kb})`);
    return hoverMessage;
  } else {
    return new MarkdownString().appendText(`${label3} (${kb})`);
  }
}

var OpenLinkAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.openLink",
      label: localize2(1463, "Open Link"),
      precondition: void 0
    });
  }
  run(accessor, editor) {
    const linkDetector = LinkDetector.get(editor);
    if (!linkDetector) {
      return;
    }
    if (!editor.hasModel()) {
      return;
    }
    const selections = editor.getSelections();
    for (const sel of selections) {
      const link2 = linkDetector.getLinkOccurrence(sel.getEndPosition());
      if (link2) {
        linkDetector.openLinkOccurrence(link2, false);
      }
    }
  }
};

registerEditorContribution(LinkDetector.ID, LinkDetector, 1 /* AfterFirstRender */);

registerEditorAction(OpenLinkAction);
export { getHoverMessage, LinkDetector, decoration, LinkOccurrence, OpenLinkAction };
