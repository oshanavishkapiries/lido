'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

function VerifyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refreshUser } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3125/api/v1';

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setErrorMessage('No token provided');
            return;
        }

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
            } catch {
                setStatus('error');
                setErrorMessage('Failed to verify magic link');
            }
        };

        verifyToken(token);
    }, [searchParams, refreshUser, router, BACKEND_URL]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <Card>
                    <CardContent className="pt-6">
                        {status === 'loading' && (
                            <div className="flex flex-col items-center space-y-4 py-8">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                <CardTitle className="text-xl">
                                    Verifying your magic link...
                                </CardTitle>
                                <CardDescription>
                                    Please wait while we log you in
                                </CardDescription>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="flex flex-col items-center space-y-4 py-8">
                                <CheckCircle className="h-12 w-12 text-green-500" />
                                <CardTitle className="text-xl">
                                    Success!
                                </CardTitle>
                                <CardDescription>
                                    You&apos;ve been logged in successfully
                                </CardDescription>
                                <p className="text-sm text-muted-foreground">
                                    Redirecting you to the home page...
                                </p>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="flex flex-col items-center space-y-4 py-8">
                                <XCircle className="h-12 w-12 text-red-500" />
                                <CardTitle className="text-xl">
                                    Verification Failed
                                </CardTitle>
                                <CardDescription className="text-center">
                                    {errorMessage}
                                </CardDescription>
                                <Button
                                    onClick={() => router.push('/login')}
                                    className="w-full"
                                >
                                    Back to Login
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <VerifyContent />
        </Suspense>
    );
}
