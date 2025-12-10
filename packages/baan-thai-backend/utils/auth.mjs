import jwt from 'jsonwebtoken';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET');
  return secret;
}

function createToken(payload, seconds = 3600) {
  return jwt.sign(payload, getSecret(), { expiresIn: seconds });
}

function verifyToken(token) {
  return jwt.verify(token, getSecret());
}

export { createToken, verifyToken };

/* Författare: Tim */
/* Hanterar skapande och verifiering av JWT-tokens */
