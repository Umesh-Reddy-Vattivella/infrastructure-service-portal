"use client";

import { useState, useEffect } from "react";
import CreateTicketForm from "@/components/CreateTicketForm";
import Link from "next/navigation";

export default function CommitteeDashboard({ tickets }: { tickets: any[] }) {
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
            case 'ESCALATED': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'MEDIUM': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    // Metrics
    const openCount = tickets.filter(t => t.status === 'OPEN').length;
    const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;
    const escalatedCount = tickets.filter(t => t.status === 'ESCALATED').length;
    const highPriority = tickets.filter(t => t.priority === 'HIGH' && t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-panel p-6 rounded-xl border border-slate-700/50 flex flex-col justify-between items-start">
                    <div className="text-slate-400 font-medium text-sm mb-2">Open Issues</div>
                    <div className="text-4xl font-bold text-white">{openCount}</div>
                </div>
                <div className="glass-panel p-6 rounded-xl border border-slate-700/50 flex flex-col justify-between items-start border-b-4 border-b-blue-500">
                    <div className="text-blue-400 font-medium text-sm mb-2">In Progress</div>
                    <div className="text-4xl font-bold text-white">{inProgressCount}</div>
                </div>
                <div className="glass-panel p-6 rounded-xl border border-slate-700/50 flex flex-col justify-between items-start border-b-4 border-b-purple-500">
                    <div className="text-purple-400 font-medium text-sm mb-2">Escalated</div>
                    <div className="text-4xl font-bold text-white">{escalatedCount}</div>
                </div>
                <div className="glass-panel p-6 rounded-xl border border-slate-700/50 flex flex-col justify-between items-start border-b-4 border-b-red-500">
                    <div className="text-red-400 font-medium text-sm mb-2">Attention Required (High Prio)</div>
                    <div className="text-4xl font-bold text-white">{highPriority}</div>
                </div>
            </div>

            <div className="flex justify-between items-center bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-inner">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Central Ticket Queue</h1>
                    <p className="text-slate-400">All submitted issues across the campus.</p>
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

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/20 p-4 rounded-xl border border-slate-700/50 -mt-2 mb-2">
                <div className="flex items-center gap-3 w-full sm:w-auto ml-auto">
                    <label className="text-sm font-medium text-slate-400">Filter View:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg text-sm px-3 py-1.5 outline-none focus:border-blue-500 text-slate-200 flex-1 sm:w-auto font-bold tracking-wider uppercase"
                    >
                        <option value="ALL">All Issues</option>
                        <option value="OPEN">Open</option>
                        <option value="ASSIGNED">Assigned</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="ESCALATED">Escalated</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {tickets.filter(t => statusFilter === "ALL" || t.status === statusFilter).map((ticket) => (
                    <div key={ticket.id} className="glass-panel p-5 rounded-xl hover:bg-slate-800/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group cursor-pointer border-l-4 border-l-slate-600 hover:border-l-blue-500">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <span className="font-mono text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded shadow-inner">{ticket.ticketNumber}</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider border uppercase ${getStatusColor(ticket.status)}`}>
                                    {ticket.status}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider border uppercase ${getPriorityColor(ticket.priority)}`}>
                                    {ticket.priority} Prio
                                </span>
                            </div>
                            <h3 className="text-lg font-medium text-white transition-colors mt-2">{ticket.title}</h3>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-xs text-slate-400 font-medium">
                                <span className="flex items-center gap-1.5 text-slate-300">
                                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    {ticket.author.name} <span className="text-slate-500">({ticket.author.email})</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    {ticket.location} <span className="text-slate-600 mx-1">•</span> {ticket.category}
                                </span>
                                <span className="flex items-center gap-1.5 font-mono text-slate-500">
                                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {mounted ? new Date(ticket.createdAt).toLocaleString() : new Date(ticket.createdAt).toLocaleDateString("en-US")}
                                </span>
                            </div>
                        </div>
                        <div className="shrink-0 pt-4 md:pt-0">
                            <a href={`/ticket/${ticket.id}`} className="block">
                                <span className="btn-secondary w-full text-center hover:bg-slate-700/70 border border-slate-600 block">
                                    Manage
                                </span>
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
