// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatIncrementalRendering/chatIncrementalRendering.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { BUFFER_MODES } from "./module-2293.mjs";
import { ANIMATION_STYLES } from "./module-2295.mjs";
import { WordBuffer } from "./module-2290.mjs";
import { getWindow } from "./module-0075.mjs";
import { ANIMATION_DURATION_MS } from "./module-2294.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatIncrementalRendering/chatIncrementalRendering.ts
var IncrementalDOMMorpher = class extends Disposable {
  constructor(_domNode, _configService) {
    super();
    this._domNode = _domNode;
    this._configService = _configService;
    this._lastMarkdown = "";
    /**
     * The markdown that was last rendered to the DOM. May lag behind
     * `_lastMarkdown` while content is being buffered.
     */
    this._renderedMarkdown = "";
    /**
     * High-water mark: the number of top-level children that have been
     * fully revealed. Children at indices >= this value are "new"
     * and get animated on each render.
     */
    this._revealedChildCount = 0;
    /**
     * Timestamp when children at indices >= `_revealedChildCount`
     * first appeared. 0 means no animation is in progress.
     */
    this._animationStartTime = 0;
    /**
     * The total child count at the end of the most recent render in
     * the current animation batch.
     */
    this._batchChildCount = 0;
    this._rafScheduled = false;
    this._isDrained = true;
    this._onDidDrain = this._register(new Emitter());
    this.onDidDrain = this._onDidDrain.event;
    this._buffer = this._createBuffer();
    this._animation = this._createAnimation();
    this._register(this._configService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("chat.experimental.incrementalRendering.animationStyle" /* IncrementalRenderingStyle */)) {
        this._animation = this._createAnimation();
      }
      if (e.affectsConfiguration("chat.experimental.incrementalRendering.buffering" /* IncrementalRenderingBuffering */)) {
        this._buffer.dispose?.();
        this._buffer = this._createBuffer();
      }
    }));
  }
  // ---- strategy factories ----
  _createBuffer() {
    const raw = this._configService.getValue("chat.experimental.incrementalRendering.buffering" /* IncrementalRenderingBuffering */);
    const factory = Object.prototype.hasOwnProperty.call(BUFFER_MODES, raw) ? BUFFER_MODES[raw] : BUFFER_MODES.paragraph;
    return factory(this._domNode);
  }
  _createAnimation() {
    const raw = this._configService.getValue("chat.experimental.incrementalRendering.animationStyle" /* IncrementalRenderingStyle */);
    const factory = Object.prototype.hasOwnProperty.call(ANIMATION_STYLES, raw) ? ANIMATION_STYLES[raw] : ANIMATION_STYLES.fade;
    return factory();
  }
  // ---- public API ----
  get isDrained() {
    return this._isDrained;
  }
  /**
   * Register the callback that performs the actual markdown re-render.
   */
  setRenderCallback(cb) {
    this._renderCallback = cb;
  }
  /**
   * Forward the stream's word-rate estimate to the active buffer
   * (word buffer or line buffer). When the stream completes,
   * also flushes any remaining buffered content for buffers
   * that don't handle their own flushing (e.g. ParagraphBuffer).
   */
  updateStreamRate(rate, isComplete) {
    if (this._buffer instanceof WordBuffer) {
      this._buffer.setRate(rate, isComplete);
    }
    if (isComplete && !this._buffer.handlesFlush && this._lastMarkdown.length > this._renderedMarkdown.length) {
      this._pendingMarkdown = this._lastMarkdown;
      this._scheduleRender();
    }
  }
  /**
   * Seeds the renderer with the initial markdown string.
   *
   * @param animateInitial When `true`, the children already in the
   *   DOM receive the entrance animation.
   */
  seed(markdown, animateInitial) {
    this._lastMarkdown = markdown;
    this._animationStartTime = 0;
    if (this._buffer.handlesFlush && markdown.length > 0) {
      this._isDrained = false;
      this._renderedMarkdown = "";
      this._revealedChildCount = 0;
      while (this._domNode.firstChild) {
        this._domNode.removeChild(this._domNode.firstChild);
      }
      this._pendingMarkdown = markdown;
      this._scheduleRender();
      return;
    }
    this._renderedMarkdown = markdown;
    this._isDrained = true;
    this._revealedChildCount = animateInitial ? 0 : this._domNode.children.length;
    if (animateInitial) {
      this._animateNewChildren();
    }
  }
  /**
   * Attempts an incremental DOM update via rAF-batched re-render.
   *
   * @returns `true` if absorbed, `false` if a full re-render is needed.
   */
  tryMorph(newMarkdown) {
    if (!newMarkdown.startsWith(this._lastMarkdown)) {
      return false;
    }
    const appended = newMarkdown.slice(this._lastMarkdown.length);
    if (appended.length === 0) {
      return true;
    }
    this._lastMarkdown = newMarkdown;
    this._isDrained = false;
    if (this._buffer.handlesFlush) {
      this._pendingMarkdown = newMarkdown;
      this._scheduleRender();
      return true;
    }
    const renderable = this._buffer.getRenderable(newMarkdown, this._renderedMarkdown);
    if (renderable.length > this._renderedMarkdown.length) {
      this._renderedMarkdown = renderable;
      this._pendingMarkdown = renderable;
      this._scheduleRender();
    }
    return true;
  }
  // ---- rAF batching ----
  _scheduleRender() {
    if (this._rafScheduled) {
      return;
    }
    this._rafScheduled = true;
    const win = getWindow(this._domNode);
    this._rafHandle = win.requestAnimationFrame(() => {
      this._rafScheduled = false;
      this._rafHandle = void 0;
      this._flushRender();
    });
  }
  _flushRender() {
    let markdown = this._pendingMarkdown;
    this._pendingMarkdown = void 0;
    if (markdown === void 0 || !this._renderCallback) {
      return;
    }
    if (this._buffer.filterFlush) {
      const filtered = this._buffer.filterFlush(markdown);
      if (filtered === void 0) {
        if (this._buffer.needsNextFrame) {
          this._pendingMarkdown = markdown;
          this._scheduleRender();
        }
        return;
      }
      markdown = filtered;
    }
    this._renderedMarkdown = markdown;
    this._renderCallback(markdown);
    this._animateNewChildren();
    if (this._buffer.needsNextFrame) {
      this._pendingMarkdown = this._lastMarkdown;
      this._scheduleRender();
    } else if (this._renderedMarkdown === this._lastMarkdown && !this._isDrained) {
      this._isDrained = true;
      this._onDidDrain.fire();
    }
  }
  // ---- animation ----
  _animateNewChildren() {
    const children = this._domNode.children;
    const currentCount = children.length;
    if (currentCount <= this._revealedChildCount) {
      return;
    }
    const now = Date.now();
    if (this._animationStartTime !== 0 && now - this._animationStartTime >= ANIMATION_DURATION_MS) {
      this._revealedChildCount = this._batchChildCount;
      this._animationStartTime = 0;
      this._batchChildCount = 0;
    }
    if (currentCount <= this._revealedChildCount) {
      return;
    }
    if (this._animationStartTime === 0) {
      this._animationStartTime = now;
    }
    this._batchChildCount = currentCount;
    const elapsed = now - this._animationStartTime;
    this._animation.animate(children, this._revealedChildCount, currentCount, elapsed);
  }
  // ---- lifecycle ----
  dispose() {
    if (this._rafHandle !== void 0) {
      getWindow(this._domNode).cancelAnimationFrame(this._rafHandle);
      this._rafHandle = void 0;
    }
    this._rafScheduled = false;
    this._pendingMarkdown = void 0;
    this._renderCallback = void 0;
    this._buffer.dispose?.();
    super.dispose();
  }
};

IncrementalDOMMorpher = __decorateClass([
  __decorateParam(1, IConfigurationService)
], IncrementalDOMMorpher);
export { IncrementalDOMMorpher };
