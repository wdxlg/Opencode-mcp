// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/links/browser/terminalLinkQuickpick.ts
import { DisposableStore } from "./module-0012.mjs";
import { Sequencer, timeout } from "./module-0036.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { PickerEditorState } from "./module-1518.mjs";
import { localize } from "./module-0001.mjs";
import { TerminalLinkQuickPickEvent } from "./module-1149.mjs";
import { EventType } from "./module-0075.mjs";
import { hasKey } from "./module-0010.mjs";
import { basenameOrAuthority, dirname2 } from "./module-0034.mjs";
import { getLinkSuffix } from "./module-3407.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAccessibleViewService } from "./module-0799.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IQuickInputService } from "./module-0536.mjs";


// src/vs/workbench/contrib/terminalContrib/links/browser/terminalLinkQuickpick.ts
var TerminalLinkQuickpick = class extends DisposableStore {
  constructor(_accessibleViewService, instantiationService, _labelService, _quickInputService) {
    super();
    this._accessibleViewService = _accessibleViewService;
    this._labelService = _labelService;
    this._quickInputService = _quickInputService;
    this._editorSequencer = new Sequencer();
    this._onDidRequestMoreLinks = this.add(new Emitter());
    this.onDidRequestMoreLinks = this._onDidRequestMoreLinks.event;
    this._terminalScrollStateSaved = false;
    this._editorViewState = this.add(instantiationService.createInstance(PickerEditorState));
  }
  async show(instance2, links) {
    this._instance = instance2;
    const result = await Promise.race([links.all, timeout(500)]);
    const usingAllLinks = typeof result === "object";
    const resolvedLinks = usingAllLinks ? result : links.viewport;
    const wordPicks = resolvedLinks.wordLinks ? await this._generatePicks(resolvedLinks.wordLinks) : void 0;
    const filePicks = resolvedLinks.fileLinks ? await this._generatePicks(resolvedLinks.fileLinks) : void 0;
    const folderPicks = resolvedLinks.folderLinks ? await this._generatePicks(resolvedLinks.folderLinks) : void 0;
    const webPicks = resolvedLinks.webLinks ? await this._generatePicks(resolvedLinks.webLinks) : void 0;
    const picks = [];
    if (webPicks) {
      picks.push({ type: "separator", label: localize(20801, null) });
      picks.push(...webPicks);
    }
    if (filePicks) {
      picks.push({ type: "separator", label: localize(20797, null) });
      picks.push(...filePicks);
    }
    if (folderPicks) {
      picks.push({ type: "separator", label: localize(20798, null) });
      picks.push(...folderPicks);
    }
    if (wordPicks) {
      picks.push({ type: "separator", label: localize(20800, null) });
      picks.push(...wordPicks);
    }
    const pick = this._quickInputService.createQuickPick({ useSeparators: true });
    const disposables = new DisposableStore();
    disposables.add(pick);
    pick.items = picks;
    pick.placeholder = localize(20799, null);
    pick.sortByLabel = false;
    pick.show();
    if (pick.activeItems.length > 0) {
      this._previewItem(pick.activeItems[0]);
    }
    let accepted = false;
    if (!usingAllLinks) {
      disposables.add(Event2.once(pick.onDidChangeValue)(async () => {
        const allLinks = await links.all;
        if (accepted) {
          return;
        }
        const wordIgnoreLinks = [...allLinks.fileLinks ?? [], ...allLinks.folderLinks ?? [], ...allLinks.webLinks ?? []];
        const wordPicks2 = allLinks.wordLinks ? await this._generatePicks(allLinks.wordLinks, wordIgnoreLinks) : void 0;
        const filePicks2 = allLinks.fileLinks ? await this._generatePicks(allLinks.fileLinks) : void 0;
        const folderPicks2 = allLinks.folderLinks ? await this._generatePicks(allLinks.folderLinks) : void 0;
        const webPicks2 = allLinks.webLinks ? await this._generatePicks(allLinks.webLinks) : void 0;
        const picks2 = [];
        if (webPicks2) {
          picks2.push({ type: "separator", label: localize(20801, null) });
          picks2.push(...webPicks2);
        }
        if (filePicks2) {
          picks2.push({ type: "separator", label: localize(20797, null) });
          picks2.push(...filePicks2);
        }
        if (folderPicks2) {
          picks2.push({ type: "separator", label: localize(20798, null) });
          picks2.push(...folderPicks2);
        }
        if (wordPicks2) {
          picks2.push({ type: "separator", label: localize(20800, null) });
          picks2.push(...wordPicks2);
        }
        pick.items = picks2;
      }));
    }
    disposables.add(pick.onDidChangeActive(async () => {
      const [item] = pick.activeItems;
      this._previewItem(item);
    }));
    return new Promise((r2) => {
      disposables.add(pick.onDidHide(({ reason }) => {
        if (this._terminalScrollStateSaved) {
          const markTracker = this._instance?.xterm?.markTracker;
          if (markTracker) {
            markTracker.restoreScrollState();
            markTracker.clear();
            this._terminalScrollStateSaved = false;
          }
        }
        if (reason === 2 /* Gesture */) {
          this._editorViewState.restore();
        }
        disposables.dispose();
        if (pick.selectedItems.length === 0) {
          this._accessibleViewService.showLastProvider("terminal" /* Terminal */);
        }
        r2();
      }));
      disposables.add(Event2.once(pick.onDidAccept)(() => {
        if (this._terminalScrollStateSaved) {
          const markTracker = this._instance?.xterm?.markTracker;
          if (markTracker) {
            markTracker.restoreScrollState();
            markTracker.clear();
            this._terminalScrollStateSaved = false;
          }
        }
        accepted = true;
        const event = new TerminalLinkQuickPickEvent(EventType.CLICK);
        const activeItem = pick.activeItems?.[0];
        if (activeItem && hasKey(activeItem, { link: true })) {
          activeItem.link.activate(event, activeItem.label);
        }
        disposables.dispose();
        r2();
      }));
    });
  }
  /**
   * @param ignoreLinks Links with labels to not include in the picks.
   */
  async _generatePicks(links, ignoreLinks) {
    if (!links) {
      return;
    }
    const linkTextKeys = /* @__PURE__ */ new Set();
    const linkUriKeys = /* @__PURE__ */ new Set();
    const picks = [];
    for (const link2 of links) {
      let label3 = link2.text;
      if (!linkTextKeys.has(label3) && (!ignoreLinks || !ignoreLinks.some((e) => e.text === label3))) {
        linkTextKeys.add(label3);
        let description;
        if (hasKey(link2, { uri: true }) && link2.uri) {
          if (link2.type === "LocalFile" /* LocalFile */ || link2.type === "LocalFolderInWorkspace" /* LocalFolderInWorkspace */ || link2.type === "LocalFolderOutsideWorkspace" /* LocalFolderOutsideWorkspace */) {
            label3 = basenameOrAuthority(link2.uri);
            description = this._labelService.getUriLabel(dirname2(link2.uri), { relative: true });
          }
          if (link2.type === "LocalFile" /* LocalFile */) {
            if (link2.parsedLink?.suffix?.row !== void 0) {
              label3 += `:${link2.parsedLink.suffix.row}`;
              if (link2.parsedLink?.suffix?.rowEnd !== void 0) {
                label3 += `-${link2.parsedLink.suffix.rowEnd}`;
              }
              if (link2.parsedLink?.suffix?.col !== void 0) {
                label3 += `:${link2.parsedLink.suffix.col}`;
                if (link2.parsedLink?.suffix?.colEnd !== void 0) {
                  label3 += `-${link2.parsedLink.suffix.colEnd}`;
                }
              }
            }
          }
          if (linkUriKeys.has(label3 + "|" + (description ?? ""))) {
            continue;
          }
          linkUriKeys.add(label3 + "|" + (description ?? ""));
        }
        picks.push({ label: label3, link: link2, description });
      }
    }
    return picks.length > 0 ? picks : void 0;
  }
  _previewItem(item) {
    if (!item || !hasKey(item, { link: true }) || !item.link) {
      return;
    }
    const link2 = item.link;
    this._previewItemInTerminal(link2);
    if (!hasKey(link2, { uri: true }) || !link2.uri) {
      return;
    }
    if (link2.type !== "LocalFile" /* LocalFile */) {
      return;
    }
    this._previewItemInEditor(link2);
  }
  _previewItemInEditor(link2) {
    const linkSuffix = link2.parsedLink ? link2.parsedLink.suffix : getLinkSuffix(link2.text);
    const selection = linkSuffix?.row === void 0 ? void 0 : {
      startLineNumber: linkSuffix.row ?? 1,
      startColumn: linkSuffix.col ?? 1,
      endLineNumber: linkSuffix.rowEnd,
      endColumn: linkSuffix.colEnd
    };
    this._editorViewState.set();
    this._editorSequencer.queue(async () => {
      await this._editorViewState.openTransientEditor({
        resource: link2.uri,
        options: { preserveFocus: true, revealIfOpened: true, ignoreError: true, selection }
      });
    });
  }
  _previewItemInTerminal(link2) {
    const xterm = this._instance?.xterm;
    if (!xterm) {
      return;
    }
    if (!this._terminalScrollStateSaved) {
      xterm.markTracker.saveScrollState();
      this._terminalScrollStateSaved = true;
    }
    xterm.markTracker.revealRange(link2.range);
  }
};

TerminalLinkQuickpick = __decorateClass([
  __decorateParam(0, IAccessibleViewService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ILabelService),
  __decorateParam(3, IQuickInputService)
], TerminalLinkQuickpick);
export { TerminalLinkQuickpick };
