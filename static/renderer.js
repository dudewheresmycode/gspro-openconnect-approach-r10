let settingsModal;
let testShotModal;
let debugLog;

async function displayLocalIP() {
  const ip = await window.electronAPI.getLocalIP();
  document.getElementById('local-ip').innerHTML = ip || 'unknown';
}

//   const ballData = {
//     ballSpeed: 98.5,
//     spinAxis: -10.2,
//     totalSpin: 2350.2,
//     hla: 0.0,
//     vla: 13.5,
//   };

class Modal {
  constructor(element) {
    this.element = element;
    this.visible = false;
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hide();
      }
    });
    this.element.addEventListener('transitionend', (event) => {
      if (!this.visible) {
        this.element.style.visibility = 'hidden';
      }
    });
  }
  hide() {
    this.visible = false;
    this.element.style.opacity = '0';
  }
  show() {
    this.visible = true;
    this.element.style.visibility = 'visible';
    this.element.style.opacity = '1';
  }
}

window.addEventListener('load', async () => {
  const settingsButton = document.getElementById('settings-button');
  const testShotButton = document.getElementById('test-shot-button');

  settingsModal = new Modal(document.getElementById('settings-modal'));
  testShotModal = new Modal(document.getElementById('test-shot-modal'));

  const testShotCancelButton = document.getElementById('test-shot-cancel');
  const settingsCancelButton = document.getElementById('settings-cancel');
  const settingsSaveButton = document.getElementById('settings-save');

  settingsButton.addEventListener('click', () => {
    settingsModal.show();
  });
  settingsCancelButton.addEventListener('click', () => {
    settingsModal.hide();
  });
  testShotButton.addEventListener('click', () => {
    testShotModal.show();
  });
  testShotCancelButton.addEventListener('click', () => {
    testShotModal.hide();
  });

  const config = await window.electronAPI.getConfig();
  console.log('loaded config', config);
  document.getElementById('units').value = config.units;
  document.getElementById('gspro.host').value = config.gspro.ip_address;
  document.getElementById('gspro.port').value = config.gspro.port;
  document.getElementById('garmin.device_id').value = config.garmin.device_id;
  document.getElementById('garmin.port').value = config.garmin.port;

  await displayLocalIP();
});

window.addEventListener('DOMContentLoaded', () => {
  debugLog = document.getElementById('debug-log-content');
  let port;
  window.addEventListener('message', (event) => {
    console.log(event);
    if (event.source === window && event.data === 'main-port') {
      const [_port] = event.ports;
      port = _port;
      _port.onmessage = (event) => {
        handleMessage(event.data);
      };
    }
  });
});

function handleMessage(data) {
  if (data.type === 'garminStatus') {
    // updateStatus('garmin', data.status);
  } else if (data.type === 'R10Message') {
    // printMessage('R10', data.message, data.level);
  } else if (data.type === 'gsProStatus') {
    // updateStatus('gspro', data.status);
  } else if (data.type === 'gsProMessage') {
    printMessage('GSPro', data.message, data.level);
  } else if (data.type === 'gsProShotStatus') {
    // updateShotStatus(data.ready);
  }
  console.log(`unknown type: ${data.type}`);
}
function printMessage(system, message, level) {
  const lineElement = document.createElement('div');
  console.log(lineElement);
  lineElement.appendChild(document.createTextNode(message));
  console.log(lineElement);
  debugLog.appendChild(lineElement);
}
