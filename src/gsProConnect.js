
class GsProConnect {
  constructor(ipcPort) {
    this.socket = net.createConnection({
      address: ENV.IP_ADDRESS,
      port: ENV.PORT,
    });
  }
}

module.exports = GsProConnect;