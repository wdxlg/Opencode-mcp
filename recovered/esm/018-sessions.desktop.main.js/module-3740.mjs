// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/changes/browser/changesMultiDiffSourceResolver.ts
import { RawContextKey } from "./module-0089.mjs";
import { isIChatSessionFileChange2 } from "./module-0961.mjs";
import { comparePaths } from "./module-1521.mjs";
import { Disposable } from "./module-0012.mjs";
import { derivedObservableWithCache } from "./module-0059.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { derivedOpts } from "./module-0054.mjs";
import { equals } from "./module-0007.mjs";
import { IMultiDiffSourceResolverService, MultiDiffEditorItem } from "./module-1148.mjs";
import { ValueWithChangeEventFromObservable } from "./module-0063.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChangesViewService } from "./module-3645.mjs";
import { ISessionChangesService } from "./module-3646.mjs";


// src/vs/sessions/contrib/changes/browser/changesMultiDiffSourceResolver.ts
var SessionChangesReviewedFilesContext = new RawContextKey("sessions.changesReviewedFiles", []);

var SessionChangesFileResourceContext = new RawContextKey("sessions.changesFileResource", void 0);

function compareChanges2(a, b) {
  const aPath = isIChatSessionFileChange2(a) ? a.uri.fsPath : a.modifiedUri.fsPath;
  const bPath = isIChatSessionFileChange2(b) ? b.uri.fsPath : b.modifiedUri.fsPath;
  return comparePaths(aPath, bPath);
}

function getChangeResource(change) {
  return isIChatSessionFileChange2(change) ? change.uri : change.modifiedUri;
}

var ChangesMultiDiffSourceResolver = class extends Disposable {
  constructor(changesViewService, multiDiffSourceResolverService, _sessionChangesService) {
    super();
    this.changesViewService = changesViewService;
    this._sessionChangesService = _sessionChangesService;
    this._register(multiDiffSourceResolverService.registerResolver(this));
  }
  canHandleUri(uri4) {
    return this._sessionChangesService.getSessionResource(uri4) !== void 0;
  }
  async resolveDiffSource(uri4) {
    const sessionResource = this._sessionChangesService.getSessionResource(uri4);
    const changesObs = derivedObservableWithCache({
      owner: this
    }, (reader, lastValue) => {
      if (this.changesViewService.activeSessionLoadingObs.read(reader)) {
        return lastValue ?? [];
      }
      const activeSessionResource = this.changesViewService.activeSessionResourceObs.read(reader);
      if (!activeSessionResource || !isEqual2(activeSessionResource, sessionResource)) {
        return lastValue ?? [];
      }
      return this.changesViewService.activeSessionChangesObs.read(reader);
    });
    const resourcesObs = derivedOpts({
      owner: this,
      equalsFn: (a, b) => equals(a, b, (x, y) => isEqual2(x.originalUri, y.originalUri) && isEqual2(x.modifiedUri, y.modifiedUri))
    }, (reader) => {
      const changes = changesObs.read(reader);
      return [...changes].sort(compareChanges2).map((change) => {
        const resource = getChangeResource(change);
        return new MultiDiffEditorItem(change.originalUri, change.modifiedUri, resource, void 0, {
          [SessionChangesFileResourceContext.key]: resource.toString()
        });
      });
    });
    return { resources: new ValueWithChangeEventFromObservable(resourcesObs) };
  }
};

ChangesMultiDiffSourceResolver = __decorateClass([
  __decorateParam(0, IChangesViewService),
  __decorateParam(1, IMultiDiffSourceResolverService),
  __decorateParam(2, ISessionChangesService)
], ChangesMultiDiffSourceResolver);
export { compareChanges2, getChangeResource, SessionChangesReviewedFilesContext, SessionChangesFileResourceContext, ChangesMultiDiffSourceResolver };
