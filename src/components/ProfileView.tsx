import prisma from "@/lib/prisma";
import { User, Ticket } from "@prisma/client";
import { updateProfile } from "@/actions/profile";
import ProfileForm from "./ProfileForm";

export default function ProfileView({
    user,
    tickets,
}: {
    user: User;
    tickets: Ticket[];
}) {
    const totalRaised = tickets.length;
    const totalResolved = tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length;
    const inProgress = tickets.filter((t) => t.status === "IN_PROGRESS" || t.status === "ASSIGNED").length;

    let averageResolutionDays = 0;
    const resolvedTickets = tickets.filter((t) => t.resolvedAt);
    if (resolvedTickets.length > 0) {
        const totalTime = resolvedTickets.reduce((acc, t) => {
            const diffTime = Math.abs(t.resolvedAt!.getTime() - t.createdAt.getTime());
            return acc + Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }, 0);
        averageResolutionDays = Math.round((totalTime / resolvedTickets.length) * 10) / 10;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center space-x-4 mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">User Profile</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Stats Overview */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard title="Total Issues Raised" value={totalRaised} icon={
                        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    } />
                    <StatCard title="Issues Resolved" value={totalResolved} icon={
                        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    } />
                    <StatCard title="In Progress" value={inProgress} icon={
                        <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    } />
                    <StatCard title="Avg Resolution" value={`${averageResolutionDays} days`} icon={
                        <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    } />
                </div>

                {/* User Card */}
                <div className="lg:col-span-1">
                    <ProfileForm user={user} updateProfileAction={updateProfile} />
                </div>

                {/* Issue History Table */}
                <div className="lg:col-span-2">
                    <div className="glass-panel p-6 h-full flex flex-col">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            Issue History
                        </h2>
                        <div className="flex-1 overflow-x-auto rounded-xl border border-slate-700/50">
                            <table className="min-w-full divide-y divide-slate-700/50">
                                <thead className="bg-slate-800/80">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Ticket ID</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Title</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-slate-800/30 divide-y divide-slate-700/50">
                                    {tickets.map((ticket) => (
                                        <tr key={ticket.id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-400">{ticket.ticketNumber}</td>
                                            <td className="px-6 py-4 text-sm text-slate-300 max-w-xs truncate">{ticket.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${ticket.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                        ticket.status === 'IN_PROGRESS' || ticket.status === 'ASSIGNED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                            ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' :
                                                                'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                                    {ticket.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                                {new Date(ticket.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {tickets.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                                                No issues found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
    return (
        <div className="glass-panel p-6 flex flex-col justify-center items-start relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                <div className="w-16 h-16">{icon}</div>
            </div>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                    {icon}
                </div>
                <h3 className="text-sm font-medium text-slate-400">{title}</h3>
            </div>
            <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        </div>
    )
}
