// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/languages/supports/inplaceReplaceSupport.ts



// src/vs/editor/common/languages/supports/inplaceReplaceSupport.ts
var BasicInplaceReplace = class _BasicInplaceReplace {
  constructor() {
    this._defaultValueSet = [
      ["true", "false"],
      ["True", "False"],
      ["Private", "Public", "Friend", "ReadOnly", "Partial", "Protected", "WriteOnly"],
      ["public", "protected", "private"]
    ];
  }
  static {
    this.INSTANCE = new _BasicInplaceReplace();
  }
  navigateValueSet(range1, text1, range2, text2, up) {
    if (range1 && text1) {
      const result = this.doNavigateValueSet(text1, up);
      if (result) {
        return {
          range: range1,
          value: result
        };
      }
    }
    if (range2 && text2) {
      const result = this.doNavigateValueSet(text2, up);
      if (result) {
        return {
          range: range2,
          value: result
        };
      }
    }
    return null;
  }
  doNavigateValueSet(text2, up) {
    const numberResult = this.numberReplace(text2, up);
    if (numberResult !== null) {
      return numberResult;
    }
    return this.textReplace(text2, up);
  }
  numberReplace(value2, up) {
    const precision = Math.pow(10, value2.length - (value2.lastIndexOf(".") + 1));
    let n1 = Number(value2);
    const n2 = parseFloat(value2);
    if (!isNaN(n1) && !isNaN(n2) && n1 === n2) {
      if (n1 === 0 && !up) {
        return null;
      } else {
        n1 = Math.floor(n1 * precision);
        n1 += up ? precision : -precision;
        return String(n1 / precision);
      }
    }
    return null;
  }
  textReplace(value2, up) {
    return this.valueSetsReplace(this._defaultValueSet, value2, up);
  }
  valueSetsReplace(valueSets, value2, up) {
    let result = null;
    for (let i2 = 0, len = valueSets.length; result === null && i2 < len; i2++) {
      result = this.valueSetReplace(valueSets[i2], value2, up);
    }
    return result;
  }
  valueSetReplace(valueSet, value2, up) {
    let idx = valueSet.indexOf(value2);
    if (idx >= 0) {
      idx += up ? 1 : -1;
      if (idx < 0) {
        idx = valueSet.length - 1;
      } else {
        idx %= valueSet.length;
      }
      return valueSet[idx];
    }
    return null;
  }
};
export { BasicInplaceReplace };
