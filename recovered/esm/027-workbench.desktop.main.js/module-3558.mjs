// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedAccessibleView.ts
import { GettingStartedPage, inWelcomeContext } from "./module-3557.mjs";
import { IEditorService } from "./module-0934.mjs";
import { GettingStartedInput } from "./module-3494.mjs";
import { IWalkthroughsService } from "./module-3495.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { Disposable } from "./module-0012.mjs";
import { Action } from "./module-0082.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { URI } from "./module-0032.mjs";
import { parse2 } from "./module-0265.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedAccessibleView.ts
var GettingStartedAccessibleView = class {
  constructor() {
    this.type = "view" /* View */;
    this.priority = 110;
    this.name = "walkthroughs";
    this.when = inWelcomeContext;
    this.getProvider = (accessor) => {
      const editorService = accessor.get(IEditorService);
      const editorPane = editorService.activeEditorPane;
      if (!(editorPane instanceof GettingStartedPage)) {
        return;
      }
      const gettingStartedInput = editorPane.input;
      if (!(gettingStartedInput instanceof GettingStartedInput) || !gettingStartedInput.selectedCategory) {
        return;
      }
      const gettingStartedService = accessor.get(IWalkthroughsService);
      const currentWalkthrough = gettingStartedService.getWalkthrough(gettingStartedInput.selectedCategory);
      const currentStepIds = gettingStartedInput.selectedStep;
      if (currentWalkthrough) {
        return new GettingStartedAccessibleProvider(
          accessor.get(IContextKeyService),
          accessor.get(ICommandService),
          accessor.get(IOpenerService),
          editorPane,
          currentWalkthrough,
          currentStepIds
        );
      }
      return;
    };
  }
};

var GettingStartedAccessibleProvider = class extends Disposable {
  constructor(contextService, commandService, openerService, _gettingStartedPage, _walkthrough, _focusedStep) {
    super();
    this.contextService = contextService;
    this.commandService = commandService;
    this.openerService = openerService;
    this._gettingStartedPage = _gettingStartedPage;
    this._walkthrough = _walkthrough;
    this._focusedStep = _focusedStep;
    this._currentStepIndex = 0;
    this._activeWalkthroughSteps = [];
    this.id = "walkthrough" /* Walkthrough */;
    this.verbositySettingKey = "accessibility.verbosity.walkthrough" /* Walkthrough */;
    this.options = { type: "view" /* View */ };
    this._activeWalkthroughSteps = _walkthrough.steps.filter((step) => !step.when || this.contextService.contextMatchesRules(step.when));
  }
  get actions() {
    const actions = [];
    const step = this._activeWalkthroughSteps[this._currentStepIndex];
    const nodes = step.description.map((lt2) => lt2.nodes.filter((node) => typeof node !== "string").map((node) => ({ href: node.href, label: node.label }))).flat();
    if (nodes.length === 1) {
      const node = nodes[0];
      actions.push(new Action("walthrough.step.action", node.label, ThemeIcon.asClassName(Codicon.run), true, () => {
        const isCommand = node.href.startsWith("command:");
        const command4 = node.href.replace(/command:(toSide:)?/, "command:");
        if (isCommand) {
          const commandURI = URI.parse(command4);
          let args2 = [];
          try {
            args2 = parse2(decodeURIComponent(commandURI.query));
          } catch {
            try {
              args2 = parse2(commandURI.query);
            } catch {
            }
          }
          if (!Array.isArray(args2)) {
            args2 = [args2];
          }
          this.commandService.executeCommand(commandURI.path, ...args2);
        } else {
          this.openerService.open(command4, { allowCommands: true });
        }
      }));
    }
    return actions;
  }
  provideContent() {
    if (this._focusedStep) {
      const stepIndex = this._activeWalkthroughSteps.findIndex((step) => step.id === this._focusedStep);
      if (stepIndex !== -1) {
        this._currentStepIndex = stepIndex;
      }
    }
    return this._getContent(
      this._walkthrough,
      this._activeWalkthroughSteps[this._currentStepIndex],
      /* includeTitle */
      true
    );
  }
  _getContent(waltkrough, step, includeTitle) {
    const description = step.description.map((lt2) => lt2.nodes.filter((node) => typeof node === "string")).join("\n");
    const stepsContent = localize(21946, null, step.title, description);
    if (includeTitle) {
      return [
        localize(21947, null, waltkrough.title),
        localize(21945, null, waltkrough.description),
        stepsContent
      ].join("\n");
    } else {
      return stepsContent;
    }
  }
  provideNextContent() {
    if (++this._currentStepIndex >= this._activeWalkthroughSteps.length) {
      --this._currentStepIndex;
      return;
    }
    return this._getContent(this._walkthrough, this._activeWalkthroughSteps[this._currentStepIndex]);
  }
  providePreviousContent() {
    if (--this._currentStepIndex < 0) {
      ++this._currentStepIndex;
      return;
    }
    return this._getContent(this._walkthrough, this._activeWalkthroughSteps[this._currentStepIndex]);
  }
  onClose() {
    if (this._currentStepIndex > -1) {
      const currentStep = this._activeWalkthroughSteps[this._currentStepIndex];
      this._gettingStartedPage.makeCategoryVisibleWhenAvailable(this._walkthrough.id, currentStep.id);
    }
  }
};
export { GettingStartedAccessibleView, GettingStartedAccessibleProvider };
