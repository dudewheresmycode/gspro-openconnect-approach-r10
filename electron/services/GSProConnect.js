const net = require('net');
const { getConfig } = require('../config');

const TIMEOUT_MS = 5000;

class GSProConnect {
  constructor(ipcPort) {
    const config = getConfig();
    this.deviceId = config.garmin.device_id;
    this.units = config.units;
    this.apiVersion = config.api_version;
    this.sendClubData = config.send_club_data || true;
    this.ip_address = config.gspro.ip_address;
    this.port = config.gspro.port;

    this.shotNumber = 5;
    this.socket = null;
    this.ipcPort = ipcPort;

    this.isLaunching = false;
    this.status = { connecting: false, connected: false };
    this.connect();
  }
  connect() {
    this.sendIpcStatus({ connecting: true, connected: false });

    this.log(`Connecting to gsPro at ${this.ip_address}:${this.port}`);

    this.socket = new net.Socket();
    this.socket.connect(this.port, this.ip_address);
    this.socket.setTimeout(TIMEOUT_MS);

    this.socket.write('');

    this.socket.on('timeout', () => {
      console.log('[gspro] Unable to connect to GSPro');
      this.sendIpcStatus({
        connected: false,
        connecting: false,
        error: 'Connection timed out',
      });
      this.socket.destroy();
      this.reconnect();
    });

    this.socket.on('connect', () => this.handleConnection());

    this.socket.on('error', (e) => {
      if (e.code === 'ECONNREFUSED') {
        const error =
          'Connection refused. Do you have the GSPro Connect window open?';
        console.error(error);
        this.sendIpcStatus({ connected: false, connecting: false, error });
        this.reconnect();
      } else {
        console.error('error with gspro socket', e);
        this.sendIpcStatus({
          connected: false,
          connecting: false,
          error: e.message,
        });
        this.handleDisconnect();
        this.reconnect();
      }
    });
  }
  reconnect() {
    if (this._reconnectTimeout) {
      clearTimeout(this._reconnectTimeout);
    }
    this.log(`trying again in ${TIMEOUT_MS / 1000} seconds`);
    this._reconnectTimeout = setTimeout(() => {
      this.log('reconnecting to gsPro');
      this.connect();
    }, TIMEOUT_MS);
  }
  handleConnection() {
    this.log('✅ GSPro connected');

    this.socket.setEncoding('UTF8');
    this.socket.setTimeout(0);
    this.sendIpcStatus({ connecting: false, connected: true });

    this.socket.on('close', (hadError) => {
      console.log('gsPro connection closed.  Had error: ', hadError);
      this.sendIpcStatus({
        connected: false,
        connecting: false,
        error: hadError,
      });
      if (!this.shouldDisconnect && !hadError) {
        this.handleDisconnect();
        this.reconnect();
      }
    });

    this.socket.on('data', (data) => {
      try {
        const dataObj = JSON.parse(data);
        if (this.isLaunching) {
          if (dataObj.Code === 200) {
            this.log('✅ Shot was sent successfully!');
            clearTimeout(this.launchRequestTimeout);
            if (this.launchPromise) {
              this.launchPromise();
            }
          }
        }
        this.log('incoming message from gsPro:', dataObj);
      } catch (e) {
        this.log('error parsing incoming gsPro message', e);
      }
    });
  }

  safeDisconnect() {
    this.shouldDisconnect = true;
    return new Promise((resolve) => {
      this.socket.end(() => {
        this.log('Disconnected from GSPro...');
        this.socket.destroy();
        this.socket = null;
        resolve();
      });
    });
  }
  handleDisconnect() {
    this.sendIpcStatus({ connected: false, connecting: false });
    if (this.socket) {
      this.log('Disconnected from GSPro...');
      this.socket.destroy();
      this.socket = null;
    }
  }

  log(...args) {
    console.log('[gspro]', ...args);
  }

  sendIpcStatus(newStatus) {
    if (newStatus) {
      this.status = newStatus;
    }
    try {
      if (this.ipcPort.isDestroyed()) {
        return;
      }
      this.ipcPort.send('gspro-status', this.status);
    } catch (error) {
      console.log('error sending status', error);
    }
    this.log('update client');
  }

  launchBall(ballData, clubData) {
    const APIData = {
      DeviceID: this.deviceId,
      Units: this.units,
      ShotNumber: this.shotNumber,
      APIversion: this.apiVersion,
      BallData: {
        Speed: ballData.ballSpeed,
        SpinAxis: ballData.spinAxis,
        TotalSpin: ballData.totalSpin,
        HLA: ballData.hla,
        VLA: ballData.vla,
      },
      ShotDataOptions: {
        ContainsBallData: true,
        ContainsClubData: this.sendClubData,
      },
    };

    if (this.sendClubData) {
      APIData.ClubData = {
        Speed: clubData.speed,
        AngleOfAttack: clubData.angleofattack,
        FaceToTarget: clubData.facetotarget,
        Lie: clubData.lie,
        Loft: clubData.loft,
        Path: clubData.path,
        SpeedAtImpact: clubData.speedatimpact,
        VerticalFaceImpact: clubData.verticalfaceimpact,
        HorizontalFaceImpact: clubData.horizontalfaceimpact,
        ClosureRate: clubData.closurerate,
      };
    }

    this.isLaunching = true;
    this.socket.write(JSON.stringify(APIData), (error) => {
      console.log(error);
    });

    this.shotNumber++;

    return new Promise((resolve, reject) => {
      this.launchPromise = resolve;
      this.launchRequestTimeout = setTimeout(() => {
        this.isLaunching = false;
        console.log('Could not launch!');
        reject('❌ Launch request timed out!');
      }, 3000);
    });
  }
}

module.exports = GSProConnect;
