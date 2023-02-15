const address = require('address');
const net = require('net');

const {
  get_success_message,
  get_handshake_message,
  get_sim_command
} = require('./simMessages.js');

const GARMIN_PORT = 2483;

const HEARTBEAT_INTERVAL = 10000; // 10 seconds

class GarminR10 {
  constructor() {
    this.server = net.createServer();
    this.client = null;
    this.pingTimeout = false;
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
    this.server.listen(GARMIN_PORT, LOCAL_IP, () => {
      console.log(`Listening at ${LOCAL_IP}:${GARMIN_PORT}`);
    });
  }
  handleError(error) {
    console.log('error with garmin server', error);
  }

  handleConnection(conn) {
    console.log(`Established a connection!`);
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
    });

    if (this.intervalID) {
      clearInterval(this.intervalID);
    }
    this.intervalID = setInterval(() => {
      this.sendPing();
    }, HEARTBEAT_INTERVAL);
  }

  handleDisconnect() {
    this.client.end();
    if (this.intervalID) {
      clearInterval(this.intervalID);
    }
    this.client = null;
  }

  handleIncomingData(data) {
    let dataObj;
    try {
      dataObj = JSON.parse(data);
      console.log('incoming message:', dataObj);
    } catch (error) {
      console.log('error: unable to parse incoming message', error);
    }
    if (!dataObj) {
      console.log('error: empty message', error);
    }

    switch (dataObj.Type) {
      case 'Handshake':
        this.client.write(get_handshake_message(1));
        break;
      case 'Challenge':
        this.client.write(get_handshake_message(2));
        break;
      case 'Disconnect':
        this.handleDisconnect();
        break;
      case 'Pong':
        this.handlePong();
        break;
      case 'SetClubType':
        // this.updateClubType(data.ClubType);
        break;
      case 'SetBallData':
        // this.setBallData(data.BallData);
        break;
      case 'SetClubData':
        // this.setClubData(data.ClubData);
        break;
      case 'SendShot':
        // this.sendShot();
        break;
      default:
        console.log('no match', dataObj.Type);
    }
  }

  handlePong() {
    this.pingTimeout = false;
  }

  sendPing() {
    this.pingTimeout = true;

    if (this.client) {
        this.client.write(get_sim_command('Ping'));

        setTimeout(() => {
            if (this.pingTimeout === true) {
                this.ipcPort.postMessage({
                    type: 'R10Message',
                    message: 'R10 stopped responding...',
                    level: 'error',
                });
                if (this.intervalID) {
                    clearInterval(this.intervalID);
                }
                this.handleDisconnect();
                this.listen();
            }
        }, 3000);
    } else {
        this.ipcPort.postMessage({
            type: 'R10Message',
            message: 'R10 client not set...',
            level: 'error',
        });
        if (this.intervalID) {
            clearInterval(this.intervalID);
        }
        this.listen();
    }
  }

  
}

module.exports = GarminR10;