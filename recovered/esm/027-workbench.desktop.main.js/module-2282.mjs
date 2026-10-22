// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/paging.ts
import { Emitter, Event2 } from "./module-0017.mjs";
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
    return new Promise((c, e) => {
      if (cancellationToken.isCancellationRequested) {
        return e(new CancellationError());
      }
      const timer = setTimeout(() => {
        if (cancellationToken.isCancellationRequested) {
          return e(new CancellationError());
        }
        timeoutCancellation.dispose();
        this.model.resolve(index2, cancellationToken).then(c, e);
      }, this.timeout);
      const timeoutCancellation = cancellationToken.onCancellationRequested(() => {
        clearTimeout(timer);
        timeoutCancellation.dispose();
        e(new CancellationError());
      });
    });
  }
};

var IterativePagedModel = class {
  constructor(pager) {
    this.items = [];
    this._hasNextPage = true;
    this._onDidIncrementLength = new Emitter();
    this.loadingPromise = null;
    this.pager = pager;
    this.items = [...pager.firstPage.items];
    this._hasNextPage = pager.firstPage.hasMore;
  }
  get onDidIncrementLength() {
    return this._onDidIncrementLength.event;
  }
  /**
   * Returns actual length + 1 if there are more pages (sentinel approach)
   */
  get length() {
    return this.items.length + (this._hasNextPage ? 1 : 0);
  }
  /**
   * Sentinel item is never resolved - it triggers loading
   */
  isResolved(index2) {
    if (index2 === this.items.length && this._hasNextPage) {
      return false;
    }
    return index2 < this.items.length;
  }
  get(index2) {
    if (index2 < this.items.length) {
      return this.items[index2];
    }
    throw new Error("Item not resolved yet");
  }
  /**
   * When sentinel item is accessed, load next page
   */
  async resolve(index2, cancellationToken) {
    if (cancellationToken.isCancellationRequested) {
      return Promise.reject(new CancellationError());
    }
    if (index2 === this.items.length && this._hasNextPage) {
      await this.loadNextPage(cancellationToken);
    }
    if (index2 < this.items.length) {
      return this.items[index2];
    }
    throw new Error("Index out of bounds");
  }
  async loadNextPage(cancellationToken) {
    if (!this._hasNextPage) {
      return;
    }
    if (this.loadingPromise) {
      await this.loadingPromise;
      return;
    }
    const pagePromise = this.pager.getNextPage(cancellationToken);
    this.loadingPromise = pagePromise.then((page) => {
      this.items.push(...page.items);
      this._hasNextPage = page.hasMore;
      this.loadingPromise = null;
      this._onDidIncrementLength.fire(this.length);
    }, (err) => {
      this.loadingPromise = null;
      throw err;
    });
    await this.loadingPromise;
  }
  dispose() {
    this._onDidIncrementLength.dispose();
  }
};
export { createPage, singlePagePager, PagedModel, DelayedPagedModel, IterativePagedModel };
