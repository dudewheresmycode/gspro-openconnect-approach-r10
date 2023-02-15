const settingsModal = document.getElementById('settings-modal');
const settingsCancelButton = document.getElementById('settings-cancel');
const settingsSaveButton = document.getElementById('settings-save');

settingsCancelButton.addEventListener('click', () => {
  hideSettingsModal();
});
console.log('loaded!');

function hideSettingsModal() {
  settingsModal.style.display = 'none';
}
function showSettingsModal() {
  settingsModal.style.display = 'block';
}

//   const ballData = {
//     ballSpeed: 98.5,
//     spinAxis: -10.2,
//     totalSpin: 2350.2,
//     hla: 0.0,
//     vla: 13.5,
//   };

window.addEventListener('load', async () => {
  console.log('loaded!');
  const ip = await window.electronAPI.getLocalIP();
  document.getElementById('local-ip').innerHTML = ip || 'unknown';
  
  const config = await window.electronAPI.getConfig();
  console.log('loaded config', config);
  document.getElementById('units').value = config.units;
  document.getElementById('gspro.host').value = config.gspro.ip_address;
  document.getElementById('gspro.port').value = config.gspro.port;
  document.getElementById('garmin.device_id').value = config.garmin.device_id;
  document.getElementById('garmin.port').value = config.garmin.port;
});

// window.electronAPI.handleSetIP((event, ip) => {
//   document.getElementById('local-ip').innerHTML = ip || 'unknown';
// });