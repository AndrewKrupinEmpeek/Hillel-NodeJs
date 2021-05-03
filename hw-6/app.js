require('dotenv').config();

const express = require('express');
const nunjucks = require('nunjucks');
const { join } = require('path');
const dateFilter = require('nunjucks-date-filter');
const cookieParser = require('cookie-parser');

const {
  pathConstants: { ASSETS, HOME, API },
  PORT,
} = require('./constants');
const { log, initContinuousLog, stopContinuousLog } = require('./utils/log-utils');
const { generateSecret } = require('./utils/generateSecret');
const api = require('./api');
const { getMessages } = require('./api/messages/controller');

const server = express();
server.locals = {
  authorized: false,
  messages: [
    {
      Id: 1,
      Text: 'text 1',
      Sender: 'sender 1',
      AddedAt: new Date(),
    },
    {
      Id: 3,
      Text: 'text 3',
      Sender: 'sender 3',
      AddedAt: new Date(),
    },
    {
      Id: 4,
      Text: 'text 4',
      Sender: 'sender 4',
      AddedAt: new Date(),
    },
    {
      Id: 2,
      Text: 'text 2',
      Sender: 'sender 2',
      AddedAt: new Date(),
    },
  ],
  continuousLog: {},
};

let env = nunjucks.configure(join(__dirname, 'public', 'views'), {
  autoescape: false,
  express: server,
  watch: true
});
env.addFilter('date', dateFilter);

const secret = process.env.COOKIE_SECRET || generateSecret(40);
console.log('secret');
console.log(secret);

server.use(express.json());
server.use(cookieParser(secret));

server.use(log);

server.use(API, api);

server.use(ASSETS, express.static(join(__dirname, 'public', 'assets')));

server.use(HOME, async (req, res) => {
  res.render(
    'index.nunjucks',
    {
      messages: getMessages(req),
      authorized: req.signedCookies.user,
    }
  );
});

server.get('/*', (_, res) => res.redirect(HOME));

server.listen(
  PORT,
  () => {
    console.log(`Server started on http://localhost:${PORT}/`);

    initContinuousLog(server);
  }
);

server.once('close', () => stopContinuousLog());
