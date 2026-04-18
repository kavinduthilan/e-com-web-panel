import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";

export async function GET() {
     try {
          const activeCategories = await prisma.category.findMany({
               where: {
                    status: "Active",
               },
               orderBy: { createdAt: "desc" },
          });

          return NextResponse.json(activeCategories);
     } catch (error) {
          return NextResponse.json({
               error: error instanceof Error ? error.message : "Unknown error",
               message: "Failed to fetch active categories"
          }, { status: 500 });
     }

}