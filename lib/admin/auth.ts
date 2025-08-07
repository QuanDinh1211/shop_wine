// lib/auth.ts
import jwt from "jsonwebtoken";

export interface DecodedToken {
  id: string;
  email: string;
  isAdmin: boolean;
}

export function getTokenFromRequest(request: Request | { headers: Headers }) {
  const cookieHeader = request.headers.get("cookie");
  const match = cookieHeader?.match(/admin-token=([^;]+)/);
  return match?.[1] || null;
}

export function verifyAdminToken(token: string): DecodedToken | null {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_ADMIN || "your_jwt_secret_key_12345"
    ) as DecodedToken;

    if (!decoded.isAdmin) return null;
    return decoded;
  } catch (err) {
    console.error("Token verification failed:", err);
    return null;
  }
}
