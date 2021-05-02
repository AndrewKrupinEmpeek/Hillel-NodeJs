const { Router } = require('express');
const { getCurrentUser, loginUser, logoutUser } = require('./controller');
const { validation } = require('../middlewares');
const { loginUserValidation } = require('./validation');

const router = Router();

router.get('/', getCurrentUser);
router.get('/logout', logoutUser);
router.post('/login', validation(loginUserValidation), loginUser);


module.exports = router;
