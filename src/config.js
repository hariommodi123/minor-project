const getBaseUrl = () => {
    let url = import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://minor-project-backend-i1ci.onrender.com/api');

    // Remove all trailing slashes to start fresh
    while (url.endsWith('/')) {
        url = url.slice(0, -1);
    }

    // Append /api if it's not there
    if (!url.endsWith('/api')) {
        url += '/api';
    }

    return url;
};

const API_BASE_URL = getBaseUrl();

export default API_BASE_URL;
