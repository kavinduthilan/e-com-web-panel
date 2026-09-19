"use server"

import { z } from "zod";
import { redirect } from "next/navigation";
import { LoginState } from "@/lib/definitions";
import { prisma } from "@lib/prisma";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/session";


const loginSchema = z.object({
  email: z.string(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .trim(),
});

export async function login(prevState: LoginState, formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password } = result.data;

  console.log(email, password)

  // find user 
  const user = await prisma.user.findUnique({
    where : {
      email
    }
  });

  if (!user){
    return {
      message : 
        "Login failed. Please check your password and try again.",
    };
  }

  // compare password with hashed password
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return {
      message: 
      "Login failed. Please check your email and password and try again.",
    }
  }

  await createSession(user.id);

  console.log("Logged in user:", user);
  
  redirect("/");
}

