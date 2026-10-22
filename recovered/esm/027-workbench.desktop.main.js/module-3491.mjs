// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/welcomeGettingStarted/common/media/notebookProfile.ts
import { createCommandUri } from "./module-0462.mjs";
import { escape } from "./module-0030.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/welcomeGettingStarted/common/media/notebookProfile.ts
var createSetProfileCommandUri = (profile) => createCommandUri("notebook.setProfile", { profile }).toString();

var imageSize = 400;

var notebookProfile_default = () => `
<vertically-centered>
<checklist>
	<checkbox on-checked="${createSetProfileCommandUri("default")}" checked-on="config.notebook.cellFocusIndicator == 'border' && config.notebook.insertToolbarLocation == 'both' && config.notebook.globalToolbar == false && config.notebook.compactView == true && config.notebook.showCellStatusBar == 'visible'">
		<img width="${imageSize}" src="./notebookThemes/default.png"/>
		${escape(localize(22165, null))}
	</checkbox>
	<checkbox on-checked="${createSetProfileCommandUri("jupyter")}" checked-on="config.notebook.cellFocusIndicator == 'gutter' && config.notebook.insertToolbarLocation == 'notebookToolbar' && config.notebook.globalToolbar == true && config.notebook.compactView == true  && config.notebook.showCellStatusBar == 'visible'">
		<img width="${imageSize}" src="./notebookThemes/jupyter.png"/>
		${escape(localize(22166, null))}
	</checkbox>
	<checkbox on-checked="${createSetProfileCommandUri("colab")}" checked-on="config.notebook.cellFocusIndicator == 'border' && config.notebook.insertToolbarLocation == 'betweenCells' && config.notebook.globalToolbar == false && config.notebook.compactView == false && config.notebook.showCellStatusBar == 'hidden'">
		<img width="${imageSize}" src="./notebookThemes/colab.png"/>
		${escape(localize(22164, null))}
	</checkbox>
</checklist>
</vertically-centered>
`;
export { createSetProfileCommandUri, imageSize, notebookProfile_default };
