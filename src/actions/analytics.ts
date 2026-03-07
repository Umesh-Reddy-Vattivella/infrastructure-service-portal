"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function getDashboardAnalytics() {
    const session = await auth();
    if (!session || session.user.role === "STUDENT") {
        throw new Error("Unauthorized");
    }

    const [
        totalTickets,
        resolvedTickets,
        escalatedTickets,
        ticketsByCategory,
        ticketsByStatus,
        ticketsByPriority,
        recentActivity
    ] = await Promise.all([
        prisma.ticket.count(),
        prisma.ticket.count({ where: { status: { in: ["RESOLVED", "CLOSED"] } } }),
        prisma.ticket.count({ where: { status: "ESCALATED" } }),
        prisma.ticket.groupBy({
            by: ['category'],
            _count: {
                _all: true
            }
        }),
        prisma.ticket.groupBy({
            by: ['status'],
            _count: {
                _all: true
            }
        }),
        prisma.ticket.groupBy({
            by: ['priority'],
            _count: {
                _all: true
            }
        }),
        prisma.ticket.findMany({
            take: 10,
            orderBy: { updatedAt: 'desc' },
            select: { id: true, ticketNumber: true, title: true, status: true, updatedAt: true }
        })
    ]);

    // Average Resolution Time (naive calculation)
    const resolvedData = await prisma.ticket.findMany({
        where: { status: { in: ["RESOLVED", "CLOSED"] }, resolvedAt: { not: null } },
        select: { createdAt: true, resolvedAt: true }
    });

    let avgResolutionHours = 0;
    if (resolvedData.length > 0) {
        const totalMs = resolvedData.reduce((sum, t) => {
            return sum + (t.resolvedAt!.getTime() - t.createdAt.getTime());
        }, 0);
        avgResolutionHours = Math.round(totalMs / resolvedData.length / (1000 * 60 * 60));
    }

    // Format for charts
    const categoryChart = ticketsByCategory.map(t => ({
        name: t.category,
        value: t._count._all
    }));

    const statusChart = ticketsByStatus.map(t => ({
        name: t.status,
        value: t._count._all
    }));

    const priorityChart = ticketsByPriority.map(t => ({
        name: t.priority,
        value: t._count._all
    }));

    return {
        metrics: {
            total: totalTickets,
            resolved: resolvedTickets,
            escalated: escalatedTickets,
            avgResolutionHours,
            resolutionRate: totalTickets ? Math.round((resolvedTickets / totalTickets) * 100) : 0
        },
        charts: {
            category: categoryChart,
            status: statusChart,
            priority: priorityChart
        },
        recentActivity
    };
}
