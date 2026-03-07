"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError("Invalid email or password");
            setLoading(false);
        } else {
            router.push("/dashboard");
            router.refresh();
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
                <label className="text-sm font-medium text-slate-300">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field"
                    required
                />
            </div>

            <button
                type="submit"
                className="btn-primary"
                disabled={loading}
            >
                {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className="pt-4 border-t border-slate-700/50 text-sm text-slate-400 text-center space-y-1">
                <p>Don&apos;t have an account? <a href="/register" className="text-blue-400 hover:text-blue-300 transition-colors">Sign up here</a></p>
            </div>
        </form>
    );
}
