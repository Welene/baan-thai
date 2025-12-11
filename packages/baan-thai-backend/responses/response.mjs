const CSP = "default-src 'self' https://baan-thai-bucket.s3-website.eu-north-1.amazonaws.com http://localhost:5173; " +
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com http://localhost:5173; " +
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com http://localhost:5173; " +
  "img-src 'self' data: https://baan-thai-bucket.s3-website.eu-north-1.amazonaws.com http://localhost:5173; " +
  "font-src 'self' https://fonts.gstatic.com data:; " +
<<<<<<< Updated upstream
  "connect-src 'self' https://nicx8149f2.execute-api.eu-north-1.amazonaws.com https://maps.googleapis.com http://localhost:3000 ws://localhost:5173 wss://localhost:5173; " +
  "frame-src 'self' https://maps.googleapis.com https://maps.gstatic.com https://www.googleusercontent.com https://baan-thai-bucket.s3-website.eu-north-1.amazonaws.com http://localhost:5173; " +
=======
  "connect-src 'self' https://nicx8149f2.execute-api.eu-north-1.amazonaws.com http://localhost:3000 ws://localhost:5173 wss://localhost:5173; " +
  "frame-src 'self' https://www.google.com https://baan-thai-bucket.s3-website.eu-north-1.amazonaws.com http://localhost:5173; " +
>>>>>>> Stashed changes
  "worker-src 'self' blob:; " +
  "object-src 'none'; " +
  "base-uri 'self'; " +
  "form-action 'self'; " +
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
