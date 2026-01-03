import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifytoken } from "@/lib/auth";

export async function GET(req) {
    try {
        const decoded = verifytoken(req); // {id }

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
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
        const decoded = verifytoken(req); // {id }

        if (!decoded) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        const { id } = decoded;
        const updateData = await req.json();
        const user = await prisma.user.findUnique({ where: { id: id } });
        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

        const updated = await prisma.user.update({
            where: { id: id },
            data: updateData,
            select: { id: true, name: true, email: true, role: true, createdAt: true },
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
        const decode = verifytoken(req); // {id }

        if (!decode) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        const { id } = decode.id

        const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

        await prisma.user.delete({ where: { id: parseInt(id) } });
        return NextResponse.json({ message: "User deleted" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Failed to delete user" }, { status: 500 });
    }
}