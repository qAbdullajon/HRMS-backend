const ResetCode = require("./code/code.model");
const Employee = require("./employee/employee");
const StepOne = require("./employee/step1");
const StepTwo = require("./employee/step2");
const StepThree = require("./employee/step3");
const StepFour = require("./employee/step4");
const RefreshToken = require("./tokens/token.model");
const User = require("./user/user.model");

// Har bir Step modeli Employee ga 'belongsTo' qiladi
StepOne.belongsTo(Employee, { foreignKey: 'employeeId', onDelete: 'CASCADE' });
StepTwo.belongsTo(Employee, { foreignKey: 'employeeId', onDelete: 'CASCADE' });
StepThree.belongsTo(Employee, { foreignKey: 'employeeId', onDelete: 'CASCADE' });
StepFour.belongsTo(Employee, { foreignKey: 'employeeId', onDelete: 'CASCADE' });

// Employee har bir Step modeliga 'hasOne' bog‘lanishni beradi
Employee.hasOne(StepOne, { foreignKey: 'employeeId', onDelete: 'CASCADE' });
Employee.hasOne(StepTwo, { foreignKey: 'employeeId', onDelete: 'CASCADE' });
Employee.hasOne(StepThree, { foreignKey: 'employeeId', onDelete: 'CASCADE' });
Employee.hasOne(StepFour, { foreignKey: 'employeeId', onDelete: 'CASCADE' });

// Sync barchasi uchun
User.sync();
RefreshToken.sync();
ResetCode.sync();

Employee.sync();
StepOne.sync();
StepTwo.sync();
StepThree.sync();
StepFour.sync();

module.exports = {
  User,
  RefreshToken,
  ResetCode,
  Employee,
  StepOne,
  StepTwo,
  StepThree,
  StepFour,
};
