// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/cli.js
// Original module marker: src/bootstrap-meta.ts



// src/bootstrap-meta.ts
import { createRequire as createRequire2 } from "node:module";

var require3 = createRequire2(import.meta.url);

var productObj = { BUILD_INSERT_PRODUCT_CONFIGURATION: "BUILD_INSERT_PRODUCT_CONFIGURATION" };

if (productObj["BUILD_INSERT_PRODUCT_CONFIGURATION"]) {
  productObj = require3("../product.json");
}

var pkgObj = { BUILD_INSERT_PACKAGE_CONFIGURATION: "BUILD_INSERT_PACKAGE_CONFIGURATION" };

if (pkgObj["BUILD_INSERT_PACKAGE_CONFIGURATION"]) {
  pkgObj = require3("../package.json");
}

var productOverridesObj = {};

if (process.env["VSCODE_DEV"]) {
  try {
    productOverridesObj = require3("../product.overrides.json");
    productObj = Object.assign(productObj, productOverridesObj);
  } catch (error) {
  }
}

var product = productObj;

var pkg = pkgObj;
export { createRequire2, require3, productObj, pkgObj, productOverridesObj, product, pkg };
