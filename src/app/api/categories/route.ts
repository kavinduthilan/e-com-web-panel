import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/prisma";

// GET all sizes with user information
export async function GET(request: NextRequest) {
     try {
          const { searchParams } = new URL(request.url);

          // pagination
          const page = parseInt(searchParams.get("page") || "1");
          const pageSize = parseInt(searchParams.get("pageSize") || "5");

          const skip = (page - 1) * pageSize;

          // filters
          const name = searchParams.get("name") || "";
          const status = searchParams.get("status") || "";
          const createdBy = searchParams.get("createdBy") || "";

          const where: any = {
               AND: [
                    name
                         ? {
                              name: {
                                   contains: name,
                              },
                         }
                         : {},
                    status
                         ? {
                              status: status as any,
                         }
                         : {},
                    createdBy
                         ? {
                              createdById: {
                                   firstName: {
                                        contains: createdBy,
                                   },
                              },
                         }
                         : {},
               ],
          };

          const [categories, total] = await Promise.all([
               prisma.category.findMany({
                    where,
                    skip,
                    take: pageSize,
                    orderBy: { createdAt: "desc" },
                    include: {
                         createdById: {
                              select: {
                                   firstName: true,
                                   lastName: true,
                              },
                         },
                    },
               }),
               prisma.category.count({ where }),
          ]);

          const formatted = categories.map((s) => ({
               id: s.id,
               name: s.name,
               status: s.status,
               createdAt: s.createdAt.toLocaleDateString("en-US"),
               createdBy: `${s.createdById.firstName} ${s.createdById.lastName}`,
          }));

          return NextResponse.json({
               data: formatted,
               total,
               page,
               pageSize,
               totalPages: Math.ceil(total / pageSize),
          });
     } catch (error) {
          return NextResponse.json({ error: "Failed" }, { status: 500 });
     }
}

// POST create new category
export async function POST(request: NextRequest) {
     try {
          const body = await request.json();
          const { name, status, userId } = body;

          // Validate input
          if (!name || !userId) {
               return NextResponse.json(
                    { error: "Name and userId are required" },
                    { status: 400 }
               );
          }

          const newCategory = await prisma.category.create({
               data: {
                    name,
                    status: status || "Active",
                    createdBy: userId,
               },
          });

          return NextResponse.json(
               {
                    id: newCategory.id,
                    name: newCategory.name,
                    status: newCategory.status,
                    createdAt: newCategory.createdAt.toLocaleDateString("en-US", {
                         year: "numeric",
                         month: "short",
                         day: "2-digit",
                    }),
                    createdBy: newCategory.createdBy,
               },
               { status: 201 }
          );
     } catch (error) {
          console.error("🔥 FULL ERROR:", error);

          if (error instanceof Error) {
               console.error("Message:", error.message);
               console.error("Stack:", error.stack);
          }

          return NextResponse.json(
               {
                    error:
                         error instanceof Error
                              ? error.message
                              : JSON.stringify(error, null, 2),
               },
               { status: 500 }
          );
     }
}

// PUT update category
export async function PUT(request: NextRequest) {
     try {
          const body = await request.json();
          const { id, name, status } = body;

          if (!id) {
               return NextResponse.json(
                    { error: "Category ID is required" },
                    { status: 400 }
               );
          }

          const updatedCategory = await prisma.category.update({
               where: { id },
               data: {
                    ...(name && { name }),
                    ...(status && { status }),
               },
          });

          return NextResponse.json({
               id: updatedCategory.id,
               name: updatedCategory.name,
               status: updatedCategory.status,
               createdAt: updatedCategory.createdAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
               }),
               createdBy: updatedCategory.createdBy,
          });
     } catch (error) {
          console.error("Error updating category:", error);
          return NextResponse.json(
               { error: "Failed to update category" },
               { status: 500 }
          );
     }
}

