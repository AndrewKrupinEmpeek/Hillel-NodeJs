const { join, extname } = require('path');
const { parse } = require('querystring');
const { createReadStream } = require('fs');
const FileType = require('file-type');

const {
  codeConstants: { NOT_FOUND },
} = require('./constants');

const messages = [
  {
    id: 1,
    date: new Date(),
    text: 'text 2',
    author: 'author 2',
  },
];

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

const getBody = async req => {
  let body = '';
  for await (let chunk of req) body += chunk;
  return body;
}

const getParsedBody = async req => {
  let body = await getBody(req);

  switch (req.headers['content-type']) {
    case 'application/json':
      return JSON.parse(body);
    case 'application/x-www-form-urlencoded':
      return parse(body);
  }
}

exports.getAssets = async (req, res) => {
  const filePath = join(__dirname, req.pathname);
  const rs = createReadStream(filePath);
  const currentMime = extname(filePath);
  if (['.html'].includes(currentMime)) {
    res.setHeader('Content-Type', 'text/html');
  }
  else if (['.css'].includes(currentMime)) {
    res.setHeader('Content-Type', 'text/css');
  }
  else if (['.js'].includes(currentMime)) {
    res.setHeader('Content-Type', 'text/javascript');
  }
  else {
    const type = await FileType.fromFile(filePath);
    if (type?.mime) {
      res.setHeader('Content-Type', type.mime);
    }
  }

  rs.pipe(res);
};

exports.getMessages = async (req, res) => {
  const { sort, limit, skip } = parse(req.searchParams.toString());

  if (sort && !isNaN(sort) || limit && isNaN(limit) || skip && isNaN(skip)) {
    res.statusCode = NOT_FOUND;
    res.write("Not found");
    res.end();
    return;
  }

  let _messages = messages.slice();

  if (sort) {
    _messages = sortMessages(sort, _messages);
  }

  if (skip) {
    _messages = skipMessages(skip, _messages);
  }

  if (limit) {
    _messages = limitMessages(limit, _messages);
  }

  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(_messages));
  res.end();
};

exports.addMessages = async (req, res) => {
  const body = await getParsedBody(req);
  body.id = messages.length + 1;
  body.date = new Date();
  // res.destroy(); // for test

  messages.push(body);

  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(body));
  res.end();
};

exports.updateMessages = async (req, res) => {
  const body = await getParsedBody(req);
  const splittedPath = req.pathname.split('/');
  const pathId = +splittedPath[splittedPath.length - 1];
  const message = messages.find(x => x.id === pathId);

  if (message) {
    Object.assign(message, body);
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(message));
  } else {
    res.statusCode = NOT_FOUND;
    res.write("Not found");
  }
  res.end();
};

exports.deleteMessages = async (req, res) => {
  const splittedPath = req.pathname.split('/');
  const pathId = +splittedPath[splittedPath.length - 1];
  const messageIndex = messages.findIndex(x => x.id === pathId);

  if (messageIndex + 1) {
    messages.splice(messageIndex, 1);
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(pathId));
  } else {
    res.statusCode = NOT_FOUND;
    res.write("Not found");
  }
  res.end();
};
