var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// functions/getProduct.mjs
var getProduct_exports = {};
__export(getProduct_exports, {
  queryMenuItem: () => queryMenuItem
});
module.exports = __toCommonJS(getProduct_exports);

// services/clients.mjs
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var client = new import_client_dynamodb.DynamoDBClient({ region: "eu-north-1" });
var docClient = import_lib_dynamodb.DynamoDBDocumentClient.from(client);

// functions/getProduct.mjs
var import_lib_dynamodb2 = require("@aws-sdk/lib-dynamodb");
var queryMenuItem = async (productId) => {
  const command = new import_lib_dynamodb2.GetCommand({
    TableName: "RestaurantTable",
    Key: {
      PK: `PRODUCT#${productId}`,
      SK: "DETAILS"
    }
  });
  const result = await docClient.send(command);
  return result.Item || null;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  queryMenuItem
});
//# sourceMappingURL=getProduct.js.map
