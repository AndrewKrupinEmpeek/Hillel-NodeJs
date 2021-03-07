const Finder = require('./Finder');
const { EVENT_INIT, EVENT_COMPLETE, EVENT_ERROR, EVENT_FIND, EVENT_PROGRESS } = require('./constants');

const finder = new Finder({
  path: __dirname,
  searchDepth: 0,
  fileName: 'app.js'
});

finder.on(EVENT_INIT, () => {
  finder.parse();
});

finder.on(EVENT_FIND, ({ name, path }) => {
  console.log(`File ${name} found in path: ${path}`);
});

finder.on(EVENT_PROGRESS, ({files, directories}) => {
  console.log(`Progress: ${files} files, ${directories} dir`);
});

finder.once(EVENT_COMPLETE, ({ scanned: { files, dirs }, found }) => {
  console.log(
    'complete',
    `${files} files`,
    `${dirs} dirs`,
    found
  );
});

finder.once(EVENT_ERROR, (err) => {
  console.error('aAAAAAAAAAAAAAAAAAA');
  console.error(err);
  process.exit(1);
});
