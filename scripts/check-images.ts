import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const ticket = await prisma.ticket.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { images: true }
    });
    console.log(JSON.stringify(ticket?.images, null, 2));
}
main();
