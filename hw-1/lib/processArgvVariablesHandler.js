const os = require('os');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const { constants } = require('../constants');

const argv = yargs(hideBin(process.argv)).argv;

function showCpu() {
  console.log(`model: ${os.cpus()[0].model}, cores: ${os.cpus().length}`);
}

function showLan() {
  const nets = os.networkInterfaces();
  let lan;
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        lan = net.address;
      }
    }
  }
  console.log(`lan: ${lan}`);
}

function showRam() {
  console.log(`ram: ${(os.totalmem() / 1048576).toFixed(2)} MB`);
}

for (const key in argv) {
  switch (key) {
    case constants.cpu:
      showCpu();
      break;
    case constants.lan:
      showLan();
      break;
    case constants.ram:
      showRam();
      break;
    case constants.fullInfo:
      showCpu();
      showLan();
      showRam();
      break;
    case constants.osName:
      console.log(`os-name: ${os.release()}`);
      break;
    default:
      break;
  }
}

exports.listProcessArgvVariables = () => {
  for (const key in argv) {
    console.log(key, argv[key]);
  }
}
