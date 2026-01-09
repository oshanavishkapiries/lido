"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerifyPage() {
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [errorMessage, setErrorMessage] = useState('');
    const searchParams = useSearchParams();
    const router = useRouter();
    const { refreshUser } = useAuth();

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3125/api/v1';

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setErrorMessage('No token provided');
            return;
        }

        verifyToken(token);
    }, [searchParams]);

    const verifyToken = async (token: string) => {
        try {
            const response = await fetch(`${BACKEND_URL}/auth/verify/${token}`, {
                method: 'GET',
                credentials: 'include', // Include cookies
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                // Refresh user data in context
                await refreshUser();
                // Redirect to home after 2 seconds
                setTimeout(() => {
                    router.push('/');
                }, 2000);
            } else {
                setStatus('error');
                setErrorMessage(data.message || 'Invalid or expired magic link');
            }
        } catch (error) {
            setStatus('error');
            setErrorMessage('Failed to verify magic link');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
            >
                {status === 'verifying' && (
                    <>
                        <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-2">Verifying...</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Please wait while we verify your magic link
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2 text-green-600 dark:text-green-400">
                            Success!
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            You've been logged in successfully
                        </p>
                        <p className="text-sm text-gray-500">
                            Redirecting you to the home page...
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2 text-red-600 dark:text-red-400">
                            Verification Failed
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {errorMessage}
                        </p>
                        <Button
                            onClick={() => router.push('/login')}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                        >
                            Try Again
                        </Button>
                    </>
                )}
            </motion.div>
        </div>
    );
}
