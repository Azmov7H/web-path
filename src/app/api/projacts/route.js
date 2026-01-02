

import { prisma } from "@/lib/prisma";


export async function GET (){
    const projacts = await prisma.projacts.findMany();
    return Response.json({Porjacts : projacts} , {status:201})

}



//POST METHOD
export async function POST(req){
    const body = await req.json();

   const pro = await  prisma.projacts.create({
        data:{
            name : body.name,
            description : body.description,
            demoLink : body.demoLink,
            repoLink : body.repoLink


        }
    })
    return Response.json({message : "Project created successfully" , pro} , {status:201})
}


