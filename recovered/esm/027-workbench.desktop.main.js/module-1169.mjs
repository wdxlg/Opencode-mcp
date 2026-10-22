// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/suggest/common/terminalSuggestConfiguration.ts
import { localize } from "./module-0001.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";


// src/vs/workbench/contrib/terminalContrib/suggest/common/terminalSuggestConfiguration.ts
var windowsDefaultExecutableExtensions = [
  "exe",
  // Executable file
  "bat",
  // Batch file
  "cmd",
  // Command script
  "com",
  // Command file
  "msi",
  // Windows Installer package
  "ps1",
  // PowerShell script
  "vbs",
  // VBScript file
  "js",
  // JScript file
  "jar",
  // Java Archive (requires Java runtime)
  "py",
  // Python script (requires Python interpreter)
  "rb",
  // Ruby script (requires Ruby interpreter)
  "pl",
  // Perl script (requires Perl interpreter)
  "sh"
  // Shell script (via WSL or third-party tools)
];

var terminalSuggestConfigSection = "terminal.integrated.suggest";

function normalizeQuickSuggestionsConfig(config) {
  if (typeof config === "boolean") {
    return config ? { commands: "on", arguments: "on", unknown: "off" } : { commands: "off", arguments: "off", unknown: "off" };
  }
  return config;
}

var terminalSuggestConfiguration = {
  ["terminal.integrated.suggest.enabled" /* Enabled */]: {
    restricted: true,
    markdownDescription: localize(20941, null, "Windows PowerShell, PowerShell v7+, zsh, bash, fish", `\`#${"terminal.integrated.shellIntegration.enabled" /* ShellIntegrationEnabled */}#\``),
    type: "boolean",
    default: true
  },
  ["terminal.integrated.suggest.providers" /* Providers */]: {
    restricted: true,
    markdownDescription: localize(20949, null),
    type: "object",
    properties: {}
  },
  ["terminal.integrated.suggest.quickSuggestions" /* QuickSuggestions */]: {
    restricted: true,
    markdownDescription: localize(20951, null, `\`#${"terminal.integrated.suggest.suggestOnTriggerCharacters" /* SuggestOnTriggerCharacters */}#\``),
    type: "object",
    properties: {
      commands: {
        description: localize(20953, null),
        type: "string",
        enum: ["on", "off"]
      },
      arguments: {
        description: localize(20952, null),
        type: "string",
        enum: ["on", "off"]
      },
      unknown: {
        description: localize(20954, null),
        type: "string",
        enum: ["on", "off"]
      }
    },
    additionalProperties: false,
    default: {
      commands: "off",
      arguments: "off",
      unknown: "off"
    }
  },
  ["terminal.integrated.suggest.suggestOnTriggerCharacters" /* SuggestOnTriggerCharacters */]: {
    restricted: true,
    markdownDescription: localize(20957, null),
    type: "boolean",
    default: false
  },
  ["terminal.integrated.suggest.runOnEnter" /* RunOnEnter */]: {
    restricted: true,
    markdownDescription: localize(20955, null),
    enum: ["never", "exactMatch", "exactMatchIgnoreExtension", "always"],
    markdownEnumDescriptions: [
      localize(20936, null),
      localize(20934, null),
      localize(20935, null),
      localize(20933, null)
    ],
    default: "never"
  },
  ["terminal.integrated.suggest.selectionMode" /* SelectionMode */]: {
    markdownDescription: localize(20959, null),
    type: "string",
    enum: ["partial", "always", "never"],
    markdownEnumDescriptions: [
      localize(20962, null),
      localize(20960, null),
      localize(20961, null)
    ],
    default: "partial"
  },
  ["terminal.integrated.suggest.windowsExecutableExtensions" /* WindowsExecutableExtensions */]: {
    restricted: true,
    markdownDescription: localize(
      20964,
      null,
      windowsDefaultExecutableExtensions.sort().map((extension) => `- ${extension}`).join("\n")
    ),
    type: "object",
    default: {}
  },
  ["terminal.integrated.suggest.showStatusBar" /* ShowStatusBar */]: {
    restricted: true,
    markdownDescription: localize(20956, null),
    type: "boolean",
    default: true
  },
  ["terminal.integrated.suggest.cdPath" /* CdPath */]: {
    restricted: true,
    markdownDescription: localize(20937, null),
    type: "string",
    enum: ["off", "relative", "absolute"],
    markdownEnumDescriptions: [
      localize(20939, null),
      localize(20940, null),
      localize(20938, null)
    ],
    default: "absolute"
  },
  ["terminal.integrated.suggest.inlineSuggestion" /* InlineSuggestion */]: {
    restricted: true,
    markdownDescription: localize(20942, null),
    type: "string",
    enum: ["off", "alwaysOnTopExceptExactMatch", "alwaysOnTop"],
    markdownEnumDescriptions: [
      localize(20945, null),
      localize(20944, null),
      localize(20943, null)
    ],
    default: "alwaysOnTop"
  },
  ["terminal.integrated.suggest.upArrowNavigatesHistory" /* UpArrowNavigatesHistory */]: {
    restricted: true,
    markdownDescription: localize(20958, null),
    type: "boolean",
    default: true
  },
  ["terminal.integrated.suggest.insertTrailingSpace" /* InsertTrailingSpace */]: {
    restricted: true,
    markdownDescription: localize(20946, null),
    type: "boolean",
    default: false
  }
};

var terminalSuggestProvidersConfiguration;

function registerTerminalSuggestProvidersConfiguration(providers2) {
  const oldProvidersConfiguration = terminalSuggestProvidersConfiguration;
  providers2 ??= /* @__PURE__ */ new Map();
  if (!providers2.has("lsp")) {
    providers2.set("lsp", {
      id: "lsp",
      description: localize(20947, null)
    });
  }
  const providersProperties = {};
  for (const id2 of Array.from(providers2.keys()).sort()) {
    providersProperties[id2] = {
      type: "boolean",
      default: id2 === "lsp" ? false : true,
      description: providers2.get(id2)?.description ?? localize(20948, null, id2)
    };
  }
  const defaultValue = {};
  for (const key3 in providersProperties) {
    defaultValue[key3] = providersProperties[key3].default;
  }
  terminalSuggestProvidersConfiguration = {
    id: "terminalSuggestProviders",
    order: 100,
    title: localize(20963, null),
    type: "object",
    properties: {
      ["terminal.integrated.suggest.providers" /* Providers */]: {
        restricted: true,
        markdownDescription: localize(20950, null),
        type: "object",
        properties: providersProperties,
        default: defaultValue,
        tags: ["preview"],
        additionalProperties: false
      }
    }
  };
  const registry4 = Registry.as(Extensions4.Configuration);
  registry4.updateConfigurations({
    add: [terminalSuggestProvidersConfiguration],
    remove: oldProvidersConfiguration ? [oldProvidersConfiguration] : []
  });
}

registerTerminalSuggestProvidersConfiguration();
export { normalizeQuickSuggestionsConfig, registerTerminalSuggestProvidersConfiguration, windowsDefaultExecutableExtensions, terminalSuggestConfigSection, terminalSuggestConfiguration, terminalSuggestProvidersConfiguration };
