// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/galleryItemRenderer.ts
import { $, append } from "./module-0075.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/galleryItemRenderer.ts
var $85 = $;

var GalleryItemRenderer = class {
  constructor(templateId, _provider) {
    this.templateId = templateId;
    this._provider = _provider;
  }
  renderTemplate(container3) {
    container3.classList.add("gallery-item");
    const details = append(container3, $85(".gallery-item-details"));
    const name = append(details, $85("span.gallery-item-name"));
    const description = append(details, $85("span.gallery-item-description"));
    const publisher = append(details, $85("span.gallery-item-publisher"));
    const actionContainer = append(container3, $85(".gallery-item-action"));
    const installButton = new Button(actionContainer, { ...defaultButtonStyles, supportIcons: true });
    const templateDisposables = new DisposableStore();
    templateDisposables.add(installButton);
    return { name, publisher, description, installButton, elementDisposables: new DisposableStore(), templateDisposables };
  }
  renderElement(element, _index, templateData) {
    templateData.elementDisposables.clear();
    templateData.name.textContent = this._provider.getLabel(element);
    const publisher = this._provider.getPublisherDisplayName(element);
    templateData.publisher.textContent = publisher ? localize(9683, null, publisher) : "";
    templateData.description.textContent = this._provider.getDescription(element) || "";
    this._updateInstallButton(templateData.installButton, element);
    templateData.elementDisposables.add(templateData.installButton.onDidClick(async () => {
      if (this._provider.getInstallState(element) !== 0 /* Uninstalled */) {
        return;
      }
      if (this._provider.canInstall && !this._provider.canInstall(element)) {
        return;
      }
      templateData.installButton.label = localize(9686, null);
      templateData.installButton.enabled = false;
      try {
        await this._provider.install(element);
      } finally {
        this._updateInstallButton(templateData.installButton, element);
      }
    }));
    const changeListener = this._provider.onDidChangeInstallState?.(element, () => this._updateInstallButton(templateData.installButton, element));
    if (changeListener) {
      templateData.elementDisposables.add(changeListener);
    }
  }
  _updateInstallButton(button, element) {
    switch (this._provider.getInstallState(element)) {
      case 2 /* Installed */:
        button.label = localize(9685, null);
        button.enabled = false;
        break;
      case 1 /* Installing */:
        button.label = localize(9686, null);
        button.enabled = false;
        break;
      default:
        button.label = localize(9684, null);
        button.enabled = true;
        break;
    }
  }
  disposeTemplate(templateData) {
    templateData.elementDisposables.dispose();
    templateData.templateDisposables.dispose();
  }
};
export { $85, GalleryItemRenderer };
