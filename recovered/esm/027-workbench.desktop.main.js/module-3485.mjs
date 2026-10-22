// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/remote/common/remote.contribution.ts
import { OS, isWeb } from "./module-0014.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IRemoteAgentService } from "./module-0937.mjs";
import { Disposable } from "./module-0012.mjs";
import { DownloadServiceChannel } from "./module-3482.mjs";
import { RemoteLoggerChannelClient } from "./module-3483.mjs";
import { IDownloadService } from "./module-1284.mjs";
import { ILoggerService } from "./module-0095.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { IFileService } from "./module-0269.mjs";
import { IDialogService, IFileDialogService } from "./module-0267.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10, WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { Categories } from "./module-0847.mjs";
import { PersistentConnection } from "./module-3481.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { REMOTE_DEFAULT_IF_LOCAL_EXTENSIONS } from "./module-3484.mjs";
import { product_default } from "./module-0139.mjs";


// src/vs/workbench/contrib/remote/common/remote.contribution.ts
var EXTENSION_IDENTIFIER_PATTERN2 = "([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$";

var LabelContribution = class {
  constructor(labelService, remoteAgentService) {
    this.labelService = labelService;
    this.remoteAgentService = remoteAgentService;
    this.registerFormatters();
  }
  static {
    this.ID = "workbench.contrib.remoteLabel";
  }
  registerFormatters() {
    this.remoteAgentService.getEnvironment().then((remoteEnvironment) => {
      const os = remoteEnvironment?.os || OS;
      const formatting = {
        label: "${path}",
        separator: os === 1 /* Windows */ ? "\\" : "/",
        tildify: os !== 1 /* Windows */,
        normalizeDriveLetter: os === 1 /* Windows */,
        workspaceSuffix: isWeb ? void 0 : Schemas.vscodeRemote
      };
      this.labelService.registerFormatter({
        scheme: Schemas.vscodeRemote,
        formatting
      });
      if (remoteEnvironment) {
        this.labelService.registerFormatter({
          scheme: Schemas.vscodeUserData,
          formatting
        });
      }
    });
  }
};

LabelContribution = __decorateClass([
  __decorateParam(0, ILabelService),
  __decorateParam(1, IRemoteAgentService)
], LabelContribution);

var RemoteChannelsContribution = class extends Disposable {
  constructor(remoteAgentService, downloadService, loggerService) {
    super();
    const connection = remoteAgentService.getConnection();
    if (connection) {
      connection.registerChannel("download", new DownloadServiceChannel(downloadService));
      connection.withChannel("logger", async (channel) => this._register(new RemoteLoggerChannelClient(loggerService, channel)));
    }
  }
};

RemoteChannelsContribution = __decorateClass([
  __decorateParam(0, IRemoteAgentService),
  __decorateParam(1, IDownloadService),
  __decorateParam(2, ILoggerService)
], RemoteChannelsContribution);

var RemoteInvalidWorkspaceDetector = class extends Disposable {
  constructor(fileService, dialogService, environmentService, contextService, fileDialogService, remoteAgentService) {
    super();
    this.fileService = fileService;
    this.dialogService = dialogService;
    this.environmentService = environmentService;
    this.contextService = contextService;
    this.fileDialogService = fileDialogService;
    if (this.environmentService.remoteAuthority) {
      remoteAgentService.getEnvironment().then((remoteEnv) => {
        if (remoteEnv) {
          this.validateRemoteWorkspace();
        }
      });
    }
  }
  static {
    this.ID = "workbench.contrib.remoteInvalidWorkspaceDetector";
  }
  async validateRemoteWorkspace() {
    const workspace = this.contextService.getWorkspace();
    const workspaceUriToStat = workspace.configuration ?? workspace.folders.at(0)?.uri;
    if (!workspaceUriToStat) {
      return;
    }
    const exists = await this.fileService.exists(workspaceUriToStat);
    if (exists) {
      return;
    }
    const res = await this.dialogService.confirm({
      type: "warning",
      message: localize(18608, null),
      detail: localize(18607, null),
      primaryButton: localize(18609, null)
    });
    if (res.confirmed) {
      if (workspace.configuration) {
        return this.fileDialogService.pickWorkspaceAndOpen({});
      }
      return this.fileDialogService.pickFolderAndOpen({});
    }
  }
};

RemoteInvalidWorkspaceDetector = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IDialogService),
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, IWorkspaceContextService),
  __decorateParam(4, IFileDialogService),
  __decorateParam(5, IRemoteAgentService)
], RemoteInvalidWorkspaceDetector);

var workbenchContributionsRegistry4 = Registry.as(Extensions10.Workbench);

registerWorkbenchContribution2(LabelContribution.ID, LabelContribution, WorkbenchPhase.BlockStartup);

workbenchContributionsRegistry4.registerWorkbenchContribution(RemoteChannelsContribution, 3 /* Restored */);

registerWorkbenchContribution2(RemoteInvalidWorkspaceDetector.ID, RemoteInvalidWorkspaceDetector, WorkbenchPhase.BlockStartup);

var enableDiagnostics = true;

if (enableDiagnostics) {
  class TriggerReconnectAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.triggerReconnect",
        title: localize2(18640, "Connection: Trigger Reconnect"),
        category: Categories.Developer,
        f1: true
      });
    }
    async run(accessor) {
      PersistentConnection.debugTriggerReconnection();
    }
  }
  class PauseSocketWriting extends Action2 {
    constructor() {
      super({
        id: "workbench.action.pauseSocketWriting",
        title: localize2(18610, "Connection: Pause socket writing"),
        category: Categories.Developer,
        f1: true
      });
    }
    async run(accessor) {
      PersistentConnection.debugPauseSocketWriting();
    }
  }
  registerAction2(TriggerReconnectAction);
  registerAction2(PauseSocketWriting);
}

var extensionKindSchema2 = {
  type: "string",
  enum: [
    "ui",
    "workspace"
  ],
  enumDescriptions: [
    localize(18641, null),
    localize(18642, null)
  ]
};

Registry.as(Extensions4.Configuration).registerConfiguration({
  id: "remote",
  title: localize(18611, null),
  type: "object",
  properties: {
    "remote.extensionKind": {
      type: "object",
      markdownDescription: localize(18620, null),
      patternProperties: {
        [EXTENSION_IDENTIFIER_PATTERN2]: {
          oneOf: [{ type: "array", items: extensionKindSchema2 }, extensionKindSchema2],
          default: ["ui"]
        }
      },
      default: {
        "pub.name": ["ui"]
      }
    },
    "remote.restoreForwardedPorts": {
      type: "boolean",
      markdownDescription: localize(18639, null),
      default: true
    },
    "remote.autoForwardPorts": {
      type: "boolean",
      markdownDescription: localize(18613, null, "`#remote.autoForwardPortsSource#`"),
      default: true
    },
    "remote.autoForwardPortsSource": {
      type: "string",
      markdownDescription: localize(18614, null, "`#remote.autoForwardPorts#`", "`#remote.autoForwardPortsSource#`"),
      enum: ["process", "output", "hybrid"],
      enumDescriptions: [
        localize(18617, null),
        localize(18616, null),
        localize(18615, null)
      ],
      default: "process"
    },
    "remote.autoForwardPortsFallback": {
      type: "number",
      default: 20,
      markdownDescription: localize(18612, null)
    },
    "remote.forwardOnOpen": {
      type: "boolean",
      description: localize(18621, null),
      default: true
    },
    // Consider making changes to extensions\configuration-editing\schemas\devContainer.schema.src.json
    // and extensions\configuration-editing\schemas\attachContainer.schema.json
    // to keep in sync with devcontainer.json schema.
    "remote.portsAttributes": {
      type: "object",
      patternProperties: {
        "(^\\d+(-\\d+)?$)|(.+)": {
          type: "object",
          description: localize(18635, null),
          properties: {
            "onAutoForward": {
              type: "string",
              enum: ["notify", "openBrowser", "openBrowserOnce", "openPreview", "silent", "ignore"],
              enumDescriptions: [
                localize(18629, null),
                localize(18631, null),
                localize(18632, null),
                localize(18633, null),
                localize(18638, null),
                localize(18626, null)
              ],
              description: localize(18630, null),
              default: "notify"
            },
            "elevateIfNeeded": {
              type: "boolean",
              description: localize(18625, null),
              default: false
            },
            "label": {
              type: "string",
              description: localize(18627, null),
              default: localize(18628, null)
            },
            "requireLocalPort": {
              type: "boolean",
              markdownDescription: localize(18637, null),
              default: false
            },
            "protocol": {
              type: "string",
              enum: ["http", "https"],
              description: localize(18636, null)
            }
          },
          default: {
            "label": localize(18628, null),
            "onAutoForward": "notify"
          }
        }
      },
      markdownDescription: localize(18623, null),
      defaultSnippets: [{ body: { "${1:3000}": { label: "${2:Application}", onAutoForward: "openPreview" } } }],
      errorMessage: localize(18634, null),
      additionalProperties: false,
      default: {
        "443": {
          "protocol": "https"
        },
        "8443": {
          "protocol": "https"
        }
      }
    },
    "remote.otherPortsAttributes": {
      type: "object",
      properties: {
        "onAutoForward": {
          type: "string",
          enum: ["notify", "openBrowser", "openPreview", "silent", "ignore"],
          enumDescriptions: [
            localize(18629, null),
            localize(18631, null),
            localize(18633, null),
            localize(18638, null),
            localize(18626, null)
          ],
          description: localize(18630, null),
          default: "notify"
        },
        "elevateIfNeeded": {
          type: "boolean",
          description: localize(18625, null),
          default: false
        },
        "label": {
          type: "string",
          description: localize(18627, null),
          default: localize(18628, null)
        },
        "requireLocalPort": {
          type: "boolean",
          markdownDescription: localize(18637, null),
          default: false
        },
        "protocol": {
          type: "string",
          enum: ["http", "https"],
          description: localize(18636, null)
        }
      },
      defaultSnippets: [{ body: { onAutoForward: "ignore" } }],
      markdownDescription: localize(18624, null, "`#remote.portsAttributes#`"),
      additionalProperties: false
    },
    "remote.localPortHost": {
      type: "string",
      enum: ["localhost", "allInterfaces"],
      default: "localhost",
      description: localize(18622, null)
    },
    [REMOTE_DEFAULT_IF_LOCAL_EXTENSIONS]: {
      type: "array",
      markdownDescription: localize(18619, null),
      default: product_default?.remoteDefaultExtensionsIfInstalledLocally || [],
      items: {
        type: "string",
        pattern: EXTENSION_IDENTIFIER_PATTERN2,
        patternErrorMessage: localize(18618, null)
      }
    }
  }
});
export { EXTENSION_IDENTIFIER_PATTERN2, LabelContribution, RemoteChannelsContribution, RemoteInvalidWorkspaceDetector, workbenchContributionsRegistry4, enableDiagnostics, extensionKindSchema2 };
