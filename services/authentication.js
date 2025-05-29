const JWT = require("jsonwebtoken");

// Use an environment variable for the secret
const secret = process.env.JWT_SECRET || "defaultSecret"; // Provide a default for development if needed

 function createTokenForUser(user){
    const payload = {
        _id: user._id,
        email: user.email,
        profileImageURL: user.profileImageURL,
        role: user.role,

    };
    const token = JWT.sign(payload, secret);
    return token;
 }

 function validateToken(token){
    const payload = JWT.verify(token, secret);
    return payload;
 }

 module.exports = {
    createTokenForUser,
    validateToken,
 };
