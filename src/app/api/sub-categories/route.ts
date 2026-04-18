import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@lib/prisma";
import { getLoggedInUser } from "@lib/auth";

// POST create new sub-category
export async function POST(request: NextRequest) {
     const user = getLoggedInUser(request);

     if (!user) {
          return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
     }

     const createdById = user.id;

     try {
          const body = await request.json();
          const { name, categoryId, status } = body;

          if (!name || !categoryId || !status) {
               return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
          }

          const newSubCategory = await prisma.subcategory.create({
               data: {
                    name,
                    categoryId,
                    status: status || "Active",
                    createdById: Number(createdById),
               }
          });

          return NextResponse.json(newSubCategory, { status: 201 });
     }catch (error) {
          console.error("Error creating sub-category:", error);
          return NextResponse.json({
               error: error instanceof Error ? error.message : "Unknown error",
               message: "Failed to create sub-category"
          }, { status: 500 });
     }
}