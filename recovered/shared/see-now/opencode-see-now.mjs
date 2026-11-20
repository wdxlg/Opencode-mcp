// OpenCode native tool `see_now`: glue around the vendored dsh-see-now core
// (Apache-2.0, https://github.com/SAOS-3624/dsh-see-now — see LICENSE, NOTICE, SOURCE.json).
// Written for OpenCode; not part of upstream. No floating window, no debug window, no DSH host APIs,
// no microphone/loopback recording. Nothing runs at import time: capture only starts inside a tool call.
import { existsSync, statSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { delimiter, join, isAbsolute } from 'node:path';
import { spawnFrames, pickScreenEngine, captureErrorInfo, CAPTURE_HINTS } from './capture.js';
import { createPipeline } from './pipeline.js';
import { encodePng } from './png.js';
import { parseRegion, cellSize } from './layout.js';
import { resolveFfmpeg } from './binaries.js';
import { asrConfig, httpTranscriber, canonicalizeWav } from './asr.js';

export const SEE_NOW_ACTIONS = Object.freeze(['watch', 'peek', 'start', 'stop', 'status', 'region', 'help']);
// Canvas sizes / long edges copied from upstream src/runner.js (SIZES, LONG_EDGE); `ultra` omitted.
const SIZES = Object.freeze({ low: [798, 450], standard: [1050, 600], high: [1260, 720] });
const LONG_EDGE = Object.freeze({ low: 800, standard: 1066, high: 1280 });
const FPS = 12;
const DEFAULT_WATCH_SEC = 8;
const MAX_WATCH_SEC = 60;
const DEFAULT_FILE_SEC = 120;
const MAX_FILE_SEC = 1800;
const MAX_ASR_SEC = 300;
const MAX_SHEETS = 4;
const SESSION_MAX_MS = 30 * 60 * 1000;

export class SeeNowToolError extends Error {
  constructor(code, message) { super(message); this.code = code; this.name = 'SeeNowToolError'; }
}

let region = null;            // {x,y,w,h} screen physical pixels; persists for this extension host process
let session = null;           // background capture started by action=start

function which(names, env = process.env) {
  const dirs = String(env.PATH || env.Path || '').split(delimiter).filter(Boolean);
  for (const dir of dirs) for (const name of names) {
    const p = join(dir, name);
    try { if (existsSync(p) && statSync(p).isFile()) return p; } catch { /* unreadable PATH entry */ }
  }
  return null;
}

/** Read-only dependency inspection: never executes ffmpeg/python, never installs anything. */
export function seeNowEnvironment(env = process.env, platform = process.platform) {
  const win = platform === 'win32';
  const ff = resolveFfmpeg({ env, platform });
  let ffAvailable = false;
  let ffPath = ff.path;
  if (ff.source === 'PATH') {
    const found = which([win ? 'ffmpeg.exe' : 'ffmpeg'], env);
    ffAvailable = !!found;
    if (found) ffPath = found;
  } else {
    ffAvailable = isAbsolute(ff.path) && existsSync(ff.path);
  }
  const python = which(win ? ['python.exe', 'python3.exe', 'py.exe'] : ['python3', 'python'], env);
  const asr = asrConfig(env);
  return {
    platform,
    ffmpeg: { available: ffAvailable, path: ffAvailable ? ffPath : null, source: ff.source, requested: ff.path },
    python: { found: !!python, path: python },
    asr: asr
      ? { configured: true, baseUrl: asr.baseUrl, api: asr.api, model: asr.model, language: asr.language, key: asr.key ? 'set' : 'unset' }
      : { configured: false },
  };
}

const CONFIG_HELP = [
  'ffmpeg：see_now 需要 ffmpeg 命令行程序（ffmpeg.exe）。OpenCode 自带的 ffmpeg.dll 只是 Electron 解码库，不能代替。',
  '  配置：把 ffmpeg.exe 所在目录加入 PATH；或设置环境变量 OPENCODE_SEE_NOW_FFMPEG=<ffmpeg.exe 绝对路径>',
  '  （也认 FFMPEG_PATH，或 OPENCODE_SEE_NOW_FFMPEG_DIR=<目录>），然后重启 OpenCode。本工具不会自动下载或安装。',
  '听声音（仅视频文件的音轨，listen:true）：需要一个 HTTP 转写服务，本工具不录麦克风/系统声音、不启动服务。',
  '  配置：OPENCODE_SEE_NOW_ASR_BASE_URL=<如 http://127.0.0.1:8000/v1>；可选 OPENCODE_SEE_NOW_ASR_API=openai-audio|chat-audio、',
  '  OPENCODE_SEE_NOW_ASR_MODEL、OPENCODE_SEE_NOW_ASR_LANGUAGE（默认 zh）、OPENCODE_SEE_NOW_ASR_KEY。',
  '  本地服务通常由 Python 跑（如 FunASR / SenseVoice / faster-whisper 的 OpenAI 兼容服务），需要用户自行安装并启动。',
].join('\n');

const HELP_TEXT = [
  'see_now —— 看屏幕 / 截图 / 看视频（基于 dsh-see-now：按画面变化量筛帧，多帧拼成一张编号图，静止画面几乎不花 token）。',
  '动作：',
  '  peek   单张截图：此刻屏幕（或 region 区域、或视频 path 的 seek 位置）一帧原图。只要截一张图就用它。',
  '  watch  看一段：屏幕录 seconds 秒（默认 8，≤60）只留变化帧拼图；source:"file" 时离线扫视频 path 的 [seek, seek+seconds]（默认 120 秒，≤1800）；listen:true 时同时转写该段音轨。',
  '         后台 start 着时，watch 取走后台攒下的拼图（最多等 seconds 秒，没有新图就立刻截断出一张）。',
  '  start  后台持续看（screen / camera / file 实时播放），拼图在内存里排队（最多 4 张，旧的被挤掉）；最长 30 分钟自动停。',
  '  stop   停止后台采集。',
  '  status 运行状态与依赖检查（ffmpeg / Python / 转写服务），只读，不执行外部程序。',
  '  region 设置只看屏幕一块："x,y,w,h"（屏幕物理像素）；"off" 取消；不传则查看当前值。对下一次采集生效。',
  '  help   本说明。',
  '参数：source screen|file|camera，path（视频文件，限工作区等允许的根目录），seek（秒），seconds，quality low|standard|high，device（camera 设备名），max_sheets（1-4）。',
  '点击、键入等桌面操作仍由 Windows-MCP（ext__windows_mcp__click / type 等）负责；读取已有图片文件用 read_image。',
  CONFIG_HELP,
].join('\n');

function clampNum(v, def, min, max) {
  const n = Number(v);
  if (v === undefined || v === null || !Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, n));
}

function sizeFor(quality, reg) {
  const q = SIZES[quality] ? quality : 'low';
  if (reg) return cellSize(LONG_EDGE[q], reg);
  return SIZES[q];
}

function requireFfmpeg(env) {
  const info = seeNowEnvironment(env).ffmpeg;
  if (!info.available) {
    throw new SeeNowToolError('FFMPEG_MISSING', `未找到 ffmpeg（来源 ${info.source}：${info.requested}）。\n${CONFIG_HELP}`);
  }
  return info.path;
}

async function buildSource(args, ctx, ffmpegPath) {
  const kind = args.source ?? 'screen';
  if (kind === 'file') {
    if (typeof args.path !== 'string' || !args.path.trim()) throw new SeeNowToolError('INVALID_ARGUMENT', 'source:"file" 需要 path（视频文件路径）。');
    const resolved = ctx.resolvePath ? await ctx.resolvePath(args.path.trim()) : args.path.trim();
    const seek = clampNum(args.seek, 0, 0, 24 * 3600);
    return { source: { kind: 'file', path: resolved, seek }, engine: 'auto', reg: null };
  }
  if (kind === 'camera') {
    if (process.platform !== 'win32' && process.platform !== 'darwin') throw new SeeNowToolError('UNSUPPORTED_PLATFORM', '摄像头采集只支持 Windows（dshow）与 macOS（avfoundation）。');
    return { source: { kind: 'camera', ...(typeof args.device === 'string' && args.device ? { device: args.device } : {}) }, engine: 'auto', reg: null };
  }
  if (kind !== 'screen') throw new SeeNowToolError('INVALID_ARGUMENT', `未知 source：${kind}`);
  if (process.platform !== 'win32' && process.platform !== 'darwin') {
    throw new SeeNowToolError('UNSUPPORTED_PLATFORM', 'OpenCode 版 see_now 的屏幕采集只接了 Windows（ddagrab/gdigrab）与 macOS（avfoundation）；Linux portal 采集未移植。');
  }
  const reg = region;
  let engine = 'auto';
  if (!reg) engine = await pickScreenEngine({ ffmpegPath, fps: FPS });
  return { source: { kind: 'screen', ...(reg ? { region: reg } : {}) }, engine, reg };
}

function captureError(error) {
  if (error instanceof SeeNowToolError) return error;
  const info = captureErrorInfo(error, 'exit');
  const hint = CAPTURE_HINTS[info.category];
  const msg = `${error?.message ?? error}${hint && !String(error?.message).includes(hint) ? `\n  ↳ ${hint}` : ''}`;
  return new SeeNowToolError(info.category === 'dependency-missing' ? 'FFMPEG_MISSING' : 'CAPTURE_FAILED', msg);
}

function abortable(signal, ms) {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener?.('abort', () => { clearTimeout(timer); resolve(); }, { once: true });
  });
}

/** One raw frame (peek without a running session). */
async function grabOne(args, ctx, ffmpegPath) {
  const { source, engine, reg } = await buildSource(args, ctx, ffmpegPath);
  const [width, height] = sizeFor(args.quality, reg);
  let frame = null;
  let cap = null;
  cap = spawnFrames({
    source, width, height, fps: FPS, ffmpegPath, engine,
    baseSec: source.seek ?? 0,
    onFrame: (f) => { if (!frame) { frame = { t: f.t, buf: Buffer.from(f.buf) }; cap?.stop(); } },
  });
  const timer = setTimeout(() => cap.stop(), 15000);
  ctx.signal?.addEventListener?.('abort', () => cap.stop(), { once: true });
  try { await cap.done; } catch (e) { if (!frame) throw captureError(e); } finally { clearTimeout(timer); }
  if (!frame) throw new SeeNowToolError('NO_FRAME', '15 秒内没有拿到任何一帧（文件 seek 超出时长、设备不可用或采集被取消）。');
  return { frame, width, height, source };
}

function newPipeline(width, height, reg, maxSheets) {
  return createPipeline({
    width, height, fps: FPS,
    queueDepth: maxSheets,
    audioStrip: false,
    ...(reg ? { region: reg, maxFrames: 4, preferFrames: 2 } : {}),
  });
}

/** Bounded capture into the upstream change-filter pipeline; returns the packed sheets. */
async function runWindow(args, ctx, ffmpegPath) {
  const { source, engine, reg } = await buildSource(args, ctx, ffmpegPath);
  const isFile = source.kind === 'file';
  const seconds = isFile ? clampNum(args.seconds, DEFAULT_FILE_SEC, 1, MAX_FILE_SEC) : clampNum(args.seconds, DEFAULT_WATCH_SEC, 1, MAX_WATCH_SEC);
  const maxSheets = Math.trunc(clampNum(args.max_sheets, MAX_SHEETS, 1, MAX_SHEETS));
  const [width, height] = sizeFor(args.quality, reg);
  const p = newPipeline(width, height, reg, maxSheets);
  const startSec = source.seek ?? 0;
  let cap = null;
  let frames = 0;
  let lastT = startSec;
  cap = spawnFrames({
    source, width, height, fps: FPS, ffmpegPath, engine, baseSec: startSec,
    onFrame: (f) => {
      if (f.t - startSec > seconds) { cap?.stop(); return; }
      frames += 1; lastT = f.t;
      p.push({ t: f.t - startSec, buf: f.buf });
    },
  });
  const timer = isFile ? setTimeout(() => cap.stop(), Math.max(60000, seconds * 2000)) : setTimeout(() => cap.stop(), seconds * 1000 + 3000);
  ctx.signal?.addEventListener?.('abort', () => cap.stop(), { once: true });
  let ended = false;
  try { const r = await cap.done; ended = !!r?.ended; } catch (e) { if (!frames) throw captureError(e); } finally { clearTimeout(timer); }
  const { stats, sheets } = p.finish();
  let transcript = null;
  if (isFile && args.listen) transcript = await transcribeFile(source.path, startSec, Math.min(seconds, MAX_ASR_SEC, Math.max(1, lastT - startSec + 1)), ffmpegPath, ctx);
  return { sheets: sheets.slice(-maxSheets), stats, frames, seconds, source, ended, transcript };
}

/** Extract mono 16 kHz WAV for [seek, seek+seconds] and send it to the user-configured ASR service. */
async function transcribeFile(path, seek, seconds, ffmpegPath, ctx) {
  const cfg = asrConfig();
  if (!cfg) return { status: 'not-configured', message: `未配置转写服务，未转写音轨。\n${CONFIG_HELP}` };
  const wav = await new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, ['-hide_banner', '-v', 'error', '-nostdin', '-ss', String(seek), '-t', String(seconds), '-i', path, '-vn', '-ac', '1', '-ar', '16000', '-acodec', 'pcm_s16le', '-f', 'wav', '-'], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    const chunks = []; let err = '';
    child.stdout.on('data', (c) => chunks.push(c));
    child.stderr.on('data', (d) => { err = `${err}${d}`.slice(-2000); });
    child.on('error', reject);
    child.on('close', (code) => (code === 0 ? resolve(Buffer.concat(chunks)) : reject(new Error(`ffmpeg 抽音轨失败 code ${code}: ${err.trim().slice(-300)}`))));
    ctx.signal?.addEventListener?.('abort', () => { try { child.kill('SIGKILL'); } catch { /* gone */ } }, { once: true });
  }).catch((e) => ({ error: e }));
  if (wav?.error) return { status: 'error', message: String(wav.error.message ?? wav.error) };
  if (!wav.length || wav.length <= 44) return { status: 'empty', message: '这段视频没有可解码的音轨。' };
  try {
    const text = await httpTranscriber(cfg, { timeoutMs: 120000 })(canonicalizeWav(wav));
    return { status: 'ok', seconds, text };
  } catch (e) {
    return { status: 'error', message: `转写服务请求失败：${e?.message ?? e}（服务 ${cfg.baseUrl}）` };
  }
}

function stopSession(reason) {
  if (!session) return null;
  const s = session;
  session = null;
  clearTimeout(s.maxTimer);
  try { s.cap.stop(); } catch { /* already stopped */ }
  const { stats, sheets } = s.pipeline.finish();
  return { reason, frames: s.frames, seconds: Math.round((Date.now() - s.startedAt) / 1000), pendingSheets: sheets.length, sheetsMade: stats.sheets ?? null, lastError: s.lastError };
}

async function startSession(args, ctx, ffmpegPath) {
  if (session) stopSession('restart');
  const { source, engine, reg } = await buildSource(args, ctx, ffmpegPath);
  if (source.kind === 'file') source.realtime = true;
  const [width, height] = sizeFor(args.quality, reg);
  const maxSheets = Math.trunc(clampNum(args.max_sheets, MAX_SHEETS, 1, MAX_SHEETS));
  const s = { source, width, height, quality: SIZES[args.quality] ? args.quality : 'low', pipeline: newPipeline(width, height, reg, maxSheets), frames: 0, lastFrame: null, lastT: 0, startedAt: Date.now(), lastError: null, ended: false, cap: null, maxTimer: null };
  const base = source.seek ?? 0;
  s.cap = spawnFrames({
    source, width, height, fps: FPS, ffmpegPath, engine, baseSec: base,
    onFrame: (f) => { s.frames += 1; s.lastT = f.t - base; s.lastFrame = { t: f.t, buf: f.buf }; s.pipeline.push({ t: f.t - base, buf: f.buf }); },
  });
  s.cap.done.then((r) => { if (r?.ended) s.ended = true; }, (e) => { s.lastError = String(e?.message ?? e).slice(0, 600); });
  s.maxTimer = setTimeout(() => { if (session === s) stopSession('max-duration'); }, SESSION_MAX_MS);
  s.maxTimer.unref?.();
  session = s;
  return s;
}

function sheetSummary(sheet, i) {
  return `#${i + 1} ${sheet.w}×${sheet.h} 帧数 ${sheet.frames?.length ?? 0} 时间 ${Number(sheet.from).toFixed(1)}–${Number(sheet.to).toFixed(1)}s（${sheet.why}）`;
}

function result(lines, structured, images = [], isError = false) {
  const text = ['=== SEE_NOW BEGIN ===', ...lines, '=== SEE_NOW END ==='].join('\n');
  const content = [{ type: 'text', text }, ...images.map((png) => ({ type: 'image', data: Buffer.from(png).toString('base64'), mimeType: 'image/png' }))];
  return { text, structuredContent: structured, content, ...(isError ? { isError: true } : {}) };
}

function statusPayload() {
  const env = seeNowEnvironment();
  const sess = session ? {
    running: true, source: session.source.kind, path: session.source.path ?? null, quality: session.quality,
    frames: session.frames, seconds: Math.round((Date.now() - session.startedAt) / 1000),
    queuedSheets: session.pipeline.peek() ? 'yes' : 'no', ended: session.ended, lastError: session.lastError,
  } : { running: false };
  return { ...env, region: region ? `${region.x},${region.y},${region.w},${region.h}` : null, session: sess, liveAudio: 'not-supported' };
}

/** Entry used by the file-tool registry (module-0030). */
export async function invokeSeeNow(args = {}, ctx = {}) {
  const action = args.action ?? 'watch';
  if (!SEE_NOW_ACTIONS.includes(action)) throw new SeeNowToolError('INVALID_ARGUMENT', `action 必须是 ${SEE_NOW_ACTIONS.join(' / ')}`);
  if (args.quality !== undefined && !SIZES[args.quality]) throw new SeeNowToolError('INVALID_ARGUMENT', 'quality 必须是 low / standard / high');

  if (action === 'help') return result([HELP_TEXT], { status: 'success', action });

  if (action === 'status') {
    const st = statusPayload();
    const lines = [
      `平台：${st.platform}`,
      `ffmpeg：${st.ffmpeg.available ? `可用 ${st.ffmpeg.path}（${st.ffmpeg.source}）` : `不可用（${st.ffmpeg.source}：${st.ffmpeg.requested}）`}`,
      `Python：${st.python.found ? st.python.path : '未在 PATH 中找到'}（仅本地转写服务需要；see_now 自身不调用 Python）`,
      `转写服务：${st.asr.configured ? `${st.asr.baseUrl}（${st.asr.api}，模型 ${st.asr.model}，key ${st.asr.key}）` : '未配置'}`,
      `实时听声音（麦克风/系统声音）：OpenCode 版不支持，只转写视频文件音轨`,
      `region：${st.region ?? '整屏'}`,
      `后台采集：${st.session.running ? `运行中 ${st.session.source} ${st.session.seconds}s ${st.session.frames} 帧${st.session.lastError ? `，错误：${st.session.lastError}` : ''}` : '未运行'}`,
      ...(!st.ffmpeg.available || !st.asr.configured ? ['', CONFIG_HELP] : []),
    ];
    return result(lines, { status: 'success', action, ...st });
  }

  if (action === 'region') {
    if (args.region === undefined) return result([`当前 region：${region ? `${region.x},${region.y},${region.w},${region.h}` : '整屏'}`], { status: 'success', action, region });
    if (args.region === 'off') { region = null; return result(['已取消 region，之后看整屏。'], { status: 'success', action, region: null }); }
    const r = parseRegion(String(args.region));
    if (!r) throw new SeeNowToolError('INVALID_ARGUMENT', 'region 格式应为 "x,y,w,h"（非负整数，w/h>0，屏幕物理像素），或 "off"。');
    region = r;
    return result([`已设置 region ${r.x},${r.y},${r.w},${r.h}，对下一次 peek/watch/start 生效${session ? '（后台采集需 stop 后重新 start）' : ''}。`], { status: 'success', action, region: r });
  }

  if (action === 'stop') {
    const r = stopSession('user');
    return result([r ? `已停止后台采集：${r.seconds}s / ${r.frames} 帧，丢弃未取走拼图 ${r.pendingSheets} 张。` : '后台采集本来就没在运行。'], { status: 'success', action, stopped: !!r, ...(r ?? {}) });
  }

  if (action === 'peek' && session && session.lastFrame && (args.source ?? session.source.kind) === session.source.kind && !args.path) {
    const png = encodePng(session.lastFrame.buf, session.width, session.height);
    return result([`后台采集的最新一帧（${session.source.kind}，t=${session.lastT.toFixed(1)}s，${session.width}×${session.height}）。`], { status: 'success', action, from: 'session', width: session.width, height: session.height }, [png]);
  }

  if (action === 'watch' && session && !args.path && (args.source === undefined || args.source === session.source.kind)) {
    const waitSec = clampNum(args.seconds, DEFAULT_WATCH_SEC, 0, MAX_WATCH_SEC);
    const deadline = Date.now() + waitSec * 1000;
    while (!session.pipeline.peek() && Date.now() < deadline && !ctx.signal?.aborted && !session.lastError) await abortable(ctx.signal, 250);
    const maxSheets = Math.trunc(clampNum(args.max_sheets, MAX_SHEETS, 1, MAX_SHEETS));
    const sheets = [];
    let s;
    while (sheets.length < maxSheets && (s = session.pipeline.take())) sheets.push(s);
    if (!sheets.length && session.pipeline.hasFrame) { const now = session.pipeline.flushNow(session.lastT, 'user'); if (now) sheets.push(now); }
    if (!sheets.length) throw new SeeNowToolError(session.lastError ? 'CAPTURE_FAILED' : 'NO_FRAME', session.lastError ? `后台采集出错：${session.lastError}` : '后台采集还没有任何帧。');
    return result([`后台采集拼图 ${sheets.length} 张（每格左上角是帧号，按时间顺序）：`, ...sheets.map(sheetSummary)], { status: 'success', action, from: 'session', sheets: sheets.map((x) => ({ w: x.w, h: x.h, from: x.from, to: x.to, why: x.why, frames: x.frames?.length ?? 0 })) }, sheets.map((x) => x.png));
  }

  const ffmpegPath = requireFfmpeg();

  if (action === 'start') {
    const s = await startSession(args, ctx, ffmpegPath);
    return result([`已开始后台采集（${s.source.kind}${s.source.path ? ` ${s.source.path}` : ''}，${s.width}×${s.height}，${FPS}fps，最长 30 分钟）。用 watch 取拼图、peek 取最新一帧、stop 停止。`], { status: 'success', action, source: s.source.kind, width: s.width, height: s.height });
  }

  if (action === 'peek') {
    const { frame, width, height, source } = await grabOne(args, ctx, ffmpegPath);
    const png = encodePng(frame.buf, width, height);
    return result([`单帧截图（${source.kind}${source.region ? ` region ${source.region.x},${source.region.y},${source.region.w},${source.region.h}` : ''}${source.kind === 'file' ? ` t=${frame.t.toFixed(1)}s` : ''}，${width}×${height}）。`], { status: 'success', action, source: source.kind, width, height }, [png]);
  }

  // watch without a background session
  const r = await runWindow(args, ctx, ffmpegPath);
  const lines = [
    `${r.source.kind === 'file' ? '视频' : r.source.kind === 'camera' ? '摄像头' : '屏幕'}：${r.frames} 帧 → 拼图 ${r.sheets.length} 张（只留画面变化的帧；每格左上角是帧号）${r.ended ? '，文件已播完' : ''}。`,
    ...r.sheets.map(sheetSummary),
  ];
  if (r.transcript) lines.push(r.transcript.status === 'ok' ? `音轨转写（${r.transcript.seconds}s）：${r.transcript.text || '（无语音）'}` : `音轨：${r.transcript.message}`);
  if (!r.sheets.length) lines.push('没有出图：这段时间画面几乎没变化，或没有拿到帧。可改用 peek 取单帧。');
  return result(lines, {
    status: 'success', action, source: r.source.kind, frames: r.frames,
    sheets: r.sheets.map((x) => ({ w: x.w, h: x.h, from: x.from, to: x.to, why: x.why, frames: x.frames?.length ?? 0 })),
    ...(r.transcript ? { transcript: r.transcript } : {}),
  }, r.sheets.map((x) => x.png));
}

/** Test hook: reset module state without touching any process. */
export function __resetSeeNowState() { stopSession('reset'); region = null; }
