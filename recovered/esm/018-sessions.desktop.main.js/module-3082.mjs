// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalEvents.ts
import { DisposableMap, DisposableStore } from "./module-0012.mjs";
import { DynamicListEventMultiplexer, Event2, EventMultiplexer } from "./module-0017.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalEvents.ts
function createInstanceCapabilityEventMultiplexer(currentInstances, onAddInstance, onRemoveInstance, capabilityId, getEvent) {
  const store = new DisposableStore();
  const multiplexer = store.add(new EventMultiplexer());
  const capabilityListeners = store.add(new DisposableMap());
  function addCapability(instance2, capability) {
    const listener = multiplexer.add(Event2.map(getEvent(capability), (data) => ({ instance: instance2, data })));
    let instanceCapabilityListeners = capabilityListeners.get(instance2.instanceId);
    if (!instanceCapabilityListeners) {
      instanceCapabilityListeners = new DisposableMap();
      capabilityListeners.set(instance2.instanceId, instanceCapabilityListeners);
    }
    instanceCapabilityListeners.set(capability, listener);
  }
  for (const instance2 of currentInstances) {
    const capability = instance2.capabilities.get(capabilityId);
    if (capability) {
      addCapability(instance2, capability);
    }
  }
  store.add(onRemoveInstance((instance2) => {
    capabilityListeners.deleteAndDispose(instance2.instanceId);
  }));
  const addCapabilityMultiplexer = store.add(new DynamicListEventMultiplexer(
    currentInstances,
    onAddInstance,
    onRemoveInstance,
    (instance2) => Event2.map(instance2.capabilities.createOnDidAddCapabilityOfTypeEvent(capabilityId), (changeEvent) => ({ instance: instance2, changeEvent }))
  ));
  store.add(addCapabilityMultiplexer.event((e4) => {
    addCapability(e4.instance, e4.changeEvent);
  }));
  const removeCapabilityMultiplexer = store.add(new DynamicListEventMultiplexer(
    currentInstances,
    onAddInstance,
    onRemoveInstance,
    (instance2) => Event2.map(instance2.capabilities.createOnDidRemoveCapabilityOfTypeEvent(capabilityId), (changeEvent) => ({ instance: instance2, changeEvent }))
  ));
  store.add(removeCapabilityMultiplexer.event((e4) => {
    capabilityListeners.get(e4.instance.instanceId)?.deleteAndDispose(e4.changeEvent);
  }));
  return {
    dispose: () => store.dispose(),
    event: multiplexer.event
  };
}
export { createInstanceCapabilityEventMultiplexer };
