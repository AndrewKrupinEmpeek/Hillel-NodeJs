const os = require('os');
const EventEmitter = require('events');
const FileType = require('file-type');
const { createReadStream } = require("fs");
const { readdir, appendFile } = require('fs/promises');
const { join, resolve, sep, relative } = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

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

        if (this.isNameMatched(item, fileName)) {
          const fullFilePath = resolve(newDirectory);
          await this.testStream(fullFilePath);
          const foundFile = new FoundFile(item.name, fullFilePath);
          
          this.emit(EVENT_FIND, foundFile);
          
          result.push(foundFile);
        }
      }
    }

    return result;
  }

  async testStream(filePath) {
    const currentDateArray = new Date().toISOString().split('T');
    const logFileName = `${currentDateArray[0]}_${currentDateArray[1].split('.')[0].split(':').join('-')}`;
    await appendFile(`./log/${logFileName}.txt`, 'data to append', function (err) {
      if (err) throw err;
    });

    const rs = createReadStream(join(__dirname, 'app.js'));
    // const rs = createReadStream(filePath);
    console.log('filePath');
    console.log(filePath);
    console.log(rs);

    rs.on("readable", async () => {
      const chunk = rs.read(4100);
      console.log('chunk');
      console.log(chunk);
      if (!chunk) return;
      const type = await FileType.fromBuffer(chunk);
      console.log('type');
      console.log(type);
      rs.destroy();
    });
  }

  isNameMatched(file, searchName) {
    return argv.ext.split(',').some(x => file.name.match(`${searchName}.${x}`));
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
