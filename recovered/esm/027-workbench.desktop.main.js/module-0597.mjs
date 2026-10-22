// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/formattedTextRenderer.ts
import { addStandardDisposableListener } from "./module-0075.mjs";


// src/vs/base/browser/formattedTextRenderer.ts
function renderText(text2, _options, target) {
  const element = target ?? document.createElement("div");
  element.textContent = text2;
  return element;
}

function renderFormattedText(formattedText, options3, target) {
  const element = target ?? document.createElement("div");
  element.textContent = "";
  _renderFormattedText(element, parseFormattedText(formattedText, !!options3?.renderCodeSegments), options3?.actionHandler, options3?.renderCodeSegments);
  return element;
}

var StringStream = class {
  constructor(source) {
    this.source = source;
    this.index = 0;
  }
  eos() {
    return this.index >= this.source.length;
  }
  next() {
    const next = this.peek();
    this.advance();
    return next;
  }
  peek() {
    return this.source[this.index];
  }
  advance() {
    this.index++;
  }
};

function _renderFormattedText(element, treeNode, actionHandler, renderCodeSegments) {
  let child;
  if (treeNode.type === 2 /* Text */) {
    child = document.createTextNode(treeNode.content || "");
  } else if (treeNode.type === 3 /* Bold */) {
    child = document.createElement("b");
  } else if (treeNode.type === 4 /* Italics */) {
    child = document.createElement("i");
  } else if (treeNode.type === 7 /* Code */ && renderCodeSegments) {
    child = document.createElement("code");
  } else if (treeNode.type === 5 /* Action */ && actionHandler) {
    const a = document.createElement("a");
    actionHandler.disposables.add(addStandardDisposableListener(a, "click", (event) => {
      actionHandler.callback(String(treeNode.index), event);
    }));
    child = a;
  } else if (treeNode.type === 8 /* NewLine */) {
    child = document.createElement("br");
  } else if (treeNode.type === 1 /* Root */) {
    child = element;
  }
  if (child && element !== child) {
    element.appendChild(child);
  }
  if (child && Array.isArray(treeNode.children)) {
    treeNode.children.forEach((nodeChild) => {
      _renderFormattedText(child, nodeChild, actionHandler, renderCodeSegments);
    });
  }
}

function parseFormattedText(content2, parseCodeSegments) {
  const root = {
    type: 1 /* Root */,
    children: []
  };
  let actionViewItemIndex = 0;
  let current = root;
  const stack = [];
  const stream = new StringStream(content2);
  while (!stream.eos()) {
    let next = stream.next();
    const isEscapedFormatType = next === "\\" && formatTagType(stream.peek(), parseCodeSegments) !== 0 /* Invalid */;
    if (isEscapedFormatType) {
      next = stream.next();
    }
    if (!isEscapedFormatType && isFormatTag(next, parseCodeSegments) && next === stream.peek()) {
      stream.advance();
      if (current.type === 2 /* Text */) {
        current = stack.pop();
      }
      const type = formatTagType(next, parseCodeSegments);
      if (current.type === type || current.type === 5 /* Action */ && type === 6 /* ActionClose */) {
        current = stack.pop();
      } else {
        const newCurrent = {
          type,
          children: []
        };
        if (type === 5 /* Action */) {
          newCurrent.index = actionViewItemIndex;
          actionViewItemIndex++;
        }
        current.children.push(newCurrent);
        stack.push(current);
        current = newCurrent;
      }
    } else if (next === "\n") {
      if (current.type === 2 /* Text */) {
        current = stack.pop();
      }
      current.children.push({
        type: 8 /* NewLine */
      });
    } else {
      if (current.type !== 2 /* Text */) {
        const textCurrent = {
          type: 2 /* Text */,
          content: next
        };
        current.children.push(textCurrent);
        stack.push(current);
        current = textCurrent;
      } else {
        current.content += next;
      }
    }
  }
  if (current.type === 2 /* Text */) {
    current = stack.pop();
  }
  if (stack.length) {
  }
  return root;
}

function isFormatTag(char, supportCodeSegments) {
  return formatTagType(char, supportCodeSegments) !== 0 /* Invalid */;
}

function formatTagType(char, supportCodeSegments) {
  switch (char) {
    case "*":
      return 3 /* Bold */;
    case "_":
      return 4 /* Italics */;
    case "[":
      return 5 /* Action */;
    case "]":
      return 6 /* ActionClose */;
    case "`":
      return supportCodeSegments ? 7 /* Code */ : 0 /* Invalid */;
    default:
      return 0 /* Invalid */;
  }
}
export { renderText, renderFormattedText, _renderFormattedText, parseFormattedText, isFormatTag, formatTagType, StringStream };
