require('dotenv').config();

const { listProcessEnvVariables } = require('./lib/processEnvVariablesHandler');
const { listProcessArgvVariables } = require('./lib/processArgvVariablesHandler');
require('./lib/colorPatch');
require('./lib/shortPatch');

listProcessEnvVariables();

listProcessArgvVariables();

console.short("Hello", 42, "world!");
