// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/keybindingLabel/keybindingLabel.ts
import { $, append, clearNode } from "./module-0075.mjs";
import { Disposable } from "./module-0012.mjs";
import { getBaseLayerHoverDelegate } from "./module-0472.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { UILabelProvider } from "./module-0504.mjs";
import { localize } from "./module-0001.mjs";
import { equals4 } from "./module-0098.mjs";


// src/vs/base/browser/ui/keybindingLabel/keybindingLabel.ts
var $4 = $;

var unthemedKeybindingLabelOptions = {
  keybindingLabelBackground: void 0,
  keybindingLabelForeground: void 0,
  keybindingLabelBorder: void 0,
  keybindingLabelBottomBorder: void 0,
  keybindingLabelShadow: void 0
};

var KeybindingLabel = class _KeybindingLabel extends Disposable {
  constructor(container2, os, options3) {
    super();
    this.os = os;
    this.keyElements = /* @__PURE__ */ new Set();
    this.options = options3 || /* @__PURE__ */ Object.create(null);
    const labelForeground = this.options.keybindingLabelForeground;
    this.domNode = append(container2, $4(".monaco-keybinding"));
    if (labelForeground) {
      this.domNode.style.color = labelForeground;
    }
    this.hover = this._register(getBaseLayerHoverDelegate().setupManagedHover(getDefaultHoverDelegate("mouse"), this.domNode, ""));
    this.didEverRender = false;
    container2.appendChild(this.domNode);
  }
  get element() {
    return this.domNode;
  }
  set(keybinding, matches2) {
    if (this.didEverRender && this.keybinding === keybinding && _KeybindingLabel.areSame(this.matches, matches2)) {
      return;
    }
    this.keybinding = keybinding;
    this.matches = matches2;
    this.render();
  }
  render() {
    this.clear();
    if (this.keybinding) {
      const chords = this.keybinding.getChords();
      if (chords[0]) {
        this.renderChord(this.domNode, chords[0], this.matches ? this.matches.firstPart : null);
      }
      for (let i2 = 1; i2 < chords.length; i2++) {
        append(this.domNode, $4("span.monaco-keybinding-key-chord-separator", void 0, " "));
        this.renderChord(this.domNode, chords[i2], this.matches ? this.matches.chordPart : null);
      }
      const title = this.options.disableTitle ?? false ? void 0 : this.keybinding.getAriaLabel() || void 0;
      this.hover.update(title);
      this.domNode.setAttribute("aria-label", title || "");
    } else if (this.options && this.options.renderUnboundKeybindings) {
      this.renderUnbound(this.domNode);
    }
    this.didEverRender = true;
  }
  clear() {
    clearNode(this.domNode);
    this.keyElements.clear();
  }
  renderChord(parent, chord, match2) {
    const modifierLabels = UILabelProvider.modifierLabels[this.os];
    if (chord.ctrlKey) {
      this.renderKey(parent, modifierLabels.ctrlKey, Boolean(match2?.ctrlKey), modifierLabels.separator);
    }
    if (chord.shiftKey) {
      this.renderKey(parent, modifierLabels.shiftKey, Boolean(match2?.shiftKey), modifierLabels.separator);
    }
    if (chord.altKey) {
      this.renderKey(parent, modifierLabels.altKey, Boolean(match2?.altKey), modifierLabels.separator);
    }
    if (chord.metaKey) {
      this.renderKey(parent, modifierLabels.metaKey, Boolean(match2?.metaKey), modifierLabels.separator);
    }
    const keyLabel = chord.keyLabel;
    if (keyLabel) {
      this.renderKey(parent, keyLabel, Boolean(match2?.keyCode), "");
    }
  }
  renderKey(parent, label3, highlight, separator2) {
    append(parent, this.createKeyElement(label3, highlight ? ".highlight" : ""));
    if (separator2) {
      append(parent, $4("span.monaco-keybinding-key-separator", void 0, separator2));
    }
  }
  renderUnbound(parent) {
    append(parent, this.createKeyElement(localize(25, null)));
  }
  createKeyElement(label3, extraClass = "") {
    const keyElement = $4("span.monaco-keybinding-key" + extraClass, void 0, label3);
    this.keyElements.add(keyElement);
    if (this.options.keybindingLabelBackground) {
      keyElement.style.backgroundColor = this.options.keybindingLabelBackground;
    }
    if (this.options.keybindingLabelBorder) {
      keyElement.style.borderColor = this.options.keybindingLabelBorder;
    }
    if (this.options.keybindingLabelBottomBorder) {
      keyElement.style.borderBottomColor = this.options.keybindingLabelBottomBorder;
    }
    if (this.options.keybindingLabelShadow) {
      keyElement.style.boxShadow = `inset 0 -1px 0 ${this.options.keybindingLabelShadow}`;
    }
    return keyElement;
  }
  static areSame(a, b) {
    if (a === b || !a && !b) {
      return true;
    }
    return !!a && !!b && equals4(a.firstPart, b.firstPart) && equals4(a.chordPart, b.chordPart);
  }
};
export { $4, unthemedKeybindingLabelOptions, KeybindingLabel };
