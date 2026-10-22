// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/dockedAuxiliaryBarController.ts
import { Disposable } from "./module-0012.mjs";
import { SESSIONS_LIST_MINIMUM_WIDTH } from "./module-3443.mjs";
import { Sash } from "./module-0496.mjs";


// src/vs/sessions/browser/dockedAuxiliaryBarController.ts
var DockedAuxiliaryBarController = class _DockedAuxiliaryBarController extends Disposable {
  constructor(editorPartContainer, auxiliaryBarPart, host) {
    super();
    this.editorPartContainer = editorPartContainer;
    this.auxiliaryBarPart = auxiliaryBarPart;
    this.host = host;
    this._docked = false;
    this._sashStartWidth = 0;
    this._sashCollapsed = false;
  }
  static {
    this.MIN_WIDTH = 220;
  }
  static {
    this.EDITOR_MIN_WIDTH = 300;
  }
  static {
    this.DEFAULT_WIDTH = 300;
  }
  static {
    this.COLLAPSE_WIDTH = 4;
  }
  static {
    this.NO_EDITOR_MIN_WIDTH = SESSIONS_LIST_MINIMUM_WIDTH;
  }
  /**
   * Position the auxiliary bar inside the editor part's right region so the editor
   * tab bar spans the full width across the editor content and the detail panel.
   */
  layout() {
    const auxiliaryBarContainer = this.auxiliaryBarPart.getContainer();
    if (!auxiliaryBarContainer) {
      return;
    }
    if (!this._docked) {
      this.editorPartContainer.appendChild(auxiliaryBarContainer);
      auxiliaryBarContainer.classList.add("docked-auxiliarybar");
      this._docked = true;
    }
    if (!this.host.isEditorAreaVisible() || !this.host.isAuxiliaryBarVisible()) {
      auxiliaryBarContainer.style.display = "none";
      this.host.setEditorContentRightInset(0);
      if (this._sash) {
        this._sash.state = 0 /* Disabled */;
      }
      return;
    }
    const editorRect = this.editorPartContainer.getBoundingClientRect();
    const editorContentHidden = !this.host.isEditorVisible();
    const auxWidth = editorContentHidden ? editorRect.width : _DockedAuxiliaryBarController.getEffectiveWidth(this.host.getWidth(), editorRect.width);
    const top2 = this._getTop();
    const height = Math.max(0, editorRect.height - top2);
    auxiliaryBarContainer.style.display = "";
    auxiliaryBarContainer.style.position = "absolute";
    auxiliaryBarContainer.style.right = "0";
    auxiliaryBarContainer.style.top = `${top2}px`;
    auxiliaryBarContainer.style.width = `${auxWidth}px`;
    auxiliaryBarContainer.style.height = `${height}px`;
    this.host.setEditorContentRightInset(auxWidth);
    this.auxiliaryBarPart.layout(auxWidth, height, top2, editorRect.width - auxWidth);
    this._ensureSash();
    this._sash.state = editorContentHidden ? 0 /* Disabled */ : 3 /* Enabled */;
    this._sash.layout();
  }
  /** Returns the detail width that fits beside the editor content. */
  static getEffectiveWidth(hostWidth, editorWidth) {
    const maxWidth = editorWidth - _DockedAuxiliaryBarController.EDITOR_MIN_WIDTH;
    return Math.min(editorWidth, Math.max(_DockedAuxiliaryBarController.MIN_WIDTH, Math.min(hostWidth, maxWidth)));
  }
  _ensureSash() {
    if (this._sash) {
      return;
    }
    const editorPartContainer = this.editorPartContainer;
    const layoutProvider = {
      getVerticalSashLeft: () => {
        const width2 = editorPartContainer.clientWidth;
        const auxWidth = this.host.isEditorVisible() ? _DockedAuxiliaryBarController.getEffectiveWidth(this.host.getWidth(), width2) : width2;
        return Math.max(0, width2 - auxWidth);
      },
      getVerticalSashTop: () => this._getTop(),
      getVerticalSashHeight: () => Math.max(0, editorPartContainer.clientHeight - this._getTop())
    };
    const sash = this._register(new Sash(editorPartContainer, layoutProvider, { orientation: 0 /* VERTICAL */ }));
    this._sash = sash;
    this._register(sash.onDidStart(() => {
      this._sashStartWidth = this.host.getWidth();
      this._sashCollapsed = false;
    }));
    this._register(sash.onDidChange((e4) => {
      if (this._sashCollapsed) {
        return;
      }
      const delta2 = e4.startX - e4.currentX;
      const width2 = editorPartContainer.clientWidth;
      const requestedWidth = this._sashStartWidth + delta2;
      if (requestedWidth < _DockedAuxiliaryBarController.COLLAPSE_WIDTH) {
        this._sashCollapsed = true;
        this.host.hideAuxiliaryBar();
        return;
      }
      this.host.setWidth(_DockedAuxiliaryBarController.getEffectiveWidth(requestedWidth, width2));
      this.layout();
    }));
    this._register(sash.onDidReset(() => {
      this.host.setWidth(_DockedAuxiliaryBarController.DEFAULT_WIDTH);
      this.layout();
    }));
  }
  _getTop() {
    return this.host.getTitleHeight();
  }
};
export { DockedAuxiliaryBarController };
