// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalIconPicker.ts
import { Lazy } from "./module-0028.mjs";
import { getIconRegistry } from "./module-0479.mjs";
import { codiconsLibrary } from "./module-0084.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Disposable } from "./module-0012.mjs";
import { WorkbenchIconSelectBox } from "./module-3073.mjs";
import { defaultInputBoxStyles } from "./module-0513.mjs";
import { Dimension, getActiveDocument } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IHoverService } from "./module-0520.mjs";
import { ILayoutService } from "./module-0551.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalIconPicker.ts
var icons = new Lazy(() => {
  const iconDefinitions = getIconRegistry().getIcons();
  const includedChars = /* @__PURE__ */ new Set();
  const dedupedIcons = iconDefinitions.filter((e4) => {
    if (e4.id === codiconsLibrary.blank.id) {
      return false;
    }
    if (ThemeIcon.isThemeIcon(e4.defaults)) {
      return false;
    }
    if (includedChars.has(e4.defaults.fontCharacter)) {
      return false;
    }
    includedChars.add(e4.defaults.fontCharacter);
    return true;
  });
  return dedupedIcons;
});

var TerminalIconPicker = class extends Disposable {
  constructor(instantiationService, _hoverService, _layoutService) {
    super();
    this._hoverService = _hoverService;
    this._layoutService = _layoutService;
    this._iconSelectBox = instantiationService.createInstance(WorkbenchIconSelectBox, {
      icons: icons.value,
      inputBoxStyles: defaultInputBoxStyles
    });
  }
  async pickIcons() {
    const dimension = new Dimension(486, 260);
    return new Promise((resolve3) => {
      this._register(this._iconSelectBox.onDidSelect((e4) => {
        resolve3(e4);
        this._iconSelectBox.dispose();
      }));
      this._iconSelectBox.clearInput();
      const body = getActiveDocument().body;
      const bodyRect = body.getBoundingClientRect();
      const hoverWidget = this._hoverService.showInstantHover({
        content: this._iconSelectBox.domNode,
        target: {
          targetElements: [body],
          x: bodyRect.left + (bodyRect.width - dimension.width) / 2,
          y: bodyRect.top + this._layoutService.activeContainerOffset.top
        },
        position: {
          hoverPosition: 2 /* BELOW */
        },
        persistence: {
          sticky: true
        }
      }, true);
      if (hoverWidget) {
        this._register(hoverWidget);
      }
      this._iconSelectBox.layout(dimension);
      this._iconSelectBox.focus();
    });
  }
};

TerminalIconPicker = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IHoverService),
  __decorateParam(2, ILayoutService)
], TerminalIconPicker);
export { icons, TerminalIconPicker };
