import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { googleLogout } from '@react-oauth/google';
import { config } from '../config/config';

// Define User Interface matching Backend Schema
export interface User {
    email: string;
    googleId: string;
    firstName: string;
    lastName: string;
    picture: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (googleToken: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Restore user and token from storage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('google_token');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    const login = async (googleToken: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${config.apiUrl}/auth/google`, { token: googleToken });
            const userData = response.data;

            setUser(userData);
            setToken(googleToken);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('google_token', googleToken);
        } catch (error) {
            console.error('Login failed', error);
            setError('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        googleLogout();
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('google_token');
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login, logout, isLoading, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
