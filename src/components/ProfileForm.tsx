"use client";

import { useState } from "react";
import { User } from "@prisma/client";

export default function ProfileForm({
    user,
    updateProfileAction,
}: {
    user: User;
    updateProfileAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await updateProfileAction(formData);

        if (result.success) {
            setIsEditing(false);
        } else {
            setError(result.error || "Failed to update profile");
        }
        setLoading(false);
    };

    return (
        <div className="glass-panel p-6 h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600/30 to-indigo-600/30"></div>

            <div className="relative z-10 flex flex-col items-center mt-6 mb-6">
                <div className="relative">
                    {user.profileImage ? (
                        <img src={user.profileImage} alt="Profile" className="w-24 h-24 rounded-full border-4 border-slate-800 object-cover" />
                    ) : (
                        <div className="w-24 h-24 rounded-full border-4 border-slate-800 bg-slate-700 flex items-center justify-center text-3xl font-bold text-slate-300">
                            {user.name?.charAt(0) || user.email.charAt(0)}
                        </div>
                    )}
                </div>
                <h2 className="text-xl font-bold text-white mt-4">{user.name}</h2>
                <p className="text-sm text-slate-400">{user.email}</p>
                <span className="mt-2 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-semibold tracking-wide">
                    {user.role}
                </span>
            </div>

            <div className="flex-1 mt-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">{error}</div>}

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Email <span className="text-slate-500 text-xs">(Read-only)</span></label>
                        <input type="text" value={user.email} disabled className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-400 cursor-not-allowed" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Role <span className="text-slate-500 text-xs">(Read-only)</span></label>
                        <input type="text" value={user.role} disabled className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-400 cursor-not-allowed" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                        <input
                            type="text"
                            name="phone"
                            defaultValue={user.phone || ""}
                            disabled={!isEditing}
                            placeholder="e.g. +1 234 567 890"
                            className={`w-full bg-slate-800/50 border ${isEditing ? "border-blue-500/50 focus:border-blue-500 text-white" : "border-slate-700 text-slate-300"} rounded-lg py-2 px-3 text-sm transition-colors focus:ring-1 focus:ring-blue-500 outline-none`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Hostel / Residence</label>
                        <input
                            type="text"
                            name="hostel"
                            defaultValue={user.hostel || ""}
                            disabled={!isEditing}
                            placeholder="e.g. Dorm A, Room 101"
                            className={`w-full bg-slate-800/50 border ${isEditing ? "border-blue-500/50 focus:border-blue-500 text-white" : "border-slate-700 text-slate-300"} rounded-lg py-2 px-3 text-sm transition-colors focus:ring-1 focus:ring-blue-500 outline-none`}
                        />
                    </div>

                    {isEditing && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Profile Image URL</label>
                            <input
                                type="text"
                                name="profileImage"
                                defaultValue={user.profileImage || ""}
                                placeholder="https://example.com/photo.jpg"
                                className="w-full bg-slate-800/50 border border-blue-500/50 focus:border-blue-500 text-white rounded-lg py-2 px-3 text-sm transition-colors focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    )}

                    <div className="pt-4 flex items-center justify-between border-t border-slate-700/50 mt-6">
                        <div className="text-xs text-slate-500">
                            Member since {new Date(user.createdAt).toLocaleDateString()}
                        </div>

                        {isEditing ? (
                            <div className="flex gap-2">
                                <button type="button" onClick={() => { setIsEditing(false); setError(null); }} className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-md transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading} className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors disabled:opacity-50">
                                    {loading ? "Saving..." : "Save"}
                                </button>
                            </div>
                        ) : (
                            <button type="button" onClick={() => setIsEditing(true)} className="px-3 py-1.5 text-sm font-medium text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-md transition-colors flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                Edit Profile
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
