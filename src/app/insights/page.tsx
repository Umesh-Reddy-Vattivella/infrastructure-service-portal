import { getDashboardAnalytics } from "@/actions/analytics";
import Navbar from "@/components/Navbar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import InsightsDashboard from "@/components/InsightsDashboard";

export default async function InsightsPage() {
    const session = await auth();
    // Only allow COMMITTEE and ADMIN
    if (!session?.user || session.user.role === "STUDENT") {
        redirect("/dashboard");
    }

    const analyticsData = await getDashboardAnalytics();

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar user={session.user} />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <InsightsDashboard data={analyticsData} />
            </main>
        </div>
    );
}
