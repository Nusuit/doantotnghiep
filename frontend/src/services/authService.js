import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth';

export const register = async (username, email, password) => {
    const response = await axios.post(`${API_URL}/register`, {
        username,
        email,
        password
    });
    return response.data;
};

export const login = async (username, password) => {
    const form = new FormData();
    form.append('username', username);
    form.append('password', password);
    const response = await axios.post(`${API_URL}/login`, form);
    return response.data;
};
