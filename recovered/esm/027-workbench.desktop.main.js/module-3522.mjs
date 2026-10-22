// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/keybindings/browser/keybindings.contribution.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ICommandService } from "./module-0087.mjs";
import { showWindowLogActionId } from "./module-1509.mjs";
import { ILayoutService } from "./module-0551.mjs";
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { $, addDisposableListener, append, getDomNodePagePosition, getWindows, onDidRegisterWindow } from "./module-0075.mjs";
import { createCSSRule, createStyleSheet } from "./module-0224.mjs";
import { Emitter } from "./module-0017.mjs";


// src/vs/workbench/contrib/keybindings/browser/keybindings.contribution.ts
var ToggleKeybindingsLogAction = class _ToggleKeybindingsLogAction extends Action2 {
  constructor() {
    super({
      id: "workbench.action.toggleKeybindingsLog",
      title: localize2(16489, "Toggle Keyboard Shortcuts Troubleshooting"),
      category: Categories.Developer,
      f1: true
    });
  }
  run(accessor) {
    const logging = accessor.get(IKeybindingService).toggleLogging();
    if (logging) {
      const commandService = accessor.get(ICommandService);
      commandService.executeCommand(showWindowLogActionId);
    }
    if (_ToggleKeybindingsLogAction.disposable) {
      _ToggleKeybindingsLogAction.disposable.dispose();
      _ToggleKeybindingsLogAction.disposable = void 0;
      return;
    }
    const layoutService = accessor.get(ILayoutService);
    const disposables = new DisposableStore();
    const container3 = layoutService.activeContainer;
    const focusMarker = append(container3, $(".focus-troubleshooting-marker"));
    disposables.add(toDisposable(() => focusMarker.remove()));
    const stylesheet = createStyleSheet(void 0, void 0, disposables);
    createCSSRule(".focus-troubleshooting-marker", `
			position: fixed;
			pointer-events: none;
			z-index: 100000;
			background-color: rgba(255, 0, 0, 0.2);
			border: 2px solid rgba(255, 0, 0, 0.8);
			border-radius: 2px;
			display: none;
		`, stylesheet);
    const onKeyDown = disposables.add(new Emitter());
    function registerWindowListeners(window2, disposables2) {
      disposables2.add(addDisposableListener(window2, "keydown", (e) => onKeyDown.fire(e), true));
    }
    for (const { window: window2, disposables: disposables2 } of getWindows()) {
      registerWindowListeners(window2, disposables2);
    }
    disposables.add(onDidRegisterWindow(({ window: window2, disposables: disposables2 }) => registerWindowListeners(window2, disposables2)));
    disposables.add(layoutService.onDidChangeActiveContainer(() => {
      layoutService.activeContainer.appendChild(focusMarker);
    }));
    disposables.add(onKeyDown.event((e) => {
      const target = e.target;
      if (target) {
        const position2 = getDomNodePagePosition(target);
        focusMarker.style.top = `${position2.top}px`;
        focusMarker.style.left = `${position2.left}px`;
        focusMarker.style.width = `${position2.width}px`;
        focusMarker.style.height = `${position2.height}px`;
        focusMarker.style.display = "block";
        setTimeout(() => {
          focusMarker.style.display = "none";
        }, 800);
      }
    }));
    _ToggleKeybindingsLogAction.disposable = disposables;
  }
};

registerAction2(ToggleKeybindingsLogAction);
export { ToggleKeybindingsLogAction };
