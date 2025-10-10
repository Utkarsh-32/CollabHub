import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/api';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const response = await api.get('/auth/user/');
            setUser(response.data);
        } catch (error) {
            setUser(null);
        }
    };

    const login = async (username, password) => {
        const response = await axios.post('http://localhost:8000/api/auth/login/', { username, password });
        localStorage.setItem('accessToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        await refreshUser();
    };

    const logout = async () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const loginWithSocial = (accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        refreshUser(); 
    };

    useEffect(() => {
        const intializeAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {
                    await refreshUser();
                } catch (e) {
                    console.error("Initial Auth failed, attempting refresh");
                    try {
                        const refreshToken = localStorage.getItem('refreshToken');
                        const response = await axios.post('http://localhost:8000/api/auth/token/refresh/', {
                            refresh: refreshToken,
                        });
                        const newAccessToken = response.data.access;
                        localStorage.setItem('accessToken', newAccessToken);
                        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                        await refreshUser();
                    } catch (refreshError) {
                        logout();
                    }
                }
            }
            setLoading(false)
        };
        intializeAuth();
    }, []);

    const value = { user, loading, login, logout, refreshUser, loginWithSocial };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};