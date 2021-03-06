const os = require('os');

const Finder = require('./lib_ee');

const MyEE = new Finder();

const dirToSearch = process.argv[2] || os.homedir();

MyEE.on('started', () => {
  console.log('Parse started');
});

MyEE.emit('start', './node_modules', '.*e\.json');

MyEE.on('find', ({ name, path }) => {
  console.log(`File ${name} found in path: ${path}`);
  // path относительно dirToSearch
  // name - названия файла
});

// progress эмитится каждые 3 секунд, если не было события find
MyEE.on('progress', ({files, dir}) => {
  console.log(`Progress: ${files} files, ${dir} dir`);
});

MyEE.once('complete', ({ scanned: { files, dirs }, found }) => {
  console.log(
    "complete",
    `${files} files`,
    `${dirs} dirs`,
    found
  );
});

MyEE.once('error', (err) => {
  console.error(err);
  process.exit(1);
});
