// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/findinput/findInputToggles.ts
import { EventHelper } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { Toggle } from "./module-0549.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/base/browser/ui/findinput/findInputToggles.ts
function navigateToggles(event, domNode, getToggleDomNodes, focusInput) {
  if (event.equals(15 /* LeftArrow */) || event.equals(17 /* RightArrow */) || event.equals(9 /* Escape */)) {
    const indexes = getToggleDomNodes();
    const index2 = indexes.indexOf(domNode.ownerDocument.activeElement);
    if (index2 >= 0) {
      let newIndex = -1;
      if (event.equals(17 /* RightArrow */)) {
        newIndex = (index2 + 1) % indexes.length;
      } else if (event.equals(15 /* LeftArrow */)) {
        if (index2 === 0) {
          newIndex = indexes.length - 1;
        } else {
          newIndex = index2 - 1;
        }
      }
      if (event.equals(9 /* Escape */)) {
        indexes[index2].blur();
        focusInput();
      } else if (newIndex >= 0) {
        indexes[newIndex].focus();
      }
      EventHelper.stop(event, true);
    }
  }
}

var NLS_CASE_SENSITIVE_TOGGLE_LABEL = localize(10, null);

var NLS_WHOLE_WORD_TOGGLE_LABEL = localize(12, null);

var NLS_REGEX_TOGGLE_LABEL = localize(11, null);

var CaseSensitiveToggle = class extends Toggle {
  constructor(opts) {
    super({
      icon: Codicon.caseSensitive,
      title: NLS_CASE_SENSITIVE_TOGGLE_LABEL + opts.appendTitle,
      isChecked: opts.isChecked,
      hoverLifecycleOptions: opts.hoverLifecycleOptions,
      inputActiveOptionBorder: opts.inputActiveOptionBorder,
      inputActiveOptionForeground: opts.inputActiveOptionForeground,
      inputActiveOptionBackground: opts.inputActiveOptionBackground
    });
  }
};

var WholeWordsToggle = class extends Toggle {
  constructor(opts) {
    super({
      icon: Codicon.wholeWord,
      title: NLS_WHOLE_WORD_TOGGLE_LABEL + opts.appendTitle,
      isChecked: opts.isChecked,
      hoverLifecycleOptions: opts.hoverLifecycleOptions,
      inputActiveOptionBorder: opts.inputActiveOptionBorder,
      inputActiveOptionForeground: opts.inputActiveOptionForeground,
      inputActiveOptionBackground: opts.inputActiveOptionBackground
    });
  }
};

var RegexToggle = class extends Toggle {
  constructor(opts) {
    super({
      icon: Codicon.regex,
      title: NLS_REGEX_TOGGLE_LABEL + opts.appendTitle,
      isChecked: opts.isChecked,
      hoverLifecycleOptions: opts.hoverLifecycleOptions,
      inputActiveOptionBorder: opts.inputActiveOptionBorder,
      inputActiveOptionForeground: opts.inputActiveOptionForeground,
      inputActiveOptionBackground: opts.inputActiveOptionBackground
    });
  }
};
export { navigateToggles, NLS_CASE_SENSITIVE_TOGGLE_LABEL, NLS_WHOLE_WORD_TOGGLE_LABEL, NLS_REGEX_TOGGLE_LABEL, CaseSensitiveToggle, WholeWordsToggle, RegexToggle };
