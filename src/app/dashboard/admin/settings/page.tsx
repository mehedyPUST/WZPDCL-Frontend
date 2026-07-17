// src/app/dashboard/admin/settings/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getCookie } from '@/lib/cookies';
import {
    Loader2, Save, Settings, AlertCircle, CheckCircle,
    Home, Building2, Factory, DollarSign, HelpCircle,
    Calculator, ArrowUpRight, ShieldCheck, RefreshCw, Info,
    Gauge, Activity
} from 'lucide-react';

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

    // Simulator states
    const [simType, setSimType] = useState<'residential' | 'commercial' | 'industrial'>('residential');
    const [simUnits, setSimUnits] = useState(150);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'rates' | 'connection' | 'security'>('rates');

    // Fetch values on mount
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
            .catch(() => setMessage({ type: 'error', text: 'Failed to load settings from WZPDCL database.' }))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        const token = getCookie('token');
        if (!token) { setMessage({ type: 'error', text: 'Not authenticated' }); return; }
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
            if (!res.ok) throw new Error(data.message || 'Failed to update system rates configuration');
            setMessage({ type: 'success', text: 'System configuration parameters updated successfully!' });
            // auto dismiss after 5s
            setTimeout(() => {
                setMessage(null);
            }, 5000);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
        }
    };

    // Derived dynamic simulation calculations
    const simulatedBillRate = simType === 'residential' ? billRateResidential : simType === 'commercial' ? billRateCommercial : billRateIndustrial;
    const simulatedConnectionFee = simType === 'residential' ? connectionFeeResidential : simType === 'commercial' ? connectionFeeCommercial : connectionFeeIndustrial;
    const simulatedSecurityDeposit = simType === 'residential' ? securityDepositResidential : simType === 'commercial' ? securityDepositCommercial : securityDepositIndustrial;

    const energyCharge = simUnits * simulatedBillRate;
    const demandCharge = simType === 'residential' ? 40 : simType === 'commercial' ? 80 : 150;
    const vatAmount = Math.round(energyCharge * 0.05); // 5% VAT typical for utility
    const estimatedTotalBill = energyCharge + demandCharge + vatAmount;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="animate-spin text-emerald-600" size={48} />
                <p className="text-sm font-medium text-gray-500">Querying live system config variables...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Elegant Header Card */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-emerald-700/50">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-700/40 border border-emerald-600/30 rounded-full text-xs font-semibold tracking-wide text-emerald-200">
                        <ShieldCheck size={14} /> SECURITY CLEARANCE: LEVEL 1 (ADMIN)
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                        Rate Settings & Tariffs
                    </h2>
                    <p className="text-emerald-100/80 text-sm max-w-xl">
                        Fine-tune WZPDCL power consumption rates, security deposit tiers, grid meter connection charges, and run live calculations.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex items-center gap-1.5 bg-emerald-900/40 border border-emerald-700/60 rounded-2xl px-4 py-2.5 text-xs text-emerald-200">
                        <Gauge size={16} className="text-emerald-400" />
                        <span>State: <strong className="text-white">Active Grid</strong></span>
                    </div>
                </div>
            </div>

            {/* Notification message */}
            {message && (
                <div className={`p-4 rounded-2xl flex items-start gap-3 shadow-sm animate-in slide-in-from-top-2 duration-200 ${message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                    {message.type === 'success' ? <CheckCircle size={20} className="text-emerald-600 mt-0.5" /> : <AlertCircle size={20} className="text-red-600 mt-0.5" />}
                    <div className="space-y-0.5">
                        <p className="font-bold text-sm">{message.type === 'success' ? 'Action Succeeded' : 'Configuration Error'}</p>
                        <p className="text-xs opacity-90">{message.text}</p>
                    </div>
                    <button onClick={() => setMessage(null)} className="ml-auto text-gray-400 hover:text-gray-600 font-bold px-2">✕</button>
                </div>
            )}

            {/* Split layout: Config parameters vs Simulator panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Inputs Card */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
                        {/* Tabs list */}
                        <div className="flex border-b border-gray-100 pb-3 gap-2">
                            <button
                                onClick={() => setActiveTab('rates')}
                                className={`pb-2.5 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'rates' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                <DollarSign size={16} />
                                <span>Energy Tariffs</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('connection')}
                                className={`pb-2.5 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'connection' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                <ArrowUpRight size={16} />
                                <span>Connection Charges</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`pb-2.5 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'security' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                <ShieldCheck size={16} />
                                <span>Security Deposit Tiers</span>
                            </button>
                        </div>

                        {/* TAB 1: ENERGY RATES */}
                        {activeTab === 'rates' && (
                            <div className="space-y-5">
                                <div className="space-y-1">
                                    <h3 className="font-extrabold text-gray-800 text-lg flex items-center gap-2">
                                        Electricity Consumption Tariffs (Per Unit)
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        Rates are in Bangladeshi Taka (৳) per single kilowatt-hour (kWh). These directly affect billing calculation algorithms.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                                    <RateInputCard
                                        icon={<Home className="text-emerald-600" size={20} />}
                                        title="Residential Tariff"
                                        desc="Consumer standard domestic rate"
                                        value={billRateResidential}
                                        onChange={setBillRateResidential}
                                        unit="৳ / kWh"
                                    />
                                    <RateInputCard
                                        icon={<Building2 className="text-blue-600" size={20} />}
                                        title="Commercial Tariff"
                                        desc="Commercial & retail outlet rate"
                                        value={billRateCommercial}
                                        onChange={setBillRateCommercial}
                                        unit="৳ / kWh"
                                    />
                                    <RateInputCard
                                        icon={<Factory className="text-purple-600" size={20} />}
                                        title="Industrial Tariff"
                                        desc="Heavy manufacture grid rate"
                                        value={billRateIndustrial}
                                        onChange={setBillRateIndustrial}
                                        unit="৳ / kWh"
                                    />
                                </div>
                            </div>
                        )}

                        {/* TAB 2: CONNECTION CHARGES */}
                        {activeTab === 'connection' && (
                            <div className="space-y-5">
                                <div className="space-y-1">
                                    <h3 className="font-extrabold text-gray-800 text-lg flex items-center gap-2">
                                        Grid Connection Fees
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        Invoiced during connection approval sequence. This is the flat charge for transformer integration, meter lines, and grid handshakes.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                                    <RateInputCard
                                        icon={<Home className="text-emerald-600" size={20} />}
                                        title="Residential Fee"
                                        desc="Single-phase residential meter"
                                        value={connectionFeeResidential}
                                        onChange={setConnectionFeeResidential}
                                        unit="৳ Flat"
                                    />
                                    <RateInputCard
                                        icon={<Building2 className="text-blue-600" size={20} />}
                                        title="Commercial Fee"
                                        desc="Retail/office business connection"
                                        value={connectionFeeCommercial}
                                        onChange={setConnectionFeeCommercial}
                                        unit="৳ Flat"
                                    />
                                    <RateInputCard
                                        icon={<Factory className="text-purple-600" size={20} />}
                                        title="Industrial Fee"
                                        desc="Three-phase high-voltage connection"
                                        value={connectionFeeIndustrial}
                                        onChange={setConnectionFeeIndustrial}
                                        unit="৳ Flat"
                                    />
                                </div>
                            </div>
                        )}

                        {/* TAB 3: SECURITY DEPOSIT */}
                        {activeTab === 'security' && (
                            <div className="space-y-5">
                                <div className="space-y-1">
                                    <h3 className="font-extrabold text-gray-800 text-lg flex items-center gap-2">
                                        Refundable Security Deposits
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        Initial deposit held by WZPDCL during user onboarding, returned upon active account decommissioning.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                                    <RateInputCard
                                        icon={<Home className="text-emerald-600" size={20} />}
                                        title="Residential Deposit"
                                        desc="Default safety collateral tier"
                                        value={securityDepositResidential}
                                        onChange={setSecurityDepositResidential}
                                        unit="৳ Security"
                                    />
                                    <RateInputCard
                                        icon={<Building2 className="text-blue-600" size={20} />}
                                        title="Commercial Deposit"
                                        desc="Business risk premium collateral"
                                        value={securityDepositCommercial}
                                        onChange={setSecurityDepositCommercial}
                                        unit="৳ Security"
                                    />
                                    <RateInputCard
                                        icon={<Factory className="text-purple-600" size={20} />}
                                        title="Industrial Deposit"
                                        desc="High load security reserve tier"
                                        value={securityDepositIndustrial}
                                        onChange={setSecurityDepositIndustrial}
                                        unit="৳ Security"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                            <span className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
                                <Info size={14} className="text-emerald-600" />
                                Changes immediately apply to active computation algorithms.
                            </span>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2 shadow-md"
                            >
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                <span>{saving ? 'Updating Matrix...' : 'Commit Changes'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Sandbox Tariff Simulator */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-gray-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-6">
                        <div className="space-y-1">
                            <h3 className="font-extrabold text-lg flex items-center gap-2 text-emerald-400">
                                <Calculator size={18} />
                                Live Billing Simulator
                            </h3>
                            <p className="text-xs text-slate-400">
                                Preview estimated customer invoices with current configurations.
                            </p>
                        </div>

                        {/* Customer Type Selector */}
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Customer Class</label>
                            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-800/60 rounded-xl border border-slate-700/50">
                                <button
                                    type="button"
                                    onClick={() => setSimType('residential')}
                                    className={`py-1.5 text-xs font-bold rounded-lg transition-all ${simType === 'residential' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Home
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSimType('commercial')}
                                    className={`py-1.5 text-xs font-bold rounded-lg transition-all ${simType === 'commercial' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Shop
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSimType('industrial')}
                                    className={`py-1.5 text-xs font-bold rounded-lg transition-all ${simType === 'industrial' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Factory
                                </button>
                            </div>
                        </div>

                        {/* Units Range Slider */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Sample consumption</label>
                                <span className="font-mono text-emerald-400 font-bold">{simUnits} Units (kWh)</span>
                            </div>
                            <input
                                type="range"
                                min="20"
                                max="1500"
                                step="10"
                                value={simUnits}
                                onChange={(e) => setSimUnits(Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                        </div>

                        {/* Estimation Breakdown */}
                        <div className="space-y-3.5 border-t border-slate-800 pt-5 text-sm">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Applied Rate Profile:</span>
                                <span className="font-mono text-slate-200">৳{simulatedBillRate} / kWh</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Energy Charge:</span>
                                <span className="font-mono text-slate-200">৳{energyCharge.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Fixed demand charge:</span>
                                <span className="font-mono text-slate-200">৳{demandCharge}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Govt VAT (5%):</span>
                                <span className="font-mono text-slate-200">৳{vatAmount}</span>
                            </div>

                            <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/40 rounded-2xl flex justify-between items-center mt-3">
                                <div>
                                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Estimated Invoice</p>
                                    <p className="text-xs text-slate-400">Includes surcharge</p>
                                </div>
                                <span className="font-mono text-2xl font-black text-emerald-300">৳{estimatedTotalBill.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Onboarding preview info */}
                        <div className="border-t border-slate-800 pt-4.5 space-y-2.5">
                            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Onboarding Package Charges</span>
                            <div className="grid grid-cols-2 gap-3.5">
                                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                                    <p className="text-[10px] text-slate-400">Connection Fee</p>
                                    <p className="font-mono text-sm font-bold text-slate-200 mt-1">৳{simulatedConnectionFee.toLocaleString()}</p>
                                </div>
                                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                                    <p className="text-[10px] text-slate-400">Refundable deposit</p>
                                    <p className="font-mono text-sm font-bold text-slate-200 mt-1">৳{simulatedSecurityDeposit.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RateInputCard({
    icon, title, desc, value, onChange, unit
}: {
    icon: React.ReactNode;
    title: string;
    desc: string;
    value: number;
    onChange: (val: number) => void;
    unit: string;
}) {
    return (
        <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4.5 flex flex-col justify-between hover:border-emerald-100 transition-all hover:bg-emerald-50/10 shadow-sm">
            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100/50 flex-shrink-0">
                        {icon}
                    </div>
                    <h4 className="font-bold text-sm text-gray-800 leading-tight truncate">{title}</h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed min-h-[32px]">
                    {desc}
                </p>
            </div>

            <div className="space-y-1">
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">৳</span>
                    <input
                        type="number"
                        min="0"
                        value={value}
                        onChange={(e) => onChange(Number(e.target.value))}
                        className="w-full pl-6.5 pr-20 py-2.5 bg-white border border-gray-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-extrabold text-gray-700 shadow-inner transition-all"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-700 tracking-wider bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded uppercase">
                        {unit}
                    </span>
                </div>
            </div>
        </div>
    );
}
