// API Configuration
// Ändra USE_LOCAL till false för att använda AWS, true för localhost

const USE_LOCAL = false; // Sätt till true för localhost eller false för aws serverless deployment

const API_URLS = {
  local: '',/* använd relative /api i dev så Vite proxy skickar vidare till localhost:3000,
              csp kronglade till detta så får göra på de sättet sätter det i vite.config.ts */
  aws: 'https://nicx8149f2.execute-api.eu-north-1.amazonaws.com'
};

export const API_BASE_URL = USE_LOCAL ? API_URLS.local : API_URLS.aws;


//author: Tim
// Configuration file for API base URL depending on environment