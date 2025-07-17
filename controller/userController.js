const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const createUser = async ({
  name,
  email,
  password,
  connectionType,
  permissions,
}) => {
  return await prisma.users.create({
    data: {
      name,
      email,
      password,
      connectionType,
      permissions,
    },
  });
  return user;
};

const emailPasswordRegister = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await createUser({
      name,
      email,
      password,
      connectionType: "pswd",
      permissions: "user",
    });
    res.status(201).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while registering the user." + error.message });
  }
};

module.exports = {
  emailPasswordRegister,
};
