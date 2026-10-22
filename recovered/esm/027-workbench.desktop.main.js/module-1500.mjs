// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/quickinput/browser/quickInputUtils.ts
import { IdGenerator } from "./module-0463.mjs";
import { createCSSRule } from "./module-0224.mjs";
import { asCSSUrl } from "./module-0449.mjs";
import { $, EventHelper, EventType, isEventLike, reset } from "./module-0075.mjs";
import { parseLinkedText } from "./module-1329.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { localize } from "./module-0001.mjs";
import { DomEmitter } from "./module-0262.mjs";
import { Event2 } from "./module-0017.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";


// src/vs/platform/quickinput/browser/quickInputUtils.ts
var iconPathToClass = {};

var iconClassGenerator = new IdGenerator("quick-input-button-icon-");

function getIconClass(iconPath) {
  if (!iconPath) {
    return void 0;
  }
  let iconClass;
  const key3 = iconPath.dark.toString();
  if (iconPathToClass[key3]) {
    iconClass = iconPathToClass[key3];
  } else {
    iconClass = iconClassGenerator.nextId();
    createCSSRule(`.${iconClass}, .hc-light .${iconClass}`, `background-image: ${asCSSUrl(iconPath.light || iconPath.dark)}`);
    createCSSRule(`.vs-dark .${iconClass}, .hc-black .${iconClass}`, `background-image: ${asCSSUrl(iconPath.dark)}`);
    iconPathToClass[key3] = iconClass;
  }
  return iconClass;
}

var QuickInputToggleButtonAction = class {
  constructor(id2, label3, tooltip, className2, enabled, _checked, _run) {
    this.id = id2;
    this.label = label3;
    this.tooltip = tooltip;
    this.enabled = enabled;
    this._checked = _checked;
    this._run = _run;
    this.class = className2;
  }
  get checked() {
    return this._checked;
  }
  set checked(value2) {
    this._checked = value2;
    this._run();
  }
  run() {
    this._checked = !this._checked;
    return this._run();
  }
};

function quickInputButtonToAction(button, id2, run) {
  let cssClasses = button.iconClass || getIconClass(button.iconPath);
  if (button.alwaysVisible) {
    cssClasses = cssClasses ? `${cssClasses} always-visible` : "always-visible";
  }
  const handler = () => {
    if (button.toggle) {
      button.toggle.checked = !button.toggle.checked;
    }
    return run();
  };
  const action = button.toggle ? new QuickInputToggleButtonAction(
    id2,
    button.tooltip || "",
    "",
    cssClasses,
    true,
    button.toggle.checked,
    handler
  ) : {
    id: id2,
    label: "",
    tooltip: button.tooltip || "",
    class: cssClasses,
    enabled: true,
    run: handler
  };
  return action;
}

function quickInputButtonsToActionArrays(buttons, idPrefix, onTrigger) {
  const primary = [];
  const secondary = [];
  buttons.forEach((button, index2) => {
    const action = quickInputButtonToAction(
      button,
      `${idPrefix}-${index2}`,
      async () => onTrigger(button)
    );
    if (button.label) {
      action.label = button.label;
    }
    if (button.secondary) {
      secondary.push(action);
    } else {
      primary.push(action);
    }
  });
  return { primary, secondary };
}

function renderQuickInputDescription(description, container3, actionHandler) {
  reset(container3);
  const parsed = parseLinkedText(description);
  let tabIndex = 0;
  for (const node of parsed.nodes) {
    if (typeof node === "string") {
      container3.append(...renderLabelWithIcons(node));
    } else {
      let title = node.title;
      if (!title && node.href.startsWith("command:")) {
        title = localize(3213, null, node.href.substring("command:".length));
      } else if (!title) {
        title = node.href;
      }
      const anchor = $("a", { href: node.href, title, tabIndex: tabIndex++ }, node.label);
      anchor.style.textDecoration = "underline";
      const handleOpen = (e) => {
        if (isEventLike(e)) {
          EventHelper.stop(e, true);
        }
        actionHandler.callback(node.href);
      };
      const onClick4 = actionHandler.disposables.add(new DomEmitter(anchor, EventType.CLICK)).event;
      const onKeydown = actionHandler.disposables.add(new DomEmitter(anchor, EventType.KEY_DOWN)).event;
      const onSpaceOrEnter = Event2.chain(onKeydown, ($110) => $110.filter((e) => {
        const event = new StandardKeyboardEvent(e);
        return event.equals(10 /* Space */) || event.equals(3 /* Enter */);
      }));
      actionHandler.disposables.add(Gesture.addTarget(anchor));
      const onTap = actionHandler.disposables.add(new DomEmitter(anchor, EventType2.Tap)).event;
      Event2.any(onClick4, onTap, onSpaceOrEnter)(handleOpen, null, actionHandler.disposables);
      container3.appendChild(anchor);
    }
  }
}
export { getIconClass, quickInputButtonToAction, quickInputButtonsToActionArrays, renderQuickInputDescription, iconPathToClass, iconClassGenerator, QuickInputToggleButtonAction };
