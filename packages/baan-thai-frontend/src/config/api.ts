// API Configuration
// Ändra USE_LOCAL till false för att använda AWS, true för localhost

const USE_LOCAL = true; // Sätt till true för localhost eller false för aws serverless dployment

const API_URLS = {
  local: 'http://localhost:3000',
  aws: 'https://nicx8149f2.execute-api.eu-north-1.amazonaws.com'
};

export const API_BASE_URL = USE_LOCAL ? API_URLS.local : API_URLS.aws;
