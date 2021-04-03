module.exports = {
  codeConstants: {
    REDIRECT: 302,
    NOT_FOUND: 404,
  },
  pathConstants: {
    ASSETS: '/assets',
    MESSAGES: '/messages',
    HOME: '/',
    INDEX: '/index.html',
  },
  reqMethods: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
  },
  PORT: process.env.PORT || '8000',
  TIMER: 10000,
  // TIMER: 60000,
};
