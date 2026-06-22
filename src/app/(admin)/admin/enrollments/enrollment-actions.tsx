"use client";

import { useActionState, useTransition } from "react";
import { manualEnrollAction, revokeEnrollmentAction } from "../../actions";

type User = { id: string; name: string | null; email: string };
type Course = { id: string; title: string };

export function EnrollmentActions({
  users,
  courses,
}: {
  users: User[];
  courses: Course[];
}) {
  const [state, formAction, isPending] = useActionState(manualEnrollAction, {} as any);

  return (
    <details className="rounded-xl border bg-card">
      <summary className="px-5 py-4 font-medium cursor-pointer hover:bg-accent/50 rounded-xl transition-colors">
        + Manual Enrollment
      </summary>
      <form action={formAction} className="p-5 border-t flex flex-wrap gap-3 items-end">
        {state?.error && (
          <p className="w-full text-sm text-destructive">{state.error}</p>
        )}
        {state?.success && (
          <p className="w-full text-sm text-green-800">Enrolled successfully!</p>
        )}
        <label className="flex-1 min-w-[200px]">
          <span className="text-sm font-medium">Student</span>
          <select name="userId" required className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Select…</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name || u.email} ({u.email})
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1 min-w-[200px]">
          <span className="text-sm font-medium">Course</span>
          <select name="courseId" required className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Select…</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={isPending} className="rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
          {isPending ? "Enrolling…" : "Enroll"}
        </button>
      </form>
    </details>
  );
}

export function RevokeButton({ enrollmentId }: { enrollmentId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      disabled={isPending}
      onClick={() => {
        if (confirm("Revoke this enrollment?")) {
          startTransition(() => { revokeEnrollmentAction(enrollmentId); });
        }
      }}
      className="text-xs text-destructive hover:underline disabled:opacity-50"
    >
      Revoke
    </button>
  );
}
