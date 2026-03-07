import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash("password123", 10);

    // Default Committee Member
    const committee = await prisma.user.upsert({
        where: { email: "committee@institute.edu" },
        update: {},
        create: {
            email: "committee@institute.edu",
            name: "Committee Manager",
            password: passwordHash,
            role: "COMMITTEE"
        }
    });

    // Default Student
    const student = await prisma.user.upsert({
        where: { email: "student@institute.edu" },
        update: {},
        create: {
            email: "student@institute.edu",
            name: "Alex Student",
            password: passwordHash,
            role: "STUDENT"
        }
    });

    console.log("Database seeded successfully!");
    console.log({ committee, student });
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
