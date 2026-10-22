// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/onboarding/browser/onboarding.contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { IOnboardingScenarioService, ONBOARDING_DEVELOPER_MODE_CONFIG, ONBOARDING_DEVELOPER_MODE_VARIATIONS_CONFIG, ONBOARDING_ENABLED_CONFIG } from "./module-3580.mjs";
import { OnboardingScenarioService } from "./module-3582.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { onboardingScenarioRegistry } from "./module-3578.mjs";
import { workbenchConfigurationNodeBase } from "./module-1112.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Disposable } from "./module-0012.mjs";
import { SpotlightPresentation } from "./module-3588.mjs";
import { onboardingPresentationRegistry } from "./module-3577.mjs";
import { onboardingSequenceStepPresentationRegistry } from "./module-3579.mjs";
import { OnboardingSequencePresentation } from "./module-3584.mjs";
import { RunOnboardingStepPresentation } from "./module-3583.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { Categories } from "./module-0847.mjs";


// src/vs/workbench/contrib/onboarding/browser/onboarding.contribution.ts
registerSingleton(IOnboardingScenarioService, OnboardingScenarioService, 1 /* Delayed */);

var configurationRegistry22 = Registry.as(Extensions4.Configuration);

function buildDeveloperModeConfigurationNode() {
  const properties = {};
  const defaultValue = {};
  const variationProperties = {};
  const variationDefaultValue = {};
  for (const scenario of [...onboardingScenarioRegistry.getScenarios()].sort((a, b) => a.id.localeCompare(b.id))) {
    properties[scenario.id] = { type: "boolean", default: false };
    defaultValue[scenario.id] = false;
    if (scenario.developerModeVariations?.length) {
      variationProperties[scenario.id] = {
        type: "string",
        default: "",
        enum: ["", ...scenario.developerModeVariations]
      };
      variationDefaultValue[scenario.id] = "";
    }
  }
  return {
    ...workbenchConfigurationNodeBase,
    properties: {
      [ONBOARDING_DEVELOPER_MODE_CONFIG]: {
        type: "object",
        default: defaultValue,
        properties,
        additionalProperties: { type: "boolean" },
        tags: ["experimental"],
        description: localize(17919, null, `\`#${ONBOARDING_ENABLED_CONFIG}#\``)
      },
      [ONBOARDING_DEVELOPER_MODE_VARIATIONS_CONFIG]: {
        type: "object",
        default: variationDefaultValue,
        properties: variationProperties,
        additionalProperties: { type: "string" },
        tags: ["experimental"],
        description: localize(17920, null)
      }
    }
  };
}

var developerModeConfigurationNode = buildDeveloperModeConfigurationNode();

configurationRegistry22.registerConfiguration({
  ...workbenchConfigurationNodeBase,
  properties: {
    [ONBOARDING_ENABLED_CONFIG]: {
      type: "boolean",
      default: true,
      description: localize(17921, null)
    }
  }
});

configurationRegistry22.registerConfiguration(developerModeConfigurationNode);

function refreshDeveloperModeConfiguration() {
  const next = buildDeveloperModeConfigurationNode();
  configurationRegistry22.updateConfigurations({ add: [next], remove: [developerModeConfigurationNode] });
  developerModeConfigurationNode = next;
}

var OnboardingContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.onboarding";
  }
  constructor(onboardingService, instantiationService) {
    super();
    refreshDeveloperModeConfiguration();
    this._register(onboardingScenarioRegistry.onDidChange(() => refreshDeveloperModeConfiguration()));
    const spotlight = this._register(instantiationService.createInstance(SpotlightPresentation));
    this._register(onboardingPresentationRegistry.register(spotlight));
    this._register(onboardingSequenceStepPresentationRegistry.register(spotlight));
    const sequence2 = this._register(new OnboardingSequencePresentation());
    this._register(onboardingPresentationRegistry.register(sequence2));
    this._register(onboardingSequenceStepPresentationRegistry.register(new RunOnboardingStepPresentation()));
    onboardingService.start();
  }
};

OnboardingContribution = __decorateClass([
  __decorateParam(0, IOnboardingScenarioService),
  __decorateParam(1, IInstantiationService)
], OnboardingContribution);

registerWorkbenchContribution2(OnboardingContribution.ID, OnboardingContribution, WorkbenchPhase.AfterRestored);

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.onboarding.resetShownState",
      title: localize2(17922, "Reset Onboarding Shown State"),
      category: Categories.Developer,
      f1: true
    });
  }
  run(accessor) {
    accessor.get(IOnboardingScenarioService).resetAll();
  }
});
export { buildDeveloperModeConfigurationNode, refreshDeveloperModeConfiguration, configurationRegistry22, developerModeConfigurationNode, OnboardingContribution };
