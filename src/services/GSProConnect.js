const net = require('net');
const { getConfig } = require('../config');

const TIMEOUT_MS = 5000;

class GSProConnect {
  constructor(ipcPort) {
    const config = getConfig();
    this.deviceId = config.garmin.device_id;
    this.units = config.units;
    this.apiVersion = config.api_version;
    this.sendClubData = config.send_club_data;
    this.ip_address = config.gspro.ip_address;
    this.port = config.gspro.port;

    this.shotNumber = 1;
    this.socket = null;
    this.ipcPort = ipcPort;

    this.connect();
  }
  connect() {
    this.sendIpcMessage(
      `Connecting to gsPro at ${this.ip_address}:${this.port}`
    );
    this.socket = net.createConnection({
      address: this.ip_address,
      port: this.port,
    });
    this.socket.setTimeout(TIMEOUT_MS);

    this.socket.on('timeout', () => {
      this.sendIpcMessage('Unable to connect to GSPro');
      this.socket.destroy();
      this.reconnect();
    });

    this.socket.on('connect', () => this.handleConnection());

    this.socket.on('error', (e) => {
      if (e.code === 'ECONNREFUSED') {
        this.sendIpcMessage(
          'Connection refused. Do you have the GSPro Connect window open?'
        );
        this.reconnect();
      } else {
        console.log('error with gspro socket', e);
        this.handleDisconnect();
        console.log('Error with GSPro connection.  Trying to reconnect...');
        this.reconnect();
      }
    });
  }
  reconnect() {
    if (this._reconnectTimeout) {
      clearTimeout(this._reconnectTimeout);
    }
    this.sendIpcMessage(`trying again in ${TIMEOUT_MS / 1000} seconds`);
    this._reconnectTimeout = setTimeout(() => {
      this.sendIpcMessage('reconnecting to gsPro');
      this.connect();
    }, TIMEOUT_MS);
  }
  handleConnection() {
    this.sendIpcMessage('gsPro connected!');

    this.socket.setEncoding('UTF8');
    this.socket.setTimeout(0);

    this.socket.on('close', (hadError) => {
      console.log('gsPro connection closed.  Had error: ', hadError);
      if (!hadError) {
        this.handleDisconnect();
        this.reconnect();
      }
    });

    this.socket.on('data', (data) => {
      try {
        const dataObj = JSON.parse(data);
        console.log('incoming message from gsPro:', dataObj);
      } catch (e) {
        console.log('error parsing incoming gsPro message', e);
      }
    });
  }
  handleDisconnect() {
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
      console.log('gsProStatus: disconnected');
      this.sendIpcMessage('Disconnected from GSPro...');
      console.log('gsProShotStatus: false');
    }
  }
  sendIpcMessage(message) {
    console.log('[gsProMessage]', message);
    this.ipcPort.postMessage({ type: 'gsProMessage', message });
  }
}

module.exports = GSProConnect;
