"use client";

import { useState } from "react";
import { toggleUpvote } from "@/actions/ticket";

export default function UpvoteButton({ ticketId, initialCount, initialHasVoted }: { ticketId: string, initialCount: number, initialHasVoted: boolean }) {
    const [count, setCount] = useState(initialCount);
    const [hasVoted, setHasVoted] = useState(initialHasVoted);
    const [loading, setLoading] = useState(false);

    const handleVote = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent Link navigation from parent
        e.stopPropagation();

        if (loading) return;
        setLoading(true);

        const newHasVoted = !hasVoted;
        setHasVoted(newHasVoted);
        setCount(prev => newHasVoted ? prev + 1 : prev - 1);

        try {
            await toggleUpvote(ticketId);
        } catch (err) {
            console.error(err);
            // Revert on error
            setHasVoted(!newHasVoted);
            setCount(prev => !newHasVoted ? prev + 1 : prev - 1);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleVote}
            disabled={loading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${hasVoted
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 font-bold shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                    : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                }`}
        >
            <svg
                className={`w-4 h-4 transition-transform ${hasVoted ? 'scale-110' : ''}`}
                fill={hasVoted ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={hasVoted ? 1.5 : 2}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
            <span className="text-sm font-semibold">{count}</span>
        </button>
    );
}
