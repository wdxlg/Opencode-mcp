// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/speech/browser/speechService.ts
import { ExtensionsRegistry } from "./module-0878.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { HasSpeechProvider, SPEECH_LANGUAGE_CONFIG, SpeechToTextInProgress, TextToSpeechInProgress, speechLanguageConfigToLanguage } from "./module-1254.mjs";
import { DeferredPromise } from "./module-0036.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IHostService } from "./module-1118.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IExtensionService } from "./module-0889.mjs";


// src/vs/workbench/contrib/speech/browser/speechService.ts
var speechProvidersExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "speechProviders",
  jsonSchema: {
    description: localize(19379, null),
    type: "array",
    items: {
      additionalProperties: false,
      type: "object",
      defaultSnippets: [{ body: { name: "", description: "" } }],
      required: ["name"],
      properties: {
        name: {
          description: localize(19378, null),
          type: "string"
        },
        description: {
          description: localize(19377, null),
          type: "string"
        }
      }
    }
  }
});

var SpeechService = class extends Disposable {
  constructor(logService, contextKeyService, hostService, telemetryService, configurationService, extensionService) {
    super();
    this.logService = logService;
    this.hostService = hostService;
    this.telemetryService = telemetryService;
    this.configurationService = configurationService;
    this.extensionService = extensionService;
    this._onDidChangeHasSpeechProvider = this._register(new Emitter());
    this.onDidChangeHasSpeechProvider = this._onDidChangeHasSpeechProvider.event;
    this.providers = /* @__PURE__ */ new Map();
    this.providerDescriptors = /* @__PURE__ */ new Map();
    //#region Speech to Text
    this._onDidStartSpeechToTextSession = this._register(new Emitter());
    this.onDidStartSpeechToTextSession = this._onDidStartSpeechToTextSession.event;
    this._onDidEndSpeechToTextSession = this._register(new Emitter());
    this.onDidEndSpeechToTextSession = this._onDidEndSpeechToTextSession.event;
    this.activeSpeechToTextSessions = 0;
    //#endregion
    //#region Text to Speech
    this._onDidStartTextToSpeechSession = this._register(new Emitter());
    this.onDidStartTextToSpeechSession = this._onDidStartTextToSpeechSession.event;
    this._onDidEndTextToSpeechSession = this._register(new Emitter());
    this.onDidEndTextToSpeechSession = this._onDidEndTextToSpeechSession.event;
    this.activeTextToSpeechSessions = 0;
    //#endregion
    //#region Keyword Recognition
    this._onDidStartKeywordRecognition = this._register(new Emitter());
    this.onDidStartKeywordRecognition = this._onDidStartKeywordRecognition.event;
    this._onDidEndKeywordRecognition = this._register(new Emitter());
    this.onDidEndKeywordRecognition = this._onDidEndKeywordRecognition.event;
    this.activeKeywordRecognitionSessions = 0;
    this.hasSpeechProviderContext = HasSpeechProvider.bindTo(contextKeyService);
    this.textToSpeechInProgress = TextToSpeechInProgress.bindTo(contextKeyService);
    this.speechToTextInProgress = SpeechToTextInProgress.bindTo(contextKeyService);
    this.handleAndRegisterSpeechExtensions();
  }
  get hasSpeechProvider() {
    return this.providerDescriptors.size > 0 || this.providers.size > 0;
  }
  handleAndRegisterSpeechExtensions() {
    speechProvidersExtensionPoint.setHandler((extensions, delta2) => {
      const oldHasSpeechProvider = this.hasSpeechProvider;
      for (const extension of delta2.removed) {
        for (const descriptor of extension.value) {
          this.providerDescriptors.delete(descriptor.name);
        }
      }
      for (const extension of delta2.added) {
        for (const descriptor of extension.value) {
          this.providerDescriptors.set(descriptor.name, descriptor);
        }
      }
      if (oldHasSpeechProvider !== this.hasSpeechProvider) {
        this.handleHasSpeechProviderChange();
      }
    });
  }
  registerSpeechProvider(identifier2, provider) {
    if (this.providers.has(identifier2)) {
      throw new Error(`Speech provider with identifier ${identifier2} is already registered.`);
    }
    const oldHasSpeechProvider = this.hasSpeechProvider;
    this.providers.set(identifier2, provider);
    if (oldHasSpeechProvider !== this.hasSpeechProvider) {
      this.handleHasSpeechProviderChange();
    }
    return toDisposable(() => {
      const oldHasSpeechProvider2 = this.hasSpeechProvider;
      this.providers.delete(identifier2);
      if (oldHasSpeechProvider2 !== this.hasSpeechProvider) {
        this.handleHasSpeechProviderChange();
      }
    });
  }
  handleHasSpeechProviderChange() {
    this.hasSpeechProviderContext.set(this.hasSpeechProvider);
    this._onDidChangeHasSpeechProvider.fire();
  }
  get hasActiveSpeechToTextSession() {
    return this.activeSpeechToTextSessions > 0;
  }
  async createSpeechToTextSession(token, context2 = "speech") {
    const provider = await this.getProvider();
    const language2 = speechLanguageConfigToLanguage(this.configurationService.getValue(SPEECH_LANGUAGE_CONFIG));
    const session = provider.createSpeechToTextSession(token, typeof language2 === "string" ? { language: language2 } : void 0);
    const sessionStart = Date.now();
    let sessionRecognized = false;
    let sessionError = false;
    let sessionContentLength = 0;
    const disposables = new DisposableStore();
    const onSessionStoppedOrCanceled = () => {
      this.activeSpeechToTextSessions = Math.max(0, this.activeSpeechToTextSessions - 1);
      if (!this.hasActiveSpeechToTextSession) {
        this.speechToTextInProgress.reset();
      }
      this._onDidEndSpeechToTextSession.fire();
      this.telemetryService.publicLog2("speechToTextSession", {
        context: context2,
        sessionDuration: Date.now() - sessionStart,
        sessionRecognized,
        sessionError,
        sessionContentLength,
        sessionLanguage: language2
      });
      disposables.dispose();
    };
    disposables.add(token.onCancellationRequested(() => onSessionStoppedOrCanceled()));
    if (token.isCancellationRequested) {
      onSessionStoppedOrCanceled();
    }
    disposables.add(session.onDidChange((e4) => {
      switch (e4.status) {
        case 1 /* Started */:
          this.activeSpeechToTextSessions++;
          this.speechToTextInProgress.set(true);
          this._onDidStartSpeechToTextSession.fire();
          break;
        case 2 /* Recognizing */:
          sessionRecognized = true;
          break;
        case 3 /* Recognized */:
          if (typeof e4.text === "string") {
            sessionContentLength += e4.text.length;
          }
          break;
        case 4 /* Stopped */:
          onSessionStoppedOrCanceled();
          break;
        case 5 /* Error */:
          this.logService.error(`Speech provider error in speech to text session: ${e4.text}`);
          sessionError = true;
          break;
      }
    }));
    return session;
  }
  async getProvider() {
    await this.extensionService.activateByEvent("onSpeech");
    const provider = Array.from(this.providers.values()).at(0);
    if (!provider) {
      throw new Error(`No Speech provider is registered.`);
    } else if (this.providers.size > 1) {
      this.logService.warn(`Multiple speech providers registered. Picking first one: ${provider.metadata.displayName}`);
    }
    return provider;
  }
  get hasActiveTextToSpeechSession() {
    return this.activeTextToSpeechSessions > 0;
  }
  async createTextToSpeechSession(token, context2 = "speech") {
    const provider = await this.getProvider();
    const language2 = speechLanguageConfigToLanguage(this.configurationService.getValue(SPEECH_LANGUAGE_CONFIG));
    const session = provider.createTextToSpeechSession(token, typeof language2 === "string" ? { language: language2 } : void 0);
    const sessionStart = Date.now();
    let sessionError = false;
    const disposables = new DisposableStore();
    const onSessionStoppedOrCanceled = (dispose2) => {
      this.activeTextToSpeechSessions = Math.max(0, this.activeTextToSpeechSessions - 1);
      if (!this.hasActiveTextToSpeechSession) {
        this.textToSpeechInProgress.reset();
      }
      this._onDidEndTextToSpeechSession.fire();
      this.telemetryService.publicLog2("textToSpeechSession", {
        context: context2,
        sessionDuration: Date.now() - sessionStart,
        sessionError,
        sessionLanguage: language2
      });
      if (dispose2) {
        disposables.dispose();
      }
    };
    disposables.add(token.onCancellationRequested(() => onSessionStoppedOrCanceled(true)));
    if (token.isCancellationRequested) {
      onSessionStoppedOrCanceled(true);
    }
    disposables.add(session.onDidChange((e4) => {
      switch (e4.status) {
        case 1 /* Started */:
          this.activeTextToSpeechSessions++;
          this.textToSpeechInProgress.set(true);
          this._onDidStartTextToSpeechSession.fire();
          break;
        case 2 /* Stopped */:
          onSessionStoppedOrCanceled(false);
          break;
        case 3 /* Error */:
          this.logService.error(`Speech provider error in text to speech session: ${e4.text}`);
          sessionError = true;
          break;
      }
    }));
    return session;
  }
  get hasActiveKeywordRecognition() {
    return this.activeKeywordRecognitionSessions > 0;
  }
  async recognizeKeyword(token) {
    const result = new DeferredPromise();
    const disposables = new DisposableStore();
    disposables.add(token.onCancellationRequested(() => {
      disposables.dispose();
      result.complete(3 /* Canceled */);
    }));
    const recognizeKeywordDisposables = disposables.add(new DisposableStore());
    let activeRecognizeKeywordSession = void 0;
    const recognizeKeyword = () => {
      recognizeKeywordDisposables.clear();
      const cts = new CancellationTokenSource(token);
      recognizeKeywordDisposables.add(toDisposable(() => cts.dispose(true)));
      const currentRecognizeKeywordSession = activeRecognizeKeywordSession = this.doRecognizeKeyword(cts.token).then((status3) => {
        if (currentRecognizeKeywordSession === activeRecognizeKeywordSession) {
          result.complete(status3);
        }
      }, (error) => {
        if (currentRecognizeKeywordSession === activeRecognizeKeywordSession) {
          result.error(error);
        }
      });
    };
    disposables.add(this.hostService.onDidChangeFocus((focused) => {
      if (!focused && activeRecognizeKeywordSession) {
        recognizeKeywordDisposables.clear();
        activeRecognizeKeywordSession = void 0;
      } else if (!activeRecognizeKeywordSession) {
        recognizeKeyword();
      }
    }));
    if (this.hostService.hasFocus) {
      recognizeKeyword();
    }
    let status2;
    try {
      status2 = await result.p;
    } finally {
      disposables.dispose();
    }
    this.telemetryService.publicLog2("keywordRecognition", {
      keywordRecognized: status2 === 1 /* Recognized */
    });
    return status2;
  }
  async doRecognizeKeyword(token) {
    const provider = await this.getProvider();
    const session = provider.createKeywordRecognitionSession(token);
    this.activeKeywordRecognitionSessions++;
    this._onDidStartKeywordRecognition.fire();
    const disposables = new DisposableStore();
    const onSessionStoppedOrCanceled = () => {
      this.activeKeywordRecognitionSessions = Math.max(0, this.activeKeywordRecognitionSessions - 1);
      this._onDidEndKeywordRecognition.fire();
      disposables.dispose();
    };
    disposables.add(token.onCancellationRequested(() => onSessionStoppedOrCanceled()));
    if (token.isCancellationRequested) {
      onSessionStoppedOrCanceled();
    }
    disposables.add(session.onDidChange((e4) => {
      if (e4.status === 2 /* Stopped */) {
        onSessionStoppedOrCanceled();
      }
    }));
    try {
      return (await Event2.toPromise(session.onDidChange)).status;
    } finally {
      onSessionStoppedOrCanceled();
    }
  }
  //#endregion
};

SpeechService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IHostService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IExtensionService)
], SpeechService);
export { speechProvidersExtensionPoint, SpeechService };
