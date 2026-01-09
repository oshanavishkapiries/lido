"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

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
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                await refreshUser();
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
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <Card>
                    <CardContent className="pt-6">
                        {status === 'verifying' && (
                            <div className="text-center space-y-4">
                                <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
                                <CardTitle className="text-2xl">Verifying...</CardTitle>
                                <CardDescription>
                                    Please wait while we verify your magic link
                                </CardDescription>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                                </div>
                                <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                                    Success!
                                </CardTitle>
                                <CardDescription>
                                    You've been logged in successfully
                                </CardDescription>
                                <p className="text-sm text-muted-foreground">
                                    Redirecting you to the home page...
                                </p>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                                    <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                                </div>
                                <CardTitle className="text-2xl text-red-600 dark:text-red-400">
                                    Verification Failed
                                </CardTitle>
                                <CardDescription>{errorMessage}</CardDescription>
                                <Button
                                    onClick={() => router.push('/login')}
                                    className="w-full"
                                >
                                    Try Again
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
