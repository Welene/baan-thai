const CSP = "default-src 'self' https://baan-thai-bucket.s3-website.eu-north-1.amazonaws.com http://localhost:5173; " +
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com http://localhost:5173; " +
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com http://localhost:5173; " +
  "img-src 'self' data: https://baan-thai-bucket.s3-website.eu-north-1.amazonaws.com http://localhost:5173; " +
  "font-src 'self' https://fonts.gstatic.com data:; " +
  "connect-src 'self' https://nicx8149f2.execute-api.eu-north-1.amazonaws.com http://localhost:3000 ws://localhost:5173 wss://localhost:5173; " +
  "frame-src 'self' https://www.google.com https://baan-thai-bucket.s3-website.eu-north-1.amazonaws.com http://localhost:5173; " +
  "worker-src 'self' blob:; " +
  "object-src 'none'; " +
  "base-uri 'self'; " +
  "form-action 'self'; ";

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
