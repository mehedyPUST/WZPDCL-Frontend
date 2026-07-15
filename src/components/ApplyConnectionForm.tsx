'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from '@/lib/cookies';
import {
    Loader2, Zap, User, Phone, Mail, Hash, MapPin, Home, Activity
} from 'lucide-react';
import PaymentModal from '@/components/PaymentModal';

interface Props {
    onClose: () => void;
    onSuccess?: () => void;
}

export default function ApplyConnectionForm({ onClose, onSuccess }: Props) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        applicantName: '',
        email: '',
        mobile: '',
        nidNo: '',
        address: '',
        connectionType: 'residential' as const,
        loadRequired: '',
        voltageLevel: '230',
        purpose: 'domestic',
        feederName: '',
        transformerNo: '',
        poleNumber: '',
        nearestLandmark: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [applicationId, setApplicationId] = useState<string | null>(null);
    const [showPayment, setShowPayment] = useState(false);
    const [feeDetails, setFeeDetails] = useState({ connectionFee: 0, securityDeposit: 0 });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const calculateFees = () => {
        const connectionFee = formData.connectionType === 'residential' ? 5000 :
            formData.connectionType === 'commercial' ? 10000 : 20000;
        const securityDeposit = formData.connectionType === 'residential' ? 2000 :
            formData.connectionType === 'commercial' ? 5000 : 10000;
        return { connectionFee, securityDeposit };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const token = getCookie('token');
        if (!token) {
            setError('You must be logged in.');
            setLoading(false);
            return;
        }

        if (!formData.applicantName || !formData.mobile || !formData.address || !formData.loadRequired) {
            setError('Please fill all required fields.');
            setLoading(false);
            return;
        }

        try {
            const { connectionFee } = calculateFees();

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/connections/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    loadRequired: Number(formData.loadRequired),
                    status: 'pending_payment',
                    paymentStatus: 'pending',
                    feeAmount: connectionFee,
                }),
            });

            const data = await res.json();
            console.log('Apply Response:', data);

            if (!res.ok) {
                throw new Error(data.message || 'Application creation failed');
            }

            const appId = data._id || data.applicationId;
            if (!appId) {
                throw new Error('No application ID returned from server.');
            }

            setApplicationId(appId);
            const { connectionFee: cf, securityDeposit } = calculateFees();
            setFeeDetails({ connectionFee: cf, securityDeposit });
            setShowPayment(true);
        } catch (err: any) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = () => {
        setShowPayment(false);
        onClose();
        if (onSuccess) onSuccess();
        router.refresh();
    };

    if (showPayment && applicationId) {
        return (
            <PaymentModal
                applicationId={applicationId}
                connectionType={formData.connectionType}
                connectionFee={feeDetails.connectionFee}
                securityDeposit={feeDetails.securityDeposit}
                onClose={() => {
                    setShowPayment(false);
                    onClose();
                }}
                onSuccess={handlePaymentSuccess}
            />
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2">
                    <span>⚠️</span> {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Applicant Name" required name="applicantName" value={formData.applicantName} onChange={handleChange} Icon={User} />
                <InputField label="Mobile Number" required name="mobile" value={formData.mobile} onChange={handleChange} Icon={Phone} type="tel" />
                <InputField label="Email" name="email" value={formData.email} onChange={handleChange} Icon={Mail} type="email" />
                <InputField label="NID Number" name="nidNo" value={formData.nidNo} onChange={handleChange} Icon={Hash} />
                <SelectField label="Connection Type" required name="connectionType" value={formData.connectionType} onChange={handleChange}
                    options={[{ value: 'residential', label: 'Residential' }, { value: 'commercial', label: 'Commercial' }, { value: 'industrial', label: 'Industrial' }]} />
                <InputField label="Load Required (kW)" required name="loadRequired" value={formData.loadRequired} onChange={handleChange} type="number" Icon={Zap} />
                <SelectField label="Voltage Level" name="voltageLevel" value={formData.voltageLevel} onChange={handleChange}
                    options={[{ value: '230', label: '230V (Single Phase)' }, { value: '400', label: '400V (Three Phase)' }, { value: '11kV', label: '11 kV' }]} />
                <SelectField label="Purpose" name="purpose" value={formData.purpose} onChange={handleChange}
                    options={[{ value: 'domestic', label: 'Domestic' }, { value: 'commercial', label: 'Commercial' }, { value: 'industrial', label: 'Industrial' }, { value: 'agricultural', label: 'Agricultural' }]} />
                <InputField label="Feeder Name" name="feederName" value={formData.feederName} onChange={handleChange} Icon={Activity} />
                <InputField label="Transformer No" name="transformerNo" value={formData.transformerNo} onChange={handleChange} Icon={Zap} />
                <InputField label="Pole Number" name="poleNumber" value={formData.poleNumber} onChange={handleChange} Icon={Home} />
                <div className="col-span-full">
                    <InputField label="Nearest Landmark" name="nearestLandmark" value={formData.nearestLandmark} onChange={handleChange} Icon={MapPin} />
                </div>
                <div className="col-span-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Installation Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                        required
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Zap size={18} />}
                {loading ? 'Submitting...' : 'Submit Application'}
            </button>
        </form>
    );
}

// ---------- Helper Components (with required prop fixed) ----------
function InputField({
    label, name, value, onChange, Icon, type = 'text', required = false
}: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    Icon: any;
    type?: string;
    required?: boolean;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
            </div>
        </div>
    );
}

function SelectField({
    label, name, value, onChange, options, required = false
}: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    required?: boolean;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
}