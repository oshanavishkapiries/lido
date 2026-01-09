"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { User, Mail, LogOut, Calendar } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/ProtectedRoute';

function ProfileContent() {
    const { user, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const router = useRouter();

    const handleUpdateProfile = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/profile`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name }),
            });

            if (response.ok) {
                toast.success('Profile updated successfully');
                setIsEditing(false);
                window.location.reload(); // Refresh to get updated user data
            } else {
                toast.error('Failed to update profile');
            }
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out successfully');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 p-4">
            <div className="max-w-2xl mx-auto pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Profile</CardTitle>
                            <CardDescription>Manage your account settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* User Info */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                                        <User className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold">{user?.name}</h3>
                                        <p className="text-sm text-gray-500">{user?.email}</p>
                                    </div>
                                </div>

                                {/* Edit Name */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        <User className="w-4 h-4 inline mr-2" />
                                        Name
                                    </label>
                                    {isEditing ? (
                                        <div className="flex space-x-2">
                                            <Input
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Your name"
                                            />
                                            <Button onClick={handleUpdateProfile}>Save</Button>
                                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                                                Cancel
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <span>{user?.name}</span>
                                            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                                Edit
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Email (read-only) */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        <Mail className="w-4 h-4 inline mr-2" />
                                        Email
                                    </label>
                                    <Input value={user?.email} disabled />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Email cannot be changed
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-6 border-t space-y-3">
                                <Button
                                    onClick={() => router.push('/')}
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    My Sessions
                                </Button>

                                <Button
                                    onClick={handleLogout}
                                    variant="destructive"
                                    className="w-full"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <ProtectedRoute>
            <ProfileContent />
        </ProtectedRoute>
    );
}
