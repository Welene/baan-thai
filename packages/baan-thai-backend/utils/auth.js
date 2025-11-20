const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Funktion för att generera en JWT token
const generateToken = (payload, expiresIn = '24h') => {
  // signerar token med payload och hemlig nyckel
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn });
  return token;
};

// funktion för att verifiera en JWT token
const verifyToken = (token) => {
  try {
    // verifierar token med hemlig nyckel
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    // om token är ogiltig eller har gått ut - skriv ut fel
    throw new Error('Invalid or expired token');
  }
};

module.exports = { generateToken, verifyToken };
