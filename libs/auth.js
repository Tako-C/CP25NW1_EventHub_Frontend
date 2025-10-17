// import Cookies from "js-cookie";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

const token = () => {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    console.warn("No token found");
    return null;
  }

  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

export { token };
