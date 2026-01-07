import { NextResponse } from 'next/server';

// 1. Token Parser Function
function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const paddedBase64 = pad ? base64 + '='.repeat(4 - pad) : base64;

    const jsonPayload = decodeURIComponent(
      atob(paddedBase64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('ParseJWT Error:', e);
    return null;
  }
}

export async function middleware(req) {
  const token = req.cookies.get('token')?.value;
  const url = req.nextUrl.clone();
  const pathname = req.nextUrl.pathname;

  // ถ้าไม่มี Token ให้เด้งไปหน้า Home
  if (!token) {
    url.pathname = '/home';
    return NextResponse.redirect(url);
  }

  // ตัวแปรสำหรับเก็บ Role ที่ได้จาก Event (API)
  let currentEventRole = 'DEFAULT';

  // --- ด่านที่ 1: ดึง Role จาก Event ผ่าน API ---
  try {
    const res = await fetch(
      'https://cp25nw1.sit.kmutt.ac.th/api/users/me/registered-events',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      const events = data?.data || [];

      const rolePriority = {
        admin: 4,
        organizer: 3,
        staff: 2,
        user: 1,
        default: 0,
      };

      let highestRole = 'default';

      if (Array.isArray(events)) {
        events.forEach((event) => {
          const eventRole = event.eventRole?.toLowerCase().trim() || 'default';
          if (
            (rolePriority[eventRole] || 0) > (rolePriority[highestRole] || 0)
          ) {
            highestRole = eventRole;
          }
        });
      }
      currentEventRole = highestRole.toUpperCase();
    } else {
      console.warn('Middleware Fetch API failed status:', res.status);
    }
  } catch (fetchError) {
    // console.warn('Middleware Fetch Exception (Skipped):', fetchError);
  }

  // -----------------------------------------------------------
  // ส่วนตรวจสอบสิทธิ์ (Permission Check)
  // -----------------------------------------------------------

  try {
    const allowedInOrganizer = ['ADMIN', 'ORGANIZER'];
    const allowedInStaff = ['ADMIN', 'ORGANIZER', 'STAFF'];

    // 1. กรณีเข้าหน้า Organizer
    if (pathname.startsWith('/organizer')) {
      // เช็คด่าน 1 (Event Role)
      if (!allowedInOrganizer.includes(currentEventRole)) {
        // --- เช็คด่าน 2 (Global Token) ---
        const payload = parseJwt(token);
        const globalRole = payload?.role ? payload.role.toUpperCase() : '';

        // console.log(
        //   `Checking Organizer Access: EventRole=${currentEventRole}, GlobalRole=${globalRole}`
        // );

        if (!allowedInOrganizer.includes(globalRole)) {
          url.pathname = '/home';
          return NextResponse.redirect(url);
        }
      }
      return NextResponse.next();
    }

    // 2. กรณีเข้าหน้า Staff
    else if (pathname.startsWith('/staff')) {
      if (!allowedInStaff.includes(currentEventRole)) {
        // --- เช็คด่าน 2 (Global Token) ---
        const payload = parseJwt(token);
        const globalRole = payload?.role ? payload.role.toUpperCase() : '';

        if (!allowedInStaff.includes(globalRole)) {
          url.pathname = '/home';
          return NextResponse.redirect(url);
        }
      }
      return NextResponse.next();
    }

    return NextResponse.next();
  } catch (err) {
    console.error('Middleware Critical Error:', err);
    url.pathname = '/home';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/staff/:path*', '/organizer/:path*'],
};
