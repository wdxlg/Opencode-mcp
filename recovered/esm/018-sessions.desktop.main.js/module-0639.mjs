// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/highlightedlabel/highlightedLabel.ts
import { Disposable } from "./module-0012.mjs";
import { $, append, reset } from "./module-0075.mjs";
import { equals4 } from "./module-0098.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { getBaseLayerHoverDelegate } from "./module-0472.mjs";


// src/vs/base/browser/ui/highlightedlabel/highlightedLabel.ts
var HighlightedLabel = class _HighlightedLabel extends Disposable {
  /**
   * Create a new {@link HighlightedLabel}.
   *
   * @param container The parent container to append to.
   */
  constructor(container2, options3) {
    super();
    this.options = options3;
    this.text = "";
    this.title = "";
    this.highlights = [];
    this.didEverRender = false;
    this.domNode = append(container2, $("span.monaco-highlighted-label"));
  }
  /**
   * The label's DOM node.
   */
  get element() {
    return this.domNode;
  }
  /**
   * Set the label and highlights.
   *
   * @param text The label to display.
   * @param highlights The ranges to highlight.
   * @param title An optional title for the hover tooltip.
   * @param escapeNewLines Whether to escape new lines.
   * @returns
   */
  set(text2, highlights = [], title = "", escapeNewLines, supportIcons) {
    if (!text2) {
      text2 = "";
    }
    if (escapeNewLines) {
      text2 = _HighlightedLabel.escapeNewLines(text2, highlights);
    }
    if (this.didEverRender && this.text === text2 && this.title === title && equals4(this.highlights, highlights)) {
      return;
    }
    this.text = text2;
    this.title = title;
    this.highlights = highlights;
    this.render(supportIcons);
  }
  render(supportIcons) {
    const children = [];
    let pos = 0;
    for (const highlight of this.highlights) {
      if (highlight.end === highlight.start) {
        continue;
      }
      if (pos < highlight.start) {
        const substring2 = this.text.substring(pos, highlight.start);
        if (supportIcons) {
          children.push(...renderLabelWithIcons(substring2, true));
        } else {
          children.push(substring2);
        }
        pos = highlight.start;
      }
      const substring = this.text.substring(pos, highlight.end);
      const element = $("span.highlight", void 0, ...supportIcons ? renderLabelWithIcons(substring, true) : [substring]);
      if (highlight.extraClasses) {
        element.classList.add(...highlight.extraClasses);
      }
      children.push(element);
      pos = highlight.end;
    }
    if (pos < this.text.length) {
      const substring = this.text.substring(pos);
      if (supportIcons) {
        children.push(...renderLabelWithIcons(substring, true));
      } else {
        children.push(substring);
      }
    }
    reset(this.domNode, ...children);
    if (!this.customHover && this.title !== "") {
      const hoverDelegate = this.options?.hoverDelegate ?? getDefaultHoverDelegate("mouse");
      this.customHover = this._register(getBaseLayerHoverDelegate().setupManagedHover(hoverDelegate, this.domNode, this.title));
    } else if (this.customHover) {
      this.customHover.update(this.title);
    }
    this.didEverRender = true;
  }
  static escapeNewLines(text2, highlights) {
    let total = 0;
    let extra = 0;
    return text2.replace(/\r\n|\r|\n/g, (match2, offset) => {
      extra = match2 === "\r\n" ? -1 : 0;
      offset += total;
      for (const highlight of highlights) {
        if (highlight.end <= offset) {
          continue;
        }
        if (highlight.start >= offset) {
          highlight.start += extra;
        }
        if (highlight.end >= offset) {
          highlight.end += extra;
        }
      }
      total += extra;
      return "\u23CE";
    });
  }
};
export { HighlightedLabel };
