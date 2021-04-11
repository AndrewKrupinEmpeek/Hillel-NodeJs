const {
  codeConstants: { NOT_FOUND },
} = require('../../constants');

const sortMessages = (sort, messages) => {
  let _messages = messages.slice();
  const direction = sort.charAt(0);
  const field = sort.substr(1);
  return _messages.sort((a, b) => {
    return direction === '-'
      ? b[field] - a[field]
      : a[field] - b[field];
  });
};

const limitMessages = (limit, messages) => messages.slice(0, limit);

const skipMessages = (skip, messages) => messages.slice(skip);

exports.getList = async (req, res, next) => {
  const { sort, limit, skip } = req.query;

  if (sort && !isNaN(sort) || limit && isNaN(limit) || skip && isNaN(skip)) {
    return next({
      code: NOT_FOUND,
      message: 'Not found'
    });
  }

  let _messages = req.app.locals.messages.slice();

  if (sort) {
    _messages = sortMessages(sort, _messages);
  }

  if (skip) {
    _messages = skipMessages(skip, _messages);
  }

  if (limit) {
    _messages = limitMessages(limit, _messages);
  }

  res.json(_messages);
};

exports.getById = async (req, res, next) => {
  const { id } = req.params;
  const message = req.app.locals.messages.find(x => x.Id === id);

  if (!message) {
    return next({
      code: NOT_FOUND,
      message: 'Not found :('
    });
  }

  res.json(message);
};

exports.add = async (req, res) => {
  const body = {...req.body};
  body.Id = req.app.locals.messages.length + 1;
  body.AddedAt = new Date();
  // res.destroy(); // for test

  req.app.locals.messages.push(body);

  res.json(body);
};

exports.update = async (req, res, next) => {
  const body = {...req.body};
  const pathId = +req.params.id;
  const message = req.app.locals.messages.find(x => x.Id === pathId);

  if (message) {
    Object.assign(message, body);
    res.json(message);
  } else {
    return next({
      code: NOT_FOUND,
      message: 'Not found :('
    });
  }
};

exports.remove = async (req, res, next) => {
  const pathId = +req.params.id;
  const messageIndex = req.app.locals.messages.findIndex(x => x.Id === pathId);

  if (messageIndex + 1) {
    req.app.locals.messages.splice(messageIndex, 1);
    res.json(pathId);
  } else {
    return next({
      code: NOT_FOUND,
      message: 'Not found :('
    });
  }
};
