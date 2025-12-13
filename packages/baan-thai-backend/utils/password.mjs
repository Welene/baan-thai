import bcrypt from 'bcryptjs';

const DEFAULT_ROUNDS = 10;

async function hash(password, rounds = DEFAULT_ROUNDS) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, rounds, (err, hashed) => {
      if (err) return reject(err);
      resolve(hashed);
    });
  });
}

async function compare(password, stored) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, stored, (err, same) => {
      if (err) return reject(err);
      resolve(same);
    });
  });
}

export { hash, compare };

/* Författare: Tim */
/* hanterar lösenords-hashing och jämförelse med bcrypt */
