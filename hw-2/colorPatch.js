const chalk = require('chalk');

const COLOR = process.env.COLOR;

try {
  chalk[COLOR]();
} catch (error) {
  console.error('Your color is INVALID!!!');
  process.exit(1);
}

const log = console.log;

global.console.log = (...args) => {
  log(chalk[COLOR](...args));
};
