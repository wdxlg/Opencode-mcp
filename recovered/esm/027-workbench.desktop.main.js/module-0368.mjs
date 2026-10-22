// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/modelLineProjectionData.ts
import { assertNever } from "./module-0009.mjs";
import { Position } from "./module-0079.mjs";


// src/vs/editor/common/modelLineProjectionData.ts
var ModelLineProjectionData = class {
  constructor(injectionOffsets, injectionOptions, breakOffsets, breakOffsetsVisibleColumn, wrappedTextIndentLength) {
    this.injectionOffsets = injectionOffsets;
    this.injectionOptions = injectionOptions;
    this.breakOffsets = breakOffsets;
    this.breakOffsetsVisibleColumn = breakOffsetsVisibleColumn;
    this.wrappedTextIndentLength = wrappedTextIndentLength;
  }
  getOutputLineCount() {
    return this.breakOffsets.length;
  }
  getMinOutputOffset(outputLineIndex) {
    if (outputLineIndex > 0) {
      return this.wrappedTextIndentLength;
    }
    return 0;
  }
  getLineLength(outputLineIndex) {
    const startOffset = outputLineIndex > 0 ? this.breakOffsets[outputLineIndex - 1] : 0;
    const endOffset = this.breakOffsets[outputLineIndex];
    let lineLength = endOffset - startOffset;
    if (outputLineIndex > 0) {
      lineLength += this.wrappedTextIndentLength;
    }
    return lineLength;
  }
  getMaxOutputOffset(outputLineIndex) {
    return this.getLineLength(outputLineIndex);
  }
  translateToInputOffset(outputLineIndex, outputOffset) {
    if (outputLineIndex > 0) {
      outputOffset = Math.max(0, outputOffset - this.wrappedTextIndentLength);
    }
    const offsetInInputWithInjection = outputLineIndex === 0 ? outputOffset : this.breakOffsets[outputLineIndex - 1] + outputOffset;
    let offsetInInput = offsetInInputWithInjection;
    if (this.injectionOffsets !== null) {
      for (let i2 = 0; i2 < this.injectionOffsets.length; i2++) {
        if (offsetInInput > this.injectionOffsets[i2]) {
          if (offsetInInput < this.injectionOffsets[i2] + this.injectionOptions[i2].content.length) {
            offsetInInput = this.injectionOffsets[i2];
          } else {
            offsetInInput -= this.injectionOptions[i2].content.length;
          }
        } else {
          break;
        }
      }
    }
    return offsetInInput;
  }
  translateToOutputPosition(inputOffset, affinity = 2 /* None */) {
    let inputOffsetInInputWithInjection = inputOffset;
    if (this.injectionOffsets !== null) {
      for (let i2 = 0; i2 < this.injectionOffsets.length; i2++) {
        if (inputOffset < this.injectionOffsets[i2]) {
          break;
        }
        if (affinity !== 1 /* Right */ && inputOffset === this.injectionOffsets[i2]) {
          break;
        }
        inputOffsetInInputWithInjection += this.injectionOptions[i2].content.length;
      }
    }
    return this.offsetInInputWithInjectionsToOutputPosition(inputOffsetInInputWithInjection, affinity);
  }
  offsetInInputWithInjectionsToOutputPosition(offsetInInputWithInjections, affinity = 2 /* None */) {
    let low = 0;
    let high = this.breakOffsets.length - 1;
    let mid = 0;
    let midStart = 0;
    while (low <= high) {
      mid = low + (high - low) / 2 | 0;
      const midStop = this.breakOffsets[mid];
      midStart = mid > 0 ? this.breakOffsets[mid - 1] : 0;
      if (affinity === 0 /* Left */) {
        if (offsetInInputWithInjections <= midStart) {
          high = mid - 1;
        } else if (offsetInInputWithInjections > midStop) {
          low = mid + 1;
        } else {
          break;
        }
      } else {
        if (offsetInInputWithInjections < midStart) {
          high = mid - 1;
        } else if (offsetInInputWithInjections >= midStop) {
          low = mid + 1;
        } else {
          break;
        }
      }
    }
    let outputOffset = offsetInInputWithInjections - midStart;
    if (mid > 0) {
      outputOffset += this.wrappedTextIndentLength;
    }
    return new OutputPosition(mid, outputOffset);
  }
  normalizeOutputPosition(outputLineIndex, outputOffset, affinity) {
    if (this.injectionOffsets !== null) {
      const offsetInInputWithInjections = this.outputPositionToOffsetInInputWithInjections(outputLineIndex, outputOffset);
      const normalizedOffsetInUnwrappedLine = this.normalizeOffsetInInputWithInjectionsAroundInjections(offsetInInputWithInjections, affinity);
      if (normalizedOffsetInUnwrappedLine !== offsetInInputWithInjections) {
        return this.offsetInInputWithInjectionsToOutputPosition(normalizedOffsetInUnwrappedLine, affinity);
      }
    }
    if (affinity === 0 /* Left */) {
      if (outputLineIndex > 0 && outputOffset === this.getMinOutputOffset(outputLineIndex)) {
        return new OutputPosition(outputLineIndex - 1, this.getMaxOutputOffset(outputLineIndex - 1));
      }
    } else if (affinity === 1 /* Right */) {
      const maxOutputLineIndex = this.getOutputLineCount() - 1;
      if (outputLineIndex < maxOutputLineIndex && outputOffset === this.getMaxOutputOffset(outputLineIndex)) {
        return new OutputPosition(outputLineIndex + 1, this.getMinOutputOffset(outputLineIndex + 1));
      }
    }
    return new OutputPosition(outputLineIndex, outputOffset);
  }
  outputPositionToOffsetInInputWithInjections(outputLineIndex, outputOffset) {
    if (outputLineIndex > 0) {
      outputOffset = Math.max(0, outputOffset - this.wrappedTextIndentLength);
    }
    const result = (outputLineIndex > 0 ? this.breakOffsets[outputLineIndex - 1] : 0) + outputOffset;
    return result;
  }
  normalizeOffsetInInputWithInjectionsAroundInjections(offsetInInputWithInjections, affinity) {
    const injectedText = this.getInjectedTextAtOffset(offsetInInputWithInjections);
    if (!injectedText) {
      return offsetInInputWithInjections;
    }
    if (affinity === 2 /* None */) {
      if (offsetInInputWithInjections === injectedText.offsetInInputWithInjections + injectedText.length && hasRightCursorStop(this.injectionOptions[injectedText.injectedTextIndex].cursorStops)) {
        return injectedText.offsetInInputWithInjections + injectedText.length;
      } else {
        let result = injectedText.offsetInInputWithInjections;
        if (hasLeftCursorStop(this.injectionOptions[injectedText.injectedTextIndex].cursorStops)) {
          return result;
        }
        let index2 = injectedText.injectedTextIndex - 1;
        while (index2 >= 0 && this.injectionOffsets[index2] === this.injectionOffsets[injectedText.injectedTextIndex]) {
          if (hasRightCursorStop(this.injectionOptions[index2].cursorStops)) {
            break;
          }
          result -= this.injectionOptions[index2].content.length;
          if (hasLeftCursorStop(this.injectionOptions[index2].cursorStops)) {
            break;
          }
          index2--;
        }
        return result;
      }
    } else if (affinity === 1 /* Right */ || affinity === 4 /* RightOfInjectedText */) {
      let result = injectedText.offsetInInputWithInjections + injectedText.length;
      let index2 = injectedText.injectedTextIndex;
      while (index2 + 1 < this.injectionOffsets.length && this.injectionOffsets[index2 + 1] === this.injectionOffsets[index2]) {
        result += this.injectionOptions[index2 + 1].content.length;
        index2++;
      }
      return result;
    } else if (affinity === 0 /* Left */ || affinity === 3 /* LeftOfInjectedText */) {
      let result = injectedText.offsetInInputWithInjections;
      let index2 = injectedText.injectedTextIndex;
      while (index2 - 1 >= 0 && this.injectionOffsets[index2 - 1] === this.injectionOffsets[index2]) {
        result -= this.injectionOptions[index2 - 1].content.length;
        index2--;
      }
      return result;
    }
    assertNever(affinity);
  }
  getInjectedText(outputLineIndex, outputOffset) {
    const offset = this.outputPositionToOffsetInInputWithInjections(outputLineIndex, outputOffset);
    const injectedText = this.getInjectedTextAtOffset(offset);
    if (!injectedText) {
      return null;
    }
    return {
      options: this.injectionOptions[injectedText.injectedTextIndex]
    };
  }
  getInjectedTextAtOffset(offsetInInputWithInjections) {
    const injectionOffsets = this.injectionOffsets;
    const injectionOptions = this.injectionOptions;
    if (injectionOffsets !== null) {
      let totalInjectedTextLengthBefore = 0;
      for (let i2 = 0; i2 < injectionOffsets.length; i2++) {
        const length = injectionOptions[i2].content.length;
        const injectedTextStartOffsetInInputWithInjections = injectionOffsets[i2] + totalInjectedTextLengthBefore;
        const injectedTextEndOffsetInInputWithInjections = injectionOffsets[i2] + totalInjectedTextLengthBefore + length;
        if (injectedTextStartOffsetInInputWithInjections > offsetInInputWithInjections) {
          break;
        }
        if (offsetInInputWithInjections <= injectedTextEndOffsetInInputWithInjections) {
          return {
            injectedTextIndex: i2,
            offsetInInputWithInjections: injectedTextStartOffsetInInputWithInjections,
            length
          };
        }
        totalInjectedTextLengthBefore += length;
      }
    }
    return void 0;
  }
};

function hasRightCursorStop(cursorStop) {
  if (cursorStop === null || cursorStop === void 0) {
    return true;
  }
  return cursorStop === 1 /* Right */ || cursorStop === 0 /* Both */;
}

function hasLeftCursorStop(cursorStop) {
  if (cursorStop === null || cursorStop === void 0) {
    return true;
  }
  return cursorStop === 2 /* Left */ || cursorStop === 0 /* Both */;
}

var OutputPosition = class {
  constructor(outputLineIndex, outputOffset) {
    this.outputLineIndex = outputLineIndex;
    this.outputOffset = outputOffset;
  }
  toString() {
    return `${this.outputLineIndex}:${this.outputOffset}`;
  }
  toPosition(baseLineNumber) {
    return new Position(baseLineNumber + this.outputLineIndex, this.outputOffset + 1);
  }
};
export { hasRightCursorStop, hasLeftCursorStop, ModelLineProjectionData, OutputPosition };
