const { celebrate } = require('celebrate');

exports.validation = (schema, options = {}) => {
  return celebrate(schema, {
    ...options,
    abortEarly: false,
    stripUnknown: { objects: true },
  });
};
