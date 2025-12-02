var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// utils/password.js
var require_password = __commonJS({
  "utils/password.js"(exports2, module2) {
    var crypto = require("crypto");
    var DEFAULT_ROUNDS = 10;
    async function hash(password, rounds = DEFAULT_ROUNDS) {
      return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16).toString("hex");
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
          if (err) reject(err);
          resolve(salt + ":" + derivedKey.toString("hex"));
        });
      });
    }
    async function compare2(password, stored) {
      return new Promise((resolve, reject) => {
        const [salt, hash2] = stored.split(":");
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
          if (err) reject(err);
          resolve(hash2 === derivedKey.toString("hex"));
        });
      });
    }
    module2.exports = { hash, compare: compare2 };
  }
});

// utils/auth.js
var require_auth = __commonJS({
  "utils/auth.js"(exports2, module2) {
    var crypto = require("crypto");
    function getSecret() {
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error("Missing JWT_SECRET");
      return secret;
    }
    function toBase64Url(input) {
      const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input), "utf8");
      return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    }
    function fromBase64Url(base64url) {
      let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4) base64 += "=";
      return Buffer.from(base64, "base64").toString("utf8");
    }
    function sign(data) {
      return crypto.createHmac("sha256", getSecret()).update(data).digest("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    }
    function createToken2(payload, seconds = 3600) {
      const header = { alg: "HS256", typ: "JWT" };
      const now = Math.floor(Date.now() / 1e3);
      const fullPayload = { ...payload, iat: now, exp: now + Number(seconds) };
      const h = toBase64Url(JSON.stringify(header));
      const p = toBase64Url(JSON.stringify(fullPayload));
      const s = sign(`${h}.${p}`);
      return `${h}.${p}.${s}`;
    }
    function verifyToken(token) {
      const parts = token.split(".");
      if (parts.length !== 3) throw new Error("Token format is invalid");
      const [h, p, s] = parts;
      const headerJson = JSON.parse(fromBase64Url(h));
      if (!headerJson || headerJson.alg !== "HS256") throw new Error("Unsupported token algorithm");
      const expected = sign(`${h}.${p}`);
      const a = Buffer.from(expected);
      const b = Buffer.from(s);
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        throw new Error("Token signature is invalid");
      }
      const payload = JSON.parse(fromBase64Url(p));
      const now = Math.floor(Date.now() / 1e3);
      if (payload.exp && now > payload.exp) throw new Error("Token expired");
      return payload;
    }
    module2.exports = { createToken: createToken2, verifyToken };
  }
});

// functions/auth/LoginUser/handleLogin.js
var { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
var { DynamoDBDocumentClient, QueryCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
var { compare } = require_password();
var { createToken } = require_auth();
var client = new DynamoDBClient({});
var dynamodb = DynamoDBDocumentClient.from(client);
var TABLE_NAME = process.env.TABLE_NAME;
exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const email = body.email;
    const password = body.password;
    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email och l\xF6senord kr\xE4vs" })
      };
    }
    const normalizedEmail = String(email).toLowerCase();
    const params = {
      TableName: TABLE_NAME,
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": normalizedEmail
      },
      Limit: 1
    };
    let result;
    try {
      result = await dynamodb.send(new QueryCommand(params));
    } catch (err) {
      if (err.name === "ValidationException" || err.message && err.message.includes("index")) {
        const scanParams = {
          TableName: TABLE_NAME,
          FilterExpression: "email = :email AND begins_with(PK, :userPrefix)",
          ExpressionAttributeValues: {
            ":email": normalizedEmail,
            ":userPrefix": "USER#"
          }
        };
        result = await dynamodb.send(new ScanCommand(scanParams));
      } else {
        throw err;
      }
    }
    if (!result.Items || result.Items.length === 0) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Felaktig email eller l\xF6senord" })
      };
    }
    const user = result.Items[0];
    const isValidPassword = await compare(password, user.passwordHash);
    if (!isValidPassword) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Felaktig email eller l\xF6senord" })
      };
    }
    const token = createToken({
      userId: user.userId,
      email: user.email,
      role: user.role
    });
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Inloggning lyckades",
        token,
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name,
          role: user.role
        }
      })
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Serverfel vid inloggning" })
    };
  }
};
//# sourceMappingURL=handleLogin.js.map
