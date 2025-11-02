// middleware.js
import { NextResponse } from "next/server";
// import { jwtDecode } from "jwt-decode";
import { decodeToken } from "@/libs/auth";

// กำหนดหน้า/route ที่ต้องล็อกอินก่อนเข้าได้
const protectedRoutes = ["/dashboard", "/profile", "/settings"];

export function middleware(req) {
  const token = req.cookies.get("token")?.value; // อ่าน cookie โดยตรง
  const { pathname } = req.nextUrl;

  // ดักเฉพาะหน้า protected
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected) {
    if (!token) {
      // ❌ ไม่มี token → redirect ไปหน้า login
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname); // เผื่อส่ง path เดิมกลับ
      return NextResponse.redirect(loginUrl);
    }

    try {
      // ✅ ตรวจสอบ token ว่าถอดรหัสได้ไหม
    //   const decoded = jwtDecode(token);
      const decoded = decodeToken(token);
      // optional: ตรวจวันหมดอายุ
      if (decoded.exp * 1000 < Date.now()) {
        console.warn("Token expired");
        const loginUrl = new URL("/login", req.url);
        return NextResponse.redirect(loginUrl);
      }
    } catch (err) {
      console.error("Invalid token:", err);
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 🔄 ถ้ามี token แล้วพยายามเข้า /login → ส่งกลับหน้าแรก
  if (pathname === "/login" && token) {
    const homeUrl = new URL("/", req.url);
    return NextResponse.redirect(homeUrl);
  }

  // ✅ ปล่อยให้เข้าได้ปกติ
  return NextResponse.next();
}

// ตั้งค่า matcher ให้ middleware ทำงานเฉพาะ path ที่เรากำหนด
export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/settings/:path*", "/login"],
};
