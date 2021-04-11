const { createServer } = require('http');
const { existsSync } = require('fs');
const { join } = require('path');

const { getAssets, getMessages, addMessages, updateMessages, deleteMessages } = require('./controllers');
const {
  codeConstants: { NOT_FOUND, REDIRECT },
  pathConstants: { ASSETS, HOME, INDEX, MESSAGES },
  reqMethods: { GET, POST, PUT, DELETE },
  PORT,
  TIMER,
} = require('./constants');
const { createLogFile, logToFile, createContinuousLogFile, continuousLogToFile } = require('./log-utils');

createLogFile();
createContinuousLogFile();

const continuousLog = {};

const getRequestsData = () => {
  let data = '\n==========\n';

  data += Object.keys(continuousLog).reduce((acc, key) => {
    const agentSet = new Set(continuousLog[key]);
    return acc += `${key}: ${continuousLog[key].length} (${Array.from(agentSet).join(', ')})\n`;
  }, '');


  data += '==========\n';

  return data;
}

const timerId = setInterval(() => {
  const data = getRequestsData();
  continuousLogToFile(data);
}, TIMER);

const server = createServer( async (req, res) => {
  const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const startTime = Date.now();
  let finished = false;
  req.pathname = pathname;
  req.searchParams = searchParams;

  const resHandler = isClosed => {
    if (!isClosed) {
      finished = true;
    }

    const endTime = Date.now();
    const txt = `\n${isClosed ? 'CLOSED': 'FINISHED'}\n${isClosed ? '' : `Status ${res.statusCode}\n`}Pathname: ${req.pathname}\nStart Time ${startTime} ms\nEnd Time ${startTime} ms\nTime spend ${endTime - startTime} ms\n`;

    if (continuousLog[res.statusCode]) {
      continuousLog[res.statusCode].push(req.headers['user-agent']);
    } else {
      continuousLog[res.statusCode] = [req.headers['user-agent']];
    }

    console.log(txt);
    logToFile(txt);
  }

  res.once('finish', resHandler);

  res.once('close', () => {
    if (finished) return;
    res.removeListener('finish', resHandler);
    resHandler(true);
  });

  res.setHeader('Content-Type', 'text/plain');

  if (req.pathname === HOME || req.pathname === INDEX) {
    res.statusCode = REDIRECT;
    res.setHeader('Location', '/assets/index.html');
    res.end();
    return;
  }
  else if (req.pathname.startsWith(ASSETS) && existsSync(join(__dirname, req.pathname))) {
    getAssets(req, res);
    return;
  }
  else if (req.pathname.startsWith(MESSAGES)) {
    if (req.method === GET && req.pathname === MESSAGES) {
      getMessages(req, res);
      return;
    }
    if (req.method === POST && req.pathname === MESSAGES) {
      addMessages(req, res);
      return;
    }
    if (req.method === PUT && req.pathname.startsWith(`${MESSAGES}/`)) {
      updateMessages(req, res);
      return;
    }
    if (req.method === DELETE && req.pathname.startsWith(`${MESSAGES}/`)) {
      deleteMessages(req, res);
      return;
    }
  }

  res.statusCode = NOT_FOUND;
  res.write("Not found");
  res.end();
});

server.once('close', () => clearInterval(timerId));

server.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}/`);
});
