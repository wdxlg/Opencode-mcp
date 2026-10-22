// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/paging.ts
import { Event2 } from "./module-0017.mjs";
import { range } from "./module-0007.mjs";
import { CancellationError } from "./module-0004.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";


// src/vs/base/common/paging.ts
function createPage(elements) {
  return {
    isResolved: !!elements,
    promise: null,
    cts: null,
    promiseIndexes: /* @__PURE__ */ new Set(),
    elements: elements || []
  };
}

function singlePagePager(elements) {
  return {
    firstPage: elements,
    total: elements.length,
    pageSize: elements.length,
    getPage: (pageIndex, cancellationToken) => {
      return Promise.resolve(elements);
    }
  };
}

var PagedModel = class {
  constructor(arg) {
    this.pages = [];
    this.onDidIncrementLength = Event2.None;
    this.pager = Array.isArray(arg) ? singlePagePager(arg) : arg;
    const totalPages = Math.ceil(this.pager.total / this.pager.pageSize);
    this.pages = [
      createPage(this.pager.firstPage.slice()),
      ...range(totalPages - 1).map(() => createPage())
    ];
  }
  get length() {
    return this.pager.total;
  }
  isResolved(index2) {
    const pageIndex = Math.floor(index2 / this.pager.pageSize);
    const page = this.pages[pageIndex];
    return !!page.isResolved;
  }
  get(index2) {
    const pageIndex = Math.floor(index2 / this.pager.pageSize);
    const indexInPage = index2 % this.pager.pageSize;
    const page = this.pages[pageIndex];
    return page.elements[indexInPage];
  }
  resolve(index2, cancellationToken) {
    if (cancellationToken.isCancellationRequested) {
      return Promise.reject(new CancellationError());
    }
    const pageIndex = Math.floor(index2 / this.pager.pageSize);
    const indexInPage = index2 % this.pager.pageSize;
    const page = this.pages[pageIndex];
    if (page.isResolved) {
      return Promise.resolve(page.elements[indexInPage]);
    }
    if (!page.promise) {
      page.cts = new CancellationTokenSource();
      page.promise = this.pager.getPage(pageIndex, page.cts.token).then((elements) => {
        page.elements = elements;
        page.isResolved = true;
        page.promise = null;
        page.cts = null;
      }, (err) => {
        page.isResolved = false;
        page.promise = null;
        page.cts = null;
        return Promise.reject(err);
      });
    }
    const listener = cancellationToken.onCancellationRequested(() => {
      if (!page.cts) {
        return;
      }
      page.promiseIndexes.delete(index2);
      if (page.promiseIndexes.size === 0) {
        page.cts.cancel();
      }
    });
    page.promiseIndexes.add(index2);
    return page.promise.then(() => page.elements[indexInPage]).finally(() => listener.dispose());
  }
};

var DelayedPagedModel = class {
  constructor(model, timeout2 = 500) {
    this.model = model;
    this.timeout = timeout2;
  }
  get length() {
    return this.model.length;
  }
  get onDidIncrementLength() {
    return this.model.onDidIncrementLength;
  }
  isResolved(index2) {
    return this.model.isResolved(index2);
  }
  get(index2) {
    return this.model.get(index2);
  }
  resolve(index2, cancellationToken) {
    return new Promise((c, e4) => {
      if (cancellationToken.isCancellationRequested) {
        return e4(new CancellationError());
      }
      const timer = setTimeout(() => {
        if (cancellationToken.isCancellationRequested) {
          return e4(new CancellationError());
        }
        timeoutCancellation.dispose();
        this.model.resolve(index2, cancellationToken).then(c, e4);
      }, this.timeout);
      const timeoutCancellation = cancellationToken.onCancellationRequested(() => {
        clearTimeout(timer);
        timeoutCancellation.dispose();
        e4(new CancellationError());
      });
    });
  }
};
export { createPage, singlePagePager, PagedModel, DelayedPagedModel };
