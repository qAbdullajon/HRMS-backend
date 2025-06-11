// models/stepThree.js
const { DataTypes } = require("sequelize");
const Employee = require("./employee");
const sequelize = require("../../config/db");

const StepThree = sequelize.define("StepThree", {
  employeeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Employee,
      key: 'id',
    },
    unique: true,
  },
  appointmentLetter: { 
    type: DataTypes.ARRAY(DataTypes.STRING), 
    allowNull: true,
    defaultValue: []
  },
  relivingLetter: { 
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: []
  },
  salarySlips: { 
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: []
  },
  experienceLetter: { 
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: []
  },
}, {
  timestamps: true,
});

StepThree.belongsTo(Employee, { foreignKey: "employeeId" });
Employee.hasOne(StepThree, { foreignKey: "employeeId" });

module.exports = StepThree;