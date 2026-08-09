"use server";

import { createServerClient } from "@/lib/supabase/server";

export async function getCurrentUser() {

  const supabase = await createServerClient();

  const response = await supabase.auth.getUser();

  const { data, error } = response;

  if (error) {
    console.log("AUTH ERROR:", error);
    return null;
  }

  return data.user;
}