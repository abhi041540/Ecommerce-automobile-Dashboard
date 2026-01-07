import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('autom_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const baseUrl = 'https://e-commerce-automobile-server.onrender.com';
            const response = await axios.post(`${baseUrl}/api/auth/login`, {
                username,
                password
            });

            const data = response.data;
            setUser(data);
            localStorage.setItem('autom_user', JSON.stringify(data));
            return data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const signup = async (name, username, password, role) => {
        try {
            const baseUrl = 'https://e-commerce-automobile-server.onrender.com';
            const response = await axios.post(`${baseUrl}/api/auth/signup`, {
                name,
                username,
                password,
                role
            });

            const data = response.data;
            setUser(data);
            localStorage.setItem('autom_user', JSON.stringify(data));
            return data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Signup failed');
        }
    };

    const changePassword = async (oldPassword, newPassword) => {
        try {
            const baseUrl = 'https://e-commerce-automobile-server.onrender.com';
            const response = await axios.post(`${baseUrl}/api/auth/change-password`, {
                userId: user._id,
                oldPassword,
                newPassword
            }, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Password change failed');
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('autom_user');
    };

    const value = {
        user,
        login,
        signup,
        changePassword,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
