"use client";

import { useState, useEffect } from "react";
import { updateTicketStatus, toggleTicketVisibility, assignTicket, escalateTicket, reopenTicket, updateTicketPriority } from "@/actions/ticket";
import FormattedDate from "./FormattedDate";

export default function TicketManager({ ticket, isCommittee, committeeMembers }: { ticket: any, isCommittee: boolean, committeeMembers?: any[] }) {
    const [loading, setLoading] = useState(false);
    const [isPublic, setIsPublic] = useState(ticket.isPublic || false);
    const [mounted, setMounted] = useState(false);

    const [selectedStatus, setSelectedStatus] = useState(ticket.status);
    const [selectedPriority, setSelectedPriority] = useState(ticket.priority);
    const [selectedAssignee, setSelectedAssignee] = useState(ticket.assigneeId || "");

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setSelectedStatus(ticket.status);
        setSelectedPriority(ticket.priority);
        setSelectedAssignee(ticket.assigneeId || "");
    }, [ticket]);

    // Escalation State
    const [showEscalateModal, setShowEscalateModal] = useState(false);
    const [escalateReason, setEscalateReason] = useState("");

    // Reopen State
    const [showReopenModal, setShowReopenModal] = useState(false);
    const [reopenReason, setReopenReason] = useState("");

    // Resolution State
    const [responseHours, setResponseHours] = useState<number>(48); // default to 48 hours

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

    const handleStatusUpdate = async () => {
        setLoading(true);
        try {
            await updateTicketStatus(ticket.id, selectedStatus, selectedStatus === "RESOLVED" ? responseHours : undefined);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // For when they change hours on an already resolved ticket
    const handleResponseHoursUpdate = async () => {
        setLoading(true);
        try {
            await updateTicketStatus(ticket.id, "RESOLVED", responseHours);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePriorityUpdate = async () => {
        setLoading(true);
        try {
            await updateTicketPriority(ticket.id, selectedPriority as "LOW" | "MEDIUM" | "HIGH");
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVisibilityToggle = async () => {
        setLoading(true);
        const newValue = !isPublic;
        setIsPublic(newValue);
        try {
            await toggleTicketVisibility(ticket.id, newValue);
        } catch (err) {
            console.error(err);
            setIsPublic(!newValue); // revert on error
        } finally {
            setLoading(false);
        }
    };

    const handleAssignUpdate = async () => {
        if (!selectedAssignee) return;
        setLoading(true);
        try {
            await assignTicket(ticket.id, selectedAssignee);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEscalateSubmit = async () => {
        if (!escalateReason.trim()) return;
        setLoading(true);
        try {
            await escalateTicket(ticket.id, escalateReason);
            setShowEscalateModal(false);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReopenSubmit = async () => {
        if (!reopenReason.trim()) return;
        setLoading(true);
        try {
            await reopenTicket(ticket.id, reopenReason);
            setShowReopenModal(false);
            setReopenReason("");
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel p-6 rounded-xl border border-slate-700/50 relative">
            {loading && (
                <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] rounded-xl flex items-center justify-center z-20">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {isCommittee && (
                <div className="mb-6 flex items-center justify-between pb-4 border-b border-slate-700/50">
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1">Public Visibility</h3>
                        <p className="text-xs text-slate-500">Show this issue on the Campus Issues feed.</p>
                    </div>
                    <button
                        onClick={handleVisibilityToggle}
                        disabled={loading}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${isPublic ? 'bg-blue-500' : 'bg-slate-600'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            )}

            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Ticket Status</h3>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-slate-300">Status</span>
                    {isCommittee ? (
                        <div className="flex items-center gap-2">
                            <select
                                className={`text-sm font-bold tracking-wider uppercase rounded-md px-2 py-1 outline-none border transition-colors cursor-pointer ${getStatusColor(selectedStatus)}`}
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                disabled={loading}
                            >
                                <option value="OPEN" className="bg-slate-800 text-white">OPEN</option>
                                <option value="ASSIGNED" className="bg-slate-800 text-white">ASSIGNED</option>
                                <option value="IN_PROGRESS" className="bg-slate-800 text-white">IN PROGRESS</option>
                                <option value="ESCALATED" className="bg-slate-800 text-white">ESCALATED</option>
                                <option value="RESOLVED" className="bg-slate-800 text-white">RESOLVED</option>
                            </select>
                            {selectedStatus !== ticket.status && (
                                <button
                                    onClick={handleStatusUpdate}
                                    disabled={loading}
                                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-colors shadow-lg"
                                >
                                    OK
                                </button>
                            )}
                        </div>
                    ) : (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wider border uppercase ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                        </span>
                    )}
                </div>

                {isCommittee && selectedStatus === "RESOLVED" && (
                    <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700 mt-2">
                        <span className="text-sm text-slate-400">Auto-Close Limit</span>
                        <div className="flex items-center gap-2">
                            <select
                                className="bg-slate-900 border border-slate-600 rounded text-xs px-2 py-1 outline-none focus:border-blue-500 text-slate-300"
                                value={responseHours}
                                onChange={(e) => setResponseHours(parseInt(e.target.value))}
                                disabled={loading}
                            >
                                <option value={24}>24 Hours</option>
                                <option value={48}>48 Hours</option>
                                <option value={168}>7 Days</option>
                            </select>
                            {ticket.status === "RESOLVED" && (
                                <button
                                    onClick={handleResponseHoursUpdate}
                                    disabled={loading}
                                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-colors"
                                    title="Update Auto-Close Deadline"
                                >
                                    OK
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center pb-4 border-b border-slate-700/50 pt-2">
                    <span className="text-slate-300">Priority</span>
                    {isCommittee ? (
                        <div className="flex items-center gap-2">
                            <select
                                className={`text-xs font-bold tracking-wider uppercase rounded-md px-2 py-1 outline-none border transition-colors cursor-pointer ${getPriorityColor(selectedPriority)}`}
                                value={selectedPriority}
                                onChange={(e) => setSelectedPriority(e.target.value)}
                                disabled={loading || ticket.status === 'CLOSED'}
                            >
                                <option value="LOW" className="bg-slate-800 text-slate-300">LOW</option>
                                <option value="MEDIUM" className="bg-slate-800 text-orange-400">MEDIUM</option>
                                <option value="HIGH" className="bg-slate-800 text-red-500">HIGH</option>
                            </select>
                            {selectedPriority !== ticket.priority && (
                                <button
                                    onClick={handlePriorityUpdate}
                                    disabled={loading}
                                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-colors shadow-lg"
                                >
                                    OK
                                </button>
                            )}
                        </div>
                    ) : (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wider border uppercase ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                        </span>
                    )}
                </div>

                <div className="space-y-2 pt-2">
                    {ticket.assignee && (
                        <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-700/50">
                            <span className="text-sm font-bold text-slate-400">Assigned To</span>
                            <span className="text-sm text-blue-400 font-medium">{ticket.assignee.name}</span>
                        </div>
                    )}

                    {isCommittee && ticket.status !== 'CLOSED' && (
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-slate-400 text-sm">Assign To</span>
                            <div className="flex items-center gap-2">
                                <select
                                    className="bg-slate-800 border border-slate-700 rounded-lg text-sm px-2 py-1 outline-none focus:border-blue-500 max-w-[150px]"
                                    value={selectedAssignee}
                                    onChange={(e) => setSelectedAssignee(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="" disabled>Select Staff</option>
                                    {committeeMembers?.map(member => (
                                        <option key={member.id} value={member.id}>
                                            {member.name}
                                        </option>
                                    ))}
                                </select>
                                {selectedAssignee !== (ticket.assigneeId || "") && selectedAssignee !== "" && (
                                    <button
                                        onClick={handleAssignUpdate}
                                        disabled={loading}
                                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-colors shadow-lg"
                                    >
                                        OK
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Location</span>
                        <span className="text-slate-200 text-sm font-medium">{ticket.location}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Category</span>
                        <span className="text-slate-200 text-sm font-medium">{ticket.category}</span>
                    </div>
                    {ticket.resolvedAt && (
                        <div className="flex flex-col gap-2 border-t border-slate-700/50 pt-3 mt-3 text-green-400">
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Resolved On</span>
                                <span className="text-sm font-medium"><FormattedDate date={ticket.resolvedAt} /></span>
                            </div>
                            {ticket.responseDeadline && ticket.status === 'RESOLVED' && (
                                <div className="flex justify-between items-center text-slate-400">
                                    <span className="text-xs">Auto-Close Deadline</span>
                                    <span className="text-xs font-mono"><FormattedDate date={ticket.responseDeadline} /></span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {isCommittee && ticket.status !== 'ESCALATED' && ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
                <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-end">
                    <button
                        onClick={() => setShowEscalateModal(true)}
                        className="px-4 py-2 text-sm font-bold tracking-wider uppercase text-red-500 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-colors"
                    >
                        Escalate Ticket
                    </button>
                </div>
            )}

            {isCommittee && ticket.status === 'CLOSED' && (
                <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-end">
                    <button
                        onClick={() => setShowReopenModal(true)}
                        className="px-4 py-2 text-sm font-bold tracking-wider uppercase text-yellow-500 hover:bg-yellow-500/10 border border-yellow-500/20 rounded-lg transition-colors"
                    >
                        Reopen Ticket
                    </button>
                </div>
            )}

            {/* Escalate Modal */}
            {showEscalateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-red-400 mb-2">Escalate Ticket</h3>
                        <p className="text-sm text-slate-400 mb-4">Please provide a reason for escalating this infrastructure issue. This will notify senior management.</p>

                        <textarea
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:border-red-500 outline-none mb-4 min-h-[100px]"
                            placeholder="Reason for escalation..."
                            value={escalateReason}
                            onChange={(e) => setEscalateReason(e.target.value)}
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowEscalateModal(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEscalateSubmit}
                                disabled={!escalateReason.trim() || loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Submit Escalation
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reopen Modal */}
            {showReopenModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-yellow-500 mb-2 flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Reopen Ticket
                        </h3>
                        <p className="text-sm text-slate-400 mb-4">Please provide a reason to reopening this previously closed ticket. This will notify the user and start the process again.</p>

                        <textarea
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:border-yellow-500 outline-none mb-4 min-h-[100px]"
                            placeholder="Reason for reopening..."
                            value={reopenReason}
                            onChange={(e) => setReopenReason(e.target.value)}
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setShowReopenModal(false); setReopenReason(""); }}
                                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReopenSubmit}
                                disabled={!reopenReason.trim() || loading}
                                className="px-4 py-2 text-sm font-medium text-slate-900 bg-yellow-500 hover:bg-yellow-400 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? "Reopening..." : "Reopen Ticket"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
