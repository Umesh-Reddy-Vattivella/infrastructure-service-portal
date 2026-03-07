"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
    const session = await auth();
    if (!session?.user?.id) return [];

    return prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
    });
}

export async function markAsRead(notificationId: string) {
    const session = await auth();
    if (!session?.user?.id) return;

    await prisma.notification.update({
        where: { id: notificationId, userId: session.user.id },
        data: { isRead: true }
    });

    revalidatePath("/", "layout"); // Revalidate layout to update bell
}

export async function markAllAsRead() {
    const session = await auth();
    if (!session?.user?.id) return;

    await prisma.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true }
    });

    revalidatePath("/", "layout");
}
