require('dotenv').config();

const { createLogFile, logToFile } = require('./log-utils');
require('./colorPatch');
const Finder = require('./Finder');
const { EVENT_INIT, EVENT_COMPLETE, EVENT_ERROR, EVENT_FIND, EVENT_PROGRESS } = require('./constants');

createLogFile();

const finder = new Finder({
  path: __dirname,
  searchDepth: 0,
  fileName: 'app'
});

finder.on(EVENT_INIT, () => {
  finder.parse();
});

finder.on(EVENT_FIND, async ({ name, path }) => {
  const txt = `File ${name} found in path: ${path}\n`;
  console.log(txt);
  await logToFile(txt);
});

finder.on(EVENT_PROGRESS, async ({files, directories}) => {
  const txt = `Progress: ${files} files, ${directories} dir\n`;
  console.log(txt);
  await logToFile(txt);
});

finder.once(EVENT_COMPLETE, async ({ scanned: { files, dirs }, found }) => {
  const txt = `\n\n\ncomplete\n
    ${files} files\n
    ${dirs} dirs: \n ============= \n`;
  console.log(
    txt + found.map(x => `name: ${x.name};\npath: ${x.path} \n ============= \n`).join('\n')
  );
  await logToFile(
    txt + found.map(x => `name: ${x.name};\npath: ${x.path} \n ============= \n`).join('\n')
  );
});

finder.once(EVENT_ERROR, async (err) => {
  console.error(err);
  // await logToFile(err);
  process.exit(1);
});
