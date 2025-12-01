const crypto = require('crypto');

const DEFAULT_ROUNDS = 10;

async function hash(password, rounds = DEFAULT_ROUNDS) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ':' + derivedKey.toString('hex'));
    });
  });
}

async function compare(password, stored) {
  return new Promise((resolve, reject) => {
    const [salt, hash] = stored.split(':');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(hash === derivedKey.toString('hex'));
    });
  });
}

module.exports = { hash, compare };
