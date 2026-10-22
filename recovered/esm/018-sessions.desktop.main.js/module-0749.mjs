// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/suggest/browser/wordDistance.ts
import { BracketSelectionRangeProvider } from "./module-0748.mjs";
import { binarySearch, isFalsyOrEmpty } from "./module-0007.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/editor/contrib/suggest/browser/wordDistance.ts
var WordDistance = class _WordDistance {
  static {
    this.None = new class extends _WordDistance {
      distance() {
        return 0;
      }
    }();
  }
  static async create(service, editor) {
    if (!editor.getOption(134 /* suggest */).localityBonus) {
      return _WordDistance.None;
    }
    if (!editor.hasModel()) {
      return _WordDistance.None;
    }
    const model = editor.getModel();
    const position2 = editor.getPosition();
    if (!service.canComputeWordRanges(model.uri)) {
      return _WordDistance.None;
    }
    const [ranges] = await new BracketSelectionRangeProvider().provideSelectionRanges(model, [position2]);
    if (ranges.length === 0) {
      return _WordDistance.None;
    }
    const wordRanges = await service.computeWordRanges(model.uri, ranges[0].range);
    if (!wordRanges) {
      return _WordDistance.None;
    }
    const wordUntilPos = model.getWordUntilPosition(position2);
    delete wordRanges[wordUntilPos.word];
    return new class extends _WordDistance {
      distance(anchor, item) {
        if (!position2.equals(editor.getPosition())) {
          return 0;
        }
        if (item.kind === 17 /* Keyword */) {
          return 2 << 20;
        }
        const word = typeof item.label === "string" ? item.label : item.label.label;
        const wordLines = wordRanges[word];
        if (isFalsyOrEmpty(wordLines)) {
          return 2 << 20;
        }
        const idx = binarySearch(wordLines, Range2.fromPositions(anchor), Range2.compareRangesUsingStarts);
        const bestWordRange = idx >= 0 ? wordLines[idx] : wordLines[Math.max(0, ~idx - 1)];
        let blockDistance = ranges.length;
        for (const range2 of ranges) {
          if (!Range2.containsRange(range2.range, bestWordRange)) {
            break;
          }
          blockDistance -= 1;
        }
        return blockDistance;
      }
    }();
  }
};
export { WordDistance };
