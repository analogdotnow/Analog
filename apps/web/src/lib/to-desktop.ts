import { nativeWindow, platform } from "@todesktop/client-core";

async function init() {
  if (!platform.todesktop.isDesktopApp()) {
    return;
  }

  if (platform.os.getOSPlatform() !== "darwin") {
    return;
  }

  await nativeWindow.setOpacity({}, 0.5);
  await nativeWindow.setVibrancy({}, "fullscreen-ui");
}

init();
