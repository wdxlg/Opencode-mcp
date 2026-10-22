// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/services/languageDetection/browser/languageDetectionWebWorkerMain.js
// Original module marker: src/vs/workbench/services/languageDetection/browser/languageDetectionWebWorker.ts
import { WorkerTextModelSyncServer } from "./module-0034.mjs";
import { LanguageDetectionWorkerHost } from "./module-0025.mjs";
import { StopWatch } from "./module-0013.mjs";
import { importAMDNodeModule } from "./module-0024.mjs";


// src/vs/workbench/services/languageDetection/browser/languageDetectionWebWorker.ts
function create(workerServer) {
  return new LanguageDetectionWorker(workerServer);
}

var LanguageDetectionWorker = class _LanguageDetectionWorker {
  constructor(workerServer) {
    this._requestHandlerBrand = void 0;
    this._workerTextModelSyncServer = new WorkerTextModelSyncServer();
    this._regexpLoadFailed = false;
    this._loadFailed = false;
    this.modelIdToCoreId = /* @__PURE__ */ new Map();
    this._host = LanguageDetectionWorkerHost.getChannel(workerServer);
    this._workerTextModelSyncServer.bindToServer(workerServer);
  }
  static {
    this.expectedRelativeConfidence = 0.2;
  }
  static {
    this.positiveConfidenceCorrectionBucket1 = 0.05;
  }
  static {
    this.positiveConfidenceCorrectionBucket2 = 0.025;
  }
  static {
    this.negativeConfidenceCorrection = 0.5;
  }
  async $detectLanguage(uri, langBiases, preferHistory, supportedLangs) {
    const languages = [];
    const confidences = [];
    const stopWatch = new StopWatch();
    const documentTextSample = this.getTextForDetection(uri);
    if (!documentTextSample) {
      return;
    }
    const neuralResolver = async () => {
      for await (const language2 of this.detectLanguagesImpl(documentTextSample)) {
        if (!this.modelIdToCoreId.has(language2.languageId)) {
          this.modelIdToCoreId.set(language2.languageId, await this._host.$getLanguageId(language2.languageId));
        }
        const coreId = this.modelIdToCoreId.get(language2.languageId);
        if (coreId && (!supportedLangs?.length || supportedLangs.includes(coreId))) {
          languages.push(coreId);
          confidences.push(language2.confidence);
        }
      }
      stopWatch.stop();
      if (languages.length) {
        this._host.$sendTelemetryEvent(languages, confidences, stopWatch.elapsed());
        return languages[0];
      }
      return void 0;
    };
    const historicalResolver = async () => this.runRegexpModel(documentTextSample, langBiases ?? {}, supportedLangs);
    if (preferHistory) {
      const history = await historicalResolver();
      if (history) {
        return history;
      }
      const neural = await neuralResolver();
      if (neural) {
        return neural;
      }
    } else {
      const neural = await neuralResolver();
      if (neural) {
        return neural;
      }
      const history = await historicalResolver();
      if (history) {
        return history;
      }
    }
    return void 0;
  }
  getTextForDetection(uri) {
    const editorModel = this._workerTextModelSyncServer.getModel(uri);
    if (!editorModel) {
      return;
    }
    const end = editorModel.positionAt(1e4);
    const content = editorModel.getValueInRange({
      startColumn: 1,
      startLineNumber: 1,
      endColumn: end.column,
      endLineNumber: end.lineNumber
    });
    return content;
  }
  async getRegexpModel() {
    if (this._regexpLoadFailed) {
      return;
    }
    if (this._regexpModel) {
      return this._regexpModel;
    }
    const uri = await this._host.$getRegexpModelUri();
    try {
      this._regexpModel = await importAMDNodeModule(uri, "");
      return this._regexpModel;
    } catch (e) {
      this._regexpLoadFailed = true;
      return;
    }
  }
  async runRegexpModel(content, langBiases, supportedLangs) {
    const regexpModel = await this.getRegexpModel();
    if (!regexpModel) {
      return;
    }
    if (supportedLangs?.length) {
      for (const lang of Object.keys(langBiases)) {
        if (supportedLangs.includes(lang)) {
          langBiases[lang] = 1;
        } else {
          langBiases[lang] = 0;
        }
      }
    }
    const detected = regexpModel.detect(content, langBiases, supportedLangs);
    return detected;
  }
  async getModelOperations() {
    if (this._modelOperations) {
      return this._modelOperations;
    }
    const uri = await this._host.$getIndexJsUri();
    const { ModelOperations } = await importAMDNodeModule(uri, "");
    this._modelOperations = new ModelOperations({
      modelJsonLoaderFunc: async () => {
        const response = await fetch(await this._host.$getModelJsonUri());
        try {
          const modelJSON = await response.json();
          return modelJSON;
        } catch (e) {
          const message = `Failed to parse model JSON.`;
          throw new Error(message);
        }
      },
      weightsLoaderFunc: async () => {
        const response = await fetch(await this._host.$getWeightsUri());
        const buffer = await response.arrayBuffer();
        return buffer;
      }
    });
    return this._modelOperations;
  }
  // This adjusts the language confidence scores to be more accurate based on:
  // * VS Code's language usage
  // * Languages with 'problematic' syntaxes that have caused incorrect language detection
  adjustLanguageConfidence(modelResult) {
    switch (modelResult.languageId) {
      // For the following languages, we increase the confidence because
      // these are commonly used languages in VS Code and supported
      // by the model.
      case "js":
      case "html":
      case "json":
      case "ts":
      case "css":
      case "py":
      case "xml":
      case "php":
        modelResult.confidence += _LanguageDetectionWorker.positiveConfidenceCorrectionBucket1;
        break;
      // case 'yaml': // YAML has been know to cause incorrect language detection because the language is pretty simple. We don't want to increase the confidence for this.
      case "cpp":
      case "sh":
      case "java":
      case "cs":
      case "c":
        modelResult.confidence += _LanguageDetectionWorker.positiveConfidenceCorrectionBucket2;
        break;
      // For the following languages, we need to be extra confident that the language is correct because
      // we've had issues like #131912 that caused incorrect guesses. To enforce this, we subtract the
      // negativeConfidenceCorrection from the confidence.
      // languages that are provided by default in VS Code
      case "bat":
      case "ini":
      case "makefile":
      case "sql":
      // languages that aren't provided by default in VS Code
      case "csv":
      case "toml":
        modelResult.confidence -= _LanguageDetectionWorker.negativeConfidenceCorrection;
        break;
      default:
        break;
    }
    return modelResult;
  }
  async *detectLanguagesImpl(content) {
    if (this._loadFailed) {
      return;
    }
    let modelOperations;
    try {
      modelOperations = await this.getModelOperations();
    } catch (e) {
      console.log(e);
      this._loadFailed = true;
      return;
    }
    let modelResults;
    try {
      modelResults = await modelOperations.runModel(content);
    } catch (e) {
      console.warn(e);
    }
    if (!modelResults || modelResults.length === 0 || modelResults[0].confidence < _LanguageDetectionWorker.expectedRelativeConfidence) {
      return;
    }
    const firstModelResult = this.adjustLanguageConfidence(modelResults[0]);
    if (firstModelResult.confidence < _LanguageDetectionWorker.expectedRelativeConfidence) {
      return;
    }
    const possibleLanguages = [firstModelResult];
    for (let current of modelResults) {
      if (current === firstModelResult) {
        continue;
      }
      current = this.adjustLanguageConfidence(current);
      const currentHighest = possibleLanguages[possibleLanguages.length - 1];
      if (currentHighest.confidence - current.confidence >= _LanguageDetectionWorker.expectedRelativeConfidence) {
        while (possibleLanguages.length) {
          yield possibleLanguages.shift();
        }
        if (current.confidence > _LanguageDetectionWorker.expectedRelativeConfidence) {
          possibleLanguages.push(current);
          continue;
        }
        return;
      } else {
        if (current.confidence > _LanguageDetectionWorker.expectedRelativeConfidence) {
          possibleLanguages.push(current);
          continue;
        }
        return;
      }
    }
  }
};
export { create, LanguageDetectionWorker };
