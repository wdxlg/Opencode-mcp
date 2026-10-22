// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostTestItem.ts
import { Range } from "./module-0091.mjs";
import { MarkdownString3, Range3, TestItem, TestTag2 } from "./module-0245.mjs";
import { TestId } from "./module-0222.mjs";
import { URI } from "./module-0025.mjs";
import { denamespaceTestTag } from "./module-0223.mjs";
import { createPrivateApiFor, getPrivateApiFor } from "./module-0228.mjs";
import { TestItemCollection, createTestItemChildren } from "./module-0227.mjs";


// src/vs/workbench/api/common/extHostTestItem.ts
var testItemPropAccessor = (api, defaultValue, equals5, toUpdate) => {
  let value = defaultValue;
  return {
    enumerable: true,
    configurable: false,
    get() {
      return value;
    },
    set(newValue) {
      if (!equals5(value, newValue)) {
        const oldValue = value;
        value = newValue;
        api.listener?.(toUpdate(newValue, oldValue));
      }
    }
  };
};

var strictEqualComparator2 = (a, b) => a === b;

var propComparators = {
  range: (a, b) => {
    if (a === b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    return a.isEqual(b);
  },
  label: strictEqualComparator2,
  description: strictEqualComparator2,
  sortText: strictEqualComparator2,
  busy: strictEqualComparator2,
  error: strictEqualComparator2,
  canResolveChildren: strictEqualComparator2,
  tags: (a, b) => {
    if (a.length !== b.length) {
      return false;
    }
    if (a.some((t1) => !b.find((t2) => t1.id === t2.id))) {
      return false;
    }
    return true;
  }
};

var evSetProps = (fn) => (v) => ({ op: 4 /* SetProp */, update: fn(v) });

var makePropDescriptors = (api, label) => ({
  range: (() => {
    let value;
    const updateProps = evSetProps((r2) => ({ range: Range.lift(Range3.from(r2)) }));
    return {
      enumerable: true,
      configurable: false,
      get() {
        return value;
      },
      set(newValue) {
        api.listener?.({ op: 6 /* DocumentSynced */ });
        if (!propComparators.range(value, newValue)) {
          value = newValue;
          api.listener?.(updateProps(newValue));
        }
      }
    };
  })(),
  label: testItemPropAccessor(api, label, propComparators.label, evSetProps((label2) => ({ label: label2 }))),
  description: testItemPropAccessor(api, void 0, propComparators.description, evSetProps((description) => ({ description }))),
  sortText: testItemPropAccessor(api, void 0, propComparators.sortText, evSetProps((sortText) => ({ sortText }))),
  canResolveChildren: testItemPropAccessor(api, false, propComparators.canResolveChildren, (state) => ({
    op: 2 /* UpdateCanResolveChildren */,
    state
  })),
  busy: testItemPropAccessor(api, false, propComparators.busy, evSetProps((busy) => ({ busy }))),
  error: testItemPropAccessor(api, void 0, propComparators.error, evSetProps((error) => ({ error: MarkdownString3.fromStrict(error) || null }))),
  tags: testItemPropAccessor(api, [], propComparators.tags, (current, previous) => ({
    op: 1 /* SetTags */,
    new: current.map(TestTag2.from),
    old: previous.map(TestTag2.from)
  }))
});

var toItemFromPlain = (item) => {
  const testId = TestId.fromString(item.extId);
  const testItem = new TestItemImpl(testId.controllerId, testId.localId, item.label, URI.revive(item.uri) || void 0);
  testItem.range = Range3.to(item.range || void 0);
  testItem.description = item.description || void 0;
  testItem.sortText = item.sortText || void 0;
  testItem.tags = item.tags.map((t) => TestTag2.to({ id: denamespaceTestTag(t).tagId }));
  return testItem;
};

var toItemFromContext = (context) => {
  let node;
  for (const test of context.tests) {
    const next = toItemFromPlain(test.item);
    getPrivateApiFor(next).parent = node;
    node = next;
  }
  return node;
};

var TestItemImpl = class _TestItemImpl {
  /**
   * Note that data is deprecated and here for back-compat only
   */
  constructor(controllerId, id2, label, uri2) {
    if (id2.includes("\0" /* Delimiter */)) {
      throw new Error(`Test IDs may not include the ${JSON.stringify(id2)} symbol`);
    }
    const api = createPrivateApiFor(this, controllerId);
    Object.defineProperties(this, {
      id: {
        value: id2,
        enumerable: true,
        writable: false
      },
      uri: {
        value: uri2,
        enumerable: true,
        writable: false
      },
      parent: {
        enumerable: false,
        get() {
          return api.parent instanceof TestItemRootImpl ? void 0 : api.parent;
        }
      },
      children: {
        value: createTestItemChildren(api, getPrivateApiFor, _TestItemImpl),
        enumerable: true,
        writable: false
      },
      ...makePropDescriptors(api, label)
    });
  }
};

var TestItemRootImpl = class extends TestItemImpl {
  constructor(controllerId, label) {
    super(controllerId, controllerId, label, void 0);
    this._isRoot = true;
  }
};

var ExtHostTestItemCollection = class extends TestItemCollection {
  constructor(controllerId, controllerLabel, editors) {
    super({
      controllerId,
      getDocumentVersion: (uri2) => uri2 && editors.getDocument(uri2)?.version,
      getApiFor: getPrivateApiFor,
      getChildren: (item) => item.children,
      root: new TestItemRootImpl(controllerId, controllerLabel),
      toITestItem: TestItem.from
    });
  }
};
export { testItemPropAccessor, strictEqualComparator2, propComparators, evSetProps, makePropDescriptors, toItemFromPlain, toItemFromContext, TestItemImpl, TestItemRootImpl, ExtHostTestItemCollection };
