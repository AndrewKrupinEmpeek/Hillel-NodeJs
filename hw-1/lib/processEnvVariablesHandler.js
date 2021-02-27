const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env'));

function listProcessEnvVariables() {
  for (const key in envConfig) {
    console.log(key, envConfig[key]);
  }
}

module.exports = { listProcessEnvVariables };
