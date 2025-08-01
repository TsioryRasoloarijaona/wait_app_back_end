import bcrypt from 'bcrypt'
const selRound = 10;

const encodePassword = async (password) => {
  try {
    const hash = await bcrypt.hash(password, selRound);

    return hash;
  } catch (err) {
    throw new Error("Error encoding password: " + err.message);
  }
};



const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    return match;
  } catch (err) {
    throw new Error("Error comparing password: " + err.message);
  }
};

export {
  encodePassword,
  comparePassword,
};
