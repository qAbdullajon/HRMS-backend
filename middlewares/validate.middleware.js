const { body, validationResult } = require('express-validator');

const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Email noto‘g‘ri formatda')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6, max: 20 })
    .withMessage('Parol kamida 6 ta belgidan iborat bo‘lishi kerak'),

  // Error handling middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const extractedErrors = errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }));
      console.log(extractedErrors[0]);
      
      return res.status(422).json({ message: extractedErrors[0].message });
    }
    next();
  }
];

module.exports = validateRegister;
