export const config = {
    // In development (npm start), defaults to localhost:3001
    // In production (npm run build), uses REACT_APP_API_URL if set, or defaults to a placeholder/production URL
    apiUrl: process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production'
        ? 'https://adventure-forge-api.onrender.com'
        : 'http://localhost:3001')
};
