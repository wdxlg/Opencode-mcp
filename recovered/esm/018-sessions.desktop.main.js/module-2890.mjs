// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/agentsVoice/browser/transcriptsView/voiceTranscriptsView.ts
import { $, append, clearNode } from "./module-0075.mjs";
import { ViewPane } from "./module-1334.mjs";
import { autorun } from "./module-0052.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IViewDescriptorService } from "./module-1094.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IVoiceTranscriptStore } from "./module-2059.mjs";
import { IAuthenticationService } from "./module-0952.mjs";
import { IVoiceSessionController } from "./module-2070.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/agentsVoice/browser/transcriptsView/voiceTranscriptsView.ts
var $99 = $;

var VoiceTranscriptsViewPane = class extends ViewPane {
  constructor(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, voiceTranscriptStore, authenticationService, voiceSessionController, logService) {
    super(
      options3,
      keybindingService,
      contextMenuService,
      configurationService,
      contextKeyService,
      viewDescriptorService,
      instantiationService,
      openerService,
      themeService,
      hoverService
    );
    this.voiceTranscriptStore = voiceTranscriptStore;
    this.authenticationService = authenticationService;
    this.voiceSessionController = voiceSessionController;
    this.logService = logService;
    let lastState;
    this._register(autorun((reader) => {
      const state = this.voiceSessionController.voiceState.read(reader);
      const wasMidTurn = lastState === "speaking" || lastState === "processing";
      const nowIdle = state === "idle" || state === "listening";
      lastState = state;
      if (wasMidTurn && nowIdle && this.isBodyVisible()) {
        void this.refresh();
      }
    }));
  }
  static {
    this.ID = "workbench.view.voiceTranscripts";
  }
  renderBody(container2) {
    super.renderBody(container2);
    container2.classList.add("voice-transcripts-view");
    container2.style.display = "flex";
    container2.style.flexDirection = "column";
    container2.style.overflow = "hidden";
    this.contentContainer = append(container2, $99(".voice-transcripts-content"));
    this.contentContainer.style.flex = "1";
    this.contentContainer.style.overflowY = "auto";
    this.contentContainer.style.padding = "6px 12px 12px";
    this.contentContainer.style.fontSize = "13px";
    this.emptyState = append(container2, $99(".voice-transcripts-empty"));
    this.emptyState.style.display = "none";
    this.emptyState.style.padding = "24px 16px";
    this.emptyState.style.textAlign = "center";
    this.emptyState.style.color = "var(--vscode-descriptionForeground)";
    this.emptyState.style.fontSize = "13px";
    this.emptyState.textContent = localize(
      7864,
      null
    );
    void this.refresh();
  }
  layoutBody(height, width2) {
    super.layoutBody(height, width2);
  }
  /**
   * Re-read the transcript JSONL and re-render. Cheap; the file is text-only
   * and bounded by the user's actual usage.
   */
  async refresh() {
    if (!this.contentContainer || !this.emptyState) {
      return;
    }
    try {
      this.userLogin = await this.resolveUserLogin();
      if (!this.userLogin) {
        this.renderEmpty();
        return;
      }
      const turns = await this.voiceTranscriptStore.loadTurns(this.userLogin);
      const indexEntry = this.voiceTranscriptStore.getIndexEntry(this.userLogin);
      const archiveCutoff = indexEntry?.archivedBefore;
      const spoken = turns.filter((t2) => t2.kind === "user_voice" || t2.kind === "agent_voice");
      const visible = archiveCutoff ? spoken.filter((t2) => t2.timestamp >= archiveCutoff) : spoken;
      const archivedCount = spoken.length - visible.length;
      if (visible.length === 0 && archivedCount === 0) {
        this.renderEmpty();
        return;
      }
      this.renderTurns(visible, archivedCount);
    } catch (err) {
      this.logService.warn("[voiceTranscripts] refresh failed", err);
      this.renderEmpty();
    }
  }
  async archiveAll() {
    if (!this.userLogin) {
      this.userLogin = await this.resolveUserLogin();
    }
    if (!this.userLogin) {
      return;
    }
    const cutoff = (/* @__PURE__ */ new Date()).toISOString();
    try {
      await this.voiceTranscriptStore.archiveUpTo(this.userLogin, cutoff);
    } catch (err) {
      this.logService.warn("[voiceTranscripts] archiveUpTo failed", err);
    }
    await this.refresh();
  }
  async deleteAll() {
    if (!this.userLogin) {
      this.userLogin = await this.resolveUserLogin();
    }
    if (!this.userLogin) {
      return;
    }
    try {
      await this.voiceTranscriptStore.deleteAll(this.userLogin);
    } catch (err) {
      this.logService.warn("[voiceTranscripts] deleteAll failed", err);
    }
    await this.refresh();
  }
  // --- Internals ---
  async resolveUserLogin() {
    try {
      const sessions = await this.authenticationService.getSessions("github");
      return sessions[0]?.account.label;
    } catch (err) {
      this.logService.warn("[voiceTranscripts] failed to resolve github session", err);
      return void 0;
    }
  }
  renderEmpty() {
    if (!this.contentContainer || !this.emptyState) {
      return;
    }
    clearNode(this.contentContainer);
    this.contentContainer.style.display = "none";
    this.emptyState.style.display = "block";
  }
  renderTurns(turns, archivedCount) {
    if (!this.contentContainer || !this.emptyState) {
      return;
    }
    this.emptyState.style.display = "none";
    this.contentContainer.style.display = "block";
    clearNode(this.contentContainer);
    const groups = groupTurnsByTime(turns).filter((g) => g.pairs.length > 0);
    for (const group2 of groups) {
      this.renderGroup(group2);
    }
    if (archivedCount > 0) {
      const archived = append(this.contentContainer, $99(".voice-transcripts-archived-note"));
      archived.style.marginTop = "12px";
      archived.style.fontSize = "11px";
      archived.style.color = "var(--vscode-descriptionForeground)";
      archived.style.fontStyle = "italic";
      archived.textContent = localize(
        7861,
        null,
        archivedCount,
        archivedCount === 1 ? "" : "s"
      );
    }
  }
  renderGroup(group2) {
    if (!this.contentContainer) {
      return;
    }
    const groupEl = append(this.contentContainer, $99(".voice-transcripts-group"));
    groupEl.style.marginBottom = "14px";
    const heading2 = append(groupEl, $99(".voice-transcripts-group-heading"));
    heading2.textContent = group2.label;
    heading2.style.fontSize = "11px";
    heading2.style.fontWeight = "600";
    heading2.style.textTransform = "uppercase";
    heading2.style.letterSpacing = "0.5px";
    heading2.style.color = "var(--vscode-descriptionForeground)";
    heading2.style.padding = "4px 0 6px";
    heading2.style.borderBottom = "1px solid var(--vscode-editorWhitespace-foreground)";
    heading2.style.marginBottom = "4px";
    for (const pair of group2.pairs) {
      this.renderPair(groupEl, pair);
    }
  }
  renderPair(parent, pair) {
    const pairEl = append(parent, $99(".voice-transcripts-pair"));
    pairEl.style.padding = "6px 0";
    pairEl.style.borderBottom = "1px solid var(--vscode-editorWhitespace-foreground)";
    const time = append(pairEl, $99(".voice-transcripts-time"));
    time.textContent = formatTime2(pair.timestamp);
    time.style.fontSize = "10px";
    time.style.color = "var(--vscode-descriptionForeground)";
    time.style.marginBottom = "4px";
    if (pair.user) {
      this.renderRow(pairEl, "You", pair.user.text);
    }
    if (pair.assistant) {
      this.renderRow(pairEl, "Voice", pair.assistant.text);
    }
  }
  renderRow(parent, label3, text2) {
    const row = append(parent, $99(".voice-transcripts-row"));
    row.style.display = "flex";
    row.style.gap = "6px";
    row.style.alignItems = "baseline";
    row.style.marginBottom = "3px";
    row.style.lineHeight = "1.4";
    const labelEl = append(row, $99("span"));
    labelEl.textContent = `${label3}:`;
    labelEl.style.fontSize = "11px";
    labelEl.style.fontWeight = "600";
    labelEl.style.color = "var(--vscode-descriptionForeground)";
    labelEl.style.flex = "0 0 auto";
    labelEl.style.minWidth = "32px";
    const textEl = append(row, $99("span"));
    textEl.textContent = text2;
    textEl.style.fontSize = "13px";
    textEl.style.color = "var(--vscode-foreground)";
    textEl.style.whiteSpace = "pre-wrap";
    textEl.style.wordBreak = "break-word";
  }
};

VoiceTranscriptsViewPane = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IViewDescriptorService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, IHoverService),
  __decorateParam(10, IVoiceTranscriptStore),
  __decorateParam(11, IAuthenticationService),
  __decorateParam(12, IVoiceSessionController),
  __decorateParam(13, ILogService)
], VoiceTranscriptsViewPane);

function formatTime2(timestamp) {
  try {
    return new Date(timestamp).toLocaleTimeString(void 0, { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function groupTurnsByTime(turns) {
  if (turns.length === 0) {
    return [];
  }
  const now = /* @__PURE__ */ new Date();
  const today = startOfDay(now);
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1e3);
  const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1e3);
  const monthStart = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1e3);
  const buckets = [
    { label: localize(7866, null), pairs: [] },
    { label: localize(7867, null), pairs: [] },
    { label: localize(7863, null), pairs: [] },
    { label: localize(7862, null), pairs: [] },
    { label: localize(7865, null), pairs: [] }
  ];
  for (const turn of turns) {
    const ts = new Date(turn.timestamp);
    let bucket;
    if (ts >= today) {
      bucket = buckets[0];
    } else if (ts >= yesterday) {
      bucket = buckets[1];
    } else if (ts >= weekStart) {
      bucket = buckets[2];
    } else if (ts >= monthStart) {
      bucket = buckets[3];
    } else {
      bucket = buckets[4];
    }
    const last = bucket.pairs[bucket.pairs.length - 1];
    if (turn.role === "user") {
      bucket.pairs.push({ user: turn, timestamp: turn.timestamp });
    } else if (last && !last.assistant) {
      last.assistant = turn;
    } else {
      bucket.pairs.push({ assistant: turn, timestamp: turn.timestamp });
    }
  }
  return buckets;
}
export { formatTime2, startOfDay, groupTurnsByTime, $99, VoiceTranscriptsViewPane };
