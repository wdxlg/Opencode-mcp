// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/indexedDB.ts
import { mark } from "./module-0506.mjs";
import { ErrorNoTelemetry, getErrorMessage } from "./module-0004.mjs";
import { toErrorMessage } from "./module-0094.mjs";


// src/vs/base/browser/indexedDB.ts
var MissingStoresError = class extends Error {
  constructor(db) {
    super("Missing stores");
    this.db = db;
  }
};

var DBClosedError = class extends Error {
  constructor(dbName) {
    super(`IndexedDB database '${dbName}' is closed.`);
    this.code = "DBClosed";
  }
};

var IndexedDB = class _IndexedDB {
  constructor(database, name) {
    this.name = name;
    this.database = null;
    this.pendingTransactions = [];
    this.database = database;
  }
  static async create(name, version2, stores) {
    const database = await _IndexedDB.openDatabase(name, version2, stores);
    return new _IndexedDB(database, name);
  }
  static async openDatabase(name, version2, stores) {
    mark(`code/willOpenDatabase/${name}`);
    try {
      return await _IndexedDB.doOpenDatabase(name, version2, stores);
    } catch (err) {
      if (err instanceof MissingStoresError) {
        console.info(`Attempting to recreate the IndexedDB once.`, name);
        try {
          await _IndexedDB.deleteDatabase(err.db);
        } catch (error) {
          console.error(`Error while deleting the IndexedDB`, getErrorMessage(error));
          throw error;
        }
        return await _IndexedDB.doOpenDatabase(name, version2, stores);
      }
      throw err;
    } finally {
      mark(`code/didOpenDatabase/${name}`);
    }
  }
  static doOpenDatabase(name, version2, stores) {
    return new Promise((c, e4) => {
      const request2 = indexedDB.open(name, version2);
      request2.onerror = () => e4(request2.error);
      request2.onsuccess = () => {
        const db = request2.result;
        for (const store of stores) {
          if (!db.objectStoreNames.contains(store)) {
            console.error(`Error while opening IndexedDB. Could not find '${store}'' object store`);
            e4(new MissingStoresError(db));
            return;
          }
        }
        c(db);
      };
      request2.onupgradeneeded = () => {
        const db = request2.result;
        for (const store of stores) {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store);
          }
        }
      };
    });
  }
  static deleteDatabase(database) {
    return new Promise((c, e4) => {
      database.close();
      const deleteRequest = indexedDB.deleteDatabase(database.name);
      deleteRequest.onerror = (err) => e4(deleteRequest.error);
      deleteRequest.onsuccess = () => c();
    });
  }
  hasPendingTransactions() {
    return this.pendingTransactions.length > 0;
  }
  close() {
    if (this.pendingTransactions.length) {
      this.pendingTransactions.splice(0, this.pendingTransactions.length).forEach((transaction2) => transaction2.abort());
    }
    this.database?.close();
    this.database = null;
  }
  async runInTransaction(store, transactionMode, dbRequestFn) {
    if (!this.database) {
      throw new DBClosedError(this.name);
    }
    const transaction2 = this.database.transaction(store, transactionMode);
    this.pendingTransactions.push(transaction2);
    return new Promise((c, e4) => {
      transaction2.oncomplete = () => {
        if (Array.isArray(request2)) {
          c(request2.map((r2) => r2.result));
        } else {
          c(request2.result);
        }
      };
      transaction2.onerror = () => e4(transaction2.error ? ErrorNoTelemetry.fromError(transaction2.error) : new ErrorNoTelemetry("unknown error"));
      transaction2.onabort = () => e4(transaction2.error ? ErrorNoTelemetry.fromError(transaction2.error) : new ErrorNoTelemetry("unknown error"));
      const request2 = dbRequestFn(transaction2.objectStore(store));
    }).finally(() => this.pendingTransactions.splice(this.pendingTransactions.indexOf(transaction2), 1));
  }
  /**
   * Atomically stores `newValue` when the current valid value strictly equals `expectedValue`.
   * Values rejected by `isValid` are treated as `undefined`; transaction failures reject without committing.
   */
  async compareAndSwap(store, key3, expectedValue, newValue, isValid2) {
    if (!this.database) {
      throw new DBClosedError(this.name);
    }
    const transaction2 = this.database.transaction(store, "readwrite");
    this.pendingTransactions.push(transaction2);
    return new Promise((resolve3, reject) => {
      let currentValue;
      let swapped = false;
      transaction2.oncomplete = () => resolve3({
        swapped,
        currentValue: swapped ? newValue : currentValue
      });
      transaction2.onerror = () => reject(transaction2.error ? ErrorNoTelemetry.fromError(transaction2.error) : new ErrorNoTelemetry("unknown error"));
      transaction2.onabort = () => reject(transaction2.error ? ErrorNoTelemetry.fromError(transaction2.error) : new ErrorNoTelemetry("unknown error"));
      const objectStore = transaction2.objectStore(store);
      const request2 = objectStore.get(key3);
      request2.onsuccess = () => {
        currentValue = isValid2(request2.result) ? request2.result : void 0;
        if (currentValue === expectedValue) {
          swapped = true;
          objectStore.put(newValue, key3);
        }
      };
    }).finally(() => this.pendingTransactions.splice(this.pendingTransactions.indexOf(transaction2), 1));
  }
  async getKeyValues(store, isValid2) {
    if (!this.database) {
      throw new DBClosedError(this.name);
    }
    const transaction2 = this.database.transaction(store, "readonly");
    this.pendingTransactions.push(transaction2);
    return new Promise((resolve3) => {
      const items = /* @__PURE__ */ new Map();
      const objectStore = transaction2.objectStore(store);
      const cursor = objectStore.openCursor();
      if (!cursor) {
        return resolve3(items);
      }
      cursor.onsuccess = () => {
        if (cursor.result) {
          if (isValid2(cursor.result.value)) {
            items.set(cursor.result.key.toString(), cursor.result.value);
          }
          cursor.result.continue();
        } else {
          resolve3(items);
        }
      };
      const onError = (error) => {
        console.error(`IndexedDB getKeyValues(): ${toErrorMessage(error, true)}`);
        resolve3(items);
      };
      cursor.onerror = () => onError(cursor.error);
      transaction2.onerror = () => onError(transaction2.error);
    }).finally(() => this.pendingTransactions.splice(this.pendingTransactions.indexOf(transaction2), 1));
  }
};
export { MissingStoresError, DBClosedError, IndexedDB };
