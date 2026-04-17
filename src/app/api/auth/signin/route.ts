import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // validate data
        if (!email || !password) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        // check if user exists
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Invalid password" },
                { status: 401 }
            );
        }

        // create jwt token
        const jwttoken = jwt.sign(
            {
                id: user.id,
                email: user.email,
            },
            process.env.JWT_SECRET!,
            {
                expiresIn: "24h",
            }
        );

        // set cookie
        const response = NextResponse.json({
            message: "User logged in successfully",
        });

        response.cookies.set("token", jwttoken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Error logging in user:", error);
        return NextResponse.json(
            { error: "Failed to log in user" },
            { status: 500 }
        );
    }
}