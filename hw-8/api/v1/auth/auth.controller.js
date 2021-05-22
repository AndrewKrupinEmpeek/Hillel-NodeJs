const { getUserPassword, setUserVerification, registerUser, compareUserPassword } = require('../user/user.service');

exports.verifyUserCtrl = async (req, res, next) => {
  try {
    const { confirmationCode } = req.params;
    await setUserVerification(confirmationCode);
    res.send({ message: 'email confirmed'});
  } catch (error) {
    next(error);
  }
};

exports.loginUserCtrl = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await getUserPassword(email);
    compareUserPassword(password, user.password);
    res.send({ message: 'login success', user: user._id });
  } catch (error) {
    next(error);
  }
};

exports.registerUserCtrl = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, username } = req.body;
    const user = await registerUser({email, password, firstName, lastName, username});

    res.json({
      message: 'register success',
      user: user,
    });
  } catch (error) {
    next(error);
  }
};
