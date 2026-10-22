// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/promptTimeline/promptTimelineWidgetContrib.ts
import { MIN_RAIL_PROMPTS, PROMPT_TIMELINE_CONTRIB_ID, PROMPT_TIMELINE_DISPLAY_SETTING, PROMPT_TIMELINE_STICKY_SCROLL_SETTING } from "./module-2180.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { PromptTimelineModel } from "./module-2498.mjs";
import { PromptTimelineGutterRail } from "./module-2500.mjs";
import { PromptTimelineRulerRail } from "./module-2502.mjs";
import { autorun } from "./module-0052.mjs";
import { PromptTimelineStickyHeader } from "./module-2503.mjs";
import { EventType, addDisposableListener } from "./module-0075.mjs";
import { StandardWheelEvent } from "./module-0024.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";


// src/vs/workbench/contrib/chat/browser/promptTimeline/promptTimelineWidgetContrib.ts
var HARD_WHEEL_DISTANCE = 20;

var WHEEL_WINDOW_MS = 120;

function supportsPromptTimeline(widget) {
  return widget.location === "panel" /* Chat */ && !widget.rendersInputOnTop;
}

function observePromptTimelineHostWidth(widget, host, rail) {
  rail.setHostWidth(host.clientWidth);
  return widget.onDidLayout(({ width: width2 }) => rail.setHostWidth(width2));
}

function isStickyPromptHeaderShown(widget, configurationService) {
  return supportsPromptTimeline(widget) && configurationService.getValue(PROMPT_TIMELINE_STICKY_SCROLL_SETTING) === true && configurationService.getValue("chat.experimental.stickyScroll.enabled" /* ExperimentalStickyScrollEnabled */) === false;
}

var PromptTimelineWidgetContrib = class extends Disposable {
  constructor(widget, instantiationService, configurationService, environmentService) {
    super();
    this.widget = widget;
    this.instantiationService = instantiationService;
    this.configurationService = configurationService;
    this.environmentService = environmentService;
    this.id = PromptTimelineWidgetContrib.ID;
    /** Holds the model and every surface's wiring while at least one surface is enabled. */
    this._enablement = this._register(new DisposableStore());
    if (!supportsPromptTimeline(widget)) {
      return;
    }
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(PROMPT_TIMELINE_DISPLAY_SETTING) || e4.affectsConfiguration(PROMPT_TIMELINE_STICKY_SCROLL_SETTING) || e4.affectsConfiguration("chat.experimental.stickyScroll.enabled" /* ExperimentalStickyScrollEnabled */)) {
        this._update();
      }
    }));
    this._update();
  }
  static {
    this.ID = PROMPT_TIMELINE_CONTRIB_ID;
  }
  /** (Re)builds the timeline to match the current settings, or tears it down if no surface is enabled. */
  _update() {
    this._enablement.clear();
    const railStyle = this.environmentService.isSessionsWindow ? this.configurationService.getValue(PROMPT_TIMELINE_DISPLAY_SETTING) : "off";
    const stickyEnabled = isStickyPromptHeaderShown(this.widget, this.configurationService);
    if (railStyle !== "off" || stickyEnabled) {
      this._createFeature(railStyle, stickyEnabled);
    }
  }
  /**
   * Builds the model shared by both surfaces, mounts the host anchor, then creates whichever surfaces
   * are enabled: the rail beside the transcript and/or the sticky header at the top. Each is
   * independently toggleable, so header-only and rail-only configurations both work.
   */
  _createFeature(railStyle, stickyEnabled) {
    const concreteWidget = this.widget;
    const model = this._enablement.add(this.instantiationService.createInstance(PromptTimelineModel, concreteWidget));
    const host = this.widget.domNode;
    host.classList.add("prompt-timeline-host");
    this._enablement.add(toDisposable(() => host.classList.remove("prompt-timeline-host", "prompt-timeline-with-rail")));
    if (railStyle !== "off") {
      this._createRail(model, host, railStyle);
    }
    if (stickyEnabled) {
      this._createStickyHeader(model);
    }
  }
  _createRail(model, host, railStyle) {
    const rail = this._enablement.add(
      railStyle === "gutter" ? new PromptTimelineGutterRail() : new PromptTimelineRulerRail()
    );
    this._enablement.add(observePromptTimelineHostWidth(this.widget, host, rail));
    if (railStyle === "ruler") {
      host.classList.add("prompt-timeline-with-rail");
    }
    host.appendChild(rail.domNode);
    this._enablement.add(toDisposable(() => rail.domNode.remove()));
    rail.setFilesProvider((tick) => model.getRequestFiles(tick));
    this._enablement.add(rail.onDidSelect((requestId) => model.reveal(requestId)));
    this._enablement.add(rail.onDidReview((tick) => {
      void model.reviewChanges(tick);
    }));
    this._enablement.add(rail.onDidReviewFile((e4) => {
      void model.reviewChanges(e4.tick, e4.file);
    }));
    if (railStyle === "ruler") {
      this._enablement.add(this._registerHardWheelDetector(rail));
    }
    const inputPart = this.widget.inputPart;
    this._enablement.add(autorun((reader) => {
      rail.domNode.style.setProperty("--prompt-timeline-bottom", `${inputPart.height.read(reader)}px`);
    }));
    const ticksObs = railStyle === "gutter" ? model.promptTicks : model.ticks;
    const activeObs = railStyle === "gutter" ? model.activePromptId : model.activeRequestId;
    this._enablement.add(autorun((reader) => {
      const ticks = ticksObs.read(reader);
      rail.domNode.classList.toggle("hidden", ticks.length < MIN_RAIL_PROMPTS);
      rail.setTicks(ticks);
    }));
    this._enablement.add(autorun((reader) => {
      rail.setActive(activeObs.read(reader));
    }));
    this._enablement.add(autorun((reader) => {
      model.onDidChangeScrollLayout.read(reader);
      rail.setScrollLayout(model.getScrollLayout());
    }));
    rail.setHostWidth(host.clientWidth);
  }
  /**
   * Mounts the flat sticky header that pins the current prompt to the top of the transcript. It shows
   * only once that prompt's row has scrolled above the viewport (via {@link PromptTimelineModel.activePinned}).
   * Activating the label jumps straight to the prompt it names (scrolling it to the top of the transcript).
   */
  _createStickyHeader(model) {
    const sticky = this._enablement.add(this.instantiationService.createInstance(PromptTimelineStickyHeader, this.widget.domNode));
    this._enablement.add(sticky.onDidActivate(() => model.revealActivePrompt()));
    this._enablement.add(autorun((reader) => {
      const active = model.activePrompt.read(reader);
      const pinned = model.activePinned.read(reader);
      if (active && pinned) {
        sticky.update(active.text, active.index, active.total);
      }
      sticky.setVisible(!!active && pinned);
    }));
  }
  /**
   * Detects a deliberate hard/fast scroll from wheel velocity and tells the rail (it only blooms if a
   * real scroll movement follows, so flicking against a scroll limit never opens it). Deltas are
   * normalized via {@link StandardWheelEvent} so line-mode devices are not stuck below the threshold,
   * and the listener is on the capture phase so it is seen before the transcript's ScrollableElement
   * consumes the wheel mid-content.
   */
  _registerHardWheelDetector(rail) {
    let wheelAcc = 0;
    let wheelWindowStart = 0;
    return addDisposableListener(this.widget.domNode, EventType.MOUSE_WHEEL, (e4) => {
      const now = Date.now();
      if (now - wheelWindowStart > WHEEL_WINDOW_MS) {
        wheelAcc = 0;
        wheelWindowStart = now;
      }
      wheelAcc += Math.abs(new StandardWheelEvent(e4).deltaY);
      if (wheelAcc >= HARD_WHEEL_DISTANCE) {
        wheelAcc = 0;
        rail.notifyHardWheel();
      }
    }, { capture: true, passive: true });
  }
};

PromptTimelineWidgetContrib = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IWorkbenchEnvironmentService)
], PromptTimelineWidgetContrib);
export { supportsPromptTimeline, observePromptTimelineHostWidth, isStickyPromptHeaderShown, HARD_WHEEL_DISTANCE, WHEEL_WINDOW_MS, PromptTimelineWidgetContrib };
