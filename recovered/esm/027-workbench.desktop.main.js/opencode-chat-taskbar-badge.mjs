// OpenCode maintained module (not a recovered original module).
// Taskbar status circle for native Chat sessions, modelled on 模型助手 TaskbarStatusBadgeIcon:
// red = failed or waiting for input, yellow = running, green = completed and not yet viewed (archived excluded).
// Only states reached during THIS launch count: sessions restored from history stay uncoloured
// until they are created, run or change status while OpenCode is running; a restart clears it all.
// Priority red > yellow > green; the circle shows the count of the winning colour.
// Rendered via INativeHostService.setApplicationBadge -> BrowserWindow.setOverlayIcon on Windows.
import { Disposable, toDisposable } from "./module-0012.mjs";
import { mainWindow } from "./module-0002.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { IAgentSessionsService } from "./module-1464.mjs";
import { INativeHostService } from "./module-2591.mjs";

// ChatSessionStatus: 0 Failed, 1 Completed, 2 InProgress, 3 NeedsInput
var STATUS_FAILED = 0;
var STATUS_COMPLETED = 1;
var STATUS_IN_PROGRESS = 2;
var STATUS_NEEDS_INPUT = 3;

function safeCall(fn, fallback) {
  try { return fn(); } catch { return fallback; }
}

var LAUNCH_TIME = Date.now();

function sessionKey(session) {
  return safeCall(() => String(session.resource?.toString?.() ?? session.resource ?? session.id ?? ""), "") || void 0;
}

function activeThisLaunch(session) {
  const timing = safeCall(() => session.timing, void 0) ?? {};
  return [timing.created, timing.lastRequestStarted, timing.lastRequestEnded].some((t) => typeof t === "number" && t >= LAUNCH_TIME);
}

// tracker: Map key -> { baseline: status at first sight, live: counted from now until restart }
// Shared by the taskbar circle and the conversation list tint so both always agree.
var SHARED_TRACKER = new Map();

// Colour of one conversation: red = failed or waiting for input, yellow = running,
// green = completed and not yet viewed. Green clears as soon as the conversation is opened or is
// the visible one when it finishes (the chat widget marks it read). Archived and history-only
// sessions get no colour.
function sessionStateColor(session, tracker = SHARED_TRACKER) {
  if (!session || safeCall(() => session.isArchived(), false)) return void 0;
  const status = session.status;
  if (tracker) {
    const key = sessionKey(session);
    if (!key) return void 0;
    let entry = tracker.get(key);
    if (!entry) {
      entry = { baseline: status, live: false };
      tracker.set(key, entry);
    }
    if (!entry.live && (status !== entry.baseline || activeThisLaunch(session))) entry.live = true;
    if (!entry.live) return void 0;
  }
  if (status === STATUS_NEEDS_INPUT || status === STATUS_FAILED) return "red";
  if (status === STATUS_IN_PROGRESS) return "yellow";
  if (status === STATUS_COMPLETED) return safeCall(() => session.isRead(), false) ? void 0 : "green";
  return void 0;
}

function countChatSessionStates(sessions, tracker = SHARED_TRACKER) {
  let red = 0, yellow = 0, green = 0;
  for (const session of sessions ?? []) {
    const color = sessionStateColor(session, tracker);
    if (color === "red") red++;
    else if (color === "yellow") yellow++;
    else if (color === "green") green++;
  }
  return { red, yellow, green };
}

// Conversation list tint (read by agentSessionsViewer renderElement via the global hook).
globalThis.__ocSessionStateColor = (session) => safeCall(() => sessionStateColor(session), void 0);
var LIST_TINT_CSS = `
.agent-session-item.oc-session-state-red, .agent-session-item.oc-session-state-yellow, .agent-session-item.oc-session-state-green { position: relative; }
.agent-session-item.oc-session-state-red::before, .agent-session-item.oc-session-state-yellow::before, .agent-session-item.oc-session-state-green::before {
  content: ""; position: absolute; left: 1px; top: 22%; bottom: 22%; width: 2px; border-radius: 2px; background: var(--oc-state-color); pointer-events: none;
}
.agent-session-item.oc-session-state-red { --oc-state-color: #f14c4c; }
.agent-session-item.oc-session-state-yellow { --oc-state-color: #e2b93d; }
.agent-session-item.oc-session-state-green { --oc-state-color: #3fb950; }
.agent-session-item.oc-session-state-red .agent-session-icon, .agent-session-item.oc-session-state-yellow .agent-session-icon, .agent-session-item.oc-session-state-green .agent-session-icon { color: var(--oc-state-color) !important; }
.agent-session-item.oc-session-state-green .agent-session-title { font-weight: 600; }
`;
function installListTintStyle() {
  safeCall(() => {
    const doc = mainWindow.document;
    if (doc.getElementById("oc-session-state-tint")) return;
    const style = doc.createElement("style");
    style.id = "oc-session-state-tint";
    style.textContent = LIST_TINT_CSS;
    doc.head.appendChild(style);
  }, void 0);
}
installListTintStyle();

function selectBadge(counts) {
  if (counts.red > 0) return { color: "red", count: counts.red };
  if (counts.yellow > 0) return { color: "yellow", count: counts.yellow };
  if (counts.green > 0) return { color: "green", count: counts.green };
  return void 0;
}

function describeBadge(counts) {
  const parts = [];
  if (counts.red) parts.push(`${counts.red} 个对话失败或等待输入`);
  if (counts.yellow) parts.push(`${counts.yellow} 个对话正在进行`);
  if (counts.green) parts.push(`${counts.green} 个对话已完成`);
  return "OpenCode：" + parts.join("，");
}

// ---- Pixel renderer ported 1:1 from 模型助手 TaskbarStatusBadgeIcon.RenderOverlayBitmap ----
// Signed-distance anti-aliased circle + rim and stroke-vector digits (no font), drawn at the exact
// taskbar overlay pixel size (SM_CXSMICON for the window DPI) so Windows never rescales it.
var BADGE_RGB = { red: [255, 76, 70], yellow: [255, 212, 38], green: [52, 218, 98] };
var RIM_RGB = [16, 18, 22];
var INK_RGB = [12, 14, 18];
function gLine(x1, y1, x2, y2) { return { arc: false, a: x1, b: y1, c: x2, d: y2 }; }
function gArc(cx, cy, r, start, sweep) { return { arc: true, a: cx, b: cy, c: r, d: start, e: sweep }; }
function glyph(widthRatio, scale, ...prims) { return { widthRatio, scale, prims }; }
var GLYPHS = {
  "0": glyph(0.58, 1.0, gArc(0.29, 0.29, 0.29, 180, 180), gLine(0.58, 0.29, 0.58, 0.71), gArc(0.29, 0.71, 0.29, 0, 180), gLine(0.00, 0.71, 0.00, 0.29)),
  "1": glyph(0.34, 1.0, gLine(0.02, 0.20, 0.26, 0.00), gLine(0.26, 0.00, 0.26, 1.00)),
  "2": glyph(0.58, 1.0, gArc(0.29, 0.28, 0.28, 195, 200), gLine(0.53, 0.43, 0.02, 1.00), gLine(0.02, 1.00, 0.58, 1.00)),
  "3": glyph(0.56, 1.0, gArc(0.27, 0.24, 0.24, 205, 240), gLine(0.18, 0.48, 0.28, 0.48), gArc(0.28, 0.74, 0.26, 270, 245)),
  "4": glyph(0.60, 1.0, gLine(0.42, 0.00, 0.00, 0.68), gLine(0.00, 0.68, 0.60, 0.68), gLine(0.42, 0.00, 0.42, 1.00)),
  "5": glyph(0.56, 1.0, gLine(0.52, 0.00, 0.06, 0.00), gLine(0.06, 0.00, 0.04, 0.44), gArc(0.28, 0.71, 0.28, 235, 250)),
  "6": glyph(0.58, 1.0, gArc(0.31, 0.28, 0.26, 195, 145), gLine(0.05, 0.22, 0.01, 0.72), gArc(0.29, 0.72, 0.28, 0, 360)),
  "7": glyph(0.56, 1.0, gLine(0.00, 0.00, 0.56, 0.00), gLine(0.56, 0.00, 0.18, 1.00)),
  "8": glyph(0.58, 1.0, gArc(0.29, 0.24, 0.24, 0, 360), gArc(0.29, 0.74, 0.26, 0, 360)),
  "9": glyph(0.58, 1.0, gArc(0.29, 0.28, 0.28, 0, 360), gLine(0.57, 0.28, 0.53, 0.78), gArc(0.27, 0.72, 0.26, 15, 145)),
  "+": glyph(0.48, 0.62, gLine(0.24, 0.08, 0.24, 0.92), gLine(0.00, 0.50, 0.48, 0.50))
};
function clampOverlaySize(size) { return size < 16 ? 16 : size > 64 ? 64 : size; }
// One frame per pixel size 16..48 (every monitor scale up to 300%, custom scales included); the
// main process's native host picks the frame equal to GetSystemMetricsForDpi(SM_CXSMICON) for the
// window's monitor, exactly like 模型助手, so Windows never rescales it.
var OVERLAY_FRAME_SIZES = Array.from({ length: 33 }, (_, i) => 16 + i);
function overlayPixelSize() {
  const dpr = safeCall(() => mainWindow.devicePixelRatio, 1) || 1;
  return clampOverlaySize(Math.round(16 * dpr));
}
function coverage(sd) { const v = sd + 0.5; return v <= 0 ? 0 : v >= 1 ? 1 : v; }
function clampByte(v) { const r = Math.round(v); return r <= 0 ? 0 : r >= 255 ? 255 : r; }
function normalizeDegrees(deg) { const m = deg % 360; return m < 0 ? m + 360 : m; }
function pointSegmentDistance(px, py, ax, ay, bx, by) {
  const vx = bx - ax, vy = by - ay, wx = px - ax, wy = py - ay;
  const c1 = vx * wx + vy * wy;
  if (c1 <= 0) return Math.hypot(px - ax, py - ay);
  const c2 = vx * vx + vy * vy;
  if (c2 <= c1) return Math.hypot(px - bx, py - by);
  const t = c1 / c2;
  return Math.hypot(px - (ax + t * vx), py - (ay + t * vy));
}
function pointArcDistance(px, py, cx, cy, r, startDeg, sweepDeg) {
  const dx = px - cx, dy = py - cy;
  const ang = Math.atan2(dy, dx) * (180 / Math.PI);
  const within = sweepDeg >= 0 ? normalizeDegrees(ang - startDeg) <= sweepDeg : normalizeDegrees(startDeg - ang) <= -sweepDeg;
  if (within) return Math.abs(Math.hypot(dx, dy) - r);
  const r1 = startDeg * (Math.PI / 180), r2 = (startDeg + sweepDeg) * (Math.PI / 180);
  const d1 = Math.hypot(px - (cx + r * Math.cos(r1)), py - (cy + r * Math.sin(r1)));
  const d2 = Math.hypot(px - (cx + r * Math.cos(r2)), py - (cy + r * Math.sin(r2)));
  return d1 < d2 ? d1 : d2;
}
function renderOverlayPixels(selection, size) {
  const side = clampOverlaySize(size);
  const out = new Uint8ClampedArray(side * side * 4);
  const fill = BADGE_RGB[selection.color];
  const text = selection.count > 99 ? "99+" : String(selection.count);
  const cx = side * 0.5, cy = side * 0.5;
  const outerR = side * 0.5 - 0.35;
  const rim = Math.max(1.0, side * 0.068);
  const innerR = outerR - rim;
  const n = text.length;
  let high, strokeW, gap;
  if (n === 1) { high = Math.round(side * 0.44); strokeW = Math.max(1.80, side * 0.125); gap = 0; }
  else if (n === 2) { high = Math.round(side * 0.35); strokeW = Math.max(1.55, side * 0.102); gap = strokeW * 0.38; }
  else { high = Math.max(4.0, Math.round(side * 0.26)); strokeW = Math.max(1.25, side * 0.080); gap = strokeW * 0.24; }
  const specs = [];
  let inkWidth = gap * Math.max(0, n - 1);
  for (const ch of text) { const spec = GLYPHS[ch] ?? GLYPHS["0"]; specs.push(spec); inkWidth += spec.widthRatio * spec.scale * high + strokeW; }
  const top0 = Math.round(cy - high * 0.5 - strokeW * 0.5) + strokeW * 0.5;
  let left = cx - inkWidth * 0.5 + strokeW * 0.5;
  const prims = [];
  for (const spec of specs) {
    const gh = high * spec.scale, drop = (high - gh) * 0.5;
    for (const s of spec.prims) {
      if (!s.arc) prims.push(gLine(left + s.a * gh, top0 + drop + s.b * gh, left + s.c * gh, top0 + drop + s.d * gh));
      else prims.push(gArc(left + s.a * gh, top0 + drop + s.b * gh, s.c * gh, s.d, s.e));
    }
    left += spec.widthRatio * gh + strokeW + gap;
  }
  const halfStroke = strokeW * 0.5;
  for (let y = 0; y < side; y++) {
    const py = y + 0.5;
    for (let x = 0; x < side; x++) {
      const px = x + 0.5;
      const dCenter = Math.hypot(px - cx, py - cy);
      const aOuter = coverage(outerR - dCenter);
      if (aOuter <= 0) continue;
      const aInner = coverage(innerR - dCenter);
      let minDist = Number.MAX_VALUE;
      for (const s of prims) {
        const dist = s.arc ? pointArcDistance(px, py, s.a, s.b, s.c, s.d, s.e) : pointSegmentDistance(px, py, s.a, s.b, s.c, s.d);
        if (dist < minDist) minDist = dist;
      }
      const aDigit = coverage(halfStroke - minDist) * aInner;
      const i = (y * side + x) * 4;
      for (let k = 0; k < 3; k++) {
        const bg = RIM_RGB[k] + (fill[k] - RIM_RGB[k]) * aInner;
        out[i + k] = clampByte(bg + (INK_RGB[k] - bg) * aDigit);
      }
      out[i + 3] = clampByte(aOuter * 255);
    }
  }
  return { side, pixels: out };
}

function renderBadgeIcon(selection, size) {
  const { side, pixels } = renderOverlayPixels(selection, size);
  const canvas = mainWindow.document.createElement("canvas");
  canvas.width = side;
  canvas.height = side;
  const ctx = canvas.getContext("2d");
  if (!ctx) return void 0;
  // putImageData writes straight (non-premultiplied) RGBA, matching Format32bppArgb.
  ctx.putImageData(new ImageData(pixels, side, side), 0, 0);
  return canvas.toDataURL("image/png");
}

var OpenCodeChatTaskbarBadge = class extends Disposable {
  constructor(agentSessionsService, nativeHostService) {
    super();
    this._agentSessionsService = agentSessionsService;
    this._nativeHostService = nativeHostService;
    this._lastKey = "none";
    this._timer = void 0;
    this._tracker = SHARED_TRACKER;
    this._size = overlayPixelSize();
    const model = safeCall(() => agentSessionsService.model, void 0);
    if (!model) return;
    this._register(model.onDidChangeSessions(() => this._schedule()));
    // Re-render at the new native size when the window moves to a monitor with another DPI.
    const watchDpr = () => {
      const query = safeCall(() => mainWindow.matchMedia(`(resolution: ${mainWindow.devicePixelRatio}dppx)`), void 0);
      if (!query) return;
      const onChange = () => { query.removeEventListener("change", onChange); this._schedule(); watchDpr(); };
      query.addEventListener("change", onChange);
      this._dprDispose = () => query.removeEventListener("change", onChange);
    };
    watchDpr();
    this._register(toDisposable(() => this._dprDispose?.()));
    // Fallback for state changes that do not raise a sessions event (cheap: cached key).
    const interval = mainWindow.setInterval(() => this._schedule(), 4e3);
    this._register(toDisposable(() => mainWindow.clearInterval(interval)));
    this._register(toDisposable(() => {
      if (this._timer !== void 0) mainWindow.clearTimeout(this._timer);
      if (this._lastKey !== "none") this._apply(void 0);
    }));
    this._schedule();
  }
  static {
    this.ID = "workbench.contrib.opencodeChatTaskbarBadge";
  }
  _schedule() {
    if (this._timer !== void 0) return;
    this._timer = mainWindow.setTimeout(() => {
      this._timer = void 0;
      this._update();
    }, 150);
  }
  _update() {
    const counts = safeCall(() => countChatSessionStates(this._agentSessionsService.model.sessions, this._tracker), void 0);
    if (!counts) return;
    const selection = selectBadge(counts);
    const size = overlayPixelSize();
    const key = selection ? `${selection.color}:${selection.count}@${size}` : "none";
    if (key === this._lastKey) return;
    this._lastKey = key;
    this._size = size;
    if (!selection) {
      this._apply(void 0);
      return;
    }
    const iconDataURL = safeCall(() => renderBadgeIcon(selection, size), void 0);
    const iconDataURLs = {};
    for (const frame of OVERLAY_FRAME_SIZES) {
      const url = safeCall(() => renderBadgeIcon(selection, frame), void 0);
      if (url) iconDataURLs[frame] = url;
    }
    const description = describeBadge(counts);
    this._apply(iconDataURL ? { count: selection.count, description, iconDataURL, iconDataURLs } : { count: selection.count, description });
  }
  _apply(badge) {
    try {
      const pending = this._nativeHostService.setApplicationBadge(badge);
      if (pending && typeof pending.catch === "function") pending.catch(() => void 0);
    } catch {
    }
  }
};

OpenCodeChatTaskbarBadge = __decorateClass([
  __decorateParam(0, IAgentSessionsService),
  __decorateParam(1, INativeHostService)
], OpenCodeChatTaskbarBadge);

registerWorkbenchContribution2(OpenCodeChatTaskbarBadge.ID, OpenCodeChatTaskbarBadge, WorkbenchPhase.Eventually);

export { OpenCodeChatTaskbarBadge, countChatSessionStates, sessionStateColor, selectBadge, renderOverlayPixels };
