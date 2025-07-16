const Joi = require('joi');

// Registration validation
const validateRegistration = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email({ minDomainSegments: 2 })
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'string.empty': 'Email is required'
      }),
    password: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters',
        'string.pattern.base': 'Password must contain at least one lowercase, one uppercase, one number and one special character',
        'string.empty': 'Password is required'
      })
  });

  return schema.validate(data);
};

// Password reset validation
const validatePasswordReset = (data) => {
  const schema = Joi.object({
    password: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters',
        'string.pattern.base': 'Password must contain at least one lowercase, one uppercase, one number and one special character',
        'string.empty': 'Password is required'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'string.empty': 'Please confirm your password'
      })
  });

  return schema.validate(data);
};

module.exports = {
  validateRegistration,
  validatePasswordReset
};