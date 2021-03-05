const FindLib = require('./lib_ee');

const MyEE = new FindLib();

const dirToFind = process.argv[2] || __dirname;

MyEE.on('started', () => {
    console.log('Parse started');
});

MyEE.emit('start', dirToFind, '.*e\.json');

MyEE.on('find', ({ path, name }) => {
    // path относительно dirToFind
    // name - названия файла
});

// progress эмититься каждые 3 секунд, если не было события find
MyEE.on('progress', ({files, dir}) => {
    console.log(`Progress: ${files} files, ${dir} dir`);
});

MyEE.once('complete', ({ scanned: { files, dirs }, found }) => {
    console.log("complete", files, dirs, found);
    // found => [{ name, path }] path относительно dirToFind
});

MyEE.once('error', (err) => {
    process.exit(1);
});
