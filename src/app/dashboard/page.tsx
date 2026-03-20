import { auth } from "@/auth";
import { getTickets, getCommitteeMembers } from "@/actions/ticket";
import { redirect } from "next/navigation";
import StudentDashboard from "@/components/StudentDashboard";
import CommitteeDashboard from "@/components/CommitteeDashboard";
import Navbar from "@/components/Navbar";

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/");
    }

    const tickets = await getTickets();

    const isCommittee = session.user.role !== "STUDENT";
    const committeeMembers = isCommittee ? await getCommitteeMembers() : [];

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar user={session.user} />
            <main className="flex-1 container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-6">
                {session.user.role === "STUDENT" ? (
                    <StudentDashboard tickets={tickets} />
                ) : (
                    <CommitteeDashboard tickets={tickets} currentUser={session.user} committeeMembers={committeeMembers} />
                )}
            </main>
        </div>
    );
}
