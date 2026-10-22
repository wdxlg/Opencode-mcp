// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/editorExtensions.ts
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { TriggerInlineEditCommandsRegistry } from "./module-0096.mjs";
import { Action2, MenuId, MenuRegistry } from "./module-0092.mjs";
import { ILogService } from "./module-0095.mjs";
import { getActiveElement } from "./module-0075.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { assertType } from "./module-0010.mjs";
import { URI } from "./module-0032.mjs";
import { Position } from "./module-0079.mjs";
import { IModelService } from "./module-0080.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { Registry } from "./module-0090.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/editor/browser/editorExtensions.ts
var Command = class {
  constructor(opts) {
    this.id = opts.id;
    this.precondition = opts.precondition;
    this._kbOpts = opts.kbOpts;
    this._menuOpts = opts.menuOpts;
    this.metadata = opts.metadata;
    this.canTriggerInlineEdits = opts.canTriggerInlineEdits;
  }
  register() {
    if (Array.isArray(this._menuOpts)) {
      this._menuOpts.forEach(this._registerMenuItem, this);
    } else if (this._menuOpts) {
      this._registerMenuItem(this._menuOpts);
    }
    if (this._kbOpts) {
      const kbOptsArr = Array.isArray(this._kbOpts) ? this._kbOpts : [this._kbOpts];
      for (const kbOpts of kbOptsArr) {
        let kbWhen = kbOpts.kbExpr;
        if (this.precondition) {
          if (kbWhen) {
            kbWhen = ContextKeyExpr.and(kbWhen, this.precondition);
          } else {
            kbWhen = this.precondition;
          }
        }
        const desc = {
          id: this.id,
          weight: kbOpts.weight,
          args: kbOpts.args,
          when: kbWhen,
          primary: kbOpts.primary,
          secondary: kbOpts.secondary,
          win: kbOpts.win,
          linux: kbOpts.linux,
          mac: kbOpts.mac
        };
        KeybindingsRegistry.registerKeybindingRule(desc);
      }
    }
    CommandsRegistry.registerCommand({
      id: this.id,
      handler: (accessor, args2) => this.runCommand(accessor, args2),
      metadata: this.metadata
    });
    if (this.canTriggerInlineEdits) {
      TriggerInlineEditCommandsRegistry.registerCommand(this.id);
    }
  }
  _registerMenuItem(item) {
    MenuRegistry.appendMenuItem(item.menuId, {
      group: item.group,
      command: {
        id: this.id,
        title: item.title,
        icon: item.icon,
        precondition: this.precondition
      },
      when: item.when,
      order: item.order
    });
  }
};

var MultiCommand = class extends Command {
  constructor() {
    super(...arguments);
    this._implementations = [];
  }
  /**
   * A higher priority gets to be looked at first
   */
  addImplementation(priority, name, implementation, when) {
    this._implementations.push({ priority, name, implementation, when });
    this._implementations.sort((a, b) => b.priority - a.priority);
    return {
      dispose: () => {
        for (let i2 = 0; i2 < this._implementations.length; i2++) {
          if (this._implementations[i2].implementation === implementation) {
            this._implementations.splice(i2, 1);
            return;
          }
        }
      }
    };
  }
  runCommand(accessor, args2) {
    const logService = accessor.get(ILogService);
    const contextKeyService = accessor.get(IContextKeyService);
    logService.trace(`Executing Command '${this.id}' which has ${this._implementations.length} bound.`);
    for (const impl of this._implementations) {
      if (impl.when) {
        const context2 = contextKeyService.getContext(getActiveElement());
        const value2 = impl.when.evaluate(context2);
        if (!value2) {
          continue;
        }
      }
      const result = impl.implementation(accessor, args2);
      if (result) {
        logService.trace(`Command '${this.id}' was handled by '${impl.name}'.`);
        if (typeof result === "boolean") {
          return;
        }
        return result;
      }
    }
    logService.trace(`The Command '${this.id}' was not handled by any implementation.`);
  }
};

var ProxyCommand = class extends Command {
  constructor(command4, opts) {
    super(opts);
    this.command = command4;
  }
  runCommand(accessor, args2) {
    return this.command.runCommand(accessor, args2);
  }
};

var EditorCommand = class _EditorCommand extends Command {
  /**
   * Create a command class that is bound to a certain editor contribution.
   */
  static bindToContribution(controllerGetter) {
    return class EditorControllerCommandImpl extends _EditorCommand {
      constructor(opts) {
        super(opts);
        this._callback = opts.handler;
      }
      runEditorCommand(accessor, editor, args2) {
        const controller = controllerGetter(editor);
        if (controller) {
          this._callback(controller, args2);
        }
      }
    };
  }
  static runEditorCommand(accessor, args2, precondition2, runner) {
    const codeEditorService = accessor.get(ICodeEditorService);
    const editor = codeEditorService.getFocusedCodeEditor() || codeEditorService.getActiveCodeEditor();
    if (!editor) {
      return;
    }
    return editor.invokeWithinContext((editorAccessor) => {
      const kbService = editorAccessor.get(IContextKeyService);
      if (!kbService.contextMatchesRules(precondition2 ?? void 0)) {
        return;
      }
      return runner(editorAccessor, editor, args2);
    });
  }
  runCommand(accessor, args2) {
    return _EditorCommand.runEditorCommand(accessor, args2, this.precondition, (accessor2, editor, args3) => this.runEditorCommand(accessor2, editor, args3));
  }
};

var EditorAction = class _EditorAction extends EditorCommand {
  static convertOptions(opts) {
    let menuOpts;
    if (Array.isArray(opts.menuOpts)) {
      menuOpts = opts.menuOpts;
    } else if (opts.menuOpts) {
      menuOpts = [opts.menuOpts];
    } else {
      menuOpts = [];
    }
    function withDefaults(item) {
      if (!item.menuId) {
        item.menuId = MenuId.EditorContext;
      }
      if (!item.title) {
        item.title = typeof opts.label === "string" ? opts.label : opts.label.value;
      }
      item.when = ContextKeyExpr.and(opts.precondition, item.when);
      return item;
    }
    if (Array.isArray(opts.contextMenuOpts)) {
      menuOpts.push(...opts.contextMenuOpts.map(withDefaults));
    } else if (opts.contextMenuOpts) {
      menuOpts.push(withDefaults(opts.contextMenuOpts));
    }
    opts.menuOpts = menuOpts;
    return opts;
  }
  constructor(opts) {
    super(_EditorAction.convertOptions(opts));
    if (typeof opts.label === "string") {
      this.label = opts.label;
      this.alias = opts.alias ?? opts.label;
    } else {
      this.label = opts.label.value;
      this.alias = opts.alias ?? opts.label.original;
    }
  }
  runEditorCommand(accessor, editor, args2) {
    this.reportTelemetry(accessor, editor);
    return this.run(accessor, editor, args2 || {});
  }
  reportTelemetry(accessor, editor) {
    accessor.get(ITelemetryService).publicLog2("editorActionInvoked", { name: this.label, id: this.id });
  }
};

var MultiEditorAction = class extends EditorAction {
  constructor() {
    super(...arguments);
    this._implementations = [];
  }
  /**
   * A higher priority gets to be looked at first
   */
  addImplementation(priority, implementation) {
    this._implementations.push([priority, implementation]);
    this._implementations.sort((a, b) => b[0] - a[0]);
    return {
      dispose: () => {
        for (let i2 = 0; i2 < this._implementations.length; i2++) {
          if (this._implementations[i2][1] === implementation) {
            this._implementations.splice(i2, 1);
            return;
          }
        }
      }
    };
  }
  run(accessor, editor, args2) {
    for (const impl of this._implementations) {
      const result = impl[1](accessor, editor, args2);
      if (result) {
        if (typeof result === "boolean") {
          return;
        }
        return result;
      }
    }
  }
};

var EditorAction2 = class extends Action2 {
  run(accessor, ...args2) {
    const codeEditorService = accessor.get(ICodeEditorService);
    const editor = codeEditorService.getFocusedCodeEditor() || codeEditorService.getActiveCodeEditor();
    if (!editor) {
      return;
    }
    return editor.invokeWithinContext((editorAccessor) => {
      const kbService = editorAccessor.get(IContextKeyService);
      const logService = editorAccessor.get(ILogService);
      const enabled = kbService.contextMatchesRules(this.desc.precondition ?? void 0);
      if (!enabled) {
        logService.debug(`[EditorAction2] NOT running command because its precondition is FALSE`, this.desc.id, this.desc.precondition?.serialize());
        return;
      }
      return this.runEditorCommand(editorAccessor, editor, ...args2);
    });
  }
};

function registerModelAndPositionCommand(id2, handler) {
  CommandsRegistry.registerCommand(id2, function(accessor, ...args2) {
    const instaService = accessor.get(IInstantiationService);
    const [resource, position2] = args2;
    assertType(URI.isUri(resource));
    assertType(Position.isIPosition(position2));
    const model = accessor.get(IModelService).getModel(resource);
    if (model) {
      const editorPosition = Position.lift(position2);
      return instaService.invokeFunction(handler, model, editorPosition, ...args2.slice(2));
    }
    return accessor.get(ITextModelService).createModelReference(resource).then((reference) => {
      return new Promise((resolve3, reject) => {
        try {
          const result = instaService.invokeFunction(handler, reference.object.textEditorModel, Position.lift(position2), args2.slice(2));
          resolve3(result);
        } catch (err) {
          reject(err);
        }
      }).finally(() => {
        reference.dispose();
      });
    });
  });
}

function registerEditorCommand(editorCommand) {
  EditorContributionRegistry.INSTANCE.registerEditorCommand(editorCommand);
  return editorCommand;
}

function registerEditorAction(ctor) {
  const action = new ctor();
  EditorContributionRegistry.INSTANCE.registerEditorAction(action);
  return action;
}

function registerMultiEditorAction(action) {
  EditorContributionRegistry.INSTANCE.registerEditorAction(action);
  return action;
}

function registerInstantiatedEditorAction(editorAction) {
  EditorContributionRegistry.INSTANCE.registerEditorAction(editorAction);
}

function registerEditorContribution(id2, ctor, instantiation) {
  EditorContributionRegistry.INSTANCE.registerEditorContribution(id2, ctor, instantiation);
}

function registerDiffEditorContribution(id2, ctor) {
  EditorContributionRegistry.INSTANCE.registerDiffEditorContribution(id2, ctor);
}

var EditorExtensionsRegistry;

((EditorExtensionsRegistry2) => {
  function getEditorCommand(commandId) {
    return EditorContributionRegistry.INSTANCE.getEditorCommand(commandId);
  }
  EditorExtensionsRegistry2.getEditorCommand = getEditorCommand;
  function getEditorActions() {
    return EditorContributionRegistry.INSTANCE.getEditorActions();
  }
  EditorExtensionsRegistry2.getEditorActions = getEditorActions;
  function getEditorContributions() {
    return EditorContributionRegistry.INSTANCE.getEditorContributions();
  }
  EditorExtensionsRegistry2.getEditorContributions = getEditorContributions;
  function getSomeEditorContributions(ids) {
    return EditorContributionRegistry.INSTANCE.getEditorContributions().filter((c) => ids.indexOf(c.id) >= 0);
  }
  EditorExtensionsRegistry2.getSomeEditorContributions = getSomeEditorContributions;
  function getDiffEditorContributions() {
    return EditorContributionRegistry.INSTANCE.getDiffEditorContributions();
  }
  EditorExtensionsRegistry2.getDiffEditorContributions = getDiffEditorContributions;
})(EditorExtensionsRegistry || (EditorExtensionsRegistry = {}));

var Extensions2 = {
  EditorCommonContributions: "editor.contributions"
};

var EditorContributionRegistry = class _EditorContributionRegistry {
  constructor() {
    this.editorContributions = [];
    this.diffEditorContributions = [];
    this.editorActions = [];
    this.editorCommands = /* @__PURE__ */ Object.create(null);
  }
  static {
    this.INSTANCE = new _EditorContributionRegistry();
  }
  registerEditorContribution(id2, ctor, instantiation) {
    this.editorContributions.push({ id: id2, ctor, instantiation });
  }
  getEditorContributions() {
    return this.editorContributions.slice(0);
  }
  registerDiffEditorContribution(id2, ctor) {
    this.diffEditorContributions.push({ id: id2, ctor });
  }
  getDiffEditorContributions() {
    return this.diffEditorContributions.slice(0);
  }
  registerEditorAction(action) {
    action.register();
    this.editorActions.push(action);
  }
  getEditorActions() {
    return this.editorActions;
  }
  registerEditorCommand(editorCommand) {
    editorCommand.register();
    this.editorCommands[editorCommand.id] = editorCommand;
  }
  getEditorCommand(commandId) {
    return this.editorCommands[commandId] || null;
  }
};

Registry.add(Extensions2.EditorCommonContributions, EditorContributionRegistry.INSTANCE);

function registerCommand(command4) {
  command4.register();
  return command4;
}

var UndoCommand = registerCommand(new MultiCommand({
  id: "undo",
  precondition: void 0,
  kbOpts: {
    weight: 0 /* EditorCore */,
    primary: 2048 /* CtrlCmd */ | 56 /* KeyZ */
  },
  menuOpts: [{
    menuId: MenuId.MenubarEditMenu,
    group: "1_do",
    title: localize(185, null),
    order: 1
  }, {
    menuId: MenuId.CommandPalette,
    group: "",
    title: localize(188, null),
    order: 1
  }, {
    menuId: MenuId.SimpleEditorContext,
    group: "1_do",
    title: localize(188, null),
    order: 1
  }]
}));

registerCommand(new ProxyCommand(UndoCommand, { id: "default:undo", precondition: void 0 }));

var RedoCommand = registerCommand(new MultiCommand({
  id: "redo",
  precondition: void 0,
  kbOpts: {
    weight: 0 /* EditorCore */,
    primary: 2048 /* CtrlCmd */ | 55 /* KeyY */,
    secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 56 /* KeyZ */],
    mac: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 56 /* KeyZ */ }
  },
  menuOpts: [{
    menuId: MenuId.MenubarEditMenu,
    group: "1_do",
    title: localize(183, null),
    order: 2
  }, {
    menuId: MenuId.CommandPalette,
    group: "",
    title: localize(186, null),
    order: 1
  }, {
    menuId: MenuId.SimpleEditorContext,
    group: "1_do",
    title: localize(186, null),
    order: 2
  }]
}));

registerCommand(new ProxyCommand(RedoCommand, { id: "default:redo", precondition: void 0 }));

var SelectAllCommand = registerCommand(new MultiCommand({
  id: "editor.action.selectAll",
  precondition: void 0,
  kbOpts: {
    weight: 0 /* EditorCore */,
    kbExpr: null,
    primary: 2048 /* CtrlCmd */ | 31 /* KeyA */
  },
  menuOpts: [{
    menuId: MenuId.MenubarSelectionMenu,
    group: "1_basic",
    title: localize(184, null),
    order: 1
  }, {
    menuId: MenuId.CommandPalette,
    group: "",
    title: localize(187, null),
    order: 1
  }, {
    menuId: MenuId.SimpleEditorContext,
    group: "9_select",
    title: localize(187, null),
    order: 1
  }]
}));
export { registerModelAndPositionCommand, registerEditorCommand, registerEditorAction, registerMultiEditorAction, registerInstantiatedEditorAction, registerEditorContribution, registerDiffEditorContribution, registerCommand, Command, MultiCommand, ProxyCommand, EditorCommand, EditorAction, MultiEditorAction, EditorAction2, EditorExtensionsRegistry, Extensions2, EditorContributionRegistry, UndoCommand, RedoCommand, SelectAllCommand };
