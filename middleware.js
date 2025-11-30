import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const url = req.nextUrl.clone();
  
  // 1. เก็บ Path ปัจจุบันไว้เช็ค
  const pathname = req.nextUrl.pathname;


  try {
    const res = await fetch("https://cp25nw1.sit.kmutt.ac.th/api/users/me/registered-events", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      url.pathname = "/error";
      return NextResponse.redirect(url);
    }

    const data = await res.json();
    const events = data?.data || []; // รับ Array ของ Event ทั้งหมด

    // -----------------------------------------------------------
    // --- ส่วนที่เพิ่ม: Logic การคำนวณ Role ที่สูงที่สุด (Active Role) ---
    // -----------------------------------------------------------

    const rolePriority = {
      // admin: 4,
      organizer: 3,
      staff: 2,
      user: 1,
      default: 0,
    };

    let highestRole = "default";
    
    // วนลูปเช็คทุก Event เพื่อหา Role ที่ใหญ่ที่สุด
    if (Array.isArray(events)) {
      events.forEach((event) => {
        // แปลงเป็นตัวเล็กเพื่อเทียบกับ priority map
        const eventRole = event.eventRole?.toLowerCase().trim() || "default";

        // ถ้า Role ใน Event นี้ใหญ่กว่าที่เคยเจอ ให้บันทึกทับ
        if ((rolePriority[eventRole] || 0) > (rolePriority[highestRole] || 0)) {
          highestRole = eventRole;
        }
      });
    }

    // แปลงกลับเป็นตัวใหญ่เพื่อใช้เช็คสิทธิ์ด้านล่าง (เช่น "organizer" -> "ORGANIZER")
    const currentRole = highestRole.toUpperCase(); 

    // -----------------------------------------------------------
    // --- จบส่วนคำนวณ Role ---
    // -----------------------------------------------------------


    // --- ส่วนเช็ค Permission แยกตาม Path ---

    // กรณีเข้าหน้า Organizer (ต้องเป็น ADMIN หรือ ORGANIZER เท่านั้น)
    if (pathname.startsWith("/organizer")) {
      const allowedInOrganizer = ["ADMIN", "ORGANIZER"];
      
      if (!allowedInOrganizer.includes(currentRole)) {
        // ถ้า Role ไม่ถึง จะโดนดีดออก
        url.pathname = "/error"; 
        return NextResponse.redirect(url);
      }
    }

    // กรณีเข้าหน้า Staff (ADMIN, ORGANIZER, STAFF เข้าได้หมด)
    else if (pathname.startsWith("/staff")) {
      const allowedInStaff = ["ADMIN", "ORGANIZER", "STAFF"];

      if (!allowedInStaff.includes(currentRole)) {
        url.pathname = "/error";
        return NextResponse.redirect(url);
      }
    }

    // -------------------------------------

    return NextResponse.next();

  } catch (err) {
    console.log(err);
    url.pathname = "/home"; 
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/staff/:path*", "/organizer/:path*"],
};