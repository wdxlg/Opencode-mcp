// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/tools/languageModelToolsConfirmationService.ts
import { localize } from "./module-0001.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Lazy } from "./module-0028.mjs";
import { LRUCache } from "./module-0008.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/chat/browser/tools/languageModelToolsConfirmationService.ts
var RUN_WITHOUT_APPROVAL = localize(11707, null);

var CONTINUE_WITHOUT_REVIEWING_RESULTS = localize(11705, null);

var GenericConfirmStore = class extends Disposable {
  constructor(_storageKey, _instantiationService) {
    super();
    this._storageKey = _storageKey;
    this._instantiationService = _instantiationService;
    this._memoryStore = /* @__PURE__ */ new Map();
    this._workspaceStore = new Lazy(() => this._register(this._instantiationService.createInstance(ToolConfirmStore, 1 /* WORKSPACE */, this._storageKey)));
    this._profileStore = new Lazy(() => this._register(this._instantiationService.createInstance(ToolConfirmStore, 0 /* PROFILE */, this._storageKey)));
  }
  setAutoConfirmation(id2, scope, label3, args2) {
    this._workspaceStore.value.setAutoConfirm(id2, void 0);
    this._profileStore.value.setAutoConfirm(id2, void 0);
    this._memoryStore.delete(id2);
    const entry = { confirmed: true, label: label3, arguments: args2 };
    if (scope === "workspace") {
      this._workspaceStore.value.setAutoConfirm(id2, entry);
    } else if (scope === "profile") {
      this._profileStore.value.setAutoConfirm(id2, entry);
    } else if (scope === "session") {
      this._memoryStore.set(id2, entry);
    }
  }
  getAutoConfirmation(id2) {
    if (this._workspaceStore.value.getAutoConfirm(id2)) {
      return "workspace";
    }
    if (this._profileStore.value.getAutoConfirm(id2)) {
      return "profile";
    }
    if (this._memoryStore.has(id2)) {
      return "session";
    }
    return "never";
  }
  getAutoConfirmationIn(id2, scope) {
    if (scope === "workspace") {
      return !!this._workspaceStore.value.getAutoConfirm(id2);
    } else if (scope === "profile") {
      return !!this._profileStore.value.getAutoConfirm(id2);
    } else {
      return this._memoryStore.has(id2);
    }
  }
  getLabel(id2) {
    return this._workspaceStore.value.getAutoConfirm(id2)?.label ?? this._profileStore.value.getAutoConfirm(id2)?.label ?? this._memoryStore.get(id2)?.label;
  }
  getArguments(id2) {
    return this._workspaceStore.value.getAutoConfirm(id2)?.arguments ?? this._profileStore.value.getAutoConfirm(id2)?.arguments ?? this._memoryStore.get(id2)?.arguments;
  }
  reset() {
    this._workspaceStore.value.reset();
    this._profileStore.value.reset();
    this._memoryStore.clear();
  }
  checkAutoConfirmation(id2) {
    if (this._workspaceStore.value.getAutoConfirm(id2)) {
      return { type: 3 /* LmServicePerTool */, scope: "workspace" };
    }
    if (this._profileStore.value.getAutoConfirm(id2)) {
      return { type: 3 /* LmServicePerTool */, scope: "profile" };
    }
    if (this._memoryStore.has(id2)) {
      return { type: 3 /* LmServicePerTool */, scope: "session" };
    }
    return void 0;
  }
  getAllConfirmed() {
    const all = /* @__PURE__ */ new Set();
    for (const key3 of this._workspaceStore.value.getAll()) {
      all.add(key3);
    }
    for (const key3 of this._profileStore.value.getAll()) {
      all.add(key3);
    }
    for (const key3 of this._memoryStore.keys()) {
      all.add(key3);
    }
    return all;
  }
};

var ToolConfirmStore = class extends Disposable {
  constructor(_scope, _storageKey, storageService) {
    super();
    this._scope = _scope;
    this._storageKey = _storageKey;
    this.storageService = storageService;
    this._autoConfirmTools = new LRUCache(100);
    this._didChange = false;
    const raw = storageService.get(this._storageKey, this._scope);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const key3 of parsed) {
            this._autoConfirmTools.set(key3, { confirmed: true });
          }
        } else if (typeof parsed === "object" && parsed !== null) {
          for (const [key3, value2] of Object.entries(parsed)) {
            if (typeof value2 === "object" && value2 !== null) {
              const obj = value2;
              this._autoConfirmTools.set(key3, { confirmed: true, label: obj.label, arguments: obj.arguments });
            } else {
              this._autoConfirmTools.set(key3, { confirmed: true, label: typeof value2 === "string" ? value2 : void 0 });
            }
          }
        }
      } catch {
      }
    }
    this._register(storageService.onWillSaveState(() => {
      if (this._didChange) {
        const data = {};
        for (const [key3, entry] of this._autoConfirmTools) {
          if (entry.arguments) {
            data[key3] = { label: entry.label, arguments: entry.arguments };
          } else {
            data[key3] = entry.label ?? true;
          }
        }
        this.storageService.store(this._storageKey, JSON.stringify(data), this._scope, 1 /* MACHINE */);
        this._didChange = false;
      }
    }));
  }
  reset() {
    this._autoConfirmTools.clear();
    this._didChange = true;
  }
  getAutoConfirm(id2) {
    const entry = this._autoConfirmTools.get(id2);
    if (entry) {
      this._didChange = true;
      return entry;
    }
    return void 0;
  }
  setAutoConfirm(id2, entry) {
    if (!entry) {
      this._autoConfirmTools.delete(id2);
    } else {
      this._autoConfirmTools.set(id2, entry);
    }
    this._didChange = true;
  }
  getAll() {
    return [...this._autoConfirmTools.keys()];
  }
};

ToolConfirmStore = __decorateClass([
  __decorateParam(2, IStorageService)
], ToolConfirmStore);

var LanguageModelToolsConfirmationService = class extends Disposable {
  constructor(_instantiationService, _quickInputService, _dialogService, _configurationService) {
    super();
    this._instantiationService = _instantiationService;
    this._quickInputService = _quickInputService;
    this._dialogService = _dialogService;
    this._configurationService = _configurationService;
    this._contributions = /* @__PURE__ */ new Map();
    this._preExecutionToolConfirmStore = this._register(new GenericConfirmStore("chat/autoconfirm", this._instantiationService));
    this._postExecutionToolConfirmStore = this._register(new GenericConfirmStore("chat/autoconfirm-post", this._instantiationService));
    this._preExecutionServerConfirmStore = this._register(new GenericConfirmStore("chat/servers/autoconfirm", this._instantiationService));
    this._postExecutionServerConfirmStore = this._register(new GenericConfirmStore("chat/servers/autoconfirm-post", this._instantiationService));
    this._combinationConfirmStore = this._register(new GenericConfirmStore("chat/autoconfirm-combination", this._instantiationService));
  }
  getPreConfirmAction(ref) {
    const contribution = this._contributions.get(ref.toolId);
    if (contribution?.getPreConfirmAction) {
      const result = contribution.getPreConfirmAction(ref);
      if (result) {
        return result;
      }
    }
    if (contribution && contribution.canUseDefaultApprovals === false) {
      return void 0;
    }
    if (ref.combination) {
      const combinationResult = this._combinationConfirmStore.checkAutoConfirmation(ref.combination.key);
      if (combinationResult) {
        return combinationResult;
      }
    }
    const toolResult = this._preExecutionToolConfirmStore.checkAutoConfirmation(ref.toolId);
    if (toolResult) {
      return toolResult;
    }
    if (ref.source.type === "mcp") {
      const serverResult = this._preExecutionServerConfirmStore.checkAutoConfirmation(ref.source.definitionId);
      if (serverResult) {
        return serverResult;
      }
    }
    return void 0;
  }
  getPostConfirmAction(ref) {
    const contribution = this._contributions.get(ref.toolId);
    if (contribution?.getPostConfirmAction) {
      const result = contribution.getPostConfirmAction(ref);
      if (result) {
        return result;
      }
    }
    if (contribution && contribution.canUseDefaultApprovals === false) {
      return void 0;
    }
    const toolResult = this._postExecutionToolConfirmStore.checkAutoConfirmation(ref.toolId);
    if (toolResult) {
      return toolResult;
    }
    if (ref.source.type === "mcp") {
      const serverResult = this._postExecutionServerConfirmStore.checkAutoConfirmation(ref.source.definitionId);
      if (serverResult) {
        return serverResult;
      }
    }
    return void 0;
  }
  getPreConfirmActions(ref) {
    const actions = [];
    const contribution = this._contributions.get(ref.toolId);
    if (contribution?.getPreConfirmActions) {
      actions.push(...contribution.getPreConfirmActions(ref));
    }
    if (contribution && contribution.canUseDefaultApprovals === false) {
      return actions;
    }
    if (ref.combination) {
      const { label: combinationLabel, key: combinationKey, arguments: combinationArgs } = ref.combination;
      actions.push(
        {
          label: localize(11672, null, combinationLabel),
          detail: localize(11673, null),
          divider: !!actions.length,
          scope: "session",
          select: async () => {
            this._combinationConfirmStore.setAutoConfirmation(combinationKey, "session", combinationLabel, combinationArgs);
            return true;
          }
        },
        {
          label: localize(11674, null, combinationLabel),
          detail: localize(11675, null),
          scope: "workspace",
          select: async () => {
            this._combinationConfirmStore.setAutoConfirmation(combinationKey, "workspace", combinationLabel, combinationArgs);
            return true;
          }
        },
        {
          label: localize(11670, null, combinationLabel),
          detail: localize(11671, null),
          scope: "profile",
          select: async () => {
            this._combinationConfirmStore.setAutoConfirmation(combinationKey, "profile", combinationLabel, combinationArgs);
            return true;
          }
        }
      );
    }
    actions.push(
      {
        label: localize(11692, null),
        detail: localize(11695, null),
        divider: !!actions.length,
        scope: "session",
        select: async () => {
          this._preExecutionToolConfirmStore.setAutoConfirmation(ref.toolId, "session");
          return true;
        }
      },
      {
        label: localize(11696, null),
        detail: localize(11699, null),
        scope: "workspace",
        select: async () => {
          this._preExecutionToolConfirmStore.setAutoConfirmation(ref.toolId, "workspace");
          return true;
        }
      },
      {
        label: localize(11676, null),
        detail: localize(11679, null),
        scope: "profile",
        select: async () => {
          this._preExecutionToolConfirmStore.setAutoConfirmation(ref.toolId, "profile");
          return true;
        }
      }
    );
    if (ref.source.type === "mcp") {
      const { serverLabel, definitionId } = ref.source;
      actions.push(
        {
          label: localize(11684, null, serverLabel),
          detail: localize(11687, null),
          divider: true,
          scope: "session",
          select: async () => {
            this._preExecutionServerConfirmStore.setAutoConfirmation(definitionId, "session");
            return true;
          }
        },
        {
          label: localize(11688, null, serverLabel),
          detail: localize(11691, null),
          scope: "workspace",
          select: async () => {
            this._preExecutionServerConfirmStore.setAutoConfirmation(definitionId, "workspace");
            return true;
          }
        },
        {
          label: localize(11680, null, serverLabel),
          detail: localize(11683, null),
          scope: "profile",
          select: async () => {
            this._preExecutionServerConfirmStore.setAutoConfirmation(definitionId, "profile");
            return true;
          }
        }
      );
    }
    return actions;
  }
  getPostConfirmActions(ref) {
    const actions = [];
    const contribution = this._contributions.get(ref.toolId);
    if (contribution?.getPostConfirmActions) {
      actions.push(...contribution.getPostConfirmActions(ref));
    }
    if (contribution && contribution.canUseDefaultApprovals === false) {
      return actions;
    }
    actions.push(
      {
        label: localize(11693, null),
        detail: localize(11694, null),
        divider: !!actions.length,
        scope: "session",
        select: async () => {
          this._postExecutionToolConfirmStore.setAutoConfirmation(ref.toolId, "session");
          return true;
        }
      },
      {
        label: localize(11697, null),
        detail: localize(11698, null),
        scope: "workspace",
        select: async () => {
          this._postExecutionToolConfirmStore.setAutoConfirmation(ref.toolId, "workspace");
          return true;
        }
      },
      {
        label: localize(11677, null),
        detail: localize(11678, null),
        scope: "profile",
        select: async () => {
          this._postExecutionToolConfirmStore.setAutoConfirmation(ref.toolId, "profile");
          return true;
        }
      }
    );
    if (ref.source.type === "mcp") {
      const { serverLabel, definitionId } = ref.source;
      actions.push(
        {
          label: localize(11685, null, serverLabel),
          detail: localize(11686, null),
          divider: true,
          scope: "session",
          select: async () => {
            this._postExecutionServerConfirmStore.setAutoConfirmation(definitionId, "session");
            return true;
          }
        },
        {
          label: localize(11689, null, serverLabel),
          detail: localize(11690, null),
          scope: "workspace",
          select: async () => {
            this._postExecutionServerConfirmStore.setAutoConfirmation(definitionId, "workspace");
            return true;
          }
        },
        {
          label: localize(11681, null, serverLabel),
          detail: localize(11682, null),
          scope: "profile",
          select: async () => {
            this._postExecutionServerConfirmStore.setAutoConfirmation(definitionId, "profile");
            return true;
          }
        }
      );
    }
    return actions;
  }
  registerConfirmationContribution(toolName, contribution) {
    this._contributions.set(toolName, contribution);
    return {
      dispose: () => {
        this._contributions.delete(toolName);
      }
    };
  }
  toolCanManageConfirmation(tool) {
    return !!tool.canRequestPreApproval || !!tool.canRequestPostApproval || this._contributions.has(tool.id) || !!this._preExecutionToolConfirmStore.checkAutoConfirmation(tool.id) || !!this._postExecutionToolConfirmStore.checkAutoConfirmation(tool.id) || this._hasCombinationApprovalsForTool(tool.id);
  }
  _hasCombinationApprovalsForTool(toolId) {
    const prefix = toolId + ":combination:";
    for (const key3 of this._combinationConfirmStore.getAllConfirmed()) {
      if (key3.startsWith(prefix)) {
        return true;
      }
    }
    return false;
  }
  _getCombinationApprovalsForTool(toolId, scope) {
    const prefix = toolId + ":combination:";
    const results = [];
    for (const key3 of this._combinationConfirmStore.getAllConfirmed()) {
      if (key3.startsWith(prefix) && this._combinationConfirmStore.getAutoConfirmationIn(key3, scope)) {
        const label3 = this._combinationConfirmStore.getLabel(key3) ?? key3;
        const args2 = this._combinationConfirmStore.getArguments(key3);
        results.push({ key: key3, label: label3, arguments: args2 });
      }
    }
    return results;
  }
  manageConfirmationPreferences(tools, options3) {
    const viewArgsButton = {
      iconClass: ThemeIcon.asClassName(Codicon.info),
      tooltip: localize(11708, null)
    };
    const trackServerTool = (serverId, label3, toolId, serversWithTools2) => {
      if (!serversWithTools2.has(serverId)) {
        serversWithTools2.set(serverId, { label: label3, tools: /* @__PURE__ */ new Set() });
      }
      serversWithTools2.get(serverId).tools.add(toolId);
    };
    const addServerToolFromSource = (source, toolId, serversWithTools2) => {
      if (source.type === "mcp") {
        trackServerTool(source.definitionId, source.serverLabel || source.label, toolId, serversWithTools2);
      } else if (source.type === "extension") {
        trackServerTool(source.extensionId.value, source.label, toolId, serversWithTools2);
      }
    };
    const relevantTools = /* @__PURE__ */ new Set();
    const serversWithTools = /* @__PURE__ */ new Map();
    for (const tool of tools) {
      if (tool.canRequestPreApproval || tool.canRequestPostApproval || this._contributions.has(tool.id)) {
        relevantTools.add(tool.id);
        addServerToolFromSource(tool.source, tool.id, serversWithTools);
      }
    }
    for (const id2 of this._preExecutionToolConfirmStore.getAllConfirmed()) {
      if (!relevantTools.has(id2)) {
        const tool = tools.find((t2) => t2.id === id2);
        if (tool) {
          relevantTools.add(id2);
          addServerToolFromSource(tool.source, id2, serversWithTools);
        }
      }
    }
    for (const id2 of this._postExecutionToolConfirmStore.getAllConfirmed()) {
      if (!relevantTools.has(id2)) {
        const tool = tools.find((t2) => t2.id === id2);
        if (tool) {
          relevantTools.add(id2);
          addServerToolFromSource(tool.source, id2, serversWithTools);
        }
      }
    }
    for (const tool of tools) {
      if (!relevantTools.has(tool.id) && this._hasCombinationApprovalsForTool(tool.id)) {
        relevantTools.add(tool.id);
        addServerToolFromSource(tool.source, tool.id, serversWithTools);
      }
    }
    if (relevantTools.size === 0) {
      return;
    }
    let currentScope = options3?.defaultScope ?? "workspace";
    const buildTreeItems = () => {
      const treeItems = [];
      for (const [serverId, serverInfo] of serversWithTools) {
        const serverChildren = [];
        const hasAnyPre = Array.from(serverInfo.tools).some((toolId) => {
          const tool = tools.find((t2) => t2.id === toolId);
          return tool?.canRequestPreApproval;
        });
        const hasAnyPost = Array.from(serverInfo.tools).some((toolId) => {
          const tool = tools.find((t2) => t2.id === toolId);
          return tool?.canRequestPostApproval;
        });
        const serverPreConfirmed = this._preExecutionServerConfirmStore.getAutoConfirmationIn(serverId, currentScope);
        const serverPostConfirmed = this._postExecutionServerConfirmStore.getAutoConfirmationIn(serverId, currentScope);
        for (const toolId of serverInfo.tools) {
          const tool = tools.find((t2) => t2.id === toolId);
          if (!tool) {
            continue;
          }
          const toolChildren = [];
          const hasPre = !serverPreConfirmed && (tool.canRequestPreApproval || this._preExecutionToolConfirmStore.getAutoConfirmationIn(tool.id, currentScope));
          const hasPost = !serverPostConfirmed && (tool.canRequestPostApproval || this._postExecutionToolConfirmStore.getAutoConfirmationIn(tool.id, currentScope));
          if (hasPre && hasPost) {
            toolChildren.push({
              type: "tool-pre",
              toolId: tool.id,
              label: RUN_WITHOUT_APPROVAL,
              checked: this._preExecutionToolConfirmStore.getAutoConfirmationIn(tool.id, currentScope)
            });
            toolChildren.push({
              type: "tool-post",
              toolId: tool.id,
              label: CONTINUE_WITHOUT_REVIEWING_RESULTS,
              checked: this._postExecutionToolConfirmStore.getAutoConfirmationIn(tool.id, currentScope)
            });
          }
          const combinationApprovals = this._getCombinationApprovalsForTool(tool.id, currentScope);
          for (const { key: key3, label: label3, arguments: args2 } of combinationApprovals) {
            toolChildren.push({
              type: "combination",
              toolId: tool.id,
              combinationKey: key3,
              combinationArgs: args2,
              label: label3,
              checked: true,
              buttons: args2 ? [viewArgsButton] : void 0
            });
          }
          const preApproval = this._preExecutionToolConfirmStore.getAutoConfirmationIn(tool.id, currentScope);
          const postApproval = this._postExecutionToolConfirmStore.getAutoConfirmationIn(tool.id, currentScope);
          let checked;
          let description;
          if (hasPre && hasPost) {
            checked = preApproval && postApproval ? true : !preApproval && !postApproval ? false : "mixed";
          } else if (hasPre) {
            checked = preApproval;
            description = RUN_WITHOUT_APPROVAL;
          } else if (hasPost) {
            checked = postApproval;
            description = CONTINUE_WITHOUT_REVIEWING_RESULTS;
          } else if (toolChildren.length > 0) {
            checked = false;
          } else {
            continue;
          }
          if (checked === false && toolChildren.length === 0 && !tool.canRequestPreApproval && !tool.canRequestPostApproval) {
            continue;
          }
          serverChildren.push({
            type: "tool",
            toolId: tool.id,
            label: tool.displayName || tool.id,
            description,
            checked,
            collapsed: true,
            children: toolChildren.length > 0 ? toolChildren : void 0
          });
        }
        serverChildren.sort((a, b) => a.label.localeCompare(b.label));
        if (hasAnyPost) {
          serverChildren.unshift({
            type: "server-post",
            serverId,
            iconClass: ThemeIcon.asClassName(Codicon.play),
            label: localize(11704, null),
            checked: serverPostConfirmed
          });
        }
        if (hasAnyPre) {
          serverChildren.unshift({
            type: "server-pre",
            serverId,
            iconClass: ThemeIcon.asClassName(Codicon.play),
            label: localize(11706, null),
            checked: serverPreConfirmed
          });
        }
        const serverHasPre = this._preExecutionServerConfirmStore.getAutoConfirmationIn(serverId, currentScope);
        const serverHasPost = this._postExecutionServerConfirmStore.getAutoConfirmationIn(serverId, currentScope);
        let serverChecked;
        if (hasAnyPre && hasAnyPost) {
          serverChecked = serverHasPre && serverHasPost ? true : !serverHasPre && !serverHasPost ? false : "mixed";
        } else if (hasAnyPre) {
          serverChecked = serverHasPre;
        } else if (hasAnyPost) {
          serverChecked = serverHasPost;
        } else {
          serverChecked = false;
        }
        const existingItem = quickTree.itemTree.find((i2) => i2.serverId === serverId);
        treeItems.push({
          type: "server",
          serverId,
          label: serverInfo.label,
          checked: serverChecked,
          children: serverChildren,
          collapsed: existingItem ? quickTree.isCollapsed(existingItem) : true,
          pickable: false
        });
      }
      const sortedTools = tools.slice().sort((a, b) => a.displayName.localeCompare(b.displayName));
      for (const tool of sortedTools) {
        if (!relevantTools.has(tool.id)) {
          continue;
        }
        if (tool.source.type === "mcp" || tool.source.type === "extension") {
          continue;
        }
        const contributed = this._contributions.get(tool.id);
        const toolChildren = [];
        const manageActions = contributed?.getManageActions?.();
        if (manageActions) {
          toolChildren.push(...manageActions.map((action) => ({
            type: "manage",
            ...action
          })));
        }
        let checked = false;
        let description;
        let pickable = false;
        if (contributed?.canUseDefaultApprovals !== false) {
          pickable = true;
          const hasPre = tool.canRequestPreApproval || this._preExecutionToolConfirmStore.getAutoConfirmationIn(tool.id, currentScope);
          const hasPost = tool.canRequestPostApproval || this._postExecutionToolConfirmStore.getAutoConfirmationIn(tool.id, currentScope);
          if (hasPre && hasPost) {
            toolChildren.push({
              type: "tool-pre",
              toolId: tool.id,
              label: RUN_WITHOUT_APPROVAL,
              checked: this._preExecutionToolConfirmStore.getAutoConfirmationIn(tool.id, currentScope)
            });
            toolChildren.push({
              type: "tool-post",
              toolId: tool.id,
              label: CONTINUE_WITHOUT_REVIEWING_RESULTS,
              checked: this._postExecutionToolConfirmStore.getAutoConfirmationIn(tool.id, currentScope)
            });
          }
          const combinationApprovals = this._getCombinationApprovalsForTool(tool.id, currentScope);
          for (const { key: key3, label: label3, arguments: args2 } of combinationApprovals) {
            toolChildren.push({
              type: "combination",
              toolId: tool.id,
              combinationKey: key3,
              combinationArgs: args2,
              label: label3,
              checked: true,
              buttons: args2 ? [viewArgsButton] : void 0
            });
          }
          const preApproval = this._preExecutionToolConfirmStore.getAutoConfirmationIn(tool.id, currentScope);
          const postApproval = this._postExecutionToolConfirmStore.getAutoConfirmationIn(tool.id, currentScope);
          if (hasPre && hasPost) {
            checked = preApproval && postApproval ? true : !preApproval && !postApproval ? false : "mixed";
          } else if (hasPre) {
            checked = preApproval;
            description = RUN_WITHOUT_APPROVAL;
          } else if (hasPost) {
            checked = postApproval;
            description = CONTINUE_WITHOUT_REVIEWING_RESULTS;
          } else {
            checked = false;
          }
        }
        if (checked === false && toolChildren.length === 0 && !tool.canRequestPreApproval && !tool.canRequestPostApproval && !this._contributions.has(tool.id)) {
          continue;
        }
        treeItems.push({
          type: "tool",
          toolId: tool.id,
          label: tool.displayName || tool.id,
          description,
          checked,
          pickable,
          collapsed: tools.length > 1,
          children: toolChildren.length > 0 ? toolChildren : void 0
        });
      }
      return treeItems;
    };
    const disposables = new DisposableStore();
    const quickTree = disposables.add(this._quickInputService.createQuickTree());
    quickTree.ignoreFocusOut = true;
    quickTree.sortByLabel = false;
    if (currentScope !== "session") {
      const scopeButton = {
        iconClass: ThemeIcon.asClassName(Codicon.folder),
        tooltip: localize(11709, null),
        toggle: { checked: currentScope === "workspace" },
        location: 3 /* Input */
      };
      quickTree.buttons = [scopeButton];
      disposables.add(quickTree.onDidTriggerButton((button) => {
        if (button === scopeButton) {
          currentScope = currentScope === "workspace" ? "profile" : "workspace";
          updatePlaceholder();
          quickTree.setItemTree(buildTreeItems());
        }
      }));
    }
    const updatePlaceholder = () => {
      if (currentScope === "session") {
        quickTree.placeholder = localize(11702, null);
      } else {
        quickTree.placeholder = currentScope === "workspace" ? localize(11703, null) : localize(11701, null);
      }
    };
    updatePlaceholder();
    quickTree.setItemTree(buildTreeItems());
    disposables.add(quickTree.onDidChangeCheckboxState((item) => {
      const newState = item.checked ? currentScope : "never";
      if (item.type === "server" && item.serverId) {
        const serverInfo = serversWithTools.get(item.serverId);
        if (serverInfo) {
          this._preExecutionServerConfirmStore.setAutoConfirmation(item.serverId, newState);
          this._postExecutionServerConfirmStore.setAutoConfirmation(item.serverId, newState);
        }
      } else if (item.type === "tool" && item.toolId) {
        const tool = tools.find((t2) => t2.id === item.toolId);
        if (tool?.canRequestPostApproval || newState === "never") {
          this._postExecutionToolConfirmStore.setAutoConfirmation(item.toolId, newState);
        }
        if (tool?.canRequestPreApproval || newState === "never") {
          this._preExecutionToolConfirmStore.setAutoConfirmation(item.toolId, newState);
        }
        if (newState === "never") {
          for (const key3 of this._combinationConfirmStore.getAllConfirmed()) {
            if (key3.startsWith(item.toolId + ":combination:")) {
              this._combinationConfirmStore.setAutoConfirmation(key3, "never");
            }
          }
        }
        quickTree.setItemTree(buildTreeItems());
      } else if (item.type === "tool-pre" && item.toolId) {
        this._preExecutionToolConfirmStore.setAutoConfirmation(item.toolId, newState);
      } else if (item.type === "tool-post" && item.toolId) {
        this._postExecutionToolConfirmStore.setAutoConfirmation(item.toolId, newState);
      } else if (item.type === "server-pre" && item.serverId) {
        this._preExecutionServerConfirmStore.setAutoConfirmation(item.serverId, newState);
        quickTree.setItemTree(buildTreeItems());
      } else if (item.type === "server-post" && item.serverId) {
        this._postExecutionServerConfirmStore.setAutoConfirmation(item.serverId, newState);
        quickTree.setItemTree(buildTreeItems());
      } else if (item.type === "manage") {
        item.onDidChangeChecked?.(!!item.checked);
      } else if (item.type === "combination" && item.combinationKey) {
        this._combinationConfirmStore.setAutoConfirmation(item.combinationKey, newState, item.label, item.combinationArgs);
        quickTree.setItemTree(buildTreeItems());
      }
    }));
    disposables.add(quickTree.onDidTriggerItemButton((i2) => {
      if (i2.item.type === "manage") {
        i2.item.onDidTriggerItemButton?.(i2.button);
      } else if (i2.item.type === "combination" && i2.button === viewArgsButton && i2.item.combinationArgs) {
        this._dialogService.prompt({
          message: localize(11700, null),
          buttons: [],
          custom: {
            markdownDetails: [{
              markdown: new MarkdownString().appendCodeblock("json", i2.item.combinationArgs)
            }]
          }
        });
      }
    }));
    disposables.add(quickTree.onDidAccept(async () => {
      const manageItem = quickTree.activeItems.find((i2) => i2.type === "manage");
      if (manageItem) {
        quickTree.hide();
        await manageItem.onDidOpen?.();
        this.manageConfirmationPreferences(tools, options3);
      } else {
        quickTree.hide();
      }
    }));
    disposables.add(quickTree.onDidHide(() => {
      disposables.dispose();
    }));
    quickTree.show();
    if (options3?.focusToolId) {
      const focusToolId = options3.focusToolId;
      for (const serverItem of quickTree.itemTree) {
        const serverItemTyped = serverItem;
        if (serverItemTyped.children) {
          const toolItem = serverItemTyped.children.find((c) => c.type === "tool" && c.toolId === focusToolId);
          if (toolItem) {
            quickTree.expand(serverItem);
            quickTree.reveal(toolItem);
            break;
          }
        }
      }
    }
  }
  resetToolAutoConfirmation() {
    this._preExecutionToolConfirmStore.reset();
    this._postExecutionToolConfirmStore.reset();
    this._preExecutionServerConfirmStore.reset();
    this._postExecutionServerConfirmStore.reset();
    this._combinationConfirmStore.reset();
    for (const contribution of this._contributions.values()) {
      contribution.reset?.();
    }
  }
};

LanguageModelToolsConfirmationService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IQuickInputService),
  __decorateParam(2, IDialogService),
  __decorateParam(3, IConfigurationService)
], LanguageModelToolsConfirmationService);
export { RUN_WITHOUT_APPROVAL, CONTINUE_WITHOUT_REVIEWING_RESULTS, GenericConfirmStore, ToolConfirmStore, LanguageModelToolsConfirmationService };
