"use server"

import { redirect } from "next/navigation";
import { deleteSession } from "@/lib/session";


export async function logout(){
     try {

          await deleteSession();

          
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