const express = require("express");
const { createEmployee, getAll, employeeDelete, employeeUpdate } = require("../controllers/employee.controller");
const { employeeValidation } = require("../middlewares/validate.middleware");
const { authenticateToken } = require("../middlewares/auth.middleware");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { exploreeParse } = require("../middlewares/employee.middleware");
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/files");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`
        )
      );
    }
  },
});

router.post(
  "/create",
  authenticateToken,
  upload.fields([
    { name: "avatarImage", maxCount: 1 },
    { name: "appointmentLetter", maxCount: 5 },
    { name: "relivingLetter", maxCount: 5 },
    { name: "salarySlips", maxCount: 5 },
    { name: "experienceLetter", maxCount: 5 },
  ]),
  exploreeParse,
  createEmployee
);

router.put(
  "/update/:id",
  authenticateToken,
  upload.fields([
    { name: "avatarImage", maxCount: 1 },
    { name: "appointmentLetter", maxCount: 5 },
    { name: "relivingLetter", maxCount: 5 },
    { name: "salarySlips", maxCount: 5 },
    { name: "experienceLetter", maxCount: 5 },
  ]),
  exploreeParse,
  // employeeValidation,
  employeeUpdate
);

router.get('/get/all', authenticateToken, getAll);

router.delete('/delete/:id', authenticateToken, employeeDelete);

module.exports = router;