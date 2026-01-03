import { verifytoken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function GET(req) {
    const decoded = verifytoken(req);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  try {
    const lessons = await prisma.lesson.findMany();
    return NextResponse.json({ lessons }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Cannot get lessons" }, { status: 500 });
  }
}


// creat a new lesson
export async function POST(request) {
  try {
    const decoded = verifytoken(request);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { title, content, courseId } = await request.json();
    const lesson = await prisma.lesson.create({
      data: {
        title,
        content,
        courseId,
      },
    });
    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Cannot create lesson" }, { status: 500 });
  }
}

// update a lesson
export async function PUT(request) {
  try {
    const decoded = verifytoken(request);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id, title, content } = await request.json();
    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        title,
        content,
      },
    });
    return NextResponse.json({ lesson }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Cannot update lesson" }, { status: 500 });
  }
}

// delete a lesson
export async function DELETE(request) {
  try {
    const decoded = verifytoken(request);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await request.json();
    const lesson = await prisma.lesson.delete({
      where: { id },
    });
    return NextResponse.json({ lesson }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Cannot delete lesson" }, { status: 500 });
  }
}
