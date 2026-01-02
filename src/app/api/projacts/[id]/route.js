// PUT METHOD

import { prisma } from "@/lib/prisma";




export async function PUT(req, { params }) {
  const body = await req.json();
  const {id} = await params

  if (!id) {
    return Response.json(
      { message: "Invalid project id" },
      { status: 400 }
    );
  }

  const updatePro = await prisma.projacts.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name: body.name,
      description: body.description,
      demoLink: body.demoLink,
      repoLink: body.repoLink,
    },
  });

  return Response.json(
    {
      message: "Success update",
      project: updatePro,
    },
    { status: 200 }
  );
}
