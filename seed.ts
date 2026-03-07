import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const hash = await bcrypt.hash('password123', 10);

    await prisma.user.upsert({
        where: { email: 'admin@institute.edu' },
        update: { password: hash, role: 'ADMIN' },
        create: {
            email: 'admin@institute.edu',
            name: 'Admin User',
            password: hash,
            role: 'ADMIN',
            hostel: 'Admin Block',
            phone: '1234567890'
        }
    });

    await prisma.user.upsert({
        where: { email: 'student@institute.edu' },
        update: { password: hash, role: 'STUDENT' },
        create: {
            email: 'student@institute.edu',
            name: 'Student User',
            password: hash,
            role: 'STUDENT',
            hostel: 'Dorm A',
            phone: '0987654321'
        }
    });

    console.log('Test users created successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
