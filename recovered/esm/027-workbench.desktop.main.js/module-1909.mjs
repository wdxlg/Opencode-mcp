// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/view/renderers/webviewPreloads.ts



// src/vs/workbench/contrib/notebook/browser/view/renderers/webviewPreloads.ts
async function webviewPreloads(ctx) {
  const userAgent3 = navigator.userAgent;
  const isChrome3 = userAgent3.indexOf("Chrome") >= 0;
  const textEncoder3 = new TextEncoder();
  const textDecoder3 = new TextDecoder();
  function promiseWithResolvers2() {
    let resolve3;
    let reject;
    const promise = new Promise((res, rej) => {
      resolve3 = res;
      reject = rej;
    });
    return { promise, resolve: resolve3, reject };
  }
  let currentOptions = ctx.options;
  const isWorkspaceTrusted = ctx.isWorkspaceTrusted;
  let currentRenderOptions = ctx.renderOptions;
  const settingChange = createEmitter();
  const acquireVsCodeApi = globalThis.acquireVsCodeApi;
  const vscode = acquireVsCodeApi();
  delete globalThis.acquireVsCodeApi;
  const tokenizationStyle = new CSSStyleSheet();
  tokenizationStyle.replaceSync(ctx.style.tokenizationCss);
  const runWhenIdle = typeof requestIdleCallback !== "function" || typeof cancelIdleCallback !== "function" ? (runner) => {
    setTimeout(() => {
      if (disposed) {
        return;
      }
      const end = Date.now() + 15;
      runner(Object.freeze({
        didTimeout: true,
        timeRemaining() {
          return Math.max(0, end - Date.now());
        }
      }));
    });
    let disposed = false;
    return {
      dispose() {
        if (disposed) {
          return;
        }
        disposed = true;
      }
    };
  } : (runner, timeout2) => {
    const handle2 = requestIdleCallback(runner, typeof timeout2 === "number" ? { timeout: timeout2 } : void 0);
    let disposed = false;
    return {
      dispose() {
        if (disposed) {
          return;
        }
        disposed = true;
        cancelIdleCallback(handle2);
      }
    };
  };
  function getOutputContainer(event) {
    for (const node of event.composedPath()) {
      if (node instanceof HTMLElement && node.classList.contains("output")) {
        return {
          id: node.id
        };
      }
    }
    return;
  }
  let lastFocusedOutput = void 0;
  const handleOutputFocusOut = (event) => {
    const outputFocus = event && getOutputContainer(event);
    if (!outputFocus) {
      return;
    }
    lastFocusedOutput = void 0;
    setTimeout(() => {
      if (lastFocusedOutput?.id === outputFocus.id) {
        return;
      }
      postNotebookMessage("outputBlur", outputFocus);
    }, 0);
  };
  const hasActiveEditableElement = (parent, root = document) => {
    const element = root.activeElement;
    return !!(element && parent.contains(element) && (element.matches(":read-write") || element.tagName.toLowerCase() === "select" || element.shadowRoot && hasActiveEditableElement(element.shadowRoot, element.shadowRoot)));
  };
  const checkOutputInputFocus = (e) => {
    lastFocusedOutput = getOutputContainer(e);
    const activeElement = window.document.activeElement;
    if (!activeElement) {
      return;
    }
    const id2 = lastFocusedOutput?.id;
    if (id2 && hasActiveEditableElement(activeElement, window.document)) {
      postNotebookMessage("outputInputFocus", { inputFocused: true, id: id2 });
      activeElement.addEventListener("blur", () => {
        postNotebookMessage("outputInputFocus", { inputFocused: false, id: id2 });
      }, { once: true });
    }
  };
  const handleInnerClick = (event) => {
    if (!event || !event.view || !event.view.document) {
      return;
    }
    const outputFocus = lastFocusedOutput = getOutputContainer(event);
    for (const node of event.composedPath()) {
      if (node instanceof HTMLAnchorElement && node.href) {
        if (node.href.startsWith("blob:")) {
          if (outputFocus) {
            postNotebookMessage("outputFocus", outputFocus);
          }
          handleBlobUrlClick(node.href, node.download);
        } else if (node.href.startsWith("data:")) {
          if (outputFocus) {
            postNotebookMessage("outputFocus", outputFocus);
          }
          handleDataUrl(node.href, node.download);
        } else if (node.getAttribute("href")?.trim().startsWith("#")) {
          if (!node.hash) {
            postNotebookMessage("scroll-to-reveal", { scrollTop: 0 });
            return;
          }
          const targetId = node.hash.substring(1);
          let scrollTarget = event.view.document.getElementById(targetId);
          if (!scrollTarget) {
            for (const preview of event.view.document.querySelectorAll(".preview")) {
              scrollTarget = preview.shadowRoot?.getElementById(targetId);
              if (scrollTarget) {
                break;
              }
            }
          }
          if (scrollTarget) {
            const scrollTop = scrollTarget.getBoundingClientRect().top + event.view.scrollY;
            postNotebookMessage("scroll-to-reveal", { scrollTop });
            return;
          }
        } else {
          const href = node.getAttribute("href");
          if (href) {
            if (href.startsWith("command:") && outputFocus) {
              postNotebookMessage("outputFocus", outputFocus);
            }
            postNotebookMessage("clicked-link", { href });
          }
        }
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    }
    if (outputFocus) {
      postNotebookMessage("outputFocus", outputFocus);
    }
  };
  const blurOutput = () => {
    const selection = window.getSelection();
    if (!selection) {
      return;
    }
    selection.removeAllRanges();
  };
  const selectOutputContents = (cellOrOutputId) => {
    const selection = window.getSelection();
    if (!selection) {
      return;
    }
    const cellOutputContainer = window.document.getElementById(cellOrOutputId);
    if (!cellOutputContainer) {
      return;
    }
    selection.removeAllRanges();
    const range2 = document.createRange();
    range2.selectNode(cellOutputContainer);
    selection.addRange(range2);
  };
  const selectInputContents = (cellOrOutputId) => {
    const cellOutputContainer = window.document.getElementById(cellOrOutputId);
    if (!cellOutputContainer) {
      return;
    }
    const activeElement = window.document.activeElement;
    if (activeElement && hasActiveEditableElement(activeElement, window.document)) {
      activeElement.select();
    }
  };
  const onPageUpDownSelectionHandler = (e) => {
    if (!lastFocusedOutput?.id || !e.shiftKey) {
      return;
    }
    if (e.shiftKey && (e.code === "ArrowUp" || e.code === "ArrowDown")) {
      e.stopPropagation();
      return;
    }
    if (!(e.code === "PageUp" || e.code === "PageDown") && !(e.metaKey && (e.code === "ArrowDown" || e.code === "ArrowUp"))) {
      return;
    }
    const outputContainer = window.document.getElementById(lastFocusedOutput.id);
    const selection = window.getSelection();
    if (!outputContainer || !selection?.anchorNode) {
      return;
    }
    const activeElement = window.document.activeElement;
    if (activeElement && hasActiveEditableElement(activeElement, window.document)) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    const { anchorNode, anchorOffset } = selection;
    const range2 = document.createRange();
    if (e.code === "PageDown" || e.code === "ArrowDown") {
      range2.setStart(anchorNode, anchorOffset);
      range2.setEnd(outputContainer, 1);
    } else {
      range2.setStart(outputContainer, 0);
      range2.setEnd(anchorNode, anchorOffset);
    }
    selection.removeAllRanges();
    selection.addRange(range2);
  };
  const disableNativeSelectAll = (e) => {
    if (!lastFocusedOutput?.id) {
      return;
    }
    const activeElement = window.document.activeElement;
    if (activeElement && hasActiveEditableElement(activeElement, window.document)) {
      return;
    }
    if (e.key === "a" && e.ctrlKey || e.metaKey && e.key === "a") {
      e.preventDefault();
      return;
    }
  };
  const handleDataUrl = async (data, downloadName) => {
    postNotebookMessage("clicked-data-url", {
      data,
      downloadName
    });
  };
  const handleBlobUrlClick = async (url, downloadName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        handleDataUrl(reader.result, downloadName);
      });
      reader.readAsDataURL(blob);
    } catch (e) {
      console.error(e.message);
    }
  };
  window.document.body.addEventListener("click", handleInnerClick);
  window.document.body.addEventListener("focusin", checkOutputInputFocus);
  window.document.body.addEventListener("focusout", handleOutputFocusOut);
  window.document.body.addEventListener("keydown", onPageUpDownSelectionHandler);
  window.document.body.addEventListener("keydown", disableNativeSelectAll);
  function createKernelContext() {
    return Object.freeze({
      onDidReceiveKernelMessage: onDidReceiveKernelMessage.event,
      postKernelMessage: (data) => postNotebookMessage("customKernelMessage", { message: data })
    });
  }
  async function runKernelPreload(url) {
    try {
      return await activateModuleKernelPreload(url);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
  async function activateModuleKernelPreload(url) {
    const module2 = await __import(url);
    if (!module2.activate) {
      console.error(`Notebook preload '${url}' was expected to be a module but it does not export an 'activate' function`);
      return;
    }
    return module2.activate(createKernelContext());
  }
  const dimensionUpdater = new class {
    constructor() {
      this.pending = /* @__PURE__ */ new Map();
    }
    updateHeight(id2, height, options3) {
      if (!this.pending.size) {
        setTimeout(() => {
          this.updateImmediately();
        }, 0);
      }
      const update = this.pending.get(id2);
      if (update && update.isOutput) {
        this.pending.set(id2, {
          id: id2,
          height,
          init: update.init,
          isOutput: update.isOutput
        });
      } else {
        this.pending.set(id2, {
          id: id2,
          height,
          ...options3
        });
      }
    }
    updateImmediately() {
      if (!this.pending.size) {
        return;
      }
      postNotebookMessage("dimension", {
        updates: Array.from(this.pending.values())
      });
      this.pending.clear();
    }
  }();
  function elementHasContent(height) {
    return height > 2.1;
  }
  const resizeObserver = new class {
    constructor() {
      this._observedElements = /* @__PURE__ */ new WeakMap();
      this._observer = new ResizeObserver((entries2) => {
        for (const entry of entries2) {
          if (!window.document.body.contains(entry.target)) {
            continue;
          }
          const observedElementInfo = this._observedElements.get(entry.target);
          if (!observedElementInfo) {
            continue;
          }
          this.postResizeMessage(observedElementInfo.cellId);
          if (entry.target.id !== observedElementInfo.id) {
            continue;
          }
          if (!entry.contentRect) {
            continue;
          }
          if (!observedElementInfo.output) {
            this.updateHeight(observedElementInfo, entry.target.offsetHeight);
            continue;
          }
          const hasContent = elementHasContent(entry.contentRect.height);
          const shouldUpdatePadding = hasContent && observedElementInfo.lastKnownPadding === 0 || !hasContent && observedElementInfo.lastKnownPadding !== 0;
          if (shouldUpdatePadding) {
            window.requestAnimationFrame(() => {
              if (hasContent) {
                entry.target.style.padding = `${ctx.style.outputNodePadding}px ${ctx.style.outputNodePadding}px ${ctx.style.outputNodePadding}px ${ctx.style.outputNodeLeftPadding}px`;
              } else {
                entry.target.style.padding = `0px`;
              }
              this.updateHeight(observedElementInfo, hasContent ? entry.target.offsetHeight : 0);
            });
          } else {
            this.updateHeight(observedElementInfo, hasContent ? entry.target.offsetHeight : 0);
          }
        }
      });
    }
    updateHeight(observedElementInfo, offsetHeight) {
      if (observedElementInfo.lastKnownHeight !== offsetHeight) {
        observedElementInfo.lastKnownHeight = offsetHeight;
        dimensionUpdater.updateHeight(observedElementInfo.id, offsetHeight, {
          isOutput: observedElementInfo.output
        });
      }
    }
    observe(container3, id2, output, cellId) {
      if (this._observedElements.has(container3)) {
        return;
      }
      this._observedElements.set(container3, { id: id2, output, lastKnownPadding: ctx.style.outputNodePadding, lastKnownHeight: -1, cellId });
      this._observer.observe(container3);
    }
    postResizeMessage(cellId) {
      clearTimeout(this._outputResizeTimer);
      this._outputResizeTimer = setTimeout(() => {
        postNotebookMessage("outputResized", {
          cellId
        });
      }, 250);
    }
  }();
  let previousDelta;
  let scrollTimeout;
  let scrolledElement;
  let lastTimeScrolled;
  function flagRecentlyScrolled(node, deltaY) {
    scrolledElement = node;
    if (deltaY === void 0) {
      lastTimeScrolled = Date.now();
      previousDelta = void 0;
      node.setAttribute("recentlyScrolled", "true");
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        scrolledElement?.removeAttribute("recentlyScrolled");
      }, 300);
      return true;
    }
    if (node.hasAttribute("recentlyScrolled")) {
      if (lastTimeScrolled && Date.now() - lastTimeScrolled > 400) {
        if (!!previousDelta && deltaY < 0 && deltaY < previousDelta - 8) {
          clearTimeout(scrollTimeout);
          scrolledElement?.removeAttribute("recentlyScrolled");
          return false;
        } else if (!!previousDelta && deltaY > 0 && deltaY > previousDelta + 8) {
          clearTimeout(scrollTimeout);
          scrolledElement?.removeAttribute("recentlyScrolled");
          return false;
        }
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          scrolledElement?.removeAttribute("recentlyScrolled");
        }, 50);
      } else {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          scrolledElement?.removeAttribute("recentlyScrolled");
        }, 300);
      }
      previousDelta = deltaY;
      return true;
    }
    return false;
  }
  function eventTargetShouldHandleScroll(event) {
    for (let node = event.target; node; node = node.parentNode) {
      if (!(node instanceof Element) || node.id === "container" || node.classList.contains("cell_container") || node.classList.contains("markup") || node.classList.contains("output_container")) {
        return false;
      }
      if (event.deltaY < 0 && node.scrollTop > 0) {
        flagRecentlyScrolled(node);
        return true;
      }
      if (event.deltaY > 0 && node.scrollTop + node.clientHeight < node.scrollHeight) {
        if (node.scrollHeight - node.scrollTop - node.clientHeight < 2) {
          continue;
        }
        const overflowY = window.getComputedStyle(node).overflowY;
        if (overflowY === "hidden" || overflowY === "visible") {
          continue;
        }
        flagRecentlyScrolled(node);
        return true;
      }
      if (flagRecentlyScrolled(node, event.deltaY)) {
        return true;
      }
    }
    return false;
  }
  const handleWheel = (event) => {
    if (event.defaultPrevented || eventTargetShouldHandleScroll(event)) {
      return;
    }
    postNotebookMessage("did-scroll-wheel", {
      payload: {
        deltaMode: event.deltaMode,
        deltaX: event.deltaX,
        deltaY: event.deltaY,
        deltaZ: event.deltaZ,
        // Refs https://github.com/microsoft/vscode/issues/146403#issuecomment-1854538928
        wheelDelta: event.wheelDelta && isChrome3 ? event.wheelDelta / window.devicePixelRatio : event.wheelDelta,
        wheelDeltaX: event.wheelDeltaX && isChrome3 ? event.wheelDeltaX / window.devicePixelRatio : event.wheelDeltaX,
        wheelDeltaY: event.wheelDeltaY && isChrome3 ? event.wheelDeltaY / window.devicePixelRatio : event.wheelDeltaY,
        detail: event.detail,
        shiftKey: event.shiftKey,
        type: event.type
      }
    });
  };
  function focusFirstFocusableOrContainerInOutput(cellOrOutputId, alternateId) {
    const cellOutputContainer = window.document.getElementById(cellOrOutputId) ?? (!!alternateId ? window.document.getElementById(alternateId) : void 0);
    if (!!cellOutputContainer) {
      if (cellOutputContainer.contains(window.document.activeElement)) {
        return;
      }
      let focusableElement = cellOutputContainer.querySelector('[tabindex="0"], [href], button, input, option, select, textarea');
      if (!focusableElement) {
        focusableElement = cellOutputContainer;
        focusableElement.tabIndex = -1;
      }
      if (lastFocusedOutput?.id !== cellOutputContainer.id) {
        lastFocusedOutput = cellOutputContainer;
        postNotebookMessage("outputFocus", { id: cellOutputContainer.id });
      }
      focusableElement.focus();
    }
  }
  function createFocusSink(cellId, focusNext) {
    const element = document.createElement("div");
    element.id = `focus-sink-${cellId}`;
    element.tabIndex = 0;
    element.addEventListener("focus", () => {
      postNotebookMessage("focus-editor", {
        cellId,
        focusNext
      });
    });
    return element;
  }
  function _internalHighlightRange(range2, tagName = "mark", attributes = {}) {
    function _textNodesInRange(range3) {
      if (!range3.startContainer.ownerDocument) {
        return [];
      }
      if (range3.startContainer.nodeType === Node.TEXT_NODE && range3.startOffset > 0) {
        const startContainer = range3.startContainer;
        const endOffset = range3.endOffset;
        const createdNode = startContainer.splitText(range3.startOffset);
        if (range3.endContainer === startContainer) {
          range3.setEnd(createdNode, endOffset - range3.startOffset);
        }
        range3.setStart(createdNode, 0);
      }
      if (range3.endContainer.nodeType === Node.TEXT_NODE && range3.endOffset < range3.endContainer.length) {
        range3.endContainer.splitText(range3.endOffset);
      }
      const walker = range3.startContainer.ownerDocument.createTreeWalker(
        range3.commonAncestorContainer,
        NodeFilter.SHOW_TEXT,
        (node) => range3.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
      );
      walker.currentNode = range3.startContainer;
      const nodes2 = [];
      if (walker.currentNode.nodeType === Node.TEXT_NODE) {
        nodes2.push(walker.currentNode);
      }
      while (walker.nextNode() && range3.comparePoint(walker.currentNode, 0) !== 1) {
        if (walker.currentNode.nodeType === Node.TEXT_NODE) {
          nodes2.push(walker.currentNode);
        }
      }
      return nodes2;
    }
    function wrapNodeInHighlight(node, tagName2, attributes2) {
      const highlightElement = node.ownerDocument.createElement(tagName2);
      Object.keys(attributes2).forEach((key3) => {
        highlightElement.setAttribute(key3, attributes2[key3]);
      });
      const tempRange = node.ownerDocument.createRange();
      tempRange.selectNode(node);
      tempRange.surroundContents(highlightElement);
      return highlightElement;
    }
    if (range2.collapsed) {
      return {
        remove: () => {
        },
        update: () => {
        }
      };
    }
    const nodes = _textNodesInRange(range2);
    const highlightElements = [];
    for (const nodeIdx in nodes) {
      const highlightElement = wrapNodeInHighlight(nodes[nodeIdx], tagName, attributes);
      highlightElements.push(highlightElement);
    }
    function _removeHighlight(highlightElement) {
      if (highlightElement.childNodes.length === 1) {
        highlightElement.replaceWith(highlightElement.firstChild);
      } else {
        while (highlightElement.firstChild) {
          highlightElement.parentNode?.insertBefore(highlightElement.firstChild, highlightElement);
        }
        highlightElement.remove();
      }
    }
    function _removeHighlights() {
      for (const highlightIdx in highlightElements) {
        _removeHighlight(highlightElements[highlightIdx]);
      }
    }
    function _updateHighlight(highlightElement, attributes2 = {}) {
      Object.keys(attributes2).forEach((key3) => {
        highlightElement.setAttribute(key3, attributes2[key3]);
      });
    }
    function updateHighlights(attributes2) {
      for (const highlightIdx in highlightElements) {
        _updateHighlight(highlightElements[highlightIdx], attributes2);
      }
    }
    return {
      remove: _removeHighlights,
      update: updateHighlights
    };
  }
  function selectRange(_range) {
    const sel = window.getSelection();
    if (sel) {
      try {
        sel.removeAllRanges();
        const r2 = document.createRange();
        r2.setStart(_range.startContainer, _range.startOffset);
        r2.setEnd(_range.endContainer, _range.endOffset);
        sel.addRange(r2);
      } catch (e) {
        console.log(e);
      }
    }
  }
  function highlightRange2(range2, useCustom, tagName = "mark", attributes = {}) {
    if (useCustom) {
      const ret = _internalHighlightRange(range2, tagName, attributes);
      return {
        range: range2,
        dispose: ret.remove,
        update: (color2, className2) => {
          if (className2 === void 0) {
            ret.update({
              "style": `background-color: ${color2}`
            });
          } else {
            ret.update({
              "class": className2
            });
          }
        }
      };
    } else {
      window.document.execCommand("hiliteColor", false, matchColor);
      const cloneRange = window.getSelection().getRangeAt(0).cloneRange();
      const _range = {
        collapsed: cloneRange.collapsed,
        commonAncestorContainer: cloneRange.commonAncestorContainer,
        endContainer: cloneRange.endContainer,
        endOffset: cloneRange.endOffset,
        startContainer: cloneRange.startContainer,
        startOffset: cloneRange.startOffset
      };
      return {
        range: _range,
        dispose: () => {
          selectRange(_range);
          try {
            document.designMode = "On";
            window.document.execCommand("removeFormat", false, void 0);
            document.designMode = "Off";
            window.getSelection()?.removeAllRanges();
          } catch (e) {
            console.log(e);
          }
        },
        update: (color2, className2) => {
          selectRange(_range);
          try {
            document.designMode = "On";
            window.document.execCommand("removeFormat", false, void 0);
            window.document.execCommand("hiliteColor", false, color2);
            document.designMode = "Off";
            window.getSelection()?.removeAllRanges();
          } catch (e) {
            console.log(e);
          }
        }
      };
    }
  }
  function createEmitter(listenerChange = () => void 0) {
    const listeners = /* @__PURE__ */ new Set();
    return {
      fire(data) {
        for (const listener of [...listeners]) {
          listener.fn.call(listener.thisArg, data);
        }
      },
      event(fn, thisArg, disposables) {
        const listenerObj = { fn, thisArg };
        const disposable = {
          dispose: () => {
            listeners.delete(listenerObj);
            listenerChange(listeners);
          }
        };
        listeners.add(listenerObj);
        listenerChange(listeners);
        if (disposables instanceof Array) {
          disposables.push(disposable);
        } else if (disposables) {
          disposables.add(disposable);
        }
        return disposable;
      }
    };
  }
  function showRenderError(errorText, outputNode, errors) {
    outputNode.innerText = errorText;
    const errList = document.createElement("ul");
    for (const result of errors) {
      console.error(result);
      const item = document.createElement("li");
      item.innerText = result.message;
      errList.appendChild(item);
    }
    outputNode.appendChild(errList);
  }
  const outputItemRequests = new class {
    constructor() {
      this._requestPool = 0;
      this._requests = /* @__PURE__ */ new Map();
    }
    getOutputItem(outputId, mime) {
      const requestId = this._requestPool++;
      const { promise, resolve: resolve3 } = promiseWithResolvers2();
      this._requests.set(requestId, { resolve: resolve3 });
      postNotebookMessage("getOutputItem", { requestId, outputId, mime });
      return promise;
    }
    resolveOutputItem(requestId, output) {
      const request2 = this._requests.get(requestId);
      if (!request2) {
        return;
      }
      this._requests.delete(requestId);
      request2.resolve(output);
    }
  }();
  let hasWarnedAboutAllOutputItemsProposal = false;
  function createOutputItem(id2, mime, metadata, valueBytes, allOutputItemData, appended) {
    function create2(id3, mime2, metadata2, valueBytes2, appended2) {
      return Object.freeze({
        id: id3,
        mime: mime2,
        metadata: metadata2,
        appendedText() {
          if (appended2) {
            return textDecoder3.decode(appended2.valueBytes);
          }
          return void 0;
        },
        data() {
          return valueBytes2;
        },
        text() {
          return textDecoder3.decode(valueBytes2);
        },
        json() {
          return JSON.parse(this.text());
        },
        blob() {
          return new Blob([valueBytes2], { type: this.mime });
        },
        get _allOutputItems() {
          if (!hasWarnedAboutAllOutputItemsProposal) {
            hasWarnedAboutAllOutputItemsProposal = true;
            console.warn(`'_allOutputItems' is proposed API. DO NOT ship an extension that depends on it!`);
          }
          return allOutputItemList;
        }
      });
    }
    const allOutputItemCache = /* @__PURE__ */ new Map();
    const allOutputItemList = Object.freeze(allOutputItemData.map((outputItem) => {
      const mime2 = outputItem.mime;
      return Object.freeze({
        mime: mime2,
        getItem() {
          const existingTask = allOutputItemCache.get(mime2);
          if (existingTask) {
            return existingTask;
          }
          const task = outputItemRequests.getOutputItem(id2, mime2).then((item2) => {
            return item2 ? create2(id2, item2.mime, metadata, item2.valueBytes) : void 0;
          });
          allOutputItemCache.set(mime2, task);
          return task;
        }
      });
    }));
    const item = create2(id2, mime, metadata, valueBytes, appended);
    allOutputItemCache.set(mime, Promise.resolve(item));
    return item;
  }
  const onDidReceiveKernelMessage = createEmitter();
  const ttPolicy8 = window.trustedTypes?.createPolicy("notebookRenderer", {
    createHTML: (value2) => value2,
    // CodeQL [SM03712] The rendered content is provided by renderer extensions, which are responsible for sanitizing their content themselves. The notebook webview is also sandboxed.
    createScript: (value2) => value2
    // CodeQL [SM03712] The rendered content is provided by renderer extensions, which are responsible for sanitizing their content themselves. The notebook webview is also sandboxed.
  });
  window.addEventListener("wheel", handleWheel);
  const matchColor = window.getComputedStyle(window.document.getElementById("_defaultColorPalatte")).color;
  const currentMatchColor = window.getComputedStyle(window.document.getElementById("_defaultColorPalatte")).backgroundColor;
  class JSHighlighter {
    constructor() {
      this._activeHighlightInfo = /* @__PURE__ */ new Map();
    }
    addHighlights(matches2, ownerID) {
      for (let i2 = matches2.length - 1; i2 >= 0; i2--) {
        const match2 = matches2[i2];
        const ret = highlightRange2(match2.originalRange, true, "mark", match2.isShadow ? {
          "style": "background-color: " + matchColor + ";"
        } : {
          "class": "find-match"
        });
        match2.highlightResult = ret;
      }
      const highlightInfo = {
        matches: matches2,
        currentMatchIndex: -1
      };
      this._activeHighlightInfo.set(ownerID, highlightInfo);
    }
    removeHighlights(ownerID) {
      this._activeHighlightInfo.get(ownerID)?.matches.forEach((match2) => {
        match2.highlightResult?.dispose();
      });
      this._activeHighlightInfo.delete(ownerID);
    }
    highlightCurrentMatch(index2, ownerID) {
      const highlightInfo = this._activeHighlightInfo.get(ownerID);
      if (!highlightInfo) {
        console.error("Modified current highlight match before adding highlight list.");
        return;
      }
      const oldMatch = highlightInfo.matches[highlightInfo.currentMatchIndex];
      oldMatch?.highlightResult?.update(matchColor, oldMatch.isShadow ? void 0 : "find-match");
      const match2 = highlightInfo.matches[index2];
      highlightInfo.currentMatchIndex = index2;
      const sel = window.getSelection();
      if (!!match2 && !!sel && match2.highlightResult) {
        let offset = 0;
        try {
          const outputOffset = window.document.getElementById(match2.id).getBoundingClientRect().top;
          const tempRange = document.createRange();
          tempRange.selectNode(match2.highlightResult.range.startContainer);
          match2.highlightResult.range.startContainer.parentElement?.scrollIntoView({ behavior: "auto", block: "end", inline: "nearest" });
          const rangeOffset = tempRange.getBoundingClientRect().top;
          tempRange.detach();
          offset = rangeOffset - outputOffset;
        } catch (e) {
          console.error(e);
        }
        match2.highlightResult?.update(currentMatchColor, match2.isShadow ? void 0 : "current-find-match");
        window.document.getSelection()?.removeAllRanges();
        postNotebookMessage("didFindHighlightCurrent", {
          offset
        });
      }
    }
    unHighlightCurrentMatch(index2, ownerID) {
      const highlightInfo = this._activeHighlightInfo.get(ownerID);
      if (!highlightInfo) {
        return;
      }
      const oldMatch = highlightInfo.matches[index2];
      if (oldMatch && oldMatch.highlightResult) {
        oldMatch.highlightResult.update(matchColor, oldMatch.isShadow ? void 0 : "find-match");
      }
    }
    dispose() {
      window.document.getSelection()?.removeAllRanges();
      this._activeHighlightInfo.forEach((highlightInfo) => {
        highlightInfo.matches.forEach((match2) => {
          match2.highlightResult?.dispose();
        });
      });
    }
  }
  class CSSHighlighter {
    constructor() {
      this._activeHighlightInfo = /* @__PURE__ */ new Map();
      this._matchesHighlight = new Highlight();
      this._matchesHighlight.priority = 1;
      this._currentMatchesHighlight = new Highlight();
      this._currentMatchesHighlight.priority = 2;
      CSS.highlights?.set(`find-highlight`, this._matchesHighlight);
      CSS.highlights?.set(`current-find-highlight`, this._currentMatchesHighlight);
    }
    _refreshRegistry(updateMatchesHighlight = true) {
      if (updateMatchesHighlight) {
        this._matchesHighlight.clear();
      }
      this._currentMatchesHighlight.clear();
      this._activeHighlightInfo.forEach((highlightInfo) => {
        if (updateMatchesHighlight) {
          for (let i2 = 0; i2 < highlightInfo.matches.length; i2++) {
            this._matchesHighlight.add(highlightInfo.matches[i2].originalRange);
          }
        }
        if (highlightInfo.currentMatchIndex < highlightInfo.matches.length && highlightInfo.currentMatchIndex >= 0) {
          this._currentMatchesHighlight.add(highlightInfo.matches[highlightInfo.currentMatchIndex].originalRange);
        }
      });
    }
    addHighlights(matches2, ownerID) {
      for (let i2 = 0; i2 < matches2.length; i2++) {
        this._matchesHighlight.add(matches2[i2].originalRange);
      }
      const newEntry = {
        matches: matches2,
        currentMatchIndex: -1
      };
      this._activeHighlightInfo.set(ownerID, newEntry);
    }
    highlightCurrentMatch(index2, ownerID) {
      const highlightInfo = this._activeHighlightInfo.get(ownerID);
      if (!highlightInfo) {
        console.error("Modified current highlight match before adding highlight list.");
        return;
      }
      highlightInfo.currentMatchIndex = index2;
      const match2 = highlightInfo.matches[index2];
      if (match2) {
        let offset = 0;
        try {
          const outputOffset = window.document.getElementById(match2.id).getBoundingClientRect().top;
          match2.originalRange.startContainer.parentElement?.scrollIntoView({ behavior: "auto", block: "end", inline: "nearest" });
          const rangeOffset = match2.originalRange.getBoundingClientRect().top;
          offset = rangeOffset - outputOffset;
          postNotebookMessage("didFindHighlightCurrent", {
            offset
          });
        } catch (e) {
          console.error(e);
        }
      }
      this._refreshRegistry(false);
    }
    unHighlightCurrentMatch(index2, ownerID) {
      const highlightInfo = this._activeHighlightInfo.get(ownerID);
      if (!highlightInfo) {
        return;
      }
      highlightInfo.currentMatchIndex = -1;
    }
    removeHighlights(ownerID) {
      this._activeHighlightInfo.delete(ownerID);
      this._refreshRegistry();
    }
    dispose() {
      window.document.getSelection()?.removeAllRanges();
      this._currentMatchesHighlight.clear();
      this._matchesHighlight.clear();
    }
  }
  const _highlighter = CSS.highlights ? new CSSHighlighter() : new JSHighlighter();
  function extractSelectionLine(selection) {
    const range2 = selection.getRangeAt(0);
    const oldRange = range2.cloneRange();
    const captureLength = selection.toString().length;
    selection.collapseToStart();
    selection.modify("move", "backward", "lineboundary");
    selection.modify("extend", "forward", "lineboundary");
    const line = selection.toString();
    const rangeStart = getStartOffset(selection.getRangeAt(0), oldRange);
    const lineRange = {
      start: rangeStart,
      end: rangeStart + captureLength
    };
    selection.removeAllRanges();
    selection.addRange(oldRange);
    return { line, range: lineRange };
  }
  function getStartOffset(lineRange, originalRange) {
    const firstCommonAncestor = findFirstCommonAncestor(lineRange.startContainer, originalRange.startContainer);
    const selectionOffset = getSelectionOffsetRelativeTo(firstCommonAncestor, lineRange.startContainer) + lineRange.startOffset;
    const textOffset = getSelectionOffsetRelativeTo(firstCommonAncestor, originalRange.startContainer) + originalRange.startOffset;
    return textOffset - selectionOffset;
  }
  function findFirstCommonAncestor(nodeA, nodeB) {
    const range2 = new Range();
    range2.setStart(nodeA, 0);
    range2.setEnd(nodeB, 0);
    return range2.commonAncestorContainer;
  }
  function getTextContentLength(node) {
    let length = 0;
    if (node.nodeType === Node.TEXT_NODE) {
      length += node.textContent?.length || 0;
    } else {
      for (const childNode of node.childNodes) {
        length += getTextContentLength(childNode);
      }
    }
    return length;
  }
  function getSelectionOffsetRelativeTo(parentElement, currentNode) {
    if (!currentNode) {
      return 0;
    }
    let offset = 0;
    if (currentNode === parentElement || !parentElement.contains(currentNode)) {
      return offset;
    }
    let prevSibling = currentNode.previousSibling;
    while (prevSibling) {
      offset += getTextContentLength(prevSibling);
      prevSibling = prevSibling.previousSibling;
    }
    return offset + getSelectionOffsetRelativeTo(parentElement, currentNode.parentNode);
  }
  const find2 = (query, options3) => {
    let find3 = true;
    let matches2 = [];
    const range2 = document.createRange();
    range2.selectNodeContents(window.document.getElementById("findStart"));
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range2);
    viewModel.toggleDragDropEnabled(false);
    try {
      document.designMode = "On";
      while (find3 && matches2.length < 500) {
        find3 = window.find(
          query,
          /* caseSensitive*/
          !!options3.caseSensitive,
          /* backwards*/
          false,
          /* wrapAround*/
          false,
          /* wholeWord */
          !!options3.wholeWord,
          /* searchInFrames*/
          true,
          false
        );
        if (find3) {
          const selection = window.getSelection();
          if (!selection) {
            console.log("no selection");
            break;
          }
          if (options3.includeMarkup && selection.rangeCount > 0 && selection.getRangeAt(0).startContainer.nodeType === 1 && selection.getRangeAt(0).startContainer.classList.contains("markup")) {
            const preview = selection.anchorNode?.firstChild;
            const root = preview.shadowRoot;
            const shadowSelection = root?.getSelection ? root?.getSelection() : null;
            if (shadowSelection && shadowSelection.anchorNode) {
              matches2.push({
                type: "preview",
                id: preview.id,
                cellId: preview.id,
                container: preview,
                isShadow: true,
                originalRange: shadowSelection.getRangeAt(0),
                searchPreviewInfo: options3.shouldGetSearchPreviewInfo ? extractSelectionLine(shadowSelection) : void 0
              });
            }
          }
          if (options3.includeOutput && selection.rangeCount > 0 && selection.getRangeAt(0).startContainer.nodeType === 1 && selection.getRangeAt(0).startContainer.classList.contains("output_container")) {
            const cellId = selection.getRangeAt(0).startContainer.parentElement.id;
            const outputNode = selection.anchorNode?.firstChild;
            const root = outputNode.shadowRoot;
            const shadowSelection = root?.getSelection ? root?.getSelection() : null;
            if (shadowSelection && shadowSelection.anchorNode) {
              matches2.push({
                type: "output",
                id: outputNode.id,
                cellId,
                container: outputNode,
                isShadow: true,
                originalRange: shadowSelection.getRangeAt(0),
                searchPreviewInfo: options3.shouldGetSearchPreviewInfo ? extractSelectionLine(shadowSelection) : void 0
              });
            }
          }
          const anchorNode = selection.anchorNode?.parentElement;
          if (anchorNode) {
            const lastEl = matches2.length ? matches2[matches2.length - 1] : null;
            if (lastEl && lastEl.container.contains(anchorNode) && options3.includeOutput) {
              matches2.push({
                type: lastEl.type,
                id: lastEl.id,
                cellId: lastEl.cellId,
                container: lastEl.container,
                isShadow: false,
                originalRange: selection.getRangeAt(0),
                searchPreviewInfo: options3.shouldGetSearchPreviewInfo ? extractSelectionLine(selection) : void 0
              });
            } else {
              for (let node = anchorNode; node; node = node.parentElement) {
                if (!(node instanceof Element)) {
                  break;
                }
                if (node.classList.contains("output") && options3.includeOutput) {
                  const cellId = node.parentElement?.parentElement?.id;
                  if (cellId) {
                    matches2.push({
                      type: "output",
                      id: node.id,
                      cellId,
                      container: node,
                      isShadow: false,
                      originalRange: selection.getRangeAt(0),
                      searchPreviewInfo: options3.shouldGetSearchPreviewInfo ? extractSelectionLine(selection) : void 0
                    });
                  }
                  break;
                }
                if (node.id === "container" || node === window.document.body) {
                  break;
                }
              }
            }
          } else {
            break;
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
    matches2 = matches2.filter((match2) => options3.findIds.length ? options3.findIds.includes(match2.cellId) : true);
    _highlighter.addHighlights(matches2, options3.ownerID);
    window.document.getSelection()?.removeAllRanges();
    viewModel.toggleDragDropEnabled(currentOptions.dragAndDropEnabled);
    document.designMode = "Off";
    postNotebookMessage("didFind", {
      matches: matches2.map((match2, index2) => ({
        type: match2.type,
        id: match2.id,
        cellId: match2.cellId,
        index: index2,
        searchPreviewInfo: match2.searchPreviewInfo
      }))
    });
  };
  const copyOutputImage = async (outputId, altOutputId, textAlternates, retries = 5) => {
    if (!window.document.hasFocus() && retries > 0) {
      setTimeout(() => {
        copyOutputImage(outputId, altOutputId, textAlternates, retries - 1);
      }, 50);
      return;
    }
    try {
      const outputElement = window.document.getElementById(outputId) ?? window.document.getElementById(altOutputId);
      let image = outputElement?.querySelector("img");
      if (!image) {
        const svgImage = outputElement?.querySelector("svg.output-image") ?? outputElement?.querySelector("div.svgContainerStyle > svg");
        if (svgImage) {
          image = new Image();
          image.src = "data:image/svg+xml," + encodeURIComponent(svgImage.outerHTML);
        }
      }
      if (image) {
        const ensureImageLoaded = (img) => {
          return new Promise((resolve3, reject) => {
            if (img.complete && img.naturalWidth > 0) {
              resolve3(img);
            } else {
              img.onload = () => resolve3(img);
              img.onerror = () => reject(new Error("Failed to load image"));
              setTimeout(() => reject(new Error("Image load timeout")), 5e3);
            }
          });
        };
        const imageToCopy = await ensureImageLoaded(image);
        const clipboardData = {
          "image/png": new Promise((resolve3) => {
            const canvas = document.createElement("canvas");
            canvas.width = imageToCopy.naturalWidth;
            canvas.height = imageToCopy.naturalHeight;
            const context2 = canvas.getContext("2d");
            context2.drawImage(imageToCopy, 0, 0);
            canvas.toBlob((blob) => {
              if (blob) {
                resolve3(blob);
              } else {
                console.error("No blob data to write to clipboard");
              }
              canvas.remove();
            }, "image/png");
          })
        };
        if (textAlternates) {
          for (const alternate of textAlternates) {
            clipboardData[alternate.mimeType] = alternate.content;
          }
        }
        await navigator.clipboard.write([new ClipboardItem(clipboardData)]);
      } else {
        console.error("Could not find image element to copy for output with id", outputId);
      }
    } catch (e) {
      console.error("Could not copy image:", e);
    }
  };
  window.addEventListener("message", async (rawEvent) => {
    const event = rawEvent;
    switch (event.data.type) {
      case "initializeMarkup": {
        try {
          await Promise.all(event.data.cells.map((info) => viewModel.ensureMarkupCell(info)));
        } finally {
          dimensionUpdater.updateImmediately();
          postNotebookMessage("initializedMarkup", { requestId: event.data.requestId });
        }
        break;
      }
      case "createMarkupCell":
        viewModel.ensureMarkupCell(event.data.cell);
        break;
      case "showMarkupCell":
        viewModel.showMarkupCell(event.data.id, event.data.top, event.data.content, event.data.metadata);
        break;
      case "hideMarkupCells":
        for (const id2 of event.data.ids) {
          viewModel.hideMarkupCell(id2);
        }
        break;
      case "unhideMarkupCells":
        for (const id2 of event.data.ids) {
          viewModel.unhideMarkupCell(id2);
        }
        break;
      case "deleteMarkupCell":
        for (const id2 of event.data.ids) {
          viewModel.deleteMarkupCell(id2);
        }
        break;
      case "updateSelectedMarkupCells":
        viewModel.updateSelectedCells(event.data.selectedCellIds);
        break;
      case "html": {
        const data = event.data;
        if (data.createOnIdle) {
          outputRunner.enqueueIdle(data.outputId, (signal) => {
            return viewModel.renderOutputCell(data, signal);
          });
        } else {
          outputRunner.enqueue(data.outputId, (signal) => {
            return viewModel.renderOutputCell(data, signal);
          });
        }
        break;
      }
      case "view-scroll": {
        event.data.widgets.forEach((widget) => {
          outputRunner.enqueue(widget.outputId, () => {
            viewModel.updateOutputsScroll([widget]);
          });
        });
        viewModel.updateMarkupScrolls(event.data.markupCells);
        break;
      }
      case "clear":
        renderers.clearAll();
        viewModel.clearAll();
        window.document.getElementById("container").innerText = "";
        break;
      case "clearOutput": {
        const { cellId, rendererId, outputId } = event.data;
        outputRunner.cancelOutput(outputId);
        viewModel.clearOutput(cellId, outputId, rendererId);
        break;
      }
      case "hideOutput": {
        const { cellId, outputId } = event.data;
        outputRunner.enqueue(outputId, () => {
          viewModel.hideOutput(cellId);
        });
        break;
      }
      case "showOutput": {
        const { outputId, cellTop, cellId, content: content2 } = event.data;
        outputRunner.enqueue(outputId, () => {
          viewModel.showOutput(cellId, outputId, cellTop);
          if (content2) {
            viewModel.updateAndRerender(cellId, outputId, content2);
          }
        });
        break;
      }
      case "copyImage": {
        await copyOutputImage(event.data.outputId, event.data.altOutputId, event.data.textAlternates);
        break;
      }
      case "ack-dimension": {
        for (const { cellId, outputId, height } of event.data.updates) {
          viewModel.updateOutputHeight(cellId, outputId, height);
        }
        break;
      }
      case "preload": {
        const resources = event.data.resources;
        for (const { uri: uri5 } of resources) {
          kernelPreloads.load(uri5);
        }
        break;
      }
      case "updateRenderers": {
        const { rendererData } = event.data;
        renderers.updateRendererData(rendererData);
        break;
      }
      case "focus-output":
        focusFirstFocusableOrContainerInOutput(event.data.cellOrOutputId, event.data.alternateId);
        break;
      case "blur-output":
        blurOutput();
        break;
      case "select-output-contents":
        selectOutputContents(event.data.cellOrOutputId);
        break;
      case "select-input-contents":
        selectInputContents(event.data.cellOrOutputId);
        break;
      case "decorations": {
        let outputContainer = window.document.getElementById(event.data.cellId);
        if (!outputContainer) {
          viewModel.ensureOutputCell(event.data.cellId, -1e5, true);
          outputContainer = window.document.getElementById(event.data.cellId);
        }
        outputContainer?.classList.add(...event.data.addedClassNames);
        outputContainer?.classList.remove(...event.data.removedClassNames);
        break;
      }
      case "markupDecorations": {
        const markupCell = window.document.getElementById(event.data.cellId);
        if (markupCell) {
          markupCell?.classList.add(...event.data.addedClassNames);
          markupCell?.classList.remove(...event.data.removedClassNames);
        }
        break;
      }
      case "customKernelMessage":
        onDidReceiveKernelMessage.fire(event.data.message);
        break;
      case "customRendererMessage":
        renderers.getRenderer(event.data.rendererId)?.receiveMessage(event.data.message);
        break;
      case "notebookStyles": {
        const documentStyle = window.document.documentElement.style;
        for (let i2 = documentStyle.length - 1; i2 >= 0; i2--) {
          const property = documentStyle[i2];
          if (property && property.startsWith("--notebook-")) {
            documentStyle.removeProperty(property);
          }
        }
        for (const [name, value2] of Object.entries(event.data.styles)) {
          documentStyle.setProperty(`--${name}`, value2);
        }
        break;
      }
      case "notebookOptions":
        currentOptions = event.data.options;
        viewModel.toggleDragDropEnabled(currentOptions.dragAndDropEnabled);
        currentRenderOptions = event.data.renderOptions;
        settingChange.fire(currentRenderOptions);
        break;
      case "tokenizedCodeBlock": {
        const { codeBlockId, html: html3 } = event.data;
        MarkdownCodeBlock.highlightCodeBlock(codeBlockId, html3);
        break;
      }
      case "tokenizedStylesChanged": {
        tokenizationStyle.replaceSync(event.data.css);
        break;
      }
      case "find": {
        _highlighter.removeHighlights(event.data.options.ownerID);
        find2(event.data.query, event.data.options);
        break;
      }
      case "findHighlightCurrent": {
        _highlighter?.highlightCurrentMatch(event.data.index, event.data.ownerID);
        break;
      }
      case "findUnHighlightCurrent": {
        _highlighter?.unHighlightCurrentMatch(event.data.index, event.data.ownerID);
        break;
      }
      case "findStop": {
        _highlighter.removeHighlights(event.data.ownerID);
        break;
      }
      case "returnOutputItem": {
        outputItemRequests.resolveOutputItem(event.data.requestId, event.data.output);
      }
    }
  });
  const renderFallbackErrorName = "vscode.fallbackToNextRenderer";
  class Renderer2 {
    constructor(data) {
      this.data = data;
      this._onMessageEvent = createEmitter();
    }
    receiveMessage(message) {
      this._onMessageEvent.fire(message);
    }
    async renderOutputItem(item, element, signal) {
      try {
        await this.load();
      } catch (e) {
        if (!signal.aborted) {
          showRenderError(`Error loading renderer '${this.data.id}'`, element, e instanceof Error ? [e] : []);
        }
        return;
      }
      if (!this._api) {
        if (!signal.aborted) {
          showRenderError(`Renderer '${this.data.id}' does not implement renderOutputItem`, element, []);
        }
        return;
      }
      try {
        const renderStart = performance.now();
        await this._api.renderOutputItem(item, element, signal);
        this.postDebugMessage("Rendered output item", { id: item.id, duration: `${performance.now() - renderStart}ms` });
      } catch (e) {
        if (signal.aborted) {
          return;
        }
        if (e instanceof Error && e.name === renderFallbackErrorName) {
          throw e;
        }
        showRenderError(`Error rendering output item using '${this.data.id}'`, element, e instanceof Error ? [e] : []);
        this.postDebugMessage("Rendering output item failed", { id: item.id, error: e + "" });
      }
    }
    disposeOutputItem(id2) {
      this._api?.disposeOutputItem?.(id2);
    }
    createRendererContext() {
      const { id: id2, messaging } = this.data;
      const context2 = {
        setState: (newState) => vscode.setState({ ...vscode.getState(), [id2]: newState }),
        getState: () => {
          const state = vscode.getState();
          return typeof state === "object" && state ? state[id2] : void 0;
        },
        getRenderer: async (id3) => {
          const renderer = renderers.getRenderer(id3);
          if (!renderer) {
            return void 0;
          }
          if (renderer._api) {
            return renderer._api;
          }
          return renderer.load();
        },
        workspace: {
          get isTrusted() {
            return isWorkspaceTrusted;
          }
        },
        settings: {
          get lineLimit() {
            return currentRenderOptions.lineLimit;
          },
          get outputScrolling() {
            return currentRenderOptions.outputScrolling;
          },
          get outputWordWrap() {
            return currentRenderOptions.outputWordWrap;
          },
          get linkifyFilePaths() {
            return currentRenderOptions.linkifyFilePaths;
          },
          get minimalError() {
            return currentRenderOptions.minimalError;
          }
        },
        get onDidChangeSettings() {
          return settingChange.event;
        }
      };
      if (messaging) {
        context2.onDidReceiveMessage = this._onMessageEvent.event;
        context2.postMessage = (message) => postNotebookMessage("customRendererMessage", { rendererId: id2, message });
      }
      return Object.freeze(context2);
    }
    load() {
      this._loadPromise ??= this._load();
      return this._loadPromise;
    }
    /** Inner function cached in the _loadPromise(). */
    async _load() {
      this.postDebugMessage("Start loading renderer");
      try {
        await kernelPreloads.waitForAllCurrent();
        const importStart = performance.now();
        const module2 = await __import(this.data.entrypoint.path);
        this.postDebugMessage("Imported renderer", { duration: `${performance.now() - importStart}ms` });
        if (!module2) {
          return;
        }
        this._api = await module2.activate(this.createRendererContext());
        this.postDebugMessage("Activated renderer", { duration: `${performance.now() - importStart}ms` });
        const dependantRenderers = ctx.rendererData.filter((d) => d.entrypoint.extends === this.data.id);
        if (dependantRenderers.length) {
          this.postDebugMessage("Activating dependant renderers", { dependents: dependantRenderers.map((x) => x.id).join(", ") });
        }
        await Promise.all(dependantRenderers.map(async (d) => {
          const renderer = renderers.getRenderer(d.id);
          if (!renderer) {
            throw new Error(`Could not find extending renderer: ${d.id}`);
          }
          try {
            return await renderer.load();
          } catch (e) {
            console.error(e);
            this.postDebugMessage("Activating dependant renderer failed", { dependent: d.id, error: e + "" });
            return void 0;
          }
        }));
        return this._api;
      } catch (e) {
        this.postDebugMessage("Loading renderer failed");
        throw e;
      }
    }
    postDebugMessage(msg, data) {
      postNotebookMessage("logRendererDebugMessage", {
        message: `[renderer ${this.data.id}] - ${msg}`,
        data
      });
    }
  }
  const kernelPreloads = new class {
    constructor() {
      this.preloads = /* @__PURE__ */ new Map();
    }
    /**
     * Returns a promise that resolves when the given preload is activated.
     */
    waitFor(uri5) {
      return this.preloads.get(uri5) || Promise.resolve(new Error(`Preload not ready: ${uri5}`));
    }
    /**
     * Loads a preload.
     * @param uri URI to load from
     * @param originalUri URI to show in an error message if the preload is invalid.
     */
    load(uri5) {
      const promise = Promise.all([
        runKernelPreload(uri5),
        this.waitForAllCurrent()
      ]);
      this.preloads.set(uri5, promise);
      return promise;
    }
    /**
     * Returns a promise that waits for all currently-registered preloads to
     * activate before resolving.
     */
    waitForAllCurrent() {
      return Promise.all([...this.preloads.values()].map((p) => p.catch((err) => err)));
    }
  }();
  const outputRunner = new class {
    constructor() {
      this.outputs = /* @__PURE__ */ new Map();
      this.pendingOutputCreationRequest = /* @__PURE__ */ new Map();
    }
    /**
     * Pushes the action onto the list of actions for the given output ID,
     * ensuring that it's run in-order.
     */
    enqueue(outputId, action) {
      this.pendingOutputCreationRequest.get(outputId)?.dispose();
      this.pendingOutputCreationRequest.delete(outputId);
      const record = this.outputs.get(outputId);
      if (!record) {
        const controller = new AbortController();
        this.outputs.set(outputId, { abort: controller, queue: new Promise((r2) => r2(action(controller.signal))) });
      } else {
        record.queue = record.queue.then(async (r2) => {
          if (!record.abort.signal.aborted) {
            await action(record.abort.signal);
          }
        });
      }
    }
    enqueueIdle(outputId, action) {
      this.pendingOutputCreationRequest.get(outputId)?.dispose();
      outputRunner.pendingOutputCreationRequest.set(outputId, runWhenIdle(() => {
        outputRunner.enqueue(outputId, action);
        outputRunner.pendingOutputCreationRequest.delete(outputId);
      }));
    }
    /**
     * Cancels the rendering of all outputs.
     */
    cancelAll() {
      this.pendingOutputCreationRequest.forEach((r2) => r2.dispose());
      this.pendingOutputCreationRequest.clear();
      for (const { abort } of this.outputs.values()) {
        abort.abort();
      }
      this.outputs.clear();
    }
    /**
     * Cancels any ongoing rendering out an output.
     */
    cancelOutput(outputId) {
      this.pendingOutputCreationRequest.get(outputId)?.dispose();
      this.pendingOutputCreationRequest.delete(outputId);
      const output = this.outputs.get(outputId);
      if (output) {
        output.abort.abort();
        this.outputs.delete(outputId);
      }
    }
  }();
  const renderers = new class {
    constructor() {
      this._renderers = /* @__PURE__ */ new Map();
      for (const renderer of ctx.rendererData) {
        this.addRenderer(renderer);
      }
    }
    getRenderer(id2) {
      return this._renderers.get(id2);
    }
    rendererEqual(a, b) {
      if (a.id !== b.id || a.entrypoint.path !== b.entrypoint.path || a.entrypoint.extends !== b.entrypoint.extends || a.messaging !== b.messaging) {
        return false;
      }
      if (a.mimeTypes.length !== b.mimeTypes.length) {
        return false;
      }
      for (let i2 = 0; i2 < a.mimeTypes.length; i2++) {
        if (a.mimeTypes[i2] !== b.mimeTypes[i2]) {
          return false;
        }
      }
      return true;
    }
    updateRendererData(rendererData) {
      const oldKeys = new Set(this._renderers.keys());
      const newKeys = new Set(rendererData.map((d) => d.id));
      for (const renderer of rendererData) {
        const existing = this._renderers.get(renderer.id);
        if (existing && this.rendererEqual(existing.data, renderer)) {
          continue;
        }
        this.addRenderer(renderer);
      }
      for (const key3 of oldKeys) {
        if (!newKeys.has(key3)) {
          this._renderers.delete(key3);
        }
      }
    }
    addRenderer(renderer) {
      this._renderers.set(renderer.id, new Renderer2(renderer));
    }
    clearAll() {
      outputRunner.cancelAll();
      for (const renderer of this._renderers.values()) {
        renderer.disposeOutputItem();
      }
    }
    clearOutput(rendererId, outputId) {
      outputRunner.cancelOutput(outputId);
      this._renderers.get(rendererId)?.disposeOutputItem(outputId);
    }
    async render(item, preferredRendererId, element, signal) {
      const primaryRenderer = this.findRenderer(preferredRendererId, item);
      if (!primaryRenderer) {
        const errorMessage2 = (window.document.documentElement.style.getPropertyValue("--notebook-cell-renderer-not-found-error") || "").replace("$0", () => item.mime);
        this.showRenderError(item, element, errorMessage2);
        return;
      }
      if (!(await this._doRender(item, element, primaryRenderer, signal)).continue) {
        return;
      }
      for (const additionalItemData of item._allOutputItems) {
        if (additionalItemData.mime === item.mime) {
          continue;
        }
        const additionalItem = await additionalItemData.getItem();
        if (signal.aborted) {
          return;
        }
        if (additionalItem) {
          const renderer = this.findRenderer(void 0, additionalItem);
          if (renderer) {
            if (!(await this._doRender(additionalItem, element, renderer, signal)).continue) {
              return;
            }
          }
        }
      }
      const errorMessage = (window.document.documentElement.style.getPropertyValue("--notebook-cell-renderer-fallbacks-exhausted") || "").replace("$0", () => item.mime);
      this.showRenderError(item, element, errorMessage);
    }
    async _doRender(item, element, renderer, signal) {
      try {
        await renderer.renderOutputItem(item, element, signal);
        return { continue: false };
      } catch (e) {
        if (signal.aborted) {
          return { continue: false };
        }
        if (e instanceof Error && e.name === renderFallbackErrorName) {
          return { continue: true };
        } else {
          throw e;
        }
      }
    }
    findRenderer(preferredRendererId, info) {
      let renderer;
      if (typeof preferredRendererId === "string") {
        renderer = Array.from(this._renderers.values()).find((renderer2) => renderer2.data.id === preferredRendererId);
      } else {
        const renderers2 = Array.from(this._renderers.values()).filter((renderer2) => renderer2.data.mimeTypes.includes(info.mime) && !renderer2.data.entrypoint.extends);
        if (renderers2.length) {
          renderers2.sort((a, b) => +a.data.isBuiltin - +b.data.isBuiltin);
          renderer = renderers2[0];
        }
      }
      return renderer;
    }
    showRenderError(info, element, errorMessage) {
      const errorContainer = document.createElement("div");
      const error = document.createElement("div");
      error.className = "no-renderer-error";
      error.innerText = errorMessage;
      const cellText = document.createElement("div");
      cellText.innerText = info.text();
      errorContainer.appendChild(error);
      errorContainer.appendChild(cellText);
      element.innerText = "";
      element.appendChild(errorContainer);
    }
  }();
  const viewModel = new class ViewModel {
    constructor() {
      this._markupCells = /* @__PURE__ */ new Map();
      this._outputCells = /* @__PURE__ */ new Map();
    }
    clearAll() {
      for (const cell of this._markupCells.values()) {
        cell.dispose();
      }
      this._markupCells.clear();
      for (const output of this._outputCells.values()) {
        output.dispose();
      }
      this._outputCells.clear();
    }
    async createMarkupCell(init, top2, visible) {
      const existing = this._markupCells.get(init.cellId);
      if (existing) {
        console.error(`Trying to create markup that already exists: ${init.cellId}`);
        return existing;
      }
      const cell = new MarkupCell2(init.cellId, init.mime, init.content, top2, init.metadata);
      cell.element.style.visibility = visible ? "" : "hidden";
      this._markupCells.set(init.cellId, cell);
      await cell.ready;
      return cell;
    }
    async ensureMarkupCell(info) {
      let cell = this._markupCells.get(info.cellId);
      if (cell) {
        cell.element.style.visibility = info.visible ? "" : "hidden";
        await cell.updateContentAndRender(info.content, info.metadata);
      } else {
        cell = await this.createMarkupCell(info, info.offset, info.visible);
      }
    }
    deleteMarkupCell(id2) {
      const cell = this.getExpectedMarkupCell(id2);
      if (cell) {
        cell.remove();
        cell.dispose();
        this._markupCells.delete(id2);
      }
    }
    async updateMarkupContent(id2, newContent, metadata) {
      const cell = this.getExpectedMarkupCell(id2);
      await cell?.updateContentAndRender(newContent, metadata);
    }
    showMarkupCell(id2, top2, newContent, metadata) {
      const cell = this.getExpectedMarkupCell(id2);
      cell?.show(top2, newContent, metadata);
    }
    hideMarkupCell(id2) {
      const cell = this.getExpectedMarkupCell(id2);
      cell?.hide();
    }
    unhideMarkupCell(id2) {
      const cell = this.getExpectedMarkupCell(id2);
      cell?.unhide();
    }
    getExpectedMarkupCell(id2) {
      const cell = this._markupCells.get(id2);
      if (!cell) {
        console.log(`Could not find markup cell '${id2}'`);
        return void 0;
      }
      return cell;
    }
    updateSelectedCells(selectedCellIds) {
      const selectedCellSet = new Set(selectedCellIds);
      for (const cell of this._markupCells.values()) {
        cell.setSelected(selectedCellSet.has(cell.id));
      }
    }
    toggleDragDropEnabled(dragAndDropEnabled) {
      for (const cell of this._markupCells.values()) {
        cell.toggleDragDropEnabled(dragAndDropEnabled);
      }
    }
    updateMarkupScrolls(markupCells) {
      for (const { id: id2, top: top2 } of markupCells) {
        const cell = this._markupCells.get(id2);
        if (cell) {
          cell.element.style.top = `${top2}px`;
        }
      }
    }
    async renderOutputCell(data, signal) {
      const preloadErrors = await Promise.all(
        data.requiredPreloads.map((p) => kernelPreloads.waitFor(p.uri).then(() => void 0, (err) => err))
      );
      if (signal.aborted) {
        return;
      }
      const cellOutput = this.ensureOutputCell(data.cellId, data.cellTop, false);
      return cellOutput.renderOutputElement(data, preloadErrors, signal);
    }
    ensureOutputCell(cellId, cellTop, skipCellTopUpdateIfExist) {
      let cell = this._outputCells.get(cellId);
      const existed = !!cell;
      if (!cell) {
        cell = new OutputCell(cellId);
        this._outputCells.set(cellId, cell);
      }
      if (existed && skipCellTopUpdateIfExist) {
        return cell;
      }
      cell.element.style.top = cellTop + "px";
      return cell;
    }
    clearOutput(cellId, outputId, rendererId) {
      const cell = this._outputCells.get(cellId);
      cell?.clearOutput(outputId, rendererId);
    }
    showOutput(cellId, outputId, top2) {
      const cell = this._outputCells.get(cellId);
      cell?.show(outputId, top2);
    }
    updateAndRerender(cellId, outputId, content2) {
      const cell = this._outputCells.get(cellId);
      cell?.updateContentAndRerender(outputId, content2);
    }
    hideOutput(cellId) {
      const cell = this._outputCells.get(cellId);
      cell?.hide();
    }
    updateOutputHeight(cellId, outputId, height) {
      const cell = this._outputCells.get(cellId);
      cell?.updateOutputHeight(outputId, height);
    }
    updateOutputsScroll(updates) {
      for (const request2 of updates) {
        const cell = this._outputCells.get(request2.cellId);
        cell?.updateScroll(request2);
      }
    }
  }();
  class MarkdownCodeBlock {
    static {
      this.pendingCodeBlocksToHighlight = /* @__PURE__ */ new Map();
    }
    static highlightCodeBlock(id2, html3) {
      const el = MarkdownCodeBlock.pendingCodeBlocksToHighlight.get(id2);
      if (!el) {
        return;
      }
      const trustedHtml = ttPolicy8?.createHTML(html3) ?? html3;
      el.innerHTML = trustedHtml;
      const root = el.getRootNode();
      if (root instanceof ShadowRoot) {
        if (!root.adoptedStyleSheets.includes(tokenizationStyle)) {
          root.adoptedStyleSheets.push(tokenizationStyle);
        }
      }
    }
    static requestHighlightCodeBlock(root) {
      const codeBlocks = [];
      let i2 = 0;
      for (const el of root.querySelectorAll(".vscode-code-block")) {
        const lang = el.getAttribute("data-vscode-code-block-lang");
        if (el.textContent && lang) {
          const id2 = `${Date.now()}-${i2++}`;
          codeBlocks.push({ value: el.textContent, lang, id: id2 });
          MarkdownCodeBlock.pendingCodeBlocksToHighlight.set(id2, el);
        }
      }
      return codeBlocks;
    }
  }
  class MarkupCell2 {
    constructor(id2, mime, content2, top2, metadata) {
      this._isDisposed = false;
      const self2 = this;
      this.id = id2;
      this._content = { value: content2, version: 0, metadata };
      const { promise, resolve: resolve3, reject } = promiseWithResolvers2();
      this.ready = promise;
      let cachedData;
      this.outputItem = Object.freeze({
        id: id2,
        mime,
        get metadata() {
          return self2._content.metadata;
        },
        text: () => {
          return this._content.value;
        },
        json: () => {
          return void 0;
        },
        data: () => {
          if (cachedData?.version === this._content.version) {
            return cachedData.value;
          }
          const data = textEncoder3.encode(this._content.value);
          cachedData = { version: this._content.version, value: data };
          return data;
        },
        blob() {
          return new Blob([this.data()], { type: this.mime });
        },
        _allOutputItems: [{
          mime,
          getItem: async () => this.outputItem
        }]
      });
      const root = window.document.getElementById("container");
      const markupCell = document.createElement("div");
      markupCell.className = "markup";
      markupCell.style.position = "absolute";
      markupCell.style.width = "100%";
      this.element = document.createElement("div");
      this.element.id = this.id;
      this.element.classList.add("preview");
      this.element.style.position = "absolute";
      this.element.style.top = top2 + "px";
      this.toggleDragDropEnabled(currentOptions.dragAndDropEnabled);
      markupCell.appendChild(this.element);
      root.appendChild(markupCell);
      this.addEventListeners();
      this.updateContentAndRender(this._content.value, this._content.metadata).then(() => {
        if (!this._isDisposed) {
          resizeObserver.observe(this.element, this.id, false, this.id);
        }
        resolve3();
      }, () => reject());
    }
    dispose() {
      this._isDisposed = true;
      this.renderTaskAbort?.abort();
      this.renderTaskAbort = void 0;
    }
    addEventListeners() {
      this.element.addEventListener("dblclick", () => {
        postNotebookMessage("toggleMarkupPreview", { cellId: this.id });
      });
      this.element.addEventListener("click", (e) => {
        postNotebookMessage("clickMarkupCell", {
          cellId: this.id,
          altKey: e.altKey,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
          shiftKey: e.shiftKey
        });
      });
      this.element.addEventListener("contextmenu", (e) => {
        postNotebookMessage("contextMenuMarkupCell", {
          cellId: this.id,
          clientX: e.clientX,
          clientY: e.clientY
        });
      });
      this.element.addEventListener("mouseenter", () => {
        postNotebookMessage("mouseEnterMarkupCell", { cellId: this.id });
      });
      this.element.addEventListener("mouseleave", () => {
        postNotebookMessage("mouseLeaveMarkupCell", { cellId: this.id });
      });
      this.element.addEventListener("dragstart", (e) => {
        markupCellDragManager.startDrag(e, this.id);
      });
      this.element.addEventListener("drag", (e) => {
        markupCellDragManager.updateDrag(e, this.id);
      });
      this.element.addEventListener("dragend", (e) => {
        markupCellDragManager.endDrag(e, this.id);
      });
    }
    async updateContentAndRender(newContent, metadata) {
      this._content = { value: newContent, version: this._content.version + 1, metadata };
      this.renderTaskAbort?.abort();
      const controller = new AbortController();
      this.renderTaskAbort = controller;
      try {
        await renderers.render(this.outputItem, void 0, this.element, this.renderTaskAbort.signal);
      } finally {
        if (this.renderTaskAbort === controller) {
          this.renderTaskAbort = void 0;
        }
      }
      const root = this.element.shadowRoot ?? this.element;
      const html3 = [];
      for (const child of root.children) {
        switch (child.tagName) {
          case "LINK":
          case "SCRIPT":
          case "STYLE":
            break;
          default:
            html3.push(child.outerHTML);
            break;
        }
      }
      const codeBlocks = MarkdownCodeBlock.requestHighlightCodeBlock(root);
      postNotebookMessage("renderedMarkup", {
        cellId: this.id,
        html: html3.join(""),
        codeBlocks
      });
      dimensionUpdater.updateHeight(this.id, this.element.offsetHeight, {
        isOutput: false
      });
    }
    show(top2, newContent, metadata) {
      this.element.style.visibility = "";
      this.element.style.top = `${top2}px`;
      if (typeof newContent === "string" || metadata) {
        this.updateContentAndRender(newContent ?? this._content.value, metadata ?? this._content.metadata);
      } else {
        this.updateMarkupDimensions();
      }
    }
    hide() {
      this.element.style.visibility = "hidden";
    }
    unhide() {
      this.element.style.visibility = "";
      this.updateMarkupDimensions();
    }
    remove() {
      this.element.remove();
    }
    async updateMarkupDimensions() {
      dimensionUpdater.updateHeight(this.id, this.element.offsetHeight, {
        isOutput: false
      });
    }
    setSelected(selected) {
      this.element.classList.toggle("selected", selected);
    }
    toggleDragDropEnabled(enabled) {
      if (enabled) {
        this.element.classList.add("draggable");
        this.element.setAttribute("draggable", "true");
      } else {
        this.element.classList.remove("draggable");
        this.element.removeAttribute("draggable");
      }
    }
  }
  class OutputCell {
    constructor(cellId) {
      this.outputElements = /* @__PURE__ */ new Map();
      const container3 = window.document.getElementById("container");
      const upperWrapperElement = createFocusSink(cellId);
      container3.appendChild(upperWrapperElement);
      this.element = document.createElement("div");
      this.element.style.position = "absolute";
      this.element.style.outline = "0";
      this.element.id = cellId;
      this.element.classList.add("cell_container");
      container3.appendChild(this.element);
      this.element = this.element;
      const lowerWrapperElement = createFocusSink(cellId, true);
      container3.appendChild(lowerWrapperElement);
    }
    dispose() {
      for (const output of this.outputElements.values()) {
        output.dispose();
      }
      this.outputElements.clear();
    }
    createOutputElement(data) {
      let outputContainer = this.outputElements.get(data.outputId);
      if (!outputContainer) {
        outputContainer = new OutputContainer2(data.outputId);
        this.element.appendChild(outputContainer.element);
        this.outputElements.set(data.outputId, outputContainer);
      }
      return outputContainer.createOutputElement(data.outputId, data.outputOffset, data.left, data.cellId);
    }
    async renderOutputElement(data, preloadErrors, signal) {
      const startTime = Date.now();
      const outputElement = this.createOutputElement(data);
      await outputElement.render(data.content, data.rendererId, preloadErrors, signal);
      outputElement.element.style.visibility = data.initiallyHidden ? "hidden" : "";
      if (!!data.executionId && !!data.rendererId) {
        let outputSize = void 0;
        if (data.content.type === 1) {
          outputSize = data.content.output.valueBytes.length;
        }
        if (outputSize !== void 0 && outputSize > 0 && outputSize < 100 * 1024) {
          postNotebookMessage("notebookPerformanceMessage", {
            cellId: data.cellId,
            executionId: data.executionId,
            duration: Date.now() - startTime,
            rendererId: data.rendererId,
            outputSize
          });
        }
      }
    }
    clearOutput(outputId, rendererId) {
      const output = this.outputElements.get(outputId);
      output?.clear(rendererId);
      output?.dispose();
      this.outputElements.delete(outputId);
    }
    show(outputId, top2) {
      const outputContainer = this.outputElements.get(outputId);
      if (!outputContainer) {
        return;
      }
      this.element.style.visibility = "";
      this.element.style.top = `${top2}px`;
    }
    hide() {
      this.element.style.visibility = "hidden";
    }
    updateContentAndRerender(outputId, content2) {
      this.outputElements.get(outputId)?.updateContentAndRender(content2);
    }
    updateOutputHeight(outputId, height) {
      this.outputElements.get(outputId)?.updateHeight(height);
    }
    updateScroll(request2) {
      this.element.style.top = `${request2.cellTop}px`;
      const outputElement = this.outputElements.get(request2.outputId);
      if (outputElement) {
        outputElement.updateScroll(request2.outputOffset);
        if (request2.forceDisplay && outputElement.outputNode) {
          outputElement.outputNode.element.style.visibility = "";
        }
      }
      if (request2.forceDisplay) {
        this.element.style.visibility = "";
      }
    }
  }
  class OutputContainer2 {
    constructor(outputId) {
      this.outputId = outputId;
      this.element = document.createElement("div");
      this.element.classList.add("output_container");
      this.element.setAttribute("data-vscode-context", JSON.stringify({ "preventDefaultContextMenuItems": true }));
      this.element.style.position = "absolute";
      this.element.style.overflow = "hidden";
    }
    get outputNode() {
      return this._outputNode;
    }
    dispose() {
      this._outputNode?.dispose();
    }
    clear(rendererId) {
      if (rendererId) {
        renderers.clearOutput(rendererId, this.outputId);
      }
      this.element.remove();
    }
    updateHeight(height) {
      this.element.style.maxHeight = `${height}px`;
      this.element.style.height = `${height}px`;
    }
    updateScroll(outputOffset) {
      this.element.style.top = `${outputOffset}px`;
    }
    createOutputElement(outputId, outputOffset, left, cellId) {
      this.element.innerText = "";
      this.element.style.maxHeight = "0px";
      this.element.style.top = `${outputOffset}px`;
      this._outputNode?.dispose();
      this._outputNode = new OutputElement2(outputId, left, cellId);
      this.element.appendChild(this._outputNode.element);
      return this._outputNode;
    }
    updateContentAndRender(content2) {
      this._outputNode?.updateAndRerender(content2);
    }
  }
  vscode.postMessage({
    __vscode_notebook_message: true,
    type: "initialized"
  });
  for (const preload of ctx.staticPreloadsData) {
    kernelPreloads.load(preload.entrypoint);
  }
  function postNotebookMessage(type, properties) {
    vscode.postMessage({
      __vscode_notebook_message: true,
      type,
      ...properties
    });
  }
  class OutputElement2 {
    constructor(outputId, left, cellId) {
      this.outputId = outputId;
      this.cellId = cellId;
      this.hasResizeObserver = false;
      this.isImageOutput = false;
      this.element = document.createElement("div");
      this.element.id = outputId;
      this.element.classList.add("output");
      this.element.style.position = "absolute";
      this.element.style.top = `0px`;
      this.element.style.left = left + "px";
      this.element.style.padding = `${ctx.style.outputNodePadding}px ${ctx.style.outputNodePadding}px ${ctx.style.outputNodePadding}px ${ctx.style.outputNodeLeftPadding}`;
      this.element.addEventListener("mouseenter", () => {
        postNotebookMessage("mouseenter", { id: outputId });
      });
      this.element.addEventListener("mouseleave", () => {
        postNotebookMessage("mouseleave", { id: outputId });
      });
      this.element.addEventListener("dragstart", (e) => {
        if (!e.dataTransfer) {
          return;
        }
        const outputData = {
          outputId: this.outputId
        };
        e.dataTransfer.setData("notebook-cell-output", JSON.stringify(outputData));
      });
      window.addEventListener("keydown", (e) => {
        if (e.altKey) {
          this.element.draggable = true;
        }
      });
      window.addEventListener("keyup", (e) => {
        if (!e.altKey) {
          this.element.draggable = this.isImageOutput;
        }
      });
      window.addEventListener("blur", () => {
        this.element.draggable = this.isImageOutput;
      });
    }
    dispose() {
      this.renderTaskAbort?.abort();
      this.renderTaskAbort = void 0;
    }
    async render(content2, preferredRendererId, preloadErrors, signal) {
      this.renderTaskAbort?.abort();
      this.renderTaskAbort = void 0;
      this._content = { preferredRendererId, preloadErrors };
      if (content2.type === 0) {
        const trustedHtml = ttPolicy8?.createHTML(content2.htmlContent) ?? content2.htmlContent;
        this.element.innerHTML = trustedHtml;
      } else if (preloadErrors.some((e) => e instanceof Error)) {
        const errors = preloadErrors.filter((e) => e instanceof Error);
        showRenderError(`Error loading preloads`, this.element, errors);
      } else {
        const imageMimeTypes = ["image/png", "image/jpeg", "image/svg"];
        this.isImageOutput = imageMimeTypes.includes(content2.output.mime);
        this.element.draggable = this.isImageOutput;
        const item = createOutputItem(this.outputId, content2.output.mime, content2.metadata, content2.output.valueBytes, content2.allOutputs, content2.output.appended);
        const controller = new AbortController();
        this.renderTaskAbort = controller;
        signal?.addEventListener("abort", () => controller.abort());
        try {
          await renderers.render(item, preferredRendererId, this.element, controller.signal);
        } finally {
          if (this.renderTaskAbort === controller) {
            this.renderTaskAbort = void 0;
          }
        }
      }
      if (!this.hasResizeObserver) {
        this.hasResizeObserver = true;
        resizeObserver.observe(this.element, this.outputId, true, this.cellId);
      }
      const offsetHeight = this.element.offsetHeight;
      const cps = document.defaultView.getComputedStyle(this.element);
      const verticalPadding = parseFloat(cps.paddingTop) + parseFloat(cps.paddingBottom);
      const contentHeight = offsetHeight - verticalPadding;
      if (elementHasContent(contentHeight) && cps.padding === "0px") {
        dimensionUpdater.updateHeight(this.outputId, offsetHeight + ctx.style.outputNodePadding * 2, {
          isOutput: true,
          init: true
        });
        this.element.style.padding = `${ctx.style.outputNodePadding}px ${ctx.style.outputNodePadding}px ${ctx.style.outputNodePadding}px ${ctx.style.outputNodeLeftPadding}`;
      } else if (elementHasContent(contentHeight)) {
        dimensionUpdater.updateHeight(this.outputId, this.element.offsetHeight, {
          isOutput: true,
          init: true
        });
        this.element.style.padding = `0 ${ctx.style.outputNodePadding}px 0 ${ctx.style.outputNodeLeftPadding}`;
      } else {
        dimensionUpdater.updateHeight(this.outputId, 0, {
          isOutput: true,
          init: true
        });
      }
      const root = this.element.shadowRoot ?? this.element;
      const codeBlocks = MarkdownCodeBlock.requestHighlightCodeBlock(root);
      if (codeBlocks.length > 0) {
        postNotebookMessage("renderedCellOutput", {
          codeBlocks
        });
      }
    }
    updateAndRerender(content2) {
      if (this._content) {
        this.render(content2, this._content.preferredRendererId, this._content.preloadErrors);
      }
    }
  }
  const markupCellDragManager = new class MarkupCellDragManager {
    constructor() {
      window.document.addEventListener("dragover", (e) => {
        e.preventDefault();
      });
      window.document.addEventListener("drop", (e) => {
        e.preventDefault();
        const drag = this.currentDrag;
        if (!drag) {
          return;
        }
        this.currentDrag = void 0;
        postNotebookMessage("cell-drop", {
          cellId: drag.cellId,
          ctrlKey: e.ctrlKey,
          altKey: e.altKey,
          dragOffsetY: e.clientY
        });
      });
    }
    startDrag(e, cellId) {
      if (!e.dataTransfer) {
        return;
      }
      if (!currentOptions.dragAndDropEnabled) {
        return;
      }
      this.currentDrag = { cellId, clientY: e.clientY };
      const overlayZIndex = 9999;
      if (!this.dragOverlay) {
        this.dragOverlay = document.createElement("div");
        this.dragOverlay.style.position = "absolute";
        this.dragOverlay.style.top = "0";
        this.dragOverlay.style.left = "0";
        this.dragOverlay.style.zIndex = `${overlayZIndex}`;
        this.dragOverlay.style.width = "100%";
        this.dragOverlay.style.height = "100%";
        this.dragOverlay.style.background = "transparent";
        window.document.body.appendChild(this.dragOverlay);
      }
      e.target.style.zIndex = `${overlayZIndex + 1}`;
      e.target.classList.add("dragging");
      postNotebookMessage("cell-drag-start", {
        cellId,
        dragOffsetY: e.clientY
      });
      const trySendDragUpdate = () => {
        if (this.currentDrag?.cellId !== cellId) {
          return;
        }
        postNotebookMessage("cell-drag", {
          cellId,
          dragOffsetY: this.currentDrag.clientY
        });
        window.requestAnimationFrame(trySendDragUpdate);
      };
      window.requestAnimationFrame(trySendDragUpdate);
    }
    updateDrag(e, cellId) {
      if (cellId !== this.currentDrag?.cellId) {
        this.currentDrag = void 0;
      } else {
        this.currentDrag = { cellId, clientY: e.clientY };
      }
    }
    endDrag(e, cellId) {
      this.currentDrag = void 0;
      e.target.classList.remove("dragging");
      postNotebookMessage("cell-drag-end", {
        cellId
      });
      if (this.dragOverlay) {
        this.dragOverlay.remove();
        this.dragOverlay = void 0;
      }
      e.target.style.zIndex = "";
    }
  }();
}

function preloadsScriptStr(styleValues, options3, renderOptions, renderers, preloads, isWorkspaceTrusted, nonce) {
  const ctx = {
    style: styleValues,
    options: options3,
    renderOptions,
    rendererData: renderers,
    staticPreloadsData: preloads,
    isWorkspaceTrusted,
    nonce
  };
  return `
		const __import = (x) => import(x);
		(${webviewPreloads})(
			JSON.parse(decodeURIComponent("${encodeURIComponent(JSON.stringify(ctx))}"))
		)
//# sourceURL=notebookWebviewPreloads.js
`;
}
export { webviewPreloads, preloadsScriptStr };
