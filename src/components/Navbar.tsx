"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import NotificationBell from "./NotificationBell";

export default function Navbar({ user }: { user: { name?: string | null, role: string, email?: string | null } }) {
    return (
        <nav className="glass-panel border-b-0 border-x-0 border-t-0 rounded-none sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link href="/dashboard" className="flex-shrink-0 flex items-center gap-3 group cursor-pointer">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:bg-blue-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white group-hover:text-blue-400 transition-colors">Insti<span className="text-blue-500 group-hover:text-blue-300">Solve</span></span>
                        <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                            {user.role}
                        </span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="flex md:hidden mr-2">
                            <Link href="/issues" className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 rounded-full transition-colors border border-slate-700">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                            </Link>
                        </div>
                        <div className="hidden md:flex items-center gap-4 text-sm font-medium">
                            <Link href="/issues" className="text-slate-300 hover:text-blue-400 transition-colors mr-2">
                                Campus Issues
                            </Link>

                            {user.role !== "STUDENT" && (
                                <Link href="/insights" className="text-slate-300 hover:text-emerald-400 transition-colors mr-2 flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Insights
                                </Link>
                            )}

                            <div className="text-right border-l border-slate-700 pl-4">
                                <Link href="/profile" className="group block">
                                    <div className="text-slate-200 group-hover:text-blue-400 transition-colors">{user.name}</div>
                                    <div className="text-xs text-slate-400 group-hover:text-blue-400/80 transition-colors">{user.email}</div>
                                </Link>
                            </div>
                        </div>
                        <Link href="/profile" className="p-2 mr-2 hidden md:block text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 rounded-full transition-colors border border-slate-700">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        </Link>

                        <NotificationBell />

                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors border border-slate-700"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
