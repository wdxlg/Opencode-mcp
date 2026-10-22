// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalMainContribution.ts
import { Disposable } from "./module-0012.mjs";
import { Schemas } from "./module-0033.mjs";
import { ITerminalEditorService, ITerminalGroupService, ITerminalInstanceService, ITerminalService, terminalEditorId } from "./module-1150.mjs";
import { terminalStrings } from "./module-3030.mjs";
import { parseTerminalUri } from "./module-2131.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorResolverService } from "./module-1114.mjs";
import { IEmbedderTerminalService } from "./module-1667.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { ILabelService } from "./module-0641.mjs";
import { ILifecycleService } from "./module-0870.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalMainContribution.ts
var TerminalMainContribution = class extends Disposable {
  static {
    this.ID = "terminalMain";
  }
  constructor(editorResolverService, embedderTerminalService, workbenchEnvironmentService, labelService, lifecycleService, terminalService, terminalEditorService, terminalGroupService, terminalInstanceService) {
    super();
    this._init(
      editorResolverService,
      embedderTerminalService,
      workbenchEnvironmentService,
      labelService,
      lifecycleService,
      terminalService,
      terminalEditorService,
      terminalGroupService,
      terminalInstanceService
    );
  }
  async _init(editorResolverService, embedderTerminalService, workbenchEnvironmentService, labelService, lifecycleService, terminalService, terminalEditorService, terminalGroupService, terminalInstanceService) {
    this._register(embedderTerminalService.onDidCreateTerminal(async (embedderTerminal) => {
      const terminal2 = await terminalService.createTerminal({
        config: embedderTerminal,
        location: 1 /* Panel */,
        skipContributedProfileCheck: true
      });
      terminalService.setActiveInstance(terminal2);
      await terminalService.revealActiveTerminal();
    }));
    await lifecycleService.when(3 /* Restored */);
    this._register(editorResolverService.registerEditor(
      `${Schemas.vscodeTerminal}:/**`,
      {
        id: terminalEditorId,
        label: terminalStrings.terminal,
        priority: "exclusive" /* exclusive */
      },
      {
        canSupportResource: (uri4) => uri4.scheme === Schemas.vscodeTerminal,
        singlePerResource: true
      },
      {
        createEditorInput: async ({ resource, options: options3 }) => {
          let instance2 = terminalService.getInstanceFromResource(resource);
          if (instance2) {
            const sourceGroup = terminalGroupService.getGroupForInstance(instance2);
            sourceGroup?.removeInstance(instance2);
          } else {
            const terminalIdentifier = parseTerminalUri(resource);
            if (!terminalIdentifier.instanceId) {
              throw new Error("Terminal identifier without instanceId");
            }
            const primaryBackend = terminalService.getPrimaryBackend();
            if (!primaryBackend) {
              throw new Error("No terminal primary backend");
            }
            const attachPersistentProcess = await primaryBackend.requestDetachInstance(terminalIdentifier.workspaceId, terminalIdentifier.instanceId);
            if (!attachPersistentProcess) {
              throw new Error("No terminal persistent process to attach");
            }
            instance2 = terminalInstanceService.createInstance({ attachPersistentProcess }, 2 /* Editor */);
          }
          const resolvedResource = terminalEditorService.resolveResource(instance2);
          const editor = terminalEditorService.getInputFromResource(resolvedResource);
          return {
            editor,
            options: {
              ...options3,
              pinned: true,
              forceReload: true,
              override: terminalEditorId
            }
          };
        }
      }
    ));
    this._register(labelService.registerFormatter({
      scheme: Schemas.vscodeTerminal,
      formatting: {
        label: "${path}",
        separator: ""
      }
    }));
  }
};

TerminalMainContribution = __decorateClass([
  __decorateParam(0, IEditorResolverService),
  __decorateParam(1, IEmbedderTerminalService),
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, ILabelService),
  __decorateParam(4, ILifecycleService),
  __decorateParam(5, ITerminalService),
  __decorateParam(6, ITerminalEditorService),
  __decorateParam(7, ITerminalGroupService),
  __decorateParam(8, ITerminalInstanceService)
], TerminalMainContribution);
export { TerminalMainContribution };
