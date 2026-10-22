// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostConfigEditor.ts
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { createFileSystemProviderError } from "./module-0269.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { parse5 } from "./module-0885.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions3 } from "./module-0138.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostConfigEditor.ts
function convertPropertySchema(schema10) {
  const out = {
    type: schema10.type,
    title: schema10.title,
    description: schema10.description,
    default: schema10.default
  };
  if (schema10.enum && schema10.enum.length > 0) {
    out.enum = [...schema10.enum];
    if (schema10.enumDescriptions && schema10.enumDescriptions.length > 0) {
      out.enumDescriptions = [...schema10.enumDescriptions];
    }
  }
  if (schema10.type === "array" && schema10.items) {
    out.items = convertPropertySchema(schema10.items);
  }
  if (schema10.type === "object" && schema10.properties) {
    const properties = {};
    for (const [key3, value2] of Object.entries(schema10.properties)) {
      properties[key3] = convertPropertySchema(value2);
    }
    out.properties = properties;
    if (schema10.required && schema10.required.length > 0) {
      out.required = [...schema10.required];
    }
  }
  return out;
}

function buildAgentHostConfigJsonSchema(config, filter2) {
  const properties = {};
  const required = [];
  for (const [key3, schema10] of Object.entries(config.schema.properties)) {
    if (!filter2(key3, schema10)) {
      continue;
    }
    properties[key3] = convertPropertySchema(schema10);
    if (config.schema.required?.includes(key3)) {
      required.push(key3);
    }
  }
  const result = {
    type: "object",
    properties,
    additionalProperties: true
  };
  if (required.length > 0) {
    result.required = required;
  }
  return result;
}

function buildHeaderComment(locale2, props) {
  const lines = [];
  lines.push(`// ${locale2.header}`);
  lines.push(`// ${locale2.saveHint}`);
  if (props && props.length > 0) {
    lines.push("//");
    for (const [key3, schema10] of props) {
      const suffix = schema10.enum && schema10.enum.length > 0 ? ` (${schema10.enum.join(" | ")})` : "";
      const title = schema10.title || key3;
      lines.push(`// ${key3}: ${title}${suffix}`);
      if (schema10.description) {
        lines.push(`//   ${schema10.description}`);
      }
    }
  }
  lines.push("");
  return lines.join("\n");
}

function serializeAgentHostConfigDocument(config, filter2, locale2) {
  if (!config) {
    return `${buildHeaderComment(locale2, void 0)}{}
`;
  }
  const editableProps = Object.entries(config.schema.properties).filter(([key3, schema10]) => filter2(key3, schema10));
  const values = {};
  for (const [key3] of editableProps) {
    if (config.values[key3] !== void 0) {
      values[key3] = config.values[key3];
    }
  }
  return `${buildHeaderComment(locale2, editableProps)}${JSON.stringify(values, null, 2)}
`;
}

var AbstractAgentHostConfigFileSystemProvider = class extends Disposable {
  constructor(_logService) {
    super();
    this._logService = _logService;
    this.capabilities = 2 /* FileReadWrite */ | 1024 /* PathCaseSensitive */;
    this._onDidChangeCapabilities = this._register(new Emitter());
    this.onDidChangeCapabilities = this._onDidChangeCapabilities.event;
    this._onDidChangeFile = this._register(new Emitter());
    this.onDidChangeFile = this._onDidChangeFile.event;
  }
  /**
   * Release a target obtained from {@link _resolveTarget}. Called exactly
   * once for every resolution that returned a defined target: after
   * {@link stat}/{@link readFile}/{@link writeFile} complete (including on
   * error), and when a {@link watch} caller disposes its returned
   * disposable. Default is a no-op for targets with no per-resolution
   * ownership (e.g. a shared provider or the ambient agent host);
   * subclasses whose {@link _resolveTarget} acquires a scoped resource
   * (e.g. a refcounted subscription reference) must override this to
   * release it symmetrically.
   */
  _releaseTarget(_target, _ctx) {
  }
  /** Error to throw when {@link _resolveTarget} returns `undefined` for a parsed context. */
  _missingTargetError(_ctx) {
    return createFileSystemProviderError(`${this._schemeLabel} target is not available`, "EntryNotFound" /* FileNotFound */);
  }
  // ---- IFileSystemProvider ------------------------------------------------
  watch(resource, _opts) {
    const parsed = this._parseUri(resource);
    if (!parsed) {
      return Disposable.None;
    }
    const target = this._resolveTarget(parsed);
    if (!target) {
      return Disposable.None;
    }
    const watcher = this._watchChanges(target, parsed, () => {
      this._onDidChangeFile.fire([{ type: 0 /* UPDATED */, resource }]);
    });
    return toDisposable(() => {
      watcher.dispose();
      this._releaseTarget(target, parsed);
    });
  }
  async stat(resource) {
    const { target, ctx } = this._resolveOrThrow(resource);
    try {
      const content = this._serialize(target, ctx);
      return {
        type: 1 /* File */,
        ctime: 0,
        mtime: 0,
        size: VSBuffer.fromString(content).byteLength,
        permissions: 0
      };
    } finally {
      this._releaseTarget(target, ctx);
    }
  }
  async readdir() {
    throw createFileSystemProviderError("readdir not supported", "NoPermissions" /* NoPermissions */);
  }
  async readFile(resource) {
    const { target, ctx } = this._resolveOrThrow(resource);
    try {
      const content = this._serialize(target, ctx);
      this._ensureSchemaRegistered(target, ctx);
      return VSBuffer.fromString(content).buffer;
    } finally {
      this._releaseTarget(target, ctx);
    }
  }
  async writeFile(resource, content, _opts) {
    const { target, ctx } = this._resolveOrThrow(resource);
    try {
      const text2 = VSBuffer.wrap(content).toString();
      const errors = [];
      const parsedJson = parse5(text2, errors);
      if (errors.length > 0) {
        throw createFileSystemProviderError(this._locale.parseError, "Unavailable" /* Unavailable */);
      }
      if (parsedJson === null || typeof parsedJson !== "object" || Array.isArray(parsedJson)) {
        throw createFileSystemProviderError(this._locale.notObject, "Unavailable" /* Unavailable */);
      }
      if (!this._hasConfig(target, ctx)) {
        this._logService.trace(`[${this._traceTag}] No config state for ${this._describeForTrace(ctx)}; ignoring write.`);
        this._onDidChangeFile.fire([{ type: 0 /* UPDATED */, resource }]);
        return;
      }
      await this._replaceConfig(target, ctx, parsedJson);
      this._onDidChangeFile.fire([{ type: 0 /* UPDATED */, resource }]);
    } finally {
      this._releaseTarget(target, ctx);
    }
  }
  async mkdir() {
    throw createFileSystemProviderError("mkdir not supported", "NoPermissions" /* NoPermissions */);
  }
  async delete(_resource, _opts) {
    throw createFileSystemProviderError("delete not supported", "NoPermissions" /* NoPermissions */);
  }
  async rename(_from, _to, _opts) {
    throw createFileSystemProviderError("rename not supported", "NoPermissions" /* NoPermissions */);
  }
  // ---- Helpers ------------------------------------------------------------
  _resolveOrThrow(resource) {
    const ctx = this._parseUri(resource);
    if (!ctx) {
      throw createFileSystemProviderError(`Invalid ${this._schemeLabel} URI: ${resource.toString()}`, "EntryNotFound" /* FileNotFound */);
    }
    const target = this._resolveTarget(ctx);
    if (!target) {
      throw this._missingTargetError(ctx);
    }
    return { target, ctx };
  }
};

AbstractAgentHostConfigFileSystemProvider = __decorateClass([
  __decorateParam(0, ILogService)
], AbstractAgentHostConfigFileSystemProvider);

var AbstractAgentHostConfigSchemaRegistrar = class extends Disposable {
  constructor() {
    super(...arguments);
    this._schemaRegistry = Registry.as(Extensions3.JSONContribution);
    /** Per-target registered-schema disposables, keyed by the settings URI string. */
    this._targetSchemas = this._register(new DisposableMap());
    /**
     * Tracks the {@link ConfigSchema} identity last used to register a schema
     * for a given settings URI so we can skip re-registration when only
     * values have changed.
     */
    this._lastSchemaIdentity = /* @__PURE__ */ new Map();
  }
  // ---- Public API ---------------------------------------------------------
  /**
   * Ensures a JSON schema is registered for the given target. Safe to
   * call repeatedly; a no-op when the cached schema identity matches.
   */
  ensureRegistered(target) {
    this._refreshSchema(target);
  }
  // ---- Protected API for subclass-driven change tracking -------------------
  /** Whether a schema is currently registered for `target`. */
  _isRegistered(target) {
    return this._lastSchemaIdentity.has(this._settingsUri(target));
  }
  _refreshSchema(target) {
    const config = this._getConfig(target);
    if (!config) {
      return;
    }
    const settingsUri = this._settingsUri(target);
    const identity2 = config.schema;
    if (this._lastSchemaIdentity.get(settingsUri) === identity2) {
      return;
    }
    const schema10 = buildAgentHostConfigJsonSchema(config, this._propertyFilter());
    const schemaId5 = this._schemaId(target);
    this._targetSchemas.deleteAndDispose(settingsUri);
    const store = new DisposableStore();
    this._schemaRegistry.registerSchema(schemaId5, schema10, store);
    store.add(this._schemaRegistry.registerSchemaAssociation(schemaId5, settingsUri));
    store.add(toDisposable(() => this._lastSchemaIdentity.delete(settingsUri)));
    this._targetSchemas.set(settingsUri, store);
    this._lastSchemaIdentity.set(settingsUri, identity2);
  }
  _disposeSchemaForTarget(target) {
    this._targetSchemas.deleteAndDispose(this._settingsUri(target));
  }
};
export { convertPropertySchema, buildAgentHostConfigJsonSchema, buildHeaderComment, serializeAgentHostConfigDocument, AbstractAgentHostConfigFileSystemProvider, AbstractAgentHostConfigSchemaRegistrar };
