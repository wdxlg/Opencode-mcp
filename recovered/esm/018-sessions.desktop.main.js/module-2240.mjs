// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatTurnPills.ts
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { isWeb } from "./module-0014.mjs";
import { Schemas } from "./module-0033.mjs";
import { getEditorOverrideForChatResource } from "./module-2114.mjs";
import { BrowserViewEditorId } from "./module-1243.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { derived } from "./module-0054.mjs";
import { Disposable } from "./module-0012.mjs";
import { DEFAULT_LABELS_CONTAINER, ResourceLabels } from "./module-1322.mjs";
import { Action } from "./module-0082.mjs";
import { ChatChangesPillActionViewItem } from "./module-2237.mjs";
import { createChatSectionPill } from "./module-2239.mjs";
import { ChatPillsWidget, getChatPillEntries } from "./module-2235.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatTurnPills.ts
var chatArtifactPillOptions = {
  widgetId: "chatArtifacts",
  icon: Codicon.package,
  title: localize(12459, null),
  summaryLabel: (count2) => count2 === 1 ? localize(12456, null) : localize(12455, null, count2),
  summaryAriaLabel: (count2) => count2 === 1 ? localize(12458, null) : localize(12457, null, count2),
  singleEntry: "inlineResource" /* InlineResource */
};

var CHAT_TURN_CHANGES_PILL_ID = "chat.turnPills.changes";

var CHAT_TURN_ARTIFACT_PILL_ID = "chat.turnPills.artifact";

var EMPTY_DIFF_STATS = { files: 0, insertions: 0, deletions: 0 };

function previewKind(uri4, htmlPreviewAvailable = !isWeb) {
  const path = uri4.path.toLowerCase();
  if (path.endsWith(".md") || path.endsWith(".markdown")) {
    return "markdown";
  }
  if (htmlPreviewAvailable && uri4.scheme === Schemas.file && (path.endsWith(".html") || path.endsWith(".htm"))) {
    return "html";
  }
  return void 0;
}

function diffStatsEqual(a, b) {
  return a.files === b.files && a.insertions === b.insertions && a.deletions === b.deletions;
}

async function openChatTurnFile(file, openerService, configurationService) {
  const configuredOverride = getEditorOverrideForChatResource(file.uri, configurationService);
  await openerService.open(file.uri, {
    fromUserGesture: true,
    editorOptions: {
      override: configuredOverride ?? (file.kind === "html" ? BrowserViewEditorId : void 0)
    }
  });
}

function isChatTurnStatusPillsEnabled(value2) {
  return typeof value2 === "boolean" ? value2 : !!(value2?.changes || value2?.preview || value2?.browser);
}

function observeTurnStatusPillsEnabled(configurationService) {
  const value2 = observableConfigValue("chat.turnStatusPills" /* TurnStatusPills */, true, configurationService);
  return derived((reader) => isChatTurnStatusPillsEnabled(value2.read(reader)));
}

var ChatTurnPillsProvider = class extends Disposable {
  constructor(_model, _instantiationService) {
    super();
    this._model = _model;
    this._instantiationService = _instantiationService;
    this._resourceLabels = this._register(this._instantiationService.createInstance(ResourceLabels, DEFAULT_LABELS_CONTAINER));
    this._changesAction = this._register(new Action(CHAT_TURN_CHANGES_PILL_ID, localize(12462, null), void 0, true, async () => this._model.openChanges()));
    this._artifactAction = this._register(new Action(CHAT_TURN_ARTIFACT_PILL_ID, localize(12461, null), void 0, true, async () => this._openPrimaryArtifact()));
    const changesPill = {
      action: this._changesAction,
      createActionViewItem: (options3) => new ChatChangesPillActionViewItem(this._changesAction, options3, this._model.stats, this._instantiationService)
    };
    const artifactPill = createChatSectionPill(this._artifactAction, this._model.artifacts, chatArtifactPillOptions, this._resourceLabels, this._instantiationService);
    this.pills = derived(this, (reader) => {
      const pills = [];
      if (this._showChanges(reader)) {
        pills.push(changesPill);
      }
      if (this._showArtifacts(reader)) {
        pills.push(artifactPill.read(reader));
      }
      return pills;
    });
  }
  _showChanges(reader) {
    return this._model.changesEnabled.read(reader) && this._model.stats.read(reader).files > 0;
  }
  _showArtifacts(reader) {
    return this._model.artifactsEnabled.read(reader) && getChatPillEntries(this._model.artifacts.read(reader)).length > 0;
  }
  _openPrimaryArtifact() {
    getChatPillEntries(this._model.artifacts.get()).at(0)?.open();
  }
};

ChatTurnPillsProvider = __decorateClass([
  __decorateParam(1, IInstantiationService)
], ChatTurnPillsProvider);

var ChatTurnPillsWidget = class extends Disposable {
  constructor(model, instantiationService) {
    super();
    const provider = this._register(instantiationService.createInstance(ChatTurnPillsProvider, model));
    const widget = this._register(instantiationService.createInstance(ChatPillsWidget, { pills: provider.pills }, {
      ariaLabel: localize(12460, null)
    }));
    widget.element.classList.add("chat-turn-pills", "show-file-icons");
    this.element = widget.element;
    this.isVisible = widget.isVisible;
  }
};

ChatTurnPillsWidget = __decorateClass([
  __decorateParam(1, IInstantiationService)
], ChatTurnPillsWidget);
export { previewKind, diffStatsEqual, openChatTurnFile, isChatTurnStatusPillsEnabled, observeTurnStatusPillsEnabled, chatArtifactPillOptions, CHAT_TURN_CHANGES_PILL_ID, CHAT_TURN_ARTIFACT_PILL_ID, EMPTY_DIFF_STATS, ChatTurnPillsProvider, ChatTurnPillsWidget };
