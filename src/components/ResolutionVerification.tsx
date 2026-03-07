"use client";

import { useState } from "react";
import { verifyTicketResolution } from "@/actions/ticket";

export default function ResolutionVerification({ ticketId }: { ticketId: string }) {
    const [loading, setLoading] = useState(false);

    const handleVerification = async (isResolved: boolean) => {
        setLoading(true);
        try {
            await verifyTicketResolution(ticketId, isResolved);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel p-6 rounded-xl border-2 border-yellow-500/50 bg-yellow-500/5 relative overflow-hidden mb-8">
            <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-xl font-bold text-yellow-500 mb-2 flex items-center gap-2">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Action Required: Verify Resolution
                    </h3>
                    <p className="text-slate-300">
                        The committee has marked this issue as <strong>RESOLVED</strong>. Please confirm if the issue has been fixed to your satisfaction, or if it requires further attention.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 shrink-0">
                    <button
                        onClick={() => handleVerification(false)}
                        disabled={loading}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium border border-slate-600 transition-colors disabled:opacity-50"
                    >
                        No, Issue Persists
                    </button>
                    <button
                        onClick={() => handleVerification(true)}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-green-600/20 flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        )}
                        Yes, Close Ticket
                    </button>
                </div>
            </div>
        </div>
    );
}
