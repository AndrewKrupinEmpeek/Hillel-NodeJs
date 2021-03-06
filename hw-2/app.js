const FindLib = require('./lib_ee');

const MyEE = new FindLib();

const dirToSearch = process.argv[2] || __dirname;

MyEE.on('started', () => {
  console.log('Parse started');
});

MyEE.emit('start', dirToSearch, '.*e\.json');

MyEE.on('find', ({ name, path }) => {
  console.log(`File ${name} found in path: ${path}`);
  // path относительно dirToSearch
  // name - названия файла
});

// progress эмититься каждые 3 секунд, если не было события find
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
  process.exit(1);
});
