import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import { getLoggedInUser } from "@lib/auth";

// GET all sizes with user information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // pagination
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "5");

    const skip = (page - 1) * pageSize;

    // filters
    const size = searchParams.get("size") || "";
    const status = searchParams.get("status") || "";
    const createdBy = searchParams.get("createdBy") || "";

    const where: any = {
      AND: [
        size
          ? {
            size: {
              contains: size,
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

    const [sizes, total] = await Promise.all([
      prisma.size.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.size.count({ where }),
    ]);

    const formatted = sizes.map((s) => ({
      id: s.id,
      size: s.size,
      status: s.status,
      createdAt: s.createdAt.toLocaleDateString("en-US"),
      createdBy: `${s.createdBy.firstName} ${s.createdBy.lastName}`,
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

// POST create new size
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { size, status } = body;

    const user = await getLoggedInUser(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

      const userId = user.id;

    // Validate input
    if (!size) {
      return NextResponse.json(
        { error: "Size and userId are required" },
        { status: 400 }
      );
    }

    const newSize = await prisma.size.create({
      data: {
        size,
        status: status || "Active",
        createdById: Number(userId),
      },
    });

    return NextResponse.json(
      {
        id: newSize.id,
        size: newSize.size,
        status: newSize.status,
        createdAt: newSize.createdAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        }),
        createdBy: newSize.createdById,
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

// PUT update size
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, size, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Size ID is required" },
        { status: 400 }
      );
    }

    const updatedSize = await prisma.size.update({
      where: { id },
      data: {
        ...(size && { size }),
        ...(status && { status }),
      },
    });

    return NextResponse.json({
      id: updatedSize.id,
      name: updatedSize.size,
      category: "Clothing",
      code: updatedSize.size.charAt(0).toUpperCase(),
      status: updatedSize.status,
      createdAt: updatedSize.createdAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
      createdBy: updatedSize.createdBy,
    });
  } catch (error) {
    console.error("Error updating size:", error);
    return NextResponse.json(
      { error: "Failed to update size" },
      { status: 500 }
    );
  }
}

// DELETE size
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Size ID is required" },
        { status: 400 }
      );
    }

    await prisma.size.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting size:", error);
    return NextResponse.json(
      { error: "Failed to delete size" },
      { status: 500 }
    );
  }
}