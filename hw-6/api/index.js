const { Router } = require('express');
const { isCelebrateError } = require('celebrate');

const messagesModule = require('./messages');
const {
  codeConstants: { NOT_ACCEPTABLE, BAD_REQUEST },
} = require('../constants');

const router = Router();

router.use('/messages', messagesModule);

router.use((err, _, res, next) => {
  if (isCelebrateError(err)) {
    const [field, error] = err.details.entries().next().value;
    res.status(NOT_ACCEPTABLE).json({field, message: error.message});
    return;
  }

  res.status(err.code || BAD_REQUEST).json({message: err.message});
});

module.exports = router;
