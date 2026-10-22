// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/otel/agentHostOTelService.ts
import { AgentHostOTelSpansDbSubPath } from "./module-0049.mjs";
import { AgentHostOTelServiceName, AgentHostOTelServiceNamespace, AgentHostSessionSpanName, AgentHostSessionTitleAttribute, AgentHostSessionTitleSpanName, AgentHostSessionUriAttribute } from "./module-0137.mjs";
import { Disposable, toDisposable } from "./module-0010.mjs";
import { RunOnceScheduler } from "./module-0027.mjs";
import { dirname, join } from "./module-0018.mjs";
import { generateUuid } from "./module-0042.mjs";
import { GenAiAttr } from "./module-0564.mjs";
import { URI } from "./module-0023.mjs";
import { OTelSqliteStore } from "./module-0565.mjs";
import { startLocalOtlpHttpReceiver } from "./module-0562.mjs";
import { CompositeForwarder, ConsoleForwarder, FileForwarder, OtlpHttpForwarder } from "./module-0563.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0084.mjs";
import { INativeEnvironmentService } from "./module-0129.mjs";


// src/vs/platform/agentHost/node/otel/agentHostOTelService.ts
import { mkdir as mkdir7 } from "fs/promises";


// src/vs/platform/agentHost/node/otel/agentHostOTelService.ts
var SPANS_DB_SUBPATH = AgentHostOTelSpansDbSubPath;

function isTruthy(v) {
  if (!v) {
    return false;
  }
  const s = v.trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes" || s === "on";
}

function parseOtlpHeaders(raw) {
  if (!raw) {
    return void 0;
  }
  const out = {};
  for (const pair of raw.split(",")) {
    const eq = pair.indexOf("=");
    if (eq <= 0) {
      continue;
    }
    const rawKey = pair.slice(0, eq).trim();
    const rawValue = pair.slice(eq + 1).trim();
    if (rawKey) {
      try {
        out[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue);
      } catch {
        out[rawKey] = rawValue;
      }
    }
  }
  return Object.keys(out).length ? out : void 0;
}

function parseResourceAttributes(raw, serviceName) {
  const attributes = {};
  for (const pair of raw?.split(",") ?? []) {
    const eq = pair.indexOf("=");
    if (eq <= 0) {
      continue;
    }
    const key = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    if (key) {
      try {
        attributes[key] = decodeURIComponent(value);
      } catch {
        attributes[key] = value;
      }
    }
  }
  attributes["service.namespace"] = AgentHostOTelServiceNamespace;
  attributes["service.name"] = serviceName ?? attributes["service.name"] ?? AgentHostOTelServiceName;
  return attributes;
}

function readAgentHostOTelEnv(env2) {
  const dbSpanExporter = isTruthy(env2.COPILOT_OTEL_DB_SPAN_EXPORTER_ENABLED);
  const otlpEndpoint = env2.OTEL_EXPORTER_OTLP_ENDPOINT ?? env2.COPILOT_OTEL_ENDPOINT;
  const filePath = env2.COPILOT_OTEL_FILE_EXPORTER_PATH;
  const explicitlyEnabled = isTruthy(env2.COPILOT_OTEL_ENABLED);
  const enabled = explicitlyEnabled || dbSpanExporter || !!otlpEndpoint || !!filePath;
  const rawType = (env2.COPILOT_OTEL_EXPORTER_TYPE ?? "").trim().toLowerCase();
  const protocol = (env2.OTEL_EXPORTER_OTLP_PROTOCOL ?? env2.COPILOT_OTEL_PROTOCOL ?? "").trim().toLowerCase();
  let exporterType = "otlp-http";
  if (rawType === "console" || rawType === "file" || rawType === "otlp-grpc" || rawType === "otlp-http") {
    exporterType = rawType;
  } else if (filePath) {
    exporterType = "file";
  }
  if (protocol === "grpc" || protocol === "http/grpc") {
    exporterType = "otlp-grpc";
  }
  return {
    enabled,
    dbSpanExporter,
    exporterType,
    otlpEndpoint,
    filePath,
    sourceName: env2.COPILOT_OTEL_SOURCE_NAME,
    captureContent: env2.OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT === void 0 ? void 0 : isTruthy(env2.OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT),
    headers: parseOtlpHeaders(env2.OTEL_EXPORTER_OTLP_HEADERS),
    otlpProtocol: protocol,
    resourceAttributes: parseResourceAttributes(env2.OTEL_RESOURCE_ATTRIBUTES, env2.OTEL_SERVICE_NAME)
  };
}

var CodexAuthPollingServiceName = "codex-app-server";

var CodexAuthPollingSpanName = "auth";

var CodexAuthPollingModuleName = "codex_login::auth::manager";

function attributeValue(attributes, key) {
  return attributes?.find((attribute) => attribute.key === key)?.value?.stringValue;
}

function upsertResourceAttribute(attributes, key, value) {
  const existing = attributes.find((attribute) => attribute.key === key);
  if (existing) {
    existing.value = { stringValue: value };
  } else {
    attributes.push({ key, value: { stringValue: value } });
  }
}

function normalizeAgentHostOtlpBody(body) {
  const payload = JSON.parse(body.toString("utf8"));
  let filteredSpanCount = 0;
  for (const resourceSpan of payload.resourceSpans ?? []) {
    const resource = resourceSpan.resource ??= {};
    const resourceAttributes = resource.attributes ??= [];
    const isCodex = attributeValue(resourceAttributes, "service.name") === CodexAuthPollingServiceName;
    upsertResourceAttribute(resourceAttributes, "service.namespace", AgentHostOTelServiceNamespace);
    for (const scopeSpans of resourceSpan.scopeSpans ?? []) {
      const spans = scopeSpans.spans ?? [];
      scopeSpans.spans = spans.filter((span) => {
        const shouldFilter = isCodex && span.name === CodexAuthPollingSpanName && attributeValue(span.attributes, "code.module.name") === CodexAuthPollingModuleName;
        if (shouldFilter) {
          filteredSpanCount++;
        }
        return !shouldFilter;
      });
    }
  }
  return { body: Buffer.from(JSON.stringify(payload)), filteredSpanCount };
}

var AgentHostOTelService = class extends Disposable {
  constructor(_fetchFn, _logService, environmentService) {
    super();
    this._fetchFn = _fetchFn;
    this._logService = _logService;
    this._metadataExportQueue = Promise.resolve();
    this._sessionContexts = /* @__PURE__ */ new Map();
    this._pendingFilteredCodexAuthSpans = 0;
    this._totalFilteredCodexAuthSpans = 0;
    this._filteredSpanLogScheduler = this._register(new RunOnceScheduler(() => this._logFilteredCodexAuthSpans(), 6e4));
    this._config = readAgentHostOTelEnv(process.env);
    this._spansDbPath = join(environmentService.userDataPath, SPANS_DB_SUBPATH);
  }
  async getSdkTelemetryConfig() {
    if (!this._config.enabled) {
      return void 0;
    }
    if (this._config.dbSpanExporter) {
      await this._ensureStarted();
      if (!this._receiver) {
        if (!this._config.otlpEndpoint && this._config.exporterType !== "console" && !this._config.filePath) {
          return void 0;
        }
      } else {
        return this._buildLoopbackConfig();
      }
    }
    return this._buildPassthroughConfig();
  }
  async getNativeSdkTelemetryConfig() {
    if (!this._config.enabled) {
      return void 0;
    }
    const protocol = this._config.otlpProtocol === "grpc" || this._config.otlpProtocol === "http/grpc" ? "grpc" : this._config.otlpProtocol === "http/protobuf" ? "http/protobuf" : "http/json";
    const external = this._config.otlpEndpoint ? {
      endpoint: this._config.otlpEndpoint,
      protocol,
      ...this._config.headers ? { headers: this._config.headers } : {}
    } : void 0;
    const resourceAttributes = { ...this._config.resourceAttributes };
    delete resourceAttributes["service.name"];
    resourceAttributes["service.namespace"] = AgentHostOTelServiceNamespace;
    if (!this._config.dbSpanExporter) {
      return { traces: external, external, captureContent: this._config.captureContent === true, resourceAttributes };
    }
    await this._ensureStarted();
    return {
      traces: this._receiver ? { endpoint: `${this._receiver.baseUrl}/v1/traces`, protocol: "http/json" } : external,
      external,
      captureContent: this._config.captureContent === true,
      resourceAttributes
    };
  }
  getSessionTraceContext(conversationId, sessionUri) {
    if (!this._config.enabled || !conversationId || !sessionUri || !this._config.dbSpanExporter && !this._canForwardSyntheticSpan()) {
      return void 0;
    }
    const existing = this._sessionContexts.get(sessionUri);
    if (existing) {
      return existing;
    }
    const traceId = generateUuid().replaceAll("-", "");
    const spanId = generateUuid().replaceAll("-", "").slice(0, 16);
    const context = { traceId, spanId, traceparent: `00-${traceId}-${spanId}-01` };
    this._sessionContexts.set(sessionUri, context);
    const now = Date.now();
    this._queueSyntheticSpan({
      name: AgentHostSessionSpanName,
      traceId,
      spanId,
      startTime: now,
      endTime: now,
      status: { code: 1 /* OK */ },
      attributes: {
        ...this._config.resourceAttributes,
        [GenAiAttr.CONVERSATION_ID]: conversationId,
        [AgentHostSessionUriAttribute]: sessionUri
      },
      events: []
    });
    return context;
  }
  releaseSessionTraceContext(sessionUri) {
    this._sessionContexts.delete(sessionUri);
  }
  withTraceContext(context, fn) {
    const previous = this._currentTraceContext;
    this._currentTraceContext = context;
    try {
      return fn();
    } finally {
      this._currentTraceContext = previous;
    }
  }
  getCurrentTraceContext() {
    return this._currentTraceContext;
  }
  getSpansDbPath() {
    return this._config.dbSpanExporter ? URI.file(this._spansDbPath) : void 0;
  }
  emitSessionTitleChanged(conversationId, sessionUri, title) {
    if (!this._config.enabled || this._config.captureContent !== true || !conversationId || !title) {
      return;
    }
    if (!this._config.dbSpanExporter && !this._canForwardSyntheticSpan()) {
      return;
    }
    const boundedTitle = title.slice(0, 200);
    const context = this.getSessionTraceContext(conversationId, sessionUri);
    const now = Date.now();
    this._queueSyntheticSpan({
      name: AgentHostSessionTitleSpanName,
      traceId: context?.traceId ?? generateUuid().replaceAll("-", ""),
      spanId: generateUuid().replaceAll("-", "").slice(0, 16),
      parentSpanId: context?.spanId,
      startTime: now,
      endTime: now,
      status: { code: 1 /* OK */ },
      attributes: {
        ...this._config.resourceAttributes,
        [GenAiAttr.CONVERSATION_ID]: conversationId,
        [AgentHostSessionTitleAttribute]: boundedTitle,
        [AgentHostSessionUriAttribute]: sessionUri
      },
      events: []
    });
  }
  async flush() {
    this._filteredSpanLogScheduler.flush();
    await this._metadataExportQueue;
    await this._startPromise;
    if (this._forwarder) {
      await this._forwarder.flush();
    }
  }
  _buildLoopbackConfig() {
    return {
      exporterType: "otlp-http",
      otlpEndpoint: this._receiver.baseUrl,
      sourceName: this._config.sourceName,
      captureContent: this._config.captureContent
    };
  }
  _buildPassthroughConfig() {
    return {
      exporterType: this._config.exporterType,
      otlpEndpoint: this._config.otlpEndpoint,
      filePath: this._config.filePath,
      sourceName: this._config.sourceName,
      captureContent: this._config.captureContent
    };
  }
  _ensureStarted() {
    if (!this._startPromise) {
      this._startPromise = this._start().catch((err) => {
        this._logService.error("[agentHost.otel] failed to start loopback OTel pipeline", err);
        this._receiver = void 0;
        this._forwarder = void 0;
      });
    }
    return this._startPromise;
  }
  async _start() {
    await mkdir7(dirname(this._spansDbPath), { recursive: true });
    const store = new OTelSqliteStore(this._spansDbPath);
    this._spanStore = store;
    this._register(toDisposable(() => {
      store.close();
      this._spanStore = void 0;
    }));
    this._forwarder = this._buildOutboundForwarder();
    const receiver = await startLocalOtlpHttpReceiver(
      {
        transformBody: (body) => {
          const normalized = normalizeAgentHostOtlpBody(body);
          this._recordFilteredCodexAuthSpans(normalized.filteredSpanCount);
          return normalized.body;
        },
        onSpans: (result) => {
          for (const span of result.spans) {
            try {
              store.insertSpan(span);
            } catch (err) {
              this._logService.warn("[agentHost.otel] failed to insert span", err);
            }
          }
          this._forwarder?.forwardSpans?.(result);
        },
        onForward: this._forwarder ? (body, contentType) => {
          this._forwarder.forwardRaw?.(body, contentType);
        } : void 0
      },
      this._logService
    );
    this._receiver = receiver;
    this._register(receiver);
    if (this._forwarder) {
      this._register(this._forwarder);
    }
    this._logService.info(`[agentHost.otel] loopback receiver at ${receiver.baseUrl}, db ${this._spansDbPath}`);
  }
  _queueSyntheticSpan(span) {
    this._metadataExportQueue = this._metadataExportQueue.then(() => this._emitSyntheticSpan(span)).catch((err) => this._logService.warn("[agentHost.otel] failed to emit metadata span", err));
  }
  async _emitSyntheticSpan(span) {
    if (this._config.dbSpanExporter) {
      await this._ensureStarted();
    } else if (!this._forwarder) {
      this._forwarder = this._buildOutboundForwarder();
      if (this._forwarder) {
        this._register(this._forwarder);
      }
    }
    try {
      this._spanStore?.insertSpan(span);
    } catch (err) {
      this._logService.warn("[agentHost.otel] failed to persist session title span", err);
    }
    const result = { spans: [span], rejected: 0, errors: [] };
    this._forwarder?.forwardSpans?.(result);
    if (this._canForwardSyntheticSpan()) {
      this._forwarder?.forwardRaw?.(this._encodeOtlpSpan(span), "application/json");
    }
  }
  _recordFilteredCodexAuthSpans(count) {
    if (count <= 0) {
      return;
    }
    this._pendingFilteredCodexAuthSpans = Math.min(Number.MAX_SAFE_INTEGER, this._pendingFilteredCodexAuthSpans + count);
    this._totalFilteredCodexAuthSpans = Math.min(Number.MAX_SAFE_INTEGER, this._totalFilteredCodexAuthSpans + count);
    if (!this._filteredSpanLogScheduler.isScheduled()) {
      this._filteredSpanLogScheduler.schedule();
    }
  }
  _logFilteredCodexAuthSpans() {
    if (this._pendingFilteredCodexAuthSpans === 0) {
      return;
    }
    this._logService.info(`[agentHost.otel] filtered ${this._pendingFilteredCodexAuthSpans} Codex 0.142 auth polling span(s); total=${this._totalFilteredCodexAuthSpans}`);
    this._pendingFilteredCodexAuthSpans = 0;
  }
  _canForwardSyntheticSpan() {
    return this._config.exporterType === "file" || this._config.exporterType === "console" || this._config.exporterType === "otlp-http" && this._config.otlpProtocol !== "http/protobuf";
  }
  _encodeOtlpSpan(span) {
    const resourceAttributeKeys = new Set(Object.keys(this._config.resourceAttributes));
    const attributes = Object.entries(span.attributes).filter(([key]) => !resourceAttributeKeys.has(key) || key === GenAiAttr.CONVERSATION_ID || key.startsWith("vscode.agent_host.")).map(([key, value]) => ({
      key,
      value: typeof value === "string" ? { stringValue: value } : typeof value === "number" ? { doubleValue: value } : typeof value === "boolean" ? { boolValue: value } : { arrayValue: { values: value.map((item) => ({ stringValue: item })) } }
    }));
    const resourceAttributes = Object.entries(this._config.resourceAttributes).map(([key, value]) => ({ key, value: { stringValue: value } }));
    return Buffer.from(JSON.stringify({
      resourceSpans: [{
        ...resourceAttributes.length ? { resource: { attributes: resourceAttributes } } : {},
        scopeSpans: [{
          scope: { name: this._config.sourceName ?? "vscode.agent-host" },
          spans: [{
            traceId: span.traceId,
            spanId: span.spanId,
            ...span.parentSpanId ? { parentSpanId: span.parentSpanId } : {},
            name: span.name,
            kind: 1,
            startTimeUnixNano: `${span.startTime}000000`,
            endTimeUnixNano: `${span.endTime}000000`,
            attributes,
            status: { code: 1 }
          }]
        }]
      }]
    }), "utf8");
  }
  _buildOutboundForwarder() {
    const children = [];
    switch (this._config.exporterType) {
      case "otlp-http":
        if (this._config.otlpEndpoint && this._config.otlpProtocol !== "http/protobuf") {
          children.push(new OtlpHttpForwarder(
            {
              endpoint: this._config.otlpEndpoint,
              headers: this._config.headers
            },
            this._logService,
            this._fetchFn
          ));
        } else if (this._config.otlpEndpoint) {
          this._logService.warn("[agentHost.otel] DB trace fan-out is unavailable for OTLP/HTTP protobuf; traces remain in the local DB while provider logs and metrics export directly");
        }
        break;
      case "otlp-grpc":
        if (this._config.otlpEndpoint) {
          this._logService.warn("[agentHost.otel] DB trace fan-out is unavailable for OTLP/gRPC; traces remain in the local DB while provider logs and metrics export directly");
        }
        break;
      case "file":
        if (this._config.filePath) {
          children.push(new FileForwarder({ filePath: this._config.filePath }, this._logService));
        }
        break;
      case "console":
        children.push(new ConsoleForwarder(this._logService));
        break;
    }
    if (!children.length) {
      return void 0;
    }
    return children.length === 1 ? children[0] : new CompositeForwarder(children);
  }
};

AgentHostOTelService = __decorateClass([
  __decorateParam(1, ILogService),
  __decorateParam(2, INativeEnvironmentService)
], AgentHostOTelService);
export { isTruthy, parseOtlpHeaders, parseResourceAttributes, readAgentHostOTelEnv, attributeValue, upsertResourceAttribute, normalizeAgentHostOtlpBody, mkdir7, SPANS_DB_SUBPATH, CodexAuthPollingServiceName, CodexAuthPollingSpanName, CodexAuthPollingModuleName, AgentHostOTelService };
