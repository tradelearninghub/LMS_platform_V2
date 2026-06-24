"use client";

import { useTransition } from "react";
import { toggleCourseStatusAction } from "../../actions";

export function CourseStatusToggle({ courseId, status }: { courseId: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const targetStatus = status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    if (confirm(`Are you sure you want to change this course status to ${targetStatus}?`)) {
      startTransition(() => {
        toggleCourseStatusAction(courseId, status);
      });
    }
  };

  const isPublished = status === "PUBLISHED";

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-50 ${
        isPublished ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
      }`}
      title={`Click to make ${isPublished ? "draft" : "published"}`}
    >
      {isPending ? "Updating..." : status}
    </button>
  );
}
