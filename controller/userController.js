const { PrismaClient } = require("../generated/prisma");
const encrypt = require("../helper/pswEncoder");
const prisma = new PrismaClient();
const tokenService = require("../helper/tokenService");

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
};

const emailPasswordRegister = async (req, res) => {
  const { name, email, password } = req.body;
  let encodedPwd =await encrypt.encodePassword(password);
  console.log("Encoded Password: ", encodedPwd);
  try {
    const user = await createUser({
      name,
      email,
      password : encodedPwd,
      connectionType: "pswd",
      permissions: "user",
    });
    const token = tokenService.tokenGerate(user) ;
    res.status(201).json({token : token});
  } catch (error) {
    res
      .status(500)
      .json({
        error: "An error occurred while registering the user." + error.message,
      });
  }
};

const authentificate = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.users.findUnique({
    where: {
      email: email,
    },
  });
  if (user) {
    if (await encrypt.comparePassword(password, user.password)) {
      const token = tokenService.tokenGerate(user);
      res.status(200).json({ token: token });
    }
  } else {
    res.status(401).json({ error: "email incorrect" });
  }
};

module.exports = {
  emailPasswordRegister,
  authentificate
};
