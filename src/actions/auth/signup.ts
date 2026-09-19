"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import {prisma} from "@lib/prisma";
import { createSession } from "@/lib/session";

type SignupData = {
  name: string;
  email: string;
  password: string;
};

export async function signup(data: SignupData) {
  const { name, email, password } = data;

  // Validation
  if (!name || !email || !password) {
    return {
      success: false,
      message: "All fields are required.",
    };
  }

  if (password.length < 8) {
    return {
      success: false,
      message: "Password must be at least 8 characters.",
    };
  }

  try {
    // check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: {email},
      select: {id: true}
    });

    if (existingUser) {
      return { success: false, message: "An account with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    await createSession(user.id);
    
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Something went wrong.",
    };
  }
  redirect("/");
}