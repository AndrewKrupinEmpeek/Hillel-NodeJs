const fs = require('fs');
const { join } = require('path');

const EventEmitter = require("events");

class FoundFile {
  constructor( name, path ) {
    this.name = name;
    this.path = path;
  }
}

class FindLib extends EventEmitter {
  dirs = 0;
  files;
  result;
  baseDirToSearch;

  constructor() {
    super();

    this.on("start", (dirToSearch, fileName) => {
      this.baseDirToSearch = dirToSearch;
      this.recParseDir(dirToSearch, fileName);

      process.nextTick(() => {
        this.emit("complete", {
          scanned: { files: this.result.length, dirs: this.dirs },
          found: this.result,
        });
      });
    });

    setTimeout(() => {
      this.emit("started");
    }, 0);
  }

  recParseDir(dirToSearch, fileName, readFiles, interimResult) {
    this.files = readFiles || fs.readdirSync(dirToSearch, { withFileTypes: true });
    this.result = interimResult || [];

    this.files.forEach(file => {

      const modifiedPath = join(dirToSearch, file.name);

      if (file.isDirectory()) {
        this.dirs++;
        this.result = this.recParseDir(
          modifiedPath,
          fileName,
          fs.readdirSync(modifiedPath, { withFileTypes: true }),
          this.result
        );
      } else {
        if (file.name.match(fileName)) {
          const foundFile = new FoundFile(file.name, this.getRelativePath(modifiedPath));

          process.nextTick(() => {
            this.emit("find", foundFile);
          });

          this.result.push(foundFile);
        }
      }
    });

    return this.result;
  }

  getRelativePath(absPath) {
    return absPath.split(this.baseDirToSearch)[1];
  }
}

module.exports = FindLib;
