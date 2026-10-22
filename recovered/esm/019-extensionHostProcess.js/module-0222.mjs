// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/contrib/testing/common/testId.ts



// src/vs/workbench/contrib/testing/common/testId.ts
var TestId = class _TestId {
  constructor(path, viewEnd = path.length) {
    this.path = path;
    this.viewEnd = viewEnd;
    if (path.length === 0 || viewEnd < 1) {
      throw new Error("cannot create test with empty path");
    }
  }
  /**
   * Creates a test ID from an ext host test item.
   */
  static fromExtHostTestItem(item, rootId, parent = item.parent) {
    if (item._isRoot) {
      return new _TestId([rootId]);
    }
    const path = [item.id];
    for (let i = parent; i && i.id !== rootId; i = i.parent) {
      path.push(i.id);
    }
    path.push(rootId);
    return new _TestId(path.reverse());
  }
  /**
   * Cheaply ets whether the ID refers to the root .
   */
  static isRoot(idString) {
    return !idString.includes("\0" /* Delimiter */);
  }
  /**
   * Cheaply gets whether the ID refers to the root .
   */
  static root(idString) {
    const idx = idString.indexOf("\0" /* Delimiter */);
    return idx === -1 ? idString : idString.slice(0, idx);
  }
  /**
   * Creates a test ID from a serialized TestId instance.
   */
  static fromString(idString) {
    return new _TestId(idString.split("\0" /* Delimiter */));
  }
  /**
   * Gets the ID resulting from adding b to the base ID.
   */
  static join(base, b) {
    return new _TestId([...base.path, b]);
  }
  /**
   * Splits a test ID into its parts.
   */
  static split(idString) {
    return idString.split("\0" /* Delimiter */);
  }
  /**
   * Gets the string ID resulting from adding b to the base ID.
   */
  static joinToString(base, b) {
    return base.toString() + "\0" /* Delimiter */ + b;
  }
  /**
   * Cheaply gets the parent ID of a test identified with the string.
   */
  static parentId(idString) {
    const idx = idString.lastIndexOf("\0" /* Delimiter */);
    return idx === -1 ? void 0 : idString.slice(0, idx);
  }
  /**
   * Cheaply gets the local ID of a test identified with the string.
   */
  static localId(idString) {
    const idx = idString.lastIndexOf("\0" /* Delimiter */);
    return idx === -1 ? idString : idString.slice(idx + "\0" /* Delimiter */.length);
  }
  /**
   * Gets whether maybeChild is a child of maybeParent.
   * todo@connor4312: review usages of this to see if using the WellDefinedPrefixTree is better
   */
  static isChild(maybeParent, maybeChild) {
    return maybeChild[maybeParent.length] === "\0" /* Delimiter */ && maybeChild.startsWith(maybeParent);
  }
  /**
   * Compares the position of the two ID strings.
   * todo@connor4312: review usages of this to see if using the WellDefinedPrefixTree is better
   */
  static compare(a, b) {
    if (a === b) {
      return 0 /* IsSame */;
    }
    if (_TestId.isChild(a, b)) {
      return 2 /* IsChild */;
    }
    if (_TestId.isChild(b, a)) {
      return 3 /* IsParent */;
    }
    return 1 /* Disconnected */;
  }
  static getLengthOfCommonPrefix(length, getId) {
    if (length === 0) {
      return 0;
    }
    let commonPrefix = 0;
    while (commonPrefix < length - 1) {
      for (let i = 1; i < length; i++) {
        const a = getId(i - 1);
        const b = getId(i);
        if (a.path[commonPrefix] !== b.path[commonPrefix]) {
          return commonPrefix;
        }
      }
      commonPrefix++;
    }
    return commonPrefix;
  }
  /**
   * Gets the ID of the parent test.
   */
  get rootId() {
    return new _TestId(this.path, 1);
  }
  /**
   * Gets the ID of the parent test.
   */
  get parentId() {
    return this.viewEnd > 1 ? new _TestId(this.path, this.viewEnd - 1) : void 0;
  }
  /**
   * Gets the local ID of the current full test ID.
   */
  get localId() {
    return this.path[this.viewEnd - 1];
  }
  /**
   * Gets whether this ID refers to the root.
   */
  get controllerId() {
    return this.path[0];
  }
  /**
   * Gets whether this ID refers to the root.
   */
  get isRoot() {
    return this.viewEnd === 1;
  }
  /**
   * Returns an iterable that yields IDs of all parent items down to and
   * including the current item.
   */
  *idsFromRoot() {
    for (let i = 1; i <= this.viewEnd; i++) {
      yield new _TestId(this.path, i);
    }
  }
  /**
   * Returns an iterable that yields IDs of the current item up to the root
   * item.
   */
  *idsToRoot() {
    for (let i = this.viewEnd; i > 0; i--) {
      yield new _TestId(this.path, i);
    }
  }
  /**
   * Compares the other test ID with this one.
   */
  compare(other) {
    if (typeof other === "string") {
      return _TestId.compare(this.toString(), other);
    }
    for (let i = 0; i < other.viewEnd && i < this.viewEnd; i++) {
      if (other.path[i] !== this.path[i]) {
        return 1 /* Disconnected */;
      }
    }
    if (other.viewEnd > this.viewEnd) {
      return 2 /* IsChild */;
    }
    if (other.viewEnd < this.viewEnd) {
      return 3 /* IsParent */;
    }
    return 0 /* IsSame */;
  }
  /**
   * Serializes the ID.
   */
  toJSON() {
    return this.toString();
  }
  /**
   * Serializes the ID to a string.
   */
  toString() {
    if (!this.stringifed) {
      this.stringifed = this.path[0];
      for (let i = 1; i < this.viewEnd; i++) {
        this.stringifed += "\0" /* Delimiter */;
        this.stringifed += this.path[i];
      }
    }
    return this.stringifed;
  }
};
export { TestId };
