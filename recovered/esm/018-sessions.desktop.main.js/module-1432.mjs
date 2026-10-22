// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/common/testResultStorage.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { StoredValue } from "./module-1425.mjs";
import { HydratedTestResult } from "./module-1431.mjs";
import { isDefined } from "./module-0010.mjs";
import { VSBuffer, bufferToStream, newWriteableBufferStream } from "./module-0038.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILogService } from "./module-0095.mjs";
import { URI } from "./module-0032.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IFileService } from "./module-0269.mjs";
import { IEnvironmentService } from "./module-0508.mjs";


// src/vs/workbench/contrib/testing/common/testResultStorage.ts
var RETAIN_MAX_RESULTS = 128;

var RETAIN_MIN_RESULTS = 16;

var RETAIN_MAX_BYTES = 1024 * 128;

var CLEANUP_PROBABILITY = 0.2;

var ITestResultStorage = createDecorator("ITestResultStorage");

var currentRevision = 1;

var BaseTestResultStorage = class extends Disposable {
  constructor(uriIdentityService, storageService, logService) {
    super();
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
    this.stored = this._register(new StoredValue({
      key: "storedTestResults",
      scope: 1 /* WORKSPACE */,
      target: 1 /* MACHINE */
    }, storageService));
  }
  /**
   * @override
   */
  async read() {
    const results = await Promise.all(this.stored.get([]).map(async (rec) => {
      if (rec.rev !== currentRevision) {
        return void 0;
      }
      try {
        const contents = await this.readForResultId(rec.id);
        if (!contents) {
          return void 0;
        }
        return { rec, result: new HydratedTestResult(this.uriIdentityService, contents) };
      } catch (e4) {
        this.logService.warn(`Error deserializing stored test result ${rec.id}`, e4);
        return void 0;
      }
    }));
    const defined = results.filter(isDefined);
    if (defined.length !== results.length) {
      this.stored.store(defined.map(({ rec }) => rec));
    }
    return defined.map(({ result }) => result);
  }
  /**
   * @override
   */
  getResultOutputWriter(resultId) {
    const stream = newWriteableBufferStream();
    this.storeOutputForResultId(resultId, stream);
    return stream;
  }
  /**
   * @override
   */
  async persist(results) {
    const toDelete = new Map(this.stored.get([]).map(({ id: id2, bytes }) => [id2, bytes]));
    const toStore = [];
    const todo = [];
    let budget = RETAIN_MAX_BYTES;
    for (let i2 = 0; i2 < results.length && i2 < RETAIN_MAX_RESULTS && (budget > 0 || toStore.length < RETAIN_MIN_RESULTS); i2++) {
      const result = results[i2];
      const existingBytes = toDelete.get(result.id);
      if (existingBytes !== void 0) {
        toDelete.delete(result.id);
        toStore.push({ id: result.id, rev: currentRevision, bytes: existingBytes });
        budget -= existingBytes;
        continue;
      }
      const obj = result.toJSON();
      if (!obj) {
        continue;
      }
      const contents = VSBuffer.fromString(JSON.stringify(obj));
      todo.push(this.storeForResultId(result.id, obj));
      toStore.push({ id: result.id, rev: currentRevision, bytes: contents.byteLength });
      budget -= contents.byteLength;
    }
    for (const id2 of toDelete.keys()) {
      todo.push(this.deleteForResultId(id2).catch(() => void 0));
    }
    this.stored.store(toStore);
    await Promise.all(todo);
  }
};

BaseTestResultStorage = __decorateClass([
  __decorateParam(0, IUriIdentityService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, ILogService)
], BaseTestResultStorage);

var TestResultStorage = class extends BaseTestResultStorage {
  constructor(uriIdentityService, storageService, logService, workspaceContext, fileService, environmentService) {
    super(uriIdentityService, storageService, logService);
    this.fileService = fileService;
    this.directory = URI.joinPath(environmentService.workspaceStorageHome, workspaceContext.getWorkspace().id, "testResults");
  }
  async readForResultId(id2) {
    const contents = await this.fileService.readFile(this.getResultJsonPath(id2));
    return JSON.parse(contents.value.toString());
  }
  storeForResultId(id2, contents) {
    return this.fileService.writeFile(this.getResultJsonPath(id2), VSBuffer.fromString(JSON.stringify(contents)));
  }
  deleteForResultId(id2) {
    return this.fileService.del(this.getResultJsonPath(id2)).catch(() => void 0);
  }
  async readOutputRangeForResultId(id2, offset, length) {
    try {
      const { value: value2 } = await this.fileService.readFile(this.getResultOutputPath(id2), { position: offset, length });
      return value2;
    } catch {
      return VSBuffer.alloc(0);
    }
  }
  async readOutputForResultId(id2) {
    try {
      const { value: value2 } = await this.fileService.readFileStream(this.getResultOutputPath(id2));
      return value2;
    } catch {
      return bufferToStream(VSBuffer.alloc(0));
    }
  }
  async storeOutputForResultId(id2, input) {
    await this.fileService.createFile(this.getResultOutputPath(id2), input);
  }
  /**
   * @inheritdoc
   */
  async persist(results) {
    await super.persist(results);
    if (Math.random() < CLEANUP_PROBABILITY) {
      await this.cleanupDereferenced();
    }
  }
  /**
   * Cleans up orphaned files. For instance, output can get orphaned if it's
   * written but the editor is closed before the test run is complete.
   */
  async cleanupDereferenced() {
    const { children } = await this.fileService.resolve(this.directory);
    if (!children) {
      return;
    }
    const stored = new Set(this.stored.get([]).filter((s) => s.rev === currentRevision).map((s) => s.id));
    await Promise.all(
      children.filter((child) => !stored.has(child.name.replace(/\.[a-z]+$/, ""))).map((child) => this.fileService.del(child.resource).catch(() => void 0))
    );
  }
  getResultJsonPath(id2) {
    return URI.joinPath(this.directory, `${id2}.json`);
  }
  getResultOutputPath(id2) {
    return URI.joinPath(this.directory, `${id2}.output`);
  }
};

TestResultStorage = __decorateClass([
  __decorateParam(0, IUriIdentityService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IWorkspaceContextService),
  __decorateParam(4, IFileService),
  __decorateParam(5, IEnvironmentService)
], TestResultStorage);
export { RETAIN_MAX_RESULTS, RETAIN_MIN_RESULTS, RETAIN_MAX_BYTES, CLEANUP_PROBABILITY, ITestResultStorage, currentRevision, BaseTestResultStorage, TestResultStorage };
