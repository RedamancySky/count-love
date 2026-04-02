import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/dashboard/:path*", "/album/:path*", "/diary/:path*", "/chat/:path*", "/calendar/:path*", "/games/:path*", "/settings/:path*"],
};
