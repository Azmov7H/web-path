import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



// -------------------- GET --------------------
export async function GET(req) {
  try {
    // Get All Users
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return NextResponse.json({ users });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 });
  }
}




