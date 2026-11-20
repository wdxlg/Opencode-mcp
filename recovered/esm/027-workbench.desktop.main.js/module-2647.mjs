// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/aiCustomizationManagementEditorInput.ts
import { EditorInput } from "./module-0928.mjs";
import { AI_CUSTOMIZATION_MANAGEMENT_EDITOR_INPUT_ID } from "./module-1472.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/aiCustomizationManagementEditorInput.ts
var AICustomizationManagementEditorInput = class _AICustomizationManagementEditorInput extends EditorInput {
  constructor() {
    super();
    this.resource = void 0;
    this._isDirty = false;
  }
  static {
    this.ID = AI_CUSTOMIZATION_MANAGEMENT_EDITOR_INPUT_ID;
  }
  static {
    this._activeHarnessLabel = "";
  }
  get capabilities() {
    const base = super.capabilities | 8 /* Singleton */;
    return _AICustomizationManagementEditorInput._modalPresentation ? base | 2048 /* RequiresModal */ : base;
  }
  static {
    /**
     * Whether the page should open as a centred modal editor. Mirrors the Bridge
     * `opencode.bridge.settingsPageFloating` setting, which the contribution pushes in on startup and
     * whenever the user flips the toggle. Capabilities are read synchronously by the editor service,
     * so the value is cached here instead of resolved through DI at call time.
     */
    this._modalPresentation = false;
  }
  static setModalPresentation(enabled) {
    _AICustomizationManagementEditorInput._modalPresentation = enabled;
  }
  /**
   * Gets or creates the singleton instance of this input.
   */
  static getOrCreate() {
    if (!_AICustomizationManagementEditorInput._instance || _AICustomizationManagementEditorInput._instance.isDisposed()) {
      _AICustomizationManagementEditorInput._activeHarnessLabel = "";
      _AICustomizationManagementEditorInput._instance = new _AICustomizationManagementEditorInput();
    }
    return _AICustomizationManagementEditorInput._instance;
  }
  matches(otherInput) {
    return super.matches(otherInput) || otherInput instanceof _AICustomizationManagementEditorInput;
  }
  get typeId() {
    return _AICustomizationManagementEditorInput.ID;
  }
  getName() {
    const harnessLabel = _AICustomizationManagementEditorInput._activeHarnessLabel;
    // OpenCode: 该编辑器标签页统一显示为「MCP」
    void harnessLabel;
    return "MCP";
  }
  getIcon() {
    return Codicon.settingsGear;
  }
  getModalEditorOptions() {
    return { compactHeader: true };
  }
  async resolve() {
    return null;
  }
  isDirty() {
    return this._isDirty;
  }
  async save(group2, options3) {
    if (options3?.reason !== void 0 && options3.reason !== 1 /* EXPLICIT */) {
      return void 0;
    }
    if (this._saveHandler) {
      const saved = await this._saveHandler();
      return saved ? this : void 0;
    }
    return void 0;
  }
  async revert() {
    this.setDirty(false);
  }
  setHarnessLabel(label3) {
    if (_AICustomizationManagementEditorInput._activeHarnessLabel === label3) {
      return;
    }
    _AICustomizationManagementEditorInput._activeHarnessLabel = label3;
    this._onDidChangeLabel.fire();
  }
  /**
   * VS Code 1.136 callers (the Agents window customizations toolbar) name the target this way.
   * OpenCode shows it in the harness-label slot; clearing stays with the editor, which owns that label.
   */
  setTargetLabel(label3) {
    if (label3) {
      this.setHarnessLabel(label3);
    }
  }
  setDirty(dirty) {
    if (this._isDirty !== dirty) {
      this._isDirty = dirty;
      this._onDidChangeDirty.fire();
    }
  }
  setSaveHandler(handler) {
    this._saveHandler = handler;
  }
};
export { AICustomizationManagementEditorInput };
