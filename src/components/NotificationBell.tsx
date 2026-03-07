import { useState, useRef, useEffect } from "react";
import { markAsRead, markAllAsRead, getNotifications } from "@/actions/notification";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    useEffect(() => {
        const fetchNotifs = async () => {
            try {
                const notifs = await getNotifications();
                setNotifications(notifs);
            } catch (err) {
                console.error(err);
            }
        };

        fetchNotifs();
        const interval = setInterval(fetchNotifs, 30000); // Polling every 30s
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (e: React.MouseEvent, id: string, ticketId?: string) => {
        e.stopPropagation();

        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));

        await markAsRead(id);

        if (ticketId) {
            setIsOpen(false);
            router.push(`/ticket/${ticketId}`);
        }
    };

    const handleMarkAllRead = async () => {
        setLoading(true);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        await markAllAsRead();
        setLoading(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-slate-900 border-2 box-content"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center p-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-10">
                        <h3 className="text-sm font-bold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                disabled={loading}
                                className="text-xs text-blue-400 hover:text-blue-300 font-medium disabled:opacity-50"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-sm text-slate-500">
                                You have no notifications.
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={(e) => handleMarkAsRead(e, n.id, n.ticketId)}
                                    className={`p-3 border-b border-slate-800 last:border-0 cursor-pointer transition-colors flex gap-3 ${n.isRead ? 'bg-transparent hover:bg-slate-800/50' : 'bg-blue-500/5 hover:bg-blue-500/10'}`}
                                >
                                    <div className="mt-0.5 shrink-0">
                                        {!n.isRead ? (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                                        ) : (
                                            <div className="w-2 h-2 flex items-center justify-center text-slate-600 mt-1">
                                                •
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm ${n.isRead ? 'text-slate-400' : 'text-slate-200 font-medium'}`}>{n.message}</p>
                                        <p className="text-[10px] text-slate-500 font-mono mt-1">
                                            {new Date(n.createdAt).toLocaleString(undefined, {
                                                month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
