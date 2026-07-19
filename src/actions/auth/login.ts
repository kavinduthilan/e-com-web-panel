"use server"

import { z } from "zod";
import { deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { LoginState } from "@/lib/definitions";
import { createServerActionClient } from "@/lib/supabase/server-action";



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

  const supabase = await createServerActionClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      message: "Login failed. Please check your email and password and try again.",
    }
  }
  console.log('data', data);
  
  redirect("/profile");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}