'use client';

import { useState, useEffect } from 'react';
import {
    User, Mail, Phone, MapPin, Calendar, Hash, Lock,
    Eye, EyeOff, Loader2, CheckCircle, AlertCircle,
    Shield, ShieldCheck, Activity, Award, UserCheck,
    FileSpreadsheet, Sparkles, Edit, Camera, Upload
} from 'lucide-react';
import { getCookie, setCookie } from '@/lib/cookies';
import { authClient } from '@/lib/auth-client';

interface UserProfileFormProps {
    title: string;
}

export default function UserProfileForm({ title }: UserProfileFormProps) {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [passwordChanging, setPasswordChanging] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Editing toggles
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Profile fields
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [address, setAddress] = useState('');
    const [dob, setDob] = useState('');
    const [nid, setNid] = useState('');

    // Password fields
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                let token = getCookie('token');

                // Fallback to better-auth session if cookie token isn't present
                if (!token) {
                    const sessionData = await authClient.getSession();
                    token = (sessionData?.data?.session as any)?.accessToken || (sessionData?.data as any)?.accessToken;
                }

                if (!token) {
                    setMessage({ type: 'error', text: 'Authentication session expired. Please sign in again.' });
                    setLoading(false);
                    return;
                }

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const contentType = res.headers.get('content-type');
                if (!res.ok || !contentType?.includes('application/json')) {
                    throw new Error('Failed to retrieve server data.');
                }

                const data = await res.json();
                if (data && data._id) {
                    setProfile(data);
                    setName(data.name || '');
                    setMobile(data.mobile || '');
                    setAddress(data.address || '');
                    setDob(data.dob ? data.dob.split('T')[0] : '');
                    setNid(data.nid || '');
                } else {
                    setMessage({ type: 'error', text: 'Error loading profile attributes' });
                }
            } catch (err: any) {
                console.error('Profile load error:', err);
                setMessage({ type: 'error', text: 'Could not fetch your profile data. Please verify connection and retry.' });
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            let token = getCookie('token');
            if (!token) {
                const sessionData = await authClient.getSession();
                token = (sessionData?.data?.session as any)?.accessToken || (sessionData?.data as any)?.accessToken;
            }

            if (!token) {
                setMessage({ type: 'error', text: 'Not authenticated' });
                setSaving(false);
                return;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name, mobile, address, dob, nid, image: profile?.image }),
            });

            const contentType = res.headers.get('content-type');
            if (!res.ok || !contentType?.includes('application/json')) {
                throw new Error('Failed to save profile changes');
            }

            await res.json();
            setMessage({ type: 'success', text: 'Your profile information has been successfully updated!' });

            // Sync local profile state as well
            setProfile((prev: any) => ({ ...prev, name, mobile, address, dob, nid }));

            // Sync cookie
            const userStr = getCookie('user');
            if (userStr) {
                try {
                    const parsed = JSON.parse(userStr);
                    parsed.name = name;
                    setCookie('user', JSON.stringify(parsed), 7);
                } catch (err) {
                    console.error('Error parsing user cookie:', err);
                }
            }

            // Dispatch custom event to notify layout (topbar, sidebar)
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('user-profile-updated'));
            }

            setIsEditing(false);
        } catch (err: any) {
            console.error('Update profile error:', err);
            setMessage({ type: 'error', text: err.message || 'Update failed' });
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        setMessage(null);

        try {
            // 1. Upload to ImgBB
            const formData = new FormData();
            formData.append('image', file);

            const imgbbKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
            if (!imgbbKey) {
                throw new Error('ImgBB API key is not configured in environment variables.');
            }

            const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
                method: 'POST',
                body: formData
            });

            if (!imgbbRes.ok) {
                throw new Error('Failed to upload image to ImgBB.');
            }

            const imgbbData = await imgbbRes.json();
            const imageUrl = imgbbData?.data?.url;

            if (!imageUrl) {
                throw new Error('Did not receive image URL from ImgBB.');
            }

            // 2. Save image URL to backend
            let token = getCookie('token');
            if (!token) {
                const sessionData = await authClient.getSession();
                token = (sessionData?.data?.session as any)?.accessToken || (sessionData?.data as any)?.accessToken;
            }

            if (!token) {
                throw new Error('Session expired. Please sign in again.');
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name, mobile, address, dob, nid, image: imageUrl }),
            });

            if (!res.ok) {
                throw new Error('Failed to update profile photo on server.');
            }

            // Sync state
            setProfile((prev: any) => ({ ...prev, image: imageUrl }));

            // Sync cookie
            const userStr = getCookie('user');
            if (userStr) {
                try {
                    const parsed = JSON.parse(userStr);
                    parsed.image = imageUrl;
                    setCookie('user', JSON.stringify(parsed), 7);
                } catch (err) {
                    console.error('Error parsing user cookie:', err);
                }
            }

            setMessage({ type: 'success', text: 'Profile picture updated successfully!' });

            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('user-profile-updated'));
            }
        } catch (err: any) {
            console.error('Image upload error:', err);
            setMessage({ type: 'error', text: err.message || 'Profile picture upload failed.' });
        } finally {
            setUploadingImage(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New password mismatch. Please re-enter passwords.' });
            return;
        }
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
            return;
        }

        setPasswordChanging(true);
        setMessage(null);

        try {
            let token = getCookie('token');
            if (!token) {
                const sessionData = await authClient.getSession();
                token = (sessionData?.data?.session as any)?.accessToken || (sessionData?.data as any)?.accessToken;
            }

            if (!token) {
                setMessage({ type: 'error', text: 'Not authenticated' });
                setPasswordChanging(false);
                return;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const contentType = res.headers.get('content-type');
            if (!res.ok || !contentType?.includes('application/json')) {
                throw new Error('Failed to modify your login password. Ensure your current password is correct.');
            }

            await res.json();
            setMessage({ type: 'success', text: 'Password modified successfully! Please keep it secure.' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setIsChangingPassword(false);
        } catch (err: any) {
            console.error('Password change error:', err);
            setMessage({ type: 'error', text: err.message || 'Password update failed' });
        } finally {
            setPasswordChanging(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[350px] space-y-4">
                <Loader2 size={40} className="animate-spin text-emerald-600" />
                <p className="text-xs text-slate-400 font-mono">Retrieving secure profile telemetry...</p>
            </div>
        );
    }

    // Get simple initials for profile avatar
    const getInitials = (userName: string) => {
        if (!userName) return 'U';
        return userName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    };

    // Style helper for distinct role badges
    const getRoleBadgeStyle = (role: string) => {
        const lower = (role || 'consumer').toLowerCase();
        if (lower.includes('admin')) {
            return {
                bg: 'bg-rose-50 border-rose-200 text-rose-700',
                icon: Shield,
                label: 'System Administrator'
            };
        }
        if (lower.includes('xen') || lower.includes('engineer')) {
            return {
                bg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
                icon: Award,
                label: 'Executive Engineer'
            };
        }
        if (lower.includes('billing')) {
            return {
                bg: 'bg-amber-50 border-amber-200 text-amber-700',
                icon: FileSpreadsheet,
                label: 'Billing Officer'
            };
        }
        return {
            bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
            icon: UserCheck,
            label: 'Registered Consumer'
        };
    };

    const roleBadge = getRoleBadgeStyle(profile?.role || '');
    const RoleIcon = roleBadge.icon;

    // Estimate profile completion percentage
    const completionPercent = [name, mobile, address, dob, nid].filter(Boolean).length * 20;

    return (
        <div className="space-y-8 max-w-5xl">
            {/* Header / Title */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <User size={24} className="text-emerald-600" />
                    <span>{title || 'User Profile'}</span>
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                    Maintain secure utility permissions, contact endpoints, and authentication credentials.
                </p>
            </div>

            {/* Notification Banner */}
            {message && (
                <div className={`p-4 rounded-xl flex items-start gap-3 border shadow-sm transition-all duration-300 ${message.type === 'success'
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-850'
                        : 'bg-rose-50/80 border-rose-200 text-rose-850'
                    }`}>
                    {message.type === 'success' ? (
                        <CheckCircle size={20} className="text-emerald-600 mt-0.5 shrink-0" />
                    ) : (
                        <AlertCircle size={20} className="text-rose-600 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 text-xs sm:text-sm font-medium">
                        {message.text}
                    </div>
                    <button
                        onClick={() => setMessage(null)}
                        className="ml-auto text-slate-400 hover:text-slate-600 font-bold transition-colors"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Premium Profile Banner Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10">
                    <div className="relative group">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-2xl font-extrabold shadow-inner border-2 border-slate-700 overflow-hidden relative">
                            {profile?.image ? (
                                <img src={profile.image} alt={name} className="w-full h-full object-cover" />
                            ) : (
                                getInitials(name || profile?.email)
                            )}
                            {uploadingImage && (
                                <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                                    <Loader2 size={20} className="animate-spin text-emerald-400" />
                                </div>
                            )}
                        </div>

                        <label className="absolute -bottom-1 -right-1 bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-full shadow-md cursor-pointer transition-all hover:scale-110 flex items-center justify-center border border-slate-800" title="Change Profile Picture">
                            <Camera size={14} />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={uploadingImage}
                            />
                        </label>
                    </div>

                    <div className="space-y-1 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                            <h2 className="text-xl font-bold tracking-tight text-white">{name || 'Unnamed User'}</h2>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleBadge.bg} uppercase tracking-wider`}>
                                <RoleIcon size={10} />
                                <span>{roleBadge.label}</span>
                            </span>
                        </div>
                        <p className="text-xs text-slate-300 font-mono flex items-center justify-center sm:justify-start gap-1">
                            <Mail size={12} className="text-slate-400" />
                            <span>{profile?.email}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                            <Activity size={10} className="text-emerald-400" />
                            <span>System ID: <span className="font-mono">{profile?._id}</span></span>
                        </p>
                    </div>
                </div>

                {/* Profile Completion Score Meter */}
                <div className="w-full md:w-64 bg-slate-800/80 border border-slate-700/50 p-4 rounded-xl space-y-2.5 relative z-10">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 font-semibold flex items-center gap-1">
                            <Sparkles size={12} className="text-amber-400" />
                            <span>Profile Health</span>
                        </span>
                        <span className="font-bold text-emerald-400 font-mono">{completionPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${completionPercent}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                        {completionPercent === 100
                            ? 'Excellent! Your administrative registry parameters are complete.'
                            : 'Complete all fields on the left to reach 100% data integrity.'}
                    </p>
                </div>
            </div>

            {/* Bento-Style Forms Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Personal Information (Left Larger Bento Box) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm sm:text-base">Personal Information</h3>
                                <p className="text-[11px] text-slate-500">Official registry attributes used for WZPDCL bills & meter requests.</p>
                            </div>
                            {!isEditing ? (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                                >
                                    <Edit size={14} />
                                    <span>Edit Info</span>
                                </button>
                            ) : (
                                <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 animate-pulse">Editing Mode</span>
                            )}
                        </div>

                        <form id="profile-form" onSubmit={handleProfileUpdate} className="p-6 space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* Name */}
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                                    <div className="relative">
                                        <User size={16} className={`absolute left-3.5 top-3.5 ${isEditing ? 'text-slate-400' : 'text-slate-300'}`} />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            disabled={!isEditing}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all text-xs sm:text-sm font-medium ${isEditing
                                                    ? 'border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-inner'
                                                    : 'border-slate-100 bg-slate-50/60 text-slate-500 cursor-not-allowed'
                                                }`}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Read-only Email */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                                        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-0.5">
                                            <ShieldCheck size={10} /> Lock
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-300" />
                                        <input
                                            type="email"
                                            value={profile?.email || ''}
                                            className="w-full pl-10 pr-4 py-3 border border-slate-100 rounded-xl bg-slate-50/60 text-slate-400 cursor-not-allowed text-xs sm:text-sm font-medium"
                                            readOnly
                                        />
                                    </div>
                                </div>

                                {/* Mobile */}
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Mobile Number</label>
                                    <div className="relative">
                                        <Phone size={16} className={`absolute left-3.5 top-3.5 ${isEditing ? 'text-slate-400' : 'text-slate-300'}`} />
                                        <input
                                            type="tel"
                                            value={mobile}
                                            onChange={e => setMobile(e.target.value)}
                                            disabled={!isEditing}
                                            placeholder="+880 1XXX XXXXXX"
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all text-xs sm:text-sm font-medium ${isEditing
                                                    ? 'border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-inner'
                                                    : 'border-slate-100 bg-slate-50/60 text-slate-500 cursor-not-allowed'
                                                }`}
                                        />
                                    </div>
                                </div>

                                {/* Date of Birth */}
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Date of Birth</label>
                                    <div className="relative">
                                        <Calendar size={16} className={`absolute left-3.5 top-3.5 ${isEditing ? 'text-slate-400' : 'text-slate-300'}`} />
                                        <input
                                            type="date"
                                            value={dob}
                                            onChange={e => setDob(e.target.value)}
                                            disabled={!isEditing}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all text-xs sm:text-sm font-medium ${isEditing
                                                    ? 'border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-inner'
                                                    : 'border-slate-100 bg-slate-50/60 text-slate-500 cursor-not-allowed'
                                                }`}
                                        />
                                    </div>
                                </div>

                                {/* NID Number */}
                                <div className="space-y-1 sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">NID / Smart Card Number</label>
                                    <div className="relative">
                                        <Hash size={16} className={`absolute left-3.5 top-3.5 ${isEditing ? 'text-slate-400' : 'text-slate-300'}`} />
                                        <input
                                            type="text"
                                            value={nid}
                                            onChange={e => setNid(e.target.value)}
                                            disabled={!isEditing}
                                            placeholder="National Identification Code"
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all text-xs sm:text-sm font-medium ${isEditing
                                                    ? 'border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-inner'
                                                    : 'border-slate-100 bg-slate-50/60 text-slate-500 cursor-not-allowed'
                                                }`}
                                        />
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="space-y-1 sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Mailing / Delivery Address</label>
                                    <div className="relative">
                                        <MapPin size={16} className={`absolute left-3.5 top-3.5 ${isEditing ? 'text-slate-400' : 'text-slate-300'}`} />
                                        <textarea
                                            value={address}
                                            onChange={e => setAddress(e.target.value)}
                                            disabled={!isEditing}
                                            rows={3}
                                            placeholder="House, Street, Area/Holding, Post Office, District"
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all text-xs sm:text-sm font-medium resize-none ${isEditing
                                                    ? 'border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-inner'
                                                    : 'border-slate-100 bg-slate-50/60 text-slate-500 cursor-not-allowed'
                                                }`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {isEditing && (
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 animate-fadeIn">
                            <button
                                type="button"
                                onClick={() => {
                                    setName(profile?.name || '');
                                    setMobile(profile?.mobile || '');
                                    setAddress(profile?.address || '');
                                    setDob(profile?.dob ? profile?.dob.split('T')[0] : '');
                                    setNid(profile?.nid || '');
                                    setIsEditing(false);
                                    setMessage(null);
                                }}
                                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="profile-form"
                                disabled={saving}
                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl disabled:opacity-50 flex items-center gap-2 shadow-sm transition-all duration-150 active:scale-98"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Change Password (Right Smaller Bento Box) */}
                <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm sm:text-base">Security Settings</h3>
                                <p className="text-[11px] text-slate-500">Regularly update credentials to maintain account security.</p>
                            </div>
                        </div>

                        {!isChangingPassword ? (
                            <div className="p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[250px]">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 text-slate-400">
                                    <Lock size={20} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-slate-850 text-xs sm:text-sm">Password Status: Encrypted</h4>
                                    <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                                        Your account is protected. Change your password periodically to prevent unauthorized access.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsChangingPassword(true)}
                                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-950 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all duration-150 active:scale-95"
                                >
                                    <Lock size={14} />
                                    <span>Change Password</span>
                                </button>
                            </div>
                        ) : (
                            <form id="password-form" onSubmit={handlePasswordChange} className="p-6 space-y-4 animate-fadeIn">
                                {/* Current Password */}
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Current Password</label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                                        <input
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            value={currentPassword}
                                            onChange={e => setCurrentPassword(e.target.value)}
                                            className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-xs sm:text-sm font-medium text-slate-800 shadow-inner"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">New Password</label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-xs sm:text-sm font-medium text-slate-800 shadow-inner"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Confirm New Password</label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-xs sm:text-sm font-medium text-slate-800 shadow-inner"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>

                    {isChangingPassword && (
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setCurrentPassword('');
                                    setNewPassword('');
                                    setConfirmPassword('');
                                    setIsChangingPassword(false);
                                    setMessage(null);
                                }}
                                className="w-1/3 px-3 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all active:scale-95 text-center"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="password-form"
                                disabled={passwordChanging}
                                className="w-2/3 px-4 py-2.5 bg-slate-800 hover:bg-slate-950 text-white text-xs font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-150 active:scale-98 shadow-sm"
                            >
                                {passwordChanging ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                                {passwordChanging ? 'Changing...' : 'Save Password'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
