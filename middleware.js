import { NextResponse } from 'next/server';

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

  if (!token) {
    url.pathname = '/home';
    return NextResponse.redirect(url);
  }

  let currentEventRole = 'DEFAULT';

  // --- ด่านที่ 1: ดึง Role จาก Event ผ่าน API ---
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const res = await fetch(
      `${apiUrl}/users/me/registered-events`,
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
        admin: 3,
        organizer: 2,
        staff: 1,
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
    console.warn('Middleware Fetch Exception (Skipped):', fetchError);
  }

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
          url.pathname = '/error';
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
