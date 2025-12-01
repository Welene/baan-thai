 /* native JWT-implementation (HS256) utan externa paket
 Använder detta för att undvika problems med att paket inte bundlas i Lambda.
 OBS: om detta skulle användas kan det vara bra att hitta ett redan fungerande bibliotek */
const crypto = require('crypto');

// behövs för offline-testning
function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET');
  return secret;
}


   /* JWT använder base64url (samma som base64 men URL-safe) */
function toBase64Url(input) {
  // Acceptera både buffer och string/objekt
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input), 'utf8');
  // Normal base64 -> byter ut tecken så det blir URL-safe och ta bort spaces 
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function fromBase64Url(base64url) {
  // Återställ URL-safe tecken till standard base64-tecken
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  // Lägg på space om det behövs för att kunna decoda
  while (base64.length % 4) base64 += '=';
  return Buffer.from(base64, 'base64').toString('utf8');
}


   /* Signeringsfunktion (HMAC-SHA256)
   Tar emot en sträng (header.payload) och returnerar base64url-signaturen */
function sign(data) {
  return crypto
    .createHmac('sha256', getSecret())
    .update(data)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}


   /* Skapa en JWT-token
    payload: objekt med användardata (userId, email )
    seconds: giltighetstid i sekunder
   Funktionen lägger automatiskt till `iat` och `exp` i payload. */
function createToken(payload, seconds = 3600) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + Number(seconds) };

  // Base64url-koda header och payload
  const h = toBase64Url(JSON.stringify(header));
  const p = toBase64Url(JSON.stringify(fullPayload));

  // Signera "header.payload"
  const s = sign(`${h}.${p}`);

  // Returnera standard JWT-struktur
  return `${h}.${p}.${s}`;
}


   /* Verifiera en JWT-token
   kontrollerar format, alg i header, signatur och expiration
   returnerar payload om allt är OK */
function verifyToken(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Token format is invalid');
  const [h, p, s] = parts;

  // Validera att header anger rätt algoritm (förhindrar alg-switch-attacker)
  const headerJson = JSON.parse(fromBase64Url(h));
  if (!headerJson || headerJson.alg !== 'HS256') throw new Error('Unsupported token algorithm');

  // Kontrollera signatur. Vi använder timing-safe jämförelse för att
  // minimera risk för timing-attacker.
  const expected = sign(`${h}.${p}`);
  const a = Buffer.from(expected);
  const b = Buffer.from(s);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error('Token signature is invalid');
  }

  // Avkoda payload och kontrollera utgångstid
  const payload = JSON.parse(fromBase64Url(p));
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now > payload.exp) throw new Error('Token expired');

  return payload;
}

module.exports = { createToken, verifyToken };