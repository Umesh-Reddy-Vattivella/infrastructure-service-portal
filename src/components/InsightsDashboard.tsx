"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function InsightsDashboard({ data }: { data: any }) {
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

    const handleExportCSV = () => {
        const headers = ["Category", "Count"];
        const rows = data.charts.category.map((c: any) => `${c.name},${c.value}`);
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "infrastructure_insights.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-inner">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Infrastructure Insights</h1>
                    <p className="text-slate-400">Campus-wide analytics and performance metrics.</p>
                </div>
                <button onClick={handleExportCSV} className="btn-primary w-auto flex items-center gap-2 bg-slate-700 hover:bg-slate-600 border border-slate-600">
                    <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export CSV
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel p-6 rounded-xl border-t-4 border-t-blue-500 relative overflow-hidden group">
                    <p className="text-sm font-medium text-slate-400 mb-1">Total Reported</p>
                    <p className="text-4xl font-bold text-white tracking-tight">{data.metrics.total}</p>
                </div>
                <div className="glass-panel p-6 rounded-xl border-t-4 border-t-green-500 relative overflow-hidden group">
                    <p className="text-sm font-medium text-slate-400 mb-1">Resolution Rate</p>
                    <p className="text-4xl font-bold text-white tracking-tight">{data.metrics.resolutionRate}%</p>
                </div>
                <div className="glass-panel p-6 rounded-xl border-t-4 border-t-purple-500 relative overflow-hidden group">
                    <p className="text-sm font-medium text-slate-400 mb-1">Avg Resolution Time</p>
                    <p className="text-4xl font-bold text-white tracking-tight">{data.metrics.avgResolutionHours}h</p>
                </div>
                <div className="glass-panel p-6 rounded-xl border-t-4 border-t-red-500 relative overflow-hidden group">
                    <p className="text-sm font-medium text-slate-400 mb-1">Total Escalated</p>
                    <p className="text-4xl font-bold text-white tracking-tight">{data.metrics.escalated}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Category Chart */}
                <div className="glass-panel p-6 rounded-xl border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-6">Issues by Category</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.charts.category}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.charts.category.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Chart */}
                <div className="glass-panel p-6 rounded-xl border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-6">Current Ticket Status</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.charts.status} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem' }}
                                    cursor={{ fill: '#334155', opacity: 0.4 }}
                                />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60}>
                                    {data.charts.status.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={
                                            entry.name === 'RESOLVED' || entry.name === 'CLOSED' ? '#10b981' :
                                                entry.name === 'ESCALATED' ? '#ef4444' :
                                                    entry.name === 'IN_PROGRESS' || entry.name === 'ASSIGNED' ? '#3b82f6' : '#f59e0b'
                                        } />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Activity Mini-table */}
            <div className="glass-panel p-6 rounded-xl border border-slate-700 overflow-hidden mt-8">
                <h3 className="text-lg font-semibold text-white mb-6 border-b border-slate-800 pb-4">Most Recent Activity</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 text-sm md:text-base text-slate-400">
                                <th className="pb-3 px-4 font-medium whitespace-nowrap">ID</th>
                                <th className="pb-3 px-4 font-medium">Title</th>
                                <th className="pb-3 px-4 font-medium whitespace-nowrap">Status</th>
                                <th className="pb-3 px-4 font-medium text-right whitespace-nowrap">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.recentActivity.map((ticket: any) => (
                                <tr key={ticket.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors last:border-0">
                                    <td className="py-4 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">{ticket.ticketNumber}</td>
                                    <td className="py-4 px-4 text-sm font-medium text-slate-200">{ticket.title}</td>
                                    <td className="py-4 px-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border
                                            ${ticket.status === 'OPEN' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : ''}
                                            ${ticket.status === 'ASSIGNED' || ticket.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : ''}
                                            ${ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                                            ${ticket.status === 'ESCALATED' ? 'bg-red-500/10 text-red-500 border-red-500/20' : ''}
                                        `}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-sm text-slate-400 text-right whitespace-nowrap">
                                        {new Date(ticket.updatedAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
