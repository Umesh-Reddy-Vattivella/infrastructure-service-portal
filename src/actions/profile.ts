"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    const phone = formData.get("phone") as string;
    const hostel = formData.get("hostel") as string;
    const profileImage = formData.get("profileImage") as string;

    try {
        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                phone: phone || null,
                hostel: hostel || null,
                profileImage: profileImage || null,
            },
        });

        revalidatePath("/profile");
        return { success: true };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { success: false, error: "Failed to update profile" };
    }
}
