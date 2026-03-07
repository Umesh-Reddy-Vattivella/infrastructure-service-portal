"use client";

import { useEffect, useState } from "react";

export default function TicketProgress({ status, createdAt, slaDeadline, resolvedAt }: { status: string, createdAt: Date, slaDeadline?: Date | null, resolvedAt?: Date | null }) {
    const defaultSteps = [
        { id: "OPEN", label: "Open" },
        { id: "ASSIGNED", label: "Assigned" },
        { id: "IN_PROGRESS", label: "In Progress" },
        { id: "RESOLVED", label: "Resolved" },
    ];

    // If it's escalated or closed, dynamically inject those steps into the visual flow
    let steps = [...defaultSteps];
    if (status === "ESCALATED") {
        steps.splice(3, 0, { id: "ESCALATED", label: "Escalated" });
    }
    if (status === "CLOSED") {
        steps.push({ id: "CLOSED", label: "Closed" });
    }

    const currentIndex = steps.findIndex(s => s.id === status);
    const activeIndex = currentIndex === -1 ? 0 : currentIndex;

    const [timeLeft, setTimeLeft] = useState<{ str: string, isOverdue: boolean, isResolved: boolean }>({ str: "", isOverdue: false, isResolved: false });

    useEffect(() => {
        if (!slaDeadline) return;

        if (status === "RESOLVED" || status === "CLOSED") {
            const timeDiff = new Date(resolvedAt || Date.now()).getTime() - new Date(createdAt).getTime();
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            setTimeLeft({ str: `Resolved in ${hours} hr${hours !== 1 ? 's' : ''}`, isOverdue: false, isResolved: true });
            return;
        }

        const updateTimer = () => {
            const now = new Date().getTime();
            const deadline = new Date(slaDeadline).getTime();
            const diff = deadline - now;

            if (diff <= 0) {
                const overdueDiff = Math.abs(diff);
                const hrs = Math.floor(overdueDiff / (1000 * 60 * 60));
                const mins = Math.floor((overdueDiff % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft({ str: `Overdue by ${hrs}h ${mins}m`, isOverdue: true, isResolved: false });
            } else {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

                let str = "";
                if (days > 0) str += `${days}d `;
                str += `${hrs}h ${mins}m remaining`;

                setTimeLeft({ str, isOverdue: false, isResolved: false });
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000); // update every minute
        return () => clearInterval(interval);
    }, [slaDeadline, status, resolvedAt, createdAt]);

    return (
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50 mb-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Lifecycle Progress</h3>

                {slaDeadline && (
                    <div className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono tracking-wider flex items-center gap-2 border 
                        ${timeLeft.isResolved ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : timeLeft.isOverdue ? 'bg-red-500/10 text-red-500 animate-pulse border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                        {timeLeft.isOverdue ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        ) : timeLeft.isResolved ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                        <span>SLA: {timeLeft.str}</span>
                    </div>
                )}
            </div>

            <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                        style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
                    />
                </div>

                <div className="relative flex justify-between">
                    {steps.map((step, index) => {
                        const isCompleted = index <= activeIndex;
                        const isActive = index === activeIndex;

                        return (
                            <div key={step.id} className="flex flex-col items-center group">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 z-10 border-4 border-slate-900 shadow-xl
                                    ${isActive ? 'bg-blue-500 text-white scale-125 ring-2 ring-blue-500/50 shadow-blue-500/30'
                                        : isCompleted ? 'bg-blue-500 text-white'
                                            : 'bg-slate-700 text-slate-400'}`}
                                >
                                    {isCompleted && !isActive ? (
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    ) : (
                                        index + 1
                                    )}
                                </div>
                                <span className={`mt-3 text-[11px] font-bold uppercase tracking-wider transition-colors absolute -bottom-6
                                    ${isActive ? 'text-blue-400 font-extrabold' : isCompleted ? 'text-blue-200' : 'text-slate-500'}`}
                                >
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Height spacer for absolute labels */}
            <div className="h-6"></div>
        </div>
    );
}
