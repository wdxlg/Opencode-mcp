// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/customizationGroupHeaderRenderer.ts
import { $, append } from "./module-0075.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/customizationGroupHeaderRenderer.ts
var $84 = $;

var CUSTOMIZATION_GROUP_HEADER_HEIGHT = 36;

var CUSTOMIZATION_GROUP_HEADER_HEIGHT_WITH_SEPARATOR = 40;

var CustomizationGroupHeaderRenderer = class {
  constructor(templateId, hoverService) {
    this.templateId = templateId;
    this.hoverService = hoverService;
  }
  renderTemplate(container3) {
    const disposables = new DisposableStore();
    const elementDisposables = new DisposableStore();
    container3.classList.add("ai-customization-group-header");
    const chevron = append(container3, $84(".group-chevron"));
    const icon2 = append(container3, $84(".group-icon"));
    const labelGroup = append(container3, $84(".group-label-group"));
    const label3 = append(labelGroup, $84(".group-label"));
    const count2 = append(container3, $84(".group-count"));
    const infoIcon2 = append(container3, $84(".group-info"));
    infoIcon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.info));
    return { container: container3, chevron, icon: icon2, label: label3, count: count2, infoIcon: infoIcon2, disposables, elementDisposables };
  }
  renderElement(element, _index, templateData) {
    templateData.elementDisposables.clear();
    templateData.chevron.className = "group-chevron";
    templateData.chevron.classList.add(...ThemeIcon.asClassNameArray(element.collapsed ? Codicon.chevronRight : Codicon.chevronDown));
    templateData.icon.className = "group-icon";
    templateData.icon.classList.add(...ThemeIcon.asClassNameArray(element.icon));
    templateData.label.textContent = element.label;
    templateData.count.textContent = `${element.count}`;
    templateData.elementDisposables.add(this.hoverService.setupDelayedHover(templateData.infoIcon, () => ({
      content: element.description,
      appearance: {
        compact: true,
        skipFadeInAnimation: true
      }
    })));
    templateData.container.classList.toggle("collapsed", element.collapsed);
    templateData.container.classList.toggle("has-previous-group", !element.isFirst);
  }
  disposeTemplate(templateData) {
    templateData.elementDisposables.dispose();
    templateData.disposables.dispose();
  }
};
export { $84, CUSTOMIZATION_GROUP_HEADER_HEIGHT, CUSTOMIZATION_GROUP_HEADER_HEIGHT_WITH_SEPARATOR, CustomizationGroupHeaderRenderer };
