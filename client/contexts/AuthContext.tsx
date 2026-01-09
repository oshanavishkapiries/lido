"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Auth Context Types
 */
interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, name?: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

/**
 * Auth Context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3125/api/v1';

    /**
     * Check if user is authenticated on mount
     */
    useEffect(() => {
        checkAuth();
    }, []);

    /**
     * Check authentication status
     */
    const checkAuth = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/auth/me`, {
                method: 'GET',
                credentials: 'include', // Include cookies
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Request magic link
     */
    const login = async (email: string, name?: string) => {
        try {
            const response = await fetch(`${BACKEND_URL}/auth/request-magic-link`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, name }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send magic link');
            }

            return data;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    /**
     * Logout user
     */
    const logout = async () => {
        try {
            await fetch(`${BACKEND_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            setUser(null);
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    /**
     * Refresh user data
     */
    const refreshUser = async () => {
        await checkAuth();
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
