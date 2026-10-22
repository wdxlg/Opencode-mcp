// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/voicePlaybackService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { ResourceMap, ResourceSet } from "./module-0008.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/chat/common/voicePlaybackService.ts
var IVoicePlaybackService = createDecorator("voicePlaybackService");

var VoicePlaybackService = class extends Disposable {
  constructor(commandService) {
    super();
    this.commandService = commandService;
    this._speakingSession = observableValue(this, void 0);
    this.speakingSession = this._speakingSession;
    this._lastPlayed = new ResourceMap();
    this._lastPlayedVersion = observableValue(this, 0);
    this.lastPlayedVersion = this._lastPlayedVersion;
    this._pendingResponses = new ResourceSet();
    this._pendingResponseVersion = observableValue(this, 0);
    this.pendingResponseVersion = this._pendingResponseVersion;
    this._register(toDisposable(() => {
      this._activeReplay?.dispose(true);
      this._activeReplay = void 0;
    }));
  }
  notifyPlaybackStart(sessionResource, transcript) {
    this._speakingSession.set(sessionResource, void 0);
    if (sessionResource && transcript) {
      this._lastPlayed.set(sessionResource, { transcript, timestamp: Date.now() });
      this._lastPlayedVersion.set(this._lastPlayedVersion.get() + 1, void 0);
    }
  }
  notifyPlaybackEnd(sessionResource) {
    const current = this._speakingSession.get();
    if (!current) {
      return;
    }
    if (!sessionResource || current.toString() === sessionResource.toString()) {
      this._speakingSession.set(void 0, void 0);
    }
  }
  getLastPlayed(sessionResource) {
    return this._lastPlayed.get(sessionResource);
  }
  hasLastPlayed(sessionResource) {
    return this._lastPlayed.has(sessionResource);
  }
  setPendingResponse(sessionResource, pending) {
    let changed;
    if (pending) {
      changed = !this._pendingResponses.has(sessionResource);
      if (changed) {
        this._pendingResponses.add(sessionResource);
      }
    } else {
      changed = this._pendingResponses.delete(sessionResource);
    }
    if (changed) {
      this._pendingResponseVersion.set(this._pendingResponseVersion.get() + 1, void 0);
    }
  }
  hasPendingResponse(sessionResource) {
    return this._pendingResponses.has(sessionResource);
  }
  async replay(sessionResource) {
    const entry = this._lastPlayed.get(sessionResource);
    if (!entry || !entry.transcript) {
      return;
    }
    this._activeReplay?.dispose(true);
    this._activeReplay = new CancellationTokenSource();
    this._speakingSession.set(sessionResource, void 0);
    await this.commandService.executeCommand("_chat.voicePlayback.replay", {
      sessionId: sessionResource.toString(),
      transcript: entry.transcript
    });
  }
  stop(sessionResource) {
    this._activeReplay?.dispose(true);
    this._activeReplay = void 0;
    void this.commandService.executeCommand("_chat.voicePlayback.stop", {
      sessionId: sessionResource?.toString()
    });
    const current = this._speakingSession.get();
    if (!sessionResource || current?.toString() === sessionResource.toString()) {
      this._speakingSession.set(void 0, void 0);
    }
  }
};

VoicePlaybackService = __decorateClass([
  __decorateParam(0, ICommandService)
], VoicePlaybackService);

registerSingleton(IVoicePlaybackService, VoicePlaybackService, 1 /* Delayed */);

function tryParseSessionResource(sessionId) {
  if (!sessionId) {
    return void 0;
  }
  try {
    return URI.parse(sessionId);
  } catch {
    return void 0;
  }
}

CommandsRegistry.registerCommand("_chat.voicePlayback.notifyStart", (accessor, payload) => {
  const service = accessor.get(IVoicePlaybackService);
  service.notifyPlaybackStart(tryParseSessionResource(payload?.sessionId), payload?.transcript);
});

CommandsRegistry.registerCommand("_chat.voicePlayback.notifyEnd", (accessor, payload) => {
  const service = accessor.get(IVoicePlaybackService);
  service.notifyPlaybackEnd(tryParseSessionResource(payload?.sessionId));
});
export { tryParseSessionResource, IVoicePlaybackService, VoicePlaybackService };
