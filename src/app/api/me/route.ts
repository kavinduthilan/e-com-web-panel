import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@lib/prisma";

export async function GET(request: NextRequest) {
     const token = request.cookies.get("token")?.value;

     if (!token) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
     }

     try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

          const user = await prisma.user.findUnique({
               where: { id: decoded.id },
          });

          return NextResponse.json({
               id: user?.id,
               email: user?.email,
               firstName: user?.firstName,
               lastName: user?.lastName,
          });
     } catch (err) {
          return NextResponse.json({ error: "Invalid token" }, { status: 401 });
     }
}