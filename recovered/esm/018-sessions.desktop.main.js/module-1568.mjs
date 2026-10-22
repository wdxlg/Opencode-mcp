// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/statusbar/statusbarItem.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { $, EventHelper, EventType, addDisposableListener, append, hide, show } from "./module-0075.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { ShowTooltipCommand, StatusbarEntryKinds, isTooltipWithCommands } from "./module-0895.mjs";
import { isMarkdownString, markdownStringEqual } from "./module-0462.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { isThemeColor } from "./module-0153.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IHoverService } from "./module-0520.mjs";
import { INotificationService } from "./module-0336.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService } from "./module-0287.mjs";
import { SimpleIconLabel } from "./module-1545.mjs";
import { renderIcon, renderLabelWithIcons } from "./module-0467.mjs";
import { spinningLoading, syncing } from "./module-0479.mjs";


// src/vs/workbench/browser/parts/statusbar/statusbarItem.ts
var StatusbarEntryItem = class extends Disposable {
  constructor(container2, entry, hoverDelegate, commandService, hoverService, notificationService, telemetryService, themeService) {
    super();
    this.container = container2;
    this.hoverDelegate = hoverDelegate;
    this.commandService = commandService;
    this.hoverService = hoverService;
    this.notificationService = notificationService;
    this.telemetryService = telemetryService;
    this.themeService = themeService;
    this.entry = void 0;
    this.foregroundListener = this._register(new MutableDisposable());
    this.backgroundListener = this._register(new MutableDisposable());
    this.commandMouseListener = this._register(new MutableDisposable());
    this.commandTouchListener = this._register(new MutableDisposable());
    this.commandKeyboardListener = this._register(new MutableDisposable());
    this.hover = void 0;
    this.labelContainer = $("a.statusbar-item-label", {
      role: "button",
      tabIndex: -1
      // allows screen readers to read title, but still prevents tab focus.
    });
    this._register(Gesture.addTarget(this.labelContainer));
    this.label = this._register(new StatusBarCodiconLabel(this.labelContainer));
    this.container.appendChild(this.labelContainer);
    this.beakContainer = $(".status-bar-item-beak-container");
    this.container.appendChild(this.beakContainer);
    if (entry.content) {
      this.container.appendChild(entry.content);
    }
    this.update(entry);
  }
  get name() {
    return assertReturnsDefined(this.entry).name;
  }
  get hasCommand() {
    return typeof this.entry?.command !== "undefined";
  }
  update(entry) {
    this.label.showProgress = entry.showProgress ?? false;
    if (!this.entry || entry.text !== this.entry.text) {
      this.label.text = entry.text;
      if (entry.text) {
        show(this.labelContainer);
      } else {
        hide(this.labelContainer);
      }
    }
    if (!this.entry || entry.ariaLabel !== this.entry.ariaLabel) {
      this.container.setAttribute("aria-label", entry.ariaLabel);
      this.labelContainer.setAttribute("aria-label", entry.ariaLabel);
    }
    if (!this.entry || entry.role !== this.entry.role) {
      this.labelContainer.setAttribute("role", entry.role || "button");
    }
    if (!this.entry || !this.isEqualTooltip(this.entry, entry)) {
      let hoverOptions;
      let hoverTooltip;
      if (isTooltipWithCommands(entry.tooltip)) {
        hoverTooltip = entry.tooltip.content;
        hoverOptions = {
          actions: entry.tooltip.commands.map((command4) => ({
            commandId: command4.id,
            label: command4.title,
            run: () => this.executeCommand(command4)
          }))
        };
      } else {
        hoverTooltip = entry.tooltip;
      }
      const hoverContents = isMarkdownString(hoverTooltip) ? { markdown: hoverTooltip, markdownNotSupportedFallback: void 0 } : hoverTooltip;
      if (this.hover) {
        this.hover.update(hoverContents, hoverOptions);
      } else {
        this.hover = this._register(this.hoverService.setupManagedHover(this.hoverDelegate, this.container, hoverContents, hoverOptions));
      }
    }
    if (!this.entry || entry.command !== this.entry.command) {
      this.commandMouseListener.clear();
      this.commandTouchListener.clear();
      this.commandKeyboardListener.clear();
      const command4 = entry.command;
      if (command4 && (command4 !== ShowTooltipCommand || this.hover)) {
        this.commandMouseListener.value = addDisposableListener(this.labelContainer, EventType.CLICK, () => this.executeCommand(command4));
        this.commandTouchListener.value = addDisposableListener(this.labelContainer, EventType2.Tap, () => this.executeCommand(command4));
        this.commandKeyboardListener.value = addDisposableListener(this.labelContainer, EventType.KEY_DOWN, (e4) => {
          const event = new StandardKeyboardEvent(e4);
          if (event.equals(10 /* Space */) || event.equals(3 /* Enter */)) {
            EventHelper.stop(e4);
            this.executeCommand(command4);
          } else if (event.equals(9 /* Escape */) || event.equals(15 /* LeftArrow */) || event.equals(17 /* RightArrow */)) {
            EventHelper.stop(e4);
            this.hover?.hide();
          }
        });
        this.container.classList.add("has-command");
        this.labelContainer.classList.remove("disabled");
      } else {
        this.container.classList.remove("has-command");
        this.labelContainer.classList.add("disabled");
      }
    }
    if (!this.entry || entry.showBeak !== this.entry.showBeak) {
      if (entry.showBeak) {
        this.container.classList.add("has-beak");
      } else {
        this.container.classList.remove("has-beak");
      }
    }
    const hasBackgroundColor = !!entry.backgroundColor || entry.kind && entry.kind !== "standard";
    if (!this.entry || entry.kind !== this.entry.kind) {
      for (const kind of StatusbarEntryKinds) {
        this.container.classList.remove(`${kind}-kind`);
      }
      if (entry.kind && entry.kind !== "standard") {
        this.container.classList.add(`${entry.kind}-kind`);
      }
      this.container.classList.toggle("has-background-color", hasBackgroundColor);
    }
    if (!this.entry || entry.color !== this.entry.color) {
      this.applyColor(this.labelContainer, entry.color);
    }
    if (!this.entry || entry.backgroundColor !== this.entry.backgroundColor) {
      this.container.classList.toggle("has-background-color", hasBackgroundColor);
      this.applyColor(this.container, entry.backgroundColor, true);
    }
    this.entry = entry;
  }
  isEqualTooltip({ tooltip }, { tooltip: otherTooltip }) {
    if (tooltip === void 0) {
      return otherTooltip === void 0;
    }
    if (isMarkdownString(tooltip)) {
      return isMarkdownString(otherTooltip) && markdownStringEqual(tooltip, otherTooltip);
    }
    return tooltip === otherTooltip;
  }
  async executeCommand(command4) {
    if (command4 === ShowTooltipCommand) {
      this.hover?.show(
        true
        /* focus */
      );
    } else {
      const id2 = typeof command4 === "string" ? command4 : command4.id;
      const args2 = typeof command4 === "string" ? [] : command4.arguments ?? [];
      this.telemetryService.publicLog2("workbenchActionExecuted", { id: id2, from: "status bar" });
      try {
        await this.commandService.executeCommand(id2, ...args2);
      } catch (error) {
        this.notificationService.error(toErrorMessage(error));
      }
    }
  }
  applyColor(container2, color2, isBackground) {
    let colorResult = void 0;
    if (isBackground) {
      this.backgroundListener.clear();
    } else {
      this.foregroundListener.clear();
    }
    if (color2) {
      if (isThemeColor(color2)) {
        colorResult = this.themeService.getColorTheme().getColor(color2.id)?.toString();
        const listener = this.themeService.onDidColorThemeChange((theme) => {
          const colorValue = theme.getColor(color2.id)?.toString();
          if (isBackground) {
            container2.style.backgroundColor = colorValue ?? "";
          } else {
            container2.style.color = colorValue ?? "";
          }
        });
        if (isBackground) {
          this.backgroundListener.value = listener;
        } else {
          this.foregroundListener.value = listener;
        }
      } else {
        colorResult = color2;
      }
    }
    if (isBackground) {
      container2.style.backgroundColor = colorResult ?? "";
    } else {
      container2.style.color = colorResult ?? "";
    }
  }
};

StatusbarEntryItem = __decorateClass([
  __decorateParam(3, ICommandService),
  __decorateParam(4, IHoverService),
  __decorateParam(5, INotificationService),
  __decorateParam(6, ITelemetryService),
  __decorateParam(7, IThemeService)
], StatusbarEntryItem);

var StatusBarCodiconLabel = class extends SimpleIconLabel {
  constructor(container2) {
    super(container2);
    this.container = container2;
    this.currentText = "";
    this.currentShowProgress = false;
  }
  set showProgress(showProgress) {
    if (this.currentShowProgress !== showProgress) {
      this.currentShowProgress = showProgress;
      if (showProgress) {
        this.progressCodicon = renderIcon(showProgress === "syncing" ? syncing : spinningLoading);
      }
      this.text = this.currentText;
    }
  }
  set text(text2) {
    if (this.currentShowProgress && this.progressCodicon) {
      if (this.container.firstChild !== this.progressCodicon) {
        this.container.appendChild(this.progressCodicon);
      }
      for (const node of Array.from(this.container.childNodes)) {
        if (node !== this.progressCodicon) {
          node.remove();
        }
      }
      let textContent = text2 ?? "";
      if (textContent) {
        textContent = `\xA0${textContent}`;
      }
      append(this.container, ...renderLabelWithIcons(textContent));
    } else {
      super.text = text2;
    }
  }
};
export { StatusbarEntryItem, StatusBarCodiconLabel };
