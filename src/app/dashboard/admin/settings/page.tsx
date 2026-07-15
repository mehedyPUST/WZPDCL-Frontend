'use client';

import { useEffect, useState } from 'react';
import { getCookie } from '@/lib/cookies';
import { Loader2, Save, Settings, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminSettingsPage() {
    const [connectionFeeResidential, setConnectionFeeResidential] = useState(5000);
    const [connectionFeeCommercial, setConnectionFeeCommercial] = useState(10000);
    const [connectionFeeIndustrial, setConnectionFeeIndustrial] = useState(20000);
    const [securityDepositResidential, setSecurityDepositResidential] = useState(2000);
    const [securityDepositCommercial, setSecurityDepositCommercial] = useState(5000);
    const [securityDepositIndustrial, setSecurityDepositIndustrial] = useState(10000);
    const [billRateResidential, setBillRateResidential] = useState(5);
    const [billRateCommercial, setBillRateCommercial] = useState(10);
    const [billRateIndustrial, setBillRateIndustrial] = useState(15);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // ✅ পেজ লোডে ব্যাকএন্ড থেকে সেটিংস ফেচ
    useEffect(() => {
        const token = getCookie('token');
        if (!token) {
            setMessage({ type: 'error', text: 'Not authenticated' });
            setLoading(false);
            return;
        }
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                if (data) {
                    setConnectionFeeResidential(data.connectionFeeResidential ?? 5000);
                    setConnectionFeeCommercial(data.connectionFeeCommercial ?? 10000);
                    setConnectionFeeIndustrial(data.connectionFeeIndustrial ?? 20000);
                    setSecurityDepositResidential(data.securityDepositResidential ?? 2000);
                    setSecurityDepositCommercial(data.securityDepositCommercial ?? 5000);
                    setSecurityDepositIndustrial(data.securityDepositIndustrial ?? 10000);
                    setBillRateResidential(data.billRateResidential ?? 5);
                    setBillRateCommercial(data.billRateCommercial ?? 10);
                    setBillRateIndustrial(data.billRateIndustrial ?? 15);
                }
            })
            .catch(() => setMessage({ type: 'error', text: 'Failed to load settings' }))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        const token = getCookie('token');
        if (!token) { setMessage({ type: 'error', text: 'Not authenticated' }); return; }
        setSaving(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                // ✅ ফ্ল্যাট ফিল্ড পাঠানো হচ্ছে
                body: JSON.stringify({
                    connectionFeeResidential,
                    connectionFeeCommercial,
                    connectionFeeIndustrial,
                    securityDepositResidential,
                    securityDepositCommercial,
                    securityDepositIndustrial,
                    billRateResidential,
                    billRateCommercial,
                    billRateIndustrial,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to save');
            setMessage({ type: 'success', text: 'Settings saved successfully!' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="animate-spin text-emerald-600" size={48} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
            <div>
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-xl"><Settings size={28} className="text-emerald-600" /></div>
                    Rate Settings
                </h2>
                <p className="text-gray-500 mt-1 ml-14">Configure connection fees, security deposits, and billing rates.</p>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    {message.type === 'success' ? <CheckCircle size={20} className="text-green-600" /> : <AlertCircle size={20} className="text-red-600" />}
                    <p className={`text-sm ${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>{message.text}</p>
                    <button onClick={() => setMessage(null)} className="ml-auto text-gray-400 hover:text-gray-600">✕</button>
                </div>
            )}

            {/* Connection Fees */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Connection Fees (৳)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <InputField label="Residential" value={connectionFeeResidential} onChange={setConnectionFeeResidential} />
                    <InputField label="Commercial" value={connectionFeeCommercial} onChange={setConnectionFeeCommercial} />
                    <InputField label="Industrial" value={connectionFeeIndustrial} onChange={setConnectionFeeIndustrial} />
                </div>
            </div>

            {/* Security Deposits */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Security Deposits (৳)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <InputField label="Residential" value={securityDepositResidential} onChange={setSecurityDepositResidential} />
                    <InputField label="Commercial" value={securityDepositCommercial} onChange={setSecurityDepositCommercial} />
                    <InputField label="Industrial" value={securityDepositIndustrial} onChange={setSecurityDepositIndustrial} />
                </div>
            </div>

            {/* Bill Rates (per unit) */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Bill Rates (৳ per unit)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <InputField label="Residential" value={billRateResidential} onChange={setBillRateResidential} />
                    <InputField label="Commercial" value={billRateCommercial} onChange={setBillRateCommercial} />
                    <InputField label="Industrial" value={billRateIndustrial} onChange={setBillRateIndustrial} />
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
}

function InputField({ label, value, onChange }: { label: string; value: number; onChange: (val: number) => void }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2.5 bg-gray-50 focus:ring-2 focus:ring-emerald-500"
            />
        </div>
    );
}