"use server";

import { createServerActionClient } from "@/lib/supabase/server-action";
import bcrypt from "bcryptjs";

type SignupData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export async function signup(data: SignupData) {
  try {
    const { firstName, lastName, email, password } = data;

    // Validation
    if (!firstName || !lastName || !email || !password) {
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

    const supabase = await createServerActionClient();

    // Check if email already exists
    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (findError) {
      return {
        success: false,
        message: findError.message,
      };
    }

    if (existingUser) {
      return {
        success: false,
        message: "Email already exists.",
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const { data: user, error: insertError } = await supabase
      .from("users")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        password: hashedPassword,
      })
      .select()
      .single();

    if (insertError) {
      return {
        success: false,
        message: insertError.message,
      };
    }

    return {
      success: true,
      message: "Account created successfully.",
      user,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Something went wrong.",
    };
  }
}