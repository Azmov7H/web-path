import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

export async function POST(req) {
    const JWT_SECRET = process.env.JWT_SECRET 
    try {
        const { email, password } = await req.json();
        const checkuser = await prisma.user.findUnique({
            where: { email: email }
        });
        if (!checkuser) {
            return NextResponse.json({ message: "Email or Password is wrong" }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, checkuser.password);
        if (!isPasswordValid) {
            return NextResponse.json({ message: "Email or Password is wrong" }, { status: 401 });
        }

        const token = jwt.sign({ id: checkuser.id, email: checkuser.email }, JWT_SECRET, { expiresIn: "7d" });
        return NextResponse.json({ message: "Login successful", token }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Failed to create user" }, { status: 500 });
    }
}
