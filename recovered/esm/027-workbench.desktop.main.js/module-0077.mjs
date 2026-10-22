// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/instantiation/common/instantiation.ts



// src/vs/platform/instantiation/common/instantiation.ts
var _util;

((_util2) => {
  _util2.serviceIds = /* @__PURE__ */ new Map();
  _util2.DI_TARGET = "$di$target";
  _util2.DI_DEPENDENCIES = "$di$dependencies";
  function getServiceDependencies(ctor) {
    return ctor[_util2.DI_DEPENDENCIES] || [];
  }
  _util2.getServiceDependencies = getServiceDependencies;
})(_util || (_util = {}));

var IInstantiationService = createDecorator("instantiationService");

function storeServiceDependency(id2, target, index2) {
  if (target[_util.DI_TARGET] === target) {
    target[_util.DI_DEPENDENCIES].push({ id: id2, index: index2 });
  } else {
    target[_util.DI_DEPENDENCIES] = [{ id: id2, index: index2 }];
    target[_util.DI_TARGET] = target;
  }
}

function createDecorator(serviceId) {
  if (_util.serviceIds.has(serviceId)) {
    return _util.serviceIds.get(serviceId);
  }
  const id2 = function(target, key3, index2) {
    if (arguments.length !== 3) {
      throw new Error("@IServiceName-decorator can only be used to decorate a parameter");
    }
    storeServiceDependency(id2, target, index2);
  };
  id2.toString = () => serviceId;
  _util.serviceIds.set(serviceId, id2);
  return id2;
}

function refineServiceDecorator(serviceIdentifier) {
  return serviceIdentifier;
}
export { storeServiceDependency, createDecorator, refineServiceDecorator, _util, IInstantiationService };
