import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const session = verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role || "ADMIN",
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}
