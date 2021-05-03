const { Router } = require('express');
const { getList, getById, add, update, remove } = require('./controller');
const { checkMessageIdValidation, addMessageValidation, updateMessageValidation, getMessageValidation } = require('./validation');
const { validation } = require('../middlewares');

const router = Router();

router.get('/', validation(getMessageValidation), getList);
router.get('/:id', validation(checkMessageIdValidation), getById);
router.post('/', validation(addMessageValidation), add);
router.put('/:id', validation(updateMessageValidation), update);
router.delete('/:id', remove);

module.exports = router;
