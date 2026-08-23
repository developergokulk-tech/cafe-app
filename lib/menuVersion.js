import { prisma } from "@/lib/prisma";

export async function bumpMenuVersion() {
  try {
    const newVersion = Date.now().toString();
    await prisma.appConfig.upsert({
      where: { key: "menu_version" },
      update: { value: newVersion },
      create: { key: "menu_version", value: newVersion },
    });
    return newVersion;
  } catch (e) {
    console.error("Failed to bump menu version:", e);
    return Date.now().toString();
  }
}
