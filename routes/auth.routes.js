// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { login, refreshToken, create, sendForgotPassword, verifyCode, changePass } = require('../controllers/auth.controller');
const validateRegister = require('../middlewares/validate.middleware');

router.post('/login', validateRegister, login);
router.post('/create', validateRegister,  create)
router.post('/token', refreshToken);
router.post('/forgot-password', sendForgotPassword)
router.post('/reset-password', verifyCode)
router.post("/change-password", changePass)

module.exports = router;
