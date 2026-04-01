import React, { useState } from 'react';
import { createPortal } from 'react-dom';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

type ReportReason = 'plagiarism' | 'inaccuracy' | 'low-value' | 'harassment' | 'sybil' | 'doxxing' | 'other';

const REASONS: { id: ReportReason; label: string; description: string; icon: string }[] = [
    { 
        id: 'plagiarism', 
        label: 'Plagiarism / IP Violation', 
        description: 'Content copied without attribution or violates Arweave protocol standards.', 
        icon: 'content_copy' 
    },
    { 
        id: 'inaccuracy', 
        label: 'Scientific Inaccuracy', 
        description: 'Factually incorrect claims, misleading data, or lack of citation.', 
        icon: 'science' 
    },
    { 
        id: 'low-value', 
        label: 'Low Value / Spam', 
        description: 'Promotional content, farming, or lacks knowledge value.', 
        icon: 'delete_sweep' 
    },
    { 
        id: 'harassment', 
        label: 'Harassment / Inappropriate', 
        description: 'Hate speech, bullying, or behavior violating community guidelines.', 
        icon: 'block' 
    },
    { 
        id: 'sybil', 
        label: 'Sybil Attack / Bot', 
        description: 'Suspicious engagement farming or artificial behavior.', 
        icon: 'smart_toy' 
    },
    { 
        id: 'doxxing', 
        label: 'Privacy Violation', 
        description: 'Revealing private personal information without consent.', 
        icon: 'visibility_off' 
    },
    { 
        id: 'other', 
        label: 'Other Issue', 
        description: 'Any other violation not listed above. Please provide details below.', 
        icon: 'help_center' 
    }
];

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, title }) => {
    const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
    const [evidence, setEvidence] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = () => {
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            onClose();
            // Reset state
            setSelectedReason(null);
            setEvidence('');
            alert('Report submitted to DAO Council.');
        }, 1000);
    };

    return createPortal(
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <div 
                className="absolute inset-0 bg-white/60 dark:bg-[#050608]/80 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-white dark:bg-[#0B0E14] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0B0E14] z-10">
                    <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">flag</span>
                        Report Violation
                    </h3>
                    <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-white truncate">
                        {title}
                    </h2>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                    
                    {/* Reason Selection */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                            Select Reason
                        </label>
                        <div className="space-y-2">
                            {REASONS.map((reason) => (
                                <button
                                    key={reason.id}
                                    onClick={() => setSelectedReason(reason.id)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-4 group relative overflow-hidden ${
                                        selectedReason === reason.id 
                                        ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30' 
                                        : 'bg-transparent border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                    }`}
                                >
                                    {/* Active Indicator Line */}
                                    {selectedReason === reason.id && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                                    )}

                                    <div className={`mt-0.5 ${selectedReason === reason.id ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>
                                        <span className="material-symbols-outlined">{reason.icon}</span>
                                    </div>
                                    <div>
                                        <div className={`text-sm font-bold mb-0.5 ${selectedReason === reason.id ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-200'}`}>
                                            {reason.label}
                                        </div>
                                        <div className="text-xs text-gray-500 leading-relaxed">
                                            {reason.description}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Evidence Input */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                            Provide Evidence or Context (Optional)
                        </label>
                        <textarea
                            value={evidence}
                            onChange={(e) => setEvidence(e.target.value)}
                            rows={3}
                            className="w-full bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm text-gray-900 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all resize-none"
                            placeholder="Describe the violation..."
                        />
                    </div>

                    {/* DAO Warning */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 p-4 rounded-xl flex gap-3">
                        <div className="text-gray-400 flex-shrink-0">
                            <span className="material-symbols-outlined text-lg">info</span>
                        </div>
                        <p className="text-[11px] font-mono text-gray-500 leading-relaxed">
                            <strong className="text-gray-700 dark:text-gray-300">Note:</strong> Your report will be audited by the DAO Council. False reporting or abuse of this system may result in a deduction of your <span className="text-blue-500">Knowledge Score (KS)</span>.
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0B0E14] flex justify-end gap-3 z-10">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedReason || isSubmitting}
                        className="px-8 py-3 rounded-xl text-sm font-bold text-red-600 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white hover:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-500/5 flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined text-lg">gavel</span>
                        )}
                        Submit Report
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
};