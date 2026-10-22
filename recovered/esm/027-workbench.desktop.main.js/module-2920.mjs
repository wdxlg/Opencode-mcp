// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/browser/extensionFeaturesTab.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { getExtensionId } from "./module-0886.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { $, EventType, addDisposableListener, append, clearNode } from "./module-0075.mjs";
import { MarkdownString, isMarkdownString } from "./module-0462.mjs";
import { localize } from "./module-0001.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions11, IExtensionFeaturesManagementService } from "./module-0877.mjs";
import { severity_default } from "./module-0266.mjs";
import { errorIcon, infoIcon, warningIcon2 } from "./module-1875.mjs";
import { Codicon } from "./module-0085.mjs";
import { getErrorMessage } from "./module-0004.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { chartAxis, chartGuide, chartLine } from "./module-0228.mjs";
import { foreground } from "./module-0227.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { IThemeService, Themable } from "./module-0287.mjs";
import { Sizing, SplitView } from "./module-0625.mjs";
import { PANEL_SECTION_BORDER } from "./module-0912.mjs";
import { WorkbenchList } from "./module-0636.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { SeverityIcon } from "./module-0699.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles, defaultKeybindingLabelStyles } from "./module-0513.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { ResolvedKeybinding } from "./module-0021.mjs";
import { KeybindingLabel } from "./module-0547.mjs";
import { OS } from "./module-0014.mjs";
import { Color } from "./module-0197.mjs";
import { IDialogService } from "./module-0267.mjs";


// src/vs/workbench/contrib/extensions/browser/extensionFeaturesTab.ts
var RuntimeStatusMarkdownRenderer = class extends Disposable {
  constructor(extensionService, hoverService, extensionFeaturesManagementService, markdownRendererService) {
    super();
    this.extensionService = extensionService;
    this.hoverService = hoverService;
    this.extensionFeaturesManagementService = extensionFeaturesManagementService;
    this.markdownRendererService = markdownRendererService;
    this.type = "element";
  }
  static {
    this.ID = "runtimeStatus";
  }
  shouldRender(manifest) {
    const extensionId = new ExtensionIdentifier(getExtensionId(manifest.publisher, manifest.name));
    if (!this.extensionService.extensions.some((e) => ExtensionIdentifier.equals(e.identifier, extensionId))) {
      return false;
    }
    return !!manifest.main || !!manifest.browser;
  }
  render(manifest) {
    const disposables = new DisposableStore();
    const extensionId = new ExtensionIdentifier(getExtensionId(manifest.publisher, manifest.name));
    const emitter = disposables.add(new Emitter());
    disposables.add(this.extensionService.onDidChangeExtensionsStatus((e) => {
      if (e.some((extension) => ExtensionIdentifier.equals(extension, extensionId))) {
        emitter.fire(this.createElement(manifest, disposables));
      }
    }));
    disposables.add(this.extensionFeaturesManagementService.onDidChangeAccessData((e) => emitter.fire(this.createElement(manifest, disposables))));
    return {
      onDidChange: emitter.event,
      data: this.createElement(manifest, disposables),
      dispose: () => disposables.dispose()
    };
  }
  createElement(manifest, disposables) {
    const container3 = $(".runtime-status");
    const extensionId = new ExtensionIdentifier(getExtensionId(manifest.publisher, manifest.name));
    const status2 = this.extensionService.getExtensionsStatus()[extensionId.value];
    if (this.extensionService.extensions.some((extension) => ExtensionIdentifier.equals(extension.identifier, extensionId))) {
      const data = new MarkdownString();
      data.appendMarkdown(`### ${localize(15041, null)}

`);
      if (status2.activationTimes) {
        if (status2.activationTimes.activationReason.startup) {
          data.appendMarkdown(`Activated on Startup: \`${status2.activationTimes.activateCallTime}ms\``);
        } else {
          data.appendMarkdown(`Activated by \`${status2.activationTimes.activationReason.activationEvent}\` event: \`${status2.activationTimes.activateCallTime}ms\``);
        }
      } else {
        data.appendMarkdown("Not yet activated");
      }
      this.renderMarkdown(data, container3, disposables);
    }
    const features = Registry.as(Extensions11.ExtensionFeaturesRegistry).getExtensionFeatures();
    for (const feature of features) {
      const accessData = this.extensionFeaturesManagementService.getAccessData(extensionId, feature.id);
      if (accessData) {
        this.renderMarkdown(new MarkdownString(`
 ### ${localize(15049, null, feature.label)}

`), container3, disposables);
        if (accessData.accessTimes.length) {
          const description = append(
            container3,
            $(
              ".feature-chart-description",
              void 0,
              localize(15043, null, accessData?.accessTimes.length, feature.accessDataLabel ?? feature.label)
            )
          );
          description.style.marginBottom = "8px";
          this.renderRequestsChart(container3, accessData.accessTimes, disposables);
        }
        const status3 = accessData?.current?.status;
        if (status3) {
          const data = new MarkdownString();
          if (status3?.severity === severity_default.Error) {
            data.appendMarkdown(`$(${errorIcon.id}) ${status3.message}

`);
          }
          if (status3?.severity === severity_default.Warning) {
            data.appendMarkdown(`$(${warningIcon2.id}) ${status3.message}

`);
          }
          if (data.value) {
            this.renderMarkdown(data, container3, disposables);
          }
        }
      }
    }
    if (status2.runtimeErrors.length || status2.messages.length) {
      const data = new MarkdownString();
      if (status2.runtimeErrors.length) {
        data.appendMarkdown(`
 ### ${localize(15055, null, status2.runtimeErrors.length)}
`);
        for (const error of status2.runtimeErrors) {
          data.appendMarkdown(`$(${Codicon.error.id})&nbsp;${getErrorMessage(error)}

`);
        }
      }
      if (status2.messages.length) {
        data.appendMarkdown(`
 ### ${localize(15050, null, status2.messages.length)}
`);
        for (const message of status2.messages) {
          data.appendMarkdown(`$(${(message.type === severity_default.Error ? Codicon.error : message.type === severity_default.Warning ? Codicon.warning : Codicon.info).id})&nbsp;${message.message}

`);
        }
      }
      if (data.value) {
        this.renderMarkdown(data, container3, disposables);
      }
    }
    return container3;
  }
  renderMarkdown(markdown, container3, disposables) {
    const { element } = disposables.add(this.markdownRendererService.render({
      value: markdown.value,
      isTrusted: markdown.isTrusted,
      supportThemeIcons: true
    }));
    append(container3, element);
  }
  renderRequestsChart(container3, accessTimes, disposables) {
    const width2 = 450;
    const height = 250;
    const margin = { top: 0, right: 4, bottom: 20, left: 4 };
    const innerWidth = width2 - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const chartContainer = append(container3, $(".feature-chart-container"));
    chartContainer.style.position = "relative";
    const tooltip = append(chartContainer, $(".feature-chart-tooltip"));
    tooltip.style.position = "absolute";
    tooltip.style.width = "0px";
    tooltip.style.height = "0px";
    let maxCount = 100;
    const map = /* @__PURE__ */ new Map();
    for (const accessTime of accessTimes) {
      const day2 = `${accessTime.getDate()} ${accessTime.toLocaleString("default", { month: "short" })}`;
      map.set(day2, (map.get(day2) ?? 0) + 1);
      maxCount = Math.max(maxCount, map.get(day2));
    }
    const now = /* @__PURE__ */ new Date();
    const points = [];
    for (let i2 = 0; i2 <= 30; i2++) {
      const date = new Date(now);
      date.setDate(now.getDate() - (30 - i2));
      const dateString = `${date.getDate()} ${date.toLocaleString("default", { month: "short" })}`;
      const count2 = map.get(dateString) ?? 0;
      const x = i2 / 30 * innerWidth;
      const y = innerHeight - count2 / maxCount * innerHeight;
      points.push({ x, y, date: dateString, count: count2 });
    }
    const chart = append(chartContainer, $(".feature-chart"));
    const svg2 = append(chart, $.SVG("svg"));
    svg2.setAttribute("width", `${width2}px`);
    svg2.setAttribute("height", `${height}px`);
    svg2.setAttribute("viewBox", `0 0 ${width2} ${height}`);
    const g = $.SVG("g");
    g.setAttribute("transform", `translate(${margin.left},${margin.top})`);
    svg2.appendChild(g);
    const xAxisLine = $.SVG("line");
    xAxisLine.setAttribute("x1", "0");
    xAxisLine.setAttribute("y1", `${innerHeight}`);
    xAxisLine.setAttribute("x2", `${innerWidth}`);
    xAxisLine.setAttribute("y2", `${innerHeight}`);
    xAxisLine.setAttribute("stroke", asCssVariable(chartAxis));
    xAxisLine.setAttribute("stroke-width", "1px");
    g.appendChild(xAxisLine);
    for (let i2 = 1; i2 <= 30; i2 += 7) {
      const date = new Date(now);
      date.setDate(now.getDate() - (30 - i2));
      const dateString = `${date.getDate()} ${date.toLocaleString("default", { month: "short" })}`;
      const x = i2 / 30 * innerWidth;
      const tick = $.SVG("line");
      tick.setAttribute("x1", `${x}`);
      tick.setAttribute("y1", `${innerHeight}`);
      tick.setAttribute("x2", `${x}`);
      tick.setAttribute("y2", `${innerHeight + 10}`);
      tick.setAttribute("stroke", asCssVariable(chartAxis));
      tick.setAttribute("stroke-width", "1px");
      g.appendChild(tick);
      const ruler = $.SVG("line");
      ruler.setAttribute("x1", `${x}`);
      ruler.setAttribute("y1", `0`);
      ruler.setAttribute("x2", `${x}`);
      ruler.setAttribute("y2", `${innerHeight}`);
      ruler.setAttribute("stroke", asCssVariable(chartGuide));
      ruler.setAttribute("stroke-width", "1px");
      g.appendChild(ruler);
      const xAxisDate = $.SVG("text");
      xAxisDate.setAttribute("x", `${x}`);
      xAxisDate.setAttribute("y", `${height}`);
      xAxisDate.setAttribute("text-anchor", "middle");
      xAxisDate.setAttribute("fill", asCssVariable(foreground));
      xAxisDate.setAttribute("font-size", "10px");
      xAxisDate.textContent = dateString;
      g.appendChild(xAxisDate);
    }
    const line = $.SVG("polyline");
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", asCssVariable(chartLine));
    line.setAttribute("stroke-width", `2px`);
    line.setAttribute("points", points.map((p) => `${p.x},${p.y}`).join(" "));
    g.appendChild(line);
    const highlightCircle = $.SVG("circle");
    highlightCircle.setAttribute("r", `4px`);
    highlightCircle.style.display = "none";
    g.appendChild(highlightCircle);
    const hoverDisposable = disposables.add(new MutableDisposable());
    const mouseMoveListener = (event) => {
      const rect = svg2.getBoundingClientRect();
      const mouseX = event.clientX - rect.left - margin.left;
      let closestPoint;
      let minDistance = Infinity;
      points.forEach((point) => {
        const distance = Math.abs(point.x - mouseX);
        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = point;
        }
      });
      if (closestPoint) {
        highlightCircle.setAttribute("cx", `${closestPoint.x}`);
        highlightCircle.setAttribute("cy", `${closestPoint.y}`);
        highlightCircle.style.display = "block";
        tooltip.style.left = `${closestPoint.x + 24}px`;
        tooltip.style.top = `${closestPoint.y + 14}px`;
        hoverDisposable.value = this.hoverService.showInstantHover({
          content: new MarkdownString(`${closestPoint.date}: ${closestPoint.count} requests`),
          target: tooltip,
          appearance: {
            showPointer: true,
            skipFadeInAnimation: true
          }
        });
      } else {
        hoverDisposable.value = void 0;
      }
    };
    disposables.add(addDisposableListener(svg2, EventType.MOUSE_MOVE, mouseMoveListener));
    const mouseLeaveListener = () => {
      highlightCircle.style.display = "none";
      hoverDisposable.value = void 0;
    };
    disposables.add(addDisposableListener(svg2, EventType.MOUSE_LEAVE, mouseLeaveListener));
  }
};

RuntimeStatusMarkdownRenderer = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, IHoverService),
  __decorateParam(2, IExtensionFeaturesManagementService),
  __decorateParam(3, IMarkdownRendererService)
], RuntimeStatusMarkdownRenderer);

var runtimeStatusFeature = {
  id: RuntimeStatusMarkdownRenderer.ID,
  label: localize(15054, null),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(RuntimeStatusMarkdownRenderer)
};

var ExtensionFeaturesTab = class extends Themable {
  constructor(manifest, feature, themeService, instantiationService) {
    super(themeService);
    this.manifest = manifest;
    this.feature = feature;
    this.instantiationService = instantiationService;
    this.featureView = this._register(new MutableDisposable());
    this.layoutParticipants = [];
    this.extensionId = new ExtensionIdentifier(getExtensionId(manifest.publisher, manifest.name));
    this.domNode = $("div.subcontent.feature-contributions");
    this.create();
  }
  layout(height, width2) {
    this.layoutParticipants.forEach((participant) => participant.layout(height, width2));
  }
  create() {
    const features = this.getFeatures();
    if (features.length === 0) {
      append($(".no-features"), this.domNode).textContent = localize(15051, null);
      return;
    }
    const splitView = this._register(new SplitView(this.domNode, {
      orientation: 1 /* HORIZONTAL */,
      proportionalLayout: true
    }));
    this.layoutParticipants.push({
      layout: (height, width2) => {
        splitView.el.style.height = `${height - 14}px`;
        splitView.layout(width2);
      }
    });
    const featuresListContainer = $(".features-list-container");
    const list2 = this._register(this.createFeaturesList(featuresListContainer));
    list2.splice(0, list2.length, features);
    const featureViewContainer = $(".feature-view-container");
    this._register(list2.onDidChangeSelection((e) => {
      const feature = e.elements[0];
      if (feature) {
        this.showFeatureView(feature, featureViewContainer);
      }
    }));
    const index2 = this.feature ? features.findIndex((f) => f.id === this.feature) : 0;
    list2.setSelection([index2 === -1 ? 0 : index2]);
    splitView.addView({
      onDidChange: Event2.None,
      element: featuresListContainer,
      minimumSize: 100,
      maximumSize: Number.POSITIVE_INFINITY,
      layout: (width2, _, height) => {
        featuresListContainer.style.width = `${width2}px`;
        list2.layout(height, width2);
      }
    }, 200, void 0, true);
    splitView.addView({
      onDidChange: Event2.None,
      element: featureViewContainer,
      minimumSize: 500,
      maximumSize: Number.POSITIVE_INFINITY,
      layout: (width2, _, height) => {
        featureViewContainer.style.width = `${width2}px`;
        this.featureViewDimension = { height, width: width2 };
        this.layoutFeatureView();
      }
    }, Sizing.Distribute, void 0, true);
    splitView.style({
      separatorBorder: this.theme.getColor(PANEL_SECTION_BORDER)
    });
  }
  createFeaturesList(container3) {
    const renderer = this.instantiationService.createInstance(ExtensionFeatureItemRenderer, this.extensionId);
    const delegate = new ExtensionFeatureItemDelegate();
    const list2 = this.instantiationService.createInstance(WorkbenchList, "ExtensionFeaturesList", append(container3, $(".features-list-wrapper")), delegate, [renderer], {
      multipleSelectionSupport: false,
      setRowLineHeight: false,
      horizontalScrolling: false,
      accessibilityProvider: {
        getAriaLabel(extensionFeature2) {
          return extensionFeature2?.label ?? "";
        },
        getWidgetAriaLabel() {
          return localize(15047, null);
        }
      },
      openOnSingleClick: true
    });
    return list2;
  }
  layoutFeatureView() {
    this.featureView.value?.layout(this.featureViewDimension?.height, this.featureViewDimension?.width);
  }
  showFeatureView(feature, container3) {
    if (this.featureView.value?.feature.id === feature.id) {
      return;
    }
    clearNode(container3);
    this.featureView.value = this.instantiationService.createInstance(ExtensionFeatureView, this.extensionId, this.manifest, feature);
    container3.appendChild(this.featureView.value.domNode);
    this.layoutFeatureView();
  }
  getFeatures() {
    const features = Registry.as(Extensions11.ExtensionFeaturesRegistry).getExtensionFeatures().filter((feature) => {
      const renderer2 = this.getRenderer(feature);
      const shouldRender = renderer2?.shouldRender(this.manifest);
      renderer2?.dispose();
      return shouldRender;
    }).sort((a, b) => a.label.localeCompare(b.label));
    const renderer = this.getRenderer(runtimeStatusFeature);
    if (renderer?.shouldRender(this.manifest)) {
      features.splice(0, 0, runtimeStatusFeature);
    }
    renderer?.dispose();
    return features;
  }
  getRenderer(feature) {
    return feature.renderer ? this.instantiationService.createInstance(feature.renderer) : void 0;
  }
};

ExtensionFeaturesTab = __decorateClass([
  __decorateParam(2, IThemeService),
  __decorateParam(3, IInstantiationService)
], ExtensionFeaturesTab);

var ExtensionFeatureItemDelegate = class {
  getHeight() {
    return 22;
  }
  getTemplateId() {
    return "extensionFeatureDescriptor";
  }
};

var ExtensionFeatureItemRenderer = class {
  constructor(extensionId, extensionFeaturesManagementService) {
    this.extensionId = extensionId;
    this.extensionFeaturesManagementService = extensionFeaturesManagementService;
    this.templateId = "extensionFeatureDescriptor";
  }
  renderTemplate(container3) {
    container3.classList.add("extension-feature-list-item");
    const label3 = append(container3, $(".extension-feature-label"));
    const disabledElement = append(container3, $(".extension-feature-disabled-label"));
    disabledElement.textContent = localize(15053, null);
    const statusElement = append(container3, $(".extension-feature-status"));
    return { label: label3, disabledElement, statusElement, disposables: new DisposableStore() };
  }
  renderElement(element, index2, templateData) {
    templateData.disposables.clear();
    templateData.label.textContent = element.label;
    templateData.disabledElement.style.display = element.id === runtimeStatusFeature.id || this.extensionFeaturesManagementService.isEnabled(this.extensionId, element.id) ? "none" : "inherit";
    templateData.disposables.add(this.extensionFeaturesManagementService.onDidChangeEnablement(({ extension, featureId, enabled }) => {
      if (ExtensionIdentifier.equals(extension, this.extensionId) && featureId === element.id) {
        templateData.disabledElement.style.display = enabled ? "none" : "inherit";
      }
    }));
    const statusElementClassName = templateData.statusElement.className;
    const updateStatus = () => {
      const accessData = this.extensionFeaturesManagementService.getAccessData(this.extensionId, element.id);
      if (accessData?.current?.status) {
        templateData.statusElement.style.display = "inherit";
        templateData.statusElement.className = `${statusElementClassName} ${SeverityIcon.className(accessData.current.status.severity)}`;
      } else {
        templateData.statusElement.style.display = "none";
      }
    };
    updateStatus();
    templateData.disposables.add(this.extensionFeaturesManagementService.onDidChangeAccessData(({ extension, featureId }) => {
      if (ExtensionIdentifier.equals(extension, this.extensionId) && featureId === element.id) {
        updateStatus();
      }
    }));
  }
  disposeElement(element, index2, templateData) {
    templateData.disposables.dispose();
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};

ExtensionFeatureItemRenderer = __decorateClass([
  __decorateParam(1, IExtensionFeaturesManagementService)
], ExtensionFeatureItemRenderer);

var ExtensionFeatureView = class extends Disposable {
  constructor(extensionId, manifest, feature, instantiationService, extensionFeaturesManagementService, dialogService, markdownRendererService) {
    super();
    this.extensionId = extensionId;
    this.manifest = manifest;
    this.feature = feature;
    this.instantiationService = instantiationService;
    this.extensionFeaturesManagementService = extensionFeaturesManagementService;
    this.dialogService = dialogService;
    this.markdownRendererService = markdownRendererService;
    this.layoutParticipants = [];
    this.domNode = $(".extension-feature-content");
    this.create(this.domNode);
  }
  create(content2) {
    const header2 = append(content2, $(".feature-header"));
    const title = append(header2, $(".feature-title"));
    title.textContent = this.feature.label;
    if (this.feature.access.canToggle) {
      const actionsContainer = append(header2, $(".feature-actions"));
      const button = new Button(actionsContainer, defaultButtonStyles);
      this.updateButtonLabel(button);
      this._register(this.extensionFeaturesManagementService.onDidChangeEnablement(({ extension, featureId }) => {
        if (ExtensionIdentifier.equals(extension, this.extensionId) && featureId === this.feature.id) {
          this.updateButtonLabel(button);
        }
      }));
      this._register(button.onDidClick(async () => {
        const enabled = this.extensionFeaturesManagementService.isEnabled(this.extensionId, this.feature.id);
        const confirmationResult = await this.dialogService.confirm({
          title: localize(15040, null, this.feature.label),
          message: enabled ? localize(15044, null, this.manifest.displayName ?? this.extensionId.value, this.feature.label) : localize(15046, null, this.manifest.displayName ?? this.extensionId.value, this.feature.label),
          custom: true,
          primaryButton: enabled ? localize(15052, null) : localize(15048, null),
          cancelButton: localize(15042, null)
        });
        if (confirmationResult.confirmed) {
          this.extensionFeaturesManagementService.setEnablement(this.extensionId, this.feature.id, !enabled);
        }
      }));
    }
    const body = append(content2, $(".feature-body"));
    const bodyContent = $(".feature-body-content");
    const scrollableContent = this._register(new DomScrollableElement(bodyContent, {}));
    append(body, scrollableContent.getDomNode());
    this.layoutParticipants.push({ layout: () => scrollableContent.scanDomNode() });
    scrollableContent.scanDomNode();
    if (this.feature.description) {
      const description = append(bodyContent, $(".feature-description"));
      description.textContent = this.feature.description;
    }
    const accessData = this.extensionFeaturesManagementService.getAccessData(this.extensionId, this.feature.id);
    if (accessData?.current?.status) {
      append(bodyContent, $(
        ".feature-status",
        void 0,
        $(`span${ThemeIcon.asCSSSelector(accessData.current.status.severity === severity_default.Error ? errorIcon : accessData.current.status.severity === severity_default.Warning ? warningIcon2 : infoIcon)}`, void 0),
        $("span", void 0, accessData.current.status.message)
      ));
    }
    const featureContentElement = append(bodyContent, $(".feature-content"));
    if (this.feature.renderer) {
      const renderer = this.instantiationService.createInstance(this.feature.renderer);
      if (renderer.type === "table") {
        this.renderTableData(featureContentElement, renderer);
      } else if (renderer.type === "markdown") {
        this.renderMarkdownData(featureContentElement, renderer);
      } else if (renderer.type === "markdown+table") {
        this.renderMarkdownAndTableData(featureContentElement, renderer);
      } else if (renderer.type === "element") {
        this.renderElementData(featureContentElement, renderer);
      }
    }
  }
  updateButtonLabel(button) {
    button.label = this.extensionFeaturesManagementService.isEnabled(this.extensionId, this.feature.id) ? localize(15052, null) : localize(15045, null);
  }
  renderTableData(container3, renderer) {
    const tableData = this._register(renderer.render(this.manifest));
    const tableDisposable = this._register(new MutableDisposable());
    if (tableData.onDidChange) {
      this._register(tableData.onDidChange((data) => {
        clearNode(container3);
        tableDisposable.value = this.renderTable(data, container3);
      }));
    }
    tableDisposable.value = this.renderTable(tableData.data, container3);
  }
  renderTable(tableData, container3) {
    const disposables = new DisposableStore();
    append(
      container3,
      $(
        "table",
        void 0,
        $(
          "tr",
          void 0,
          ...tableData.headers.map((header2) => $("th", void 0, header2))
        ),
        ...tableData.rows.map((row) => {
          return $(
            "tr",
            void 0,
            ...row.map((rowData) => {
              if (typeof rowData === "string") {
                return $("td", void 0, $("p", void 0, rowData));
              }
              const data = Array.isArray(rowData) ? rowData : [rowData];
              return $("td", void 0, ...data.map((item) => {
                const result = [];
                if (isMarkdownString(rowData)) {
                  const element = $("", void 0);
                  this.renderMarkdown(rowData, element);
                  result.push(element);
                } else if (item instanceof ResolvedKeybinding) {
                  const element = $("");
                  const kbl = disposables.add(new KeybindingLabel(element, OS, defaultKeybindingLabelStyles));
                  kbl.set(item);
                  result.push(element);
                } else if (item instanceof Color) {
                  result.push($("span", { class: "colorBox", style: "background-color: " + Color.Format.CSS.format(item) }, ""));
                  result.push($("code", void 0, Color.Format.CSS.formatHex(item)));
                }
                return result;
              }).flat());
            })
          );
        })
      )
    );
    return disposables;
  }
  renderMarkdownAndTableData(container3, renderer) {
    const markdownAndTableData = this._register(renderer.render(this.manifest));
    if (markdownAndTableData.onDidChange) {
      this._register(markdownAndTableData.onDidChange((data) => {
        clearNode(container3);
        this.renderMarkdownAndTable(data, container3);
      }));
    }
    this.renderMarkdownAndTable(markdownAndTableData.data, container3);
  }
  renderMarkdownData(container3, renderer) {
    container3.classList.add("markdown");
    const markdownData = this._register(renderer.render(this.manifest));
    if (markdownData.onDidChange) {
      this._register(markdownData.onDidChange((data) => {
        clearNode(container3);
        this.renderMarkdown(data, container3);
      }));
    }
    this.renderMarkdown(markdownData.data, container3);
  }
  renderMarkdown(markdown, container3) {
    const { element } = this._register(this.markdownRendererService.render({
      value: markdown.value,
      isTrusted: markdown.isTrusted,
      supportThemeIcons: true
    }));
    append(container3, element);
  }
  renderMarkdownAndTable(data, container3) {
    for (const markdownOrTable of data) {
      if (isMarkdownString(markdownOrTable)) {
        const element = $("", void 0);
        this.renderMarkdown(markdownOrTable, element);
        append(container3, element);
      } else {
        const tableElement = append(container3, $("table"));
        this.renderTable(markdownOrTable, tableElement);
      }
    }
  }
  renderElementData(container3, renderer) {
    const elementData = this._register(renderer.render(this.manifest));
    if (elementData.onDidChange) {
      this._register(elementData.onDidChange((data) => {
        clearNode(container3);
        container3.appendChild(data);
      }));
    }
    container3.appendChild(elementData.data);
  }
  layout(height, width2) {
    this.layoutParticipants.forEach((p) => p.layout(height, width2));
  }
};

ExtensionFeatureView = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IExtensionFeaturesManagementService),
  __decorateParam(5, IDialogService),
  __decorateParam(6, IMarkdownRendererService)
], ExtensionFeatureView);
export { RuntimeStatusMarkdownRenderer, runtimeStatusFeature, ExtensionFeaturesTab, ExtensionFeatureItemDelegate, ExtensionFeatureItemRenderer, ExtensionFeatureView };
