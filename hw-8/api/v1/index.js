const { Router } = require('express');
const { paths: { AUTH, USER } } = require('../../constants');
const router = Router();
const auth = require('./auth');
const user = require('./user');

router.use(`/${AUTH}`, auth);
router.use(`/${USER}`, user);

module.exports = router;
