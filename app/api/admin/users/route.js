import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifySessionToken } from "@/lib/auth";

async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch (err) {
    return null;
  }
}

// GET /api/admin/users — list primary admin (Giri) and chefs
export async function GET() {
  try {
    const users = await prisma.adminUser.findMany({
      orderBy: {
        createdAt: "asc", // Primary admin (oldest user) first
      },
    });

    const formatted = users.map((u, index) => {
      // Ensure the first/primary user or explicit admin role is ADMIN, all added staff are CHEF
      const isPrimary = index === 0 || u.role === "ADMIN" || u.role === "MANAGER";
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: isPrimary ? "ADMIN" : "CHEF",
        createdAt: u.createdAt,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Failed to fetch staff users:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff users" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users — add a new Chef (always role CHEF) - Admin Only
export async function POST(request) {
  try {
    const authUser = await getAuthUser();
    if (authUser && authUser.role === "CHEF") {
      return NextResponse.json(
        { error: "Access Denied: Chefs are not permitted to manage user accounts." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Chef name, username/email, and password are required" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    const existing = await prisma.adminUser.findUnique({
      where: { email: trimmedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A chef or staff member with this username/email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);
    const newUser = await prisma.adminUser.create({
      data: {
        name: name.trim(),
        email: trimmedEmail,
        passwordHash,
        role: "CHEF",
      },
    });

    return NextResponse.json(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: "CHEF",
        createdAt: newUser.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create chef:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create chef account" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users — edit Chef or Admin details - Admin Only
export async function PATCH(request) {
  try {
    const authUser = await getAuthUser();
    if (authUser && authUser.role === "CHEF") {
      return NextResponse.json(
        { error: "Access Denied: Chefs cannot change admin credentials or staff accounts." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, name, email, password } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Staff ID is required" },
        { status: 400 }
      );
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.trim().toLowerCase();
    if (password && password.trim().length > 0) {
      updateData.passwordHash = hashPassword(password);
    }

    const updatedUser = await prisma.adminUser.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role || "CHEF",
      createdAt: updatedUser.createdAt,
    });
  } catch (error) {
    console.error("Failed to update staff user:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update staff user" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users?id=... — remove chef user - Admin Only
export async function DELETE(request) {
  try {
    const authUser = await getAuthUser();
    if (authUser && authUser.role === "CHEF") {
      return NextResponse.json(
        { error: "Access Denied: Chefs cannot delete user accounts." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Chef ID is required" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.adminUser.findUnique({
      where: { id: Number(id) },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Protect primary admin from deletion
    const allUsers = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });
    if (allUsers.length > 0 && allUsers[0].id === Number(id)) {
      return NextResponse.json(
        { error: "Primary Admin account cannot be deleted" },
        { status: 400 }
      );
    }

    await prisma.adminUser.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete chef user:", error);
    return NextResponse.json(
      { error: "Failed to delete chef user" },
      { status: 500 }
    );
  }
}
