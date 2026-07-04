import { Database } from "@/types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";



export async function fetchCategories(
     client: SupabaseClient<Database>
) {
     let query = client.from("categories").select("*", { count: "exact" });

     query = query.order("created_at", { ascending: false });

     return query;
}