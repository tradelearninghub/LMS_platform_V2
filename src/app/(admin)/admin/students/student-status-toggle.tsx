"use client";

import { useTransition } from "react";
import { toggleStudentStatusAction } from "./student-actions";

export function StudentStatusToggle({ userId, status }: { userId: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    if (confirm(`Are you sure you want to change this student's status to ${status === "ACTIVE" ? "INACTIVE" : "ACTIVE"}?`)) {
      startTransition(() => {
        toggleStudentStatusAction(userId, status);
      });
    }
  };

  const isActive = status === "ACTIVE";

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-50 ${
        isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
      title={`Click to make ${isActive ? "inactive" : "active"}`}
    >
      {isPending ? "Updating..." : status}
    </button>
  );
}
