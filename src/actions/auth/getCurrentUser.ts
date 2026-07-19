import { createServerClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  console.log("getCurrentUser called");

  const supabase = await createServerClient();

  const response = await supabase.auth.getUser();

  console.log("SUPABASE RESPONSE:", response);

  const { data, error } = response;

  if (error) {
    console.log("AUTH ERROR:", error);
    return null;
  }

  console.log("RETURN USER:", data.user);

  return data.user;
}