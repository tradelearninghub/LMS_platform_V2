"use client";

import { useTransition } from "react";
import { toggleCourseStatusAction } from "../../actions";

export function CourseStatusToggle({ courseId, status }: { courseId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const isPublished = status === "PUBLISHED";

  const handleToggle = () => {
    startTransition(() => {
      toggleCourseStatusAction(courseId, status);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      type="button"
      className="inline-flex items-center gap-2 group cursor-pointer disabled:opacity-50 select-none focus:outline-none"
      title={`Status: ${isPublished ? "Active (Published)" : "Inactive (Draft)"}. Click to toggle.`}
    >
      <div
        className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
          isPublished ? "bg-emerald-600" : "bg-slate-300"
        }`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
            isPublished ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </div>
      <span
        className={`text-xs font-semibold tracking-wide ${
          isPublished ? "text-emerald-700 font-bold" : "text-slate-500 font-medium"
        }`}
      >
        {isPending ? "Updating..." : isPublished ? "Active" : "Inactive"}
      </span>
    </button>
  );
}
