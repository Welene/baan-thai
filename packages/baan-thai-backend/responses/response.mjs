const CSP = "default-src 'none'; " +
  "base-uri 'self'; " +
  "script-src 'self'; " +
  "style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' data: https://baan-thai-bucket.s3-website.eu-north-1.amazonaws.com; " +
  "font-src 'self' data:; " +
  "connect-src 'self' https://nicx8149f2.execute-api.eu-north-1.amazonaws.com; " +
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
