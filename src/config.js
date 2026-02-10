
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://minor-project-backend-i1ci.onrender.com/api');

export default API_BASE_URL;
