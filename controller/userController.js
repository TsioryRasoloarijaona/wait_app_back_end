import { PrismaClient } from "../generated/prisma/index.js";
import { encodePassword, comparePassword } from "../helper/pswEncoder.js";
import { tokenGerate } from "../helper/tokenService.js";
import idToken from "../helper/idToken.js";

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
};

const emailPasswordRegister = async (req, res) => {
  const { name, email, password } = req.body;
  let encodedPwd = await encodePassword(password);
  console.log("Encoded Password: ", encodedPwd);
  try {
    const user = await createUser({
      name,
      email,
      password: encodedPwd,
      connectionType: "pswd",
      permissions: ["user"],
    });
    const token = tokenGerate(user);
    res.status(201).json({
      token: token,
    });
  } catch (error) {
    res.status(500).json({
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
    if (await comparePassword(password, user.password)) {
      const token = tokenGerate(user);
      res.status(200).json({
        token: token,
      });
    }
  } else {
    res.status(401).json({ error: "email incorrect" });
  }
};

const authentificateWithIdToken = async (req, res) => {
  const { token } = req.body;
  try {
    const decodedToken = await idToken(token);
    const user = await prisma.users.findUnique({
      where: {
        email: decodedToken.email,
      },
    });
    if (!user) {
      const userCreate = await createUser({
        name: decodedToken.name,
        email: decodedToken.email,
        password: null,
        connectionType: "oauth",
        permissions: ["user"],
      });
      res.status(201).json({
        token: tokenGerate(userCreate),
      });
    } else {
      res.status(200).json({
        token: tokenGerate(user),
      });
    }
  } catch (error) {
    console.error(error.message)
  }
};

const getByUserId = async (id) => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: id,
      },
      select : {
        name : true,
        email : true,
        permissions : true
      }
    });

    return user;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
  }
};

const userInfo = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: id,
      },
    });

    const result = {
      name: user.name,
      email: user.email,
    };

    res.status(200).json(result);
  } catch (error) {}
};

const userAccounts = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await getByUserId(id);
    const establishment = await prisma.establishment.findFirst({
      where: {
        adminId: id,
        status : "approved"
      },
    });

    

    const accounts = {
      user: user.name,
      admin: establishment ? establishment.generalInfo.establishmentName : null,
    };

    res.status(200).json(accounts);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "server error" });
  }
};

const addPermissions = async (id , newPermission)=> {
  try {
    
    const updated = await prisma.users.update({
      where : {
        id : id
      },
      data : {
        permissions : newPermission
      }
    })
  } catch (error) {
    console.error(error.message)
  }
}

export {
  emailPasswordRegister,
  authentificate,
  authentificateWithIdToken,
  getByUserId,
  userInfo,
  userAccounts,
  addPermissions
};
