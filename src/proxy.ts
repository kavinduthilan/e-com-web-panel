import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // console.log('token', token);

  if (!token) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      console.log("Token expired");
    } else {
      console.log("Invalid token");
    }

    return NextResponse.redirect(new URL("/signin", request.url));
  }
}


export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|signin|signup).*)",
  ],
};
