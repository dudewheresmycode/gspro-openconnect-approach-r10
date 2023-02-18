let settingsModal;
let testShotModal;
// let debugLog;
let gsproStatus;
let garminStatus;
let port;

const DISCONNECTED_TEXT = '<span class="icon-cross"></span> Disconnected';
const CONNECTED_TEXT = '<span class="icon-checkmark"></span> Connected';
const CONNECTING_TEXT = '<span class="icon-spinner3 spin"></span> Reconnecting';

async function displayLocalIP() {
  const ip = await window.electronAPI.getLocalIP();
  document.getElementById('local-ip').innerHTML = ip || 'unknown';
}

const ballData = {
  ballSpeed: 98.5,
  spinAxis: -10.2,
  totalSpin: 2350.2,
  hla: 0.0,
  vla: 13.5,
};

const clubData = {
  clubAngleFace: -8.2,
  clubAnglePath: -1.2,
  clubHeadSpeed: 160,
};

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
  console.log('loaded');
  gsproStatus = document.getElementById('status-gspro');
  garminStatus = document.getElementById('status-garmin');

  // modals
  const settingsButton = document.getElementById('settings-button');
  const testShotButton = document.getElementById('test-shot-button');

  settingsModal = new Modal(document.getElementById('settings-modal'));
  testShotModal = new Modal(document.getElementById('test-shot-modal'));

  const testShotForm = document.getElementById('test-shot-form');
  const testShotCancelButton = document.getElementById('test-shot-cancel');
  const testShotSubmitButton = document.getElementById('test-shot-submit');
  const settingsCancelButton = document.getElementById('settings-cancel');
  const settingsSaveButton = document.getElementById('settings-save');

  testShotForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('SEND TEST SHOT!');
    window.electronAPI.sendTestShot(ballData, clubData);
  });
  testShotCancelButton.addEventListener('click', (e) => {
    e.preventDefault();
    testShotModal.hide();
  });

  settingsButton.addEventListener('click', () => {
    settingsModal.show();
  });
  settingsCancelButton.addEventListener('click', () => {
    settingsModal.hide();
  });
  testShotButton.addEventListener('click', () => {
    testShotModal.show();
  });

  // settings form
  const config = await window.electronAPI.getConfig();
  console.log('loaded config', config);
  document.getElementById('units').value = config.units;
  document.getElementById('gspro.host').value = config.gspro.ip_address;
  document.getElementById('gspro.port').value = config.gspro.port;
  document.getElementById('garmin.device_id').value = config.garmin.device_id;
  document.getElementById('garmin.port').value = config.garmin.port;

  await displayLocalIP();

  electronAPI.onGarminUpdate((_event, status) => updateGarminStatus(status));
  electronAPI.onGSProUpdate((_event, status) => updateGSProStatus(status));

  // setTimeout(() => {
  window.electronAPI.getStatus();
  // }, 1);
});

window.addEventListener('message', handleWindowMessage);

function handleWindowMessage(event) {
  console.log('MESSAGE');
  console.log(event);
  // if (event.source === window && event.data === 'main-port') {
  //   const [_port] = event.ports;
  //   port = _port;
  //   _port.onmessage = (event) => {
  //     handleMessage(event.data);
  //   };
  // }
}

// function handleMessage(data) {
//   if (data.type === 'garminStatus') {
//     // updateStatus('garmin', data.status);
//   } else if (data.type === 'garminStatus') {
//     // printMessage('R10', data.message, data.level);
//     updateGarminStatus(data.status);
//   } else if (data.type === 'gsProStatus') {
//     updateGSProStatus(data.status);
//     // } else if (data.type === 'gsProMessage') {
//     // printMessage('GSPro', data.message, data.level);
//   } else if (data.type === 'gsProShotStatus') {
//     // updateShotStatus(data.ready);
//   } else {
//     console.log(`unknown type: ${data.type}`);
//   }
// }

// function printMessage(system, message, level) {
//   const lineElement = document.createElement('div');
//   console.log(lineElement);
//   lineElement.appendChild(document.createTextNode(message));
//   console.log(lineElement);
//   debugLog.appendChild(lineElement);
// }

function toggleStatus(element, status) {
  if (status.connected) {
    element.querySelector('.status-value').innerHTML = CONNECTED_TEXT;
    element.classList.add('status-connected');
    element.classList.remove('status-disconnected');
  } else {
    element.classList.add('status-disconnected');
    element.classList.remove('status-connected');
    element.querySelector('.status-value').innerHTML = DISCONNECTED_TEXT;
  }

  if (status.connecting) {
    element.querySelector('.status-value').innerHTML = CONNECTING_TEXT;
    element.classList.add('status-connecting');
    element.classList.remove('status-connected');
    element.classList.remove('status-disconnected');
  } else {
    element.classList.remove('status-connecting');
  }
}

function updateGSProStatus(status) {
  console.log('[gspro]', status);
  toggleStatus(gsproStatus, status);
}

function updateGarminStatus(status) {
  console.log('[garmin]', status);
  toggleStatus(garminStatus, status);
}
