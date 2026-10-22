// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/editor/agentHostInputCompletions.ts
import { AgentHostInputCompletionsBase } from "./module-2823.mjs";
import { DisposableMap } from "./module-0012.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { assertType } from "./module-0010.mjs";
import { ChatDynamicVariableModel } from "./module-0984.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IAgentHostService } from "./module-1107.mjs";
import { IAgentHostUntitledProvisionalSessionService } from "./module-2124.mjs";
import { IAgentHostSessionWorkingDirectoryResolver } from "./module-2107.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { applyAgentHostCompletionAction, isPolicyBlockedCompletionAction } from "./module-2821.mjs";
import { applyAgentHostSessionConfigChange } from "./module-2822.mjs";
import { IChatSessionsService, isAgentHostTarget } from "./module-0960.mjs";
import { Schemas } from "./module-0033.mjs";
import { getChatSessionType } from "./module-0961.mjs";
import { getCompletionAction } from "./module-2820.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { chatReferenceVariableEntryId, toAgentHostCompletionVariableEntry, toChatReferenceDynamicVariableValue } from "./module-0979.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0870.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/editor/agentHostInputCompletions.ts
var AgentHostInputCompletions = class extends AgentHostInputCompletionsBase {
  constructor(languageFeaturesService, _chatWidgetService, chatSessionsService, _configurationService) {
    super(languageFeaturesService, chatSessionsService);
    this._chatWidgetService = _chatWidgetService;
    this._configurationService = _configurationService;
    /** Per-scheme registrations of the Monaco completion provider. */
    this._registrations = this._register(new DisposableMap());
    this._register(CommandsRegistry.registerCommand(AgentHostInputCompletions.addReferenceCommand, (_services, arg) => {
      assertType(arg instanceof AgentHostReferenceArgument);
      arg.widget.getContrib(ChatDynamicVariableModel.ID)?.addReference({
        id: arg.id,
        range: arg.range,
        isFile: arg.isFile,
        isDirectory: arg.isDirectory,
        fullName: arg.displayName,
        data: arg.data,
        _meta: arg._meta
      });
    }));
    this._register(CommandsRegistry.registerCommand(AgentHostInputCompletions.configActionCommand, async (accessor, arg) => {
      assertType(arg instanceof AgentHostConfigActionArgument);
      const sessionResource = arg.widget.viewModel?.model.sessionResource;
      if (!sessionResource) {
        return;
      }
      const dialogService = accessor.get(IDialogService);
      const storageService = accessor.get(IStorageService);
      const services = {
        agentHostService: accessor.get(IAgentHostService),
        provisionalService: accessor.get(IAgentHostUntitledProvisionalSessionService),
        workingDirectoryResolver: accessor.get(IAgentHostSessionWorkingDirectoryResolver),
        workspaceContextService: accessor.get(IWorkspaceContextService),
        configurationService: accessor.get(IConfigurationService)
      };
      const applied = await applyAgentHostCompletionAction(arg.action, dialogService, storageService, async (config) => {
        await applyAgentHostSessionConfigChange(sessionResource, config, services);
      });
      if (applied && arg.reference) {
        arg.widget.getContrib(ChatDynamicVariableModel.ID)?.addReference({
          id: arg.reference.id,
          range: arg.reference.range,
          isFile: arg.reference.isFile,
          isDirectory: arg.reference.isDirectory,
          fullName: arg.reference.displayName,
          data: arg.reference.data,
          _meta: arg.reference._meta
        });
      }
    }));
    for (const scheme of this._chatSessionsService.getContentProviderSchemes()) {
      void this._registerForScheme(scheme);
    }
    this._register(this._chatSessionsService.onDidChangeContentProviderSchemes(({ added, removed }) => {
      for (const scheme of removed) {
        this._registrations.deleteAndDispose(scheme);
      }
      for (const scheme of added) {
        void this._registerForScheme(scheme);
      }
    }));
  }
  static {
    this.addReferenceCommand = "_chatAgentHostAddReferenceCmd";
  }
  static {
    this.configActionCommand = "_chatAgentHostConfigActionCmd";
  }
  async _registerForScheme(scheme) {
    if (!isAgentHostTarget(scheme)) {
      return;
    }
    const triggerCharacters = await this._chatSessionsService.getChatInputCompletionTriggerCharacters(scheme);
    if (!triggerCharacters || triggerCharacters.length === 0) {
      return;
    }
    if (!this._chatSessionsService.getContentProviderSchemes().includes(scheme)) {
      return;
    }
    this._registrations.set(scheme, this._registerProvider(
      { scheme: Schemas.vscodeChatInput, hasAccessToAllModels: true },
      `agentHostChatInputCompletions[${scheme}]`,
      triggerCharacters,
      scheme
    ));
  }
  _resolveContext(model, scheme) {
    const widget = this._chatWidgetService.getWidgetByInputUri(model.uri);
    if (!widget?.viewModel) {
      return void 0;
    }
    const sessionResource = widget.viewModel.model.sessionResource;
    if (getChatSessionType(sessionResource) !== scheme) {
      return void 0;
    }
    return { sessionResource, context: widget };
  }
  _buildItem(position2, item, widget) {
    const replaceRange = AgentHostInputCompletions.computeRange(position2, item);
    const attachment = item.attachment;
    switch (attachment.kind) {
      case "command": {
        const action = getCompletionAction(attachment._meta);
        if (action) {
          if (isPolicyBlockedCompletionAction(action, this._configurationService)) {
            return void 0;
          }
          const keep = item.insertText !== "";
          const label3 = item.label ?? item.insertText;
          const reference = keep ? AgentHostReferenceArgument.forCommand(widget, attachment.command, attachment.description, AgentHostInputCompletions._insertedTokenRange(replaceRange, item.insertText), attachment._meta) : void 0;
          return {
            label: { label: label3, description: attachment.description },
            insertText: item.insertText,
            filterText: label3,
            range: replaceRange,
            kind: 18 /* Text */,
            detail: attachment.description,
            command: {
              id: AgentHostInputCompletions.configActionCommand,
              title: "",
              arguments: [new AgentHostConfigActionArgument(widget, action, reference)]
            }
          };
        }
        return {
          label: { label: item.insertText, description: attachment.description },
          insertText: item.insertText,
          filterText: item.insertText,
          range: replaceRange,
          kind: 18 /* Text */,
          detail: attachment.description,
          command: {
            id: AgentHostInputCompletions.addReferenceCommand,
            title: "",
            arguments: [AgentHostReferenceArgument.forCommand(widget, attachment.command, attachment.description, AgentHostInputCompletions._insertedTokenRange(replaceRange, item.insertText), attachment._meta)]
          }
        };
      }
      case "skill": {
        const label3 = attachment.displayName ? "/" + attachment.displayName : item.insertText.trimEnd();
        return {
          label: { label: label3, description: attachment.description },
          insertText: item.insertText,
          filterText: item.insertText,
          range: replaceRange,
          kind: 18 /* Text */,
          detail: attachment.description,
          command: {
            id: AgentHostInputCompletions.addReferenceCommand,
            title: "",
            arguments: [AgentHostReferenceArgument.forSkill(widget, attachment.uri, attachment.displayName, AgentHostInputCompletions._insertedTokenRange(replaceRange, item.insertText), attachment._meta)]
          }
        };
      }
      case "chat": {
        const label3 = attachment.displayName ?? attachment.title;
        return {
          label: { label: label3, description: localize(12520, null) },
          insertText: item.insertText,
          filterText: item.insertText,
          range: replaceRange,
          kind: 21 /* Reference */,
          command: {
            id: AgentHostInputCompletions.addReferenceCommand,
            title: "",
            arguments: [AgentHostReferenceArgument.forChat(widget, attachment.uri, attachment.endTurn, attachment.title, attachment.displayName, AgentHostInputCompletions._insertedTokenRange(replaceRange, item.insertText), attachment._meta)]
          }
        };
      }
      default: {
        const label3 = attachment.displayName ?? item.insertText;
        const description = attachment.uri.path;
        return {
          label: { label: label3, description },
          insertText: item.insertText,
          filterText: item.insertText,
          range: replaceRange,
          kind: attachment.isDirectory ? 23 /* Folder */ : 20 /* File */,
          command: {
            id: AgentHostInputCompletions.addReferenceCommand,
            title: "",
            arguments: [AgentHostReferenceArgument.forResource(widget, attachment.uri, attachment.displayName, !!attachment.isDirectory, AgentHostInputCompletions._insertedRange(replaceRange, item.insertText), attachment._meta)]
          }
        };
      }
    }
  }
  static _insertedRange(replaceRange, insertText) {
    return replaceRange.replace.setEndPosition(replaceRange.replace.startLineNumber, replaceRange.replace.startColumn + insertText.length);
  }
  static _insertedTokenRange(replaceRange, insertText) {
    return this._insertedRange(replaceRange, insertText.trimEnd());
  }
};

AgentHostInputCompletions = __decorateClass([
  __decorateParam(0, ILanguageFeaturesService),
  __decorateParam(1, IChatWidgetService),
  __decorateParam(2, IChatSessionsService),
  __decorateParam(3, IConfigurationService)
], AgentHostInputCompletions);

var AgentHostReferenceArgument = class _AgentHostReferenceArgument {
  constructor(widget, id2, data, displayName, isFile2, isDirectory, range2, _meta) {
    this.widget = widget;
    this.id = id2;
    this.data = data;
    this.displayName = displayName;
    this.isFile = isFile2;
    this.isDirectory = isDirectory;
    this.range = range2;
    this._meta = _meta;
  }
  static forResource(widget, uri5, displayName, isDirectory, range2, _meta) {
    return new _AgentHostReferenceArgument(widget, uri5.toString(), uri5, displayName, !isDirectory, isDirectory, range2, _meta);
  }
  static forSkill(widget, uri5, displayName, range2, _meta) {
    const entry = toAgentHostCompletionVariableEntry("skill" /* Skill */, displayName ?? uri5.toString(), uri5, _meta);
    return new _AgentHostReferenceArgument(widget, entry.id, entry.value, displayName, false, false, range2, _meta);
  }
  static forCommand(widget, command4, description, range2, _meta) {
    const entry = toAgentHostCompletionVariableEntry("command" /* Command */, description ?? command4, command4, _meta);
    return new _AgentHostReferenceArgument(widget, entry.id, entry.value, description, false, false, range2, _meta);
  }
  static forChat(widget, uri5, endTurn2, title, displayName, range2, _meta) {
    return new _AgentHostReferenceArgument(widget, chatReferenceVariableEntryId(uri5, endTurn2), toChatReferenceDynamicVariableValue(uri5, endTurn2), displayName ?? title, false, false, range2, _meta);
  }
};

var AgentHostConfigActionArgument = class {
  constructor(widget, action, reference) {
    this.widget = widget;
    this.action = action;
    this.reference = reference;
  }
};

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(AgentHostInputCompletions, 4 /* Eventually */);
export { AgentHostInputCompletions, AgentHostReferenceArgument, AgentHostConfigActionArgument };
