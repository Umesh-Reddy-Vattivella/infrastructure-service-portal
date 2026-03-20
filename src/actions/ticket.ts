"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { promises as fs } from "fs";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

// Custom unique human-readable ID (e.g., INF-2026-001)
function generateTicketNumber() {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-5);
    const randomStr = Math.random().toString(36).substring(2, 4).toUpperCase();
    return `INF-${year}-${timestamp}${randomStr}`;
}

// System Auto-Closure logic
async function autoCloseResolvedTickets() {
    // Find all RESOLVED tickets where the responseDeadline has passed
    const expiredTickets = await prisma.ticket.findMany({
        where: {
            status: "RESOLVED",
            responseDeadline: {
                lte: new Date()
            }
        },
        select: { id: true, authorId: true, ticketNumber: true }
    });

    if (expiredTickets.length === 0) return;

    // Use a transaction to batch close all of them and add system comments
    await prisma.$transaction(async (tx) => {
        for (const ticket of expiredTickets) {
            // Update ticket
            await tx.ticket.update({
                where: { id: ticket.id },
                data: {
                    status: "CLOSED",
                    responseDeadline: null
                }
            });

            // Add auto-close comment
            await tx.comment.create({
                data: {
                    content: "SYSTEM: Ticket automatically CLOSED due to lack of response within the requested timeframe.",
                    ticketId: ticket.id,
                    authorId: ticket.authorId // System comments still need an authorId to pass schema, we'll use the author's ID or we could use the first admin
                }
            });

            // Notify user
            await tx.notification.create({
                data: {
                    userId: ticket.authorId,
                    message: `Your ticket #${ticket.ticketNumber} was automatically closed due to inactivity.`,
                    ticketId: ticket.id
                }
            });
        }
    });
}

export async function createTicket(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const priority = (formData.get("priority") as string) || "MEDIUM";
    const location = formData.get("location") as string;
    const isAnonymous = formData.get("isAnonymous") === "true";

    const files = formData.getAll("images") as File[];
    const uploadedImages: { url: string }[] = [];

    if (files.length > 0) {
        for (const file of files) {
            if (file.size > 0 && file.name) {
                const uniqueId = crypto.randomBytes(8).toString("hex");
                const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
                const fileName = `${uniqueId}-${safeFileName}`;

                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                const { data, error } = await supabase.storage
                    .from('images')
                    .upload(fileName, buffer, {
                        contentType: file.type || 'image/jpeg',
                    });

                if (error) {
                    console.error("Supabase upload error:", error);
                    continue;
                }

                const { data: publicUrlData } = supabase.storage
                    .from('images')
                    .getPublicUrl(fileName);

                uploadedImages.push({ url: publicUrlData.publicUrl });
            }
        }
    }

    let slaHours = 48; // Default medium
    if (priority === "HIGH") slaHours = 24;
    if (priority === "LOW") slaHours = 72;

    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const ticket = await prisma.ticket.create({
        data: {
            ticketNumber: generateTicketNumber(),
            title,
            description,
            category,
            priority,
            location,
            isAnonymous,
            slaDeadline,
            authorId: session.user.id,
            images: uploadedImages.length > 0 ? {
                create: uploadedImages
            } : undefined
        },
    });

    revalidatePath("/dashboard");
    return ticket;
}

export async function getTickets() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    // Lazy evaluate closures
    await autoCloseResolvedTickets();

    if (session.user.role !== "STUDENT") {
        return prisma.ticket.findMany({
            orderBy: { createdAt: "desc" },
            include: { author: { select: { name: true, email: true } } },
        });
    } else {
        return prisma.ticket.findMany({
            where: { authorId: session.user.id },
            orderBy: { createdAt: "desc" },
        });
    }
}

export async function getTicketById(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    // Lazy evaluate closures
    await autoCloseResolvedTickets();

    const ticket = await prisma.ticket.findUnique({
        where: { id },
        include: {
            author: { select: { name: true, email: true, role: true } },
            assignee: { select: { name: true, email: true } },
            images: true,
            comments: {
                orderBy: { createdAt: 'asc' },
                include: { author: { select: { name: true, role: true } } }
            },
            escalations: {
                orderBy: { escalatedAt: 'desc' },
                take: 1,
                include: { escalatedBy: { select: { name: true } } }
            },
            _count: { select: { votes: true } },
            votes: {
                where: { userId: session.user.id }
            }
        }
    });

    if (!ticket) return null;

    // Mask author if anonymous
    if (ticket.isAnonymous && session.user.role === "STUDENT" && ticket.authorId !== session.user.id) {
        ticket.author.name = "Anonymous Student";
        ticket.author.email = "hidden@instisolve.edu";
    }

    // Allow public access, or protect student privacy from other students (though auth prevents getting here)
    if (!ticket.isPublic && session.user.role === "STUDENT" && ticket.authorId !== session.user.id) {
        throw new Error("Unauthorized");
    }

    // Filter internal comments for students
    if (session.user.role === "STUDENT") {
        ticket.comments = ticket.comments.filter((c: any) => !c.isInternalOnly);
    }

    return ticket;
}

export async function updateTicketStatus(ticketId: string, status: string, comment: string, responseHours?: number) {
    const session = await auth();
    if (!session || session.user.role === "STUDENT") {
        throw new Error("Unauthorized");
    }

    const updateData: any = { status };
    if (status === "RESOLVED" || status === "CLOSED") {
        updateData.resolvedAt = new Date();
    }

    // Set response deadline if provided and status is RESOLVED
    if (status === "RESOLVED" && responseHours) {
        updateData.responseDeadline = new Date(Date.now() + responseHours * 60 * 60 * 1000);
    } else if (status !== "RESOLVED") {
        // Clear deadline if moving away from resolved
        updateData.responseDeadline = null;
    }

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new Error("Ticket not found");

    const oldStatus = ticket.status;

    const [updatedTicket, systemComment] = await prisma.$transaction([
        prisma.ticket.update({
            where: { id: ticketId },
            data: updateData
        }),
        prisma.comment.create({
            data: {
                content: `SYSTEM: Status updated from ${oldStatus} to ${status}.\n\nAdmin Comment: ${comment}`,
                ticketId,
                authorId: session.user.id
            }
        }),
        // Notify author
        prisma.notification.create({
            data: {
                userId: ticket.authorId,
                message: `Status of your ticket #${ticket.ticketNumber} changed to ${status}`,
                ticketId
            }
        })
    ]);

    revalidatePath(`/ticket/${ticketId}`);
    revalidatePath("/dashboard");
    return ticket;
}

export async function updateTicketPriority(ticketId: string, priority: "LOW" | "MEDIUM" | "HIGH") {
    const session = await auth();
    if (!session || session.user.role === "STUDENT") {
        throw new Error("Unauthorized");
    }

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new Error("Ticket not found");

    const oldPriority = ticket.priority;
    if (oldPriority === priority) return ticket;

    let slaHours = 48; // Default medium
    if (priority === "HIGH") slaHours = 24;
    if (priority === "LOW") slaHours = 72;

    // Recalculate SLA deadline based on original creation date
    const slaDeadline = new Date(ticket.createdAt.getTime() + slaHours * 60 * 60 * 1000);

    const [updatedTicket, systemComment] = await prisma.$transaction([
        prisma.ticket.update({
            where: { id: ticketId },
            data: { priority, slaDeadline }
        }),
        prisma.comment.create({
            data: {
                content: `SYSTEM: Priority updated from ${oldPriority} to ${priority}.`,
                ticketId,
                authorId: session.user.id
            }
        })
    ]);

    revalidatePath(`/ticket/${ticketId}`);
    revalidatePath("/dashboard");
    return updatedTicket;
}

export async function verifyTicketResolution(ticketId: string, isResolved: boolean) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId }
    });

    if (!ticket || ticket.authorId !== session.user.id || ticket.status !== "RESOLVED") {
        throw new Error("Unauthorized or invalid ticket state");
    }

    const newStatus = isResolved ? "CLOSED" : "IN_PROGRESS";

    const updatedTicket = await prisma.ticket.update({
        where: { id: ticketId },
        data: {
            status: newStatus,
            resolvedAt: newStatus === "CLOSED" ? new Date() : null // Keep resolvedAt if closed, clear it if in progress
        }
    });

    // Notify committee if rejected
    if (!isResolved) {
        // Find assigned committee member
        if (ticket.assigneeId) {
            await prisma.notification.create({
                data: {
                    userId: ticket.assigneeId,
                    message: `Student rejected the resolution for ticket #${ticket.ticketNumber}`,
                    ticketId
                }
            });
        }

        // Also add a system comment documenting the rejection
        await prisma.comment.create({
            data: {
                content: "SYSTEM: Author rejected resolution. Ticket moved back to IN_PROGRESS.",
                ticketId,
                authorId: session.user.id // Add author as the user returning the state
            }
        });
    } else {
        await prisma.comment.create({
            data: {
                content: "SYSTEM: Author confirmed resolution. Ticket closed.",
                ticketId,
                authorId: session.user.id
            }
        });
    }

    revalidatePath(`/ticket/${ticketId}`);
    revalidatePath("/dashboard");
    return updatedTicket;
}

export async function getCommitteeMembers() {
    const session = await auth();
    if (!session || session.user.role === "STUDENT") {
        throw new Error("Unauthorized");
    }

    return prisma.user.findMany({
        where: { role: { not: "STUDENT" } },
        select: { id: true, name: true, email: true, role: true }
    });
}

export async function assignTicket(ticketId: string, assigneeId: string) {
    const session = await auth();
    if (!session || session.user.role === "STUDENT") {
        throw new Error("Unauthorized");
    }

    // Create tracking record and update ticket
    const existingTicket = await prisma.ticket.findUnique({ where: { id: ticketId }, select: { status: true } });

    const [assignment, ticket, _notification, systemComment] = await prisma.$transaction([
        prisma.ticketAssignment.create({
            data: {
                ticketId,
                assignedToId: assigneeId,
                assignedById: session.user.id
            }
        }),
        prisma.ticket.update({
            where: { id: ticketId },
            data: {
                assigneeId,
                status: existingTicket?.status === "OPEN" ? "ASSIGNED" : undefined // only set to ASSIGNED if currently OPEN, otherwise keep current status (like ESCALATED or IN_PROGRESS)
            }
        }),
        prisma.notification.create({
            data: {
                userId: assigneeId,
                message: `You have been assigned to ticket #${ticketId.slice(0, 8)}`,
                ticketId
            }
        }),
        prisma.comment.create({
            data: {
                content: `SYSTEM: Ticket assigned to staff member.`,
                ticketId,
                authorId: session.user.id
            }
        })
    ]);

    revalidatePath(`/ticket/${ticketId}`);
    revalidatePath("/dashboard");
    return ticket;
}

export async function escalateTicket(ticketId: string, reason: string) {
    const session = await auth();
    if (!session || session.user.role === "STUDENT") {
        throw new Error("Unauthorized");
    }

    // Get ticket author to notify them
    const existingTicket = await prisma.ticket.findUnique({ where: { id: ticketId } });

    const [escalation, ticket] = await prisma.$transaction([
        prisma.ticketEscalation.create({
            data: {
                ticketId,
                reason,
                escalatedById: session.user.id
            }
        }),
        prisma.ticket.update({
            where: { id: ticketId },
            data: {
                status: "ESCALATED"
            }
        }),
        // Notify Author
        ...(existingTicket ? [prisma.notification.create({
            data: {
                userId: existingTicket.authorId,
                message: `Your ticket #${existingTicket.ticketNumber} has been ESCALATED.`,
                ticketId
            }
        })] : []),
        prisma.comment.create({
            data: {
                content: `SYSTEM: Ticket ESCALATED. Reason: ${reason}`,
                ticketId,
                authorId: session.user.id,
                isInternalOnly: true // Escalation reasons should ideally be hidden from student if committee escalated
            }
        })
    ]);

    revalidatePath(`/ticket/${ticketId}`);
    revalidatePath("/dashboard");
    return ticket;
}

export async function toggleTicketVisibility(ticketId: string, isPublic: boolean) {
    const session = await auth();
    if (!session || session.user.role === "STUDENT") {
        throw new Error("Unauthorized");
    }

    const updatedTicket = await prisma.ticket.update({
        where: { id: ticketId },
        data: { isPublic }
    });

    revalidatePath(`/ticket/${ticketId}`);
    revalidatePath("/dashboard");
    revalidatePath("/issues"); // The new public feed page
    return updatedTicket;
}

export async function getPublicTickets(searchParams?: {
    category?: string;
    status?: string;
    location?: string;
    priority?: string;
    sortBy?: string;
}) {
    // Lazy evaluate closures
    await autoCloseResolvedTickets();

    // No auth needed for public issues feed!
    const whereClause: any = { isPublic: true };

    if (searchParams?.category) whereClause.category = searchParams.category;
    if (searchParams?.status) whereClause.status = searchParams.status;
    if (searchParams?.location) whereClause.location = searchParams.location;
    if (searchParams?.priority) whereClause.priority = searchParams.priority;

    let orderByClause: any = { createdAt: "desc" }; // default Newest

    if (searchParams?.sortBy === "priority") {
        // Prisma doesn't easily sort by enum/string priority logic (HIGH > MEDIUM > LOW) natively without raw queries,
        // so we can sort by createdAt for now, or fetch all and sort in memory if needed.
        // We will fetch and sort in memory for Priority, or just sort by updatedAt. Let's do updatedAt.
        orderByClause = { updatedAt: "desc" };
    } else if (searchParams?.sortBy === "comments") {
        orderByClause = { comments: { _count: "desc" } };
    }

    let tickets = await prisma.ticket.findMany({
        where: whereClause,
        orderBy: orderByClause,
        include: {
            _count: { select: { comments: true, votes: true } },
            // Include whether the current user (if any) voted. But public tickets feed might not have session in action reliably,
            // we will fetch votes in page.tsx if needed, or pass session user ID here.
        }
    });

    // In-memory sort for priority if requested
    if (searchParams?.sortBy === "priority") {
        const priorityScore = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        tickets = tickets.sort((a, b) => {
            const scoreA = priorityScore[a.priority as keyof typeof priorityScore] || 0;
            const scoreB = priorityScore[b.priority as keyof typeof priorityScore] || 0;
            if (scoreB !== scoreA) return scoreB - scoreA;
            return b.createdAt.getTime() - a.createdAt.getTime();
        });
    }

    return tickets;
}

export async function reopenTicket(ticketId: string, reason: string) {
    const session = await auth();
    if (!session || session.user.role === "STUDENT") {
        throw new Error("Unauthorized");
    }

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket || ticket.status !== "CLOSED") throw new Error("Invalid ticket state");

    const [updatedTicket, systemComment] = await prisma.$transaction([
        prisma.ticket.update({
            where: { id: ticketId },
            data: {
                status: "OPEN",
                resolvedAt: null,
                responseDeadline: null
            }
        }),
        prisma.comment.create({
            data: {
                content: `SYSTEM: Ticket reopened by Admin. Reason: ${reason}`,
                ticketId,
                authorId: session.user.id
            }
        }),
        // Notify Author
        prisma.notification.create({
            data: {
                userId: ticket.authorId,
                message: `Your CLOSED ticket #${ticket.ticketNumber} was reopened by an Admin.`,
                ticketId
            }
        })
    ]);

    revalidatePath(`/ticket/${ticketId}`);
    revalidatePath("/dashboard");
    return updatedTicket;
}

export async function toggleUpvote(ticketId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const existingVote = await prisma.ticketVote.findFirst({
        where: { ticketId, userId: session.user.id }
    });

    if (existingVote) {
        await prisma.ticketVote.delete({ where: { id: existingVote.id } });
    } else {
        await prisma.ticketVote.create({
            data: { ticketId, userId: session.user.id }
        });
    }

    revalidatePath(`/ticket/${ticketId}`);
    revalidatePath("/issues");
}
