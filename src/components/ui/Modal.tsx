'use client';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 p-6 border border-emerald-100 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    {title && <h2 className="text-xl font-bold text-emerald-800">{title}</h2>}
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 ml-auto">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}