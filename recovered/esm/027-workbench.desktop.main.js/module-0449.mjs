// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/cssValue.ts
import { FileAccess } from "./module-0033.mjs";


// src/vs/base/browser/cssValue.ts
function asFragment(raw) {
  return raw;
}

function asCssValueWithDefault(cssPropertyValue, dflt) {
  if (cssPropertyValue !== void 0) {
    const variableMatch = cssPropertyValue.match(/^\s*var\((.+)\)$/);
    if (variableMatch) {
      const varArguments = variableMatch[1].split(",", 2);
      if (varArguments.length === 2) {
        dflt = asCssValueWithDefault(varArguments[1].trim(), dflt);
      }
      return `var(${varArguments[0]}, ${dflt})`;
    }
    return cssPropertyValue;
  }
  return dflt;
}

function sizeValue(value2) {
  const out = value2.replaceAll(/[^\w.%+-]/gi, "");
  if (out !== value2) {
    console.warn(`CSS size ${value2} modified to ${out} to be safe for CSS`);
  }
  return asFragment(out);
}

function hexColorValue(value2) {
  const out = value2.replaceAll(/[^[0-9a-fA-F#]]/gi, "");
  if (out !== value2) {
    console.warn(`CSS hex color ${value2} modified to ${out} to be safe for CSS`);
  }
  return asFragment(out);
}

function identValue(value2) {
  const out = value2.replaceAll(/[^_\-a-z0-9]/gi, "");
  if (out !== value2) {
    console.warn(`CSS ident value ${value2} modified to ${out} to be safe for CSS`);
  }
  return asFragment(out);
}

function stringValue(value2) {
  return asFragment(`'${value2.replaceAll(/'/g, "\\000027")}'`);
}

function asCSSUrl(uri5) {
  if (!uri5) {
    return asFragment(`url('')`);
  }
  return inline`url('${asFragment(CSS.escape(FileAccess.uriToBrowserUri(uri5).toString(true)))}')`;
}

function className(value2, escapingExpected = false) {
  const out = CSS.escape(value2);
  if (!escapingExpected && out !== value2) {
    console.warn(`CSS class name ${value2} modified to ${out} to be safe for CSS`);
  }
  return asFragment(out);
}

function inline(strings, ...values) {
  return asFragment(strings.reduce((result, str, i2) => {
    const value2 = values[i2] || "";
    return result + str + value2;
  }, ""));
}

var Builder = class {
  constructor() {
    this._parts = [];
  }
  push(...parts) {
    this._parts.push(...parts);
  }
  join(joiner = "\n") {
    return asFragment(this._parts.join(joiner));
  }
};
export { asFragment, asCssValueWithDefault, sizeValue, hexColorValue, identValue, stringValue, asCSSUrl, className, inline, Builder };
