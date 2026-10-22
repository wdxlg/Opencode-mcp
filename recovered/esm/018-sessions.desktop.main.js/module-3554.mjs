// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/aquarium/browser/fish.ts
import { $ } from "./module-0075.mjs";
import { VSCODE_LOGO_PATH } from "./module-3553.mjs";


// src/vs/sessions/contrib/aquarium/browser/fish.ts
var SPECIES_COLOR = {
  ["stable" /* Stable */]: "#007ACC",
  ["insiders" /* Insiders */]: "#24bfa5",
  ["exploration" /* Exploration */]: "#E04F00"
};

function pickRandomSpecies() {
  const roll = Math.random();
  if (roll < 0.5) {
    return "stable" /* Stable */;
  }
  if (roll < 0.8) {
    return "insiders" /* Insiders */;
  }
  return "exploration" /* Exploration */;
}

function disposeSharedFishDefs(targetDocument) {
  const container2 = sharedDefsByDocument.get(targetDocument);
  if (container2) {
    container2.remove();
    sharedDefsByDocument.delete(targetDocument);
  }
}

var Fish = class {
  constructor(opts, targetDocument) {
    /** Timestamp until which this fish is in "panic" mode (faster, scattering). */
    this.panicUntil = 0;
    /**
     * Smoothed facing in [-1, 1] (1 = right, -1 = left). Eased toward
     * sign(velocityX) each frame so direction changes look like a turn instead of
     * a snap-flip.
     */
    this.facing = 1;
    this.positionX = opts.positionX;
    this.positionY = opts.positionY;
    this.velocityX = opts.velocityX;
    this.velocityY = opts.velocityY;
    this.size = opts.size;
    this.wanderAngle = Math.atan2(opts.velocityY, opts.velocityX);
    this.element = $(".agents-aquarium-fish");
    this.element.style.width = `${opts.size}px`;
    this.element.style.height = `${opts.size}px`;
    this.element.style.color = SPECIES_COLOR[opts.species];
    this.innerElement = $(".agents-aquarium-fish-inner");
    this.innerElement.appendChild(buildFishSvg(targetDocument));
    this.element.appendChild(this.innerElement);
    this.applyTransform();
  }
  /**
   * Write the current position/facing to the DOM.
   *
   * @param deltaSeconds seconds since last frame, used to ease facing toward
   * velocity direction. Pass 0 for the initial paint.
   */
  applyTransform(deltaSeconds = 0) {
    this.element.style.transform = `translate(${this.positionX.toFixed(2)}px, ${this.positionY.toFixed(2)}px)`;
    const targetFacing = this.velocityX >= 0 ? 1 : -1;
    if (deltaSeconds > 0) {
      const turnRate = 8;
      const easeFactor = 1 - Math.exp(-turnRate * deltaSeconds);
      this.facing += (targetFacing - this.facing) * easeFactor;
    } else {
      this.facing = targetFacing;
    }
    const flipScaleX = Math.sign(this.facing) * Math.max(Math.abs(this.facing), 0.05);
    this.innerElement.style.transform = `scaleX(${flipScaleX.toFixed(3)})`;
  }
  /**
   * Grow the fish by a multiplicative `factor`. Growth is intentionally
   * unbounded — a fish that keeps eating keeps getting bigger. The element's
   * footprint is updated so the body SVG (sized at 100%) scales with it.
   */
  grow(factor2) {
    if (!isFinite(factor2) || factor2 <= 0) {
      return;
    }
    const newSize = this.size * factor2;
    const delta2 = newSize - this.size;
    this.positionX -= delta2 / 2;
    this.positionY -= delta2 / 2;
    this.size = newSize;
    this.element.style.transitionDelay = "0ms";
    this.element.style.width = `${this.size}px`;
    this.element.style.height = `${this.size}px`;
    this.applyTransform();
  }
};

var NUM_BODY_STRIPS = 8;

var BODY_X_START = 5;

var BODY_X_END = 90;

var sharedDefsByDocument = /* @__PURE__ */ new WeakMap();

var SHARED_LOGO_SYMBOL_ID = "agents-aquarium-fish-logo";

function ensureSharedDefs(targetDocument) {
  if (sharedDefsByDocument.has(targetDocument)) {
    return;
  }
  const stripWidth = (BODY_X_END - BODY_X_START) / NUM_BODY_STRIPS;
  const container2 = $.SVG("svg");
  container2.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  container2.setAttribute("width", "0");
  container2.setAttribute("height", "0");
  container2.setAttribute("aria-hidden", "true");
  container2.style.position = "absolute";
  container2.style.width = "0";
  container2.style.height = "0";
  container2.style.overflow = "hidden";
  container2.style.pointerEvents = "none";
  container2.appendChild(createVSCodeLogoSymbol());
  const defs = $.SVG("defs");
  for (let i2 = 0; i2 < NUM_BODY_STRIPS; i2++) {
    const clip = $.SVG("clipPath");
    clip.setAttribute("id", `agents-aquarium-fish-clip-${i2}`);
    clip.setAttribute("clipPathUnits", "userSpaceOnUse");
    const rect = $.SVG("rect");
    rect.setAttribute("x", String(BODY_X_START + i2 * stripWidth));
    rect.setAttribute("y", "-20");
    rect.setAttribute("width", String(stripWidth + 0.8));
    rect.setAttribute("height", "136");
    clip.appendChild(rect);
    defs.appendChild(clip);
  }
  container2.appendChild(defs);
  targetDocument.body.appendChild(container2);
  sharedDefsByDocument.set(targetDocument, container2);
}

function createVSCodeLogoSymbol() {
  const symbol = $.SVG("symbol");
  symbol.setAttribute("id", SHARED_LOGO_SYMBOL_ID);
  symbol.setAttribute("viewBox", "0 0 96 96");
  symbol.setAttribute("overflow", "visible");
  const logoPath = $.SVG("path");
  logoPath.setAttribute("d", VSCODE_LOGO_PATH);
  logoPath.setAttribute("fill", "currentColor");
  logoPath.setAttribute("fill-rule", "evenodd");
  symbol.appendChild(logoPath);
  return symbol;
}

function buildFishSvg(targetDocument) {
  ensureSharedDefs(targetDocument);
  const svg2 = $.SVG("svg");
  svg2.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg2.setAttribute("focusable", "false");
  svg2.setAttribute("viewBox", "0 0 96 96");
  svg2.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg2.setAttribute("shape-rendering", "geometricPrecision");
  const bodyGroup = $.SVG("g");
  bodyGroup.setAttribute("class", "agents-aquarium-fish-body");
  for (let i2 = 0; i2 < NUM_BODY_STRIPS; i2++) {
    const stripG = $.SVG("g");
    stripG.setAttribute("class", "agents-aquarium-fish-strip");
    stripG.style.setProperty("--agents-aquarium-strip-index", String(i2));
    const stripUse = $.SVG("use");
    stripUse.setAttribute("href", `#${SHARED_LOGO_SYMBOL_ID}`);
    stripUse.setAttribute("clip-path", `url(#agents-aquarium-fish-clip-${i2})`);
    stripG.appendChild(stripUse);
    bodyGroup.appendChild(stripG);
  }
  svg2.appendChild(bodyGroup);
  return svg2;
}
export { pickRandomSpecies, disposeSharedFishDefs, ensureSharedDefs, createVSCodeLogoSymbol, buildFishSvg, SPECIES_COLOR, Fish, NUM_BODY_STRIPS, BODY_X_START, BODY_X_END, sharedDefsByDocument, SHARED_LOGO_SYMBOL_ID };
