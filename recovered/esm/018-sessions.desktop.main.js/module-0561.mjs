// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/codeAction/browser/codeActionKeybindingResolver.ts
import { codeActionCommandId, fixAllCommandId, organizeImportsCommandId, refactorCommandId, sourceActionCommandId } from "./module-0559.mjs";
import { Lazy } from "./module-0028.mjs";
import { CodeActionCommandArgs, CodeActionKind } from "./module-0558.mjs";
import { HierarchicalKind } from "./module-0535.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";


// src/vs/editor/contrib/codeAction/browser/codeActionKeybindingResolver.ts
var CodeActionKeybindingResolver = class {
  constructor(keybindingService) {
    this.keybindingService = keybindingService;
  }
  static {
    this.codeActionCommands = [
      refactorCommandId,
      codeActionCommandId,
      sourceActionCommandId,
      organizeImportsCommandId,
      fixAllCommandId
    ];
  }
  getResolver() {
    const allCodeActionBindings = new Lazy(() => this.keybindingService.getKeybindings().filter((item) => CodeActionKeybindingResolver.codeActionCommands.indexOf(item.command) >= 0).filter((item) => item.resolvedKeybinding).map((item) => {
      let commandArgs = item.commandArgs;
      if (item.command === organizeImportsCommandId) {
        commandArgs = { kind: CodeActionKind.SourceOrganizeImports.value };
      } else if (item.command === fixAllCommandId) {
        commandArgs = { kind: CodeActionKind.SourceFixAll.value };
      }
      return {
        resolvedKeybinding: item.resolvedKeybinding,
        ...CodeActionCommandArgs.fromUser(commandArgs, {
          kind: HierarchicalKind.None,
          apply: "never" /* Never */
        })
      };
    }));
    return (action) => {
      if (action.kind) {
        const binding = this.bestKeybindingForCodeAction(action, allCodeActionBindings.value);
        return binding?.resolvedKeybinding;
      }
      return void 0;
    };
  }
  bestKeybindingForCodeAction(action, candidates) {
    if (!action.kind) {
      return void 0;
    }
    const kind = new HierarchicalKind(action.kind);
    return candidates.filter((candidate) => candidate.kind.contains(kind)).filter((candidate) => {
      if (candidate.preferred) {
        return action.isPreferred;
      }
      return true;
    }).reduceRight((currentBest, candidate) => {
      if (!currentBest) {
        return candidate;
      }
      return currentBest.kind.contains(candidate.kind) ? candidate : currentBest;
    }, void 0);
  }
};

CodeActionKeybindingResolver = __decorateClass([
  __decorateParam(0, IKeybindingService)
], CodeActionKeybindingResolver);
export { CodeActionKeybindingResolver };
