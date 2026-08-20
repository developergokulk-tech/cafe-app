import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword, createSessionToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const identifier = (body.username || body.email || "").trim();
    const { password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Check if any admin user exists. If none exist, auto-seed default admin user.
    const adminCount = await prisma.adminUser.count();
    if (adminCount === 0) {
      const defaultPasswordHash = hashPassword("admin123");
      await prisma.adminUser.create({
        data: {
          name: "admin",
          email: "admin@ripcafe.com",
          passwordHash: defaultPasswordHash,
          role: "MANAGER",
        },
      });
    }

    // Find admin user by username (name) OR email
    let user = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase() },
          { name: { equals: identifier, mode: "insensitive" } },
          { email: { startsWith: identifier.toLowerCase() } },
        ],
      },
    });

    // Fallback if single admin user exists in DB
    if (!user) {
      const count = await prisma.adminUser.count();
      if (count === 1) {
        user = await prisma.adminUser.findFirst();
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const sessionUser = { id: user.id, name: user.name, email: user.email, role: user.role || "CHEF" };
    const token = createSessionToken(sessionUser);

    const response = NextResponse.json({
      success: true,
      user: sessionUser,
    });

    response.cookies.set({
      name: "admin_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 86400, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Login failed. Internal server error." },
      { status: 500 }
    );
  }
}
