const chalk = require('chalk');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;

debugger;

// const colorsArray = ['blue', 'red', 'green'];

// let i = 0;
const COLOR = argv.primary || process.env.COLOR || 'magenta';

const log = console.log;
global.console.log = (...args) => {
  log(chalk[COLOR]('===', ...args, '==='));
  //   i++;
  //   if (i > colorsArray.length - 1) {
  //     i = 0;
  //   }
};
