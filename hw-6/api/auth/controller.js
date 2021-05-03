const {
  codeConstants: { UNAUTHORIZED },
  cookies: { USER, USER_EXPIRATION },
} = require('../../constants');

exports.getCurrentUser = (req, res, next) => {
  const { user } = req.signedCookies;

  if (!user) {
    next({
      code: UNAUTHORIZED,
      message: 'Unauthorized'
    });
    return;
  }

  res.send({
    user: user
  });
};

exports.loginUser = (req, res) => {
  res.cookie(
    USER,
    req.body.username,
    {
      httpOnly: true,
      signed: true,
      expires : new Date(Date.now() + USER_EXPIRATION) ,
    }
  );
  req.app.locals.authorized = true;
  res.send({
    message: 'Login success'
  });
};

exports.logoutUser = (req, res) => {
  res.clearCookie(USER);
  req.app.locals.authorized = false;
  res.send({
    message: 'Logout success'
  });
};
