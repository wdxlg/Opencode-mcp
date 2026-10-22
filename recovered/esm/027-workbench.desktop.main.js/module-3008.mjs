// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/imageCarousel/browser/imageCarouselEditor.ts
import { EditorPane } from "./module-1089.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { EventType, addDisposableListener, clearNode, h } from "./module-0075.mjs";
import { isVideoMimeType } from "./module-3007.mjs";
import { localize } from "./module-0001.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { generateUuid } from "./module-0190.mjs";
import { ImageCarouselEditorInput } from "./module-3006.mjs";
import { clamp } from "./module-0040.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IFileService } from "./module-0269.mjs";
import { IWebviewService } from "./module-1042.mjs";


// src/vs/workbench/contrib/imageCarousel/browser/imageCarouselEditor.ts
var SCALE_PINCH_FACTOR = 0.075;

var MAX_SCALE2 = 20;

var MIN_SCALE2 = 0.1;

var PIXELATION_THRESHOLD = 3;

var ZOOM_LEVELS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.5, 2, 3, 5, 7, 10, 15, 20];

var ImageCarouselEditor = class extends EditorPane {
  constructor(group2, telemetryService, themeService, storageService, _fileService, _webviewService) {
    super(ImageCarouselEditor.ID, group2, telemetryService, themeService, storageService);
    this._fileService = _fileService;
    this._webviewService = _webviewService;
    this._currentIndex = 0;
    this._zoomScale = "fit";
    this._sections = [];
    this._flatImages = [];
    this._contentDisposables = this._register(new DisposableStore());
    this._imageDisposables = this._register(new DisposableStore());
    this._blobUrlCache = /* @__PURE__ */ new Map();
    this._thumbnailElements = [];
  }
  static {
    this.ID = "workbench.editor.imageCarousel";
  }
  createEditor(parent) {
    this._container = h("div.image-carousel-editor").root;
    parent.appendChild(this._container);
  }
  async setInput(input, options3, context2, token) {
    await super.setInput(input, options3, context2, token);
    this._sections = input.collection.sections;
    this._flatImages = [];
    for (let s = 0; s < this._sections.length; s++) {
      for (let i2 = 0; i2 < this._sections[s].images.length; i2++) {
        this._flatImages.push({ sectionIndex: s, imageIndexInSection: i2, image: this._sections[s].images[i2] });
      }
    }
    this._currentIndex = Math.min(input.startIndex, Math.max(0, this._flatImages.length - 1));
    this.buildSlideshow();
  }
  clearInput() {
    this._videoWebview?.dispose();
    this._videoWebview = void 0;
    this._contentDisposables.clear();
    this._imageDisposables.clear();
    this._revokeCachedBlobUrls();
    this._zoomScale = "fit";
    if (this._container) {
      clearNode(this._container);
    }
    this._elements = void 0;
    this._thumbnailElements = [];
    super.clearInput();
  }
  _isCurrentVideo() {
    const entry = this._flatImages[this._currentIndex];
    return !!entry && isVideoMimeType(entry.image.mimeType);
  }
  /**
   * Build the full DOM skeleton. Called once per setInput.
   */
  buildSlideshow() {
    if (!this._container) {
      return;
    }
    this._contentDisposables.clear();
    this._imageDisposables.clear();
    this._revokeCachedBlobUrls();
    clearNode(this._container);
    if (this._flatImages.length === 0) {
      const empty = h("div.empty-message");
      empty.root.textContent = localize(16126, null);
      this._container.appendChild(empty.root);
      return;
    }
    const elements = h("div.slideshow-container", [
      h("div.image-area@imageArea", [
        h("div.main-image-container@mainImageContainer", [
          h("img.main-image@mainImage"),
          h("div.video-container@videoContainer")
        ]),
        h("button.nav-arrow.prev-arrow@prevBtn", { ariaLabel: localize(16127, null) }, [
          h("span.codicon.codicon-chevron-left", { ariaHidden: "true" })
        ]),
        h("button.nav-arrow.next-arrow@nextBtn", { ariaLabel: localize(16125, null) }, [
          h("span.codicon.codicon-chevron-right", { ariaHidden: "true" })
        ])
      ]),
      h("div.bottom-bar@bottomBar", [
        h("div.image-info-bar", [
          h("span.caption-text@captionText"),
          h("span.caption-separator@captionSeparator"),
          h("span.image-counter@counter")
        ]),
        h("div.sections-container@sectionsContainer"),
        h("span.sr-only@ariaStatus")
      ])
    ]);
    elements.root.setAttribute("role", "group");
    elements.root.setAttribute("aria-label", localize(16121, null));
    elements.captionSeparator.setAttribute("aria-hidden", "true");
    elements.ariaStatus.setAttribute("aria-live", "polite");
    elements.ariaStatus.setAttribute("aria-atomic", "true");
    elements.sectionsContainer.setAttribute("role", "group");
    elements.sectionsContainer.setAttribute("aria-label", localize(16132, null));
    this._elements = {
      root: elements.root,
      imageArea: elements.imageArea,
      mainImageContainer: elements.mainImageContainer,
      mainImage: elements.mainImage,
      videoContainer: elements.videoContainer,
      captionText: elements.captionText,
      captionSeparator: elements.captionSeparator,
      counter: elements.counter,
      ariaStatus: elements.ariaStatus,
      prevBtn: elements.prevBtn,
      nextBtn: elements.nextBtn,
      sectionsContainer: elements.sectionsContainer
    };
    this._elements.mainImage.classList.add("scale-to-fit");
    this._elements.mainImage.alt = "";
    this._elements.videoContainer.style.display = "none";
    this._contentDisposables.add(addDisposableListener(this._elements.prevBtn, "click", () => {
      if (this._currentIndex > 0) {
        this._currentIndex--;
        this.updateCurrentImage();
      }
    }));
    this._contentDisposables.add(addDisposableListener(this._elements.nextBtn, "click", () => {
      if (this._currentIndex < this._flatImages.length - 1) {
        this._currentIndex++;
        this.updateCurrentImage();
      }
    }));
    this._contentDisposables.add(addDisposableListener(elements.root, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.keyCode === 15 /* LeftArrow */) {
        this.previous();
        event.stopPropagation();
        event.preventDefault();
      } else if (event.keyCode === 17 /* RightArrow */) {
        this.next();
        event.stopPropagation();
        event.preventDefault();
      }
    }));
    elements.root.tabIndex = 0;
    this._contentDisposables.add(addDisposableListener(this._elements.imageArea, EventType.MOUSE_WHEEL, (e) => {
      if (this._isCurrentVideo()) {
        return;
      }
      const isZoomModifier = isMacintosh ? e.altKey : e.ctrlKey;
      if (!isZoomModifier && !e.ctrlKey) {
        return;
      }
      e.preventDefault();
      if (e.deltaY === 0) {
        return;
      }
      if (this._zoomScale === "fit") {
        this._initZoomFromFit();
      }
      const delta2 = e.deltaY > 0 ? 1 : -1;
      this._applyZoom(this._zoomScale * (1 - delta2 * SCALE_PINCH_FACTOR));
    }, { passive: false }));
    let clickCtrlPressed = false;
    let clickAltPressed = false;
    this._contentDisposables.add(addDisposableListener(this._elements.mainImageContainer, EventType.MOUSE_DOWN, (e) => {
      if (e.button !== 0) {
        return;
      }
      clickCtrlPressed = e.ctrlKey;
      clickAltPressed = e.altKey;
    }));
    this._contentDisposables.add(addDisposableListener(this._elements.mainImageContainer, EventType.CLICK, (e) => {
      if (e.button !== 0 || this._isCurrentVideo()) {
        return;
      }
      const isZoomOut = isMacintosh ? clickAltPressed : clickCtrlPressed;
      if (isZoomOut) {
        this._zoomOut();
      } else {
        this._zoomIn();
      }
    }));
    const updateZoomCursor = (e) => {
      const isZoomOut = isMacintosh ? e.altKey : e.ctrlKey;
      this._elements.mainImageContainer.classList.toggle("zoom-out", isZoomOut);
    };
    this._contentDisposables.add(addDisposableListener(elements.root, EventType.KEY_DOWN, updateZoomCursor));
    this._contentDisposables.add(addDisposableListener(elements.root, EventType.KEY_UP, updateZoomCursor));
    this._thumbnailElements = [];
    let flatIndex = 0;
    for (let s = 0; s < this._sections.length; s++) {
      const section = this._sections[s];
      if (s > 0 && this._sections.length > 1) {
        const separator2 = h("div.thumbnail-separator").root;
        separator2.setAttribute("aria-hidden", "true");
        this._elements.sectionsContainer.appendChild(separator2);
      }
      for (let i2 = 0; i2 < section.images.length; i2++) {
        const image = section.images[i2];
        const currentFlatIndex = flatIndex;
        const isItemVideo = isVideoMimeType(image.mimeType);
        const btn = document.createElement("button");
        btn.className = isItemVideo ? "thumbnail video-thumbnail" : "thumbnail";
        btn.ariaLabel = isItemVideo ? localize(16131, null, currentFlatIndex + 1, this._flatImages.length) : localize(16130, null, currentFlatIndex + 1, this._flatImages.length);
        if (isItemVideo) {
          const icon2 = h("span.codicon.codicon-play.thumbnail-play-icon");
          icon2.root.setAttribute("aria-hidden", "true");
          btn.appendChild(icon2.root);
        } else {
          const img = document.createElement("img");
          img.className = "thumbnail-image";
          img.alt = image.name;
          const thumbnailDisposables = this._contentDisposables.add(new DisposableStore());
          const markBroken = () => {
            if (thumbnailDisposables.isDisposed) {
              return;
            }
            if (!btn.classList.contains("broken")) {
              btn.classList.add("broken");
              img.removeAttribute("src");
              img.alt = "";
              img.remove();
              const fallback2 = h("span.codicon.codicon-warning.thumbnail-broken-icon");
              fallback2.root.setAttribute("aria-hidden", "true");
              btn.appendChild(fallback2.root);
            }
          };
          this._loadBlobUrl(image).then((url) => {
            if (thumbnailDisposables.isDisposed) {
              return;
            }
            if (url) {
              const preloader = new Image();
              thumbnailDisposables.add(addDisposableListener(preloader, "load", () => {
                if (btn.classList.contains("broken")) {
                  return;
                }
                img.src = url;
                if (!img.parentElement) {
                  btn.appendChild(img);
                }
              }));
              thumbnailDisposables.add(addDisposableListener(preloader, "error", () => {
                markBroken();
              }));
              preloader.src = url;
            } else {
              markBroken();
            }
          }, () => {
            markBroken();
          });
          thumbnailDisposables.add(addDisposableListener(img, "error", () => {
            markBroken();
          }));
        }
        this._contentDisposables.add(addDisposableListener(btn, "click", () => {
          this._currentIndex = currentFlatIndex;
          this.updateCurrentImage();
        }));
        this._elements.sectionsContainer.appendChild(btn);
        this._thumbnailElements.push(btn);
        flatIndex++;
      }
    }
    this._container.appendChild(elements.root);
    this.updateCurrentImage();
  }
  /**
   * Update only the changing parts: main image src, caption, button states, thumbnail selection.
   * No DOM teardown/rebuild — eliminates the blank flash.
   */
  async updateCurrentImage() {
    if (!this._elements) {
      return;
    }
    const navigationIndex = this._currentIndex;
    const entry = this._flatImages[navigationIndex];
    const currentImage = entry.image;
    const isVideo = isVideoMimeType(currentImage.mimeType);
    if (isVideo) {
      this._elements.mainImage.style.display = "none";
      this._elements.videoContainer.style.display = "";
      this._elements.mainImageContainer.classList.remove("zoomed");
      this._elements.mainImageContainer.style.cursor = "default";
      const rawData = await this._loadRawData(currentImage);
      if (this._currentIndex !== navigationIndex) {
        return;
      }
      const nonce = generateUuid();
      const videoHtml = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; media-src blob: data:; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}';">
<style nonce="${nonce}">html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:transparent}
video{width:100%;height:100%;object-fit:contain;outline:none}</style>
</head><body>
<video id="v" controls></video>
<script nonce="${nonce}">
window.addEventListener("message",function(e){var m=e.data;if(m.type==="loadVideo"){var b=new Blob([m.data],{type:m.mimeType});document.getElementById("v").src=URL.createObjectURL(b);}});
</script>
</body></html>`;
      let webview;
      if (!this._videoWebview) {
        webview = this._contentDisposables.add(this._webviewService.createWebviewElement({
          title: currentImage.name,
          options: { disableServiceWorker: true },
          contentOptions: { allowScripts: true },
          extension: void 0
        }));
        webview.mountTo(this._elements.videoContainer, this.window);
        this._videoWebview = webview;
      } else {
        webview = this._videoWebview;
      }
      webview.setHtml(videoHtml);
      const buffer = rawData.buffer;
      webview.postMessage({ type: "loadVideo", data: buffer, mimeType: currentImage.mimeType }, [buffer]);
    } else {
      this._elements.videoContainer.style.display = "none";
      this._elements.mainImage.style.display = "";
      this._elements.mainImageContainer.style.cursor = "";
      const url = await this._loadBlobUrl(currentImage);
      if (this._currentIndex !== navigationIndex) {
        return;
      }
      const tmp = new Image();
      tmp.src = url;
      tmp.decode().then(() => {
        if (this._currentIndex === navigationIndex && this._elements) {
          this._elements.mainImage.src = url;
          this._elements.mainImage.alt = currentImage.name;
        }
      }, () => {
        if (this._currentIndex === navigationIndex && this._elements) {
          this._elements.mainImage.src = url;
          this._elements.mainImage.alt = currentImage.name;
        }
      });
    }
    this._applyZoom("fit");
    if (currentImage.caption) {
      this._elements.captionText.textContent = currentImage.caption;
      this._elements.captionText.style.display = "";
      this._elements.captionSeparator.style.display = "";
    } else {
      this._elements.captionText.textContent = "";
      this._elements.captionText.style.display = "none";
      this._elements.captionSeparator.style.display = "none";
    }
    this._elements.counter.textContent = localize(16122, null, navigationIndex + 1, this._flatImages.length);
    const itemKind2 = isVideo ? localize(16124, null) : localize(16123, null);
    this._elements.ariaStatus.textContent = currentImage.caption ? localize(16128, null, itemKind2, navigationIndex + 1, this._flatImages.length, currentImage.caption) : localize(16129, null, itemKind2, navigationIndex + 1, this._flatImages.length, currentImage.name);
    this._elements.prevBtn.disabled = navigationIndex === 0;
    this._elements.nextBtn.disabled = navigationIndex === this._flatImages.length - 1;
    for (let i2 = 0; i2 < this._thumbnailElements.length; i2++) {
      const isActive2 = i2 === navigationIndex;
      const thumbnail = this._thumbnailElements[i2];
      thumbnail.classList.toggle("active", isActive2);
      if (isActive2) {
        thumbnail.setAttribute("aria-current", "page");
      } else {
        thumbnail.removeAttribute("aria-current");
      }
    }
    const activeThumbnail = this._thumbnailElements[navigationIndex];
    if (activeThumbnail) {
      activeThumbnail.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
    if (this.input instanceof ImageCarouselEditorInput) {
      const currentSection = this._sections[entry.sectionIndex];
      this.input.setName(currentSection.title || this.input.collection.title);
    }
    this._preloadAdjacentImages();
  }
  async _loadBlobUrl(image) {
    const cached = this._blobUrlCache.get(image.id);
    if (cached) {
      return cached;
    }
    let buffer;
    if (image.data) {
      buffer = image.data instanceof Uint8Array ? image.data : image.data.buffer;
    } else if (image.uri) {
      const content2 = await this._fileService.readFile(image.uri);
      buffer = content2.value.buffer;
    } else {
      return "";
    }
    const blob = new Blob([buffer], { type: image.mimeType });
    const url = URL.createObjectURL(blob);
    this._blobUrlCache.set(image.id, url);
    return url;
  }
  _revokeCachedBlobUrls() {
    for (const url of this._blobUrlCache.values()) {
      URL.revokeObjectURL(url);
    }
    this._blobUrlCache.clear();
  }
  async _loadRawData(image) {
    if (image.data) {
      return image.data instanceof Uint8Array ? image.data : image.data.buffer;
    } else if (image.uri) {
      const content2 = await this._fileService.readFile(image.uri);
      return content2.value.buffer;
    }
    return new Uint8Array(0);
  }
  _preloadAdjacentImages() {
    for (const idx of [this._currentIndex - 1, this._currentIndex + 1]) {
      if (idx >= 0 && idx < this._flatImages.length) {
        const adjacentImage = this._flatImages[idx].image;
        if (isVideoMimeType(adjacentImage.mimeType)) {
          this._loadRawData(adjacentImage).catch(() => {
          });
        } else {
          this._loadBlobUrl(adjacentImage).then((url) => {
            const img = new Image();
            img.src = url;
            img.decode().catch(() => {
            });
          });
        }
      }
    }
  }
  previous() {
    if (this._currentIndex > 0) {
      this._currentIndex--;
      this.updateCurrentImage();
    }
  }
  next() {
    if (this._currentIndex < this._flatImages.length - 1) {
      this._currentIndex++;
      this.updateCurrentImage();
    }
  }
  /**
   * Compute the current display scale when transitioning from 'fit' to numeric zoom.
   */
  _initZoomFromFit() {
    if (!this._elements) {
      return;
    }
    const img = this._elements.mainImage;
    if (img.naturalWidth > 0) {
      this._zoomScale = img.clientWidth / img.naturalWidth;
    } else {
      this._zoomScale = 1;
    }
  }
  /**
   * Zoom in to the next predefined zoom level.
   */
  _zoomIn() {
    if (this._zoomScale === "fit") {
      this._initZoomFromFit();
    }
    const scale = this._zoomScale;
    let i2 = 0;
    for (; i2 < ZOOM_LEVELS.length; ++i2) {
      if (ZOOM_LEVELS[i2] > scale) {
        break;
      }
    }
    this._applyZoom(ZOOM_LEVELS[i2] ?? MAX_SCALE2);
  }
  /**
   * Zoom out to the previous predefined zoom level.
   */
  _zoomOut() {
    if (this._zoomScale === "fit") {
      this._initZoomFromFit();
    }
    const scale = this._zoomScale;
    let i2 = ZOOM_LEVELS.length - 1;
    for (; i2 >= 0; --i2) {
      if (ZOOM_LEVELS[i2] < scale) {
        break;
      }
    }
    this._applyZoom(ZOOM_LEVELS[i2] ?? MIN_SCALE2);
  }
  /**
   * Apply fit-to-container or numeric zoom with scroll-center preservation.
   */
  _applyZoom(newScale) {
    if (!this._elements) {
      return;
    }
    const container3 = this._elements.mainImageContainer;
    const img = this._elements.mainImage;
    if (newScale === "fit") {
      this._zoomScale = "fit";
      img.classList.add("scale-to-fit");
      img.classList.remove("pixelated");
      img.style.zoom = "";
      const wasZoomed = container3.classList.contains("zoomed");
      container3.classList.remove("zoomed");
      container3.classList.remove("zoom-out");
      if (wasZoomed) {
        container3.scrollTo(0, 0);
      }
    } else {
      const scale = clamp(newScale, MIN_SCALE2, MAX_SCALE2);
      this._zoomScale = scale;
      const dx = container3.scrollWidth > 0 ? (container3.scrollLeft + container3.clientWidth / 2) / container3.scrollWidth : 0.5;
      const dy = container3.scrollHeight > 0 ? (container3.scrollTop + container3.clientHeight / 2) / container3.scrollHeight : 0.5;
      img.classList.remove("scale-to-fit");
      img.classList.toggle("pixelated", scale >= PIXELATION_THRESHOLD);
      img.style.zoom = String(scale);
      container3.classList.add("zoomed");
      const newScrollX = container3.scrollWidth * dx - container3.clientWidth / 2;
      const newScrollY = container3.scrollHeight * dy - container3.clientHeight / 2;
      container3.scrollTo(newScrollX, newScrollY);
    }
  }
  focus() {
    super.focus();
    this._elements?.root.focus();
  }
  layout(dimension) {
    if (this._container) {
      this._container.style.width = `${dimension.width}px`;
      this._container.style.height = `${dimension.height}px`;
    }
  }
};

ImageCarouselEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IFileService),
  __decorateParam(5, IWebviewService)
], ImageCarouselEditor);
export { SCALE_PINCH_FACTOR, MAX_SCALE2, MIN_SCALE2, PIXELATION_THRESHOLD, ZOOM_LEVELS, ImageCarouselEditor };
