// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/debugExpressionRenderer.ts
import { LinkDetector2 } from "./module-2407.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { splitExpressionOrScopeHighlights } from "./module-2399.mjs";
import { COPY_EVALUATE_PATH_ID, COPY_VALUE_ID } from "./module-2406.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { Expression, ExpressionContainer, Variable3 } from "./module-1064.mjs";
import { ReplEvaluationResult } from "./module-2400.mjs";
import { $, append, clearNode } from "./module-0075.mjs";
import { handleANSIOutput } from "./module-2401.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IHoverService } from "./module-0520.mjs";


// src/vs/workbench/contrib/debug/browser/debugExpressionRenderer.ts
var MAX_VALUE_RENDER_LENGTH_IN_VIEWLET = 1024;

var booleanRegex = /^(true|false)$/i;

var stringRegex = /^(['"]).*\1$/;

var allClasses = Object.keys({
  ["value" /* Value */]: 0,
  ["unavailable" /* Unavailable */]: 0,
  ["error" /* Error */]: 0,
  ["changed" /* Changed */]: 0,
  ["boolean" /* Boolean */]: 0,
  ["string" /* String */]: 0,
  ["number" /* Number */]: 0
});

var DebugExpressionRenderer = class {
  constructor(commandService, configurationService, instantiationService, hoverService) {
    this.commandService = commandService;
    this.hoverService = hoverService;
    this.linkDetector = instantiationService.createInstance(LinkDetector2);
    this.displayType = observableConfigValue("debug.showVariableTypes", false, configurationService);
  }
  renderVariable(data, variable, options3 = {}) {
    const displayType = this.displayType.get();
    const highlights = splitExpressionOrScopeHighlights(variable, options3.highlights || []);
    if (variable.available) {
      data.type.textContent = "";
      let text2 = variable.name;
      if (variable.value && typeof variable.name === "string") {
        if (variable.type && displayType) {
          text2 += ": ";
          data.type.textContent = variable.type + " =";
        } else {
          text2 += " =";
        }
      }
      data.label.set(text2, highlights.name, variable.type && !displayType ? variable.type : variable.name);
      data.name.classList.toggle("virtual", variable.presentationHint?.kind === "virtual");
      data.name.classList.toggle("internal", variable.presentationHint?.visibility === "internal");
    } else if (variable.value && typeof variable.name === "string" && variable.name) {
      data.label.set(":");
    }
    data.expression.classList.toggle("lazy", !!variable.presentationHint?.lazy);
    const commands = [
      { id: COPY_VALUE_ID, args: [variable, [variable]] }
    ];
    if (variable.evaluateName) {
      commands.push({ id: COPY_EVALUATE_PATH_ID, args: [{ variable }] });
    }
    return this.renderValue(data.value, variable, {
      showChanged: options3.showChanged,
      maxValueLength: MAX_VALUE_RENDER_LENGTH_IN_VIEWLET,
      hover: { commands },
      highlights: highlights.value,
      colorize: true,
      session: variable.getSession()
    });
  }
  renderValue(container3, expressionOrValue, options3 = {}) {
    const store = new DisposableStore();
    const supportsANSI = options3.session?.rememberedCapabilities?.supportsANSIStyling ?? options3.wasANSI ?? false;
    let value2 = typeof expressionOrValue === "string" ? expressionOrValue : expressionOrValue.value;
    for (const cls of allClasses) {
      container3.classList.remove(cls);
    }
    container3.classList.add("value" /* Value */);
    if (value2 === null || (expressionOrValue instanceof Expression || expressionOrValue instanceof Variable3 || expressionOrValue instanceof ReplEvaluationResult) && !expressionOrValue.available) {
      container3.classList.add("unavailable" /* Unavailable */);
      if (value2 !== Expression.DEFAULT_VALUE) {
        container3.classList.add("error" /* Error */);
      }
    } else {
      if (typeof expressionOrValue !== "string" && options3.showChanged && expressionOrValue.valueChanged && value2 !== Expression.DEFAULT_VALUE) {
        container3.classList.add("changed" /* Changed */);
        expressionOrValue.valueChanged = false;
      }
      if (options3.colorize && typeof expressionOrValue !== "string") {
        if (expressionOrValue.type === "number" || expressionOrValue.type === "boolean" || expressionOrValue.type === "string") {
          container3.classList.add(expressionOrValue.type);
        } else if (!isNaN(+value2)) {
          container3.classList.add("number" /* Number */);
        } else if (booleanRegex.test(value2)) {
          container3.classList.add("boolean" /* Boolean */);
        } else if (stringRegex.test(value2)) {
          container3.classList.add("string" /* String */);
        }
      }
    }
    if (options3.maxValueLength && value2 && value2.length > options3.maxValueLength) {
      value2 = value2.substring(0, options3.maxValueLength) + "...";
    }
    if (!value2) {
      value2 = "";
    }
    const session = options3.session ?? (expressionOrValue instanceof ExpressionContainer ? expressionOrValue.getSession() : void 0);
    const hoverBehavior = options3.hover === false ? { type: 0 /* Rich */, store } : { type: 2 /* None */, store };
    clearNode(container3);
    const locationReference = options3.locationReference ?? (expressionOrValue instanceof ExpressionContainer && expressionOrValue.valueLocationReference);
    let linkDetector = this.linkDetector;
    if (locationReference && session) {
      linkDetector = this.linkDetector.makeReferencedLinkDetector(locationReference, session);
    }
    if (supportsANSI) {
      container3.appendChild(handleANSIOutput(value2, linkDetector, session ? session.root : void 0, options3.highlights, hoverBehavior));
    } else {
      container3.appendChild(linkDetector.linkify(value2, hoverBehavior, false, session?.root, true, options3.highlights));
    }
    if (options3.hover !== false) {
      const { commands = [] } = options3.hover || {};
      store.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), container3, () => {
        const container4 = $("div");
        const markdownHoverElement = $("div.hover-row");
        const hoverContentsElement = append(markdownHoverElement, $("div.hover-contents"));
        const hoverContentsPre = append(hoverContentsElement, $("pre.debug-var-hover-pre"));
        if (supportsANSI) {
          hoverContentsPre.appendChild(handleANSIOutput(value2, this.linkDetector, session ? session.root : void 0, options3.highlights, hoverBehavior));
        } else {
          hoverContentsPre.textContent = value2;
        }
        container4.appendChild(markdownHoverElement);
        return container4;
      }, {
        actions: commands.map(({ id: id2, args: args2 }) => {
          const description = CommandsRegistry.getCommand(id2)?.metadata?.description;
          return {
            label: typeof description === "string" ? description : description ? description.value : id2,
            commandId: id2,
            run: () => this.commandService.executeCommand(id2, ...args2)
          };
        })
      }));
    }
    return store;
  }
};

DebugExpressionRenderer = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IHoverService)
], DebugExpressionRenderer);
export { MAX_VALUE_RENDER_LENGTH_IN_VIEWLET, booleanRegex, stringRegex, allClasses, DebugExpressionRenderer };
