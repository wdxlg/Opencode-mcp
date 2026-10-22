// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/extensions/common/extHostCustomers.ts



// src/vs/workbench/services/extensions/common/extHostCustomers.ts
function extHostNamedCustomer(id2) {
  return function(ctor) {
    ExtHostCustomersRegistryImpl.INSTANCE.registerNamedCustomer(id2, ctor);
  };
}

function extHostCustomer(ctor) {
  ExtHostCustomersRegistryImpl.INSTANCE.registerCustomer(ctor);
}

var ExtHostCustomersRegistry;

((ExtHostCustomersRegistry2) => {
  function getNamedCustomers() {
    return ExtHostCustomersRegistryImpl.INSTANCE.getNamedCustomers();
  }
  ExtHostCustomersRegistry2.getNamedCustomers = getNamedCustomers;
  function getCustomers() {
    return ExtHostCustomersRegistryImpl.INSTANCE.getCustomers();
  }
  ExtHostCustomersRegistry2.getCustomers = getCustomers;
})(ExtHostCustomersRegistry || (ExtHostCustomersRegistry = {}));

var ExtHostCustomersRegistryImpl = class _ExtHostCustomersRegistryImpl {
  static {
    this.INSTANCE = new _ExtHostCustomersRegistryImpl();
  }
  constructor() {
    this._namedCustomers = [];
    this._customers = [];
  }
  registerNamedCustomer(id2, ctor) {
    const entry = [id2, ctor];
    this._namedCustomers.push(entry);
  }
  getNamedCustomers() {
    return this._namedCustomers;
  }
  registerCustomer(ctor) {
    this._customers.push(ctor);
  }
  getCustomers() {
    return this._customers;
  }
};
export { extHostNamedCustomer, extHostCustomer, ExtHostCustomersRegistry, ExtHostCustomersRegistryImpl };
