"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

import { promises as fs } from "fs";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

export async function addComment(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const ticketId = formData.get("ticketId") as string;
    const content = formData.get("content") as string;
    const isInternalStr = formData.get("isInternalOnly") as string;
    const image = formData.get("image") as File | null;

    // Only Committee and Admins can create internal comments
    const isInternalOnly = isInternalStr === "true" && session.user.role !== "STUDENT";

    let imageUrl = null;

    if (image && image.size > 0 && image.name) {
        const uniqueId = crypto.randomBytes(8).toString("hex");
        const safeFileName = image.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
        const fileName = `${uniqueId}-comment-${safeFileName}`;

        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data, error } = await supabase.storage
            .from('images')
            .upload(fileName, buffer, {
                contentType: image.type || 'image/jpeg',
            });

        if (error) {
            console.error("Supabase upload error:", error);
        } else {
            const { data: publicUrlData } = supabase.storage
                .from('images')
                .getPublicUrl(fileName);

            imageUrl = publicUrlData.publicUrl;
        }
    }

    const comment = await prisma.comment.create({
        data: {
            ticketId,
            content,
            imageUrl,
            isInternalOnly,
            authorId: session.user.id
        }
    });

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (ticket) {
        const notifications = [];
        if (ticket.authorId !== session.user.id && !isInternalOnly) {
            notifications.push({
                userId: ticket.authorId,
                message: `New comment on your ticket #${ticket.ticketNumber}`,
                ticketId
            });
        }
        if (ticket.assigneeId && ticket.assigneeId !== session.user.id) {
            notifications.push({
                userId: ticket.assigneeId,
                message: `New comment on assigned ticket #${ticket.ticketNumber}`,
                ticketId
            });
        }
        if (notifications.length > 0) {
            await prisma.notification.createMany({ data: notifications });
        }
    }

    revalidatePath(`/ticket/${ticketId}`);
    return comment;
}
