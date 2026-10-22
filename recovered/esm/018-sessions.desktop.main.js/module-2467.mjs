// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/agentHostStarter.config.contribution.ts
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { COPILOT_OTEL_CAPTURE_CONTENT_KEY, COPILOT_OTEL_ENABLED_KEY, COPILOT_OTEL_ENDPOINT_KEY, COPILOT_OTEL_HEADERS_KEY, COPILOT_OTEL_LOCK_CAPTURE_CONTENT_KEY, COPILOT_OTEL_PROTOCOL_KEY, COPILOT_OTEL_RESOURCE_ATTRIBUTES_KEY, COPILOT_OTEL_SERVICE_NAME_KEY, managedSettingValue, thirdPartyAgentEnabledValue } from "./module-0956.mjs";
import { localize } from "./module-0001.mjs";
import { AGENT_MERGE_SETTING_TAG, AgentMergeConfigKey, AgentMergeSettingId } from "./module-2466.mjs";
import { product_default } from "./module-0139.mjs";
import { AgentHostActiveAgentTitleGenerationSettingId, AgentHostByokModelsEnabledSettingId, AgentHostClaudeAgentEnabledSettingId, AgentHostClaudeMultiRootEnabledSettingId, AgentHostCodexAgentBinaryArgsSettingId, AgentHostCodexAgentCodexHomeSettingId, AgentHostCodexAgentEnabledSettingId, AgentHostCodexAgentSdkRootSettingId, AgentHostCodexMultiRootEnabledSettingId, AgentHostCopilotMultiRootEnabledSettingId, AgentHostGitHubMcpServerEnabledSettingId, AgentHostMarkdownPlanRichLinksEnabledSettingId, AgentHostOTelCaptureContentSettingId, AgentHostOTelDbSpanExporterEnabledSettingId, AgentHostOTelEnabledSettingId, AgentHostOTelExporterTypeSettingId, AgentHostOTelOtlpEndpointSettingId, AgentHostOTelOtlpProtocolSettingId, AgentHostOTelOutfileSettingId, AgentHostOTelResourceAttributesSettingId, AgentHostOTelServiceNameSettingId, AgentHostSystemProxyEnabledSettingId, ArtifactToolsSettingId } from "./module-1108.mjs";
import { AgentHostActiveAgentTitleGenerationConfigKey, AgentHostArtifactToolsConfigKey, AgentHostByokModelsEnabledConfigKey, AgentHostClaudeMultiRootEnabledConfigKey, AgentHostCodexEnabledConfigKey, AgentHostCodexMultiRootEnabledConfigKey, AgentHostCopilotMultiRootEnabledConfigKey, AgentHostGitHubMcpServerEnabledConfigKey, AgentHostMarkdownPlanRichLinksEnabledConfigKey, AgentHostSystemProxyEnabledConfigKey } from "./module-1741.mjs";


// src/vs/platform/agentHost/common/agentHostStarter.config.contribution.ts
var configurationRegistry10 = Registry.as(Extensions4.Configuration);

function managedOTelProtocolValue(policyData) {
  const protocol = policyData.managedSettings?.[COPILOT_OTEL_PROTOCOL_KEY];
  if (protocol === "grpc") {
    return "otlp-grpc";
  }
  if (protocol === "http/protobuf" || protocol === "http/json") {
    return "otlp-http";
  }
  return void 0;
}

function managedOTelCaptureContentValue(policyData) {
  const captureContent = policyData.managedSettings?.[COPILOT_OTEL_CAPTURE_CONTENT_KEY];
  if (typeof captureContent === "boolean") {
    return captureContent;
  }
  return policyData.managedSettings?.[COPILOT_OTEL_LOCK_CAPTURE_CONTENT_KEY] === true ? false : void 0;
}

function managedOTelOutfileValue(policyData) {
  const managedSettings = policyData.managedSettings;
  if (managedSettings?.[COPILOT_OTEL_ENDPOINT_KEY] !== void 0 || managedSettings?.[COPILOT_OTEL_PROTOCOL_KEY] !== void 0) {
    return "";
  }
  return void 0;
}

configurationRegistry10.registerConfiguration({
  id: "chatAgentHostStarter",
  title: localize(2039, null),
  type: "object",
  properties: {
    [AgentMergeSettingId.Enabled]: {
      type: "boolean",
      description: localize(2025, null),
      default: product_default.quality !== "stable",
      scope: 1 /* APPLICATION */,
      tags: ["experimental", AGENT_MERGE_SETTING_TAG],
      agentHost: { key: AgentMergeConfigKey.Enabled }
    },
    [AgentMergeSettingId.AddressReviews]: {
      type: "boolean",
      description: localize(2024, null),
      default: true,
      scope: 1 /* APPLICATION */,
      tags: ["experimental", AGENT_MERGE_SETTING_TAG],
      agentHost: { key: AgentMergeConfigKey.AddressReviews }
    },
    [AgentMergeSettingId.FixCI]: {
      type: "boolean",
      description: localize(2026, null),
      default: true,
      scope: 1 /* APPLICATION */,
      tags: ["experimental", AGENT_MERGE_SETTING_TAG],
      agentHost: { key: AgentMergeConfigKey.FixCI }
    },
    [AgentMergeSettingId.ResolveConflicts]: {
      type: "boolean",
      description: localize(2037, null),
      default: true,
      scope: 1 /* APPLICATION */,
      tags: ["experimental", AGENT_MERGE_SETTING_TAG],
      agentHost: { key: AgentMergeConfigKey.ResolveConflicts }
    },
    [AgentMergeSettingId.MergePullRequest]: {
      type: "string",
      enum: ["always", "ifUnchanged", "never"],
      enumDescriptions: [
        localize(2033, null),
        localize(2034, null),
        localize(2035, null)
      ],
      description: localize(2032, null),
      default: "never",
      scope: 1 /* APPLICATION */,
      tags: ["experimental", AGENT_MERGE_SETTING_TAG],
      agentHost: { key: AgentMergeConfigKey.MergePullRequest }
    },
    [AgentMergeSettingId.MergeMethod]: {
      type: "string",
      enum: ["auto", "squash", "merge", "rebase"],
      enumDescriptions: [
        localize(2028, null),
        localize(2031, null),
        localize(2029, null),
        localize(2030, null)
      ],
      description: localize(2027, null),
      default: "auto",
      scope: 1 /* APPLICATION */,
      tags: ["experimental", AGENT_MERGE_SETTING_TAG],
      agentHost: { key: AgentMergeConfigKey.MergeMethod }
    },
    [AgentMergeSettingId.ReplyAttribution]: {
      type: "boolean",
      description: localize(2036, null),
      default: true,
      scope: 1 /* APPLICATION */,
      tags: ["experimental", AGENT_MERGE_SETTING_TAG],
      agentHost: { key: AgentMergeConfigKey.ReplyAttribution }
    },
    [AgentHostActiveAgentTitleGenerationSettingId]: {
      type: "boolean",
      description: localize(1997, null),
      default: product_default.quality !== "stable",
      scope: 1 /* APPLICATION */,
      tags: ["experimental", "advanced"],
      experiment: { mode: "auto" },
      agentHost: { key: AgentHostActiveAgentTitleGenerationConfigKey }
    },
    [ArtifactToolsSettingId]: {
      type: "boolean",
      description: localize(2038, null),
      default: product_default.quality !== "stable",
      scope: 1 /* APPLICATION */,
      tags: ["experimental", "advanced"],
      experiment: { mode: "auto" },
      agentHost: { key: AgentHostArtifactToolsConfigKey }
    },
    [AgentHostMarkdownPlanRichLinksEnabledSettingId]: {
      type: "boolean",
      description: localize(1998, null),
      default: false,
      scope: 1 /* APPLICATION */,
      tags: ["experimental", "advanced"],
      experiment: { mode: "auto" },
      agentHost: { key: AgentHostMarkdownPlanRichLinksEnabledConfigKey }
    },
    [AgentHostSystemProxyEnabledSettingId]: {
      type: "boolean",
      description: localize(2023, null),
      default: true,
      tags: ["experimental", "advanced"],
      experiment: { mode: "startup" },
      agentHost: { key: AgentHostSystemProxyEnabledConfigKey }
    },
    [AgentHostGitHubMcpServerEnabledSettingId]: {
      type: "boolean",
      description: localize(1999, null),
      default: true,
      tags: ["experimental", "advanced"],
      experiment: { mode: "startup" },
      agentHost: { key: AgentHostGitHubMcpServerEnabledConfigKey }
    },
    [AgentHostCopilotMultiRootEnabledSettingId]: {
      type: "boolean",
      description: localize(1996, null),
      default: false,
      // Hidden from the Settings UI while the feature is dogfooded internally.
      // Still settable via `settings.json`; flip `default` (e.g. to
      // `product.quality !== 'stable'`) to enable it for a build channel.
      included: false,
      agentHost: { key: AgentHostCopilotMultiRootEnabledConfigKey }
    },
    [AgentHostClaudeMultiRootEnabledSettingId]: {
      type: "boolean",
      description: localize(1989, null),
      default: false,
      // Hidden from the Settings UI while the feature is dogfooded internally.
      // Still settable via `settings.json`; flip `default` (e.g. to
      // `product.quality !== 'stable'`) to enable it for a build channel.
      included: false,
      agentHost: { key: AgentHostClaudeMultiRootEnabledConfigKey }
    },
    [AgentHostCodexMultiRootEnabledSettingId]: {
      type: "boolean",
      description: localize(1994, null),
      default: false,
      included: false,
      agentHost: { key: AgentHostCodexMultiRootEnabledConfigKey }
    },
    [AgentHostClaudeAgentEnabledSettingId]: {
      type: "boolean",
      description: localize(1987, null),
      default: true,
      tags: ["experimental", "advanced"],
      // Owns the policy so the account-side preview-features flag can disable Claude across all surfaces.
      policy: {
        name: "Claude3PIntegration",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.113",
        value: thirdPartyAgentEnabledValue,
        localization: {
          description: {
            key: "chat.agentHost.claudeAgent.enabled.policy",
            value: localize(1988, null)
          }
        }
      }
    },
    [AgentHostByokModelsEnabledSettingId]: {
      type: "boolean",
      description: localize(1986, null),
      default: false,
      tags: ["experimental", "advanced"],
      experiment: { mode: "startup" },
      agentHost: { key: AgentHostByokModelsEnabledConfigKey, scope: "local" /* Local */ }
    },
    [AgentHostCodexAgentEnabledSettingId]: {
      type: "boolean",
      description: localize(1992, null),
      default: false,
      tags: ["experimental", "advanced"],
      // Allow the default to be overridden by an experiment. Uses `startup`
      // to match the sibling agent-host provider settings.
      experiment: { mode: "startup" },
      // Always mirrored, including when `false`: the host only acts on enable, so a
      // forwarded `false` takes effect on the next agent host restart (otherwise
      // in-progress Codex sessions would have to be stopped).
      agentHost: { key: AgentHostCodexEnabledConfigKey },
      // Owns the `Codex3PIntegration` policy; gating here disables Codex across all agent-host surfaces.
      policy: {
        name: "Codex3PIntegration",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.126",
        value: thirdPartyAgentEnabledValue,
        localization: {
          description: {
            key: "chat.agentHost.codexAgent.enabled.policy",
            value: localize(1993, null)
          }
        }
      }
    },
    [AgentHostCodexAgentSdkRootSettingId]: {
      type: "string",
      description: localize(1995, null),
      default: "",
      tags: ["experimental", "advanced"],
      included: product_default.quality !== "stable"
    },
    [AgentHostCodexAgentCodexHomeSettingId]: {
      type: "string",
      description: localize(1991, null),
      default: "",
      tags: ["experimental", "advanced"],
      included: product_default.quality !== "stable"
    },
    [AgentHostCodexAgentBinaryArgsSettingId]: {
      type: "array",
      items: { type: "string" },
      description: localize(1990, null),
      default: [],
      tags: ["experimental", "advanced"],
      included: product_default.quality !== "stable"
    },
    [AgentHostOTelEnabledSettingId]: {
      type: "boolean",
      markdownDescription: localize(2003, null),
      default: false,
      scope: 1 /* APPLICATION */,
      tags: ["experimental", "advanced"],
      // Owns `CopilotOtelEnabled`; the copilot-chat setting `github.copilot.chat.otel.enabled`
      // attaches to it via a `policyReference` in the extension's package.json.
      policy: {
        name: "CopilotOtelEnabled",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.127",
        value: managedSettingValue(COPILOT_OTEL_ENABLED_KEY),
        managedSettings: {
          [COPILOT_OTEL_ENABLED_KEY]: { type: "boolean" }
        },
        localization: {
          description: {
            key: "chat.agentHost.otel.enabled.policy",
            value: localize(2004, null)
          }
        }
      }
    },
    [AgentHostOTelExporterTypeSettingId]: {
      type: "string",
      enum: ["otlp-http", "otlp-grpc", "console", "file"],
      markdownDescription: localize(2005, null),
      default: "otlp-http",
      scope: 1 /* APPLICATION */,
      tags: ["experimental", "advanced"],
      // Owns `CopilotOtelProtocol`; the managed `telemetry.protocol` string is mapped onto
      // the exporter type (`grpc` -> `otlp-grpc`, `http/*` -> `otlp-http`).
      policy: {
        name: "CopilotOtelProtocol",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.127",
        value: managedOTelProtocolValue,
        managedSettings: {
          [COPILOT_OTEL_PROTOCOL_KEY]: { type: "string" }
        },
        localization: {
          description: {
            key: "chat.agentHost.otel.protocol.policy",
            value: localize(2014, null)
          },
          enumDescriptions: [
            { key: "chat.agentHost.otel.protocol.policy.otlpHttp", value: localize(2018, null) },
            { key: "chat.agentHost.otel.protocol.policy.otlpGrpc", value: localize(2017, null) },
            { key: "chat.agentHost.otel.protocol.policy.console", value: localize(2015, null) },
            { key: "chat.agentHost.otel.protocol.policy.file", value: localize(2016, null) }
          ]
        }
      }
    },
    [AgentHostOTelOtlpProtocolSettingId]: {
      type: "string",
      markdownDescription: localize(2010, null),
      default: "",
      scope: 1 /* APPLICATION */,
      // Policy-only delivery slot — no user-writable surface (mirrors `chat.plugins.extraMarketplaces`).
      included: false,
      tags: ["experimental", "advanced"],
      // Owns `CopilotOtelOtlpProtocol`; passes the raw managed `telemetry.protocol` through so the
      // starters can set `OTEL_EXPORTER_OTLP_PROTOCOL` (the `exporterType` policy only carries transport).
      policy: {
        name: "CopilotOtelOtlpProtocol",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.127",
        value: managedSettingValue(COPILOT_OTEL_PROTOCOL_KEY),
        managedSettings: {
          [COPILOT_OTEL_PROTOCOL_KEY]: { type: "string" }
        },
        localization: {
          description: {
            key: "chat.agentHost.otel.otlpProtocol.policy",
            value: localize(2011, null)
          }
        }
      }
    },
    [AgentHostOTelOtlpEndpointSettingId]: {
      type: "string",
      markdownDescription: localize(2008, null),
      default: "",
      scope: 1 /* APPLICATION */,
      tags: ["experimental", "advanced"],
      // Owns `CopilotOtelEndpoint`.
      policy: {
        name: "CopilotOtelEndpoint",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.127",
        value: managedSettingValue(COPILOT_OTEL_ENDPOINT_KEY),
        managedSettings: {
          [COPILOT_OTEL_ENDPOINT_KEY]: { type: "string" }
        },
        localization: {
          description: {
            key: "chat.agentHost.otel.otlpEndpoint.policy",
            value: localize(2009, null)
          }
        }
      }
    },
    [AgentHostOTelCaptureContentSettingId]: {
      type: "boolean",
      markdownDescription: localize(2000, null),
      default: false,
      scope: 1 /* APPLICATION */,
      tags: ["experimental", "advanced"],
      // Owns `CopilotOtelCaptureContent`; explicit managed value wins, otherwise
      // `telemetry.lockCaptureContent` forces capture off.
      policy: {
        name: "CopilotOtelCaptureContent",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.127",
        value: managedOTelCaptureContentValue,
        managedSettings: {
          [COPILOT_OTEL_CAPTURE_CONTENT_KEY]: { type: "boolean" },
          [COPILOT_OTEL_LOCK_CAPTURE_CONTENT_KEY]: { type: "boolean" }
        },
        localization: {
          description: {
            key: "chat.agentHost.otel.captureContent.policy",
            value: localize(2001, null)
          }
        }
      }
    },
    [AgentHostOTelOutfileSettingId]: {
      type: "string",
      markdownDescription: localize(2012, null),
      default: "",
      scope: 1 /* APPLICATION */,
      tags: ["experimental", "advanced"],
      // Owns `CopilotOtelOutfile`; suppresses local file export when the enterprise mandates an OTLP sink.
      policy: {
        name: "CopilotOtelOutfile",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.127",
        value: managedOTelOutfileValue,
        managedSettings: {
          [COPILOT_OTEL_ENDPOINT_KEY]: { type: "string" },
          [COPILOT_OTEL_PROTOCOL_KEY]: { type: "string" }
        },
        localization: {
          description: {
            key: "chat.agentHost.otel.outfile.policy",
            value: localize(2013, null)
          }
        }
      }
    },
    [AgentHostOTelDbSpanExporterEnabledSettingId]: {
      type: "boolean",
      markdownDescription: localize(2002, null),
      default: false,
      scope: 1 /* APPLICATION */,
      tags: ["experimental", "advanced"]
    },
    [AgentHostOTelServiceNameSettingId]: {
      type: "string",
      markdownDescription: localize(2021, null),
      default: "",
      scope: 1 /* APPLICATION */,
      // Policy-only delivery slot — no user-writable surface (mirrors `chat.agentHost.otel.otlpProtocol`).
      included: false,
      tags: ["experimental", "advanced"],
      // Owns `CopilotOtelServiceName`; passes the raw managed `telemetry.serviceName` through so the
      // starters can set `OTEL_SERVICE_NAME` on the agent host process.
      policy: {
        name: "CopilotOtelServiceName",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.127",
        value: managedSettingValue(COPILOT_OTEL_SERVICE_NAME_KEY),
        managedSettings: {
          [COPILOT_OTEL_SERVICE_NAME_KEY]: { type: "string" }
        },
        localization: {
          description: {
            key: "chat.agentHost.otel.serviceName.policy",
            value: localize(2022, null)
          }
        }
      }
    },
    [AgentHostOTelResourceAttributesSettingId]: {
      // Policy-only delivery slot — no user-writable surface (mirrors `chat.plugins.extraMarketplaces`).
      // Carried as a `{ [key]: string }` object; the starters serialize it into `OTEL_RESOURCE_ATTRIBUTES`.
      type: "object",
      additionalProperties: { type: ["string"] },
      default: {},
      scope: 1 /* APPLICATION */,
      included: false,
      tags: ["experimental", "advanced"],
      markdownDescription: localize(2019, null),
      policy: {
        name: "CopilotOtelResourceAttributes",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.127",
        value: managedSettingValue(COPILOT_OTEL_RESOURCE_ATTRIBUTES_KEY),
        managedSettings: {
          [COPILOT_OTEL_RESOURCE_ATTRIBUTES_KEY]: { type: "string" }
        },
        localization: {
          description: {
            key: "chat.agentHost.otel.resourceAttributes.policy",
            value: localize(2020, null)
          }
        }
      }
    },
    // Extension-only policy delivery slot for managed OTLP exporter headers (e.g. auth tokens).
    // Deliberately NOT delivered to the agent host: headers would have to travel via env vars,
    // which the agent host leaks into the tool subprocesses it spawns, exposing the secret. The
    // Copilot Chat extension applies these headers directly to its OTLP exporter instead.
    ["chat.agentHost.otel.headers"]: {
      type: "object",
      additionalProperties: { type: ["string"] },
      default: {},
      scope: 1 /* APPLICATION */,
      included: false,
      tags: ["experimental", "advanced"],
      markdownDescription: localize(2006, null),
      policy: {
        name: "CopilotOtelHeaders",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.127",
        value: managedSettingValue(COPILOT_OTEL_HEADERS_KEY),
        managedSettings: {
          [COPILOT_OTEL_HEADERS_KEY]: { type: "string" }
        },
        localization: {
          description: {
            key: "chat.agentHost.otel.headers.policy",
            value: localize(2007, null)
          }
        }
      }
    }
  }
});
export { managedOTelProtocolValue, managedOTelCaptureContentValue, managedOTelOutfileValue, configurationRegistry10 };
