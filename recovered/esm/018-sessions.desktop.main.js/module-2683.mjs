// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingExplanationModelManager.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { basename2 } from "./module-0034.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageModelsService } from "./module-0968.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingExplanationModelManager.ts
var IChatEditingExplanationModelManager = createDecorator("chatEditingExplanationModelManager");

function getChangeTexts2(change, diffInfo) {
  const originalLines = [];
  const modifiedLines = [];
  for (let i2 = change.original.startLineNumber; i2 < change.original.endLineNumberExclusive; i2++) {
    const line = diffInfo.originalModel.getLineContent(i2);
    originalLines.push(line);
  }
  for (let i2 = change.modified.startLineNumber; i2 < change.modified.endLineNumberExclusive; i2++) {
    const line = diffInfo.modifiedModel.getLineContent(i2);
    modifiedLines.push(line);
  }
  return {
    originalText: originalLines.join("\n"),
    modifiedText: modifiedLines.join("\n")
  };
}

var ChatEditingExplanationModelManager = class extends Disposable {
  constructor(_languageModelsService) {
    super();
    this._languageModelsService = _languageModelsService;
    this._state = observableValue(this, new ResourceMap());
    this.state = this._state;
  }
  _updateUriState(uri4, uriState) {
    const current = this._state.get();
    const newState = new ResourceMap(current);
    newState.set(uri4, uriState);
    this._state.set(newState, void 0);
  }
  _updateUriStatePartial(uri4, partial) {
    const current = this._state.get();
    const existing = current.get(uri4);
    if (existing) {
      const newState = new ResourceMap(current);
      newState.set(uri4, { ...existing, ...partial });
      this._state.set(newState, void 0);
    }
  }
  _removeUris(uris) {
    const current = this._state.get();
    const newState = new ResourceMap(current);
    for (const uri4 of uris) {
      newState.delete(uri4);
    }
    this._state.set(newState, void 0);
  }
  generateExplanations(diffInfos, chatSessionResource, token) {
    const uris = diffInfos.map((d) => d.modifiedModel.uri);
    const cts = new CancellationTokenSource(token);
    for (const diffInfo of diffInfos) {
      this._updateUriState(diffInfo.modifiedModel.uri, {
        progress: "loading",
        explanations: [],
        diffInfo,
        chatSessionResource
      });
    }
    const completed = this._doGenerateExplanations(diffInfos, cts.token);
    return {
      uris,
      completed,
      dispose: () => {
        cts.dispose(true);
        this._removeUris(uris);
      }
    };
  }
  async _doGenerateExplanations(diffInfos, cancellationToken) {
    const nonEmptyDiffs = [];
    for (const diffInfo of diffInfos) {
      if (diffInfo.changes.length === 0 || diffInfo.identical) {
        this._updateUriStatePartial(diffInfo.modifiedModel.uri, {
          progress: "complete",
          explanations: []
        });
      } else {
        nonEmptyDiffs.push(diffInfo);
      }
    }
    if (nonEmptyDiffs.length === 0) {
      return;
    }
    const fileChanges = nonEmptyDiffs.map((diffInfo) => {
      const uri4 = diffInfo.modifiedModel.uri;
      const fileName = basename2(uri4);
      const changes = diffInfo.changes.map((change) => {
        const { originalText, modifiedText } = getChangeTexts2(change, diffInfo);
        return {
          startLineNumber: change.modified.startLineNumber,
          endLineNumber: change.modified.endLineNumberExclusive - 1,
          originalText,
          modifiedText
        };
      });
      return { uri: uri4, fileName, changes };
    });
    const totalChanges = fileChanges.reduce((sum2, f) => sum2 + f.changes.length, 0);
    try {
      const models = await this._languageModelsService.selectLanguageModels({ vendor: "copilot", id: "copilot-utility-small" });
      if (!models.length) {
        for (const fileData of fileChanges) {
          this._updateUriStatePartial(fileData.uri, {
            progress: "error",
            explanations: [],
            errorMessage: localize(10862, null)
          });
        }
        return;
      }
      if (cancellationToken.isCancellationRequested) {
        return;
      }
      let changeIndex = 0;
      const changesDescription = fileChanges.map((fileData) => {
        return fileData.changes.map((data) => {
          const desc = `=== CHANGE ${changeIndex} (File: ${fileData.fileName}, Lines ${data.startLineNumber}-${data.endLineNumber}) ===
BEFORE:
${data.originalText || "(empty)"}

AFTER:
${data.modifiedText || "(empty)"}`;
          changeIndex++;
          return desc;
        }).join("\n\n");
      }).join("\n\n");
      const fileCount = fileChanges.length;
      const prompt = `Analyze these ${totalChanges} code changes across ${fileCount} file${fileCount > 1 ? "s" : ""} and provide a brief explanation for each one.
These changes are part of a single coherent modification, so consider how they relate to each other.

${changesDescription}

Respond with a JSON array containing exactly ${totalChanges} objects, one for each change in order.
Each object should have an "explanation" field with a brief sentence (max 15 words) explaining what changed and why.
Be specific about the actual code changes. Return ONLY valid JSON, no markdown.

Example response format:
[{"explanation": "Added null check to prevent crash"}, {"explanation": "Renamed variable for clarity"}]`;
      const response = await this._languageModelsService.sendChatRequest(
        models[0],
        void 0,
        [{ role: 1 /* User */, content: [{ type: "text", value: prompt }] }],
        {},
        cancellationToken
      );
      let responseText = "";
      for await (const part of response.stream) {
        if (cancellationToken.isCancellationRequested) {
          return;
        }
        if (Array.isArray(part)) {
          for (const p of part) {
            if (p.type === "text") {
              responseText += p.value;
            }
          }
        } else if (part.type === "text") {
          responseText += part.value;
        }
      }
      await response.result;
      if (cancellationToken.isCancellationRequested) {
        return;
      }
      let parsed = [];
      try {
        let jsonText = responseText.trim();
        if (jsonText.startsWith("```")) {
          jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }
        parsed = JSON.parse(jsonText);
      } catch {
      }
      let parsedIndex = 0;
      for (const fileData of fileChanges) {
        const explanations = [];
        for (const data of fileData.changes) {
          const parsedExplanation = parsed[parsedIndex]?.explanation?.trim() || localize(10860, null);
          explanations.push({
            uri: fileData.uri,
            startLineNumber: data.startLineNumber,
            endLineNumber: data.endLineNumber,
            originalText: data.originalText,
            modifiedText: data.modifiedText,
            explanation: parsedExplanation
          });
          parsedIndex++;
        }
        this._updateUriStatePartial(fileData.uri, {
          progress: "complete",
          explanations
        });
      }
    } catch (e4) {
      if (!cancellationToken.isCancellationRequested) {
        const errorMessage = e4 instanceof Error ? e4.message : localize(10861, null);
        for (const fileData of fileChanges) {
          this._updateUriStatePartial(fileData.uri, {
            progress: "error",
            explanations: [],
            errorMessage
          });
        }
      }
    }
  }
};

ChatEditingExplanationModelManager = __decorateClass([
  __decorateParam(0, ILanguageModelsService)
], ChatEditingExplanationModelManager);

registerSingleton(IChatEditingExplanationModelManager, ChatEditingExplanationModelManager, 1 /* Delayed */);
export { getChangeTexts2, IChatEditingExplanationModelManager, ChatEditingExplanationModelManager };
