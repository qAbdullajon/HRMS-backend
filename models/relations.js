const ResetCode = require("./code/code.model");
const RefreshToken = require("./tokens/token.model");
const User = require("./user/user.model");

User.sync({});
RefreshToken.sync({});
ResetCode.sync({});

module.exports = { User, RefreshToken, ResetCode };
