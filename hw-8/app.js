require('./checkEnv');

const express = require('express');
const mongoose = require('mongoose');
const { isCelebrateError } = require('celebrate');

const { PORT, host, mongodb: { uri, options } } = require('./config');

const { paths: { API } } = require('./constants');
const api = require('./api');

mongoose.connect(uri, options);
mongoose.set('debug', process.env.NODE_ENV === 'dev');

const app = express();

app.use(express.json());

// app.get('/', (req, res) => res.send('Hey there!'));

app.use(`/${API}`, api);

app.use((err, req, res, next) => {
  let mongoCode;

  if (isCelebrateError(err)) {
    const [field, error] = err.details.entries().next().value;
    return res.status(406).json({ message: error.message, field });
  }

  if (err.code > 550) {
    mongoCode = err.code;
    err.code = 500;
  }

  res
    .status(err.code || 400)
    .json({ message: err.message, ...(mongoCode ? { mongoCode } : {}) });
});

app.listen(PORT, () => { console.log(`\nServer has started on ${host}\nENV:${process.env.NODE_ENV}\n`) });
