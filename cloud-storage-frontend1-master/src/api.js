import axios from 'axios';

export const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
        }

        return Promise.reject(error);
    }
);

export const getErrorMessage = (error, fallback = 'Request failed') =>
    error.response?.data?.msg ||
    error.response?.data?.error ||
    error.message ||
    fallback;

export default api;
