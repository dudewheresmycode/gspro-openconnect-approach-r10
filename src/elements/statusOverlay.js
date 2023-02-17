const { BrowserWindow, screen } = require('electron');

function statusOverlay() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const window = new BrowserWindow({
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    thickFrame: false,
    roundedCorners: false,
    width: 300,
    height: 60,
    x: 20,
    y: primaryDisplay.workAreaSize.height - 100,
    show: false,
  });
  window.loadFile(STATUS_PAGE);
  return window;
}
