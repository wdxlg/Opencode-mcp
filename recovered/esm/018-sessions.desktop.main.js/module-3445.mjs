// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/mobile/mobileLayout.ts



// src/vs/sessions/browser/parts/mobile/mobileLayout.ts
var PHONE_LAYOUT_CLASS = "phone-layout";

function isPhoneLayout(layoutService) {
  return layoutService.mainContainer.classList.contains(PHONE_LAYOUT_CLASS);
}
export { isPhoneLayout, PHONE_LAYOUT_CLASS };
