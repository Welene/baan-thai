const CSP = "default-src 'none'; " +
  "base-uri 'self'; " +
  "script-src 'self' http://localhost:5173 'unsafe-eval' 'unsafe-inline'; " +
  "style-src 'self' 'unsafe-inline' http://localhost:5173; " +
  "img-src 'self' data: https://baan-thai-bucket.s3-website.eu-north-1.amazonaws.com http://localhost:5173; " +
  "font-src 'self' data:; " +
  "connect-src 'self' https://nicx8149f2.execute-api.eu-north-1.amazonaws.com http://localhost:3000 ws://localhost:5173 wss://localhost:5173; " +
  "object-src 'none'; " +
  "form-action 'self'; " +
  "frame-ancestors 'none'; " +
  "upgrade-insecure-requests;";

export const sendResponse = (code, data) => {
  return {
    statusCode: code,
    headers: {
      'Content-Type': 'application/json',
      'Content-Security-Policy': CSP
    },
    body: JSON.stringify({
      ...data,
    }),
  };
}
