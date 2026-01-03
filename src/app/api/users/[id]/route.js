
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";





//----------------GET Profiel----------------------
export async function GET(req, { params }) {
   
    const { id } = await params;
    //Get Singel User
    if (id) {

        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });
        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
        return NextResponse.json({ user });
    }
}



