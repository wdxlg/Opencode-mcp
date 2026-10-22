// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/actions/common/actions.contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { IMenuService, registerAction2 } from "./module-0092.mjs";
import { MenuService } from "./module-0517.mjs";
import { MenuHiddenStatesReset } from "./module-1570.mjs";


// src/vs/platform/actions/common/actions.contribution.ts
registerSingleton(IMenuService, MenuService, 1 /* Delayed */);

registerAction2(MenuHiddenStatesReset);
export {};
