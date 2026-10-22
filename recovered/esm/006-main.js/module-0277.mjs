// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/terminal/common/terminalPlatformConfiguration.ts
import { init_nls, localize } from "./module-0005.mjs";
import { PlatformToString, init_platform } from "./module-0006.mjs";
import { Registry, init_platform2 } from "./module-0042.mjs";
import { Extensions2, init_configurationRegistry } from "./module-0045.mjs";
import { createProfileSchemaEnums, init_terminalProfiles } from "./module-0276.mjs";
import { __esm } from "./module-0000.mjs";
import { Codicon, getAllCodicons, init_codicons } from "./module-0085.mjs";
import { init_terminal } from "./module-0272.mjs";


// src/vs/platform/terminal/common/terminalPlatformConfiguration.ts
function createTerminalProfileMarkdownDescription(platform5) {
  const key = platform5 === 2 /* Linux */ ? "linux" : platform5 === 1 /* Mac */ ? "osx" : "windows";
  return localize(
    3277,
    null,
    PlatformToString(platform5),
    '```json\n"terminal.integrated.profile.' + key + '": {\n  "bash": null\n}\n```',
    "[",
    "](https://code.visualstudio.com/docs/terminal/profiles)"
  );
}

function registerTerminalPlatformConfiguration() {
  Registry.as(Extensions2.Configuration).registerConfiguration(terminalPlatformConfiguration);
  registerTerminalDefaultProfileConfiguration();
}

function registerTerminalDefaultProfileConfiguration(detectedProfiles, extensionContributedProfiles) {
  const registry = Registry.as(Extensions2.Configuration);
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
  registry.updateConfigurations({ add: [defaultProfilesConfiguration], remove: oldDefaultProfilesConfiguration ? [oldDefaultProfilesConfiguration] : [] });
}

var terminalColorSchema, terminalIconSchema, terminalProfileBaseProperties, terminalProfileSchema, terminalAutomationProfileSchema, terminalPlatformConfiguration, defaultProfilesConfiguration;

var init_terminalPlatformConfiguration = __esm({
  "src/vs/platform/terminal/common/terminalPlatformConfiguration.ts"() {
    init_codicons();
    init_platform();
    init_nls();
    init_configurationRegistry();
    init_platform2();
    init_terminal();
    init_terminalProfiles();
    terminalColorSchema = {
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
    terminalIconSchema = {
      type: "string",
      enum: Array.from(getAllCodicons(), (icon) => icon.id),
      markdownEnumDescriptions: Array.from(getAllCodicons(), (icon) => `$(${icon.id})`)
    };
    terminalProfileBaseProperties = {
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
    terminalProfileSchema = {
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
    terminalAutomationProfileSchema = {
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
    terminalPlatformConfiguration = {
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
  }
});
export { createTerminalProfileMarkdownDescription, registerTerminalPlatformConfiguration, registerTerminalDefaultProfileConfiguration, terminalColorSchema, terminalIconSchema, terminalProfileBaseProperties, terminalProfileSchema, terminalAutomationProfileSchema, terminalPlatformConfiguration, defaultProfilesConfiguration, init_terminalPlatformConfiguration };
