// export const fetchWithApiKey = async (url: string, options: RequestInit = {}) => {
//   const API_KEY = import.meta.env.VITE_API_KEY; // hent fra .env
//   const headers = {
//     "Content-Type": "application/json",
//     "x-api-key": API_KEY,
//     ...options.headers,
//   };
//   const res = await fetch(url, { ...options, headers });
//   return res.json();
// };


// new helper that returns object that looks like the old response object - easier to implement into every file without changing every response to data
export const fetchWithApiKey = async (url: string, options: RequestInit = {}) => {
  const API_KEY = import.meta.env.VITE_API_KEY;
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
    ...options.headers,
  };
  
  const response = await fetch(url, { ...options, headers });
  const data = await response.json();
  
  return {
    ok: response.ok,
    status: response.status,
    json: () => Promise.resolve(data),
  };
};