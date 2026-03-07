import { getPublicTickets } from "@/actions/ticket";
import Navbar from "@/components/Navbar";
import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import UpvoteButton from "@/components/UpvoteButton";
import prisma from "@/lib/prisma";

// Since it takes search parameters from the URL for filtering/sorting
export default async function PublicIssuesPage({
    searchParams
}: {
    searchParams?: Promise<{
        category?: string;
        status?: string;
        location?: string;
        priority?: string;
        sortBy?: string;
    }>
}) {
    // Optional auth - let's retrieve the user if logged in to display Navbar
    const session = await auth();
    // For this app, only logged users can see even public issues, or we can allow guests.
    // The instructions say "Users can navigate... students can view... Add a public issues feed".
    // We'll enforce login so we can reuse Navbar cleanly.
    if (!session?.user) {
        redirect("/");
    }

    const params = await searchParams;

    const tickets = await getPublicTickets(params);

    // Fetch user votes
    const userVotes = await prisma.ticketVote.findMany({
        where: { userId: session.user.id, ticketId: { in: tickets.map((t: any) => t.id) } },
        select: { ticketId: true }
    });
    const votedTicketIds = new Set(userVotes.map((v: { ticketId: string }) => v.ticketId));

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'RESOLVED': return 'bg-green-500/10 text-green-500 border-green-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar user={session.user} />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Campus Issues</h1>
                        <p className="text-slate-400">Public feed of reported infrastructure issues across the campus.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Filters */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass-panel p-6 rounded-xl border border-slate-700 sticky top-24">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Filter & Sort
                            </h2>

                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Sort By</label>
                                    <select name="sortBy" defaultValue={params?.sortBy || "newest"} className="input-field py-2 text-sm bg-slate-900">
                                        <option value="newest">Newest First</option>
                                        <option value="priority">Highest Priority</option>
                                        <option value="comments">Most Commented</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                                    <select name="category" defaultValue={params?.category || ""} className="input-field py-2 text-sm bg-slate-900">
                                        <option value="">All Categories</option>
                                        <option value="WIFI">WiFi & Network</option>
                                        <option value="PLUMBING">Plumbing</option>
                                        <option value="ELECTRICAL">Electrical</option>
                                        <option value="HOT_WATER">Hot Water</option>
                                        <option value="HVAC">AC & Heating</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                                    <select name="status" defaultValue={params?.status || ""} className="input-field py-2 text-sm bg-slate-900">
                                        <option value="">All Statuses</option>
                                        <option value="OPEN">Open</option>
                                        <option value="IN_PROGRESS">In Progress / Assigned</option>
                                        <option value="RESOLVED">Resolved / Closed</option>
                                    </select>
                                </div>

                                <div className="pt-2">
                                    <button type="submit" className="w-full btn-primary py-2 text-sm rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-600/50 shadow-none">
                                        Apply Filters
                                    </button>

                                    {(params?.category || params?.status || params?.sortBy) && (
                                        <Link href="/issues" className="block text-center mt-3 text-xs text-slate-500 hover:text-slate-300 transition-colors">
                                            Clear Filters
                                        </Link>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Tickets Feed */}
                    <div className="lg:col-span-3">
                        <div className="space-y-4">
                            {tickets.length === 0 ? (
                                <div className="text-center p-12 glass-panel rounded-xl border border-slate-700/50 border-dashed">
                                    <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-300 mb-1">No public issues found</h3>
                                    <p className="text-slate-500">Try adjusting your filters or check back later.</p>
                                </div>
                            ) : (
                                tickets.map((ticket: any) => (
                                    <div key={ticket.id} className="glass-panel p-5 sm:p-6 rounded-xl hover:bg-slate-800/80 transition-all group border border-slate-700/50 hover:border-blue-500/50 relative">
                                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wider border uppercase ${getStatusColor(ticket.status)}`}>
                                                        {ticket.status}
                                                    </span>
                                                    <span className="font-mono text-xs text-slate-500">{ticket.ticketNumber}</span>
                                                    <span className="text-xs font-medium px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md border border-slate-700">
                                                        {ticket.category}
                                                    </span>
                                                    {ticket.priority === 'HIGH' && (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-red-500/20 text-red-400">
                                                            Urgent
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors mb-2">
                                                    <Link href={`/ticket/${ticket.id}`} className="after:absolute after:inset-0 after:z-0">
                                                        {ticket.title}
                                                    </Link>
                                                </h3>

                                                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400 font-medium">
                                                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                                                        <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center shrink-0">
                                                            <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                        </div>
                                                        Reported by Student
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        {ticket.location}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="shrink-0 flex items-center sm:flex-col justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-700/50 pt-3 sm:pt-0 sm:pl-6 gap-3 relative z-10">
                                                <UpvoteButton
                                                    ticketId={ticket.id}
                                                    initialCount={ticket._count?.votes || 0}
                                                    initialHasVoted={votedTicketIds.has(ticket.id)}
                                                />

                                                <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-blue-300 transition-colors">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                    <span className="font-semibold">{ticket._count?.comments || 0}</span>
                                                </div>
                                                <div className="sm:hidden text-xs text-blue-400 flex items-center gap-1 group-hover:underline">
                                                    View Issue
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
