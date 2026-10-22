// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/files/common/explorerFileNestingTrie.ts



// src/vs/workbench/contrib/files/common/explorerFileNestingTrie.ts
var ExplorerFileNestingTrie = class {
  constructor(config) {
    this.root = new PreTrie();
    for (const [parentPattern, childPatterns] of config) {
      for (const childPattern of childPatterns) {
        this.root.add(parentPattern, childPattern);
      }
    }
  }
  toString() {
    return this.root.toString();
  }
  getAttributes(filename, dirname3) {
    const lastDot = filename.lastIndexOf(".");
    if (lastDot < 1) {
      return {
        dirname: dirname3,
        basename: filename,
        extname: ""
      };
    } else {
      return {
        dirname: dirname3,
        basename: filename.substring(0, lastDot),
        extname: filename.substring(lastDot + 1)
      };
    }
  }
  nest(files, dirname3) {
    const parentFinder = new PreTrie();
    for (const potentialParent of files) {
      const attributes = this.getAttributes(potentialParent, dirname3);
      const children = this.root.get(potentialParent, attributes);
      for (const child of children) {
        parentFinder.add(child, potentialParent);
      }
    }
    const findAllRootAncestors = (file, seen = /* @__PURE__ */ new Set()) => {
      if (seen.has(file)) {
        return [];
      }
      seen.add(file);
      const attributes = this.getAttributes(file, dirname3);
      const ancestors = parentFinder.get(file, attributes);
      if (ancestors.length === 0) {
        return [file];
      }
      if (ancestors.length === 1 && ancestors[0] === file) {
        return [file];
      }
      return ancestors.flatMap((a) => findAllRootAncestors(a, seen));
    };
    const result = /* @__PURE__ */ new Map();
    for (const file of files) {
      let ancestors = findAllRootAncestors(file);
      if (ancestors.length === 0) {
        ancestors = [file];
      }
      for (const ancestor of ancestors) {
        let existing = result.get(ancestor);
        if (!existing) {
          result.set(ancestor, existing = /* @__PURE__ */ new Set());
        }
        if (file !== ancestor) {
          existing.add(file);
        }
      }
    }
    return result;
  }
};

var PreTrie = class _PreTrie {
  constructor() {
    this.value = new SufTrie();
    this.map = /* @__PURE__ */ new Map();
  }
  add(key3, value2) {
    if (key3 === "") {
      this.value.add(key3, value2);
    } else if (key3[0] === "*") {
      this.value.add(key3, value2);
    } else {
      const head = key3[0];
      const rest = key3.slice(1);
      let existing = this.map.get(head);
      if (!existing) {
        this.map.set(head, existing = new _PreTrie());
      }
      existing.add(rest, value2);
    }
  }
  get(key3, attributes) {
    const results = [];
    results.push(...this.value.get(key3, attributes));
    const head = key3[0];
    const rest = key3.slice(1);
    const existing = this.map.get(head);
    if (existing) {
      results.push(...existing.get(rest, attributes));
    }
    return results;
  }
  toString(indentation = "") {
    const lines = [];
    if (this.value.hasItems) {
      lines.push("* => \n" + this.value.toString(indentation + "  "));
    }
    [...this.map.entries()].map(([key3, trie]) => lines.push("^" + key3 + " => \n" + trie.toString(indentation + "  ")));
    return lines.map((l) => indentation + l).join("\n");
  }
};

var SufTrie = class _SufTrie {
  constructor() {
    this.star = [];
    this.epsilon = [];
    this.map = /* @__PURE__ */ new Map();
    this.hasItems = false;
  }
  add(key3, value2) {
    this.hasItems = true;
    if (key3 === "*") {
      this.star.push(new SubstitutionString(value2));
    } else if (key3 === "") {
      this.epsilon.push(new SubstitutionString(value2));
    } else {
      const tail2 = key3[key3.length - 1];
      const rest = key3.slice(0, key3.length - 1);
      if (tail2 === "*") {
        throw Error("Unexpected star in SufTrie key: " + key3);
      } else {
        let existing = this.map.get(tail2);
        if (!existing) {
          this.map.set(tail2, existing = new _SufTrie());
        }
        existing.add(rest, value2);
      }
    }
  }
  get(key3, attributes) {
    const results = [];
    if (key3 === "") {
      results.push(...this.epsilon.map((ss) => ss.substitute(attributes)));
    }
    if (this.star.length) {
      results.push(...this.star.map((ss) => ss.substitute(attributes, key3)));
    }
    const tail2 = key3[key3.length - 1];
    const rest = key3.slice(0, key3.length - 1);
    const existing = this.map.get(tail2);
    if (existing) {
      results.push(...existing.get(rest, attributes));
    }
    return results;
  }
  toString(indentation = "") {
    const lines = [];
    if (this.star.length) {
      lines.push("* => " + this.star.join("; "));
    }
    if (this.epsilon.length) {
      lines.push("\u03B5 => " + this.epsilon.join("; "));
    }
    [...this.map.entries()].map(([key3, trie]) => lines.push(key3 + "$ => \n" + trie.toString(indentation + "  ")));
    return lines.map((l) => indentation + l).join("\n");
  }
};

var substitutionStringTokenizer = /\$[({](capture|basename|dirname|extname)[)}]/g;

var SubstitutionString = class {
  constructor(pattern) {
    this.tokens = [];
    substitutionStringTokenizer.lastIndex = 0;
    let token;
    let lastIndex = 0;
    while (token = substitutionStringTokenizer.exec(pattern)) {
      const prefix = pattern.slice(lastIndex, token.index);
      this.tokens.push(prefix);
      const type = token[1];
      switch (type) {
        case "basename" /* basename */:
        case "dirname" /* dirname */:
        case "extname" /* extname */:
        case "capture" /* capture */:
          this.tokens.push({ capture: type });
          break;
        default:
          throw Error("unknown substitution type: " + type);
      }
      lastIndex = token.index + token[0].length;
    }
    if (lastIndex !== pattern.length) {
      const suffix = pattern.slice(lastIndex, pattern.length);
      this.tokens.push(suffix);
    }
  }
  substitute(attributes, capture) {
    return this.tokens.map((t2) => {
      if (typeof t2 === "string") {
        return t2;
      }
      switch (t2.capture) {
        case "basename" /* basename */:
          return attributes.basename;
        case "dirname" /* dirname */:
          return attributes.dirname;
        case "extname" /* extname */:
          return attributes.extname;
        case "capture" /* capture */:
          return capture || "";
      }
    }).join("");
  }
};
export { ExplorerFileNestingTrie, PreTrie, SufTrie, substitutionStringTokenizer, SubstitutionString };
