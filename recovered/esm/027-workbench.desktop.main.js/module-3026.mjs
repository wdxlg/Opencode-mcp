// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/common/testExplorerFilterState.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { MutableObservableValue } from "./module-3025.mjs";
import { observableValue } from "./module-0048.mjs";
import { StoredValue } from "./module-1426.mjs";
import { namespaceTestTag } from "./module-1208.mjs";
import { splitGlobAware } from "./module-0857.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/testing/common/testExplorerFilterState.ts
var ITestExplorerFilterState = createDecorator("testingFilterState");

var tagRe = /!?@([^ ,:]+)/g;

var trimExtraWhitespace = (str) => str.replace(/\s\s+/g, " ").trim();

var TestExplorerFilterState = class extends Disposable {
  constructor(storageService) {
    super();
    this.focusEmitter = this._register(new Emitter());
    /**
     * Mapping of terms to whether they're included in the text.
     */
    this.termFilterState = {};
    /** @inheritdoc */
    this.globList = [];
    /** @inheritdoc */
    this.includeTags = /* @__PURE__ */ new Set();
    /** @inheritdoc */
    this.excludeTags = /* @__PURE__ */ new Set();
    /** @inheritdoc */
    this.text = this._register(new MutableObservableValue(""));
    this.reveal = observableValue("TestExplorerFilterState.reveal", void 0);
    this.onDidRequestInputFocus = this.focusEmitter.event;
    this.selectTestInExplorerEmitter = this._register(new Emitter());
    this.onDidSelectTestInExplorer = this.selectTestInExplorerEmitter.event;
    this.fuzzy = this._register(MutableObservableValue.stored(new StoredValue({
      key: "testHistoryFuzzy",
      scope: 0 /* PROFILE */,
      target: 0 /* USER */
    }, storageService), false));
  }
  /** @inheritdoc */
  didSelectTestInExplorer(testId) {
    this.selectTestInExplorerEmitter.fire(testId);
  }
  /** @inheritdoc */
  focusInput() {
    this.focusEmitter.fire();
  }
  /** @inheritdoc */
  setText(text2) {
    if (text2 === this.text.value) {
      return;
    }
    this.termFilterState = {};
    this.globList = [];
    this.includeTags.clear();
    this.excludeTags.clear();
    let globText = "";
    let lastIndex = 0;
    for (const match2 of text2.matchAll(tagRe)) {
      let nextIndex = match2.index + match2[0].length;
      const tag2 = match2[0];
      const isFilterTerm = allTestFilterTerms.includes(tag2);
      if (isFilterTerm) {
        this.termFilterState[tag2] = true;
      }
      let isTag = false;
      if (text2[nextIndex] === ":") {
        isTag = true;
        nextIndex++;
        let delimiter2 = text2[nextIndex];
        if (delimiter2 !== `"` && delimiter2 !== `'`) {
          delimiter2 = " ";
        } else {
          nextIndex++;
        }
        let tagId = "";
        while (nextIndex < text2.length && text2[nextIndex] !== delimiter2) {
          if (text2[nextIndex] === "\\") {
            tagId += text2[nextIndex + 1];
            nextIndex += 2;
          } else {
            tagId += text2[nextIndex];
            nextIndex++;
          }
        }
        if (match2[0].startsWith("!")) {
          this.excludeTags.add(namespaceTestTag(match2[1], tagId));
        } else {
          this.includeTags.add(namespaceTestTag(match2[1], tagId));
        }
        nextIndex++;
      }
      if (!isFilterTerm && !isTag) {
        continue;
      }
      globText += text2.slice(lastIndex, match2.index);
      lastIndex = nextIndex;
    }
    globText += text2.slice(lastIndex).trim();
    if (globText.length) {
      for (const filter2 of splitGlobAware(globText, ",").map((s) => s.trim()).filter((s) => !!s.length)) {
        if (filter2.startsWith("!")) {
          this.globList.push({ include: false, text: filter2.slice(1).toLowerCase() });
        } else {
          this.globList.push({ include: true, text: filter2.toLowerCase() });
        }
      }
    }
    this.text.value = text2;
  }
  /** @inheritdoc */
  isFilteringFor(term) {
    return !!this.termFilterState[term];
  }
  /** @inheritdoc */
  toggleFilteringFor(term, shouldFilter) {
    const text2 = this.text.value.trim();
    if (shouldFilter !== false && !this.termFilterState[term]) {
      this.setText(text2 ? `${text2} ${term}` : term);
    } else if (shouldFilter !== true && this.termFilterState[term]) {
      this.setText(trimExtraWhitespace(text2.replace(term, "")));
    }
  }
};

TestExplorerFilterState = __decorateClass([
  __decorateParam(0, IStorageService)
], TestExplorerFilterState);

var allTestFilterTerms = [
  "@failed" /* Failed */,
  "@executed" /* Executed */,
  "@doc" /* CurrentDoc */,
  "@openedFiles" /* OpenedFiles */,
  "@hidden" /* Hidden */
];
export { ITestExplorerFilterState, tagRe, trimExtraWhitespace, TestExplorerFilterState, allTestFilterTerms };
