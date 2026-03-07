import LoginForm from "@/components/LoginForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Insti<span className="text-blue-500">Solve</span></h1>
        <p className="text-slate-400 mb-8 max-w-[280px] mx-auto">
          Centralized Infrastructure Service Portal for Campus Care
        </p>

        <LoginForm />
      </div>
    </main>
  );
}
