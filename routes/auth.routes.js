// routes/auth.routes.js
const express = require("express");
const router = express.Router();
const {
  login,
  refreshToken,
  create,
  sendForgotPassword,
  verifyCode,
  changePass,
  userMe,
} = require("../controllers/auth.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");
const { validateRegister } = require("../middlewares/validate.middleware");

router.post("/login", validateRegister, login);
router.get('/user/me', authenticateToken, userMe);
router.post("/create", validateRegister, create);
router.get("/refresh-token", refreshToken);
router.post("/forgot-password", sendForgotPassword);
router.post("/reset-password", verifyCode);
router.post("/change-password", changePass);

module.exports = router;
