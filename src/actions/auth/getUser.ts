"use server"

import { getCurrentUser } from "@/lib/auth";

export async function getUser() {
     return getCurrentUser();
}