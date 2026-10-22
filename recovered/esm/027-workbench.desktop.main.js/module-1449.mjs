// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/activity/common/activity.ts
import { createDecorator } from "./module-0077.mjs";
import { Codicon } from "./module-0085.mjs";
import { activityWarningBadgeBackground, activityWarningBadgeForeground } from "./module-0228.mjs";


// src/vs/workbench/services/activity/common/activity.ts
var IActivityService = createDecorator("activityService");

var BaseBadge = class {
  constructor(descriptorFn, stylesFn) {
    this.descriptorFn = descriptorFn;
    this.stylesFn = stylesFn;
  }
  getDescription() {
    return this.descriptorFn(null);
  }
  getColors(theme) {
    return this.stylesFn?.(theme);
  }
};

var NumberBadge = class extends BaseBadge {
  constructor(number, descriptorFn) {
    super(descriptorFn, void 0);
    this.number = number;
    this.number = number;
  }
  getDescription() {
    return this.descriptorFn(this.number);
  }
};

var IconBadge = class extends BaseBadge {
  constructor(icon2, descriptorFn, stylesFn) {
    super(descriptorFn, stylesFn);
    this.icon = icon2;
  }
};

var ProgressBadge = class extends BaseBadge {
  constructor(descriptorFn) {
    super(descriptorFn, void 0);
  }
};

var WarningBadge = class extends IconBadge {
  constructor(descriptorFn) {
    super(Codicon.warning, descriptorFn, (theme) => ({
      badgeBackground: theme.getColor(activityWarningBadgeBackground),
      badgeForeground: theme.getColor(activityWarningBadgeForeground),
      badgeBorder: void 0
    }));
  }
};
export { IActivityService, BaseBadge, NumberBadge, IconBadge, ProgressBadge, WarningBadge };
