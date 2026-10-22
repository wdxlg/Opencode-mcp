// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/issue/electron-browser/nativeRecordingService.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { INativeHostService } from "./module-2566.mjs";


// src/vs/workbench/contrib/issue/electron-browser/nativeRecordingService.ts
var MAX_FILE_SIZE_BYTES2 = 100 * 1024 * 1024;

var SIZE_LIMIT_THRESHOLD = 0.9;

var NativeRecordingService = class extends Disposable {
  constructor(logService, nativeHostService) {
    super();
    this.logService = logService;
    this.nativeHostService = nativeHostService;
    // MediaRecorder + getDisplayMedia may be absent if the renderer is run with reduced
    // APIs (e.g. some test/runtime configurations); derive support from feature detection
    // so startRecording can early-reject rather than blowing up with ReferenceError.
    this.isSupported = typeof MediaRecorder !== "undefined" && typeof navigator !== "undefined" && !!navigator.mediaDevices?.getDisplayMedia;
    this._state = "idle" /* Idle */;
    this._onDidChangeState = this._register(new Emitter());
    this.onDidChangeState = this._onDidChangeState.event;
    this.chunks = [];
    this.bytesRecorded = 0;
    this.stoppedBySize = false;
    this.startTime = 0;
    this._register(toDisposable(() => this.cleanup()));
  }
  getScreenCapturePermissionStatus() {
    return this.nativeHostService.getMediaAccessStatus("screen");
  }
  openScreenCapturePermissionSettings() {
    if (isMacintosh) {
      void this.nativeHostService.openExternal("x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture");
    }
  }
  get state() {
    return this._state;
  }
  setState(state) {
    if (this._state !== state) {
      this._state = state;
      this._onDidChangeState.fire(state);
    }
  }
  getSupportedFormats() {
    const formats = [];
    if (typeof MediaRecorder !== "undefined") {
      if (MediaRecorder.isTypeSupported("video/mp4")) {
        formats.push({ mimeType: "video/mp4", label: "MP4", extension: "mp4" });
      }
      if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
        formats.push({ mimeType: "video/webm;codecs=vp9", label: "WebM", extension: "webm" });
      } else if (MediaRecorder.isTypeSupported("video/webm")) {
        formats.push({ mimeType: "video/webm", label: "WebM", extension: "webm" });
      }
    }
    return formats;
  }
  async startRecording(preferredMimeType) {
    if (!this.isSupported) {
      throw new Error("Recording is not supported in this environment (MediaRecorder / getDisplayMedia unavailable).");
    }
    if (this._state === "recording" /* Recording */) {
      throw new Error("Recording already in progress.");
    }
    this.cleanup();
    try {
      this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
    } catch (err) {
      this.logService.error("[RecordingService] Failed to get display media:", err);
      throw new Error("Failed to start recording. The user may have cancelled the source picker.");
    }
    let mimeType;
    if (preferredMimeType && MediaRecorder.isTypeSupported(preferredMimeType)) {
      mimeType = preferredMimeType;
    } else if (MediaRecorder.isTypeSupported("video/mp4")) {
      mimeType = "video/mp4";
    } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
      mimeType = "video/webm;codecs=vp9";
    } else {
      mimeType = "video/webm";
    }
    this.chunks = [];
    this.bytesRecorded = 0;
    this.stoppedBySize = false;
    this.startTime = Date.now();
    try {
      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType,
        videoBitsPerSecond: 25e5
        // 2.5 Mbps — good quality, reasonable file size
      });
    } catch (err) {
      this.logService.error("[RecordingService] Failed to create MediaRecorder:", err);
      this.stopTracks();
      throw new Error("Failed to create media recorder.");
    }
    this.mediaRecorder.ondataavailable = (e4) => {
      if (e4.data && e4.data.size > 0) {
        if (this.stoppedBySize) {
          return;
        }
        this.chunks.push(e4.data);
        this.bytesRecorded += e4.data.size;
        if (this.bytesRecorded >= MAX_FILE_SIZE_BYTES2 * SIZE_LIMIT_THRESHOLD && this._state === "recording" /* Recording */) {
          this.logService.info("[RecordingService] Max file size reached, stopping recording.");
          this.stoppedBySize = true;
          this.mediaRecorder?.stop();
        }
      }
    };
    this.mediaRecorder.onstop = () => {
      if (this._state === "recording" /* Recording */) {
        this.stopTracks();
        this.setState("stopped" /* Stopped */);
      }
    };
    for (const track of this.mediaStream.getTracks()) {
      track.onended = () => {
        if (this._state === "recording" /* Recording */ && this.mediaRecorder?.state === "recording") {
          this.mediaRecorder.stop();
        }
      };
    }
    this.mediaRecorder.start(1e3);
    this.setState("recording" /* Recording */);
  }
  async stopRecording() {
    if (this._state !== "recording" /* Recording */ && this._state !== "stopped" /* Stopped */) {
      return void 0;
    }
    if (this._state === "recording" /* Recording */ && this.mediaRecorder?.state === "recording") {
      const recorder = this.mediaRecorder;
      await new Promise((resolve3) => {
        recorder.onstop = () => {
          resolve3();
        };
        recorder.requestData();
        recorder.stop();
      });
    }
    this.stopTracks();
    if (this.chunks.length === 0) {
      this.setState("idle" /* Idle */);
      return void 0;
    }
    const mimeType = this.mediaRecorder?.mimeType ?? "video/webm";
    const blob = new Blob(this.chunks, { type: mimeType });
    const durationMs = Date.now() - this.startTime;
    const data = {
      blob,
      mimeType,
      durationMs,
      sizeBytes: blob.size,
      stoppedBySize: this.stoppedBySize
    };
    this.chunks = [];
    this.mediaRecorder = void 0;
    this.setState("idle" /* Idle */);
    return data;
  }
  discardRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.ondataavailable = null;
      this.mediaRecorder.onstop = null;
      if (this._state === "recording" /* Recording */ && this.mediaRecorder.state === "recording") {
        this.mediaRecorder.stop();
      }
    }
    this.cleanup();
    this.setState("idle" /* Idle */);
  }
  stopTracks() {
    if (this.mediaStream) {
      for (const track of this.mediaStream.getTracks()) {
        track.stop();
      }
      this.mediaStream = void 0;
    }
  }
  cleanup() {
    this.stopTracks();
    this.chunks = [];
    this.bytesRecorded = 0;
    this.stoppedBySize = false;
    this.mediaRecorder = void 0;
  }
};

NativeRecordingService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, INativeHostService)
], NativeRecordingService);
export { MAX_FILE_SIZE_BYTES2, SIZE_LIMIT_THRESHOLD, NativeRecordingService };
