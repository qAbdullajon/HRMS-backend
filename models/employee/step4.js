// models/stepFour.js
const { DataTypes } = require("sequelize");
const Employee = require("./employee");
const sequelize = require("../../config/db");

const StepFour = sequelize.define("StepFour", {
  employeeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Employee,
      key: 'id',
    },
    unique: true,
  },
  email: { type: DataTypes.STRING, allowNull: false },
  slackId: { type: DataTypes.STRING, allowNull: false },
  skypeId: { type: DataTypes.STRING, allowNull: false },
  githubId: { type: DataTypes.STRING, allowNull: false },
}, {
  timestamps: true,
});

StepFour.belongsTo(Employee, { foreignKey: "employeeId" });
Employee.hasOne(StepFour, { foreignKey: "employeeId" });

module.exports = StepFour;
