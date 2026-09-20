"use server";

import { Status } from "@/generated/prisma/enums";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCategories(){
     return prisma.category.findMany({
          orderBy: { createdAt: "desc" },
          select: {
               id: true,
               name: true,
               status: true,
               createdAt: true,
               createdBy: { select: { name: true } },
          },
  });
}

export async function createCategory(name: string, status: Status) {

     const data = { name, status };

     const user =  await getCurrentUser();

     if (!user) throw new Error("Unauthorized");

     const created = await prisma.category.create({
          data: {
               ...data,
               createdById: user.id
          }
     }) 

     

     return created;
}


export async function updateCategory(id:number, name: string, status: Status) {
     
     const data = { name, status };

     const updated = await prisma.category.update({
          where: { id },
          data,                    
     });

     

     revalidatePath("/categories");

     return updated;
}