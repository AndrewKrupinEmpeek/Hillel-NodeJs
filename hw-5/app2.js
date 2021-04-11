const express = require('express');
const nunjucks = require('nunjucks');
const { join } = require('path');
const dateFilter = require('nunjucks-date-filter');

const { getAssets, getMessages, addMessages, updateMessages, deleteMessages } = require('./controllers');
const {
  codeConstants: { NOT_FOUND, REDIRECT },
  pathConstants: { ASSETS, HOME, API, INDEX, MESSAGES },
  reqMethods: { GET, POST, PUT, DELETE },
  PORT,
  TIMER,
} = require('./constants');
const { createLogFile, logToFile, createContinuousLogFile, continuousLogToFile } = require('./log-utils');
const api = require('./api');

const server = express();
server.locals = {
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
};

let env = nunjucks.configure(join(__dirname, 'public', 'views'), {
  autoescape: false,
  express: server,
  watch: true
});
env.addFilter('date', dateFilter);

server.use(express.json());

server.use(API, api);

server.use(ASSETS, express.static(join(__dirname, 'public', 'assets')));

server.use(HOME, async (_, res) => {
  res.render(
    'index.nunjucks',
    {
      messages: res.app.locals.messages
    }
  );
});

server.get('/*', (_, res) => res.redirect(HOME));

server.listen(
  PORT,
  () => console.log(`Server started on http://localhost:${PORT}/`)
);
