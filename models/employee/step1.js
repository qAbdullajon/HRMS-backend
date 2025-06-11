// models/stepOne.js
const { DataTypes } = require("sequelize");
const Employee = require("./employee");
const sequelize = require("../../config/db");

const StepOne = sequelize.define(
  "StepOne",
  {
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    mobileNumber: { type: DataTypes.STRING, allowNull: false },
    emailAddress: { type: DataTypes.STRING, allowNull: false },
    dateOfBirth: { type: DataTypes.STRING, allowNull: false },
    maritalStatus: { type: DataTypes.STRING, allowNull: false },
    gender: { type: DataTypes.STRING, allowNull: false },
    nationality: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING, allowNull: false },
    zipCode: { type: DataTypes.STRING, allowNull: false },
    imagePath: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    employeeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Employee,
        key: "id",
      },
      unique: true, // one-to-one bog‘lanish uchun
    },
  },
  {
    timestamps: true,
  }
);

StepOne.belongsTo(Employee, { foreignKey: "employeeId" });
Employee.hasOne(StepOne, { foreignKey: "employeeId" });

module.exports = StepOne;
