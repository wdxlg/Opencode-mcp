// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadSpeech.ts
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { raceCancellation } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { ISpeechService } from "./module-1254.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/api/browser/mainThreadSpeech.ts
var MainThreadSpeech = class {
  constructor(extHostContext, speechService, logService) {
    this.speechService = speechService;
    this.logService = logService;
    this.providerRegistrations = /* @__PURE__ */ new Map();
    this.speechToTextSessions = /* @__PURE__ */ new Map();
    this.textToSpeechSessions = /* @__PURE__ */ new Map();
    this.keywordRecognitionSessions = /* @__PURE__ */ new Map();
    this.proxy = extHostContext.getProxy(ExtHostContext.ExtHostSpeech);
  }
  $registerProvider(handle2, identifier2, metadata) {
    this.logService.trace("[Speech] extension registered provider", metadata.extension.value);
    const registration = this.speechService.registerSpeechProvider(identifier2, {
      metadata,
      createSpeechToTextSession: (token, options3) => {
        if (token.isCancellationRequested) {
          return {
            onDidChange: Event2.None
          };
        }
        const disposables = new DisposableStore();
        const session = Math.random();
        this.proxy.$createSpeechToTextSession(handle2, session, options3?.language);
        const onDidChange = disposables.add(new Emitter());
        this.speechToTextSessions.set(session, { onDidChange });
        disposables.add(token.onCancellationRequested(() => {
          this.proxy.$cancelSpeechToTextSession(session);
          this.speechToTextSessions.delete(session);
          disposables.dispose();
        }));
        return {
          onDidChange: onDidChange.event
        };
      },
      createTextToSpeechSession: (token, options3) => {
        if (token.isCancellationRequested) {
          return {
            onDidChange: Event2.None,
            synthesize: async () => {
            }
          };
        }
        const disposables = new DisposableStore();
        const session = Math.random();
        this.proxy.$createTextToSpeechSession(handle2, session, options3?.language);
        const onDidChange = disposables.add(new Emitter());
        this.textToSpeechSessions.set(session, { onDidChange });
        disposables.add(token.onCancellationRequested(() => {
          this.proxy.$cancelTextToSpeechSession(session);
          this.textToSpeechSessions.delete(session);
          disposables.dispose();
        }));
        return {
          onDidChange: onDidChange.event,
          synthesize: async (text2) => {
            await this.proxy.$synthesizeSpeech(session, text2);
            const disposable = new DisposableStore();
            try {
              await raceCancellation(Event2.toPromise(Event2.filter(onDidChange.event, (e) => e.status === 2 /* Stopped */, disposable), disposable), token);
            } finally {
              disposable.dispose();
            }
          }
        };
      },
      createKeywordRecognitionSession: (token) => {
        if (token.isCancellationRequested) {
          return {
            onDidChange: Event2.None
          };
        }
        const disposables = new DisposableStore();
        const session = Math.random();
        this.proxy.$createKeywordRecognitionSession(handle2, session);
        const onDidChange = disposables.add(new Emitter());
        this.keywordRecognitionSessions.set(session, { onDidChange });
        disposables.add(token.onCancellationRequested(() => {
          this.proxy.$cancelKeywordRecognitionSession(session);
          this.keywordRecognitionSessions.delete(session);
          disposables.dispose();
        }));
        return {
          onDidChange: onDidChange.event
        };
      }
    });
    this.providerRegistrations.set(handle2, {
      dispose: () => {
        registration.dispose();
      }
    });
  }
  $unregisterProvider(handle2) {
    const registration = this.providerRegistrations.get(handle2);
    if (registration) {
      registration.dispose();
      this.providerRegistrations.delete(handle2);
    }
  }
  $emitSpeechToTextEvent(session, event) {
    const providerSession = this.speechToTextSessions.get(session);
    providerSession?.onDidChange.fire(event);
  }
  $emitTextToSpeechEvent(session, event) {
    const providerSession = this.textToSpeechSessions.get(session);
    providerSession?.onDidChange.fire(event);
  }
  $emitKeywordRecognitionEvent(session, event) {
    const providerSession = this.keywordRecognitionSessions.get(session);
    providerSession?.onDidChange.fire(event);
  }
  dispose() {
    this.providerRegistrations.forEach((disposable) => disposable.dispose());
    this.providerRegistrations.clear();
    this.speechToTextSessions.forEach((session) => session.onDidChange.dispose());
    this.speechToTextSessions.clear();
    this.textToSpeechSessions.forEach((session) => session.onDidChange.dispose());
    this.textToSpeechSessions.clear();
    this.keywordRecognitionSessions.forEach((session) => session.onDidChange.dispose());
    this.keywordRecognitionSessions.clear();
  }
};

MainThreadSpeech = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadSpeech),
  __decorateParam(1, ISpeechService),
  __decorateParam(2, ILogService)
], MainThreadSpeech);
export { MainThreadSpeech };
