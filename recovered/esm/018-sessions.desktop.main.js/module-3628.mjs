// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/responseSelectionResolver.ts
import { getWindow } from "./module-0075.mjs";
import { isResponseVM } from "./module-0979.mjs";


// src/vs/sessions/contrib/chat/browser/responseSelectionResolver.ts
var markdownScopeSelector = ".chat-markdown-part";

var excludedAncestorSelectors = [".monaco-editor", ".chat-tool-invocation-part"];

function closestElement(node) {
  return node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement ?? void 0;
}

function isAssistantMarkdownEndpoint(node, widgetDomNode) {
  const element = closestElement(node);
  if (!element || !widgetDomNode.contains(element) || !element.closest(markdownScopeSelector)) {
    return false;
  }
  return !excludedAncestorSelectors.some((selector) => element.closest(selector));
}

function contributingTextEndpoints(range2) {
  const container2 = range2.commonAncestorContainer;
  const scope = container2.nodeType === Node.TEXT_NODE ? container2.parentNode : container2;
  const doc = scope?.ownerDocument;
  if (!scope || !doc) {
    return void 0;
  }
  const walker = doc.createTreeWalker(scope, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return NodeFilter.FILTER_ACCEPT;
      }
      const element = node;
      if (element.checkVisibility()) {
        return NodeFilter.FILTER_SKIP;
      }
      const display = getWindow(element).getComputedStyle(element).display;
      return display === "contents" ? NodeFilter.FILTER_SKIP : NodeFilter.FILTER_REJECT;
    }
  });
  let first2;
  let last;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text2 = node;
    if (!range2.intersectsNode(text2)) {
      continue;
    }
    const start = text2 === range2.startContainer ? range2.startOffset : 0;
    const end = text2 === range2.endContainer ? range2.endOffset : text2.data.length;
    if (!text2.data.slice(start, end).trim()) {
      continue;
    }
    first2 ??= text2;
    last = text2;
  }
  return first2 && last ? { first: first2, last } : void 0;
}

function resolveResponseSelection(widget) {
  const nativeSelection = getWindow(widget.domNode).getSelection();
  if (!nativeSelection || nativeSelection.isCollapsed || !nativeSelection.rangeCount || !nativeSelection.toString().trim()) {
    return void 0;
  }
  const range2 = nativeSelection.getRangeAt(0);
  const endpoints = contributingTextEndpoints(range2);
  if (!endpoints || !isAssistantMarkdownEndpoint(endpoints.first, widget.domNode) || !isAssistantMarkdownEndpoint(endpoints.last, widget.domNode)) {
    return void 0;
  }
  const firstElement = closestElement(endpoints.first);
  const lastElement = closestElement(endpoints.last);
  if (!firstElement || !lastElement) {
    return void 0;
  }
  const firstItem = widget.getElementFromNode(firstElement);
  const lastItem = widget.getElementFromNode(lastElement);
  if (!firstItem || firstItem !== lastItem || !isResponseVM(firstItem)) {
    return void 0;
  }
  return { response: firstItem, text: nativeSelection.toString().trimEnd(), range: range2.cloneRange() };
}
export { closestElement, isAssistantMarkdownEndpoint, contributingTextEndpoints, resolveResponseSelection, markdownScopeSelector, excludedAncestorSelectors };
