// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/createSlashCommandsUsageTracker.ts
import { Disposable } from "./module-0012.mjs";
import { ChatRequestSlashCommandPart } from "./module-0987.mjs";
import { ChatContextKeys } from "./module-0965.mjs";


// src/vs/workbench/contrib/chat/browser/createSlashCommandsUsageTracker.ts
var CreateSlashCommandsUsageTracker = class _CreateSlashCommandsUsageTracker extends Disposable {
  constructor(_chatService, _storageService, _getActiveContextKeyService) {
    super();
    this._chatService = _chatService;
    this._storageService = _storageService;
    this._getActiveContextKeyService = _getActiveContextKeyService;
    this._register(this._chatService.onDidSubmitRequest((e) => {
      const message = e.message ?? this._chatService.getSession(e.chatSessionResource)?.lastRequest?.message;
      if (!message) {
        return;
      }
      for (const part of message.parts) {
        if (part.kind === ChatRequestSlashCommandPart.Kind) {
          const slash = part;
          if (_CreateSlashCommandsUsageTracker._isCreateSlashCommand(slash.slashCommand.command)) {
            this._markUsed();
            return;
          }
        }
      }
      const trimmed = message.text.trimStart();
      const match2 = /^\/(create-(?:instructions|prompt|agent|skill))(?:\s|$)/.exec(trimmed);
      if (match2 && _CreateSlashCommandsUsageTracker._isCreateSlashCommand(match2[1])) {
        this._markUsed();
      }
    }));
  }
  static {
    this._USED_CREATE_SLASH_COMMANDS_KEY = "chat.tips.usedCreateSlashCommands";
  }
  syncContextKey(contextKeyService) {
    const used = this._storageService.getBoolean(_CreateSlashCommandsUsageTracker._USED_CREATE_SLASH_COMMANDS_KEY, -1 /* APPLICATION */, false);
    ChatContextKeys.hasUsedCreateSlashCommands.bindTo(contextKeyService).set(used);
  }
  _markUsed() {
    if (this._storageService.getBoolean(_CreateSlashCommandsUsageTracker._USED_CREATE_SLASH_COMMANDS_KEY, -1 /* APPLICATION */, false)) {
      return;
    }
    this._storageService.store(_CreateSlashCommandsUsageTracker._USED_CREATE_SLASH_COMMANDS_KEY, true, -1 /* APPLICATION */, 1 /* MACHINE */);
    const contextKeyService = this._getActiveContextKeyService();
    if (contextKeyService) {
      ChatContextKeys.hasUsedCreateSlashCommands.bindTo(contextKeyService).set(true);
    }
  }
  static _isCreateSlashCommand(command4) {
    switch (command4) {
      case "create-instructions":
      case "create-prompt":
      case "create-agent":
      case "create-skill":
        return true;
      default:
        return false;
    }
  }
};
export { CreateSlashCommandsUsageTracker };
