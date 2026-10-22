// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/speechToText/dictationMicGlow.ts
import { chatDictationActiveMicGlow } from "./module-2057.mjs";
import { DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { getWindow } from "./module-0075.mjs";
import { readVoiceGlowIntensity } from "./module-2058.mjs";
import { isDark } from "./module-0247.mjs";
import { inputBackground } from "./module-0233.mjs";
import { createVoiceRimLight } from "./module-2071.mjs";
import { isDictationActiveOnSurface } from "./module-1347.mjs";
import { localize } from "./module-0001.mjs";
import { Event2 } from "./module-0017.mjs";
import { autorun } from "./module-0052.mjs";


// src/vs/workbench/contrib/chat/browser/speechToText/dictationMicGlow.ts
function getDictationMicGlowPhase(state, isPreparingModel) {
  if (isPreparingModel || state === "idle" /* Idle */) {
    return "off";
  }
  return state === "recording" /* Recording */ ? "live" : "settling";
}

function easeDictationMicLevel(current, target) {
  return current + (target - current) * (target > current ? 0.1 : 0.035);
}

function shapeDictationMicLevel(level) {
  return Math.min(1, Math.pow(Math.min(1, Math.max(0, level)), 0.7) * 1.15);
}

var RESTING_LEVEL = 0.12;

var REDUCED_MOTION_LEVEL = 0.45;

function resolveDictationMicAccent(theme) {
  return theme.getColor(chatDictationActiveMicGlow);
}

function setupDictationMicGlow(target, service, accessibilityService, isActive2, themeService) {
  const store = new DisposableStore();
  const window2 = getWindow(target);
  const button = target.querySelector(".action-label") ?? target;
  const originalLabel = button.getAttribute("aria-label");
  const dataArray = { value: void 0 };
  const rim = store.add(new MutableDisposable());
  let animationFrame;
  let level = 0;
  const setLevel = (value2, animate3) => {
    level = value2;
    target.style.setProperty("--dictation-mic-level", value2.toFixed(3));
    if (animate3) {
      rim.value?.drive(value2);
    } else {
      rim.value?.driveStatic(value2);
    }
  };
  const stopAnimation = () => {
    if (animationFrame !== void 0) {
      window2.cancelAnimationFrame(animationFrame);
      animationFrame = void 0;
    }
  };
  const animate2 = () => {
    animationFrame = window2.requestAnimationFrame(animate2);
    const measured = service.state === "recording" /* Recording */ && service.analyserNode ? readVoiceGlowIntensity(service.analyserNode, dataArray) : RESTING_LEVEL;
    setLevel(easeDictationMicLevel(level, shapeDictationMicLevel(measured)), true);
  };
  const syncRim = (lit) => {
    if (!themeService) {
      return;
    }
    if (!lit) {
      rim.clear();
      return;
    }
    const theme = themeService.getColorTheme();
    const accent = resolveDictationMicAccent(theme);
    if (!accent) {
      rim.clear();
      return;
    }
    const kind = isDark(theme.type) ? "dark" : "light";
    const background = theme.getColor(inputBackground);
    if (rim.value) {
      rim.value.refresh(accent, kind, background);
    } else {
      rim.value = createVoiceRimLight(target, accent, kind, "cool", background);
    }
  };
  const update = (active = isActive2?.get() !== false) => {
    active = active && isDictationActiveOnSurface(service, "chat");
    const starting = active && service.isStarting;
    target.classList.toggle("dictation-mic-starting", starting);
    const status2 = starting ? localize(11625, null) : active && service.isPreparingModel ? localize(11622, null) : active && service.state === "recording" /* Recording */ ? localize(11624, null) : active && service.state === "transcribing" /* Transcribing */ ? localize(11623, null) : void 0;
    if (status2) {
      button.setAttribute("aria-label", status2);
    } else if (originalLabel !== null) {
      button.setAttribute("aria-label", originalLabel);
    } else {
      button.removeAttribute("aria-label");
    }
    button.setAttribute("aria-busy", String(starting || active && service.state === "transcribing" /* Transcribing */));
    const phase = active ? getDictationMicGlowPhase(service.state, service.isPreparingModel) : "off";
    target.classList.toggle("dictation-mic-active", phase !== "off");
    target.classList.toggle("dictation-mic-settling", phase === "settling");
    syncRim(phase !== "off");
    if (phase === "off" || accessibilityService.isMotionReduced()) {
      stopAnimation();
      setLevel(phase === "off" ? 0 : REDUCED_MOTION_LEVEL, false);
      return;
    }
    if (animationFrame === void 0) {
      animationFrame = window2.requestAnimationFrame(animate2);
    }
  };
  store.add(Event2.any(service.onDidChangeState, service.onDidChangePreparingModel, service.onDidChangeStarting)(() => update()));
  store.add(accessibilityService.onDidChangeReducedMotion(() => update()));
  if (themeService) {
    store.add(themeService.onDidColorThemeChange(() => update()));
  }
  if (isActive2) {
    store.add(autorun((reader) => {
      update(isActive2.read(reader));
    }));
  }
  store.add(toDisposable(() => {
    stopAnimation();
    target.classList.remove("dictation-mic-active", "dictation-mic-settling", "dictation-mic-starting");
    if (originalLabel !== null) {
      button.setAttribute("aria-label", originalLabel);
    } else {
      button.removeAttribute("aria-label");
    }
    button.removeAttribute("aria-busy");
    target.style.removeProperty("--dictation-mic-level");
  }));
  update();
  return store;
}
export { getDictationMicGlowPhase, easeDictationMicLevel, shapeDictationMicLevel, resolveDictationMicAccent, setupDictationMicGlow, RESTING_LEVEL, REDUCED_MOTION_LEVEL };
