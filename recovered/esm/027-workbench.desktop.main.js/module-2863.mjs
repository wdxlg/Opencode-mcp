// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/editor/chatInputEditorHover.ts
import { ChatRequestDynamicVariablePart, extractAgentAndCommand } from "./module-0987.mjs";
import { Range2 } from "./module-0106.mjs";
import { HoverParticipantRegistry, RenderedHoverParts } from "./module-0575.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { ChatAgentHover, getChatAgentHoverOptions } from "./module-2251.mjs";
import { ChatEditorHoverWrapper } from "./module-2862.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { ICommandService } from "./module-0087.mjs";
import { isImageVariableEntry } from "./module-0979.mjs";
import { coerceImageBuffer } from "./module-1194.mjs";
import { URI } from "./module-0032.mjs";
import { createImageHoverContent } from "./module-2032.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/editor/chatInputEditorHover.ts
var ChatAgentHoverParticipant = class {
  constructor(editor, instantiationService, chatWidgetService, commandService) {
    this.editor = editor;
    this.instantiationService = instantiationService;
    this.chatWidgetService = chatWidgetService;
    this.commandService = commandService;
    this.hoverOrdinal = 1;
  }
  computeSync(anchor, _lineDecorations) {
    if (!this.editor.hasModel()) {
      return [];
    }
    const widget = this.chatWidgetService.getWidgetByInputUri(this.editor.getModel().uri);
    if (!widget) {
      return [];
    }
    const { agentPart } = extractAgentAndCommand(widget.parsedInput);
    if (!agentPart) {
      return [];
    }
    if (Range2.containsPosition(agentPart.editorRange, anchor.range.getStartPosition())) {
      return [new ChatAgentHoverPart(this, Range2.lift(agentPart.editorRange), agentPart.agent)];
    }
    return [];
  }
  renderHoverParts(context2, hoverParts) {
    if (!hoverParts.length) {
      return new RenderedHoverParts([]);
    }
    const disposables = new DisposableStore();
    const hover = disposables.add(this.instantiationService.createInstance(ChatAgentHover));
    disposables.add(hover.onDidChangeContents(() => context2.onContentsChanged()));
    const hoverPart = hoverParts[0];
    const agent = hoverPart.agent;
    hover.setAgent(agent.id);
    const actions = getChatAgentHoverOptions(() => agent, this.commandService).actions;
    const wrapper = this.instantiationService.createInstance(ChatEditorHoverWrapper, hover.domNode, actions);
    const wrapperNode = wrapper.domNode;
    context2.fragment.appendChild(wrapperNode);
    const renderedHoverPart = {
      hoverPart,
      hoverElement: wrapperNode,
      dispose() {
        disposables.dispose();
      }
    };
    return new RenderedHoverParts([renderedHoverPart]);
  }
  getAccessibleContent(hoverPart) {
    return localize(12533, null);
  }
};

ChatAgentHoverParticipant = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IChatWidgetService),
  __decorateParam(3, ICommandService)
], ChatAgentHoverParticipant);

var ChatAgentHoverPart = class {
  constructor(owner, range2, agent) {
    this.owner = owner;
    this.range = range2;
    this.agent = agent;
  }
  isValidForHoverAnchor(anchor) {
    return anchor.type === 1 /* Range */ && this.range.startColumn <= anchor.range.startColumn && this.range.endColumn >= anchor.range.endColumn;
  }
};

HoverParticipantRegistry.register(ChatAgentHoverParticipant);

var ChatAttachmentReferenceHoverParticipant = class {
  constructor(editor, chatWidgetService) {
    this.editor = editor;
    this.chatWidgetService = chatWidgetService;
    this.hoverOrdinal = 2;
  }
  computeSync(anchor, _lineDecorations) {
    if (!this.editor.hasModel()) {
      return [];
    }
    const widget = this.chatWidgetService.getWidgetByInputUri(this.editor.getModel().uri);
    if (!widget) {
      return [];
    }
    const part = widget.parsedInput.parts.find((part2) => part2 instanceof ChatRequestDynamicVariablePart && part2.isAttachmentReference === true && Range2.containsPosition(part2.editorRange, anchor.range.getStartPosition()));
    if (!part) {
      return [];
    }
    const attachment = widget.attachmentModel.attachments.find((attachment2) => attachment2.id === part.id && !attachment2.range);
    if (!attachment || !isImageVariableEntry(attachment)) {
      return [];
    }
    const buffer = coerceImageBuffer(attachment.value);
    return buffer ? [new ChatAttachmentReferenceHoverPart(this, Range2.lift(part.editorRange), attachment, buffer)] : [];
  }
  renderHoverParts(context2, hoverParts) {
    if (!hoverParts.length) {
      return new RenderedHoverParts([]);
    }
    const hoverPart = hoverParts[0];
    const resource = hoverPart.attachment.references?.find((reference) => URI.isUri(reference.reference))?.reference;
    const hover = createImageHoverContent(URI.isUri(resource) ? resource : void 0, hoverPart.attachment.fullName ?? hoverPart.attachment.name, hoverPart.buffer, hoverPart.attachment.id, () => context2.onContentsChanged());
    hover.element.setAttribute("aria-label", localize(12531, null, hoverPart.attachment.name));
    context2.fragment.appendChild(hover.element);
    return new RenderedHoverParts([{
      hoverPart,
      hoverElement: hover.element,
      dispose: () => hover.disposable.dispose()
    }]);
  }
  getAccessibleContent(hoverPart) {
    return localize(12532, null, hoverPart.attachment.name);
  }
};

ChatAttachmentReferenceHoverParticipant = __decorateClass([
  __decorateParam(1, IChatWidgetService)
], ChatAttachmentReferenceHoverParticipant);

var ChatAttachmentReferenceHoverPart = class {
  constructor(owner, range2, attachment, buffer) {
    this.owner = owner;
    this.range = range2;
    this.attachment = attachment;
    this.buffer = buffer;
  }
  isValidForHoverAnchor(anchor) {
    return anchor.type === 1 /* Range */ && Range2.containsPosition(this.range, anchor.range.getStartPosition());
  }
};

HoverParticipantRegistry.register(ChatAttachmentReferenceHoverParticipant);
export { ChatAgentHoverParticipant, ChatAgentHoverPart, ChatAttachmentReferenceHoverParticipant, ChatAttachmentReferenceHoverPart };
