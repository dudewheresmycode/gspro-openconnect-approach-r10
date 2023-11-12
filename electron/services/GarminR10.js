const { ipcMain } = require('electron');
const address = require('address');
const net = require('net');
const sound = require('sound-play');
const { getConfig } = require('../config');

const {
  get_success_message,
  get_handshake_message,
  get_shot_complete_message,
  get_sim_command,
} = require('../util/simMessages');

const HEARTBEAT_INTERVAL = 10000; // 10 seconds
const PING_TIMEOUT = 3000;

class GarminR10 {
  constructor(ipcPort, gsProConnect) {
    const config = getConfig();
    this.port = config.garmin.port;
    this.server = net.createServer();
    this.client = null;
    this.pingTimeout = false;
    this.ipcPort = ipcPort;
    this.status = { connected: false };
    this.gsProConnect = gsProConnect;
  }

  connect() {
    if (this.server) {
      this.server.close();
      this.client = null;
    }
    this.server = net.createServer();
    this.server.on('connection', this.handleConnection.bind(this));
    this.server.on('error', this.handleError);
    const localIp = address.ip();
    this.server.listen(this.port, localIp, () => {
      console.log(`Listening at ${localIp}:${this.port}`);
    });
  }
  handleError(error) {
    console.log('error with garmin server', error);
  }

  handleConnection(conn) {
    console.log(`Established a connection!`);
    this.sendIpcStatus({ connected: true });
    this.client = conn;
    this.client.setEncoding('UTF8');
    this.client.on('data', this.handleIncomingData.bind(this));
    this.client.on('close', (hadError) => {
      console.log('client connection closed.  Had error: ', hadError);
      if (this.intervalID) {
        clearInterval(this.intervalID);
      }
      // this.connect();
    });

    this.client.on('error', (e) => {
      console.log('client connection error', e);
      this.sendIpcStatus({ connected: false, error: e.message });
    });

    if (this.intervalID) {
      clearInterval(this.intervalID);
    }
    this.intervalID = setInterval(() => {
      this.sendPing();
    }, HEARTBEAT_INTERVAL);
  }

  handleDisconnect() {
    if (this.client) {
      this.client.end();
      if (this.intervalID) {
        clearInterval(this.intervalID);
      }
      this.client = null;
    }
  }

  handleIncomingData(data) {
    let dataObj;
    let parseError;
    try {
      dataObj = JSON.parse(data);
      console.log(`${new Date()} incoming message:`, dataObj);
    } catch (error) {
      console.log('error: unable to parse incoming message', error);
      parseError = error;
    }
    if (!dataObj) {
      console.log('error: empty message', data);
      return;
    }

    switch (dataObj.Type) {
      case 'Handshake':
        this.client.write(get_handshake_message(1));
        break;
      case 'Challenge':
        this.client.write(get_handshake_message(2));
        break;
      case 'Disconnect':
        this.sendIpcStatus({ connected: false });
        this.handleDisconnect();
        break;
      case 'Pong':
        this.handlePong();
        break;
      case 'SetClubType':
        this.updateClubType(dataObj.ClubType);
        break;
      case 'SetBallData':
        this.setBallData(dataObj.BallData);
        break;
      case 'SetClubData':
        this.setClubData(dataObj.ClubData);
        break;
      case 'SendShot':
        this.sendShot();
        break;
      default:
        console.log('no match', dataObj.Type);
    }
  }
  updateClubType(clubType) {
    this.clubType = clubType;
    this.client.write(get_success_message('SetClubType'));
  }

  setBallData(ballData) {
    let spinAxis = Number(ballData.SpinAxis);
    if (spinAxis > 90) {
      spinAxis -= 360;
    }
    spinAxis *= -1;
    this.ballData = {
      ballSpeed: ballData.BallSpeed,
      spinAxis: spinAxis,
      totalSpin: ballData.TotalSpin,
      hla: ballData.LaunchDirection,
      vla: ballData.LaunchAngle,
    };

    console.log({
      type: 'gsProShotStatus',
      ready: false,
    });

    this.client.write(get_success_message('SetBallData'));
  }

  setClubData(clubData) {
    this.clubData = {
      speed: clubData.ClubHeadSpeed,
      angleofattack: 0.0,
      facetotarget: clubData.ClubAngleFace,
      lie: 0.0,
      loft: 0.0,
      path: clubData.ClubAnglePath,
      speedatimpact: clubData.ClubHeadSpeed,
      verticalfaceimpact: 0.0,
      horizontalfaceimpact: 0.0,
      closurerate: 0.0,
    };

    console.log({
      type: 'gsProShotStatus',
      ready: false,
    });

    this.client.write(get_success_message('SetClubData'));
  }

  sendTestShot(ballData, clubData = {}) {
    this.ballData = ballData;
    this.clubData = {
      speed: clubData.clubHeadSpeed,
      angleofattack: 0.0,
      facetotarget: clubData.clubAngleFace,
      lie: 0.0,
      loft: 0.0,
      path: clubData.clubAnglePath,
      speedatimpact: clubData.clubHeadSpeed,
      verticalfaceimpact: 0.0,
      horizontalfaceimpact: 0.0,
      closurerate: 0.0,
    };
    const isTest = true; // for clarity
    this.sendShot(isTest);
  }

  async sendShot(isTest) {
    console.log({
      type: 'gsProShotStatus',
      ready: false,
      ballData: this.ballData,
      clubData: this.clubData,
    });

    try {
      await this.gsProConnect.launchBall(this.ballData, this.clubData);
    } catch (error) {
      console.error(error);
      return;
    }

    if (!isTest && this.client) {
      this.client.write(get_success_message('SendShot'));
      setTimeout(() => {
        this.client.write(get_shot_complete_message());
      }, 300);
      setTimeout(() => {
        this.client.write(get_sim_command('Disarm'));
      }, 700);
      setTimeout(() => {
        this.client.write(get_sim_command('Arm'));
      }, 1000);
    }
    setTimeout(() => {
      console.log('Shot successful!');
    }, 1000);

    // setTimeout(() => {
    //     this.ipcPort.postMessage({
    //         type: 'gsProMessage',
    //         message: '💯 Shot successful 💯',
    //         level: 'success',
    //     });
    //     this.ipcPort.postMessage({
    //         type: 'gsProShotStatus',
    //         ready: true,
    //     });
    // }, 1000);
  }

  handlePong() {
    this.didReceivePong = true;
    clearTimeout(this.pingTimeout);
  }

  sendPing() {
    this.didReceivePong = false;

    if (this.client) {
      console.log(`${new Date()} sending ping...`);
      this.client.write(get_sim_command('Ping'));

      this.pingTimeout = setTimeout(() => {
        if (!this.didReceivePong) {
          this.sendIpcStatus({
            connected: false,
            error: 'The R10 has stopped responding',
          });
          if (this.intervalID) {
            clearInterval(this.intervalID);
          }
          this.handleDisconnect();
          this.listen();
        }
      }, PING_TIMEOUT);
    } else {
      this.sendIpcStatus({
        connected: false,
        error: 'Client not configured',
      });

      if (this.intervalID) {
        clearInterval(this.intervalID);
      }
      this.listen();
    }
  }
  sendIpcStatus(newStatus) {
    if (newStatus) {
      this.status = newStatus;
    }
    try {
      if (this.ipcPort.isDestroyed()) {
        return;
      }
      this.ipcPort.send('garmin-status', this.status);
      console.log('[garmin] sendIpcStatus');
    } catch (error) {
      console.log('error sending status', error);
    }
  }
}

module.exports = GarminR10;
