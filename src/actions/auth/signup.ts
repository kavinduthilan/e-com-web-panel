"use server";

import { createServerActionClient } from "@/lib/supabase/server-action";
import { redirect } from "next/navigation";

type SignupData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export async function signup(data: SignupData) {
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

  try {
    const supabase = await createServerActionClient();

    // Let Supabase Auth create the user (handles hashing, uniqueness, etc.)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (authError) {
      return {
        success: false,
        message: authError.message,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        message: "Something went wrong creating your account.",
      };
    }

    // Create the profile row
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      first_name: firstName,
      last_name: lastName,
    });

    if (profileError) {
      return {
        success: false,
        message: profileError.message,
      };
    }
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Something went wrong.",
    };
  }
  redirect("/profile");
}