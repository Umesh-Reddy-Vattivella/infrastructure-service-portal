"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/actions/auth";
import Link from "next/link";

export default function RegisterForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("STUDENT");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("role", role);

        const res = await registerUser(formData);

        if (res.error) {
            setError(res.error);
            setLoading(false);
        } else {
            router.push("/?registered=true");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 mt-8 w-full">
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-md text-sm text-center">
                    {error}
                </div>
            )}

            <div className="space-y-2 text-left">
                <label className="text-sm font-medium text-slate-300">Full Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="input-field"
                    required
                />
            </div>

            <div className="space-y-2 text-left">
                <label className="text-sm font-medium text-slate-300">Email Address</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@institute.edu"
                    className="input-field"
                    required
                />
            </div>

            <div className="space-y-2 text-left">
                <label className="text-sm font-medium text-slate-300">Role</label>
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="input-field w-full"
                >
                    <option value="STUDENT">Student</option>
                    <option value="COMMITTEE">Committee Member</option>
                    <option value="SECRETARY">Secretary</option>
                    <option value="SAO">SAO</option>
                </select>
            </div>

            <div className="space-y-2 text-left">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field"
                    required
                    minLength={6}
                />
            </div>

            <button
                type="submit"
                className="btn-primary"
                disabled={loading}
            >
                {loading ? "Creating account..." : "Sign Up"}
            </button>

            <div className="pt-4 border-t border-slate-700/50 text-sm text-slate-400 text-center">
                <p>Already have an account? <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors">Sign in here</Link></p>
            </div>
        </form>
    );
}
