// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/gpu/gpuDisposable.ts
import { isFunction } from "./module-0010.mjs";


// src/vs/editor/browser/gpu/gpuDisposable.ts
var GPULifecycle;

((GPULifecycle2) => {
  async function requestDevice(fallback2) {
    try {
      if (!navigator.gpu) {
        throw new Error("This browser does not support WebGPU");
      }
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        throw new Error("This browser supports WebGPU but it appears to be disabled");
      }
      return wrapDestroyableInDisposable(await adapter.requestDevice());
    } catch (e4) {
      if (fallback2) {
        fallback2(e4.message);
      }
      throw e4;
    }
  }
  GPULifecycle2.requestDevice = requestDevice;
  function createBuffer(device, descriptor, initialValues) {
    const buffer = device.createBuffer(descriptor);
    if (initialValues) {
      device.queue.writeBuffer(buffer, 0, isFunction(initialValues) ? initialValues() : initialValues);
    }
    return wrapDestroyableInDisposable(buffer);
  }
  GPULifecycle2.createBuffer = createBuffer;
  function createTexture(device, descriptor) {
    return wrapDestroyableInDisposable(device.createTexture(descriptor));
  }
  GPULifecycle2.createTexture = createTexture;
})(GPULifecycle || (GPULifecycle = {}));

function wrapDestroyableInDisposable(value2) {
  return {
    object: value2,
    dispose: () => value2.destroy()
  };
}
export { wrapDestroyableInDisposable, GPULifecycle };
