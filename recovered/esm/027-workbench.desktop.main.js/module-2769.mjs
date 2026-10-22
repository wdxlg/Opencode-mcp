// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatPetAchievementsEditor.ts
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { EditorPane } from "./module-1089.mjs";
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { $, append, trackFocus } from "./module-0075.mjs";
import { ChatPetAchievementsWidget } from "./module-2768.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IChatPetService } from "./module-2139.mjs";


// src/vs/workbench/contrib/chat/browser/chatPetAchievementsEditor.ts
var ChatPetAchievementsContextKeys = {
  focused: new RawContextKey("chatPetAchievementsFocused", false, localize(11014, null))
};

var ChatPetAchievementsEditor = class extends EditorPane {
  constructor(group2, telemetryService, themeService, storageService, instantiationService, contextKeyService, chatPetService) {
    super(ChatPetAchievementsEditor.ID, group2, telemetryService, themeService, storageService);
    this.instantiationService = instantiationService;
    this.chatPetService = chatPetService;
    this.editorDisposables = this._register(new DisposableStore());
    this.focusedContextKey = ChatPetAchievementsContextKeys.focused.bindTo(contextKeyService);
    this._register(toDisposable(() => this.focusedContextKey.reset()));
    this._register(autorun((reader) => {
      if (!this.chatPetService.enabled.read(reader) && this.input) {
        void this.group.closeEditor(this.input);
      }
    }));
  }
  static {
    this.ID = "workbench.editor.chatPetAchievements";
  }
  createEditor(parent) {
    this.editorDisposables.clear();
    this.container = append(parent, $(".chat-pet-achievements-editor"));
    const focusTracker = this.editorDisposables.add(trackFocus(this.container));
    this.editorDisposables.add(focusTracker.onDidFocus(() => this.focusedContextKey.set(true)));
    this.editorDisposables.add(focusTracker.onDidBlur(() => this.focusedContextKey.set(false)));
    this.widget = this.editorDisposables.add(this.instantiationService.createInstance(ChatPetAchievementsWidget, this.container, () => {
      if (this.input) {
        void this.group.closeEditor(this.input);
      }
    }));
  }
  async setInput(input, options3, context2, token) {
    await super.setInput(input, options3, context2, token);
    if (!this.chatPetService.enabled.get()) {
      await this.group.closeEditor(input);
      return;
    }
    if (this.dimension) {
      this.layout(this.dimension);
    }
  }
  clearInput() {
    this.focusedContextKey.set(false);
    super.clearInput();
  }
  layout(dimension) {
    this.dimension = dimension;
    if (this.container) {
      this.container.style.width = `${dimension.width}px`;
      this.container.style.height = `${dimension.height}px`;
    }
    this.widget?.layout(dimension);
  }
  focus() {
    super.focus();
    this.widget?.focus();
  }
};

ChatPetAchievementsEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IChatPetService)
], ChatPetAchievementsEditor);
export { ChatPetAchievementsContextKeys, ChatPetAchievementsEditor };
