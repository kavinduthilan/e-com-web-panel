"use server";

import { Status } from "@/generated/prisma/enums";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@lib/prisma";
import { revalidatePath } from "next/cache";





export async function getBrands(){
     return prisma.brand.findMany({
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



export async function createBrand(name: string, status: Status) {

     const data = { name, status };

     const user =  await getCurrentUser();

     if (!user) throw new Error("Unauthorized");

     const created = await prisma.brand.create({
          data: {
               ...data,
               createdById: user.id
          }
     }) 

     

     return created;
}


export async function updateBrand(id:number, name: string, status: Status) {
     
     const data = { name, status };

     const updated = await prisma.brand.update({
          where: { id },
          data,                    
     });

     

     revalidatePath("/brands");

     return updated;
}