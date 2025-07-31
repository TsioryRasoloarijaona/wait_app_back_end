import admin from './firebase.js'

const decodeToken = async(idToken)=> {
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return decodedToken ;
    } catch (error) {
        console.error('Error decoding token:', error);
    }
}

export default decodeToken;

