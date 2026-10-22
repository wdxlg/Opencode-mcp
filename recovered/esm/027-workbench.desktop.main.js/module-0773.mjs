// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/components/gutterIndicatorMenu.ts
import { observableValue } from "./module-0048.mjs";
import { derived } from "./module-0054.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { hideInlineCompletionId, inlineSuggestCommitAlternativeActionId, inlineSuggestCommitId, toggleShowCollapsedId } from "./module-0580.mjs";
import { constObservable } from "./module-0061.mjs";
import { nativeHoverDelegate } from "./module-0520.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ICommandService } from "./module-0087.mjs";
import { n } from "./module-0075.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { descriptionForeground } from "./module-0227.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { renderIcon } from "./module-0467.mjs";
import { KeybindingLabel } from "./module-0547.mjs";
import { OS } from "./module-0014.mjs";
import { defaultKeybindingLabelStyles } from "./module-0513.mjs";
import { autorun } from "./module-0052.mjs";
import { ActionBar } from "./module-0477.mjs";
import { editorActionListForeground } from "./module-0232.mjs";
import { editorHoverBorder } from "./module-0229.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/components/gutterIndicatorMenu.ts
var GutterIndicatorMenuContent = class {
  constructor(_editorObs, _data, _close, _contextKeyService, _keybindingService, _commandService) {
    this._editorObs = _editorObs;
    this._data = _data;
    this._close = _close;
    this._contextKeyService = _contextKeyService;
    this._keybindingService = _keybindingService;
    this._commandService = _commandService;
    this._inlineEditsShowCollapsed = this._editorObs.getOption(71 /* inlineSuggest */).map((s) => s.edits.showCollapsed);
  }
  toDisposableLiveElement() {
    return this._createHoverContent().toDisposableLiveElement();
  }
  _createHoverContent() {
    const activeElement = observableValue("active", void 0);
    const createOptionArgs = (options3) => {
      return {
        title: options3.title,
        icon: options3.icon,
        keybinding: typeof options3.commandId === "string" ? this._getKeybinding(options3.commandArgs ? void 0 : options3.commandId) : derived(this, (reader) => typeof options3.commandId === "string" ? void 0 : this._getKeybinding(options3.commandArgs ? void 0 : options3.commandId.read(reader)).read(reader)),
        isActive: activeElement.map((v2) => v2 === options3.id),
        onHoverChange: (v2) => activeElement.set(v2 ? options3.id : void 0, void 0),
        onAction: () => {
          const commandId = typeof options3.commandId === "string" ? options3.commandId : options3.commandId.get();
          this._close(true, commandId);
          return this._commandService.executeCommand(commandId, ...options3.commandArgs ?? []);
        }
      };
    };
    const extensionCommandGroups = this._data.extensionCommands.map(
      (group2) => group2.map((c, idx) => option(createOptionArgs({
        id: c.command.id + "_" + idx,
        title: c.command.title,
        icon: c.icon ?? Codicon.symbolEvent,
        commandId: c.command.id,
        commandArgs: c.command.arguments
      })))
    );
    const extensionCommandNodes = [];
    for (const group2 of extensionCommandGroups) {
      if (group2.length > 0) {
        extensionCommandNodes.push(separator());
        extensionCommandNodes.push(...group2);
      }
    }
    if (this._data.extensionCommandsOnly) {
      return hoverContent(extensionCommandNodes.slice(1));
    }
    const title = header(this._data.displayName);
    const gotoAndAccept = option(createOptionArgs({
      id: "gotoAndAccept",
      title: localize(1395, null),
      icon: Codicon.check,
      commandId: inlineSuggestCommitId
    }));
    const reject = option(createOptionArgs({
      id: "reject",
      title: localize(1396, null),
      icon: Codicon.close,
      commandId: hideInlineCompletionId
    }));
    const alternativeCommand = this._data.alternativeAction ? option(createOptionArgs({
      id: "alternativeCommand",
      title: this._data.alternativeAction.command.title,
      icon: this._data.alternativeAction.icon,
      commandId: inlineSuggestCommitAlternativeActionId
    })) : void 0;
    const showModelEnabled = false;
    const modelOptions = showModelEnabled ? this._data.modelInfo?.models.map((m) => option({
      title: m.name,
      icon: m.id === this._data.modelInfo?.currentModelId ? Codicon.check : Codicon.circle,
      keybinding: constObservable(void 0),
      isActive: activeElement.map((v2) => v2 === "model_" + m.id),
      onHoverChange: (v2) => activeElement.set(v2 ? "model_" + m.id : void 0, void 0),
      onAction: () => {
        this._close(true);
        this._data.setModelId?.(m.id);
      }
    })) ?? [] : [];
    const toggleCollapsedMode = this._inlineEditsShowCollapsed.map(
      (showCollapsed) => showCollapsed ? option(createOptionArgs({
        id: "showExpanded",
        title: localize(1399, null),
        icon: Codicon.expandAll,
        commandId: toggleShowCollapsedId
      })) : option(createOptionArgs({
        id: "showCollapsed",
        title: localize(1398, null),
        icon: Codicon.collapseAll,
        commandId: toggleShowCollapsedId
      }))
    );
    const snooze = option(createOptionArgs({
      id: "snooze",
      title: localize(1400, null),
      icon: Codicon.bellSlash,
      commandId: "editor.action.inlineSuggest.snooze"
    }));
    const settings = option(createOptionArgs({
      id: "settings",
      title: localize(1397, null),
      icon: Codicon.gear,
      commandId: "workbench.action.openSettings",
      commandArgs: ["@tag:nextEditSuggestions"]
    }));
    const actions = this._data.action ? [this._data.action] : [];
    const actionBarFooter = actions.length > 0 ? actionBar(
      actions.map((action) => ({
        id: action.id,
        label: action.title + "...",
        enabled: true,
        run: () => this._commandService.executeCommand(action.id, ...action.arguments ?? []),
        class: void 0,
        tooltip: action.tooltip ?? action.title
      })),
      {
        hoverDelegate: nativeHoverDelegate
        /* unable to show hover inside another hover */
      }
    ) : void 0;
    return hoverContent([
      title,
      gotoAndAccept,
      alternativeCommand,
      reject,
      toggleCollapsedMode,
      modelOptions.length ? separator() : void 0,
      ...modelOptions,
      snooze,
      settings,
      ...extensionCommandNodes,
      actionBarFooter ? separator() : void 0,
      actionBarFooter
    ]);
  }
  _getKeybinding(commandId) {
    if (!commandId) {
      return constObservable(void 0);
    }
    return observableFromEvent(this._contextKeyService.onDidChangeContext, () => this._keybindingService.lookupKeybinding(commandId));
  }
};

GutterIndicatorMenuContent = __decorateClass([
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, ICommandService)
], GutterIndicatorMenuContent);

function hoverContent(content2) {
  return n.div({
    class: "content",
    style: {
      margin: 4,
      minWidth: 180
    }
  }, content2);
}

function header(title) {
  return n.div({
    class: "header",
    style: {
      color: asCssVariable(descriptionForeground),
      fontSize: "13px",
      fontWeight: "600",
      padding: "0 4px",
      lineHeight: 28
    }
  }, [title]);
}

function option(props) {
  return derived({ name: "inlineEdits.option" }, (_reader) => n.div({
    class: ["monaco-menu-option", props.isActive?.map((v2) => v2 && "active")],
    onmouseenter: () => props.onHoverChange?.(true),
    onmouseleave: () => props.onHoverChange?.(false),
    onclick: props.onAction,
    onkeydown: (e) => {
      if (e.key === "Enter") {
        props.onAction?.();
      }
    },
    tabIndex: 0,
    style: {
      borderRadius: 3
      // same as hover widget border radius
    }
  }, [
    n.elem("span", {
      style: {
        fontSize: 16,
        display: "flex"
      }
    }, [ThemeIcon.isThemeIcon(props.icon) ? renderIcon(props.icon) : props.icon.map((icon2) => renderIcon(icon2))]),
    n.elem("span", {}, [props.title]),
    n.div({
      style: { marginLeft: "auto" },
      ref: (elem) => {
        const keybindingLabel2 = _reader.store.add(new KeybindingLabel(elem, OS, {
          disableTitle: true,
          ...defaultKeybindingLabelStyles,
          keybindingLabelShadow: void 0,
          keybindingLabelForeground: asCssVariable(descriptionForeground),
          keybindingLabelBackground: "transparent",
          keybindingLabelBorder: "transparent",
          keybindingLabelBottomBorder: void 0
        }));
        _reader.store.add(autorun((reader) => {
          keybindingLabel2.set(props.keybinding.read(reader));
        }));
      }
    })
  ]));
}

function actionBar(actions, options3) {
  return derived({ name: "inlineEdits.actionBar" }, (_reader) => n.div({
    class: ["action-widget-action-bar"],
    style: {
      padding: "3px 24px"
    }
  }, [
    n.div({
      ref: (elem) => {
        const actionBar3 = _reader.store.add(new ActionBar(elem, options3));
        actionBar3.push(actions, { icon: false, label: true });
      }
    })
  ]));
}

function separator() {
  return n.div({
    id: "inline-edit-gutter-indicator-menu-separator",
    class: "menu-separator",
    style: {
      color: asCssVariable(editorActionListForeground),
      padding: "2px 0"
    }
  }, n.div({
    style: {
      borderBottom: `1px solid ${asCssVariable(editorHoverBorder)}`
    }
  }));
}
export { hoverContent, header, option, actionBar, separator, GutterIndicatorMenuContent };
