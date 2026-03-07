import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    // Simple auth to prevent public spamming if it's hit manually
    // In production, use Vercel Cron header validation
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // Find tickets that are High Priority, OPEN, and older than 1 hour (simulated SLA)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    try {
        const escalatedTickets = await prisma.ticket.updateMany({
            where: {
                status: "OPEN",
                priority: "HIGH",
                createdAt: {
                    lt: oneHourAgo
                }
            },
            data: {
                status: "ESCALATED"
            }
        });

        return NextResponse.json({
            success: true,
            escalatedCount: escalatedTickets.count,
            message: `Successfully escalated ${escalatedTickets.count} neglected high-priority tickets.`
        });
    } catch (error) {
        console.error("Cron Error:", error);
        return NextResponse.json({ success: false, error: "Failed to run escalation cron" }, { status: 500 });
    }
}
