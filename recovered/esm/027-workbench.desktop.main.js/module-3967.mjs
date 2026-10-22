// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/extensions/electron-browser/extensionHostProfiler.ts
import { createSingleCallFunction } from "./module-0005.mjs";
import { TernarySearchTree } from "./module-0268.mjs";
import { Schemas } from "./module-0033.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IV8InspectProfilingService } from "./module-3886.mjs";


// src/vs/workbench/services/extensions/electron-browser/extensionHostProfiler.ts
var ExtensionHostProfiler = class {
  constructor(_host, _port, _extensionService, _profilingService) {
    this._host = _host;
    this._port = _port;
    this._extensionService = _extensionService;
    this._profilingService = _profilingService;
  }
  async start() {
    const id2 = await this._profilingService.startProfiling({ host: this._host, port: this._port });
    return {
      stop: createSingleCallFunction(async () => {
        const profile = await this._profilingService.stopProfiling(id2);
        await this._extensionService.whenInstalledExtensionsRegistered();
        const extensions = this._extensionService.extensions;
        return this._distill(profile, extensions);
      })
    };
  }
  _distill(profile, extensions) {
    const searchTree = TernarySearchTree.forUris();
    for (const extension of extensions) {
      if (extension.extensionLocation.scheme === Schemas.file) {
        searchTree.set(URI.file(extension.extensionLocation.fsPath), extension);
      }
    }
    const nodes = profile.nodes;
    const idsToNodes = /* @__PURE__ */ new Map();
    const idsToSegmentId = /* @__PURE__ */ new Map();
    for (const node of nodes) {
      idsToNodes.set(node.id, node);
    }
    function visit2(node, segmentId) {
      if (!segmentId) {
        switch (node.callFrame.functionName) {
          case "(root)":
            break;
          case "(program)":
            segmentId = "program";
            break;
          case "(garbage collector)":
            segmentId = "gc";
            break;
          default:
            segmentId = "self";
            break;
        }
      } else if (segmentId === "self" && node.callFrame.url) {
        let extension;
        try {
          extension = searchTree.findSubstr(URI.parse(node.callFrame.url));
        } catch {
        }
        if (extension) {
          segmentId = extension.identifier.value;
        }
      }
      idsToSegmentId.set(node.id, segmentId);
      if (node.children) {
        for (const child of node.children) {
          const childNode = idsToNodes.get(child);
          if (childNode) {
            visit2(childNode, segmentId);
          }
        }
      }
    }
    visit2(nodes[0], null);
    const samples = profile.samples || [];
    const timeDeltas = profile.timeDeltas || [];
    const distilledDeltas = [];
    const distilledIds = [];
    let currSegmentTime = 0;
    let currSegmentId;
    for (let i2 = 0; i2 < samples.length; i2++) {
      const id2 = samples[i2];
      const segmentId = idsToSegmentId.get(id2);
      if (segmentId !== currSegmentId) {
        if (currSegmentId) {
          distilledIds.push(currSegmentId);
          distilledDeltas.push(currSegmentTime);
        }
        currSegmentId = segmentId ?? void 0;
        currSegmentTime = 0;
      }
      currSegmentTime += timeDeltas[i2];
    }
    if (currSegmentId) {
      distilledIds.push(currSegmentId);
      distilledDeltas.push(currSegmentTime);
    }
    return {
      startTime: profile.startTime,
      endTime: profile.endTime,
      deltas: distilledDeltas,
      ids: distilledIds,
      data: profile,
      getAggregatedTimes: () => {
        const segmentsToTime = /* @__PURE__ */ new Map();
        for (let i2 = 0; i2 < distilledIds.length; i2++) {
          const id2 = distilledIds[i2];
          segmentsToTime.set(id2, (segmentsToTime.get(id2) || 0) + distilledDeltas[i2]);
        }
        return segmentsToTime;
      }
    };
  }
};

ExtensionHostProfiler = __decorateClass([
  __decorateParam(2, IExtensionService),
  __decorateParam(3, IV8InspectProfilingService)
], ExtensionHostProfiler);
export { ExtensionHostProfiler };
