var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// utils/password.js
var require_password = __commonJS({
  "utils/password.js"(exports2, module2) {
    var crypto2 = require("crypto");
    var DEFAULT_ROUNDS = 10;
    async function hash2(password, rounds = DEFAULT_ROUNDS) {
      return new Promise((resolve, reject) => {
        const salt = crypto2.randomBytes(16).toString("hex");
        crypto2.scrypt(password, salt, 64, (err, derivedKey) => {
          if (err) reject(err);
          resolve(salt + ":" + derivedKey.toString("hex"));
        });
      });
    }
    async function compare(password, stored) {
      return new Promise((resolve, reject) => {
        const [salt, hash3] = stored.split(":");
        crypto2.scrypt(password, salt, 64, (err, derivedKey) => {
          if (err) reject(err);
          resolve(hash3 === derivedKey.toString("hex"));
        });
      });
    }
    module2.exports = { hash: hash2, compare };
  }
});

// utils/auth.js
var require_auth = __commonJS({
  "utils/auth.js"(exports2, module2) {
    var crypto2 = require("crypto");
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
      return crypto2.createHmac("sha256", getSecret()).update(data).digest("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
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
      if (a.length !== b.length || !crypto2.timingSafeEqual(a, b)) {
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

// functions/auth/RegisterUser/handleRegister.js
var { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
var {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  ScanCommand
} = require("@aws-sdk/lib-dynamodb");
var { hash } = require_password();
var { createToken } = require_auth();
var crypto = require("crypto");
var generateUUID = () => crypto.randomUUID();
var client = new DynamoDBClient({});
var dynamodb = DynamoDBDocumentClient.from(client);
var TABLE_NAME = process.env.TABLE_NAME;
exports.handler = async (event) => {
  console.log("handleRegister invoked");
  try {
    const body = JSON.parse(event.body);
    const email = body.email;
    const password = body.password;
    const name = body.name;
    const username = body.username;
    const role = body.role || "customer";
    const address = body.address || null;
    const phoneNumber = body.phoneNumber || null;
    if (!email || !password || !name || !username) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Email, l\xF6senord, namn och anv\xE4ndarnamn kr\xE4vs"
        })
      };
    }
    const normalizedEmail = String(email).toLowerCase();
    const checkEmailParams = {
      TableName: TABLE_NAME,
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: { ":email": normalizedEmail },
      Limit: 1
    };
    let existingUser;
    try {
      existingUser = await dynamodb.send(
        new QueryCommand(checkEmailParams)
      );
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
        existingUser = await dynamodb.send(new ScanCommand(scanParams));
      } else {
        throw err;
      }
    }
    if (existingUser.Items && existingUser.Items.length > 0) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          error: "Email finns redan registrerad"
        })
      };
    }
    const userId = generateUUID().replace(/-/g, "").slice(0, 8);
    const passwordHash = await hash(password);
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const newUser = {
      PK: `USER#${userId}`,
      SK: "PROFILE",
      userId,
      email: normalizedEmail,
      passwordHash,
      name,
      username,
      address,
      phoneNumber,
      role,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    await dynamodb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: newUser
      })
    );
    const token = createToken({
      userId,
      email,
      role
    });
    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Registrering lyckades",
        token,
        user: {
          userId,
          email,
          name,
          username,
          role
        }
      })
    };
  } catch (error) {
    console.error("Registration error:", error);
    console.error("Error stack:", error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Serverfel vid registrering",
        details: error.message
      })
    };
  }
};
//# sourceMappingURL=handleRegister.js.map
