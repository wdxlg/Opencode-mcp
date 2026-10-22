// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/shared/editSurvivalReporter.ts
import { createDecorator } from "./module-0044.mjs";
import { Disposable } from "./module-0010.mjs";
import { TimeoutTimer } from "./module-0027.mjs";
import { URI } from "./module-0023.mjs";
import { IFileService, toFileOperationResult } from "./module-0128.mjs";
import { computeChunkedEditSurvival, computeWholeFileEditSurvival } from "./module-0263.mjs";
import { isAhpChatChannel, parseRequiredSessionUriFromChatUri } from "./module-0047.mjs";
import { toInitiatorTelemetry } from "./module-0253.mjs";
import { AgentSession } from "./module-0048.mjs";
import { extname } from "./module-0018.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0084.mjs";
import { ITelemetryService } from "./module-0053.mjs";


// src/vs/platform/agentHost/node/shared/editSurvivalReporter.ts
var IEditSurvivalReporterFactory = createDecorator("editSurvivalReporterFactory");

var SAMPLE_SCHEDULE_MS = [0, 5e3, 3e4, 12e4, 3e5, 6e5, 9e5];

var SessionEditSurvivalReporter = class extends Disposable {
  constructor(_params, _fileService, _logService, _telemetryService) {
    super();
    this._params = _params;
    this._fileService = _fileService;
    this._logService = _logService;
    this._telemetryService = _telemetryService;
    this._startTime = Date.now();
    this._samplesTaken = 0;
    this._scheduleNext();
  }
  _scheduleNext() {
    if (this._samplesTaken >= SAMPLE_SCHEDULE_MS.length) {
      this.dispose();
      return;
    }
    const elapsed = Date.now() - this._startTime;
    const delay = Math.max(0, SAMPLE_SCHEDULE_MS[this._samplesTaken] - elapsed);
    const timer = this._register(new TimeoutTimer());
    timer.setIfNotSet(() => this._takeSample(), delay);
  }
  async _takeSample() {
    const sampleIndex = this._samplesTaken++;
    const timeDelayMs = SAMPLE_SCHEDULE_MS[sampleIndex];
    try {
      let currentText;
      let didFileGetDeleted = false;
      try {
        const content = await this._fileService.readFile(URI.file(this._params.filePath));
        currentText = content.value.toString();
      } catch (err) {
        if (toFileOperationResult(err) === 1 /* FILE_NOT_FOUND */) {
          didFileGetDeleted = true;
          currentText = "";
        } else {
          this._logService.warn(`[EditSurvivalReporter] readFile failed for ${this._params.filePath}, skipping sample: ${err}`);
          this._scheduleNext();
          return;
        }
      }
      const aiChunks = this._params.aiChunks ?? [];
      const useChunked = aiChunks.length > 0;
      const aiCharCount = useChunked ? aiChunks.reduce((sum, c) => sum + c.length, 0) : 0;
      const scores = didFileGetDeleted ? { fourGram: 0, noRevert: 0 } : useChunked ? computeChunkedEditSurvival(this._params.beforeText, this._params.afterText, aiChunks, currentText) : computeWholeFileEditSurvival(this._params.beforeText, this._params.afterText, currentText);
      const sessionUri = isAhpChatChannel(this._params.sessionUri) ? parseRequiredSessionUriFromChatUri(this._params.sessionUri) : this._params.sessionUri;
      this._telemetryService.publicLog2(
        "agentHost.trackEditSurvival",
        {
          ...toInitiatorTelemetry(this._params.clientContext),
          provider: AgentSession.provider(sessionUri) ?? "unknown",
          modelId: this._params.modelId ?? "",
          toolName: this._params.toolName ?? "",
          agentSessionId: AgentSession.id(sessionUri),
          turnId: this._params.turnId,
          toolCallId: this._params.toolCallId,
          fileExtension: extname(this._params.filePath),
          survivalRateFourGram: scores.fourGram,
          survivalRateNoRevert: scores.noRevert,
          scoringMode: useChunked ? "chunked" : "whole-file",
          aiChunkCount: aiChunks.length,
          aiCharCount,
          timeDelayMs,
          didFileGetDeleted: didFileGetDeleted ? 1 : 0,
          isCreate: this._params.isCreate ? 1 : 0,
          beforeTextLength: this._params.beforeText.length,
          afterTextLength: this._params.afterText.length,
          currentTextLength: didFileGetDeleted ? 0 : currentText.length
        }
      );
      if (didFileGetDeleted) {
        this.dispose();
        return;
      }
    } catch (err) {
      this._logService.warn(`[EditSurvivalReporter] sample failed for ${this._params.filePath}: ${err}`);
    }
    this._scheduleNext();
  }
};

var MAX_TRACKED_FILE_SIZE_CHARS = 5 * 1024 * 1024;

var EditSurvivalReporterFactory = class {
  constructor(_fileService, _logService, _telemetryService) {
    this._fileService = _fileService;
    this._logService = _logService;
    this._telemetryService = _telemetryService;
  }
  launch(params) {
    if (extname(params.filePath).toLowerCase() === ".ipynb") {
      return { dispose() {
      } };
    }
    if (Math.max(params.beforeText.length, params.afterText.length) > MAX_TRACKED_FILE_SIZE_CHARS) {
      return { dispose() {
      } };
    }
    return new SessionEditSurvivalReporter(params, this._fileService, this._logService, this._telemetryService);
  }
};

EditSurvivalReporterFactory = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, ILogService),
  __decorateParam(2, ITelemetryService)
], EditSurvivalReporterFactory);
export { IEditSurvivalReporterFactory, SAMPLE_SCHEDULE_MS, SessionEditSurvivalReporter, MAX_TRACKED_FILE_SIZE_CHARS, EditSurvivalReporterFactory };
