import React, { createContext, useState, useEffect } from 'react';
import { register as apiRegister, login as apiLogin } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            setIsAuthenticated(true);
        } else {
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setUser(null);
        }
    }, [token]);

    const register = async (username, email, password) => {
        const userData = await apiRegister(username, email, password);
        // Backend returns user data, need to login to get token
        await login(username, password);
        return userData;
    };

    const login = async (username, password) => {
        const response = await apiLogin(username, password);
        if (response.access_token) {
            setToken(response.access_token);
            setUser(response.user || { username });
            return response;
        } else {
            throw new Error('Invalid login response');
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            token,
            isAuthenticated,
            user,
            register,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};
