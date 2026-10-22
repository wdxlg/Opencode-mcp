// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/common/testService.ts
import { createDecorator } from "./module-0077.mjs";
import { Iterable } from "./module-0011.mjs";
import { TestId } from "./module-1207.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { LinkedList } from "./module-0013.mjs";
import { DeferredPromise } from "./module-0036.mjs";
import { WellDefinedPrefixTree } from "./module-1187.mjs";
import { assert } from "./module-0009.mjs";


// src/vs/workbench/contrib/testing/common/testService.ts
var ITestService = createDecorator("testService");

var testCollectionIsEmpty = (collection) => !Iterable.some(collection.rootItems, (r2) => r2.children.size > 0);

var getContextForTestItem = (collection, id2) => {
  if (typeof id2 === "string") {
    id2 = TestId.fromString(id2);
  }
  if (id2.isRoot) {
    return { controller: id2.toString() };
  }
  const context2 = { $mid: 16 /* TestItemContext */, tests: [] };
  for (const i2 of id2.idsFromRoot()) {
    if (!i2.isRoot) {
      const test = collection.getNodeById(i2.toString());
      if (test) {
        context2.tests.push(test);
      }
    }
  }
  return context2;
};

var expandAndGetTestById = async (collection, id2, ct = CancellationToken.None) => {
  const idPath = [...TestId.fromString(id2).idsFromRoot()];
  let expandToLevel = 0;
  for (let i2 = idPath.length - 1; !ct.isCancellationRequested && i2 >= expandToLevel; ) {
    const id3 = idPath[i2].toString();
    const existing = collection.getNodeById(id3);
    if (!existing) {
      i2--;
      continue;
    }
    if (i2 === idPath.length - 1) {
      return existing;
    }
    if (!existing.children.has(idPath[i2 + 1].toString())) {
      await collection.expand(id3, 0);
    }
    expandToLevel = i2 + 1;
    i2 = idPath.length - 1;
  }
  return void 0;
};

var waitForTestToBeIdle = (testService, test) => {
  if (!test.item.busy) {
    return;
  }
  return new Promise((resolve3) => {
    const l = testService.onDidProcessDiff(() => {
      if (testService.collection.getNodeById(test.item.extId)?.item.busy !== true) {
        resolve3();
        l.dispose();
      }
    });
  });
};

var testsInFile = async function* (testService, ident, uri5, waitForIdle2 = true, descendInFile = true) {
  const canonicalUri = ident.asCanonicalUri(uri5);
  const queue = new LinkedList();
  const existing = [...testService.collection.getNodeByUrl(canonicalUri)].sort((a, b) => a.item.extId.length - b.item.extId.length);
  for (let i2 = 0; i2 < existing.length - 1; i2++) {
    const prefix = existing[i2].item.extId + "\0" /* Delimiter */;
    for (let k = i2 + 1; k < existing.length; k++) {
      if (existing[k].item.extId.startsWith(prefix)) {
        existing.splice(k--, 1);
      }
    }
  }
  queue.push(existing.length ? existing.map((e) => e.item.extId) : testService.collection.rootIds);
  let n2 = 0;
  let gather = [];
  while (queue.size > 0) {
    const next = queue.pop();
    let ids;
    if (!(next instanceof DeferredPromise)) {
      ids = next;
    } else if (next.isSettled) {
      ids = next.value || Iterable.empty();
    } else {
      if (gather.length) {
        yield gather;
        gather = [];
      }
      ids = await next.p;
    }
    for (const id2 of ids) {
      n2++;
      const test = testService.collection.getNodeById(id2);
      if (!test) {
        continue;
      }
      if (!test.item.uri) {
        queue.push(test.children);
        continue;
      }
      if (ident.extUri.isEqual(canonicalUri, test.item.uri)) {
        gather.push(test);
        if (!descendInFile) {
          continue;
        }
      }
      if (ident.extUri.isEqualOrParent(canonicalUri, test.item.uri)) {
        let prom;
        if (test.expand === 1 /* Expandable */) {
          prom = testService.collection.expand(test.item.extId, 1);
        }
        if (waitForIdle2) {
          if (prom) {
            prom = prom.then(() => waitForTestToBeIdle(testService, test));
          } else if (test.item.busy) {
            prom = waitForTestToBeIdle(testService, test);
          }
        }
        if (prom) {
          queue.push(DeferredPromise.fromPromise(prom.then(() => test.children)));
        } else if (test.children.size) {
          queue.push(test.children);
        }
      }
    }
  }
  if (gather.length) {
    yield gather;
  }
};

var testsUnderUri = async function* (testService, ident, uri5, waitForIdle2 = true) {
  const queue = [testService.collection.rootIds];
  while (queue.length) {
    for (const testId of queue.pop()) {
      const test = testService.collection.getNodeById(testId);
      if (!test) {
      } else if (test.item.uri && ident.extUri.isEqualOrParent(test.item.uri, uri5)) {
        yield test;
      } else if (!test.item.uri || ident.extUri.isEqualOrParent(uri5, test.item.uri)) {
        if (test.expand === 1 /* Expandable */) {
          await testService.collection.expand(test.item.extId, 1);
        }
        if (waitForIdle2) {
          await waitForTestToBeIdle(testService, test);
        }
        queue.push(test.children.values());
      }
    }
  }
};

var simplifyTestsToExecute = (collection, tests) => {
  if (tests.length < 2) {
    return tests;
  }
  const tree = new WellDefinedPrefixTree();
  for (const test of tests) {
    tree.insert(TestId.fromString(test.item.extId).path, test);
  }
  const out = [];
  const process3 = (currentId, node) => {
    if (node.value) {
      return node.value;
    }
    assert(!!node.children, "expect to have children");
    const thisChildren = [];
    for (const [part, child] of node.children) {
      currentId.push(part);
      const c = process3(currentId, child);
      if (c) {
        thisChildren.push(c);
      }
      currentId.pop();
    }
    if (!thisChildren.length) {
      return;
    }
    const id2 = new TestId(currentId);
    const test = collection.getNodeById(id2.toString());
    if (test?.children.size === thisChildren.length) {
      return test;
    }
    out.push(...thisChildren);
    return;
  };
  for (const [id2, node] of tree.entries) {
    const n2 = process3([id2], node);
    if (n2) {
      out.push(n2);
    }
  }
  return out;
};
export { ITestService, testCollectionIsEmpty, getContextForTestItem, expandAndGetTestById, waitForTestToBeIdle, testsInFile, testsUnderUri, simplifyTestsToExecute };
