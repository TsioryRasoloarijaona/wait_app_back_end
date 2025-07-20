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

/*
Decoded Token: {
  name: 'RASOLOARIJAONA tsiory',
  picture: 'https://lh3.googleusercontent.com/a/ACg8ocLLIvrPOD2C4Xv5urd1NmbHlW378r5A79-utJAgFwFlmiO7lgg=s96-c',
  iss: 'https://securetoken.google.com/instant-chat-680ab',
  aud: 'instant-chat-680ab',
  auth_time: 1752968848,
  user_id: 'TQW8LtikmyO2AtdDC5YZ1zlkoDq1',
  sub: 'TQW8LtikmyO2AtdDC5YZ1zlkoDq1',
  iat: 1752968848,
  exp: 1752972448,
  email: 'hei.tsiory@gmail.com',
  email_verified: true,
  firebase: {
    identities: { 'google.com': [Array], email: [Array] },
    sign_in_provider: 'google.com'
  },
  uid: 'TQW8LtikmyO2AtdDC5YZ1zlkoDq1'
}
*/ 