const os = require('os');
const EventEmitter = require('events');
const { readdir } = require('fs/promises');
const { join, resolve, sep, relative } = require('path');

const FoundFile = require('./FoundFile');
const Progress = require('./Progress');
const { EVENT_INIT, EVENT_PARSE_STARTED, EVENT_COMPLETE, EVENT_ERROR, EVENT_FIND, EVENT_PROGRESS, TIMER } = require('./constants');

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

    this.once(EVENT_PARSE_STARTED, () => {
      console.log('Parse started');
      this.startTimer();
    });

    this.on(EVENT_FIND, () => {
      this.cancelTimer();
      this.startTimer();
    });

    this.on(EVENT_COMPLETE, () => this.cancelTimer());
  }

  async parse() {
    this.emit(EVENT_PARSE_STARTED);

    try {
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

      // Delay test
      // await new Promise(resolve => setTimeout(resolve, 3010));

      if (item.isDirectory() && (pathLevel < this._searchDepth || this._searchDepth === 0)) {
        this._checkedDirectories++;
        result.push(...(await this.readDirectory(newDirectory, fileName)));
      }
      else if (item.isFile()) {
        this._checkedFiles++;

        if (item.name.match(fileName)) {
          const foundFile = new FoundFile(item.name, resolve(newDirectory));
          
          this.emit(EVENT_FIND, foundFile);
          
          result.push(foundFile);
        }
      }
    }

    return result;
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
