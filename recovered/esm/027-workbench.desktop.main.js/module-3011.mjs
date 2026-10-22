// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/interactive/browser/replInputHintContentWidget.ts
import { Disposable } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { status } from "./module-0076.mjs";
import { ReplEditorSettings } from "./module-3010.mjs";
import { $, addDisposableListener } from "./module-0075.mjs";
import { Position } from "./module-0079.mjs";
import { localize } from "./module-0001.mjs";
import { KeybindingLabel } from "./module-0547.mjs";
import { OS } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IKeybindingService } from "./module-0352.mjs";


// src/vs/workbench/contrib/interactive/browser/replInputHintContentWidget.ts
var ReplInputHintContentWidget = class extends Disposable {
  constructor(editor, configurationService, keybindingService) {
    super();
    this.editor = editor;
    this.configurationService = configurationService;
    this.keybindingService = keybindingService;
    this.ariaLabel = "";
    this._register(this.editor.onDidChangeConfiguration((e) => {
      if (this.domNode && e.hasChanged(59 /* fontInfo */)) {
        this.editor.applyFontInfo(this.domNode);
      }
    }));
    const onDidFocusEditorText = Event2.debounce(this.editor.onDidFocusEditorText, () => void 0, 500);
    this._register(onDidFocusEditorText(() => {
      if (this.editor.hasTextFocus() && this.ariaLabel && configurationService.getValue("accessibility.verbosity.replEditor" /* ReplEditor */)) {
        status(this.ariaLabel);
      }
    }));
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(ReplEditorSettings.executeWithShiftEnter)) {
        this.setHint();
      }
    }));
    this.editor.addContentWidget(this);
  }
  static {
    this.ID = "replInput.widget.emptyHint";
  }
  getId() {
    return ReplInputHintContentWidget.ID;
  }
  getPosition() {
    return {
      position: { lineNumber: 1, column: 1 },
      preference: [0 /* EXACT */]
    };
  }
  getDomNode() {
    if (!this.domNode) {
      this.domNode = $(".empty-editor-hint");
      this.domNode.style.width = "max-content";
      this.domNode.style.paddingLeft = "4px";
      this.setHint();
      this._register(addDisposableListener(this.domNode, "click", () => {
        this.editor.focus();
      }));
      this.editor.applyFontInfo(this.domNode);
      const lineHeight = this.editor.getLineHeightForPosition(new Position(1, 1));
      this.domNode.style.lineHeight = lineHeight + "px";
    }
    return this.domNode;
  }
  setHint() {
    if (!this.domNode) {
      return;
    }
    while (this.domNode.firstChild) {
      this.domNode.removeChild(this.domNode.firstChild);
    }
    const hintElement = $("div.empty-hint-text");
    hintElement.style.cursor = "text";
    hintElement.style.whiteSpace = "nowrap";
    const keybinding = this.getKeybinding();
    const keybindingHintLabel = keybinding?.getLabel();
    if (keybinding && keybindingHintLabel) {
      const actionPart = localize(16228, null, keybindingHintLabel);
      const [before, after2] = actionPart.split(keybindingHintLabel).map((fragment) => {
        const hintPart = $("span", void 0, fragment);
        hintPart.style.fontStyle = "italic";
        return hintPart;
      });
      hintElement.appendChild(before);
      if (this.label) {
        this.label.dispose();
      }
      this.label = this._register(new KeybindingLabel(hintElement, OS));
      this.label.set(keybinding);
      this.label.element.style.width = "min-content";
      this.label.element.style.display = "inline";
      hintElement.appendChild(after2);
      this.domNode.append(hintElement);
      const helpKeybinding = this.keybindingService.lookupKeybinding("editor.action.accessibilityHelp" /* OpenAccessibilityHelp */)?.getLabel();
      const helpInfo = helpKeybinding ? localize(16229, null, helpKeybinding) : localize(16230, null);
      this.ariaLabel = actionPart.concat(helpInfo, localize(16227, null, "accessibility.verbosity.replEditor" /* ReplEditor */));
    }
  }
  getKeybinding() {
    const keybindings = this.keybindingService.lookupKeybindings("interactive.execute");
    const shiftEnterConfig = this.configurationService.getValue(ReplEditorSettings.executeWithShiftEnter);
    const hasEnterChord = (kb, modifier = "") => {
      const chords = kb.getDispatchChords();
      const chord = modifier + "Enter";
      const chordAlt = modifier + "[Enter]";
      return chords.length === 1 && (chords[0] === chord || chords[0] === chordAlt);
    };
    if (shiftEnterConfig) {
      const keybinding = keybindings.find((kb) => hasEnterChord(kb, "shift+"));
      if (keybinding) {
        return keybinding;
      }
    } else {
      let keybinding = keybindings.find((kb) => hasEnterChord(kb));
      if (keybinding) {
        return keybinding;
      }
      keybinding = this.keybindingService.lookupKeybindings("python.execInREPLEnter").find((kb) => hasEnterChord(kb));
      if (keybinding) {
        return keybinding;
      }
    }
    return keybindings?.[0];
  }
  dispose() {
    super.dispose();
    this.editor.removeContentWidget(this);
    this.label?.dispose();
  }
};

ReplInputHintContentWidget = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IKeybindingService)
], ReplInputHintContentWidget);
export { ReplInputHintContentWidget };
