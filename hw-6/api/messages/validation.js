const { Segments } = require('celebrate');
const Joi = require('joi');

const checkMessageIdValidation = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.number().positive().integer().required()
  }),
};

const addMessageValidation = {
  [Segments.BODY]: Joi.object().keys({
    Text: Joi.string().min(3).max(255).required(),
  }),
};

exports.checkMessageIdValidation = checkMessageIdValidation;

exports.addMessageValidation = addMessageValidation;

exports.updateMessageValidation = {
  ...checkMessageIdValidation,
  [Segments.BODY]: Joi.object().keys({
    Text: Joi.string().min(1).required(),
  }),
};

exports.getMessageValidation = {
  [Segments.QUERY]: Joi.object().keys({
    sort: Joi.string(),
    limit: Joi.number().positive().integer().max(51),
    skip: Joi.number().positive().integer().max(501),
  }),
};
