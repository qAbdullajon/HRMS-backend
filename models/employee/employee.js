// models/employee.js
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Employee = sequelize.define("Employee", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
}, {
  timestamps: true,
});

module.exports = Employee;
