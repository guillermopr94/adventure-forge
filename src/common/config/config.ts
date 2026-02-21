export const config = {
    // In development (npm start), defaults to localhost:3001
    // In production (npm run build), uses REACT_APP_API_URL from environment
    apiUrl: process.env.REACT_APP_API_URL || 'https://adventure-forge-api.onrender.com'
};
