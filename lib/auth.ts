import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function getLoggedInUser(request: NextRequest) {
     const user =  request.cookies.get("token")?.value;

     if (!user) {
          return null;
     }

     try {
          const decoded = jwt.verify(user, process.env.JWT_SECRET!) as {
               id: string;
               email: string;
          };
          return decoded;
     }
     catch (error) {
          console.error("Error decoding token:", error);
          return null;
     }

}