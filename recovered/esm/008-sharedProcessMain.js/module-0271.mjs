// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/base/common/desktopEnvironmentInfo.ts
import { env } from "./module-0016.mjs";


// src/vs/base/common/desktopEnvironmentInfo.ts
var kXdgCurrentDesktopEnvVar = "XDG_CURRENT_DESKTOP";

var kKDESessionEnvVar = "KDE_SESSION_VERSION";

function getDesktopEnvironment() {
  const xdgCurrentDesktop = env[kXdgCurrentDesktopEnvVar];
  if (xdgCurrentDesktop) {
    const values = xdgCurrentDesktop.split(":").map((value) => value.trim()).filter((value) => value.length > 0);
    for (const value of values) {
      switch (value) {
        case "Unity": {
          const desktopSessionUnity = env["DESKTOP_SESSION"];
          if (desktopSessionUnity && desktopSessionUnity.includes("gnome-fallback")) {
            return "GNOME" /* GNOME */;
          }
          return "UNITY" /* UNITY */;
        }
        case "Deepin":
          return "DEEPIN" /* DEEPIN */;
        case "GNOME":
          return "GNOME" /* GNOME */;
        case "X-Cinnamon":
          return "CINNAMON" /* CINNAMON */;
        case "KDE": {
          const kdeSession = env[kKDESessionEnvVar];
          if (kdeSession === "5") {
            return "KDE5" /* KDE5 */;
          }
          if (kdeSession === "6") {
            return "KDE6" /* KDE6 */;
          }
          return "KDE4" /* KDE4 */;
        }
        case "Pantheon":
          return "PANTHEON" /* PANTHEON */;
        case "XFCE":
          return "XFCE" /* XFCE */;
        case "UKUI":
          return "UKUI" /* UKUI */;
        case "LXQt":
          return "LXQT" /* LXQT */;
      }
    }
  }
  const desktopSession = env["DESKTOP_SESSION"];
  if (desktopSession) {
    switch (desktopSession) {
      case "deepin":
        return "DEEPIN" /* DEEPIN */;
      case "gnome":
      case "mate":
        return "GNOME" /* GNOME */;
      case "kde4":
      case "kde-plasma":
        return "KDE4" /* KDE4 */;
      case "kde":
        if (kKDESessionEnvVar in env) {
          return "KDE4" /* KDE4 */;
        }
        return "KDE3" /* KDE3 */;
      case "xfce":
      case "xubuntu":
        return "XFCE" /* XFCE */;
      case "ukui":
        return "UKUI" /* UKUI */;
    }
  }
  if ("GNOME_DESKTOP_SESSION_ID" in env) {
    return "GNOME" /* GNOME */;
  }
  if ("KDE_FULL_SESSION" in env) {
    if (kKDESessionEnvVar in env) {
      return "KDE4" /* KDE4 */;
    }
    return "KDE3" /* KDE3 */;
  }
  return "UNKNOWN" /* UNKNOWN */;
}
export { getDesktopEnvironment, kXdgCurrentDesktopEnvVar, kKDESessionEnvVar };
