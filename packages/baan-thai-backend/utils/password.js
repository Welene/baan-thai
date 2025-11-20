const bcrypt = require('bcryptjs');

const DEFAULT_ROUNDS = 10;

async function hash(password, rounds = DEFAULT_ROUNDS) {
  return bcrypt.hash(password, rounds);
}

async function compare(password, stored) {
  return bcrypt.compare(password, stored);
}

module.exports = { hash, compare };
