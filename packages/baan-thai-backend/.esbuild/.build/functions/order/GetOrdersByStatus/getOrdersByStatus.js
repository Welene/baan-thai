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

// functions/order/GetOrdersByStatus/getOrdersByStatus.mjs
var getOrdersByStatus_exports = {};
__export(getOrdersByStatus_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(getOrdersByStatus_exports);

// ../../node_modules/@middy/core/index.js
var import_node_stream = require("node:stream");
var import_promises = require("node:stream/promises");
var import_web = require("node:stream/web");
var import_node_timers = require("node:timers");
var defaultLambdaHandler = () => {
};
var defaultPluginConfig = {
  timeoutEarlyInMillis: 5,
  timeoutEarlyResponse: () => {
    const err = new Error("[AbortError]: The operation was aborted.", {
      cause: { package: "@middy/core" }
    });
    err.name = "TimeoutError";
    throw err;
  },
  streamifyResponse: false
  // Deprecate need for this when AWS provides a flag for when it's looking for it
};
var middy = (setupLambdaHandler, pluginConfig) => {
  let lambdaHandler;
  let plugin;
  if (typeof setupLambdaHandler === "function") {
    lambdaHandler = setupLambdaHandler;
    plugin = { ...defaultPluginConfig, ...pluginConfig };
  } else {
    lambdaHandler = defaultLambdaHandler;
    plugin = { ...defaultPluginConfig, ...setupLambdaHandler };
  }
  plugin.timeoutEarly = plugin.timeoutEarlyInMillis > 0;
  plugin.beforePrefetch?.();
  const beforeMiddlewares = [];
  const afterMiddlewares = [];
  const onErrorMiddlewares = [];
  const middyRequest = (event = {}, context = {}) => {
    return {
      event,
      context,
      response: void 0,
      error: void 0,
      internal: plugin.internal ?? {}
    };
  };
  const middy2 = plugin.streamifyResponse ? awslambda.streamifyResponse(
    async (event, lambdaResponseStream, context) => {
      const request = middyRequest(event, context);
      plugin.requestStart?.(request);
      const handlerResponse = await runRequest(
        request,
        beforeMiddlewares,
        lambdaHandler,
        afterMiddlewares,
        onErrorMiddlewares,
        plugin
      );
      let responseStream = lambdaResponseStream;
      let handlerBody = handlerResponse;
      if (handlerResponse.statusCode) {
        const { body, ...restResponse } = handlerResponse;
        handlerBody = body ?? "";
        responseStream = awslambda.HttpResponseStream.from(
          responseStream,
          restResponse
        );
      }
      let handlerStream;
      if (handlerBody._readableState || handlerBody instanceof import_web.ReadableStream) {
        handlerStream = handlerBody;
      } else if (typeof handlerBody === "string") {
        handlerStream = import_node_stream.Readable.from(
          handlerBody.length < stringIteratorSize ? handlerBody : stringIterator(handlerBody)
        );
      }
      if (!handlerStream) {
        throw new Error("handler response not a ReadableStream");
      }
      await (0, import_promises.pipeline)(handlerStream, responseStream);
      await plugin.requestEnd?.(request);
    }
  ) : async (event, context) => {
    const request = middyRequest(event, context);
    plugin.requestStart?.(request);
    const response = await runRequest(
      request,
      beforeMiddlewares,
      lambdaHandler,
      afterMiddlewares,
      onErrorMiddlewares,
      plugin
    );
    await plugin.requestEnd?.(request);
    return response;
  };
  middy2.use = (inputMiddleware) => {
    const middlewares = Array.isArray(inputMiddleware) ? inputMiddleware : [inputMiddleware];
    for (const middleware of middlewares) {
      const { before, after, onError } = middleware;
      if (before || after || onError) {
        if (before) middy2.before(before);
        if (after) middy2.after(after);
        if (onError) middy2.onError(onError);
      } else {
        throw new Error(
          'Middleware must be an object containing at least one key among "before", "after", "onError"'
        );
      }
    }
    return middy2;
  };
  middy2.before = (beforeMiddleware) => {
    beforeMiddlewares.push(beforeMiddleware);
    return middy2;
  };
  middy2.after = (afterMiddleware) => {
    afterMiddlewares.unshift(afterMiddleware);
    return middy2;
  };
  middy2.onError = (onErrorMiddleware) => {
    onErrorMiddlewares.unshift(onErrorMiddleware);
    return middy2;
  };
  middy2.handler = (replaceLambdaHandler) => {
    lambdaHandler = replaceLambdaHandler;
    return middy2;
  };
  return middy2;
};
var stringIteratorSize = 16384;
function* stringIterator(input) {
  let position = 0;
  const length = input.length;
  while (position < length) {
    yield input.substring(position, position + stringIteratorSize);
    position += stringIteratorSize;
  }
}
var handlerAbort = new AbortController();
var runRequest = async (request, beforeMiddlewares, lambdaHandler, afterMiddlewares, onErrorMiddlewares, plugin) => {
  let timeoutID;
  const timeoutEarly = plugin.timeoutEarly && request.context.getRemainingTimeInMillis;
  try {
    await runMiddlewares(request, beforeMiddlewares, plugin);
    if (!Object.hasOwn(request, "earlyResponse")) {
      plugin.beforeHandler?.();
      if (handlerAbort.signal.aborted) {
        handlerAbort = new AbortController();
      }
      const promises = [
        lambdaHandler(request.event, request.context, {
          signal: handlerAbort.signal
        })
      ];
      if (timeoutEarly) {
        let timeoutResolve;
        const timeoutPromise = new Promise((resolve, reject) => {
          timeoutResolve = () => {
            handlerAbort.abort();
            try {
              resolve(plugin.timeoutEarlyResponse());
            } catch (e) {
              reject(e);
            }
          };
        });
        timeoutID = (0, import_node_timers.setTimeout)(
          timeoutResolve,
          request.context.getRemainingTimeInMillis() - plugin.timeoutEarlyInMillis
        );
        promises.push(timeoutPromise);
      }
      request.response = await Promise.race(promises);
      if (timeoutID) {
        clearTimeout(timeoutID);
      }
      plugin.afterHandler?.();
      await runMiddlewares(request, afterMiddlewares, plugin);
    }
  } catch (e) {
    if (timeoutID) {
      clearTimeout(timeoutID);
    }
    request.response = void 0;
    request.error = e;
    try {
      await runMiddlewares(request, onErrorMiddlewares, plugin);
    } catch (e2) {
      e2.originalError = request.error;
      request.error = e2;
      throw request.error;
    }
    if (typeof request.response === "undefined") throw request.error;
  }
  return request.response;
};
var runMiddlewares = async (request, middlewares, plugin) => {
  for (const nextMiddleware of middlewares) {
    plugin.beforeMiddleware?.(nextMiddleware.name);
    const res = await nextMiddleware(request);
    plugin.afterMiddleware?.(nextMiddleware.name);
    if (typeof res !== "undefined") {
      request.earlyResponse = res;
    }
    if (Object.hasOwn(request, "earlyResponse")) {
      request.response = request.earlyResponse;
      return;
    }
  }
};
var core_default = middy;

// responses/response.mjs
var sendResponse = (code, data) => {
  return {
    statusCode: code,
    body: JSON.stringify({
      ...data
    })
  };
};

// services/clients.mjs
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var client = new import_client_dynamodb.DynamoDBClient({ region: "eu-north-1" });
var docClient = import_lib_dynamodb.DynamoDBDocumentClient.from(client);

// services/orders.mjs
var import_lib_dynamodb3 = require("@aws-sdk/lib-dynamodb");

// functions/getProduct.mjs
var import_lib_dynamodb2 = require("@aws-sdk/lib-dynamodb");

// services/orders.mjs
var getOrdersByStatus = async (status) => {
  const command = new import_lib_dynamodb3.ScanCommand({
    TableName: "RestaurantTable",
    FilterExpression: "#type = :type AND #status = :status",
    ExpressionAttributeNames: {
      "#type": "type",
      "#status": "status"
    },
    ExpressionAttributeValues: {
      ":type": "Order",
      ":status": status
    }
  });
  try {
    const result = await docClient.send(command);
    return result.Items || [];
  } catch (error) {
    console.error(`Error scanning orders by status "${status}":`, error.message);
    return [];
  }
};

// middlewares/errorHandler.mjs
var errorHandler = () => ({
  onError: (handler2) => {
    handler2.response = sendResponse(404, { message: handler2.error.message });
  }
});

// functions/order/GetOrdersByStatus/getOrdersByStatus.mjs
var handler = core_default(async (event) => {
  const { status } = event.pathParameters;
  if (!status) {
    return sendResponse(400, { success: false, message: "Missing status parameter" });
  }
  const orders = await getOrdersByStatus(status);
  return sendResponse(200, { success: true, orders });
}).use(errorHandler());
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=getOrdersByStatus.js.map
