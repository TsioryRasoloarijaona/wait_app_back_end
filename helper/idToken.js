const admin = require('./firebase');

const decodeToken = async(idToken)=> {
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return decodedToken ;
    } catch (error) {
        console.error('Error decoding token:', error);
    }
}

module.exports = decodeToken;

