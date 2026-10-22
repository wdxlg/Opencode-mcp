// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/speechToText/dictationDownloadRing.ts
import { Disposable } from "./module-0012.mjs";
import { $ } from "./module-0075.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/browser/speechToText/dictationDownloadRing.ts
var RING_RADIUS = 7;

var RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

var DictationDownloadRing = class extends Disposable {
  constructor(container3, _speechToTextService) {
    super();
    this._speechToTextService = _speechToTextService;
    const svg2 = $.SVG("svg");
    svg2.classList.add("dictation-download-ring");
    svg2.setAttribute("viewBox", "0 0 16 16");
    svg2.setAttribute("aria-hidden", "true");
    const track = $.SVG("circle");
    track.classList.add("dictation-download-ring-track");
    track.setAttribute("cx", "8");
    track.setAttribute("cy", "8");
    track.setAttribute("r", String(RING_RADIUS));
    const progress = $.SVG("circle");
    progress.classList.add("dictation-download-ring-progress");
    progress.setAttribute("cx", "8");
    progress.setAttribute("cy", "8");
    progress.setAttribute("r", String(RING_RADIUS));
    progress.setAttribute("stroke-dasharray", String(RING_CIRCUMFERENCE));
    svg2.appendChild(track);
    svg2.appendChild(progress);
    container3.appendChild(svg2);
    this._ringElement = svg2;
    this._progressCircle = progress;
    this._register(this._speechToTextService.onDidChangeModelDownloadProgress(() => this.update()));
    this.update();
  }
  update() {
    const progress = this._speechToTextService.modelDownloadProgress;
    if (progress === void 0) {
      this._ringElement.classList.add("indeterminate");
      this._progressCircle.style.strokeDashoffset = String(RING_CIRCUMFERENCE * 0.75);
    } else {
      this._ringElement.classList.remove("indeterminate");
      this._progressCircle.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - progress));
    }
  }
};

function getDictationDownloadHoverMarkdown(service) {
  const markdown = new MarkdownString("", { supportThemeIcons: true });
  if (service.currentBackend === "mai") {
    markdown.appendMarkdown(localize(11616, null));
    markdown.appendMarkdown("\n\n");
    markdown.appendMarkdown(localize(11615, null));
    return markdown;
  }
  markdown.appendMarkdown(localize(11618, null));
  markdown.appendMarkdown("\n\n");
  markdown.appendMarkdown(localize(11617, null));
  return markdown;
}

function getDictationDownloadHoverContent(service) {
  const markdown = getDictationDownloadHoverMarkdown(service);
  return { markdown, markdownNotSupportedFallback: markdown.value };
}

function getDictationPreparingLabel(service) {
  if (service.currentBackend === "mai") {
    return localize(11619, null);
  }
  const progress = service.modelDownloadProgress;
  if (typeof progress === "number") {
    const percent2 = Math.max(0, Math.min(100, Math.round(progress * 100)));
    return localize(11620, null, percent2);
  }
  return localize(11621, null);
}
export { getDictationDownloadHoverMarkdown, getDictationDownloadHoverContent, getDictationPreparingLabel, RING_RADIUS, RING_CIRCUMFERENCE, DictationDownloadRing };
