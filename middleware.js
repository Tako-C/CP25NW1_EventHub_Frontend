import { NextResponse } from "next/server";

function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    const paddedBase64 = pad ? base64 + "=".repeat(4 - pad) : base64;

    const jsonPayload = decodeURIComponent(
      atob(paddedBase64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("ParseJWT Error:", e);
    return null;
  }
}

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const url = req.nextUrl.clone();
  const pathname = req.nextUrl.pathname;

  if (!token) {
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  let currentEventRole = "DEFAULT";

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${apiUrl}/users/me/registered-events`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      const events = data?.data || [];

      const rolePriority = {
        // admin: 3,
        organizer: 2,
        staff: 1,
        default: 0,
      };

      let highestRole = "default";

      if (Array.isArray(events)) {
        events.forEach((event) => {
          const eventRole = event.eventRole?.toLowerCase().trim() || "default";
          if (
            (rolePriority[eventRole] || 0) > (rolePriority[highestRole] || 0)
          ) {
            highestRole = eventRole;
          }
        });
      }
      currentEventRole = highestRole.toUpperCase();
    } else {
      console.warn("Middleware Fetch API failed status:", res.status);
    }
  } catch (fetchError) {
    console.warn("Middleware Fetch Exception (Skipped):", fetchError);
  }

  try {
    const allowedInOrganizer = ["ADMIN", "ORGANIZER"];
    const allowedInStaff = ["ADMIN", "ORGANIZER", "STAFF"];

    const payload = parseJwt(token);
    const globalRole = payload?.tokenRole
      ? payload.tokenRole.toUpperCase()
      : "";

    if (pathname.startsWith("/organizer")) {
      if (!allowedInOrganizer.includes(currentEventRole)) {
        const hasEventAccess = allowedInOrganizer.includes(currentEventRole);
        const hasGlobalAccess = allowedInOrganizer.includes(globalRole);

        // console.log(
        //   `Checking Organizer Access: EventRole=${currentEventRole}, GlobalRole=${globalRole}`
        // );

        if (!hasEventAccess && !hasGlobalAccess) {
          url.pathname = "/error";
          return NextResponse.redirect(url);
        }
        return NextResponse.next();
      }
      return NextResponse.next();
    } else if (pathname.startsWith("/staff")) {
      const hasEventAccess = allowedInStaff.includes(currentEventRole);
      const hasGlobalAccess = allowedInStaff.includes(globalRole);

      if (!hasEventAccess && !hasGlobalAccess) {
        url.pathname = "/error";
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Middleware Critical Error:", err);
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/staff/:path*", "/organizer/:path*"],
};
