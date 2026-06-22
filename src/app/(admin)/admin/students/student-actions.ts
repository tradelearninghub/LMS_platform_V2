"use server";

import { execute } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function toggleStudentStatusAction(userId: string, currentStatus: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
  await execute("UPDATE users SET status = ? WHERE id = ?", [newStatus, userId]);
  
  revalidatePath("/admin/students");
}
