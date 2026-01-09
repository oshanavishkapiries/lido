"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Protected Route Component
 * Wraps pages that require authentication
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            // Redirect to login if not authenticated
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    // Show loading spinner while checking auth
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Show nothing if not authenticated (will redirect)
    if (!isAuthenticated) {
        return null;
    }

    // Render children if authenticated
    return <>{children}</>;
}
