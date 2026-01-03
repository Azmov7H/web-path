
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifytoken } from "@/lib/auth";
import bcrypt from "bcrypt";

//----------------GET Profile----------------------
export async function GET(req, { params }) {

    const { id } = await params;

    try {
        //Get Single User
        if (id) {
            const user = await prisma.user.findUnique({
                where: { id: parseInt(id) },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    avatar: true,
                    createdAt: true
                },
            });
            if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
            return NextResponse.json({ user });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Failed to fetch user" }, { status: 500 });
    }
}

//----------------PUT (Admin Update)----------------------
export async function PUT(req, { params }) {
    try {
        const decoded = verifytoken(req); // { userId, email, role }
        const { id } = await params;

        // Only admins can update other users
        if (decoded.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Forbidden: Admin access required" },
                { status: 403 }
            );
        }

        const updateData = await req.json();

        // Remove id field to prevent modification
        delete updateData.id;

        // Hash password if provided
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

        const updated = await prisma.user.update({
            where: { id: parseInt(id) },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                createdAt: true
            },
        });

        return NextResponse.json({ message: "User updated successfully", user: updated });
    } catch (error) {
        console.error(error);
        if (error.message === "No token provided") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json({ message: "Failed to update user" }, { status: 500 });
    }
}

//----------------DELETE (Admin Delete)----------------------
export async function DELETE(req, { params }) {
    try {
        const decoded = verifytoken(req); // { userId, email, role }
        const { id } = await params;

        // Only admins can delete other users
        if (decoded.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Forbidden: Admin access required" },
                { status: 403 }
            );
        }

        const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

        await prisma.user.delete({ where: { id: parseInt(id) } });
        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        if (error.message === "No token provided") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json({ message: "Failed to delete user" }, { status: 500 });
    }
}

