// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/voiceClient/voiceInputDecorations.ts
import { isEqual2 } from "./module-0034.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { $, getWindow } from "./module-0075.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { createVoiceGlowController } from "./module-2071.mjs";
import { isDark } from "./module-0247.mjs";
import { readVoiceGlowIntensity, resolveVoiceGlowColors, shouldRenderVoiceInputGlow } from "./module-2058.mjs";
import { autorun } from "./module-0052.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/browser/voiceClient/voiceInputDecorations.ts
function setupVoiceInputDecorations(services, options3) {
  const { voiceSessionController, ttsPlaybackService, micCaptureService, configurationService, keybindingService, themeService, accessibilityService } = services;
  const { inputContainer: inputContainerEl, isActive: isActive2 } = options3;
  const glowContainerEl = options3.glowContainer ?? inputContainerEl;
  const isSurfaceOwner = (reader) => {
    if (options3.isOwner) {
      return options3.isOwner.read(reader);
    }
    const owner = options3.currentVoiceInputResource?.read(reader);
    const current = options3.getCurrentResource?.();
    return !!current && !!owner && isEqual2(current, owner);
  };
  const store = new DisposableStore();
  inputContainerEl.style.position = "relative";
  const transcriptOverlay = $(".voice-transcript-overlay");
  const transcriptScrollable = store.add(new DomScrollableElement(transcriptOverlay, {
    horizontal: 2 /* Hidden */,
    vertical: 1 /* Auto */
  }));
  const transcriptOverlayNode = transcriptScrollable.getDomNode();
  transcriptOverlayNode.classList.add("voice-transcript-overlay-scrollable");
  transcriptOverlayNode.style.display = "none";
  inputContainerEl.append(transcriptOverlayNode);
  const win = getWindow(glowContainerEl);
  let animFrameId;
  const glowDataArrayRef = { value: void 0 };
  let glowController;
  try {
    glowController = store.add(createVoiceGlowController(
      glowContainerEl,
      () => isDark(themeService.getColorTheme().type) ? "dark" : "light",
      () => resolveVoiceGlowColors(themeService.getColorTheme())
    ));
  } catch (error) {
    store.dispose();
    throw error;
  }
  store.add(themeService.onDidColorThemeChange(() => glowController.refreshTheme()));
  const startGlowAnimation = () => {
    if (animFrameId !== void 0) {
      return;
    }
    const animate2 = () => {
      animFrameId = win.requestAnimationFrame(animate2);
      const voiceState = voiceSessionController.voiceState.get();
      const analyser = ttsPlaybackService.analyserNode ?? (voiceState === "listening" ? micCaptureService.analyserNode : null) ?? null;
      const intensity = readVoiceGlowIntensity(analyser, glowDataArrayRef);
      glowController.render(voiceState, intensity, accessibilityService.isMotionReduced());
    };
    animFrameId = win.requestAnimationFrame(animate2);
  };
  const stopGlowAnimation = () => {
    if (animFrameId !== void 0) {
      win.cancelAnimationFrame(animFrameId);
      animFrameId = void 0;
    }
    glowController.clear();
  };
  store.add(autorun((reader) => {
    const connected = voiceSessionController.isConnected.read(reader);
    const voiceState = voiceSessionController.voiceState.read(reader);
    const active = isActive2.read(reader);
    const ownsVoice = isSurfaceOwner(reader);
    const glowState = voiceState === "listening" && voiceSessionController.isMuted.read(reader) ? "idle" : voiceState;
    if (shouldRenderVoiceInputGlow(connected, active, ownsVoice, glowState)) {
      startGlowAnimation();
    } else {
      stopGlowAnimation();
    }
  }));
  store.add({ dispose: () => stopGlowAnimation() });
  store.add(autorun((reader) => {
    const turns = voiceSessionController.transcriptTurns.read(reader);
    const connected = voiceSessionController.isConnected.read(reader);
    const voiceState = voiceSessionController.voiceState.read(reader);
    const active = isActive2.read(reader);
    const hasInput = (options3.inputValue?.read(reader).length ?? 0) > 0;
    const showTranscript = configurationService.getValue("agents.voice.showTranscript") !== false;
    const visible = turns.filter((t2) => t2.text.length > 0 || t2.speaker === "user" && t2.isPartial);
    if (!connected || !active || !isSurfaceOwner(reader)) {
      transcriptOverlayNode.style.display = "none";
      transcriptOverlayNode.classList.remove("has-transcript");
      return;
    }
    if (visible.length === 0 || !showTranscript) {
      if (hasInput) {
        transcriptOverlayNode.style.display = "none";
        transcriptOverlayNode.classList.remove("has-transcript");
        return;
      }
      const handsFree = configurationService.getValue("agents.voice.handsFree") === true;
      if (!showTranscript && voiceState === "listening") {
        transcriptOverlayNode.style.display = "";
        transcriptOverlayNode.classList.remove("has-transcript");
        transcriptOverlay.replaceChildren();
        const listening = $("span.listening");
        listening.textContent = voiceSessionController.isMuted.read(reader) ? localize(11778, null) : localize(11777, null);
        transcriptOverlay.append(listening);
        transcriptScrollable.scanDomNode();
      } else if (!showTranscript && voiceState === "speaking") {
        transcriptOverlayNode.style.display = "";
        transcriptOverlayNode.classList.remove("has-transcript");
        transcriptOverlay.replaceChildren();
        const hint = $("span.partial");
        const kb = keybindingService.lookupKeybinding("agentsVoice.pushToTalk");
        const kbLabel = kb?.getLabel();
        hint.textContent = kbLabel ? localize(11774, null, kbLabel) : localize(11775, null);
        transcriptOverlay.append(hint);
        transcriptScrollable.scanDomNode();
      } else if (voiceState === "idle" && visible.length === 0 && showTranscript && !handsFree) {
        transcriptOverlayNode.style.display = "";
        transcriptOverlayNode.classList.remove("has-transcript");
        transcriptOverlay.replaceChildren();
        const hint = $("span.partial");
        const kb = keybindingService.lookupKeybinding("agentsVoice.pushToTalk");
        const kbLabel = kb?.getLabel();
        hint.textContent = kbLabel ? localize(11779, null, kbLabel) : localize(11776, null);
        transcriptOverlay.append(hint);
        transcriptScrollable.scanDomNode();
      } else {
        transcriptOverlayNode.style.display = "none";
        transcriptOverlayNode.classList.remove("has-transcript");
      }
      return;
    }
    transcriptOverlayNode.style.display = "";
    transcriptOverlayNode.classList.add("has-transcript");
    const lastTurn = visible[visible.length - 1];
    const contentElements = [];
    if (lastTurn.speaker === "user") {
      const span = $("span");
      if (lastTurn.isPartial) {
        const committedPart = lastTurn.committed || "";
        const unsurePart = lastTurn.text.slice(committedPart.length);
        if (committedPart) {
          const c = $("span.committed");
          c.textContent = committedPart;
          span.append(c);
        }
        const u = $("span.partial");
        u.textContent = unsurePart + "\u2589";
        span.append(u);
      } else {
        span.className = "committed";
        span.textContent = lastTurn.text;
      }
      contentElements.push(span);
    } else {
      const div = $("div.assistant-text");
      div.textContent = lastTurn.text;
      contentElements.push(div);
    }
    transcriptOverlay.replaceChildren(...contentElements);
    transcriptScrollable.scanDomNode();
    transcriptScrollable.setScrollPosition({ scrollTop: 0 });
  }));
  return store;
}
export { setupVoiceInputDecorations };
