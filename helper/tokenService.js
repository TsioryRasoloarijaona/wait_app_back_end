import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()
const secret = process.env.JWT_SECRET

const tokenGerate = (user) => {
    const playload = {
        id : user.id ,
        permissions : user.permissions
    }

    return jwt.sign(playload , secret , {expiresIn : '48h'}) ;
}


const decodeToken = (token) => {
  try {
    const decoded = jwt.verify(token, secret);
    return {id : decoded.id, permissions: decoded.permissions}; 
  } catch (err) {
    throw new Error('Token invalide ou expiré');
  }
};

export {
  tokenGerate,
  decodeToken
};