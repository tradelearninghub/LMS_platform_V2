"use server";

import { auth } from "@/auth";
import { execute } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

// ── Profile update ──────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(2),
  mobile: z.string().optional(),
  bio: z.string().optional(),
});

export type ProfileState = { error?: string; success?: boolean };

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    mobile: formData.get("mobile") || undefined,
    bio: formData.get("bio") || undefined,
  });
  if (!parsed.success) return { error: "Invalid input" };

  await execute(
    "UPDATE users SET name = ?, mobile = ?, bio = ? WHERE id = ?",
    [parsed.data.name, parsed.data.mobile || null, parsed.data.bio || null, session.user.id]
  );

  revalidatePath("/dashboard/profile");
  return { success: true };
}

// ── Lesson progress ─────────────────────────────────────────────────────────

export async function markLessonCompleteAction(lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const id = crypto.randomUUID();
  const now = new Date();

  await execute(
    `INSERT INTO lesson_progress (id, user_id, lesson_id, is_completed, completed_at) 
     VALUES (?, ?, ?, true, ?) 
     ON DUPLICATE KEY UPDATE is_completed = true, completed_at = ?`,
    [id, session.user.id, lessonId, now, now]
  );

  revalidatePath("/learn");
  return { success: true };
}

export async function markLessonIncompleteAction(lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const id = crypto.randomUUID();

  await execute(
    `INSERT INTO lesson_progress (id, user_id, lesson_id, is_completed, completed_at) 
     VALUES (?, ?, ?, false, NULL) 
     ON DUPLICATE KEY UPDATE is_completed = false, completed_at = NULL`,
    [id, session.user.id, lessonId]
  );

  revalidatePath("/learn");
  return { success: true };
}
