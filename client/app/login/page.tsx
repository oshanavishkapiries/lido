"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            await login(email, name || undefined);
            setEmailSent(true);
            toast.success('Magic link sent! Check your email.');
        } catch (error: any) {
            toast.error(error.message || 'Failed to send magic link');
        } finally {
            setIsLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
                >
                    <div className="mb-6">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Check Your Email!</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            We've sent a magic link to <strong>{email}</strong>
                        </p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            Click the link in your email to log in. The link will expire in 15 minutes.
                        </p>
                    </div>

                    <Button
                        onClick={() => setEmailSent(false)}
                        variant="outline"
                        className="w-full"
                    >
                        Use a different email
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full"
            >
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8 text-purple-600" />
                        <h1 className="text-4xl font-bold ml-2">LIDO</h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Sign in with your email
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                            Email Address
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            className="w-full"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-2">
                            Name (optional for existing users)
                        </label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                            className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Required for first-time users
                        </p>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending Magic Link...
                            </>
                        ) : (
                            <>
                                Continue with Email
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    <p>We'll send you a magic link to sign in.</p>
                    <p className="mt-1">No password required! 🎉</p>
                </div>
            </motion.div>
        </div>
    );
}
