import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifytoken } from "@/lib/auth";
import bcrypt from "bcrypt";

// -------------------- POST (Create User - Admin Only) --------------------
export async function POST(req) {
  try {
    const decoded = verifytoken(req); // { userId, email, role }

    // Only admins can create users
    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { name, email, password, role, avatar } = await req.json();

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields: name, email, password" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "STUDENT", // Default to STUDENT if not provided
        avatar: avatar || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "User created successfully", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    if (error.message === "No token provided") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Failed to create user" },
      { status: 500 }
    );
  }
}

// -------------------- GET --------------------
export async function GET(req) {
  try {
    // Get All Users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true
      },
    });
    return NextResponse.json({ users });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 });
  }
}


