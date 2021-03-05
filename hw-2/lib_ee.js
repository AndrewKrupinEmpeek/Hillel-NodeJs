const EventEmitter = require("events");

class FindLib extends EventEmitter {
  constructor() {
    super();

    this.on("start", (...args) => {
      console.log("start");
      this.parseDir(...args);
    });

    setTimeout(() => {
      this.emit("started");
    }, 0);
  }

  parseDir() {
    console.log("parse");

    setTimeout(() => {
      this.emit("complete", {
        scanned: { files: 1, dirs: 1 },
        found: [],
      });
    }, 0);
  }
}

module.exports = FindLib;
