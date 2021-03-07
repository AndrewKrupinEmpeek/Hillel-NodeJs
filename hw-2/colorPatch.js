const chalk = require('chalk');
const util = require('util')

const COLOR = process.env.COLOR;

try {
  chalk[COLOR]();
} catch (error) {
  console.error('Your color is INVALID!!!');
  process.exit(1);
}

const log = console.log;

global.console.log = (...args) => {
  log(chalk[COLOR](util.inspect(args, {colors:true, depth:null})));
};
