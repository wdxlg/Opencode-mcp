// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/timeline/browser/timeline.contribution.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { ITimelineService, TimelinePaneId } from "./module-1423.mjs";
import { TimelinePane } from "./module-3639.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { TimelineHasProviderContext } from "./module-3638.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { Extensions13 } from "./module-1093.mjs";
import { VIEW_CONTAINER2 } from "./module-3090.mjs";
import { URI } from "./module-0032.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { MenuId, MenuRegistry } from "./module-0092.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ExplorerFolderContext } from "./module-1542.mjs";
import { ResourceContextKey } from "./module-0949.mjs";


// src/vs/workbench/contrib/timeline/browser/timeline.contribution.ts
var timelineViewIcon = registerIcon("timeline-view-icon", Codicon.history, localize(21424, null));

var timelineOpenIcon = registerIcon("timeline-open", Codicon.history, localize(21423, null));

var TimelinePaneDescriptor = class {
  constructor() {
    this.id = TimelinePaneId;
    this.name = TimelinePane.TITLE;
    this.containerIcon = timelineViewIcon;
    this.ctorDescriptor = new SyncDescriptor(TimelinePane);
    this.order = 2;
    this.weight = 30;
    this.collapsed = true;
    this.canToggleVisibility = true;
    this.hideByDefault = false;
    this.canMoveView = true;
    this.when = TimelineHasProviderContext;
    this.focusCommand = { id: "timeline.focus" };
  }
};

var configurationRegistry23 = Registry.as(Extensions4.Configuration);

configurationRegistry23.registerConfiguration({
  id: "timeline",
  order: 1001,
  title: localize(21421, null),
  type: "object",
  properties: {
    "timeline.pageSize": {
      type: ["number", "null"],
      default: 50,
      markdownDescription: localize(21420, null)
    },
    "timeline.pageOnScroll": {
      type: "boolean",
      default: true,
      description: localize(21419, null)
    }
  }
});

Registry.as(Extensions13.ViewsRegistry).registerViews([new TimelinePaneDescriptor()], VIEW_CONTAINER2);

var OpenTimelineAction;

((OpenTimelineAction2) => {
  OpenTimelineAction2.ID = "files.openTimeline";
  OpenTimelineAction2.LABEL = localize(21417, null);
  function handler() {
    return (accessor, arg) => {
      const service = accessor.get(ITimelineService);
      if (URI.isUri(arg)) {
        return service.setUri(arg);
      }
    };
  }
  OpenTimelineAction2.handler = handler;
})(OpenTimelineAction || (OpenTimelineAction = {}));

CommandsRegistry.registerCommand(OpenTimelineAction.ID, OpenTimelineAction.handler());

MenuRegistry.appendMenuItem(MenuId.ExplorerContext, {
  group: "4_timeline",
  order: 1,
  command: {
    id: OpenTimelineAction.ID,
    title: OpenTimelineAction.LABEL,
    icon: timelineOpenIcon
  },
  when: ContextKeyExpr.and(ExplorerFolderContext.toNegated(), ResourceContextKey.HasResource, TimelineHasProviderContext)
});

var timelineFilter = registerIcon("timeline-filter", Codicon.filter, localize(21422, null));

MenuRegistry.appendMenuItem(MenuId.TimelineTitle, {
  submenu: MenuId.TimelineFilterSubMenu,
  title: localize(21418, null),
  group: "navigation",
  order: 100,
  icon: timelineFilter
});
export { timelineViewIcon, timelineOpenIcon, TimelinePaneDescriptor, configurationRegistry23, OpenTimelineAction, timelineFilter };
