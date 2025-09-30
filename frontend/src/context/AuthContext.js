import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import api from "../api/api";

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({children}) => {
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authToken) {
            api.get('auth/user/')
                .then(response => { setUser(response.data);})
                .catch(() => {
                    localStorage.removeItem('authToken');
                    setAuthToken(null);
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [authToken]);

    const login = async (username, password) => {
        const response = await axios.post('http://127.0.0.1:8000/api/auth/login/', {
            username, password,
        });
        const token = response.data.key;
        localStorage.setItem('authToken', token);
        setAuthToken(token);
        return response;
    }

    const logout = () => {
        localStorage.removeItem('authToken');
        delete axios.defaults.headers.common['Authorization'];
        setAuthToken(null);
        setUser(null);
    };

    const value = { authToken, user, login, logout};

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}