// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/jsonschemas/common/jsonContributionRegistry.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { getCompressedContent } from "./module-0137.mjs";
import { Registry } from "./module-0090.mjs";


// src/vs/platform/jsonschemas/common/jsonContributionRegistry.ts
var Extensions3 = {
  JSONContribution: "base.contributions.json"
};

function normalizeId(id2) {
  if (id2.length > 0 && id2.charAt(id2.length - 1) === "#") {
    return id2.substring(0, id2.length - 1);
  }
  return id2;
}

var JSONContributionRegistry = class extends Disposable {
  constructor() {
    super(...arguments);
    this.schemasById = {};
    this.schemaAssociations = {};
    this._onDidChangeSchema = this._register(new Emitter());
    this.onDidChangeSchema = this._onDidChangeSchema.event;
    this._onDidChangeSchemaAssociations = this._register(new Emitter());
    this.onDidChangeSchemaAssociations = this._onDidChangeSchemaAssociations.event;
  }
  registerSchema(uri4, unresolvedSchemaContent, store) {
    const normalizedUri = normalizeId(uri4);
    this.schemasById[normalizedUri] = unresolvedSchemaContent;
    this._onDidChangeSchema.fire(uri4);
    if (store) {
      store.add(toDisposable(() => {
        delete this.schemasById[normalizedUri];
        this._onDidChangeSchema.fire(uri4);
      }));
    }
  }
  registerSchemaAssociation(uri4, glob) {
    const normalizedUri = normalizeId(uri4);
    if (!this.schemaAssociations[normalizedUri]) {
      this.schemaAssociations[normalizedUri] = [];
    }
    if (!this.schemaAssociations[normalizedUri].includes(glob)) {
      this.schemaAssociations[normalizedUri].push(glob);
      this._onDidChangeSchemaAssociations.fire();
    }
    return toDisposable(() => {
      const associations = this.schemaAssociations[normalizedUri];
      if (associations) {
        const index2 = associations.indexOf(glob);
        if (index2 !== -1) {
          associations.splice(index2, 1);
          if (associations.length === 0) {
            delete this.schemaAssociations[normalizedUri];
          }
          this._onDidChangeSchemaAssociations.fire();
        }
      }
    });
  }
  notifySchemaChanged(uri4) {
    this._onDidChangeSchema.fire(uri4);
  }
  getSchemaContributions() {
    return {
      schemas: this.schemasById
    };
  }
  getSchemaContent(uri4) {
    const schema10 = this.schemasById[uri4];
    return schema10 ? getCompressedContent(schema10) : void 0;
  }
  hasSchemaContent(uri4) {
    return !!this.schemasById[uri4];
  }
  getSchemaAssociations() {
    return this.schemaAssociations;
  }
};

var jsonContributionRegistry = new JSONContributionRegistry();

Registry.add(Extensions3.JSONContribution, jsonContributionRegistry);
export { normalizeId, Extensions3, JSONContributionRegistry, jsonContributionRegistry };
