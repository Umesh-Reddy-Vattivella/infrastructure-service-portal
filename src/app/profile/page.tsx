import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import ProfileView from "@/components/ProfileView";

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/login");
    }

    // Fetch complete user data
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        redirect("/login");
    }

    // Fetch user tickets (History)
    const tickets = await prisma.ticket.findMany({
        where: { authorId: user.id },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar user={user} />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                <ProfileView user={user} tickets={tickets} />
            </main>
        </div>
    );
}
