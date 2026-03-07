"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerUser(data: FormData) {
    const name = data.get("name") as string;
    const email = data.get("email") as string;
    const password = data.get("password") as string;
    const role = data.get("role") as string; // STUDENT or COMMITTEE

    if (!email || !password || !name || !role) {
        return { error: "Missing required fields" };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        return { error: "User with this email already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
            },
        });

        return { success: true, user: { id: user.id, email: user.email } };
    } catch (error) {
        console.error("Failed to register user:", error);
        return { error: "Failed to create user account" };
    }
}
