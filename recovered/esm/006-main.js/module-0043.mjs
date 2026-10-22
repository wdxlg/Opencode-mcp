// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/jsonschemas/common/jsonContributionRegistry.ts
import { __esm } from "./module-0000.mjs";
import { Emitter, init_event } from "./module-0021.mjs";
import { getCompressedContent, init_jsonSchema } from "./module-0041.mjs";
import { Disposable, init_lifecycle, toDisposable } from "./module-0018.mjs";
import { Registry, init_platform2 } from "./module-0042.mjs";


// src/vs/platform/jsonschemas/common/jsonContributionRegistry.ts
function normalizeId(id2) {
  if (id2.length > 0 && id2.charAt(id2.length - 1) === "#") {
    return id2.substring(0, id2.length - 1);
  }
  return id2;
}

var Extensions, JSONContributionRegistry, jsonContributionRegistry;

var init_jsonContributionRegistry = __esm({
  "src/vs/platform/jsonschemas/common/jsonContributionRegistry.ts"() {
    init_event();
    init_jsonSchema();
    init_lifecycle();
    init_platform2();
    Extensions = {
      JSONContribution: "base.contributions.json"
    };
    JSONContributionRegistry = class extends Disposable {
      constructor() {
        super(...arguments);
        this.schemasById = {};
        this.schemaAssociations = {};
        this._onDidChangeSchema = this._register(new Emitter());
        this.onDidChangeSchema = this._onDidChangeSchema.event;
        this._onDidChangeSchemaAssociations = this._register(new Emitter());
        this.onDidChangeSchemaAssociations = this._onDidChangeSchemaAssociations.event;
      }
      registerSchema(uri, unresolvedSchemaContent, store) {
        const normalizedUri = normalizeId(uri);
        this.schemasById[normalizedUri] = unresolvedSchemaContent;
        this._onDidChangeSchema.fire(uri);
        if (store) {
          store.add(toDisposable(() => {
            delete this.schemasById[normalizedUri];
            this._onDidChangeSchema.fire(uri);
          }));
        }
      }
      registerSchemaAssociation(uri, glob) {
        const normalizedUri = normalizeId(uri);
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
            const index = associations.indexOf(glob);
            if (index !== -1) {
              associations.splice(index, 1);
              if (associations.length === 0) {
                delete this.schemaAssociations[normalizedUri];
              }
              this._onDidChangeSchemaAssociations.fire();
            }
          }
        });
      }
      notifySchemaChanged(uri) {
        this._onDidChangeSchema.fire(uri);
      }
      getSchemaContributions() {
        return {
          schemas: this.schemasById
        };
      }
      getSchemaContent(uri) {
        const schema = this.schemasById[uri];
        return schema ? getCompressedContent(schema) : void 0;
      }
      hasSchemaContent(uri) {
        return !!this.schemasById[uri];
      }
      getSchemaAssociations() {
        return this.schemaAssociations;
      }
    };
    jsonContributionRegistry = new JSONContributionRegistry();
    Registry.add(Extensions.JSONContribution, jsonContributionRegistry);
  }
});
export { normalizeId, Extensions, JSONContributionRegistry, jsonContributionRegistry, init_jsonContributionRegistry };
