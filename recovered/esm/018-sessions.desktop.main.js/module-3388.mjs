// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/accessibilitySignals/browser/editorTextPropertySignalsContribution.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { derived } from "./module-0054.mjs";
import { isDefined } from "./module-0010.mjs";
import { observableFromValueWithChangeEvent } from "./module-0063.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { isCodeEditor, isDiffEditor } from "./module-0223.mjs";
import { autorun, autorunWithStore } from "./module-0052.mjs";
import { observableFromPromise, wasEventTriggeredRecently } from "./module-0059.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { IMarkerService } from "./module-0560.mjs";
import { FoldingController } from "./module-0684.mjs";
import { IDebugService } from "./module-1058.mjs";


// src/vs/workbench/contrib/accessibilitySignals/browser/editorTextPropertySignalsContribution.ts
var EditorTextPropertySignalsContribution = class extends Disposable {
  constructor(_editorService, _instantiationService, _accessibilitySignalService) {
    super();
    this._editorService = _editorService;
    this._instantiationService = _instantiationService;
    this._accessibilitySignalService = _accessibilitySignalService;
    this._textProperties = [
      this._instantiationService.createInstance(MarkerTextProperty, AccessibilitySignal.errorAtPosition, AccessibilitySignal.errorOnLine, 8 /* Error */),
      this._instantiationService.createInstance(MarkerTextProperty, AccessibilitySignal.warningAtPosition, AccessibilitySignal.warningOnLine, 4 /* Warning */),
      this._instantiationService.createInstance(FoldedAreaTextProperty),
      this._instantiationService.createInstance(BreakpointTextProperty)
    ];
    this._someAccessibilitySignalIsEnabled = derived(
      this,
      (reader) => this._textProperties.flatMap((p) => [p.lineSignal, p.positionSignal]).filter(isDefined).some((signal) => observableFromValueWithChangeEvent(this, this._accessibilitySignalService.getEnabledState(signal, false)).read(reader))
    );
    this._activeEditorObservable = observableFromEvent(
      this,
      this._editorService.onDidActiveEditorChange,
      (_) => {
        const activeTextEditorControl = this._editorService.activeTextEditorControl;
        const editor = isDiffEditor(activeTextEditorControl) ? activeTextEditorControl.getOriginalEditor() : isCodeEditor(activeTextEditorControl) ? activeTextEditorControl : void 0;
        return editor && editor.hasModel() ? { editor, model: editor.getModel() } : void 0;
      }
    );
    this._register(autorunWithStore((reader, store) => {
      if (!this._someAccessibilitySignalIsEnabled.read(reader)) {
        return;
      }
      const activeEditor = this._activeEditorObservable.read(reader);
      if (activeEditor) {
        this._registerAccessibilitySignalsForEditor(activeEditor.editor, activeEditor.model, store);
      }
    }));
  }
  _registerAccessibilitySignalsForEditor(editor, editorModel, store) {
    let lastLine = -1;
    const ignoredLineSignalsForCurrentLine = /* @__PURE__ */ new Set();
    const timeouts = store.add(new DisposableStore());
    const propertySources = this._textProperties.map((p) => ({ source: p.createSource(editor, editorModel), property: p }));
    const didType = wasEventTriggeredRecently(editor.onDidChangeModelContent, 100, store);
    store.add(editor.onDidChangeCursorPosition((args2) => {
      timeouts.clear();
      if (args2 && args2.reason !== 3 /* Explicit */ && args2.reason !== 0 /* NotSet */) {
        ignoredLineSignalsForCurrentLine.clear();
        return;
      }
      const trigger = (property, source, mode) => {
        const signal = mode === "line" ? property.lineSignal : property.positionSignal;
        if (!signal || !this._accessibilitySignalService.getEnabledState(signal, false).value || !source.isPresent(position2, mode, void 0)) {
          return;
        }
        for (const modality of ["sound", "announcement"]) {
          if (this._accessibilitySignalService.getEnabledState(signal, false, modality).value) {
            const delay = this._accessibilitySignalService.getDelayMs(signal, modality, mode) + (didType.get() ? 1e3 : 0);
            timeouts.add(disposableTimeout(() => {
              if (source.isPresent(position2, mode, void 0)) {
                if (!(mode === "line") || !ignoredLineSignalsForCurrentLine.has(property)) {
                  this._accessibilitySignalService.playSignal(signal, { modality });
                }
                ignoredLineSignalsForCurrentLine.add(property);
              }
            }, delay));
          }
        }
      };
      const position2 = args2.position;
      const lineNumber = position2.lineNumber;
      if (lineNumber !== lastLine) {
        ignoredLineSignalsForCurrentLine.clear();
        lastLine = lineNumber;
        for (const p of propertySources) {
          trigger(p.property, p.source, "line");
        }
      }
      for (const p of propertySources) {
        trigger(p.property, p.source, "positional");
      }
      for (const s of propertySources) {
        if (![s.property.lineSignal, s.property.positionSignal].some((s2) => s2 && this._accessibilitySignalService.getEnabledState(s2, false).value)) {
          return;
        }
        let lastValueAtPosition = void 0;
        let lastValueOnLine = void 0;
        timeouts.add(autorun((reader) => {
          const newValueAtPosition = s.source.isPresentAtPosition(args2.position, reader);
          const newValueOnLine = s.source.isPresentOnLine(args2.position.lineNumber, reader);
          if (lastValueAtPosition !== void 0 && lastValueAtPosition !== void 0) {
            if (!lastValueAtPosition && newValueAtPosition) {
              trigger(s.property, s.source, "positional");
            }
            if (!lastValueOnLine && newValueOnLine) {
              trigger(s.property, s.source, "line");
            }
          }
          lastValueAtPosition = newValueAtPosition;
          lastValueOnLine = newValueOnLine;
        }));
      }
    }));
  }
};

EditorTextPropertySignalsContribution = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IAccessibilitySignalService)
], EditorTextPropertySignalsContribution);

var TextPropertySource = class _TextPropertySource {
  static {
    this.notPresent = new _TextPropertySource({ isPresentAtPosition: () => false, isPresentOnLine: () => false });
  }
  constructor(options3) {
    this.isPresentOnLine = options3.isPresentOnLine;
    this.isPresentAtPosition = options3.isPresentAtPosition ?? (() => false);
  }
  isPresent(position2, mode, reader) {
    return mode === "line" ? this.isPresentOnLine(position2.lineNumber, reader) : this.isPresentAtPosition(position2, reader);
  }
};

var MarkerTextProperty = class {
  constructor(positionSignal, lineSignal, severity, markerService) {
    this.positionSignal = positionSignal;
    this.lineSignal = lineSignal;
    this.severity = severity;
    this.markerService = markerService;
    this.debounceWhileTyping = true;
  }
  createSource(editor, model) {
    const obs = observableSignalFromEvent("onMarkerChanged", this.markerService.onMarkerChanged);
    return new TextPropertySource({
      isPresentAtPosition: (position2, reader) => {
        obs.read(reader);
        const hasMarker = this.markerService.read({ resource: model.uri }).some(
          (m) => m.severity === this.severity && m.startLineNumber <= position2.lineNumber && position2.lineNumber <= m.endLineNumber && m.startColumn <= position2.column && position2.column <= m.endColumn
        );
        return hasMarker;
      },
      isPresentOnLine: (lineNumber, reader) => {
        obs.read(reader);
        const hasMarker = this.markerService.read({ resource: model.uri }).some(
          (m) => m.severity === this.severity && m.startLineNumber <= lineNumber && lineNumber <= m.endLineNumber
        );
        return hasMarker;
      }
    });
  }
};

MarkerTextProperty = __decorateClass([
  __decorateParam(3, IMarkerService)
], MarkerTextProperty);

var FoldedAreaTextProperty = class {
  constructor() {
    this.lineSignal = AccessibilitySignal.foldedArea;
  }
  createSource(editor, _model) {
    const foldingController = FoldingController.get(editor);
    if (!foldingController) {
      return TextPropertySource.notPresent;
    }
    const foldingModel = observableFromPromise(foldingController.getFoldingModel() ?? Promise.resolve(void 0));
    return new TextPropertySource({
      isPresentOnLine(lineNumber, reader) {
        const m = foldingModel.read(reader);
        const regionAtLine = m.value?.getRegionAtLine(lineNumber);
        const hasFolding = !regionAtLine ? false : regionAtLine.isCollapsed && regionAtLine.startLineNumber === lineNumber;
        return hasFolding;
      }
    });
  }
};

var BreakpointTextProperty = class {
  constructor(debugService) {
    this.debugService = debugService;
    this.lineSignal = AccessibilitySignal.break;
  }
  createSource(editor, model) {
    const signal = observableSignalFromEvent("onDidChangeBreakpoints", this.debugService.getModel().onDidChangeBreakpoints);
    const debugService = this.debugService;
    return new TextPropertySource({
      isPresentOnLine(lineNumber, reader) {
        signal.read(reader);
        const breakpoints = debugService.getModel().getBreakpoints({ uri: model.uri, lineNumber });
        const hasBreakpoints = breakpoints.length > 0;
        return hasBreakpoints;
      }
    });
  }
};

BreakpointTextProperty = __decorateClass([
  __decorateParam(0, IDebugService)
], BreakpointTextProperty);
export { EditorTextPropertySignalsContribution, TextPropertySource, MarkerTextProperty, FoldedAreaTextProperty, BreakpointTextProperty };
