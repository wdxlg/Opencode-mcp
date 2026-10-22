// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/parameterHints/browser/parameterHintsWidget.ts
import { $, EventHelper, addDisposableListener, append } from "./module-0075.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Context2 } from "./module-0828.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { EDITOR_FONT_DEFAULTS } from "./module-0101.mjs";
import { Event2 } from "./module-0017.mjs";
import { alert } from "./module-0076.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { escapeRegExpCharacters } from "./module-0030.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { registerColor } from "./module-0226.mjs";
import { listHighlightForeground } from "./module-0232.mjs";


// src/vs/editor/contrib/parameterHints/browser/parameterHintsWidget.ts
var $16 = $;

var parameterHintsNextIcon = registerIcon("parameter-hints-next", Codicon.chevronDown, localize(1499, null));

var parameterHintsPreviousIcon = registerIcon("parameter-hints-previous", Codicon.chevronUp, localize(1500, null));

var ParameterHintsWidget = class extends Disposable {
  constructor(editor, model, contextKeyService, markdownRendererService) {
    super();
    this.editor = editor;
    this.model = model;
    this.markdownRendererService = markdownRendererService;
    this.renderDisposeables = this._register(new DisposableStore());
    this.visible = false;
    this.announcedLabel = null;
    // Editor.IContentWidget.allowEditorOverflow
    this.allowEditorOverflow = true;
    this.keyVisible = Context2.Visible.bindTo(contextKeyService);
    this.keyMultipleSignatures = Context2.MultipleSignatures.bindTo(contextKeyService);
  }
  static {
    this.ID = "editor.widget.parameterHintsWidget";
  }
  createParameterHintDOMNodes() {
    const element = $16(".editor-widget.parameter-hints-widget");
    const wrapper = append(element, $16(".phwrapper"));
    wrapper.tabIndex = -1;
    const controls = append(wrapper, $16(".controls"));
    const previous = append(controls, $16(".button" + ThemeIcon.asCSSSelector(parameterHintsPreviousIcon)));
    const overloads = append(controls, $16(".overloads"));
    const next = append(controls, $16(".button" + ThemeIcon.asCSSSelector(parameterHintsNextIcon)));
    this._register(addDisposableListener(previous, "click", (e4) => {
      EventHelper.stop(e4);
      this.previous();
    }));
    this._register(addDisposableListener(next, "click", (e4) => {
      EventHelper.stop(e4);
      this.next();
    }));
    const body = $16(".body");
    const scrollbar = new DomScrollableElement(body, {
      alwaysConsumeMouseWheel: true
    });
    this._register(scrollbar);
    wrapper.appendChild(scrollbar.getDomNode());
    const signature = append(body, $16(".signature"));
    const docs = append(body, $16(".docs"));
    element.style.userSelect = "text";
    this.domNodes = {
      element,
      signature,
      overloads,
      docs,
      scrollbar
    };
    this.editor.addContentWidget(this);
    this.hide();
    this._register(this.editor.onDidChangeCursorSelection((e4) => {
      if (this.visible) {
        this.editor.layoutContentWidget(this);
      }
    }));
    const updateFont = () => {
      if (!this.domNodes) {
        return;
      }
      const fontInfo = this.editor.getOption(59 /* fontInfo */);
      const element2 = this.domNodes.element;
      element2.style.fontSize = `${fontInfo.fontSize}px`;
      element2.style.lineHeight = `${fontInfo.lineHeight / fontInfo.fontSize}`;
      element2.style.setProperty("--vscode-parameterHintsWidget-editorFontFamily", fontInfo.fontFamily);
      element2.style.setProperty("--vscode-parameterHintsWidget-editorFontFamilyDefault", EDITOR_FONT_DEFAULTS.fontFamily);
    };
    updateFont();
    this._register(Event2.chain(
      this.editor.onDidChangeConfiguration.bind(this.editor),
      ($129) => $129.filter((e4) => e4.hasChanged(59 /* fontInfo */))
    )(updateFont));
    this._register(this.editor.onDidLayoutChange((e4) => this.updateMaxHeight()));
    this.updateMaxHeight();
  }
  show() {
    if (this.visible) {
      return;
    }
    if (!this.domNodes) {
      this.createParameterHintDOMNodes();
    }
    this.keyVisible.set(true);
    this.visible = true;
    setTimeout(() => {
      this.domNodes?.element.classList.add("visible");
    }, 100);
    this.editor.layoutContentWidget(this);
  }
  hide() {
    this.renderDisposeables.clear();
    if (!this.visible) {
      return;
    }
    this.keyVisible.reset();
    this.visible = false;
    this.announcedLabel = null;
    this.domNodes?.element.classList.remove("visible");
    this.editor.layoutContentWidget(this);
  }
  getPosition() {
    if (this.visible) {
      return {
        position: this.editor.getPosition(),
        preference: [1 /* ABOVE */, 2 /* BELOW */]
      };
    }
    return null;
  }
  render(hints) {
    this.renderDisposeables.clear();
    if (!this.domNodes) {
      return;
    }
    const multiple = hints.signatures.length > 1;
    this.domNodes.element.classList.toggle("multiple", multiple);
    this.keyMultipleSignatures.set(multiple);
    this.domNodes.signature.innerText = "";
    this.domNodes.docs.innerText = "";
    const signature = hints.signatures[hints.activeSignature];
    if (!signature) {
      return;
    }
    const code = append(this.domNodes.signature, $16(".code"));
    const hasParameters = signature.parameters.length > 0;
    const activeParameterIndex = signature.activeParameter ?? hints.activeParameter;
    if (!hasParameters) {
      const label3 = append(code, $16("span"));
      label3.textContent = signature.label;
    } else {
      this.renderParameters(code, signature, activeParameterIndex);
    }
    const activeParameter = signature.parameters[activeParameterIndex];
    if (activeParameter?.documentation) {
      const documentation = $16("span.documentation");
      if (typeof activeParameter.documentation === "string") {
        documentation.textContent = activeParameter.documentation;
      } else {
        const renderedContents = this.renderMarkdownDocs(activeParameter.documentation);
        documentation.appendChild(renderedContents.element);
      }
      append(this.domNodes.docs, $16("p", {}, documentation));
    }
    if (signature.documentation === void 0) {
    } else if (typeof signature.documentation === "string") {
      append(this.domNodes.docs, $16("p", {}, signature.documentation));
    } else {
      const renderedContents = this.renderMarkdownDocs(signature.documentation);
      append(this.domNodes.docs, renderedContents.element);
    }
    const hasDocs = this.hasDocs(signature, activeParameter);
    this.domNodes.signature.classList.toggle("has-docs", hasDocs);
    this.domNodes.docs.classList.toggle("empty", !hasDocs);
    this.domNodes.overloads.textContent = String(hints.activeSignature + 1).padStart(hints.signatures.length.toString().length, "0") + "/" + hints.signatures.length;
    if (activeParameter) {
      let labelToAnnounce = "";
      const param = signature.parameters[activeParameterIndex];
      if (Array.isArray(param.label)) {
        labelToAnnounce = signature.label.substring(param.label[0], param.label[1]);
      } else {
        labelToAnnounce = param.label;
      }
      if (param.documentation) {
        labelToAnnounce += typeof param.documentation === "string" ? `, ${param.documentation}` : `, ${param.documentation.value}`;
      }
      if (signature.documentation) {
        labelToAnnounce += typeof signature.documentation === "string" ? `, ${signature.documentation}` : `, ${signature.documentation.value}`;
      }
      if (this.announcedLabel !== labelToAnnounce) {
        alert(localize(1498, null, labelToAnnounce));
        this.announcedLabel = labelToAnnounce;
      }
    }
    this.editor.layoutContentWidget(this);
    this.domNodes.scrollbar.scanDomNode();
  }
  renderMarkdownDocs(markdown) {
    const renderedContents = this.renderDisposeables.add(this.markdownRendererService.render(markdown, {
      context: this.editor,
      asyncRenderCallback: () => {
        this.domNodes?.scrollbar.scanDomNode();
      }
    }));
    renderedContents.element.classList.add("markdown-docs");
    return renderedContents;
  }
  hasDocs(signature, activeParameter) {
    if (activeParameter && typeof activeParameter.documentation === "string" && assertReturnsDefined(activeParameter.documentation).length > 0) {
      return true;
    }
    if (activeParameter && typeof activeParameter.documentation === "object" && assertReturnsDefined(activeParameter.documentation).value.length > 0) {
      return true;
    }
    if (signature.documentation && typeof signature.documentation === "string" && assertReturnsDefined(signature.documentation).length > 0) {
      return true;
    }
    if (signature.documentation && typeof signature.documentation === "object" && assertReturnsDefined(signature.documentation.value).length > 0) {
      return true;
    }
    return false;
  }
  renderParameters(parent, signature, activeParameterIndex) {
    const [start, end] = this.getParameterLabelOffsets(signature, activeParameterIndex);
    const beforeSpan = document.createElement("span");
    beforeSpan.textContent = signature.label.substring(0, start);
    const paramSpan = document.createElement("span");
    paramSpan.textContent = signature.label.substring(start, end);
    paramSpan.className = "parameter active";
    const afterSpan = document.createElement("span");
    afterSpan.textContent = signature.label.substring(end);
    append(parent, beforeSpan, paramSpan, afterSpan);
  }
  getParameterLabelOffsets(signature, paramIdx) {
    const param = signature.parameters[paramIdx];
    if (!param) {
      return [0, 0];
    } else if (Array.isArray(param.label)) {
      return param.label;
    } else if (!param.label.length) {
      return [0, 0];
    } else {
      const regex = new RegExp(`(\\W|^)${escapeRegExpCharacters(param.label)}(?=\\W|$)`, "g");
      regex.test(signature.label);
      const idx = regex.lastIndex - param.label.length;
      return idx >= 0 ? [idx, regex.lastIndex] : [0, 0];
    }
  }
  next() {
    this.editor.focus();
    this.model.next();
  }
  previous() {
    this.editor.focus();
    this.model.previous();
  }
  getDomNode() {
    if (!this.domNodes) {
      this.createParameterHintDOMNodes();
    }
    return this.domNodes.element;
  }
  getId() {
    return ParameterHintsWidget.ID;
  }
  updateMaxHeight() {
    if (!this.domNodes) {
      return;
    }
    const height = Math.max(this.editor.getLayoutInfo().height / 4, 250);
    const maxHeight = `${height}px`;
    this.domNodes.element.style.maxHeight = maxHeight;
    const wrapper = this.domNodes.element.getElementsByClassName("phwrapper");
    if (wrapper.length) {
      wrapper[0].style.maxHeight = maxHeight;
    }
  }
};

ParameterHintsWidget = __decorateClass([
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IMarkdownRendererService)
], ParameterHintsWidget);

registerColor("editorHoverWidget.highlightForeground", listHighlightForeground, localize(1497, null));
export { $16, parameterHintsNextIcon, parameterHintsPreviousIcon, ParameterHintsWidget };
