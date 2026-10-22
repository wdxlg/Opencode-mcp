// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/features/browserEditorErrorFeatures.ts
import { BrowserEditor, BrowserEditorContribution } from "./module-4048.mjs";
import { $, EventType, addDisposableListener } from "./module-0075.mjs";
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { renderIcon } from "./module-0467.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { isLinux, isMacintosh } from "./module-0014.mjs";
import { ButtonBar } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Emitter } from "./module-0017.mjs";
import { IHoverService } from "./module-0520.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/features/browserEditorErrorFeatures.ts
var BrowserEditorErrorFeatures = class extends BrowserEditorContribution {
  constructor(editor, instantiationService) {
    super(editor);
    this._element = $(".browser-error-container");
    this._certActionButton = this._register(new MutableDisposable());
    this._siteInfoSlot = $(".browser-site-info-slot-wrapper");
    this._urlRenderer = this._register(new CertUrlRenderer());
    this._element.style.display = "none";
    this._content = { location: "contentArea" /* ContentArea */, element: this._element, order: 300 };
    this._siteInfoWidget = this._register(instantiationService.createInstance(SiteInfoWidget, this._siteInfoSlot, editor));
    this._preUrlWidget = { location: "preUrl" /* PreUrl */, element: this._siteInfoSlot, order: 10 };
  }
  get widgets() {
    return [this._content, this._preUrlWidget];
  }
  get urlRenderers() {
    return [this._urlRenderer];
  }
  onModelAttached(model, store) {
    store.add(model.onDidChangeLoadingState(() => this._updateError()));
    store.add(model.onDidNavigate(() => this._updateCertState()));
    this._updateError();
  }
  onModelDetached() {
    this._clearContent();
    this._element.style.display = "none";
    this._siteInfoWidget.setCertificateError(void 0);
    this._urlRenderer.setCertificateError(void 0);
  }
  _updateError() {
    const model = this.editor.model;
    if (!model) {
      return;
    }
    const error = model.error;
    this._updateCertState();
    if (!error) {
      this._element.style.display = "none";
      return;
    }
    this._clearContent();
    this._element.appendChild(this._renderError(error));
    this._element.style.display = "";
  }
  _updateCertState() {
    const model = this.editor.model;
    const cert = model?.certificateError ?? model?.error?.certificateError;
    this._siteInfoWidget.setCertificateError(cert);
    this._urlRenderer.setCertificateError(cert);
  }
  _clearContent() {
    this._certActionButton.clear();
    while (this._element.firstChild) {
      this._element.removeChild(this._element.firstChild);
    }
  }
  _renderError(error) {
    const isCertError = !!error.certificateError;
    const errorContent = $(".browser-error-content");
    const errorIcon2 = $(".browser-error-icon");
    errorIcon2.classList.toggle("cert-error", isCertError);
    errorIcon2.appendChild(renderIcon(isCertError ? Codicon.workspaceUntrusted : Codicon.globe));
    const errorTitle = $(".browser-error-title");
    errorTitle.textContent = isCertError ? localize(8082, null) : localize(8094, null);
    const errorMessage = $(".browser-error-detail");
    const errorText = $("span");
    errorText.textContent = isCertError ? localize(8080, null) : `${error.errorDescription} (${error.errorCode})`;
    errorMessage.appendChild(errorText);
    if (error.certificateError) {
      const extraWarning = $("b.browser-error-detail");
      extraWarning.textContent = localize(8081, null);
      errorMessage.appendChild(extraWarning);
    }
    if (this.editor.model?.isRemoteSession) {
      const remoteWarning = error.errorCode === -111 || error.errorCode === -324 ? localize(8096, null) : "";
      if (remoteWarning) {
        const remoteWarningEl = $(".browser-error-detail.hint");
        remoteWarningEl.textContent = remoteWarning;
        errorMessage.appendChild(remoteWarningEl);
      }
    }
    const errorUrl = $(".browser-error-detail");
    const urlLabel = $("strong");
    urlLabel.textContent = localize(8093, null);
    const urlValue = $("code");
    urlValue.textContent = error.url;
    errorUrl.appendChild(urlLabel);
    errorUrl.appendChild(document.createTextNode(" "));
    errorUrl.appendChild(urlValue);
    errorContent.appendChild(errorIcon2);
    errorContent.appendChild(errorTitle);
    errorContent.appendChild(errorMessage);
    errorContent.appendChild(errorUrl);
    if (error.certificateError) {
      errorContent.appendChild(this._renderCertDetails(error.certificateError));
      errorContent.appendChild(this._renderCertActions(error.certificateError));
    }
    return errorContent;
  }
  _renderCertDetails(certError) {
    const certDetailsTable = $(".browser-cert-details-table");
    const heading2 = $(".browser-cert-details-heading");
    heading2.textContent = localize(8078, null);
    certDetailsTable.appendChild(heading2);
    const addRow = (label3, value2) => {
      const row = $(".browser-cert-details-row");
      const labelEl = $(".browser-cert-details-label");
      labelEl.textContent = label3;
      const valueEl = $(".browser-cert-details-value");
      valueEl.textContent = value2;
      row.appendChild(labelEl);
      row.appendChild(valueEl);
      certDetailsTable.appendChild(row);
    };
    addRow(localize(8079, null), certError.error);
    addRow(localize(8088, null), certError.issuerName);
    addRow(localize(8091, null), certError.subjectName);
    const formatDate2 = (epoch) => new Date(epoch * 1e3).toLocaleDateString();
    addRow(
      localize(8092, null),
      `${formatDate2(certError.validStart)} - ${formatDate2(certError.validExpiry)}`
    );
    addRow(localize(8083, null), certError.fingerprint);
    return certDetailsTable;
  }
  _renderCertActions(certError) {
    const actionContainer = $(".browser-cert-action");
    actionContainer.classList.toggle("reverse", isMacintosh || isLinux);
    const canGoBack = this.editor.model?.canGoBack ?? false;
    const buttonBar = new ButtonBar(actionContainer);
    this._certActionButton.value = buttonBar;
    const primaryButton = buttonBar.addButton({ ...defaultButtonStyles });
    primaryButton.label = canGoBack ? localize(8084, null) : localize(8077, null);
    primaryButton.onDidClick(() => {
      if (canGoBack) {
        this.editor.model?.goBack();
      } else {
        this.editor.closeTab();
      }
    });
    const secondaryButton = buttonBar.addButton({ ...defaultButtonStyles, secondary: true });
    secondaryButton.label = localize(8089, null);
    secondaryButton.onDidClick(() => {
      this.editor.model?.trustCertificate(certError.host, certError.fingerprint);
    });
    return actionContainer;
  }
};

BrowserEditorErrorFeatures = __decorateClass([
  __decorateParam(1, IInstantiationService)
], BrowserEditorErrorFeatures);

var CertUrlRenderer = class _CertUrlRenderer {
  constructor() {
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
    this._hasCertError = false;
  }
  static {
    this.HTTPS_PREFIX = "https:";
  }
  setCertificateError(certError) {
    const next = !!certError;
    if (this._hasCertError === next) {
      return;
    }
    this._hasCertError = next;
    this._onDidChange.fire();
  }
  render(url, container3) {
    if (!this._hasCertError || !url.startsWith(_CertUrlRenderer.HTTPS_PREFIX)) {
      return false;
    }
    const protocol = document.createElement("span");
    protocol.className = "browser-url-display-protocol-bad";
    protocol.textContent = _CertUrlRenderer.HTTPS_PREFIX;
    container3.appendChild(protocol);
    const rest = document.createElement("span");
    rest.textContent = url.slice(_CertUrlRenderer.HTTPS_PREFIX.length);
    container3.appendChild(rest);
    return true;
  }
  dispose() {
    this._onDidChange.dispose();
  }
};

var SiteInfoWidget = class extends Disposable {
  constructor(parent, _editor, _hoverService) {
    super();
    this._editor = _editor;
    this._hoverService = _hoverService;
    this._container = $(".browser-site-info-container");
    this._container.style.display = "none";
    this._indicator = $(".browser-site-info-indicator");
    this._indicator.tabIndex = 0;
    this._indicator.role = "button";
    this._indicator.ariaLabel = localize(8095, null);
    this._indicator.appendChild(renderIcon(Codicon.workspaceUntrusted));
    this._container.appendChild(this._indicator);
    parent.appendChild(this._container);
    this._register(addDisposableListener(this._indicator, EventType.CLICK, () => this._showHover()));
    this._register(addDisposableListener(this._indicator, EventType.KEY_DOWN, (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this._showHover();
      }
    }));
  }
  /** Update visibility and state from a certificate error (or lack thereof). */
  setCertificateError(certError) {
    this._certError = certError;
    this._container.style.display = certError ? "" : "none";
  }
  _showHover() {
    const certError = this._certError;
    if (!certError) {
      return;
    }
    const content2 = document.createElement("div");
    content2.classList.add("browser-site-info-hover-content");
    const heading2 = document.createElement("div");
    heading2.classList.add("browser-site-info-hover-heading");
    heading2.textContent = localize(8087, null);
    content2.appendChild(heading2);
    const detail1 = document.createElement("div");
    detail1.classList.add("browser-site-info-hover-detail");
    detail1.textContent = localize(8085, null);
    content2.appendChild(detail1);
    if (certError.hasTrustedException) {
      const detail2 = document.createElement("div");
      detail2.classList.add("browser-site-info-hover-detail");
      detail2.textContent = localize(
        8086,
        null,
        certError.host,
        certError.error
      );
      content2.appendChild(detail2);
      const revokeLink = document.createElement("a");
      revokeLink.classList.add("browser-site-info-hover-revoke");
      revokeLink.textContent = localize(8090, null);
      revokeLink.role = "button";
      revokeLink.tabIndex = 0;
      revokeLink.addEventListener("click", () => {
        hover?.dispose();
        this._editor.model?.untrustCertificate(certError.host, certError.fingerprint);
      });
      revokeLink.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          hover?.dispose();
          this._editor.model?.untrustCertificate(certError.host, certError.fingerprint);
        }
      });
      content2.appendChild(revokeLink);
    }
    const hover = this._hoverService.showInstantHover({
      content: content2,
      target: this._indicator,
      container: this._container,
      position: { hoverPosition: 2 /* BELOW */ },
      persistence: { sticky: true }
    }, true);
  }
};

SiteInfoWidget = __decorateClass([
  __decorateParam(2, IHoverService)
], SiteInfoWidget);

BrowserEditor.registerContribution(BrowserEditorErrorFeatures);
export { BrowserEditorErrorFeatures, CertUrlRenderer, SiteInfoWidget };
