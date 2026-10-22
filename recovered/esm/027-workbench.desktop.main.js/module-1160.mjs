// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/terminal/common/terminalPlatformConfiguration.ts
import { Codicon, getAllCodicons } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { PlatformToString } from "./module-0014.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { createProfileSchemaEnums } from "./module-1159.mjs";


// src/vs/platform/terminal/common/terminalPlatformConfiguration.ts
var terminalColorSchema = {
  type: ["string", "null"],
  enum: [
    "terminal.ansiBlack",
    "terminal.ansiRed",
    "terminal.ansiGreen",
    "terminal.ansiYellow",
    "terminal.ansiBlue",
    "terminal.ansiMagenta",
    "terminal.ansiCyan",
    "terminal.ansiWhite"
  ],
  default: null
};

var terminalIconSchema = {
  type: "string",
  enum: Array.from(getAllCodicons(), (icon2) => icon2.id),
  markdownEnumDescriptions: Array.from(getAllCodicons(), (icon2) => `$(${icon2.id})`)
};

var terminalProfileBaseProperties = {
  args: {
    description: localize(3282, null),
    type: "array",
    items: {
      type: "string"
    }
  },
  icon: {
    description: localize(3285, null),
    ...terminalIconSchema
  },
  color: {
    description: localize(3283, null),
    ...terminalColorSchema
  },
  env: {
    markdownDescription: localize(3284, null),
    type: "object",
    additionalProperties: {
      type: ["string", "null"]
    },
    default: {}
  }
};

var terminalProfileSchema = {
  type: "object",
  required: ["path"],
  properties: {
    path: {
      description: localize(3293, null),
      type: ["string", "array"],
      items: {
        type: "string"
      }
    },
    overrideName: {
      description: localize(3292, null),
      type: "boolean"
    },
    ...terminalProfileBaseProperties
  }
};

var terminalAutomationProfileSchema = {
  type: "object",
  required: ["path"],
  properties: {
    path: {
      description: localize(3280, null),
      type: ["string"],
      items: {
        type: "string"
      }
    },
    ...terminalProfileBaseProperties
  }
};

function createTerminalProfileMarkdownDescription(platform3) {
  const key3 = platform3 === 2 /* Linux */ ? "linux" : platform3 === 1 /* Mac */ ? "osx" : "windows";
  return localize(
    3277,
    null,
    PlatformToString(platform3),
    '```json\n"terminal.integrated.profile.' + key3 + '": {\n  "bash": null\n}\n```',
    "[",
    "](https://code.visualstudio.com/docs/terminal/profiles)"
  );
}

var terminalPlatformConfiguration = {
  id: "terminal",
  order: 100,
  title: localize(3281, null),
  type: "object",
  properties: {
    ["terminal.integrated.automationProfile.linux" /* AutomationProfileLinux */]: {
      restricted: true,
      markdownDescription: localize(3268, null),
      type: ["object", "null"],
      default: null,
      "anyOf": [
        { type: "null" },
        terminalAutomationProfileSchema
      ],
      defaultSnippets: [
        {
          body: {
            path: "${1}",
            icon: "${2}"
          }
        }
      ]
    },
    ["terminal.integrated.automationProfile.osx" /* AutomationProfileMacOs */]: {
      restricted: true,
      markdownDescription: localize(3269, null),
      type: ["object", "null"],
      default: null,
      "anyOf": [
        { type: "null" },
        terminalAutomationProfileSchema
      ],
      defaultSnippets: [
        {
          body: {
            path: "${1}",
            icon: "${2}"
          }
        }
      ]
    },
    ["terminal.integrated.automationProfile.windows" /* AutomationProfileWindows */]: {
      restricted: true,
      markdownDescription: localize(3270, null, "`terminal.integrated.automationShell.windows`"),
      type: ["object", "null"],
      default: null,
      "anyOf": [
        { type: "null" },
        terminalAutomationProfileSchema
      ],
      defaultSnippets: [
        {
          body: {
            path: "${1}",
            icon: "${2}"
          }
        }
      ]
    },
    ["terminal.integrated.agentHostProfile.linux" /* AgentHostProfileLinux */]: {
      restricted: true,
      markdownDescription: localize(3265, null, "`#terminal.integrated.profiles.linux#`", "`#terminal.integrated.defaultProfile.linux#`"),
      type: ["string", "object", "null"],
      default: null,
      "anyOf": [
        { type: "null" },
        { type: "string" },
        terminalAutomationProfileSchema
      ],
      defaultSnippets: [
        {
          body: {
            path: "${1}",
            icon: "${2}"
          }
        }
      ]
    },
    ["terminal.integrated.agentHostProfile.osx" /* AgentHostProfileMacOs */]: {
      restricted: true,
      markdownDescription: localize(3266, null, "`#terminal.integrated.profiles.osx#`", "`#terminal.integrated.defaultProfile.osx#`"),
      type: ["string", "object", "null"],
      default: null,
      "anyOf": [
        { type: "null" },
        { type: "string" },
        terminalAutomationProfileSchema
      ],
      defaultSnippets: [
        {
          body: {
            path: "${1}",
            icon: "${2}"
          }
        }
      ]
    },
    ["terminal.integrated.agentHostProfile.windows" /* AgentHostProfileWindows */]: {
      restricted: true,
      markdownDescription: localize(3267, null, "`#terminal.integrated.profiles.windows#`", "`#terminal.integrated.defaultProfile.windows#`"),
      type: ["string", "object", "null"],
      default: null,
      "anyOf": [
        { type: "null" },
        { type: "string" },
        terminalAutomationProfileSchema
      ],
      defaultSnippets: [
        {
          body: {
            path: "${1}",
            icon: "${2}"
          }
        }
      ]
    },
    ["terminal.integrated.profiles.windows" /* ProfilesWindows */]: {
      restricted: true,
      markdownDescription: createTerminalProfileMarkdownDescription(3 /* Windows */),
      type: "object",
      default: {
        "PowerShell": {
          source: "PowerShell",
          icon: Codicon.terminalPowershell.id
        },
        "Command Prompt": {
          path: [
            "${env:windir}\\Sysnative\\cmd.exe",
            "${env:windir}\\System32\\cmd.exe"
          ],
          args: [],
          icon: Codicon.terminalCmd.id
        },
        "Git Bash": {
          source: "Git Bash",
          icon: Codicon.terminalGitBash.id
        }
      },
      additionalProperties: {
        "anyOf": [
          {
            type: "object",
            required: ["source"],
            properties: {
              source: {
                description: localize(3297, null),
                enum: ["PowerShell", "Git Bash"]
              },
              ...terminalProfileBaseProperties
            }
          },
          {
            type: "object",
            required: ["extensionIdentifier", "id", "title"],
            properties: {
              extensionIdentifier: {
                description: localize(3295, null),
                type: "string"
              },
              id: {
                description: localize(3294, null),
                type: "string"
              },
              title: {
                description: localize(3296, null),
                type: "string"
              },
              ...terminalProfileBaseProperties
            }
          },
          { type: "null" },
          terminalProfileSchema
        ]
      }
    },
    ["terminal.integrated.profiles.osx" /* ProfilesMacOs */]: {
      restricted: true,
      markdownDescription: createTerminalProfileMarkdownDescription(1 /* Mac */),
      type: "object",
      default: {
        "bash": {
          path: "bash",
          args: ["-l"],
          icon: Codicon.terminalBash.id
        },
        "zsh": {
          path: "zsh",
          args: ["-l"]
        },
        "fish": {
          path: "fish",
          args: ["-l"]
        },
        "tmux": {
          path: "tmux",
          icon: Codicon.terminalTmux.id
        },
        "pwsh": {
          path: "pwsh",
          icon: Codicon.terminalPowershell.id
        }
      },
      additionalProperties: {
        "anyOf": [
          {
            type: "object",
            required: ["extensionIdentifier", "id", "title"],
            properties: {
              extensionIdentifier: {
                description: localize(3290, null),
                type: "string"
              },
              id: {
                description: localize(3289, null),
                type: "string"
              },
              title: {
                description: localize(3291, null),
                type: "string"
              },
              ...terminalProfileBaseProperties
            }
          },
          { type: "null" },
          terminalProfileSchema
        ]
      }
    },
    ["terminal.integrated.profiles.linux" /* ProfilesLinux */]: {
      restricted: true,
      markdownDescription: createTerminalProfileMarkdownDescription(2 /* Linux */),
      type: "object",
      default: {
        "bash": {
          path: "bash",
          icon: Codicon.terminalBash.id
        },
        "zsh": {
          path: "zsh"
        },
        "fish": {
          path: "fish"
        },
        "tmux": {
          path: "tmux",
          icon: Codicon.terminalTmux.id
        },
        "pwsh": {
          path: "pwsh",
          icon: Codicon.terminalPowershell.id
        }
      },
      additionalProperties: {
        "anyOf": [
          {
            type: "object",
            required: ["extensionIdentifier", "id", "title"],
            properties: {
              extensionIdentifier: {
                description: localize(3287, null),
                type: "string"
              },
              id: {
                description: localize(3286, null),
                type: "string"
              },
              title: {
                description: localize(3288, null),
                type: "string"
              },
              ...terminalProfileBaseProperties
            }
          },
          { type: "null" },
          terminalProfileSchema
        ]
      }
    },
    ["terminal.integrated.useWslProfiles" /* UseWslProfiles */]: {
      description: localize(3279, null),
      type: "boolean",
      default: true
    },
    ["terminal.integrated.inheritEnv" /* InheritEnv */]: {
      scope: 1 /* APPLICATION */,
      description: localize(3275, null),
      type: "boolean",
      default: true
    },
    ["terminal.integrated.persistentSessionScrollback" /* PersistentSessionScrollback */]: {
      scope: 1 /* APPLICATION */,
      markdownDescription: localize(3276, null),
      type: "number",
      default: 100
    },
    ["terminal.integrated.showLinkHover" /* ShowLinkHover */]: {
      scope: 1 /* APPLICATION */,
      description: localize(3278, null),
      type: "boolean",
      default: true
    },
    ["terminal.integrated.ignoreProcessNames" /* IgnoreProcessNames */]: {
      markdownDescription: localize(3271, null, "`#terminal.integrated.confirmOnKill#`"),
      type: "array",
      items: {
        type: "string",
        uniqueItems: true
      },
      default: [
        // Popular prompt programs, these should not count as child processes
        "starship",
        "oh-my-posh",
        // Git bash may runs a subprocess of itself (bin\bash.exe -> usr\bin\bash.exe)
        "bash",
        "zsh"
      ]
    }
  }
};

function registerTerminalPlatformConfiguration() {
  Registry.as(Extensions4.Configuration).registerConfiguration(terminalPlatformConfiguration);
  registerTerminalDefaultProfileConfiguration();
}

var defaultProfilesConfiguration;

function registerTerminalDefaultProfileConfiguration(detectedProfiles, extensionContributedProfiles) {
  const registry4 = Registry.as(Extensions4.Configuration);
  let profileEnum;
  if (detectedProfiles) {
    profileEnum = createProfileSchemaEnums(detectedProfiles?.profiles, extensionContributedProfiles);
  }
  const oldDefaultProfilesConfiguration = defaultProfilesConfiguration;
  defaultProfilesConfiguration = {
    id: "terminal",
    order: 100,
    title: localize(3281, null),
    type: "object",
    properties: {
      ["terminal.integrated.defaultProfile.linux" /* DefaultProfileLinux */]: {
        restricted: true,
        markdownDescription: localize(3272, null),
        type: ["string", "null"],
        default: null,
        enum: detectedProfiles?.os === 3 /* Linux */ ? profileEnum?.values : void 0,
        markdownEnumDescriptions: detectedProfiles?.os === 3 /* Linux */ ? profileEnum?.markdownDescriptions : void 0
      },
      ["terminal.integrated.defaultProfile.osx" /* DefaultProfileMacOs */]: {
        restricted: true,
        markdownDescription: localize(3273, null),
        type: ["string", "null"],
        default: null,
        enum: detectedProfiles?.os === 2 /* Macintosh */ ? profileEnum?.values : void 0,
        markdownEnumDescriptions: detectedProfiles?.os === 2 /* Macintosh */ ? profileEnum?.markdownDescriptions : void 0
      },
      ["terminal.integrated.defaultProfile.windows" /* DefaultProfileWindows */]: {
        restricted: true,
        markdownDescription: localize(3274, null),
        type: ["string", "null"],
        default: null,
        enum: detectedProfiles?.os === 1 /* Windows */ ? profileEnum?.values : void 0,
        markdownEnumDescriptions: detectedProfiles?.os === 1 /* Windows */ ? profileEnum?.markdownDescriptions : void 0
      }
    }
  };
  registry4.updateConfigurations({ add: [defaultProfilesConfiguration], remove: oldDefaultProfilesConfiguration ? [oldDefaultProfilesConfiguration] : [] });
}
export { createTerminalProfileMarkdownDescription, registerTerminalPlatformConfiguration, registerTerminalDefaultProfileConfiguration, terminalColorSchema, terminalIconSchema, terminalProfileBaseProperties, terminalProfileSchema, terminalAutomationProfileSchema, terminalPlatformConfiguration, defaultProfilesConfiguration };
