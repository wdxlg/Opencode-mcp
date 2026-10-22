// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/common/terminalChatAgentToolsConfiguration.ts
import { localize } from "./module-0001.mjs";
import { terminalProfileBaseProperties } from "./module-1161.mjs";
import { gitAutoApproveRules } from "./module-1157.mjs";
import { powershellAutoApproveRules } from "./module-1158.mjs";
import { sortAutoApproveRules } from "./module-1159.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/common/terminalChatAgentToolsConfiguration.ts
var DEFAULT_IDLE_SILENCE_TIMEOUT_MS = 3e5;

var autoApproveBoolean = {
  type: "boolean",
  enum: [
    true,
    false
  ],
  enumDescriptions: [
    localize(20659, null),
    localize(20653, null)
  ],
  description: localize(20654, null)
};

var terminalChatAgentProfileSchema = {
  type: "object",
  required: ["path"],
  properties: {
    path: {
      description: localize(20687, null),
      type: "string"
    },
    ...terminalProfileBaseProperties
  }
};

var terminalChatAgentToolsConfiguration = {
  ["chat.tools.terminal.enableAutoApprove" /* EnableAutoApprove */]: {
    restricted: true,
    description: localize(20660, null),
    type: "boolean",
    default: true,
    policy: {
      name: "ChatToolsTerminalEnableAutoApprove",
      category: "IntegratedTerminal" /* IntegratedTerminal */,
      minimumVersion: "1.104",
      localization: {
        description: {
          key: "autoApproveMode.description",
          value: localize(20660, null)
        }
      }
    },
    agentsWindow: { default: true }
  },
  ["chat.tools.terminal.autoApprove" /* AutoApprove */]: {
    restricted: true,
    markdownDescription: [
      localize(20650, null, "`/`", "`i`"),
      localize(20652, null, "`true`", "`false`", "`null`"),
      localize(20651, null, "`foo && bar`", "`foo`", "`bar`", "`true`", "`false`", "`<(foo)`"),
      localize(20637, null, "`{ approve: false, matchCommandLine: true }`"),
      localize(20635, null, `\`#${"chat.tools.terminal.ignoreDefaultAutoApproveRules" /* IgnoreDefaultAutoApproveRules */}#\``, "`true`"),
      [
        localize(20648, null),
        `|${localize(20649, null)}|${localize(20639, null)}|`,
        "|---|---|",
        '| `"mkdir": true` | ' + localize(20640, null, "`mkdir`"),
        '| `"npm run build": true` | ' + localize(20641, null, "`npm run build`"),
        '| `"bin/test.sh": true` | ' + localize(20638, null, "`bin/test.sh`", "`bin\\test.sh`", "`./bin/test.sh`"),
        '| `"/^git (status\\|show\\\\b.*)$/": true` | ' + localize(20645, null, "`git status`", "`git show`"),
        '| `"/^Get-ChildItem\\\\b/i": true` | ' + localize(20644, null, "`Get-ChildItem`"),
        '| `"/.*/": true` | ' + localize(20643, null),
        '| `"rm": false` | ' + localize(20646, null, "`rm`"),
        '| `"/\\\\.ps1/i": { approve: false, matchCommandLine: true }` | ' + localize(20642, null, '`".ps1"`'),
        '| `"rm": null` | ' + localize(20647, null, "`false`", "`rm`")
      ].join("\n")
    ].join("\n\n"),
    type: "object",
    additionalProperties: {
      anyOf: [
        autoApproveBoolean,
        {
          type: "object",
          properties: {
            approve: autoApproveBoolean,
            matchCommandLine: {
              type: "boolean",
              enum: [
                true,
                false
              ],
              enumDescriptions: [
                localize(20657, null),
                localize(20656, null)
              ],
              description: localize(20655, null)
            }
          },
          required: ["approve"]
        },
        {
          type: "null",
          description: localize(20658, null)
        }
      ]
    },
    default: {
      // This is the default set of terminal auto approve commands. Note that these are best
      // effort and do not aim to provide exhaustive coverage to prevent dangerous commands
      // from executing as that is simply not feasible. Workspace trust and warnings of
      // possible prompt injection are _the_ thing protecting the user in agent mode, once
      // that trust boundary has been breached all bets are off as trusting a workspace that
      // contains anything malicious has already compromised the machine.
      //
      // Instead, the focus here is to unblock the user from approving clearly safe commands
      // frequently and cover common edge cases that could arise from the user auto-approving
      // commands.
      //
      // Take for example `find` which looks innocuous and most users are likely to auto
      // approve future calls when offered. However, the `-exec` argument can run anything. So
      // instead of leaving this decision up to the user we provide relatively safe defaults
      // and block common edge cases. So offering these default rules, despite their flaws, is
      // likely to protect the user more in general than leaving everything up to them (plus
      // make agent mode more convenient).
      // #region Safe commands
      //
      // Generally safe and common readonly commands
      cd: true,
      echo: true,
      ls: true,
      dir: true,
      pwd: true,
      cat: true,
      head: true,
      tail: true,
      findstr: true,
      wc: true,
      tr: true,
      cut: true,
      cmp: true,
      which: true,
      basename: true,
      dirname: true,
      realpath: true,
      readlink: true,
      stat: true,
      file: true,
      od: true,
      du: true,
      df: true,
      sleep: true,
      nl: true,
      // grep
      // - Variable
      // - `-f`: Read patterns from file, this is an acceptable risk since you can do similar
      //   with cat
      // - `-P`: PCRE risks include denial of service (memory exhaustion, catastrophic
      //   backtracking) which could lock up the terminal. Older PCRE versions allow code
      //   execution via this flag but this has been patched with CVEs.
      // - Variable injection is possible, but requires setting a variable which would need
      //   manual approval.
      grep: true,
      // #endregion
      // #region Safe sub-commands
      //
      // Safe and common sub-commands
      ...gitAutoApproveRules,
      // docker - readonly sub-commands
      "/^docker\\s+(ps|images|info|version|inspect|logs|top|stats|port|diff|search|events)\\b/": true,
      "/^docker\\s+(container|image|network|volume|context|system)\\s+(ls|ps|inspect|history|show|df|info)\\b/": true,
      "/^docker\\s+compose\\s+(ps|ls|top|logs|images|config|version|port|events)\\b/": true,
      // #endregion
      // #region PowerShell
      ...powershellAutoApproveRules,
      // #endregion
      // #region Package managers (npm, yarn, pnpm)
      //
      // Read-only commands that don't modify files or execute arbitrary code.
      // npm read-only commands
      "/^npm\\s+(ls|list|outdated|view|info|show|explain|why|root|prefix|bin|search|doctor|fund|repo|bugs|docs|home|help(-search)?)\\b/": true,
      "/^npm\\s+config\\s+(list|get)\\b/": true,
      "/^npm\\s+pkg\\s+get\\b/": true,
      "/^npm\\s+audit$/": true,
      "/^npm\\s+cache\\s+verify\\b/": true,
      // yarn read-only commands
      "/^yarn\\s+(list|outdated|info|why|bin|help|versions)\\b/": true,
      "/^yarn\\s+licenses\\b/": true,
      "/^yarn\\s+audit\\b(?!.*\\bfix\\b)/": true,
      "/^yarn\\s+config\\s+(list|get)\\b/": true,
      "/^yarn\\s+cache\\s+dir\\b/": true,
      // pnpm read-only commands
      "/^pnpm\\s+(ls|list|outdated|why|root|bin|doctor)\\b/": true,
      "/^pnpm\\s+licenses\\b/": true,
      "/^pnpm\\s+audit\\b(?!.*\\bfix\\b)/": true,
      "/^pnpm\\s+config\\s+(list|get)\\b/": true,
      // Safe lockfile-only installs since we trust the workspace and lock file is trusted.
      "npm ci": true,
      "/^yarn\\s+install\\s+--frozen-lockfile\\b/": true,
      "/^pnpm\\s+install\\s+--frozen-lockfile\\b/": true,
      // #endregion
      // #region Safe + disabled args
      //
      // Commands that are generally allowed with special cases we block. Note that shell
      // expansion is handled by the inline command detection when parsing sub-commands.
      // column
      // - `-c`: We block excessive columns that could lead to memory exhaustion.
      column: true,
      "/^column\\b.*\\s-c\\s+[0-9]{4,}/": false,
      // date
      // -s|--set: Sets the system clock
      date: true,
      "/^date\\b.*\\s(-s|--set)\\b/": false,
      // find
      // - `-delete`: Deletes files or directories.
      // - `-exec`/`-execdir`: Execute on results.
      // - `-fprint`/`fprintf`/`fls`: Writes files.
      // - `-ok`/`-okdir`: Like exec but with a confirmation.
      find: true,
      "/^find\\b.*\\s-(delete|exec|execdir|fprint|fprintf|fls|ok|okdir)\\b/": false,
      // rg (ripgrep)
      // - `--pre`: Executes arbitrary command as preprocessor for every file searched.
      // - `--hostname-bin`: Executes arbitrary command to get hostname.
      rg: true,
      "/^rg\\b.*\\s(--pre|--hostname-bin)\\b/": false,
      // sed
      // - `-e`/`--expression`: Add the commands in script to the set of commands to be run
      //   while processing the input.
      // - `-f`/`--file`: Add the commands contained in the file script-file to the set of
      //   commands to be run while processing the input.
      // - standalone `e`: Execute a shell command from the sed script
      // - standalone `r`/`R`: Read arbitrary files into the stream
      // - standalone `w`/`W`: Write pattern space to arbitrary files
      // - `s///e` flag: Executes substitution result as shell command
      // - `s///w` flag: Write substitution result to file
      // - Note that `--sandbox` exists which blocks unsafe commands that could potentially be
      //   leveraged to auto approve
      // - In-place editing (`-i`, `-I`, `--in-place`) is detected and blocked via file write
      //   detection if necessary
      // - These patterns are conservative: a literal `;e ` or `{e ` inside a replacement
      //   string also matches, which asks for confirmation rather than auto-approving.
      // TODO: replace sed deny regexes with a shared script analyzer — https://github.com/microsoft/vscode/issues/329218
      sed: true,
      "/^sed\\b.*\\s(-[a-zA-Z]*(e|f)[a-zA-Z]*|--expression|--file)\\b/": false,
      "/^sed\\b.*s\\/.*\\/.*\\/[ew]/": false,
      // Quoted positional script whose first command is e/r/R/w/W. The opening quote is
      // captured so the closing quote must match it, and whitespace and `!` are allowed
      // around the optional address since sed ignores them. The option prefix also skips
      // the separate operand consumed by -l/--line-length.
      "/^sed\\b(?:\\s+(?:(?:-l|--line-length)\\s+\\S+|--line-length=\\S+|-\\S+))*\\s+(['\"])\\s*(?:(?:\\d+|\\$|\\/(?:\\\\.|[^\\/])*\\/)(?:\\s*,\\s*(?:\\d+|\\$|\\/(?:\\\\.|[^\\/])*\\/))?)?\\s*!?\\s*[erRwW](?:\\s|\\1)/": false,
      // Same dangerous commands after a `;` or `{` separator inside a quoted script.
      // Escaped characters are consumed before testing for the matching closing quote.
      "/^sed\\b(?:\\s+(?:(?:-l|--line-length)\\s+\\S+|--line-length=\\S+|-\\S+))*\\s+(['\"])(?:\\\\.|(?!\\1).)*[;{]\\s*(?:(?:\\d+|\\$|\\/(?:\\\\.|[^\\/])*\\/)(?:\\s*,\\s*(?:\\d+|\\$|\\/(?:\\\\.|[^\\/])*\\/))?)?\\s*!?\\s*[erRwW](?:\\s|\\1|[;}])/": false,
      // Unquoted positional script form (e.g. `sed 1e id`, `sed w file`, `sed /pat/e file`)
      "/^sed\\b(?:\\s+(?:(?:-l|--line-length)\\s+\\S+|--line-length=\\S+|-\\S+))*\\s+(?:(?:\\d+|\\$|\\/(?:\\\\.|[^\\/])*\\/)(?:\\s*,\\s*(?:\\d+|\\$|\\/(?:\\\\.|[^\\/])*\\/))?)?\\s*!?\\s*[erRwW](?:\\s|$)/": false,
      ...sortAutoApproveRules,
      // tree
      // - `-o`: Output redirection can write files (`tree -o /etc/something file`) which are
      //   blocked currently
      tree: true,
      "/^tree\\b.*\\s-o\\b/": false,
      // xxd
      // - Only allow flags and a single input file as it's difficult to parse the outfile
      //   positional argument safely.
      "/^xxd$/": true,
      "/^xxd\\b(\\s+-\\S+)*\\s+[^-\\s]\\S*$/": true,
      // #endregion
      // #region Dangerous commands
      //
      // There are countless dangerous commands available on the command line, the defaults
      // here include common ones that the user is likely to want to explicitly approve first.
      // This is not intended to be a catch all as the user needs to opt-in to auto-approve
      // commands, it provides some additional safety when the commands get approved by overly
      // broad user/workspace rules.
      // Deleting files
      rm: false,
      rmdir: false,
      del: false,
      "Remove-Item": false,
      ri: false,
      rd: false,
      erase: false,
      dd: false,
      // Managing/killing processes, dangerous thing to do generally
      kill: false,
      ps: false,
      top: false,
      "Stop-Process": false,
      spps: false,
      taskkill: false,
      "taskkill.exe": false,
      // Web requests, prompt injection concerns
      curl: false,
      wget: false,
      "Invoke-RestMethod": false,
      "Invoke-WebRequest": false,
      "irm": false,
      "iwr": false,
      // File permissions and ownership, messing with these can cause hard to diagnose issues
      chmod: false,
      chown: false,
      "Set-ItemProperty": false,
      "sp": false,
      "Set-Acl": false,
      // General eval/command execution, can lead to anything else running
      jq: false,
      xargs: false,
      eval: false,
      "Invoke-Expression": false,
      iex: false
      // #endregion
    }
  },
  ["chat.tools.terminal.ignoreDefaultAutoApproveRules" /* IgnoreDefaultAutoApproveRules */]: {
    restricted: true,
    type: "boolean",
    default: false,
    tags: ["experimental"],
    markdownDescription: localize(20672, null, `\`#${"chat.tools.terminal.autoApprove" /* AutoApprove */}#\``)
  },
  ["chat.tools.terminal.autoApproveWorkspaceNpmScripts" /* AutoApproveWorkspaceNpmScripts */]: {
    restricted: true,
    type: "boolean",
    // In order to use agent mode the workspace must be trusted, this plus the fact that
    // modifying package.json is protected means this is safe to enable by default.
    default: true,
    tags: ["experimental"],
    markdownDescription: localize(20661, null)
  },
  ["chat.tools.terminal.blockDetectedFileWrites" /* BlockDetectedFileWrites */]: {
    restricted: true,
    type: "string",
    enum: ["never", "outsideWorkspace", "all"],
    enumDescriptions: [
      localize(20666, null),
      localize(20667, null),
      localize(20664, null)
    ],
    default: "outsideWorkspace",
    tags: ["experimental"],
    markdownDescription: localize(20665, null)
  },
  ["chat.tools.terminal.shellIntegrationTimeout" /* ShellIntegrationTimeout */]: {
    markdownDescription: localize(20684, null, `\`#${"terminal.integrated.shellIntegration.enabled" /* ShellIntegrationEnabled */}#\``),
    type: "integer",
    minimum: -1,
    maximum: 6e4,
    default: -1,
    markdownDeprecationMessage: localize(20683, null, `\`#${"terminal.integrated.shellIntegration.timeout" /* ShellIntegrationTimeout */}#\``)
  },
  ["chat.tools.terminal.idlePollInterval" /* IdlePollInterval */]: {
    markdownDescription: localize(20670, null),
    type: "integer",
    minimum: 50,
    maximum: 1e4,
    default: 1e3
  },
  ["chat.tools.terminal.terminalProfile.linux" /* TerminalProfileLinux */]: {
    restricted: true,
    markdownDescription: localize(20685, null),
    type: ["object", "null"],
    default: null,
    "anyOf": [
      { type: "null" },
      terminalChatAgentProfileSchema
    ],
    defaultSnippets: [
      {
        body: {
          path: "${1}"
        }
      }
    ]
  },
  ["chat.tools.terminal.terminalProfile.osx" /* TerminalProfileMacOs */]: {
    restricted: true,
    markdownDescription: localize(20686, null),
    type: ["object", "null"],
    default: null,
    "anyOf": [
      { type: "null" },
      terminalChatAgentProfileSchema
    ],
    defaultSnippets: [
      {
        body: {
          path: "${1}"
        }
      }
    ]
  },
  ["chat.tools.terminal.terminalProfile.windows" /* TerminalProfileWindows */]: {
    restricted: true,
    markdownDescription: localize(20688, null),
    type: ["object", "null"],
    default: null,
    "anyOf": [
      { type: "null" },
      terminalChatAgentProfileSchema
    ],
    defaultSnippets: [
      {
        body: {
          path: "${1}"
        }
      }
    ]
  },
  ["chat.tools.terminal.outputLocation" /* OutputLocation */]: {
    markdownDescription: localize(20676, null),
    type: "string",
    enum: ["terminal", "chat"],
    enumDescriptions: [
      localize(20677, null),
      localize(20675, null)
    ],
    default: "chat",
    tags: ["experimental"],
    experiment: {
      mode: "auto"
    }
  },
  ["chat.agent.sandbox.enabled" /* AgentSandboxEnabled */]: {
    markdownDescription: localize(20613, null, `\`#${"chat.agent.sandbox.allowNetwork" /* AgentSandboxAllowNetwork */}#\``),
    type: "string",
    enum: ["off" /* Off */, "on" /* On */],
    enumDescriptions: [
      localize(20614, null),
      localize(20615, null)
    ],
    default: "off" /* Off */,
    tags: ["preview"],
    restricted: true,
    experiment: {
      mode: "auto"
    },
    policy: {
      name: "ChatAgentSandboxEnabled",
      category: "IntegratedTerminal" /* IntegratedTerminal */,
      minimumVersion: "1.116",
      localization: {
        description: {
          key: "agentSandbox.enabledSetting",
          value: localize(20613, null, `\`#${"chat.agent.sandbox.allowNetwork" /* AgentSandboxAllowNetwork */}#\``)
        },
        enumDescriptions: [
          {
            key: "agentSandbox.enabledSetting.offDescription",
            value: localize(20614, null)
          },
          {
            key: "agentSandbox.enabledSetting.onDescription",
            value: localize(20615, null)
          }
        ]
      }
    }
  },
  ["chat.agent.sandbox.enabledWindows" /* AgentSandboxWindowsEnabled */]: {
    markdownDescription: localize(20628, null, `\`#${"chat.agent.sandbox.allowNetwork" /* AgentSandboxAllowNetwork */}#\``),
    type: "string",
    enum: ["off" /* Off */, "on" /* On */],
    enumDescriptions: [
      localize(20629, null),
      localize(20630, null)
    ],
    default: "off" /* Off */,
    tags: ["experimental"],
    restricted: true,
    experiment: {
      mode: "auto"
    }
  },
  ["chat.agent.sandbox.allowNetwork" /* AgentSandboxAllowNetwork */]: {
    markdownDescription: localize(20611, null, `\`#${"chat.agent.sandbox.enabled" /* AgentSandboxEnabled */}#\``),
    type: "boolean",
    default: false,
    tags: ["preview"],
    restricted: true,
    policy: {
      name: "ChatAgentSandboxAllowNetwork",
      category: "IntegratedTerminal" /* IntegratedTerminal */,
      minimumVersion: "1.127",
      localization: {
        description: {
          key: "agentSandbox.allowNetwork",
          value: localize(20611, null, `\`#${"chat.agent.sandbox.enabled" /* AgentSandboxEnabled */}#\``)
        }
      }
    }
  },
  ["chat.agent.sandbox.allowUnsandboxedCommands" /* AgentSandboxAllowUnsandboxedCommands */]: {
    markdownDescription: localize(20612, null, `\`#${"chat.agent.sandbox.enabled" /* AgentSandboxEnabled */}#\``),
    type: "boolean",
    default: true,
    tags: ["preview"],
    restricted: true,
    policy: {
      name: "ChatAgentSandboxAllowUnsandboxedCommands",
      category: "IntegratedTerminal" /* IntegratedTerminal */,
      minimumVersion: "1.116",
      localization: {
        description: {
          key: "agentSandbox.allowUnsandboxedCommands",
          value: localize(20612, null, `\`#${"chat.agent.sandbox.enabled" /* AgentSandboxEnabled */}#\``)
        }
      }
    }
  },
  ["chat.agent.sandbox.retryWithAllowNetworkRequests" /* AgentSandboxRetryWithAllowNetworkRequests */]: {
    markdownDescription: localize(20626, null, `\`#${"chat.agent.sandbox.enabled" /* AgentSandboxEnabled */}#\``),
    type: "boolean",
    default: true,
    tags: ["preview"],
    restricted: true
  },
  ["chat.agent.sandbox.allowAutoApprove" /* AgentSandboxAllowAutoApprove */]: {
    markdownDescription: localize(20610, null, `\`#${"chat.agent.sandbox.enabled" /* AgentSandboxEnabled */}#\``),
    type: "boolean",
    default: true,
    tags: ["preview"],
    restricted: true,
    policy: {
      name: "ChatAgentSandboxAllowAutoApprove",
      category: "IntegratedTerminal" /* IntegratedTerminal */,
      minimumVersion: "1.116",
      localization: {
        description: {
          key: "agentSandbox.allowAutoApprove",
          value: localize(20610, null, `\`#${"chat.agent.sandbox.enabled" /* AgentSandboxEnabled */}#\``)
        }
      }
    }
  },
  ["chat.agent.sandbox.fileSystem.linux" /* AgentSandboxLinuxFileSystem */]: {
    markdownDescription: localize(20616, null, `\`#${"chat.agent.sandbox.enabled" /* AgentSandboxEnabled */}#\``),
    type: "object",
    properties: {
      denyRead: {
        type: "array",
        description: localize(20619, null),
        items: { type: "string" },
        default: []
      },
      allowRead: {
        type: "array",
        description: localize(20617, null),
        items: { type: "string" },
        default: []
      },
      allowWrite: {
        type: "array",
        description: localize(20618, null),
        items: { type: "string" },
        default: []
      },
      denyWrite: {
        type: "array",
        description: localize(20620, null),
        items: { type: "string" },
        default: []
      }
    },
    default: {
      denyRead: [],
      allowRead: [],
      allowWrite: [],
      denyWrite: []
    },
    tags: ["preview"],
    restricted: true
  },
  ["chat.agent.sandbox.fileSystem.mac" /* AgentSandboxMacFileSystem */]: {
    markdownDescription: localize(20621, null, `\`#${"chat.agent.sandbox.enabled" /* AgentSandboxEnabled */}#\``),
    type: "object",
    properties: {
      denyRead: {
        type: "array",
        description: localize(20624, null),
        items: { type: "string" },
        default: []
      },
      allowRead: {
        type: "array",
        description: localize(20622, null),
        items: { type: "string" },
        default: []
      },
      allowWrite: {
        type: "array",
        description: localize(20623, null),
        items: { type: "string" },
        default: []
      },
      denyWrite: {
        type: "array",
        description: localize(20625, null),
        items: { type: "string" },
        default: []
      }
    },
    default: {
      denyRead: [],
      allowRead: [],
      allowWrite: [],
      denyWrite: []
    },
    tags: ["preview"],
    restricted: true
  },
  ["chat.agent.sandbox.fileSystem.windows" /* AgentSandboxWindowsFileSystem */]: {
    markdownDescription: localize(20631, null, `\`#${"chat.agent.sandbox.enabled" /* AgentSandboxEnabled */}#\``),
    type: "object",
    properties: {
      denyRead: {
        type: "array",
        description: localize(20634, null),
        items: { type: "string" },
        default: []
      },
      allowRead: {
        type: "array",
        description: localize(20632, null),
        items: { type: "string" },
        default: []
      },
      allowWrite: {
        type: "array",
        description: localize(20633, null),
        items: { type: "string" },
        default: []
      }
    },
    default: {
      denyRead: [],
      allowRead: [],
      allowWrite: []
    },
    tags: ["preview"],
    restricted: true
  },
  ["chat.agent.sandbox.advanced.windows.schemaVersion" /* AgentSandboxWindowsSchemaVersion */]: {
    // Intentionally available only to callers that explicitly set it in settings.json.
    included: false,
    restricted: true,
    type: "string"
  },
  ["chat.agent.sandbox.advanced.runtime" /* AgentSandboxAdvancedRuntime */]: {
    markdownDescription: localize(20627, null, `\`#${"chat.agent.sandbox.enabled" /* AgentSandboxEnabled */}#\``),
    type: "object",
    default: {
      enableWeakerNestedSandbox: false
    },
    additionalProperties: true,
    tags: ["preview"],
    restricted: true
  },
  ["chat.tools.terminal.preventShellHistory" /* PreventShellHistory */]: {
    type: "boolean",
    default: true,
    markdownDescription: [
      localize(20678, null),
      `- \`bash\`: ${localize(20679, null)}`,
      `- \`zsh\`: ${localize(20682, null)}`,
      `- \`fish\`: ${localize(20680, null)}`,
      `- \`pwsh\`: ${localize(20681, null)}`
    ].join("\n")
  },
  ["chat.tools.terminal.enforceTimeoutFromModel" /* EnforceTimeoutFromModel */]: {
    restricted: true,
    type: "boolean",
    default: true,
    tags: ["experimental"],
    experiment: {
      mode: "auto"
    },
    markdownDescription: localize(20669, null)
  },
  ["chat.tools.terminal.idleSilenceTimeoutMs" /* IdleSilenceTimeoutMs */]: {
    restricted: true,
    type: "number",
    default: DEFAULT_IDLE_SILENCE_TIMEOUT_MS,
    minimum: 0,
    tags: ["experimental"],
    experiment: {
      mode: "auto"
    },
    markdownDescription: localize(20671, null, "`0`")
  },
  ["chat.tools.terminal.detachBackgroundProcesses" /* DetachBackgroundProcesses */]: {
    included: false,
    restricted: true,
    type: "boolean",
    default: false,
    tags: ["experimental"],
    markdownDescription: localize(20668, null)
  },
  ["chat.tools.terminal.backgroundNotifications" /* BackgroundNotifications */]: {
    restricted: true,
    type: "boolean",
    default: true,
    tags: ["experimental"],
    deprecated: true,
    markdownDeprecationMessage: localize(20662, null),
    markdownDescription: localize(20663, null)
  },
  ["chat.tools.terminal.outputDeltas" /* OutputDeltas */]: {
    restricted: true,
    type: "boolean",
    default: false,
    tags: ["experimental"],
    experiment: {
      mode: "auto"
    },
    markdownDescription: localize(20674, null)
  },
  ["chat.tools.terminal.outputCompaction" /* OutputCompaction */]: {
    restricted: true,
    type: "boolean",
    default: false,
    tags: ["experimental"],
    experiment: {
      mode: "auto"
    },
    markdownDescription: localize(20673, null)
  }
};

for (const id2 of [
  "chat.agent.terminal.allowList" /* DeprecatedAutoApprove1 */,
  "chat.agent.terminal.denyList" /* DeprecatedAutoApprove2 */,
  "github.copilot.chat.agent.terminal.allowList" /* DeprecatedAutoApprove3 */,
  "github.copilot.chat.agent.terminal.denyList" /* DeprecatedAutoApprove4 */,
  "chat.agent.terminal.autoApprove" /* DeprecatedAutoApproveCompatible */
]) {
  terminalChatAgentToolsConfiguration[id2] = {
    ...id2 === "chat.agent.terminal.autoApprove" /* DeprecatedAutoApproveCompatible */ ? { restricted: true } : {},
    deprecated: true,
    markdownDeprecationMessage: localize(20636, null, `\`#${"chat.tools.terminal.autoApprove" /* AutoApprove */}#\``)
  };
}
export { DEFAULT_IDLE_SILENCE_TIMEOUT_MS, autoApproveBoolean, terminalChatAgentProfileSchema, terminalChatAgentToolsConfiguration };
