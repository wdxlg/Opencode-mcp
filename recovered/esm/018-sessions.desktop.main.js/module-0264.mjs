// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/dataTransfer.ts
import { generateUuid } from "./module-0190.mjs";
import { Iterable } from "./module-0011.mjs";
import { distinct } from "./module-0007.mjs";


// src/vs/base/common/dataTransfer.ts
function createStringDataTransferItem(stringOrPromise, id2) {
  return {
    id: id2,
    asString: async () => stringOrPromise,
    asFile: () => void 0,
    value: typeof stringOrPromise === "string" ? stringOrPromise : void 0
  };
}

function createFileDataTransferItem(fileName, uri4, data, id2) {
  const file = { id: generateUuid(), name: fileName, uri: uri4, data };
  return {
    id: id2,
    asString: async () => "",
    asFile: () => file,
    value: void 0
  };
}

var VSDataTransfer = class {
  constructor() {
    this._entries = /* @__PURE__ */ new Map();
  }
  get size() {
    let size3 = 0;
    for (const _ of this._entries) {
      size3++;
    }
    return size3;
  }
  has(mimeType) {
    return this._entries.has(this.toKey(mimeType));
  }
  matches(pattern) {
    const mimes = [...this._entries.keys()];
    if (Iterable.some(this, ([_, item]) => item.asFile())) {
      mimes.push("files");
    }
    return matchesMimeType_normalized(normalizeMimeType2(pattern), mimes);
  }
  get(mimeType) {
    return this._entries.get(this.toKey(mimeType))?.[0];
  }
  /**
   * Add a new entry to this data transfer.
   *
   * This does not replace existing entries for `mimeType`.
   */
  append(mimeType, value2) {
    const existing = this._entries.get(mimeType);
    if (existing) {
      existing.push(value2);
    } else {
      this._entries.set(this.toKey(mimeType), [value2]);
    }
  }
  /**
   * Set the entry for a given mime type.
   *
   * This replaces all existing entries for `mimeType`.
   */
  replace(mimeType, value2) {
    this._entries.set(this.toKey(mimeType), [value2]);
  }
  /**
   * Remove all entries for `mimeType`.
   */
  delete(mimeType) {
    this._entries.delete(this.toKey(mimeType));
  }
  /**
   * Iterate over all `[mime, item]` pairs in this data transfer.
   *
   * There may be multiple entries for each mime type.
   */
  *[Symbol.iterator]() {
    for (const [mine, items] of this._entries) {
      for (const item of items) {
        yield [mine, item];
      }
    }
  }
  toKey(mimeType) {
    return normalizeMimeType2(mimeType);
  }
};

function normalizeMimeType2(mimeType) {
  return mimeType.toLowerCase();
}

function matchesMimeType(pattern, mimeTypes) {
  return matchesMimeType_normalized(
    normalizeMimeType2(pattern),
    mimeTypes.map(normalizeMimeType2)
  );
}

function matchesMimeType_normalized(normalizedPattern, normalizedMimeTypes) {
  if (normalizedPattern === "*/*") {
    return normalizedMimeTypes.length > 0;
  }
  if (normalizedMimeTypes.includes(normalizedPattern)) {
    return true;
  }
  const wildcard = normalizedPattern.match(/^([a-z]+)\/([a-z]+|\*)$/i);
  if (!wildcard) {
    return false;
  }
  const [_, type, subtype] = wildcard;
  if (subtype === "*") {
    return normalizedMimeTypes.some((mime) => mime.startsWith(type + "/"));
  }
  return false;
}

var UriList = Object.freeze({
  // http://amundsen.com/hypermedia/urilist/
  create: (entries2) => {
    return distinct(entries2.map((x) => x.toString())).join("\r\n");
  },
  split: (str) => {
    return str.split("\r\n");
  },
  parse: (str) => {
    return UriList.split(str).filter((value2) => !value2.startsWith("#"));
  }
});
export { createStringDataTransferItem, createFileDataTransferItem, normalizeMimeType2, matchesMimeType, matchesMimeType_normalized, VSDataTransfer, UriList };
