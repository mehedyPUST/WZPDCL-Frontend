// src/app/dashboard/consumer/my-bills/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    FileText, Search, ChevronLeft, ChevronRight, RefreshCw,
    Loader2, AlertCircle, CheckCircle, Zap, Plus, CreditCard,
    Printer, X, Info
} from 'lucide-react';
import { getCookie } from '@/lib/cookies';
import ClaimMeterModal from '@/components/ClaimMeterModal';
import { calculateBangladeshBill } from '@/lib/tariff-calculator';

interface Bill {
    _id: string;
    meterNumber: string;
    amount: number;
    status: 'paid' | 'unpaid';
    dueDate: string;
    prevReading?: number;
    currReading?: number;
    consumerType?: 'residential' | 'commercial' | 'industrial';
    billingMonth?: string;
}

interface Meter {
    meterNumber: string;
    claimedBy: string;
}

const ITEMS_PER_PAGE = 5;

export default function MyBillsPage() {
    const router = useRouter();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [claimedMeters, setClaimedMeters] = useState<Meter[]>([]);
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [meterCheckLoading, setMeterCheckLoading] = useState(true);
    const [payingBillId, setPayingBillId] = useState<string | null>(null);

    // Invoice Printing States
    const [selectedInvoice, setSelectedInvoice] = useState<Bill | null>(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [user, setUser] = useState<any | null>(null);

    const fetchMetersAndBills = async () => {
        const token = getCookie('token');
        if (!token) {
            setError('Not authenticated');
            setLoading(false);
            setMeterCheckLoading(false);
            return;
        }

        // Set user details for billing letterhead
        const userStr = getCookie('user');
        if (userStr) {
            try {
                setUser(JSON.parse(userStr));
            } catch (e) {
                console.error('Error parsing user cookie:', e);
            }
        }

        try {
            const meterRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/meters/my`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const meterData = await meterRes.json();
            const metersList: Meter[] = Array.isArray(meterData) ? meterData : [];
            setClaimedMeters(metersList);
            setMeterCheckLoading(false);

            if (metersList.length === 0) {
                setBills([]);
                setLoading(false);
                return;
            }

            const billsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills/my`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const billsData = await billsRes.json();
            setBills(Array.isArray(billsData) ? billsData : []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetersAndBills();
    }, []);

    const filteredBills = useMemo(() => {
        return bills.filter(b =>
            b.meterNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [bills, searchTerm]);

    const totalPages = Math.ceil(filteredBills.length / ITEMS_PER_PAGE);
    const paginatedBills = filteredBills.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const stats = [
        { label: 'Total Bills', value: bills.length, icon: FileText, color: 'bg-blue-100 text-blue-600' },
        { label: 'Paid', value: bills.filter(b => b.status === 'paid').length, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
        { label: 'Unpaid', value: bills.filter(b => b.status === 'unpaid').length, icon: AlertCircle, color: 'bg-yellow-100 text-yellow-600' },
    ];

    const handlePayBill = async (billId: string) => {
        setPayingBillId(billId);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/create-checkout-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ billId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to create payment');
            window.location.href = data.url;
        } catch (err: any) {
            alert(err.message || 'Payment error');
        } finally {
            setPayingBillId(null);
        }
    };

    const handlePrintInvoice = () => {
        const printContent = document.getElementById('printable-invoice-content')?.innerHTML;
        if (!printContent) return;
        const win = window.open('', '_blank', 'width=800,height=900');
        if (!win) return;
        win.document.write(`
            <html>
                <head>
                    <title>WZPDCL Utility Bill Invoice</title>
                    <style>
                        body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1f2937; line-height: 1.5; }
                        .text-center { text-align: center; }
                        .border-b-2 { border-bottom: 2px solid #10b981; }
                        .pb-4 { padding-bottom: 16px; }
                        .mb-6 { margin-bottom: 24px; }
                        .text-2xl { font-size: 24px; font-weight: bold; }
                        .text-emerald-800 { color: #065f46; }
                        .text-xs { font-size: 12px; }
                        .text-gray-500 { color: #6b7280; }
                        .uppercase { text-transform: uppercase; }
                        .tracking-wider { tracking: 0.05em; }
                        .mt-0.5 { margin-top: 2px; }
                        .text-sm { font-size: 14px; }
                        .text-gray-700 { color: #374151; }
                        .font-semibold { font-weight: 600; }
                        .mt-2 { margin-top: 8px; }
                        .grid { display: grid; }
                        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
                        @media (min-width: 768px) {
                            .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                            .md\\:text-right { text-align: right; }
                        }
                        .gap-4 { gap: 16px; }
                        .font-bold { font-weight: 700; }
                        .text-gray-800 { color: #1f2937; }
                        .mb-1.5 { margin-bottom: 6px; }
                        .text-red-600 { color: #dc2626; }
                        .border { border: 1px solid #f3f4f6; }
                        .rounded-xl { border-radius: 12px; }
                        .overflow-hidden { overflow: hidden; }
                        table { width: 100%; border-collapse: collapse; }
                        thead { background-color: #f9fafb; }
                        th, td { padding: 12px; border-bottom: 1px solid #f3f4f6; }
                        .text-right { text-align: right; }
                        .divide-y > * + * { border-top: 1px solid #f3f4f6; }
                        .text-emerald-700 { color: #047857; }
                        .flex { display: flex; }
                        .justify-between { justify-content: space-between; }
                        .items-end { align-items: flex-end; }
                        .max-w-sm { max-width: 384px; }
                        .stamp { 
                            border: 3px solid; 
                            padding: 10px 20px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 20px; 
                            transform: rotate(-5deg); 
                            text-transform: uppercase;
                            border-radius: 6px;
                            opacity: 0.85;
                        }
                        .stamp-paid { 
                            color: #059669; 
                            border-color: #059669; 
                            background-color: #ecfdf5; 
                        }
                        .stamp-unpaid { 
                            color: #dc2626; 
                            border-color: #dc2626; 
                            background-color: #fef2f2; 
                        }
                    </style>
                </head>
                <body>
                    ${printContent}
                    <script>
                        window.onload = function() {
                            window.print();
                        }
                    </script>
                </body>
            </html>
        `);
        win.document.close();
    };

    if (meterCheckLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={40} className="animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!loading && claimedMeters.length === 0) {
        return (
            <div className="text-center py-12 px-4">
                <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 max-w-md mx-auto border border-emerald-100">
                    <Zap size={48} className="mx-auto text-emerald-600 mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">No Meter Claimed</h2>
                    <p className="text-gray-500 mb-6 text-sm">You haven't claimed any meter yet. Please claim a meter to view your bills.</p>
                    <button
                        onClick={() => setShowClaimModal(true)}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors w-full sm:w-auto"
                    >
                        Claim a Meter
                    </button>
                </div>
                <ClaimMeterModal
                    isOpen={showClaimModal}
                    onClose={() => setShowClaimModal(false)}
                    onSuccess={() => { setShowClaimModal(false); fetchMetersAndBills(); }}
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertCircle size={40} className="text-red-500 mx-auto mb-2" />
                <p className="text-red-600">{error}</p>
                <button onClick={fetchMetersAndBills} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 px-2 sm:px-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <FileText size={24} className="text-emerald-600" />
                        <span>My Bills</span>
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {claimedMeters.length} meter{claimedMeters.length > 1 ? 's' : ''} claimed
                    </p>
                </div>
                <div className="flex items-center space-x-3 self-end sm:self-auto">
                    <button onClick={fetchMetersAndBills} className="px-3 sm:px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-2">
                        <RefreshCw size={16} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                    <button onClick={() => setShowClaimModal(true)} className="px-3 sm:px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                        <Plus size={16} />
                        <span className="hidden sm:inline">Claim Another Meter</span>
                        <span className="sm:hidden">Claim</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
                                    <p className="text-lg sm:text-2xl font-bold text-gray-800">{stat.value}</p>
                                </div>
                                <div className={`p-2 sm:p-3 rounded-xl ${stat.color}`}>
                                    <Icon size={18} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by meter number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Meter</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Due Date</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedBills.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No bills found.</td></tr>
                            ) : (
                                paginatedBills.map((bill) => (
                                    <tr key={bill._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-800">{bill.meterNumber}</td>
                                        <td className="px-4 py-3 font-medium">৳{bill.amount.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">
                                            {new Date(bill.dueDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bill.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {bill.status === 'paid' && <CheckCircle size={14} className="mr-1" />}
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className="px-2 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {bill.status === 'unpaid' && (
                                                    <button
                                                        onClick={() => handlePayBill(bill._id)}
                                                        disabled={payingBillId === bill._id}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                                                    >
                                                        {payingBillId === bill._id ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <CreditCard size={14} />
                                                        )}
                                                        {payingBillId === bill._id ? 'Paying...' : 'Pay Now'}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => { setSelectedInvoice(bill); setShowInvoiceModal(true); }}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs rounded-lg transition-colors"
                                                    title="View & Print Invoice"
                                                >
                                                    <Printer size={14} />
                                                    <span>Invoice</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
                        <span>Page {currentPage} of {totalPages}</span>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50">
                                <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 rounded-lg text-sm ${currentPage === page ? 'bg-emerald-600 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>
                                    {page}
                                </button>
                            ))}
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ClaimMeterModal
                isOpen={showClaimModal}
                onClose={() => setShowClaimModal(false)}
                onSuccess={() => { setShowClaimModal(false); fetchMetersAndBills(); }}
            />

            {showInvoiceModal && selectedInvoice && (() => {
                const consumerType = selectedInvoice.consumerType || 'residential';
                const rate = consumerType === 'industrial' ? 15 : consumerType === 'commercial' ? 10 : 5;
                const units = Math.max(1, Math.round(selectedInvoice.amount / rate));
                const bBill = calculateBangladeshBill(units, consumerType);
                const adjustment = selectedInvoice.amount - bBill.totalAmount;
                const prevReading = selectedInvoice.prevReading ?? Math.round(10200 + selectedInvoice.amount * 0.08);
                const currReading = selectedInvoice.currReading ?? (prevReading + units);

                return (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
                            <button
                                onClick={() => { setShowInvoiceModal(false); setSelectedInvoice(null); }}
                                className="absolute right-4 top-4 p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
                            >
                                <X size={20} />
                            </button>

                            <div id="printable-invoice-content" className="p-4 bg-white">
                                {/* WZPDCL Letterhead */}
                                <div className="text-center border-b-2 border-emerald-500 pb-4 mb-6">
                                    <h1 className="text-xl sm:text-2xl font-bold text-emerald-800 tracking-tight">
                                        WEST ZONE POWER DISTRIBUTION CO. LTD.
                                    </h1>
                                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-semibold tracking-wider mt-0.5">
                                        An Enterprise of Bangladesh Power Development Board
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-700 font-semibold mt-2">
                                        OFFICIAL UTILITY BILL INVOICE (BERC SLAB BASES)
                                    </p>
                                </div>

                                {/* Info Block */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-600 mb-6">
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm mb-1.5">Billed To:</p>
                                        <p className="font-semibold text-gray-700">{user?.name || 'Valued Consumer'}</p>
                                        <p>{user?.email || ''}</p>
                                        <p className="mt-1 font-semibold text-gray-700">Meter No: {selectedInvoice.meterNumber}</p>
                                        <p className="text-[10px] text-gray-400 capitalize">Connection Class: {consumerType}</p>
                                    </div>
                                    <div className="sm:text-right">
                                        <p className="font-bold text-gray-800 text-sm mb-1.5">Invoice Details:</p>
                                        <p><span className="font-semibold">Invoice No:</span> INV-{selectedInvoice._id.slice(-6).toUpperCase()}</p>
                                        <p><span className="font-semibold">Billing Month:</span> {selectedInvoice.billingMonth || 'Current'}</p>
                                        <p><span className="font-semibold">Issue Date:</span> {new Date().toLocaleDateString()}</p>
                                        <p><span className="font-semibold text-red-600">Due Date:</span> {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {/* Meter Readings Block */}
                                <div className="bg-gray-50 rounded-xl p-3 mb-6 grid grid-cols-3 gap-2 text-center text-xs text-gray-600 border border-gray-100">
                                    <div>
                                        <p className="text-gray-400 font-medium">Prev Reading</p>
                                        <p className="font-mono text-gray-800 font-bold mt-0.5">{prevReading} kWh</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 font-medium">Curr Reading</p>
                                        <p className="font-mono text-gray-800 font-bold mt-0.5">{currReading} kWh</p>
                                    </div>
                                    <div>
                                        <p className="text-emerald-600 font-medium">Total Consumption</p>
                                        <p className="font-mono text-emerald-800 font-black mt-0.5">{units} Units (kWh)</p>
                                    </div>
                                </div>

                                {/* Itemized Table */}
                                <div className="border border-gray-100 rounded-xl overflow-hidden mb-6">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-gray-50 font-semibold text-gray-700">
                                            <tr>
                                                <th className="p-3">Description of Slab / Charge</th>
                                                <th className="p-3 text-right">Units × Rate</th>
                                                <th className="p-3 text-right">Amount (BDT)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-gray-600">
                                            {bBill.slabs.map((slab, i) => (
                                                <tr key={i} className="hover:bg-gray-50/50">
                                                    <td className="p-3">
                                                        <p className="font-semibold text-gray-800">{slab.slabName}</p>
                                                        <p className="text-[10px] text-gray-400">Stepped energy consumption charge</p>
                                                    </td>
                                                    <td className="p-3 text-right font-mono">{slab.units} kWh × ৳{slab.rate.toFixed(2)}</td>
                                                    <td className="p-3 text-right font-mono">৳{slab.amount.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td className="p-3">
                                                    <p className="font-semibold text-gray-800">Demand Charge</p>
                                                    <p className="text-[10px] text-gray-400">Fixed connection capacity fee</p>
                                                </td>
                                                <td className="p-3 text-right font-mono">Fixed</td>
                                                <td className="p-3 text-right font-mono">৳{bBill.demandCharge.toFixed(2)}</td>
                                            </tr>
                                            <tr>
                                                <td className="p-3">
                                                    <p className="font-semibold text-gray-800">Service Charge / Meter Rent</p>
                                                    <p className="text-[10px] text-gray-400">Fixed monthly meter rent and upkeep</p>
                                                </td>
                                                <td className="p-3 text-right font-mono">Fixed</td>
                                                <td className="p-3 text-right font-mono">৳{bBill.serviceCharge.toFixed(2)}</td>
                                            </tr>
                                            <tr className="bg-gray-50/50 text-gray-500 font-medium">
                                                <td className="p-3" colSpan={2}>Sub-Total Energy & Fixed Fees</td>
                                                <td className="p-3 text-right font-mono">৳{bBill.subTotal.toFixed(2)}</td>
                                            </tr>
                                            <tr>
                                                <td className="p-3">
                                                    <p className="font-semibold text-gray-800">VAT / Govt. Duty (5%)</p>
                                                    <p className="text-[10px] text-gray-400">Statutory energy sales tax</p>
                                                </td>
                                                <td className="p-3 text-right font-mono">5%</td>
                                                <td className="p-3 text-right font-mono">৳{bBill.vatAmount.toFixed(2)}</td>
                                            </tr>
                                            {Math.abs(adjustment) > 0.01 && (
                                                <tr className="text-gray-500 hover:bg-gray-50/30">
                                                    <td className="p-3">
                                                        <p className="font-semibold text-gray-800">
                                                            {adjustment > 0 ? 'Arrears / System Adjustment' : 'Government Subsidy / Rebate'}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400">Rounding or tariff adjustment</p>
                                                    </td>
                                                    <td className="p-3 text-right font-mono">System</td>
                                                    <td className={`p-3 text-right font-mono ${adjustment > 0 ? 'text-gray-800' : 'text-emerald-600'}`}>
                                                        {adjustment > 0 ? '৳' : '-৳'}{Math.abs(adjustment).toFixed(2)}
                                                    </td>
                                                </tr>
                                            )}
                                            <tr className="bg-gray-50 font-bold text-gray-800 text-sm">
                                                <td className="p-3" colSpan={2}>Net Payable Amount (Including VAT)</td>
                                                <td className="p-3 text-right text-emerald-700 font-mono">৳{selectedInvoice.amount.toLocaleString()}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Payment Status Stamp */}
                                <div className="flex justify-between items-end">
                                    <div className="text-[10px] text-gray-400 max-w-sm">
                                        * This invoice is a computer-generated official document issued by WZPDCL under BERC guidance. It is verified and secure. Any queries regarding billing should be directed to the customer service wing.
                                    </div>
                                    <div className="text-right">
                                        <div className={`stamp ${selectedInvoice.status === 'paid' ? 'stamp-paid' : 'stamp-unpaid'}`}>
                                            {selectedInvoice.status}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Print / Action Footer */}
                            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    onClick={() => { setShowInvoiceModal(false); setSelectedInvoice(null); }}
                                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-sm"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={handlePrintInvoice}
                                    className="px-5 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold text-sm flex items-center gap-2 shadow-sm shadow-emerald-100"
                                >
                                    <Printer size={16} />
                                    <span>Print / Download PDF</span>
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}