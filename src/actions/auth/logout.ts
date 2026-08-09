"use server"

import { createServerActionClient } from "@/lib/supabase/server-action";
import { redirect } from "next/navigation";


export async function logout(){
     try {
          const supabase = await createServerActionClient();

          const {error} = await supabase.auth.signOut();

          if (error) {
               return {
                    success: false,
                    message: error.message,
               };
          }

          
     } catch (error) {
          console.error(error);

          return {
               success: false,
               message: "Something went wrong.",
          };
     }

     // login 
     redirect("/signin");
}