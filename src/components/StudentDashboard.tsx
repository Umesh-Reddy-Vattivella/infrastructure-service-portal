"use client";

import { useState, useEffect } from "react";
import CreateTicketForm from "@/components/CreateTicketForm";
import Link from "next/link";

export default function StudentDashboard({ tickets }: { tickets: any[] }) {
    const [isCreating, setIsCreating] = useState(false);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'RESOLVED': return 'bg-green-500/10 text-green-500 border-green-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-inner">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">My Service Requests</h1>
                    <p className="text-slate-400">Track and manage your campus infrastructure issues.</p>
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="btn-primary w-auto shadow-blue-500/20 flex items-center gap-2"
                >
                    {isCreating ? "Cancel" : "New Request"}
                    {!isCreating && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                    )}
                </button>
            </div>

            {isCreating && (
                <CreateTicketForm onClose={() => setIsCreating(false)} />
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/20 p-4 rounded-xl border border-slate-700/50">
                <h2 className="text-lg font-medium text-white">Your Submissions</h2>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <label className="text-sm font-medium text-slate-400">Filter Status:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg text-sm px-3 py-1.5 outline-none focus:border-blue-500 text-slate-200 flex-1 sm:w-auto"
                    >
                        <option value="ALL">All Issues</option>
                        <option value="OPEN">Open</option>
                        <option value="ASSIGNED">Assigned</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved (Awaiting Verification)</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {tickets.filter(t => statusFilter === "ALL" || t.status === statusFilter).length === 0 ? (
                    <div className="text-center p-12 bg-slate-800/30 rounded-xl border border-slate-700/50 border-dashed">
                        <p className="text-slate-400">You haven't submitted any tickets yet.</p>
                    </div>
                ) : (
                    tickets.filter(t => statusFilter === "ALL" || t.status === statusFilter).map((ticket) => (
                        <Link href={`/ticket/${ticket.id}`} key={ticket.id} className="block">
                            <div className="glass-panel p-5 rounded-xl hover:bg-slate-800/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group cursor-pointer border-l-4 border-l-blue-500">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-mono text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded">{ticket.ticketNumber}</span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider border uppercase ${getStatusColor(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                        {ticket.priority === 'HIGH' && (
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider border uppercase bg-red-500/10 text-red-500 border-red-500/20">
                                                URGENT
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-medium text-white group-hover:text-blue-400 transition-colors">{ticket.title}</h3>
                                    <p className="text-sm text-slate-400 truncate max-w-2xl mt-1">{ticket.description}</p>
                                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 font-medium">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {ticket.location}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {mounted ? new Date(ticket.createdAt).toLocaleString() : new Date(ticket.createdAt).toLocaleDateString("en-US")}
                                        </span>
                                    </div>
                                </div>
                                <div className="shrink-0 flex items-center justify-end">
                                    <span className="text-sm text-blue-400 group-hover:text-blue-300 font-medium group-hover:underline flex items-center gap-1">
                                        View Details
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
