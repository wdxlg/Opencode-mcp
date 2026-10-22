// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/onboarding/browser/spotlight/spotlightPresentation.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { SPOTLIGHT_PRESENTATION_KIND } from "./module-3803.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { SpotlightOverlay } from "./module-3802.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { findOnboardingTarget, openOnboardingTarget } from "./module-3542.mjs";
import { timeout } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { IHostService } from "./module-1118.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/workbench/contrib/onboarding/browser/spotlight/spotlightPresentation.ts
var TARGET_RESOLVE_TIMEOUT = 2e3;

var TARGET_POLL_INTERVAL = 50;

var TARGET_ANIMATION_SETTLE_TIMEOUT = 600;

var SpotlightPresentation = class extends Disposable {
  constructor(layoutService, hostService, contextKeyService) {
    super();
    this.layoutService = layoutService;
    this.hostService = hostService;
    this.contextKeyService = contextKeyService;
    this.kind = SPOTLIGHT_PRESENTATION_KIND;
    this.countsAsVisualStep = true;
  }
  async run(scenario, context2) {
    const payload = scenario.presentation.payload;
    return this._runPayload(payload, context2);
  }
  async runStep(sequenceStep, context2) {
    const step = sequenceStep.payload;
    if (step.when && !this.contextKeyService.contextMatchesRules(step.when)) {
      return { action: "skipStep", shown: false };
    }
    try {
      await step.onBeforeShow?.();
    } catch (error) {
      onUnexpectedError(error);
    }
    if (context2.cancellationToken.isCancellationRequested) {
      return { action: "abort", shown: false };
    }
    const target = await this._resolveTarget(context2.targetWindow, step.targetId, context2.cancellationToken, step.missingTarget);
    if (!target) {
      return context2.cancellationToken.isCancellationRequested ? { action: "abort", shown: false } : { action: "skipStep", shown: false };
    }
    await this._waitForTargetReady(context2.targetWindow, target);
    if (context2.cancellationToken.isCancellationRequested) {
      return { action: "abort", shown: false };
    }
    const store = new DisposableStore();
    try {
      const container2 = this.layoutService.getContainer(context2.targetWindow);
      const overlay = store.add(new SpotlightOverlay(container2));
      this.hostService.setWindowDimmed(context2.targetWindow, true);
      store.add(toDisposable(() => this.hostService.setWindowDimmed(context2.targetWindow, false)));
      store.add(this.layoutService.onDidLayoutContainer(() => overlay.scheduleLayout()));
      const end = await this._runStep(
        overlay,
        context2,
        step,
        target,
        context2.visualStepIndex,
        context2.visualStepCount,
        context2.canGoBack,
        context2.isLastVisualStep
      );
      overlay.hide();
      switch (end.action) {
        case "next":
          return {
            action: "next",
            shown: true,
            dismissReason: end.via === "target" ? "targetClick" /* TargetClick */ : "completed" /* Completed */
          };
        case "back":
          return { action: "back", shown: true };
        case "skip":
          return { action: "skipSequence", shown: true, dismissReason: end.reason };
        case "abort":
          return { action: "abort", shown: true };
      }
    } finally {
      store.dispose();
    }
  }
  async _runPayload(payload, context2) {
    const steps = payload?.steps ?? [];
    const stepCount = steps.length;
    if (stepCount === 0) {
      return { outcome: "completed" /* Completed */, shown: false, dismissReason: "completed" /* Completed */, lastStepIndex: 0, stepCount: 0 };
    }
    let lastStepIndex = 0;
    let shown = false;
    const skippedStepIndexes = /* @__PURE__ */ new Set();
    const store = new DisposableStore();
    try {
      const container2 = this.layoutService.getContainer(context2.targetWindow);
      const overlay = store.add(new SpotlightOverlay(container2));
      this.hostService.setWindowDimmed(context2.targetWindow, true);
      store.add(toDisposable(() => this.hostService.setWindowDimmed(context2.targetWindow, false)));
      let aborted = false;
      const targetResolutionCancellation = store.add(new CancellationTokenSource());
      store.add(context2.onAbort(() => {
        aborted = true;
        targetResolutionCancellation.cancel();
      }));
      store.add(this.layoutService.onDidLayoutContainer(() => overlay.scheduleLayout()));
      let index2 = 0;
      let direction = 1;
      while (index2 >= 0 && index2 < stepCount && !aborted) {
        const step = steps[index2];
        if (step.when && !this.contextKeyService.contextMatchesRules(step.when)) {
          skippedStepIndexes.add(index2);
          index2 += direction;
          continue;
        }
        try {
          await step.onBeforeShow?.();
        } catch (error) {
          onUnexpectedError(error);
        }
        if (aborted) {
          break;
        }
        const target = await this._resolveTarget(context2.targetWindow, step.targetId, targetResolutionCancellation.token, step.missingTarget);
        if (aborted) {
          break;
        }
        if (!target) {
          skippedStepIndexes.add(index2);
          index2 += direction;
          continue;
        }
        skippedStepIndexes.delete(index2);
        await this._waitForTargetReady(context2.targetWindow, target);
        if (aborted) {
          break;
        }
        lastStepIndex = Math.max(lastStepIndex, index2);
        shown = true;
        const skippedBefore = Array.from(skippedStepIndexes).filter((skippedIndex) => skippedIndex < index2).length;
        const displayStepIndex = index2 - skippedBefore;
        const displayStepCount = stepCount - skippedStepIndexes.size;
        const end = await this._runStep(overlay, context2, step, target, displayStepIndex, displayStepCount);
        overlay.hide();
        switch (end.action) {
          case "next":
            if (index2 === stepCount - 1) {
              const dismissReason = end.via === "target" ? "targetClick" /* TargetClick */ : "completed" /* Completed */;
              return { outcome: "completed" /* Completed */, shown, dismissReason, lastStepIndex, stepCount };
            }
            direction = 1;
            index2++;
            break;
          case "back":
            direction = -1;
            index2--;
            break;
          case "skip":
            return { outcome: "skipped" /* Skipped */, shown, dismissReason: end.reason, lastStepIndex, stepCount };
          case "abort":
            return { outcome: "aborted" /* Aborted */, shown, dismissReason: "aborted" /* Aborted */, lastStepIndex, stepCount };
        }
      }
      if (aborted) {
        return { outcome: "aborted" /* Aborted */, shown, dismissReason: "aborted" /* Aborted */, lastStepIndex, stepCount };
      }
      return { outcome: "completed" /* Completed */, shown, dismissReason: "completed" /* Completed */, lastStepIndex, stepCount };
    } finally {
      store.dispose();
    }
  }
  async _resolveTarget(targetWindow, targetId, cancellationToken, behavior) {
    if (cancellationToken.isCancellationRequested) {
      return void 0;
    }
    let element = findOnboardingTarget(targetWindow, targetId);
    if (element || behavior?.kind === "skip") {
      return element;
    }
    const timeoutMs = behavior?.kind === "wait" ? Math.max(0, behavior.timeoutMs) : TARGET_RESOLVE_TIMEOUT;
    const deadline = Date.now() + timeoutMs;
    while (!element && Date.now() < deadline && !cancellationToken.isCancellationRequested) {
      try {
        await timeout(TARGET_POLL_INTERVAL, cancellationToken);
      } catch (error) {
        if (cancellationToken.isCancellationRequested) {
          return void 0;
        }
        throw error;
      }
      element = findOnboardingTarget(targetWindow, targetId);
    }
    return element;
  }
  async _waitForTargetReady(targetWindow, target) {
    const animations = this._getActiveFiniteAnimations(target);
    if (animations.length > 0) {
      await Promise.race([
        Promise.allSettled(animations.map((animation) => animation.finished.catch(() => void 0))),
        timeout(TARGET_ANIMATION_SETTLE_TIMEOUT)
      ]);
    }
    await new Promise((resolve3) => targetWindow.requestAnimationFrame(() => resolve3()));
  }
  _getActiveFiniteAnimations(target) {
    const animations = [];
    for (let element = target; element; element = element.parentElement) {
      for (const animation of element.getAnimations()) {
        if (animation.playState === "running" && animation.effect?.getTiming().iterations !== Infinity) {
          animations.push(animation);
        }
      }
    }
    return animations;
  }
  async _runStep(overlay, context2, step, target, index2, stepCount, canGoBack = index2 > 0, isLastStep = index2 === stepCount - 1) {
    const stepStore = new DisposableStore();
    let ended = false;
    let resolveStep;
    const result = new Promise((resolve3) => resolveStep = resolve3);
    const done = (end) => {
      if (ended) {
        return;
      }
      ended = true;
      stepStore.dispose();
      resolveStep(end);
    };
    stepStore.add(overlay.onDidClickNext((via) => done({ action: "next", via })));
    stepStore.add(overlay.onDidClickPrevious(() => done({ action: "back" })));
    stepStore.add(overlay.onDidSkip((reason) => done({ action: "skip", reason })));
    stepStore.add(context2.onAbort(() => done({ action: "abort" })));
    const content = {
      title: step.title,
      description: step.description,
      stepIndex: index2,
      stepCount,
      canGoBack,
      isLastStep
    };
    overlay.show(target, content, {
      placement: step.placement,
      allowTargetInteraction: step.allowTargetInteraction,
      advanceOnTargetClick: step.advanceOnTargetClick,
      hideNext: !!step.advanceWhen,
      targetOverlayVisible: step.openTarget,
      padding: step.padding
    });
    context2.onDidShow?.();
    if (step.advanceWhen) {
      const keys = new Set(step.advanceWhen.keys());
      const advanceIfSatisfied = () => {
        if (this.contextKeyService.contextMatchesRules(step.advanceWhen)) {
          done({ action: "next", via: "condition" });
        }
      };
      stepStore.add(this.contextKeyService.onDidChangeContext((event) => {
        if (event.affectsSome(keys)) {
          advanceIfSatisfied();
        }
      }));
      advanceIfSatisfied();
    }
    if (step.openTarget && !ended) {
      try {
        await openOnboardingTarget(target);
      } catch (error) {
        onUnexpectedError(error);
      }
    }
    return result;
  }
};

SpotlightPresentation = __decorateClass([
  __decorateParam(0, IWorkbenchLayoutService),
  __decorateParam(1, IHostService),
  __decorateParam(2, IContextKeyService)
], SpotlightPresentation);
export { TARGET_RESOLVE_TIMEOUT, TARGET_POLL_INTERVAL, TARGET_ANIMATION_SETTLE_TIMEOUT, SpotlightPresentation };
