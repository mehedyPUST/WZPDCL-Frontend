// src/app/(auth)/register/page.tsx
'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Mail, Lock, User, ArrowRight, Eye, EyeOff, Loader2, Zap, Camera, Upload
} from 'lucide-react';
import { setCookie } from '@/lib/cookies';

const rolePaths: Record<string, string> = {
    admin: '/dashboard/admin',
    xen: '/dashboard/xen',
    connection_wing: '/dashboard/connection',
    complaint_manager: '/dashboard/complaint_manager',
    billing: '/dashboard/billing',
    consumer: '/dashboard/consumer',
};

function RegisterForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // ---- Optional Image Upload ----
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const uploadToImgBB = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch(
            `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
            { method: 'POST', body: formData }
        );
        if (!res.ok) throw new Error('Image upload failed');
        const data = await res.json();
        return data.data.url; // direct image URL
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let imageUrl = '';

            // Upload image if selected
            if (image) {
                setUploadingImage(true);
                try {
                    imageUrl = await uploadToImgBB(image);
                } catch (uploadErr) {
                    setError('Failed to upload image. Please try again.');
                    setLoading(false);
                    setUploadingImage(false);
                    return;
                }
                setUploadingImage(false);
            }

            // Register user with backend (image optional)
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, image: imageUrl }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Auto login after successful registration
            const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const loginData = await loginRes.json();

            if (!loginRes.ok) {
                throw new Error('Auto login failed, please login manually');
            }

            setCookie('token', loginData.token, 7);
            setCookie('user', JSON.stringify(loginData.user), 7);

            const role = loginData.user.role || 'consumer';
            router.push(rolePaths[role] || '/dashboard/consumer');
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
            setUploadingImage(false);
        }
    };

    return (
        <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4 py-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-emerald-100">
                <div className="text-center mb-8">
                    <div className="bg-emerald-100 p-3 rounded-full inline-flex mb-3">
                        <Zap className="text-emerald-600" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-emerald-800">Create Account</h1>
                    <p className="text-gray-500 text-sm mt-1">Join WZPDCL today</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
                )}

                {/* Profile Image Upload */}
                <div className="flex justify-center mb-6">
                    <label className="cursor-pointer relative group">
                        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden border-2 border-emerald-300 group-hover:border-emerald-500 transition-colors">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : uploadingImage ? (
                                <Loader2 size={32} className="animate-spin text-emerald-500" />
                            ) : (
                                <Camera size={32} className="text-emerald-500" />
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload size={20} className="text-white" />
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            disabled={loading}
                        />
                    </label>
                </div>
                <p className="text-xs text-center text-gray-400 -mt-4 mb-6">Profile photo (optional)</p>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            required
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || uploadingImage}
                        className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading || uploadingImage ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <ArrowRight size={18} />
                        )}
                        {loading || uploadingImage ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{' '}
                    <Link href="/login" className="text-emerald-600 font-medium hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-600" size={32} />
            </div>
        }>
            <RegisterForm />
        </Suspense>
    );
}