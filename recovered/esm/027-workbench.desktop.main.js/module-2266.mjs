// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatTurnPillsPart.ts
import { Disposable, combinedDisposable } from "./module-0012.mjs";
import { $, EventHelper, addDisposableListener } from "./module-0075.mjs";
import { constObservable } from "./module-0061.mjs";
import { derivedObservableWithCache } from "./module-0059.mjs";
import { EMPTY_DIFF_STATS, observeTurnStatusPillsEnabled } from "./module-2265.mjs";
import { derived } from "./module-0054.mjs";
import { ChatCollapsibleContentPart } from "./module-2143.mjs";
import { renderChangesSummaryFileList } from "./module-2259.mjs";
import { autorun } from "./module-0052.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatResponseFileChangesService } from "./module-2258.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IEditorService } from "./module-0934.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatTurnPillsPart.ts
var ChatTurnPillsContentPart = class extends Disposable {
  constructor(_content, _context, _chatResponseFileChangesService, _hoverService, _configurationService, _instantiationService, _editorService) {
    super();
    this._content = _content;
    this._chatResponseFileChangesService = _chatResponseFileChangesService;
    this._hoverService = _hoverService;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._editorService = _editorService;
    this.domNode = $(".chat-turn-pills-part");
    const providedDiffs = this._chatResponseFileChangesService.getChangesForRequest(_content.sessionResource, _content.requestId) ?? constObservable([]);
    this._diffs = derivedObservableWithCache(this, (reader, lastValue) => {
      const diffs = providedDiffs.read(reader);
      return diffs.length > 0 ? diffs : lastValue ?? diffs;
    });
    const providedStats = this._chatResponseFileChangesService.getChangeStatsForRequest?.(
      _content.sessionResource,
      _content.requestId,
      { isLastTurn: _content.isLastTurn }
    );
    const stats = derivedObservableWithCache(this, (reader, lastValue) => {
      if (providedStats) {
        return providedStats.read(reader);
      }
      const diffs = this._diffs.read(reader);
      if (diffs.length === 0) {
        return lastValue ?? EMPTY_DIFF_STATS;
      }
      let insertions = 0, deletions = 0;
      for (const diff4 of diffs) {
        insertions += diff4.added;
        deletions += diff4.removed;
      }
      return { files: diffs.length, insertions, deletions };
    });
    const turnStatusPillsEnabled = observeTurnStatusPillsEnabled(this._configurationService);
    const changesEnabled = derived(this, (reader) => turnStatusPillsEnabled.read(reader));
    const showChanges = derived(this, (reader) => changesEnabled.read(reader) && stats.read(reader).files > 0);
    const root = this.domNode.appendChild($(".checkpoint-file-changes-summary.checkpoint-file-changes-compact"));
    const details = root.appendChild(document.createElement("details"));
    details.classList.add("checkpoint-file-changes-disclosure");
    const header2 = details.appendChild(document.createElement("summary"));
    header2.classList.add("checkpoint-file-changes-summary-header");
    this._register(this._renderChangesHeader(header2, stats));
    this._register(this._renderChevron(header2, details));
    this._register(addDisposableListener(header2, "click", () => {
      this.domNode.dispatchEvent(new CustomEvent(ChatCollapsibleContentPart.userToggleEvent, { bubbles: true }));
    }));
    this._register(renderChangesSummaryFileList(details, this._diffs, this._instantiationService, this._editorService, this._configurationService));
    this._register(autorun((reader) => {
      this.domNode.style.display = showChanges.read(reader) ? "" : "none";
    }));
  }
  _renderChangesHeader(header2, stats) {
    const filesLabel = header2.appendChild($("span.chat-file-changes-label"));
    const counts = header2.appendChild(document.createElement("button"));
    counts.classList.add("chat-file-changes-counts");
    counts.type = "button";
    const addedLabel = counts.appendChild($("span.insertions"));
    const removedLabel = counts.appendChild($("span.deletions"));
    const hoverDisposable = this._hoverService.setupDelayedHover(counts, () => ({
      content: localize2(12181, "View All File Changes")
    }));
    const clickDisposable = addDisposableListener(counts, "click", (e) => {
      this._openChanges();
      EventHelper.stop(e, true);
    });
    return combinedDisposable(hoverDisposable, clickDisposable, autorun((reader) => {
      const { files, insertions, deletions } = stats.read(reader);
      const fileCountLabel = files === 1 ? localize(12179, null) : localize(12178, null, files);
      filesLabel.textContent = fileCountLabel;
      addedLabel.textContent = `+${insertions}`;
      removedLabel.textContent = `-${deletions}`;
      counts.setAttribute("aria-label", localize(
        12180,
        null,
        fileCountLabel,
        insertions,
        deletions
      ));
      header2.setAttribute("aria-label", localize(
        12177,
        null,
        fileCountLabel,
        insertions,
        deletions
      ));
    }));
  }
  _renderChevron(header2, details) {
    const chevron = header2.appendChild($("span.chat-file-changes-chevron.chat-collapsible-hover-chevron", { "aria-hidden": "true" }));
    chevron.classList.add(...ThemeIcon.asClassNameArray(Codicon.chevronRightCompact));
    const setExpansionState = () => {
      header2.setAttribute("aria-expanded", String(details.open));
      chevron.classList.toggle("expanded", details.open);
    };
    setExpansionState();
    return addDisposableListener(details, "toggle", setExpansionState);
  }
  _openChanges() {
    this._chatResponseFileChangesService.openChangesForRequest(
      this._content.sessionResource,
      this._content.requestId,
      { isLastTurn: this._content.isLastTurn }
    );
  }
  hasSameContent(other, _followingContent, _element) {
    return other.kind === "turnPills" && other.requestId === this._content.requestId && isEqual2(other.sessionResource, this._content.sessionResource) && other.isLastTurn === this._content.isLastTurn;
  }
};

ChatTurnPillsContentPart = __decorateClass([
  __decorateParam(2, IChatResponseFileChangesService),
  __decorateParam(3, IHoverService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IEditorService)
], ChatTurnPillsContentPart);
export { ChatTurnPillsContentPart };
