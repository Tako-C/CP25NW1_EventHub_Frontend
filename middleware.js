import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;
  // ใช้ req.nextUrl แทนการ clone แบบเดิมเพื่อให้รักษา context ของ basePath ไว้
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  try {
    const res = await fetch("http://eventhub_backend:8080/users/me/registered-events", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      // ✅ ใช้ .push แทนการแก้ pathname ตรงๆ ในบางกรณี 
      // หรือมั่นใจว่า Next.js จะจัดการ basePath ให้เมื่อใช้ nextUrl
      url.pathname = "/error";
      return NextResponse.redirect(url);
    }

    const data = await res.json();
    const events = data?.data || [];
    const rolePriority = { organizer: 3, staff: 2, user: 1, default: 0 };
    let highestRole = "default";
    
    if (Array.isArray(events)) {
      events.forEach((event) => {
        const eventRole = event.eventRole?.toLowerCase().trim() || "default";
        if ((rolePriority[eventRole] || 0) > (rolePriority[highestRole] || 0)) {
          highestRole = eventRole;
        }
      });
    }

    const currentRole = highestRole.toUpperCase(); 

    if (pathname.startsWith("/organizer")) {
      const allowedInOrganizer = ["ADMIN", "ORGANIZER"];
      if (!allowedInOrganizer.includes(currentRole)) {
        url.pathname = "/error"; 
        return NextResponse.redirect(url);
      }
    }
    else if (pathname.startsWith("/staff")) {
      const allowedInStaff = ["ADMIN", "ORGANIZER", "STAFF"];
      if (!allowedInStaff.includes(currentRole)) {
        url.pathname = "/error";
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();

  } catch (err) {
    console.error("Middleware Fetch Error:", err);
    url.pathname = "/home"; 
    return NextResponse.redirect(url);
  }
}

// ✅ Matcher ไม่ต้องเปลี่ยน เพราะ Next.js จะ match ต่อจาก basePath ให้อัตโนมัติ
export const config = {
  matcher: ["/staff/:path*", "/organizer/:path*"],
};