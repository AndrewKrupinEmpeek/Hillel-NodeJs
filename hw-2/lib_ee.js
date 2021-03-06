const os = require('os');
const { readdir } = require('fs/promises');
const { join, sep, resolve } = require('path');
const EventEmitter = require('events');

const FoundFile = require('./FoundFile');

class Finder extends EventEmitter {
  dirs = 0;
  fileName;
  searchDepth;
  path;

  constructor({ path = os.homedir(), searchDepth = 0, fileName = '*.*' }) {
    super();

    this.path = path;
    this.searchDepth = searchDepth;
    this.fileName = fileName;

    this.on('init', () => {
      this.parse(this.path, this.fileName)
        .then(result => {
          process.nextTick(() => {
            this.emit('complete', {
              scanned: { files: result.length, dirs: this.dirs },
              found: result,
            });
          });
        })
        .catch(error => this.emit('error', error));
    });

    setTimeout(() => this.emit('started'), 0);
  }

  async parse(dirToSearch, fileName, result = []) {
    const files = await readdir(dirToSearch, { withFileTypes: true });

    for (let file of files) {
      const fullPath = join(dirToSearch, file.name);

      if (file.isDirectory() && dirToSearch.split(sep).length <= this.searchDepth) {
        this.dirs++;
        await this.parse(fullPath, fileName, result);
      }
      else if (file.name.match(fileName)) {
        const foundFile = new FoundFile(file.name, resolve(fullPath));

        process.nextTick(() => this.emit('find', foundFile));

        result.push(foundFile);
      }
    }

    return result;
  }
}

module.exports = Finder;
