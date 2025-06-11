const { Op } = require("sequelize");
const sequelize = require("../config/db");
const Employee = require("../models/employee/employee");
const StepOne = require("../models/employee/step1");
const StepTwo = require("../models/employee/step2");
const StepThree = require("../models/employee/step3");
const StepFour = require("../models/employee/step4");
const fs = require("fs").promises;
const { v1: uuidv4 } = require("uuid");
const path = require("path");

exports.createEmployee = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { stepOne, stepTwo, stepThree, stepFour } = req.body;
    const files = req.files || {};

    const employee = await Employee.create({}, { transaction });

    let avatarImagePath = null;
    if (files.avatarImage && files.avatarImage[0]) {
      const extension = path.extname(files.avatarImage[0].originalname);
      const newFilename = `${uuidv4()}${extension}`;
      const newPath = path.join(__dirname, "../public/files", newFilename);
      await fs.rename(files.avatarImage[0].path, newPath);
      avatarImagePath = `/files/${newFilename}`;
    }

    const processFile = async (file) => {
      const extension = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, extension);
      const newFilename = `${uuidv4()}${extension}`;
      const newPath = path.join(__dirname, "../public/files", newFilename);
      await fs.rename(file.path, newPath);
      return {
        name: baseName,
        url: `/files/${newFilename}`,
      };
    };

    const stepThreeFiles = {
      appointmentLetter: await Promise.all(
        (files.appointmentLetter || []).slice(0, 5).map(processFile)
      ),
      relivingLetter: await Promise.all(
        (files.relivingLetter || []).slice(0, 5).map(processFile)
      ),
      salarySlips: await Promise.all(
        (files.salarySlips || []).slice(0, 5).map(processFile)
      ),
      experienceLetter: await Promise.all(
        (files.experienceLetter || []).slice(0, 5).map(processFile)
      ),
    };

    const stepOneData = {
      firstName: stepOne.firstName,
      lastName: stepOne.lastName,
      mobileNumber: stepOne.mobileNumber,
      emailAddress: stepOne.emailAddress,
      dateOfBirth: stepOne.dateOfBirth,
      maritalStatus: stepOne.maritalStatus,
      gender: stepOne.gender,
      nationality: stepOne.nationality,
      address: stepOne.address,
      city: stepOne.city,
      state: stepOne.state,
      zipCode: stepOne.zipCode,
      imagePath: avatarImagePath,
      employeeId: employee.id,
    };

    // Create StepOne
    await StepOne.create(stepOneData, { transaction });

    // Clean StepTwo data (exclude unwanted fields)
    const stepTwoData = {
      employeeid: stepTwo.employeeid,
      userName: stepTwo.userName,
      employeeType: stepTwo.employeeType,
      emailAddress: stepTwo.emailAddress,
      department: stepTwo.department,
      designation: stepTwo.designation,
      workDays: stepTwo.workDays,
      joiningDate: stepTwo.joiningDate,
      workLocation: stepTwo.workLocation,
      employeeId: employee.id,
    };

    // Create StepTwo (if non-empty)
    if (Object.keys(stepTwoData).some((key) => stepTwoData[key])) {
      await StepTwo.create(stepTwoData, { transaction });
    }

    // Create StepThree
    await StepThree.create(
      {
        appointmentLetter: stepThreeFiles.appointmentLetter,
        relivingLetter: stepThreeFiles.relivingLetter,
        salarySlips: stepThreeFiles.salarySlips,
        experienceLetter: stepThreeFiles.experienceLetter,
        employeeId: employee.id,
      },
      { transaction }
    );

    // Clean StepFour data
    const stepFourData = {
      email: stepFour.email,
      slackId: stepFour.slackId,
      skypeId: stepFour.skypeId,
      githubId: stepFour.githubId,
      employeeId: employee.id,
    };

    // Create StepFour (if non-empty)
    if (Object.keys(stepFourData).some((key) => stepFourData[key])) {
      await StepFour.create(stepFourData, { transaction });
    }

    await transaction.commit();

    res.status(201).json({
      message: "Xodim muvaffaqiyatli yaratildi",
      employeeId: employee.id,
    });
  } catch (error) {
    console.error("createEmployee xatosi:", {
      message: error.message,
      stack: error.stack,
    });

    // Cleanup uploaded files on error
    try {
      const imagesDir = path.join(__dirname, "../public/files");
      const filesDir = path.join(__dirname, "../public/files");
      const filesToDelete = [
        ...(files.avatarImage || []).map((f) =>
          path.join(imagesDir, path.basename(f.path))
        ),
        ...(files.appointmentLetter || []).map((f) =>
          path.join(filesDir, path.basename(f.path))
        ),
        ...(files.relivingLetter || []).map((f) =>
          path.join(filesDir, path.basename(f.path))
        ),
        ...(files.salarySlips || []).map((f) =>
          path.join(filesDir, path.basename(f.path))
        ),
        ...(files.experienceLetter || []).map((f) =>
          path.join(filesDir, path.basename(f.path))
        ),
      ];
      await Promise.all(
        filesToDelete.map((filePath) =>
          fs
            .unlink(filePath)
            .catch((err) =>
              console.error(`Failed to delete ${filePath}:`, err.message)
            )
        )
      );
    } catch (cleanupError) {
      console.error("Fayl tozalashda xato:", cleanupError.message);
    }

    await transaction.rollback();
    res.status(500).json({
      message: "Server xatosi",
      error: error.message,
    });
  }
};

exports.employeeUpdate = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { stepOne, stepTwo, stepThree, stepFour, isDeleteAvatar } = req.body;
    const files = req.files || {};

    const employee = await Employee.findOne({ where: { id }, transaction });
    if (!employee) {
      await transaction.rollback();
      return res.status(404).json({ message: "Xodim topilmadi" });
    }

    // Handle avatar image
    let avatarImagePath = stepOne.imagePath || null;
    if (isDeleteAvatar === "true" && stepOne.imagePath) {
      try {
        await fs.unlink(
          
          path.join(__dirname, "../public", stepOne.imagePath)
        );
      } catch (err) {
        console.error("Avatar faylini o‘chirishda xato:", err.message);
      }
      avatarImagePath = null;
    }
    
    if (files.avatarImage && files.avatarImage[0]) {
      if (stepOne.imagePath) {
        try {
          await fs.unlink(
            path.join(__dirname, "../public", stepOne.imagePath)
          );
        } catch (err) {
          console.error("Eski avatar faylini o‘chirishda xato:", err.message);
        }
      }
      avatarImagePath = `/files/${files.avatarImage[0].filename}`;
    }

    // Handle StepThree files and deletions
    const stepThreeRecord = await StepThree.findOne({
      where: { employeeId: id },
      transaction,
    });
    const existingFiles = stepThreeRecord
      ? {
          appointmentLetter: stepThreeRecord.appointmentLetter || [],
          relivingLetter: stepThreeRecord.relivingLetter || [],
          salarySlips: stepThreeRecord.salarySlips || [],
          experienceLetter: stepThreeRecord.experienceLetter || [],
        }
      : {
          appointmentLetter: [],
          relivingLetter: [],
          salarySlips: [],
          experienceLetter: [],
        };

    // Delete files marked for removal
    const deleteFiles = stepThree.delete || {};
    for (const field of [
      "appointmentLetter",
      "relivingLetter",
      "salarySlips",
      "experienceLetter",
    ]) {
      const idsToDelete = deleteFiles[field] || [];
      const urlsToDelete = (stepThree.view[field] || [])
        .filter((doc) => doc && doc.id && idsToDelete.includes(doc.id))
        .map((doc) => doc.url)
        .filter((url) => url); // Ensure URL exists
      for (const url of urlsToDelete) {
        try {
          await fs.unlink(path.join(__dirname, "../public", url));
        } catch (err) {
          console.error(`Faylni o‘chirishda xato (${url}):`, err.message);
        }
      }
    }

    // Add new files and preserve metadata
    const stepThreeFiles = {
      appointmentLetter: [
        ...(stepThree.view.appointmentLetter || [])
          .filter(
            (doc) =>
              doc && doc.id && !deleteFiles.appointmentLetter?.includes(doc.id)
          )
          .map((doc) => ({
            id: doc.id,
            name: doc.name,
            url: doc.url,
            isExisting: doc.isExisting,
          })),
        ...(files.appointmentLetter || []).map((file) => ({
          id: uuidv4(),
          name: file.originalname,
          url: `/files/${file.filename}`,
          isExisting: true,
        })),
      ].slice(0, 5),
      relivingLetter: [
        ...(stepThree.view.relivingLetter || [])
          .filter(
            (doc) =>
              doc && doc.id && !deleteFiles.relivingLetter?.includes(doc.id)
          )
          .map((doc) => ({
            id: doc.id,
            name: doc.name,
            url: doc.url,
            isExisting: doc.isExisting,
          })),
        ...(files.relivingLetter || []).map((file) => ({
          id: uuidv4(),
          name: file.originalname,
          url: `/files/${file.filename}`,
          isExisting: true,
        })),
      ].slice(0, 5),
      salarySlips: [
        ...(stepThree.view.salarySlips || [])
          .filter(
            (doc) => doc && doc.id && !deleteFiles.salarySlips?.includes(doc.id)
          )
          .map((doc) => ({
            id: doc.id,
            name: doc.name,
            url: doc.url,
            isExisting: doc.isExisting,
          })),
        ...(files.salarySlips || []).map((file) => ({
          id: uuidv4(),
          name: file.originalname,
          url: `/files/${file.filename}`,
          isExisting: true,
        })),
      ].slice(0, 5),
      experienceLetter: [
        ...(stepThree.view.experienceLetter || [])
          .filter(
            (doc) =>
              doc && doc.id && !deleteFiles.experienceLetter?.includes(doc.id)
          )
          .map((doc) => ({
            id: doc.id,
            name: doc.name,
            url: doc.url,
            isExisting: doc.isExisting,
          })),
        ...(files.experienceLetter || []).map((file) => ({
          id: uuidv4(),
          name: file.originalname,
          url: `/files/${file.filename}`,
          isExisting: true,
        })),
      ].slice(0, 5),
    };

    // Clean StepOne data (exclude unwanted fields)
    const stepOneData = {
      firstName: stepOne.firstName,
      lastName: stepOne.lastName,
      mobileNumber: stepOne.mobileNumber,
      emailAddress: stepOne.emailAddress,
      dateOfBirth: stepOne.dateOfBirth,
      maritalStatus: stepOne.maritalStatus,
      gender: stepOne.gender,
      nationality: stepOne.nationality,
      address: stepOne.address,
      city: stepOne.city,
      state: stepOne.state,
      zipCode: stepOne.zipCode,
      imagePath: avatarImagePath,
    };

    const stepOneRecord = await StepOne.findOne({
      where: { employeeId: id },
      transaction,
    });
    if (stepOneRecord) {
      await stepOneRecord.update(stepOneData, { transaction });
    } else {
      await StepOne.create({ ...stepOneData, employeeId: id }, { transaction });
    }

    // Clean StepTwo data (exclude unwanted fields)
    const stepTwoData = {
      employeeid: stepTwo.employeeid,
      userName: stepTwo.userName,
      employeeType: stepTwo.employeeType,
      emailAddress: stepTwo.emailAddress,
      department: stepTwo.department,
      designation: stepTwo.designation,
      workDays: stepTwo.workDays,
      joiningDate: stepTwo.joiningDate,
      workLocation: stepTwo.workLocation,
    };

    const stepTwoRecord = await StepTwo.findOne({
      where: { employeeId: id },
      transaction,
    });
    if (stepTwoRecord) {
      await stepTwoRecord.update(stepTwoData, { transaction });
    } else if (Object.keys(stepTwoData).some((key) => stepTwoData[key])) {
      await StepTwo.create({ ...stepTwoData, employeeId: id }, { transaction });
    }

    if (stepThreeRecord) {
      await stepThreeRecord.update(stepThreeFiles, { transaction });
    } else {
      await StepThree.create(
        { ...stepThreeFiles, employeeId: id },
        { transaction }
      );
    }

    const stepFourRecord = await StepFour.findOne({
      where: { employeeId: id },
      transaction,
    });
    if (stepFourRecord) {
      await stepFourRecord.update(
        {
          email: stepFour.email,
          slackId: stepFour.slackId,
          skypeId: stepFour.skypeId,
          githubId: stepFour.githubId,
        },
        { transaction }
      );
    } else if (Object.keys(stepFour).some((key) => stepFour[key])) {
      await StepFour.create(
        {
          email: stepFour.email,
          slackId: stepFour.slackId,
          skypeId: stepFour.skypeId,
          githubId: stepFour.githubId,
          employeeId: id,
        },
        { transaction }
      );
    }

    await transaction.commit();

    res.status(200).json({
      message: "Xodim muvaffaqiyatli yangilandi",
      employeeId: id,
    });
  } catch (error) {
    console.error("employeeUpdate xatosi:", {
      message: error.message,
      stack: error.stack,
    });
    await transaction.rollback();
    res.status(500).json({
      message: "Server xatosi",
      error: error.message,
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search ? req.query.search.toLowerCase() : "";

    const where = {};
    const stepOneWhere = {};
    const stepTwoWhere = {};

    if (search) {
      if (/^\d+$/.test(search)) {
        stepTwoWhere[Op.or] = [
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("StepTwo.employeeid")),
            { [Op.like]: `%${search}%` }
          ),
        ];
      } else {
        stepOneWhere[Op.or] = [
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("StepOne.firstName")),
            { [Op.like]: `%${search}%` }
          ),
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("StepOne.lastName")),
            { [Op.like]: `%${search}%` }
          ),
        ];
      }
    }

    const { count, rows: employees } = await Employee.findAndCountAll({
      where,
      include: [
        {
          model: StepOne,
          where: stepOneWhere,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: StepTwo,
          where: stepTwoWhere,
          required: false,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: StepThree,
          required: false,
          attributes: [
            "id",
            "employeeId",
            "appointmentLetter",
            "relivingLetter",
            "salarySlips",
            "experienceLetter",
          ],
        },
        {
          model: StepFour,
          required: false,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const parseStepThreeField = (data, fieldName) => {
      if (!data) return [];
      if (!Array.isArray(data)) {
        return [];
      }

      const parsedDocs = data
        .map((item, index) => {
          if (typeof item === "string") {
            try {
              const cleaned = item.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
              const parsed = JSON.parse(cleaned);
              return parsed;
            } catch (err) {
              console.error(`Failed to parse ${fieldName}[${index}]:`, {
                data: item,
                error: err.message,
              });
              return null;
            }
          } else if (typeof item === "object" && item !== null) {
            return item;
          }
          console.warn(`Invalid item in ${fieldName}[${index}]:`, item);
          return null;
        })
        .filter(Boolean);

      return parsedDocs;
    };

    const transformDocument = (doc, index) => {
      if (!doc || typeof doc !== "object") {
        console.warn("Invalid document:", doc);
        return null;
      }
      const url = doc.url || "";
      // Use doc.name or fallback to basename of url, removing extension
      const name = doc.name
        ? path.basename(doc.name, path.extname(doc.name))
        : url
        ? path.basename(url, path.extname(url))
        : `document-${index}`;
      return {
        id: `doc-${index}`,
        name,
        url,
        isExisting: true,
      };
    };

    const transformedEmployees = employees.map((employee) => {
      const stepThree = employee.StepThree || {};

      const transformedStepThree = {
        view: {
          appointmentLetter: parseStepThreeField(
            stepThree.appointmentLetter,
            "appointmentLetter"
          )
            .map(transformDocument)
            .filter(Boolean),
          relivingLetter: parseStepThreeField(
            stepThree.relivingLetter,
            "relivingLetter"
          )
            .map(transformDocument)
            .filter(Boolean),
          salarySlips: parseStepThreeField(stepThree.salarySlips, "salarySlips")
            .map(transformDocument)
            .filter(Boolean),
          experienceLetter: parseStepThreeField(
            stepThree.experienceLetter,
            "experienceLetter"
          )
            .map(transformDocument)
            .filter(Boolean),
        },
        delete: {
          appointmentLetter: [],
          relivingLetter: [],
          salarySlips: [],
          experienceLetter: [],
        },
        files: [],
      };

      return {
        ...employee.toJSON(),
        StepThree: transformedStepThree,
      };
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      message: "Xodimlar muvaffaqiyatli olindi",
      employees: transformedEmployees,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Xodimlarni olishda xato:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      message: "Server xatosi",
      error: error.message,
    });
  }
};

exports.employeeDelete = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    if (!id) {
      await transaction.rollback();
      return res.status(400).json({ message: "ID talab qilinadi" });
    }

    const employee = await Employee.findOne({ where: { id }, transaction });
    if (!employee) {
      await transaction.rollback();
      return res.status(404).json({ message: "Xodim topilmadi" });
    }

    // Delete files
    const stepOne = await StepOne.findOne({
      where: { employeeId: id },
      transaction,
    });
    const stepThree = await StepThree.findOne({
      where: { employeeId: id },
      transaction,
    });
    if (stepOne?.imagePath) {
      await fs
        .unlink(path.join(__dirname, "../public", stepOne.imagePath))
        .catch(() => {});
    }
    for (const field of [
      "appointmentLetter",
      "relivingLetter",
      "salarySlips",
      "experienceLetter",
    ]) {
      const urls = stepThree?.[field] || [];
      for (const url of urls) {
        await fs
          .unlink(path.join(__dirname, "../public", url))
          .catch(() => {});
      }
    }

    // Delete records
    await StepOne.destroy({ where: { employeeId: id }, transaction });
    await StepTwo.destroy({ where: { employeeId: id }, transaction });
    await StepThree.destroy({ where: { employeeId: id }, transaction });
    await StepFour.destroy({ where: { employeeId: id }, transaction });
    await Employee.destroy({ where: { id }, transaction });

    await transaction.commit();

    res.status(200).json({
      message: "Xodim muvaffaqiyatli o‘chirildi",
    });
  } catch (error) {
    console.error("Xodim o‘chirishda xato:", error);
    await transaction.rollback();
    res.status(500).json({
      message: "Server xatosi",
      error: (error).message,
    });
  }
};
