import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifytoken } from "@/lib/auth";
import bcrypt from "bcrypt";

export async function GET(req) {
    try {
        const decoded = verifytoken(req); // { userId, email, role }

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.userId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                createdAt: true,
                courses: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }
}







//------------------ PUT (update user) ------------------
export async function PUT(req) {
    try {
        const decoded = verifytoken(req); // { userId, email, role }

        if (!decoded) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const userId = decoded.userId;
        const updateData = await req.json();

        // Remove sensitive fields that shouldn't be updated directly
        delete updateData.id;
        delete updateData.role; // Users can't change their own role

        // Hash password if provided
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

        const updated = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true },
        });

        return NextResponse.json({ message: "User updated", user: updated });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Failed to update user" }, { status: 500 });
    }
}


// -------------------- DELETE --------------------
export async function DELETE(req) {
    try {
        const decoded = verifytoken(req); // { userId, email, role }

        if (!decoded) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const userId = decoded.userId;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

        await prisma.user.delete({ where: { id: userId } });
        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Failed to delete user" }, { status: 500 });
    }
}