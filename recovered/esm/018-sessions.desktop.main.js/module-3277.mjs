// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/welcomeGettingStarted/common/media/theme_picker_small.ts
import { ThemeSettingDefaults } from "./module-0917.mjs";
import { escape } from "./module-0030.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/welcomeGettingStarted/common/media/theme_picker_small.ts
var theme_picker_small_default = () => `
<checklist>
	<div class="theme-picker-row">
		<checkbox when-checked="setTheme:${ThemeSettingDefaults.COLOR_THEME_DARK}" checked-on="config.workbench.colorTheme == '${ThemeSettingDefaults.COLOR_THEME_DARK}'">
			<img width="150" src="./dark.png"/>
			${escape(localize(22172, null))}
		</checkbox>
		<checkbox when-checked="setTheme:${ThemeSettingDefaults.COLOR_THEME_LIGHT}" checked-on="config.workbench.colorTheme == '${ThemeSettingDefaults.COLOR_THEME_LIGHT}'">
			<img width="150" src="./light.png"/>
			${escape(localize(22175, null))}
		</checkbox>
	</div>
	<div class="theme-picker-row">
		<checkbox when-checked="setTheme:${ThemeSettingDefaults.COLOR_THEME_HC_DARK}" checked-on="config.workbench.colorTheme == '${ThemeSettingDefaults.COLOR_THEME_HC_DARK}'">
			<img width="150" src="./dark-hc.png"/>
			${escape(localize(22173, null))}
		</checkbox>
		<checkbox when-checked="setTheme:${ThemeSettingDefaults.COLOR_THEME_HC_LIGHT}" checked-on="config.workbench.colorTheme == '${ThemeSettingDefaults.COLOR_THEME_HC_LIGHT}'">
			<img width="150" src="./light-hc.png"/>
			${escape(localize(22174, null))}
		</checkbox>
	</div>
</checklist>
`;
export { theme_picker_small_default };
