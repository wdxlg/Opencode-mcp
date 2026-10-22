// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/stickyScroll/browser/stickyScrollContribution.ts
import { registerEditorContribution } from "./module-0097.mjs";
import { StickyScrollController2 } from "./module-0770.mjs";
import { registerAction2 } from "./module-0092.mjs";
import { FocusStickyScroll, GoToStickyScrollLine, SelectEditor, SelectNextStickyScrollLine, SelectPreviousStickyScrollLine, ToggleStickyScroll } from "./module-0848.mjs";


// src/vs/editor/contrib/stickyScroll/browser/stickyScrollContribution.ts
registerEditorContribution(StickyScrollController2.ID, StickyScrollController2, 1 /* AfterFirstRender */);

registerAction2(ToggleStickyScroll);

registerAction2(FocusStickyScroll);

registerAction2(SelectPreviousStickyScrollLine);

registerAction2(SelectNextStickyScrollLine);

registerAction2(GoToStickyScrollLine);

registerAction2(SelectEditor);
export {};
