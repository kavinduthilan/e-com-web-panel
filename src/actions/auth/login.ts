"use server"

import { createServerActionClient } from "@/lib/supabase/server-action";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function login(email: string,  password: string) {

     try {
          const supabase = await createServerActionClient();

          // validate input
          if (!email || !password) {
               return {
                    success: false,
                    error: "All fields are required",
               }
          }

          console.log('email', email);

          // find user
          const { data: user, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", email)
          .single();
          

          if (error || !user) {
               return {
               success: false,
               error: "User not found",
               };
          }

          // Compare password
          const isPasswordValid = await bcrypt.compare(
               password,
               user.password
          );

          if (!isPasswordValid) {
               return {
               success: false,
               error: "Invalid password",
               };
          }


          // Generate JWT
          const token = jwt.sign(
               {
                    id: user.id,
                    email: user.email,
               },
                    process.env.JWT_SECRET!,
               {
                    expiresIn: "24h",
               }
          );

          // Store token in cookie
          const cookieStore = await cookies();

          cookieStore.set("token", token, {
               httpOnly: true,
               secure: process.env.NODE_ENV === "production",
               sameSite: "lax",
               path: "/",
               maxAge: 60 * 60 * 24, // 24 hours
          });

          return {
               success: true,
               message: "User logged in successfully",
               user: {
               id: user.id,
               email: user.email,
               },
          };
          
          
     } catch (error) {
          console.error("Login error:", error);

          return {
               success: false,
               error: "Failed to log in user",
          };
     }

     


}