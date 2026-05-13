import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth.service';

interface User {
    _id: string;
    id?: string;
    fullname: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    signin: (data: any) => Promise<void>;
    signup: (data: any) => Promise<void>;
    signout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await authService.getMe();
                if (response.success && response.data) {
                    setUser(response.data.user);
                    if (response.data.accessToken) {
                        setAccessToken(response.data.accessToken);
                    } else {
                        setAccessToken(null);
                    }
                }
            } catch (error) {
                console.error("Not authenticated");
                setUser(null);
                setAccessToken(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();

        // Listen for unauthorized access events from the API interceptor
        const handleUnauthorized = () => {
            setUser(null);
            setAccessToken(null);
        };

        const handleTokenRefresh = (event: Event) => {
            const { user: refreshedUser, accessToken: refreshedAccessToken } = (event as CustomEvent).detail || {};
            if (refreshedUser) {
                setUser(refreshedUser);
            }
            if (refreshedAccessToken) {
                setAccessToken(refreshedAccessToken);
            }
        };
        window.addEventListener('unauthorized_access', handleUnauthorized);
        window.addEventListener('auth_tokens_refreshed', handleTokenRefresh);
        return () => {
            window.removeEventListener('unauthorized_access', handleUnauthorized);
            window.removeEventListener('auth_tokens_refreshed', handleTokenRefresh);
        };
    }, []);

    const signin = async (data: any) => {
        const response = await authService.signin(data);
        if (response.success && response.data?.user) {
            setUser(response.data.user);
            if (response.data.accessToken) {
                setAccessToken(response.data.accessToken);
            } else {
                setAccessToken(null);
            }
        }
    };

    const signup = async (data: any) => {
        // Backend signup doesn't return tokens directly, so we might need to redirect or auto-login
        // We'll return the response and handle login on the signup page
        await authService.signup(data);
    };

    const signout = async () => {
        await authService.signout();
        setUser(null);
        setAccessToken(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            accessToken,
            isAuthenticated: !!user,
            isLoading,
            signin,
            signup,
            signout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
