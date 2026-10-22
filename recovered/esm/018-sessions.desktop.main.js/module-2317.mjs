// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatSessionCreatedResultSubPart.ts
import { BaseChatToolInvocationSubPart } from "./module-2298.mjs";
import { $, EventHelper, EventType, addDisposableListener, append } from "./module-0075.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { URI } from "./module-0032.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILinkPresentationService } from "./module-0708.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IOpenerService } from "./module-0272.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatSessionCreatedResultSubPart.ts
var ChatSessionCreatedResultSubPart = class extends BaseChatToolInvocationSubPart {
  constructor(toolInvocation, data, _context, _renderer, linkPresentationService, hoverService, openerService) {
    super(toolInvocation);
    this.data = data;
    this.openerService = openerService;
    this.codeblocks = [];
    this.domNode = $(".chat-open-session-result");
    const link2 = append(this.domNode, $("a.monaco-link", { href: this.data.openLink }, this.data.label));
    const hover = this._register(hoverService.setupManagedHover(
      getDefaultHoverDelegate("mouse"),
      link2,
      this.data.fullTitle ?? this.data.label
    ));
    this._register(addDisposableListener(link2, EventType.CLICK, (event) => {
      EventHelper.stop(event, true);
      void this.openerService.open(URI.parse(this.data.openLink), { fromUserGesture: true, allowContributedOpeners: true });
    }));
    const resource = URI.parse(this.data.openLink);
    const rule = linkPresentationService.getLinkPresentationRule(resource);
    const watcher = rule ? linkPresentationService.createLinkPresentationWatcher(rule.id, resource) : void 0;
    if (watcher) {
      this._register(watcher);
      this._register(autorun((reader) => {
        const presentation2 = watcher.presentation.read(reader);
        const fullTitle = presentation2?.title ?? this.data.fullTitle ?? this.data.label;
        const label3 = fullTitle.length > 60 ? `${fullTitle.slice(0, 57)}\u2026` : fullTitle;
        link2.textContent = label3;
        hover.update(fullTitle);
      }));
    }
  }
};

ChatSessionCreatedResultSubPart = __decorateClass([
  __decorateParam(4, ILinkPresentationService),
  __decorateParam(5, IHoverService),
  __decorateParam(6, IOpenerService)
], ChatSessionCreatedResultSubPart);
export { ChatSessionCreatedResultSubPart };
