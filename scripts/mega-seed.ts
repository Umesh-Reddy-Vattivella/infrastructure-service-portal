import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase credentials in .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);
const prisma = new PrismaClient();

async function uploadImage(filePath: string): Promise<string | null> {
    try {
        const fullPath = path.join(process.cwd(), "images", filePath);
        const buffer = await fs.readFile(fullPath);
        
        const uniqueId = crypto.randomBytes(8).toString("hex");
        const safeFileName = filePath.replace(/[^a-zA-Z0-9.\-_]/g, "");
        const fileName = `${uniqueId}-${safeFileName}`;

        const { data, error } = await supabase.storage
            .from('images')
            .upload(fileName, buffer, {
                contentType: 'image/jpeg',
                upsert: true
            });

        if (error) {
            console.error("Supabase upload error for", filePath, ":", error);
            return null;
        }

        const { data: publicUrlData } = supabase.storage
            .from('images')
            .getPublicUrl(fileName);

        return publicUrlData.publicUrl;
    } catch (err) {
        console.error("Local file read error for", filePath, ":", err);
        return null;
    }
}

async function main() {
    console.log("Wiping entire database...");
    await prisma.ticketVote.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.ticketEscalation.deleteMany();
    await prisma.ticketAssignment.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.issueImage.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.user.deleteMany();

    console.log("Creating new accounts...");
    const adminPassword = await bcrypt.hash("admin@123", 10);
    const userPassword = await bcrypt.hash("user@123", 10);

    // Create SAO and Secretary
    const sao = await prisma.user.create({
        data: { name: "System SAO", email: "sao@institute.edu", password: adminPassword, role: "SAO" }
    });
    
    const secretary = await prisma.user.create({
        data: { name: "Secretary Infracom", email: "name_secretary_infracom@institute.edu", password: adminPassword, role: "SECRETARY" }
    });

    // Create 4 Committee Members
    const committeeIds = [];
    for (let i = 1; i <= 4; i++) {
        const c = await prisma.user.create({
            data: { name: `Committee ${i}`, email: `name_infracom_${i}@institute.edu`, password: adminPassword, role: "COMMITTEE" }
        });
        committeeIds.push(c.id);
    }

    // Create 8 Students
    const studentIds = [];
    for (let i = 1; i <= 8; i++) {
        const s = await prisma.user.create({
            data: { name: `Student ${i}`, email: `student_${i}@institute.edu`, password: userPassword, role: "STUDENT" }
        });
        studentIds.push(s.id);
    }

    console.log("Saving credentials to test_accounts.txt...");
    const credText = `
--- InstiSolve Test Accounts ---

[SAO - admin@123]
sao@institute.edu

[Secretary - admin@123]
name_secretary_infracom@institute.edu

[Committee - admin@123]
name_infracom_1@institute.edu
name_infracom_2@institute.edu
name_infracom_3@institute.edu
name_infracom_4@institute.edu

[Students - user@123]
student_1@institute.edu
student_2@institute.edu
... up to student_8@institute.edu
    `;
    await fs.writeFile(path.join(process.cwd(), "test_accounts.txt"), credText.trim());

    console.log("Seeding tickets...");

    const generateTicketNumber = () => `INF-2026-${Date.now().toString().slice(-5)}${Math.random().toString(36).substring(2, 4).toUpperCase()}`;

    const ticketsData = [
        {
            title: "Broken window in Room 402", description: "Glass is shattered and needs immediate repair.", category: "OTHER", priority: "HIGH", location: "Hostel A", authorId: studentIds[0],
            image: "broken window.jpg"
        },
        {
            title: "Leaking pipe in 2nd-floor washroom", description: "Water is flooding the corridor.", category: "PLUMBING", priority: "HIGH", location: "Academic Block", authorId: studentIds[1],
            image: "leaing pipe.jpg" // intentionally matching typo of original file
        },
        {
            title: "Damaged study chair", description: "The leg is completely broken.", category: "OTHER", priority: "LOW", location: "Hostel B", authorId: studentIds[2],
            image: "broken chair.jpg"
        },
        {
            title: "Corridor lights flickering badly", description: "It is causing a headache and seems like a short circuit waiting to happen.", category: "ELECTRICAL", priority: "MEDIUM", location: "Hostel C", authorId: studentIds[3],
            image: "short circuit.jpg"
        },
        {
            title: "Broken commode in stall 3", description: "It is unusable.", category: "PLUMBING", priority: "HIGH", location: "Hostel D", authorId: studentIds[4],
            image: "broken commode.jpg"
        },
        {
            title: "Light is completely broken", description: "Needs replacement.", category: "ELECTRICAL", priority: "LOW", location: "Library", authorId: studentIds[5],
            image: "Light broken.jpg"
        },
        {
            title: "Unstable Wi-Fi connection", description: "Keeps dropping every 5 minutes.", category: "WIFI", priority: "MEDIUM", location: "Library", authorId: studentIds[6]
        },
        {
            title: "Water cooler dispensing warm water", description: "Hasn't cooled at all today.", category: "OTHER", priority: "LOW", location: "Mess Hall", authorId: studentIds[7]
        }
    ];

    for (let i = 0; i < ticketsData.length; i++) {
        const td = ticketsData[i];
        
        let imageUrl = null;
        if (td.image) {
            console.log(`Uploading ${td.image} to Supabase...`);
            imageUrl = await uploadImage(td.image);
            await new Promise(r => setTimeout(r, 500)); // Rate limit buffer
        }

        const ticket = await prisma.ticket.create({
            data: {
                ticketNumber: generateTicketNumber(),
                title: td.title,
                description: td.description,
                category: td.category,
                priority: td.priority,
                location: td.location,
                status: "OPEN",
                authorId: td.authorId,
                images: imageUrl ? { create: [{ url: imageUrl }] } : undefined
            }
        });

        // Simulate some chat history and escalations
        if (i === 0) {
            // Escalate up to SAO
            await prisma.comment.create({ data: { content: "Looking into this now...", ticketId: ticket.id, authorId: committeeIds[0] }});
            // Assumed escalation
            await prisma.ticket.update({ where: { id: ticket.id }, data: { status: "ESCALATED" }});
            await prisma.ticketEscalation.create({ data: { ticketId: ticket.id, reason: "Requires major funding for window replacement.", escalatedById: committeeIds[0] }});
            await prisma.comment.create({ data: { content: "Escalating to Secretary for cost approval.", ticketId: ticket.id, authorId: committeeIds[0], isInternalOnly: true }});
            await prisma.comment.create({ data: { content: "Escalating further to SAO as budget exceeds threshold.", ticketId: ticket.id, authorId: secretary.id, isInternalOnly: true }});
            await prisma.ticketEscalation.create({ data: { ticketId: ticket.id, reason: "Budget approval needed from SAO", escalatedById: secretary.id }});
        }

        if (i === 1) {
            // Resolved ticket
            await prisma.ticket.update({ where: { id: ticket.id }, data: { status: "RESOLVED", resolvedAt: new Date(), assigneeId: committeeIds[1] } });
            await prisma.comment.create({ data: { content: "Plumber arrived and fixed the pipe.", ticketId: ticket.id, authorId: committeeIds[1] }});
        }
        
        if (i === 2) {
            // Ongoing chat
            await prisma.comment.create({ data: { content: "I can bring it to the admin block tomorrow if needed?", ticketId: ticket.id, authorId: td.authorId }});
            await prisma.comment.create({ data: { content: "Yes please bring it to room 102.", ticketId: ticket.id, authorId: committeeIds[2] }});
            await prisma.ticket.update({ where: { id: ticket.id }, data: { status: "IN_PROGRESS", assigneeId: committeeIds[2] } });
        }
    }

    console.log("Seeding complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
