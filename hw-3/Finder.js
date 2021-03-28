const os = require('os');
const EventEmitter = require('events');
const FileType = require('file-type');
const { createReadStream } = require('fs');
const { readdir, appendFile } = require('fs/promises');
const { join, resolve, sep, relative } = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const { logToFile } = require('./log-utils');
const FoundFile = require('./FoundFile');
const Progress = require('./Progress');
const { EVENT_INIT, EVENT_PARSE_STARTED, EVENT_COMPLETE, EVENT_ERROR, EVENT_FIND, EVENT_PROGRESS, TIMER } = require('./constants');

const argv = yargs(hideBin(process.argv)).argv;

class Finder extends EventEmitter {
  _checkedDirectories = 0;
  _checkedFiles = 0;
  _fileName;
  _searchDepth;
  _basePath;
  _timerId;

  constructor({ path = os.homedir(), searchDepth = 0, fileName = '*.*' }) {
    super();

    this._basePath = path;
    this._searchDepth = searchDepth;
    this._fileName = fileName;

    setTimeout(() => this.emit(EVENT_INIT), 0);

    this.once(EVENT_PARSE_STARTED, async () => {
      const txt = 'Parse started\n';
      console.log(txt);
      await logToFile(txt);
      this.startTimer();
    });

    this.on(EVENT_FIND, () => {
      this.cancelTimer();
      this.startTimer();
    });

    this.on(EVENT_COMPLETE, () => this.cancelTimer());
  }

  async parse() {
    try {
      this.emit(EVENT_PARSE_STARTED);

      const result = await this.readDirectory(this._basePath, this._fileName);

      this.emit(EVENT_COMPLETE, {
        scanned: { files: result.length, dirs: this._checkedDirectories },
        found: result,
      });
    } catch (error) {
      this.emit(EVENT_ERROR, error)
    }
  }

  async readDirectory(dirToSearch, fileName) {
    const result = [];
    const files = await readdir(dirToSearch, { withFileTypes: true });

    for (let item of files) {
      const newDirectory = join(dirToSearch, item.name);
      const pathLevel = relative(newDirectory, this._basePath).split(sep).length;

      if (item.isDirectory() && (pathLevel < this._searchDepth || this._searchDepth === 0)) {
        this._checkedDirectories++;
        result.push(...(await this.readDirectory(newDirectory, fileName)));
      }
      else if (item.isFile()) {
        this._checkedFiles++;
        const fullFilePath = resolve(newDirectory);

        if (this.isNameMatched(item, fileName)) {
          if (argv.search && await this.isTxtFile(fullFilePath)) {
            this.searchTxt(fullFilePath);
          }

          const foundFile = new FoundFile(item.name, fullFilePath);
          
          this.emit(EVENT_FIND, foundFile);
          
          result.push(foundFile);
        }
      }
    }

    return result;
  }

  searchTxt(filePath) {
    const rs = createReadStream(filePath, {
      encoding: 'utf-8',
      highWaterMark: argv.search.length < 5
        ? 5
        : argv.search.length + 10,
    });

    let chunks = '';
    let result = '';
    let lineNumber = 1;

    rs.on('data', async chunk => {
      let newBreaks;
      const prevBreaks = chunks.match(/\n/g)?.length;
      chunks += chunk;

      if (chunks.match(argv.search)) {
        const searchIndex = chunks.indexOf(argv.search);
        newBreaks = chunks.slice(0, searchIndex).match(/\n/g)?.length;
  
        if (newBreaks) {
          lineNumber += newBreaks - (prevBreaks ?? 0);
        }

        result += `Yeeee, we found it!\n
          Path: ${filePath}\n
          On line ${lineNumber}:\n
          Search Text: ${chunks}\n\n
          ======================\n\n`;
        console.log(result);
        await logToFile(result);
        rs.destroy();
      } else {
        newBreaks = chunks.match(/\n/g)?.length;
  
        if (newBreaks) {
          lineNumber += newBreaks - (prevBreaks ?? 0);
        }
      }

      chunks = chunk;
    });
  }

  async isTxtFile(filePath) {
    const rs = createReadStream(filePath);
    const fileType = await FileType.fromStream(rs);
    return !fileType;
  }

  isNameMatched(file, searchName) {
    return argv.ext?.split(',').some(x => file.name.match(`${searchName}.${x}`));
  }

  startTimer() {
    this._timerId = setInterval(() =>
      this.emit(
        EVENT_PROGRESS,
        new Progress(this._checkedFiles, this._checkedDirectories)
      ), TIMER);
  }

  cancelTimer() {
    clearInterval(this._timerId);
  }
}

module.exports = Finder;
