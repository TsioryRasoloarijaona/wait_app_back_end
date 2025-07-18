const bycript = require("bcrypt");
const selRound = 10;

const encodePassword = async (password) => {
  try {
    const hash = await bycript.hash(password, selRound);
    return hash;
  } catch (err) {
    throw new Error("Error encoding password: " + err.message);
  }
};

const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    const match = await bycript.compare(plainPassword, hashedPassword);
    return match;
  } catch (err) {
    throw new Error("Error comparing password: " + err.message);
  }
};

module.exports = {
  encodePassword,
  comparePassword,
};
