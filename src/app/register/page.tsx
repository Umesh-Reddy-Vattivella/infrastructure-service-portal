import RegisterForm from "@/components/RegisterForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
    const session = await auth();

    if (session?.user) {
        redirect("/dashboard");
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Dynamic Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md glass-panel rounded-2xl p-8 text-center relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/25 mb-6 rotate-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white -rotate-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create an Account</h1>
                <p className="text-slate-400 mb-8 max-w-[280px] mx-auto">
                    Sign up to access the Infrastructure Service Portal
                </p>

                <RegisterForm />
            </div>
        </main>
    );
}
