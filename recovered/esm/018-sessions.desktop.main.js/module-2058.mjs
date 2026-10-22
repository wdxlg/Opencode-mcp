// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/voiceClient/voiceGlow.ts
import { Color, HSLA } from "./module-0197.mjs";
import { chatVoiceGlowBaseColor, chatVoiceListeningGlow, chatVoiceSpeakingGlow } from "./module-2057.mjs";
import { inputBackground } from "./module-0233.mjs";


// src/vs/workbench/contrib/chat/browser/voiceClient/voiceGlow.ts
function isGlowingVoiceState(voiceState) {
  return voiceState === "listening" || voiceState === "speaking";
}

function shouldRenderVoiceInputGlow(connected, active, ownsVoice, voiceState) {
  return connected && active && ownsVoice && isGlowingVoiceState(voiceState);
}

function readVoiceGlowIntensity(analyser, dataArray) {
  if (!analyser) {
    return 0.3;
  }
  if (!dataArray.value || dataArray.value.length !== analyser.frequencyBinCount) {
    dataArray.value = new Uint8Array(analyser.frequencyBinCount);
  }
  analyser.getByteFrequencyData(dataArray.value);
  let sum2 = 0;
  for (let i2 = 0; i2 < dataArray.value.length; i2++) {
    sum2 += dataArray.value[i2];
  }
  return Math.min(1, sum2 / dataArray.value.length / 80);
}

var VOICE_GLOW_SPEAKING_HUE_SHIFT = 80;

var VOICE_GLOW_FALLBACK = Color.fromHex("#58A6FF");

function clamp01(value2) {
  return Math.max(0, Math.min(1, value2));
}

function shiftHue(base, degrees, saturationMul = 1, lightnessAdd = 0) {
  const hsla = base.hsla;
  return new Color(new HSLA((hsla.h + degrees + 360) % 360, clamp01(hsla.s * saturationMul), clamp01(hsla.l + lightnessAdd), 1));
}

var DEFAULT_VOICE_GLOW_COLORS = {
  listening: VOICE_GLOW_FALLBACK,
  speaking: shiftHue(VOICE_GLOW_FALLBACK, VOICE_GLOW_SPEAKING_HUE_SHIFT),
  background: Color.fromHex("#3C3C3C")
};

function resolveVoiceGlowColors(theme) {
  const base = theme.getColor(chatVoiceGlowBaseColor) ?? VOICE_GLOW_FALLBACK;
  return {
    listening: theme.getColor(chatVoiceListeningGlow) ?? base,
    speaking: theme.getColor(chatVoiceSpeakingGlow) ?? shiftHue(base, VOICE_GLOW_SPEAKING_HUE_SHIFT),
    background: theme.getColor(inputBackground) ?? DEFAULT_VOICE_GLOW_COLORS.background
  };
}

function voiceGlowStateColor(voiceState, colors) {
  return voiceState === "speaking" ? colors.speaking : colors.listening;
}

var RIM_SAT_MIN = 70;

var RIM_SAT_MAX = 96;

var RIM_LIGHTNESS = {
  dark: { cool: 56, warm: 72 },
  light: { cool: 72, warm: 72 }
};

var RIM_HUE_SHIFT = { cool: -10, warm: 7 };

function resolveVoiceRimAccent(accent, mood, theme, background) {
  const { h: h3, s } = accent.hsla;
  const tuned = new Color(new HSLA(
    (h3 + RIM_HUE_SHIFT[mood] + 360) % 360,
    Math.min(RIM_SAT_MAX, Math.max(RIM_SAT_MIN, s * 100)) / 100,
    RIM_LIGHTNESS[theme][mood] / 100,
    1
  ));
  const contrasted = (background ?? (theme === "light" ? Color.white : DEFAULT_VOICE_GLOW_COLORS.background)).ensureConstrast(tuned, 3);
  return {
    hue: contrasted.hsla.h,
    saturation: Math.round(contrasted.hsla.s * 100),
    lightness: Math.round(contrasted.hsla.l * 100)
  };
}
export { isGlowingVoiceState, shouldRenderVoiceInputGlow, readVoiceGlowIntensity, clamp01, shiftHue, resolveVoiceGlowColors, voiceGlowStateColor, resolveVoiceRimAccent, VOICE_GLOW_SPEAKING_HUE_SHIFT, VOICE_GLOW_FALLBACK, DEFAULT_VOICE_GLOW_COLORS, RIM_SAT_MIN, RIM_SAT_MAX, RIM_LIGHTNESS, RIM_HUE_SHIFT };
