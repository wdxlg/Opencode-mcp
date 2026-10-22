// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/iframe.ts



// src/vs/base/browser/iframe.ts
var sameOriginWindowChainCache = /* @__PURE__ */ new WeakMap();

function getParentWindowIfSameOrigin(w) {
  if (!w.parent || w.parent === w) {
    return null;
  }
  try {
    const location2 = w.location;
    const parentLocation = w.parent.location;
    if (location2.origin !== "null" && parentLocation.origin !== "null" && location2.origin !== parentLocation.origin) {
      return null;
    }
  } catch (e4) {
    return null;
  }
  return w.parent;
}

var IframeUtils = class {
  /**
   * Returns a chain of embedded windows with the same origin (which can be accessed programmatically).
   * Having a chain of length 1 might mean that the current execution environment is running outside of an iframe or inside an iframe embedded in a window with a different origin.
   */
  static getSameOriginWindowChain(targetWindow) {
    let windowChainCache = sameOriginWindowChainCache.get(targetWindow);
    if (!windowChainCache) {
      windowChainCache = [];
      sameOriginWindowChainCache.set(targetWindow, windowChainCache);
      let w = targetWindow;
      let parent;
      do {
        parent = getParentWindowIfSameOrigin(w);
        if (parent) {
          windowChainCache.push({
            window: new WeakRef(w),
            iframeElement: w.frameElement || null
          });
        } else {
          windowChainCache.push({
            window: new WeakRef(w),
            iframeElement: null
          });
        }
        w = parent;
      } while (w);
    }
    return windowChainCache.slice(0);
  }
  /**
   * Returns the position of `childWindow` relative to `ancestorWindow`
   */
  static getPositionOfChildWindowRelativeToAncestorWindow(childWindow, ancestorWindow) {
    if (!ancestorWindow || childWindow === ancestorWindow) {
      return {
        top: 0,
        left: 0
      };
    }
    let top2 = 0, left = 0;
    const windowChain = this.getSameOriginWindowChain(childWindow);
    for (const windowChainEl of windowChain) {
      const windowInChain = windowChainEl.window.deref();
      top2 += windowInChain?.scrollY ?? 0;
      left += windowInChain?.scrollX ?? 0;
      if (windowInChain === ancestorWindow) {
        break;
      }
      if (!windowChainEl.iframeElement) {
        break;
      }
      const boundingRect = windowChainEl.iframeElement.getBoundingClientRect();
      top2 += boundingRect.top;
      left += boundingRect.left;
    }
    return {
      top: top2,
      left
    };
  }
};

async function parentOriginHash(parentOrigin, salt) {
  if (!crypto.subtle) {
    throw new Error(`'crypto.subtle' is not available so webviews will not work. This is likely because the editor is not running in a secure context (https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts).`);
  }
  const strData = JSON.stringify({ parentOrigin, salt });
  const encoder2 = new TextEncoder();
  const arrData = encoder2.encode(strData);
  const hash2 = await crypto.subtle.digest("sha-256", arrData);
  return sha256AsBase32(hash2);
}

function sha256AsBase32(bytes) {
  const array3 = Array.from(new Uint8Array(bytes));
  const hexArray = array3.map((b) => b.toString(16).padStart(2, "0")).join("");
  return BigInt(`0x${hexArray}`).toString(32).padStart(52, "0");
}
export { getParentWindowIfSameOrigin, parentOriginHash, sha256AsBase32, sameOriginWindowChainCache, IframeUtils };
