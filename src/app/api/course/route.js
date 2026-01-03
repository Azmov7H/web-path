//import 

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifytoken } from "@/lib/auth";

///Get All Courses
export async function GET(req) {
    try {
        const courses = await prisma.course.findMany({
            include: {
                instructor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
                sections: {
                    include: {
                        lessons: true,
                    },
                },
                reviews: {
                    select: {
                        id: true,
                        rating: true,
                        comment: true,
                        createdAt: true,
                        user: {
                            select: {
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });
        return NextResponse.json({ courses }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Cannot get courses" }, { status: 500 });
    }
}

//Create New Course (Instructor/Admin Only)
export async function POST(req) {
    try {
        const decoded = verifytoken(req);
        if (!decoded) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is instructor or admin
        if (decoded.role !== "INSTRUCTOR" && decoded.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Forbidden: Only instructors and admins can create courses" },
                { status: 403 }
            );
        }

        const { title, slug, description, thumbnail, price, published } = await req.json();

        // Validate required fields
        if (!title || !description) {
            return NextResponse.json(
                { message: "Missing required fields: title, description" },
                { status: 400 }
            );
        }

        // Generate slug from title if not provided
        const courseSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

        // Check if slug already exists
        const existingCourse = await prisma.course.findUnique({
            where: { slug: courseSlug },
        });

        if (existingCourse) {
            return NextResponse.json(
                { message: "Course with this slug already exists" },
                { status: 400 }
            );
        }

        // Create course
        const newCourse = await prisma.course.create({
            data: {
                title,
                slug: courseSlug,
                description,
                thumbnail: thumbnail || null,
                price: price || 0,
                published: published || false,
                instructorId: decoded.userId,
            },
            include: {
                instructor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });

        return NextResponse.json(
            { message: "Course created successfully", course: newCourse },
            { status: 201 }
        );
    } catch (error) {
        console.error(error);
        if (error.message === "No token provided") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json(
            { message: "Failed to create course" },
            { status: 500 }
        );
    }
}

//Update Course (Instructor/Admin Only)
export async function PUT(req) {
    try {
        const decoded = verifytoken(req);
        if (!decoded) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, ...updateData } = await req.json();

        if (!id) {
            return NextResponse.json(
                { message: "Course ID is required" },
                { status: 400 }
            );
        }

        // Get the course to check ownership
        const course = await prisma.course.findUnique({
            where: { id: parseInt(id) },
        });

        if (!course) {
            return NextResponse.json({ message: "Course not found" }, { status: 404 });
        }

        // Check if user is the course owner or admin
        if (course.instructorId !== decoded.userId && decoded.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Forbidden: You can only update your own courses" },
                { status: 403 }
            );
        }

        // Remove fields that shouldn't be updated
        delete updateData.instructorId; // Cannot change course instructor

        // If slug is being updated, check for uniqueness
        if (updateData.slug && updateData.slug !== course.slug) {
            const existingSlug = await prisma.course.findUnique({
                where: { slug: updateData.slug },
            });
            if (existingSlug) {
                return NextResponse.json(
                    { message: "Course with this slug already exists" },
                    { status: 400 }
                );
            }
        }

        const updatedCourse = await prisma.course.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                instructor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });

        return NextResponse.json(
            { message: "Course updated successfully", course: updatedCourse },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        if (error.message === "No token provided") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json(
            { message: "Failed to update course" },
            { status: 500 }
        );
    }
}

//Delete Course (Instructor/Admin Only)
export async function DELETE(req) {
    try {
        const decoded = verifytoken(req);
        if (!decoded) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { message: "Course ID is required" },
                { status: 400 }
            );
        }

        // Get the course to check ownership
        const course = await prisma.course.findUnique({
            where: { id: parseInt(id) },
        });

        if (!course) {
            return NextResponse.json({ message: "Course not found" }, { status: 404 });
        }

        // Check if user is the course owner or admin
        if (course.instructorId !== decoded.userId && decoded.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Forbidden: You can only delete your own courses" },
                { status: 403 }
            );
        }

        // Delete the course (cascade delete will handle related records)
        await prisma.course.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json(
            { message: "Course deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        if (error.message === "No token provided") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json(
            { message: "Failed to delete course" },
            { status: 500 }
        );
    }
}