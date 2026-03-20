import { getTicketById, getCommitteeMembers } from "@/actions/ticket";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import TicketManager from "@/components/TicketManager";
import CommentThread from "@/components/CommentThread";
import ImageGallery from "@/components/ImageGallery";
import TicketProgress from "@/components/TicketProgress";
import ResolutionVerification from "@/components/ResolutionVerification";
import FormattedDate from "@/components/FormattedDate";

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) redirect("/");

    const id = (await params).id;
    const ticket = await getTicketById(id);

    if (!ticket) {
        return (
            <div className="min-h-screen flex flex-col pt-16">
                <Navbar user={session.user} />
                <main className="flex-1 container mx-auto p-8 flex items-center justify-center">
                    <div className="glass-panel p-8 text-center rounded-xl">
                        <h2 className="text-2xl text-white mb-2">Ticket Not Found</h2>
                        <p className="text-slate-400 mb-6">This ticket either doesn't exist or you don't have permission to view it.</p>
                        <a href="/dashboard" className="btn-primary inline-block">Return to Dashboard</a>
                    </div>
                </main>
            </div>
        );
    }

    const isCommittee = session.user.role !== "STUDENT";
    const committeeMembers = isCommittee ? await getCommitteeMembers() : [];

    return (
        <div className="min-h-screen flex flex-col pt-16">
            <Navbar user={session.user} />

            <main className="flex-1 container mx-auto max-w-5xl p-4 sm:p-6 lg:p-8 mt-6">
                <a href="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors mb-6 group">
                    <svg className="w-5 h-5 mr-1 pt-0.5 pr-0.5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </a>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                <span className="font-mono text-8xl font-black">{ticket.category}</span>
                            </div>

                            <div className="flex flex-wrap gap-3 mb-6 relative z-10">
                                <span className="font-mono text-sm inline-flex items-center px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 shadow-inner">
                                    {ticket.ticketNumber}
                                </span>
                                <span className="text-sm font-medium inline-flex items-center px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-slate-300">
                                    <svg className="w-4 h-4 mr-1.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <FormattedDate date={ticket.createdAt} />
                                </span>
                            </div>

                            {ticket.status === 'RESOLVED' && session.user.id === ticket.authorId && (
                                <ResolutionVerification ticketId={ticket.id} />
                            )}

                            <TicketProgress
                                status={ticket.status}
                                createdAt={ticket.createdAt}
                                slaDeadline={ticket.slaDeadline}
                                resolvedAt={ticket.resolvedAt}
                            />

                            <h1 className="text-3xl font-bold text-white tracking-tight mb-4 relative z-10">{ticket.title}</h1>

                            <div className="prose prose-invert max-w-none text-slate-300 relative z-10">
                                <p className="whitespace-pre-wrap">{ticket.description}</p>
                            </div>

                            {ticket.images && ticket.images.length > 0 && (
                                <ImageGallery images={ticket.images} />
                            )}
                        </div>

                        {/* Discussion Thread */}
                        <CommentThread
                            ticketId={ticket.id}
                            comments={ticket.comments}
                            isCommittee={isCommittee}
                        />
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-6">
                        <TicketManager
                            ticket={ticket}
                            isCommittee={isCommittee}
                            currentUserRole={session.user.role}
                            committeeMembers={committeeMembers}
                        />

                        {(isCommittee || session.user.id === ticket.authorId) ? (
                            <div className="glass-panel p-6 rounded-xl border-t-4 border-t-blue-500">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Requester Details</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-900/50 flex flex-shrink-0 items-center justify-center text-blue-400 font-bold border border-blue-800">
                                            {ticket.author.name?.charAt(0) || 'S'}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{ticket.author.name}</p>
                                            <p className="text-sm text-slate-400 font-mono mt-0.5">{ticket.author.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="glass-panel p-6 rounded-xl border-t-4 border-t-slate-500">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Requester Details</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex flex-shrink-0 items-center justify-center text-slate-400 font-bold border border-slate-700">
                                            S
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">Reported by Student</p>
                                            <p className="text-sm text-slate-400 font-mono mt-0.5">student@instisolve.edu</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
