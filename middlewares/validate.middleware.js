const { body, validationResult } = require('express-validator');

const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Email noto‘g‘ri formatda')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6, max: 20 })
    .withMessage('Parol kamida 6 ta belgidan iborat bo‘lishi kerak'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const extractedErrors = errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      }));
      return res.status(422).json({ message: extractedErrors[0].message, errors: extractedErrors });
    }
    next();
  },
];

const employeeValidation = (req) => {
  const isUpdate = req.method === 'PUT';
  return [
    // Step One
    body('stepOne.firstName')
      .if(() => !isUpdate)
      .notEmpty()
      .withMessage('Ism majburiy'),
    body('stepOne.lastName')
      .if(() => !isUpdate)
      .notEmpty()
      .withMessage('Familiya majburiy'),
    body('stepOne.mobileNumber')
      .if(() => !isUpdate)
      .notEmpty()
      .withMessage('Telefon raqami majburiy'),
    body('stepOne.emailAddress')
      .if(() => !isUpdate)
      .isEmail()
      .withMessage('Email noto‘g‘ri formatda')
      .normalizeEmail(),
    body('stepOne.dateOfBirth')
      .if(() => !isUpdate)
      .notEmpty()
      .withMessage('Tug‘ilgan sana majburiy'),
    body('stepOne.maritalStatus')
      .if(() => !isUpdate)
      .notEmpty()
      .withMessage('Oilaviy holat majburiy'),
    body('stepOne.gender')
      .if(() => !isUpdate)
      .notEmpty()
      .withMessage('Jins majburiy'),
    body('stepOne.nationality')
      .if(() => !isUpdate)
      .notEmpty()
      .withMessage('Millat majburiy'),
    body('stepOne.address')
      .if(() => !isUpdate)
      .notEmpty()
      .withMessage('Manzil majburiy'),
    body('stepOne.city')
      .if(() => !isUpdate)
      .notEmpty()
      .withMessage('Shahar majburiy'),
    body('stepOne.state')
      .if(() => !isUpdate)
      .notEmpty()
      .withMessage('Davlat majburiy'),
    body('stepOne.zipCode')
      .if(() => !isUpdate)
      .notEmpty()
      .withMessage('Pochta indeksi majburiy'),

    // Step Two
    body('stepTwo.employeeid')
      .if(() => !isUpdate)
      .notEmpty()
      .withMessage('Xodim ID majburiy'),
    body('stepTwo.userName')
      .if(() => !isUpdate)
      .notEmpty()
      .withMessage('Foydalanuvchi nomi majburiy'),
    body('stepTwo.employeeType')
      .if(() => !isUpdate)
      .notEmpty()
      .withMessage('Xodim turi majburiy'),
    body('stepTwo.emailAddress')
      .if(() => !isUpdate)
      .isEmail()
      .withMessage('Step Two email noto‘g‘ri formatda')
      .normalizeEmail(),
    body('stepTwo.department')
      .if(() => !isUpdate)
      .notEmpty()
      .withMessage('Bo‘lim majburiy'),
    body('stepTwo.designation')
      .if(() => !isUpdate)
      .notEmpty()
      .withMessage('Lavozim majburiy'),
    body('stepTwo.workDays')
      .if(() => !isUpdate)
      .notEmpty()
      .withMessage('Ish kunlari majburiy'),
    body('stepTwo.joiningDate')
      .if(() => !isUpdate)
      .notEmpty()
      .withMessage('Ishga qo‘shilgan sana majburiy'),
    body('stepTwo.workLocation')
      .if(() => !isUpdate)
      .notEmpty()
      .withMessage('Ish joyi majburiy'),

    // Step Three
    body('stepThree.view.appointmentLetter')
      .optional()
      .isArray()
      .withMessage('Tayinlash xati massiv bo‘lishi kerak')
      .custom((value) => {
        if (!value.every((item) => typeof item === 'object' && item.id && item.name && 'isExisting' in item)) {
          throw new Error('Tayinlash xati noto‘g‘ri formatda');
        }
        return true;
      }),
    body('stepThree.view.relivingLetter')
      .optional()
      .isArray()
      .withMessage('Ishdan bo‘shatish xati massiv bo‘lishi kerak')
      .custom((value) => {
        if (!value.every((item) => typeof item === 'object' && item.id && item.name && 'isExisting' in item)) {
          throw new Error('Ishdan bo‘shatish xati noto‘g‘ri formatda');
        }
        return true;
      }),
    body('stepThree.view.salarySlips')
      .optional()
      .isArray()
      .withMessage('Oylik maosh varaqalari massiv bo‘lishi kerak')
      .custom((value) => {
        if (!value.every((item) => typeof item === 'object' && item.id && item.name && 'isExisting' in item)) {
          throw new Error('Oylik maosh varaqalari noto‘g‘ri formatda');
        }
        return true;
      }),
    body('stepThree.view.experienceLetter')
      .optional()
      .isArray()
      .withMessage('Tajriba xati massiv bo‘lishi kerak')
      .custom((value) => {
        if (!value.every((item) => typeof item === 'object' && item.id && item.name && 'isExisting' in item)) {
          throw new Error('Tajriba xati noto‘g‘ri formatda');
        }
        return true;
      }),
    body('stepThree.delete.appointmentLetter')
      .optional()
      .isArray()
      .withMessage('O‘chiriladigan tayinlash xatlari massiv bo‘lishi kerak'),
    body('stepThree.delete.relivingLetter')
      .optional()
      .isArray()
      .withMessage('O‘chiriladigan ishdan bo‘shatish xatlari massiv bo‘lishi kerak'),
    body('stepThree.delete.salarySlips')
      .optional()
      .isArray()
      .withMessage('O‘chiriladigan oylik maosh varaqalari massiv bo‘lishi kerak'),
    body('stepThree.delete.experienceLetter')
      .optional()
      .isArray()
      .withMessage('O‘chiriladigan tajriba xatlari massiv bo‘lishi kerak'),

    // Step Four
    body('stepFour.email')
      .if(() => !isUpdate)
      .isEmail()
      .withMessage('Step Four email noto‘g‘ri formatda')
      .normalizeEmail(),
    body('stepFour.slackId')
      .if(() => !isUpdate)
      .notEmpty()
      .withMessage('Slack ID majburiy'),
    body('stepFour.skypeId')
      .if(() => !isUpdate)
      .notEmpty()
      .withMessage('Skype ID majburiy'),
    body('stepFour.githubId')
      .optional()
      .isString()
      .withMessage('GitHub ID satr bo‘lishi kerak'),

    // Error handler
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const extractedErrors = errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        }));
        return res.status(422).json({
          message: extractedErrors[0].message,
          errors: extractedErrors,
        });
      }
      next();
    },
  ];
};

module.exports = { validateRegister, employeeValidation };