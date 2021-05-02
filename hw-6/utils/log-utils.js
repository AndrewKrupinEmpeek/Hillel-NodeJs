const { appendFile, appendFileSync } = require('fs');

const { TIMER } = require('../constants');

let _logFileName;
let _continuousLogFileName;
let _timerId;

const getRequestsData = server => {
  let data = '\n==========\n';

  data += Object.keys(server.locals.continuousLog).reduce((acc, key) => {
    const agentSet = new Set(server.locals.continuousLog[key]);
    return acc += `${key}: ${server.locals.continuousLog[key].length} (${Array.from(agentSet).join(', ')})\n`;
  }, '');


  data += '==========\n';

  return data;
}

const createContinuousLogFile = () => {
  _continuousLogFileName = `continuous_log_${new Date().toLocaleString().split('.').join('_').split(':').join('_')}`;
  appendFileSync(`./log/${_continuousLogFileName}.txt`, '', function (err) {
    if (err) throw err;
  });
}

const continuousLogToFile = async (data) => {
  await appendFile(`./log/${_continuousLogFileName}.txt`, data, function (err) {
    if (err) throw err;
  });
}

const createLogFile = () => {
  _logFileName = new Date().toLocaleString().split('.').join('_').split(':').join('_');
  appendFileSync(`./log/${_logFileName}.txt`, '', function (err) {
    if (err) throw err;
  });
}

const logToFile = async (data) => {
  await appendFile(`./log/${_logFileName}.txt`, data, function (err) {
    if (err) throw err;
  });
}

const resHandler = (req, res, startTime, isClosed) => {
  const endTime = Date.now();
  const txt = `\n${isClosed ? 'CLOSED': 'FINISHED'}\n${isClosed ? '' : `Status ${res.statusCode}\n`}Pathname: ${req.baseUrl}\nStart Time ${startTime} ms\nEnd Time ${startTime} ms\nTime spend ${endTime - startTime} ms\n`;

  if (req.app.locals.continuousLog[res.statusCode]) {
    req.app.locals.continuousLog[res.statusCode].push(req.headers['user-agent']);
  } else {
    req.app.locals.continuousLog[res.statusCode] = [req.headers['user-agent']];
  }

  if (!_logFileName) {
    createLogFile();
  }

  logToFile(txt);
}

exports.initContinuousLog = server => {
  createContinuousLogFile();

  _timerId = setInterval(() => {
    const data = getRequestsData(server);
    continuousLogToFile(data);
  }, TIMER);
};

exports.stopContinuousLog = () => {
  clearInterval(_timerId);
};

exports.log = (req, res, next) => {
  const startTime = Date.now();
  let finished = false;

  res.once('finish', () => {
    finished = true;
    resHandler(req, res, startTime);
  });

  res.once('close', () => {
    if (finished) return;
    resHandler(req, res, startTime, true);
  });

  next();
};