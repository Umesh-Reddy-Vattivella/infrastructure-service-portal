import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const defaultStudentEmail = "student@institute.edu";
const defaultCommitteeEmail = "committee@institute.edu";
const defaultPassword = "password123";

async function main() {
    console.log("Seeding test data...");

    // Ensure default users exist
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    let student = await prisma.user.findUnique({ where: { email: defaultStudentEmail } });
    if (!student) {
        student = await prisma.user.create({
            data: {
                email: defaultStudentEmail,
                name: "Test Student",
                password: hashedPassword,
                role: "STUDENT"
            }
        });
        console.log("Created default test student");
    }

    let committee = await prisma.user.findUnique({ where: { email: defaultCommitteeEmail } });
    if (!committee) {
        committee = await prisma.user.create({
            data: {
                email: defaultCommitteeEmail,
                name: "Test Committee",
                password: hashedPassword,
                role: "COMMITTEE"
            }
        });
        console.log("Created default test committee");
    }

    // Sample Tickets data
    const sampleTickets = [
        {
            title: "No hot water in Dorm A",
            description: "The showers in Dorm A, 2nd floor have had no hot water since yesterday evening.",
            status: "OPEN",
            priority: "HIGH",
            category: "HOT_WATER",
            location: "Dorm A, 2nd Floor Bathrooms",
        },
        {
            title: "Wi-Fi is extremely slow",
            description: "Cannot connect to the internet from my room. It drops every 5 minutes.",
            status: "IN_PROGRESS",
            priority: "MEDIUM",
            category: "WIFI",
            location: "Building C, Room 304",
            assigneeId: committee.id,
        },
        {
            title: "Broken AC unit",
            description: "The air conditioner is making a loud buzzing noise and not cooling.",
            status: "ESCALATED",
            priority: "HIGH",
            category: "HVAC",
            location: "Library, North Wing",
            assigneeId: committee.id,
        },
        {
            title: "Leaky faucet in kitchen",
            description: "The kitchen sink faucet is dripping continuously. Wasting a lot of water.",
            status: "OPEN",
            priority: "LOW",
            category: "PLUMBING",
            location: "Dorm B, Ground Floor Kitchen",
        },
        {
            title: "Power outlet short circuit",
            description: "Sparks flew from the wall outlet near my desk when I plugged in my laptop.",
            status: "OPEN",
            priority: "HIGH",
            category: "ELECTRICAL",
            location: "Building E, Room 512",
        },
        {
            title: "Resolved issues with washing machines",
            description: "Machines 3 and 4 were broken. They are now working properly.",
            status: "RESOLVED",
            priority: "MEDIUM",
            category: "OTHER",
            location: "Laundry Room P1",
            assigneeId: committee.id,
            resolvedAt: new Date(),
        }
    ];

    let createdCount = 0;

    for (const ticket of sampleTickets) {
        const count = await prisma.ticket.count();
        const ticketNumber = `INF-${new Date().getFullYear()}-${(count + 1)
            .toString()
            .padStart(3, "0")}`;

        await prisma.ticket.create({
            data: {
                ...ticket,
                ticketNumber,
                authorId: student.id,
            } as any
        });
        createdCount++;
    }

    console.log(`Successfully created ${createdCount} test tickets.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
