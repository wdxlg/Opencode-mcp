// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/enablementStatusWidget.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { reset } from "./module-0075.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/browser/enablementStatusWidget.ts
var EnablementStatusWidget = class extends Disposable {
  constructor(_container, enablement, _labels, _markdownRendererService) {
    super();
    this._container = _container;
    this._labels = _labels;
    this._markdownRendererService = _markdownRendererService;
    this._renderDisposables = this._register(new MutableDisposable());
    this._register(autorun((reader) => {
      this._render(enablement.read(reader));
    }));
  }
  _render(state) {
    reset(this._container);
    this._renderDisposables.value = void 0;
    let message;
    if (state === 0 /* DisabledProfile */) {
      message = this._labels.disabledProfile;
    } else if (state === 1 /* DisabledWorkspace */) {
      message = this._labels.disabledWorkspace;
    }
    if (!message) {
      return;
    }
    const markdown = new MarkdownString("", { isTrusted: true, supportThemeIcons: true });
    markdown.appendMarkdown(`$(${Codicon.info.id})&nbsp;`);
    markdown.appendText(message);
    const rendered = this._markdownRendererService.render(markdown);
    this._renderDisposables.value = rendered;
    this._container.appendChild(rendered.element);
  }
};

EnablementStatusWidget = __decorateClass([
  __decorateParam(3, IMarkdownRendererService)
], EnablementStatusWidget);

var pluginEnablementLabels = {
  disabledProfile: localize(11334, null),
  disabledWorkspace: localize(11335, null)
};

var mcpServerEnablementLabels = {
  disabledProfile: localize(11332, null),
  disabledWorkspace: localize(11333, null)
};
export { EnablementStatusWidget, pluginEnablementLabels, mcpServerEnablementLabels };
