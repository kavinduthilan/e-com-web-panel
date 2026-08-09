"use server";

import { createClient } from "@/lib/supabase/client";
import { revalidatePath } from "next/cache";



export async function getSizes(){
     const supabase = await createClient();

     const { data , error } = await supabase.from("sizes").select("*").order("created_at",  { ascending: false });

     if (error) {
          throw new Error(error.message);
     }


     return data;
}



export async function createSize(size: string, status: boolean) {
     const supabase = await createClient();

     const { data , error } = await supabase.from("sizes").insert({size, status}).select().single();

     if (error) {
          throw new Error(error.message);
     }

     revalidatePath("/sizes");

     return data;
}


export async function updateSize(id:number,size: string, status: boolean) {
     const supabase = await createClient();

     const { data , error } = await supabase.from("sizes").update({size, status}).eq("id", id).select().single();

     if (error) {
          throw new Error(error.message);
     }

     revalidatePath("/sizes");

     return data;
}