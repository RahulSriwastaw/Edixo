import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = 'super_admin' | 'org_admin' | 'teacher' | 'student';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    orgId: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (orgId: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Mock Login Logic
    const login = async (orgId: string, email: string, password: string) => {
        setIsLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Hardcoded Mock Credentials for Dev
        if (email === 'admin@demo.com' && password === 'admin') {
            setUser({
                id: '1',
                name: 'Demo Admin',
                email,
                role: 'org_admin',
                orgId
            });
        } else if (email === 'teacher@demo.com' && password === 'teacher') {
            setUser({
                id: '2',
                name: 'Demo Teacher',
                email,
                role: 'teacher',
                orgId
            });
        } else {
            setIsLoading(false);
            throw new Error('Invalid credentials');
        }
        setIsLoading(false);
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
