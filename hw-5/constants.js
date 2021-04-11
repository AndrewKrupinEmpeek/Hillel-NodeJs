module.exports = {
  codeConstants: {
    REDIRECT: 302,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    NOT_ACCEPTABLE: 406,
  },
  pathConstants: {
    ASSETS: '/assets',
    MESSAGES: '/messages',
    HOME: '/',
    API: '/api',
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
