const { Menu, Tray } = require('electron');

const { TRAY_ICON_DEFAULT, TRAY_ICON_CONNECTED } = require('../constants');

function trayMenu() {
  const tray = new Tray(TRAY_ICON_DEFAULT);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Status: Not Connected', type: 'radio' },
    { label: 'Item2', type: 'radio' },
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Item4', type: 'radio' },
  ]);
  tray.setToolTip('This is my application.');
  tray.setContextMenu(contextMenu);
  return tray;
}

module.exports = trayMenu;
