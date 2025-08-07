import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Hàm lấy secret để verify token
function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const publicPaths = ["/admin/login", "/api/admin/login"];

  // Bỏ qua các route không cần bảo vệ
  if (publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin-token")?.value;

  if (!token) {
    console.log("🔒 Không tìm thấy token, chuyển hướng đến /admin/login");
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    // Xác minh token bằng jose
    const { payload } = await jwtVerify(token, getJwtSecretKey());

    if (!payload.isAdmin) {
      console.log("❌ Token hợp lệ nhưng không phải admin");
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    console.log("✅ Token hợp lệ, tiếp tục đến", request.nextUrl.pathname);
    return NextResponse.next();
  } catch (error) {
    console.error("⛔ Token verification failed:", error);
    const response = NextResponse.redirect(
      new URL("/admin/login", request.url)
    );
    response.cookies.set("admin-token", "", { maxAge: 0, path: "/" });
    return response;
  }
}

// Cấu hình các route được bảo vệ
export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
