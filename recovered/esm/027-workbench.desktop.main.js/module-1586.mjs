// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/centered/centeredViewLayout.ts
import { $ } from "./module-0075.mjs";
import { Event2 } from "./module-0017.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { SplitView } from "./module-0625.mjs";


// src/vs/base/browser/ui/centered/centeredViewLayout.ts
var defaultState = {
  targetWidth: 900,
  leftMarginRatio: 0.1909,
  rightMarginRatio: 0.1909
};

var distributeSizing = { type: "distribute" };

function createEmptyView(background) {
  const element = $(".centered-layout-margin");
  element.style.height = "100%";
  if (background) {
    element.style.backgroundColor = background.toString();
  }
  return {
    element,
    layout: () => void 0,
    minimumSize: 60,
    maximumSize: Number.POSITIVE_INFINITY,
    onDidChange: Event2.None
  };
}

function toSplitViewView(view, getHeight) {
  return {
    element: view.element,
    get maximumSize() {
      return view.maximumWidth;
    },
    get minimumSize() {
      return view.minimumWidth;
    },
    onDidChange: Event2.map(view.onDidChange, (e) => e && e.width),
    layout: (size3, offset, ctx) => view.layout(size3, getHeight(), ctx?.top ?? 0, (ctx?.left ?? 0) + offset)
  };
}

var CenteredViewLayout = class {
  constructor(container3, view, state = { ...defaultState }, centeredLayoutFixedWidth = false) {
    this.container = container3;
    this.view = view;
    this.state = state;
    this.centeredLayoutFixedWidth = centeredLayoutFixedWidth;
    this.lastLayoutPosition = { width: 0, height: 0, left: 0, top: 0 };
    this.didLayout = false;
    this.splitViewDisposables = new DisposableStore();
    this._boundarySashes = {};
    this.container.appendChild(this.view.element);
    this.container.style.overflow = "hidden";
  }
  get minimumWidth() {
    return this.splitView ? this.splitView.minimumSize : this.view.minimumWidth;
  }
  get maximumWidth() {
    return this.splitView ? this.splitView.maximumSize : this.view.maximumWidth;
  }
  get minimumHeight() {
    return this.view.minimumHeight;
  }
  get maximumHeight() {
    return this.view.maximumHeight;
  }
  get onDidChange() {
    return this.view.onDidChange;
  }
  get boundarySashes() {
    return this._boundarySashes;
  }
  set boundarySashes(boundarySashes) {
    this._boundarySashes = boundarySashes;
    if (!this.splitView) {
      return;
    }
    this.splitView.orthogonalStartSash = boundarySashes.top;
    this.splitView.orthogonalEndSash = boundarySashes.bottom;
  }
  layout(width2, height, top2, left) {
    this.lastLayoutPosition = { width: width2, height, top: top2, left };
    if (this.splitView) {
      this.splitView.layout(width2, this.lastLayoutPosition);
      if (!this.didLayout || this.centeredLayoutFixedWidth) {
        this.resizeSplitViews();
      }
    } else {
      this.view.layout(width2, height, top2, left);
    }
    this.didLayout = true;
  }
  resizeSplitViews() {
    if (!this.splitView) {
      return;
    }
    if (this.centeredLayoutFixedWidth) {
      const centerViewWidth = Math.min(this.lastLayoutPosition.width, this.state.targetWidth);
      const marginWidthFloat = (this.lastLayoutPosition.width - centerViewWidth) / 2;
      this.splitView.resizeView(0, Math.floor(marginWidthFloat));
      this.splitView.resizeView(1, centerViewWidth);
      this.splitView.resizeView(2, Math.ceil(marginWidthFloat));
    } else {
      const leftMargin = this.state.leftMarginRatio * this.lastLayoutPosition.width;
      const rightMargin = this.state.rightMarginRatio * this.lastLayoutPosition.width;
      const center = this.lastLayoutPosition.width - leftMargin - rightMargin;
      this.splitView.resizeView(0, leftMargin);
      this.splitView.resizeView(1, center);
      this.splitView.resizeView(2, rightMargin);
    }
  }
  setFixedWidth(option2) {
    this.centeredLayoutFixedWidth = option2;
    if (!!this.splitView) {
      this.updateState();
      this.resizeSplitViews();
    }
  }
  updateState() {
    if (!!this.splitView) {
      this.state.targetWidth = this.splitView.getViewSize(1);
      this.state.leftMarginRatio = this.splitView.getViewSize(0) / this.lastLayoutPosition.width;
      this.state.rightMarginRatio = this.splitView.getViewSize(2) / this.lastLayoutPosition.width;
    }
  }
  isActive() {
    return !!this.splitView;
  }
  styles(style) {
    this.style = style;
    if (this.splitView && this.emptyViews) {
      this.splitView.style(this.style);
      this.emptyViews[0].element.style.backgroundColor = this.style.background.toString();
      this.emptyViews[1].element.style.backgroundColor = this.style.background.toString();
    }
  }
  activate(active) {
    if (active === this.isActive()) {
      return;
    }
    if (active) {
      this.view.element.remove();
      this.splitView = new SplitView(this.container, {
        inverseAltBehavior: true,
        orientation: 1 /* HORIZONTAL */,
        styles: this.style
      });
      this.splitView.orthogonalStartSash = this.boundarySashes.top;
      this.splitView.orthogonalEndSash = this.boundarySashes.bottom;
      this.splitViewDisposables.add(this.splitView.onDidSashChange(() => {
        if (!!this.splitView) {
          this.updateState();
        }
      }));
      this.splitViewDisposables.add(this.splitView.onDidSashReset(() => {
        this.state = { ...defaultState };
        this.resizeSplitViews();
      }));
      this.splitView.layout(this.lastLayoutPosition.width, this.lastLayoutPosition);
      const backgroundColor = this.style ? this.style.background : void 0;
      this.emptyViews = [createEmptyView(backgroundColor), createEmptyView(backgroundColor)];
      this.splitView.addView(this.emptyViews[0], distributeSizing, 0);
      this.splitView.addView(toSplitViewView(this.view, () => this.lastLayoutPosition.height), distributeSizing, 1);
      this.splitView.addView(this.emptyViews[1], distributeSizing, 2);
      this.resizeSplitViews();
    } else {
      this.splitView?.el.remove();
      this.splitViewDisposables.clear();
      this.splitView?.dispose();
      this.splitView = void 0;
      this.emptyViews = void 0;
      this.container.appendChild(this.view.element);
      this.view.layout(this.lastLayoutPosition.width, this.lastLayoutPosition.height, this.lastLayoutPosition.top, this.lastLayoutPosition.left);
    }
  }
  isDefault(state) {
    if (this.centeredLayoutFixedWidth) {
      return state.targetWidth === defaultState.targetWidth;
    } else {
      return state.leftMarginRatio === defaultState.leftMarginRatio && state.rightMarginRatio === defaultState.rightMarginRatio;
    }
  }
  dispose() {
    this.splitViewDisposables.dispose();
    if (this.splitView) {
      this.splitView.dispose();
      this.splitView = void 0;
    }
  }
};
export { createEmptyView, toSplitViewView, defaultState, distributeSizing, CenteredViewLayout };
