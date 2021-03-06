const { readdir } = require("fs/promises");
const { join } = require('path');
const EventEmitter = require("events");

const FoundFile = require('./FoundFile');

class Finder extends EventEmitter {
  dirs = 0;
  baseDirToSearch;

  constructor() {
    super();

    this.on("start", (dirToSearch, fileName) => {
      this.baseDirToSearch = dirToSearch;
      this.recParseDir(dirToSearch, fileName)
        .then(result => {
          process.nextTick(() => {
            this.emit("complete", {
              scanned: { files: result.length, dirs: this.dirs },
              found: result,
            });
          });
        })
        .catch(error => this.emit("complete", error));

    });

    setTimeout(() => this.emit("started"), 0);
  }

  async recParseDir(dirToSearch, fileName, result = []) {
    const files = await readdir(dirToSearch, { withFileTypes: true });

    for (let file of files) {
      const fullPath = join(dirToSearch, file.name);

      if (file.isDirectory()) {
        this.dirs++;
        await this.recParseDir(fullPath, fileName, result);
      }
      else if (file.name.match(fileName)) {
        const foundFile = new FoundFile(file.name, this.getRelativePath(fullPath));

        process.nextTick(() => this.emit("find", foundFile));

        result.push(foundFile);
      }
    }

    return result;
  }

  getRelativePath(absPath) {
    return absPath.split(this.baseDirToSearch)[1];
  }
}

module.exports = Finder;
