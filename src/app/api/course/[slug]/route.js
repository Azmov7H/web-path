import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Get Single Course by Slug
export async function GET(req, { params }) {
    try {
        const { slug } = await params;

        if (!slug) {
            return NextResponse.json(
                { message: "Slug is required" },
                { status: 400 }
            );
        }

        const course = await prisma.course.findUnique({
            where: { slug },
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
                        lessons: {
                            select: {
                                id: true,
                                title: true,
                                type: true,
                                order: true,
                                content: true,
                                videoUrl: true,
                            },
                        },
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
                reviews: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                subscriptions: {
                    select: {
                        id: true,
                        status: true,
                        userId: true,
                    },
                },
            },
        });

        if (!course) {
            return NextResponse.json(
                { message: "Course not found" },
                { status: 404 }
            );
        }

        // Calculate average rating
        const averageRating = course.reviews.length > 0
            ? course.reviews.reduce((acc, review) => acc + review.rating, 0) / course.reviews.length
            : 0;

        // Return course with additional computed fields
        return NextResponse.json({
            course: {
                ...course,
                averageRating: averageRating.toFixed(1),
                totalReviews: course.reviews.length,
                totalSubscriptions: course.subscriptions.length,
            },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Failed to fetch course" },
            { status: 500 }
        );
    }
}
