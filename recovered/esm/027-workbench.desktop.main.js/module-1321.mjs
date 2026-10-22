// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/comments/browser/commentsModel.ts
import { isMarkdownString } from "./module-0462.mjs";
import { Disposable } from "./module-0012.mjs";
import { ResourceWithCommentThreads } from "./module-1320.mjs";
import { URI } from "./module-0032.mjs";
import { localize } from "./module-0001.mjs";
import { groupBy2 } from "./module-0007.mjs";


// src/vs/workbench/contrib/comments/browser/commentsModel.ts
function threadHasMeaningfulComments(thread) {
  return !!thread.comments && !!thread.comments.length && thread.comments.some((comment) => isMarkdownString(comment.body) ? comment.body.value.length > 0 : comment.body.length > 0);
}

var CommentsModel = class _CommentsModel extends Disposable {
  get resourceCommentThreads() {
    return this._resourceCommentThreads;
  }
  constructor() {
    super();
    this._resourceCommentThreads = [];
    this.commentThreadsMap = /* @__PURE__ */ new Map();
  }
  updateResourceCommentThreads() {
    const includeLabel = this.commentThreadsMap.size > 1;
    this._resourceCommentThreads = [...this.commentThreadsMap.values()].map((value2) => {
      return value2.resourceWithCommentThreads.map((resource) => {
        resource.ownerLabel = includeLabel ? value2.ownerLabel : void 0;
        return resource;
      }).flat();
    }).flat();
  }
  setCommentThreads(uniqueOwner, owner, ownerLabel, commentThreads) {
    this.commentThreadsMap.set(uniqueOwner, { ownerLabel, resourceWithCommentThreads: this.groupByResource(uniqueOwner, owner, commentThreads) });
    this.updateResourceCommentThreads();
  }
  deleteCommentsByOwner(uniqueOwner) {
    if (uniqueOwner) {
      const existingOwner = this.commentThreadsMap.get(uniqueOwner);
      this.commentThreadsMap.set(uniqueOwner, { ownerLabel: existingOwner?.ownerLabel, resourceWithCommentThreads: [] });
    } else {
      this.commentThreadsMap.clear();
    }
    this.updateResourceCommentThreads();
  }
  updateCommentThreads(event) {
    const { uniqueOwner, owner, ownerLabel, removed, changed, added } = event;
    const threadsForOwner = this.commentThreadsMap.get(uniqueOwner)?.resourceWithCommentThreads || [];
    removed.forEach((thread) => {
      const matchingResourceIndex = threadsForOwner.findIndex((resourceData) => resourceData.id === thread.resource);
      const matchingResourceData = matchingResourceIndex >= 0 ? threadsForOwner[matchingResourceIndex] : void 0;
      const index2 = matchingResourceData?.commentThreads.findIndex((commentThread) => commentThread.threadId === thread.threadId) ?? 0;
      if (index2 >= 0) {
        matchingResourceData?.commentThreads.splice(index2, 1);
      }
      if (matchingResourceData?.commentThreads.length === 0) {
        threadsForOwner.splice(matchingResourceIndex, 1);
      }
    });
    changed.forEach((thread) => {
      const matchingResourceIndex = threadsForOwner.findIndex((resourceData) => resourceData.id === thread.resource);
      const matchingResourceData = matchingResourceIndex >= 0 ? threadsForOwner[matchingResourceIndex] : void 0;
      if (!matchingResourceData) {
        return;
      }
      const index2 = matchingResourceData.commentThreads.findIndex((commentThread) => commentThread.threadId === thread.threadId);
      if (index2 >= 0) {
        matchingResourceData.commentThreads[index2] = ResourceWithCommentThreads.createCommentNode(uniqueOwner, owner, URI.parse(matchingResourceData.id), thread);
      } else if (thread.comments && thread.comments.length) {
        matchingResourceData.commentThreads.push(ResourceWithCommentThreads.createCommentNode(uniqueOwner, owner, URI.parse(matchingResourceData.id), thread));
      }
    });
    added.forEach((thread) => {
      const existingResource = threadsForOwner.filter((resourceWithThreads) => resourceWithThreads.resource.toString() === thread.resource);
      if (existingResource.length) {
        const resource = existingResource[0];
        if (thread.comments && thread.comments.length) {
          resource.commentThreads.push(ResourceWithCommentThreads.createCommentNode(uniqueOwner, owner, resource.resource, thread));
        }
      } else {
        threadsForOwner.push(new ResourceWithCommentThreads(uniqueOwner, owner, URI.parse(thread.resource), [thread]));
      }
    });
    this.commentThreadsMap.set(uniqueOwner, { ownerLabel, resourceWithCommentThreads: threadsForOwner });
    this.updateResourceCommentThreads();
    return removed.length > 0 || changed.length > 0 || added.length > 0;
  }
  hasCommentThreads() {
    return !!this._resourceCommentThreads.length && this._resourceCommentThreads.some((resource) => {
      return resource.commentThreads.length > 0 && resource.commentThreads.some((thread) => {
        return threadHasMeaningfulComments(thread.thread);
      });
    });
  }
  getMessage() {
    if (!this._resourceCommentThreads.length) {
      return localize(14008, null);
    } else {
      return "";
    }
  }
  groupByResource(uniqueOwner, owner, commentThreads) {
    const resourceCommentThreads = [];
    const commentThreadsByResource = /* @__PURE__ */ new Map();
    for (const group2 of groupBy2(commentThreads, _CommentsModel._compareURIs)) {
      commentThreadsByResource.set(group2[0].resource, new ResourceWithCommentThreads(uniqueOwner, owner, URI.parse(group2[0].resource), group2));
    }
    commentThreadsByResource.forEach((v2, i2, m) => {
      resourceCommentThreads.push(v2);
    });
    return resourceCommentThreads;
  }
  static _compareURIs(a, b) {
    const resourceA = a.resource.toString();
    const resourceB = b.resource.toString();
    if (resourceA < resourceB) {
      return -1;
    } else if (resourceA > resourceB) {
      return 1;
    } else {
      return 0;
    }
  }
};
export { threadHasMeaningfulComments, CommentsModel };
