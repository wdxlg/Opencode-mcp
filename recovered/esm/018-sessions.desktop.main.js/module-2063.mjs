// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/voiceClient/ttsPlaybackService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/chat/browser/voiceClient/ttsPlaybackService.ts
var ITtsPlaybackService = createDecorator("ttsPlaybackService");

var PLAYBACK_SAMPLE_RATE = 24e3;

var MAX_PLAYBACK_SAMPLES = PLAYBACK_SAMPLE_RATE * 180;

var TtsPlaybackService = class extends Disposable {
  constructor(logService) {
    super();
    this.logService = logService;
    this._playbackTurn = null;
    this._playbackGen = 0;
    this._isPlaying = false;
    this._lastPlayedSamples = null;
    this._onPlaybackStarted = this._register(new Emitter());
    this.onPlaybackStarted = this._onPlaybackStarted.event;
    this._onPlaybackStopped = this._register(new Emitter());
    this.onPlaybackStopped = this._onPlaybackStopped.event;
  }
  get isPlaying() {
    return this._isPlaying;
  }
  get analyserNode() {
    return this._analyserNode;
  }
  getLastPlayedSamples() {
    return this._lastPlayedSamples;
  }
  ensureContext(window2) {
    this._window = window2;
    if (!this._playbackCtx) {
      this._playbackCtx = new window2.AudioContext({ sampleRate: PLAYBACK_SAMPLE_RATE });
    }
    if (this._playbackCtx.state === "suspended") {
      this._playbackCtx.resume().catch(() => {
      });
    }
    return this._playbackCtx;
  }
  playAudioChunk(audio, isFinal, window2) {
    this._window = window2;
    if (!audio && isFinal) {
      const turn2 = this._ensurePlayTurn(window2);
      turn2.writeChain = turn2.writeChain.then(() => this._schedulePlayStop());
      return;
    }
    if (!audio) {
      return;
    }
    const turn = this._ensurePlayTurn(window2);
    const gen = this._playbackGen;
    const binary = window2.atob(audio);
    const bytes = new Uint8Array(binary.length);
    for (let i2 = 0; i2 < binary.length; i2++) {
      bytes[i2] = binary.charCodeAt(i2);
    }
    const arrayBuf = bytes.buffer;
    turn.writeChain = turn.writeChain.then(async () => {
      if (gen !== this._playbackGen) {
        return;
      }
      try {
        const ctx = this.ensureContext(this._window);
        const decoded = await ctx.decodeAudioData(arrayBuf);
        if (gen !== this._playbackGen) {
          return;
        }
        this._writeToPlayBuffer(decoded);
        if (!this._playbackTurn?.started) {
          this._startPlayback();
        }
      } catch (err) {
        this.logService.error("[voice] TTS decode error", err);
      }
    });
    if (isFinal) {
      turn.writeChain = turn.writeChain.then(() => this._schedulePlayStop());
    }
  }
  stopPlayback() {
    this._playbackGen++;
    if (this._playbackTurn) {
      this._captureSamples(this._playbackTurn);
    }
    try {
      this._playbackTurn?.sourceNode?.stop();
    } catch {
    }
    this._playbackTurn = null;
    this._analyserNode = void 0;
    if (this._isPlaying) {
      this._isPlaying = false;
      this._onPlaybackStopped.fire();
    }
  }
  /** Close the AudioContext entirely (for full teardown). */
  closeContext() {
    this.stopPlayback();
    if (this._playbackCtx) {
      this._playbackCtx.close();
      this._playbackCtx = void 0;
    }
  }
  _ensurePlayTurn(window2) {
    const ctx = this.ensureContext(window2);
    if (this._playbackTurn) {
      return this._playbackTurn;
    }
    const turn = {
      buffer: ctx.createBuffer(1, MAX_PLAYBACK_SAMPLES, PLAYBACK_SAMPLE_RATE),
      sourceNode: null,
      writeOffset: 0,
      startCtxTime: 0,
      started: false,
      writeChain: Promise.resolve()
    };
    this._playbackTurn = turn;
    return turn;
  }
  _writeToPlayBuffer(decoded) {
    if (!this._playbackTurn) {
      return;
    }
    const src = decoded.getChannelData(0);
    const dst = this._playbackTurn.buffer.getChannelData(0);
    const toWrite = Math.min(src.length, MAX_PLAYBACK_SAMPLES - this._playbackTurn.writeOffset);
    for (let i2 = 0; i2 < toWrite; i2++) {
      dst[this._playbackTurn.writeOffset + i2] = src[i2];
    }
    this._playbackTurn.writeOffset += toWrite;
  }
  _startPlayback() {
    const ctx = this._playbackCtx;
    const turn = this._playbackTurn;
    if (!ctx || !turn || turn.started) {
      return;
    }
    turn.started = true;
    const node = ctx.createBufferSource();
    node.buffer = turn.buffer;
    turn.sourceNode = node;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    node.connect(analyser);
    analyser.connect(ctx.destination);
    this._analyserNode = analyser;
    turn.startCtxTime = ctx.currentTime;
    node.start(0);
    if (!this._isPlaying) {
      this._isPlaying = true;
      this._onPlaybackStarted.fire();
    }
  }
  _schedulePlayStop() {
    const ctx = this._playbackCtx;
    const turn = this._playbackTurn;
    if (!ctx || !turn) {
      return;
    }
    if (!turn.started) {
      this._startPlayback();
    }
    const node = turn.sourceNode;
    if (!node) {
      return;
    }
    const stopAt = turn.startCtxTime + turn.writeOffset / PLAYBACK_SAMPLE_RATE;
    const endedTurn = turn;
    node.stop(Math.max(stopAt, ctx.currentTime));
    node.onended = () => {
      if (this._playbackTurn !== endedTurn) {
        return;
      }
      this._captureSamples(endedTurn);
      this._playbackTurn = null;
      this._analyserNode = void 0;
      if (this._isPlaying) {
        this._isPlaying = false;
        this._onPlaybackStopped.fire();
      }
    };
  }
  _captureSamples(turn) {
    if (turn.writeOffset > 0) {
      this._lastPlayedSamples = turn.buffer.getChannelData(0).slice(0, turn.writeOffset);
    }
  }
  dispose() {
    this.closeContext();
    super.dispose();
  }
};

TtsPlaybackService = __decorateClass([
  __decorateParam(0, ILogService)
], TtsPlaybackService);

registerSingleton(ITtsPlaybackService, TtsPlaybackService, 1 /* Delayed */);
export { ITtsPlaybackService, PLAYBACK_SAMPLE_RATE, MAX_PLAYBACK_SAMPLES, TtsPlaybackService };
