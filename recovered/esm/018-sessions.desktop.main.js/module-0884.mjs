// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/themes/common/tokenClassificationExtensionPoint.ts
import { getTokenClassificationRegistry, typeAndModifierIdPattern } from "./module-0883.mjs";
import { ExtensionsRegistry } from "./module-0878.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/services/themes/common/tokenClassificationExtensionPoint.ts
var tokenClassificationRegistry2 = getTokenClassificationRegistry();

var tokenTypeExtPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "semanticTokenTypes",
  jsonSchema: {
    description: localize(23595, null),
    type: "array",
    items: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: localize(23596, null),
          pattern: typeAndModifierIdPattern,
          patternErrorMessage: localize(23597, null)
        },
        superType: {
          type: "string",
          description: localize(23598, null),
          pattern: typeAndModifierIdPattern,
          patternErrorMessage: localize(23599, null)
        },
        description: {
          type: "string",
          description: localize(23587, null)
        }
      }
    }
  }
});

var tokenModifierExtPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "semanticTokenModifiers",
  jsonSchema: {
    description: localize(23588, null),
    type: "array",
    items: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: localize(23590, null),
          pattern: typeAndModifierIdPattern,
          patternErrorMessage: localize(23591, null)
        },
        description: {
          description: localize(23589, null)
        }
      }
    }
  }
});

var tokenStyleDefaultsExtPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "semanticTokenScopes",
  jsonSchema: {
    description: localize(23592, null),
    type: "array",
    items: {
      type: "object",
      properties: {
        language: {
          description: localize(23593, null),
          type: "string"
        },
        scopes: {
          description: localize(23594, null),
          type: "object",
          additionalProperties: {
            type: "array",
            items: {
              type: "string"
            }
          }
        }
      }
    }
  }
});

var TokenClassificationExtensionPoints = class {
  constructor() {
    function validateTypeOrModifier(contribution, extensionPoint5, collector) {
      if (typeof contribution.id !== "string" || contribution.id.length === 0) {
        collector.error(localize(23601, null, extensionPoint5));
        return false;
      }
      if (!contribution.id.match(typeAndModifierIdPattern)) {
        collector.error(localize(23602, null, extensionPoint5));
        return false;
      }
      const superType = contribution.superType;
      if (superType && !superType.match(typeAndModifierIdPattern)) {
        collector.error(localize(23610, null, extensionPoint5));
        return false;
      }
      if (typeof contribution.description !== "string" || contribution.id.length === 0) {
        collector.error(localize(23600, null, extensionPoint5));
        return false;
      }
      return true;
    }
    tokenTypeExtPoint.setHandler((extensions, delta2) => {
      for (const extension of delta2.added) {
        const extensionValue = extension.value;
        const collector = extension.collector;
        if (!extensionValue || !Array.isArray(extensionValue)) {
          collector.error(localize(23609, null));
          return;
        }
        for (const contribution of extensionValue) {
          if (validateTypeOrModifier(contribution, "semanticTokenType", collector)) {
            tokenClassificationRegistry2.registerTokenType(contribution.id, contribution.description, contribution.superType);
          }
        }
      }
      for (const extension of delta2.removed) {
        const extensionValue = extension.value;
        for (const contribution of extensionValue) {
          tokenClassificationRegistry2.deregisterTokenType(contribution.id);
        }
      }
    });
    tokenModifierExtPoint.setHandler((extensions, delta2) => {
      for (const extension of delta2.added) {
        const extensionValue = extension.value;
        const collector = extension.collector;
        if (!extensionValue || !Array.isArray(extensionValue)) {
          collector.error(localize(23603, null));
          return;
        }
        for (const contribution of extensionValue) {
          if (validateTypeOrModifier(contribution, "semanticTokenModifier", collector)) {
            tokenClassificationRegistry2.registerTokenModifier(contribution.id, contribution.description);
          }
        }
      }
      for (const extension of delta2.removed) {
        const extensionValue = extension.value;
        for (const contribution of extensionValue) {
          tokenClassificationRegistry2.deregisterTokenModifier(contribution.id);
        }
      }
    });
    tokenStyleDefaultsExtPoint.setHandler((extensions, delta2) => {
      for (const extension of delta2.added) {
        const extensionValue = extension.value;
        const collector = extension.collector;
        if (!extensionValue || !Array.isArray(extensionValue)) {
          collector.error(localize(23604, null));
          return;
        }
        for (const contribution of extensionValue) {
          if (contribution.language && typeof contribution.language !== "string") {
            collector.error(localize(23605, null));
            continue;
          }
          if (!contribution.scopes || typeof contribution.scopes !== "object") {
            collector.error(localize(23606, null));
            continue;
          }
          for (const selectorString in contribution.scopes) {
            const tmScopes = contribution.scopes[selectorString];
            if (!Array.isArray(tmScopes) || tmScopes.some((l) => typeof l !== "string")) {
              collector.error(localize(23608, null));
              continue;
            }
            try {
              const selector = tokenClassificationRegistry2.parseTokenSelector(selectorString, contribution.language);
              tokenClassificationRegistry2.registerTokenStyleDefault(selector, { scopesToProbe: tmScopes.map((s) => s.split(" ")) });
            } catch (e4) {
              collector.error(localize(23607, null, selectorString));
            }
          }
        }
      }
      for (const extension of delta2.removed) {
        const extensionValue = extension.value;
        for (const contribution of extensionValue) {
          for (const selectorString in contribution.scopes) {
            const tmScopes = contribution.scopes[selectorString];
            try {
              const selector = tokenClassificationRegistry2.parseTokenSelector(selectorString, contribution.language);
              tokenClassificationRegistry2.registerTokenStyleDefault(selector, { scopesToProbe: tmScopes.map((s) => s.split(" ")) });
            } catch (e4) {
            }
          }
        }
      }
    });
  }
};
export { tokenClassificationRegistry2, tokenTypeExtPoint, tokenModifierExtPoint, tokenStyleDefaultsExtPoint, TokenClassificationExtensionPoints };
