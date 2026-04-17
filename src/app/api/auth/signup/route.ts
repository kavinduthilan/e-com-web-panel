import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//  post
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { firstName, lastName, email, password } = body;

        // validate data
        if (!firstName || !lastName || !email || !password) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        // check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            );
        }

        // hashed password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
            },
        });

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
        )

        // set cookie
        const response = NextResponse.json({
            message: "User created and logged in successfully",
        });

        response.cookies.set("token", jwttoken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        );
    }
}