// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/gotoSymbol/browser/referencesModel.ts
import { defaultGenerator } from "./module-0463.mjs";
import { localize } from "./module-0001.mjs";
import { basename2, extUri } from "./module-0034.mjs";
import { Range2 } from "./module-0106.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { dispose } from "./module-0012.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { Emitter } from "./module-0017.mjs";
import { commonPrefixLength2 } from "./module-0030.mjs";


// src/vs/editor/contrib/gotoSymbol/browser/referencesModel.ts
var OneReference = class {
  constructor(isProviderFirst, parent, link2, _rangeCallback) {
    this.isProviderFirst = isProviderFirst;
    this.parent = parent;
    this.link = link2;
    this._rangeCallback = _rangeCallback;
    this.id = defaultGenerator.nextId();
  }
  get uri() {
    return this.link.uri;
  }
  get range() {
    return this._range ?? this.link.targetSelectionRange ?? this.link.range;
  }
  set range(value2) {
    this._range = value2;
    this._rangeCallback(this);
  }
  get ariaMessage() {
    const preview = this.parent.getPreview(this)?.preview(this.range);
    if (!preview) {
      return localize(
        1264,
        null,
        basename2(this.uri),
        this.range.startLineNumber,
        this.range.startColumn
      );
    } else {
      return localize(
        1265,
        null,
        preview.value,
        basename2(this.uri),
        this.range.startLineNumber,
        this.range.startColumn
      );
    }
  }
};

var FilePreview = class {
  constructor(_modelReference) {
    this._modelReference = _modelReference;
  }
  dispose() {
    this._modelReference.dispose();
  }
  preview(range2, n2 = 8) {
    const model = this._modelReference.object.textEditorModel;
    if (!model) {
      return void 0;
    }
    const { startLineNumber, startColumn, endLineNumber, endColumn } = range2;
    const word = model.getWordUntilPosition({ lineNumber: startLineNumber, column: startColumn - n2 });
    const beforeRange = new Range2(startLineNumber, word.startColumn, startLineNumber, startColumn);
    const afterRange = new Range2(endLineNumber, endColumn, endLineNumber, 1073741824 /* MAX_SAFE_SMALL_INTEGER */);
    const before = model.getValueInRange(beforeRange).replace(/^\s+/, "");
    const inside = model.getValueInRange(range2);
    const after2 = model.getValueInRange(afterRange).replace(/\s+$/, "");
    return {
      value: before + inside + after2,
      highlight: { start: before.length, end: before.length + inside.length }
    };
  }
};

var FileReferences = class {
  constructor(parent, uri5) {
    this.parent = parent;
    this.uri = uri5;
    this.children = [];
    this._previews = new ResourceMap();
  }
  dispose() {
    dispose(this._previews.values());
    this._previews.clear();
  }
  getPreview(child) {
    return this._previews.get(child.uri);
  }
  get ariaMessage() {
    const len = this.children.length;
    if (len === 1) {
      return localize(1262, null, basename2(this.uri), this.uri.fsPath);
    } else {
      return localize(1263, null, len, basename2(this.uri), this.uri.fsPath);
    }
  }
  async resolve(textModelResolverService) {
    if (this._previews.size !== 0) {
      return this;
    }
    for (const child of this.children) {
      if (this._previews.has(child.uri)) {
        continue;
      }
      try {
        const ref = await textModelResolverService.createModelReference(child.uri);
        this._previews.set(child.uri, new FilePreview(ref));
      } catch (err) {
        onUnexpectedError(err);
      }
    }
    return this;
  }
};

var ReferencesModel = class _ReferencesModel {
  constructor(links, title) {
    this.groups = [];
    this.references = [];
    this._onDidChangeReferenceRange = new Emitter();
    this.onDidChangeReferenceRange = this._onDidChangeReferenceRange.event;
    this._links = links;
    this._title = title;
    const [providersFirst] = links;
    links.sort(_ReferencesModel._compareReferences);
    let current;
    for (const link2 of links) {
      if (!current || !extUri.isEqual(current.uri, link2.uri, true)) {
        current = new FileReferences(this, link2.uri);
        this.groups.push(current);
      }
      if (current.children.length === 0 || _ReferencesModel._compareReferences(link2, current.children[current.children.length - 1]) !== 0) {
        const oneRef = new OneReference(
          providersFirst === link2,
          current,
          link2,
          (ref) => this._onDidChangeReferenceRange.fire(ref)
        );
        this.references.push(oneRef);
        current.children.push(oneRef);
      }
    }
  }
  dispose() {
    dispose(this.groups);
    this._onDidChangeReferenceRange.dispose();
    this.groups.length = 0;
  }
  clone() {
    return new _ReferencesModel(this._links, this._title);
  }
  get title() {
    return this._title;
  }
  get isEmpty() {
    return this.groups.length === 0;
  }
  get ariaMessage() {
    if (this.isEmpty) {
      return localize(1266, null);
    } else if (this.references.length === 1) {
      return localize(1267, null, this.references[0].uri.fsPath);
    } else if (this.groups.length === 1) {
      return localize(1268, null, this.references.length, this.groups[0].uri.fsPath);
    } else {
      return localize(1269, null, this.references.length, this.groups.length);
    }
  }
  nextOrPreviousReference(reference, next) {
    const { parent } = reference;
    let idx = parent.children.indexOf(reference);
    const childCount = parent.children.length;
    const groupCount = parent.parent.groups.length;
    if (groupCount === 1 || next && idx + 1 < childCount || !next && idx > 0) {
      if (next) {
        idx = (idx + 1) % childCount;
      } else {
        idx = (idx + childCount - 1) % childCount;
      }
      return parent.children[idx];
    }
    idx = parent.parent.groups.indexOf(parent);
    if (next) {
      idx = (idx + 1) % groupCount;
      return parent.parent.groups[idx].children[0];
    } else {
      idx = (idx + groupCount - 1) % groupCount;
      return parent.parent.groups[idx].children[parent.parent.groups[idx].children.length - 1];
    }
  }
  nearestReference(resource, position2) {
    const nearest = this.references.map((ref, idx) => {
      return {
        idx,
        prefixLen: commonPrefixLength2(ref.uri.toString(), resource.toString()),
        offsetDist: Math.abs(ref.range.startLineNumber - position2.lineNumber) * 100 + Math.abs(ref.range.startColumn - position2.column)
      };
    }).sort((a, b) => {
      if (a.prefixLen > b.prefixLen) {
        return -1;
      } else if (a.prefixLen < b.prefixLen) {
        return 1;
      } else if (a.offsetDist < b.offsetDist) {
        return -1;
      } else if (a.offsetDist > b.offsetDist) {
        return 1;
      } else {
        return 0;
      }
    })[0];
    if (nearest) {
      return this.references[nearest.idx];
    }
    return void 0;
  }
  referenceAt(resource, position2) {
    for (const ref of this.references) {
      if (ref.uri.toString() === resource.toString()) {
        if (Range2.containsPosition(ref.range, position2)) {
          return ref;
        }
      }
    }
    return void 0;
  }
  firstReference() {
    for (const ref of this.references) {
      if (ref.isProviderFirst) {
        return ref;
      }
    }
    return this.references[0];
  }
  static _compareReferences(a, b) {
    return extUri.compare(a.uri, b.uri) || Range2.compareRangesUsingStarts(a.range, b.range);
  }
};
export { OneReference, FilePreview, FileReferences, ReferencesModel };
