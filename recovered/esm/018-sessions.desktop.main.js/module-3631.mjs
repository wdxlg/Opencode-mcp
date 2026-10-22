// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/sessionChatInputToolbarDebug.ts
import { $, EventType, WindowIntervalTimer, addDisposableListener, append } from "./module-0075.mjs";
import { createDecorator } from "./module-0077.mjs";
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { Categories } from "./module-0847.mjs";
import { autorun } from "./module-0052.mjs";
import { Dialog } from "./module-1579.mjs";
import { createWorkbenchDialogOptions } from "./module-1580.mjs";
import { defaultCheckboxStyles, defaultDialogStyles, defaultInputBoxStyles } from "./module-0513.mjs";
import { Checkbox } from "./module-0549.mjs";
import { InputBox } from "./module-0600.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ILayoutService } from "./module-0551.mjs";
import { IProductService } from "./module-0875.mjs";
import { IHostService } from "./module-1118.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/sessions/contrib/chat/browser/sessionChatInputToolbarDebug.ts
var $118 = $;

var ISessionChatPillsDebugService = createDecorator("sessionChatPillsDebugService");

var SessionChatPillsDebugAvailableContext = new RawContextKey("sessionsChatPillsDebugAvailable", false, localize(4634, null));

var SHOW_SESSION_CHAT_PILLS_DEBUG_COMMAND_ID = "sessions.debug.showFakeChatPills";

function weightedRandomDebugIncrement(first2 = Math.random(), second = Math.random()) {
  return Math.min(Math.floor(first2 * 16), Math.floor(second * 16));
}

function isNonNegativeIntegerInput(raw) {
  if (raw.trim().length === 0) {
    return false;
  }
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed >= 0;
}

var SessionChatPillsDebugService = class extends Disposable {
  constructor(contextKeyService, _contextViewService, _keybindingService, _layoutService, productService, _hostService) {
    super();
    this._contextViewService = _contextViewService;
    this._keybindingService = _keybindingService;
    this._layoutService = _layoutService;
    this._hostService = _hostService;
    this._changesTimer = this._register(new MutableDisposable());
    this._availableContext = SessionChatPillsDebugAvailableContext.bindTo(contextKeyService);
    if (productService.quality !== "stable") {
      this._register(registerAction2(class extends Action2 {
        constructor() {
          super({
            id: SHOW_SESSION_CHAT_PILLS_DEBUG_COMMAND_ID,
            title: localize2(4633, "Configure Fake Session Chat UI"),
            category: Categories.Developer,
            precondition: SessionChatPillsDebugAvailableContext,
            menu: [{ id: MenuId.CommandPalette, when: SessionChatPillsDebugAvailableContext }]
          });
        }
        run(accessor) {
          return accessor.get(ISessionChatPillsDebugService).showDialog();
        }
      }));
    }
  }
  register(toolbar, banners, isActive2) {
    const disposables = new DisposableStore();
    disposables.add(autorun((reader) => {
      if (isActive2.read(reader)) {
        this._setActiveTarget(toolbar, banners);
      } else if (this._activeToolbar === toolbar) {
        this._setActiveTarget(void 0, void 0);
      }
    }));
    disposables.add(toDisposable(() => {
      if (this._activeToolbar === toolbar) {
        this._setActiveTarget(void 0, void 0);
      }
    }));
    return disposables;
  }
  clear(toolbar) {
    if (this._activeToolbar === toolbar) {
      this._setDebugData(void 0);
    }
  }
  async showDialog() {
    const toolbar = this._activeToolbar;
    if (!toolbar) {
      return;
    }
    const initial = toolbar.getDebugData();
    const state = {
      files: String(initial?.stats.files ?? 0),
      insertions: String(initial?.stats.insertions ?? 0),
      deletions: String(initial?.stats.deletions ?? 0),
      markdownFiles: initial?.markdownFiles.join("\n") ?? "",
      subagents: initial?.subagents.join("\n") ?? "",
      browsers: initial?.browsers.join("\n") ?? "",
      ciFailed: String(initial?.ciFailed ?? 0),
      ciPending: String(initial?.ciPending ?? 0),
      prFeedback: String(initial?.prFeedback ?? 0),
      agentFeedback: String(initial?.agentFeedback ?? 0),
      autoIncrementChanges: initial?.autoIncrementChanges ?? false
    };
    const disposables = new DisposableStore();
    let applyButton;
    let numericInputs = [];
    let revalidate = () => {
    };
    const dialog = disposables.add(new Dialog(
      this._layoutService.activeContainer,
      localize(4632, null),
      [
        localize(4616, null),
        localize(4623, null),
        localize(4620, null)
      ],
      createWorkbenchDialogOptions({
        type: "none",
        extraClasses: ["session-chat-pills-debug-dialog"],
        cancelId: 2,
        dialogStyles: defaultDialogStyles,
        buttonOptions: [{
          styleButton: (button) => {
            applyButton = button;
            revalidate();
          }
        }],
        renderBody: (container2) => {
          const form = append(container2, $118(".session-chat-pills-debug-form"));
          append(form, $118("p.session-chat-pills-debug-description", void 0, localize(4625, null)));
          const stats = append(form, $118(".session-chat-pills-debug-stats"));
          const files = this._createInput(stats, disposables, localize(4626, null), state.files, (value2) => state.files = value2, true, () => revalidate());
          const insertions = this._createInput(stats, disposables, localize(4628, null), state.insertions, (value2) => state.insertions = value2, true, () => revalidate());
          const deletions = this._createInput(stats, disposables, localize(4624, null), state.deletions, (value2) => state.deletions = value2, true, () => revalidate());
          numericInputs = [files, insertions, deletions];
          const autoIncrementLabel = localize(4618, null);
          const autoIncrementRow = append(form, $118(".session-chat-pills-debug-checkbox-row"));
          const autoIncrementCheckbox = disposables.add(new Checkbox(autoIncrementLabel, state.autoIncrementChanges, defaultCheckboxStyles));
          append(autoIncrementRow, autoIncrementCheckbox.domNode);
          const autoIncrementLabelElement = append(autoIncrementRow, $118("span.session-chat-pills-debug-checkbox-label", void 0, autoIncrementLabel));
          const setAutoIncrement = (value2) => {
            autoIncrementCheckbox.checked = value2;
            state.autoIncrementChanges = value2;
          };
          disposables.add(autoIncrementCheckbox.onChange(() => state.autoIncrementChanges = autoIncrementCheckbox.checked));
          disposables.add(addDisposableListener(autoIncrementLabelElement, EventType.CLICK, () => setAutoIncrement(!autoIncrementCheckbox.checked)));
          this._createInput(form, disposables, localize(4617, null), state.markdownFiles, (value2) => state.markdownFiles = value2);
          this._createInput(form, disposables, localize(4631, null), state.subagents, (value2) => state.subagents = value2);
          this._createInput(form, disposables, localize(4619, null), state.browsers, (value2) => state.browsers = value2);
          append(form, $118("h3.session-chat-pills-debug-heading", void 0, localize(4627, null)));
          const bannerStats = append(form, $118(".session-chat-pills-debug-banner-stats"));
          const ciFailed = this._createInput(bannerStats, disposables, localize(4621, null), state.ciFailed, (value2) => state.ciFailed = value2, true, () => revalidate());
          const ciPending = this._createInput(bannerStats, disposables, localize(4622, null), state.ciPending, (value2) => state.ciPending = value2, true, () => revalidate());
          const prFeedback = this._createInput(bannerStats, disposables, localize(4630, null), state.prFeedback, (value2) => state.prFeedback = value2, true, () => revalidate());
          const agentFeedback = this._createInput(bannerStats, disposables, localize(4615, null), state.agentFeedback, (value2) => state.agentFeedback = value2, true, () => revalidate());
          numericInputs = [...numericInputs, ciFailed, ciPending, prFeedback, agentFeedback];
          revalidate = () => {
            const valid2 = numericInputs.every((input) => input.validate() !== 3 /* ERROR */);
            if (applyButton) {
              applyButton.enabled = valid2;
            }
          };
          revalidate();
        }
      }, this._keybindingService, this._layoutService, this._hostService)
    ));
    try {
      const result = await dialog.show();
      if (this._activeToolbar !== toolbar) {
        return;
      }
      if (result.button === 1) {
        this._setDebugData(void 0);
        return;
      }
      if (result.button !== 0 || numericInputs.some((input) => input.validate() === 3 /* ERROR */)) {
        return;
      }
      this._setDebugData({
        stats: {
          files: Number(state.files),
          insertions: Number(state.insertions),
          deletions: Number(state.deletions)
        },
        markdownFiles: this._parseList(state.markdownFiles),
        subagents: this._parseList(state.subagents),
        browsers: this._parseList(state.browsers),
        ciFailed: Number(state.ciFailed),
        ciPending: Number(state.ciPending),
        prFeedback: Number(state.prFeedback),
        agentFeedback: Number(state.agentFeedback),
        autoIncrementChanges: state.autoIncrementChanges
      });
    } finally {
      disposables.dispose();
    }
  }
  _createInput(container2, disposables, label3, value2, onChange, numeric = false, onDidChange) {
    const row = append(container2, $118(".session-chat-pills-debug-row"));
    append(row, $118("span.session-chat-pills-debug-label", void 0, label3));
    const input = disposables.add(new InputBox(append(row, $118(".session-chat-pills-debug-input")), this._contextViewService, {
      inputBoxStyles: defaultInputBoxStyles,
      ariaLabel: label3,
      type: numeric ? "number" : "text",
      flexibleHeight: !numeric,
      flexibleMaxHeight: 100,
      validationOptions: numeric ? {
        validation: (raw) => {
          return isNonNegativeIntegerInput(raw) ? null : { content: localize(4629, null), type: 3 /* ERROR */ };
        }
      } : void 0
    }));
    input.value = value2;
    if (numeric) {
      input.inputElement.min = "0";
      input.inputElement.step = "1";
    }
    disposables.add(input.onDidChange((changed) => {
      onChange(changed);
      onDidChange?.();
    }));
    return input;
  }
  _parseList(value2) {
    return value2.split(/[\n,]/).map((item) => item.trim()).filter((item) => item.length > 0);
  }
  _setDebugData(data) {
    this._changesTimer.clear();
    this._debugData = data;
    this._applyDebugData(data);
    if (data?.autoIncrementChanges && this._activeToolbar) {
      const timer = new WindowIntervalTimer(this._activeToolbar.element);
      this._changesTimer.value = timer;
      timer.cancelAndSet(() => this._incrementChanges(), 2e3);
    }
  }
  _applyDebugData(data) {
    this._activeToolbar?.setDebugData(data);
    this._activeBanners?.setDebugData(data);
  }
  _incrementChanges() {
    const data = this._debugData;
    if (!data?.autoIncrementChanges || !this._activeToolbar) {
      this._changesTimer.clear();
      return;
    }
    this._debugData = {
      ...data,
      stats: {
        ...data.stats,
        insertions: data.stats.insertions + weightedRandomDebugIncrement(),
        deletions: data.stats.deletions + weightedRandomDebugIncrement()
      }
    };
    this._applyDebugData(this._debugData);
  }
  _setActiveTarget(toolbar, banners) {
    if (this._activeToolbar === toolbar && this._activeBanners === banners) {
      return;
    }
    this._setDebugData(void 0);
    this._activeToolbar = toolbar;
    this._activeBanners = banners;
    this._availableContext.set(!!toolbar);
  }
};

SessionChatPillsDebugService = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IContextViewService),
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, ILayoutService),
  __decorateParam(4, IProductService),
  __decorateParam(5, IHostService)
], SessionChatPillsDebugService);

registerSingleton(ISessionChatPillsDebugService, SessionChatPillsDebugService, 1 /* Delayed */);
export { weightedRandomDebugIncrement, isNonNegativeIntegerInput, $118, ISessionChatPillsDebugService, SessionChatPillsDebugAvailableContext, SHOW_SESSION_CHAT_PILLS_DEBUG_COMMAND_ID, SessionChatPillsDebugService };
