// new helper that returns object that looks like the old response object - easier to implement into every file without changing every response to data
export const fetchWithApiKey = async (url: string, options: RequestInit = {}) => {
  const API_KEY = import.meta.env.VITE_API_KEY;
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  const text = await response.text(); // läs alltid som text först
  console.log('Fetch response status:', response.status);
  console.log('Fetch response text:', text);

  let data;
  try {
    data = JSON.parse(text); // försök parse JSON
  } catch (err) {
    console.warn('Response is not JSON:', err);
    data = { error: text }; // fallback så frontend får något hanterbart
  }

  return {
    ok: response.ok,
    status: response.status,
    json: () => Promise.resolve(data),
  };
};

//Author: Helene
// API helper function to include API key in headers, object matches the old response
//Edit: Tim - changed to return object that looks like old response