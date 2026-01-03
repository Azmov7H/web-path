import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req) {
    const JWT_SECRET = process.env.JWT_SECRET;
    try {
        const {name, email, password } = await req.json();

        if (!name || !email || !password)
            return NextResponse.json({ message: "Missing fields" }, { status: 400 });

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing)
            return NextResponse.json({ message: "Email already exists" }, { status: 400 });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: { name, email, password: hashedPassword },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });

        // Mk JWT
        const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: "7d" });

        return NextResponse.json({ message: "User created", user: newUser, token }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Failed to create user" }, { status: 500 });
    }
}
